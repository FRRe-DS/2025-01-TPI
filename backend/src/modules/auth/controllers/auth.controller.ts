import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/changePassword.dto';

const prisma = new PrismaClient();

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {

  // Método para generar token único
  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
  
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
    description: '📋 DOCUMENTACIÓN: Ejemplos de respuestas exitosas',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string', description: 'Token de autenticación válido por 24 horas' },
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
  async login(@Body() loginData: { email: string; password: string }) {
    try {
      // Buscar usuario por email
      const user = await prisma.auth.findUnique({
        where: { email: loginData.email }
      });

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          user: null
        };
      }

      // Verificar password (por ahora sin encriptación)
      if (user.password !== loginData.password) {
        return {
          success: false,
          message: 'Password incorrecto',
          user: null
        };
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        return {
          success: false,
          message: 'Usuario inactivo',
          user: null
        };
      }

      // Generar token único
      const token = this.generateToken();
      
      // Calcular fecha de expiración (24 horas)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Guardar token en la base de datos
      await prisma.token.create({
        data: {
          token: token,
          userId: user.id,
          expiresAt: expiresAt
        }
      });

      // Login exitoso - devolver datos del usuario y token
      return {
        success: true,
        message: 'Login exitoso',
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
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
    description: '📋 DOCUMENTACIÓN: Usuario registrado exitosamente',
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
    status: 400, 
    description: '📋 DOCUMENTACIÓN: Error en el registro',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        user: { type: 'null' }
      }
    }
  })
  async register(@Body() registerData: RegisterDto) {
    try {
      // Verificar si el email ya existe
      const existingUser = await prisma.auth.findUnique({
        where: { email: registerData.email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'El email ya está registrado',
          user: null
        };
      }

      // Crear nuevo usuario
      const newUser = await prisma.auth.create({
        data: {
          email: registerData.email,
          password: registerData.password, // NOTA: En producción usar bcrypt
          name: registerData.name,
          isActive: true
        }
      });

      // Usuario creado exitosamente
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
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
      if (user.password !== changePasswordData.currentPassword) {
        return {
          success: false,
          message: 'Password actual incorrecto',
          user: null
        };
      }

      // Actualizar la contraseña
      await prisma.auth.update({
        where: { id: user.id },
        data: {
          password: changePasswordData.newPassword,
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
          name: user.name,
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
