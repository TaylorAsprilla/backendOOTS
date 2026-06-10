import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Case } from '../../participants/entities/case.entity';
import { Participant } from '../../participants/entities/participant.entity';
import { User } from '../../users/entities/user.entity';
import { CaseDiscussionStatus } from '../enums/case-discussion-status.enum';
import { CaseDiscussionFamilyMember } from './case-discussion-family-member.entity';

@Entity('case_discussions')
@Index('idx_case_discussions_case_id', ['caseId'])
@Index('idx_case_discussions_participant_id', ['participantId'])
@Index('idx_case_discussions_supervisor_id', ['supervisorId'])
@Index('idx_case_discussions_status', ['status'])
export class CaseDiscussion {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
    unsigned: true,
  })
  id!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @ManyToOne(() => Case, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'participant_id', type: 'int', unsigned: true })
  participantId!: number;

  @ManyToOne(() => Participant, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'participant_id' })
  participant!: Participant;

  @Column({ name: 'social_worker_id', type: 'int', unsigned: true })
  socialWorkerId!: number;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'social_worker_id' })
  socialWorker!: User;

  @Column({ name: 'supervisor_id', type: 'int', unsigned: true })
  supervisorId!: number;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor!: User;

  @Column({ name: 'discussion_date', type: 'date' })
  discussionDate!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CaseDiscussionStatus,
    default: CaseDiscussionStatus.BORRADOR,
  })
  status!: CaseDiscussionStatus;

  @Column({
    name: 'client_name_snapshot',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  clientNameSnapshot?: string;

  @Column({ name: 'client_age_snapshot', type: 'int', nullable: true })
  clientAgeSnapshot?: number;

  @Column({
    name: 'client_gender_snapshot',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  clientGenderSnapshot?: string;

  @Column({
    name: 'client_marital_status_snapshot',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  clientMaritalStatusSnapshot?: string;

  @Column({ name: 'presented_situations', type: 'longtext' })
  presentedSituations!: string;

  @Column({ name: 'affected_people', type: 'longtext', nullable: true })
  affectedPeople?: string;

  @Column({
    name: 'social_worker_recommendations',
    type: 'longtext',
    nullable: true,
  })
  socialWorkerRecommendations?: string;

  @Column({
    name: 'supervisor_recommendations',
    type: 'longtext',
    nullable: true,
  })
  supervisorRecommendations?: string;

  @Column({ name: 'finalized_at', type: 'datetime', nullable: true })
  finalizedAt?: Date;

  @Column({ name: 'finalized_by', type: 'int', unsigned: true, nullable: true })
  finalizedById?: number;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'finalized_by' })
  finalizedBy?: User;

  @Column({ name: 'annulled_at', type: 'datetime', nullable: true })
  annulledAt?: Date;

  @Column({ name: 'annulled_by', type: 'int', unsigned: true, nullable: true })
  annulledById?: number;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'annulled_by' })
  annulledBy?: User;

  @Column({ name: 'annulment_reason', type: 'text', nullable: true })
  annulmentReason?: string;

  @Column({ name: 'created_by', type: 'int', unsigned: true })
  createdById!: number;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
  updatedById?: number;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => CaseDiscussionFamilyMember, (familyMember) => familyMember.caseDiscussion, {
    cascade: true,
    eager: false,
  })
  familyMembers!: CaseDiscussionFamilyMember[];
}