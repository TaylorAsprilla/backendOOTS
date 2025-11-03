import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { IdentifiedSituation } from '../../common/entities';
import { Case } from './case.entity';

@Entity('participant_identified_situations')
export class ParticipantIdentifiedSituation {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'identified_situation_id', type: 'int', unsigned: true })
  identifiedSituationId!: number;

  @ManyToOne(() => IdentifiedSituation, { eager: true })
  @JoinColumn({ name: 'identified_situation_id' })
  identifiedSituation!: IdentifiedSituation;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
