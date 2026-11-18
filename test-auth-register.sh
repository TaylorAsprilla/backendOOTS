#!/bin/bash

# Script de prueba para el endpoint de registro
# Debe ejecutarse con el servidor corriendo en localhost:3000

BASE_URL="http://localhost:3000/api/v1"

# El registro requiere un ADMIN o ADMIN_COUNTRY autenticado.
# Uso: ADMIN_EMAIL=admin@ejemplo.com ADMIN_PASSWORD=... ./test-auth-register.sh
if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
  echo "Defina ADMIN_EMAIL y ADMIN_PASSWORD (usuario ADMIN o ADMIN_COUNTRY)."
  exit 1
fi
ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.data.access_token // .access_token')
if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "No fue posible iniciar sesión con las credenciales indicadas."
  exit 1
fi

echo "🧪 Probando endpoint de registro de autenticación..."
echo "========================================================"

# Datos de prueba para el registro
TEST_USER='{
  "firstName": "Juan",
  "secondName": "Carlos",
  "firstLastName": "Pérez",
  "secondLastName": "García",
  "email": "juan.test.auth@ejemplo.com",
  "password": "password123",
  "phoneNumber": "+57 300 123 4567",
  "position": "Psicólogo Clínico",
  "organization": "Centro de Bienestar Familiar",
  "documentNumber": "12345678",
  "address": "Carrera 10 # 15-20",
  "city": "Bogotá",
  "birthDate": "1990-05-15",
  "documentTypeId": 1
}'

echo "📝 Datos de prueba:"
echo "$TEST_USER" | jq .

echo ""
echo "🚀 Enviando petición de registro..."

# Hacer la petición POST al endpoint de registro
curl -X POST \
  "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "$TEST_USER" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq .

echo ""
echo "✅ Prueba completada."
echo ""
echo "🔐 Si el registro fue exitoso, deberías ver:"
echo "  - access_token: Token JWT"
echo "  - token_type: Bearer"  
echo "  - expires_in: 3600"
echo "  - user: Datos del usuario creado (sin password)"
echo ""
echo "📋 Para probar el login, usa:"
echo "curl -X POST $BASE_URL/auth/login -H \"Content-Type: application/json\" -d '{\"email\":\"juan.test.auth@ejemplo.com\",\"password\":\"password123\"}'"