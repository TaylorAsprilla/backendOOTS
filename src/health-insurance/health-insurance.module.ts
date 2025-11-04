import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthInsuranceService } from './health-insurance.service';
import { HealthInsuranceController } from './health-insurance.controller';
import { HealthInsurance } from './entities/health-insurance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HealthInsurance])],
  controllers: [HealthInsuranceController],
  providers: [HealthInsuranceService],
  exports: [HealthInsuranceService],
})
export class HealthInsuranceModule {}
