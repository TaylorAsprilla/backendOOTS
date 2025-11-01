# 📁 Scripts SQL de Migración - OOTS Colombia

Esta carpeta contiene los scripts SQL necesarios para la base de datos del proyecto.

---

## 📋 Archivos y Orden de Ejecución

### 1️⃣ **init.sql** (Automático)

**Propósito:** Inicialización de la base de datos  
**Se ejecuta:** Automáticamente al crear el contenedor Docker  
**Qué hace:**

- Crea la base de datos `oots_db`
- Configura permisos de usuario
- Configura zona horaria de Colombia
- Configura encoding UTF-8

**No requiere ejecución manual**

---

### 2️⃣ **verify-before-cleanup.sql** (Verificación)

**Propósito:** Verificar el estado de las migraciones antes de limpiar  
**Ejecutar cuando:** Antes de ejecutar cualquier migración

**Comando:**

```bash
mysql -u root -p oots_db < mysql-init/verify-before-cleanup.sql
```

**Qué verifica:**

- ✅ Si `education_levels` fue migrada a `academic_levels`
- ✅ Si `follow_up_plan_types` fue migrada a `follow_up_plan_catalog`
- ✅ Si `ponderaciones` fue migrada a `weighings`
- ✅ Si `closing_note` fue migrada a `closing_notes`
- ✅ Si `family_relationships` fue renombrada a `relationships`
- ✅ Si emergency contacts fueron migrados correctamente

**Resultado esperado:**

```
✅ SEGURO EJECUTAR cleanup-obsolete-tables.sql
```

---

### 3️⃣ **migration-refactor-emergency-contacts.sql** (Migración Principal)

**Propósito:** Refactorizar sistema de contactos de emergencia (M:N)  
**Ejecutar cuando:** Si aún no has migrado los emergency contacts

**⚠️ IMPORTANTE: Hacer backup antes**

```bash
mysqldump -u root -p oots_db > backup-before-migration.sql
```

**Comando:**

```bash
mysql -u root -p oots_db < mysql-init/migration-refactor-emergency-contacts.sql
```

**Qué hace:**

1. Renombra `family_relationships` → `relationships`
2. Crea tabla `emergency_contacts` (independiente)
3. Crea tabla `participant_emergency_contacts` (pivot M:N)
4. Migra datos existentes de `participants.emergency_contact_*` a las nuevas tablas
5. Elimina columnas obsoletas de `participants`
6. Agrega nuevos tipos de relación (Amigo, Conocido, Vecino)

**Resultado esperado:**

```
✅ Migración completada exitosamente
```

---

### 4️⃣ **cleanup-obsolete-tables.sql** (Limpieza Final)

**Propósito:** Eliminar tablas obsoletas después de migrar  
**Ejecutar cuando:** Después de verificar que todas las migraciones fueron exitosas

**⚠️ IMPORTANTE: Solo ejecutar si verify-before-cleanup.sql dice "SEGURO"**

**Comando:**

```bash
mysql -u root -p oots_db < mysql-init/cleanup-obsolete-tables.sql
```

**Qué elimina:**

- ❌ `education_levels` → Reemplazada por `academic_levels`
- ❌ `follow_up_plan_types` → Reemplazada por `follow_up_plan_catalog`
- ❌ `ponderaciones` → Reemplazada por `weighings`
- ❌ `closing_note` → Reemplazada por `closing_notes`
- ❌ `family_relationships` → Renombrada a `relationships`

**Resultado esperado:**

```
✅ LIMPIEZA COMPLETADA
✅ Ninguna tabla obsoleta encontrada
```

---

## 🚀 Flujo Completo de Migración

### **Paso 1: Backup**

```bash
mysqldump -u root -p oots_db > backup-$(date +%Y%m%d).sql
```

### **Paso 2: Verificar estado actual**

```bash
mysql -u root -p oots_db < mysql-init/verify-before-cleanup.sql
```

### **Paso 3: Ejecutar migración (si es necesario)**

```bash
mysql -u root -p oots_db < mysql-init/migration-refactor-emergency-contacts.sql
```

### **Paso 4: Verificar migración exitosa**

```bash
mysql -u root -p oots_db < mysql-init/verify-before-cleanup.sql
```

### **Paso 5: Limpiar tablas obsoletas**

```bash
mysql -u root -p oots_db < mysql-init/cleanup-obsolete-tables.sql
```

### **Paso 6: Verificar limpieza**

```bash
mysql -u root -p oots_db -e "
SELECT COUNT(*) as total_tablas
FROM information_schema.tables
WHERE table_schema = 'oots_db'
AND table_type = 'BASE TABLE';
"
```

**Resultado esperado:** 28-29 tablas

---

## 🔧 Comandos Útiles

### **Ver todas las tablas actuales:**

```bash
mysql -u root -p oots_db -e "SHOW TABLES;"
```

### **Ver tablas obsoletas que aún existen:**

```bash
mysql -u root -p oots_db -e "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'oots_db'
AND table_name IN (
  'education_levels',
  'follow_up_plan_types',
  'ponderaciones',
  'closing_note',
  'family_relationships'
);
"
```

### **Contar registros en tablas nuevas:**

```bash
mysql -u root -p oots_db -e "
SELECT 'emergency_contacts' as tabla, COUNT(*) as registros FROM emergency_contacts
UNION ALL
SELECT 'participant_emergency_contacts', COUNT(*) FROM participant_emergency_contacts
UNION ALL
SELECT 'relationships', COUNT(*) FROM relationships;
"
```

---

## ⚠️ Notas Importantes

1. **Siempre haz backup antes de ejecutar migraciones**
2. **No ejecutes cleanup si verify dice que hay tablas pendientes de migrar**
3. **Los scripts son idempotentes**: Puedes ejecutarlos múltiples veces sin problemas
4. **Si algo sale mal**: Usa los comandos de rollback incluidos en cada script
5. **Ambiente de desarrollo**: Estos scripts están diseñados para desarrollo local

---

## 📊 Estado de Migraciones

| Migración                 | Estado               | Archivo                                     |
| ------------------------- | -------------------- | ------------------------------------------- |
| ✅ Emergency Contacts M:N | Completada           | `migration-refactor-emergency-contacts.sql` |
| ✅ Relationships Rename   | Completada           | Incluida en refactor                        |
| ✅ Weighings              | Manejado por TypeORM | -                                           |
| ✅ Academic Levels        | Manejado por TypeORM | -                                           |
| ✅ Follow Up Plan Catalog | Manejado por TypeORM | -                                           |
| ✅ Closing Notes (plural) | Manejado por TypeORM | -                                           |

---

## 🆘 Troubleshooting

### **Error: Cannot delete or update a parent row**

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Ejecuta tu script
SET FOREIGN_KEY_CHECKS = 1;
```

### **Rollback de migración**

Cada script incluye una sección de rollback comentada al final del archivo.

### **Verificar datos migrados**

```sql
-- Ver emergency contacts creados
SELECT * FROM emergency_contacts LIMIT 5;

-- Ver relaciones pivot
SELECT * FROM participant_emergency_contacts LIMIT 5;

-- Ver relationships
SELECT * FROM relationships;
```

---

**Última actualización:** 2025-10-31  
**Versión:** 1.0  
**Mantenido por:** Backend OOTS Colombia Team
