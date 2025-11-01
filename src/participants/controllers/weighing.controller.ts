import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { WeighingService } from '../services/weighing.service';
import { CreateWeighingDto } from '../dto/create-weighing.dto';
import { UpdateWeighingDto } from '../dto/update-weighing.dto';

@ApiTags('weighings')
@Controller('weighings')
export class WeighingController {
  constructor(private readonly weighingService: WeighingService) {}

  @Post('case/:caseId')
  @ApiOperation({
    summary: 'Crear ponderación para un caso',
    description:
      'Crea una nueva ponderación (weighing) asociada a un caso específico',
  })
  @ApiParam({
    name: 'caseId',
    description: 'ID del caso al que pertenece la ponderación',
    type: Number,
    example: 1,
  })
  @ApiBody({
    description: 'Datos de la ponderación',
    type: CreateWeighingDto,
    examples: {
      complete: {
        summary: 'Ejemplo completo',
        value: {
          reasonConsultation:
            'Paciente refiere estrés laboral crónico que afecta su vida familiar y personal',
          identifiedSituation:
            'Se identifica cuadro de ansiedad generalizada con manifestaciones somáticas',
          favorableConditions:
            'Cuenta con red de apoyo familiar sólida, empleo estable, acceso a servicios de salud',
          conditionsNotFavorable:
            'Alto nivel de exigencia laboral, escasa red de apoyo social externo',
          helpProcess:
            'Se recomienda proceso de orientación psicológica con enfoque cognitivo-conductual, 8 sesiones',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Ponderación creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        reasonConsultation: {
          type: 'string',
          example: 'Paciente refiere estrés laboral crónico...',
        },
        caseId: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Ya existe una ponderación para este caso',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example: 'Ya existe una ponderación para el caso con ID 1',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos',
  })
  create(
    @Param('caseId') caseId: string,
    @Body() createWeighingDto: CreateWeighingDto,
  ) {
    return this.weighingService.create(+caseId, createWeighingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las ponderaciones',
    description: 'Obtiene una lista de todas las ponderaciones registradas',
  })
  @ApiOkResponse({
    description: 'Lista de ponderaciones obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          reasonConsultation: { type: 'string' },
          caseId: { type: 'number', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  findAll() {
    return this.weighingService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener ponderación por ID',
    description: 'Obtiene los datos completos de una ponderación específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la ponderación',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Ponderación encontrada exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Ponderación no encontrada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Weighing with ID 1 not found' },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.weighingService.findOne(+id);
  }

  @Get('case/:caseId')
  @ApiOperation({
    summary: 'Obtener ponderación por ID de caso',
    description: 'Obtiene la ponderación asociada a un caso específico',
  })
  @ApiParam({
    name: 'caseId',
    description: 'ID del caso',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Ponderación encontrada exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró ponderación para este caso',
  })
  findByCaseId(@Param('caseId') caseId: string) {
    return this.weighingService.findByCaseId(+caseId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar ponderación',
    description:
      'Actualiza los datos de una ponderación existente. Solo se actualizan los campos proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la ponderación a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    description: 'Datos a actualizar',
    type: UpdateWeighingDto,
  })
  @ApiOkResponse({
    description: 'Ponderación actualizada exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Ponderación no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos',
  })
  update(
    @Param('id') id: string,
    @Body() updateWeighingDto: UpdateWeighingDto,
  ) {
    return this.weighingService.update(+id, updateWeighingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar ponderación',
    description: 'Elimina una ponderación del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la ponderación a eliminar',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Ponderación eliminada exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Ponderación no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.weighingService.remove(+id);
  }
}
