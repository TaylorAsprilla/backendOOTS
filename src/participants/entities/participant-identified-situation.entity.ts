import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Participant } from './participant.entity';
import { IdentifiedSituation } from '../../common/entities';

@Entity('participant_identified_situations')
export class ParticipantIdentifiedSituation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'participant_id', type: 'int' })
  participantId!: number;

  @Column({ name: 'identified_situation_id', type: 'int' })
  identifiedSituationId!: number;

  @ManyToOne(
    () => Participant,
    (participant) => participant.participantIdentifiedSituations,
  )
  @JoinColumn({ name: 'participant_id' })
  participant!: Participant;

  @ManyToOne(() => IdentifiedSituation, { eager: true })
  @JoinColumn({ name: 'identified_situation_id' })
  identifiedSituation!: IdentifiedSituation;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
