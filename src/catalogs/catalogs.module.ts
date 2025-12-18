import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';
import { IdentifiedSituation } from '../identified-situations/entities/identified-situation.entity';
import { FollowUpPlan } from '../participants/entities/follow-up-plan.entity';
import { ApproachType } from './entities/approach-type.entity';
import { ProcessType } from './entities/process-type.entity';
import { ApproachTypesService } from './approach-types.service';
import { ProcessTypesService } from './process-types.service';
import { ApproachTypesController } from './approach-types.controller';
import { ProcessTypesController } from './process-types.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IdentifiedSituation,
      FollowUpPlan,
      ApproachType,
      ProcessType,
    ]),
  ],
  controllers: [
    CatalogsController,
    ApproachTypesController,
    ProcessTypesController,
  ],
  providers: [CatalogsService, ApproachTypesService, ProcessTypesService],
  exports: [CatalogsService, ApproachTypesService, ProcessTypesService],
})
export class CatalogsModule {}
