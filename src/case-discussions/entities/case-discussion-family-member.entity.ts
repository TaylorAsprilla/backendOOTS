import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CaseDiscussion } from './case-discussion.entity';

@Entity('case_discussion_family_members')
@Index('idx_case_discussion_family_discussion_id', ['caseDiscussionId'])
export class CaseDiscussionFamilyMember {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
    unsigned: true,
  })
  id!: number;

  @Column({
    name: 'case_discussion_id',
    type: 'bigint',
    unsigned: true,
  })
  caseDiscussionId!: number;

  @ManyToOne(() => CaseDiscussion, (discussion) => discussion.familyMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'case_discussion_id' })
  caseDiscussion!: CaseDiscussion;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'age', type: 'int', nullable: true })
  age?: number;

  @Column({ name: 'relationship', type: 'varchar', length: 100 })
  relationship!: string;

  @Column({ name: 'occupation', type: 'varchar', length: 255, nullable: true })
  occupation?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}