import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Case } from './case.entity';
import {
  EducationLevel,
  IncomeSource,
  IncomeLevel,
  HousingType,
} from '../../common/entities';

@Entity('bio_psychosocial_history')
export class BioPsychosocialHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'completed_grade',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  completedGrade?: string;

  @Column({ name: 'institution', type: 'varchar', length: 200, nullable: true })
  institution?: string;

  @Column({ name: 'profession', type: 'varchar', length: 150, nullable: true })
  profession?: string;

  @Column({ name: 'occupational_history', type: 'text', nullable: true })
  occupationalHistory?: string;

  @Column({ name: 'housing', type: 'text', nullable: true })
  housing?: string;

  @Column({ name: 'case_id', type: 'int', unique: true })
  caseId!: number;

  @Column({ name: 'education_level_id', type: 'int', nullable: true })
  educationLevelId?: number;

  @Column({ name: 'income_source_id', type: 'int', nullable: true })
  incomeSourceId?: number;

  @Column({ name: 'income_level_id', type: 'int', nullable: true })
  incomeLevelId?: number;

  @Column({ name: 'housing_type_id', type: 'int', nullable: true })
  housingTypeId?: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.bioPsychosocialHistory)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @ManyToOne(() => EducationLevel, { eager: true, nullable: true })
  @JoinColumn({ name: 'education_level_id' })
  educationLevel?: EducationLevel;

  @ManyToOne(() => IncomeSource, { eager: true, nullable: true })
  @JoinColumn({ name: 'income_source_id' })
  incomeSource?: IncomeSource;

  @ManyToOne(() => IncomeLevel, { eager: true, nullable: true })
  @JoinColumn({ name: 'income_level_id' })
  incomeLevel?: IncomeLevel;

  @ManyToOne(() => HousingType, { eager: true, nullable: true })
  @JoinColumn({ name: 'housing_type_id' })
  housingType?: HousingType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
