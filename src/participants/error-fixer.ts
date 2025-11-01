/**
 * 🚨 SOLUCIONADOR DE ERRORES DE VALIDACIÓN
 *
 * Basado en tu error específico, estos son los campos CORRECTOS vs INCORRECTOS
 */

// ❌ CAMPOS QUE CAUSAN ERROR (NO USES ESTOS)
const CAMPOS_INCORRECTOS = {
  interventionPlans: [
    'planType', // ❌ NO EXISTE
    'description', // ❌ NO EXISTE
    'goals', // ❌ NO EXISTE
    'timeline', // ❌ NO EXISTE
    'responsibleProfessional', // ❌ NO EXISTE
  ],
  progressNotes: [
    'noteDate', // ❌ NO EXISTE - usa 'date'
    'noteContent', // ❌ NO EXISTE - usa 'summary'
    'noteType', // ❌ NO EXISTE - usa 'approachType'
    'professionalName', // ❌ NO EXISTE
  ],
  referrals: [
    'internalReferrals', // ❌ NO EXISTE
    'externalReferrals', // ❌ NO EXISTE
    'recommendations', // ❌ NO EXISTE
  ],
};

// ✅ CAMPOS CORRECTOS (USA SOLO ESTOS)
const CAMPOS_CORRECTOS = {
  interventionPlans: [
    'goal', // ✅ String opcional
    'objectives', // ✅ String opcional
    'activities', // ✅ String opcional
    'timeframe', // ✅ String opcional
    'responsiblePerson', // ✅ String opcional
    'evaluationCriteria', // ✅ String opcional
  ],
  progressNotes: [
    'date', // ✅ String requerido (ISO: YYYY-MM-DD)
    'time', // ✅ String requerido
    'approachType', // ✅ String requerido
    'process', // ✅ String requerido
    'summary', // ✅ String requerido
    'observations', // ✅ String opcional
    'agreements', // ✅ String opcional
  ],
  referrals: [
    'description', // ✅ String opcional (ÚNICO campo válido)
  ],
};

// 🎯 EJEMPLO PERFECTO (COPIA ESTE JSON)
const PARTICIPANT_CORRECTO = {
  // 👤 DATOS PERSONALES BÁSICOS (TODOS REQUERIDOS)
  firstName: 'María',
  firstLastName: 'González',
  phoneNumber: '+57 300 123 4567',
  documentTypeId: 1,
  documentNumber: '1234567890',
  address: 'Carrera 15 # 32-45, Apartamento 302',
  city: 'Bogotá',
  birthDate: '1985-03-15',
  religiousAffiliation: 'Congregación Mita',
  genderId: 1,
  maritalStatusId: 1,
  healthInsuranceId: 1,

  // 🚨 CONTACTO DE EMERGENCIA (TODOS REQUERIDOS)
  emergencyContactName: 'Carlos González',
  emergencyContactPhone: '+57 301 987 6543',
  emergencyContactEmail: 'carlos.gonzalez@email.com',
  emergencyContactAddress: 'Calle 45 # 12-34',
  emergencyContactCity: 'Bogotá',
  emergencyContactRelationshipId: 1,

  // 👨‍💼 USUARIO QUE REGISTRA (REQUERIDO)
  registeredById: 1,

  // ✅ INTERVENTION PLANS - SOLO ESTOS 6 CAMPOS
  interventionPlans: [
    {
      goal: 'Mejorar bienestar emocional y estabilidad familiar',
      objectives: 'Desarrollar estrategias de afrontamiento y comunicación',
      activities: 'Terapia individual, sesiones familiares y talleres grupales',
      timeframe: '6 meses con evaluación mensual',
      responsiblePerson: 'Dr. Ana Smith - Psicóloga Clínica',
      evaluationCriteria: 'Evaluaciones mensuales con escalas validadas',
    },
    {
      goal: 'Fortalecer redes de apoyo social',
      objectives: 'Conectar con recursos comunitarios disponibles',
      activities: 'Vinculación a programas comunitarios y grupos de apoyo',
      timeframe: '3 meses iniciales',
      responsiblePerson: 'Trabajadora Social María López',
      evaluationCriteria: 'Participación activa en actividades comunitarias',
    },
  ],

  // ✅ PROGRESS NOTES - SOLO ESTOS 7 CAMPOS (5 requeridos + 2 opcionales)
  progressNotes: [
    {
      date: '2024-01-15', // ✅ REQUERIDO - formato ISO YYYY-MM-DD
      time: '10:30', // ✅ REQUERIDO - string
      approachType: 'Individual', // ✅ REQUERIDO - string
      process: 'Sesión de evaluación inicial y establecimiento de rapport', // ✅ REQUERIDO
      summary:
        'Primera sesión completada exitosamente. Participante colaborativo y motivado', // ✅ REQUERIDO
      observations:
        'Paciente muestra buena disposición para el trabajo terapéutico', // ✅ Opcional
      agreements: 'Continuar con sesiones semanales, tareas de autoobservación', // ✅ Opcional
    },
  ],

  // ✅ REFERRALS - SOLO ESTE 1 CAMPO
  referrals: {
    description:
      'Referencia a especialista en trauma para evaluación complementaria',
  },
};

// 🔍 FUNCIÓN DE VALIDACIÓN RÁPIDA
function validarCampos(data: any): { esValido: boolean; errores: string[] } {
  const errores: string[] = [];

  // Validar interventionPlans
  if (data.interventionPlans && Array.isArray(data.interventionPlans)) {
    data.interventionPlans.forEach((plan: any, index: number) => {
      if (plan && typeof plan === 'object') {
        (Object.keys(plan) as string[]).forEach((campo) => {
          if (!CAMPOS_CORRECTOS.interventionPlans.includes(campo)) {
            errores.push(
              `❌ interventionPlans[${index}].${campo} NO ES VÁLIDO. Usa: ${CAMPOS_CORRECTOS.interventionPlans.join(', ')}`,
            );
          }
        });
      }
    });
  }

  // Validar progressNotes
  if (data.progressNotes && Array.isArray(data.progressNotes)) {
    data.progressNotes.forEach((note: any, index: number) => {
      if (note && typeof note === 'object') {
        (Object.keys(note) as string[]).forEach((campo) => {
          if (!CAMPOS_CORRECTOS.progressNotes.includes(campo)) {
            errores.push(
              `❌ progressNotes[${index}].${campo} NO ES VÁLIDO. Usa: ${CAMPOS_CORRECTOS.progressNotes.join(', ')}`,
            );
          }
        });
      }
    });
  }

  // Validar referrals
  if (data.referrals && typeof data.referrals === 'object') {
    (Object.keys(data.referrals) as string[]).forEach((campo) => {
      if (!CAMPOS_CORRECTOS.referrals.includes(campo)) {
        errores.push(
          `❌ referrals.${campo} NO ES VÁLIDO. Usa: ${CAMPOS_CORRECTOS.referrals.join(', ')}`,
        );
      }
    });
  }

  return { esValido: errores.length === 0, errores };
}

// 🚀 EJECUTAR VALIDACIÓN DEL EJEMPLO
console.log('🔍 VALIDANDO EJEMPLO CORRECTO...\n');
const resultado = validarCampos(PARTICIPANT_CORRECTO);

if (resultado.esValido) {
  console.log('🎉 ¡EJEMPLO PERFECTO! Sin errores de validación\n');
  console.log('📋 JSON LISTO PARA COPIAR Y PEGAR:');
  console.log('═'.repeat(60));
  console.log(JSON.stringify(PARTICIPANT_CORRECTO, null, 2));
  console.log('═'.repeat(60));
  console.log('\n🎯 ENDPOINT: POST /api/v1/participants');
  console.log('✅ Copia el JSON de arriba y úsalo en tu petición');
} else {
  console.log('💥 ERRORES ENCONTRADOS:');
  resultado.errores.forEach((error, i) => console.log(`${i + 1}. ${error}`));
}

console.log('\n📚 RESUMEN DE CAMPOS VÁLIDOS:');
console.log(
  '✅ interventionPlans:',
  CAMPOS_CORRECTOS.interventionPlans.join(', '),
);
console.log('✅ progressNotes:', CAMPOS_CORRECTOS.progressNotes.join(', '));
console.log('✅ referrals:', CAMPOS_CORRECTOS.referrals.join(', '));

console.log('\n🚨 CAMPOS QUE CAUSAN ERROR (NO USAR):');
console.log(
  '❌ interventionPlans:',
  CAMPOS_INCORRECTOS.interventionPlans.join(', '),
);
console.log('❌ progressNotes:', CAMPOS_INCORRECTOS.progressNotes.join(', '));
console.log('❌ referrals:', CAMPOS_INCORRECTOS.referrals.join(', '));

export {
  PARTICIPANT_CORRECTO,
  validarCampos,
  CAMPOS_CORRECTOS,
  CAMPOS_INCORRECTOS,
};
