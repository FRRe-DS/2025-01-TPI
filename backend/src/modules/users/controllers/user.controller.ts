import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserProfileUpdateDto } from '../dto/userProfile.dto';
import { UserService } from '../services/user.service';
import { KeycloakService } from '../../../core/keycloak/keycloak.service';
import { JwtAuthGuard, RequireScopes } from '../../../core/keycloak/jwt-auth.guard';

@ApiTags('user')
@Controller('api/user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Authorization')
export class UserController {
  constructor(
    private userService: UserService,
    private keycloakService: KeycloakService
  ) {}

  @Get('profile')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario',
    description: 'Obtiene el perfil complementario del usuario autenticado. Requiere autenticación válida.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                enabled: { type: 'boolean' },
                createdTimestamp: { type: 'number' },
                phone: { type: 'string' },
                dni: { type: 'string' },
                birthDate: { type: 'string' }
              }
            }
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
    status: 403, 
    description: 'Permisos insuficientes',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Permisos insuficientes. Scopes requeridos: productos:read' },
            statusCode: { type: 'number', example: 403 }
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
  async getUserProfile(@Request() req: any) {
    try {
      // El guard ya validó el token y agregó la información al request
      const userId = req.user.userId;
      
      if (!userId) {
        return {
          error: 'Usuario no encontrado en el token',
          code: 'UNAUTHORIZED'
        };
      }

      // Obtener datos completos del usuario desde Keycloak
      const userData = await this.keycloakService.getUserById(userId);
      
      if (!userData) {
        return {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
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
          createdTimestamp: userData.createdTimestamp,
          phone: userData.attributes?.phone?.[0] || '',
          dni: userData.attributes?.dni?.[0] || '',
          birthDate: userData.attributes?.birthDate?.[0] || ''
        }
      };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }


  @Put('profile')
  @ApiOperation({ 
    summary: 'Actualizar perfil del usuario',
    description: 'Actualiza el perfil complementario del usuario autenticado. Requiere autenticación válida.'
  })
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
  async updateUserProfile(@Body() profileData: UserProfileUpdateDto, @Request() req: any) {
    try {
      // El guard ya validó el token y agregó la información al request
      const userId = req.user.userId;
      
      if (!userId) {
        return {
          error: 'Usuario no encontrado en el token',
          code: 'UNAUTHORIZED'
        };
      }

      // Obtener datos completos del usuario desde Keycloak
      const userData = await this.keycloakService.getUserById(userId);
      
      if (!userData) {
        return {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        };
      }

      // Actualizar usuario en Keycloak
      const updateData = {
        firstName: profileData.firstName || userData.firstName,
        lastName: profileData.lastName || userData.lastName,
        email: profileData.email || userData.email,
        enabled: userData.enabled,
        attributes: {
          phone: profileData.phone ? [profileData.phone] : userData.attributes?.phone || [],
          dni: profileData.dni ? [profileData.dni] : userData.attributes?.dni || [],
          birthDate: profileData.birthDate ? [profileData.birthDate] : userData.attributes?.birthDate || []
        }
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
