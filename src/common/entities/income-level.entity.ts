import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('income_levels')
export class IncomeLevel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'code', type: 'varchar', length: 30, unique: true })
  code!: string;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex!: number;

  @Column({
    name: 'min_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  minAmount?: number;

  @Column({
    name: 'max_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  maxAmount?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
