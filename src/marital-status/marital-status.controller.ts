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
import { MaritalStatusService } from './marital-status.service';
import { CreateMaritalStatusDto } from './dto/create-marital-status.dto';
import { UpdateMaritalStatusDto } from './dto/update-marital-status.dto';

@ApiTags('Estados Civiles')
@Controller('marital-status')
export class MaritalStatusController {
  constructor(private readonly maritalStatusService: MaritalStatusService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estado civil' })
  @ApiResponse({
    status: 201,
    description: 'Estado civil creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un estado civil con ese nombre',
  })
  create(@Body() createMaritalStatusDto: CreateMaritalStatusDto) {
    return this.maritalStatusService.create(createMaritalStatusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estados civiles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los estados civiles',
  })
  findAll() {
    return this.maritalStatusService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo estados civiles activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados civiles activos',
  })
  findActive() {
    return this.maritalStatusService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estado civil por ID' })
  @ApiParam({ name: 'id', description: 'ID del estado civil' })
  @ApiResponse({
    status: 200,
    description: 'Estado civil encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Estado civil no encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.maritalStatusService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un estado civil' })
  @ApiParam({ name: 'id', description: 'ID del estado civil' })
  @ApiResponse({
    status: 200,
    description: 'Estado civil actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Estado civil no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un estado civil con ese nombre',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaritalStatusDto: UpdateMaritalStatusDto,
  ) {
    return this.maritalStatusService.update(id, updateMaritalStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar un estado civil (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID del estado civil' })
  @ApiResponse({
    status: 200,
    description: 'Estado civil desactivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Estado civil no encontrado',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.maritalStatusService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivar un estado civil' })
  @ApiParam({ name: 'id', description: 'ID del estado civil' })
  @ApiResponse({
    status: 200,
    description: 'Estado civil activado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Estado civil no encontrado',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.maritalStatusService.activate(id);
  }
}
