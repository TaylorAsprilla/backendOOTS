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

@Entity('physical_health_history')
export class PhysicalHealthHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'physical_conditions',
    type: 'text',
    nullable: true,
  })
  physicalConditions?: string;

  @ManyToOne(() => TreatmentStatus, { eager: true, nullable: true })
  @JoinColumn({ name: 'receiving_treatment_id' })
  receivingTreatment?: TreatmentStatus;

  @Column({
    name: 'treatment_details',
    type: 'text',
    nullable: true,
  })
  treatmentDetails?: string;

  @Column({
    name: 'paternal_family_history',
    type: 'text',
    nullable: true,
  })
  paternalFamilyHistory?: string;

  @Column({
    name: 'maternal_family_history',
    type: 'text',
    nullable: true,
  })
  maternalFamilyHistory?: string;

  @Column({
    name: 'physical_health_observations',
    type: 'text',
    nullable: true,
  })
  physicalHealthObservations?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
