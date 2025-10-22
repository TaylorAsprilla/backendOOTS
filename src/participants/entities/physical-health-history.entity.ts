import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from './case.entity';

@Entity('physical_health_history')
export class PhysicalHealthHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'physical_conditions',
    type: 'text',
    nullable: true,
  })
  physicalConditions?: string;

  @Column({ type: 'text', nullable: true })
  allergies?: string;

  @Column({ type: 'text', nullable: true })
  surgicalHistory?: string;

  @Column({ type: 'text', nullable: true })
  hospitalizations?: string;

  @Column({
    name: 'receiving_treatment',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  receivingTreatment?: boolean;

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

  @Column({ name: 'case_id' })
  caseId: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.physicalHealthHistory)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
