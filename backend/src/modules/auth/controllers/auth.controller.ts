import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthService } from '../../../core/keycloak/jwt-auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private jwtAuthService: JwtAuthService) {}

  @Get('debug')
  @ApiOperation({
    summary: 'Endpoint de debug para validación de tokens',
    description: 'Muestra información sobre la configuración de Keycloak y el estado de validación del token actual (si se proporciona)'
  })
  @ApiResponse({
    status: 200,
    description: 'Información de debug del token y configuración'
  })
  async debug(@Request() req: any) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const hasToken = authHeader && authHeader.startsWith('Bearer ');
    const token = hasToken ? authHeader.substring(7) : null;
    
    // Decodificar el token para obtener información sin validar
    let tokenInfo: any = {};
    let validationResult: any = {};
    
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          // Decodificar header
          try {
            tokenInfo.header = JSON.parse(
              Buffer.from(tokenParts[0], 'base64url').toString()
            );
          } catch (e) {
            tokenInfo.headerError = 'No se pudo decodificar el header';
          }

          // Decodificar payload
          try {
            tokenInfo.payload = JSON.parse(
              Buffer.from(tokenParts[1], 'base64url').toString()
            );
          } catch (e) {
            tokenInfo.payloadError = 'No se pudo decodificar el payload';
          }
        } else {
          tokenInfo.error = 'Token con formato incorrecto (no tiene 3 partes)';
        }
      } catch (error: any) {
        tokenInfo.error = error.message;
      }

      // Intentar validar el token
      validationResult = await this.jwtAuthService.validateToken(token);
    } else {
      tokenInfo = { message: 'No se proporcionó token' };
      validationResult = { valid: false, error: 'Token no proporcionado' };
    }

    // Obtener configuración actual
    const config = {
      issuer: this.jwtAuthService.getIssuer(),
      jwksUrl: this.jwtAuthService.getJwksUrl(),
    };

    // Información del token decodificado
    const tokenIssuer = tokenInfo.payload?.iss;
    const tokenExp = tokenInfo.payload?.exp;
    const tokenExpDate = tokenExp ? new Date(tokenExp * 1000).toISOString() : null;
    const tokenIsExpired = tokenExp ? tokenExp < Date.now() / 1000 : null;
    const tokenScopes = tokenInfo.payload?.scope ? 
      (tokenInfo.payload.scope as string).split(' ') : [];

    return {
      config,
      token: token ? {
        header: tokenInfo.header,
        payload: {
          iss: tokenInfo.payload?.iss,
          sub: tokenInfo.payload?.sub,
          aud: tokenInfo.payload?.aud,
          exp: tokenInfo.payload?.exp,
          iat: tokenInfo.payload?.iat,
          scope: tokenInfo.payload?.scope,
          scopes: tokenScopes,
          expDate: tokenExpDate,
          isExpired: tokenIsExpired,
          azp: tokenInfo.payload?.azp,
          preferred_username: tokenInfo.payload?.preferred_username,
          email: tokenInfo.payload?.email,
        },
      } : null,
      validation: token ? {
        valid: validationResult.valid,
        error: validationResult.error,
        issuerMatch: tokenIssuer === config.issuer,
        issuerFromToken: tokenIssuer,
        issuerExpected: config.issuer,
        jwksUrl: config.jwksUrl,
      } : null,
      diagnostics: token ? {
        issuerMismatch: tokenIssuer !== config.issuer,
        signatureMismatch: !validationResult.valid && 
          (validationResult.error?.includes('signature') || 
          validationResult.error?.includes('Invalid signature')),
        tokenExpired: tokenIsExpired === true,
        tokenInvalidFormat: !!tokenInfo.error,
      } : { message: 'No se proporcionó token para validar' }
    };
  }
}

