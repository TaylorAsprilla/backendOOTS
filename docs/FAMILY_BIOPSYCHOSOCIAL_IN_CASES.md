# 🔄 Migración: Información Familiar y Biopsicosocial a Casos

## 📋 Resumen de Cambios

Se ha reorganizado la estructura de datos para que la **información familiar y biopsicosocial** del participante se guarde al **crear el primer caso**, no al crear el participante.

### ✅ Mejoras Implementadas

- **Separación de responsabilidades**: Participantes solo contienen datos demográficos básicos
- **Información contextual en casos**: Los datos familiares y biopsicosociales se asocian al momento de la intervención
- **Transacciones atómicas**: Todo se guarda en una sola transacción para garantizar consistencia
- **Logging detallado**: Trazabilidad completa de todas las operaciones
- **Validaciones robustas**: Se verifica que el participante exista antes de crear el caso
- **Actualización inteligente**: Si ya existe historial biopsicosocial, se actualiza en lugar de fallar

---

## 🏗️ Arquitectura

### Antes (❌ Problema)

```
POST /participants
{
  "firstName": "Juan",
  "familyMembers": [...],           // Se guardaban aquí
  "bioPsychosocialHistory": {...}   // Se guardaban aquí
}
```

### Después (✅ Solución)

```
1. POST /participants
{
  "firstName": "Juan",
  // Solo datos demográficos básicos
}

2. POST /cases
{
  "participantId": 1,
  "consultationReason": "...",
  "familyMembers": [...],           // Ahora se guardan aquí
  "bioPsychosocialHistory": {...}   // Ahora se guardan aquí
}
```

---

## 📦 DTOs Modificados

### `CreateCaseDto` (cases/dto/case.dto.ts)

Se agregaron los siguientes campos opcionales:

```typescript
export class CreateCaseDto {
  // ... campos existentes ...

  // INFORMACIÓN FAMILIAR
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFamilyMemberDto)
  familyMembers?: CreateFamilyMemberDto[];

  // INFORMACIÓN BIOPSICOSOCIAL
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBioPsychosocialHistoryDto)
  bioPsychosocialHistory?: CreateBioPsychosocialHistoryDto;
}
```

### DTOs Nuevos en Cases

- `CreateFamilyMemberDto`: Información de cada miembro familiar
- `CreateBioPsychosocialHistoryDto`: Historia educativa, laboral y socioeconómica

---

## 🔧 Servicio Refactorizado (`CasesService`)

### Buenas Prácticas Aplicadas

#### 1. **Logging con Contexto**

```typescript
private readonly logger = new Logger(CasesService.name);

this.logger.log(`Iniciando creación de caso para participante ID: ${id}`);
this.logger.debug(`Número de caso generado: ${caseNumber}`);
this.logger.error(`Error al crear caso`, error);
```

#### 2. **Métodos Auxiliares Privados**

```typescript
private async createIdentifiedSituations(
  manager: any,
  caseId: number,
  situationIds: number[],
): Promise<number> {
  // Lógica separada y reutilizable
}

private async findCaseWithRelations(
  manager: any,
  caseId: number,
): Promise<Case> {
  // Recuperación optimizada con relaciones
}
```

#### 3. **Transacciones Completas**

```typescript
return await this.dataSource.transaction(async (manager) => {
  try {
    // Todas las operaciones en una transacción
    // Si algo falla, todo se revierte
  } catch (error) {
    this.logger.error('Error en transacción', error);
    throw error;
  }
});
```

#### 4. **Validaciones Previas**

```typescript
const participant = await this.participantRepository.findOne({
  where: { id: createCaseDto.participantId },
});

if (!participant) {
  this.logger.error(`Participante no encontrado: ${id}`);
  throw new NotFoundException(`Participante con ID ${id} no encontrado`);
}
```

#### 5. **Batch Operations**

```typescript
// Crear múltiples entidades en una operación
const familyMemberEntities = createCaseDto.familyMembers.map((memberData) =>
  manager.create(FamilyMember, { ...memberData }),
);

await manager.save(FamilyMember, familyMemberEntities);
```

#### 6. **Actualización Inteligente**

```typescript
// Verificar si ya existe historial
const existingHistory = await manager.findOne(BioPsychosocialHistory, {
  where: { participantId },
});

if (existingHistory) {
  // Actualizar en lugar de fallar
  await manager.update(BioPsychosocialHistory, { participantId }, data);
} else {
  // Crear nuevo
  await manager.save(manager.create(BioPsychosocialHistory, data));
}
```

---

## 🎯 Flujo de Creación de Caso

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Validar Participante                                      │
│    ✓ Verificar que existe                                   │
│    ✓ Lanzar NotFoundException si no existe                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Iniciar Transacción                                       │
│    ✓ Generar número de caso único                           │
│    ✓ Crear entidad Case                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Información Familiar y Biopsicosocial                     │
│    ✓ Crear FamilyMembers (asociados al participante)        │
│    ✓ Crear/Actualizar BioPsychosocialHistory                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Información Médica del Caso                               │
│    ✓ FollowUpPlans                                          │
│    ✓ PhysicalHealthHistories                                │
│    ✓ MentalHealthHistories                                  │
│    ✓ Weighing                                               │
│    ✓ InterventionPlans                                      │
│    ✓ ProgressNotes                                          │
│    ✓ IdentifiedSituations                                   │
│    ✓ ClosingNote                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Recuperar Caso Completo                                   │
│    ✓ Incluir todas las relaciones                           │
│    ✓ Retornar entidad completa                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Ejemplo de Uso

### Crear Caso con Información Completa

```typescript
POST /cases
{
  "participantId": 1,
  "consultationReason": "Consulta por ansiedad generalizada",
  "identifiedSituations": [1, 5, 8],

  // Información familiar (nueva ubicación)
  "familyMembers": [
    {
      "name": "María González",
      "birthDate": "1985-05-15",
      "occupation": "Docente",
      "familyRelationshipId": 2,
      "academicLevelId": 6
    },
    {
      "name": "Pedro González",
      "birthDate": "2010-03-20",
      "occupation": "Estudiante",
      "familyRelationshipId": 1,
      "academicLevelId": 3
    }
  ],

  // Información biopsicosocial (nueva ubicación)
  "bioPsychosocialHistory": {
    "completedGrade": "Profesional",
    "institution": "Universidad Nacional",
    "profession": "Psicólogo",
    "occupationalHistory": "5 años de experiencia clínica",
    "housingTypeId": 1,
    "academicLevelId": 6,
    "incomeSourceId": 2,
    "incomeLevelId": 4,
    "housing": "Casa propia de 3 habitaciones"
  },

  // Información médica
  "physicalHealthHistory": [{
    "currentConditions": "Hipertensión controlada",
    "medications": "Losartán 50mg"
  }],

  "mentalHealthHistory": [{
    "currentConditions": "Episodios de ansiedad desde hace 6 meses",
    "medications": "Ninguno actualmente"
  }]
}
```

---

## 🔍 Logs de Ejemplo

```
[CasesService] Iniciando creación de caso para participante ID: 1
[CasesService] Número de caso generado: CASE-0001
[CasesService] Caso creado con ID: 1
[CasesService] Creando 2 miembros familiares
[CasesService] Miembros familiares creados exitosamente
[CasesService] Creando historial biopsicosocial
[CasesService] Historial biopsicosocial creado exitosamente
[CasesService] Creando 1 historiales de salud física
[CasesService] Creando 1 historiales de salud mental
[CasesService] Procesando 3 situaciones identificadas
[CasesService] 3 situaciones identificadas creadas
[CasesService] Caso CASE-0001 creado exitosamente con ID: 1
```

---

## ⚠️ Consideraciones Importantes

### 1. **Actualización de Historial Existente**

Si ya existe un `bioPsychosocialHistory` para el participante, se actualizará automáticamente en lugar de fallar. Esto permite:

- Correcciones de datos
- Actualizaciones de información
- Prevención de duplicados

### 2. **Relaciones de Datos**

```
Participant (1) ----< FamilyMember (N)
Participant (1) ---- BioPsychosocialHistory (1)
Participant (1) ----< Case (N)
Case (1) ----< PhysicalHealthHistory (N)
Case (1) ----< MentalHealthHistory (N)
...
```

### 3. **Transaccionalidad**

- Si falla cualquier operación, **todo se revierte**
- Los datos quedan en estado consistente
- No hay registros huérfanos

### 4. **Performance**

- Se usa `manager.save()` con arrays para batch inserts
- Las relaciones se cargan de forma optimizada
- Solo se hace una consulta final para recuperar el caso completo

---

## 🧪 Testing

### Casos de Prueba Recomendados

1. ✅ Crear caso con información familiar completa
2. ✅ Crear caso con información biopsicosocial completa
3. ✅ Crear caso sin información familiar ni biopsicosocial
4. ✅ Crear segundo caso para mismo participante (debe actualizar historial)
5. ✅ Intentar crear caso con participante inexistente (debe fallar)
6. ✅ Verificar que transacción se revierte si falla algo
7. ✅ Verificar logs en cada operación

---

## 📊 Beneficios de esta Arquitectura

| Aspecto                             | Beneficio                                                          |
| ----------------------------------- | ------------------------------------------------------------------ |
| **Separación de responsabilidades** | Participantes = datos demográficos, Casos = información contextual |
| **Flexibilidad**                    | Información familiar puede cambiar entre casos                     |
| **Auditoría**                       | Historial completo de cuándo se registró cada dato                 |
| **Performance**                     | Batch operations, transacciones optimizadas                        |
| **Mantenibilidad**                  | Código limpio, bien documentado, fácil de extender                 |
| **Debugging**                       | Logs detallados en cada paso                                       |
| **Confiabilidad**                   | Transacciones atómicas, sin datos inconsistentes                   |

---

## 🚀 Próximos Pasos

1. **Migrar datos existentes** (si hay participantes con familia e historial)
2. **Actualizar frontend** para usar el nuevo flujo
3. **Crear tests unitarios** y e2e
4. **Documentar en Swagger** los nuevos campos
5. **Capacitar al equipo** en el nuevo flujo

---

**Última actualización:** 2024-12-17  
**Versión:** 2.0.0  
**Autor:** GitHub Copilot (Senior Developer Mode)
