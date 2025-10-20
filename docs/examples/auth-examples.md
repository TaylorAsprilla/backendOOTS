# 🔐 Ejemplos de Autenticación

## Registro de Usuario

### Caso 1: Registro Exitoso

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "María",
    "secondName": "Elena",
    "firstLastName": "García",
    "secondLastName": "López",
    "email": "maria.garcia@example.com",
    "password": "MiPassword123!",
    "phoneNumber": "+57 300 123 4567",
    "position": "Psicóloga",
    "organization": "Centro de Salud Mental"
  }'
```

**Respuesta:**

```json
{
  "message": "User registered successfully",
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

### Caso 2: Email Ya Existe

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Carlos",
    "firstLastName": "Rodríguez",
    "email": "maria.garcia@example.com",
    "password": "OtraPassword456"
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

### Caso 3: Validaciones Fallidas

```bash
curl -X POST http://localhost:3000/auth/register \
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

---

## Inicio de Sesión

### Caso 1: Login Exitoso

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.garcia@example.com",
    "password": "MiPassword123!"
  }'
```

**Respuesta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoibWFyaWEuZ2FyY2lhQGV4YW1wbGUuY29tIiwiaWF0IjoxNjk4MDc5ODMyLCJleHAiOjE2OTgwODM0MzJ9.xBEz4VQfB2zEgmKm4t8o9H1xYpPdMoE3vY9fGkL7NqI",
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
    "status": "ACTIVE"
  }
}
```

### Caso 2: Credenciales Inválidas

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.garcia@example.com",
    "password": "password_incorrecto"
  }'
```

**Respuesta (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Caso 3: Usuario No Encontrado

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario.inexistente@example.com",
    "password": "cualquier_password"
  }'
```

**Respuesta (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## Obtener Perfil

### Caso 1: Token Válido

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoibWFyaWEuZ2FyY2lhQGV4YW1wbGUuY29tIiwiaWF0IjoxNjk4MDc5ODMyLCJleHAiOjE2OTgwODM0MzJ9.xBEz4VQfB2zEgmKm4t8o9H1xYpPdMoE3vY9fGkL7NqI"
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

### Caso 2: Token Expirado

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer token_expirado"
```

**Respuesta (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Caso 3: Sin Token

```bash
curl -X GET http://localhost:3000/auth/profile
```

**Respuesta (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Flujo Completo de Autenticación

### JavaScript/Fetch Example

```javascript
// 1. Registro
const registerUser = async () => {
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Ana',
        firstLastName: 'Martínez',
        email: 'ana.martinez@example.com',
        password: 'SecurePass789!',
        position: 'Trabajadora Social',
      }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    console.log('User registered:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// 2. Login y obtención de token
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();

    // Guardar token en localStorage
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// 3. Obtener perfil con token
const getProfile = async () => {
  try {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('http://localhost:3000/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Profile error:', error);
    // Si el token es inválido, redirigir al login
    if (error.message.includes('401')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error;
  }
};

// 4. Logout
const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Uso ejemplo
async function authFlow() {
  try {
    // Registrar usuario
    await registerUser();

    // Login
    await loginUser('ana.martinez@example.com', 'SecurePass789!');

    // Obtener perfil
    const profile = await getProfile();
    console.log('Profile loaded:', profile);
  } catch (error) {
    console.error('Auth flow error:', error);
  }
}
```

---

## React Hook Example

```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const register = async (userData) => {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  };

  const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();

    setToken(data.access_token);
    setUser(data.user);

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Componente de ejemplo
const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirigir al dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

---

## Postman Collection

```json
{
  "info": {
    "name": "OOTS Colombia Auth",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"firstName\": \"Test\",\n  \"firstLastName\": \"User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPassword123!\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPassword123!\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "login"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "type": "text/javascript",
            "exec": [
              "if (pm.response.code === 200) {",
              "  const response = pm.response.json();",
              "  pm.collectionVariables.set('accessToken', response.access_token);",
              "}"
            ]
          }
        }
      ]
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/auth/profile",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "profile"]
        }
      }
    }
  ]
}
```
