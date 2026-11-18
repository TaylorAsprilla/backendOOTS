import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Case } from '../participants/entities/case.entity';
import { User } from '../users/entities/user.entity';
import { ReviewStatus, ReviewType } from './supervision.catalog';

/**
 * Revisión de supervisión (control de calidad de un expediente).
 * Una vez firmada es inmutable; no se elimina (historial completo).
 */
@Entity('supervision_reviews')
@Index('IDX_supervision_reviews_case', ['caseId'])
@Index('IDX_supervision_reviews_supervisee', ['superviseeId'])
export class SupervisionReview {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  type!: ReviewType;

  @Column({ name: 'case_id', type: 'int', unsigned: true, nullable: true })
  caseId?: number | null;

  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'case_id' })
  case?: Case | null;

  @Column({
    name: 'supervisee_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  superviseeId?: number | null;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'supervisee_id' })
  supervisee?: User | null;

  @Column({ name: 'reviewer_id', type: 'int', unsigned: true })
  reviewerId!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer!: User;

  /** Mes de la revisión del supervisado, formato YYYY-MM. */
  @Column({ name: 'period', type: 'varchar', length: 7, nullable: true })
  period?: string | null;

  /** "Cantidad de casos __ al mes de ____" (expediente del supervisado). */
  @Column({ name: 'cases_count', type: 'int', nullable: true })
  casesCount?: number | null;

  /** { [itemKey]: ItemStatus } según el catálogo del tipo de revisión. */
  @Column({ name: 'items', type: 'json' })
  items!: Record<string, string>;

  @Column({ name: 'recommendations', type: 'text', nullable: true })
  recommendations?: string | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 10,
    default: ReviewStatus.DRAFT,
  })
  status!: ReviewStatus;

  @Column({ name: 'signed_at', type: 'datetime', nullable: true })
  signedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
