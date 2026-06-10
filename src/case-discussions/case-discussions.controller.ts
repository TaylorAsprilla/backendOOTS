import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateCaseDiscussionDto } from './dto/create-case-discussion.dto';
import { UpdateCaseDiscussionDto } from './dto/update-case-discussion.dto';
import { FinalizeCaseDiscussionDto } from './dto/finalize-case-discussion.dto';
import { AnnulCaseDiscussionDto } from './dto/annul-case-discussion.dto';
import { QueryCaseDiscussionDto } from './dto/query-case-discussion.dto';
import { CaseDiscussionsService } from './case-discussions.service';

type Disposition = 'inline' | 'attachment';

function sendPdf(
  res: Response,
  buffer: Buffer,
  filename: string,
  disposition: Disposition,
) {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${disposition}; filename="${filename}"`,
    'Content-Length': buffer.length,
  });
  res.end(buffer);
}

@ApiTags('Discusiones de caso')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cases/:caseId/discussions')
export class CaseDiscussionsController {
  constructor(
    private readonly caseDiscussionsService: CaseDiscussionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear discusión del caso',
    description:
      'Crea una discusión asociada al caso y toma snapshot histórico del cliente y de la composición familiar.',
  })
  @ApiParam({ name: 'caseId', type: Number, example: 15 })
  @ApiBody({
    type: CreateCaseDiscussionDto,
    examples: {
      default: {
        value: {
          participantId: 12,
          supervisorId: 7,
          discussionDate: '2026-06-05',
          presentedSituations:
            'La participante presenta conflicto de pareja, ansiedad y deterioro de la red de apoyo.',
          affectedPeople: 'Participante, hija adolescente y madre.',
          socialWorkerRecommendations:
            'Coordinar referido psicológico y seguimiento quincenal.',
          supervisorRecommendations:
            'Reforzar plan de seguridad y contactar recursos comunitarios.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Discusión creada' })
  @ApiResponse({ status: 400, description: 'Participante no asociado al caso o supervisor inválido' })
  @ApiResponse({ status: 403, description: 'Usuario sin permisos' })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async create(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Body() dto: CreateCaseDiscussionDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.caseDiscussionsService.create(caseId, dto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Listar discusiones de un caso' })
  @ApiParam({ name: 'caseId', type: Number, example: 15 })
  @ApiQuery({ name: 'status', required: false, enum: ['BORRADOR', 'FINALIZADA', 'ANULADA'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Listado paginado de discusiones' })
  async findAll(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Query() query: QueryCaseDiscussionDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.caseDiscussionsService.findAll(caseId, query, currentUser);
  }

  @Get(':discussionId')
  @ApiOperation({ summary: 'Ver detalle de una discusión' })
  @ApiParam({ name: 'caseId', type: Number, example: 15 })
  @ApiParam({ name: 'discussionId', type: Number, example: 3 })
  @ApiResponse({ status: 200, description: 'Detalle de la discusión' })
  @ApiResponse({ status: 404, description: 'Discusión no encontrada' })
  async findOne(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @CurrentUser() currentUser: User,
  ) {
    return await this.caseDiscussionsService.findOne(
      caseId,
      discussionId,
      currentUser,
    );
  }

  @Patch(':discussionId')
  @ApiOperation({ summary: 'Actualizar discusión' })
  @ApiParam({ name: 'caseId', type: Number, example: 15 })
  @ApiParam({ name: 'discussionId', type: Number, example: 3 })
  @ApiBody({
    type: UpdateCaseDiscussionDto,
    examples: {
      update: {
        value: {
          affectedPeople: 'Participante, hija menor y madre.',
          supervisorRecommendations:
            'Mantener coordinación interagencial y ajustar el plan familiar.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Discusión actualizada' })
  @ApiResponse({ status: 403, description: 'Usuario sin permisos o discusión no editable' })
  async update(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() dto: UpdateCaseDiscussionDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.caseDiscussionsService.update(
      caseId,
      discussionId,
      dto,
      currentUser,
    );
  }

  @Patch(':discussionId/finalize')
  @ApiOperation({ summary: 'Finalizar discusión' })
  @ApiParam({ name: 'caseId', type: Number, example: 15 })
  @ApiParam({ name: 'discussionId', type: Number, example: 3 })
  @ApiBody({
    type: FinalizeCaseDiscussionDto,
    examples: {
      finalize: {
        value: {
          socialWorkerRecommendations:
            'Dar seguimiento mensual y activar apoyos familiares.',
          supervisorRecommendations:
            'Monitorear cumplimiento del plan de seguridad por 90 días.',
          affectedPeople: 'Participante, hija adolescente y abuela cuidadora.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Discusión finalizada' })
  @ApiResponse({ status: 400, description: 'Faltan recomendaciones obligatorias' })
  @ApiResponse({ status: 403, description: 'Discusión finalizada o anulada no editable' })
  async finalize(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() dto: FinalizeCaseDiscussionDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.caseDiscussionsService.finalize(
      caseId,
      discussionId,
      dto,
      currentUser,
    );
  }

  @Patch(':discussionId/annul')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Anular discusión' })
  @ApiParam({ name: 'caseId', type: Number, example: 15 })
  @ApiParam({ name: 'discussionId', type: Number, example: 3 })
  @ApiBody({
    type: AnnulCaseDiscussionDto,
    examples: {
      annul: {
        value: {
          reason: 'Se registró la discusión en el caso equivocado.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Discusión anulada' })
  async annul(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() dto: AnnulCaseDiscussionDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.caseDiscussionsService.annul(
      caseId,
      discussionId,
      dto,
      currentUser,
    );
  }

  @Get(':discussionId/pdf')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Descargar PDF de la discusión del caso',
    description:
      'Genera el PDF institucional. Si la discusión está en BORRADOR, el documento incluye una marca visible de borrador.',
  })
  @ApiParam({ name: 'caseId', type: Number, example: 15 })
  @ApiParam({ name: 'discussionId', type: Number, example: 3 })
  @ApiQuery({
    name: 'disposition',
    required: false,
    enum: ['inline', 'attachment'],
    description: 'Cómo entregar el PDF al cliente. Por defecto: attachment.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado',
    content: { 'application/pdf': {} },
  })
  async pdf(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Query('disposition') disposition: Disposition = 'attachment',
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.caseDiscussionsService.generatePdf(
      caseId,
      discussionId,
      currentUser,
    );

    sendPdf(res, buffer, filename, disposition);
  }
}