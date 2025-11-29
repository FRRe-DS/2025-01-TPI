import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AppModule as AppModuleController } from './modules/app/app.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AppModuleController,
    HealthModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
