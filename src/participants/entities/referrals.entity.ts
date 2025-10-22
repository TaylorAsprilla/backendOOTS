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

  @Column({ type: 'text', nullable: true })
  externalReferrals?: string;

  @Column({ type: 'text', nullable: true })
  internalReferrals?: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({ type: 'text', nullable: true })
  reasonForReferral?: string;

  @Column({ type: 'text', nullable: true })
  urgencyLevel?: string;

  @Column({ type: 'text', nullable: true })
  followUpRequired?: string;

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
