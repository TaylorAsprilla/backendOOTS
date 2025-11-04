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
import { GendersService } from './genders.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@ApiTags('Géneros')
@Controller('genders')
export class GendersController {
  constructor(private readonly gendersService: GendersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo género' })
  @ApiResponse({
    status: 201,
    description: 'Género creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un género con ese nombre',
  })
  create(@Body() createGenderDto: CreateGenderDto) {
    return this.gendersService.create(createGenderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los géneros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los géneros',
  })
  findAll() {
    return this.gendersService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo géneros activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de géneros activos',
  })
  findActive() {
    return this.gendersService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un género por ID' })
  @ApiParam({ name: 'id', description: 'ID del género' })
  @ApiResponse({
    status: 200,
    description: 'Género encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Género no encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gendersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un género' })
  @ApiParam({ name: 'id', description: 'ID del género' })
  @ApiResponse({
    status: 200,
    description: 'Género actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Género no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un género con ese nombre',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGenderDto: UpdateGenderDto,
  ) {
    return this.gendersService.update(id, updateGenderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar un género (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID del género' })
  @ApiResponse({
    status: 200,
    description: 'Género desactivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Género no encontrado',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gendersService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivar un género' })
  @ApiParam({ name: 'id', description: 'ID del género' })
  @ApiResponse({
    status: 200,
    description: 'Género activado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Género no encontrado',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.gendersService.activate(id);
  }
}
