# 👥 Módulo de Usuarios - Documentación Técnica

## 📋 Descripción General

El módulo de usuarios gestiona los **profesionales y administradores** que utilizan el sistema OOTS Colombia. Este módulo maneja la administración, autorización y gestión de cuentas de usuario existentes, proporcionando la base para el control de acceso y la trazabilidad de acciones en el sistema.

> **📝 Nota Importante**: La **creación de nuevos usuarios** se realiza exclusivamente a través del módulo de autenticación (`/auth/register`). Este módulo se enfoca en operaciones administrativas de usuarios ya registrados.

## 🏗️ Arquitectura

```
users/
├── users.controller.ts      # Controlador con endpoints de gestión
├── users.service.ts         # Lógica de negocio de usuarios
├── users.module.ts          # Configuración del módulo
├── dto/
│   ├── create-user.dto.ts   # DTO base (usado por auth/register)
│   └── update-user.dto.ts   # DTO para actualización de usuarios
└── entities/
    └── user.entity.ts       # Entidad principal del usuario
```

## 📊 Modelo de Datos

### Entidad Principal: User

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // Información personal
  @Column({ length: 50 })
  firstName: string; // Primer nombre

  @Column({ length: 50, nullable: true })
  secondName?: string; // Segundo nombre (opcional)

  @Column({ length: 50 })
  firstLastName: string; // Primer apellido

  @Column({ length: 50, nullable: true })
  secondLastName?: string; // Segundo apellido (opcional)

  // Información de contacto
  @Column({ length: 100, unique: true })
  email: string; // Email único (username)

  @Column({ length: 20, nullable: true })
  phoneNumber?: string; // Teléfono de contacto

  // Información profesional
  @Column({ length: 100, nullable: true })
  profession?: string; // Psicólogo, Trabajador Social, etc.

  @Column({ length: 50, nullable: true })
  license?: string; // Número de licencia profesional

  @Column({ length: 100, nullable: true })
  specialization?: string; // Especialización

  @Column({ length: 100, nullable: true })
  institution?: string; // Institución de trabajo

  // Credenciales y acceso
  @Column({ length: 255 })
  password: string; // Password hasheado con bcrypt

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PROFESSIONAL,
  })
  role: UserRole; // Rol del usuario

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus; // Estado del usuario

  // Control de acceso
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date; // Último inicio de sesión

  @Column({ type: 'timestamp', nullable: true })
  passwordChangedAt?: Date; // Última vez que cambió password

  @Column({ default: 0 })
  failedLoginAttempts: number; // Intentos fallidos de login

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil?: Date; // Bloqueado hasta (por intentos fallidos)

  // Metadata
  @Column({ type: 'json', nullable: true })
  preferences?: UserPreferences; // Preferencias del usuario

  @Column({ type: 'json', nullable: true })
  permissions?: string[]; // Permisos específicos adicionales

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método para verificar password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Método para obtener nombre completo
  get fullName(): string {
    const names = [this.firstName, this.secondName].filter(Boolean).join(' ');
    const lastNames = [this.firstLastName, this.secondLastName]
      .filter(Boolean)
      .join(' ');
    return `${names} ${lastNames}`.trim();
  }

  // Verificar si el usuario está bloqueado
  get isLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  // Verificar si necesita cambiar password
  get mustChangePassword(): boolean {
    if (!this.passwordChangedAt) return true;

    const maxPasswordAge = 90; // 90 días
    const passwordAge = Date.now() - this.passwordChangedAt.getTime();
    const maxAge = maxPasswordAge * 24 * 60 * 60 * 1000; // 90 días en ms

    return passwordAge > maxAge;
  }
}
```

### Enums del Usuario

#### UserRole (Roles del Sistema)

```typescript
export enum UserRole {
  ADMIN = 'ADMIN', // Administrador del sistema
  PROFESSIONAL = 'PROFESSIONAL', // Profesional (psicólogo, trabajador social)
  COORDINATOR = 'COORDINATOR', // Coordinador de programa
  SUPERVISOR = 'SUPERVISOR', // Supervisor de casos
}
```

#### UserStatus (Estados del Usuario)

```typescript
export enum UserStatus {
  ACTIVE = 'ACTIVE', // Usuario activo
  INACTIVE = 'INACTIVE', // Usuario inactivo (suspendido temporalmente)
  PENDING = 'PENDING', // Pendiente de activación
  SUSPENDED = 'SUSPENDED', // Suspendido por violación de políticas
}
```

#### UserPreferences (Preferencias del Usuario)

```typescript
interface UserPreferences {
  language: 'es' | 'en'; // Idioma preferido
  timezone: string; // Zona horaria
  theme: 'light' | 'dark' | 'auto'; // Tema de la interfaz
  emailNotifications: boolean; // Recibir notificaciones por email
  dashboardLayout: string; // Layout del dashboard
  recordsPerPage: number; // Registros por página (10, 25, 50, 100)
  defaultView: 'table' | 'card'; // Vista por defecto para listados
}
```

## 🎯 Funcionalidades del Módulo

### 1. Gestión de Usuarios

#### Administración de Usuarios

- **Consulta de usuarios**: Listado con filtros y paginación
- **Actualización de perfiles**: Modificación de datos profesionales y personales
- **Gestión de estados**: Activación, desactivación y bloqueo de cuentas
- **Reseteo de contraseñas**: Generación de nuevas contraseñas temporales

> **Nota**: La creación de nuevos usuarios se realiza únicamente a través del endpoint `/auth/register`. Este módulo se enfoca en la administración de usuarios existentes.

#### Perfiles de Usuario

- **Información personal completa**: Nombres, apellidos, contacto
- **Información profesional**: Profesión, licencia, especialización, institución
- **Preferencias personalizables**: Idioma, tema, notificaciones
- **Historial de acceso**: Registro de inicios de sesión

### 2. Autenticación y Seguridad

#### Políticas de Password

- **Longitud mínima**: 8 caracteres
- **Complejidad**: Al menos 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
- **Expiración**: Cambio obligatorio cada 90 días
- **Historial**: No permitir reutilización de últimos 5 passwords

#### Control de Acceso

- **Intentos fallidos**: Bloqueo tras 5 intentos fallidos
- **Tiempo de bloqueo**: 30 minutos automático
- **Sesiones simultáneas**: Control de sesiones activas
- **Logout automático**: Por inactividad (2 horas)

### 3. Gestión de Roles y Permisos

#### Roles del Sistema

**ADMIN (Administrador)**

- Gestión completa de usuarios
- Configuración del sistema
- Acceso a todos los módulos
- Reportes globales y estadísticas
- Gestión de catálogos maestros

**PROFESSIONAL (Profesional)**

- Gestión de participantes asignados
- Creación y seguimiento de casos
- Registro de notas de progreso
- Consulta de catálogos
- Reportes de sus casos

**COORDINATOR (Coordinador)**

- Supervisión de profesionales
- Asignación de casos
- Reportes departamentales
- Gestión de equipos de trabajo
- Estadísticas por región

**SUPERVISOR (Supervisor)**

- Revisión de casos
- Aprobación de cierres
- Supervisión de calidad
- Reportes de rendimiento
- Auditoría de procesos

#### Matriz de Permisos

| Funcionalidad               | ADMIN | COORDINATOR | SUPERVISOR | PROFESSIONAL |
| --------------------------- | ----- | ----------- | ---------- | ------------ |
| Gestionar usuarios          | ✅    | ❌          | ❌         | ❌           |
| Ver todos los participantes | ✅    | ✅          | ✅         | ❌\*         |
| Crear participantes         | ✅    | ✅          | ✅         | ✅           |
| Ver todos los casos         | ✅    | ✅          | ✅         | ❌\*         |
| Crear casos                 | ✅    | ✅          | ✅         | ✅           |
| Cerrar casos                | ✅    | ✅          | ✅         | ✅\*\*       |
| Gestionar catálogos         | ✅    | ❌          | ❌         | ❌           |
| Reportes globales           | ✅    | ✅          | ✅         | ❌           |
| Configuración sistema       | ✅    | ❌          | ❌         | ❌           |

\*Solo sus casos asignados  
\*\*Requiere aprobación del supervisor

## 🛠️ API Endpoints

> **Importante**: La creación de nuevos usuarios se realiza exclusivamente a través del endpoint `/auth/register` en el módulo de autenticación. Los siguientes endpoints están destinados a la administración de usuarios existentes.

### Gestión de Usuarios

#### GET /api/v1/users

**Obtener todos los usuarios**

**Query Parameters:**

- `role` (opcional): Filtrar por rol
- `status` (opcional): Filtrar por estado
- `search` (opcional): Búsqueda por nombre o email
- `page` (opcional): Página (default: 1)
- `limit` (opcional): Registros por página (default: 25)

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "firstName": "Ana",
      "firstLastName": "Martínez",
      "fullName": "Ana Martínez García",
      "email": "ana.martinez@oots.gov.co",
      "profession": "Trabajadora Social",
      "role": "PROFESSIONAL",
      "status": "ACTIVE",
      "lastLoginAt": "2024-01-15T08:30:00.000Z",
      "createdAt": "2024-01-10T10:00:00.000Z"
    },
    {
      "id": 2,
      "firstName": "Carlos",
      "firstLastName": "Pérez",
      "fullName": "Carlos Pérez López",
      "email": "carlos.perez@oots.gov.co",
      "profession": "Psicólogo",
      "role": "SUPERVISOR",
      "status": "ACTIVE",
      "lastLoginAt": "2024-01-14T16:45:00.000Z",
      "createdAt": "2024-01-08T14:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 47,
    "totalPages": 2
  }
}
```

#### GET /api/v1/users/:id

**Obtener usuario específico**

**Response (200):**

```json
{
  "id": 15,
  "firstName": "María",
  "secondName": "Elena",
  "firstLastName": "González",
  "secondLastName": "Rodríguez",
  "fullName": "María Elena González Rodríguez",
  "email": "maria.gonzalez@oots.gov.co",
  "phoneNumber": "+57 300 123 4567",
  "profession": "Psicóloga",
  "license": "PSI-12345-2024",
  "specialization": "Psicología Clínica",
  "institution": "Hospital San Juan de Dios",
  "role": "PROFESSIONAL",
  "status": "ACTIVE",
  "lastLoginAt": "2024-01-15T08:30:00.000Z",
  "passwordChangedAt": "2024-01-15T11:15:00.000Z",
  "mustChangePassword": false,
  "isLocked": false,
  "failedLoginAttempts": 0,
  "preferences": {
    "language": "es",
    "timezone": "America/Bogota",
    "theme": "light",
    "emailNotifications": true,
    "dashboardLayout": "default",
    "recordsPerPage": 25,
    "defaultView": "table"
  },
  "permissions": [],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:15:00.000Z"
}
```

#### PATCH /api/v1/users/:id

**Actualizar usuario**

**Request Body:**

```json
{
  "phoneNumber": "+57 300 987 6543",
  "specialization": "Terapia Cognitivo-Conductual",
  "institution": "Clínica Mental Bogotá",
  "preferences": {
    "theme": "dark",
    "recordsPerPage": 50,
    "emailNotifications": false
  }
}
```

**Response (200):**

```json
{
  "id": 15,
  "firstName": "María",
  "secondName": "Elena",
  "firstLastName": "González",
  "secondLastName": "Rodríguez",
  "fullName": "María Elena González Rodríguez",
  "email": "maria.gonzalez@oots.gov.co",
  "phoneNumber": "+57 300 987 6543",
  "profession": "Psicóloga",
  "license": "PSI-12345-2024",
  "specialization": "Terapia Cognitivo-Conductual",
  "institution": "Clínica Mental Bogotá",
  "role": "PROFESSIONAL",
  "status": "ACTIVE",
  "preferences": {
    "language": "es",
    "timezone": "America/Bogota",
    "theme": "dark",
    "emailNotifications": false,
    "recordsPerPage": 50,
    "defaultView": "table"
  },
  "updatedAt": "2024-01-15T14:20:00.000Z"
}
```

### Gestión de Estados y Roles

#### PATCH /api/v1/users/:id/status

**Cambiar estado del usuario**

**Request Body:**

```json
{
  "status": "SUSPENDED",
  "reason": "Violación de políticas de privacidad"
}
```

**Response (200):**

```json
{
  "id": 15,
  "status": "SUSPENDED",
  "statusChangedAt": "2024-01-15T15:30:00.000Z",
  "statusChangeReason": "Violación de políticas de privacidad",
  "updatedAt": "2024-01-15T15:30:00.000Z"
}
```

#### PATCH /api/v1/users/:id/role

**Cambiar rol del usuario**

**Request Body:**

```json
{
  "role": "COORDINATOR",
  "reason": "Promoción a coordinador regional"
}
```

**Response (200):**

```json
{
  "id": 15,
  "role": "COORDINATOR",
  "roleChangedAt": "2024-01-15T16:00:00.000Z",
  "roleChangeReason": "Promoción a coordinador regional",
  "updatedAt": "2024-01-15T16:00:00.000Z"
}
```

### Gestión de Passwords

#### POST /api/v1/users/:id/reset-password

**Resetear password de usuario**

**Request Body:**

```json
{
  "sendEmail": true,
  "temporaryPassword": "NewTemp2024!"
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully",
  "temporaryPassword": "NewTemp2024!",
  "mustChangePassword": true,
  "passwordResetAt": "2024-01-15T16:30:00.000Z"
}
```

#### POST /api/v1/users/change-password

**Cambiar password propio**

**Request Body:**

```json
{
  "currentPassword": "TempPass2024!",
  "newPassword": "MySecurePass123!",
  "confirmPassword": "MySecurePass123!"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully",
  "passwordChangedAt": "2024-01-15T17:00:00.000Z",
  "mustChangePassword": false
}
```

#### POST /api/v1/users/:id/unlock

**Desbloquear usuario**

**Response (200):**

```json
{
  "message": "User unlocked successfully",
  "unlockedAt": "2024-01-15T17:15:00.000Z",
  "failedLoginAttempts": 0,
  "lockedUntil": null
}
```

### Perfil Personal

#### GET /api/v1/users/profile

**Obtener perfil del usuario autenticado**

**Response (200):**

```json
{
  "id": 15,
  "firstName": "María",
  "secondName": "Elena",
  "firstLastName": "González",
  "secondLastName": "Rodríguez",
  "fullName": "María Elena González Rodríguez",
  "email": "maria.gonzalez@oots.gov.co",
  "phoneNumber": "+57 300 987 6543",
  "profession": "Psicóloga",
  "license": "PSI-12345-2024",
  "specialization": "Terapia Cognitivo-Conductual",
  "institution": "Clínica Mental Bogotá",
  "role": "COORDINATOR",
  "status": "ACTIVE",
  "lastLoginAt": "2024-01-15T08:30:00.000Z",
  "mustChangePassword": false,
  "preferences": {
    "language": "es",
    "timezone": "America/Bogota",
    "theme": "dark",
    "emailNotifications": false,
    "recordsPerPage": 50,
    "defaultView": "table"
  },
  "permissions": ["manage_team", "view_regional_reports", "assign_cases"],
  "statistics": {
    "totalCasesAssigned": 45,
    "activeCases": 28,
    "completedCases": 17,
    "totalParticipants": 42
  }
}
```

#### PATCH /api/v1/users/profile

**Actualizar perfil propio**

**Request Body:**

```json
{
  "phoneNumber": "+57 300 111 2222",
  "specialization": "Terapia Familiar Sistémica",
  "preferences": {
    "language": "en",
    "theme": "auto",
    "emailNotifications": true
  }
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 15,
    "phoneNumber": "+57 300 111 2222",
    "specialization": "Terapia Familiar Sistémica",
    "preferences": {
      "language": "en",
      "timezone": "America/Bogota",
      "theme": "auto",
      "emailNotifications": true,
      "recordsPerPage": 50,
      "defaultView": "table"
    },
    "updatedAt": "2024-01-15T18:00:00.000Z"
  }
}
```

## 🔍 Validaciones y Reglas de Negocio

### Validaciones de Entrada

1. **Email único y válido:**
   - Formato de email válido
   - Único en todo el sistema
   - Dominios permitidos (configurable)

2. **Password seguro:**
   - Mínimo 8 caracteres
   - Al menos 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
   - No contener el nombre o email del usuario
   - No estar en lista de passwords comunes

3. **Datos profesionales:**
   - Licencia con formato válido según profesión
   - Institución registrada (opcional)
   - Especialización reconocida

### Reglas de Negocio

1. **Gestión de roles:**
   - Solo ADMIN puede cambiar roles
   - No se puede auto-asignar rol ADMIN
   - Al cambiar rol, validar permisos existentes

2. **Bloqueo de cuentas:**
   - Bloqueo automático tras 5 intentos fallidos
   - Tiempo de bloqueo: 30 minutos
   - Solo ADMIN puede desbloquear manualmente

3. **Cambio de passwords:**
   - Obligatorio cambio en primer login
   - Expiración cada 90 días
   - No reutilizar últimos 5 passwords

4. **Estados de usuario:**
   - PENDING: Usuario creado, debe activar cuenta
   - ACTIVE: Usuario activo y funcional
   - INACTIVE: Suspendido temporalmente
   - SUSPENDED: Suspendido por violaciones

### Manejo de Errores

```json
// Email duplicado (409)
{
  "message": "Email 'usuario@email.com' is already registered",
  "error": "Conflict",
  "statusCode": 409
}

// Password débil (400)
{
  "message": "Password does not meet security requirements",
  "error": "Bad Request",
  "statusCode": 400,
  "details": [
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number"
  ]
}

// Usuario bloqueado (423)
{
  "message": "Account is locked due to too many failed login attempts",
  "error": "Locked",
  "statusCode": 423,
  "lockedUntil": "2024-01-15T18:30:00.000Z"
}

// Password incorrecto (401)
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401,
  "remainingAttempts": 3
}

// Usuario no encontrado (404)
{
  "message": "User with ID 999 not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## 🧪 Testing

### Pruebas Unitarias

```typescript
describe('UsersService', () => {
  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      const createDto = {
        firstName: 'Test',
        firstLastName: 'User',
        email: 'test@oots.gov.co',
        profession: 'Psicólogo',
        role: UserRole.PROFESSIONAL,
      };

      const user = await service.createUser(createDto);

      expect(user).toBeDefined();
      expect(user.email).toBe(createDto.email);
      expect(user.password).not.toBe('defaultPassword');
      expect(user.status).toBe(UserStatus.PENDING);
      expect(user.mustChangePassword).toBe(true);
    });

    it('should throw error for duplicate email', async () => {
      const createDto = {
        firstName: 'Test',
        firstLastName: 'User',
        email: 'existing@oots.gov.co',
        profession: 'Psicólogo',
        role: UserRole.PROFESSIONAL,
      };

      await expect(service.createUser(createDto)).rejects.toThrow(
        "Email 'existing@oots.gov.co' is already registered",
      );
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      const user = new User();
      user.password = await bcrypt.hash('TestPass123!', 10);

      const isValid = await user.validatePassword('TestPass123!');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = new User();
      user.password = await bcrypt.hash('TestPass123!', 10);

      const isValid = await user.validatePassword('WrongPass');
      expect(isValid).toBe(false);
    });
  });

  describe('account locking', () => {
    it('should lock account after 5 failed attempts', async () => {
      const userId = 1;

      // Simular 5 intentos fallidos
      for (let i = 0; i < 5; i++) {
        await service.recordFailedLogin(userId);
      }

      const user = await service.findById(userId);
      expect(user.isLocked).toBe(true);
      expect(user.failedLoginAttempts).toBe(5);
    });

    it('should reset failed attempts after successful login', async () => {
      const userId = 1;
      await service.recordSuccessfulLogin(userId);

      const user = await service.findById(userId);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lastLoginAt).toBeDefined();
    });
  });
});
```

### Pruebas de Integración

```typescript
describe('UsersController (e2e)', () => {
  // Nota: La creación de usuarios se realiza a través de /auth/register
  // Este módulo solo maneja operaciones administrativas

  it('/users (GET) - should return paginated users list', () => {
    return request(app.getHttpServer())
      .get('/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.users).toBeDefined();
        expect(res.body.total).toBeDefined();
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(10);
      });
  });

  it('/users/profile (GET) - should return current user profile', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBeDefined();
        expect(res.body.role).toBeDefined();
        expect(res.body.statistics).toBeDefined();
      });
  });

  it('/users/:id/status (PATCH) - should change user status', () => {
    return request(app.getHttpServer())
      .patch(`/users/${userId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SUSPENDED', reason: 'Test suspension' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('SUSPENDED');
      });
  });
});
```

## 📊 Performance y Optimización

### Índices de Base de Datos

```sql
-- Índices para búsquedas frecuentes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Índices compuestos para consultas complejas
CREATE INDEX idx_users_status_role ON users(status, role);
CREATE INDEX idx_users_active_role ON users(status, role) WHERE status = 'ACTIVE';
```

### Caché de Usuarios

```typescript
@Injectable()
export class UsersService {
  private userCache = new Map<number, User>();
  private readonly CACHE_TTL = 300000; // 5 minutos

  async findById(id: number): Promise<User> {
    // Verificar caché
    const cached = this.userCache.get(id);
    if (cached && Date.now() - cached['cachedAt'] < this.CACHE_TTL) {
      return cached;
    }

    // Consultar base de datos
    const user = await this.userRepository.findOne({ where: { id } });

    if (user) {
      user['cachedAt'] = Date.now();
      this.userCache.set(id, user);
    }

    return user;
  }

  invalidateUserCache(id: number): void {
    this.userCache.delete(id);
  }
}
```

## 📋 Reportes y Estadísticas

### Dashboard de Usuarios

```json
{
  "overview": {
    "totalUsers": 125,
    "activeUsers": 98,
    "pendingUsers": 15,
    "suspendedUsers": 12,
    "lastWeekLogins": 87
  },
  "byRole": [
    {
      "role": "PROFESSIONAL",
      "count": 85,
      "percentage": 68.0
    },
    {
      "role": "COORDINATOR",
      "count": 25,
      "percentage": 20.0
    },
    {
      "role": "SUPERVISOR",
      "count": 10,
      "percentage": 8.0
    },
    {
      "role": "ADMIN",
      "count": 5,
      "percentage": 4.0
    }
  ],
  "activityMetrics": {
    "averageLoginsPerUser": 15.5,
    "usersLoggedInToday": 45,
    "usersWithExpiredPasswords": 8,
    "lockedAccounts": 2
  },
  "professionalDistribution": [
    {
      "profession": "Psicólogo",
      "count": 52,
      "percentage": 41.6
    },
    {
      "profession": "Trabajador Social",
      "count": 38,
      "percentage": 30.4
    },
    {
      "profession": "Médico",
      "count": 20,
      "percentage": 16.0
    },
    {
      "profession": "Enfermero",
      "count": 15,
      "percentage": 12.0
    }
  ]
}
```

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas

1. **Autenticación Multifactor (MFA)**: SMS, email, o app authenticator
2. **Single Sign-On (SSO)**: Integración con sistemas gubernamentales
3. **Gestión de Equipos**: Organización jerárquica de usuarios
4. **Permisos Granulares**: Control fino de permisos por funcionalidad
5. **Auditoría Completa**: Log detallado de todas las acciones
6. **Notificaciones**: Sistema de notificaciones internas
7. **API Keys**: Autenticación programática para integraciones

### Mejoras Técnicas

1. **OAuth 2.0**: Estándar de autenticación moderna
2. **JWT Refresh Tokens**: Renovación automática de tokens
3. **Rate Limiting**: Control de velocidad de requests por usuario
4. **Session Management**: Gestión avanzada de sesiones activas
5. **Password Policies**: Políticas configurables por organización

---

_Documentación del Módulo de Usuarios - OOTS Colombia v1.0.0_
