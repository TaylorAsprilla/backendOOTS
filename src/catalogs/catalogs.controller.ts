import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { IdentifiedSituation } from '../common/entities';
import { FollowUpPlanCatalog } from '../common/entities/follow-up-plan-catalog.entity';

@ApiTags('Catálogos')
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('identified-situations')
  @ApiOperation({
    summary: 'Obtener todas las situaciones identificadas activas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de situaciones identificadas',
    type: [IdentifiedSituation],
  })
  async findAllIdentifiedSituations(): Promise<IdentifiedSituation[]> {
    return this.catalogsService.findAllIdentifiedSituations();
  }

  @Get('identified-situations/:id')
  @ApiOperation({ summary: 'Obtener una situación identificada por ID' })
  @ApiResponse({
    status: 200,
    description: 'Situación identificada encontrada',
    type: IdentifiedSituation,
  })
  @ApiResponse({
    status: 404,
    description: 'Situación identificada no encontrada',
  })
  async findIdentifiedSituationById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IdentifiedSituation | null> {
    return this.catalogsService.findIdentifiedSituationById(id);
  }

  @Get('follow-up-plans')
  @ApiOperation({
    summary: 'Obtener todos los planes de seguimiento activos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de planes de seguimiento',
    type: [FollowUpPlanCatalog],
  })
  async findAllFollowUpPlans(): Promise<FollowUpPlanCatalog[]> {
    return this.catalogsService.findAllFollowUpPlans();
  }

  @Get('follow-up-plans/:id')
  @ApiOperation({ summary: 'Obtener un plan de seguimiento por ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan de seguimiento encontrado',
    type: FollowUpPlanCatalog,
  })
  @ApiResponse({
    status: 404,
    description: 'Plan de seguimiento no encontrado',
  })
  async findFollowUpPlanById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FollowUpPlanCatalog | null> {
    return this.catalogsService.findFollowUpPlanById(id);
  }
}
