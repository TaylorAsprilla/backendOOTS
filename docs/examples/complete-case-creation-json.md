# 📋 JSON COMPLETO para Crear Casos - Estructura Actualizada

## **Endpoint:** `POST /api/v1/cases`

### **🎯 JSON Completo con Todos los Campos Posibles:**

```json
{
  // ===================================
  // 🔑 INFORMACIÓN BÁSICA (REQUERIDO)
  // ===================================
  "participantId": 1,

  // ===================================
  // 📝 MOTIVO DE CONSULTA
  // ===================================
  "consultationReason": "El participante presenta síntomas de ansiedad y estrés post-separación matrimonial con dificultades en el sueño y concentración que interfieren con su desempeño laboral y relaciones interpersonales.",

  // ===================================
  // 🎯 SITUACIONES IDENTIFICADAS
  // ===================================
  "identifiedSituations": [1, 3, 5, 8, 12],

  // ===================================
  // 🩺 INTERVENCIÓN INICIAL
  // ===================================
  "intervention": "Se evidencia sintomatología ansiosa moderada con afectación del sueño, concentración y rendimiento laboral. Presenta capacidad de insight y motivación al cambio. Se inicia proceso terapéutico con enfoque cognitivo-conductual.",

  // ===================================
  // 📅 PLAN DE SEGUIMIENTO
  // ===================================
  "followUpPlan": [1, 2, 3, 5, 7],

  // ===================================
  // 🏥 HISTORIA DE SALUD FÍSICA
  // ===================================
  "physicalHealthHistory": {
    "currentConditions": "Hipertensión arterial controlada, gastritis ocasional relacionada con estrés, no refiere otras condiciones médicas significativas",
    "medications": "Losartán 50mg (1 vez al día), Omeprazol 20mg (según necesidad), Melatonina 3mg (ocasional para el sueño)",
    "familyHistoryFather": "Padre: Hipertensión arterial, diabetes tipo 2, infarto agudo al miocardio a los 65 años",
    "familyHistoryMother": "Madre: Diabetes tipo 2, hipotiroidismo, osteoporosis",
    "observations": "Estilo de vida sedentario, fumador ocasional (2-3 cigarrillos por semana), consumo moderado de alcohol (fines de semana), dieta irregular por horarios laborales"
  },

  // ===================================
  // 🧠 HISTORIA DE SALUD MENTAL
  // ===================================
  "mentalHealthHistory": {
    "currentConditions": "Episodios de ansiedad generalizada, síntomas depresivos leves reactivos al estrés, insomnio de conciliación",
    "medications": "No toma medicamentos psiquiátricos actualmente. Historial de uso ocasional de clonazepam (suspendido hace 6 meses)",
    "familyHistoryFather": "Sin antecedentes psiquiátricos conocidos, tendencia al alcoholismo social",
    "familyHistoryMother": "Historia de episodios depresivos recurrentes, ansiedad, tratamiento con fluoxetina por 5 años",
    "observations": "Síntomas reactivos a factores estresantes identificables, sin historia de ideación suicida, buen soporte familiar y social"
  },

  // ===================================
  // ⚖️ PONDERACIÓN (Análisis Profesional)
  // ===================================
  "ponderacion": {
    "consultationMotiveAnalysis": "Situación reactiva a evento vital estresante (separación matrimonial) con impacto emocional significativo que genera síntomas ansiosos y depresivos adaptativos. El participante presenta conciencia del problema y motivación genuina para el cambio.",
    "identifiedSituationAnalysis": "Problemática claramente identificada con factores precipitantes específicos (proceso de separación, sobrecarga laboral, aislamiento social). Presenta múltiples situaciones de riesgo que requieren intervención integral y multidisciplinaria.",
    "favorableConditions": "Alta motivación al cambio, conciencia del problema, capacidad de insight, recursos económicos estables, apoyo familiar presente, inteligencia emocional desarrollada, historia laboral estable, ausencia de consumo problemático de sustancias",
    "unfavorableConditions": "Patrón de evitación ante conflictos, resistencia inicial al cambio de rutinas, sobrecarga laboral que limita tiempo para actividades terapéuticas, tendencia al perfeccionismo que genera autocrítica excesiva",
    "theoreticalApproach": "Enfoque cognitivo-conductual con elementos de terapia de aceptación y compromiso (ACT), técnicas de mindfulness para manejo de ansiedad, y psicoeducación sobre regulación emocional. Intervención breve y focalizada en soluciones."
  },

  // ===================================
  // 📋 PLANES DE INTERVENCIÓN DETALLADOS
  // ===================================
  "interventionPlans": [
    {
      "goal": "Manejo y Reducción de Síntomas de Ansiedad",
      "objectives": "Reducir frecuencia e intensidad de episodios ansiosos en un 70% durante las primeras 6 semanas de tratamiento, mediante técnicas de relajación y reestructuración cognitiva",
      "activities": "Técnicas de respiración diafragmática, relajación muscular progresiva, identificación y modificación de pensamientos automáticos negativos, exposición gradual a situaciones ansiógenas, registro de episodios ansiosos",
      "timeline": "6 semanas intensivas, con sesiones semanales de 60 minutos",
      "responsible": "Psicólogo clínico tratante - Dr. María González",
      "evaluationCriteria": "Reducción de puntuación en escala GAD-7 de moderada (12 puntos) a leve (menos de 7 puntos), mejora en calidad del sueño medida por diario de sueño"
    },
    {
      "goal": "Fortalecimiento de Red de Apoyo Social",
      "objectives": "Ampliar y fortalecer red de apoyo social, incrementar actividades sociales placenteras en un 50%, mejorar habilidades de comunicación asertiva",
      "activities": "Identificación de apoyos existentes y potenciales, planificación de actividades sociales graduales, entrenamiento en habilidades sociales, participación en grupos de apoyo o actividades comunitarias",
      "timeline": "8 semanas con seguimiento mensual posterior",
      "responsible": "Trabajador social - Lic. Carlos Pérez",
      "evaluationCriteria": "Aumento en frecuencia de contactos sociales positivos (mínimo 3 actividades semanales), mejora en escala de apoyo social percibido"
    },
    {
      "goal": "Mejora en Higiene del Sueño y Calidad de Vida",
      "objectives": "Establecer rutina de sueño saludable, reducir tiempo de conciliación a menos de 30 minutos, aumentar horas de sueño reparador a 7-8 horas diarias",
      "activities": "Psicoeducación sobre higiene del sueño, establecimiento de rutina pre-sueño, técnicas de relajación nocturna, control de estímulos, restricción del tiempo en cama",
      "timeline": "4 semanas de intervención intensiva",
      "responsible": "Psicólogo tratante con apoyo de medicina general",
      "evaluationCriteria": "Mejora en índice de calidad del sueño de Pittsburgh, registro de sueño con reducción de despertares nocturnos"
    }
  ],

  // ===================================
  // 📝 NOTAS DE PROGRESO
  // ===================================
  "progressNotes": [
    {
      "sessionDate": "2024-03-01",
      "sessionType": "EVALUACION",
      "summary": "Evaluación inicial completa. Establecimiento de rapport exitoso. Aplicación de instrumentos de evaluación (GAD-7, PHQ-9, Escala de Estrés Percibido). Psicoeducación sobre ansiedad y su relación con eventos vitales estresantes. Exploración de motivación al cambio.",
      "observations": "Participante muy motivado al tratamiento, expresó alivio significativo por iniciar proceso terapéutico. Presenta buen nivel de introspección y capacidad para identificar síntomas. Sin ideación suicida presente.",
      "agreements": "Compromiso de asistencia semanal los martes a las 3:00 PM, práctica diaria de técnicas de respiración (15 minutos), completar autorregistros de episodios ansiosos, lectura de material psicoeducativo proporcionado"
    },
    {
      "sessionDate": "2024-03-08",
      "sessionType": "INDIVIDUAL",
      "summary": "Segunda sesión. Revisión de autorregistros de ansiedad. Identificación de pensamientos automáticos negativos relacionados con la separación y el futuro. Introducción a técnicas de reestructuración cognitiva. Práctica de respiración diafragmática.",
      "observations": "Mejoría notable en la comprensión de la relación pensamiento-emoción-conducta. Ha practicado técnicas de respiración diariamente. Reporta leve reducción en intensidad de episodios ansiosos nocturnos.",
      "agreements": "Continuar con autorregistros, añadir registro de pensamientos automáticos, práctica de cuestionamiento socrático para pensamientos negativos, mantener rutina de ejercicios de respiración"
    },
    {
      "sessionDate": "2024-03-15",
      "sessionType": "INDIVIDUAL",
      "summary": "Tercera sesión. Evaluación de progreso en manejo de ansiedad. Trabajo con pensamientos catastróficos sobre el futuro post-separación. Planificación de exposición gradual a situaciones sociales evitadas. Revisión de higiene del sueño.",
      "observations": "Progreso significativo en identificación y modificación de pensamientos negativos. Mejora en calidad del sueño (reducción de tiempo de conciliación de 90 a 45 minutos). Mayor confianza en capacidades de afrontamiento.",
      "agreements": "Exposición gradual a una actividad social (cena con amigos), continuar técnicas cognitivas, implementar rutina de higiene del sueño estricta, programar actividad física regular"
    }
  ],

  // ===================================
  // 👨‍⚕️ REFERIDOS Y DERIVACIONES
  // ===================================
  "referrals": "Se considera necesaria evaluación psiquiátrica si persiste alteración significativa del sueño después de 4 semanas de implementación de técnicas de higiene del sueño. Derivación a médico general para evaluación de síntomas físicos de ansiedad (palpitaciones, tensión muscular). Posible referencia a nutricionista para manejo del estrés a través de alimentación consciente. Considerar derivación a terapia de pareja si el participante expresa interés en trabajo conjunto durante proceso de separación.",

  // ===================================
  // 🔚 NOTA DE CIERRE (Para casos cerrados)
  // ===================================
  "closingNote": {
    "closingDate": "2024-06-15",
    "reason": "TREATMENT_COMPLETED",
    "achievements": "Desarrollo exitoso de estrategias de afrontamiento para manejo de ansiedad, mejora significativa en calidad del sueño (reducción de tiempo de conciliación de 90 a 20 minutos), fortalecimiento de red de apoyo social con incremento de 40% en actividades sociales, adquisición de herramientas de regulación emocional, mejora en comunicación asertiva, reducción de 80% en frecuencia e intensidad de episodios ansiosos",
    "recommendations": "Mantenimiento de técnicas de respiración y relajación aprendidas, continuidad en rutina de ejercicio físico regular, mantenimiento de red de apoyo social desarrollada, aplicación de técnicas de reestructuración cognitiva ante situaciones estresantes futuras, seguimiento médico regular para control de hipertensión, seguimiento psicológico opcional a los 6 meses para prevención de recaídas",
    "observations": "Proceso terapéutico altamente exitoso con participante comprometido y colaborativo. Desarrollo de insight significativo sobre patrones de pensamiento y conducta. Alta satisfacción del participante con los resultados obtenidos. Pronóstico favorable para mantenimiento de logros terapéuticos. Capacidad desarrollada para autoaplicación de técnicas aprendidas."
  }
}
```

## **📊 Campos por Sección:**

### **🔑 Campos Obligatorios:**

- `participantId` (number) - ÚNICO CAMPO REQUERIDO

### **📝 Campos de Texto Simple:**

- `consultationReason` (string) - Motivo de consulta
- `intervention` (string) - Intervención inicial
- `referrals` (string) - Referidos y derivaciones

### **🔢 Campos de Array de IDs:**

- `identifiedSituations` (number[]) - IDs del catálogo
- `followUpPlan` (number[]) - IDs del catálogo

### **🏥 Objetos de Historia Médica:**

- `physicalHealthHistory` - 5 campos de texto
- `mentalHealthHistory` - 5 campos de texto

### **⚖️ Objeto de Ponderación:**

- `ponderacion` - 5 campos de análisis profesional

### **📋 Arrays de Objetos:**

- `interventionPlans` - Array de planes detallados
- `progressNotes` - Array de notas de sesión

### **🔚 Objeto de Cierre:**

- `closingNote` - Información de cierre del caso

## **💡 Ejemplos de Uso:**

### **Mínimo:**

```json
{
  "participantId": 1
}
```

### **Básico:**

```json
{
  "participantId": 1,
  "consultationReason": "Consulta por ansiedad",
  "identifiedSituations": [1, 3],
  "intervention": "Evaluación inicial positiva"
}
```

### **Intermedio:**

```json
{
  "participantId": 1,
  "consultationReason": "Consulta por ansiedad y estrés laboral",
  "identifiedSituations": [1, 3, 5],
  "intervention": "Sintomatología ansiosa moderada",
  "followUpPlan": [1, 2],
  "physicalHealthHistory": {
    "currentConditions": "Hipertensión controlada",
    "medications": "Losartán 50mg"
  },
  "progressNotes": [
    {
      "sessionDate": "2024-03-01",
      "sessionType": "EVALUACION",
      "summary": "Evaluación inicial completa"
    }
  ]
}
```

## **🔗 Endpoints de Catálogos:**

- `GET /api/v1/catalogs/identified-situations` - Situaciones identificadas
- `GET /api/v1/catalogs/follow-up-plans` - Planes de seguimiento
