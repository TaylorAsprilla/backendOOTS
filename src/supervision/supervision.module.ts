import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from '../participants/entities/case.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { ClosingNote } from '../participants/entities/closing-note.entity';
import { FollowUpPlan } from '../participants/entities/follow-up-plan.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { CaseDiscussion } from '../case-discussions/entities/case-discussion.entity';
import { CaseTransfer } from '../cases/entities/case-transfer.entity';
import { CaseAttachment } from '../case-attachments/case-attachment.entity';
import { User } from '../users/entities/user.entity';
import { SupervisionReview } from './supervision-review.entity';
import { SupervisionController } from './supervision.controller';
import { SupervisionService } from './supervision.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupervisionReview,
      Case,
      User,
      ProgressNote,
      ClosingNote,
      FollowUpPlan,
      InterventionPlan,
      CaseDiscussion,
      CaseTransfer,
      CaseAttachment,
    ]),
  ],
  controllers: [SupervisionController],
  providers: [SupervisionService],
})
export class SupervisionModule {}
