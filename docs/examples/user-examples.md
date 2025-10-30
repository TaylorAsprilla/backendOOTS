# 👥 Ejemplos de Gestión de Usuarios

## Crear Usuario

### Caso 1: Usuario Básico

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Carlos",
    "firstLastName": "Rodríguez",
    "email": "carlos.rodriguez@example.com",
    "password": "SecurePassword123!"
  }'
```

**Respuesta:**

```json
{
  "id": 2,
  "firstName": "Carlos",
  "secondName": null,
  "firstLastName": "Rodríguez",
  "secondLastName": null,
  "email": "carlos.rodriguez@example.com",
  "phoneNumber": null,
  "position": null,
  "organization": null,
  "status": "ACTIVE",
  "createdAt": "2024-10-20T15:45:12.000Z",
  "updatedAt": "2024-10-20T15:45:12.000Z"
}
```

### Caso 2: Usuario Completo

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ana",
    "secondName": "María",
    "firstLastName": "Pérez",
    "secondLastName": "González",
    "email": "ana.perez@icbf.gov.co",
    "password": "MySecurePass456!",
    "phoneNumber": "+57 301 234 5678",
    "position": "Trabajadora Social Senior",
    "organization": "ICBF Regional Antioquia"
  }'
```

**Respuesta:**

```json
{
  "id": 3,
  "firstName": "Ana",
  "secondName": "María",
  "firstLastName": "Pérez",
  "secondLastName": "González",
  "email": "ana.perez@icbf.gov.co",
  "phoneNumber": "+57 301 234 5678",
  "position": "Trabajadora Social Senior",
  "organization": "ICBF Regional Antioquia",
  "status": "ACTIVE",
  "createdAt": "2024-10-20T16:10:30.000Z",
  "updatedAt": "2024-10-20T16:10:30.000Z"
}
```

---

## Listar Usuarios

### Caso 1: Lista Básica

```bash
curl -X GET http://localhost:3000/users
```

**Respuesta:**

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
    "secondName": null,
    "firstLastName": "Rodríguez",
    "secondLastName": null,
    "email": "carlos.rodriguez@example.com",
    "phoneNumber": null,
    "position": null,
    "organization": null,
    "status": "ACTIVE",
    "createdAt": "2024-10-20T15:45:12.000Z",
    "updatedAt": "2024-10-20T15:45:12.000Z"
  }
]
```

---

## Obtener Usuario por ID

### Caso 1: Usuario Existente

```bash
curl -X GET http://localhost:3000/users/1
```

**Respuesta:**

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

### Caso 2: Usuario No Encontrado

```bash
curl -X GET http://localhost:3000/users/999
```

**Respuesta (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

---

## Actualizar Usuario

### Caso 1: Actualización Parcial

```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Psicóloga Clínica Senior",
    "organization": "Hospital Universitario San Vicente"
  }'
```

**Respuesta:**

```json
{
  "id": 1,
  "firstName": "María",
  "secondName": "Elena",
  "firstLastName": "García",
  "secondLastName": "López",
  "email": "maria.garcia@example.com",
  "phoneNumber": "+57 300 123 4567",
  "position": "Psicóloga Clínica Senior",
  "organization": "Hospital Universitario San Vicente",
  "status": "ACTIVE",
  "createdAt": "2024-10-20T14:30:32.000Z",
  "updatedAt": "2024-10-20T16:25:45.000Z"
}
```

### Caso 2: Cambio de Contraseña

```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePassword789!"
  }'
```

**Respuesta:**

```json
{
  "id": 1,
  "firstName": "María",
  "secondName": "Elena",
  "firstLastName": "García",
  "secondLastName": "López",
  "email": "maria.garcia@example.com",
  "phoneNumber": "+57 300 123 4567",
  "position": "Psicóloga Clínica Senior",
  "organization": "Hospital Universitario San Vicente",
  "status": "ACTIVE",
  "createdAt": "2024-10-20T14:30:32.000Z",
  "updatedAt": "2024-10-20T16:30:18.000Z"
}
```

---

## Eliminar Usuario (Soft Delete)

### Caso 1: Eliminación Exitosa

```bash
curl -X DELETE http://localhost:3000/users/2
```

**Respuesta:**

```json
{
  "message": "User with ID 2 has been successfully deleted"
}
```

### Caso 2: Usuario Ya Eliminado

```bash
curl -X DELETE http://localhost:3000/users/2
```

**Respuesta (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "User with ID 2 not found",
  "error": "Not Found"
}
```

---

## Listar Usuarios con Eliminados

### Caso 1: Todos los Usuarios

```bash
curl -X GET http://localhost:3000/users/all/with-deleted
```

**Respuesta:**

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
    "position": "Psicóloga Clínica Senior",
    "organization": "Hospital Universitario San Vicente",
    "status": "ACTIVE",
    "createdAt": "2024-10-20T14:30:32.000Z",
    "updatedAt": "2024-10-20T16:25:45.000Z"
  },
  {
    "id": 2,
    "firstName": "Carlos",
    "secondName": null,
    "firstLastName": "Rodríguez",
    "secondLastName": null,
    "email": "carlos.rodriguez@example.com",
    "phoneNumber": null,
    "position": null,
    "organization": null,
    "status": "DELETED",
    "createdAt": "2024-10-20T15:45:12.000Z",
    "updatedAt": "2024-10-20T16:35:22.000Z"
  }
]
```

---

## Restaurar Usuario

### Caso 1: Restauración Exitosa

```bash
curl -X PATCH http://localhost:3000/users/2/restore
```

**Respuesta:**

```json
{
  "id": 2,
  "firstName": "Carlos",
  "secondName": null,
  "firstLastName": "Rodríguez",
  "secondLastName": null,
  "email": "carlos.rodriguez@example.com",
  "phoneNumber": null,
  "position": null,
  "organization": null,
  "status": "ACTIVE",
  "createdAt": "2024-10-20T15:45:12.000Z",
  "updatedAt": "2024-10-20T16:40:15.000Z"
}
```

### Caso 2: Usuario No Eliminado

```bash
curl -X PATCH http://localhost:3000/users/1/restore
```

**Respuesta (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Deleted user with ID 1 not found",
  "error": "Not Found"
}
```

---

## Manejo de Errores de Validación

### Caso 1: Datos Inválidos

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "A",
    "firstLastName": "B",
    "email": "correo-invalido",
    "password": "123"
  }'
```

**Respuesta (400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": [
    "First name must be between 2 and 50 characters",
    "First last name must be between 2 and 50 characters",
    "Please provide a valid email address",
    "Password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

### Caso 2: Email Duplicado

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "firstLastName": "Pérez",
    "email": "maria.garcia@example.com",
    "password": "ValidPassword123!"
  }'
```

**Respuesta (409 Conflict):**

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## JavaScript/Fetch Examples

### Crear Usuario con Validación

```javascript
const createUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();

      if (response.status === 400) {
        // Errores de validación
        throw new ValidationError(error.message);
      } else if (response.status === 409) {
        // Email duplicado
        throw new ConflictError(error.message);
      } else {
        throw new Error('Failed to create user');
      }
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Clases de error personalizadas
class ValidationError extends Error {
  constructor(messages) {
    super(Array.isArray(messages) ? messages.join(', ') : messages);
    this.name = 'ValidationError';
    this.messages = messages;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

// Uso
const newUser = {
  firstName: 'Pedro',
  firstLastName: 'Sánchez',
  email: 'pedro.sanchez@example.com',
  password: 'SecurePass123!',
  position: 'Médico',
  organization: 'Hospital General',
};

createUser(newUser)
  .then((user) => {
    console.log('User created successfully:', user);
  })
  .catch((error) => {
    if (error instanceof ValidationError) {
      console.error('Validation errors:', error.messages);
    } else if (error instanceof ConflictError) {
      console.error('Conflict error:', error.message);
    } else {
      console.error('Unexpected error:', error.message);
    }
  });
```

### Sistema de Gestión CRUD Completo

```javascript
class UserService {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async createUser(userData) {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async getUsers() {
    const response = await fetch(`${this.baseUrl}/users`);
    return this.handleResponse(response);
  }

  async getUserById(id) {
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    return this.handleResponse(response);
  }

  async updateUser(id, updateData) {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(id) {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  async restoreUser(id) {
    const response = await fetch(`${this.baseUrl}/users/${id}/restore`, {
      method: 'PATCH',
    });
    return this.handleResponse(response);
  }

  async getAllUsersWithDeleted() {
    const response = await fetch(`${this.baseUrl}/users/all/with-deleted`);
    return this.handleResponse(response);
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return await response.json();
  }
}

// Uso del servicio
const userService = new UserService();

// Ejemplo de uso completo
async function userManagementExample() {
  try {
    // 1. Crear usuario
    const newUser = await userService.createUser({
      firstName: 'Luis',
      firstLastName: 'Martín',
      email: 'luis.martin@example.com',
      password: 'Password123!',
      position: 'Enfermero',
    });
    console.log('Created user:', newUser);

    // 2. Obtener lista de usuarios
    const users = await userService.getUsers();
    console.log('All users:', users);

    // 3. Obtener usuario específico
    const user = await userService.getUserById(newUser.id);
    console.log('User details:', user);

    // 4. Actualizar usuario
    const updatedUser = await userService.updateUser(newUser.id, {
      position: 'Enfermero Jefe',
      organization: 'Clínica San Rafael',
    });
    console.log('Updated user:', updatedUser);

    // 5. Eliminar usuario
    await userService.deleteUser(newUser.id);
    console.log('User deleted');

    // 6. Ver usuarios con eliminados
    const allUsers = await userService.getAllUsersWithDeleted();
    console.log('All users including deleted:', allUsers);

    // 7. Restaurar usuario
    const restoredUser = await userService.restoreUser(newUser.id);
    console.log('Restored user:', restoredUser);
  } catch (error) {
    console.error('Error in user management:', error.message);
  }
}
```

---

## React Hook para Gestión de Usuarios

```javascript
import { useState, useEffect } from 'react';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (includeDeleted = false) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = includeDeleted ? '/users/all/with-deleted' : '/users';

      const response = await fetch(`http://localhost:3000${endpoint}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const newUser = await response.json();
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (id, updateData) => {
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user)),
      );
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const restoreUser = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/users/${id}/restore`,
        {
          method: 'PATCH',
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const restoredUser = await response.json();
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? restoredUser : user)),
      );
      return restoredUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
  };
};

// Componente de ejemplo
const UserList = () => {
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
  } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Users</h2>
      {users.map((user) => (
        <div key={user.id} className="user-item">
          <h3>
            {user.firstName} {user.firstLastName}
          </h3>
          <p>Email: {user.email}</p>
          <p>Status: {user.status}</p>

          {user.status === 'ACTIVE' ? (
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          ) : (
            <button onClick={() => restoreUser(user.id)}>Restore</button>
          )}

          <button
            onClick={() =>
              updateUser(user.id, {
                position: 'Updated Position',
              })
            }
          >
            Update
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## Validaciones del Frontend

```javascript
// Validaciones para formulario de usuario
export const validateUserForm = (userData) => {
  const errors = {};

  // Validar nombres
  if (!userData.firstName || userData.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }
  if (userData.firstName && userData.firstName.length > 50) {
    errors.firstName = 'First name must not exceed 50 characters';
  }

  if (!userData.firstLastName || userData.firstLastName.length < 2) {
    errors.firstLastName = 'Last name must be at least 2 characters';
  }
  if (userData.firstLastName && userData.firstLastName.length > 50) {
    errors.firstLastName = 'Last name must not exceed 50 characters';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userData.email) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(userData.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Validar contraseña (solo para creación)
  if (userData.password !== undefined) {
    if (!userData.password || userData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (userData.password && userData.password.length > 255) {
      errors.password = 'Password must not exceed 255 characters';
    }
  }

  // Validar teléfono (opcional)
  if (userData.phoneNumber) {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(userData.phoneNumber)) {
      errors.phoneNumber = 'Please provide a valid phone number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Ejemplo de uso en formulario
const UserForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateUserForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              firstName: e.target.value,
            })
          }
        />
        {errors.firstName && <span className="error">{errors.firstName}</span>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Last Name"
          value={formData.firstLastName || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              firstLastName: e.target.value,
            })
          }
        />
        {errors.firstLastName && (
          <span className="error">{errors.firstLastName}</span>
        )}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};
```
