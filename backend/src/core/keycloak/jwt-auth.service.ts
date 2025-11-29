import { Injectable, Logger } from '@nestjs/common';
import { jwtVerify, importJWK, JWTPayload } from 'jose';

@Injectable()
export class JwtAuthService {
  private readonly logger = new Logger(JwtAuthService.name);
  private readonly issuer: string;
  private jwksUrl: string;
  private jwksCache: Map<string, any> = new Map();

  constructor() {
    // Usar KEYCLOAK_ISSUER como única variable, igual que STOCK
    this.issuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/ds-2025-realm';
    this.jwksUrl = `${this.issuer}/protocol/openid-connect/certs`;
    
    this.logger.log(`JwtAuthService inicializado - Issuer: ${this.issuer}`);
    this.logger.log(`JWKS URL: ${this.jwksUrl}`);
    
    // Verificar que la URL de JWKS sea accesible al inicializar
    this.verifyJwksAccessibility();
  }

  /**
   * Obtiene las claves públicas de Keycloak para validar JWTs
   * Replica la lógica del backend de stock
   */
  private async getJWKS(): Promise<any> {
    if (this.jwksCache.has(this.jwksUrl)) {
      return this.jwksCache.get(this.jwksUrl);
    }

    try {
      const response = await fetch(this.jwksUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch JWKS: ${response.status} ${response.statusText}`);
      }
      const jwks = await response.json();
      this.jwksCache.set(this.jwksUrl, jwks);
      this.logger.debug(`JWKS obtenido - ${jwks.keys?.length || 0} claves disponibles`);
      return jwks;
    } catch (error: any) {
      this.logger.error('Error fetching JWKS:', error);
      throw new Error('Failed to fetch Keycloak public keys');
    }
  }

  private async verifyJwksAccessibility() {
    try {
      const response = await fetch(this.jwksUrl);
      if (response.ok) {
        const jwks = await response.json();
        this.logger.log(`JWKS accesible - ${jwks.keys?.length || 0} claves disponibles`);
      } else {
        this.logger.warn(`JWKS endpoint retornó status ${response.status}`);
      }
    } catch (error: any) {
      this.logger.error(`No se puede alcanzar JWKS URL: ${error.message}`);
    }
  }

  /**
   * Valida un token JWT usando JWKS de Keycloak
   * Replica la lógica del backend de stock
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: JWTPayload;
    error?: string;
  }> {
    try {
      // Obtener JWKS
      const jwks = await this.getJWKS();
      
      // Decodificar el header del JWT para obtener el kid
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return { valid: false, error: 'Token inválido: formato incorrecto' };
      }

      const [headerB64] = tokenParts;
      let header: any;
      try {
        header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
      } catch (e) {
        return { valid: false, error: 'Token inválido: header no válido' };
      }

      // Encontrar la clave correspondiente
      const key = jwks.keys.find((k: any) => k.kid === header.kid);
      if (!key) {
        this.logger.warn(`Key not found in JWKS for kid: ${header.kid}`);
        this.logger.debug(`Available kids: ${jwks.keys?.map((k: any) => k.kid).join(', ') || 'N/A'}`);
        return { valid: false, error: 'Key not found in JWKS' };
      }

      // Importar la clave JWK
      const publicKey = await importJWK(key);

      // Verificar el JWT - solo validamos el issuer (realm)
      // Replica exactamente la lógica del backend de stock: usa el issuer del config directamente
      // El backend de stock usa this.config.issuer directamente, pero como nuestro config
      // puede tener keycloak:8080 y el token tiene localhost:8080, normalizamos para validar
      const issuerToValidate = this.issuer.replace('keycloak:8080', 'localhost:8080');
      
      const { payload } = await jwtVerify(token, publicKey, {
        issuer: issuerToValidate,
      });

      this.logger.log(`Token validado exitosamente para usuario: ${payload.sub}`);
      return { valid: true, payload };
    } catch (error: any) {
      this.logger.error('Token validation error:', error);
      
      if (error.code === 'ERR_JWT_EXPIRED') {
        return { valid: false, error: 'Token expirado' };
      }
      
      if (error.message === 'Key not found in JWKS') {
        return { valid: false, error: 'Key not found in JWKS' };
      }
      
      if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
        return { valid: false, error: `Token no válido para este realm: ${error.message}` };
      }
      
      return { valid: false, error: error.message || 'Error validando token' };
    }
  }

  /**
   * Verifica que el token tenga los scopes requeridos
   */
  hasRequiredScopes(payload: JWTPayload, requiredScopes: string[]): boolean {
    if (!requiredScopes || requiredScopes.length === 0) {
      return true; // No se requieren scopes
    }

    const tokenScopes = (payload.scope as string)?.split(' ') || [];
    
    // Verifica que el token tenga TODOS los scopes requeridos
    const hasAllScopes = requiredScopes.every(scope => 
      tokenScopes.includes(scope)
    );

    return hasAllScopes;
  }

  /**
   * Obtiene el userId del token (sub claim)
   */
  getUserId(payload: JWTPayload): string | null {
    return (payload.sub as string) || null;
  }

  /**
   * Obtiene los scopes del token
   */
  getScopes(payload: JWTPayload): string[] {
    const scope = payload.scope as string;
    return scope ? scope.split(' ') : [];
  }

  /**
   * Obtiene el issuer configurado
   */
  getIssuer(): string {
    return this.issuer;
  }

  /**
   * Obtiene la URL del JWKS
   */
  getJwksUrl(): string {
    return this.jwksUrl;
  }
}

