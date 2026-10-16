import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { PdfService } from './pdf.service';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { PhysicalHealthHistory } from '../participants/entities/physical-health-history.entity';
import { MentalHealthHistory } from '../participants/entities/mental-health-history.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { ClosingNote } from '../participants/entities/closing-note.entity';
import { ParticipantIdentifiedSituation } from '../participants/entities/participant-identified-situation.entity';
import { IdentifiedSituation } from '../identified-situations/entities/identified-situation.entity';
import { FollowUpPlan } from '../participants/entities/follow-up-plan.entity';
import { Weighing } from '../participants/entities/weighing.entity';
import { CaseDocumentHistory } from './entities/case-document-history.entity';
import { CaseDocumentHistoryService } from './case-document-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Case,
      Participant,
      PhysicalHealthHistory,
      MentalHealthHistory,
      Weighing,
      InterventionPlan,
      ProgressNote,
      ClosingNote,
      ParticipantIdentifiedSituation,
      IdentifiedSituation,
      FollowUpPlan,
      CaseDocumentHistory,
    ]),
  ],
  controllers: [CasesController],
  providers: [CasesService, PdfService, CaseDocumentHistoryService],
  exports: [CasesService, CaseDocumentHistoryService],
})
export class CasesModule {}
