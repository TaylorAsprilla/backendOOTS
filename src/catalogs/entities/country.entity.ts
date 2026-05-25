import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({
    name: 'iso',
    type: 'varchar',
    length: 2,
    unique: true,
    nullable: true,
  })
  iso?: string;

  @Column({
    name: 'locale',
    type: 'varchar',
    length: 10,
    unique: true,
    nullable: true,
  })
  locale?: string;

  @Column({
    name: 'currency',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  currency?: string;

  @Column({
    name: 'phone_prefix',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  phonePrefix?: string;

  @Column({
    name: 'flag_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  flagUrl?: string;

  @Column({
    name: 'default_language',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  defaultLanguage?: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Exclude()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
