import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from '../audit.service';
import { AuditAction } from '../entities/audit-log.entity';

const METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: AuditAction.CREATE,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
  GET: AuditAction.READ,
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id: number; email: string } }>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, body } = request;

    // Only audit write operations
    if (method === 'GET') {
      return next.handle();
    }

    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.socket?.remoteAddress ||
      request.ip ||
      '0.0.0.0';

    const start = Date.now();
    const action = METHOD_TO_ACTION[method] ?? AuditAction.CREATE;

    return next.handle().pipe(
      tap({
        next: () => {
          void this.auditService.log({
            userId: request.user?.id,
            userEmail: request.user?.email,
            action,
            endpoint: url,
            httpMethod: method,
            requestBody: body as Record<string, unknown>,
            responseStatus: response.statusCode,
            ipAddress,
            userAgent: request.get('user-agent'),
            durationMs: Date.now() - start,
          });
        },
        error: (err: { status?: number }) => {
          void this.auditService.log({
            userId: request.user?.id,
            userEmail: request.user?.email,
            action,
            endpoint: url,
            httpMethod: method,
            requestBody: body as Record<string, unknown>,
            responseStatus: err?.status ?? 500,
            ipAddress,
            userAgent: request.get('user-agent'),
            durationMs: Date.now() - start,
          });
        },
      }),
    );
  }
}
