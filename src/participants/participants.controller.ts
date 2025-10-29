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
    summary: 'Crear nuevo participante',
    description:
      'Crea un nuevo participante en el sistema OOTS con toda su información personal, familiar, médica y psicosocial',
  })
  @ApiCreatedResponse({
    description: 'Participante creado exitosamente',
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
    description: 'Datos de entrada inválidos',
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
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error interno del servidor' },
      },
    },
  })
  @ApiBody({
    description: 'Datos completos del participante a crear',
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
          emergencyContactName: 'Carlos Alberto González Martínez',
          emergencyContactPhone: '+57 301 987 6543',
          emergencyContactEmail: 'carlos.gonzalez@email.com',
          emergencyContactAddress: 'Calle 45 # 12-34, Casa 101',
          emergencyContactCity: 'Bogotá',
          emergencyContactRelationshipId: 4,
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
            educationLevelId: 3,
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
          assessment: {
            consultationReason:
              'Estrés laboral crónico con impacto en funcionamiento familiar y personal',
            weighting:
              'Situación de estrés moderado a severo con riesgo de progresión',
            concurrentFactors:
              'Presión laboral elevada, responsabilidades familiares múltiples',
            criticalFactors: 'Deterioro progresivo de la calidad del sueño',
            problemAnalysis:
              'María presenta un cuadro de estrés laboral crónico que ha evolucionado hacia síntomas ansiosos',
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
          emergencyContactName: 'Ana Pérez López',
          emergencyContactPhone: '+57 301 555 5678',
          emergencyContactEmail: 'ana.perez@email.com',
          emergencyContactAddress: 'Calle 456 # 78-90',
          emergencyContactCity: 'Medellín',
          emergencyContactRelationshipId: 5,
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
    summary: 'Obtener todos los participantes',
    description:
      'Obtiene una lista paginada de participantes con filtros opcionales de búsqueda',
  })
  @ApiOkResponse({
    description: 'Lista de participantes obtenida exitosamente',
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
    description: 'Buscar por nombre o apellido del participante',
    type: String,
    example: 'María',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Filtrar por ciudad',
    type: String,
    example: 'Bogotá',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de registros por página',
    type: Number,
    example: 10,
  })
  @ApiBadRequestResponse({
    description: 'Parámetros de consulta inválidos',
  })
  findAll(@Query() searchDto: SearchParticipantsDto) {
    return this.participantsService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener participante por ID',
    description:
      'Obtiene los datos completos de un participante específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del participante',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Participante encontrado exitosamente',
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
    description: 'Participante no encontrado',
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
    description: 'ID inválido proporcionado',
  })
  findOne(@Param('id') id: string) {
    return this.participantsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar participante',
    description:
      'Actualiza los datos de un participante existente. Solo se actualizan los campos proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del participante a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    description: 'Datos del participante a actualizar (campos opcionales)',
    type: UpdateParticipantDto,
  })
  @ApiOkResponse({
    description: 'Participante actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        firstName: { type: 'string', example: 'María' },
        firstLastName: { type: 'string', example: 'González' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Participante no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Datos de actualización inválidos',
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateParticipantDto) {
    return this.participantsService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar participante',
    description:
      'Realiza un borrado lógico (soft delete) del participante. Los datos no se eliminan físicamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del participante a eliminar',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Participante eliminado exitosamente',
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
    description: 'Participante no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'ID inválido proporcionado',
  })
  remove(@Param('id') id: string) {
    return this.participantsService.remove(+id);
  }

  @Get('stats/demographic')
  @ApiOperation({
    summary: 'Estadísticas demográficas',
    description:
      'Obtiene estadísticas demográficas de los participantes registrados en el sistema',
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
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
    description: 'Error al generar estadísticas',
  })
  getStats() {
    return this.participantsService.getDemographicStats();
  }
}
