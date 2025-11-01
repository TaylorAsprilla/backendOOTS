import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { SearchParticipantsDto } from './dto/search-participants.dto';
import { ParticipantsService } from './participants.service';

@ApiTags('participants')
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo participante en el sistema',
    description:
      'Crea un nuevo participante en el sistema OOTS Colombia con toda su información personal completa. ' +
      'Este endpoint permite registrar datos personales básicos (nombres, documento, contacto), información de emergencia, ' +
      'miembros de familia, historia biopsicosocial, motivo de consulta, situaciones identificadas, intervención inicial, ' +
      'plan de seguimiento, historias de salud física y mental, planes de intervención, notas de progreso, referidos y nota de cierre. ' +
      'IMPORTANTE: Solo se deben incluir campos de información básica del participante. La información médica detallada se registra posteriormente en los CASOS.',
  })
  @ApiCreatedResponse({
    description:
      'Participante creado exitosamente con toda su información básica. Retorna el ID del participante y datos principales.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        firstName: { type: 'string', example: 'María' },
        firstLastName: { type: 'string', example: 'González' },
        documentNumber: { type: 'string', example: '1234567890' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Datos de entrada inválidos. Verifica que todos los campos requeridos estén presentes y con el formato correcto.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'firstName must be longer than or equal to 2 characters',
            'email must be an email',
            'phoneNumber must match the format +57 XXX XXX XXXX',
            'documentNumber is required',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflicto: Ya existe un participante con el mismo número de documento.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example:
            'Ya existe un participante con el número de documento 1234567890',
        },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      'Error interno del servidor al crear el participante o sus entidades relacionadas.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error interno del servidor' },
      },
    },
  })
  @ApiBody({
    description:
      'Datos completos del participante a crear. Los campos marcados como requeridos son obligatorios.',
    type: CreateParticipantDto,
    examples: {
      'ejemplo-completo': {
        summary: 'Ejemplo completo de participante',
        description:
          'Request completo con todos los datos posibles del participante',
        value: {
          firstName: 'María',
          secondName: 'Fernanda',
          firstLastName: 'González',
          secondLastName: 'Rodríguez',
          phoneNumber: '+57 300 123 4567',
          email: 'maria.gonzalez@email.com',
          documentTypeId: 1,
          documentNumber: '1234567890',
          address: 'Carrera 15 # 32-45, Apartamento 302, Barrio La Candelaria',
          city: 'Bogotá',
          birthDate: '1985-03-15',
          religiousAffiliation: 'Congregación Mita',
          genderId: 2,
          maritalStatusId: 1,
          healthInsuranceId: 3,
          customHealthInsurance: null,
          referralSource:
            'Referido por el obrero Pepito Pérez de la Congregación Mita Barranquilla',
          emergencyContacts: [
            {
              name: 'Carlos Alberto González Martínez',
              phone: '+57 301 987 6543',
              email: 'carlos.gonzalez@email.com',
              address: 'Calle 45 # 12-34, Casa 101',
              city: 'Bogotá',
              relationshipId: 2,
            },
            {
              name: 'Ana María Rodríguez López',
              phone: '+57 300 555 9999',
              email: 'ana.rodriguez@email.com',
              address: 'Carrera 20 # 15-30',
              city: 'Bogotá',
              relationshipId: 1,
            },
          ],
          registeredById: 1,
          familyMembers: [
            {
              name: 'Carlos Alberto González Martínez',
              birthDate: '1980-07-20',
              occupation: 'Ingeniero de Sistemas Senior',
              familyRelationshipId: 2,
              academicLevelId: 6,
            },
            {
              name: 'Ana Sofía González Rodríguez',
              birthDate: '2010-12-05',
              occupation: 'Estudiante de Primaria',
              familyRelationshipId: 1,
              academicLevelId: 2,
            },
            {
              name: 'Miguel Alejandro González Rodríguez',
              birthDate: '2015-06-18',
              occupation: 'Estudiante de Preescolar',
              familyRelationshipId: 1,
              academicLevelId: 1,
            },
          ],
          bioPsychosocialHistory: {
            schooling: 'Universidad',
            completedGrade: 'Profesional Completo',
            institution: 'Universidad Nacional de Colombia',
            profession: 'Psicóloga Clínica',
            incomeSource: 'Sueldo',
            incomeLevel: 'Más de 1 SMLV',
            occupationalHistory:
              '5 años como psicóloga clínica en hospital público, 3 años en consulta privada',
            housingTypeId: 1,
            academicLevelId: 3,
            incomeSourceId: 2,
            incomeLevelId: 4,
            housing:
              'Casa de 3 habitaciones, 2 baños, sala, comedor, cocina integral y patio trasero',
          },
          consultationReason: {
            reason:
              'La participante solicita orientación para manejar situaciones de estrés laboral que han comenzado a afectar su rendimiento profesional y la dinámica familiar.',
          },
          identifiedSituations: [
            'Estrés',
            'Problemas familiares',
            'Orientación general',
            'Baja autoestima',
            'Problemas espirituales',
          ],
          intervention: {
            intervention:
              'Se realizó sesión inicial de orientación psicológica de 90 minutos. Se aplicó entrevista semiestructurada para evaluación integral.',
          },
          followUpPlan: {
            plan: 'Se coordinó cita para iniciar proceso de orientación con seguimiento semanal por 8 semanas.',
          },
          physicalHealthHistory: {
            physicalConditions:
              'Hipertensión arterial controlada diagnosticada hace 3 años, migrañas tensionales frecuentes',
            receivingTreatment: 'Sí',
            treatmentDetails:
              'Losartán 50mg una vez al día en ayunas para hipertensión',
            paternalFamilyHistory:
              'Padre fallecido a los 65 años por infarto agudo de miocardio',
            maternalFamilyHistory:
              'Madre viva de 68 años con hipertensión arterial y artritis reumatoide',
            physicalHealthObservations:
              'Se recomienda continuar con controles médicos regulares',
          },
          mentalHealthHistory: {
            mentalConditions:
              'Episodios de ansiedad generalizada desde hace 2 años',
            receivingMentalTreatment: 'No',
            mentalTreatmentDetails: '',
            paternalMentalHistory:
              'Padre tenía tendencia al aislamiento social',
            maternalMentalHistory: 'Madre con episodios de depresión postparto',
            mentalHealthObservations:
              'Se sugiere evaluación psicológica especializada',
          },
          interventionPlans: [
            {
              goal: 'Reducir los niveles de estrés y ansiedad al 70% en un periodo de 8 semanas',
              objectives:
                'Aprender y aplicar técnicas de relajación progresiva',
              activities:
                'Sesiones semanales de orientación psicológica (8 sesiones)',
              timeframe:
                '8 semanas intensivas + 4 sesiones de seguimiento mensual',
              responsiblePerson: 'Psicóloga orientadora María Elena Vargas',
              evaluationCriteria:
                'Disminución de puntuación en escala de ansiedad GAD-7',
            },
          ],
          progressNotes: [
            {
              date: '2024-01-15',
              time: '10:30',
              approachType: 'CP',
              process: 'S',
              summary:
                'Primera sesión de orientación psicológica. Se estableció rapport adecuado.',
              observations:
                'María presenta insight adecuado sobre su situación',
              agreements:
                'Practicar técnicas de respiración diafragmática 2 veces al día',
            },
          ],
          referrals: {
            description:
              'Se refiere a Medicina General - Dr. Roberto Sánchez para evaluación de cefaleas tensionales',
          },
          closingNote: {
            closureReason:
              'Proceso completado exitosamente después de 8 sesiones individuales',
            achievements:
              'Reducción de ansiedad de 28 a 8 puntos en escala Beck',
            recommendations:
              'Continuar con práctica diaria de mindfulness y técnicas de respiración',
            observations:
              'María demostró excelente capacidad de insight y compromiso',
          },
        },
      },
      'ejemplo-basico': {
        summary: 'Ejemplo básico (campos mínimos)',
        description:
          'Request con solo los campos obligatorios para crear un participante',
        value: {
          firstName: 'Juan',
          firstLastName: 'Pérez',
          phoneNumber: '+57 300 555 1234',
          documentTypeId: 1,
          documentNumber: '9876543210',
          address: 'Calle 123 # 45-67',
          city: 'Medellín',
          birthDate: '1990-05-20',
          religiousAffiliation: 'Católica',
          genderId: 1,
          maritalStatusId: 2,
          healthInsuranceId: 1,
          emergencyContacts: [
            {
              name: 'Ana Pérez López',
              phone: '+57 301 555 5678',
              email: 'ana.perez@email.com',
              address: 'Calle 456 # 78-90',
              city: 'Medellín',
              relationshipId: 5,
            },
          ],
          registeredById: 1,
        },
      },
    },
  })
  create(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantsService.create(createParticipantDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de participantes con paginación y filtros',
    description:
      'Obtiene una lista paginada de participantes del sistema con capacidad de búsqueda y filtrado. ' +
      'Soporta búsqueda por nombre/apellido, filtro por ciudad, y paginación configurable. ' +
      'Útil para listados generales, búsquedas rápidas y vistas administrativas. ' +
      'Por defecto retorna 10 participantes por página ordenados por fecha de creación descendente.',
  })
  @ApiOkResponse({
    description:
      'Lista de participantes obtenida exitosamente con metadatos de paginación.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              firstName: { type: 'string', example: 'María' },
              firstLastName: { type: 'string', example: 'González' },
              documentNumber: { type: 'string', example: '1234567890' },
              city: { type: 'string', example: 'Bogotá' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Término de búsqueda para filtrar por nombre o apellido del participante. La búsqueda es insensible a mayúsculas/minúsculas y busca coincidencias parciales.',
    type: String,
    example: 'María González',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description:
      'Filtrar participantes por ciudad de residencia. Busca coincidencia exacta.',
    type: String,
    example: 'Bogotá',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description:
      'Número de página a consultar (inicia en 1). Por defecto es la página 1.',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description:
      'Cantidad de registros por página (máximo 100). Por defecto son 10 registros.',
    type: Number,
    example: 10,
  })
  @ApiBadRequestResponse({
    description:
      'Parámetros de consulta inválidos. Verifica que page y limit sean números positivos.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'page must be a positive number',
          'limit must not exceed 100',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al consultar los participantes.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      },
    },
  })
  findAll(@Query() searchDto: SearchParticipantsDto) {
    return this.participantsService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener participante completo por ID',
    description:
      'Obtiene todos los datos de un participante específico por su ID único, incluyendo: ' +
      'información personal completa, datos de contacto, contacto de emergencia, miembros de familia, ' +
      'historia biopsicosocial, y relaciones con catálogos (género, estado civil, tipo de documento, etc.). ' +
      'Útil para vistas de detalle y edición de participantes.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del participante a consultar',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Participante encontrado exitosamente con toda su información.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        firstName: { type: 'string', example: 'María' },
        secondName: { type: 'string', example: 'Fernanda' },
        firstLastName: { type: 'string', example: 'González' },
        secondLastName: { type: 'string', example: 'Rodríguez' },
        phoneNumber: { type: 'string', example: '+57 300 123 4567' },
        email: { type: 'string', example: 'maria.gonzalez@email.com' },
        documentNumber: { type: 'string', example: '1234567890' },
        address: { type: 'string', example: 'Carrera 15 # 32-45' },
        city: { type: 'string', example: 'Bogotá' },
        birthDate: { type: 'string', format: 'date', example: '1985-03-15' },
        religiousAffiliation: { type: 'string', example: 'Congregación Mita' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({
    description:
      'Participante no encontrado con el ID proporcionado o fue eliminado (soft delete).',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Participant with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'ID inválido proporcionado. Debe ser un número entero.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al consultar el participante.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.participantsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar datos de un participante',
    description:
      'Actualiza parcialmente los datos de un participante existente. Solo se actualizan los campos proporcionados en el body, ' +
      'el resto de campos permanecen sin cambios (actualización parcial - PATCH). ' +
      'Permite actualizar información personal, contacto, emergencia, y datos relacionados. ' +
      'NOTA: Para actualizar información médica, utilice los endpoints de CASOS.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del participante a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    description:
      'Datos del participante a actualizar. Todos los campos son opcionales. Solo incluya los campos que desea modificar.',
    type: UpdateParticipantDto,
    examples: {
      'actualizar-contacto': {
        summary: 'Actualizar solo información de contacto',
        value: {
          phoneNumber: '+57 300 999 8888',
          email: 'nuevo.email@example.com',
          address: 'Nueva dirección Calle 100 # 20-30',
        },
      },
      'actualizar-emergencia': {
        summary: 'Actualizar/agregar contactos de emergencia',
        value: {
          emergencyContacts: [
            {
              name: 'Pedro Gómez',
              phone: '+57 301 888 7777',
              email: 'pedro.gomez@email.com',
              address: 'Calle 100 # 50-20',
              city: 'Cali',
              relationshipId: 3,
            },
          ],
        },
      },
      'actualizar-completo': {
        summary: 'Actualización múltiple de campos',
        value: {
          secondName: 'Isabel',
          phoneNumber: '+57 300 111 2222',
          city: 'Cali',
          maritalStatusId: 2,
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'Participante actualizado exitosamente. Retorna el participante con los cambios aplicados.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        firstName: { type: 'string', example: 'María' },
        firstLastName: { type: 'string', example: 'González' },
        phoneNumber: { type: 'string', example: '+57 300 999 8888' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Participante no encontrado con el ID proporcionado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Participant with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Datos de actualización inválidos. Verifica el formato de los campos proporcionados.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'phoneNumber must match the format +57 XXX XXX XXXX',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflicto: El número de documento actualizado ya está en uso por otro participante.',
    schema: {
      example: {
        statusCode: 409,
        message:
          'El número de documento 1234567890 ya está registrado para otro participante',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al actualizar el participante.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      },
    },
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateParticipantDto) {
    return this.participantsService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar participante (Soft Delete)',
    description:
      'Realiza un borrado lógico (soft delete) del participante. Los datos NO se eliminan físicamente de la base de datos, ' +
      'solo se marca el registro con una fecha de eliminación (deletedAt). ' +
      'El participante y toda su información permanecen en la base de datos para auditoría e histórico, ' +
      'pero ya no aparecerán en las consultas normales. ' +
      'IMPORTANTE: Esta operación también afecta a todos los casos y datos médicos asociados al participante.',
  })
  @ApiParam({
    name: 'id',
    description:
      'ID único del participante a eliminar (borrado lógico, no físico)',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description:
      'Participante eliminado exitosamente mediante borrado lógico. Los datos permanecen en la base de datos.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Participante eliminado exitosamente',
        },
        deletedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({
    description:
      'Participante no encontrado con el ID proporcionado o ya fue eliminado previamente.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Participant with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'ID inválido proporcionado. Debe ser un número entero.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al eliminar el participante.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.participantsService.remove(+id);
  }

  @Get('stats/demographic')
  @ApiOperation({
    summary: 'Obtener estadísticas demográficas de participantes',
    description:
      'Obtiene estadísticas y análisis demográfico de todos los participantes registrados en el sistema. ' +
      'Incluye distribución por género, ciudad de residencia, rangos de edad, estado civil, y otros indicadores demográficos. ' +
      'Útil para reportes, análisis poblacional, dashboards administrativos y toma de decisiones. ' +
      'Los datos se calculan en tiempo real sobre todos los participantes activos (no eliminados).',
  })
  @ApiOkResponse({
    description:
      'Estadísticas demográficas obtenidas exitosamente con información detallada de distribución poblacional.',
    schema: {
      type: 'object',
      properties: {
        totalParticipants: { type: 'number', example: 150 },
        byGender: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              gender: { type: 'string', example: 'Femenino' },
              count: { type: 'number', example: 85 },
              percentage: { type: 'number', example: 56.7 },
            },
          },
        },
        byCity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              city: { type: 'string', example: 'Bogotá' },
              count: { type: 'number', example: 45 },
              percentage: { type: 'number', example: 30.0 },
            },
          },
        },
        byAgeRange: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              range: { type: 'string', example: '25-35' },
              count: { type: 'number', example: 40 },
              percentage: { type: 'number', example: 26.7 },
            },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      'Error interno del servidor al generar las estadísticas demográficas.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error al generar estadísticas demográficas',
        error: 'Internal Server Error',
      },
    },
  })
  getStats() {
    return this.participantsService.getDemographicStats();
  }
}
