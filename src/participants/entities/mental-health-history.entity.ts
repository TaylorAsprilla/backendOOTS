import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TreatmentStatus } from '../../common/entities';

@Entity('mental_health_history')
export class MentalHealthHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'mental_conditions',
    type: 'text',
    nullable: true,
  })
  mentalConditions?: string;

  @ManyToOne(() => TreatmentStatus, { eager: true, nullable: true })
  @JoinColumn({ name: 'receiving_mental_treatment_id' })
  receivingMentalTreatment?: TreatmentStatus;

  @Column({
    name: 'mental_treatment_details',
    type: 'text',
    nullable: true,
  })
  mentalTreatmentDetails?: string;

  @Column({
    name: 'paternal_mental_history',
    type: 'text',
    nullable: true,
  })
  paternalMentalHistory?: string;

  @Column({
    name: 'maternal_mental_history',
    type: 'text',
    nullable: true,
  })
  maternalMentalHistory?: string;

  @Column({
    name: 'mental_health_observations',
    type: 'text',
    nullable: true,
  })
  mentalHealthObservations?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
