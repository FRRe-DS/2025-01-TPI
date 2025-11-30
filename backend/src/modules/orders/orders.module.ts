import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { JwtAuthService } from '../../core/keycloak/jwt-auth.service';
import { JwtAuthGuard } from '../../core/keycloak/jwt-auth.guard';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, JwtAuthService, JwtAuthGuard],
  exports: [OrdersService],
})
export class OrdersModule {}

