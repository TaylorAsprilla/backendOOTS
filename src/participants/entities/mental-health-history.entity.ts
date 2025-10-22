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

@Entity('mental_health_history')
export class MentalHealthHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'mental_conditions',
    type: 'text',
    nullable: true,
  })
  mentalConditions?: string;

  @Column({
    name: 'receiving_mental_treatment',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  receivingMentalTreatment?: boolean;

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

  @Column({ name: 'case_id' })
  caseId: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.mentalHealthHistory)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
