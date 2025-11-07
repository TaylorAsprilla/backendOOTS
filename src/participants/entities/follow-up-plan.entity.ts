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

@Entity('follow_up_plan')
export class FollowUpPlan {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.followUpPlans)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'process_completed', type: 'boolean', default: false })
  processCompleted!: boolean;

  @Column({ name: 'coordinated_service', type: 'boolean', default: false })
  coordinatedService!: boolean;

  @Column({ name: 'referred', type: 'boolean', default: false })
  referred!: boolean;

  @Column({ name: 'referral_details', type: 'text', nullable: true })
  referralDetails?: string;

  @Column({ name: 'orientation_appointment', type: 'boolean', default: false })
  orientationAppointment!: boolean;

  @Column({ name: 'appointment_date', type: 'date', nullable: true })
  appointmentDate?: Date;

  @Column({ name: 'appointment_time', type: 'time', nullable: true })
  appointmentTime?: string;

  @Column({ name: 'other_details', type: 'text', nullable: true })
  otherDetails?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
