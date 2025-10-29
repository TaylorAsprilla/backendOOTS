import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Case } from './case.entity';

@Entity('intervention_plans')
export class InterventionPlan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'goal', type: 'text', nullable: true })
  goal?: string;

  @Column({ name: 'objectives', type: 'text', nullable: true })
  objectives?: string;

  @Column({ name: 'activities', type: 'text', nullable: true })
  activities?: string;

  @Column({ name: 'timeline', type: 'varchar', length: 100, nullable: true })
  timeline?: string;

  @Column({ name: 'responsible', type: 'varchar', length: 200, nullable: true })
  responsible?: string;

  @Column({ name: 'evaluation_criteria', type: 'text', nullable: true })
  evaluationCriteria?: string;

  @Column({ name: 'case_id', type: 'int' })
  caseId!: number;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.interventionPlans)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
