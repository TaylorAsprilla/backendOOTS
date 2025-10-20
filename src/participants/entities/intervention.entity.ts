import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('intervention')
export class Intervention {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'intervention',
    type: 'text',
    nullable: true,
  })
  intervention?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
