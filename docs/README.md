# 📚 Documentación - OOTS Colombia Backend

Bienvenido a la documentación completa del backend de OOTS Colombia.

## 📖 Tabla de Contenidos

### 🚀 Inicio Rápido

- [README Principal](../README.md) - Información general y setup
- [Guía de Instalación](#instalación)
- [Configuración](#configuración)

### 📘 Guías por Módulo

1. [Autenticación](./authentication.md) - Sistema de login y JWT
2. [Usuarios](./users.md) - Gestión de usuarios del sistema
3. [Catálogos](./catalogs.md) - Datos maestros y configuración
4. [Casos](./cases.md) - Gestión de casos y seguimiento
5. [Base de Datos](./database.md) - Estructura y migraciones

### 💡 Ejemplos Prácticos

- [Ejemplos de Uso](./examples/README.md) - Casos de uso completos
- [Ejemplos de Autenticación](./examples/auth-examples.md)
- [Ejemplos de Usuarios](./examples/user-examples.md)
- [Ejemplos de Catálogos](./examples/catalog-examples.md)

### 🚀 Despliegue

- [Despliegue en Render](./deployment/render.md) - Guía completa
- [Configuración de Producción](./deployment/production.md)
- [Variables de Entorno](./deployment/environment.md)

### 🔧 Desarrollo

- [Arquitectura del Sistema](./architecture.md)
- [Guía de Contribución](./contributing.md)
- [Estándares de Código](./code-standards.md)

---

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18.x
- MySQL 8.0+
- npm >= 9.x

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/TaylorAsprilla/backendOOTS.git
cd backend-oots

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar base de datos (Docker)
docker-compose up -d

# 5. Ejecutar en desarrollo
npm run start:dev
```

---

## ⚙️ Configuración

### Variables de Entorno Esenciales

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=rootpassword
DB_DATABASE=oots_db
DB_SYNCHRONIZE=true  # Solo en desarrollo

# JWT
JWT_SECRET=tu_secret_super_seguro
JWT_EXPIRES_IN=7d

# Aplicación
NODE_ENV=development
PORT=3000
```

Ver [deployment/environment.md](./deployment/environment.md) para la lista completa.

---

## 📁 Estructura del Proyecto

```
backend-oots/
├── src/
│   ├── auth/                 # Autenticación y JWT
│   ├── users/                # Gestión de usuarios
│   ├── catalogs/             # Catálogos maestros
│   ├── cases/                # Gestión de casos
│   ├── participants/         # Participantes
│   ├── common/               # Código compartido
│   ├── config/               # Configuración
│   ├── mail/                 # Sistema de emails
│   └── main.ts               # Punto de entrada
├── docs/                     # Esta documentación
├── test/                     # Pruebas
├── migrations/               # Migraciones de BD
└── docker-compose.yml        # Configuración Docker
```

---

## 🔗 Enlaces Rápidos

### Endpoints Principales

```
# Desarrollo
API Base:     http://localhost:3000/api/v1
Swagger Docs: http://localhost:3000/api/docs

# Producción
API Base:     https://backendoots.onrender.com/api/v1
Swagger Docs: https://backendoots.onrender.com/api/docs
```

### Recursos Externos

- **Repositorio:** https://github.com/TaylorAsprilla/backendOOTS
- **Producción:** https://backendoots.onrender.com
- **Frontend:** https://congregacionmitacol.org

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run start:dev          # Servidor con hot-reload
npm run build              # Compilar para producción
npm run start:prod         # Ejecutar en producción

# Testing
npm run test               # Pruebas unitarias
npm run test:e2e           # Pruebas end-to-end
npm run test:cov           # Cobertura de código

# Utilidades
npm run lint               # Verificar código
npm run format             # Formatear código
npm run generate:jwt       # Generar JWT secret
```

---

## 📊 Estado del Proyecto

### Módulos Completados ✅

- ✅ Autenticación con JWT
- ✅ Gestión de Usuarios
- ✅ Catálogos (15 tipos)
- ✅ Sistema de Email
- ✅ Validaciones globales
- ✅ Manejo de errores
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Swagger/OpenAPI

### En Desarrollo 🚧

- 🚧 Módulo de Participantes
- 🚧 Módulo de Casos
- 🚧 Sistema de Notificaciones

---

## 🆘 Soporte

### Reportar Issues

https://github.com/TaylorAsprilla/backendOOTS/issues

### Contacto

- **Desarrollador:** Taylor Asprilla
- **Email:** taylor.asprilla@example.com
- **GitHub:** @TaylorAsprilla

---

## 📄 Licencia

Este proyecto está bajo licencia MIT.

---

**Última actualización:** 2025-11-05  
**Versión:** 1.0.0
