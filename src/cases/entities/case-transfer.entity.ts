import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Case } from '../../participants/entities/case.entity';
import { User } from '../../users/entities/user.entity';

export enum TransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('case_transfers')
@Index('IDX_case_transfers_case_id', ['caseId'])
export class CaseTransfer {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'from_user_id', type: 'int', unsigned: true, nullable: true })
  fromUserId?: number;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'from_user_id' })
  fromUser?: User;

  @Column({ name: 'to_user_id', type: 'int', unsigned: true })
  toUserId!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'to_user_id' })
  toUser!: User;

  @Column({ name: 'transferred_by_id', type: 'int', unsigned: true })
  transferredById!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'transferred_by_id' })
  transferredBy!: User;

  /** Motivo de la transferencia (campo del Informe de transferencia). */
  @Column({ name: 'reason', type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'work_summary', type: 'text', nullable: true })
  workSummary?: string;

  /** Ponderación del caso. */
  @Column({ name: 'assessment', type: 'text', nullable: true })
  assessment?: string;

  @Column({ name: 'achievements', type: 'text', nullable: true })
  achievements?: string;

  @Column({ name: 'recommendations', type: 'text', nullable: true })
  recommendations?: string;

  /**
   * PENDING: informe enviado, el caso sigue con el profesional actual.
   * APPROVED: aprobado, el caso fue reasignado. REJECTED: no se movió el caso.
   * Los registros anteriores al informe quedan APPROVED (ya estaban ejecutados).
   */
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: TransferStatus.APPROVED,
  })
  status!: TransferStatus;

  @Column({
    name: 'reviewed_by_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  reviewedById?: number | null;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: User | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt?: Date | null;

  /** Observación de quien aprueba o rechaza (obligatoria al rechazar). */
  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
