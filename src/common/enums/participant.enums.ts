export enum DocumentType {
  CEDULA_CIUDADANIA = 'Cédula de Ciudadanía',
  TARJETA_IDENTIDAD = 'Tarjeta de Identidad',
  CEDULA_EXTRANJERIA = 'Cédula de Extranjería',
  PASAPORTE = 'Pasaporte',
}

export enum Gender {
  FEMENINO = 'Femenino',
  MASCULINO = 'Masculino',
  PREFIERO_NO_DECIRLO = 'Prefiero No Decirlo',
}

export enum MaritalStatus {
  CASADO = 'Casado',
  DIVORCIADO = 'Divorciado',
  SEPARADO = 'Separado',
  SOLTERO = 'Soltero',
  UNION_LIBRE = 'Unión Libre',
  VIUDO = 'Viudo',
}

export enum HealthInsurance {
  SURA = 'SURA',
  NUEVA_EPS = 'Nueva EPS',
  COMPENSAR = 'Compensar',
  FAMISANAR = 'Famisanar',
  SANITAS = 'Sanitas',
  SALUD_TOTAL = 'Salud Total',
  MEDIMAS = 'Medimás',
  CAJACOPI = 'Cajacopi',
  COMFENALCO = 'Comfenalco',
  OTHER = 'other',
}

export enum EmergencyContactRelationship {
  PADRE = 'Padre',
  MADRE = 'Madre',
  HERMANO_A = 'Hermano/a',
  HIJO_A = 'Hijo/a',
  ESPOSO_A = 'Esposo/a',
  TIO_A = 'Tío/a',
  ABUELO_A = 'Abuelo/a',
  PRIMO_A = 'Primo/a',
  AMIGO_A = 'Amigo/a',
  OTRO = 'Otro',
}

export enum FamilyRelationship {
  PADRE = 'Padre',
  MADRE = 'Madre',
  HERMANO = 'Hermano',
  HERMANA = 'Hermana',
  HIJO = 'Hijo',
  HIJA = 'Hija',
  ESPOSO = 'Esposo',
  ESPOSA = 'Esposa',
  TIO = 'Tio',
  TIA = 'Tia',
  ABUELO = 'Abuelo',
  ABUELA = 'Abuela',
  PRIMO = 'Primo',
  PRIMA = 'Prima',
  SOBRINO = 'Sobrino',
  SOBRINA = 'Sobrina',
  NIETO = 'Nieto',
  NIETA = 'Nieta',
  CUÑADO = 'Cuñado',
  CUÑADA = 'Cuñada',
  YERNO = 'Yerno',
  NUERA = 'Nuera',
  SUEGRO = 'Suegro',
  SUEGRA = 'Suegra',
  OTRO = 'Otro',
}

export enum AcademicLevel {
  SIN_GRADO = 'Sin Grado Académico',
  PREESCOLAR = 'Preescolar',
  PRIMARIA = 'Primaria',
  SECUNDARIA = 'Secundaria',
  TECNICO = 'Técnico',
  TECNÓLOGO = 'Tecnólogo',
  PREGRADO = 'Pregrado',
  ESPECIALIZACION = 'Especialización',
  MAESTRIA = 'Maestria',
  DOCTORADO = 'Doctorado',
  POSTDOCTORADO = 'Postdoctorado',
}

export enum EducationLevel {
  PRIMARIA = 'Primaria',
  SECUNDARIA = 'Secundaria',
  TECNICO = 'Técnico',
  TECNÓLOGO = 'Tecnólogo',
  UNIVERSIDAD = 'Universidad',
  ESPECIALIZACION = 'Especialización',
  MAESTRIA = 'Maestría',
  DOCTORADO = 'Doctorado',
  NO_TIENE_ESTUDIOS = 'No tiene estudios',
}

export enum IncomeSource {
  SUELDO = 'Sueldo',
  RENTAS = 'Rentas',
  SEGURO = 'Seguro',
  PENSIONES = 'Pensiones',
  GIROS = 'Giros',
  NEGOCIO_PROPIO = 'Negocio propio',
  OTRO = 'Otro',
}

export enum IncomeLevel {
  MENOS_DE_1_SMLV = 'Menos de 1 SMLV',
  UNO_SMLV = '1 SMLV',
  MAS_DE_1_SMLV = 'Más de 1 SMLV',
}

export enum HousingType {
  PROPIA = 'Propia',
  ARRIENDO = 'Arriendo',
  FAMILIAR = 'Familiar',
}

export enum IdentifiedSituation {
  ORIENTACION_GENERAL = 'Orientación general',
  VIVIENDA = 'Vivienda',
  FALTA_DE_EMPLEO = 'Falta de empleo',
  BAJA_AUTOESTIMA = 'Baja autoestima',
  ESTRES = 'Estrés',
  CONDUCTA_AGRESIVA = 'Conducta agresiva',
  VIOLENCIA_EN_EL_HOGAR = 'Violencia en el hogar',
  EMBARAZO_ADOLESCENTE = 'Embarazo adolescente',
  DEPRESION = 'Depresión',
  PROBLEMAS_PSIQUIATRICOS = 'Problemas psiquiátricos',
  PROBLEMAS_FAMILIARES = 'Problemas familiares',
  CONFLICTOS_MARITALES = 'Conflictos maritales',
  CRISIS_DE_DIVORCIO = 'Crisis de divorcio',
  ABUSO_DE_ALCOHOL = 'Abuso de alcohol',
  PROBLEMAS_FINANCIEROS = 'Problemas financieros',
  DESORDENES_ALIMENTICIOS = 'Desórdenes alimenticios',
  PROBLEMAS_ESPIRITUALES = 'Problemas espirituales',
  SEGURO_SOCIAL = 'Seguro social',
  PROBLEMAS_AGENCIA_GUBERNAMENTAL = 'Problemas con alguna agencia gubernamental',
  USO_DROGAS_ILICITAS = 'Uso de drogas ilícitas',
  OTROS = 'Otros',
}

export enum FollowUpPlanType {
  CULMINO_PROCESO = 'Se culminó el proceso de ayuda',
  COORDINO_SERVICIOS = 'Se coordinó servicios en (mencionar agencia)',
  REFERIDO = 'Se hará un referido (mencionar los referidos y justificar)',
  COORDINO_CITA = 'Se coordinó cita para iniciar proceso de orientación',
  OTROS = 'Otros',
}

export enum TreatmentStatus {
  SI = 'Sí',
  NO = 'No',
}

export enum ApproachType {
  CP = 'CP', // Consulta Presencial
  E = 'E', // Email
  EC = 'EC', // Encuentro Casual
  LL = 'Ll', // Llamada
  TC = 'TC', // Tele Consulta
  V = 'V', // Virtual
}

export enum ProcessType {
  S = 'S', // Seguimiento
  C = 'C', // Cierre
  T = 'T', // Transferencia
  D = 'D', // Derivación
}
