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

@Entity('ponderaciones')
export class Ponderacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'consultation_motive_analysis',
    type: 'text',
    nullable: true,
  })
  consultationMotiveAnalysis?: string;

  @Column({
    name: 'identified_situation_analysis',
    type: 'text',
    nullable: true,
  })
  identifiedSituationAnalysis?: string;

  @Column({ name: 'favorable_conditions', type: 'text', nullable: true })
  favorableConditions?: string;

  @Column({ name: 'unfavorable_conditions', type: 'text', nullable: true })
  unfavorableConditions?: string;

  @Column({ name: 'theoretical_approach', type: 'text', nullable: true })
  theoreticalApproach?: string;

  @Column({ name: 'case_id' })
  caseId: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.ponderacion)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
