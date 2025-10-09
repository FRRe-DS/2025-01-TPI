import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtValidationService } from '../services/jwt-validation.service';

// Decorador para marcar rutas públicas
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata(IS_PUBLIC_KEY, true);
};

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtValidationService: JwtValidationService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('🔓 Ruta pública, omitiendo autenticación');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.jwtValidationService.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('❌ Token no proporcionado en la petición');
      throw new UnauthorizedException('Token de autorización requerido');
    }

    try {
      const user = await this.jwtValidationService.getUserFromToken(token);
      
      if (!user) {
        this.logger.warn('❌ Token inválido o expirado');
        throw new UnauthorizedException('Token inválido o expirado');
      }

      // Agregar información del usuario al request
      request['user'] = user;
      
      this.logger.debug(`✅ Usuario autenticado: ${user.email} (ID: ${user.userId})`);
      return true;
    } catch (error) {
      this.logger.error('❌ Error en autenticación:', error.message);
      throw new UnauthorizedException('Token inválido');
    }
  }
}

