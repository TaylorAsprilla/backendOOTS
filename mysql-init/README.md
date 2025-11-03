# 📁 MySQL Init - OOTS Colombia# 📁 MySQL Init - OOTS Colombia# 📁 Scripts SQL de Migración - OOTS Colombia

Scripts de inicialización para la base de datos.

---Scripts de inicialización automática para Docker y MySQL.Esta carpeta contiene los scripts SQL necesarios para la base de datos del proyecto.

## 🎯 Flujo de Inicialización

### **Paso 1: Levantar Docker** 🐳------

```bash

# Crear base de datos vacía

docker-compose up -d## 🐳 Docker: Ejecución Automática## 📋 Archivos y Orden de Ejecución

```

Esto crea el contenedor MySQL con la base de datos `oots_db` vacía.

Cuando ejecutas `docker-compose up`, Docker ejecuta **automáticamente** todos los archivos `.sql` de esta carpeta en **orden alfabético**.### 1️⃣ **init.sql** (Automático)

### **Paso 2: Iniciar NestJS** 🚀

````bash

# TypeORM creará todas las tablas automáticamente**Archivos actuales:****Propósito:** Inicialización de la base de datos

npm run start:dev

```**Se ejecuta:** Automáticamente al crear el contenedor Docker



TypeORM con `synchronize: true` creará automáticamente:- `01-init-database.sql` - Crea catálogos base (relationships, academic_levels, etc.)**Qué hace:**

- ✅ Todas las tablas desde las entities

- ✅ Todas las columnas con tipos correctos

- ✅ Todos los índices necesarios

- ✅ Todas las foreign keys---- Crea la base de datos `oots_db`



**Espera a que veas:** `Application is running on: http://localhost:3000`- Configura permisos de usuario



### **Paso 3: Insertar datos de catálogos** 📊## 📋 01-init-database.sql- Configura zona horaria de Colombia



```bash- Configura encoding UTF-8

# Ejecutar script de seeds

docker exec -i mysql-oots mysql -u root -proot123 oots_db < mysql-init/seed-data.sql**Se ejecuta:** Automáticamente al crear el contenedor

````

**Propósito:** Inicializar catálogos necesarios para el sistema**No requiere ejecución manual**

Esto insertará los datos iniciales en:

- `relationships` (34 registros)

- `academic_levels` (13 registros)

- `approach_types` (5 registros)### 🗂️ Catálogos que crea:---

- `follow_up_plan_catalog` (5 registros)

---

#### 1. **relationships** (Parentescos y Relaciones)### 2️⃣ **verify-before-cleanup.sql** (Verificación)

## 📋 Archivo: seed-data.sql

- Usado por: `family_members` y `participant_emergency_contacts`

**Propósito:** Insertar datos iniciales en las tablas de catálogos

- Contenido: Padre, Madre, Hermano, Amigo, Vecino, etc.**Propósito:** Verificar el estado de las migraciones antes de limpiar

**Cuándo ejecutar:** Después de que TypeORM cree las tablas (después del Paso 2)

- Total: ~34 relaciones**Ejecutar cuando:** Antes de ejecutar cualquier migración

### 🗂️ Catálogos que puebla:

#### 1. **relationships** (Parentescos y Relaciones)

- Usado por: `family_members` y `participant_emergency_contacts`#### 2. **academic_levels** (Niveles Académicos)**Comando:**

- Contenido: Padre, Madre, Hermano, Amigo, Vecino, etc.

- Total: 34 relaciones- Usado por: `family_members` y `participants`

#### 2. **academic_levels** (Niveles Académicos)- Contenido: Sin escolaridad, Primaria, Bachillerato, Técnico, etc.```bash

- Usado por: `family_members` y `participants`

- Contenido: Sin escolaridad, Primaria, Bachillerato, Técnico, etc.- Total: 13 nivelesmysql -u root -p oots_db < mysql-init/verify-before-cleanup.sql

- Total: 13 niveles

````

#### 3. **approach_types** (Tipos de Abordaje)

- Usado por: `cases` (tabla de casos)#### 3. **approach_types** (Tipos de Abordaje)

- Contenido: Individual, Familiar, Grupal, Comunitario, Remisión

- Total: 5 tipos- Usado por: `cases` (tabla de casos)**Qué verifica:**



#### 4. **follow_up_plan_catalog** (Planes de Seguimiento)- Contenido: Individual, Familiar, Grupal, Comunitario, Remisión

- Usado por: Planes de seguimiento de casos

- Contenido: Mensual, Quincenal, Semanal, Trimestral, Sin seguimiento- Total: 5 tipos- ✅ Si `education_levels` fue migrada a `academic_levels`

- Total: 5 planes

- ✅ Si `follow_up_plan_types` fue migrada a `follow_up_plan_catalog`

---

#### 4. **follow_up_plan_catalog** (Planes de Seguimiento)- ✅ Si `ponderaciones` fue migrada a `weighings`

## 🔄 Recrear Base de Datos Completa

- Usado por: Planes de seguimiento de casos- ✅ Si `closing_note` fue migrada a `closing_notes`

Si necesitas empezar desde cero:

- Contenido: Mensual, Quincenal, Semanal, Trimestral, Sin seguimiento- ✅ Si `family_relationships` fue renombrada a `relationships`

```bash

# 1. Detener y eliminar todo- Total: 5 planes- ✅ Si emergency contacts fueron migrados correctamente

docker-compose down -v



# 2. Levantar Docker

docker-compose up -d---**Resultado esperado:**



# 3. Esperar 5 segundos

sleep 5

## 🚀 Recrear Base de Datos Completa```

# 4. Iniciar NestJS (espera a que inicie completamente)

npm run start:dev✅ SEGURO EJECUTAR cleanup-obsolete-tables.sql



# 5. En otra terminal, ejecutar seeds### **Opción 1: Desde cero (limpio)**```

docker exec -i mysql-oots mysql -u root -proot123 oots_db < mysql-init/seed-data.sql

````

---```bash---

## 🔍 Verificar Instalación# Detener y eliminar todo (contenedor + volumen)

### **1. Ver tablas creadas:**docker-compose down -v### 3️⃣ **migration-refactor-emergency-contacts.sql** (Migración Principal)

```````bash

docker exec -it mysql-oots mysql -u root -proot123 oots_db -e "SHOW TABLES;"

```# Levantar de nuevo (ejecutará 01-init-database.sql automáticamente)**Propósito:** Refactorizar sistema de contactos de emergencia (M:N)



**Resultado esperado:** ~29 tablasdocker-compose up -d**Ejecutar cuando:** Si aún no has migrado los emergency contacts



### **2. Verificar datos de catálogos:**



```sql# Ver logs para confirmar**⚠️ IMPORTANTE: Hacer backup antes**

docker exec -it mysql-oots mysql -u root -proot123 oots_db -e "

SELECT 'relationships' as tabla, COUNT(*) as total FROM relationshipsdocker-compose logs -f mysql

UNION ALL

SELECT 'academic_levels', COUNT(*) FROM academic_levels``````bash

UNION ALL

SELECT 'approach_types', COUNT(*) FROM approach_typesmysqldump -u root -p oots_db > backup-before-migration.sql

UNION ALL

SELECT 'follow_up_plan_catalog', COUNT(*) FROM follow_up_plan_catalog;### **Opción 2: Solo limpiar datos (mantiene contenedor)**```

"

```````

**Resultado esperado:**```bash**Comando:**

````

relationships: 34# Detener contenedor

academic_levels: 13

approach_types: 5docker-compose stop mysql```bash

follow_up_plan_catalog: 5

```mysql -u root -p oots_db < mysql-init/migration-refactor-emergency-contacts.sql



---# Eliminar volumen de datos```



## ⚠️ Importantedocker volume rm backend-oots_mysql_data



### **¿Por qué no se ejecuta automáticamente?****Qué hace:**



Los archivos `.sql` en `/docker-entrypoint-initdb.d` se ejecutan **antes** de que NestJS inicie, pero necesitamos que TypeORM cree las tablas primero con la estructura correcta (índices, constraints, etc.).# Levantar de nuevo



Si intentamos crear las tablas manualmente en SQL, los índices no coinciden con lo que TypeORM espera y genera errores.docker-compose up -d mysql1. Renombra `family_relationships` → `relationships`



### **synchronize: true solo en desarrollo**2. Crea tabla `emergency_contacts` (independiente)



```typescript# Ver logs3. Crea tabla `participant_emergency_contacts` (pivot M:N)

// app.module.ts

TypeOrmModule.forRoot({docker-compose logs -f mysql4. Migra datos existentes de `participants.emergency_contact_*` a las nuevas tablas

  synchronize: process.env.NODE_ENV === 'development', // ⚠️ Solo desarrollo

  // En producción usa migraciones```5. Elimina columnas obsoletas de `participants`

})

```6. Agrega nuevos tipos de relación (Amigo, Conocido, Vecino)



------



## 🆘 Troubleshooting**Resultado esperado:**



### **❌ Error: "Can't DROP index"**## 🎯 Flujo Completo de Inicio



Esto pasa si las tablas ya existen con estructura diferente.```



**Solución:**1. **Docker crea el contenedor MySQL**✅ Migración completada exitosamente

```bash

# Recrear desde cero2. **Docker ejecuta `01-init-database.sql` automáticamente**```

docker-compose down -v

docker-compose up -d   - Crea tablas de catálogos

npm run start:dev

docker exec -i mysql-oots mysql -u root -proot123 oots_db < mysql-init/seed-data.sql   - Inserta datos iniciales---

````

3. **Inicias NestJS:** `npm run start:dev`

### **❌ Error: "Duplicate entry"**

4. **TypeORM crea las tablas principales automáticamente** (porque `synchronize: true`)### 4️⃣ **cleanup-obsolete-tables.sql** (Limpieza Final)

Ya ejecutaste el seed-data.sql antes.

- participants

**Solución:**

````bash - family_members**Propósito:** Eliminar tablas obsoletas después de migrar

# Los seeds usan INSERT ... ON DUPLICATE KEY UPDATE

# Puedes ejecutarlos múltiples veces sin problema   - emergency_contacts**Ejecutar cuando:** Después de verificar que todas las migraciones fueron exitosas

docker exec -i mysql-oots mysql -u root -proot123 oots_db < mysql-init/seed-data.sql

```   - participant_emergency_contacts



### **❌ Los catálogos están vacíos**   - cases**⚠️ IMPORTANTE: Solo ejecutar si verify-before-cleanup.sql dice "SEGURO"**



No ejecutaste el Paso 3.   - weighings



**Solución:**   - users**Comando:**

```bash

docker exec -i mysql-oots mysql -u root -proot123 oots_db < mysql-init/seed-data.sql   - etc.

````

```bash

---

---mysql -u root -p oots_db < mysql-init/cleanup-obsolete-tables.sql

## 📊 Estructura Final

```

````

Base de Datos: oots_db## ✅ ¿Qué hace TypeORM automáticamente?

│

├── 📁 Tablas de Catálogos (4) - Creadas por TypeORM, pobladas por seed-data.sql**Qué elimina:**

│   ├── relationships (34 registros)

│   ├── academic_levels (13 registros)Con `synchronize: true` en desarrollo, TypeORM:

│   ├── approach_types (5 registros)

│   └── follow_up_plan_catalog (5 registros)- ❌ `education_levels` → Reemplazada por `academic_levels`

│

└── 📁 Tablas Principales (~25) - Creadas por TypeORM- ✅ Crea todas las tablas desde las entities- ❌ `follow_up_plan_types` → Reemplazada por `follow_up_plan_catalog`

    ├── users

    ├── participants- ✅ Crea todas las columnas- ❌ `ponderaciones` → Reemplazada por `weighings`

    ├── family_members (FK → relationships, academic_levels)

    ├── emergency_contacts- ✅ Crea todos los índices- ❌ `closing_note` → Reemplazada por `closing_notes`

    ├── participant_emergency_contacts (FK → relationships)

    ├── cases (FK → approach_types, weighings)- ✅ Crea todas las foreign keys- ❌ `family_relationships` → Renombrada a `relationships`

    ├── weighings

    ├── closing_notes- ✅ Actualiza la estructura si cambias una entity

    └── ... (más tablas según entities)

```**Resultado esperado:**



---**⚠️ IMPORTANTE:** `synchronize: true` solo debe usarse en **desarrollo**, nunca en producción.



**Última actualización:** 2025-11-03  ```

**Versión:** 3.0 (TypeORM First)

---✅ LIMPIEZA COMPLETADA

✅ Ninguna tabla obsoleta encontrada

## 🔍 Verificar Instalación```



### **1. Conectarse al contenedor MySQL:**---



```bash## 🚀 Flujo Completo de Migración

docker exec -it mysql-oots mysql -u root -proot123 oots_db

```### **Paso 1: Backup**



### **2. Ver catálogos creados:**```bash

mysqldump -u root -p oots_db > backup-$(date +%Y%m%d).sql

```sql```

-- Ver relationships

SELECT COUNT(*) as total FROM relationships;### **Paso 2: Verificar estado actual**

-- Resultado esperado: 34

```bash

-- Ver academic_levelsmysql -u root -p oots_db < mysql-init/verify-before-cleanup.sql

SELECT COUNT(*) as total FROM academic_levels;```

-- Resultado esperado: 13

### **Paso 3: Ejecutar migración (si es necesario)**

-- Ver approach_types

SELECT COUNT(*) as total FROM approach_types;```bash

-- Resultado esperado: 5mysql -u root -p oots_db < mysql-init/migration-refactor-emergency-contacts.sql

````

-- Ver follow_up_plan_catalog

SELECT COUNT(\*) as total FROM follow_up_plan_catalog;### **Paso 4: Verificar migración exitosa**

-- Resultado esperado: 5

```````bash

mysql -u root -p oots_db < mysql-init/verify-before-cleanup.sql

### **3. Ver todas las tablas:**```



```sql### **Paso 5: Limpiar tablas obsoletas**

SHOW TABLES;

``````bash

mysql -u root -p oots_db < mysql-init/cleanup-obsolete-tables.sql

**Resultado esperado (después de iniciar NestJS):**```

- Catálogos: 4 tablas

- Principales: ~25 tablas (creadas por TypeORM)### **Paso 6: Verificar limpieza**

- **Total: ~29 tablas**

```bash

---mysql -u root -p oots_db -e "

SELECT COUNT(*) as total_tablas

## 🆘 TroubleshootingFROM information_schema.tables

WHERE table_schema = 'oots_db'

### **❌ Error: "Can't connect to MySQL server"**AND table_type = 'BASE TABLE';

"

```bash```

# Verificar que el contenedor está corriendo

docker ps**Resultado esperado:** 28-29 tablas



# Si no está, levantarlo---

docker-compose up -d mysql

## 🔧 Comandos Útiles

# Ver logs para errores

docker-compose logs mysql### **Ver todas las tablas actuales:**

```

```bash

### **❌ Error: "Access denied for user"**mysql -u root -p oots_db -e "SHOW TABLES;"

```

Credenciales en `docker-compose.yml`:

- Root: `root` / `root123`### **Ver tablas obsoletas que aún existen:**

- Usuario: `oots_user` / `oots_password`

- Puerto: `3307` (no 3306)```bash

mysql -u root -p oots_db -e "

### **❌ Los catálogos están vacíos**SELECT table_name

FROM information_schema.tables

```bashWHERE table_schema = 'oots_db'

# Eliminar volumen y recrearAND table_name IN (

docker-compose down -v  'education_levels',

docker-compose up -d  'follow_up_plan_types',

  'ponderaciones',

# Esperar 10 segundos y verificar  'closing_note',

docker exec -it mysql-oots mysql -u root -proot123 oots_db -e "SELECT COUNT(*) FROM relationships;"  'family_relationships'

```);

"

### **❌ TypeORM no crea las tablas**```



Verifica en `.env`:### **Contar registros en tablas nuevas:**

```env

NODE_ENV=development```bash

DB_HOST=localhostmysql -u root -p oots_db -e "

DB_PORT=3307SELECT 'emergency_contacts' as tabla, COUNT(*) as registros FROM emergency_contacts

DB_USERNAME=rootUNION ALL

DB_PASSWORD=root123SELECT 'participant_emergency_contacts', COUNT(*) FROM participant_emergency_contacts

DB_DATABASE=oots_dbUNION ALL

```SELECT 'relationships', COUNT(*) FROM relationships;

"

---```



## 📝 Agregar Nuevos Catálogos---



Si necesitas agregar más catálogos, edita `01-init-database.sql`:## ⚠️ Notas Importantes



```sql1. **Siempre haz backup antes de ejecutar migraciones**

-- Agregar al final, antes del mensaje de confirmación2. **No ejecutes cleanup si verify dice que hay tablas pendientes de migrar**

CREATE TABLE IF NOT EXISTS mi_nuevo_catalogo (3. **Los scripts son idempotentes**: Puedes ejecutarlos múltiples veces sin problemas

    id INT AUTO_INCREMENT PRIMARY KEY,4. **Si algo sale mal**: Usa los comandos de rollback incluidos en cada script

    name VARCHAR(100) NOT NULL,5. **Ambiente de desarrollo**: Estos scripts están diseñados para desarrollo local

    code VARCHAR(50) NOT NULL UNIQUE,

    is_active BOOLEAN DEFAULT TRUE,---

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP## 📊 Estado de Migraciones

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

| Migración                 | Estado               | Archivo                                     |

INSERT INTO mi_nuevo_catalogo (name, code) VALUES| ------------------------- | -------------------- | ------------------------------------------- |

('Opción 1', 'OPCION_1'),| ✅ Emergency Contacts M:N | Completada           | `migration-refactor-emergency-contacts.sql` |

('Opción 2', 'OPCION_2');| ✅ Relationships Rename   | Completada           | Incluida en refactor                        |

```| ✅ Weighings              | Manejado por TypeORM | -                                           |

| ✅ Academic Levels        | Manejado por TypeORM | -                                           |

Luego recrear:| ✅ Follow Up Plan Catalog | Manejado por TypeORM | -                                           |

```bash| ✅ Closing Notes (plural) | Manejado por TypeORM | -                                           |

docker-compose down -v && docker-compose up -d

```---



---## 🆘 Troubleshooting



## 📊 Estructura Final Esperada### **Error: Cannot delete or update a parent row**



``````sql

Base de Datos: oots_dbSET FOREIGN_KEY_CHECKS = 0;

│-- Ejecuta tu script

├── 📁 Catálogos (4) - Creados por 01-init-database.sqlSET FOREIGN_KEY_CHECKS = 1;

│   ├── relationships (34 registros)```

│   ├── academic_levels (13 registros)

│   ├── approach_types (5 registros)### **Rollback de migración**

│   └── follow_up_plan_catalog (5 registros)

│Cada script incluye una sección de rollback comentada al final del archivo.

└── 📁 Tablas Principales (~25) - Creadas por TypeORM

    ├── participants### **Verificar datos migrados**

    ├── family_members (FK → relationships, academic_levels)

    ├── emergency_contacts```sql

    ├── participant_emergency_contacts (FK → relationships)-- Ver emergency contacts creados

    ├── cases (FK → approach_types, weighings)SELECT * FROM emergency_contacts LIMIT 5;

    ├── weighings

    ├── users-- Ver relaciones pivot

    ├── closing_notesSELECT * FROM participant_emergency_contacts LIMIT 5;

    └── ... (más tablas según entities)

```-- Ver relationships

SELECT * FROM relationships;

---```



**🎉 ¡Listo!** Tu base de datos se inicializa automáticamente con Docker.---



**Última actualización:** 2025-11-03  **Última actualización:** 2025-10-31

**Versión:** 2.0 (Simplificada)**Versión:** 1.0

**Mantenido por:** Backend OOTS Colombia Team
```````
