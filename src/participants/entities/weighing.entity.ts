import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Case } from './case.entity';

@Entity('weighings')
export class Weighing {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'reason_consultation', type: 'text', nullable: true })
  reasonConsultation?: string;

  @Column({ name: 'identified_situation', type: 'text', nullable: true })
  identifiedSituation?: string;

  @Column({ name: 'favorable_conditions', type: 'text', nullable: true })
  favorableConditions?: string;

  @Column({ name: 'conditions_not_favorable', type: 'text', nullable: true })
  conditionsNotFavorable?: string;

  @Column({ name: 'help_process', type: 'text', nullable: true })
  helpProcess?: string;

  @Column({ name: 'case_id', type: 'int', unique: true })
  caseId!: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.weighing)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
