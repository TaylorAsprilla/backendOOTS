import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LoginRisk {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('login_history')
@Index(['userId', 'createdAt'])
export class LoginHistory {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ name: 'country_code', type: 'varchar', length: 10, nullable: true })
  countryCode?: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ name: 'region', type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({
    name: 'lat',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  lat?: number;

  @Column({
    name: 'lon',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  lon?: number;

  @Column({ name: 'isp', type: 'varchar', length: 255, nullable: true })
  isp?: string;

  @Column({ name: 'timezone', type: 'varchar', length: 100, nullable: true })
  timezone?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType?: string;

  @Column({ name: 'browser', type: 'varchar', length: 100, nullable: true })
  browser?: string;

  @Column({ name: 'os', type: 'varchar', length: 100, nullable: true })
  os?: string;

  @Column({ name: 'is_new_location', type: 'boolean', default: false })
  isNewLocation: boolean;

  @Column({
    name: 'risk',
    type: 'enum',
    enum: LoginRisk,
    default: LoginRisk.LOW,
  })
  risk: LoginRisk;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
