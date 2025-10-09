import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtService } from '../../core/jwt/jwt.service';
import { RefreshTokensService } from '../../core/refresh-tokens/refresh-tokens.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, RefreshTokensService],
  exports: [AuthService, JwtService, RefreshTokensService],
})
export class AuthModule {}
