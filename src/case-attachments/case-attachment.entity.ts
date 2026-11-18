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
import {
  AttachmentAction,
  AttachmentCategory,
  AttachmentContext,
  AttachmentStatus,
} from './case-attachment.enums';

/**
 * Metadatos de un documento adjunto a un caso o consulta breve (una consulta
 * breve es un Case con caseType BRIEF_CONSULTATION). El binario vive en S3.
 */
@Entity('case_attachments')
@Index('IDX_case_attachments_case', ['caseId', 'context', 'status'])
export class CaseAttachment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @ManyToOne(() => Case, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'context', type: 'varchar', length: 30 })
  context!: AttachmentContext;

  @Column({ name: 'category', type: 'varchar', length: 40 })
  category!: AttachmentCategory;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName!: string;

  /** Clave del objeto en S3 (no predecible; nunca el nombre original). */
  @Column({ name: 'storage_key', type: 'varchar', length: 255, unique: true })
  storageKey!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 120 })
  mimeType!: string;

  @Column({ name: 'extension', type: 'varchar', length: 10 })
  extension!: string;

  @Column({ name: 'size', type: 'int', unsigned: true })
  size!: number;

  @Column({ name: 'sha256', type: 'char', length: 64 })
  sha256!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'signed_at', type: 'date', nullable: true })
  signedAt?: string | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 10,
    default: AttachmentStatus.ACTIVE,
  })
  status!: AttachmentStatus;

  @Column({ name: 'uploaded_by_id', type: 'int', unsigned: true })
  uploadedById!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy!: User;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;

  @Column({
    name: 'deleted_by_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  deletedById?: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/** Bitácora de carga, descarga y eliminación de documentos. */
@Entity('case_attachment_events')
@Index('IDX_case_attachment_events_attachment', ['attachmentId'])
export class CaseAttachmentEvent {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'attachment_id', type: 'int', unsigned: true })
  attachmentId!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId!: number;

  @Column({ name: 'action', type: 'varchar', length: 10 })
  action!: AttachmentAction;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
