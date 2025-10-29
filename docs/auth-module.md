# 🔐 Módulo de Autenticación - Documentación Técnica

## 📋 Descripción General

El módulo de autenticación implementa un sistema de seguridad robusto basado en **JWT (JSON Web Tokens)** con **Passport.js**, proporcionando autenticación y autorización para toda la aplicación OOTS Colombia.

## 🏗️ Arquitectura

```
auth/
├── auth.controller.ts         # Controlador de endpoints de autenticación
├── auth.service.ts           # Lógica de negocio de autenticación
├── auth.module.ts            # Configuración del módulo
├── dto/
│   └── auth.dto.ts           # DTOs de validación
├── guards/
│   ├── jwt-auth.guard.ts     # Guard JWT para rutas protegidas
│   └── local-auth.guard.ts   # Guard para validación de credenciales
├── strategies/
│   ├── jwt.strategy.ts       # Estrategia JWT de Passport
│   └── local.strategy.ts     # Estrategia Local de Passport
└── decorators/
    ├── current-user.decorator.ts  # Decorator para obtener usuario actual
    └── public.decorator.ts        # Decorator para rutas públicas
```

## 🔧 Componentes del Sistema

### 1. AuthController

**Responsabilidades:**

- Manejar endpoints de registro, login y perfil
- Validar datos de entrada con DTOs
- Generar respuestas estandarizadas

**Endpoints:**

#### POST /api/v1/auth/register

Registra un nuevo usuario en el sistema utilizando el UsersService existente.

**Request:**

```json
{
  "firstName": "Juan",
  "secondName": "Carlos",
  "firstLastName": "Pérez",
  "secondLastName": "García",
  "email": "juan.perez@ejemplo.com",
  "password": "password123",
  "phoneNumber": "+57 300 123 4567",
  "position": "Psicólogo Clínico",
  "organization": "Centro de Bienestar Familiar",
  "documentNumber": "12345678",
  "address": "Carrera 10 # 15-20",
  "city": "Bogotá",
  "birthDate": "1990-05-15",
  "documentTypeId": 1
}
```

**Response (201):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "firstName": "Juan",
    "firstLastName": "Pérez",
    "email": "juan.perez@ejemplo.com",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /api/v1/auth/login

Autentica un usuario existente.

**Request:**

```json
{
  "email": "juan.perez@ejemplo.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "firstName": "Juan",
    "firstLastName": "Pérez",
    "email": "juan.perez@ejemplo.com",
    "status": "ACTIVE"
  }
}
```

#### GET /api/v1/auth/profile

Obtiene el perfil del usuario autenticado.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "id": 1,
  "firstName": "Juan",
  "secondName": "Carlos",
  "firstLastName": "Pérez",
  "secondLastName": "García",
  "email": "juan.perez@ejemplo.com",
  "phoneNumber": "+57 300 123 4567",
  "position": "Psicólogo Clínico",
  "organization": "Centro de Bienestar Familiar",
  "documentNumber": "12345678",
  "address": "Carrera 10 # 15-20",
  "city": "Bogotá",
  "birthDate": "1990-05-15",
  "documentType": {
    "id": 1,
    "name": "Cédula de Ciudadanía"
  },
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. AuthService

**Responsabilidades:**

- Registrar nuevos usuarios (integrado con UsersService)
- Validar credenciales de login
- Generar y validar tokens JWT
- Gestionar el perfil del usuario

**Métodos principales:**

#### register(registerDto: RegisterDto)

```typescript
async register(registerDto: RegisterDto): Promise<any> {
  // Convierte RegisterDto a CreateUserDto
  const createUserDto: CreateUserDto = {
    // ... mapeo de campos
  };

  // Usa UsersService.create() para crear el usuario
  const user = await this.usersService.create(createUserDto);

  // Genera JWT token
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    firstLastName: user.firstLastName,
  };

  const access_token = this.jwtService.sign(payload);

  return {
    access_token,
    token_type: 'Bearer',
    expires_in: 3600,
    user,
  };
}
```

#### validateUserCredentials(email: string, password: string)

Valida las credenciales del usuario para el login.

#### validateUser(payload: JwtPayload)

Valida el payload del JWT para rutas protegidas.

#### getProfile(userId: number)

Obtiene el perfil completo del usuario incluyendo relaciones.

### 3. Guards

#### JwtAuthGuard

- **Propósito**: Proteger rutas que requieren autenticación
- **Aplicación**: Guard global en AppModule
- **Funcionamiento**: Valida el token JWT en el header Authorization

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

#### LocalAuthGuard

- **Propósito**: Validar credenciales en el endpoint de login
- **Aplicación**: Específicamente en POST /auth/login
- **Funcionamiento**: Usa LocalStrategy para validar email/password

### 4. Strategies

#### JwtStrategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    return this.authService.validateUser(payload);
  }
}
```

#### LocalStrategy

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUserCredentials(
      email,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }
}
```

### 5. Decorators

#### @Public()

Marca rutas como públicas (sin autenticación requerida).

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Uso:
@Public()
@Get('catalogs')
async getCatalogs() {
  // Esta ruta es accesible sin token
}
```

#### @CurrentUser()

Inyecta el usuario actual en el controlador.

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Uso:
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

### 6. DTOs

#### RegisterDto

Validación para registro de usuarios (extendido del CreateUserDto):

```typescript
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsOptional()
  secondName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstLastName: string;

  @IsString()
  @IsOptional()
  secondLastName?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  position?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  organization?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  documentNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsNumber()
  @IsNotEmpty()
  documentTypeId: number;
}
```

#### LoginDto

```typescript
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

## 🔒 Seguridad Implementada

### 1. Hash de Contraseñas

- **Algoritmo**: bcryptjs
- **Rounds**: 12 (configurado en User entity)
- **Proceso**: Hash automático en @BeforeInsert y @BeforeUpdate

### 2. JWT Configuration

```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
    },
  }),
});
```

### 3. Validaciones de Entrada

- **Email único**: Validado en UsersService
- **Teléfono único**: Validado en UsersService (si se proporciona)
- **Formato de email**: Validado con @IsEmail()
- **Longitud de contraseña**: Mínimo 8 caracteres
- **Campos requeridos**: Validados con @IsNotEmpty()

### 4. Manejo de Errores

#### Errores de Registro

```json
// Email duplicado (409)
{
  "message": "El email ya está registrado",
  "error": "Conflict",
  "statusCode": 409
}

// Teléfono duplicado (409)
{
  "message": "El número de teléfono ya está registrado",
  "error": "Conflict",
  "statusCode": 409
}

// Validación fallida (400)
{
  "message": [
    "El primer nombre debe ser un texto",
    "El email es requerido",
    "La contraseña debe tener al menos 8 caracteres"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

#### Errores de Login

```json
// Credenciales inválidas (401)
{
  "message": "Credenciales inválidas",
  "error": "Unauthorized",
  "statusCode": 401
}
```

#### Errores de Token

```json
// Token inválido o expirado (401)
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

## 🔄 Flujo de Autenticación

### 1. Registro

```mermaid
sequenceDiagram
    participant Cliente
    participant AuthController
    participant AuthService
    participant UsersService
    participant Database
    participant JwtService

    Cliente->>AuthController: POST /auth/register
    AuthController->>AuthService: register(dto)
    AuthService->>UsersService: create(createUserDto)
    UsersService->>Database: Verificar email único
    Database-->>UsersService: Email disponible
    UsersService->>Database: Crear usuario (hash password)
    Database-->>UsersService: Usuario creado
    UsersService-->>AuthService: Usuario sin password
    AuthService->>JwtService: sign(payload)
    JwtService-->>AuthService: JWT token
    AuthService-->>AuthController: {token, user}
    AuthController-->>Cliente: 201 Created
```

### 2. Login

```mermaid
sequenceDiagram
    participant Cliente
    participant AuthController
    participant LocalAuthGuard
    participant LocalStrategy
    participant AuthService
    participant JwtService

    Cliente->>AuthController: POST /auth/login
    AuthController->>LocalAuthGuard: Validar credenciales
    LocalAuthGuard->>LocalStrategy: validate(email, password)
    LocalStrategy->>AuthService: validateUserCredentials()
    AuthService-->>LocalStrategy: Usuario validado
    LocalStrategy-->>LocalAuthGuard: Usuario
    LocalAuthGuard-->>AuthController: Usuario
    AuthController->>JwtService: sign(payload)
    JwtService-->>AuthController: JWT token
    AuthController-->>Cliente: {token, user}
```

### 3. Acceso a Ruta Protegida

```mermaid
sequenceDiagram
    participant Cliente
    participant JwtAuthGuard
    participant JwtStrategy
    participant AuthService

    Cliente->>JwtAuthGuard: Request + Bearer Token
    JwtAuthGuard->>JwtStrategy: validate(payload)
    JwtStrategy->>AuthService: validateUser(payload)
    AuthService-->>JwtStrategy: Usuario activo
    JwtStrategy-->>JwtAuthGuard: Usuario validado
    JwtAuthGuard-->>Cliente: Acceso autorizado
```

## 🧪 Testing

### Pruebas de Autenticación

```typescript
describe('AuthController', () => {
  it('should register a new user', async () => {
    const registerDto = {
      firstName: 'Juan',
      firstLastName: 'Pérez',
      email: 'juan@test.com',
      password: 'password123',
      // ... otros campos
    };

    const result = await controller.register(registerDto);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe(registerDto.email);
  });

  it('should login with valid credentials', async () => {
    const loginDto = {
      email: 'juan@test.com',
      password: 'password123',
    };

    const result = await controller.login(mockUser);

    expect(result).toHaveProperty('access_token');
    expect(result.token_type).toBe('Bearer');
  });
});
```

## 🚀 Configuración de Producción

### Variables de Entorno

```env
JWT_SECRET=tu-clave-secreta-muy-segura-y-larga
JWT_EXPIRES_IN=24h
```

### Recomendaciones de Seguridad

1. **JWT Secret**: Usar una clave robusta de al menos 32 caracteres
2. **HTTPS**: Siempre usar HTTPS en producción
3. **Token Expiration**: Configurar tiempo de expiración apropiado
4. **Rate Limiting**: Limitar intentos de login
5. **CORS**: Configurar CORS para dominios específicos

## 📊 Monitoreo

### Métricas de Autenticación

- Número de registros por día
- Intentos de login fallidos
- Tokens expirados
- Tiempo de respuesta de endpoints

### Logs de Seguridad

- Intentos de acceso no autorizados
- Tokens inválidos o expirados
- Registros exitosos y fallidos
- Cambios en perfiles de usuario

---

_Documentación del Módulo de Autenticación - OOTS Colombia v1.0.0_
