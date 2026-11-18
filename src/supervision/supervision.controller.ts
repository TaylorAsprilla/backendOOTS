import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SKIP_ROLE_COUNTRY_GUARD } from '../common/guards/role-country.guard';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { renderPdfToBuffer } from '../documents/pdf/pdf-shared';
import { buildSupervisionReviewDoc } from '../documents/pdf/templates/supervision-review.template';
import { SupervisionService } from './supervision.service';
import { ReviewType } from './supervision.catalog';

export class CreateSupervisionReviewDto {
  @IsEnum(ReviewType)
  type!: ReviewType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  caseId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  superviseeId?: number;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  casesCount?: number;

  @IsOptional()
  @IsObject()
  items?: Record<string, string>;

  @IsOptional()
  @IsString()
  recommendations?: string;
}

export class UpdateSupervisionReviewDto {
  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  casesCount?: number;

  @IsOptional()
  @IsObject()
  items?: Record<string, string>;

  @IsOptional()
  @IsString()
  recommendations?: string;
}

export class ListSupervisionReviewsQuery {
  @IsOptional()
  @IsEnum(ReviewType)
  type?: ReviewType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  caseId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  superviseeId?: number;
}

/**
 * Revisiones de supervisión (listas de control de calidad de expedientes).
 * SUPERVISOR y ADMIN las elaboran y firman; ADMIN_COUNTRY solo consulta las de su país.
 */
@ApiTags('Supervisión')
@ApiBearerAuth('access-token')
@Controller('supervision-reviews')
@SetMetadata(SKIP_ROLE_COUNTRY_GUARD, true)
@UseGuards(RolesGuard)
export class SupervisionController {
  constructor(private readonly service: SupervisionService) {}

  @Get('catalog')
  @Roles(Role.SUPERVISOR, Role.ADMIN, Role.ADMIN_COUNTRY)
  @ApiOperation({ summary: 'Ítems de cada lista de revisión' })
  catalog() {
    return {
      [ReviewType.CASE_FILE]: this.service.catalog(ReviewType.CASE_FILE),
      [ReviewType.SUPERVISEE_FILE]: this.service.catalog(
        ReviewType.SUPERVISEE_FILE,
      ),
    };
  }

  @Get('supervisees')
  @Roles(Role.SUPERVISOR, Role.ADMIN)
  @ApiOperation({ summary: 'Profesionales que se pueden supervisar' })
  async supervisees(@CurrentUser() user: User) {
    const rows = await this.service.listSupervisees(user);
    return rows.map((row) => ({
      id: row.id,
      firstName: row.firstName,
      firstLastName: row.firstLastName,
      roleName: row.role?.name,
    }));
  }

  @Get('cases/search')
  @Roles(Role.SUPERVISOR, Role.ADMIN)
  @ApiOperation({
    summary: 'Buscar casos por número de expediente, nombre o documento',
  })
  async searchCases(@Query('q') q: string, @CurrentUser() user: User) {
    return await this.service.searchCases(user, q ?? '');
  }

  @Get('suggestions/:caseId')
  @Roles(Role.SUPERVISOR, Role.ADMIN)
  @ApiOperation({
    summary: 'Ítems del expediente que el sistema ya encuentra registrados',
  })
  async suggestions(
    @Param('caseId', ParseIntPipe) caseId: number,
    @CurrentUser() user: User,
  ) {
    return await this.service.suggestions(caseId, user);
  }

  @Get()
  @Roles(Role.SUPERVISOR, Role.ADMIN, Role.ADMIN_COUNTRY)
  @ApiOperation({ summary: 'Listar revisiones de supervisión' })
  async list(
    @Query() query: ListSupervisionReviewsQuery,
    @CurrentUser() user: User,
  ) {
    return await this.service.list(user, query);
  }

  @Post()
  @Roles(Role.SUPERVISOR, Role.ADMIN)
  @ApiOperation({ summary: 'Crear una revisión (borrador)' })
  async create(
    @Body() dto: CreateSupervisionReviewDto,
    @CurrentUser() user: User,
  ) {
    return await this.service.create(dto, user);
  }

  @Get(':id')
  @Roles(Role.SUPERVISOR, Role.ADMIN, Role.ADMIN_COUNTRY)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.service.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.SUPERVISOR, Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar una revisión en borrador' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupervisionReviewDto,
    @CurrentUser() user: User,
  ) {
    return await this.service.update(id, dto, user);
  }

  @Post(':id/sign')
  @Roles(Role.SUPERVISOR, Role.ADMIN)
  @ApiOperation({
    summary: 'Firmar la revisión (queda inmutable)',
    description: 'Requiere que todos los ítems tengan estado.',
  })
  async sign(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return await this.service.sign(id, user);
  }

  @Get(':id/pdf')
  @Roles(Role.SUPERVISOR, Role.ADMIN, Role.ADMIN_COUNTRY)
  @ApiOperation({ summary: 'Descargar la revisión en PDF' })
  async pdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    const review = await this.service.findOne(id, user);
    let buffer: Buffer;
    try {
      buffer = await renderPdfToBuffer(buildSupervisionReviewDoc(review));
    } catch {
      throw new InternalServerErrorException('No fue posible generar el PDF.');
    }
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="revision-supervision-${review.id}.pdf"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(buffer);
  }
}
