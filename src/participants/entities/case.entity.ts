import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CaseStatus } from '../../common/enums';
import { Participant } from './participant.entity';
import { BioPsychosocialHistory } from './bio-psychosocial-history.entity';
import { PhysicalHealthHistory } from './physical-health-history.entity';
import { MentalHealthHistory } from './mental-health-history.entity';
import { ConsultationReason } from './consultation-reason.entity';
import { Assessment } from './assessment.entity';
import { Intervention } from './intervention.entity';
import { FollowUpPlan } from './follow-up-plan.entity';
import { InterventionPlan } from './intervention-plan.entity';
import { ProgressNote } from './progress-note.entity';
import { Referrals } from './referrals.entity';

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'case_number', type: 'varchar', length: 20, unique: true })
  caseNumber!: string;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status!: CaseStatus;

  @Column({ name: 'participant_id', type: 'int' })
  participantId!: number;

  @ManyToOne(() => Participant, (participant) => participant.cases)
  @JoinColumn({ name: 'participant_id' })
  participant!: Participant;

  // RELACIONES CLÍNICAS (antes estaban en Participant)
  @OneToOne(() => BioPsychosocialHistory, (history) => history.case, {
    cascade: true,
  })
  bioPsychosocialHistory!: BioPsychosocialHistory;

  @OneToOne(() => PhysicalHealthHistory, (history) => history.case, {
    cascade: true,
  })
  physicalHealthHistory!: PhysicalHealthHistory;

  @OneToOne(() => MentalHealthHistory, (history) => history.case, {
    cascade: true,
  })
  mentalHealthHistory!: MentalHealthHistory;

  @OneToOne(() => ConsultationReason, (reason) => reason.case, {
    cascade: true,
  })
  consultationReason!: ConsultationReason;

  @OneToOne(() => Assessment, (assessment) => assessment.case, {
    cascade: true,
  })
  assessment!: Assessment;

  @OneToOne(() => Intervention, (intervention) => intervention.case, {
    cascade: true,
  })
  intervention!: Intervention;

  @OneToOne(() => FollowUpPlan, (plan) => plan.case, {
    cascade: true,
  })
  followUpPlan!: FollowUpPlan;

  @OneToMany(() => InterventionPlan, (plan) => plan.case, {
    cascade: true,
  })
  interventionPlans!: InterventionPlan[];

  @OneToMany(() => ProgressNote, (note) => note.case, {
    cascade: true,
  })
  progressNotes!: ProgressNote[];

  @OneToOne(() => Referrals, (referrals) => referrals.case, {
    cascade: true,
  })
  referrals!: Referrals;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
