# Guía de Migración: Datos Médicos de Participant a Case

## Objetivo

Esta migración cambia la arquitectura del sistema para que toda la información médica y clínica esté asociada a **Cases** en lugar de **Participants**. Esto permite tener múltiples consultas (casos) por participante, cada una con su propia información médica.

## Cambios Implementados

### 1. Entidades Migradas

Las siguientes entidades ahora se relacionan con `Case` en lugar de `Participant`:

- ✅ BioPsychosocialHistory
- ✅ ConsultationReason
- ✅ Intervention
- ✅ FollowUpPlan
- ✅ PhysicalHealthHistory
- ✅ MentalHealthHistory
- ✅ Assessment
- ✅ InterventionPlan
- ✅ ProgressNote
- ✅ Referrals

### 2. Cambios en el Código

- ✅ **Entidades**: Todas las relaciones `@OneToOne` y `@ManyToOne` cambiadas de Participant a Case
- ✅ **DTOs**: `CreateCaseDto` expandido para incluir información médica, `CreateParticipantDto` simplificado
- ✅ **Services**: `CasesService` maneja creación transaccional de entidades médicas
- ✅ **Controllers**: Actualizado para nuevo flujo de creación de casos

## Pasos para Migración de Base de Datos

### IMPORTANTE: HACER BACKUP

```bash
# Hacer backup completo de la base de datos
mysqldump -u root -p nombre_base_datos > backup_antes_migracion.sql
```

### Paso 1: Ejecutar Migración Inicial

```sql
-- Ejecutar: migrations/001_migrate_medical_data_to_cases.sql (PASO 1)
-- Esto agrega las columnas case_id a todas las tablas médicas
```

### Paso 2: Migrar Datos Existentes (Manual o Automático)

#### Opción A: Migración Automática (Crear caso por defecto)

```sql
-- Descomenta las líneas en PASO 2 del archivo SQL para crear casos automáticamente
-- Esto creará un caso por defecto para cada participante que tenga datos médicos
```

#### Opción B: Migración Manual

```sql
-- Revisar participantes con datos médicos
SELECT p.id, p.first_name, p.first_last_name,
       (SELECT COUNT(*) FROM bio_psychosocial_histories WHERE participant_id = p.id) as bio_records,
       (SELECT COUNT(*) FROM consultation_reasons WHERE participant_id = p.id) as consultation_records
FROM participants p
WHERE p.id IN (SELECT DISTINCT participant_id FROM bio_psychosocial_histories);

-- Crear casos específicos y asignar datos manualmente
```

### Paso 3: Verificar Migración

```sql
-- Ejecutar verificaciones del FINAL del archivo SQL
-- Asegurar que no hay registros sin case_id
```

### Paso 4: Finalizar Migración (Una vez verificado)

```sql
-- Descomenta las líneas en PASO 3 del archivo SQL
-- Esto hace case_id obligatorio y elimina columnas participant_id
```

## Nuevo Flujo de Trabajo

### Antes de la Migración

```
Participant -> [Información Médica Directa]
```

### Después de la Migración

```
Participant -> Case -> [Información Médica]
              Case -> [Información Médica]
              Case -> [Información Médica]
```

### Ventajas del Nuevo Sistema

1. **Múltiples Consultas**: Un participante puede tener varios casos
2. **Aislamiento de Datos**: Cada consulta tiene su propia información médica
3. **Mejor Seguimiento**: Historial claro por caso
4. **Escalabilidad**: Mejor estructura para grandes volúmenes de datos

## API Endpoints Actualizados

### Crear Participante (Simplificado)

```http
POST /participants
{
  "firstName": "Juan",
  "firstLastName": "Pérez",
  // ... solo información personal/demográfica
  "familyMembers": [...], // permanece aquí
  // Ya NO incluye información médica
}
```

### Crear Caso (Con Información Médica)

```http
POST /cases
{
  "participantId": 1,
  "title": "Consulta por ansiedad",
  "description": "...",
  "bioPsychosocialHistory": {...},
  "consultationReason": {...},
  "assessment": {...},
  // ... toda la información médica
}
```

## Rollback (En caso de problemas)

### 1. Restaurar desde Backup

```bash
mysql -u root -p nombre_base_datos < backup_antes_migracion.sql
```

### 2. Revertir Cambios de Código

```bash
git checkout HEAD~1  # O commit anterior
```

## Validación Post-Migración

### 1. Verificar Datos

```sql
-- Contar registros antes y después
SELECT COUNT(*) FROM bio_psychosocial_histories; -- Debe mantenerse igual
SELECT COUNT(*) FROM cases; -- Nuevos casos creados
```

### 2. Probar API

```bash
# Crear participante (sin datos médicos)
curl -X POST /participants -d '{"firstName":"Test",...}'

# Crear caso (con datos médicos)
curl -X POST /cases -d '{"participantId":1,"title":"Test",...}'
```

### 3. Verificar Relaciones

```sql
-- Verificar que todas las entidades médicas tienen case_id
SELECT
  (SELECT COUNT(*) FROM bio_psychosocial_histories WHERE case_id IS NOT NULL) as bio_ok,
  (SELECT COUNT(*) FROM consultation_reasons WHERE case_id IS NOT NULL) as consultation_ok;
```

## Contacto

Si encuentras problemas durante la migración, documenta:

1. Paso donde ocurrió el error
2. Mensaje de error completo
3. Estado de la base de datos
4. Cantidad de registros afectados
