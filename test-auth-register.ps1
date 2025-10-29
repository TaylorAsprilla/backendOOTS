# Script de prueba para el endpoint de registro
# Debe ejecutarse con el servidor corriendo en localhost:3000

$BASE_URL = "http://localhost:3000/api/v1"

Write-Host "🧪 Probando endpoint de registro de autenticación..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Datos de prueba para el registro
$TEST_USER = @{
    firstName = "Juan"
    secondName = "Carlos"
    firstLastName = "Pérez"
    secondLastName = "García"
    email = "juan.test.auth@ejemplo.com"
    password = "password123"
    phoneNumber = "+57 300 123 4567"
    position = "Psicólogo Clínico"
    organization = "Centro de Bienestar Familiar"
    documentNumber = "12345678"
    address = "Carrera 10 # 15-20"
    city = "Bogotá"
    birthDate = "1990-05-15"
    documentTypeId = 1
} | ConvertTo-Json

Write-Host "📝 Datos de prueba:" -ForegroundColor Yellow
Write-Host $TEST_USER -ForegroundColor White

Write-Host ""
Write-Host "🚀 Enviando petición de registro..." -ForegroundColor Yellow

try {
    # Hacer la petición POST al endpoint de registro
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $TEST_USER -ContentType "application/json"
    
    Write-Host "✅ Registro exitoso!" -ForegroundColor Green
    Write-Host "📋 Respuesta:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
    
    Write-Host ""
    Write-Host "🔐 Token JWT generado correctamente" -ForegroundColor Green
    Write-Host "👤 Usuario creado usando UsersService existente" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error en el registro:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "Detalles del error:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Para probar el login, ejecuta:" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/auth/login' -Method POST -Body '{\"email\":\"juan.test.auth@ejemplo.com\",\"password\":\"password123\"}' -ContentType 'application/json'" -ForegroundColor White