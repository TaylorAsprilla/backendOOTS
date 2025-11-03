import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { Participant } from './entities/participant.entity';
import { FamilyMember } from './entities/family-member.entity';
import { BioPsychosocialHistory } from './entities/bio-psychosocial-history.entity';
import { Weighing } from './entities/weighing.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { ParticipantEmergencyContact } from './entities/participant-emergency-contact.entity';
import { User } from '../users/entities/user.entity';
import { WeighingService } from './services/weighing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Participant,
      FamilyMember,
      BioPsychosocialHistory,
      Weighing,
      EmergencyContact,
      ParticipantEmergencyContact,
      User,
    ]),
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService, WeighingService],
  exports: [ParticipantsService, WeighingService],
})
export class ParticipantsModule {}
