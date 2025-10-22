import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Participant } from './participant.entity';

@Entity('closing_notes')
export class ClosingNote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'closure_reason', type: 'text' })
  closureReason!: string;

  @Column({ name: 'achievements', type: 'text' })
  achievements!: string;

  @Column({ name: 'recommendations', type: 'text' })
  recommendations!: string;

  @Column({ name: 'observations', type: 'text' })
  observations!: string;

  @Column({ name: 'participant_id', type: 'int', unique: true })
  participantId!: number;

  @OneToOne(() => Participant, (participant) => participant.closingNote)
  @JoinColumn({ name: 'participant_id' })
  participant!: Participant;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
