import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from './case.entity';

@Entity('progress_notes')
export class ProgressNote {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate!: Date;

  @Column({
    name: 'session_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  sessionType?: string;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary?: string;

  @Column({
    name: 'observations',
    type: 'text',
    nullable: true,
  })
  observations?: string;

  @Column({
    name: 'agreements',
    type: 'text',
    nullable: true,
  })
  agreements?: string;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.progressNotes)
  @JoinColumn({ name: 'case_id' })
  case!: Case;
}
