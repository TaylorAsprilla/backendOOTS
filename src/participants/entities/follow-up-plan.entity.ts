import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FollowUpPlanType } from '../../common/entities';

@Entity('follow_up_plan')
export class FollowUpPlan {
  @PrimaryGeneratedColumn()
  id: number;

  // RELACIÓN CON CATÁLOGO
  @ManyToOne(() => FollowUpPlanType, { eager: true })
  @JoinColumn({ name: 'plan_type_id' })
  planType: FollowUpPlanType;

  @Column({
    name: 'details',
    type: 'text',
    nullable: true,
  })
  details?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
