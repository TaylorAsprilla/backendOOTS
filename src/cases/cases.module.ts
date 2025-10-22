import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { BioPsychosocialHistory } from '../participants/entities/bio-psychosocial-history.entity';
import { ConsultationReason } from '../participants/entities/consultation-reason.entity';
import { Intervention } from '../participants/entities/intervention.entity';
import { FollowUpPlan } from '../participants/entities/follow-up-plan.entity';
import { PhysicalHealthHistory } from '../participants/entities/physical-health-history.entity';
import { MentalHealthHistory } from '../participants/entities/mental-health-history.entity';
import { Assessment } from '../participants/entities/assessment.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { Referrals } from '../participants/entities/referrals.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Case,
      Participant,
      BioPsychosocialHistory,
      ConsultationReason,
      Intervention,
      FollowUpPlan,
      PhysicalHealthHistory,
      MentalHealthHistory,
      Assessment,
      InterventionPlan,
      ProgressNote,
      Referrals,
    ]),
  ],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
