import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';
import { IdentifiedSituation } from '../identified-situations/entities/identified-situation.entity';
import { FollowUpPlanCatalog } from '../follow-up-plan-catalog/entities/follow-up-plan-catalog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IdentifiedSituation, FollowUpPlanCatalog]),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}
