import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateIncomeLevelDto, UpdateIncomeLevelDto } from './dto';
import { IncomeLevelService } from './income-level.service';

@ApiTags('Niveles de Ingreso')
@Controller('income-level')
export class IncomeLevelController {
  constructor(private readonly incomeLevelService: IncomeLevelService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo nivel de ingreso' })
  @ApiResponse({
    status: 201,
    description: 'Nivel de ingreso creado exitosamente',
  })
  @ApiResponse({ status: 409, description: 'Nivel de ingreso ya existe' })
  create(@Body() createDto: CreateIncomeLevelDto) {
    return this.incomeLevelService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los niveles de ingreso' })
  @ApiResponse({ status: 200, description: 'Lista de niveles de ingreso' })
  findAll() {
    return this.incomeLevelService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener niveles de ingreso activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de niveles de ingreso activos',
  })
  findActive() {
    return this.incomeLevelService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener nivel de ingreso por ID' })
  @ApiResponse({ status: 200, description: 'Nivel de ingreso encontrado' })
  @ApiResponse({ status: 404, description: 'Nivel de ingreso no encontrado' })
  findOne(@Param('id') id: string) {
    return this.incomeLevelService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nivel de ingreso' })
  @ApiResponse({ status: 200, description: 'Nivel de ingreso actualizado' })
  @ApiResponse({ status: 404, description: 'Nivel de ingreso no encontrado' })
  @ApiResponse({ status: 409, description: 'Nivel de ingreso ya existe' })
  update(@Param('id') id: string, @Body() updateDto: UpdateIncomeLevelDto) {
    return this.incomeLevelService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar nivel de ingreso' })
  @ApiResponse({ status: 200, description: 'Nivel de ingreso desactivado' })
  @ApiResponse({ status: 404, description: 'Nivel de ingreso no encontrado' })
  remove(@Param('id') id: string) {
    return this.incomeLevelService.remove(+id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar nivel de ingreso' })
  @ApiResponse({ status: 200, description: 'Nivel de ingreso activado' })
  @ApiResponse({ status: 404, description: 'Nivel de ingreso no encontrado' })
  activate(@Param('id') id: string) {
    return this.incomeLevelService.activate(+id);
  }
}
