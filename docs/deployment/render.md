# 🚀 Despliegue en Render

Guía completa para desplegar la aplicación backend-oots en Render.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Base de Datos](#configuración-de-base-de-datos)
3. [Despliegue en Render](#despliegue-en-render)
4. [Configuración de Variables](#configuración-de-variables)
5. [Verificación](#verificación)
6. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

- Cuenta en [Render](https://render.com)
- Cuenta en [Railway](https://railway.app) para MySQL
- Repositorio GitHub con el código
- Variables de entorno preparadas

---

## 🗄️ Configuración de Base de Datos

### Opción 1: Railway (Recomendado)

1. **Crear cuenta en Railway**

   ```
   https://railway.app → Login con GitHub
   ```

2. **Crear servicio MySQL**

   ```
   Dashboard → New Project → Provision MySQL
   ```

3. **Copiar credenciales**
   - Host: `containers-us-west-xxx.railway.app`
   - Port: `3306`
   - User: `root`
   - Password: `***`
   - Database: `railway`

---

## 🌐 Despliegue en Render

### Paso 1: Crear Web Service

1. Ir a [dashboard.render.com](https://dashboard.render.com)
2. Click en "New +" → "Web Service"
3. Conectar repositorio `TaylorAsprilla/backendOOTS`

### Paso 2: Configuración Básica

```
Name: backend-oots
Region: Oregon (US West)
Branch: desarrollo (o main)
Environment: Node
Build Command: npm install && npm run build
Start Command: npm run start:prod
Plan: Free (o Starter $7/mo)
```

### Paso 3: Variables de Entorno

Ver [environment.md](./environment.md) para la lista completa.

**Variables Críticas:**

```env
NODE_ENV=production
PORT=3000
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=***
DB_DATABASE=railway
DB_SYNCHRONIZE=false
JWT_SECRET=***
CORS_ORIGIN=https://congregacionmitacol.org
```

---

## ✅ Verificación

### 1. Health Check

```bash
curl https://backendoots.onrender.com/health
```

### 2. Swagger Docs

```
https://backendoots.onrender.com/api/docs
```

### 3. Test Endpoint

```bash
curl https://backendoots.onrender.com/api/v1/catalogs/all
```

---

## 🐛 Troubleshooting

### Error: "nest: not found"

**Solución:** Ya corregido. `@nestjs/cli` está en `dependencies`.

### Error: CORS

**Solución:** Configurar `CORS_ORIGIN` con el dominio del frontend.

### Error: Database Connection

**Verificar:**

- Credenciales de Railway correctas
- Railway DB está activo
- `DB_SYNCHRONIZE=false` en producción

---

## 📊 Monitoreo

- **Dashboard:** https://dashboard.render.com
- **Logs:** Real-time en dashboard
- **Métricas:** CPU, Memory, Response Times

---

**Última actualización:** 2025-11-05
