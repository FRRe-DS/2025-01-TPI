import { Controller, Post, Body, Headers, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { AuthService } from '../services/auth.service';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @ApiOperation({ 
    summary: 'Login de usuario',
    description: 'Autentica un usuario y devuelve sus datos completos'
  })
  @ApiBody({
    description: 'Datos de login del usuario',
    schema: {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          example: 'admin@shopflow.com',
          description: 'Email del usuario'
        },
        password: { 
          type: 'string', 
          example: 'admin123',
          description: 'Password del usuario'
        }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: { 
              type: 'string',
              description: 'Token de autenticación válido por 24 horas'
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
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'Error interno del servidor'
            },
            code: { 
              type: 'string',
              example: 'INTERNAL_ERROR'
            }
          }
        }
      }
    }
  })
  async login(@Body() loginData: { email: string; password: string }) {
    try {
      console.log('🔍 Iniciando proceso de login para:', loginData.email);
      
      // Verificar conexión a la base de datos
      try {
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos establecida');
      } catch (dbError) {
        console.error('❌ Error de conexión a la base de datos:', dbError);
        throw dbError;
      }

      // Buscar usuario por email
      console.log('🔍 Buscando usuario con email:', loginData.email);
      const user = await prisma.auth.findUnique({
        where: { email: loginData.email }
      });
      console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No');

      if (!user) {
        return {
          error: 'Credenciales incorrectas',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Verificar password
      const passwordMatch = await bcrypt.compare(loginData.password, user.password);

      if (!passwordMatch) {
        return {
          error: 'Credenciales incorrectas',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        return {
          error: 'Credenciales incorrectas',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Generar token único
      const token = this.authService.generateToken({userId: user.id});
      console.log('🔑 Token generado:', token);
      console.log('🔑 Longitud del token:', token.length);
      
      // Calcular fecha de expiración (24 horas)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      console.log('⏰ Fecha de expiración:', expiresAt);
      console.log('👤 User ID:', user.id);

      // Verificar tokens existentes para este usuario
      const existingTokens = await prisma.token.findMany({
        where: { userId: user.id }
      });
      console.log('🔍 Tokens existentes para el usuario:', existingTokens.length);
      
      // Limpiar tokens expirados
      const expiredTokens = await prisma.token.deleteMany({
        where: {
          userId: user.id,
          expiresAt: { lt: new Date() }
        }
      });
      console.log('🗑️ Tokens expirados eliminados:', expiredTokens.count);

      // Debug: Datos que se van a insertar
      const tokenData = {
        token: token,
        userId: user.id,
        expiresAt: expiresAt
      };
      console.log('📝 Datos para insertar en token:', JSON.stringify(tokenData, null, 2));

      // Guardar token en la base de datos
      try {
        const createdToken = await prisma.token.create({
          data: tokenData
        });
        console.log('✅ Token creado exitosamente:', createdToken);
      } catch (prismaError) {
        console.error('❌ Error al crear token en Prisma:', prismaError);
        console.error('❌ Detalles del error:', {
          message: prismaError.message,
          code: prismaError.code,
          meta: prismaError.meta
        });
        throw prismaError;
      }

      // Login exitoso - devolver datos del usuario y token
      return {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };

    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
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
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'Error interno del servidor'
            },
            code: { 
              type: 'string',
              example: 'INTERNAL_ERROR'
            }
          }
        }
      }
    }
  })
  async register(@Body() registerData: RegisterDto) {
    try {
      // Validar que las contraseñas coincidan
      if (registerData.password !== registerData.repeatPassword) {
        return {
          error: "Las contraseñas no coinciden",
          code: "PASSWORD_MISMATCH"
        };
      }

      // Verificar si el email ya existe
      const existingUser = await prisma.auth.findUnique({
        where: { email: registerData.email }
      });

      if (existingUser) {
        return {
          error: "El email ya está registrado",
          code: "EMAIL_ALREADY_EXISTS"
        };
      }

      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash(registerData.password, 10);

      await prisma.auth.create({
        data: {
          email: registerData.email,
          password: hashedPassword,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          isActive: true
        }
      });

      // Usuario creado exitosamente
      return {
        message: "Usuario registrado exitosamente"
      };

    } catch (error) {
      return {
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR"
      };
    }
  }

  @Get('refresh')
  @ApiOperation({ 
    summary: 'Refrescar token JWT',
    description: 'Refresca el token de autenticación del usuario'
  })
  @ApiBearerAuth('Authorization')
  @ApiResponse({ 
    status: 200, 
    description: 'Token refrescado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: { 
              type: 'string',
              description: 'Nuevo token de autenticación'
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido o expirado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'Token inválido o expirado'
            },
            code: { 
              type: 'string',
              example: 'INVALID_TOKEN'
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'Error interno del servidor'
            },
            code: { 
              type: 'string',
              example: 'INTERNAL_ERROR'
            }
          }
        }
      }
    }
  })
  async refreshToken(@Headers() headers: any) {
    try {
      const authHeader = headers.authorization || headers.Authorization;
      
      // Verificar que se envíe el token
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          error: 'Token de autorización requerido',
          code: 'UNAUTHORIZED'
        };
      }

      // Extraer el token
      const token = authHeader.substring(7); // Quitar "Bearer "

      // Buscar el token en la base de datos
      const tokenRecord = await prisma.token.findUnique({
        where: { token: token },
        include: { user: true }
      });

      if (!tokenRecord) {
        return {
          error: 'Token inválido o expirado',
          code: 'INVALID_TOKEN'
        };
      }

      // Verificar que el token no haya expirado
      if (tokenRecord.expiresAt < new Date()) {
        return {
          error: 'Token inválido o expirado',
          code: 'INVALID_TOKEN'
        };
      }

      const user = tokenRecord.user;

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        return {
          error: 'Token inválido o expirado',
          code: 'INVALID_TOKEN'
        };
      }

      // Generar nuevo token
      const newToken = this.authService.generateToken({userId: user.id});
      
      // Calcular nueva fecha de expiración (24 horas)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Actualizar token en la base de datos
      await prisma.token.update({
        where: { id: tokenRecord.id },
        data: {
          token: newToken,
          expiresAt: expiresAt
        }
      });

      // Token refrescado exitosamente
      return {
        token: newToken
      };

    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  @Post('change-password')
  @ApiOperation({ 
    summary: 'Cambio de password de usuario',
    description: 'Cambia la contraseña del usuario'
  })
  @ApiBearerAuth('Authorization')
  @ApiBody({
    description: 'Datos para cambiar la contraseña del usuario',
    type: ChangePasswordDto
  })
  @ApiResponse({ 
    status: 200, 
    description: '📋 DOCUMENTACIÓN: Ejemplos de respuestas exitosas',
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
            name: { type: 'string' },
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
    description: '📋 DOCUMENTACIÓN: Ejemplos de respuestas de error',
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
        return {
          success: false,
          message: 'Token de autorización requerido',
          user: null
        };
      }

      // Extraer el token
      const token = authHeader.substring(7); // Quitar "Bearer "

      // Buscar el token en la base de datos
      const tokenRecord = await prisma.token.findUnique({
        where: { token: token },
        include: { user: true }
      });

      if (!tokenRecord) {
        return {
          success: false,
          message: 'Token inválido',
          user: null
        };
      }

      // Verificar que el token no haya expirado
      if (tokenRecord.expiresAt < new Date()) {
        return {
          success: false,
          message: 'Token expirado',
          user: null
        };
      }

      const user = tokenRecord.user;

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        return {
          success: false,
          message: 'Usuario inactivo',
          user: null
        };
      }

      // Verificar password actual
      const passwordMatch = await bcrypt.compare(changePasswordData.currentPassword, user.password);
      if (!passwordMatch) {
        return {
          success: false,
          message: 'Password actual incorrecto',
          user: null
        };
      }

      // Actualizar la contraseña
      const hashedPassword = await bcrypt.hash(changePasswordData.newPassword, 10);

      await prisma.auth.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // Contraseña cambiada exitosamente
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: new Date()
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error en el servidor',
        user: null,
        error: error.message
      };
    }
  }
}
