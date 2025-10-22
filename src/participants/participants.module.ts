import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { Participant } from './entities/participant.entity';
import { FamilyMember } from './entities/family-member.entity';
import { ClosingNote } from './entities/closing-note.entity';
import { ParticipantIdentifiedSituation } from './entities/participant-identified-situation.entity';
import { IdentifiedSituation } from '../common/entities';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Participant,
      FamilyMember,
      ClosingNote,
      ParticipantIdentifiedSituation,
      IdentifiedSituation,
      User,
    ]),
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
