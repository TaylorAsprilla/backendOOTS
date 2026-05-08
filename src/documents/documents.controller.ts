import {
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

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

@ApiTags('Documentos (PDF)')
@ApiBearerAuth()
@Controller('cases/:caseId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ────────────────────────────────────────────────────────────────────────────
  // 1. Culminación del proceso de ayuda
  // ────────────────────────────────────────────────────────────────────────────
  @Get('help-process-completion/pdf')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'PDF de culminación del proceso de ayuda',
    description:
      'Genera el PDF que documenta la culminación del proceso de ayuda asociado al caso.',
  })
  @ApiParam({ name: 'caseId', type: Number, example: 1 })
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
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  @ApiResponse({
    status: 422,
    description: 'No hay datos suficientes para generar el documento',
  })
  async helpProcessCompletion(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Query('disposition') disposition: Disposition = 'attachment',
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.documentsService.generateHelpProcessCompletion(
        caseId,
        currentUser,
      );
    sendPdf(res, buffer, filename, disposition);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 2. Plan de intervención
  // ────────────────────────────────────────────────────────────────────────────
  @Get('intervention-plan/pdf')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'PDF del plan de intervención',
    description:
      'Genera el PDF con la información principal del plan de intervención del caso.',
  })
  @ApiParam({ name: 'caseId', type: Number, example: 1 })
  @ApiQuery({
    name: 'disposition',
    required: false,
    enum: ['inline', 'attachment'],
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  @ApiResponse({
    status: 422,
    description: 'El caso no tiene plan de intervención registrado',
  })
  async interventionPlan(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Query('disposition') disposition: Disposition = 'attachment',
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.documentsService.generateInterventionPlan(caseId, currentUser);
    sendPdf(res, buffer, filename, disposition);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. Nota de progreso individual
  // ────────────────────────────────────────────────────────────────────────────
  @Get('progress-notes/:progressNoteId/pdf')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'PDF de una nota de progreso',
    description:
      'Genera un PDF independiente para una nota de progreso específica del caso.',
  })
  @ApiParam({ name: 'caseId', type: Number, example: 1 })
  @ApiParam({ name: 'progressNoteId', type: Number, example: 5 })
  @ApiQuery({
    name: 'disposition',
    required: false,
    enum: ['inline', 'attachment'],
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({
    status: 404,
    description: 'Caso o nota de progreso no encontrada',
  })
  async progressNote(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Param('progressNoteId', ParseIntPipe) progressNoteId: number,
    @Query('disposition') disposition: Disposition = 'attachment',
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.documentsService.generateProgressNote(
        caseId,
        progressNoteId,
        currentUser,
      );
    sendPdf(res, buffer, filename, disposition);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. Nota de cierre
  // ────────────────────────────────────────────────────────────────────────────
  @Get('closing-note/pdf')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'PDF de la nota de cierre',
    description:
      'Genera el PDF con el resumen de cierre, conclusiones, recomendaciones y datos generales del caso.',
  })
  @ApiParam({ name: 'caseId', type: Number, example: 1 })
  @ApiQuery({
    name: 'disposition',
    required: false,
    enum: ['inline', 'attachment'],
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({
    status: 404,
    description: 'Caso o nota de cierre no encontrada',
  })
  async closingNote(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Query('disposition') disposition: Disposition = 'attachment',
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.documentsService.generateClosingNote(caseId, currentUser);
    sendPdf(res, buffer, filename, disposition);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 5. Impresión completa del caso
  // ────────────────────────────────────────────────────────────────────────────
  @Get('full-case/pdf')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'PDF consolidado del caso completo',
    description:
      'Genera un PDF consolidado con todos los datos del caso: participante, plan de intervención, notas de progreso (orden cronológico), nota de cierre y trazabilidad relevante.',
  })
  @ApiParam({ name: 'caseId', type: Number, example: 1 })
  @ApiQuery({
    name: 'disposition',
    required: false,
    enum: ['inline', 'attachment'],
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async fullCase(
    @Param('caseId', ParseIntPipe) caseId: number,
    @Query('disposition') disposition: Disposition = 'attachment',
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.documentsService.generateFullCase(
      caseId,
      currentUser,
    );
    sendPdf(res, buffer, filename, disposition);
  }
}
