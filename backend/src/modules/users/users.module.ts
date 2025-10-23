import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { KeycloakService } from '../../core/keycloak/keycloak.service';

@Module({
  controllers: [UserController],
  providers: [UserService, KeycloakService],
})
export class UsersModule {}
