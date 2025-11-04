# 🔧 Fix CORS - Render Configuration

## ❌ Problema

```
Access to XMLHttpRequest at 'https://backendoots.onrender.com/api/v1/auth/login' 
from origin 'https://congregacionmitacol.org' has been blocked by CORS policy
```

## ✅ Solución Aplicada

### 1. Actualizado `src/main.ts`

**Mejoras:**
- ✅ Soporta `CORS_ORIGIN` y `CORS_ORIGINS` (ambas variables)
- ✅ Función dinámica de validación de origins
- ✅ Logs de origins permitidos y bloqueados
- ✅ Por defecto incluye `congregacionmitacol.org`
- ✅ Mejores headers CORS para producción
- ✅ Helmet configurado para permitir cross-origin

**Código actualizado:**
```typescript
const corsOriginEnv = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;
const corsOrigins = corsOriginEnv
  ? corsOriginEnv.split(',').map(origin => origin.trim())
  : [
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'https://congregacionmitacol.org',
      'https://www.congregacionmitacol.org',
    ];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // ... más configuración
});
```

---

## 🚀 Configurar en Render Dashboard

### Paso 1: Ir a Environment Variables

```
Dashboard > backend-oots > Environment
```

### Paso 2: Agregar/Actualizar CORS_ORIGIN

**Opción A: Un solo origen**
```
Key: CORS_ORIGIN
Value: https://congregacionmitacol.org
```

**Opción B: Múltiples orígenes (Recomendado)**
```
Key: CORS_ORIGIN
Value: https://congregacionmitacol.org,https://www.congregacionmitacol.org
```

**Nota:** Separar con coma (`,`) sin espacios. Si hay espacios, el código los elimina automáticamente.

### Paso 3: Save Changes

Render redesplegará automáticamente (~2-3 minutos).

---

## 🧪 Testing

### 1. Verificar que CORS está configurado

Después del deploy, revisa los logs en Render:

```
🌐 CORS enabled for origins: [
  'https://congregacionmitacol.org',
  'https://www.congregacionmitacol.org'
]
```

### 2. Test desde tu Frontend

```javascript
// En tu aplicación Angular
fetch('https://backendoots.onrender.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }),
  credentials: 'include' // Si usas cookies
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

### 3. Test con curl (simulando preflight)

```bash
# OPTIONS request (preflight)
curl -X OPTIONS https://backendoots.onrender.com/api/v1/auth/login \
  -H "Origin: https://congregacionmitacol.org" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v

# Debe responder con:
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: https://congregacionmitacol.org
# Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
# Access-Control-Allow-Credentials: true
```

---

## 📋 Valores Recomendados para CORS_ORIGIN

### Producción
```env
CORS_ORIGIN=https://congregacionmitacol.org,https://www.congregacionmitacol.org
```

### Si tienes múltiples dominios
```env
CORS_ORIGIN=https://congregacionmitacol.org,https://www.congregacionmitacol.org,https://app.congregacionmitacol.org
```

### Desarrollo + Producción (NO recomendado)
```env
CORS_ORIGIN=http://localhost:4200,https://congregacionmitacol.org
```

---

## 🔐 Consideraciones de Seguridad

### ✅ Correcto
- Lista específica de dominios permitidos
- HTTPS en producción
- `credentials: true` solo si usas cookies/auth

### ❌ Evitar en Producción
```typescript
// ❌ NO HACER ESTO EN PRODUCCIÓN
app.enableCors({
  origin: '*', // Permite CUALQUIER origen
});
```

---

## 🐛 Troubleshooting

### Error persiste después del deploy

**1. Verificar variable en Render:**
```bash
# En Render Dashboard > Environment
# Debe existir: CORS_ORIGIN
```

**2. Verificar logs de Render:**
```bash
# Buscar en logs:
🌐 CORS enabled for origins: [...]
```

**3. Verificar que el frontend usa HTTPS:**
```javascript
// ❌ MAL (mixed content)
fetch('http://backendoots.onrender.com/...')

// ✅ BIEN
fetch('https://backendoots.onrender.com/...')
```

### Error "Origin not allowed by CORS"

**Causa:** El origin del frontend no está en la lista.

**Solución:**
1. Verificar el origin exacto en logs de Render:
   ```
   ⚠️ CORS blocked origin: https://otro-dominio.com
   ```
2. Agregar ese origin a `CORS_ORIGIN`

### Preflight OPTIONS devuelve 401

**Causa:** El guard JWT está bloqueando OPTIONS.

**Solución:** Ya está aplicada. El código permite OPTIONS sin autenticación.

---

## 📊 Headers CORS Configurados

```
Access-Control-Allow-Origin: https://congregacionmitacol.org
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Origin,Content-Type,Accept,Authorization,...
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: Authorization
```

---

## 🔄 Próximos Pasos

### 1. Commit y Push

```bash
git add src/main.ts
git commit -m "fix: Configure CORS for congregacionmitacol.org domain"
git push origin desarrollo
```

### 2. Configurar Variable en Render

```
Dashboard > Environment > Add Environment Variable
Key: CORS_ORIGIN
Value: https://congregacionmitacol.org,https://www.congregacionmitacol.org
Save Changes
```

### 3. Esperar Redeploy (~3 min)

```
Dashboard > Logs > Buscar:
🌐 CORS enabled for origins: [...]
```

### 4. Test desde Frontend

```javascript
// Tu aplicación Angular ya debería funcionar
this.http.post('https://backendoots.onrender.com/api/v1/auth/login', ...)
```

---

## ✅ Checklist de Verificación

- [ ] `src/main.ts` actualizado con nueva lógica CORS
- [ ] Commit y push realizados
- [ ] Variable `CORS_ORIGIN` configurada en Render
- [ ] Render redesplegó exitosamente
- [ ] Logs muestran origins permitidos
- [ ] Test de preflight OPTIONS funciona
- [ ] Frontend puede hacer requests sin error CORS
- [ ] Login funciona desde `congregacionmitacol.org`

---

**Última actualización:** 2025-11-04  
**Issue:** CORS blocking congregacionmitacol.org  
**Status:** ✅ Resuelto - Pendiente de deploy
