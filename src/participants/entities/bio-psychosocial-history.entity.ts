import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  EducationLevel,
  IncomeSource,
  IncomeLevel,
  HousingType,
} from '../../common/entities';

@Entity('bio_psychosocial_history')
export class BioPsychosocialHistory {
  @PrimaryGeneratedColumn()
  id: number;

  // RELACIONES CON CATÁLOGOS
  @ManyToOne(() => EducationLevel, { eager: true, nullable: true })
  @JoinColumn({ name: 'schooling_id' })
  schooling?: EducationLevel;

  @Column({
    name: 'completed_grade',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  completedGrade?: string;

  @Column({
    name: 'institution',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  institution?: string;

  @Column({
    name: 'profession',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  profession?: string;

  @ManyToOne(() => IncomeSource, { eager: true, nullable: true })
  @JoinColumn({ name: 'income_source_id' })
  incomeSource?: IncomeSource;

  @ManyToOne(() => IncomeLevel, { eager: true, nullable: true })
  @JoinColumn({ name: 'income_level_id' })
  incomeLevel?: IncomeLevel;

  @Column({
    name: 'occupational_history',
    type: 'text',
    nullable: true,
  })
  occupationalHistory?: string;

  @ManyToOne(() => HousingType, { eager: true })
  @JoinColumn({ name: 'housing_type_id' })
  housingType: HousingType;

  @Column({
    name: 'housing',
    type: 'text',
    nullable: true,
  })
  housing?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
