#!/usr/bin/env bash
# Comandos útiles para desarrollo y despliegue en Render

# ====================================
# DESARROLLO LOCAL
# ====================================

# Generar JWT Secret seguro
generate_jwt_secret() {
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
}

# Test de build local (simular build de Render)
test_build() {
  echo "🔧 Testing build process..."
  npm install
  npm run build
  echo "✅ Build completed!"
}

# Test de producción local
test_production() {
  echo "🚀 Starting production mode locally..."
  npm run build
  NODE_ENV=production npm run start:prod
}

# Verificar variables de entorno
check_env() {
  echo "🔍 Checking required environment variables..."
  required_vars=(
    "DB_HOST"
    "DB_PORT"
    "DB_USERNAME"
    "DB_PASSWORD"
    "DB_DATABASE"
    "JWT_SECRET"
    "NODE_ENV"
  )
  
  missing=0
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "❌ Missing: $var"
      ((missing++))
    else
      echo "✅ Found: $var"
    fi
  done
  
  if [ $missing -eq 0 ]; then
    echo "✅ All required variables are set!"
  else
    echo "⚠️  $missing variable(s) missing!"
  fi
}

# ====================================
# RENDER DEPLOYMENT
# ====================================

# Test conexión a base de datos
test_db_connection() {
  echo "🗄️  Testing database connection..."
  node -e "
    const mysql = require('mysql2/promise');
    (async () => {
      try {
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        });
        console.log('✅ Database connection successful!');
        await connection.end();
      } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
      }
    })();
  "
}

# Verificar health check
check_health() {
  URL=${1:-"http://localhost:3000"}
  echo "🏥 Checking health at $URL..."
  curl -f $URL || echo "❌ Health check failed"
}

# Test endpoints principales
test_endpoints() {
  BASE_URL=${1:-"http://localhost:3000"}
  echo "🧪 Testing main endpoints at $BASE_URL..."
  
  echo "\n📍 Testing root endpoint..."
  curl -s "$BASE_URL/api/v1" | jq '.'
  
  echo "\n📍 Testing catalogs endpoint..."
  curl -s "$BASE_URL/api/v1/catalogs/all" | jq '. | length'
  
  echo "\n📍 Testing Swagger..."
  curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/docs"
}

# Generar archivo .env.render
generate_render_env() {
  echo "📝 Generating .env.render template..."
  cat > .env.render << 'EOF'
# Render Production Environment Variables
# Copy these to Render Dashboard > Environment

# Database (Railway)
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=CHANGEME
DB_DATABASE=railway
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Application
NODE_ENV=production
PORT=3000
APP_URL=https://backend-oots.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com

# JWT (Generate with: npm run generate:jwt)
JWT_SECRET=CHANGEME
JWT_EXPIRES_IN=7d

# Mail (Gmail App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=CHANGEME
MAIL_FROM=noreply@yourdomain.com

# CORS
CORS_ORIGIN=https://your-frontend.onrender.com
EOF
  echo "✅ Created .env.render"
  echo "⚠️  Remember to fill in CHANGEME values!"
}

# ====================================
# NPM SCRIPTS
# ====================================

# Add to package.json scripts:
# "generate:jwt": "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
# "test:build": "npm install && npm run build",
# "test:prod": "npm run build && NODE_ENV=production npm run start:prod",
# "check:env": "./scripts/deploy-helpers.sh check_env",
# "deploy:check": "./scripts/deploy-helpers.sh test_build && ./scripts/deploy-helpers.sh test_db_connection"

# ====================================
# HELPERS
# ====================================

show_help() {
  cat << EOF
🚀 Render Deployment Helper Scripts

Usage: ./scripts/deploy-helpers.sh [command]

Commands:
  generate_jwt_secret    Generate secure JWT secret
  test_build            Test build process locally
  test_production       Run in production mode locally
  check_env             Verify environment variables
  test_db_connection    Test database connection
  check_health [url]    Check health endpoint
  test_endpoints [url]  Test main API endpoints
  generate_render_env   Generate .env.render template

Examples:
  ./scripts/deploy-helpers.sh generate_jwt_secret
  ./scripts/deploy-helpers.sh test_build
  ./scripts/deploy-helpers.sh check_health https://backend-oots.onrender.com
  ./scripts/deploy-helpers.sh test_endpoints https://backend-oots.onrender.com

EOF
}

# ====================================
# MAIN
# ====================================

if [ $# -eq 0 ]; then
  show_help
else
  "$@"
fi
