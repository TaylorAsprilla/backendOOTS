import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { Participant } from './entities/participant.entity';
import { FamilyMember } from './entities/family-member.entity';
import { BioPsychosocialHistory } from './entities/bio-psychosocial-history.entity';
import { Weighing } from './entities/weighing.entity';
import { User } from '../users/entities/user.entity';
import { WeighingController } from './controllers/weighing.controller';
import { WeighingService } from './services/weighing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Participant,
      FamilyMember,
      BioPsychosocialHistory,
      Weighing,
      User,
    ]),
  ],
  controllers: [ParticipantsController, WeighingController],
  providers: [ParticipantsService, WeighingService],
  exports: [ParticipantsService, WeighingService],
})
export class ParticipantsModule {}
