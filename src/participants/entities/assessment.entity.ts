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

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'consultation_reason', type: 'text' })
  consultationReason!: string;

  @Column({ name: 'weighting', type: 'text' })
  weighting!: string;

  @Column({ name: 'concurrent_factors', type: 'text' })
  concurrentFactors!: string;

  @Column({ name: 'critical_factors', type: 'text' })
  criticalFactors!: string;

  @Column({ name: 'problem_analysis', type: 'text' })
  problemAnalysis!: string;

  @Column({ name: 'case_id', type: 'int', unique: true })
  caseId!: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.assessment)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
