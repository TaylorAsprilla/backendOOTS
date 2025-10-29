# 📋 Documentación: Crear Participante

## Resumen

Esta documentación muestra cómo crear un participante en el sistema OOTS. Después de la reestructuración, los participantes contienen **solo información personal y demográfica**. La información médica se maneja ahora a través de [**Cases**](./case-creation-examples.md).

## 🔗 Endpoint

```http
POST /participants
Content-Type: application/json
Authorization: Bearer {token}
```

## 📝 Estructura del Participante

Un participante incluye:

- ✅ **Información personal** (nombres, documentos, contacto)
- ✅ **Información demográfica** (fecha de nacimiento, ciudad, religión)
- ✅ **Contacto de emergencia**
- ✅ **Miembros de familia** (opcional)
- ✅ **Situaciones identificadas** (opcional)
- ✅ **Nota de cierre** (opcional)
- ❌ **~~Información médica~~** → Ahora va en [Cases](./case-creation-examples.md)

## 🏗️ Body Completo de Ejemplo

### Participante con Toda la Información

```json
{
  "firstName": "María",
  "secondName": "Isabel",
  "firstLastName": "García",
  "secondLastName": "López",
  "phoneNumber": "+57 301 234 5678",
  "email": "maria.garcia@email.com",
  "documentTypeId": 1,
  "documentNumber": "1234567890",
  "address": "Carrera 15 #45-67, Apartamento 302",
  "city": "Bogotá",
  "birthDate": "1985-03-15",
  "religiousAffiliation": "Católica",
  "genderId": 2,
  "maritalStatusId": 2,
  "healthInsuranceId": 1,
  "customHealthInsurance": null,
  "referralSource": "Iglesia San José",
  "emergencyContactName": "Carlos García Hernández",
  "emergencyContactPhone": "+57 300 987 6543",
  "emergencyContactEmail": "carlos.garcia@email.com",
  "emergencyContactAddress": "Calle 20 #30-40",
  "emergencyContactCity": "Bogotá",
  "emergencyContactRelationshipId": 3,
  "registeredById": 1,
  "familyMembers": [
    {
      "name": "Juan García López",
      "birthDate": "2010-08-22",
      "occupation": "Estudiante",
      "familyRelationshipId": 1,
      "academicLevelId": 3
    },
    {
      "name": "Ana García López",
      "birthDate": "2012-12-05",
      "occupation": "Estudiante",
      "familyRelationshipId": 1,
      "academicLevelId": 2
    }
  ],
  "identifiedSituations": [
    "Violencia doméstica",
    "Problemas económicos",
    "Dificultades familiares"
  ],
  "closingNote": {
    "closureReason": "Completó proceso satisfactoriamente",
    "achievements": "Logró estabilidad emocional y familiar",
    "recommendations": "Continuar con seguimiento mensual",
    "observations": "Participante muy colaborativa durante todo el proceso"
  }
}
```

## 📋 Campos Requeridos vs Opcionales

### ✅ Campos Obligatorios

| Campo                            | Tipo   | Descripción                   | Ejemplo             |
| -------------------------------- | ------ | ----------------------------- | ------------------- |
| `firstName`                      | string | Primer nombre                 | "María"             |
| `firstLastName`                  | string | Primer apellido               | "García"            |
| `phoneNumber`                    | string | Teléfono (formato colombiano) | "+57 301 234 5678"  |
| `documentTypeId`                 | number | ID tipo de documento          | 1 (Cédula)          |
| `documentNumber`                 | string | Número de documento           | "1234567890"        |
| `address`                        | string | Dirección completa            | "Carrera 15 #45-67" |
| `city`                           | string | Ciudad de residencia          | "Bogotá"            |
| `birthDate`                      | string | Fecha de nacimiento (ISO)     | "1985-03-15"        |
| `religiousAffiliation`           | string | Afiliación religiosa          | "Católica"          |
| `genderId`                       | number | ID del género                 | 2 (Femenino)        |
| `maritalStatusId`                | number | ID estado civil               | 2 (Casada)          |
| `healthInsuranceId`              | number | ID seguro de salud            | 1 (EPS)             |
| `emergencyContactName`           | string | Nombre contacto emergencia    | "Carlos García"     |
| `emergencyContactPhone`          | string | Teléfono contacto emergencia  | "+57 300 987 6543"  |
| `emergencyContactEmail`          | string | Email contacto emergencia     | "carlos@email.com"  |
| `emergencyContactAddress`        | string | Dirección contacto emergencia | "Calle 20 #30-40"   |
| `emergencyContactCity`           | string | Ciudad contacto emergencia    | "Bogotá"            |
| `emergencyContactRelationshipId` | number | ID relación con contacto      | 3 (Hermano)         |
| `registeredById`                 | number | ID del usuario que registra   | 1                   |

### 🔶 Campos Opcionales

| Campo                   | Tipo   | Descripción               | Ejemplo                  |
| ----------------------- | ------ | ------------------------- | ------------------------ |
| `secondName`            | string | Segundo nombre            | "Isabel"                 |
| `secondLastName`        | string | Segundo apellido          | "López"                  |
| `email`                 | string | Correo electrónico        | "maria@email.com"        |
| `customHealthInsurance` | string | EPS personalizada         | "Nueva EPS Custom"       |
| `referralSource`        | string | Fuente de referencia      | "Iglesia San José"       |
| `familyMembers`         | array  | Miembros de familia       | Ver estructura abajo     |
| `identifiedSituations`  | array  | Situaciones identificadas | ["Violencia", "Pobreza"] |
| `closingNote`           | object | Nota de cierre            | Ver estructura abajo     |

## 👨‍👩‍👧‍👦 Estructura: Miembros de Familia

```json
{
  "familyMembers": [
    {
      "name": "Juan García López",
      "birthDate": "2010-08-22",
      "occupation": "Estudiante",
      "familyRelationshipId": 1,
      "academicLevelId": 3
    }
  ]
}
```

### Campos de Miembro de Familia

- `name`: Nombre completo (obligatorio)
- `birthDate`: Fecha de nacimiento en formato ISO (obligatorio)
- `occupation`: Ocupación (obligatorio)
- `familyRelationshipId`: ID del tipo de relación familiar (obligatorio)
- `academicLevelId`: ID del nivel académico (obligatorio)

## 📝 Estructura: Nota de Cierre

```json
{
  "closingNote": {
    "closureReason": "Completó proceso satisfactoriamente",
    "achievements": "Logró estabilidad emocional y familiar",
    "recommendations": "Continuar con seguimiento mensual",
    "observations": "Participante muy colaborativa durante todo el proceso"
  }
}
```

### Campos de Nota de Cierre (todos opcionales)

- `closureReason`: Razón del cierre
- `achievements`: Logros obtenidos
- `recommendations`: Recomendaciones
- `observations`: Observaciones adicionales

## 📊 IDs de Referencia (Catálogos)

### Tipos de Documento (`documentTypeId`)

| ID  | Tipo                  |
| --- | --------------------- |
| 1   | Cédula de Ciudadanía  |
| 2   | Tarjeta de Identidad  |
| 3   | Cédula de Extranjería |
| 4   | Pasaporte             |

### Géneros (`genderId`)

| ID  | Género    |
| --- | --------- |
| 1   | Masculino |
| 2   | Femenino  |
| 3   | Otro      |

### Estados Civiles (`maritalStatusId`)

| ID  | Estado        |
| --- | ------------- |
| 1   | Soltero(a)    |
| 2   | Casado(a)     |
| 3   | Separado(a)   |
| 4   | Divorciado(a) |
| 5   | Viudo(a)      |
| 6   | Unión Libre   |

### Seguros de Salud (`healthInsuranceId`)

| ID  | Tipo       |
| --- | ---------- |
| 1   | EPS        |
| 2   | SISBEN     |
| 3   | Particular |
| 4   | Otro       |

### Relaciones de Contacto Emergencia (`emergencyContactRelationshipId`)

| ID  | Relación        |
| --- | --------------- |
| 1   | Padre/Madre     |
| 2   | Hijo/Hija       |
| 3   | Hermano/Hermana |
| 4   | Cónyuge         |
| 5   | Amigo/Amiga     |
| 6   | Otro            |

### Relaciones Familiares (`familyRelationshipId`)

| ID  | Relación        |
| --- | --------------- |
| 1   | Hijo/Hija       |
| 2   | Cónyuge         |
| 3   | Padre/Madre     |
| 4   | Hermano/Hermana |
| 5   | Abuelo/Abuela   |
| 6   | Tío/Tía         |
| 7   | Primo/Prima     |
| 8   | Otro            |

### Niveles Académicos (`academicLevelId`)

| ID  | Nivel                  |
| --- | ---------------------- |
| 1   | Sin educación          |
| 2   | Primaria incompleta    |
| 3   | Primaria completa      |
| 4   | Secundaria incompleta  |
| 5   | Secundaria completa    |
| 6   | Técnico                |
| 7   | Tecnológico            |
| 8   | Universidad incompleta |
| 9   | Universidad completa   |
| 10  | Postgrado              |

## 📝 Ejemplos de Uso

### 1. Participante Básico (Solo Campos Obligatorios)

```json
{
  "firstName": "Pedro",
  "firstLastName": "Rodríguez",
  "phoneNumber": "+57 312 555 1234",
  "documentTypeId": 1,
  "documentNumber": "98765432",
  "address": "Calle 10 #5-15",
  "city": "Medellín",
  "birthDate": "1990-07-20",
  "religiousAffiliation": "Cristiana",
  "genderId": 1,
  "maritalStatusId": 1,
  "healthInsuranceId": 1,
  "emergencyContactName": "Ana Rodríguez",
  "emergencyContactPhone": "+57 313 555 9876",
  "emergencyContactEmail": "ana.rodriguez@email.com",
  "emergencyContactAddress": "Calle 12 #8-20",
  "emergencyContactCity": "Medellín",
  "emergencyContactRelationshipId": 1,
  "registeredById": 1
}
```

### 2. Participante con Familia

```json
{
  "firstName": "Laura",
  "secondName": "Patricia",
  "firstLastName": "Martínez",
  "secondLastName": "Gómez",
  "phoneNumber": "+57 320 444 7777",
  "email": "laura.martinez@gmail.com",
  "documentTypeId": 1,
  "documentNumber": "55566677",
  "address": "Transversal 25 #12-34",
  "city": "Cali",
  "birthDate": "1988-11-12",
  "religiousAffiliation": "Adventista",
  "genderId": 2,
  "maritalStatusId": 6,
  "healthInsuranceId": 2,
  "referralSource": "Centro de Salud La Esperanza",
  "emergencyContactName": "Miguel Martínez",
  "emergencyContactPhone": "+57 321 444 8888",
  "emergencyContactEmail": "miguel.martinez@email.com",
  "emergencyContactAddress": "Carrera 30 #15-25",
  "emergencyContactCity": "Cali",
  "emergencyContactRelationshipId": 4,
  "registeredById": 2,
  "familyMembers": [
    {
      "name": "Sofía Martínez",
      "birthDate": "2015-04-18",
      "occupation": "Estudiante",
      "familyRelationshipId": 1,
      "academicLevelId": 2
    }
  ],
  "identifiedSituations": ["Madre soltera", "Dificultades económicas"]
}
```

### 3. Participante con Situaciones Complejas

```json
{
  "firstName": "Roberto",
  "firstLastName": "Hernández",
  "phoneNumber": "+57 315 333 2222",
  "email": "roberto.hernandez@hotmail.com",
  "documentTypeId": 1,
  "documentNumber": "11223344",
  "address": "Barrio Las Flores, Manzana 5, Casa 12",
  "city": "Barranquilla",
  "birthDate": "1975-09-03",
  "religiousAffiliation": "Testigo de Jehová",
  "genderId": 1,
  "maritalStatusId": 4,
  "healthInsuranceId": 3,
  "customHealthInsurance": "Seguro Privado XYZ",
  "referralSource": "Programa gubernamental de apoyo",
  "emergencyContactName": "María Hernández",
  "emergencyContactPhone": "+57 316 333 3333",
  "emergencyContactEmail": "maria.hernandez@email.com",
  "emergencyContactAddress": "Calle 8 #4-56",
  "emergencyContactCity": "Barranquilla",
  "emergencyContactRelationshipId": 3,
  "registeredById": 3,
  "identifiedSituations": [
    "Divorcio reciente",
    "Pérdida de empleo",
    "Problemas de salud mental",
    "Conflictos familiares"
  ],
  "closingNote": {
    "closureReason": "Derivado a especialista",
    "achievements": "Mejoró autoestima y relaciones interpersonales",
    "recommendations": "Seguimiento psicológico especializado",
    "observations": "Requiere acompañamiento continuo por situación compleja"
  }
}
```

## ✅ Respuesta Exitosa

```json
{
  "id": 15,
  "firstName": "María",
  "secondName": "Isabel",
  "firstLastName": "García",
  "secondLastName": "López",
  "phoneNumber": "+57 301 234 5678",
  "email": "maria.garcia@email.com",
  "documentNumber": "1234567890",
  "address": "Carrera 15 #45-67, Apartamento 302",
  "city": "Bogotá",
  "birthDate": "1985-03-15",
  "religiousAffiliation": "Católica",
  "customHealthInsurance": null,
  "referralSource": "Iglesia San José",
  "emergencyContactName": "Carlos García Hernández",
  "emergencyContactPhone": "+57 300 987 6543",
  "emergencyContactEmail": "carlos.garcia@email.com",
  "emergencyContactAddress": "Calle 20 #30-40",
  "emergencyContactCity": "Bogotá",
  "registeredById": 1,
  "createdAt": "2024-12-19T10:30:00.000Z",
  "updatedAt": "2024-12-19T10:30:00.000Z",
  "familyMembers": [
    {
      "id": 25,
      "name": "Juan García López",
      "birthDate": "2010-08-22",
      "occupation": "Estudiante",
      "createdAt": "2024-12-19T10:30:00.000Z",
      "updatedAt": "2024-12-19T10:30:00.000Z"
    }
  ],
  "participantIdentifiedSituations": [
    {
      "id": 30,
      "createdAt": "2024-12-19T10:30:00.000Z",
      "identifiedSituation": {
        "id": 1,
        "name": "Violencia doméstica"
      }
    }
  ],
  "cases": [],
  "documentType": {
    "id": 1,
    "name": "Cédula de Ciudadanía"
  },
  "gender": {
    "id": 2,
    "name": "Femenino"
  }
}
```

## ❌ Errores Comunes

### 1. Formato de Teléfono Incorrecto

```json
{
  "message": ["Phone number must be in format: +57 3XX XXX XXXX"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 2. ID de Catálogo Inválido

```json
{
  "message": "Tipo de documento con ID 999 no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

### 3. Campos Obligatorios Faltantes

```json
{
  "message": [
    "firstName should not be empty",
    "documentNumber should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## 🔄 Siguiente Paso: Crear Caso

Una vez creado el participante, el siguiente paso es crear un **caso** con la información médica:

```http
POST /cases
{
  "participantId": 15,
  "title": "Consulta por ansiedad",
  "description": "Primera consulta por síntomas de ansiedad",
  "bioPsychosocialHistory": { ... },
  "consultationReason": { ... },
  // ... resto de información médica
}
```

Ver: [**Documentación de Creación de Casos**](./case-creation-examples.md)

## 📞 Contacto

Para soporte técnico o dudas sobre la implementación, contactar al equipo de desarrollo.
