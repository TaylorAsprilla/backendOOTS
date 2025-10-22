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

  @Column({ name: 'goal', type: 'text' })
  goal!: string;

  @Column({ name: 'objectives', type: 'text' })
  objectives!: string;

  @Column({ name: 'activities', type: 'text' })
  activities!: string;

  @Column({ name: 'timeframe', type: 'varchar', length: 100 })
  timeframe!: string;

  @Column({ name: 'responsible_person', type: 'varchar', length: 200 })
  responsiblePerson!: string;

  @Column({ name: 'evaluation_criteria', type: 'text' })
  evaluationCriteria!: string;

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
