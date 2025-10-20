import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('consultation_reason')
export class ConsultationReason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'reason',
    type: 'text',
    nullable: true,
  })
  reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
