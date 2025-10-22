# 📋 Plan Completo de Reestructuración: Participant → Case

## 🎯 Objetivo

**Migrar toda la información clínica/médica desde `Participant` hacia `Case`** para que cada consulta tenga su propia información médica independiente.

---

## 🏗️ **NUEVA ARQUITECTURA**

### **📱 PARTICIPANT (Solo Información Personal)**

```typescript
- Datos básicos: firstName, lastName, documentNumber, email, phone
- Demografía: gender, maritalStatus, birthDate, address, city
- Contacto emergencia: emergencyContactName, emergencyContactPhone
- Relaciones que SÍ permanecen:
  ✅ FamilyMembers[] (información familiar básica - no médica)
  ✅ Cases[] (OneToMany - un participante tiene múltiples casos)
```

### **📋 CASE (Información Médica/Clínica Completa)**

```typescript
- Información del caso: caseNumber, title, description, status
- Relación con participante: participant (ManyToOne)
- Historiales médicos:
  ✅ BioPsychosocialHistory (OneToOne)
  ✅ PhysicalHealthHistory (OneToOne)
  ✅ MentalHealthHistory (OneToOne)
- Información clínica:
  ✅ ConsultationReason (OneToOne)
  ✅ Assessment (OneToOne)
  ✅ Intervention (OneToOne)
  ✅ FollowUpPlan (OneToOne)
- Seguimiento:
  ✅ InterventionPlans[] (OneToMany)
  ✅ ProgressNotes[] (OneToMany)
  ✅ Referrals (OneToOne)
```

---

## 📝 **ENTIDADES A MIGRAR**

### **Grupo 1: Historiales Médicos** ✅ (50% completado)

- [x] **BioPsychosocialHistory**: `participant_id` → `case_id` ✅
- [x] **PhysicalHealthHistory**: `participant_id` → `case_id` ✅
- [x] **MentalHealthHistory**: `participant_id` → `case_id` ✅

### **Grupo 2: Información Clínica** ⏳ (pendiente)

- [ ] **ConsultationReason**: `participant_id` → `case_id`
- [ ] **Assessment**: `participant_id` → `case_id`
- [ ] **Intervention**: `participant_id` → `case_id`
- [ ] **FollowUpPlan**: `participant_id` → `case_id`

### **Grupo 3: Seguimiento y Planes** ⏳ (pendiente)

- [ ] **InterventionPlan**: `participant_id` → `case_id`
- [ ] **ProgressNote**: `participant_id` → `case_id`
- [ ] **Referrals**: `participant_id` → `case_id`

### **Entidades que NO se tocan** ✅

- **FamilyMember**: Permanece en `Participant` (información familiar básica)
- **ParticipantIdentifiedSituation**: Se evalúa si mover o mantener

---

## 🔄 **CAMBIOS POR ENTIDAD**

### **Patrón Estándar de Migración:**

```typescript
// ANTES:
@Column({ name: 'participant_id' })
participantId: number;

@OneToOne(() => Participant, (participant) => participant.entityName)
@JoinColumn({ name: 'participant_id' })
participant: Participant;

// DESPUÉS:
@Column({ name: 'case_id' })
caseId: number;

@OneToOne(() => Case, (caseEntity) => caseEntity.entityName)
@JoinColumn({ name: 'case_id' })
case: Case;
```

---

## 📊 **MIGRACIONES DE BASE DE DATOS**

### **Script SQL de Migración:**

```sql
-- 1. Agregar columna case_id a todas las tablas
ALTER TABLE bio_psychosocial_history ADD COLUMN case_id INT;
ALTER TABLE physical_health_history ADD COLUMN case_id INT;
ALTER TABLE mental_health_history ADD COLUMN case_id INT;
ALTER TABLE consultation_reasons ADD COLUMN case_id INT;
ALTER TABLE assessments ADD COLUMN case_id INT;
ALTER TABLE interventions ADD COLUMN case_id INT;
ALTER TABLE follow_up_plans ADD COLUMN case_id INT;
ALTER TABLE intervention_plans ADD COLUMN case_id INT;
ALTER TABLE progress_notes ADD COLUMN case_id INT;
ALTER TABLE referrals ADD COLUMN case_id INT;

-- 2. Popular case_id basado en participant_id
-- (Requiere lógica de negocio para decidir qué caso asignar)

-- 3. Crear foreign keys hacia cases
ALTER TABLE bio_psychosocial_history
  ADD CONSTRAINT FK_bio_psychosocial_history_case
  FOREIGN KEY (case_id) REFERENCES cases(id);

-- 4. Eliminar foreign keys y columnas participant_id
ALTER TABLE bio_psychosocial_history
  DROP FOREIGN KEY FK_bio_psychosocial_history_participant;
ALTER TABLE bio_psychosocial_history DROP COLUMN participant_id;

-- Repetir para todas las tablas...
```

---

## 📱 **CAMBIOS EN DTOs**

### **Antes: CreateParticipantDto**

```typescript
export class CreateParticipantDto {
  // Información personal
  firstName: string;
  email: string;

  // ❌ ELIMINAR - Va a Case
  bioPsychosocialHistory?: CreateBioPsychosocialHistoryDto;
  physicalHealthHistory?: CreatePhysicalHealthHistoryDto;
  mentalHealthHistory?: CreateMentalHealthHistoryDto;
  consultationReason?: CreateConsultationReasonDto;
  assessment?: CreateAssessmentDto;
  intervention?: CreateInterventionDto;
  followUpPlan?: CreateFollowUpPlanDto;
  interventionPlans?: CreateInterventionPlanDto[];
  progressNotes?: CreateProgressNoteDto[];
  referrals?: CreateReferralsDto;
}
```

### **Después: DTOs Separados**

```typescript
// ✅ SIMPLIFICADO - Solo info personal
export class CreateParticipantDto {
  firstName: string;
  email: string;
  documentNumber: string;
  // Solo información básica y familiar
  familyMembers?: CreateFamilyMemberDto[];
}

// ✅ EXPANDIDO - Toda la info médica
export class CreateCaseDto {
  title: string;
  description: string;
  participantId: number;

  // MIGRADO desde CreateParticipantDto
  bioPsychosocialHistory?: CreateBioPsychosocialHistoryDto;
  physicalHealthHistory?: CreatePhysicalHealthHistoryDto;
  mentalHealthHistory?: CreateMentalHealthHistoryDto;
  consultationReason?: CreateConsultationReasonDto;
  assessment?: CreateAssessmentDto;
  intervention?: CreateInterventionDto;
  followUpPlan?: CreateFollowUpPlanDto;
  interventionPlans?: CreateInterventionPlanDto[];
  progressNotes?: CreateProgressNoteDto[];
  referrals?: CreateReferralsDto;
}
```

---

## 🔧 **CAMBIOS EN SERVICIOS**

### **ParticipantsService (Simplificado)**

```typescript
async create(createParticipantDto: CreateParticipantDto): Promise<Participant> {
  // ✅ Solo crear:
  // - Participant (info básica)
  // - FamilyMembers[]
  //
  // ❌ NO crear más:
  // - Historiales médicos
  // - Información clínica
  // - Seguimiento
}
```

### **CasesService (Expandido)**

```typescript
async create(createCaseDto: CreateCaseDto): Promise<Case> {
  return await this.caseRepository.manager.transaction(async (manager) => {
    // 1. Crear Case principal
    const savedCase = await manager.save(Case, caseData);

    // 2. Crear TODAS las entidades médicas:
    const relationPromises = [];

    if (bioPsychosocialHistory) {
      relationPromises.push(manager.save(BioPsychosocialHistory, {
        ...bioPsychosocialHistory,
        caseId: savedCase.id
      }));
    }

    // ... todas las demás entidades
    await Promise.all(relationPromises);

    return savedCase;
  });
}
```

---

## 🚀 **NUEVO FLUJO DE TRABAJO**

### **Antes (Problemático):**

```
1. Crear Participant + TODA la info médica
2. Crear Case (solo título/descripción)
3. ❌ Info médica queda "orfana" en participant
```

### **Después (Correcto):**

```
1. Crear Participant (solo info personal + familia)
2. Crear Case + TODA la info médica específica
3. ✅ Cada consulta tiene su propia info médica
```

### **Ejemplo Práctico:**

```typescript
// Paso 1: Crear participante básico
const participant = await participantsService.create({
  firstName: "María",
  documentNumber: "12345678",
  familyMembers: [...]  // Solo info familiar
});

// Paso 2: Crear caso con info médica específica
const case1 = await casesService.create({
  title: "Consulta inicial por ansiedad",
  participantId: participant.id,
  consultationReason: { reason: "Ansiedad post-separación" },
  physicalHealthHistory: { conditions: "Hipertensión" },
  assessment: { analysis: "Requiere terapia cognitiva" }
});

// Paso 3: Nuevo caso 6 meses después
const case2 = await casesService.create({
  title: "Seguimiento - recaída depresiva",
  participantId: participant.id,
  consultationReason: { reason: "Episodio depresivo" },
  physicalHealthHistory: { conditions: "Hipertensión controlada" },
  assessment: { analysis: "Requiere ajuste farmacológico" }
});
```

---

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **1. Migración de Datos Existentes**

- **Problema**: Si ya hay participantes con datos médicos
- **Solución**: Crear un caso "inicial" para cada participante existente

### **2. Referencias Cruzadas**

- **FamilyMember**: ¿Permanece en Participant? ✅ SÍ (info familiar básica)
- **ParticipantIdentifiedSituation**: ¿Mover a Case? 🤔 A evaluar

### **3. API Retrocompatibilidad**

- Mantener endpoint `POST /participants` para crear participante básico
- Agregar nuevo endpoint `POST /participants/:id/cases/complete` para caso completo

### **4. Validaciones**

- Un caso siempre debe tener un participante válido
- Un participante puede tener 0 o N casos
- Cada caso puede tener información médica independiente

---

## 📋 **ORDEN DE IMPLEMENTACIÓN**

### **Fase 1: Completar Migración de Entidades** ⏳

1. ✅ BioPsychosocialHistory, PhysicalHealthHistory, MentalHealthHistory
2. ⏳ ConsultationReason, Assessment, Intervention, FollowUpPlan
3. ⏳ InterventionPlan, ProgressNote, Referrals

### **Fase 2: Actualizar DTOs y Servicios**

4. ⏳ Actualizar CreateCaseDto (expandir)
5. ⏳ Actualizar CreateParticipantDto (simplificar)
6. ⏳ Actualizar CasesService (transaccional completo)
7. ⏳ Simplificar ParticipantsService

### **Fase 3: Migraciones de Base de Datos**

8. ⏳ Crear scripts SQL de migración
9. ⏳ Ejecutar migraciones
10. ⏳ Validar integridad referencial

### **Fase 4: Testing y Validación**

11. ⏳ Probar flujo completo
12. ⏳ Actualizar documentación
13. ⏳ Casos de prueba end-to-end

---

## 🎉 **BENEFICIOS DE LA REESTRUCTURACIÓN**

### **✅ Ventajas:**

- **Información médica por caso**: Cada consulta independiente
- **Evolución temporal**: Ver cambios entre consultas
- **Flexibilidad**: Diferentes tipos de casos (urgente, seguimiento, etc.)
- **Escalabilidad**: Agregar nuevos tipos de información por caso
- **Lógica de negocio**: Alinea con flujo real de trabajo médico

### **🚨 Desafíos:**

- **Migración de datos**: Requiere cuidado con datos existentes
- **Complejidad inicial**: Más pasos para crear caso completo
- **Consistency**: Asegurar que cada caso tenga info mínima requerida

---

¿Continuamos con la implementación de las **Fases 1 y 2** ahora que tenemos el plan completo definido?
