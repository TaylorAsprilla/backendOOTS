# 🚀 Despliegue Manual en Render

Esta guía te llevará paso a paso para desplegar **backend-oots** en Render de forma manual usando GitHub.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Preparación del Repositorio](#preparación-del-repositorio)
3. [Configurar Base de Datos MySQL Externa](#configurar-base-de-datos-mysql-externa)
4. [Crear Web Service en Render](#crear-web-service-en-render)
5. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
6. [Desplegar la Aplicación](#desplegar-la-aplicación)
7. [Verificación Post-Despliegue](#verificación-post-despliegue)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

### 1. Cuenta en Render

- ✅ Crear cuenta gratuita en [render.com](https://render.com)
- ✅ Verificar email
- ✅ Conectar cuenta de GitHub

### 2. Base de Datos MySQL

**⚠️ Importante:** Render **NO ofrece MySQL gratuito** (solo PostgreSQL).

**Opciones recomendadas:**

- 🎯 **Railway** (recomendado) - 500 horas gratis/mes
- **PlanetScale** - Plan gratuito disponible
- **AWS RDS** - Free tier 12 meses
- **Render PostgreSQL** (requiere cambiar TypeORM a PostgreSQL)

### 3. Repositorio Git

- ✅ Código en GitHub (público o privado)
- ✅ Rama principal lista (`main` o `desarrollo`)

---

## 🔧 Preparación del Repositorio

### 1. Verificar Archivos Necesarios

Asegúrate de que estos archivos estén en tu repositorio:

```bash
backend-oots/
├── package.json          # ✅ Con scripts build y start:prod
├── tsconfig.json         # ✅ Configuración TypeScript
├── nest-cli.json         # ✅ Configuración NestJS
├── .env.render.example   # ✅ Plantilla de variables (NO subir .env real)
├── build.sh              # ✅ Script de build para Render
└── src/
    └── main.ts           # ✅ Puerto configurable con process.env.PORT
```

### 2. Verificar `src/main.ts`

Asegúrate de que el puerto sea configurable:

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ IMPORTANTE: Render asigna PORT dinámicamente
  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 Application running on: ${await app.getUrl()}`);
}
```

### 3. Hacer Push al Repositorio

```bash
git add .
git commit -m "feat: Add Render deployment configuration"
git push origin main  # o 'desarrollo' según tu rama
```

---

## 🗄️ Configurar Base de Datos MySQL Externa

### Opción 1: Railway (Recomendado)

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Conecta con GitHub

2. **Crear nuevo proyecto MySQL**

   ```
   Dashboard > New Project > Provision MySQL
   ```

3. **Obtener credenciales**
   - Click en MySQL service
   - Tab "Connect" > "TCP"
   - Copiar:
     - `MYSQLHOST`: `containers-us-west-xxx.railway.app`
     - `MYSQLPORT`: `3306`
     - `MYSQLUSER`: `root`
     - `MYSQLPASSWORD`: `***********`
     - `MYSQLDATABASE`: `railway`

4. **Crear base de datos inicial (opcional)**
   ```
   Dashboard > MySQL > Data > Query
   ```
   ```sql
   CREATE DATABASE backend_oots_prod;
   USE backend_oots_prod;
   ```

### Opción 2: PlanetScale

1. Crear cuenta en [planetscale.com](https://planetscale.com)
2. Create New Database > `backend-oots-prod`
3. Get connection string
4. Copiar credenciales

---

## 🌐 Crear Web Service en Render

### Paso 1: Nuevo Web Service

1. **Ir al Dashboard de Render**
   - [https://dashboard.render.com](https://dashboard.render.com)

2. **Click en "New +"** (esquina superior derecha)
   - Seleccionar: **"Web Service"**

### Paso 2: Conectar Repositorio

1. **Connect a repository**
   - Si es la primera vez, autorizar GitHub
   - Buscar: `TaylorAsprilla/backendOOTS`
   - Click **"Connect"**

### Paso 3: Configuración Básica

Llenar el formulario con estos valores:

| Campo              | Valor                                   |
| ------------------ | --------------------------------------- |
| **Name**           | `backend-oots`                          |
| **Region**         | `Oregon (US West)` (o más cercano a ti) |
| **Branch**         | `desarrollo` (o `main`)                 |
| **Root Directory** | _(dejar vacío)_                         |
| **Environment**    | `Node`                                  |
| **Build Command**  | `npm install && npm run build`          |
| **Start Command**  | `npm run start:prod`                    |

### Paso 4: Seleccionar Plan

- **Plan:** `Free` (0 USD/mes)
  - 750 horas gratis/mes
  - Se duerme después de 15 min de inactividad
  - Ideal para desarrollo/staging

- **Plan:** `Starter` (7 USD/mes)
  - Siempre activo
  - Mejor para producción

---

## 🔐 Configurar Variables de Entorno

### Paso 1: Acceder a Environment

En la página de configuración del servicio:

- Sección: **"Environment"**
- Click en **"Add Environment Variable"**

### Paso 2: Agregar Variables Obligatorias

#### 🗄️ Base de Datos

```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password_de_railway
DB_DATABASE=backend_oots_prod
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

> ⚠️ **IMPORTANTE:** `DB_SYNCHRONIZE=false` en producción (evita pérdida de datos)

#### 🚀 Aplicación

```env
NODE_ENV=production
PORT=3000
APP_URL=https://backend-oots.onrender.com
FRONTEND_URL=https://tu-frontend.onrender.com
```

> 📝 **Nota:** Render asigna `PORT` automáticamente, pero puedes especificar 3000

#### 🔑 JWT

```env
JWT_SECRET=generar_secreto_seguro_aqui_min_32_caracteres
JWT_EXPIRES_IN=7d
```

**Generar JWT_SECRET seguro:**

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -hex 32

# Opción 3: Online
# https://www.lastpass.com/features/password-generator
```

#### 📧 Email (Gmail)

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu_app_password_de_google
MAIL_FROM=noreply@tudominio.com
```

> 🔐 **App Password de Google:**
>
> 1. Activar 2FA en tu cuenta Google
> 2. Ir a: https://myaccount.google.com/apppasswords
> 3. Crear "App Password" para "Mail"
> 4. Copiar el password generado (16 caracteres)

#### 🛡️ CORS

```env
CORS_ORIGIN=https://tu-frontend.onrender.com
```

> 💡 Múltiples orígenes: `https://app1.com,https://app2.com`

### Paso 3: Verificar Variables

Total de variables configuradas: **~15**

```
✅ DB_HOST
✅ DB_PORT
✅ DB_USERNAME
✅ DB_PASSWORD
✅ DB_DATABASE
✅ DB_SYNCHRONIZE
✅ NODE_ENV
✅ APP_URL
✅ FRONTEND_URL
✅ JWT_SECRET
✅ JWT_EXPIRES_IN
✅ MAIL_HOST
✅ MAIL_PORT
✅ MAIL_USER
✅ MAIL_PASSWORD
✅ MAIL_FROM
✅ CORS_ORIGIN
```

---

## 🎯 Desplegar la Aplicación

### Paso 1: Guardar y Desplegar

1. **Scroll hasta el final del formulario**
2. **Click en "Create Web Service"**

Render iniciará automáticamente:

- ✅ Clonando repositorio
- ✅ Instalando dependencias (`npm install`)
- ✅ Compilando TypeScript (`npm run build`)
- ✅ Iniciando aplicación (`npm run start:prod`)

### Paso 2: Monitorear Deploy

En la página del servicio:

- **Logs:** Ver logs en tiempo real
- **Estado:** Esperando que cambie a `Live` (verde)

**Tiempo estimado:** 3-5 minutos

### Paso 3: Verificar Logs

Busca en los logs:

```
✅ "Listening on port 3000"
✅ "Connected to database"
✅ "Application successfully started"
```

---

## ✅ Verificación Post-Despliegue

### 1. Health Check

```bash
# Obtener tu URL de Render
curl https://backend-oots.onrender.com/
```

**Respuesta esperada:**

```json
{
  "message": "Welcome to backend-oots API",
  "status": "ok"
}
```

### 2. Verificar Endpoints

```bash
# Swagger Documentation
https://backend-oots.onrender.com/api

# Health check (si configuraste uno)
https://backend-oots.onrender.com/health
```

### 3. Probar Autenticación

```bash
curl -X POST https://backend-oots.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Verificar Base de Datos

Desde Railway o PlanetScale:

- Verificar que las tablas se crearon (si usas sincronización)
- Hacer query de prueba

---

## 🐛 Troubleshooting

### Problema 1: Build Falla

**Error:** `npm install failed`

**Solución:**

```bash
# Verificar package.json localmente
npm install
npm run build

# Si funciona local, revisar logs de Render
# Buscar errores específicos de dependencias
```

### Problema 2: "Application Failed to Start"

**Causas comunes:**

1. **Puerto incorrecto**

   ```typescript
   // ❌ MAL
   await app.listen(3000);

   // ✅ BIEN
   await app.listen(process.env.PORT || 3000);
   ```

2. **Variables de entorno faltantes**
   - Verificar que todas las vars obligatorias están configuradas

3. **Error de conexión a BD**
   ```
   Error: connect ETIMEDOUT
   ```

   - Verificar credenciales de Railway/PlanetScale
   - Verificar que Railway permite conexiones externas

### Problema 3: "Service Unavailable"

**Causa:** Servicio en plan Free se durmió

**Solución:**

- Esperar 30-60 segundos (primer request despierta el servicio)
- Considerar upgrade a Starter plan ($7/mes)

### Problema 4: Variables de Entorno No se Aplican

**Solución:**

1. Dashboard > Service > Environment
2. Editar variable
3. **"Save Changes"**
4. Render redespliega automáticamente

### Problema 5: Database Connection Refused

**Solución Railway:**

```bash
# Verificar que Railway DB está activo
# Dashboard > MySQL > Settings > TCP Proxy debe estar ON
```

### Problema 6: Build es Muy Lento

**Optimización:**

```json
// package.json
{
  "scripts": {
    "build": "nest build --webpack" // Más rápido
  }
}
```

---

## 🔄 Actualizaciones Automáticas

### Configurar Auto-Deploy

Por defecto, Render autodespliega en cada push a la rama conectada.

**Deshabilitar auto-deploy:**

1. Dashboard > Service > Settings
2. **Build & Deploy** section
3. Toggle **"Auto-Deploy"** OFF

**Despliegue manual:**

```bash
git push origin main  # Push código

# En Render Dashboard
Service > Manual Deploy > "Clear build cache & deploy"
```

---

## 🎛️ Configuraciones Avanzadas

### Health Check Personalizado

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

**Configurar en Render:**

- Settings > Health & Alerts
- Health Check Path: `/health`

### Custom Domain

1. **Settings > Custom Domains**
2. Add Custom Domain: `api.tudominio.com`
3. Configurar DNS:
   ```
   Type: CNAME
   Name: api
   Value: backend-oots.onrender.com
   ```

### Logs Persistentes

- Render guarda logs por 7 días en plan Free
- Para logs permanentes: integrar con Datadog, Sentry, LogDNA

---

## 📊 Monitoreo

### Métricas en Render

Dashboard > Service > Metrics:

- **CPU Usage**
- **Memory Usage**
- **Response Times**
- **Request Count**

### Alertas

Settings > Health & Alerts:

- Email cuando servicio cae
- Webhook para Slack/Discord

---

## 💰 Costos

### Plan Free

- ✅ 750 horas/mes gratis
- ✅ Suficiente para 1 servicio 24/7
- ⚠️ Se duerme tras 15 min inactividad
- ⚠️ Arranque lento (30-60 seg)

### Plan Starter ($7/mes)

- ✅ Siempre activo
- ✅ Sin sleep
- ✅ Mejor rendimiento

### Base de Datos

- Render MySQL: No disponible en Free
- Railway MySQL: 500 horas gratis/mes
- PlanetScale: Plan gratuito disponible

---

## 🔒 Seguridad

### Checklist de Producción

- [ ] `DB_SYNCHRONIZE=false`
- [ ] JWT_SECRET aleatorio y seguro (32+ chars)
- [ ] Variables sensibles en Environment (no en código)
- [ ] CORS configurado con orígenes específicos
- [ ] HTTPS habilitado (Render lo hace automáticamente)
- [ ] Rate limiting configurado
- [ ] Validación de inputs con class-validator
- [ ] Helmet para headers de seguridad

---

## 📚 Recursos

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **NestJS Deployment:** https://docs.nestjs.com/deployment
- **Este Repo:** https://github.com/TaylorAsprilla/backendOOTS

---

## 🆘 Soporte

**Problemas con el deploy:**

1. Revisar logs de Render
2. Verificar variables de entorno
3. Testear build localmente
4. Contactar soporte de Render: https://render.com/support

**Problemas con la aplicación:**

1. Abrir issue en GitHub
2. Incluir logs completos
3. Describir pasos para reproducir

---

## ✅ Checklist Final

### Pre-Deploy

- [ ] Repositorio en GitHub actualizado
- [ ] Variables de entorno preparadas
- [ ] Base de datos externa configurada (Railway/PlanetScale)
- [ ] JWT_SECRET generado
- [ ] Google App Password creado
- [ ] `src/main.ts` usa `process.env.PORT`

### Deploy

- [ ] Web Service creado en Render
- [ ] Todas las variables configuradas
- [ ] Build exitoso
- [ ] Servicio en estado "Live"

### Post-Deploy

- [ ] Health check responde 200 OK
- [ ] Swagger accesible en `/api`
- [ ] Login funciona correctamente
- [ ] Base de datos conectada
- [ ] Emails se envían correctamente
- [ ] Logs sin errores críticos

---

## 🎉 ¡Listo!

Tu aplicación **backend-oots** ahora está desplegada en Render.

**URL de producción:**

```
https://backend-oots.onrender.com
```

**Próximos pasos:**

1. Configurar dominio personalizado
2. Integrar CI/CD con GitHub Actions
3. Configurar monitoreo con Sentry
4. Implementar backups automáticos de BD
5. Documentar API con Swagger

---

**Última actualización:** 2025-11-04  
**Versión:** 1.0.0  
**Autor:** TaylorAsprilla
