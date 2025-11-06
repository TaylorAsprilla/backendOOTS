import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { CaseFollowUpPlan } from '../participants/entities/case-follow-up-plan.entity';
import { PhysicalHealthHistory } from '../participants/entities/physical-health-history.entity';
import { MentalHealthHistory } from '../participants/entities/mental-health-history.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { ClosingNote } from '../participants/entities/closing-note.entity';
import { ParticipantIdentifiedSituation } from '../participants/entities/participant-identified-situation.entity';
import { IdentifiedSituation } from '../identified-situations/entities/identified-situation.entity';
import { FollowUpPlanCatalog } from '../follow-up-plan-catalog/entities/follow-up-plan-catalog.entity';
import { Weighing } from '../participants/entities/weighing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Case,
      Participant,
      CaseFollowUpPlan,
      PhysicalHealthHistory,
      MentalHealthHistory,
      Weighing,
      InterventionPlan,
      ProgressNote,
      ClosingNote,
      ParticipantIdentifiedSituation,
      IdentifiedSituation,
      FollowUpPlanCatalog,
    ]),
  ],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
