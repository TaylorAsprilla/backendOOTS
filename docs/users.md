# 👥 Módulo de Usuarios

## 📋 Descripción General

El módulo de usuarios proporciona funcionalidades CRUD (Create, Read, Update, Delete) completas para la gestión de usuarios del sistema. Incluye características avanzadas como soft delete, restauración de usuarios y validaciones de unicidad para garantizar la integridad de los datos.

## 🏗️ Arquitectura

```
users/
├── dto/                    # DTOs de validación
│   ├── create-user.dto.ts # DTO para crear usuarios
│   └── update-user.dto.ts # DTO para actualizar usuarios
├── entities/              # Entidades TypeORM
│   └── user.entity.ts     # Entidad User
├── users.controller.ts    # Controlador de endpoints
├── users.service.ts       # Lógica de negocio
└── users.module.ts        # Configuración del módulo
```

## 🌐 Endpoints Disponibles

| Método   | Endpoint                  | Descripción                                    | Autenticación |
| -------- | ------------------------- | ---------------------------------------------- | ------------- |
| `POST`   | `/users`                  | Crear nuevo usuario                            | ❌            |
| `GET`    | `/users`                  | Listar usuarios activos                        | ❌            |
| `GET`    | `/users/:id`              | Obtener usuario por ID                         | ❌            |
| `PATCH`  | `/users/:id`              | Actualizar usuario                             | ❌            |
| `DELETE` | `/users/:id`              | Eliminar usuario (soft delete)                 | ❌            |
| `GET`    | `/users/all/with-deleted` | Listar todos los usuarios incluidos eliminados | ❌            |
| `PATCH`  | `/users/:id/restore`      | Restaurar usuario eliminado                    | ❌            |

---

## 📝 POST /users

Crea un nuevo usuario en el sistema.

### 📥 Parámetros de Entrada

| Campo            | Tipo     | Requerido | Validaciones                      | Descripción              |
| ---------------- | -------- | --------- | --------------------------------- | ------------------------ |
| `firstName`      | `string` | ✅        | 2-50 caracteres                   | Primer nombre            |
| `secondName`     | `string` | ❌        | 2-50 caracteres                   | Segundo nombre           |
| `firstLastName`  | `string` | ✅        | 2-50 caracteres                   | Primer apellido          |
| `secondLastName` | `string` | ❌        | 2-50 caracteres                   | Segundo apellido         |
| `email`          | `string` | ✅        | Email válido, máx. 100 caracteres | Correo electrónico único |
| `password`       | `string` | ✅        | 8-255 caracteres                  | Contraseña               |
| `phoneNumber`    | `string` | ❌        | Formato de teléfono válido        | Número de teléfono       |
| `position`       | `string` | ❌        | 2-100 caracteres                  | Cargo o posición         |
| `organization`   | `string` | ❌        | 2-200 caracteres                  | Organización             |

### 📤 Ejemplo de Petición

```http
POST /users
Content-Type: application/json

{
  "firstName": "Carlos",
  "secondName": "Alberto",
  "firstLastName": "Rodríguez",
  "secondLastName": "Martínez",
  "email": "carlos.rodriguez@example.com",
  "password": "MySecurePassword123",
  "phoneNumber": "+57 301 234 5678",
  "position": "Trabajador Social",
  "organization": "ICBF Regional"
}
```

### ✅ Respuesta Exitosa (201 Created)

```json
{
  "id": 2,
  "firstName": "Carlos",
  "secondName": "Alberto",
  "firstLastName": "Rodríguez",
  "secondLastName": "Martínez",
  "email": "carlos.rodriguez@example.com",
  "phoneNumber": "+57 301 234 5678",
  "position": "Trabajador Social",
  "organization": "ICBF Regional",
  "status": "ACTIVE",
  "createdAt": "2024-10-20T15:45:12.000Z",
  "updatedAt": "2024-10-20T15:45:12.000Z"
}
```

### ❌ Respuestas de Error

#### Email ya existe (409 Conflict)

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## 📝 GET /users

Obtiene una lista de todos los usuarios activos del sistema.

### 📤 Ejemplo de Petición

```http
GET /users
```

### ✅ Respuesta Exitosa (200 OK)

```json
[
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
  },
  {
    "id": 2,
    "firstName": "Carlos",
    "secondName": "Alberto",
    "firstLastName": "Rodríguez",
    "secondLastName": "Martínez",
    "email": "carlos.rodriguez@example.com",
    "phoneNumber": "+57 301 234 5678",
    "position": "Trabajador Social",
    "organization": "ICBF Regional",
    "status": "ACTIVE",
    "createdAt": "2024-10-20T15:45:12.000Z",
    "updatedAt": "2024-10-20T15:45:12.000Z"
  }
]
```

---

## 📝 GET /users/:id

Obtiene un usuario específico por su ID.

### 📥 Parámetros de URL

| Parámetro | Tipo     | Descripción          |
| --------- | -------- | -------------------- |
| `id`      | `number` | ID único del usuario |

### 📤 Ejemplo de Petición

```http
GET /users/1
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

#### Usuario no encontrado (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

---

## 📝 PATCH /users/:id

Actualiza parcialmente un usuario existente.

### 📥 Parámetros de URL

| Parámetro | Tipo     | Descripción          |
| --------- | -------- | -------------------- |
| `id`      | `number` | ID único del usuario |

### 📥 Parámetros de Entrada (Todos opcionales)

| Campo            | Tipo     | Validaciones                      | Descripción        |
| ---------------- | -------- | --------------------------------- | ------------------ |
| `firstName`      | `string` | 2-50 caracteres                   | Primer nombre      |
| `secondName`     | `string` | 2-50 caracteres                   | Segundo nombre     |
| `firstLastName`  | `string` | 2-50 caracteres                   | Primer apellido    |
| `secondLastName` | `string` | 2-50 caracteres                   | Segundo apellido   |
| `email`          | `string` | Email válido, máx. 100 caracteres | Correo electrónico |
| `password`       | `string` | 8-255 caracteres                  | Nueva contraseña   |
| `phoneNumber`    | `string` | Formato de teléfono válido        | Número de teléfono |
| `position`       | `string` | 2-100 caracteres                  | Cargo o posición   |
| `organization`   | `string` | 2-200 caracteres                  | Organización       |

### 📤 Ejemplo de Petición

```http
PATCH /users/1
Content-Type: application/json

{
  "position": "Psicóloga Clínica Senior",
  "phoneNumber": "+57 300 999 8888"
}
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
  "phoneNumber": "+57 300 999 8888",
  "position": "Psicóloga Clínica Senior",
  "organization": "Centro de Salud Mental",
  "status": "ACTIVE",
  "createdAt": "2024-10-20T14:30:32.000Z",
  "updatedAt": "2024-10-20T16:15:45.000Z"
}
```

---

## 📝 DELETE /users/:id

Elimina un usuario del sistema utilizando soft delete (el usuario se marca como eliminado pero no se borra físicamente).

### 📥 Parámetros de URL

| Parámetro | Tipo     | Descripción          |
| --------- | -------- | -------------------- |
| `id`      | `number` | ID único del usuario |

### 📤 Ejemplo de Petición

```http
DELETE /users/1
```

### ✅ Respuesta Exitosa (200 OK)

```json
{
  "message": "User with ID 1 has been successfully deleted"
}
```

### ❌ Respuestas de Error

#### Usuario no encontrado (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

---

## 📝 GET /users/all/with-deleted

Obtiene todos los usuarios del sistema, incluyendo los eliminados (soft deleted).

### 📤 Ejemplo de Petición

```http
GET /users/all/with-deleted
```

### ✅ Respuesta Exitosa (200 OK)

```json
[
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
    "status": "DELETED",
    "createdAt": "2024-10-20T14:30:32.000Z",
    "updatedAt": "2024-10-20T16:20:15.000Z"
  },
  {
    "id": 2,
    "firstName": "Carlos",
    "secondName": "Alberto",
    "firstLastName": "Rodríguez",
    "secondLastName": "Martínez",
    "email": "carlos.rodriguez@example.com",
    "phoneNumber": "+57 301 234 5678",
    "position": "Trabajador Social",
    "organization": "ICBF Regional",
    "status": "ACTIVE",
    "createdAt": "2024-10-20T15:45:12.000Z",
    "updatedAt": "2024-10-20T15:45:12.000Z"
  }
]
```

---

## 📝 PATCH /users/:id/restore

Restaura un usuario previamente eliminado (soft deleted).

### 📥 Parámetros de URL

| Parámetro | Tipo     | Descripción                    |
| --------- | -------- | ------------------------------ |
| `id`      | `number` | ID único del usuario eliminado |

### 📤 Ejemplo de Petición

```http
PATCH /users/1/restore
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
  "updatedAt": "2024-10-20T16:25:30.000Z"
}
```

### ❌ Respuestas de Error

#### Usuario eliminado no encontrado (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Deleted user with ID 999 not found",
  "error": "Not Found"
}
```

---

## 🗃️ Entidad User

### 📊 Esquema de la Base de Datos

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  second_name VARCHAR(50),
  first_last_name VARCHAR(50) NOT NULL,
  second_last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  position VARCHAR(100),
  organization VARCHAR(200),
  status ENUM('ACTIVE', 'DELETED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 🔐 Seguridad de Contraseñas

- **Hashing automático**: Las contraseñas se encriptan automáticamente antes de guardar usando bcrypt
- **Salt rounds**: 12 rounds para máxima seguridad
- **Exclusión en respuestas**: Las contraseñas nunca se incluyen en las respuestas de la API

---

## 🧪 Ejemplos de Uso con cURL

### Crear Usuario

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ana",
    "firstLastName": "Pérez",
    "email": "ana.perez@example.com",
    "password": "SecurePass456!",
    "position": "Enfermera"
  }'
```

### Listar Usuarios

```bash
curl -X GET http://localhost:3000/users
```

### Obtener Usuario por ID

```bash
curl -X GET http://localhost:3000/users/1
```

### Actualizar Usuario

```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Enfermera Jefe",
    "organization": "Hospital San Juan"
  }'
```

### Eliminar Usuario

```bash
curl -X DELETE http://localhost:3000/users/1
```

### Restaurar Usuario

```bash
curl -X PATCH http://localhost:3000/users/1/restore
```

---

## 🚨 Códigos de Estado HTTP

| Código | Descripción           | Cuándo se produce                      |
| ------ | --------------------- | -------------------------------------- |
| `200`  | OK                    | Operación exitosa (GET, PATCH, DELETE) |
| `201`  | Created               | Usuario creado exitosamente            |
| `400`  | Bad Request           | Validaciones fallidas                  |
| `404`  | Not Found             | Usuario no encontrado                  |
| `409`  | Conflict              | Email o teléfono ya existe             |
| `500`  | Internal Server Error | Error interno del servidor             |

---

## ✅ Validaciones de Unicidad

El sistema valida automáticamente la unicidad de:

1. **Email**: No pueden existir dos usuarios con el mismo email
2. **Teléfono**: No pueden existir dos usuarios activos con el mismo número (si se proporciona)

Las validaciones se ejecutan tanto al crear como al actualizar usuarios.

---

## 🔄 Estados del Usuario

| Estado    | Descripción                     |
| --------- | ------------------------------- |
| `ACTIVE`  | Usuario activo y funcional      |
| `DELETED` | Usuario eliminado (soft delete) |

---

## 🔗 Enlaces Relacionados

- [Documentación de Autenticación](./authentication.md)
- [Base de Datos](./database.md)
- [Ejemplos Completos](./examples/user-requests.md)
