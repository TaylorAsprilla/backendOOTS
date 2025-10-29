import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { IdentifiedSituation } from '../../common/entities';

@Entity('participant_identified_situations')
export class ParticipantIdentifiedSituation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'case_id', type: 'int' })
  caseId!: number;

  @Column({ name: 'identified_situation_id', type: 'int' })
  identifiedSituationId!: number;

  @ManyToOne(() => IdentifiedSituation, { eager: true })
  @JoinColumn({ name: 'identified_situation_id' })
  identifiedSituation!: IdentifiedSituation;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
