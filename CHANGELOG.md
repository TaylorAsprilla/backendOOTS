# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [1.2.0] - 2024-11-17

### Añadido

#### Campos de Dirección Extendida en Participantes

- Campo `state` (estado/departamento) añadido a la entidad Participant (VARCHAR 50, nullable)
- Campo `zipCode` (código postal) añadido a la entidad Participant (VARCHAR 20, nullable)
- Validaciones correspondientes en `CreateParticipantDto` con decoradores de class-validator
- Documentación Swagger automática para los nuevos campos
- Migración SQL: `migrations/add-state-zipcode-to-participants.sql`

#### Actualización de Perfil con Redes Sociales

- Nuevo endpoint `PATCH /api/v1/auth/profile` para actualización de perfil de usuario autenticado
- Campos de redes sociales añadidos a la entidad User:
  - Facebook
  - Twitter/X
  - Instagram
  - LinkedIn
  - GitHub
- DTO `UpdateProfileDto` con validaciones de URL para cada red social
- Validación de unicidad para email y teléfono al actualizar
- Registro de auditoría completo de cambios en perfil
- Actualización parcial (solo campos proporcionados se modifican)
- Documentación Swagger completa del endpoint
- Migración SQL: `migrations/add-social-media-fields.sql`

#### Mejoras en Documentación

- Documentación consolidada de gestión de contraseñas en `PASSWORD_MANAGEMENT_API.md`
- Actualizado `README.md` con información de actualización de perfil
- Creado `CHANGELOG.md` para seguimiento de versiones
- Actualizado `docs/README.md` con referencias actualizadas
- Eliminados archivos de documentación duplicados

### Modificado

- Entidad `User` expandida con 5 nuevos campos de redes sociales (VARCHAR 255, nullable)
- `AuthService.updateProfile()` implementado con validaciones de unicidad y auditoría
- `AuthController` con nuevo endpoint de perfil protegido por JWT

### Eliminado

- `QUICK_REFERENCE_PASSWORD.md` (contenido integrado en documentación principal)
- `docs/PASSWORD_IMPLEMENTATION_SUMMARY.md` (información duplicada)
- `CORS_FIX.md` (fix implementado y documentado en código)

---

## [1.1.0] - 2024-11-15

### Añadido

#### Sistema de Gestión de Contraseñas

- Endpoint `PATCH /api/v1/auth/change-password` para cambio de contraseña (usuarios autenticados)
- Endpoint `POST /api/v1/auth/forgot-password` para solicitar recuperación
- Endpoint `POST /api/v1/auth/reset-password` para restablecer con token

#### DTOs de Contraseñas

- `ChangePasswordDto` - Cambio de contraseña con validación de contraseña actual
- `ForgotPasswordDto` - Solicitud de recuperación con email
- `ResetPasswordDto` - Restablecimiento con token y nueva contraseña

#### Seguridad de Contraseñas

- Validación de complejidad de contraseñas (mayúsculas, minúsculas, números, caracteres especiales)
- Longitud mínima 8 caracteres, máxima 50
- Tokens de recuperación de 32 bytes aleatorios
- Expiración de tokens de 24 horas
- Hash bcrypt con 12 rondas de salt

#### Base de Datos

- Campos añadidos a tabla `users`:
  - `password_reset_token` (VARCHAR 255, nullable)
  - `password_reset_expires` (DATETIME, nullable)
- Índice creado en `password_reset_token`
- Migración SQL: `migrations/add-password-reset-fields.sql`

#### Documentación

- Documentación completa en `docs/PASSWORD_MANAGEMENT_API.md`
- Ejemplos de uso con cURL y JavaScript
- Guías de integración frontend
- Checklist de deployment

### Modificado

- `User` entity con campos de reset de contraseña
- `AuthService` con tres nuevos métodos:
  - `changePassword()` - Validación y actualización de contraseña
  - `forgotPassword()` - Generación de token y envío de email
  - `resetPassword()` - Validación de token y restablecimiento
- `AuthController` con endpoints de gestión de contraseñas
- Configuración `nest-cli.json` para copiar templates `.hbs` al build

### Seguridad

- No se revela existencia de cuentas en recuperación de contraseña
- Tokens de un solo uso
- Validación de expiración de tokens
- Logs de auditoría para cambios de contraseña

---

## [1.0.0] - 2024-11-01

### Añadido

#### Módulos del Sistema

- **Módulo de Autenticación**: JWT, registro, login
- **Módulo de Usuarios**: CRUD completo con soft delete
- **Módulo de Catálogos**: 15 catálogos de datos maestros
- **Módulo de Casos**: Gestión de casos médicos (en desarrollo)

#### Infraestructura

- Configuración Docker con MySQL 8.0
- TypeORM con sincronización automática
- Sistema de validación global con class-validator
- Filtros de excepciones personalizados
- Interceptores de logging
- Rate limiting con @nestjs/throttler
- CORS configurado para orígenes específicos
- Helmet para seguridad HTTP

#### Sistema de Emails

- MailerService con Nodemailer
- Templates Handlebars para emails
- Email de bienvenida al registrar usuario
- Template de recuperación de contraseña

#### Base de Datos

- Esquema completo con TypeORM
- Relaciones entre entidades
- Índices optimizados
- Soft delete en usuarios
- Enums para estados y tipos

#### Documentación

- README completo con instalación y uso
- Swagger/OpenAPI en `/api/docs`
- Documentación de módulos individuales
- Ejemplos de uso con cURL
- Guías de deployment

#### Testing

- Configuración Jest
- Tests e2e básicos
- Configuración de coverage

### Seguridad

- Autenticación JWT con Passport
- Hash de contraseñas con bcrypt (12 rounds)
- Validación de DTOs
- Guards de autorización
- Rate limiting
- CORS restrictivo
- Helmet headers

---

## Tipos de Cambios

- **Añadido** - para nuevas funcionalidades
- **Modificado** - para cambios en funcionalidad existente
- **Obsoleto** - para funcionalidades que pronto se eliminarán
- **Eliminado** - para funcionalidades eliminadas
- **Corregido** - para corrección de bugs
- **Seguridad** - en caso de vulnerabilidades

---

## Roadmap

### [1.3.0] - Próxima versión

- [ ] Módulo de Participantes completo
- [ ] Sistema de notificaciones en tiempo real
- [ ] Dashboard de reportes y analíticas
- [ ] Integración con servicios externos
- [ ] Tests unitarios completos (>80% coverage)

### [2.0.0] - Futuro

- [ ] Migración a microservicios
- [ ] GraphQL API
- [ ] WebSockets para comunicación en tiempo real
- [ ] Sistema de caché con Redis
- [ ] Búsqueda avanzada con Elasticsearch
- [ ] API de terceros documentada

---

**Nota**: Las fechas en este changelog son ilustrativas. Para fechas exactas de releases, consultar los tags de Git.
