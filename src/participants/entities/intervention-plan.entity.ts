import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Participant } from './participant.entity';

@Entity('intervention_plans')
export class InterventionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'goal', type: 'varchar', length: 500 })
  goal: string;

  @Column({ name: 'objectives', type: 'varchar', length: 500 })
  objectives: string;

  @Column({ name: 'activities', type: 'text' })
  activities: string;

  @Column({
    name: 'timeframe',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  timeframe?: string;

  @Column({
    name: 'responsible_person',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  responsiblePerson?: string;

  @Column({
    name: 'evaluation_criteria',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  evaluationCriteria?: string;

  @Column({ name: 'participant_id', type: 'int' })
  participantId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // RELACIONES
  @ManyToOne(() => Participant, (participant) => participant.interventionPlans)
  @JoinColumn({ name: 'participant_id' })
  participant: Participant;
}
