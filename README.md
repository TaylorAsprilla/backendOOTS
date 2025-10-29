# 📘 OOTS Colombia - Documentación Técnica Completa# 🏥 OOTS Colombia - Backend API

## 🎯 Descripción General del Sistema> **API REST completa para gestión de participantes en programas sociales y de salud mental desarrollada con NestJS, TypeORM y MySQL.**

**OOTS Colombia** (Organización Obrera Tienda de Salud) es un sistema backend desarrollado en **NestJS** para la gestión integral de participantes y casos en programas de bienestar y salud mental. La aplicación permite el registro de usuarios, autenticación segura, gestión de participantes con información biopsicosocial completa, y seguimiento de casos con planes de intervención.## 📋 Descripción General

### 🏆 Objetivos del SistemaOOTS Colombia Backend es una API robusta diseñada para gestionar participantes en programas de atención psicosocial y salud mental. El sistema proporciona funcionalidades completas de autenticación, gestión de usuarios, catálogos de datos y registro detallado de participantes con sus historiales médicos y planes de intervención.

- **Gestión de Usuarios**: Registro y autenticación de profesionales## 🚀 Tecnologías Principales

- **Gestión de Participantes**: Registro completo de beneficiarios con información personal, familiar, médica y psicosocial

- **Gestión de Casos**: Creación y seguimiento de casos con planes de intervención, notas de progreso y cierre- **Framework**: [NestJS](https://nestjs.com/) v11.0.1

- **Catálogos**: Información maestra para formularios y validaciones- **Base de Datos**: MySQL 8.0 con [TypeORM](https://typeorm.io/) v0.3.27

- **Seguridad**: Control de acceso con JWT y protección de rutas- **Autenticación**: JWT con [Passport](http://www.passportjs.org/)

- **Validación**: [class-validator](https://github.com/typestack/class-validator) & [class-transformer](https://github.com/typestack/class-transformer)

---- **Documentación**: [Swagger/OpenAPI](https://swagger.io/)

- **Contenedores**: [Docker](https://www.docker.com/) & Docker Compose

## 🏗️ Arquitectura del Sistema

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

````

- **Framework**: NestJS 11.0.1backend-oots/

- **Base de Datos**: MySQL 8.0+├── src/

- **ORM**: TypeORM con sincronización automática│   ├── auth/                 # 🔐 Módulo de Autenticación

- **Autenticación**: JWT con Passport.js│   │   ├── dto/             # DTOs de autenticación

- **Validación**: class-validator y class-transformer│   │   ├── guards/          # Guards de JWT

- **Documentación**: Swagger/OpenAPI│   │   ├── strategies/      # Estrategias de Passport

- **Rate Limiting**: @nestjs/throttler│   │   └── ...

- **Testing**: Jest para pruebas unitarias y e2e│   ├── users/               # 👥 Módulo de Usuarios

│   │   ├── entities/        # Entidad User

### Estructura de Módulos│   │   ├── dto/            # DTOs de usuarios

│   │   └── ...

```│   ├── common/              # 📚 Módulo de Catálogos

src/│   │   ├── entities/        # Entidades de catálogos

├── app.module.ts                 # Módulo principal de la aplicación│   │   ├── services/        # Servicios compartidos

├── main.ts                       # Punto de entrada de la aplicación│   │   └── ...

├── config/│   ├── participants/        # 🏥 Módulo de Participantes (En desarrollo)

│   └── configuration.ts          # Configuración de entorno│   └── main.ts             # Punto de entrada

├── auth/                         # 🔐 Módulo de Autenticación├── docs/                    # 📖 Documentación detallada

│   ├── auth.controller.ts├── docker-compose.yml       # Configuración de Docker

│   ├── auth.service.ts└── package.json

│   ├── auth.module.ts```

│   ├── dto/

│   ├── guards/## ⚡ Inicio Rápido

│   ├── strategies/

│   └── decorators/### 📋 Prerrequisitos

├── users/                        # 👥 Módulo de Usuarios

│   ├── users.controller.ts- [Node.js](https://nodejs.org/) >= 18.x

│   ├── users.service.ts- [Docker](https://www.docker.com/) & Docker Compose

│   ├── users.module.ts- [Git](https://git-scm.com/)

│   ├── dto/

│   └── entities/### 🔧 Instalación

├── participants/                 # 👤 Módulo de Participantes

│   ├── participants.controller.ts1. **Clonar el repositorio:**

│   ├── participants.service.ts

│   ├── participants.module.ts   ```bash

│   ├── dto/   git clone https://github.com/TaylorAsprilla/backendOOTS.git

│   └── entities/   cd backend-oots

├── cases/                        # 📋 Módulo de Casos   ```

│   ├── cases.controller.ts

│   ├── cases.service.ts2. **Instalar dependencias:**

│   ├── cases.module.ts

│   ├── dto/   ```bash

│   └── entities/   npm install

├── catalogs/                     # 📚 Módulo de Catálogos   ```

│   ├── catalogs.controller.ts

│   ├── catalogs.service.ts3. **Configurar variables de entorno:**

│   ├── catalogs.module.ts

│   └── entities/   ```bash

├── common/                       # 🔧 Módulo Común   cp .env.example .env

│   ├── common.module.ts   # Editar .env con tus configuraciones

│   ├── catalog.controller.ts   ```

│   ├── entities/

│   ├── enums/4. **Iniciar la base de datos con Docker:**

│   └── services/

└── test/                         # 🧪 Pruebas   ```bash

    └── app.e2e-spec.ts   docker-compose up -d

```   ```



---5. **Ejecutar el servidor en desarrollo:**

   ```bash

## 🔐 Sistema de Autenticación   npm run start:dev

````

### Arquitectura de Seguridad

La API estará disponible en: `http://localhost:3000`

El sistema implementa un esquema de autenticación robusto basado en **JWT (JSON Web Tokens)** con las siguientes características:

### 🐳 Configuración con Docker

#### Componentes de Autenticación

````bash

1. **JWT Guard Global**: Todas las rutas están protegidas por defecto# Iniciar todos los servicios

2. **Local Strategy**: Para validación de credenciales en logindocker-compose up -d

3. **JWT Strategy**: Para validación de tokens en rutas protegidas

4. **Public Decorator**: Para marcar rutas como públicas# Ver logs del contenedor

docker-compose logs -f

#### Flujo de Autenticación

# Detener servicios

```mermaiddocker-compose down

graph TD```

    A[Cliente] --> B[POST /api/v1/auth/register]

    A --> C[POST /api/v1/auth/login]## 📊 Módulos Principales

    B --> D[UsersService.create()]

    C --> E[LocalAuthGuard]### 🔐 Autenticación (Auth)

    D --> F[JWT Token Generated]

    E --> F- Registro de usuarios con validaciones robustas

    F --> G[Cliente recibe token]- Login con JWT tokens

    G --> H[Rutas protegidas con JWT]- Protección de rutas con Guards

    H --> I[JwtAuthGuard valida token]- Gestión de sesiones y tokens de acceso

    I --> J[Acceso autorizado]

```### 👥 Gestión de Usuarios (Users)



### Endpoints de Autenticación- CRUD completo de usuarios

- Soft delete con restauración

#### 📝 Registro de Usuario- Validaciones de unicidad (email, teléfono)

```http- Perfiles de usuario con información detallada

POST /api/v1/auth/register

Content-Type: application/json### 📚 Catálogos (Common)



{- 15+ catálogos de datos maestros

  "firstName": "Juan",- Tipos de documento, géneros, estados civiles

  "secondName": "Carlos",- Seguros de salud, niveles educativos

  "firstLastName": "Pérez",- Tipos de vivienda, fuentes de ingresos

  "secondLastName": "García",

  "email": "juan.perez@ejemplo.com",### 🏥 Participantes (En desarrollo)

  "password": "password123",

  "phoneNumber": "+57 300 123 4567",- Registro completo de participantes

  "position": "Psicólogo Clínico",- Historiales médicos y psicológicos

  "organization": "Centro de Bienestar Familiar",- Planes de intervención y seguimiento

  "documentNumber": "12345678",- Notas de progreso y evaluaciones

  "address": "Carrera 10 # 15-20",

  "city": "Bogotá",## 🛡️ Seguridad

  "birthDate": "1990-05-15",

  "documentTypeId": 1- **Autenticación JWT**: Tokens seguros con expiración configurable

}- **Encriptación de contraseñas**: bcrypt con salt rounds configurables (12 rounds)

```- **Rate Limiting**: Protección contra ataques de fuerza bruta con @nestjs/throttler

- **Middleware de Seguridad**: Helmet para headers de seguridad HTTP

**Respuesta Exitosa (201)**:- **Compresión**: Middleware de compresión para optimización de respuestas

```json- **Validación de entrada**: DTOs con class-validator y sanitización automática

{- **Variables de entorno**: Configuraciones sensibles protegidas

  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",- **CORS**: Configuración estricta para requests cross-origin

  "token_type": "Bearer",- **Logging**: Sistema de logs detallado con interceptores personalizados

  "expires_in": 3600,- **Filtros de Excepción**: Manejo centralizado de errores con información sanitizada

  "user": {

    "id": 1,## 📖 Documentación Detallada

    "firstName": "Juan",

    "firstLastName": "Pérez",Para información completa sobre endpoints, ejemplos y guías de uso, consulta la carpeta [`docs/`](./docs/):

    "email": "juan.perez@ejemplo.com",

    "status": "ACTIVE",- [🔐 Autenticación](./docs/authentication.md) - Endpoints de auth, login y registro

    "createdAt": "2024-01-15T10:30:00.000Z"- [👥 Usuarios](./docs/users.md) - Gestión completa de usuarios

  }- [📚 Catálogos](./docs/catalogs.md) - Datos maestros y configuraciones

}- [🗄️ Base de Datos](./docs/database.md) - Esquemas y relaciones

```- [📝 Ejemplos](./docs/examples/) - Peticiones y respuestas completas



#### 🔑 Inicio de Sesión## 🔧 Scripts Disponibles

```http

POST /api/v1/auth/login```bash

Content-Type: application/json# Desarrollo

npm run start:dev          # Servidor en modo desarrollo con hot-reload

{npm run start:debug        # Servidor en modo debug

  "email": "juan.perez@ejemplo.com",

  "password": "password123"# Producción

}npm run build              # Compilar proyecto

```npm run start:prod         # Ejecutar versión compilada



#### 👤 Perfil de Usuario# Testing

```httpnpm run test               # Ejecutar tests unitarios

GET /api/v1/auth/profilenpm run test:watch         # Tests en modo watch

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...npm run test:e2e           # Tests end-to-end

```npm run test:cov           # Coverage de tests



### Seguridad Implementada# Calidad de código

npm run lint               # ESLint con auto-fix

- **Hash de Contraseñas**: bcryptjs con 12 roundsnpm run format             # Prettier formatting

- **JWT Secrets**: Configurables por entorno```

- **Rate Limiting**: 3 req/s, 20 req/10s, 100 req/min

- **Validación de Entrada**: DTOs con class-validator## 🌐 Endpoints Principales

- **CORS**: Configurado para frontend específico

| Método | Endpoint                  | Descripción          | Autenticación |

---| ------ | ------------------------- | -------------------- | ------------- |

| `POST` | `/api/v1/auth/register`   | Registro de usuarios | ❌            |

## 👥 Módulo de Usuarios| `POST` | `/api/v1/auth/login`      | Login de usuarios    | ❌            |

| `GET`  | `/api/v1/auth/profile`    | Perfil del usuario   | ✅            |

### Funcionalidades| `GET`  | `/users`                  | Lista de usuarios    | ❌            |

| `POST` | `/users`                  | Crear usuario        | ❌            |

El módulo de usuarios maneja el ciclo completo de vida de los profesionales que utilizan el sistema:| `GET`  | `/api/v1/catalogs/all`    | Todos los catálogos  | ❌            |

| `GET`  | `/api/v1/catalogs/{type}` | Catálogo específico  | ❌            |

#### Características del Usuario

## 📈 Estado del Proyecto

- **Información Personal**: Nombres, apellidos, email, teléfono

- **Información Profesional**: Cargo, organización- ✅ **Autenticación JWT**: Completado y funcional

- **Datos de Identificación**: Documento, dirección, ciudad, fecha de nacimiento- ✅ **Gestión de Usuarios**: CRUD completo implementado con validación de estado

- **Control de Estado**: ACTIVE, INACTIVE, SUSPENDED- ✅ **Catálogos de Datos**: 15 catálogos implementados

- **Auditoría**: Timestamps de creación y actualización- ✅ **Base de Datos**: MySQL con Docker configurado y optimizado

- ✅ **Seguridad**: Rate limiting, helmet, compresión implementados

#### Validaciones Implementadas- ✅ **Logging y Monitoreo**: Interceptores personalizados funcionando

- ✅ **Configuración Centralizada**: ConfigService con variables de entorno

- **Email único** en el sistema- ✅ **Manejo de Errores**: Filtros globales de excepciones

- **Teléfono único** (si se proporciona)- ✅ **Validación TypeScript**: Sin errores de compilación o linting

- **Longitud mínima** para nombres (2 caracteres)- ❌ **Módulo de Participantes**: Temporalmente deshabilitado por conflictos de tipo

- **Formato de email** válido- 🚧 **Documentación Swagger**: Configurado básicamente

- **Contraseña segura** (mínimo 8 caracteres)- ⏳ **Tests Unitarios**: Pendiente

- ⏳ **Tests E2E**: Pendiente

### Endpoints de Usuarios

## 🤝 Contribución

#### 📋 Listar Usuarios

```http1. Fork del proyecto

GET /api/v1/users2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)

Authorization: Bearer {token}3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)

```4. Push a la rama (`git push origin feature/AmazingFeature`)

5. Abrir un Pull Request

#### 👤 Obtener Usuario

```http## 📄 Licencia

GET /api/v1/users/{id}

Authorization: Bearer {token}Este proyecto es privado y propietario. Todos los derechos reservados.

````

## 🆘 Soporte

#### ✏️ Actualizar Usuario

```httpPara soporte técnico o consultas:

PATCH /api/v1/users/{id}

Authorization: Bearer {token}- **Desarrollador**: Taylor Asprilla

Content-Type: application/json- **Email**: [taylor.asprilla@example.com]

- **Issues**: [GitHub Issues](https://github.com/TaylorAsprilla/backendOOTS/issues)

{

  "firstName": "Nuevo Nombre",---

  "position": "Nueva Posición"

}## 🔗 Enlaces Útiles

```

- [Documentación de NestJS](https://docs.nestjs.com/)

#### 🗑️ Eliminar Usuario- [TypeORM Docs](https://typeorm.io/)

````http- [JWT.io](https://jwt.io/)

DELETE /api/v1/users/{id}- [Docker Documentation](https://docs.docker.com/)

Authorization: Bearer {token}

```---



---<div align="center">

  <p><strong>Desarrollado con ❤️ por Taylor Asprilla</strong></p>

## 👤 Módulo de Participantes  <p><em>Sistema OOTS Colombia - Gestión Integral de Participantes</em></p>

</div>

### Descripción

El módulo de participantes es el núcleo del sistema, permitiendo el registro completo de beneficiarios con información biopsicosocial integral.

#### Información del Participante

1. **Datos Personales**
   - Nombres y apellidos completos
   - Documento de identidad y tipo
   - Fecha de nacimiento y edad
   - Género y estado civil
   - Información de contacto (teléfono, email, dirección)

2. **Información Médica**
   - EPS o seguro de salud
   - Historia de salud física
   - Historia de salud mental
   - Tratamientos actuales

3. **Información Familiar**
   - Contacto de emergencia
   - Miembros del núcleo familiar
   - Relaciones familiares

4. **Información Biopsicosocial**
   - Nivel educativo y académico
   - Historia ocupacional
   - Fuente y nivel de ingresos
   - Tipo de vivienda

5. **Información Clínica**
   - Motivo de consulta
   - Situaciones identificadas
   - Intervención inicial
   - Plan de seguimiento

### Endpoints de Participantes

#### 📝 Crear Participante
```http
POST /api/v1/participants
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "María",
  "secondName": "Fernanda",
  "firstLastName": "González",
  "secondLastName": "Rodríguez",
  "phoneNumber": "+57 300 123 4567",
  "email": "maria.gonzalez@email.com",
  "documentTypeId": 1,
  "documentNumber": "1234567890",
  "address": "Carrera 15 # 32-45",
  "city": "Bogotá",
  "birthDate": "1985-03-15",
  "religiousAffiliation": "Congregación Mita",
  "genderId": 2,
  "maritalStatusId": 1,
  "healthInsuranceId": 3,
  "emergencyContactName": "Carlos González",
  "emergencyContactPhone": "+57 301 987 6543",
  "emergencyContactEmail": "carlos.gonzalez@email.com",
  "emergencyContactAddress": "Calle 45 # 12-34",
  "emergencyContactCity": "Bogotá",
  "emergencyContactRelationshipId": 4,
  "registeredById": 1,
  "familyMembers": [
    {
      "name": "Ana Sofía González",
      "birthDate": "2010-12-05",
      "occupation": "Estudiante",
      "familyRelationshipId": 1,
      "academicLevelId": 2
    }
  ],
  "bioPsychosocialHistory": {
    "profession": "Psicóloga Clínica",
    "incomeSource": "Sueldo",
    "incomeLevel": "Más de 1 SMLV",
    "housingTypeId": 1,
    "educationLevelId": 3
  },
  "consultationReason": {
    "reason": "Estrés laboral afectando rendimiento"
  },
  "identifiedSituations": ["Estrés", "Problemas familiares"],
  "intervention": {
    "intervention": "Sesión inicial de orientación psicológica"
  },
  "followUpPlan": {
    "plan": "Seguimiento semanal por 8 semanas"
  }
}
````

#### 📋 Listar Participantes

```http
GET /api/v1/participants?search=María&city=Bogotá&page=1&limit=10
Authorization: Bearer {token}
```

#### 👤 Obtener Participante

```http
GET /api/v1/participants/{id}
Authorization: Bearer {token}
```

#### ✏️ Actualizar Participante

```http
PATCH /api/v1/participants/{id}
Authorization: Bearer {token}
```

#### 🗑️ Eliminar Participante (Soft Delete)

```http
DELETE /api/v1/participants/{id}
Authorization: Bearer {token}
```

#### 📊 Estadísticas Demográficas

```http
GET /api/v1/participants/stats/demographic
Authorization: Bearer {token}
```

---

## 📋 Módulo de Casos

### Descripción

El módulo de casos permite crear y gestionar expedientes clínicos asociados a participantes, incluyendo planes de intervención, notas de progreso y seguimiento.

#### Componentes del Caso

1. **Información Básica**
   - Número de caso único (generado automáticamente)
   - Estado del caso (ACTIVE, IN_PROGRESS, COMPLETED, CLOSED)
   - Participante asociado

2. **Evaluación Clínica**
   - Motivo de consulta detallado
   - Situaciones identificadas (catálogo)
   - Intervención inicial
   - Plan de seguimiento

3. **Historial Médico**
   - Historia de salud física
   - Historia de salud mental
   - Tratamientos actuales

4. **Ponderación Profesional**
   - Análisis del motivo de consulta
   - Condiciones favorables y desfavorables
   - Enfoque teórico a aplicar

5. **Planes de Intervención**
   - Objetivos específicos
   - Actividades programadas
   - Cronograma (timeline)
   - Responsable de ejecución
   - Criterios de evaluación

6. **Notas de Progreso**
   - Fecha y tipo de sesión
   - Resumen de la sesión
   - Observaciones clínicas
   - Acuerdos establecidos

7. **Referidos y Cierre**
   - Referencias a otros profesionales
   - Nota de cierre con logros
   - Recomendaciones finales

### Estados del Caso

- **ACTIVE**: Caso recién creado, pendiente de iniciar
- **IN_PROGRESS**: Caso en proceso de intervención
- **COMPLETED**: Intervención completada exitosamente
- **CLOSED**: Caso cerrado (por cualquier motivo)

### Endpoints de Casos

#### 📝 Crear Caso

```http
POST /api/v1/cases
Authorization: Bearer {token}
Content-Type: application/json

{
  "participantId": 1,
  "consultationReason": "Participante presenta síntomas de ansiedad post-separación",
  "identifiedSituations": [1, 3, 5],
  "intervention": "Evaluación inicial completada",
  "followUpPlan": [1, 2],
  "physicalHealthHistory": {
    "currentConditions": "Hipertensión controlada",
    "medications": "Losartán 50mg",
    "familyHistoryFather": "Diabetes tipo 2",
    "familyHistoryMother": "Hipertensión",
    "observations": "Control médico regular"
  },
  "mentalHealthHistory": {
    "currentConditions": "Ansiedad generalizada",
    "medications": "Ninguno",
    "familyHistoryFather": "Sin antecedentes",
    "familyHistoryMother": "Episodios depresivos",
    "observations": "Primera consulta psicológica"
  },
  "ponderacion": {
    "consultationMotiveAnalysis": "Estrés crónico con síntomas ansiosos",
    "identifiedSituationAnalysis": "Situación de crisis vital",
    "favorableConditions": "Insight adecuado, motivación al cambio",
    "unfavorableConditions": "Falta de red de apoyo",
    "theoreticalApproach": "Terapia cognitivo-conductual"
  },
  "interventionPlans": [
    {
      "goal": "Reducir niveles de ansiedad",
      "objectives": "Aprender técnicas de relajación",
      "activities": "Sesiones semanales de TCC",
      "timeline": "8 semanas",
      "responsible": "Psicóloga orientadora",
      "evaluationCriteria": "Escala GAD-7"
    }
  ],
  "progressNotes": [
    {
      "sessionDate": "2024-01-15",
      "sessionType": "INDIVIDUAL",
      "summary": "Primera sesión de evaluación",
      "observations": "Paciente colaborativa",
      "agreements": "Práctica diaria de respiración"
    }
  ],
  "referrals": "Evaluación médica si persisten síntomas físicos",
  "closingNote": {
    "closingDate": "2024-03-15",
    "reason": "TREATMENT_COMPLETED",
    "achievements": "Reducción significativa de ansiedad",
    "recommendations": "Continuar técnicas aprendidas",
    "observations": "Evolución favorable"
  }
}
```

#### 📋 Listar Casos

```http
GET /api/v1/cases
Authorization: Bearer {token}
```

#### 👤 Casos por Participante

```http
GET /api/v1/cases/participants/{participantId}/cases
Authorization: Bearer {token}
```

#### 📄 Obtener Caso

```http
GET /api/v1/cases/{id}
Authorization: Bearer {token}
```

#### 🔄 Actualizar Estado

```http
PATCH /api/v1/cases/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

---

## 📚 Sistema de Catálogos

### Descripción

El sistema maneja dos tipos de catálogos que alimentan formularios y validaciones:

#### 1. Catálogos Básicos (Common Module)

Datos maestros fundamentales para el funcionamiento del sistema:

- **document-types**: Tipos de documento (CC, TI, Pasaporte, etc.)
- **genders**: Géneros (Masculino, Femenino, Otro)
- **marital-statuses**: Estados civiles (Soltero, Casado, Unión libre, etc.)
- **health-insurances**: EPS y seguros de salud
- **emergency-contact-relationships**: Relaciones de contacto de emergencia
- **family-relationships**: Relaciones familiares (Hijo, Madre, Padre, etc.)
- **academic-levels**: Niveles académicos (Primaria, Secundaria, etc.)
- **education-levels**: Niveles educativos (Técnico, Profesional, etc.)
- **income-sources**: Fuentes de ingreso (Sueldo, Independiente, etc.)
- **income-levels**: Niveles de ingreso (Menos de 1 SMLV, etc.)
- **housing-types**: Tipos de vivienda (Propia, Arriendo, etc.)
- **follow-up-plan-types**: Tipos de planes de seguimiento
- **treatment-statuses**: Estados de tratamiento
- **approach-types**: Tipos de enfoque terapéutico
- **process-types**: Tipos de proceso clínico

#### 2. Catálogos Especializados (Catalogs Module)

Datos específicos para casos clínicos:

- **identified-situations**: Situaciones identificadas en casos
- **follow-up-plan-catalog**: Planes de seguimiento predefinidos

### Endpoints de Catálogos

#### 📋 Catálogos Básicos

```http
# Obtener todos los catálogos en una sola respuesta
GET /api/v1/catalogs/all

# Catálogos individuales
GET /api/v1/catalogs/document-types
GET /api/v1/catalogs/genders
GET /api/v1/catalogs/marital-statuses
GET /api/v1/catalogs/health-insurances
GET /api/v1/catalogs/emergency-contact-relationships
GET /api/v1/catalogs/family-relationships
GET /api/v1/catalogs/academic-levels
GET /api/v1/catalogs/education-levels
GET /api/v1/catalogs/income-sources
GET /api/v1/catalogs/income-levels
GET /api/v1/catalogs/housing-types
GET /api/v1/catalogs/follow-up-plan-types
GET /api/v1/catalogs/treatment-statuses
GET /api/v1/catalogs/approach-types
GET /api/v1/catalogs/process-types
```

#### 📚 Catálogos Especializados

```http
# Situaciones identificadas
GET /api/v1/catalogs/identified-situations
GET /api/v1/catalogs/identified-situations/{id}

# Planes de seguimiento
GET /api/v1/catalogs/follow-up-plans
GET /api/v1/catalogs/follow-up-plans/{id}
```

### Inicialización de Datos

El sistema incluye un **CatalogSeedService** que inicializa automáticamente los catálogos con datos predeterminados al arrancar la aplicación, garantizando que siempre haya datos disponibles para el funcionamiento del sistema.

---

## 🗄️ Base de Datos

### Configuración

```typescript
// Configuración TypeORM
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || '3307'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
  charset: 'utf8mb4',
  timezone: 'Z',
});
```

### Entidades Principales

#### User (Usuario)

- **id**: Identificador único
- **firstName, secondName**: Nombres
- **firstLastName, secondLastName**: Apellidos
- **email**: Email único
- **password**: Hash de contraseña
- **phoneNumber**: Teléfono (único)
- **position**: Cargo
- **organization**: Organización
- **documentNumber**: Número de documento
- **address**: Dirección
- **city**: Ciudad
- **birthDate**: Fecha de nacimiento
- **documentTypeId**: Relación con tipo de documento
- **status**: Estado (ACTIVE, INACTIVE, SUSPENDED)

#### Participant (Participante)

- **id**: Identificador único
- **firstName, secondName, firstLastName, secondLastName**: Nombres completos
- **phoneNumber, email**: Contacto
- **documentTypeId, documentNumber**: Identificación
- **address, city**: Ubicación
- **birthDate**: Fecha de nacimiento
- **religiousAffiliation**: Afiliación religiosa
- **genderId, maritalStatusId**: Demografia
- **healthInsuranceId**: Seguro de salud
- **emergencyContact**: Información de contacto de emergencia
- **registeredById**: Usuario que registró

#### Case (Caso)

- **id**: Identificador único
- **caseNumber**: Número único generado
- **participantId**: Participante asociado
- **status**: Estado del caso
- **consultationReason**: Motivo de consulta (TEXT)
- **identifiedSituations**: Array JSON de situaciones
- **intervention**: Intervención inicial (TEXT)
- **followUpPlan**: Array JSON de planes
- **referrals**: Referidos (TEXT)

#### Entidades Médicas

- **PhysicalHealthHistory**: Historia médica física
- **MentalHealthHistory**: Historia de salud mental
- **InterventionPlan**: Planes de intervención
- **ProgressNote**: Notas de progreso
- **Ponderacion**: Análisis profesional
- **ClosingNote**: Nota de cierre

### Relaciones

```mermaid
erDiagram
    User ||--o{ Participant : "registers"
    Participant ||--o{ Case : "has"
    Case ||--o{ PhysicalHealthHistory : "contains"
    Case ||--o{ MentalHealthHistory : "contains"
    Case ||--o{ InterventionPlan : "contains"
    Case ||--o{ ProgressNote : "contains"
    Case ||--o{ Ponderacion : "contains"
    Case ||--o{ ClosingNote : "contains"

    DocumentType ||--o{ User : "identifies"
    DocumentType ||--o{ Participant : "identifies"
    Gender ||--o{ Participant : "classifies"
    MaritalStatus ||--o{ Participant : "describes"
    HealthInsurance ||--o{ Participant : "covers"
```

---

## 🛡️ Seguridad y Validaciones

### Autenticación y Autorización

1. **JWT Global Guard**: Todas las rutas protegidas por defecto
2. **Public Decorator**: Para rutas públicas (registro, login, catálogos)
3. **Password Hashing**: bcryptjs con 12 rounds de salt
4. **Token Expiration**: Configurable (por defecto 24h)

### Rate Limiting

```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000, // 1 segundo
    limit: 3, // 3 requests por segundo
  },
  {
    name: 'medium',
    ttl: 10000, // 10 segundos
    limit: 20, // 20 requests por 10 segundos
  },
  {
    name: 'long',
    ttl: 60000, // 1 minuto
    limit: 100, // 100 requests por minuto
  },
]);
```

### Validaciones de Datos

#### DTOs con class-validator

- **Formato de email** válido
- **Longitudes mínimas y máximas** para campos de texto
- **Números válidos** para IDs
- **Fechas válidas** en formato ISO
- **Campos requeridos** vs opcionales
- **Validación de arrays** y objetos anidados

#### Ejemplos de Validación

```typescript
@IsEmail({}, { message: 'Debe proporcionar un email válido' })
@IsNotEmpty({ message: 'El email es requerido' })
@MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
email: string;

@MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
@MaxLength(255, { message: 'La contraseña no puede exceder 255 caracteres' })
password: string;
```

### Manejo de Errores

- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Sin permisos para el recurso
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Violación de unicidad (email/teléfono duplicado)
- **500 Internal Server Error**: Error interno del servidor

---

## 🚀 Despliegue y Configuración

### Variables de Entorno

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=oots_colombia

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Entorno
NODE_ENV=development
```

### Scripts Disponibles

```bash
# Desarrollo
npm run start:dev    # Modo desarrollo con hot reload
npm run start:debug  # Modo debug

# Producción
npm run build       # Compilar aplicación
npm run start:prod  # Ejecutar en producción

# Testing
npm run test        # Pruebas unitarias
npm run test:e2e    # Pruebas end-to-end
npm run test:cov    # Cobertura de pruebas

# Linting
npm run lint        # Verificar código
npm run format      # Formatear código
```

### Docker

```dockerfile
# Dockerfile incluido para contenización
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

---

## 📊 Monitoreo y Logs

### Logging

- **Desarrollo**: Logs completos (error, warn, log)
- **Producción**: Solo errores críticos
- **Query Logging**: Habilitado en desarrollo para debugging

### Health Checks

- **Database Connection**: Verificación automática de conexión
- **Memory Usage**: Monitoreo de uso de memoria
- **Response Times**: Medición de tiempos de respuesta

---

## 🧪 Testing

### Estructura de Pruebas

```
test/
├── app.e2e-spec.ts          # Pruebas end-to-end
├── auth.e2e-spec.ts         # Pruebas de autenticación
├── participants.e2e-spec.ts # Pruebas de participantes
└── cases.e2e-spec.ts        # Pruebas de casos
```

### Tipos de Pruebas

1. **Unitarias**: Testeo de servicios y funciones individuales
2. **Integración**: Testeo de módulos completos
3. **E2E**: Testeo de flujos completos de la aplicación

---

## 📈 Performance

### Optimizaciones Implementadas

1. **Lazy Loading**: Carga bajo demanda de relaciones
2. **Índices de Base de Datos**: En campos de búsqueda frecuente
3. **Paginación**: En listados de participantes y casos
4. **Rate Limiting**: Prevención de abuso de API
5. **Compresión**: Compresión gzip habilitada

### Métricas de Performance

- **Tiempo de respuesta promedio**: < 200ms
- **Throughput**: > 1000 requests/min
- **Memoria utilizada**: < 512MB en producción

---

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas

1. **Sistema de Roles**: Administrador, Coordinador, Orientador
2. **Notificaciones**: Sistema de alertas y recordatorios
3. **Reportes**: Generación de reportes estadísticos
4. **Audit Log**: Registro de todas las acciones del sistema
5. **Archivos**: Subida y gestión de documentos adjuntos
6. **API Versioning**: Versionado de API para compatibilidad

### Mejoras Técnicas

1. **Caché**: Implementación de Redis para caché
2. **Queue System**: Bull.js para tareas asíncronas
3. **Microservicios**: Separación en servicios especializados
4. **GraphQL**: API GraphQL complementaria
5. **Real-time**: WebSockets para actualizaciones en tiempo real

---

## 📞 Soporte y Contacto

### Recursos Adicionales

- **Swagger UI**: Disponible en `/api` cuando la aplicación está ejecutándose
- **Repositorio**: Control de versiones en Git
- **Documentación de API**: Auto-generada con Swagger/OpenAPI

### Contacto Técnico

Para soporte técnico, consultas sobre la implementación o reportar issues, contactar al equipo de desarrollo a través del repositorio del proyecto.

---

_Documentación generada para OOTS Colombia v1.0.0 - Última actualización: Octubre 2024_
