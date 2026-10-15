import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditAction } from './entities/audit-log.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Auditoría')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('participants/:participantId')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COORDINADOR)
  @ApiOperation({
    summary: 'Consultar auditoría de un participante',
    description:
      'Retorna quién creó, actualizó o eliminó al participante y la fecha y hora de cada operación, incluso después del borrado lógico.',
  })
  @ApiParam({ name: 'participantId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findParticipantHistory(
    @Param('participantId', ParseIntPipe) participantId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    if (participantId < 1 || page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException(
        'participantId y page deben ser positivos; limit debe estar entre 1 y 100',
      );
    }
    return this.auditService.findParticipantHistory(participantId, page, limit);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.COORDINADOR)
  @ApiOperation({
    summary: 'Consultar log de auditoría',
    description:
      'Retorna el historial de acciones registradas. Requiere rol ADMIN, SUPERVISOR o COORDINADOR.',
  })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction })
  @ApiQuery({ name: 'endpoint', required: false, type: String })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    example: '2026-12-31',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Logs de auditoría' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('endpoint') endpoint?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.auditService.findAll({
      userId: userId ? Number(userId) : undefined,
      action,
      endpoint,
      dateFrom,
      dateTo,
      page,
      limit,
    });
  }
}
