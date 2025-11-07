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

@Entity('physical_health_history')
export class PhysicalHealthHistory {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({
    name: 'current_conditions',
    type: 'text',
    nullable: true,
  })
  currentConditions?: string;

  @Column({
    name: 'medications',
    type: 'text',
    nullable: true,
  })
  medications?: string;

  @Column({
    name: 'family_history_father',
    type: 'text',
    nullable: true,
  })
  familyHistoryFather?: string;

  @Column({
    name: 'family_history_mother',
    type: 'text',
    nullable: true,
  })
  familyHistoryMother?: string;

  @Column({
    name: 'observations',
    type: 'text',
    nullable: true,
  })
  observations?: string;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId: number;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.physicalHealthHistories)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
