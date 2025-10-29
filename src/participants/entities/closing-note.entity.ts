import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('closing_notes')
export class ClosingNote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'closing_date', type: 'date', nullable: true })
  closingDate?: Date;

  @Column({ name: 'reason', type: 'varchar', length: 100, nullable: true })
  reason?: string;

  @Column({ name: 'achievements', type: 'text', nullable: true })
  achievements?: string;

  @Column({ name: 'recommendations', type: 'text', nullable: true })
  recommendations?: string;

  @Column({ name: 'observations', type: 'text', nullable: true })
  observations?: string;

  @Column({ name: 'case_id', nullable: true })
  caseId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
