import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('closing_note')
export class ClosingNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'closure_reason', type: 'text' })
  closureReason: string;

  @Column({ name: 'achievements', type: 'text' })
  achievements: string;

  @Column({ name: 'recommendations', type: 'text' })
  recommendations: string;

  @Column({ name: 'observations', type: 'text' })
  observations: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
