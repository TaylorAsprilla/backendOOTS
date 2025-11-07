import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TypeProgressService } from './type-progress.service';
import { CreateTypeProgressDto } from './dto/create-type-progress.dto';
import { UpdateTypeProgressDto } from './dto/update-type-progress.dto';
import { TypeProgress } from './entities/type-progress.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Type Progress')
@Controller('type-progress')
@Public()
export class TypeProgressController {
  constructor(private readonly typeProgressService: TypeProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de progreso' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de progreso creado exitosamente',
    type: TypeProgress,
  })
  async create(
    @Body() createTypeProgressDto: CreateTypeProgressDto,
  ): Promise<TypeProgress> {
    return this.typeProgressService.create(createTypeProgressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de progreso activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de progreso activos',
    type: [TypeProgress],
  })
  async findAll(): Promise<TypeProgress[]> {
    return this.typeProgressService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener todos los tipos de progreso activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de progreso activos',
    type: [TypeProgress],
  })
  async findActive(): Promise<TypeProgress[]> {
    return this.typeProgressService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de progreso por ID' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de progreso encontrado',
    type: TypeProgress,
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TypeProgress> {
    return this.typeProgressService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de progreso' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de progreso actualizado exitosamente',
    type: TypeProgress,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTypeProgressDto: UpdateTypeProgressDto,
  ): Promise<TypeProgress> {
    return this.typeProgressService.update(id, updateTypeProgressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de progreso (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de progreso desactivado exitosamente',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.typeProgressService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar un tipo de progreso' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de progreso activado exitosamente',
    type: TypeProgress,
  })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<TypeProgress> {
    return this.typeProgressService.activate(id);
  }
}
