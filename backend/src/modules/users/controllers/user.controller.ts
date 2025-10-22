import { Controller, Get, Put, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserProfileUpdateDto } from '../dto/userProfile.dto';
import { UserService } from '../services/user.service';
import { KeycloakService } from '../../../core/keycloak/keycloak.service';

@ApiTags('user')
@Controller('api/user')
export class UserController {
  constructor(
    private userService: UserService,
    private keycloakService: KeycloakService
  ) {}

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
      
      // Validar token con Keycloak y obtener datos del usuario
      const userData = await this.keycloakService.getUserByToken(token);
      
      if (!userData) {
        return {
          error: 'Token inválido o expirado',
          code: 'UNAUTHORIZED'
        };
      }

      return {
        success: true,
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          enabled: userData.enabled,
          createdTimestamp: userData.createdTimestamp
        }
      };
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
  async updateUserProfile(@Body() profileData: UserProfileUpdateDto, @Headers() headers: any) {
    try {
      const authHeader = headers.authorization || headers.Authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          error: 'Token de autorización requerido',
          code: 'UNAUTHORIZED'
        };
      }

      const token = authHeader.substring(7);
      
      // Validar token con Keycloak y obtener datos del usuario
      const userData = await this.keycloakService.getUserByToken(token);
      
      if (!userData) {
        return {
          error: 'Token inválido o expirado',
          code: 'UNAUTHORIZED'
        };
      }

      // Actualizar usuario en Keycloak
      const updateData = {
        firstName: profileData.firstName || userData.firstName,
        lastName: profileData.lastName || userData.lastName,
        email: profileData.email || userData.email,
        enabled: userData.enabled
      };

      await this.keycloakService.updateUser(userData.id, updateData);

      return {
        success: true,
        message: 'Perfil actualizado exitosamente',
        user: {
          id: userData.id,
          username: userData.username,
          email: updateData.email,
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          enabled: updateData.enabled
        }
      };
    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }
}
