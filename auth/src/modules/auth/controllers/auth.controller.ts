import { Controller, Post, Body, Headers, Get, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { LoginDto } from '../../../shared/dto/login.dto';
import { AuthService } from '../services/auth.service';
import { JwtService } from '../../../core/jwt/jwt.service';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Login de usuario',
    description: 'Autentica un usuario y devuelve access_token y refresh_token'
  })
  @ApiBody({
    description: 'Datos de login del usuario',
    type: LoginDto
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            access_token: { 
              type: 'string',
              description: 'Token de acceso JWT válido por 15 minutos'
            },
            refresh_token: { 
              type: 'string',
              description: 'Token de renovación válido por 7 días'
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'Credenciales incorrectas'
            },
            code: { 
              type: 'string',
              example: 'INVALID_CREDENTIALS'
            }
          }
        }
      }
    }
  })
  async login(@Body() loginData: LoginDto) {
    try {
      const result = await this.authService.login(loginData.email, loginData.password);
      return result;
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Si es un error de credenciales, devolver 401
      if (error.error === 'Credenciales incorrectas') {
        throw new HttpException({
          error: error.error,
          code: error.code
        }, HttpStatus.UNAUTHORIZED);
      }
      
      // Para otros errores, devolver 500
      throw new HttpException({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  @ApiOperation({ 
    summary: 'Registro de usuario',
    description: 'Crea un nuevo usuario en el sistema'
  })
  @ApiBody({
    description: 'Datos de registro del usuario',
    type: RegisterDto
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { 
              type: 'string',
              example: 'Usuario registrado exitosamente'
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solicitud incorrecta',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'Las contraseñas no coinciden'
            },
            code: { 
              type: 'string',
              example: 'PASSWORD_MISMATCH'
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto - Email ya registrado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'El email ya está registrado'
            },
            code: { 
              type: 'string',
              example: 'EMAIL_ALREADY_EXISTS'
            }
          }
        }
      }
    }
  })
  async register(@Body() registerData: RegisterDto) {
    try {
      const result = await this.authService.register(registerData);
      return result;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      if (error.error === "Las contraseñas no coinciden") {
        throw new HttpException({
          error: error.error,
          code: error.code
        }, HttpStatus.BAD_REQUEST);
      }
      
      if (error.error === "El email ya está registrado") {
        throw new HttpException({
          error: error.error,
          code: error.code
        }, HttpStatus.CONFLICT);
      }
      
      throw new HttpException({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refresh')
  @ApiOperation({ 
    summary: 'Renovar tokens JWT',
    description: 'Renueva el access_token usando el refresh_token'
  })
  @ApiBody({
    description: 'Refresh token para renovar access token',
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          description: 'Token de renovación'
        }
      },
      required: ['refresh_token']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens renovados exitosamente',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            access_token: { 
              type: 'string',
              description: 'Nuevo access token'
            },
            refresh_token: { 
              type: 'string',
              description: 'Nuevo refresh token'
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Refresh token inválido o expirado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'Refresh token inválido o expirado'
            },
            code: { 
              type: 'string',
              example: 'INVALID_REFRESH_TOKEN'
            }
          }
        }
      }
    }
  })
  async refreshToken(@Body() body: { refresh_token: string }) {
    try {
      const result = await this.authService.refreshToken(body.refresh_token);
      return result;
    } catch (error) {
      console.error('❌ Error en refresh token:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      if (error.error === 'Refresh token inválido o expirado') {
        throw new HttpException({
          error: error.error,
          code: error.code
        }, HttpStatus.UNAUTHORIZED);
      }
      
      throw new HttpException({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('change-password')
  @ApiOperation({ 
    summary: 'Cambio de password de usuario',
    description: 'Cambia la contraseña del usuario autenticado'
  })
  @ApiBearerAuth('Authorization')
  @ApiBody({
    description: 'Datos para cambiar la contraseña del usuario',
    type: ChangePasswordDto
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña cambiada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido o expirado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        user: { type: 'null' }
      }
    }
  })
  async changePassword(@Body() changePasswordData: ChangePasswordDto, @Headers() headers: any) {
    try {
      const authHeader = headers.authorization || headers.Authorization;
      
      // Verificar que se envíe el token
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException({
          success: false,
          message: 'Token de autorización requerido',
          user: null
        }, HttpStatus.UNAUTHORIZED);
      }

      // Extraer el token
      const token = authHeader.substring(7); // Quitar "Bearer "

      // Decodificar el token para obtener el userId
      const decoded = this.jwtService.decodeToken(token);
      if (!decoded || !decoded.userId) {
        throw new HttpException({
          success: false,
          message: 'Token inválido',
          user: null
        }, HttpStatus.UNAUTHORIZED);
      }

      const result = await this.authService.changePassword(changePasswordData, decoded.userId);
      return result;

    } catch (error) {
      console.error('❌ Error en cambio de contraseña:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        message: 'Error en el servidor',
        user: null,
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get('public-key')
  @ApiOperation({ 
    summary: 'Obtener clave pública',
    description: 'Obtiene la clave pública RSA para validar tokens JWT'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Clave pública obtenida exitosamente',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            public_key: { 
              type: 'string',
              description: 'Clave pública RSA en formato PEM'
            }
          }
        }
      }
    }
  })
  async getPublicKey() {
    try {
      const publicKey = this.authService.getPublicKey();
      return {
        public_key: publicKey
      };
    } catch (error) {
      console.error('❌ Error al obtener clave pública:', error);
      
      throw new HttpException({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}