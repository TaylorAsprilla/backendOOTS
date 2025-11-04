import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeLevel } from './entities/income-level.entity';
import { IncomeLevelController } from './income-level.controller';
import { IncomeLevelService } from './income-level.service';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeLevel])],
  controllers: [IncomeLevelController],
  providers: [IncomeLevelService],
  exports: [TypeOrmModule, IncomeLevelService],
})
export class IncomeLevelModule {}
