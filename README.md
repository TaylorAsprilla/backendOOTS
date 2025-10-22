# 🏥 OOTS Colombia - Backend API

> **API REST completa para gestión de participantes en programas sociales y de salud mental desarrollada con NestJS, TypeORM y MySQL.**

## 📋 Descripción General

OOTS Colombia Backend es una API robusta diseñada para gestionar participantes en programas de atención psicosocial y salud mental. El sistema proporciona funcionalidades completas de autenticación, gestión de usuarios, catálogos de datos y registro detallado de participantes con sus historiales médicos y planes de intervención.

## 🚀 Tecnologías Principales

- **Framework**: [NestJS](https://nestjs.com/) v11.0.1
- **Base de Datos**: MySQL 8.0 con [TypeORM](https://typeorm.io/) v0.3.27
- **Autenticación**: JWT con [Passport](http://www.passportjs.org/)
- **Validación**: [class-validator](https://github.com/typestack/class-validator) & [class-transformer](https://github.com/typestack/class-transformer)
- **Documentación**: [Swagger/OpenAPI](https://swagger.io/)
- **Contenedores**: [Docker](https://www.docker.com/) & Docker Compose

## 🏗️ Arquitectura del Sistema

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

La API estará disponible en: `http://localhost:3000`

### 🐳 Configuración con Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs del contenedor
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📊 Módulos Principales

### 🔐 Autenticación (Auth)

- Registro de usuarios con validaciones robustas
- Login con JWT tokens
- Protección de rutas con Guards
- Gestión de sesiones y tokens de acceso

### 👥 Gestión de Usuarios (Users)

- CRUD completo de usuarios
- Soft delete con restauración
- Validaciones de unicidad (email, teléfono)
- Perfiles de usuario con información detallada

### 📚 Catálogos (Common)

- 15+ catálogos de datos maestros
- Tipos de documento, géneros, estados civiles
- Seguros de salud, niveles educativos
- Tipos de vivienda, fuentes de ingresos

### 🏥 Participantes (En desarrollo)

- Registro completo de participantes
- Historiales médicos y psicológicos
- Planes de intervención y seguimiento
- Notas de progreso y evaluaciones

## 🛡️ Seguridad

- **Autenticación JWT**: Tokens seguros con expiración configurable
- **Encriptación de contraseñas**: bcrypt con salt rounds configurables (12 rounds)
- **Rate Limiting**: Protección contra ataques de fuerza bruta con @nestjs/throttler
- **Middleware de Seguridad**: Helmet para headers de seguridad HTTP
- **Compresión**: Middleware de compresión para optimización de respuestas
- **Validación de entrada**: DTOs con class-validator y sanitización automática
- **Variables de entorno**: Configuraciones sensibles protegidas
- **CORS**: Configuración estricta para requests cross-origin
- **Logging**: Sistema de logs detallado con interceptores personalizados
- **Filtros de Excepción**: Manejo centralizado de errores con información sanitizada

## 📖 Documentación Detallada

Para información completa sobre endpoints, ejemplos y guías de uso, consulta la carpeta [`docs/`](./docs/):

- [🔐 Autenticación](./docs/authentication.md) - Endpoints de auth, login y registro
- [👥 Usuarios](./docs/users.md) - Gestión completa de usuarios
- [📚 Catálogos](./docs/catalogs.md) - Datos maestros y configuraciones
- [🗄️ Base de Datos](./docs/database.md) - Esquemas y relaciones
- [📝 Ejemplos](./docs/examples/) - Peticiones y respuestas completas

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Servidor en modo desarrollo con hot-reload
npm run start:debug        # Servidor en modo debug

# Producción
npm run build              # Compilar proyecto
npm run start:prod         # Ejecutar versión compilada

# Testing
npm run test               # Ejecutar tests unitarios
npm run test:watch         # Tests en modo watch
npm run test:e2e           # Tests end-to-end
npm run test:cov           # Coverage de tests

# Calidad de código
npm run lint               # ESLint con auto-fix
npm run format             # Prettier formatting
```

## 🌐 Endpoints Principales

| Método | Endpoint                  | Descripción          | Autenticación |
| ------ | ------------------------- | -------------------- | ------------- |
| `POST` | `/api/v1/auth/register`   | Registro de usuarios | ❌            |
| `POST` | `/api/v1/auth/login`      | Login de usuarios    | ❌            |
| `GET`  | `/api/v1/auth/profile`    | Perfil del usuario   | ✅            |
| `GET`  | `/users`                  | Lista de usuarios    | ❌            |
| `POST` | `/users`                  | Crear usuario        | ❌            |
| `GET`  | `/api/v1/catalogs/all`    | Todos los catálogos  | ❌            |
| `GET`  | `/api/v1/catalogs/{type}` | Catálogo específico  | ❌            |

## 📈 Estado del Proyecto

- ✅ **Autenticación JWT**: Completado y funcional
- ✅ **Gestión de Usuarios**: CRUD completo implementado con validación de estado
- ✅ **Catálogos de Datos**: 15 catálogos implementados
- ✅ **Base de Datos**: MySQL con Docker configurado y optimizado
- ✅ **Seguridad**: Rate limiting, helmet, compresión implementados
- ✅ **Logging y Monitoreo**: Interceptores personalizados funcionando
- ✅ **Configuración Centralizada**: ConfigService con variables de entorno
- ✅ **Manejo de Errores**: Filtros globales de excepciones
- ✅ **Validación TypeScript**: Sin errores de compilación o linting
- ❌ **Módulo de Participantes**: Temporalmente deshabilitado por conflictos de tipo
- 🚧 **Documentación Swagger**: Configurado básicamente
- ⏳ **Tests Unitarios**: Pendiente
- ⏳ **Tests E2E**: Pendiente

## 🤝 Contribución

1. Fork del proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario. Todos los derechos reservados.

## 🆘 Soporte

Para soporte técnico o consultas:

- **Desarrollador**: Taylor Asprilla
- **Email**: [taylor.asprilla@example.com]
- **Issues**: [GitHub Issues](https://github.com/TaylorAsprilla/backendOOTS/issues)

---

## 🔗 Enlaces Útiles

- [Documentación de NestJS](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [JWT.io](https://jwt.io/)
- [Docker Documentation](https://docs.docker.com/)

---

<div align="center">
  <p><strong>Desarrollado con ❤️ por Taylor Asprilla</strong></p>
  <p><em>Sistema OOTS Colombia - Gestión Integral de Participantes</em></p>
</div>
