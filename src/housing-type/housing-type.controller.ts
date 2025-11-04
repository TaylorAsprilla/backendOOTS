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
import { CreateHousingTypeDto, UpdateHousingTypeDto } from './dto';
import { HousingTypeService } from './housing-type.service';

@ApiTags('Tipos de Vivienda')
@Controller('housing-type')
export class HousingTypeController {
  constructor(private readonly housingTypeService: HousingTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo de vivienda' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de vivienda creado exitosamente',
  })
  @ApiResponse({ status: 409, description: 'Tipo de vivienda ya existe' })
  create(@Body() createDto: CreateHousingTypeDto) {
    return this.housingTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de vivienda' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de vivienda' })
  findAll() {
    return this.housingTypeService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener tipos de vivienda activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de vivienda activos',
  })
  findActive() {
    return this.housingTypeService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de vivienda por ID' })
  @ApiResponse({ status: 200, description: 'Tipo de vivienda encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de vivienda no encontrado' })
  findOne(@Param('id') id: string) {
    return this.housingTypeService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo de vivienda' })
  @ApiResponse({ status: 200, description: 'Tipo de vivienda actualizado' })
  @ApiResponse({ status: 404, description: 'Tipo de vivienda no encontrado' })
  @ApiResponse({ status: 409, description: 'Tipo de vivienda ya existe' })
  update(@Param('id') id: string, @Body() updateDto: UpdateHousingTypeDto) {
    return this.housingTypeService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar tipo de vivienda' })
  @ApiResponse({ status: 200, description: 'Tipo de vivienda desactivado' })
  @ApiResponse({ status: 404, description: 'Tipo de vivienda no encontrado' })
  remove(@Param('id') id: string) {
    return this.housingTypeService.remove(+id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar tipo de vivienda' })
  @ApiResponse({ status: 200, description: 'Tipo de vivienda activado' })
  @ApiResponse({ status: 404, description: 'Tipo de vivienda no encontrado' })
  activate(@Param('id') id: string) {
    return this.housingTypeService.activate(+id);
  }
}
