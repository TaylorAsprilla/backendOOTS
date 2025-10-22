import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('family_relationships')
export class FamilyRelationship {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ name: 'code', type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ name: 'gender_specific', type: 'boolean', default: false })
  genderSpecific!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
