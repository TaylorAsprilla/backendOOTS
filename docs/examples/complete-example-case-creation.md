# 📋 JSON Completo con Datos de Ejemplo - Crear Caso

## **POST** `/api/v1/cases`

### **🎯 Ejemplo Completo con Datos Realistas:**

```json
{
  "participantId": 1,
  "consultationReason": "La participante María García, de 34 años, solicita atención psicológica debido a episodios recurrentes de ansiedad que se han intensificado en los últimos 3 meses tras su proceso de separación matrimonial. Refiere dificultades para conciliar el sueño, irritabilidad, preocupación excesiva por su futuro económico y el bienestar de sus dos hijos menores. Además, presenta síntomas somáticos como palpitaciones, sudoración y tensión muscular, especialmente durante las noches. La situación se ha agravado debido a la sobrecarga laboral y la falta de una red de apoyo sólida.",
  "identifiedSituations": [1, 3, 5, 8, 12],
  "intervention": "Durante la evaluación inicial se evidencia un cuadro de ansiedad generalizada de intensidad moderada a severa, con componente reactivo al proceso de separación matrimonial. La participante muestra sintomatología compatible con trastorno de ansiedad generalizada según criterios DSM-5, con afectación significativa en las áreas laboral, familiar y social. Se observa capacidad de insight conservada, motivación genuina al cambio y recursos cognitivos adecuados para el proceso terapéutico. Se inicia intervención psicoterapéutica con enfoque cognitivo-conductual, priorizando técnicas de manejo de ansiedad y reestructuración cognitiva.",
  "followUpPlan": [1, 2, 3, 5, 7],
  "physicalHealthHistory": {
    "currentConditions": "Hipertensión arterial leve diagnosticada hace 2 años, actualmente controlada con medicación. Gastritis crónica relacionada con estrés, episodios de migraña tensional (2-3 veces por mes). Sobrepeso (IMC 27.5). No refiere otras condiciones médicas significativas.",
    "medications": "Losartán 50mg una vez al día (para hipertensión), Omeprazol 20mg según necesidad (para gastritis), Acetaminofén 500mg ocasional para cefaleas, Melatonina 3mg ocasional para insomnio (sin prescripción médica).",
    "familyHistoryFather": "Padre fallecido a los 68 años por infarto agudo al miocardio. Antecedentes de hipertensión arterial, diabetes tipo 2 diagnosticada a los 55 años, dislipidemia. Consumo problemático de alcohol durante la adultez media.",
    "familyHistoryMother": "Madre viva, 72 años. Diabetes tipo 2 diagnosticada a los 60 años, hipotiroidismo, osteoporosis. Antecedentes de episodios depresivos recurrentes, actualmente en tratamiento con sertralina. Cáncer de mama en remisión (diagnosticado hace 5 años).",
    "observations": "Estilo de vida predominantemente sedentario debido a horarios laborales extensos (10-12 horas diarias). Ex fumadora (dejó hace 3 años, consumo previo de 1 cajetilla diaria por 15 años). Consumo social de alcohol (2-3 copas de vino los fines de semana). Alimentación irregular con tendencia al consumo de comida rápida. Falta de actividad física regular. Exposición crónica a estrés laboral en ambiente competitivo."
  },
  "mentalHealthHistory": {
    "currentConditions": "Episodios de ansiedad generalizada con crisis de pánico ocasionales (1-2 por semana), síntomas depresivos leves a moderados reactivos al proceso de separación, insomnio de conciliación y mantenimiento, irritabilidad incrementada, dificultades de concentración que afectan el rendimiento laboral.",
    "medications": "Sin medicación psiquiátrica actual. Antecedente de uso de clonazepam 0.5mg prescrito por médico general hace 8 meses, suspendido por cuenta propia hace 3 meses por temor a dependencia. Uso ocasional de valeriana y tila para ansiedad.",
    "familyHistoryFather": "Sin antecedentes psiquiátricos formalmente diagnosticados. Refiere tendencia al consumo problemático de alcohol como mecanismo de afrontamiento del estrés. Personalidad rígida y tendencia al control según relato de la participante.",
    "familyHistoryMother": "Historia de episodios depresivos recurrentes desde los 40 años, diagnosticada con trastorno depresivo mayor. Ha recibido tratamiento psiquiátrico intermitente, actualmente estable con sertralina 50mg. Un episodio de hospitalización psiquiátrica hace 10 años por episodio depresivo severo.",
    "observations": "Los síntomas actuales son claramente reactivos a factores estresantes identificables (separación matrimonial, sobrecarga laboral, preocupaciones económicas). Sin antecedentes de intentos suicidas o ideación suicida grave. Historia de episodios ansiosos leves durante la adolescencia, sin tratamiento formal previo. Buena respuesta previa a técnicas de relajación autoenseñadas."
  },
  "ponderacion": {
    "consultationMotiveAnalysis": "La consulta se origina en una crisis vital significativa (proceso de separación matrimonial) que ha desbordado los recursos de afrontamiento habituales de la participante. La sintomatología ansiosa es claramente reactiva y adaptativa inicialmente, pero se ha cronificado y intensificado hasta generar deterioro funcional significativo. La demanda de ayuda es genuina y está motivada por el reconocimiento de la necesidad de desarrollar nuevas estrategias de afrontamiento.",
    "identifiedSituationAnalysis": "Se identifican múltiples factores de riesgo que actúan sinérgicamente: crisis vital (separación), sobrecarga de roles (madre trabajadora), aislamiento social, vulnerabilidad biológica (antecedentes familiares), y factores mantenedores como evitación conductual y rumiación cognitiva. La problemática requiere intervención integral que aborde tanto síntomas como factores precipitantes y mantenedores.",
    "favorableConditions": "Excelente motivación al cambio evidenciada por búsqueda activa de ayuda profesional, capacidad de insight y autoobservación desarrollada, inteligencia emocional adecuada, recursos económicos estables que permiten constancia en el tratamiento, apoyo familiar de la madre y hermana mayor, ausencia de consumo problemático de sustancias, historia laboral estable que indica capacidades de funcionamiento preservadas.",
    "unfavorableConditions": "Patrón de evitación ante situaciones conflictivas que puede interferir con el proceso terapéutico, tendencia al perfeccionismo y autoexigencia excesiva, sobrecarga laboral que limita tiempo disponible para actividades de autocuidado y práctica de técnicas terapéuticas, aislamiento social progresivo, resistencia inicial a cambios en rutinas establecidas por temor a perder control.",
    "theoreticalApproach": "Se implementará enfoque cognitivo-conductual como marco principal, integrando técnicas de terapia de aceptación y compromiso (ACT) para el trabajo con la evitación experiencial. Se incluirán elementos de mindfulness para el manejo de la ansiedad y técnicas de resolución de problemas para el afrontamiento de estresores específicos. La psicoeducación será fundamental para el entendimiento del proceso ansioso y el desarrollo de autoeficacia."
  },
  "interventionPlans": [
    {
      "goal": "Reducción y Manejo de Síntomas de Ansiedad",
      "objectives": "Reducir la frecuencia e intensidad de episodios ansiosos en un 70% durante las primeras 8 semanas de tratamiento. Desarrollar repertorio de técnicas de autorregulación emocional efectivas. Mejorar la calidad del sueño con reducción del tiempo de conciliación a menos de 30 minutos.",
      "activities": "Entrenamiento en técnicas de respiración diafragmática y relajación muscular progresiva. Identificación y modificación de pensamientos automáticos negativos mediante técnicas de reestructuración cognitiva. Exposición gradual a situaciones ansiógenas evitadas. Implementación de agenda de actividades placenteras. Psicoeducación sobre el ciclo de la ansiedad.",
      "timeline": "8 semanas de intervención intensiva con sesiones semanales de 60 minutos, seguidas de 4 semanas de consolidación con sesiones quincenales",
      "responsible": "Psicóloga clínica Dra. María Elena Rodríguez, especialista en trastornos de ansiedad",
      "evaluationCriteria": "Reducción en escala GAD-7 de puntuación actual (16 puntos - ansiedad severa) a menos de 10 puntos (ansiedad leve). Mejora en índice de calidad del sueño de Pittsburgh. Incremento en escala de autoeficacia para el manejo de ansiedad."
    },
    {
      "goal": "Fortalecimiento de Red de Apoyo Social y Habilidades Interpersonales",
      "objectives": "Reconstruir y ampliar red de apoyo social efectiva. Desarrollar habilidades de comunicación asertiva. Incrementar actividades sociales significativas en un 50% respecto al nivel actual.",
      "activities": "Mapeo de red de apoyo actual e identificación de recursos potenciales. Entrenamiento en habilidades sociales y comunicación asertiva. Planificación gradual de actividades sociales. Trabajo con creencias sobre dependencia e independencia. Conexión con grupos de apoyo para madres separadas.",
      "timeline": "10 semanas con sesiones semanales iniciales y seguimiento mensual posterior",
      "responsible": "Trabajadora social especializada Lic. Ana Patricia Mejía",
      "evaluationCriteria": "Incremento en frecuencia de contactos sociales positivos (objetivo: mínimo 4 interacciones sociales significativas por semana). Mejora en escala de apoyo social percibido. Participación activa en al menos un grupo de apoyo o actividad comunitaria."
    },
    {
      "goal": "Desarrollo de Estrategias de Afrontamiento para la Transición Vital",
      "objectives": "Desarrollar habilidades específicas para el manejo del proceso de separación y reorganización familiar. Fortalecer capacidades de resolución de problemas. Establecer rutinas de autocuidado sostenibles.",
      "activities": "Trabajo psicoterapéutico sobre el proceso de duelo por la relación terminada. Desarrollo de habilidades de resolución de problemas para situaciones específicas (custodia, economía familiar, etc.). Planificación de rutinas de autocuidado y manejo del tiempo. Técnicas de autorregulación emocional específicas para situaciones de conflicto.",
      "timeline": "12 semanas de trabajo continuo con posibilidad de extensión según evolución",
      "responsible": "Psicóloga clínica con especialización en terapia familiar Dra. Carmen Lucía Torres",
      "evaluationCriteria": "Desarrollo de al menos 5 estrategias de afrontamiento efectivas validadas en situaciones reales. Mejora en escala de resolución de problemas. Establecimiento de rutina de autocuidado con al menos 4 actividades semanales."
    }
  ],
  "progressNotes": [
    {
      "sessionDate": "2024-10-29",
      "sessionType": "EVALUACION",
      "summary": "Primera sesión de evaluación integral. Se realizó entrevista clínica estructurada, aplicación de instrumentos de tamizaje (GAD-7: 16 puntos, PHQ-9: 12 puntos, Escala de Estrés Percibido: 28 puntos). Establecimiento de rapport exitoso con la participante quien se mostró colaborativa y motivada. Exploración detallada de sintomatología actual, antecedentes personales y familiares, y factores precipitantes. Psicoeducación inicial sobre la naturaleza de la ansiedad y su relación con eventos vitales estresantes.",
      "observations": "La participante llegó puntual y bien presentada, aunque evidenciando signos visibles de fatiga y tensión muscular. Durante la sesión mantuvo contacto visual adecuado y mostró capacidad de introspección notable. Expresó alivio significativo al sentirse escuchada y comprendida. Refirió que es la primera vez que busca ayuda psicológica profesional. Sin indicadores de riesgo suicida en evaluación actual.",
      "agreements": "Compromiso de asistencia semanal los martes a las 4:00 PM. Inicio de práctica diaria de técnicas de respiración profunda (15 minutos en la mañana y 15 minutos antes de dormir). Completar autorregistros de episodios ansiosos utilizando formato proporcionado. Lectura de material psicoeducativo sobre ansiedad. Evitar toma de decisiones importantes durante las primeras semanas de tratamiento."
    },
    {
      "sessionDate": "2024-11-05",
      "sessionType": "INDIVIDUAL",
      "summary": "Segunda sesión individual. Revisión de autorregistros de ansiedad de la semana previa - se identificaron 8 episodios con intensidad promedio de 7/10. Análisis de pensamientos automáticos recurrentes relacionados con preocupaciones sobre el futuro económico y bienestar de los hijos. Introducción al modelo cognitivo ABC. Práctica de técnicas de reestructuración cognitiva con casos específicos reportados por la participante.",
      "observations": "Mejoría notable en la comprensión de la relación entre pensamientos, emociones y conductas. La participante ha practicado las técnicas de respiración de manera constante, reportando reducción leve en la intensidad de episodios nocturnos. Expresó sorpresa al darse cuenta de la frecuencia de pensamientos catastróficos. Mayor tranquilidad durante la sesión comparado con la evaluación inicial.",
      "agreements": "Continuar con autorregistros ampliando el registro de pensamientos automáticos. Práctica diaria de cuestionamiento socrático para pensamientos negativos utilizando las preguntas proporcionadas. Mantener rutina de ejercicios de respiración. Implementar técnica de parada de pensamiento cuando identifique rumiación. Programar una actividad placentera para el fin de semana."
    },
    {
      "sessionDate": "2024-11-12",
      "sessionType": "INDIVIDUAL",
      "summary": "Tercera sesión. Evaluación de progreso en el manejo de ansiedad - reducción reportada en frecuencia (de 8 a 5 episodios semanales) e intensidad promedio (de 7/10 a 5/10). Trabajo profundo con pensamientos catastróficos sobre la estabilidad económica futura. Planificación de exposición gradual a situaciones sociales evitadas (almuerzo con compañeras de trabajo). Revisión y ajuste de rutina de higiene del sueño.",
      "observations": "Progreso evidente en la aplicación de técnicas cognitivas de manera autónoma. La participante reportó haber logrado detener un episodio de rumiación utilizando las técnicas aprendidas. Mejora significativa en la calidad del sueño - tiempo de conciliación reducido de 90 minutos a 45 minutos promedio. Mayor confianza en sus capacidades de afrontamiento. Expresó gratitud por el proceso terapéutico.",
      "agreements": "Realizar exposición programada (almuerzo social) y registrar experiencia. Continuar aplicación de técnicas cognitivas con énfasis en pensamientos sobre capacidades personales. Implementar rutina de higiene del sueño de manera estricta. Iniciar actividad física regular (caminata de 30 minutos, 3 veces por semana). Preparar lista de logros personales durante la separación."
    }
  ],
  "referrals": "Se considera necesaria evaluación psiquiátrica con el Dr. Fernando Ramírez (psiquiatra de la red institucional) si persiste alteración significativa del sueño después de 6 semanas de implementación de técnicas de higiene del sueño y manejo de ansiedad, para considerar apoyo farmacológico temporal. Derivación programada a medicina general (Dra. Sandra Pérez) para evaluación integral de síntomas físicos de ansiedad y ajuste de tratamiento antihipertensivo si es necesario. Referencia a nutricionista especializada en manejo del estrés (Lic. Patricia Gómez) para establecer plan alimentario que apoye la regulación emocional y manejo de la gastritis. Posible derivación futura a mediación familiar si la participante expresa interés en mejorar la comunicación con su ex pareja para beneficio de los hijos.",
  "closingNote": {
    "closingDate": "2025-03-15",
    "reason": "TREATMENT_COMPLETED",
    "achievements": "Logros terapéuticos excepcionales alcanzados durante 20 semanas de tratamiento. Reducción del 85% en frecuencia e intensidad de episodios ansiosos (de 8 episodios semanales intensidad 7/10 a 1 episodio quincenal intensidad 2/10). Desarrollo exitoso de repertorio amplio de estrategias de afrontamiento incluyendo técnicas de respiración, reestructuración cognitiva, y manejo del tiempo. Mejora significativa en calidad del sueño con tiempo de conciliación estabilizado en 15-20 minutos. Fortalecimiento notable de red de apoyo social con participación activa en grupo de apoyo para madres separadas y restablecimiento de vínculos familiares y de amistad. Desarrollo de rutina de autocuidado sostenible incluyendo ejercicio regular, alimentación balanceada y actividades recreativas. Mejora en habilidades de comunicación asertiva evidenciada en manejo exitoso de situaciones familiares complejas.",
    "recommendations": "Mantenimiento de técnicas de respiración y relajación aprendidas con práctica mínima de 10 minutos diarios. Continuidad en rutina de ejercicio físico regular establecida (caminata/yoga 4 veces por semana). Mantenimiento de participación en grupo de apoyo al menos una vez al mes. Aplicación continua de técnicas de reestructuración cognitiva ante situaciones estresantes futuras, utilizando el manual de autoayuda personalizado desarrollado durante el tratamiento. Seguimiento médico regular cada 6 meses para control de hipertensión arterial. Consulta psicológica preventiva programada a los 6 meses para evaluación de mantenimiento de logros y prevención de recaídas. Activación de plan de contingencia desarrollado durante el tratamiento ante situaciones de estrés elevado futuro.",
    "observations": "Proceso terapéutico excepcionalmente exitoso caracterizado por una participante altamente comprometida y colaborativa en todas las fases del tratamiento. Desarrollo de insight profundo sobre patrones de pensamiento y conducta disfuncionales previos. La participante demostró capacidad excepcional para generalizar aprendizajes terapéuticos a situaciones de la vida cotidiana. Evolución favorable en todas las áreas evaluadas: síntomas ansiosos, funcionamiento social, laboral y familiar. Alta satisfacción expresada por la participante con los resultados obtenidos y el proceso terapéutico en general. Pronóstico excelente para mantenimiento a largo plazo de los logros terapéuticos dado el nivel de apropiación de herramientas desarrollado. La participante egresa con capacidades sólidas para autoaplicación de técnicas aprendidas y manejo autónomo de situaciones desafiantes futuras."
  }
}
```

### **📊 Resumen del Ejemplo:**

#### **👤 Perfil del Caso:**

- **Participante:** María García, 34 años
- **Situación:** Proceso de separación matrimonial
- **Diagnóstico:** Ansiedad generalizada moderada-severa
- **Duración:** 20 semanas de tratamiento

#### **🎯 Elementos Incluidos:**

- ✅ Motivo de consulta detallado y realista
- ✅ Historia médica completa (física y mental)
- ✅ 5 situaciones identificadas del catálogo
- ✅ 5 planes de seguimiento del catálogo
- ✅ 3 planes de intervención específicos
- ✅ 3 notas de progreso evolutivas
- ✅ Referidos a múltiples especialistas
- ✅ Nota de cierre exitosa

#### **📋 Campos de Catálogo Utilizados:**

- **identifiedSituations:** [1, 3, 5, 8, 12]
- **followUpPlan:** [1, 2, 3, 5, 7]

#### **⏱️ Cronología del Caso:**

- **Inicio:** 29 de octubre 2024
- **Progreso:** 3 sesiones documentadas
- **Cierre:** 15 de marzo 2025
- **Resultado:** Tratamiento completado exitosamente

### **💡 Puntos Destacados:**

1. **📝 Datos Realistas:** Toda la información es clínicamente coherente
2. **🔄 Progresión Lógica:** Las notas muestran evolución temporal
3. **📊 Mediciones:** Incluye escalas y puntuaciones específicas
4. **👥 Equipo Multidisciplinario:** Psicóloga, trabajadora social, médicos
5. **🎯 Objetivos Claros:** Metas específicas y medibles
6. **✅ Cierre Exitoso:** Resolución positiva del caso

Este ejemplo te muestra exactamente cómo estructurar un caso completo con todos los campos disponibles! 🚀
