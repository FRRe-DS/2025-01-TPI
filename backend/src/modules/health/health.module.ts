import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { StatusController } from './controllers/status.controller';

@Module({
  controllers: [HealthController, StatusController],
  providers: [],
})
export class HealthModule {}
