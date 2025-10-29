#!/bin/bash

# Script de prueba para el endpoint de registro
# Debe ejecutarse con el servidor corriendo en localhost:3000

BASE_URL="http://localhost:3000/api/v1"

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