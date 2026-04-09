import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
  @Index()
  userId?: number;

  @Column({
    name: 'user_email',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  userEmail?: string;

  @Column({ name: 'action', type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ name: 'endpoint', type: 'varchar', length: 255, nullable: true })
  endpoint?: string;

  @Column({ name: 'http_method', type: 'varchar', length: 10, nullable: true })
  httpMethod?: string;

  @Column({ name: 'request_body', type: 'json', nullable: true })
  requestBody?: Record<string, unknown>;

  @Column({
    name: 'response_status',
    type: 'smallint',
    unsigned: true,
    nullable: true,
  })
  responseStatus?: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({
    name: 'duration_ms',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  durationMs?: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
