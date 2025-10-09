import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AppModule as AppModuleController } from './modules/app/app.module';
import { AuthModule } from './core/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    AppModuleController,
    HealthModule,
    ProductsModule,
    UsersModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
