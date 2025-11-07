import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('geolocations')
export class Geolocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.geolocations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ name: 'country_code', type: 'varchar', length: 10, nullable: true })
  countryCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({ name: 'region_name', type: 'varchar', length: 100, nullable: true })
  regionName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zip?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lon?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  isp?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  org?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  as?: string;

  @Column({ type: 'varchar', length: 50, default: 'login' })
  action: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
