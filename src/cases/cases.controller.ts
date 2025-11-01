import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CasesService } from './cases.service';
import {
  CreateCaseDto,
  UpdateCaseStatusDto,
  CaseResponseDto,
} from './dto/case.dto';

@ApiTags('Cases')
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo caso para un participante',
    description:
      'Crea un nuevo caso asociado a un participante específico. El número de caso se genera automáticamente en formato CASE-XXXX. ' +
      'Este endpoint permite incluir toda la información médica inicial del caso: motivo de consulta, situaciones identificadas, ' +
      'intervención inicial, plan de seguimiento, historias de salud física y mental, ponderación profesional, planes de intervención, ' +
      'notas de progreso, referidos y nota de cierre.',
  })
  @ApiBody({
    type: CreateCaseDto,
    description: 'Datos del caso a crear con información médica completa',
    examples: {
      'ejemplo-completo': {
        summary: 'Caso completo con toda la información médica',
        description: 'Incluye todos los campos posibles para un caso completo',
        value: {
          participantId: 1,
          consultationReason:
            'El participante presenta síntomas de ansiedad y estrés relacionados con separación matrimonial reciente',
          identifiedSituations: [1, 3, 5, 8],
          intervention:
            'Sesión inicial de orientación psicológica de 90 minutos. Se aplicó entrevista semiestructurada para evaluación integral',
          followUpPlan: [1, 2, 3],
          physicalHealthHistory: {
            currentConditions:
              'Hipertensión arterial controlada diagnosticada hace 3 años',
            medications: 'Losartán 50mg una vez al día en ayunas',
            familyHistoryFather:
              'Padre fallecido a los 65 años por infarto agudo de miocardio',
            familyHistoryMother:
              'Madre viva de 68 años con hipertensión arterial',
            observations:
              'Se recomienda continuar con controles médicos regulares',
          },
          mentalHealthHistory: {
            currentConditions:
              'Episodios de ansiedad generalizada desde hace 2 años',
            medications: 'Ninguno actualmente',
            familyHistoryFather: 'Padre tenía tendencia al aislamiento social',
            familyHistoryMother: 'Madre con episodios de depresión postparto',
            observations:
              'Se sugiere evaluación psicológica especializada complementaria',
          },
          ponderacion: {
            consultationMotiveAnalysis:
              'Se evidencia sintomatología ansiosa moderada con afectación del sueño y concentración',
            identifiedSituationAnalysis:
              'Situación de crisis vital por cambio en estructura familiar',
            favorableConditions:
              'Cuenta con red de apoyo familiar, empleo estable, buena adherencia al tratamiento',
            unfavorableConditions:
              'Escasa red de apoyo social externo, resistencia inicial a proceso terapéutico',
            theoreticalApproach:
              'Terapia cognitivo-conductual con enfoque en manejo de ansiedad y reestructuración cognitiva',
          },
          interventionPlans: [
            {
              goal: 'Reducir niveles de ansiedad al 70% en 8 semanas',
              objectives: 'Aprender técnicas de relajación y manejo emocional',
              activities:
                'Sesiones semanales de orientación psicológica (8 sesiones totales)',
              timeline:
                '8 semanas intensivas + 4 sesiones de seguimiento mensual',
              responsible: 'Psicóloga orientadora María Elena Vargas',
              evaluationCriteria:
                'Disminución de puntuación en escala de ansiedad GAD-7',
            },
          ],
          progressNotes: [
            {
              sessionDate: '2024-01-15',
              sessionType: 'INDIVIDUAL',
              summary:
                'Primera sesión de orientación psicológica. Se estableció rapport adecuado',
              observations:
                'Participante muestra buena disposición para el trabajo terapéutico',
              agreements:
                'Practicar técnicas de respiración diafragmática 2 veces al día',
            },
          ],
          referrals:
            'Considerar referencia a psiquiatría si persiste alteración del sueño después de 4 semanas',
        },
      },
      'ejemplo-basico': {
        summary: 'Caso básico con campos mínimos',
        description: 'Solo los campos esenciales para crear un caso',
        value: {
          participantId: 1,
          consultationReason:
            'Consulta por problemas de ansiedad y estrés laboral',
          identifiedSituations: [1, 5],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Caso creado exitosamente con todas las entidades médicas relacionadas. ' +
      'Retorna el caso completo con su número asignado automáticamente.',
    type: CaseResponseDto,
    schema: {
      example: {
        id: 1,
        caseNumber: 'CASE-0001',
        status: 'open',
        participantId: 1,
        consultationReason: 'Consulta por ansiedad y estrés',
        createdAt: '2024-10-31T10:30:00.000Z',
        updatedAt: '2024-10-31T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos. El participantId es requerido y debe ser un número válido.',
    schema: {
      example: {
        statusCode: 400,
        message: ['participantId must be a number'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'Participante no encontrado. Verifique que el participantId corresponda a un participante existente.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Participant with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description:
      'Error interno del servidor al crear el caso o sus entidades relacionadas.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createCase(@Body() createCaseDto: CreateCaseDto) {
    return await this.casesService.createCase(createCaseDto);
  }

  @Get('participants/:participantId/cases')
  @ApiOperation({
    summary: 'Obtener todos los casos de un participante',
    description:
      'Retorna la lista completa de todos los casos asociados a un participante específico, ordenados por fecha de creación descendente. ' +
      'Incluye información básica de cada caso: número, estado, fechas de creación y actualización.',
  })
  @ApiParam({
    name: 'participantId',
    description:
      'ID único del participante del cual se desean consultar los casos',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de casos del participante obtenida exitosamente. Si el participante no tiene casos, retorna un array vacío.',
    type: [CaseResponseDto],
    schema: {
      example: [
        {
          id: 1,
          caseNumber: 'CASE-0001',
          status: 'open',
          participantId: 1,
          consultationReason: 'Consulta por ansiedad',
          createdAt: '2024-10-31T10:30:00.000Z',
          updatedAt: '2024-10-31T10:30:00.000Z',
        },
        {
          id: 2,
          caseNumber: 'CASE-0002',
          status: 'in_progress',
          participantId: 1,
          consultationReason: 'Seguimiento terapéutico',
          createdAt: '2024-09-15T14:20:00.000Z',
          updatedAt: '2024-10-20T16:45:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ID de participante inválido. Debe ser un número entero.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Participante no encontrado con el ID proporcionado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Participant with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  async findAllByParticipant(
    @Param('participantId', ParseIntPipe) participantId: number,
  ) {
    return await this.casesService.findAllByParticipant(participantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener caso por ID',
    description:
      'Retorna los detalles completos de un caso específico incluyendo toda la información médica asociada: ' +
      'motivo de consulta, situaciones identificadas, intervención inicial, plan de seguimiento, historias de salud física y mental, ' +
      'ponderación profesional, planes de intervención, notas de progreso, referidos, nota de cierre y datos del participante.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del caso a consultar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Detalles completos del caso obtenidos exitosamente con toda la información médica asociada.',
    type: CaseResponseDto,
    schema: {
      example: {
        id: 1,
        caseNumber: 'CASE-0001',
        status: 'in_progress',
        participantId: 1,
        consultationReason:
          'Consulta por síntomas de ansiedad y estrés laboral',
        intervention: 'Sesión inicial de orientación de 90 minutos',
        referrals: 'Considerar evaluación psiquiátrica si persiste insomnio',
        createdAt: '2024-10-31T10:30:00.000Z',
        updatedAt: '2024-10-31T15:45:00.000Z',
        participant: {
          id: 1,
          firstName: 'María',
          firstLastName: 'González',
          documentNumber: '1234567890',
        },
        physicalHealthHistory: {
          currentConditions: 'Hipertensión controlada',
          medications: 'Losartán 50mg',
        },
        mentalHealthHistory: {
          currentConditions: 'Episodios de ansiedad',
        },
        ponderacion: {
          consultationMotiveAnalysis: 'Sintomatología ansiosa moderada',
          theoreticalApproach: 'Terapia cognitivo-conductual',
        },
        interventionPlans: [
          {
            goal: 'Reducir ansiedad al 70% en 8 semanas',
            activities: 'Sesiones semanales de orientación',
          },
        ],
        progressNotes: [
          {
            sessionDate: '2024-10-31',
            sessionType: 'INDIVIDUAL',
            summary: 'Primera sesión completada exitosamente',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ID de caso inválido. Debe ser un número entero.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Caso no encontrado con el ID proporcionado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Case with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.casesService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Actualizar estado del caso',
    description:
      'Actualiza el estado de un caso específico. Valida que las transiciones de estado sean lógicas y permitidas. ' +
      'Estados disponibles: OPEN (abierto), IN_PROGRESS (en progreso), ON_HOLD (en espera), CLOSED (cerrado). ' +
      'El sistema valida que solo se pueda cerrar un caso si se ha proporcionado una nota de cierre.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del caso cuyo estado se desea actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdateCaseStatusDto,
    description: 'Nuevo estado del caso',
    examples: {
      'abrir-caso': {
        summary: 'Abrir caso',
        description: 'Marcar el caso como abierto para iniciar atención',
        value: {
          status: 'open',
        },
      },
      'en-progreso': {
        summary: 'Caso en progreso',
        description: 'Indicar que el caso está siendo atendido activamente',
        value: {
          status: 'in_progress',
        },
      },
      'en-espera': {
        summary: 'Caso en espera',
        description:
          'Poner el caso en espera temporalmente (ej: vacaciones del paciente)',
        value: {
          status: 'on_hold',
        },
      },
      'cerrar-caso': {
        summary: 'Cerrar caso',
        description:
          'Cerrar el caso definitivamente (requiere nota de cierre previa)',
        value: {
          status: 'closed',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Estado del caso actualizado exitosamente. Retorna el caso completo con el nuevo estado.',
    type: CaseResponseDto,
    schema: {
      example: {
        id: 1,
        caseNumber: 'CASE-0001',
        status: 'in_progress',
        participantId: 1,
        consultationReason: 'Consulta por ansiedad',
        createdAt: '2024-10-31T10:30:00.000Z',
        updatedAt: '2024-10-31T16:20:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Transición de estado inválida o datos incorrectos. Verifique que el estado sea uno de los valores permitidos y que la transición sea lógica.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'status must be one of the following values: open, in_progress, on_hold, closed',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Caso no encontrado con el ID proporcionado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Case with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 422,
    description:
      'No se puede procesar la solicitud. Por ejemplo, intentar cerrar un caso sin nota de cierre.',
    schema: {
      example: {
        statusCode: 422,
        message:
          'Cannot close case without a closing note. Please add a closing note first.',
        error: 'Unprocessable Entity',
      },
    },
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCaseStatusDto: UpdateCaseStatusDto,
  ) {
    return await this.casesService.updateStatus(id, updateCaseStatusDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los casos del sistema',
    description:
      'Retorna la lista completa de todos los casos registrados en el sistema, incluyendo información básica de cada participante asociado. ' +
      'Los casos se ordenan por fecha de creación descendente (más recientes primero). ' +
      'Útil para vistas administrativas, dashboards y reportes generales del sistema.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de todos los casos obtenida exitosamente con información de participantes.',
    type: [CaseResponseDto],
    schema: {
      example: [
        {
          id: 1,
          caseNumber: 'CASE-0001',
          status: 'in_progress',
          participantId: 1,
          consultationReason: 'Consulta por ansiedad y estrés laboral',
          createdAt: '2024-10-31T10:30:00.000Z',
          updatedAt: '2024-10-31T15:45:00.000Z',
          participant: {
            firstName: 'María',
            firstLastName: 'González',
            documentNumber: '1234567890',
          },
        },
        {
          id: 2,
          caseNumber: 'CASE-0002',
          status: 'open',
          participantId: 2,
          consultationReason: 'Primera consulta por duelo',
          createdAt: '2024-10-30T14:20:00.000Z',
          updatedAt: '2024-10-30T14:20:00.000Z',
          participant: {
            firstName: 'Juan',
            firstLastName: 'Pérez',
            documentNumber: '9876543210',
          },
        },
        {
          id: 3,
          caseNumber: 'CASE-0003',
          status: 'closed',
          participantId: 1,
          consultationReason: 'Seguimiento post-tratamiento',
          createdAt: '2024-09-15T09:00:00.000Z',
          updatedAt: '2024-10-15T16:30:00.000Z',
          participant: {
            firstName: 'María',
            firstLastName: 'González',
            documentNumber: '1234567890',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al consultar los casos.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      },
    },
  })
  async findAll() {
    return await this.casesService.findAll();
  }
}
