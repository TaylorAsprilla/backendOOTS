import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleCountryGuard } from '../common/guards/role-country.guard';
import { User } from '../users/entities/user.entity';
import { AttachmentCategory, AttachmentContext } from './case-attachment.enums';
import { CaseAttachmentsService } from './case-attachments.service';

export class UploadAttachmentDto {
  @Type(() => Number)
  @IsInt()
  caseId!: number;

  @IsEnum(AttachmentContext)
  context!: AttachmentContext;

  @IsEnum(AttachmentCategory)
  category!: AttachmentCategory;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  signedAt?: string;
}

export class ListAttachmentsQuery {
  @Type(() => Number)
  @IsInt()
  caseId!: number;

  @IsOptional()
  @IsEnum(AttachmentContext)
  context?: AttachmentContext;
}

/**
 * Tope duro de Multer (memoria). El límite configurable real
 * (DOCUMENTS_MAX_FILE_MB, 15 MB por defecto) lo aplica el servicio.
 */
const MULTER_HARD_LIMIT_BYTES = 50 * 1024 * 1024;

/**
 * Documentos de casos y consultas breves (una consulta breve es un caso con
 * tipo BRIEF_CONSULTATION). RoleCountryGuard limita el acceso a ADMIN,
 * ADMIN_COUNTRY, TRABAJO_SOCIAL y USER; el servicio aplica país, asignación
 * y la inmutabilidad de los expedientes cerrados.
 */
@ApiTags('Documentos de casos')
@Controller('case-attachments')
@UseGuards(JwtAuthGuard, RoleCountryGuard)
@ApiBearerAuth()
export class CaseAttachmentsController {
  constructor(private readonly service: CaseAttachmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Adjuntar un documento (PDF o Word) a un caso' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MULTER_HARD_LIMIT_BYTES, files: 1 },
    }),
  )
  upload(
    @Body() dto: UploadAttachmentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: User,
  ) {
    return this.service.upload(dto, file, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar documentos de un caso' })
  list(@Query() query: ListAttachmentsQuery, @CurrentUser() user: User) {
    return this.service.list(query.caseId, user, query.context);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Obtener una URL de descarga de corta duración',
    description:
      'Valida el acceso al expediente y devuelve una URL prefirmada que expira en segundos. Registra la descarga.',
  })
  download(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.service.getDownloadUrl(id, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar (baja lógica) un documento',
    description: 'Rechazado si el expediente está cerrado.',
  })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.service.remove(id, user);
  }
}
