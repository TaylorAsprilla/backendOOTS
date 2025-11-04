import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HousingType } from './entities/housing-type.entity';
import { HousingTypeController } from './housing-type.controller';
import { HousingTypeService } from './housing-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([HousingType])],
  controllers: [HousingTypeController],
  providers: [HousingTypeService],
  exports: [HousingTypeService],
})
export class HousingTypeModule {}
