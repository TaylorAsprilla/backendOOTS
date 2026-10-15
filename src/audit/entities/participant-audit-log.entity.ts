import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ParticipantAuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('participant_audit_logs')
@Index('IDX_participant_audit_participant_created', [
  'participantId',
  'createdAt',
])
@Index('IDX_participant_audit_user_created', ['userId', 'createdAt'])
export class ParticipantAuditLog {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'participant_id', type: 'int', unsigned: true })
  participantId!: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId!: number;

  @Column({ name: 'user_email', type: 'varchar', length: 100 })
  userEmail!: string;

  @Column({ name: 'user_name', type: 'varchar', length: 255 })
  userName!: string;

  @Column({ type: 'enum', enum: ParticipantAuditAction })
  action!: ParticipantAuditAction;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;
}
