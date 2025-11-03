import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApproachTypesService } from './approach-types.service';
import { ApproachTypesController } from './approach-types.controller';
import { ApproachType } from '../common/entities/approach-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApproachType])],
  controllers: [ApproachTypesController],
  providers: [ApproachTypesService],
  exports: [ApproachTypesService],
})
export class ApproachTypesModule {}
