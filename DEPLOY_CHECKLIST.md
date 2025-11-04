# ✅ CHECKLIST RÁPIDO - DESPLIEGUE EN RENDER

## 🎯 Pre-requisitos (5 min)

- [ ] Cuenta en Render creada y verificada
- [ ] Repositorio en GitHub actualizado (rama `desarrollo` o `main`)
- [ ] Base de datos MySQL externa lista (Railway recomendado)

---

## 📊 BASE DE DATOS RAILWAY (10 min)

### Crear Base de Datos

1. [ ] Ir a https://railway.app
2. [ ] Login con GitHub
3. [ ] Nuevo Proyecto > Provision MySQL
4. [ ] Copiar credenciales (Tab "Connect" > "TCP"):
   ```
   MYSQLHOST: ___________________________________
   MYSQLPORT: 3306
   MYSQLUSER: root
   MYSQLPASSWORD: ______________________________
   MYSQLDATABASE: railway
   ```

---

## 🌐 CREAR WEB SERVICE EN RENDER (5 min)

### Configuración Básica

1. [ ] Ir a https://dashboard.render.com
2. [ ] Click "New +" > "Web Service"
3. [ ] Conectar repositorio: `TaylorAsprilla/backendOOTS`
4. [ ] Configurar:
   - Name: `backend-oots`
   - Region: `Oregon (US West)`
   - Branch: `desarrollo`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Plan: `Free` (o `Starter` $7/mes)

---

## 🔐 VARIABLES DE ENTORNO (10 min)

### Base de Datos (Copiar de Railway)

```
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=[copiar de Railway]
DB_DATABASE=railway
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

### Aplicación

```
NODE_ENV=production
PORT=3000
APP_URL=https://backend-oots.onrender.com
FRONTEND_URL=https://tu-frontend.onrender.com
```

### JWT (Generar nuevo secreto)

```bash
# Ejecutar en terminal local para generar:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
JWT_SECRET=[pegar resultado del comando]
JWT_EXPIRES_IN=7d
```

### Email (Gmail App Password)

```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=[App Password de Google - 16 caracteres]
MAIL_FROM=noreply@tudominio.com
```

#### Cómo obtener App Password de Google:

1. [ ] Activar verificación en 2 pasos en Google
2. [ ] Ir a: https://myaccount.google.com/apppasswords
3. [ ] Crear "App Password" para "Mail"
4. [ ] Copiar password (16 caracteres, sin espacios)

### CORS

```
CORS_ORIGIN=https://tu-frontend.onrender.com
```

---

## 🚀 DESPLEGAR (Auto - 5 min)

1. [ ] Click "Create Web Service" (abajo del formulario)
2. [ ] Esperar build (3-5 minutos)
3. [ ] Verificar logs en tiempo real
4. [ ] Esperar estado "Live" (verde)

---

## ✅ VERIFICACIÓN POST-DEPLOY (5 min)

### 1. Health Check

```bash
# En navegador o terminal:
https://backend-oots.onrender.com/
```

- [ ] Respuesta 200 OK recibida

### 2. Swagger Documentation

```bash
https://backend-oots.onrender.com/api/docs
```

- [ ] Documentación carga correctamente
- [ ] Se ven todos los endpoints

### 3. Endpoint de Test

```bash
curl https://backend-oots.onrender.com/api/v1/catalogs/all
```

- [ ] JSON con catálogos recibido

### 4. Base de Datos

En Railway Dashboard:

- [ ] Ver que hay conexiones activas
- [ ] Tablas creadas (si `DB_SYNCHRONIZE=true` temporal)

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Problema: Build falla

- [ ] Revisar logs de Render
- [ ] Verificar que `package.json` tiene `"build": "nest build"`
- [ ] Probar build local: `npm install && npm run build`

### Problema: "Application failed to start"

- [ ] Verificar que `main.ts` usa `process.env.PORT`
- [ ] Revisar logs para error específico
- [ ] Verificar todas las variables de entorno están configuradas

### Problema: "Database connection refused"

- [ ] Copiar bien las credenciales de Railway
- [ ] Verificar que Railway DB está activo
- [ ] Ping a host: `ping containers-us-west-xxx.railway.app`

### Problema: Service Unavailable (503)

- [ ] Esperar 60 segundos (plan Free se despierta)
- [ ] Refrescar página
- [ ] Considerar upgrade a Starter

---

## 📝 NOTAS IMPORTANTES

⚠️ **Plan Free de Render:**

- Se duerme tras 15 min de inactividad
- Primer request tarda 30-60 seg en despertar
- 750 horas gratis/mes (suficiente para 1 servicio 24/7)

✅ **URLs Importantes:**

- Backend: `https://backend-oots.onrender.com`
- Swagger: `https://backend-oots.onrender.com/api/docs`
- Dashboard Render: `https://dashboard.render.com`
- Railway DB: `https://railway.app`

🔒 **Seguridad:**

- ❌ NUNCA subir `.env` con credenciales reales a Git
- ✅ Usar `DB_SYNCHRONIZE=false` en producción
- ✅ JWT_SECRET debe ser aleatorio y largo (32+ chars)
- ✅ Usar App Password de Google (no contraseña normal)

---

## 🎉 ¡LISTO!

Si completaste todos los checks, tu aplicación está desplegada.

**URL de producción:**

```
https://backend-oots.onrender.com
```

**Próximos pasos:**

1. [ ] Configurar dominio personalizado (opcional)
2. [ ] Configurar alertas en Render
3. [ ] Integrar frontend con nueva URL
4. [ ] Configurar backups de Railway DB
5. [ ] Monitorear métricas en Dashboard

---

**Tiempo total estimado:** 40-50 minutos

**Documentación completa:** Ver `DEPLOYMENT_RENDER.md`

---

Fecha: 2025-11-04
Versión: 1.0
