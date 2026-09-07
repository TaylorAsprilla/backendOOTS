import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Case } from '../../participants/entities/case.entity';
import { User } from '../../users/entities/user.entity';

@Entity('case_transfers')
@Index('IDX_case_transfers_case_id', ['caseId'])
export class CaseTransfer {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'from_user_id', type: 'int', unsigned: true, nullable: true })
  fromUserId?: number;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'from_user_id' })
  fromUser?: User;

  @Column({ name: 'to_user_id', type: 'int', unsigned: true })
  toUserId!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'to_user_id' })
  toUser!: User;

  @Column({ name: 'transferred_by_id', type: 'int', unsigned: true })
  transferredById!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'transferred_by_id' })
  transferredBy!: User;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
