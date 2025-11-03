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
import { AcademicLevelsService } from './academic-levels.service';
import { CreateAcademicLevelDto } from './dto/create-academic-level.dto';
import { UpdateAcademicLevelDto } from './dto/update-academic-level.dto';

@ApiTags('Niveles Académicos')
@Controller('academic-levels')
export class AcademicLevelsController {
  constructor(private readonly academicLevelsService: AcademicLevelsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo nivel académico' })
  @ApiResponse({
    status: 201,
    description: 'Nivel académico creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un nivel académico con ese nombre',
  })
  create(@Body() createAcademicLevelDto: CreateAcademicLevelDto) {
    return this.academicLevelsService.create(createAcademicLevelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los niveles académicos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los niveles académicos',
  })
  findAll() {
    return this.academicLevelsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo niveles académicos activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de niveles académicos activos',
  })
  findActive() {
    return this.academicLevelsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un nivel académico por ID' })
  @ApiParam({ name: 'id', description: 'ID del nivel académico' })
  @ApiResponse({
    status: 200,
    description: 'Nivel académico encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Nivel académico no encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicLevelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un nivel académico' })
  @ApiParam({ name: 'id', description: 'ID del nivel académico' })
  @ApiResponse({
    status: 200,
    description: 'Nivel académico actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Nivel académico no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un nivel académico con ese nombre',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAcademicLevelDto: UpdateAcademicLevelDto,
  ) {
    return this.academicLevelsService.update(id, updateAcademicLevelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar un nivel académico (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID del nivel académico' })
  @ApiResponse({
    status: 200,
    description: 'Nivel académico desactivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Nivel académico no encontrado',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicLevelsService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivar un nivel académico' })
  @ApiParam({ name: 'id', description: 'ID del nivel académico' })
  @ApiResponse({
    status: 200,
    description: 'Nivel académico activado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Nivel académico no encontrado',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.academicLevelsService.activate(id);
  }
}
