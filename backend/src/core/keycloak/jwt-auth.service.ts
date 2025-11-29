import { Injectable, Logger } from '@nestjs/common';
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';
import axios from 'axios';

@Injectable()
export class JwtAuthService {
  private readonly logger = new Logger(JwtAuthService.name);
  private readonly issuer: string;
  private jwksUrl: string;
  private jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor() {
    // Usar KEYCLOAK_ISSUER como única variable, igual que STOCK
    this.issuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/ds-2025-realm';
    this.jwksUrl = `${this.issuer}/protocol/openid-connect/certs`;
    
    try {
      this.jwks = createRemoteJWKSet(new URL(this.jwksUrl));
      this.logger.log(`JwtAuthService inicializado - Issuer: ${this.issuer}`);
      this.logger.log(`JWKS URL: ${this.jwksUrl}`);
      
      // Verificar que la URL de JWKS sea accesible al inicializar
      this.verifyJwksAccessibility();
    } catch (error: any) {
      this.logger.error(`Error inicializando JWKS: ${error.message}`);
      throw error;
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
   * Compatible con el flujo de STOCK
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: JWTPayload;
    error?: string;
  }> {
    try {
      // Decodificar el header para obtener el kid (Key ID)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return { valid: false, error: 'Token inválido: formato incorrecto' };
      }

      // Decodificar el payload para obtener información de debug
      let payloadIss: string | undefined;
      try {
        const payloadB64 = tokenParts[1];
        const decodedPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
        payloadIss = decodedPayload.iss;
      } catch (e) {
        // Si no se puede decodificar el payload, continuar con la validación
      }

      // Verificar el token con JWKS
      this.logger.debug(`Intentando validar token con JWKS desde: ${this.jwksUrl}`);
      this.logger.debug(`Token kid del header: ${JSON.parse(Buffer.from(tokenParts[0], 'base64url').toString()).kid || 'N/A'}`);
      
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
      });

      this.logger.log(`Token validado exitosamente para usuario: ${payload.sub}`);
      return { valid: true, payload };
    } catch (error: any) {
      // Logs detallados para debug
      let payloadIss: string | undefined;
      let tokenParts: string[] = [];
      try {
        tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const decodedPayload = JSON.parse(
            Buffer.from(tokenParts[1], 'base64url').toString()
          );
          payloadIss = decodedPayload.iss;
        }
      } catch (e) {
        // Ignorar error de decodificación
      }

      if (error.code === 'ERR_JWT_EXPIRED') {
        this.logger.warn('Token expirado');
        return { valid: false, error: 'Token expirado' };
      }
      // Manejar errores de firma
      if (error.code === 'ERR_JWT_INVALID' || error.message?.includes('signature') || error.message?.includes('verification failed')) {
        this.logger.warn(`Token inválido - Signature verification failed`);
        this.logger.error(`Error completo: ${error.message}`);
        this.logger.error(`Error code: ${error.code || 'N/A'}`);
        this.logger.debug(`Issuer del token: ${payloadIss || 'N/A'}`);
        this.logger.debug(`Issuer esperado: ${this.issuer}`);
        this.logger.debug(`JWKS URL: ${this.jwksUrl}`);
        
        // Intentar verificar si podemos alcanzar la URL de JWKS
        try {
          this.logger.debug(`Verificando accesibilidad de JWKS URL...`);
          const testResponse = await fetch(this.jwksUrl);
          this.logger.debug(`JWKS endpoint accesible: ${testResponse.ok}, Status: ${testResponse.status}`);
          if (testResponse.ok) {
            const jwksData = await testResponse.json();
            this.logger.debug(`JWKS keys disponibles: ${jwksData.keys?.length || 0}`);
            if (tokenParts.length >= 1) {
              const tokenKid = JSON.parse(Buffer.from(tokenParts[0], 'base64url').toString()).kid;
              this.logger.debug(`Token KID: ${tokenKid}`);
              const matchingKey = jwksData.keys?.find((k: any) => k.kid === tokenKid);
              this.logger.debug(`Key con kid '${tokenKid}' encontrada en JWKS: ${!!matchingKey}`);
              if (!matchingKey) {
                this.logger.warn(`KIDs disponibles en JWKS: ${jwksData.keys?.map((k: any) => k.kid).join(', ') || 'N/A'}`);
              }
            }
          } else {
            this.logger.error(`JWKS endpoint retornó error: ${testResponse.status} ${testResponse.statusText}`);
          }
        } catch (fetchError: any) {
          this.logger.error(`No se puede alcanzar JWKS URL: ${fetchError.message}`);
          this.logger.error(`Stack del fetch error: ${fetchError.stack}`);
        }
        
        return { valid: false, error: `Token inválido - Signature verification failed: ${error.message}` };
      }
      if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
        this.logger.warn(`Token no válido para este realm - Issuer mismatch`);
        this.logger.debug(`Issuer del token: ${payloadIss || 'N/A'}`);
        this.logger.debug(`Issuer esperado: ${this.issuer}`);
        this.logger.debug(`JWKS URL: ${this.jwksUrl}`);
        return { valid: false, error: `Token no válido para este realm. Issuer del token: ${payloadIss}, Issuer esperado: ${this.issuer}` };
      }
      
      this.logger.error(`Error validando token: ${error.message}`);
      this.logger.debug(`Issuer del token: ${payloadIss || 'N/A'}`);
      this.logger.debug(`Issuer esperado: ${this.issuer}`);
      this.logger.debug(`JWKS URL: ${this.jwksUrl}`);
      
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

