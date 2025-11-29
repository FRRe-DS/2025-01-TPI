import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthService } from './jwt-auth.service';

// Decorator para especificar scopes requeridos
export const RequireScopes = (...scopes: string[]) => SetMetadata('requiredScopes', scopes);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtAuthService: JwtAuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extraer token del header
    const authHeader = request.headers.authorization || request.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autorización requerido');
    }

    const token = authHeader.substring(7);

    // Validar token
    const validationResult = await this.jwtAuthService.validateToken(token);

    if (!validationResult.valid || !validationResult.payload) {
      throw new UnauthorizedException(
        validationResult.error || 'Token inválido o expirado'
      );
    }

    // Obtener scopes requeridos del metadata
    const requiredScopes = this.reflector.get<string[]>(
      'requiredScopes',
      context.getHandler(),
    ) || this.reflector.get<string[]>(
      'requiredScopes',
      context.getClass(),
    );

    // Verificar scopes si se especificaron
    if (requiredScopes && requiredScopes.length > 0) {
      const hasScopes = this.jwtAuthService.hasRequiredScopes(
        validationResult.payload,
        requiredScopes,
      );

      if (!hasScopes) {
        throw new ForbiddenException(
          `Permisos insuficientes. Scopes requeridos: ${requiredScopes.join(', ')}`
        );
      }
    }

    // Agregar información del token al request para uso posterior
    request.user = {
      userId: this.jwtAuthService.getUserId(validationResult.payload),
      payload: validationResult.payload,
      scopes: this.jwtAuthService.getScopes(validationResult.payload),
    };

    return true;
  }
}

