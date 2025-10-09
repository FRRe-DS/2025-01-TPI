import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Decorador para obtener el usuario autenticado del request
 * @example
 * @Get('profile')
 * getProfile(@User() user: AuthenticatedUser) {
 *   return this.usersService.findById(user.userId);
 * }
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): AuthenticatedUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // Si se especifica una propiedad específica del usuario
    if (data && user[data]) {
      return user[data];
    }

    return user;
  },
);

/**
 * Decorador para obtener solo el ID del usuario autenticado
 * @example
 * @Get('orders')
 * getOrders(@UserId() userId: number) {
 *   return this.ordersService.findByUserId(userId);
 * }
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return user?.userId || null;
  },
);

/**
 * Decorador para obtener solo el email del usuario autenticado
 * @example
 * @Get('notifications')
 * getNotifications(@UserEmail() email: string) {
 *   return this.notificationsService.findByEmail(email);
 * }
 */
export const UserEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return user?.email || null;
  },
);

