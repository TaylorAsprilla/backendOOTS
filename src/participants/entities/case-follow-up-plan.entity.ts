import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Case } from './case.entity';
import { FollowUpPlanCatalog } from '../../follow-up-plan-catalog/entities/follow-up-plan-catalog.entity';

@Entity('case_follow_up_plans')
export class CaseFollowUpPlan {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @Column({ name: 'follow_up_plan_id', type: 'int', unsigned: true })
  followUpPlanId!: number;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.caseFollowUpPlans)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @ManyToOne(() => FollowUpPlanCatalog)
  @JoinColumn({ name: 'follow_up_plan_id' })
  followUpPlan!: FollowUpPlanCatalog;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
