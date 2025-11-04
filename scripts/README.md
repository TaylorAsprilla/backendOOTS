# 🛠️ Scripts de Deployment

Utilidades para facilitar el despliegue en Render y testing local.

## 📁 Archivos

### `deploy-helpers.sh`

Scripts bash con funciones útiles para deployment.

## 🚀 Uso

### Generar JWT Secret

```bash
npm run generate:jwt
```

**Output:** String hexadecimal de 64 caracteres
**Uso:** Copiar como valor de `JWT_SECRET` en Render

### Test Build Local

```bash
npm run test:build
```

**Simula:** Build process de Render
**Valida:** Instalación y compilación funcionan

### Verify Deploy Ready

```bash
npm run deploy:check
```

**Verifica:** Build exitoso antes de push

### Usar Funciones Individuales

```bash
# Dar permisos de ejecución (solo primera vez)
chmod +x scripts/deploy-helpers.sh

# Ver ayuda
./scripts/deploy-helpers.sh

# Generar JWT
./scripts/deploy-helpers.sh generate_jwt_secret

# Test build
./scripts/deploy-helpers.sh test_build

# Verificar variables de entorno
./scripts/deploy-helpers.sh check_env

# Test conexión a BD
./scripts/deploy-helpers.sh test_db_connection

# Health check
./scripts/deploy-helpers.sh check_health https://backend-oots.onrender.com

# Test endpoints
./scripts/deploy-helpers.sh test_endpoints https://backend-oots.onrender.com
```

## 📋 Funciones Disponibles

| Función                | Descripción              | Uso           |
| ---------------------- | ------------------------ | ------------- |
| `generate_jwt_secret`  | Genera JWT secret seguro | Pre-deploy    |
| `test_build`           | Test build process       | Pre-deploy    |
| `test_production`      | Run en modo producción   | Testing local |
| `check_env`            | Verifica env vars        | Debugging     |
| `test_db_connection`   | Test DB connection       | Post-deploy   |
| `check_health [url]`   | Health check endpoint    | Monitoring    |
| `test_endpoints [url]` | Test API endpoints       | Verification  |
| `generate_render_env`  | Crea .env.render         | Setup         |

## 🔧 Requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Bash** (Git Bash en Windows)
- **curl** (para health checks)
- **jq** (opcional, para formatear JSON)

### Instalar jq (opcional)

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Windows (Git Bash)
# Descargar desde: https://stedolan.github.io/jq/download/
```

## 💡 Tips

### Pre-Deploy Checklist

```bash
# 1. Verificar variables de entorno
./scripts/deploy-helpers.sh check_env

# 2. Test build
npm run test:build

# 3. Test producción local
npm run start:prod

# 4. Listo para deploy!
git push origin main
```

### Post-Deploy Verification

```bash
# 1. Health check
./scripts/deploy-helpers.sh check_health https://backend-oots.onrender.com

# 2. Test endpoints
./scripts/deploy-helpers.sh test_endpoints https://backend-oots.onrender.com

# 3. Test DB connection (requires env vars)
export DB_HOST=containers-us-west-xxx.railway.app
export DB_PORT=3306
export DB_USERNAME=root
export DB_PASSWORD=your_password
export DB_DATABASE=railway
./scripts/deploy-helpers.sh test_db_connection
```

## 🐛 Troubleshooting

### Script no tiene permisos

```bash
chmod +x scripts/deploy-helpers.sh
```

### Command not found (Windows)

Usar Git Bash en lugar de PowerShell/CMD

### Test DB Connection fails

Verificar que las variables de entorno estén exportadas:

```bash
echo $DB_HOST
echo $DB_PASSWORD
```

## 📚 Referencias

- [DEPLOYMENT_RENDER.md](../DEPLOYMENT_RENDER.md) - Guía completa
- [DEPLOY_CHECKLIST.md](../DEPLOY_CHECKLIST.md) - Checklist rápido
- [DEPLOY_SUMMARY.md](../DEPLOY_SUMMARY.md) - Resumen ejecutivo
