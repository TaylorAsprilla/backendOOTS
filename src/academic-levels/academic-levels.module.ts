import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicLevelsService } from './academic-levels.service';
import { AcademicLevelsController } from './academic-levels.controller';
import { AcademicLevel } from './entities/academic-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicLevel])],
  controllers: [AcademicLevelsController],
  providers: [AcademicLevelsService],
  exports: [AcademicLevelsService],
})
export class AcademicLevelsModule {}
