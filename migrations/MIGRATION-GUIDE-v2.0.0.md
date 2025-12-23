# 🚀 Guía de Migración a Producción v2.0.0

**Fecha:** 2025-12-18  
**Versión:** 2.0.0

---

## 📋 Resumen de Cambios

### 🗑️ **Eliminaciones**

- Eliminada tabla `type_progress`
- Eliminada columna `type_progress_id` de `progress_notes`
- Eliminada relación FK entre `progress_notes` y `type_progress`

### ✅ **Nuevas Tablas**

- `approach_types` - Tipos de abordaje terapéutico (8 registros iniciales)
- `process_types` - Tipos de proceso terapéutico (7 registros iniciales)

### 🔄 **Modificaciones**

- `progress_notes`: Agregadas columnas `approach_type_id` y `process_type_id`
- `follow_up_plan`: Campo `coordinated_service` ahora es opcional (nullable)

---

## ⚠️ Pre-requisitos

1. **Backup de la base de datos**

   ```bash
   mysqldump -u usuario -p nombre_db > backup_pre_migration_v2.0.0_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Verificar que no haya sesiones activas críticas**

3. **Detener el servidor de aplicación temporalmente** (opcional pero recomendado)

---

## 🎯 Pasos para Aplicar en Producción

### **Opción 1: Ejecutar desde línea de comandos**

```bash
# Conectar a la base de datos de producción
mysql -u tu_usuario -p tu_base_de_datos < migrations/PRODUCTION-migration-v2.0.0.sql
```

### **Opción 2: Ejecutar desde cliente MySQL (Workbench, DBeaver, etc.)**

1. Abrir el archivo `migrations/PRODUCTION-migration-v2.0.0.sql`
2. Conectarse a la base de datos de producción
3. Ejecutar todo el script
4. Verificar los mensajes de salida

---

## 📊 Verificaciones Post-Migración

### **1. Verificar que las tablas nuevas existen**

```sql
SELECT TABLE_NAME, TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('approach_types', 'process_types');
```

**Resultado esperado:**

```
+----------------+------------+
| TABLE_NAME     | TABLE_ROWS |
+----------------+------------+
| approach_types |          8 |
| process_types  |          7 |
+----------------+------------+
```

### **2. Verificar datos iniciales en approach_types**

```sql
SELECT id, name FROM approach_types ORDER BY id;
```

**Resultado esperado:**

```
1. Terapia Cognitivo-Conductual
2. Terapia Psicodinámica
3. Terapia Humanista
4. Terapia Sistémica
5. Terapia Gestalt
6. Terapia de Aceptación y Compromiso (ACT)
7. Terapia Narrativa
8. Intervención en Crisis
```

### **3. Verificar datos iniciales en process_types**

```sql
SELECT id, name FROM process_types ORDER BY id;
```

**Resultado esperado:**

```
1. Proceso Individual
2. Proceso Grupal
3. Proceso Familiar
4. Proceso de Pareja
5. Proceso de Evaluación
6. Proceso Psicoeducativo
7. Proceso de Acompañamiento
```

### **4. Verificar columnas en progress_notes**

```sql
SHOW COLUMNS FROM progress_notes LIKE '%type%';
```

**Resultado esperado:**

```
+-------------------+------+------+-----+---------+-------+
| Field             | Type | Null | Key | Default | Extra |
+-------------------+------+------+-----+---------+-------+
| approach_type_id  | int  | YES  | MUL | NULL    |       |
| process_type_id   | int  | YES  | MUL | NULL    |       |
+-------------------+------+------+-----+---------+-------+
```

### **5. Verificar foreign keys en progress_notes**

```sql
SELECT
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'progress_notes'
  AND REFERENCED_TABLE_NAME IN ('approach_types', 'process_types');
```

**Resultado esperado:**

```
+------------------------------------+------------------+-----------------------+------------------------+
| CONSTRAINT_NAME                    | COLUMN_NAME      | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
+------------------------------------+------------------+-----------------------+------------------------+
| FK_progress_notes_approach_type    | approach_type_id | approach_types        | id                     |
| FK_progress_notes_process_type     | process_type_id  | process_types         | id                     |
+------------------------------------+------------------+-----------------------+------------------------+
```

### **6. Verificar que type_progress fue eliminada**

```sql
SHOW TABLES LIKE 'type_progress';
```

**Resultado esperado:** `Empty set` (0 rows)

### **7. Verificar campo opcional en follow_up_plan**

```sql
SHOW COLUMNS FROM follow_up_plan LIKE 'coordinated_service';
```

**Resultado esperado:**

```
+---------------------+---------+------+-----+---------+-------+
| Field               | Type    | Null | Key | Default | Extra |
+---------------------+---------+------+-----+---------+-------+
| coordinated_service | tinyint | YES  |     | 0       |       |
+---------------------+---------+------+-----+---------+-------+
```

---

## 🔄 Rollback (en caso de problemas)

Si necesitas revertir los cambios:

```sql
-- 1. Restaurar desde el backup
mysql -u tu_usuario -p tu_base_de_datos < backup_pre_migration_v2.0.0_YYYYMMDD_HHMMSS.sql
```

---

## 📝 Cambios en la Aplicación

### **Backend (NestJS)**

- ✅ Eliminado módulo `TypeProgressModule`
- ✅ Eliminada entidad `TypeProgress`
- ✅ Creados módulos `ApproachTypesService` y `ProcessTypesService`
- ✅ Endpoints nuevos:
  - `GET/POST/PATCH/DELETE /catalogs/approach-types`
  - `GET/POST/PATCH/DELETE /catalogs/process-types`

### **Frontend (Angular) - Cambios requeridos**

- Actualizar referencias de `type_progress` a `approach_types` y `process_types`
- Actualizar formularios de `ProgressNote` para usar los nuevos selectores
- Campo `coordinatedService` en `FollowUpPlan` ahora es opcional

---

## 🧪 Testing Post-Migración

### **1. Probar creación de Progress Note**

```bash
curl -X POST "http://tu-servidor/cases" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": 1,
    "progressNotes": [{
      "sessionDate": "2025-12-18",
      "approachTypeId": 1,
      "processTypeId": 1,
      "summary": "Primera sesión"
    }]
  }'
```

### **2. Probar endpoints de catálogos**

```bash
# Listar tipos de abordaje
curl -X GET "http://tu-servidor/catalogs/approach-types"

# Listar tipos de proceso
curl -X GET "http://tu-servidor/catalogs/process-types"
```

---

## 📞 Soporte

Si encuentras algún problema durante la migración:

1. **No continúes con el despliegue**
2. **Revisa los logs del script SQL**
3. **Verifica el estado de las tablas afectadas**
4. **Considera hacer rollback desde el backup**

---

## ✅ Checklist Final

- [ ] Backup de base de datos creado
- [ ] Script de migración ejecutado sin errores
- [ ] Todas las verificaciones post-migración pasadas
- [ ] Datos iniciales de catálogos presentes
- [ ] Foreign keys creadas correctamente
- [ ] Tabla `type_progress` eliminada
- [ ] Aplicación backend actualizada
- [ ] Endpoints de catálogos funcionando
- [ ] Testing en ambiente de producción completado

---

**🎉 Migración v2.0.0 Completada**

Fecha de aplicación: ******\_\_\_******  
Aplicado por: ******\_\_\_******  
Duración: ******\_\_\_******
