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
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'date', type: 'date' })
  date!: Date;

  @Column({
    name: 'time',
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  time?: string;

  @Column({ name: 'summary', type: 'text' })
  summary!: string;

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

  @Column({ name: 'case_id', type: 'int' })
  caseId!: number;

  @Column({ name: 'approach_type_id', type: 'int' })
  approachTypeId!: number;

  @Column({ name: 'process_type_id', type: 'int' })
  processTypeId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.progressNotes)
  @JoinColumn({ name: 'case_id' })
  case!: Case;
}
