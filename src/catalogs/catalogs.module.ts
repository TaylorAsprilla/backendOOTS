import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';
import { IdentifiedSituation } from '../common/entities';
import { FollowUpPlanCatalog } from '../common/entities/follow-up-plan-catalog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IdentifiedSituation, FollowUpPlanCatalog]),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}
