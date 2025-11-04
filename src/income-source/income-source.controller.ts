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
import { CreateIncomeSourceDto, UpdateIncomeSourceDto } from './dto';
import { IncomeSourceService } from './income-source.service';

@ApiTags('Fuentes de Ingreso')
@Controller('income-source')
export class IncomeSourceController {
  constructor(private readonly incomeSourceService: IncomeSourceService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva fuente de ingreso' })
  @ApiResponse({
    status: 201,
    description: 'Fuente de ingreso creada exitosamente',
  })
  @ApiResponse({ status: 409, description: 'Fuente de ingreso ya existe' })
  create(@Body() createDto: CreateIncomeSourceDto) {
    return this.incomeSourceService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las fuentes de ingreso' })
  @ApiResponse({ status: 200, description: 'Lista de fuentes de ingreso' })
  findAll() {
    return this.incomeSourceService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener fuentes de ingreso activas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de fuentes de ingreso activas',
  })
  findActive() {
    return this.incomeSourceService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener fuente de ingreso por ID' })
  @ApiResponse({ status: 200, description: 'Fuente de ingreso encontrada' })
  @ApiResponse({ status: 404, description: 'Fuente de ingreso no encontrada' })
  findOne(@Param('id') id: string) {
    return this.incomeSourceService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar fuente de ingreso' })
  @ApiResponse({ status: 200, description: 'Fuente de ingreso actualizada' })
  @ApiResponse({ status: 404, description: 'Fuente de ingreso no encontrada' })
  @ApiResponse({ status: 409, description: 'Fuente de ingreso ya existe' })
  update(@Param('id') id: string, @Body() updateDto: UpdateIncomeSourceDto) {
    return this.incomeSourceService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar fuente de ingreso' })
  @ApiResponse({ status: 200, description: 'Fuente de ingreso desactivada' })
  @ApiResponse({ status: 404, description: 'Fuente de ingreso no encontrada' })
  remove(@Param('id') id: string) {
    return this.incomeSourceService.remove(+id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar fuente de ingreso' })
  @ApiResponse({ status: 200, description: 'Fuente de ingreso activada' })
  @ApiResponse({ status: 404, description: 'Fuente de ingreso no encontrada' })
  activate(@Param('id') id: string) {
    return this.incomeSourceService.activate(+id);
  }
}
