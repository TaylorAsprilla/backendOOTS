import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

interface CreateAuditLogDto {
  userId?: number;
  userEmail?: string;
  action: AuditAction;
  endpoint?: string;
  httpMethod?: string;
  requestBody?: Record<string, unknown>;
  responseStatus?: number;
  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
  description?: string;
}

interface QueryAuditLogsDto {
  userId?: number;
  action?: AuditAction;
  endpoint?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

const SENSITIVE_FIELDS = [
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'token',
  'secret',
  'authorization',
  'passwordResetToken',
];

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: CreateAuditLogDto): Promise<void> {
    try {
      const entry = this.auditLogRepository.create({
        ...data,
        requestBody: data.requestBody
          ? this.sanitize(data.requestBody)
          : undefined,
      });
      await this.auditLogRepository.save(entry);
    } catch (error) {
      // Audit must never break the main flow
      this.logger.error('Failed to write audit log', error);
    }
  }

  async findAll(query: QueryAuditLogsDto) {
    const {
      userId,
      action,
      endpoint,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = query;

    const where: Record<string, unknown> = {};

    if (userId) where['userId'] = userId;
    if (action) where['action'] = action;
    if (endpoint) where['endpoint'] = Like(`%${endpoint}%`);
    if (dateFrom && dateTo) {
      where['createdAt'] = Between(new Date(dateFrom), new Date(dateTo));
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private sanitize(body: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...body };
    for (const field of SENSITIVE_FIELDS) {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '***';
      }
    }
    return sanitized;
  }
}
