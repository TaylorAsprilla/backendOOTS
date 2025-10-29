import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { ConsultationReason } from '../participants/entities/consultation-reason.entity';
import { Intervention } from '../participants/entities/intervention.entity';
import { CaseFollowUpPlan } from '../participants/entities/case-follow-up-plan.entity';
import { PhysicalHealthHistory } from '../participants/entities/physical-health-history.entity';
import { MentalHealthHistory } from '../participants/entities/mental-health-history.entity';
import { Ponderacion } from '../participants/entities/ponderacion.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { Referrals } from '../participants/entities/referrals.entity';
import { ClosingNote } from '../participants/entities/closing-note.entity';
import { ParticipantIdentifiedSituation } from '../participants/entities/participant-identified-situation.entity';
import { IdentifiedSituation } from '../common/entities';
import { FollowUpPlanCatalog } from '../common/entities/follow-up-plan-catalog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Case,
      Participant,
      ConsultationReason,
      Intervention,
      CaseFollowUpPlan,
      PhysicalHealthHistory,
      MentalHealthHistory,
      Ponderacion,
      InterventionPlan,
      ProgressNote,
      Referrals,
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
