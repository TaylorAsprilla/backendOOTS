import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApproachTypesService } from './approach-types.service';
import { CreateApproachTypeDto } from './dto/create-approach-type.dto';
import { UpdateApproachTypeDto } from './dto/update-approach-type.dto';

@ApiTags('Tipos de Abordaje')
@Controller('approach-types')
export class ApproachTypesController {
  constructor(private readonly approachTypesService: ApproachTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de abordaje' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de abordaje creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de abordaje con ese nombre',
  })
  create(@Body() createApproachTypeDto: CreateApproachTypeDto) {
    return this.approachTypesService.create(createApproachTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de abordaje' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los tipos de abordaje',
  })
  findAll() {
    return this.approachTypesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo tipos de abordaje activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de abordaje activos',
  })
  findActive() {
    return this.approachTypesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de abordaje por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de abordaje' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de abordaje encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de abordaje no encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.approachTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de abordaje' })
  @ApiParam({ name: 'id', description: 'ID del tipo de abordaje' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de abordaje actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de abordaje no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de abordaje con ese nombre',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApproachTypeDto: UpdateApproachTypeDto,
  ) {
    return this.approachTypesService.update(id, updateApproachTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar un tipo de abordaje (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de abordaje' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de abordaje desactivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de abordaje no encontrado',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.approachTypesService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivar un tipo de abordaje' })
  @ApiParam({ name: 'id', description: 'ID del tipo de abordaje' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de abordaje activado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de abordaje no encontrado',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.approachTypesService.activate(id);
  }
}
