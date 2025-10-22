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

@Entity('follow_up_plans')
export class FollowUpPlan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'plan', type: 'text' })
  plan!: string;

  @Column({ name: 'case_id', type: 'int', unique: true })
  caseId!: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.followUpPlan)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
