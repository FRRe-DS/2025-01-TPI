import { Controller, Get, Post, Put, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { UserProfileCreateDto } from '../dto/userProfile.dto';
import { UserService } from '../services/user.service';

const prisma = new PrismaClient();

@ApiTags('user')
@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario',
    description: 'Obtiene el perfil complementario del usuario autenticado'
  })
  @ApiBearerAuth('Authorization')
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            phone: { type: 'string' },
            dni: { type: 'string' },
            birthDate: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'No autorizado' },
            code: { type: 'string', example: 'UNAUTHORIZED' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Perfil no encontrado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Perfil no encontrado' },
            code: { type: 'string', example: 'PROFILE_NOT_FOUND' }
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
            error: { type: 'string', example: 'Error interno del servidor' },
            code: { type: 'string', example: 'INTERNAL_ERROR' }
          }
        }
      }
    }
  })
  async getUserProfile(@Headers() headers: any) {
    try {
      const authHeader = headers.authorization || headers.Authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          error: 'Token de autorización requerido',
          code: 'UNAUTHORIZED'
        };
      }

      const token = authHeader.substring(7);
      const tokenRecord = await prisma.token.findUnique({
        where: { token: token },
        include: { user: true }
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return {
          error: 'Token inválido o expirado',
          code: 'UNAUTHORIZED'
        };
      }

      return await this.userService.getUserProfile(tokenRecord.userId);
    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  @Post('profile')
  @ApiOperation({ 
    summary: 'Crear perfil del usuario',
    description: 'Crea el perfil complementario del usuario autenticado'
  })
  @ApiBearerAuth('Authorization')
  @ApiResponse({ 
    status: 201, 
    description: 'Perfil creado exitosamente',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Perfil creado exitosamente' }
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
            error: { type: 'string', example: 'Datos de perfil inválidos' },
            code: { type: 'string', example: 'INVALID_PROFILE_DATA' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'No autorizado' },
            code: { type: 'string', example: 'UNAUTHORIZED' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto - Perfil ya existe',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'El perfil ya existe' },
            code: { type: 'string', example: 'PROFILE_ALREADY_EXISTS' }
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
            error: { type: 'string', example: 'Error interno del servidor' },
            code: { type: 'string', example: 'INTERNAL_ERROR' }
          }
        }
      }
    }
  })
  async createUserProfile(@Body() profileData: UserProfileCreateDto, @Headers() headers: any) {
    try {
      const authHeader = headers.authorization || headers.Authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          error: 'Token de autorización requerido',
          code: 'UNAUTHORIZED'
        };
      }

      const token = authHeader.substring(7);
      const tokenRecord = await prisma.token.findUnique({
        where: { token: token },
        include: { user: true }
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return {
          error: 'Token inválido o expirado',
          code: 'UNAUTHORIZED'
        };
      }

      return await this.userService.createUserProfile(tokenRecord.userId, profileData);
    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  @Put('profile')
  @ApiOperation({ 
    summary: 'Actualizar perfil del usuario',
    description: 'Actualiza el perfil complementario del usuario autenticado'
  })
  @ApiBearerAuth('Authorization')
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil actualizado exitosamente',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Perfil actualizado exitosamente' }
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
            error: { type: 'string', example: 'Datos de perfil inválidos' },
            code: { type: 'string', example: 'INVALID_PROFILE_DATA' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'No autorizado' },
            code: { type: 'string', example: 'UNAUTHORIZED' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Perfil no encontrado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Perfil no encontrado' },
            code: { type: 'string', example: 'PROFILE_NOT_FOUND' }
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
            error: { type: 'string', example: 'Error interno del servidor' },
            code: { type: 'string', example: 'INTERNAL_ERROR' }
          }
        }
      }
    }
  })
  async updateUserProfile(@Body() profileData: UserProfileCreateDto, @Headers() headers: any) {
    try {
      const authHeader = headers.authorization || headers.Authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          error: 'Token de autorización requerido',
          code: 'UNAUTHORIZED'
        };
      }

      const token = authHeader.substring(7);
      const tokenRecord = await prisma.token.findUnique({
        where: { token: token },
        include: { user: true }
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return {
          error: 'Token inválido o expirado',
          code: 'UNAUTHORIZED'
        };
      }

      return await this.userService.updateUserProfile(tokenRecord.userId, profileData);
    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }
}
