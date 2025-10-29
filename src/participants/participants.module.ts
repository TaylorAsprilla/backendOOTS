import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { Participant } from './entities/participant.entity';
import { FamilyMember } from './entities/family-member.entity';
import { BioPsychosocialHistory } from './entities/bio-psychosocial-history.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Participant,
      FamilyMember,
      BioPsychosocialHistory,
      User,
    ]),
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
