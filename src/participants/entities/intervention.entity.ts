import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Case } from './case.entity';

@Entity('interventions')
export class Intervention {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'intervention', type: 'text' })
  intervention!: string;

  @Column({ name: 'case_id', type: 'int', unique: true })
  caseId!: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.intervention)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
