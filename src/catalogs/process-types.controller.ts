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
import { ProcessTypesService } from './process-types.service';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { UpdateProcessTypeDto } from './dto/update-process-type.dto';

@ApiTags('Catálogos - Tipos de Proceso')
@Controller('catalogs/process-types')
export class ProcessTypesController {
  constructor(private readonly processTypesService: ProcessTypesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear tipo de proceso',
    description: 'Crea un nuevo tipo de proceso en el catálogo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tipo de proceso creado exitosamente',
  })
  @ApiResponse({ status: 409, description: 'El tipo de proceso ya existe' })
  create(@Body() createProcessTypeDto: CreateProcessTypeDto) {
    return this.processTypesService.create(createProcessTypeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tipos de proceso',
    description: 'Obtiene todos los tipos de proceso del catálogo',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir tipos de proceso inactivos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de proceso obtenida exitosamente',
  })
  findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return this.processTypesService.findAll(include);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener tipo de proceso',
    description: 'Obtiene un tipo de proceso específico por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de proceso' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de proceso encontrado',
  })
  @ApiResponse({ status: 404, description: 'Tipo de proceso no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.processTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar tipo de proceso',
    description: 'Actualiza los datos de un tipo de proceso existente',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de proceso' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de proceso actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de proceso no encontrado' })
  @ApiResponse({ status: 409, description: 'El nombre ya está en uso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcessTypeDto: UpdateProcessTypeDto,
  ) {
    return this.processTypesService.update(id, updateProcessTypeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Desactivar tipo de proceso',
    description: 'Desactiva un tipo de proceso (eliminación lógica, no física)',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de proceso' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de proceso desactivado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de proceso no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.processTypesService.remove(id);
  }
}
