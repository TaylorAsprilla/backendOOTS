import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('referrals')
export class Referrals {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
