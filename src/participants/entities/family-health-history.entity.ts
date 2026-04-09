import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Case } from './case.entity';
import { HealthHistoryType } from '../../common/enums';

@Entity('family_health_history')
@Index('idx_family_health_case_type', ['caseId', 'historyType'])
export class FamilyHealthHistory {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @Column({
    name: 'history_type',
    type: 'enum',
    enum: HealthHistoryType,
  })
  historyType!: HealthHistoryType;

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

  @ManyToOne(() => Case, (caseEntity) => caseEntity.familyHealthHistories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
