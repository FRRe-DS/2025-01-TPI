import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';
import { JwtAuthService } from '../../core/keycloak/jwt-auth.service';
import { JwtAuthGuard } from '../../core/keycloak/jwt-auth.guard';

@Module({
  controllers: [CartController],
  providers: [CartService, JwtAuthService, JwtAuthGuard],
  exports: [CartService],
})
export class CartModule {}

