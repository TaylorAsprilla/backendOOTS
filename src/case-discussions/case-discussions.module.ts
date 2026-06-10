import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { FamilyMember } from '../participants/entities/family-member.entity';
import { User } from '../users/entities/user.entity';
import { CaseDiscussion } from './entities/case-discussion.entity';
import { CaseDiscussionFamilyMember } from './entities/case-discussion-family-member.entity';
import { CaseDiscussionsController } from './case-discussions.controller';
import { CaseDiscussionsService } from './case-discussions.service';
import { CaseDiscussionsPdfService } from './case-discussions-pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Case,
      Participant,
      FamilyMember,
      User,
      CaseDiscussion,
      CaseDiscussionFamilyMember,
    ]),
  ],
  controllers: [CaseDiscussionsController],
  providers: [CaseDiscussionsService, CaseDiscussionsPdfService],
  exports: [CaseDiscussionsService],
})
export class CaseDiscussionsModule {}