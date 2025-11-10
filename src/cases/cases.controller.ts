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

@ApiTags('Casos')
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo caso para un participante',
    description:
      '**Crea un caso médico completo asociado a un participante específico.**\n\n' +
      '### Características principales:\n' +
      '- ✅ Número de caso generado automáticamente (formato: CASE-XXXX)\n' +
      '- ✅ Información médica inicial completa del participante\n' +
      '- ✅ Registro de situaciones identificadas y motivo de consulta\n' +
      '- ✅ Plan de intervención inicial y seguimiento\n' +
      '- ✅ Historiales de salud física y mental\n' +
      '- ✅ Notas de progreso y referidos externos\n\n' +
      '### Flujo de trabajo:\n' +
      '1. Se valida que el participante exista en el sistema\n' +
      '2. Se genera automáticamente el número de caso consecutivo\n' +
      '3. Se crea el caso con estado inicial "OPEN"\n' +
      '4. Se registran todas las entidades médicas relacionadas\n' +
      '5. Se retorna el caso completo con toda la información asociada\n\n' +
      '### Campos opcionales vs obligatorios:\n' +
      '**Obligatorios:** participantId, consultationReason, identifiedSituations\n' +
      '**Opcionales:** intervention, followUpPlan, physicalHealthHistory, mentalHealthHistory, ' +
      'interventionPlans, progressNotes, referrals, closingNote\n\n' +
      '💡 **Tip:** Puede crear un caso básico con solo los campos obligatorios e ir agregando información médica posteriormente.',
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
      '✅ **Caso creado exitosamente**\n\n' +
      'El caso se ha registrado correctamente con todas las entidades médicas relacionadas. ' +
      'El sistema ha generado automáticamente un número de caso único y ha asociado toda la información proporcionada.\n\n' +
      '**Respuesta incluye:**\n' +
      '- Número de caso asignado automáticamente\n' +
      '- Estado inicial del caso (OPEN)\n' +
      '- Fechas de creación y última actualización\n' +
      '- Todas las entidades médicas creadas (historiales, planes, notas)',
    type: CaseResponseDto,
    schema: {
      example: {
        id: 1,
        caseNumber: 'CASE-0001',
        status: 'open',
        participantId: 1,
        consultationReason:
          'Paciente consulta por síntomas de ansiedad generalizada y estrés laboral crónico',
        intervention:
          'Sesión inicial de orientación psicológica de 90 minutos. Entrevista semiestructurada',
        identifiedSituations: [
          { id: 1, name: 'Ansiedad' },
          { id: 3, name: 'Estrés laboral' },
        ],
        followUpPlan: [
          { id: 1, name: 'Sesiones semanales' },
          { id: 2, name: 'Evaluación mensual' },
        ],
        createdAt: '2024-11-03T19:30:00.000Z',
        updatedAt: '2024-11-03T19:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      '❌ **Datos de entrada inválidos**\n\n' +
      'La solicitud contiene errores de validación. Verifique que todos los campos obligatorios estén presentes ' +
      'y tengan el formato correcto.\n\n' +
      '**Causas comunes:**\n' +
      '- El participantId no fue proporcionado o no es un número\n' +
      '- El consultationReason está vacío o supera el límite de caracteres\n' +
      '- Las identifiedSituations no son un array de números válidos\n' +
      '- Formato incorrecto en fechas de notas de progreso',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'participantId must be a number',
          'consultationReason should not be empty',
          'identifiedSituations must be an array',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      '❌ **Participante no encontrado**\n\n' +
      'El participante especificado en participantId no existe en el sistema. ' +
      'Asegúrese de que el participante haya sido registrado previamente.\n\n' +
      '**Solución:** Verifique el ID del participante o regístrelo primero en `/api/v1/participants`',
    schema: {
      example: {
        statusCode: 404,
        message: 'Participant with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      '⚠️ **Conflicto de datos**\n\n' +
      'Ya existe un caso activo para este participante o hay conflictos con otras entidades relacionadas.',
    schema: {
      example: {
        statusCode: 409,
        message:
          'Participant already has an open case. Please close or complete the existing case first.',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description:
      '❌ **Error interno del servidor**\n\n' +
      'Ocurrió un error inesperado al procesar la creación del caso. El equipo técnico ha sido notificado.\n\n' +
      '**Posibles causas:**\n' +
      '- Error en la transacción de base de datos\n' +
      '- Fallo al crear entidades relacionadas\n' +
      '- Problema de conexión con la base de datos',
    schema: {
      example: {
        statusCode: 500,
        message: 'Error al crear el caso y sus entidades relacionadas',
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
    summary: 'Obtener historial completo de casos de un participante',
    description:
      '**Consulta todos los casos médicos asociados a un participante específico.**\n\n' +
      '### Información retornada:\n' +
      '- 📋 Lista completa de casos del participante\n' +
      '- 🔢 Número y estado de cada caso\n' +
      '- 📅 Fechas de apertura y última actualización\n' +
      '- 📝 Motivo de consulta de cada caso\n' +
      '- ✅ Ordenados del más reciente al más antiguo\n\n' +
      '### Casos prácticos:\n' +
      '- Ver historial médico completo del participante\n' +
      '- Identificar casos abiertos o en progreso\n' +
      '- Generar reportes de seguimiento\n' +
      '- Análisis de evolución del tratamiento\n\n' +
      '💡 **Nota:** Si el participante existe pero no tiene casos, retorna un array vacío `[]`',
  })
  @ApiParam({
    name: 'participantId',
    description:
      '**ID único del participante**\n\n' +
      'Identificador numérico del participante del cual se desea consultar el historial de casos.\n' +
      'Debe ser un número entero positivo correspondiente a un participante registrado en el sistema.',
    type: Number,
    example: 1,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      '✅ **Historial de casos obtenido exitosamente**\n\n' +
      'Retorna el historial completo de casos médicos del participante. ' +
      'Los casos están ordenados cronológicamente del más reciente al más antiguo.\n\n' +
      '**Estados posibles de casos:**\n' +
      '- `open`: Caso abierto, pendiente de atención inicial\n' +
      '- `in_progress`: Caso en tratamiento activo\n' +
      '- `on_hold`: Caso en pausa temporal\n' +
      '- `closed`: Caso cerrado y finalizado',
    type: [CaseResponseDto],
    schema: {
      example: [
        {
          id: 3,
          caseNumber: 'CASE-0003',
          status: 'in_progress',
          participantId: 1,
          consultationReason:
            'Consulta de seguimiento post-tratamiento de ansiedad',
          intervention: 'Sesión de evaluación y ajuste de plan terapéutico',
          createdAt: '2024-11-01T10:30:00.000Z',
          updatedAt: '2024-11-03T14:20:00.000Z',
        },
        {
          id: 2,
          caseNumber: 'CASE-0002',
          status: 'closed',
          participantId: 1,
          consultationReason: 'Tratamiento de ansiedad generalizada',
          intervention: 'Sesiones semanales de orientación psicológica',
          createdAt: '2024-09-15T14:20:00.000Z',
          updatedAt: '2024-10-20T16:45:00.000Z',
          closedAt: '2024-10-20T16:45:00.000Z',
        },
        {
          id: 1,
          caseNumber: 'CASE-0001',
          status: 'closed',
          participantId: 1,
          consultationReason: 'Primera consulta por estrés laboral',
          intervention: 'Evaluación inicial y orientación',
          createdAt: '2024-08-10T09:00:00.000Z',
          updatedAt: '2024-09-01T11:30:00.000Z',
          closedAt: '2024-09-01T11:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description:
      '❌ **Parámetro inválido**\n\n' +
      'El ID del participante proporcionado no tiene el formato correcto.\n\n' +
      '**Formato esperado:** Número entero positivo\n' +
      '**Ejemplo válido:** `/participants/1/cases`\n' +
      '**Ejemplo inválido:** `/participants/abc/cases`',
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
    description:
      '❌ **Participante no encontrado**\n\n' +
      'No existe un participante registrado con el ID proporcionado en el sistema.\n\n' +
      '**Solución:**\n' +
      '1. Verifique que el ID del participante sea correcto\n' +
      '2. Confirme que el participante esté registrado en `/api/v1/participants`\n' +
      '3. Consulte la lista completa de participantes para obtener IDs válidos',
    schema: {
      example: {
        statusCode: 404,
        message: 'Participant with ID 999 not found',
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
    summary: 'Obtener detalles completos de un caso médico',
    description:
      '**Consulta información completa y detallada de un caso específico.**\n\n' +
      '### Información incluida:\n' +
      '#### 📋 Datos básicos del caso\n' +
      '- Número de caso y estado actual\n' +
      '- Fechas de creación, actualización y cierre\n' +
      '- Motivo de consulta e intervención inicial\n\n' +
      '#### 👤 Información del participante\n' +
      '- Datos personales completos\n' +
      '- Información de contacto\n' +
      '- Demografía y ubicación\n\n' +
      '#### 🏥 Historiales médicos\n' +
      '- Historial de salud física (condiciones, medicamentos, antecedentes familiares)\n' +
      '- Historial de salud mental (condiciones, medicamentos, antecedentes)\n\n' +
      '#### 📊 Seguimiento y tratamiento\n' +
      '- Situaciones identificadas durante la evaluación\n' +
      '- Plan de seguimiento establecido\n' +
      '- Planes de intervención con objetivos y actividades\n' +
      '- Notas de progreso de cada sesión\n' +
      '- Ponderación profesional y evaluaciones\n\n' +
      '#### 🔄 Referencias y cierre\n' +
      '- Referidos a otros profesionales o servicios\n' +
      '- Nota de cierre del caso (si está cerrado)\n\n' +
      '💡 **Uso principal:** Consulta completa para profesionales de salud, generación de reportes médicos detallados.',
  })
  @ApiParam({
    name: 'id',
    description:
      '**ID único del caso médico**\n\n' +
      'Identificador numérico del caso a consultar. Debe corresponder a un caso existente en el sistema.\n\n' +
      '**Formato:** Número entero positivo',
    type: Number,
    example: 1,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      '✅ **Caso encontrado exitosamente**\n\n' +
      '**Retorna objeto completo con:**\n' +
      '- 📋 **Datos del caso:** caseNumber, status, reason, initialIntervention, closingNote\n' +
      '- 👤 **Participante:** fullName, documentNumber, age, gender, contactInfo\n' +
      '- 🏥 **Historial físico:** physicalConditions, medications, familyHistory, allergies\n' +
      '- 🧠 **Historial mental:** mentalConditions, medications, history, evaluations\n' +
      '- 🎯 **Situaciones identificadas:** lista de condiciones/problemas detectados\n' +
      '- 📊 **Plan de seguimiento:** estrategia y acciones a seguir\n' +
      '- ⚕️ **Ponderación profesional:** evaluación clínica del profesional\n' +
      '- 📝 **Planes de intervención:** objetivos, actividades, tiempos estimados\n' +
      '- 📅 **Notas de progreso:** sesiones, observaciones, avances por fecha\n' +
      '- 🔄 **Referidos:** derivaciones a especialistas u otros servicios\n' +
      '- 🏁 **Nota de cierre:** resumen final si el caso está cerrado',
    type: CaseResponseDto,
    schema: {
      example: {
        id: 1,
        caseNumber: 'CASE-0001',
        status: 'in_progress',
        participantId: 1,
        consultationReason:
          'Consulta por síntomas de ansiedad y estrés laboral persistente durante últimos 3 meses',
        intervention:
          'Sesión inicial de orientación psicológica de 90 minutos. Se aplicó entrevista semiestructurada y técnicas de respiración',
        closingNote: null,
        createdAt: '2024-10-31T10:30:00.000Z',
        updatedAt: '2024-11-15T15:45:00.000Z',
        closedAt: null,
        participant: {
          id: 1,
          fullName: 'María González Pérez',
          firstName: 'María',
          firstLastName: 'González',
          secondLastName: 'Pérez',
          documentType: 'Cédula de Ciudadanía',
          documentNumber: '1234567890',
          age: 32,
          gender: 'Femenino',
          phone: '+57 300 1234567',
          email: 'maria.gonzalez@email.com',
          address: 'Calle 45 #12-34, Barrio Centro',
          city: 'Bogotá',
          department: 'Cundinamarca',
        },
        physicalHealthHistory: {
          id: 1,
          hasConditions: true,
          currentConditions:
            'Hipertensión arterial controlada diagnosticada hace 3 años',
          medications: 'Losartán 50mg una vez al día en ayunas',
          familyHistoryFather:
            'Padre fallecido a los 65 años por infarto agudo de miocardio',
          familyHistoryMother:
            'Madre viva de 68 años con hipertensión arterial',
          allergies: 'Alergia a penicilina',
          observations:
            'Se recomienda continuar con controles médicos regulares cada 6 meses',
        },
        mentalHealthHistory: {
          id: 1,
          hasConditions: true,
          currentConditions:
            'Episodios de ansiedad generalizada desde hace 2 años',
          medications: 'Ninguno actualmente',
          familyHistoryFather: 'Padre tenía tendencia al aislamiento social',
          familyHistoryMother: 'Madre con episodios de depresión postparto',
          previousTreatments:
            'Terapia breve hace 1 año (6 sesiones), sin seguimiento posterior',
          observations:
            'Se sugiere evaluación psicológica especializada complementaria',
        },
        identifiedSituations: [
          { id: 1, name: 'Ansiedad generalizada', isActive: true },
          { id: 5, name: 'Trastorno del sueño', isActive: true },
          { id: 8, name: 'Estrés laboral', isActive: true },
        ],
        followUpPlan: {
          id: 1,
          strategy:
            'Terapia cognitivo-conductual con enfoque en manejo de ansiedad y estrés laboral',
          frequency: '1 sesión semanal de 60 minutos',
          estimatedDuration: '3 meses iniciales con evaluación de progreso',
          objectives: [
            'Reducir síntomas de ansiedad',
            'Mejorar calidad del sueño',
            'Desarrollar estrategias de afrontamiento',
          ],
        },
        professionalWeighting: {
          id: 1,
          assessment:
            'Caso de complejidad media. Participante con buen nivel de conciencia sobre su situación',
          severity: 'Moderada',
          recommendations:
            'Continuar con terapia semanal. Considerar interconsulta con psiquiatría si no hay mejoría en 8 semanas',
          prognosis: 'Favorable con adherencia al tratamiento',
        },
        interventionPlans: [
          {
            id: 1,
            goal: 'Reducir niveles de ansiedad al 70% en 8 semanas',
            objectives:
              'Aprender y aplicar técnicas de relajación, reestructuración cognitiva de pensamientos ansiógenos',
            activities:
              'Sesiones semanales de orientación psicológica (8 sesiones totales). Tareas entre sesiones: diario de pensamientos y ejercicios de respiración diafragmática',
            timeline:
              '8 semanas intensivas + 4 sesiones de seguimiento mensual',
            responsible: 'Psicóloga orientadora María Elena Vargas',
            evaluationCriteria:
              'Disminución de puntuación en escala de ansiedad GAD-7 de 15 a 7 puntos',
          },
          {
            id: 2,
            goal: 'Mejorar calidad del sueño y establecer rutina saludable',
            objectives: 'Lograr 7-8 horas de sueño continuo por noche',
            activities:
              'Higiene del sueño, técnicas de relajación nocturna, ajuste de rutinas',
            timeline: '6 semanas',
            responsible: 'Equipo interdisciplinario',
            evaluationCriteria:
              'Registro de sueño mostrando mejoría en latencia y continuidad',
          },
        ],
        progressNotes: [
          {
            id: 1,
            sessionDate: '2024-10-31T14:00:00.000Z',
            sessionNumber: 1,
            sessionType: 'Individual',
            duration: 90,
            summary:
              'Primera sesión completada exitosamente. Participante mostró buena receptividad y motivación para el cambio',
            observations:
              'Identificadas cogniciones distorsionadas relacionadas con perfeccionismo laboral. Practica ejercicios de respiración diafragmática',
            nextSteps:
              'Continuar con reestructuración cognitiva. Asignar diario de pensamientos',
          },
          {
            id: 2,
            sessionDate: '2024-11-07T14:00:00.000Z',
            sessionNumber: 2,
            sessionType: 'Individual',
            duration: 60,
            summary:
              'Revisión de tareas. Participante completó diario de pensamientos',
            observations:
              'Progreso leve en identificación de distorsiones cognitivas. Reporta mejoría en calidad de sueño',
            nextSteps: 'Profundizar en técnicas de afrontamiento ante estrés',
          },
        ],
        referrals: [
          {
            id: 1,
            referredTo: 'Médico psiquiatra Dr. Carlos Rodríguez',
            reason:
              'Evaluación para posible tratamiento farmacológico complementario',
            date: '2024-11-10T00:00:00.000Z',
            status: 'Pendiente',
            observations:
              'Considerar si no hay respuesta satisfactoria a terapia en 8 semanas',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      '❌ **Error de validación**\n\n' +
      '**Causa:** El ID proporcionado no es válido\n\n' +
      '**Ejemplos de IDs inválidos:**\n' +
      '- IDs negativos: `-1`, `-999`\n' +
      '- IDs no numéricos: `"abc"`, `"caso123"`\n' +
      '- IDs con formato incorrecto: `1.5`, `"1a"`\n\n' +
      '**Solución:** Proporciona un número entero positivo como ID del caso.',
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
    description:
      '⚠️ **Caso no encontrado**\n\n' +
      '**Causa:** No existe ningún caso con el ID proporcionado en la base de datos.\n\n' +
      '**Posibles razones:**\n' +
      '- El ID del caso no existe\n' +
      '- El caso fue eliminado\n' +
      '- Error de tipeo en el ID\n\n' +
      '**Solución:**\n' +
      '1. Verifica el ID del caso\n' +
      '2. Consulta la lista de casos activos con `GET /cases`\n' +
      '3. Usa `GET /participants/:id/cases` para ver casos de un participante específico',
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
    summary: 'Cambiar estado de un caso médico',
    description:
      '**Actualiza el estado de un caso específico con validación de transiciones permitidas.**\n\n' +
      '### Estados disponibles:\n' +
      '- 🆕 **open:** Caso abierto, pendiente de atención inicial\n' +
      '- ⚡ **in_progress:** Caso en tratamiento activo\n' +
      '- ⏸️ **on_hold:** Caso en pausa temporal (ej: participante viajó, enfermedad)\n' +
      '- ✅ **closed:** Caso finalizado y cerrado\n\n' +
      '### Transiciones válidas:\n' +
      '```\n' +
      'open → in_progress → on_hold → in_progress → closed\n' +
      '  ↓                      ↓                      ↓\n' +
      'closed              in_progress              closed\n' +
      '```\n\n' +
      '### Reglas de negocio:\n' +
      '- ⚠️ **Para cerrar un caso** es OBLIGATORIO proporcionar una nota de cierre\n' +
      '- 📝 La nota de cierre debe incluir: resumen del tratamiento, resultados obtenidos, recomendaciones finales\n' +
      '- 🔄 Un caso cerrado NO puede ser reabierto (crear nuevo caso si es necesario)\n' +
      '- ⏸️ Un caso en pausa puede reactivarse a "in_progress"\n\n' +
      '💡 **Casos de uso:**\n' +
      '- Iniciar atención: `open` → `in_progress`\n' +
      '- Pausar temporalmente: `in_progress` → `on_hold`\n' +
      '- Finalizar tratamiento: `in_progress` → `closed` (con nota de cierre)',
  })
  @ApiParam({
    name: 'id',
    description:
      '**ID único del caso médico**\n\n' +
      'Identificador numérico del caso cuyo estado se desea actualizar.\n' +
      'Debe corresponder a un caso existente y accesible.',
    type: Number,
    example: 1,
    required: true,
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
      '✅ **Estado actualizado exitosamente**\n\n' +
      'El caso ha cambiado de estado correctamente. Retorna el caso completo con:\n' +
      '- 🔄 **Nuevo estado** reflejado en el campo `status`\n' +
      '- 📅 **updatedAt** actualizado con fecha/hora del cambio\n' +
      '- 🏁 **closedAt** con fecha de cierre si el estado es `closed`\n' +
      '- 📋 Toda la información del caso incluyendo datos del participante',
    type: CaseResponseDto,
    schema: {
      example: {
        id: 1,
        caseNumber: 'CASE-0001',
        status: 'in_progress',
        participantId: 1,
        consultationReason:
          'Consulta por síntomas de ansiedad y estrés laboral',
        intervention: 'Sesión inicial de orientación psicológica',
        closingNote: null,
        createdAt: '2024-10-31T10:30:00.000Z',
        updatedAt: '2024-11-15T16:20:00.000Z',
        closedAt: null,
        participant: {
          id: 1,
          fullName: 'María González',
          documentNumber: '1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      '❌ **Error de validación**\n\n' +
      '**Causa:** El estado proporcionado no es válido\n\n' +
      '**Estados permitidos:**\n' +
      '- `open` - Caso abierto\n' +
      '- `in_progress` - En progreso\n' +
      '- `on_hold` - En pausa\n' +
      '- `closed` - Cerrado\n\n' +
      '**Ejemplo correcto:**\n```json\n{ "status": "in_progress" }\n```\n\n' +
      '**Ejemplo incorrecto:**\n```json\n{ "status": "active" } // ❌ No existe este estado\n```',
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
    description:
      '⚠️ **Caso no encontrado**\n\n' +
      'No existe un caso con el ID proporcionado.\n\n' +
      '**Solución:**\n' +
      '1. Verifica el ID del caso\n' +
      '2. Consulta la lista de casos disponibles con `GET /cases`',
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
      '⚠️ **No se puede procesar la solicitud**\n\n' +
      '**Causa más común:** Intento de cerrar un caso sin nota de cierre\n\n' +
      '**Regla de negocio:** Para cambiar el estado a `closed`, primero debes:\n' +
      '1. Agregar una nota de cierre al caso usando el endpoint correspondiente\n' +
      '2. La nota debe incluir: resumen del tratamiento, resultados, recomendaciones\n' +
      '3. Luego puedes cambiar el estado a `closed`\n\n' +
      '**Ejemplo de flujo correcto:**\n```\n' +
      '1. PATCH /cases/:id/closing-note\n' +
      '   Body: { "closingNote": "Tratamiento finalizado exitosamente..." }\n\n' +
      '2. PATCH /cases/:id/status\n' +
      '   Body: { "status": "closed" }\n' +
      '```\n\n' +
      '**Otras causas posibles:**\n' +
      '- Transición de estado no permitida\n' +
      '- Caso ya está en el estado solicitado\n' +
      '- Requisitos previos no cumplidos',
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

  @Get('by-user/:userId')
  @ApiOperation({
    summary: 'Obtener casos de participantes creados por un usuario específico',
    description:
      '**Consulta todos los casos médicos de participantes registrados por un usuario específico.**\n\n' +
      '### Información retornada:\n' +
      '- 📋 **Datos del caso:** número, estado, motivo de consulta, intervención\n' +
      '- 👤 **Información del participante:** nombre completo, documento, edad\n' +
      '- 📅 **Fechas:** creación, actualización, cierre (si aplica)\n' +
      '- 🔄 **Estado:** open, in_progress, on_hold, closed\n\n' +
      '### Características:\n' +
      '- ✅ Solo casos de participantes creados por el usuario especificado\n' +
      '- 📊 Incluye contador total de casos\n' +
      '- ⬇️ Ordenados por fecha de creación (más recientes primero)\n\n' +
      '### Casos de uso:\n' +
      '- Ver mis casos como profesional\n' +
      '- Reportes por usuario\n' +
      '- Carga de trabajo individual\n' +
      '- Auditoría de atención por profesional',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario que registró los participantes',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de casos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        total: { type: 'number', example: 15 },
        cases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              caseNumber: { type: 'string', example: 'CASE-0001' },
              status: { type: 'string', example: 'in_progress' },
              consultationReason: {
                type: 'string',
                example: 'Consulta por ansiedad',
              },
              createdAt: { type: 'string', format: 'date-time' },
              participant: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  fullName: { type: 'string', example: 'María González' },
                  documentNumber: { type: 'string', example: '1234567890' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  findCasesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.casesService.findCasesByUser(userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los casos médicos del sistema',
    description:
      '**Obtiene la lista completa de todos los casos registrados en el sistema.**\n\n' +
      '### Información incluida:\n' +
      '- **Datos básicos de cada caso:** número, estado, motivo de consulta\n' +
      '- **Información del participante:** nombre completo, documento de identidad\n' +
      '- **Fechas:** creación, última actualización, cierre (si aplica)\n' +
      '- **Estado actual:** open, in_progress, on_hold, closed\n\n' +
      '### Características:\n' +
      '- **Ordenamiento:** Del caso más reciente al más antiguo (por fecha de creación)\n' +
      '- **Paginación:** Actualmente retorna todos los casos (considerar paginación en producción)\n' +
      '- **Filtros:** No implementados actualmente (usar endpoints específicos para búsquedas filtradas)\n\n' +
      '### Casos de uso:\n' +
      '- **Vista administrativa:** Panel de control con todos los casos del sistema\n' +
      '- **Dashboards:** Estadísticas y métricas generales de atención\n' +
      '- **Reportes:** Generación de reportes institucionales y de gestión\n' +
      '- **Búsqueda general:** Exploración de casos sin filtros previos\n\n' +
      '**Recomendación:** Para búsquedas específicas, usar:\n' +
      '- `GET /participants/:id/cases` para casos de un participante\n' +
      '- `GET /cases/:id` para detalles completos de un caso específico',
  })
  @ApiResponse({
    status: 200,
    description:
      '✅ **Lista de casos obtenida exitosamente**\n\n' +
      'Retorna array con todos los casos del sistema, cada uno incluyendo:\n' +
      '- **Información del caso:** número, estado, motivo de consulta, intervención\n' +
      '- **Datos del participante:** nombre completo y documento de identidad\n' +
      '- **Fechas:** creación, última actualización, cierre (si está cerrado)\n\n' +
      '**Nota:** Si no hay casos registrados, retorna un array vacío `[]`',
    type: [CaseResponseDto],
    schema: {
      example: [
        {
          id: 1,
          caseNumber: 'CASE-0001',
          status: 'in_progress',
          participantId: 1,
          consultationReason:
            'Consulta por síntomas de ansiedad y estrés laboral persistente',
          intervention:
            'Sesión inicial de orientación psicológica de 90 minutos',
          closingNote: null,
          createdAt: '2024-10-31T10:30:00.000Z',
          updatedAt: '2024-11-15T15:45:00.000Z',
          closedAt: null,
          participant: {
            id: 1,
            fullName: 'María González Pérez',
            firstName: 'María',
            firstLastName: 'González',
            secondLastName: 'Pérez',
            documentNumber: '1234567890',
            age: 32,
          },
        },
        {
          id: 2,
          caseNumber: 'CASE-0002',
          status: 'open',
          participantId: 2,
          consultationReason:
            'Primera consulta por proceso de duelo tras pérdida familiar reciente',
          intervention: null,
          closingNote: null,
          createdAt: '2024-10-30T14:20:00.000Z',
          updatedAt: '2024-10-30T14:20:00.000Z',
          closedAt: null,
          participant: {
            id: 2,
            fullName: 'Juan Pérez Rodríguez',
            firstName: 'Juan',
            firstLastName: 'Pérez',
            secondLastName: 'Rodríguez',
            documentNumber: '9876543210',
            age: 45,
          },
        },
        {
          id: 3,
          caseNumber: 'CASE-0003',
          status: 'closed',
          participantId: 1,
          consultationReason:
            'Consulta de seguimiento post-tratamiento de ansiedad',
          intervention:
            'Sesión de evaluación final y cierre de proceso terapéutico',
          closingNote:
            'Tratamiento finalizado exitosamente. Participante logró reducir niveles de ansiedad significativamente. ' +
            'Se recomienda seguimiento semestral preventivo. Alta médica otorgada.',
          createdAt: '2024-09-15T09:00:00.000Z',
          updatedAt: '2024-10-15T16:30:00.000Z',
          closedAt: '2024-10-15T16:30:00.000Z',
          participant: {
            id: 1,
            fullName: 'María González Pérez',
            firstName: 'María',
            firstLastName: 'González',
            secondLastName: 'Pérez',
            documentNumber: '1234567890',
            age: 32,
          },
        },
        {
          id: 4,
          caseNumber: 'CASE-0004',
          status: 'on_hold',
          participantId: 3,
          consultationReason: 'Terapia familiar por conflictos intrafamiliares',
          intervention: 'Sesiones semanales de terapia familiar sistémica',
          closingNote: null,
          createdAt: '2024-08-20T11:00:00.000Z',
          updatedAt: '2024-09-10T10:15:00.000Z',
          closedAt: null,
          participant: {
            id: 3,
            fullName: 'Carlos Martínez López',
            firstName: 'Carlos',
            firstLastName: 'Martínez',
            secondLastName: 'López',
            documentNumber: '5555555555',
            age: 38,
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description:
      '❌ **Error interno del servidor**\n\n' +
      'Ocurrió un error inesperado al consultar los casos.\n\n' +
      '**Posibles causas:**\n' +
      '- Error de conexión con la base de datos\n' +
      '- Problema al cargar relaciones con participantes\n' +
      '- Corrupción de datos en algún registro\n\n' +
      '**Acción:** El equipo técnico ha sido notificado. Si el problema persiste, contacta al administrador del sistema.',
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
