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
import { HealthInsuranceService } from './health-insurance.service';
import { CreateHealthInsuranceDto } from './dto/create-health-insurance.dto';
import { UpdateHealthInsuranceDto } from './dto/update-health-insurance.dto';

@ApiTags('Seguros de Salud')
@Controller('health-insurance')
export class HealthInsuranceController {
  constructor(
    private readonly healthInsuranceService: HealthInsuranceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo seguro de salud' })
  @ApiResponse({
    status: 201,
    description: 'Seguro de salud creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un seguro de salud con ese nombre',
  })
  create(@Body() createHealthInsuranceDto: CreateHealthInsuranceDto) {
    return this.healthInsuranceService.create(createHealthInsuranceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los seguros de salud' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los seguros de salud',
  })
  findAll() {
    return this.healthInsuranceService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo seguros de salud activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguros de salud activos',
  })
  findActive() {
    return this.healthInsuranceService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un seguro de salud por ID' })
  @ApiParam({ name: 'id', description: 'ID del seguro de salud' })
  @ApiResponse({ status: 200, description: 'Seguro de salud encontrado' })
  @ApiResponse({ status: 404, description: 'Seguro de salud no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.healthInsuranceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un seguro de salud' })
  @ApiParam({ name: 'id', description: 'ID del seguro de salud' })
  @ApiResponse({
    status: 200,
    description: 'Seguro de salud actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Seguro de salud no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un seguro de salud con ese nombre',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHealthInsuranceDto: UpdateHealthInsuranceDto,
  ) {
    return this.healthInsuranceService.update(id, updateHealthInsuranceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar un seguro de salud (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del seguro de salud' })
  @ApiResponse({
    status: 200,
    description: 'Seguro de salud desactivado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Seguro de salud no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.healthInsuranceService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivar un seguro de salud' })
  @ApiParam({ name: 'id', description: 'ID del seguro de salud' })
  @ApiResponse({
    status: 200,
    description: 'Seguro de salud activado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Seguro de salud no encontrado' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.healthInsuranceService.activate(id);
  }
}
