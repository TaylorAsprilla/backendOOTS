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
import {
  CreateFamilyRelationshipDto,
  UpdateFamilyRelationshipDto,
} from './dto';
import { FamilyRelationshipService } from './family-relationship.service';

@ApiTags('Parentescos Familiares')
@Controller('family-relationship')
export class FamilyRelationshipController {
  constructor(
    private readonly familyRelationshipService: FamilyRelationshipService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo parentesco familiar' })
  @ApiResponse({ status: 201, description: 'Parentesco creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Parentesco ya existe' })
  create(@Body() createDto: CreateFamilyRelationshipDto) {
    return this.familyRelationshipService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los parentescos familiares' })
  @ApiResponse({ status: 200, description: 'Lista de parentescos familiares' })
  findAll() {
    return this.familyRelationshipService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener parentescos familiares activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de parentescos familiares activos',
  })
  findActive() {
    return this.familyRelationshipService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener parentesco por ID' })
  @ApiResponse({ status: 200, description: 'Parentesco encontrado' })
  @ApiResponse({ status: 404, description: 'Parentesco no encontrado' })
  findOne(@Param('id') id: string) {
    return this.familyRelationshipService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parentesco familiar' })
  @ApiResponse({ status: 200, description: 'Parentesco actualizado' })
  @ApiResponse({ status: 404, description: 'Parentesco no encontrado' })
  @ApiResponse({ status: 409, description: 'Parentesco ya existe' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFamilyRelationshipDto,
  ) {
    return this.familyRelationshipService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar parentesco familiar' })
  @ApiResponse({ status: 200, description: 'Parentesco desactivado' })
  @ApiResponse({ status: 404, description: 'Parentesco no encontrado' })
  remove(@Param('id') id: string) {
    return this.familyRelationshipService.remove(+id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar parentesco familiar' })
  @ApiResponse({ status: 200, description: 'Parentesco activado' })
  @ApiResponse({ status: 404, description: 'Parentesco no encontrado' })
  activate(@Param('id') id: string) {
    return this.familyRelationshipService.activate(+id);
  }
}
