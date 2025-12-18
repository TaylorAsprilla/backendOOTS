import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApproachTypesService } from './approach-types.service';
import { CreateApproachTypeDto } from './dto/create-approach-type.dto';
import { UpdateApproachTypeDto } from './dto/update-approach-type.dto';

@ApiTags('Catálogos - Tipos de Abordaje')
@Controller('catalogs/approach-types')
export class ApproachTypesController {
  constructor(private readonly approachTypesService: ApproachTypesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear tipo de abordaje',
    description: 'Crea un nuevo tipo de abordaje en el catálogo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tipo de abordaje creado exitosamente',
  })
  @ApiResponse({ status: 409, description: 'El tipo de abordaje ya existe' })
  create(@Body() createApproachTypeDto: CreateApproachTypeDto) {
    return this.approachTypesService.create(createApproachTypeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tipos de abordaje',
    description: 'Obtiene todos los tipos de abordaje del catálogo',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir tipos de abordaje inactivos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de abordaje obtenida exitosamente',
  })
  findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return this.approachTypesService.findAll(include);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener tipo de abordaje',
    description: 'Obtiene un tipo de abordaje específico por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de abordaje' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de abordaje encontrado',
  })
  @ApiResponse({ status: 404, description: 'Tipo de abordaje no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.approachTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar tipo de abordaje',
    description: 'Actualiza los datos de un tipo de abordaje existente',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de abordaje' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de abordaje actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de abordaje no encontrado' })
  @ApiResponse({ status: 409, description: 'El nombre ya está en uso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApproachTypeDto: UpdateApproachTypeDto,
  ) {
    return this.approachTypesService.update(id, updateApproachTypeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Desactivar tipo de abordaje',
    description:
      'Desactiva un tipo de abordaje (eliminación lógica, no física)',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de abordaje' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de abordaje desactivado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de abordaje no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.approachTypesService.remove(id);
  }
}
