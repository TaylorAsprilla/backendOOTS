import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSource } from './entities/income-source.entity';
import { IncomeSourceController } from './income-source.controller';
import { IncomeSourceService } from './income-source.service';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeSource])],
  controllers: [IncomeSourceController],
  providers: [IncomeSourceService],
  exports: [TypeOrmModule, IncomeSourceService],
})
export class IncomeSourceModule {}
