# 🏥 Documentación: Crear Caso con Información Médica

## Resumen

Esta documentación muestra cómo crear un **caso** en el sistema OOTS. Después de la reestructuración, toda la **información médica y clínica** se maneja a través de casos, permitiendo múltiples consultas por participante.

## 🔗 Endpoint

```http
POST /cases
Content-Type: application/json
Authorization: Bearer {token}
```

## 📋 Prerrequisito

Antes de crear un caso, debe existir un **participante**. Ver: [**Crear Participante**](./participant-creation-examples.md)

## 🏗️ Body Completo de Ejemplo

### Caso con Toda la Información Médica

```json
{
  "participantId": 15,
  "title": "Consulta por ansiedad y depresión post-separación",
  "description": "Primera consulta. Paciente presenta síntomas de ansiedad, insomnio y episodios depresivos tras separación matrimonial ocurrida hace 3 meses. Refiere dificultades para concentrarse en el trabajo y cuidar a sus hijos.",
  "bioPsychosocialHistory": {
    "completedGrade": "Bachillerato completo",
    "institution": "Colegio San Patricio",
    "profession": "Auxiliar de enfermería",
    "occupationalHistory": "5 años como auxiliar en Hospital San José, 2 años en clínica privada",
    "housingTypeId": 2,
    "educationLevelId": 5,
    "incomeSourceId": 1,
    "incomeLevelId": 2,
    "housing": "Casa propia de 3 habitaciones, barrio residencial"
  },
  "consultationReason": {
    "reason": "Solicita apoyo psicológico por síntomas de ansiedad y depresión tras separación matrimonial. Presenta dificultades para dormir, pérdida de apetito, y episodios de llanto frecuentes."
  },
  "intervention": {
    "intervention": "Sesión inicial de evaluación y contención emocional. Se aplicó técnica de respiración y se estableció rapport terapéutico. Se programó seguimiento semanal."
  },
  "followUpPlan": {
    "plan": "Sesiones semanales durante 2 meses. Enfoque en terapia cognitivo-conductual para manejo de ansiedad. Incluir terapia familiar si es necesario. Evaluación psiquiátrica si no hay mejoría en 4 semanas."
  },
  "physicalHealthHistory": {
    "physicalConditions": "Hipertensión arterial controlada, migrañas frecuentes",
    "receivingTreatment": true,
    "treatmentDetails": "Losartán 50mg diario, ibuprofeno para migrañas según necesidad",
    "paternalFamilyHistory": "Padre con hipertensión y diabetes tipo 2",
    "maternalFamilyHistory": "Madre con depresión, abuela materna con problemas cardíacos",
    "physicalHealthObservations": "Paciente refiere aumento en frecuencia de migrañas desde la separación"
  },
  "mentalHealthHistory": {
    "mentalConditions": "Episodio depresivo previo hace 5 años",
    "receivingMentalTreatment": false,
    "mentalTreatmentDetails": "Tratamiento psicológico previo durante 6 meses por depresión postparto",
    "paternalMentalHistory": "Sin antecedentes conocidos",
    "maternalMentalHistory": "Madre con depresión crónica, hermana con trastorno de ansiedad",
    "mentalHealthObservations": "Buena respuesta a terapia anterior, motivada para el tratamiento actual"
  },
  "assessment": {
    "consultationReason": "Síntomas compatibles con trastorno mixto ansioso-depresivo",
    "weighting": "Severidad moderada, funcionalidad laboral y familiar comprometida",
    "concurrentFactors": "Proceso de separación legal, responsabilidades como madre soltera, presión económica",
    "criticalFactors": "Ideación suicida ocasional sin plan específico, red de apoyo limitada",
    "problemAnalysis": "Reacción adaptativa ante evento vital estresante, exacerbada por antecedentes de depresión y factores de vulnerabilidad familiar"
  },
  "interventionPlans": [
    {
      "goal": "Reducir síntomas de ansiedad y mejorar calidad del sueño",
      "objectives": "Lograr 7-8 horas de sueño continuo, reducir episodios de ansiedad de 5 a 2 por semana",
      "activities": "Técnicas de relajación, higiene del sueño, reestructuración cognitiva",
      "timeframe": "4 semanas",
      "responsiblePerson": "Psicólogo tratante",
      "evaluationCriteria": "Registro de sueño, escala de ansiedad Beck"
    },
    {
      "goal": "Fortalecer estrategias de afrontamiento",
      "objectives": "Desarrollar herramientas para manejo del estrés y toma de decisiones",
      "activities": "Terapia cognitivo-conductual, role playing, técnicas de resolución de problemas",
      "timeframe": "6 semanas",
      "responsiblePerson": "Psicólogo tratante",
      "evaluationCriteria": "Cuestionario de estrategias de afrontamiento, evaluación funcional"
    }
  ],
  "progressNotes": [
    {
      "date": "2024-12-19",
      "time": "10:00",
      "approachType": "Individual",
      "process": "Evaluación inicial y establecimiento de rapport. Paciente colaborativa, insight adecuado sobre su situación.",
      "summary": "Se identificaron síntomas de ansiedad y depresión moderada. Paciente motivada para el tratamiento.",
      "observations": "Buen nivel de conciencia sobre sus dificultades, red familiar de apoyo limitada",
      "agreements": "Asistir a sesiones semanales, implementar técnicas de relajación, mantener registro de estado de ánimo"
    }
  ],
  "referrals": {
    "description": "Se sugiere evaluación psiquiátrica si no hay mejoría en síntomas depresivos en 4 semanas. Considerar derivación a grupos de apoyo para madres separadas."
  }
}
```

## 📋 Estructura del Caso

### ✅ Campos Obligatorios

| Campo           | Tipo   | Descripción                                  |
| --------------- | ------ | -------------------------------------------- |
| `participantId` | number | ID del participante existente                |
| `title`         | string | Título breve del caso (5-200 caracteres)     |
| `description`   | string | Descripción detallada (mínimo 10 caracteres) |

### 🔶 Información Médica (Opcional)

| Sección                  | Descripción              | Tipo   |
| ------------------------ | ------------------------ | ------ |
| `bioPsychosocialHistory` | Historia biopsicosocial  | Object |
| `consultationReason`     | Motivo de consulta       | Object |
| `intervention`           | Intervención realizada   | Object |
| `followUpPlan`           | Plan de seguimiento      | Object |
| `physicalHealthHistory`  | Historia de salud física | Object |
| `mentalHealthHistory`    | Historia de salud mental | Object |
| `assessment`             | Evaluación profesional   | Object |
| `interventionPlans`      | Planes de intervención   | Array  |
| `progressNotes`          | Notas de progreso        | Array  |
| `referrals`              | Referencias              | Object |

## 📊 Estructura Detallada de Cada Sección

### 1. 🧠 Historia Biopsicosocial

```json
{
  "bioPsychosocialHistory": {
    "completedGrade": "Bachillerato completo",
    "institution": "Colegio San Patricio",
    "profession": "Auxiliar de enfermería",
    "occupationalHistory": "Descripción del historial laboral",
    "housingTypeId": 2,
    "educationLevelId": 5,
    "incomeSourceId": 1,
    "incomeLevelId": 2,
    "housing": "Descripción de la vivienda"
  }
}
```

### 2. 🩺 Motivo de Consulta

```json
{
  "consultationReason": {
    "reason": "Descripción detallada del motivo de consulta"
  }
}
```

### 3. 🔧 Intervención

```json
{
  "intervention": {
    "intervention": "Descripción de la intervención realizada"
  }
}
```

### 4. 📅 Plan de Seguimiento

```json
{
  "followUpPlan": {
    "plan": "Descripción del plan de seguimiento"
  }
}
```

### 5. 🏥 Historia de Salud Física

```json
{
  "physicalHealthHistory": {
    "physicalConditions": "Condiciones físicas actuales",
    "receivingTreatment": true,
    "treatmentDetails": "Detalles del tratamiento",
    "paternalFamilyHistory": "Antecedentes familiares paternos",
    "maternalFamilyHistory": "Antecedentes familiares maternos",
    "physicalHealthObservations": "Observaciones adicionales"
  }
}
```

### 6. 🧠 Historia de Salud Mental

```json
{
  "mentalHealthHistory": {
    "mentalConditions": "Condiciones de salud mental",
    "receivingMentalTreatment": false,
    "mentalTreatmentDetails": "Detalles de tratamientos previos",
    "paternalMentalHistory": "Antecedentes mentales paternos",
    "maternalMentalHistory": "Antecedentes mentales maternos",
    "mentalHealthObservations": "Observaciones adicionales"
  }
}
```

### 7. 📋 Evaluación

```json
{
  "assessment": {
    "consultationReason": "Razón de la evaluación",
    "weighting": "Ponderación de la situación",
    "concurrentFactors": "Factores concurrentes",
    "criticalFactors": "Factores críticos",
    "problemAnalysis": "Análisis del problema"
  }
}
```

### 8. 🎯 Planes de Intervención

```json
{
  "interventionPlans": [
    {
      "goal": "Objetivo específico",
      "objectives": "Objetivos medibles",
      "activities": "Actividades a realizar",
      "timeframe": "Marco temporal",
      "responsiblePerson": "Persona responsable",
      "evaluationCriteria": "Criterios de evaluación"
    }
  ]
}
```

### 9. 📝 Notas de Progreso

```json
{
  "progressNotes": [
    {
      "date": "2024-12-19",
      "time": "10:00",
      "approachType": "Individual/Grupal/Familiar",
      "process": "Descripción del proceso",
      "summary": "Resumen de la sesión",
      "observations": "Observaciones",
      "agreements": "Acuerdos establecidos"
    }
  ]
}
```

### 10. 🔄 Referencias

```json
{
  "referrals": {
    "description": "Descripción de las referencias"
  }
}
```

## 📝 Ejemplos por Complejidad

### 1. Caso Básico (Solo Campos Obligatorios)

```json
{
  "participantId": 10,
  "title": "Primera consulta por estrés laboral",
  "description": "Participante solicita apoyo por situaciones de estrés en el ambiente laboral que están afectando su rendimiento y bienestar emocional."
}
```

### 2. Caso con Información Médica Básica

```json
{
  "participantId": 12,
  "title": "Consulta por conflictos familiares",
  "description": "Familia solicita apoyo para resolver conflictos entre padres e hijos adolescentes.",
  "consultationReason": {
    "reason": "Conflictos constantes entre padres e hijo de 16 años. Problemas de comunicación y establecimiento de límites."
  },
  "intervention": {
    "intervention": "Sesión familiar inicial. Se identificaron patrones de comunicación disfuncionales y se trabajó en técnicas de comunicación asertiva."
  },
  "followUpPlan": {
    "plan": "Sesiones familiares quincenales durante 2 meses. Trabajo individual con el adolescente si es necesario."
  }
}
```

### 3. Caso Complejo con Evaluación Psiquiátrica

```json
{
  "participantId": 8,
  "title": "Trastorno del estado de ánimo con ideación suicida",
  "description": "Paciente de 45 años con episodio depresivo mayor, ideación suicida pasiva, antecedentes de intentos de suicidio. Requiere evaluación y seguimiento especializado.",
  "bioPsychosocialHistory": {
    "profession": "Contador público",
    "occupationalHistory": "20 años como contador, actualmente desempleado hace 6 meses",
    "educationLevelId": 9,
    "incomeSourceId": 4,
    "incomeLevelId": 1,
    "housing": "Vive solo en apartamento alquilado"
  },
  "consultationReason": {
    "reason": "Episodio depresivo severo con ideación suicida. Pérdida de empleo, separación conyugal, aislamiento social. Refiere sentimientos de desesperanza y pensamientos de muerte."
  },
  "mentalHealthHistory": {
    "mentalConditions": "Depresión mayor recurrente, intento de suicidio hace 2 años",
    "receivingMentalTreatment": true,
    "mentalTreatmentDetails": "Sertralina 100mg diario, hospitalización psiquiátrica previa",
    "maternalMentalHistory": "Madre con trastorno bipolar",
    "mentalHealthObservations": "Alto riesgo suicida, requiere monitoreo constante"
  },
  "assessment": {
    "consultationReason": "Episodio depresivo mayor severo con características psicóticas",
    "weighting": "Riesgo alto de suicidio, funcionalidad severamente comprometida",
    "criticalFactors": "Ideación suicida activa, plan específico, acceso a medios letales",
    "problemAnalysis": "Depresión mayor recurrente exacerbada por múltiples estresores psicosociales"
  },
  "interventionPlans": [
    {
      "goal": "Garantizar seguridad del paciente",
      "objectives": "Eliminar acceso a medios letales, establecer red de contención",
      "activities": "Contrato de no daño, activación de red familiar, seguimiento diario",
      "timeframe": "Inmediato - 2 semanas",
      "responsiblePerson": "Psiquiatra y psicólogo",
      "evaluationCriteria": "Escala de ideación suicida, evaluación diaria de riesgo"
    }
  ],
  "referrals": {
    "description": "Evaluación psiquiátrica urgente para ajuste de medicación. Considerar hospitalización si incrementa riesgo suicida."
  }
}
```

## ✅ Respuesta Exitosa

```json
{
  "id": 25,
  "caseNumber": "CASE-0025",
  "title": "Consulta por ansiedad y depresión post-separación",
  "description": "Primera consulta. Paciente presenta síntomas de ansiedad...",
  "status": "open",
  "participantId": 15,
  "createdAt": "2024-12-19T14:30:00.000Z",
  "updatedAt": "2024-12-19T14:30:00.000Z",
  "participant": {
    "id": 15,
    "firstName": "María",
    "firstLastName": "García",
    "phoneNumber": "+57 301 234 5678"
  }
}
```

## ❌ Errores Comunes

### 1. Participante No Existe

```json
{
  "message": "Participante con ID 999 no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

### 2. Campos Obligatorios Faltantes

```json
{
  "message": [
    "title should not be empty",
    "title must be longer than or equal to 5 characters",
    "description must be longer than or equal to 10 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 3. Datos de Progreso Note Inválidos

```json
{
  "message": [
    "date must be a valid ISO 8601 date string",
    "time should not be empty",
    "approachType should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## 🔄 Estados del Caso

| Estado        | Descripción           |
| ------------- | --------------------- |
| `open`        | Caso abierto y activo |
| `in_progress` | Caso en progreso      |
| `closed`      | Caso cerrado          |

### Cambiar Estado de Caso

```http
PATCH /cases/{id}/status
{
  "status": "in_progress"
}
```

## 📚 APIs Relacionadas

### Obtener Casos de un Participante

```http
GET /participants/{participantId}/cases
```

### Obtener Caso Específico

```http
GET /cases/{id}
```

### Obtener Todos los Casos

```http
GET /cases
```

## 🎯 Flujo Recomendado

1. **Crear Participante** → [Ver documentación](./participant-creation-examples.md)
2. **Crear Caso Básico** → Solo title, description, participantId
3. **Agregar Información Médica** → Completar secciones según necesidad
4. **Gestionar Seguimiento** → Agregar notas de progreso y planes
5. **Cerrar Caso** → Cambiar estado cuando termine el proceso

## 📞 Contacto

Para soporte técnico o dudas sobre la implementación, contactar al equipo de desarrollo.
