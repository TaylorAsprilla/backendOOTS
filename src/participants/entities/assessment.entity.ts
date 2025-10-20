import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('assessment')
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'consultation_reason',
    type: 'text',
    nullable: true,
  })
  consultationReason?: string;

  @Column({
    name: 'weighting',
    type: 'text',
    nullable: true,
  })
  weighting?: string;

  @Column({
    name: 'concurrent_factors',
    type: 'text',
    nullable: true,
  })
  concurrentFactors?: string;

  @Column({
    name: 'critical_factors',
    type: 'text',
    nullable: true,
  })
  criticalFactors?: string;

  @Column({
    name: 'problem_analysis',
    type: 'text',
    nullable: true,
  })
  problemAnalysis?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
