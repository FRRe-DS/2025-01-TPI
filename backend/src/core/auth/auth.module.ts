import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtValidationService } from './services/jwt-validation.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    JwtValidationService,
    AuthGuard,
  ],
  exports: [
    JwtValidationService,
    AuthGuard,
  ],
})
export class AuthModule {}

