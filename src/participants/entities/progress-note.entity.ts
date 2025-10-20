import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApproachType, ProcessType } from '../../common/entities';
import { Participant } from './participant.entity';

@Entity('progress_notes')
export class ProgressNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({
    name: 'time',
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  time?: string;

  @Column({ name: 'approach_type_id', type: 'int' })
  approachTypeId: number;

  @Column({
    name: 'process_type_id',
    type: 'int',
  })
  processTypeId: number;

  @Column({ name: 'summary', type: 'text' })
  summary: string;

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

  @Column({ name: 'participant_id', type: 'int' })
  participantId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // RELACIONES
  @ManyToOne(() => Participant, (participant) => participant.progressNotes)
  @JoinColumn({ name: 'participant_id' })
  participant: Participant;

  @ManyToOne(() => ApproachType, { eager: true })
  @JoinColumn({ name: 'approach_type_id' })
  approachType: ApproachType;

  @ManyToOne(() => ProcessType, { eager: true })
  @JoinColumn({ name: 'process_type_id' })
  processType: ProcessType;
}
