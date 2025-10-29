# Endpoint Completo para Crear un Caso - Nueva Estructura Simplificada

## **POST** `/cases`

### **Estructura JSON Actualizada:**

```json
{
  // ID del participante para quien se crea el caso (REQUERIDO)
  "participantId": 1,

  // 2. MOTIVO DE LA CONSULTA - Información sobre por qué el participante busca ayuda (STRING SIMPLE)
  "consultationReason": "El participante presenta síntomas de ansiedad y estrés post-separación matrimonial",

  // 3. SITUACIONES IDENTIFICADAS - IDs de situaciones del catálogo (obtener con GET /catalogs/identified-situations)
  "identifiedSituations": [1, 3, 5, 8],

  // 4. INTERVENCIÓN INICIAL - Primera respuesta profesional al caso (STRING SIMPLE)
  "intervention": "Se evidencia sintomatología ansiosa moderada con afectación del sueño y concentración",

  // 5. PLAN DE SEGUIMIENTO - IDs de planes del catálogo (obtener con GET /catalogs/follow-up-plans)
  "followUpPlan": [1, 2, 3],

  // 6. HISTORIA DE SALUD FÍSICA - Antecedentes médicos relevantes
  "physicalHealthHistory": {
    // Condiciones médicas actuales que presenta el participante
    "currentConditions": "No refiere condiciones médicas actuales significativas",
    // Medicamentos que toma actualmente
    "medications": "Ocasionalmente toma melatonina para el sueño",
    // Antecedentes familiares del padre
    "familyHistoryFather": "Padre con hipertensión",
    // Antecedentes familiares de la madre
    "familyHistoryMother": "Madre con diabetes tipo 2",
    // Observaciones sobre salud física
    "observations": "Sedentario, fumador ocasional, consumo moderado de alcohol"
  },

  // 7. HISTORIA DE SALUD MENTAL - Antecedentes psicológicos y psiquiátricos
  "mentalHealthHistory": {
    // Condiciones Mentales actuales que presenta el participante
    "currentConditions": "Episodios de ansiedad",

    // Medicamentos que toma actualmente
    "medications": "No toma medicamentos psiquiátricos",

    // Antecedentes familiares del padre
    "familyHistoryFather": "Sin antecedentes psiquiátricos conocidos",
    // Antecedentes familiares de la madre
    "familyHistoryMother": "Historia de depresión",

    // Observaciones
    "observations": "Presenta síntomas reactivos al estrés"
  },

  // 8. PONDERACIÓN - Análisis profesional integral del caso
  "ponderacion": {
    // Análisis del motivo de consulta desde perspectiva profesional
    "consultationMotiveAnalysis": "Situación reactiva a evento vital estresante (separación) con impacto emocional significativo",

    // Análisis de las situaciones problemáticas identificadas
    "identifiedSituationAnalysis": "Problemática claramente identificada con factores precipitantes específicos",

    // Condiciones que favorecen el proceso terapéutico
    "favorableConditions": "Motivación al cambio, conciencia del problema, recursos económicos, apoyo social",

    // Condiciones que pueden dificultar el proceso terapéutico
    "unfavorableConditions": "Patrón de evitación, resistencia inicial al cambio, sobrecarga laboral",

    // Enfoque teórico o modelo terapéutico a aplicar
    "theoreticalApproach": "Enfoque cognitivo-conductual con elementos de mindfulness"
  },

  // 9. PLANES DE INTERVENCIÓN DETALLADOS - Estrategias específicas de tratamiento
  "interventionPlans": [
    {
      // Meta del plan de intervención
      "goal": "Plan de Manejo de Ansiedad",

      // Objetivos específicos a lograr con este plan
      "objectives": "Reducir frecuencia e intensidad de episodios ansiosos",

      // Actividades concretas a realizar
      "activities": "Técnicas de respiración, relajación muscular, exposición gradual",

      // Tiempo estimado para completar este plan
      "timeline": "4 semanas",

      // Profesional responsable de ejecutar el plan
      "responsible": "Psicólogo tratante",

      // Criterios de evaluación
      "evaluationCriteria": "Reducción de episodios ansiosos según escala GAD-7"
    },
    {
      // Meta del plan de intervención
      "goal": "Fortalecimiento de Red de Apoyo",

      // Objetivos específicos a lograr con este plan
      "objectives": "Ampliar y fortalecer red de apoyo social",

      // Actividades concretas a realizar
      "activities": "Identificación de apoyos, planificación de actividades sociales",

      // Tiempo estimado para completar este plan
      "timeline": "6 semanas",

      // Profesional responsable de ejecutar el plan
      "responsible": "Trabajador social",

      // Criterios de evaluación
      "evaluationCriteria": "Aumento en frecuencia de contactos sociales positivos"
    }
  ],

  // 10. NOTAS DE PROGRESO - Registro de cada sesión o encuentro
  "progressNotes": [
    {
      // Fecha en que se realizó la sesión
      "sessionDate": "2024-03-01",

      // Tipo de sesión: INDIVIDUAL, GRUPAL, FAMILIAR, EVALUACION
      "sessionType": "INDIVIDUAL",

      // Resumen de la sesión
      "summary": "Evaluación inicial, establecimiento de rapport, psicoeducación sobre ansiedad",

      // Observaciones adicionales relevantes
      "observations": "Motivado al tratamiento, expresó alivio por iniciar proceso terapéutico",

      // Acuerdos tomados
      "agreements": "Compromiso de asistencia semanal y práctica de técnicas en casa"
    }
  ],

  // 11. REFERIDOS - Derivaciones a otros profesionales o servicios (STRING SIMPLE)
  "referrals": "Considerar evaluación psiquiátrica si persiste alteración del sueño después de 4 semanas de terapia",

  // 12. NOTA DE CIERRE - Información del cierre del caso (opcional, para casos cerrados)
  "closingNote": {
    // Fecha en que se cierra el caso
    "closingDate": "2024-06-01",

    // Razón del cierre: TREATMENT_COMPLETED, PARTICIPANT_WITHDRAWAL, TRANSFER, NO_SHOW, OTHER
    "reason": "TREATMENT_COMPLETED",

    // Logros alcanzados durante el tratamiento
    "achievements": "Desarrollo de estrategias de afrontamiento efectivas, mejora en calidad del sueño",

    // Recomendaciones para el participante post-cierre
    "recommendations": "Mantenimiento de técnicas aprendidas, seguimiento a 6 meses",

    // Observaciones finales sobre el caso
    "observations": "Proceso terapéutico exitoso, participante satisfecho con resultados"
  }
}
```

### **Ejemplo Mínimo (solo campo requerido):**

```json
{
  "participantId": 1
}
```

### **Ejemplo Intermedio:**

```json
{
  "participantId": 1,
  "consultationReason": "Consulta por estrés laboral y dificultades familiares",
  "identifiedSituations": [2, 7],
  "intervention": "Evaluación inicial revela estrés moderado con componente familiar",
  "followUpPlan": [1, 3],
  "physicalHealthHistory": {
    "currentConditions": "Hipertensión controlada",
    "medications": "Losartán 50mg",
    "observations": "Sedentarismo, necesita actividad física"
  },
  "mentalHealthHistory": {
    "currentConditions": "Ansiedad generalizada",
    "observations": "Síntomas relacionados con sobrecarga laboral"
  }
}
```

### **Endpoints de Catálogos Disponibles:**

- **GET** `/catalogs/identified-situations` - Obtener todas las situaciones identificadas
- **GET** `/catalogs/identified-situations/:id` - Obtener situación por ID
- **GET** `/catalogs/follow-up-plans` - Obtener todos los planes de seguimiento
- **GET** `/catalogs/follow-up-plans/:id` - Obtener plan de seguimiento por ID

### **Response de Éxito (201):**

```json
{
  "id": 15,
  "caseNumber": "CASE-0015",
  "status": "OPEN",
  "participantId": 1,
  "createdAt": "2024-03-01T10:00:00.000Z",
  "updatedAt": "2024-03-01T10:00:00.000Z"
}
```

### **Cambios Principales en la Nueva Estructura:**

1. **consultationReason**: Ahora es un `string` simple en lugar de objeto complejo
2. **intervention**: Ahora es un `string` simple en lugar de objeto complejo
3. **followUpPlan**: Ahora es un `array de números` (IDs del catálogo) en lugar de objeto complejo
4. **referrals**: Ahora es un `string` simple en lugar de objeto complejo
5. **physicalHealthHistory**: Campos simplificados y renombrados para mayor claridad
6. **mentalHealthHistory**: Campos simplificados y renombrados para mayor claridad
7. **ponderacion**: Campos renombrados al inglés para consistencia
8. **interventionPlans**: Campo `timeline` en lugar de `timeframe`, `responsible` en lugar de `responsiblePerson`, `evaluationCriteria` corregido
9. **progressNotes**: Estructura simplificada con `sessionDate`, `sessionType`, `summary`, `observations`, `agreements`
10. **closingNote**: Campos simplificados y con `closingDate` como fecha
