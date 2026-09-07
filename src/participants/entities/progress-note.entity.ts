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
import { ApproachType } from '../../catalogs/entities/approach-type.entity';
import { ProcessType } from '../../catalogs/entities/process-type.entity';

@Entity('progress_notes')
export class ProgressNote {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime?: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime?: string;

  @Column({ name: 'attended', type: 'boolean', default: true })
  attended!: boolean;

  @Column({ name: 'absence_reason', type: 'text', nullable: true })
  absenceReason?: string;

  @Column({
    name: 'approach_type_id',
    type: 'int',
    nullable: true,
  })
  approachTypeId?: number;

  @Column({
    name: 'process_type_id',
    type: 'int',
    nullable: true,
  })
  processTypeId?: number;

  @Column({ name: 'process', type: 'text', nullable: true })
  process?: string;

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

  @ManyToOne(() => ApproachType, (approachType) => approachType.progressNotes)
  @JoinColumn({ name: 'approach_type_id' })
  approachType?: ApproachType;

  @ManyToOne(() => ProcessType, (processType) => processType.progressNotes)
  @JoinColumn({ name: 'process_type_id' })
  processType?: ProcessType;
}
