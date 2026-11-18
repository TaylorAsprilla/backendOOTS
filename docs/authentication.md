# 🔐 Módulo de Autenticación

## 📋 Descripción General

El módulo de autenticación maneja el registro de usuarios, login y protección de rutas mediante JWT (JSON Web Tokens). Proporciona endpoints seguros para la gestión de sesiones y autenticación de usuarios en el sistema OOTS Colombia.

## 🏗️ Arquitectura

```
auth/
├── dto/                     # DTOs de validación
│   ├── create-user.dto.ts  # DTO para registro
│   ├── login.dto.ts        # DTO para login
│   └── index.ts
├── guards/                  # Guards de protección
│   └── jwt-auth.guard.ts   # Guard JWT
├── strategies/              # Estrategias Passport
│   └── jwt.strategy.ts     # Estrategia JWT
├── auth.controller.ts       # Controlador de endpoints
├── auth.service.ts         # Lógica de negocio
└── auth.module.ts          # Configuración del módulo
```

## 🌐 Endpoints Disponibles

| Método | Endpoint                | Descripción                            | Autenticación |
| ------ | ----------------------- | -------------------------------------- | ------------- |
| `POST` | `/api/v1/auth/register` | Registro de nuevos usuarios            | ✅ (ADMIN, ADMIN_COUNTRY) |
| `POST` | `/api/v1/auth/login`    | Login de usuarios existentes           | ❌            |
| `GET`  | `/api/v1/auth/profile`  | Obtener perfil del usuario autenticado | ✅            |

---

## 📝 POST /api/v1/auth/register

> **Requiere autenticación.** El registro público está cerrado: solo `ADMIN` (cualquier país) y `ADMIN_COUNTRY` (solo su país y sin roles de administrador) pueden crear usuarios. Envíe `Authorization: Bearer <token>`.

Registra un nuevo usuario en el sistema con validaciones completas.

### 📥 Parámetros de Entrada

| Campo            | Tipo     | Requerido | Validaciones                                          | Descripción              |
| ---------------- | -------- | --------- | ----------------------------------------------------- | ------------------------ |
| `firstName`      | `string` | ✅        | 2-50 caracteres                                       | Primer nombre            |
| `secondName`     | `string` | ❌        | 2-50 caracteres                                       | Segundo nombre           |
| `firstLastName`  | `string` | ✅        | 2-50 caracteres                                       | Primer apellido          |
| `secondLastName` | `string` | ❌        | 2-50 caracteres                                       | Segundo apellido         |
| `email`          | `string` | ✅        | Email válido                                          | Correo electrónico único |
| `password`       | `string` | ✅        | 8-50 caracteres, mayúscula, minúscula, número/símbolo | Contraseña segura        |
| `phoneNumber`    | `string` | ❌        | Máximo 100 caracteres                                 | Número de teléfono       |
| `position`       | `string` | ❌        | Máximo 100 caracteres                                 | Cargo o posición         |
| `organization`   | `string` | ❌        | Máximo 200 caracteres                                 | Organización             |

### 📤 Ejemplo de Petición

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "María",
  "secondName": "Elena",
  "firstLastName": "García",
  "secondLastName": "López",
  "email": "maria.garcia@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+57 300 123 4567",
  "position": "Psicóloga",
  "organization": "Centro de Salud Mental"
}
```

### ✅ Respuesta Exitosa (201 Created)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoibWFyaWEuZ2FyY2lhQGV4YW1wbGUuY29tIiwiZmlyc3ROYW1lIjoiTWFyw61hIiwiZmlyc3RMYXN0TmFtZSI6IkdhcmPDrWEiLCJpYXQiOjE2OTg3NjU0MzIsImV4cCI6MTY5ODg1MTgzMn0.example-signature",
  "user": {
    "id": 1,
    "firstName": "María",
    "secondName": "Elena",
    "firstLastName": "García",
    "secondLastName": "López",
    "email": "maria.garcia@example.com",
    "phoneNumber": "+57 300 123 4567",
    "position": "Psicóloga",
    "organization": "Centro de Salud Mental",
    "status": "ACTIVE",
    "createdAt": "2024-10-20T14:30:32.000Z",
    "updatedAt": "2024-10-20T14:30:32.000Z"
  }
}
```

### ❌ Respuestas de Error

#### Email ya existe (409 Conflict)

```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

#### Validación de campos (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": [
    "firstName must be longer than or equal to 2 characters",
    "email must be an email",
    "Password must contain at least one uppercase letter, one lowercase letter, and one number or special character"
  ],
  "error": "Bad Request"
}
```

---

## 📝 POST /api/v1/auth/login

Autentica un usuario existente y genera un token JWT.

### 📥 Parámetros de Entrada

| Campo      | Tipo     | Requerido | Validaciones | Descripción                   |
| ---------- | -------- | --------- | ------------ | ----------------------------- |
| `email`    | `string` | ✅        | Email válido | Correo electrónico registrado |
| `password` | `string` | ✅        | -            | Contraseña del usuario        |

### 📤 Ejemplo de Petición

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "maria.garcia@example.com",
  "password": "SecurePass123!"
}
```

### ✅ Respuesta Exitosa (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoibWFyaWEuZ2FyY2lhQGV4YW1wbGUuY29tIiwiZmlyc3ROYW1lIjoiTWFyw61hIiwiZmlyc3RMYXN0TmFtZSI6IkdhcmPDrWEiLCJpYXQiOjE2OTg3NjU0MzIsImV4cCI6MTY5ODg1MTgzMn0.example-signature",
  "user": {
    "id": 1,
    "firstName": "María",
    "secondName": "Elena",
    "firstLastName": "García",
    "secondLastName": "López",
    "email": "maria.garcia@example.com",
    "phoneNumber": "+57 300 123 4567",
    "position": "Psicóloga",
    "organization": "Centro de Salud Mental",
    "status": "ACTIVE",
    "createdAt": "2024-10-20T14:30:32.000Z",
    "updatedAt": "2024-10-20T14:30:32.000Z"
  }
}
```

### ❌ Respuestas de Error

#### Credenciales inválidas (401 Unauthorized)

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### Validación de campos (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password should not be empty"],
  "error": "Bad Request"
}
```

---

## 📝 GET /api/v1/auth/profile

Obtiene el perfil del usuario autenticado.

### 🔐 Autenticación Requerida

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 📤 Ejemplo de Petición

```http
GET /api/v1/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoibWFyaWEuZ2FyY2lhQGV4YW1wbGUuY29tIiwiZmlyc3ROYW1lIjoiTWFyw61hIiwiZmlyc3RMYXN0TmFtZSI6IkdhcmPDrWEiLCJpYXQiOjE2OTg3NjU0MzIsImV4cCI6MTY5ODg1MTgzMn0.example-signature
```

### ✅ Respuesta Exitosa (200 OK)

```json
{
  "id": 1,
  "firstName": "María",
  "secondName": "Elena",
  "firstLastName": "García",
  "secondLastName": "López",
  "email": "maria.garcia@example.com",
  "phoneNumber": "+57 300 123 4567",
  "position": "Psicóloga",
  "organization": "Centro de Salud Mental",
  "status": "ACTIVE",
  "createdAt": "2024-10-20T14:30:32.000Z",
  "updatedAt": "2024-10-20T14:30:32.000Z"
}
```

### ❌ Respuestas de Error

#### Token inválido o expirado (401 Unauthorized)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Token no proporcionado (401 Unauthorized)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 🔒 Seguridad

### JWT Configuration

- **Algoritmo**: HS256 (HMAC SHA-256)
- **Expiración**: 24 horas (configurable)
- **Secret**: Variable de entorno `JWT_SECRET`

### Password Security

- **Hashing**: bcrypt con 12 salt rounds
- **Validaciones**:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número o símbolo especial

### Headers Requeridos

Para endpoints protegidos, incluir:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 🧪 Ejemplos de Uso con cURL

### Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "María",
    "firstLastName": "García",
    "email": "maria.garcia@example.com",
    "password": "SecurePass123!",
    "position": "Psicóloga"
  }'
```

### Login de Usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.garcia@example.com",
    "password": "SecurePass123!"
  }'
```

### Obtener Perfil

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🚨 Códigos de Estado HTTP

| Código | Descripción           | Cuándo se produce                      |
| ------ | --------------------- | -------------------------------------- |
| `200`  | OK                    | Login exitoso, perfil obtenido         |
| `201`  | Created               | Usuario registrado exitosamente        |
| `400`  | Bad Request           | Validaciones fallidas                  |
| `401`  | Unauthorized          | Credenciales inválidas, token inválido |
| `409`  | Conflict              | Email ya existe                        |
| `500`  | Internal Server Error | Error interno del servidor             |

---

## 🔄 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as Auth Controller
    participant S as Auth Service
    participant DB as Base de Datos

    C->>A: POST /auth/register (Bearer ADMIN o ADMIN_COUNTRY)
    A->>S: Validar y crear usuario
    S->>DB: Guardar usuario
    DB-->>S: Usuario creado
    S-->>A: JWT + Usuario
    A-->>C: 201 + Token

    C->>A: POST /auth/login
    A->>S: Validar credenciales
    S->>DB: Buscar usuario
    DB-->>S: Usuario encontrado
    S-->>A: JWT + Usuario
    A-->>C: 200 + Token

    C->>A: GET /auth/profile
    A->>S: Validar token
    S-->>A: Usuario autenticado
    A-->>C: 200 + Perfil
```

---

## 🔗 Enlaces Relacionados

- [Documentación de Usuarios](./users.md)
- [Base de Datos](./database.md)
- [Ejemplos Completos](./examples/auth-requests.md)
