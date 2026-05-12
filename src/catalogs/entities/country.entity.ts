import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
