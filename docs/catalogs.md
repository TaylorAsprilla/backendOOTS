# 📚 Módulo de Catálogos

## 📋 Descripción General

El módulo de catálogos (Common) proporciona datos maestros esenciales para el sistema OOTS Colombia. Incluye información estructurada sobre geografía, tipos de documentos, tipos de violencias, géneros, etnias y demás datos de referencia necesarios para el funcionamiento de la aplicación.

## 🏗️ Arquitectura

```
common/
├── enums/                     # Enumeraciones del sistema
│   ├── index.ts              # Exportaciones centrales
│   └── user-status.enum.ts   # Estados de usuario
└── index.ts                  # Punto de entrada del módulo
```

## 🌐 Endpoints Disponibles

| Método | Endpoint                | Descripción                    | Autenticación |
| ------ | ----------------------- | ------------------------------ | ------------- |
| `GET`  | `/countries`            | Listar países                  | ❌            |
| `GET`  | `/departments`          | Listar departamentos           | ❌            |
| `GET`  | `/cities`               | Listar ciudades                | ❌            |
| `GET`  | `/cities/:departmentId` | Ciudades por departamento      | ❌            |
| `GET`  | `/document-types`       | Tipos de documentos            | ❌            |
| `GET`  | `/violence-types`       | Tipos de violencias            | ❌            |
| `GET`  | `/genders`              | Géneros disponibles            | ❌            |
| `GET`  | `/ethnicities`          | Etnias disponibles             | ❌            |
| `GET`  | `/sexual-orientations`  | Orientaciones sexuales         | ❌            |
| `GET`  | `/gender-identities`    | Identidades de género          | ❌            |
| `GET`  | `/marital-statuses`     | Estados civiles                | ❌            |
| `GET`  | `/education-levels`     | Niveles educativos             | ❌            |
| `GET`  | `/socioeconomic-strata` | Estratos socioeconómicos       | ❌            |
| `GET`  | `/disability-types`     | Tipos de discapacidad          | ❌            |
| `GET`  | `/relationship-types`   | Tipos de relaciones familiares | ❌            |

---

## 🌍 Catálogos Geográficos

### 📝 GET /countries

Obtiene la lista de países disponibles en el sistema.

#### 📤 Ejemplo de Petición

```http
GET /countries
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "code": "CO",
    "name": "Colombia",
    "iso3": "COL",
    "phoneCode": "+57"
  },
  {
    "id": 2,
    "code": "VE",
    "name": "Venezuela",
    "iso3": "VEN",
    "phoneCode": "+58"
  },
  {
    "id": 3,
    "code": "EC",
    "name": "Ecuador",
    "iso3": "ECU",
    "phoneCode": "+593"
  }
]
```

---

### 📝 GET /departments

Obtiene todos los departamentos de Colombia.

#### 📤 Ejemplo de Petición

```http
GET /departments
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Antioquia",
    "code": "05",
    "countryId": 1
  },
  {
    "id": 2,
    "name": "Bogotá D.C.",
    "code": "11",
    "countryId": 1
  },
  {
    "id": 3,
    "name": "Valle del Cauca",
    "code": "76",
    "countryId": 1
  },
  {
    "id": 4,
    "name": "Atlántico",
    "code": "08",
    "countryId": 1
  }
]
```

---

### 📝 GET /cities

Obtiene todas las ciudades disponibles en el sistema.

#### 📤 Ejemplo de Petición

```http
GET /cities
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Medellín",
    "code": "05001",
    "departmentId": 1
  },
  {
    "id": 2,
    "name": "Bogotá",
    "code": "11001",
    "departmentId": 2
  },
  {
    "id": 3,
    "name": "Cali",
    "code": "76001",
    "departmentId": 3
  },
  {
    "id": 4,
    "name": "Barranquilla",
    "code": "08001",
    "departmentId": 4
  }
]
```

---

### 📝 GET /cities/:departmentId

Obtiene las ciudades de un departamento específico.

#### 📥 Parámetros de URL

| Parámetro      | Tipo     | Descripción         |
| -------------- | -------- | ------------------- |
| `departmentId` | `number` | ID del departamento |

#### 📤 Ejemplo de Petición

```http
GET /cities/1
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Medellín",
    "code": "05001",
    "departmentId": 1
  },
  {
    "id": 15,
    "name": "Bello",
    "code": "05088",
    "departmentId": 1
  },
  {
    "id": 28,
    "name": "Itagüí",
    "code": "05360",
    "departmentId": 1
  },
  {
    "id": 42,
    "name": "Envigado",
    "code": "05266",
    "departmentId": 1
  }
]
```

---

## 📄 Catálogos de Identificación

### 📝 GET /document-types

Obtiene los tipos de documentos de identidad válidos.

#### 📤 Ejemplo de Petición

```http
GET /document-types
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "code": "CC",
    "name": "Cédula de Ciudadanía",
    "description": "Documento de identidad para ciudadanos colombianos mayores de edad"
  },
  {
    "id": 2,
    "code": "TI",
    "name": "Tarjeta de Identidad",
    "description": "Documento para menores de edad entre 7 y 17 años"
  },
  {
    "id": 3,
    "code": "RC",
    "name": "Registro Civil",
    "description": "Documento para menores de 7 años"
  },
  {
    "id": 4,
    "code": "CE",
    "name": "Cédula de Extranjería",
    "description": "Documento para extranjeros residentes en Colombia"
  },
  {
    "id": 5,
    "code": "PA",
    "name": "Pasaporte",
    "description": "Documento de viaje internacional"
  }
]
```

---

## 🚨 Catálogos de Violencias

### 📝 GET /violence-types

Obtiene los tipos de violencias reconocidos por el sistema.

#### 📤 Ejemplo de Petición

```http
GET /violence-types
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Violencia Física",
    "description": "Uso intencional de la fuerza física que puede causar daño",
    "category": "INTERPERSONAL"
  },
  {
    "id": 2,
    "name": "Violencia Psicológica",
    "description": "Agresión emocional, verbal o de comportamiento",
    "category": "INTERPERSONAL"
  },
  {
    "id": 3,
    "name": "Violencia Sexual",
    "description": "Actos sexuales no consentidos o coaccionados",
    "category": "INTERPERSONAL"
  },
  {
    "id": 4,
    "name": "Violencia Económica",
    "description": "Control abusivo de recursos económicos",
    "category": "INTERPERSONAL"
  },
  {
    "id": 5,
    "name": "Negligencia",
    "description": "Falta de cuidado o atención necesaria",
    "category": "ABANDONO"
  },
  {
    "id": 6,
    "name": "Violencia Armada",
    "description": "Uso de armas en contextos de conflicto",
    "category": "COLECTIVA"
  }
]
```

---

## 👥 Catálogos Demográficos

### 📝 GET /genders

Obtiene los géneros disponibles en el sistema.

#### 📤 Ejemplo de Petición

```http
GET /genders
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Masculino",
    "code": "M"
  },
  {
    "id": 2,
    "name": "Femenino",
    "code": "F"
  },
  {
    "id": 3,
    "name": "Intersexual",
    "code": "I"
  },
  {
    "id": 4,
    "name": "Prefiero no decir",
    "code": "N"
  }
]
```

---

### 📝 GET /ethnicities

Obtiene las etnias reconocidas en Colombia.

#### 📤 Ejemplo de Petición

```http
GET /ethnicities
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Mestizo",
    "description": "Población de origen mixto europeo e indígena"
  },
  {
    "id": 2,
    "name": "Afrocolombiano",
    "description": "Población de ascendencia africana"
  },
  {
    "id": 3,
    "name": "Indígena",
    "description": "Pueblos originarios de América"
  },
  {
    "id": 4,
    "name": "Blanco",
    "description": "Población de ascendencia europea"
  },
  {
    "id": 5,
    "name": "Rom (Gitano)",
    "description": "Pueblo Rom o Gitano"
  },
  {
    "id": 6,
    "name": "Raizal",
    "description": "Población del archipiélago de San Andrés"
  },
  {
    "id": 7,
    "name": "Palenquero",
    "description": "Comunidad de San Basilio de Palenque"
  }
]
```

---

### 📝 GET /sexual-orientations

Obtiene las orientaciones sexuales reconocidas.

#### 📤 Ejemplo de Petición

```http
GET /sexual-orientations
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Heterosexual",
    "description": "Atracción hacia personas del sexo opuesto"
  },
  {
    "id": 2,
    "name": "Homosexual",
    "description": "Atracción hacia personas del mismo sexo"
  },
  {
    "id": 3,
    "name": "Bisexual",
    "description": "Atracción hacia personas de ambos sexos"
  },
  {
    "id": 4,
    "name": "Pansexual",
    "description": "Atracción independiente del sexo o género"
  },
  {
    "id": 5,
    "name": "Asexual",
    "description": "Ausencia de atracción sexual"
  },
  {
    "id": 6,
    "name": "Otro",
    "description": "Otra orientación sexual"
  },
  {
    "id": 7,
    "name": "Prefiero no decir",
    "description": "No desea especificar"
  }
]
```

---

### 📝 GET /gender-identities

Obtiene las identidades de género disponibles.

#### 📤 Ejemplo de Petición

```http
GET /gender-identities
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Cisgénero",
    "description": "Identidad de género coincide con el sexo asignado al nacer"
  },
  {
    "id": 2,
    "name": "Transgénero",
    "description": "Identidad de género difiere del sexo asignado al nacer"
  },
  {
    "id": 3,
    "name": "No binario",
    "description": "Identidad fuera del binario masculino-femenino"
  },
  {
    "id": 4,
    "name": "Género fluido",
    "description": "Identidad de género variable en el tiempo"
  },
  {
    "id": 5,
    "name": "Agénero",
    "description": "Ausencia de identidad de género"
  },
  {
    "id": 6,
    "name": "Otro",
    "description": "Otra identidad de género"
  }
]
```

---

## 💑 Catálogos Sociales

### 📝 GET /marital-statuses

Obtiene los estados civiles disponibles.

#### 📤 Ejemplo de Petición

```http
GET /marital-statuses
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Soltero/a",
    "code": "S"
  },
  {
    "id": 2,
    "name": "Casado/a",
    "code": "C"
  },
  {
    "id": 3,
    "name": "Unión Libre",
    "code": "UL"
  },
  {
    "id": 4,
    "name": "Divorciado/a",
    "code": "D"
  },
  {
    "id": 5,
    "name": "Viudo/a",
    "code": "V"
  },
  {
    "id": 6,
    "name": "Separado/a",
    "code": "SE"
  }
]
```

---

## 🎓 Catálogos Educativos

### 📝 GET /education-levels

Obtiene los niveles educativos del sistema educativo colombiano.

#### 📤 Ejemplo de Petición

```http
GET /education-levels
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Ninguno",
    "description": "Sin estudios formales"
  },
  {
    "id": 2,
    "name": "Preescolar",
    "description": "Educación inicial"
  },
  {
    "id": 3,
    "name": "Básica Primaria",
    "description": "1° a 5° grado"
  },
  {
    "id": 4,
    "name": "Básica Secundaria",
    "description": "6° a 9° grado"
  },
  {
    "id": 5,
    "name": "Media",
    "description": "10° y 11° grado"
  },
  {
    "id": 6,
    "name": "Técnico",
    "description": "Educación técnica profesional"
  },
  {
    "id": 7,
    "name": "Tecnológico",
    "description": "Educación tecnológica"
  },
  {
    "id": 8,
    "name": "Profesional",
    "description": "Educación universitaria"
  },
  {
    "id": 9,
    "name": "Especialización",
    "description": "Posgrado de especialización"
  },
  {
    "id": 10,
    "name": "Maestría",
    "description": "Posgrado de maestría"
  },
  {
    "id": 11,
    "name": "Doctorado",
    "description": "Posgrado de doctorado"
  }
]
```

---

## 💰 Catálogos Socioeconómicos

### 📝 GET /socioeconomic-strata

Obtiene los estratos socioeconómicos de Colombia.

#### 📤 Ejemplo de Petición

```http
GET /socioeconomic-strata
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "stratum": 1,
    "name": "Estrato 1",
    "description": "Bajo-bajo",
    "subsidyPercentage": 60
  },
  {
    "id": 2,
    "stratum": 2,
    "name": "Estrato 2",
    "description": "Bajo",
    "subsidyPercentage": 40
  },
  {
    "id": 3,
    "stratum": 3,
    "name": "Estrato 3",
    "description": "Medio-bajo",
    "subsidyPercentage": 15
  },
  {
    "id": 4,
    "stratum": 4,
    "name": "Estrato 4",
    "description": "Medio",
    "subsidyPercentage": 0
  },
  {
    "id": 5,
    "stratum": 5,
    "name": "Estrato 5",
    "description": "Medio-alto",
    "subsidyPercentage": -20
  },
  {
    "id": 6,
    "stratum": 6,
    "name": "Estrato 6",
    "description": "Alto",
    "subsidyPercentage": -20
  }
]
```

---

## ♿ Catálogos de Discapacidad

### 📝 GET /disability-types

Obtiene los tipos de discapacidad reconocidos.

#### 📤 Ejemplo de Petición

```http
GET /disability-types
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Visual",
    "description": "Deficiencias visuales como ceguera o baja visión",
    "category": "SENSORIAL"
  },
  {
    "id": 2,
    "name": "Auditiva",
    "description": "Deficiencias auditivas como sordera o hipoacusia",
    "category": "SENSORIAL"
  },
  {
    "id": 3,
    "name": "Física",
    "description": "Deficiencias en funciones o estructuras corporales",
    "category": "FÍSICA"
  },
  {
    "id": 4,
    "name": "Intelectual",
    "description": "Limitaciones significativas en funcionamiento intelectual",
    "category": "COGNITIVA"
  },
  {
    "id": 5,
    "name": "Psicosocial",
    "description": "Alteraciones del comportamiento adaptativo",
    "category": "PSICOSOCIAL"
  },
  {
    "id": 6,
    "name": "Múltiple",
    "description": "Presencia de dos o más discapacidades",
    "category": "MÚLTIPLE"
  },
  {
    "id": 7,
    "name": "Ninguna",
    "description": "Sin discapacidad",
    "category": "NINGUNA"
  }
]
```

---

## 👨‍👩‍👧‍👦 Catálogos Familiares

### 📝 GET /relationship-types

Obtiene los tipos de relaciones familiares.

#### 📤 Ejemplo de Petición

```http
GET /relationship-types
```

#### ✅ Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 1,
    "name": "Padre",
    "description": "Progenitor masculino",
    "category": "NUCLEAR"
  },
  {
    "id": 2,
    "name": "Madre",
    "description": "Progenitor femenino",
    "category": "NUCLEAR"
  },
  {
    "id": 3,
    "name": "Hijo/a",
    "description": "Descendiente directo",
    "category": "NUCLEAR"
  },
  {
    "id": 4,
    "name": "Hermano/a",
    "description": "Hermano o hermana",
    "category": "NUCLEAR"
  },
  {
    "id": 5,
    "name": "Abuelo/a",
    "description": "Progenitor del padre o madre",
    "category": "EXTENDIDA"
  },
  {
    "id": 6,
    "name": "Nieto/a",
    "description": "Hijo del hijo o hija",
    "category": "EXTENDIDA"
  },
  {
    "id": 7,
    "name": "Tío/a",
    "description": "Hermano del padre o madre",
    "category": "EXTENDIDA"
  },
  {
    "id": 8,
    "name": "Primo/a",
    "description": "Hijo del tío o tía",
    "category": "EXTENDIDA"
  },
  {
    "id": 9,
    "name": "Cónyuge",
    "description": "Esposo o esposa",
    "category": "POLÍTICA"
  },
  {
    "id": 10,
    "name": "Cuñado/a",
    "description": "Hermano del cónyuge",
    "category": "POLÍTICA"
  },
  {
    "id": 11,
    "name": "Sin relación",
    "description": "No existe relación familiar",
    "category": "NINGUNA"
  }
]
```

---

## 🧪 Ejemplos de Uso con cURL

### Obtener Departamentos

```bash
curl -X GET http://localhost:3000/departments
```

### Obtener Ciudades por Departamento

```bash
curl -X GET http://localhost:3000/cities/1
```

### Obtener Tipos de Violencia

```bash
curl -X GET http://localhost:3000/violence-types
```

### Obtener Etnias

```bash
curl -X GET http://localhost:3000/ethnicities
```

---

## 🚨 Códigos de Estado HTTP

| Código | Descripción           | Cuándo se produce          |
| ------ | --------------------- | -------------------------- |
| `200`  | OK                    | Operación exitosa          |
| `404`  | Not Found             | Recurso no encontrado      |
| `500`  | Internal Server Error | Error interno del servidor |

---

## 📊 Uso de Catálogos

Los catálogos se utilizan principalmente para:

1. **Formularios**: Poblar listas desplegables en interfaces
2. **Validaciones**: Verificar que los datos ingresados sean válidos
3. **Reportes**: Generar estadísticas por categorías
4. **Filtros**: Permitir búsquedas y filtrados específicos

---

## 🔄 Actualización de Datos

Los catálogos contienen datos maestros que:

- Se mantienen relativamente estables en el tiempo
- Son administrados por el equipo técnico
- Se actualizan siguiendo normativas oficiales colombianas
- Requieren migraciones de base de datos para cambios estructurales

---

## 🌐 Consideraciones Internacionales

Aunque el sistema está diseñado para Colombia:

- Los catálogos geográficos incluyen otros países vecinos
- Las estructuras permiten extensión internacional
- Los códigos ISO se respetan para compatibilidad

---

## 🔗 Enlaces Relacionados

- [Documentación de Usuarios](./users.md)
- [Base de Datos](./database.md)
- [Ejemplos Completos](./examples/catalog-requests.md)
