import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User, UserId, UserEmail } from '../../../core/auth/decorators/user.decorator';
import type { AuthenticatedUser } from '../../../core/auth/decorators/user.decorator';
import { AuthGuard } from '../../../core/auth/guards/auth.guard';
import { Public } from '../../../core/auth/guards/auth.guard';

@ApiTags('user')
@Controller('api/user')
@UseGuards(AuthGuard)
export class UserController {

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiBearerAuth('Authorization')
  @ApiResponse({ status: 200, description: 'Perfil del usuario obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'Token de autorización requerido o inválido' })
  getProfile(@User() user: AuthenticatedUser) {
    return {
      message: 'Perfil del usuario obtenido exitosamente',
      user: {
        id: user.userId,
        email: user.email,
        tokenIssuedAt: new Date(user.iat * 1000),
        tokenExpiresAt: new Date(user.exp * 1000)
      }
    };
  }

  @Get('orders')
  @ApiOperation({ summary: 'Obtener órdenes del usuario autenticado' })
  @ApiBearerAuth('Authorization')
  @ApiResponse({ status: 200, description: 'Órdenes obtenidas exitosamente' })
  @ApiResponse({ status: 401, description: 'Token de autorización requerido o inválido' })
  getUserOrders(@UserId() userId: number) {
    return {
      message: 'Órdenes del usuario obtenidas exitosamente',
      userId: userId,
      orders: [
        { id: 1, product: 'Producto 1', status: 'completed' },
        { id: 2, product: 'Producto 2', status: 'pending' }
      ]
    };
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Obtener notificaciones del usuario autenticado' })
  @ApiBearerAuth('Authorization')
  @ApiResponse({ status: 200, description: 'Notificaciones obtenidas exitosamente' })
  @ApiResponse({ status: 401, description: 'Token de autorización requerido o inválido' })
  getUserNotifications(@UserEmail() email: string) {
    return {
      message: 'Notificaciones obtenidas exitosamente',
      email: email,
      notifications: [
        { id: 1, message: 'Tu pedido ha sido enviado', read: false },
        { id: 2, message: 'Nueva oferta disponible', read: true }
      ]
    };
  }

  @Get('public-info')
  @Public()
  @ApiOperation({ summary: 'Información pública (no requiere autenticación)' })
  @ApiResponse({ status: 200, description: 'Información pública obtenida exitosamente' })
  getPublicInfo() {
    return {
      message: 'Esta es información pública que no requiere autenticación',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Post('test-auth')
  @ApiOperation({ summary: 'Endpoint de prueba para verificar autenticación' })
  @ApiBearerAuth('Authorization')
  @ApiResponse({ status: 200, description: 'Autenticación verificada exitosamente' })
  @ApiResponse({ status: 401, description: 'Token de autorización requerido o inválido' })
  testAuthentication(@User() user: AuthenticatedUser) {
    return {
      message: 'Autenticación verificada exitosamente',
      authenticated: true,
      user: {
        id: user.userId,
        email: user.email
      },
      timestamp: new Date().toISOString()
    };
  }
}