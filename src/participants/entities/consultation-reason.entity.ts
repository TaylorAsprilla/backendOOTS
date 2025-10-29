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

@Entity('consultation_reasons')
export class ConsultationReason {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'reason', type: 'text' })
  reason!: string;

  @Column({ name: 'case_id', type: 'int', unique: true })
  caseId!: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.consultationReason)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
