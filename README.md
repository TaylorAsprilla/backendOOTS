# 🏥 OOTS - Backend API

> **API REST completa para gestión de participantes en programas sociales y de salud mental desarrollada con NestJS, TypeORM y MySQL.**

## 📋 Descripción General

**OOTS** (Oficina de Orientación de la Congregaciónn Mita) es un sistema backend desarrollado en **NestJS** para la gestión integral de participantes y casos en programas de bienestar y salud mental. La aplicación permite el registro de usuarios, autenticación segura, gestión de participantes con información biopsicosocial completa, y seguimiento de casos con planes de intervención.

### 🏆 Objetivos del Sistema

- **Gestión de Usuarios**: Registro y autenticación de profesionales
- **Gestión de Participantes**: Registro completo de beneficiarios con información personal, familiar, médica y psicosocial
- **Gestión de Casos**: Creación y seguimiento de casos con planes de intervención, notas de progreso y cierre
- **Catálogos**: Información maestra para formularios y validaciones
- **Seguridad**: Control de acceso con JWT y protección de rutas

## 🚀 Tecnologías Principales

- **Framework**: [NestJS](https://nestjs.com/) v11.0.1
- **Base de Datos**: MySQL 8.0 con [TypeORM](https://typeorm.io/) v0.3.27
- **Autenticación**: JWT con [Passport](http://www.passportjs.org/)
- **Validación**: [class-validator](https://github.com/typestack/class-validator) & [class-transformer](https://github.com/typestack/class-transformer)
- **Documentación**: [Swagger/OpenAPI](https://swagger.io/)
- **Contenedores**: [Docker](https://www.docker.com/) & Docker Compose

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Framework**: NestJS 11.0.1
- **Base de Datos**: MySQL 8.0+
- **ORM**: TypeORM con sincronización automática
- **Autenticación**: JWT con Passport.js
- **Validación**: class-validator y class-transformer
- **Documentación**: Swagger/OpenAPI
- **Rate Limiting**: @nestjs/throttler
- **Testing**: Jest para pruebas unitarias y e2e

### Estructura de Módulos

```
backend-oots/
├── src/
│   ├── auth/                 # 🔐 Módulo de Autenticación
│   │   ├── dto/             # DTOs de autenticación
│   │   ├── guards/          # Guards de JWT
│   │   ├── strategies/      # Estrategias de Passport
│   │   └── ...
│   ├── users/               # 👥 Módulo de Usuarios
│   │   ├── entities/        # Entidad User
│   │   ├── dto/            # DTOs de usuarios
│   │   └── ...
│   ├── common/              # 📚 Módulo de Catálogos
│   │   ├── entities/        # Entidades de catálogos
│   │   ├── services/        # Servicios compartidos
│   │   └── ...
│   ├── participants/        # 🏥 Módulo de Participantes (En desarrollo)
│   └── main.ts             # Punto de entrada
├── docs/                    # 📖 Documentación detallada
├── docker-compose.yml       # Configuración de Docker
└── package.json
```

### Estructura de Archivos Detallada

```
src/
├── app.module.ts                 # Módulo principal de la aplicación
├── main.ts                       # Punto de entrada de la aplicación
├── config/
│   └── configuration.ts          # Configuración de entorno
├── auth/                         # 🔐 Módulo de Autenticación
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   └── decorators/
├── users/                        # 👥 Módulo de Usuarios
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── dto/
│   └── entities/
├── participants/                 # 👤 Módulo de Participantes
│   ├── participants.controller.ts
│   ├── participants.service.ts
│   ├── participants.module.ts
│   ├── dto/
│   └── entities/
├── cases/                        # 📋 Módulo de Casos
│   ├── cases.controller.ts
│   ├── cases.service.ts
│   ├── cases.module.ts
│   ├── dto/
│   └── entities/
├── catalogs/                     # 📚 Módulo de Catálogos
│   ├── catalogs.controller.ts
│   ├── catalogs.service.ts
│   ├── catalogs.module.ts
│   └── entities/
├── common/                       # 🔧 Módulo Común
│   ├── common.module.ts
│   ├── catalog.controller.ts
│   ├── entities/
│   ├── enums/
│   └── services/
└── test/                         # 🧪 Pruebas
    └── app.e2e-spec.ts
```

---

## ⚡ Inicio Rápido

### 📋 Prerrequisitos

- [Node.js](https://nodejs.org/) >= 18.x
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

### 🔧 Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/TaylorAsprilla/backendOOTS.git
   cd backend-oots
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**

   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar la base de datos con Docker:**

   ```bash
   docker-compose up -d
   ```

5. **Ejecutar el servidor en desarrollo:**

   ```bash
   npm run start:dev
   ```

6. **Acceder a la aplicación:**
   - **API**: http://localhost:3000
   - **Documentación Swagger**: http://localhost:3000/api

### 🧪 Ejecutar Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

# Cobertura de código
npm run test:cov
```

---

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)

- **Algoritmo**: HS256
- **Expiración**: 24 horas (configurable)
- **Refresh Tokens**: Implementados para renovación automática
- **Blacklist**: Tokens invalidados almacenados en caché

### Gestión de Contraseñas

#### Cambio de Contraseña (Usuarios Autenticados)

- Endpoint: `PATCH /api/v1/auth/change-password`
- Requiere validación de contraseña actual
- Validación de requisitos de seguridad
- No permite reutilizar la misma contraseña

#### Recuperación de Contraseña (Proceso Público)

- Endpoint: `POST /api/v1/auth/forgot-password` - Solicita recuperación
- Endpoint: `POST /api/v1/auth/reset-password` - Restablece con token
- Token de uso único válido por 24 horas
- Envío de email con instrucciones
- No revela existencia de cuentas por seguridad

#### Requisitos de Contraseña

- Mínimo 8 caracteres, máximo 50
- Al menos una mayúscula (A-Z)
- Al menos una minúscula (a-z)
- Al menos un número (0-9)
- Al menos un carácter especial (@$!%\*?&#)

**📖 Documentación completa:** [PASSWORD_MANAGEMENT_API.md](./docs/PASSWORD_MANAGEMENT_API.md)

### Características de Seguridad

- **Rate Limiting**: Límite de requests por IP
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para orígenes específicos
- **Validación de Entrada**: DTOs con class-validator
- **CORS**: Configurado para frontend específico
- **Password Hashing**: Bcrypt con 12 rounds de salt
- **Token Seguro**: Generación criptográfica aleatoria

---

## 🌐 Endpoints Principales

| Método   | Endpoint                       | Descripción               | Autenticación |
| -------- | ------------------------------ | ------------------------- | ------------- |
| `POST`   | `/api/v1/auth/register`        | Registro de usuarios      | ❌            |
| `POST`   | `/api/v1/auth/login`           | Login de usuarios         | ❌            |
| `GET`    | `/api/v1/auth/profile`         | Perfil del usuario        | ✅            |
| `PATCH`  | `/api/v1/auth/profile`         | Actualizar perfil         | ✅            |
| `PATCH`  | `/api/v1/auth/change-password` | Cambiar contraseña        | ✅            |
| `POST`   | `/api/v1/auth/forgot-password` | Solicitar recuperación    | ❌            |
| `POST`   | `/api/v1/auth/reset-password`  | Restablecer con token     | ❌            |
| `GET`    | `/users`                       | Lista de usuarios         | ✅            |
| `PATCH`  | `/users/:id`                   | Actualizar usuario        | ✅            |
| `DELETE` | `/users/:id`                   | Eliminar usuario          | ✅            |
| `GET`    | `/api/v1/catalogs/all`         | Todos los catálogos       | ❌            |
| `GET`    | `/api/v1/catalogs/{type}`      | Catálogo específico       | ❌            |
| `GET`    | `/participants/by-user/:id`    | Participantes por usuario | ✅            |
| `GET`    | `/cases/by-user/:id`           | Casos por usuario         | ✅            |

---

## 👥 Módulo de Usuarios

### Funcionalidades

El módulo de usuarios maneja el ciclo completo de vida de los profesionales que utilizan el sistema:

**📝 Nota Importante**: La **creación de usuarios** se realiza exclusivamente a través del endpoint `/api/v1/auth/register` (proceso de registro). El módulo de usuarios se enfoca en operaciones administrativas posteriores al registro.

#### Características del Usuario

- **Información Personal**: Nombres, apellidos, email, teléfono
- **Información Profesional**: Cargo, organización
- **Datos de Identificación**: Documento, dirección, ciudad, fecha de nacimiento
- **Redes Sociales**: Facebook, Twitter, Instagram, LinkedIn, GitHub
- **Control de Estado**: ACTIVE, INACTIVE, SUSPENDED, DELETED
- **Auditoría**: Timestamps de creación y actualización
- **Actualización de Perfil**: Endpoint dedicado para que usuarios actualicen su información

#### Proceso Separado de Usuario

1. **Registro** → `/api/v1/auth/register` (Solo crea usuario, sin autenticación automática)
2. **Autenticación** → `/api/v1/auth/login` (Login posterior al registro)
3. **Gestión** → `/users/*` endpoints (Operaciones administrativas)

#### Validaciones Implementadas

- **Email único** en el sistema
- **Teléfono único** (si se proporciona)
- **Longitud mínima** para nombres (2 caracteres)
- **Contraseña segura** (mínimo 8 caracteres)
- **Fecha de nacimiento** válida

---

## 📈 Estado del Proyecto

- ✅ **Autenticación JWT**: Completado y funcional
- ✅ **Gestión de Contraseñas**: Cambio y recuperación implementados
- ✅ **Actualización de Perfil**: Endpoint con redes sociales implementado
- ✅ **Gestión de Usuarios**: CRUD completo implementado con validación de estado
- ✅ **Catálogos de Datos**: 15 catálogos implementados
- ✅ **Base de Datos**: MySQL con Docker configurado y optimizado
- ✅ **Seguridad**: Rate limiting, helmet, compresión implementados
- ✅ **Logging y Monitoreo**: Interceptores personalizados funcionando
- ✅ **Configuración Centralizada**: ConfigService con variables de entorno
- ✅ **Manejo de Errores**: Filtros globales de excepciones
- ✅ **Validación TypeScript**: Sin errores de compilación o linting
- ✅ **Sistema de Emails**: MailerService con templates Handlebars
- ✅ **Participantes por Usuario**: Endpoint implementado
- ✅ **Casos por Usuario**: Endpoint implementado
- ❌ **Módulo de Participantes**: Temporalmente deshabilitado por conflictos de tipo

---

## 📚 Documentación Adicional

La documentación técnica completa está disponible en:

- [🔐 Módulo de Autenticación](./docs/auth-module.md)
- [🔑 Gestión de Contraseñas](./docs/PASSWORD_MANAGEMENT_API.md) - **NUEVO**
- [📝 Resumen de Implementación](./docs/PASSWORD_IMPLEMENTATION_SUMMARY.md) - **NUEVO**
- [👥 Módulo de Usuarios](./docs/users-module.md)
- [📊 Módulo de Catálogos](./docs/catalogs-module.md)
- [👤 Módulo de Participantes](./docs/participants-module.md)
- [📋 Módulo de Casos](./docs/cases-module.md)
- [🔧 Módulo Common](./docs/common-module.md)

### Documentación Swagger/OpenAPI

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva en:

- **URL**: http://localhost:3000/api
- **JSON**: http://localhost:3000/api-json

---

## 🐳 Docker

### Desarrollo con Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### Configuración Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: oots
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

---

## 🚀 Despliegue en Producción

### Despliegue en Render

Este proyecto está configurado para desplegarse fácilmente en [Render](https://render.com) con GitHub.

**Guía completa de despliegue manual:**
👉 Ver [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md)

#### Resumen rápido

1. **Conectar repositorio de GitHub** a Render
2. **Configurar Web Service:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Environment: Node
3. **Configurar variables de entorno** (ver `.env.render.example`)
4. **Base de datos MySQL:** Usar Railway o PlanetScale (Render no ofrece MySQL gratis)

#### Archivos de configuración incluidos

- `render.yaml` - Configuración IaC de servicios
- `build.sh` - Script de build optimizado
- `.env.render.example` - Plantilla de variables de entorno para producción
- `DEPLOYMENT_RENDER.md` - Guía paso a paso completa

#### Plan Free vs Paid

| Feature                | Free      | Starter ($7/mo)   |
| ---------------------- | --------- | ----------------- |
| Uptime                 | 750h/mes  | Ilimitado         |
| Sleep tras inactividad | ✅ 15 min | ❌ Siempre activo |
| Custom Domain          | ✅        | ✅                |
| SSL automático         | ✅        | ✅                |

### Otras Plataformas

- **Railway**: Configuración similar a Render
- **Heroku**: Usar buildpack de Node.js
- **AWS**: EC2 con PM2 o ECS con Docker
- **DigitalOcean**: App Platform o Droplet con PM2

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para despliegue on-premise/VPS.

---

## 🧪 Testing

### Configuración de Pruebas

- **Framework**: Jest
- **Supertest**: Para pruebas e2e
- **Test DB**: Base de datos separada para testing

### Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm test

# Pruebas en modo watch
npm run test:watch

# Pruebas e2e
npm run test:e2e

# Cobertura de código
npm run test:cov
```

---

## 🔧 Scripts Disponibles

```bash
npm run start           # Producción
npm run start:dev       # Desarrollo con hot-reload
npm run start:debug     # Modo debug
npm run build           # Compilar para producción
npm run test            # Ejecutar pruebas
npm run test:e2e        # Pruebas end-to-end
npm run lint            # Linting con ESLint
npm run format          # Formatear código con Prettier
```

---

## 🌍 Variables de Entorno

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=rootpassword
DB_DATABASE=oots

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=development

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### Estándares de Código

- **ESLint**: Configuración estricta
- **Prettier**: Formateo automático
- **TypeScript**: Strict mode habilitado
- **Convenciones**: Camel case para variables, Pascal case para clases

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Contacto

- **Desarrollador**: Taylor Asprilla
- **Email**: [taylor.asprilla@email.com](mailto:taylor.asprilla@email.com)
- **GitHub**: [@TaylorAsprilla](https://github.com/TaylorAsprilla)

---

## 🔮 Roadmap

### Próximas Funcionalidades

- [ ] **Módulo de Participantes**: Finalizar implementación completa
- [ ] **Sistema de Notificaciones**: Push notifications y emails
- [ ] **Dashboard Analytics**: Métricas y reportes avanzados
- [ ] **API de Terceros**: Integración con sistemas externos
- [ ] **Mobile API**: Endpoints optimizados para aplicaciones móviles
- [ ] **WebSockets**: Comunicación en tiempo real
- [ ] **Cron Jobs**: Tareas programadas y automatización

### Mejoras Técnicas

- [ ] **Redis**: Implementar caché distribuido
- [ ] **Elasticsearch**: Búsqueda avanzada
- [ ] **Microservicios**: Migración gradual a arquitectura distribuida
- [ ] **GraphQL**: API alternativa más flexible
- [ ] **Docker Swarm**: Orquestación de contenedores
- [ ] **CI/CD**: Pipeline automatizado con GitHub Actions

---

_Documentación actualizada - Octubre 2025_ 🚀
