import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Exclude()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Exclude()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
