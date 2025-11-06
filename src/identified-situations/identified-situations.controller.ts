import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IdentifiedSituationsService } from './identified-situations.service';
import { CreateIdentifiedSituationDto } from './dto/create-identified-situation.dto';
import { UpdateIdentifiedSituationDto } from './dto/update-identified-situation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Situaciones Identificadas')
@Controller('identified-situations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IdentifiedSituationsController {
  constructor(
    private readonly identifiedSituationsService: IdentifiedSituationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva situación identificada' })
  @ApiResponse({
    status: 201,
    description: 'Situación identificada creada exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una situación con este nombre',
  })
  async create(@Body() createDto: CreateIdentifiedSituationDto) {
    return await this.identifiedSituationsService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las situaciones identificadas activas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de situaciones identificadas activas',
  })
  async findAll() {
    return await this.identifiedSituationsService.findAll();
  }

  @Get('all/with-inactive')
  @ApiOperation({
    summary: 'Obtener todas las situaciones identificadas incluyendo inactivas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de situaciones identificadas',
  })
  async findAllWithInactive() {
    return await this.identifiedSituationsService.findAllWithInactive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener situación identificada por ID' })
  @ApiResponse({
    status: 200,
    description: 'Situación identificada encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Situación identificada no encontrada',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.identifiedSituationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar situación identificada' })
  @ApiResponse({
    status: 200,
    description: 'Situación identificada actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Situación identificada no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una situación con este nombre',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIdentifiedSituationDto,
  ) {
    return await this.identifiedSituationsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar situación identificada (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Situación identificada desactivada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Situación identificada no encontrada',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.identifiedSituationsService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar situación identificada desactivada' })
  @ApiResponse({
    status: 200,
    description: 'Situación identificada restaurada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Situación identificada no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'La situación ya está activa',
  })
  async restore(@Param('id', ParseIntPipe) id: number) {
    return await this.identifiedSituationsService.restore(id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Eliminar permanentemente situación identificada' })
  @ApiResponse({
    status: 200,
    description: 'Situación identificada eliminada permanentemente',
  })
  @ApiResponse({
    status: 404,
    description: 'Situación identificada no encontrada',
  })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.identifiedSituationsService.hardDelete(id);
  }
}
