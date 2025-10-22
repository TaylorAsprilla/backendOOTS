# 🚀 Flujo de Trabajo Completo del Sistema OOTS

## 📋 Descripción General del Flujo

El sistema OOTS (Organización de Orientación y Tratamiento Sicológico) sigue un flujo de trabajo estructurado que permite gestionar de manera integral la atención a participantes desde el registro inicial hasta el seguimiento de casos específicos.

## 🔄 Diagrama del Flujo de Trabajo

```
👤 USUARIO → 👥 PARTICIPANTE → 📋 CASO → 📊 SEGUIMIENTO
    |            |              |         |
    ↓            ↓              ↓         ↓
1. Registro   2. Crear       3. Crear   4. Gestionar
2. Login      Participante   Caso       Estados
```

---

## 🎯 **PASO 1: GESTIÓN DE USUARIOS**

### 1.1 Registro de Usuario Profesional

**Propósito**: Crear cuentas para profesionales que atenderán participantes.

```bash
POST /api/v1/auth/register
```

**Ejemplo de Registro:**

```json
{
  "firstName": "María Elena",
  "firstLastName": "García",
  "email": "maria.garcia@oots.com",
  "password": "SecurePass123!",
  "phoneNumber": "+57 300 123 4567",
  "position": "Psicóloga Clínica",
  "organization": "Centro de Salud Mental OOTS"
}
```

**Respuesta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "María Elena",
    "firstLastName": "García",
    "email": "maria.garcia@oots.com",
    "status": "ACTIVE"
  }
}
```

### 1.2 Iniciar Sesión

```bash
POST /api/v1/auth/login
```

```json
{
  "email": "maria.garcia@oots.com",
  "password": "SecurePass123!"
}
```

---

## 👥 **PASO 2: REGISTRO DE PARTICIPANTE**

### 2.1 Crear Participante Completo

**Propósito**: Registrar a una persona que necesita atención psicológica con toda su información personal, familiar y médica.

```bash
POST /participants
Authorization: Bearer {access_token}
```

**Datos Requeridos:**

- **Información Personal**: Nombres, apellidos, documento, contacto
- **Datos Demográficos**: Género, estado civil, seguro de salud
- **Contacto de Emergencia**: Información del familiar responsable
- **Historia Familiar**: Miembros del núcleo familiar
- **Historia Biopsicosocial**: Educación, profesión, vivienda
- **Historial Médico**: Salud física y mental
- **Razón de Consulta**: Motivo de la solicitud de atención
- **Evaluación Inicial**: Análisis profesional del caso

### 2.2 Estructura Completa del Participante

```json
{
  "firstName": "María Fernanda",
  "firstLastName": "González",
  "documentTypeId": 1,
  "documentNumber": "1234567893",
  "phoneNumber": "+57 300 123 4567",
  "email": "maria.gonzalez@email.com",
  "genderId": 2,
  "maritalStatusId": 1,
  "healthInsuranceId": 3,
  "registeredById": 1, // ID del usuario que registra

  "familyMembers": [
    {
      "name": "Carlos Alberto González",
      "birthDate": "1980-07-20",
      "occupation": "Ingeniero de Sistemas",
      "familyRelationshipId": 2,
      "academicLevelId": 6
    }
  ],

  "bioPsychosocialHistory": {
    "completedGrade": "Profesional Completo",
    "institution": "Universidad Nacional",
    "profession": "Psicóloga Clínica",
    "educationLevelId": 3,
    "incomeSourceId": 2,
    "housingTypeId": 1
  },

  "consultationReason": {
    "reason": "Busca orientación espiritual tras separación matrimonial"
  },

  "physicalHealthHistory": {
    "physicalConditions": "Hipertensión arterial controlada",
    "receivingTreatment": true,
    "treatmentDetails": "Losartán 50mg diario"
  },

  "mentalHealthHistory": {
    "mentalConditions": "Episodio depresivo mayor hace 2 años",
    "receivingMentalTreatment": false
  },

  "assessment": {
    "consultationReason": "Mujer de 39 años en proceso de reorganización vital",
    "weighting": "Presenta fortalezas: alta motivación al cambio"
  }
}
```

### 2.3 Entidades Relacionadas Creadas

Al crear un participante, el sistema crea automáticamente **13+ entidades relacionadas**:

1. **Participant** (Principal)
2. **FamilyMember[]** (Miembros familiares)
3. **BioPsychosocialHistory** (Historia biopsicosocial)
4. **ConsultationReason** (Razón de consulta)
5. **Intervention** (Intervención)
6. **FollowUpPlan** (Plan de seguimiento)
7. **Assessment** (Evaluación)
8. **InterventionPlan[]** (Planes de intervención)
9. **ProgressNote[]** (Notas de progreso)
10. **PhysicalHealthHistory** (Historia de salud física)
11. **MentalHealthHistory** (Historia de salud mental)
12. **Referrals** (Referencias)
13. **ParticipantIdentifiedSituation[]** (Situaciones identificadas)

---

## 📋 **PASO 3: GESTIÓN DE CASOS**

### 3.1 Crear Caso para un Participante

**Propósito**: Cada consulta específica o seguimiento se registra como un "caso" individual.

```bash
POST /participants/{participantId}/cases
Authorization: Bearer {access_token}
```

**Ejemplo:**

```json
{
  "title": "Consulta por ansiedad post-separación",
  "description": "Paciente presenta síntomas de ansiedad y dificultades para conciliar el sueño tras separación matrimonial reciente. Requiere acompañamiento psicológico y orientación espiritual."
}
```

**Respuesta:**

```json
{
  "id": 1,
  "caseNumber": "CASE-0001", // Generado automáticamente
  "title": "Consulta por ansiedad post-separación",
  "description": "Paciente presenta síntomas de ansiedad...",
  "status": "open", // Estado inicial
  "participantId": 1,
  "createdAt": "2024-10-22T10:30:00.000Z"
}
```

### 3.2 Estados del Caso

| Estado        | Descripción  | Uso                                  |
| ------------- | ------------ | ------------------------------------ |
| `open`        | Caso abierto | Nueva consulta pendiente de atención |
| `in_progress` | En progreso  | Se está brindando atención activa    |
| `closed`      | Cerrado      | Caso resuelto o finalizado           |

### 3.3 Gestionar Casos

```bash
# Listar casos de un participante
GET /participants/1/cases

# Obtener detalles de un caso específico
GET /cases/1

# Actualizar estado del caso
PATCH /cases/1/status
{
  "status": "in_progress"
}
```

---

## 🔄 **PASO 4: FLUJO OPERATIVO TÍPICO**

### Escenario Real: Nueva Consulta

#### **Día 1: Registro Inicial**

1. **Usuario María García** (psicóloga) inicia sesión
2. **Registra participante** "Ana Rodríguez" con toda su información
3. **Crea caso inicial** "CASE-0001: Consulta por duelo"
4. **Estado**: `open` (pendiente de cita)

#### **Día 3: Primera Cita**

1. **Actualiza estado** del caso a `in_progress`
2. **Agrega nota de progreso** sobre la sesión
3. **Evalúa** si requiere seguimiento

#### **Día 15: Seguimiento**

1. **Crea nuevo caso** "CASE-0002: Seguimiento duelo"
2. O **reabre caso anterior** cambiando estado a `in_progress`
3. **Registra evolución** en notas de progreso

#### **Día 30: Cierre**

1. **Actualiza estado** a `closed`
2. **Completa evaluación final**
3. **Archiva caso** para futura referencia

---

## 🏗️ **ARQUITECTURA DE RELACIONES**

### Relación Usuario → Participante

- Un **usuario profesional** puede registrar múltiples **participantes**
- Cada **participante** tiene un `registeredById` que referencia al usuario

### Relación Participante → Casos

- Un **participante** puede tener múltiples **casos** (`OneToMany`)
- Cada **caso** pertenece a un solo **participante** (`ManyToOne`)

### Relación Participante → Entidades Médicas

- **OneToOne**: BioPsychosocialHistory, ConsultationReason, Assessment
- **OneToMany**: FamilyMembers, InterventionPlans, ProgressNotes

---

## 🎯 **CASOS DE USO PRINCIPALES**

### 1. **Primera Consulta**

```
Usuario → Crear Participante → Crear Caso "Consulta Inicial" → Estado: open
```

### 2. **Atención Psicológica**

```
Caso: open → in_progress → Agregar Notas → closed
```

### 3. **Seguimiento Periódico**

```
Participante Existente → Crear Nuevo Caso → Gestionar Estados
```

### 4. **Consulta de Historial**

```
Buscar Participante → Ver Todos los Casos → Revisar Notas de Progreso
```

---

## 📊 **BENEFICIOS DEL SISTEMA**

### **Para Profesionales:**

✅ Registro integral de participantes  
✅ Seguimiento detallado por casos individuales  
✅ Historial médico y psicológico completo  
✅ Generación automática de números de caso  
✅ Estados claros para gestión de flujo de trabajo

### **Para la Organización:**

✅ Trazabilidad completa de atenciones  
✅ Reportes estadísticos por participante  
✅ Control de casos activos vs cerrados  
✅ Auditoría de profesionales responsables  
✅ Base de datos centralizada y estructurada

### **Para los Participantes:**

✅ Atención personalizada e integral  
✅ Seguimiento continuo de su progreso  
✅ Historial completo disponible  
✅ Referencias y derivaciones organizadas

---

## 🚀 **Ejemplo Práctico Completo**

### **Caso Real: María Fernanda González**

**Paso 1**: Psicóloga Elena García se registra y hace login
**Paso 2**: Elena registra a María como participante con historial completo
**Paso 3**: Elena crea caso "CASE-0001: Ansiedad post-separación"
**Paso 4**: Atiende a María, actualiza caso a "in_progress"
**Paso 5**: Después de 6 sesiones, cierra caso como "closed"
**Paso 6**: Un mes después, María vuelve → Nuevo caso "CASE-0002: Seguimiento"

**Resultado**: Historial completo y trazable de toda la atención brindada.

---

Este flujo garantiza una **atención integral, organizada y trazable** para todos los participantes del sistema OOTS! 🎉
