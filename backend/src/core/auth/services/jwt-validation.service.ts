import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtValidationService implements OnModuleInit {
  private readonly logger = new Logger(JwtValidationService.name);
  private publicKey: string;
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    await this.loadPublicKey();
    // Recargar la clave pública cada 5 minutos
    setInterval(() => this.loadPublicKey(), 5 * 60 * 1000);
  }

  /**
   * Carga la clave pública del servicio de autenticación
   */
  private async loadPublicKey(): Promise<void> {
    try {
      this.logger.log('🔑 Cargando clave pública del servicio auth...');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/auth/public-key`)
      );

      if (response.data?.public_key) {
        this.publicKey = response.data.public_key;
        this.logger.log('✅ Clave pública cargada exitosamente');
      } else {
        this.logger.error('❌ No se pudo obtener la clave pública');
      }
    } catch (error) {
      this.logger.error('❌ Error al cargar clave pública:', error.message);
      // No lanzar error para evitar que el servicio falle al iniciar
    }
  }

  /**
   * Valida un token JWT usando la clave pública
   */
  async validateToken(token: string): Promise<any> {
    try {
      if (!this.publicKey) {
        this.logger.warn('⚠️ Clave pública no disponible, intentando recargar...');
        await this.loadPublicKey();
        
        if (!this.publicKey) {
          throw new Error('Clave pública no disponible');
        }
      }

      // Verificar y decodificar el token
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: 'auth-service',
        audience: 'backend-service'
      });

      this.logger.debug('✅ Token válido para usuario:', (decoded as any).userId);
      return decoded;
    } catch (error) {
      this.logger.warn('❌ Token inválido:', error.message);
      return null;
    }
  }

  /**
   * Extrae el token del header Authorization
   */
  extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization || request.headers.Authorization;
    
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  /**
   * Verifica si el token es válido y no ha expirado
   */
  async isTokenValid(token: string): Promise<boolean> {
    const decoded = await this.validateToken(token);
    return decoded !== null;
  }

  /**
   * Obtiene información del usuario del token
   */
  async getUserFromToken(token: string): Promise<any> {
    const decoded = await this.validateToken(token);
    return decoded ? {
      userId: (decoded as any).userId,
      email: (decoded as any).email,
      iat: (decoded as any).iat,
      exp: (decoded as any).exp
    } : null;
  }
}

