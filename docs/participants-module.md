# 👤 Módulo de Participantes - Documentación Técnica

## 📋 Descripción General

El módulo de participantes es el **núcleo central** del sistema OOTS Colombia. Gestiona el registro completo de beneficiarios con información personal, familiar, médica, psicosocial y clínica, proporcionando una base integral para el seguimiento y atención de cada persona.

## 🏗️ Arquitectura

```
participants/
├── participants.controller.ts     # Controlador con endpoints CRUD
├── participants.service.ts       # Lógica de negocio
├── participants.module.ts        # Configuración del módulo
├── dto/
│   ├── create-participant.dto.ts  # DTO para creación
│   ├── update-participant.dto.ts  # DTO para actualización
│   └── search-participants.dto.ts # DTO para búsquedas
└── entities/
    ├── participant.entity.ts      # Entidad principal
    ├── family-member.entity.ts    # Miembros familiares
    ├── bio-psychosocial-history.entity.ts
    ├── consultation-reason.entity.ts
    ├── intervention.entity.ts
    ├── follow-up-plan.entity.ts
    ├── physical-health-history.entity.ts
    ├── mental-health-history.entity.ts
    ├── assessment.entity.ts
    ├── intervention-plan.entity.ts
    ├── progress-note.entity.ts
    ├── referral.entity.ts
    └── closing-note.entity.ts
```

## 📊 Modelo de Datos

### Entidad Principal: Participant

```typescript
@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  // Información personal básica
  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50, nullable: true })
  secondName?: string;

  @Column({ length: 50 })
  firstLastName: string;

  @Column({ length: 50, nullable: true })
  secondLastName?: string;

  @Column({ length: 20, unique: true, nullable: true })
  phoneNumber?: string;

  @Column({ length: 100, unique: true, nullable: true })
  email?: string;

  // Identificación
  @ManyToOne(() => DocumentType)
  @JoinColumn({ name: 'document_type_id' })
  documentType: DocumentType;

  @Column({ name: 'document_type_id' })
  documentTypeId: number;

  @Column({ length: 20, unique: true })
  documentNumber: string;

  // Ubicación
  @Column({ length: 200 })
  address: string;

  @Column({ length: 100 })
  city: string;

  // Información demográfica
  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ length: 100, nullable: true })
  religiousAffiliation?: string;

  @ManyToOne(() => Gender)
  @JoinColumn({ name: 'gender_id' })
  gender: Gender;

  @Column({ name: 'gender_id' })
  genderId: number;

  @ManyToOne(() => MaritalStatus)
  @JoinColumn({ name: 'marital_status_id' })
  maritalStatus: MaritalStatus;

  @Column({ name: 'marital_status_id' })
  maritalStatusId: number;

  // Seguro de salud
  @ManyToOne(() => HealthInsurance)
  @JoinColumn({ name: 'health_insurance_id' })
  healthInsurance: HealthInsurance;

  @Column({ name: 'health_insurance_id' })
  healthInsuranceId: number;

  @Column({ length: 100, nullable: true })
  customHealthInsurance?: string;

  // Fuente de referencia
  @Column({ type: 'text', nullable: true })
  referralSource?: string;

  // Contacto de emergencia
  @Column({ length: 100 })
  emergencyContactName: string;

  @Column({ length: 20 })
  emergencyContactPhone: string;

  @Column({ length: 100, nullable: true })
  emergencyContactEmail?: string;

  @Column({ length: 200 })
  emergencyContactAddress: string;

  @Column({ length: 100 })
  emergencyContactCity: string;

  @ManyToOne(() => EmergencyContactRelationship)
  @JoinColumn({ name: 'emergency_contact_relationship_id' })
  emergencyContactRelationship: EmergencyContactRelationship;

  @Column({ name: 'emergency_contact_relationship_id' })
  emergencyContactRelationshipId: number;

  // Usuario que registró
  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by_id' })
  registeredBy: User;

  @Column({ name: 'registered_by_id' })
  registeredById: number;

  // Relaciones con entidades relacionadas
  @OneToMany(() => FamilyMember, (member) => member.participant, {
    cascade: true,
  })
  familyMembers: FamilyMember[];

  @OneToOne(() => BioPsychosocialHistory, (history) => history.participant, {
    cascade: true,
  })
  bioPsychosocialHistory: BioPsychosocialHistory;

  @OneToOne(() => ConsultationReason, (reason) => reason.participant, {
    cascade: true,
  })
  consultationReason: ConsultationReason;

  @OneToMany(() => IdentifiedSituationParticipant, (is) => is.participant, {
    cascade: true,
  })
  identifiedSituationParticipants: IdentifiedSituationParticipant[];

  @OneToOne(() => Intervention, (intervention) => intervention.participant, {
    cascade: true,
  })
  intervention: Intervention;

  @OneToOne(() => FollowUpPlan, (plan) => plan.participant, { cascade: true })
  followUpPlan: FollowUpPlan;

  @OneToOne(() => PhysicalHealthHistory, (history) => history.participant, {
    cascade: true,
  })
  physicalHealthHistory: PhysicalHealthHistory;

  @OneToOne(() => MentalHealthHistory, (history) => history.participant, {
    cascade: true,
  })
  mentalHealthHistory: MentalHealthHistory;

  @OneToOne(() => Assessment, (assessment) => assessment.participant, {
    cascade: true,
  })
  assessment: Assessment;

  @OneToMany(() => InterventionPlan, (plan) => plan.participant, {
    cascade: true,
  })
  interventionPlans: InterventionPlan[];

  @OneToMany(() => ProgressNote, (note) => note.participant, { cascade: true })
  progressNotes: ProgressNote[];

  @OneToOne(() => Referral, (referral) => referral.participant, {
    cascade: true,
  })
  referrals: Referral;

  @OneToOne(() => ClosingNote, (note) => note.participant, { cascade: true })
  closingNote: ClosingNote;

  @OneToMany(() => Case, (caseEntity) => caseEntity.participant)
  cases: Case[];

  // Soft delete
  @Column({ type: 'datetime', nullable: true })
  deletedAt?: Date;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entidades Relacionadas

#### FamilyMember (Miembro Familiar)

```typescript
@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ length: 100, nullable: true })
  occupation?: string;

  @ManyToOne(() => Participant, (participant) => participant.familyMembers)
  @JoinColumn({ name: 'participant_id' })
  participant: Participant;

  @Column({ name: 'participant_id' })
  participantId: number;

  @ManyToOne(() => FamilyRelationship)
  @JoinColumn({ name: 'family_relationship_id' })
  familyRelationship: FamilyRelationship;

  @Column({ name: 'family_relationship_id' })
  familyRelationshipId: number;

  @ManyToOne(() => AcademicLevel)
  @JoinColumn({ name: 'academic_level_id' })
  academicLevel: AcademicLevel;

  @Column({ name: 'academic_level_id' })
  academicLevelId: number;
}
```

#### BioPsychosocialHistory (Historia Biopsicosocial)

```typescript
@Entity('bio_psychosocial_histories')
export class BioPsychosocialHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  schooling?: string;

  @Column({ length: 100, nullable: true })
  completedGrade?: string;

  @Column({ length: 200, nullable: true })
  institution?: string;

  @Column({ length: 100, nullable: true })
  profession?: string;

  @Column({ length: 100, nullable: true })
  incomeSource?: string;

  @Column({ length: 100, nullable: true })
  incomeLevel?: string;

  @Column({ type: 'text', nullable: true })
  occupationalHistory?: string;

  @Column({ type: 'text', nullable: true })
  housing?: string;

  // Relaciones con catálogos
  @ManyToOne(() => HousingType)
  @JoinColumn({ name: 'housing_type_id' })
  housingType: HousingType;

  @Column({ name: 'housing_type_id', nullable: true })
  housingTypeId?: number;

  @ManyToOne(() => EducationLevel)
  @JoinColumn({ name: 'education_level_id' })
  educationLevel: EducationLevel;

  @Column({ name: 'education_level_id', nullable: true })
  educationLevelId?: number;

  @ManyToOne(() => IncomeSource)
  @JoinColumn({ name: 'income_source_id' })
  incomeSourceEntity: IncomeSource;

  @Column({ name: 'income_source_id', nullable: true })
  incomeSourceId?: number;

  @ManyToOne(() => IncomeLevel)
  @JoinColumn({ name: 'income_level_id' })
  incomeLevelEntity: IncomeLevel;

  @Column({ name: 'income_level_id', nullable: true })
  incomeLevelId?: number;

  // Relación con participante
  @OneToOne(
    () => Participant,
    (participant) => participant.bioPsychosocialHistory,
  )
  @JoinColumn({ name: 'participant_id' })
  participant: Participant;

  @Column({ name: 'participant_id' })
  participantId: number;
}
```

## 🎯 Funcionalidades del Módulo

### 1. Registro de Participantes

El sistema permite registrar participantes con información completa dividida en secciones:

#### Información Básica Requerida

- **Nombres y apellidos** completos
- **Documento de identidad** (tipo y número)
- **Fecha de nacimiento**
- **Dirección y ciudad**
- **Afiliación religiosa**
- **Género y estado civil**
- **Seguro de salud**
- **Contacto de emergencia** completo
- **Usuario que registra**

#### Información Opcional Extendida

- **Teléfono y email** de contacto
- **Miembros del núcleo familiar**
- **Historia biopsicosocial** (educación, trabajo, vivienda)
- **Motivo de consulta**
- **Situaciones identificadas**
- **Intervención inicial**
- **Plan de seguimiento**
- **Historia de salud física**
- **Historia de salud mental**
- **Evaluación inicial**
- **Planes de intervención**
- **Notas de progreso**
- **Referencias**
- **Nota de cierre**

### 2. Búsqueda y Filtrado

El sistema incluye funcionalidades avanzadas de búsqueda:

```typescript
export class SearchParticipantsDto {
  @IsOptional()
  @IsString()
  search?: string; // Buscar por nombre o apellido

  @IsOptional()
  @IsString()
  city?: string; // Filtrar por ciudad

  @IsOptional()
  @IsNumber()
  page?: number = 1; // Página para paginación

  @IsOptional()
  @IsNumber()
  limit?: number = 10; // Registros por página

  @IsOptional()
  @IsNumber()
  genderId?: number; // Filtrar por género

  @IsOptional()
  @IsNumber()
  maritalStatusId?: number; // Filtrar por estado civil

  @IsOptional()
  @IsString()
  documentNumber?: string; // Buscar por documento
}
```

### 3. Estadísticas Demográficas

El módulo proporciona estadísticas detalladas:

```json
{
  "totalParticipants": 150,
  "byGender": [
    {
      "gender": "Femenino",
      "count": 85,
      "percentage": 56.7
    },
    {
      "gender": "Masculino",
      "count": 65,
      "percentage": 43.3
    }
  ],
  "byCity": [
    {
      "city": "Bogotá",
      "count": 45,
      "percentage": 30.0
    },
    {
      "city": "Medellín",
      "count": 35,
      "percentage": 23.3
    }
  ],
  "byAgeRange": [
    {
      "range": "18-25",
      "count": 25,
      "percentage": 16.7
    },
    {
      "range": "26-35",
      "count": 40,
      "percentage": 26.7
    },
    {
      "range": "36-45",
      "count": 35,
      "percentage": 23.3
    }
  ]
}
```

## 🛠️ API Endpoints

### POST /api/v1/participants

**Crear nuevo participante**

**Request Body (Ejemplo Completo):**

```json
{
  "firstName": "María",
  "secondName": "Fernanda",
  "firstLastName": "González",
  "secondLastName": "Rodríguez",
  "phoneNumber": "+57 300 123 4567",
  "email": "maria.gonzalez@email.com",
  "documentTypeId": 1,
  "documentNumber": "1234567890",
  "address": "Carrera 15 # 32-45, Apartamento 302",
  "city": "Bogotá",
  "birthDate": "1985-03-15",
  "religiousAffiliation": "Congregación Mita",
  "genderId": 2,
  "maritalStatusId": 1,
  "healthInsuranceId": 3,
  "customHealthInsurance": null,
  "referralSource": "Referido por obrero Pepito Pérez de Congregación Mita Barranquilla",
  "emergencyContactName": "Carlos Alberto González Martínez",
  "emergencyContactPhone": "+57 301 987 6543",
  "emergencyContactEmail": "carlos.gonzalez@email.com",
  "emergencyContactAddress": "Calle 45 # 12-34, Casa 101",
  "emergencyContactCity": "Bogotá",
  "emergencyContactRelationshipId": 4,
  "registeredById": 1,
  "familyMembers": [
    {
      "name": "Ana Sofía González Rodríguez",
      "birthDate": "2010-12-05",
      "occupation": "Estudiante de Primaria",
      "familyRelationshipId": 1,
      "academicLevelId": 2
    },
    {
      "name": "Miguel Alejandro González Rodríguez",
      "birthDate": "2015-06-18",
      "occupation": "Estudiante de Preescolar",
      "familyRelationshipId": 1,
      "academicLevelId": 1
    }
  ],
  "bioPsychosocialHistory": {
    "schooling": "Universidad",
    "completedGrade": "Profesional Completo",
    "institution": "Universidad Nacional de Colombia",
    "profession": "Psicóloga Clínica",
    "incomeSource": "Sueldo",
    "incomeLevel": "Más de 1 SMLV",
    "occupationalHistory": "5 años como psicóloga clínica en hospital público, 3 años en consulta privada",
    "housingTypeId": 1,
    "educationLevelId": 3,
    "incomeSourceId": 2,
    "incomeLevelId": 4,
    "housing": "Casa de 3 habitaciones, 2 baños, sala, comedor, cocina integral y patio trasero"
  },
  "consultationReason": {
    "reason": "La participante solicita orientación para manejar situaciones de estrés laboral que han comenzado a afectar su rendimiento profesional y la dinámica familiar."
  },
  "identifiedSituations": [
    "Estrés",
    "Problemas familiares",
    "Orientación general",
    "Baja autoestima",
    "Problemas espirituales"
  ],
  "intervention": {
    "intervention": "Se realizó sesión inicial de orientación psicológica de 90 minutos. Se aplicó entrevista semiestructurada para evaluación integral."
  },
  "followUpPlan": {
    "plan": "Se coordinó cita para iniciar proceso de orientación con seguimiento semanal por 8 semanas."
  },
  "physicalHealthHistory": {
    "physicalConditions": "Hipertensión arterial controlada diagnosticada hace 3 años, migrañas tensionales frecuentes",
    "receivingTreatment": "Sí",
    "treatmentDetails": "Losartán 50mg una vez al día en ayunas para hipertensión",
    "paternalFamilyHistory": "Padre fallecido a los 65 años por infarto agudo de miocardio",
    "maternalFamilyHistory": "Madre viva de 68 años con hipertensión arterial y artritis reumatoide",
    "physicalHealthObservations": "Se recomienda continuar con controles médicos regulares"
  },
  "mentalHealthHistory": {
    "mentalConditions": "Episodios de ansiedad generalizada desde hace 2 años",
    "receivingMentalTreatment": "No",
    "mentalTreatmentDetails": "",
    "paternalMentalHistory": "Padre tenía tendencia al aislamiento social",
    "maternalMentalHistory": "Madre con episodios de depresión postparto",
    "mentalHealthObservations": "Se sugiere evaluación psicológica especializada"
  },
  "assessment": {
    "consultationReason": "Estrés laboral crónico con impacto en funcionamiento familiar y personal",
    "weighting": "Situación de estrés moderado a severo con riesgo de progresión",
    "concurrentFactors": "Presión laboral elevada, responsabilidades familiares múltiples",
    "criticalFactors": "Deterioro progresivo de la calidad del sueño",
    "problemAnalysis": "María presenta un cuadro de estrés laboral crónico que ha evolucionado hacia síntomas ansiosos"
  },
  "interventionPlans": [
    {
      "goal": "Reducir los niveles de estrés y ansiedad al 70% en un periodo de 8 semanas",
      "objectives": "Aprender y aplicar técnicas de relajación progresiva",
      "activities": "Sesiones semanales de orientación psicológica (8 sesiones)",
      "timeframe": "8 semanas intensivas + 4 sesiones de seguimiento mensual",
      "responsiblePerson": "Psicóloga orientadora María Elena Vargas",
      "evaluationCriteria": "Disminución de puntuación en escala de ansiedad GAD-7"
    }
  ],
  "progressNotes": [
    {
      "date": "2024-01-15",
      "time": "10:30",
      "approachType": "CP",
      "process": "S",
      "summary": "Primera sesión de orientación psicológica. Se estableció rapport adecuado.",
      "observations": "María presenta insight adecuado sobre su situación",
      "agreements": "Practicar técnicas de respiración diafragmática 2 veces al día"
    }
  ],
  "referrals": {
    "description": "Se refiere a Medicina General - Dr. Roberto Sánchez para evaluación de cefaleas tensionales"
  },
  "closingNote": {
    "closureReason": "Proceso completado exitosamente después de 8 sesiones individuales",
    "achievements": "Reducción de ansiedad de 28 a 8 puntos en escala Beck",
    "recommendations": "Continuar con práctica diaria de mindfulness y técnicas de respiración",
    "observations": "María demostró excelente capacidad de insight y compromiso"
  }
}
```

**Response (201):**

```json
{
  "id": 1,
  "firstName": "María",
  "secondName": "Fernanda",
  "firstLastName": "González",
  "secondLastName": "Rodríguez",
  "phoneNumber": "+57 300 123 4567",
  "email": "maria.gonzalez@email.com",
  "documentNumber": "1234567890",
  "address": "Carrera 15 # 32-45, Apartamento 302",
  "city": "Bogotá",
  "birthDate": "1985-03-15",
  "religiousAffiliation": "Congregación Mita",
  "referralSource": "Referido por obrero Pepito Pérez de Congregación Mita Barranquilla",
  "emergencyContactName": "Carlos Alberto González Martínez",
  "emergencyContactPhone": "+57 301 987 6543",
  "emergencyContactEmail": "carlos.gonzalez@email.com",
  "emergencyContactAddress": "Calle 45 # 12-34, Casa 101",
  "emergencyContactCity": "Bogotá",
  "documentType": {
    "id": 1,
    "name": "Cédula de Ciudadanía"
  },
  "gender": {
    "id": 2,
    "name": "Femenino"
  },
  "maritalStatus": {
    "id": 1,
    "name": "Soltero/a"
  },
  "healthInsurance": {
    "id": 3,
    "name": "EPS Sura"
  },
  "emergencyContactRelationship": {
    "id": 4,
    "name": "Esposo/a"
  },
  "registeredBy": {
    "id": 1,
    "firstName": "Admin",
    "firstLastName": "Sistema"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/v1/participants

**Obtener lista de participantes con filtros y paginación**

**Query Parameters:**

- `search`: Texto libre para buscar en nombres
- `city`: Filtrar por ciudad específica
- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 10)
- `genderId`: Filtrar por género
- `maritalStatusId`: Filtrar por estado civil
- `documentNumber`: Buscar por número de documento

**Ejemplo:**

```http
GET /api/v1/participants?search=María&city=Bogotá&page=1&limit=10&genderId=2
```

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "firstName": "María",
      "firstLastName": "González",
      "documentNumber": "1234567890",
      "city": "Bogotá",
      "gender": "Femenino",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### GET /api/v1/participants/:id

**Obtener participante específico con toda la información**

**Response (200):**

```json
{
  "id": 1,
  "firstName": "María",
  "secondName": "Fernanda",
  "firstLastName": "González",
  "secondLastName": "Rodríguez",
  "phoneNumber": "+57 300 123 4567",
  "email": "maria.gonzalez@email.com",
  "documentNumber": "1234567890",
  "address": "Carrera 15 # 32-45, Apartamento 302",
  "city": "Bogotá",
  "birthDate": "1985-03-15",
  "religiousAffiliation": "Congregación Mita",
  "documentType": {
    "id": 1,
    "name": "Cédula de Ciudadanía"
  },
  "gender": {
    "id": 2,
    "name": "Femenino"
  },
  "maritalStatus": {
    "id": 1,
    "name": "Soltero/a"
  },
  "healthInsurance": {
    "id": 3,
    "name": "EPS Sura"
  },
  "familyMembers": [
    {
      "id": 1,
      "name": "Ana Sofía González Rodríguez",
      "birthDate": "2010-12-05",
      "occupation": "Estudiante de Primaria",
      "familyRelationship": {
        "id": 1,
        "name": "Hijo/a"
      },
      "academicLevel": {
        "id": 2,
        "name": "Primaria"
      }
    }
  ],
  "bioPsychosocialHistory": {
    "profession": "Psicóloga Clínica",
    "incomeSource": "Sueldo",
    "incomeLevel": "Más de 1 SMLV",
    "occupationalHistory": "5 años como psicóloga clínica...",
    "housing": "Casa de 3 habitaciones..."
  },
  "consultationReason": {
    "reason": "La participante solicita orientación..."
  },
  "cases": [
    {
      "id": 1,
      "caseNumber": "CASE-0001",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### PATCH /api/v1/participants/:id

**Actualizar información del participante**

**Request Body (Campos opcionales):**

```json
{
  "phoneNumber": "+57 300 999 8888",
  "email": "nuevo.email@ejemplo.com",
  "address": "Nueva dirección actualizada",
  "emergencyContactPhone": "+57 301 888 7777"
}
```

### DELETE /api/v1/participants/:id

**Eliminar participante (soft delete)**

**Response (200):**

```json
{
  "message": "Participante eliminado exitosamente",
  "deletedAt": "2024-01-15T15:30:00.000Z"
}
```

### GET /api/v1/participants/stats/demographic

**Obtener estadísticas demográficas**

**Response (200):**

```json
{
  "totalParticipants": 150,
  "byGender": [
    {
      "gender": "Femenino",
      "count": 85,
      "percentage": 56.7
    },
    {
      "gender": "Masculino",
      "count": 65,
      "percentage": 43.3
    }
  ],
  "byCity": [
    {
      "city": "Bogotá",
      "count": 45,
      "percentage": 30.0
    },
    {
      "city": "Medellín",
      "count": 35,
      "percentage": 23.3
    },
    {
      "city": "Cali",
      "count": 25,
      "percentage": 16.7
    }
  ],
  "byAgeRange": [
    {
      "range": "18-25",
      "count": 25,
      "percentage": 16.7
    },
    {
      "range": "26-35",
      "count": 40,
      "percentage": 26.7
    },
    {
      "range": "36-45",
      "count": 35,
      "percentage": 23.3
    },
    {
      "range": "46-55",
      "count": 30,
      "percentage": 20.0
    },
    {
      "range": "56+",
      "count": 20,
      "percentage": 13.3
    }
  ],
  "byMaritalStatus": [
    {
      "status": "Soltero/a",
      "count": 60,
      "percentage": 40.0
    },
    {
      "status": "Casado/a",
      "count": 45,
      "percentage": 30.0
    },
    {
      "status": "Unión Libre",
      "count": 25,
      "percentage": 16.7
    },
    {
      "status": "Divorciado/a",
      "count": 15,
      "percentage": 10.0
    },
    {
      "status": "Viudo/a",
      "count": 5,
      "percentage": 3.3
    }
  ],
  "byHealthInsurance": [
    {
      "insurance": "EPS Sura",
      "count": 40,
      "percentage": 26.7
    },
    {
      "insurance": "Nueva EPS",
      "count": 35,
      "percentage": 23.3
    },
    {
      "insurance": "Salud Total",
      "count": 30,
      "percentage": 20.0
    }
  ]
}
```

## 🔍 Validaciones y Reglas de Negocio

### Validaciones de Entrada

1. **Campos Requeridos:**
   - firstName, firstLastName
   - documentTypeId, documentNumber
   - address, city
   - birthDate, religiousAffiliation
   - genderId, maritalStatusId, healthInsuranceId
   - emergencyContactName, emergencyContactPhone
   - emergencyContactAddress, emergencyContactCity
   - emergencyContactRelationshipId, registeredById

2. **Unicidad:**
   - documentNumber: Único en el sistema
   - phoneNumber: Único si se proporciona
   - email: Único si se proporciona

3. **Formatos:**
   - email: Formato válido de email
   - phoneNumber: Formato de teléfono con código país
   - birthDate: Fecha válida en formato ISO

4. **Longitudes:**
   - Nombres: 2-50 caracteres
   - Email: máximo 100 caracteres
   - Teléfono: máximo 20 caracteres
   - Documento: máximo 20 caracteres
   - Dirección: máximo 200 caracteres

### Reglas de Negocio

1. **Edad Mínima:** El participante debe ser mayor de edad (18 años) o tener autorización para menores
2. **Contacto de Emergencia:** Debe ser diferente al participante
3. **Documento Único:** No puede haber dos participantes con el mismo número de documento
4. **Usuario Registrador:** Debe existir y estar activo en el sistema
5. **Soft Delete:** Los participantes eliminados se marcan pero no se borran físicamente

### Manejo de Errores

```json
// Documento duplicado (409)
{
  "message": "Ya existe un participante con este número de documento",
  "error": "Conflict",
  "statusCode": 409
}

// Email duplicado (409)
{
  "message": "El email ya está registrado para otro participante",
  "error": "Conflict",
  "statusCode": 409
}

// Validación fallida (400)
{
  "message": [
    "El primer nombre debe tener al menos 2 caracteres",
    "El email debe tener un formato válido",
    "La fecha de nacimiento es requerida"
  ],
  "error": "Bad Request",
  "statusCode": 400
}

// Participante no encontrado (404)
{
  "message": "Participant with ID 999 not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## 🧪 Testing

### Pruebas Unitarias

```typescript
describe('ParticipantsService', () => {
  it('should create a participant with basic information', async () => {
    const createDto = {
      firstName: 'María',
      firstLastName: 'González',
      documentTypeId: 1,
      documentNumber: '1234567890',
      // ... otros campos requeridos
    };

    const result = await service.create(createDto);

    expect(result).toBeDefined();
    expect(result.firstName).toBe(createDto.firstName);
    expect(result.documentNumber).toBe(createDto.documentNumber);
  });

  it('should find participants by search criteria', async () => {
    const searchDto = {
      search: 'María',
      city: 'Bogotá',
      page: 1,
      limit: 10,
    };

    const result = await service.findAll(searchDto);

    expect(result.data).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
    expect(result.page).toBe(1);
  });

  it('should calculate demographic statistics', async () => {
    const stats = await service.getDemographicStats();

    expect(stats.totalParticipants).toBeGreaterThan(0);
    expect(stats.byGender).toBeDefined();
    expect(stats.byCity).toBeDefined();
    expect(stats.byAgeRange).toBeDefined();
  });
});
```

### Pruebas de Integración

```typescript
describe('ParticipantsController (e2e)', () => {
  it('/participants (POST) - should create participant', () => {
    return request(app.getHttpServer())
      .post('/participants')
      .set('Authorization', `Bearer ${token}`)
      .send(createParticipantDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.firstName).toBe(createParticipantDto.firstName);
      });
  });

  it('/participants (GET) - should return paginated list', () => {
    return request(app.getHttpServer())
      .get('/participants?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.total).toBeDefined();
      });
  });
});
```

## 📊 Performance y Optimización

### Índices de Base de Datos

```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_participants_document_number ON participants(document_number);
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_participants_phone_number ON participants(phone_number);
CREATE INDEX idx_participants_city ON participants(city);
CREATE INDEX idx_participants_first_name ON participants(first_name);
CREATE INDEX idx_participants_first_last_name ON participants(first_last_name);
CREATE INDEX idx_participants_deleted_at ON participants(deleted_at);

-- Índices compuestos para filtros comunes
CREATE INDEX idx_participants_gender_city ON participants(gender_id, city);
CREATE INDEX idx_participants_marital_status_gender ON participants(marital_status_id, gender_id);
```

### Lazy Loading

```typescript
// En las consultas, cargar relaciones solo cuando se necesiten
async findOne(id: number): Promise<Participant> {
  return this.participantRepository.findOne({
    where: { id, deletedAt: IsNull() },
    relations: [
      'documentType',
      'gender',
      'maritalStatus',
      'healthInsurance',
      'emergencyContactRelationship',
      'registeredBy',
      'familyMembers',
      'familyMembers.familyRelationship',
      'familyMembers.academicLevel',
      'bioPsychosocialHistory',
      'consultationReason',
      'cases'
    ]
  });
}
```

### Paginación Eficiente

```typescript
async findAll(searchDto: SearchParticipantsDto) {
  const { search, city, page = 1, limit = 10 } = searchDto;
  const skip = (page - 1) * limit;

  const queryBuilder = this.participantRepository
    .createQueryBuilder('participant')
    .leftJoinAndSelect('participant.gender', 'gender')
    .leftJoinAndSelect('participant.documentType', 'documentType')
    .where('participant.deletedAt IS NULL');

  if (search) {
    queryBuilder.andWhere(
      '(participant.firstName LIKE :search OR participant.firstLastName LIKE :search)',
      { search: `%${search}%` }
    );
  }

  if (city) {
    queryBuilder.andWhere('participant.city = :city', { city });
  }

  const [data, total] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}
```

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas

1. **Historial de Cambios**: Audit log de modificaciones
2. **Documentos Adjuntos**: Subida de archivos (fotos, documentos)
3. **Geolocalización**: Coordenadas GPS de direcciones
4. **Notificaciones**: Alertas por cumpleaños, citas, seguimientos
5. **Exportación**: PDF, Excel de información de participantes
6. **Dashboard**: Gráficos y métricas en tiempo real
7. **Búsqueda Avanzada**: Filtros por múltiples criterios
8. **Integración Externa**: APIs de EPS, DANE, etc.

### Mejoras Técnicas

1. **Caché**: Redis para consultas frecuentes
2. **Índices Full-Text**: Para búsquedas de texto más eficientes
3. **Archiving**: Archivo automático de registros antiguos
4. **Backup**: Respaldos automáticos de datos críticos
5. **Audit Trail**: Seguimiento completo de cambios

---

_Documentación del Módulo de Participantes - OOTS Colombia v1.0.0_
