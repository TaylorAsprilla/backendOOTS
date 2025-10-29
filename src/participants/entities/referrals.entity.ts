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

@Entity('referrals')
export class Referrals {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'referrals',
    type: 'text',
    nullable: true,
  })
  referrals?: string;

  @Column({ name: 'case_id' })
  caseId: number;

  @OneToOne(() => Case, (caseEntity) => caseEntity.referrals)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
