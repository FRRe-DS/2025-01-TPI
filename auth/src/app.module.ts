import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { AppModule as AppModuleController } from './modules/app/app.module';

@Module({
  imports: [
    AppModuleController,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
