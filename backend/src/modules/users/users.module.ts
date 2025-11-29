import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { KeycloakService } from '../../core/keycloak/keycloak.service';
import { JwtAuthService } from '../../core/keycloak/jwt-auth.service';
import { JwtAuthGuard } from '../../core/keycloak/jwt-auth.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, KeycloakService, JwtAuthService, JwtAuthGuard],
  exports: [JwtAuthService, JwtAuthGuard],
})
export class UsersModule {}
