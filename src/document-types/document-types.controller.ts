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
import { DocumentTypesService } from './document-types.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@ApiTags('Tipos de Documento')
@Controller('document-types')
export class DocumentTypesController {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de documento' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de documento creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de documento con ese nombre',
  })
  create(@Body() createDocumentTypeDto: CreateDocumentTypeDto) {
    return this.documentTypesService.create(createDocumentTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de documento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los tipos de documento',
  })
  findAll() {
    return this.documentTypesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo tipos de documento activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de documento activos',
  })
  findActive() {
    return this.documentTypesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de documento por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de documento' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de documento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de documento no encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de documento' })
  @ApiParam({ name: 'id', description: 'ID del tipo de documento' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de documento actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de documento no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de documento con ese nombre',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentTypeDto: UpdateDocumentTypeDto,
  ) {
    return this.documentTypesService.update(id, updateDocumentTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar un tipo de documento (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de documento' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de documento desactivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de documento no encontrado',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentTypesService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivar un tipo de documento' })
  @ApiParam({ name: 'id', description: 'ID del tipo de documento' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de documento activado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de documento no encontrado',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.documentTypesService.activate(id);
  }
}
