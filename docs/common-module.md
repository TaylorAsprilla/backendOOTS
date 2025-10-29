# 🔧 Módulo Common - Documentación Técnica

## 📋 Descripción General

El módulo **Common** es el módulo transversal del sistema OOTS Colombia que proporciona **utilidades, constantes, pipes, decoradores y enums** compartidos por todos los demás módulos. Este módulo centraliza la funcionalidad común y garantiza la consistencia en toda la aplicación.

## 🏗️ Arquitectura

```
common/
├── index.ts                     # Barrel export de todas las utilidades
├── enums/
│   ├── index.ts                 # Export central de enums
│   └── user-status.enum.ts      # Enum de estados de usuario
├── decorators/
│   ├── public.decorator.ts      # Decorador para rutas públicas
│   ├── roles.decorator.ts       # Decorador para control de roles
│   └── current-user.decorator.ts # Decorador para obtener usuario actual
├── pipes/
│   ├── validation.pipe.ts       # Pipe personalizado de validación
│   ├── transform.pipe.ts        # Pipe de transformación de datos
│   └── file-validation.pipe.ts  # Pipe para validación de archivos
├── filters/
│   ├── http-exception.filter.ts # Filtro global de excepciones
│   └── validation-exception.filter.ts # Filtro para errores de validación
├── interceptors/
│   ├── logging.interceptor.ts   # Interceptor de logging
│   ├── transform.interceptor.ts # Interceptor de transformación de respuesta
│   └── timeout.interceptor.ts   # Interceptor de timeout
├── guards/
│   ├── jwt-auth.guard.ts        # Guard JWT personalizado
│   ├── roles.guard.ts           # Guard de roles
│   └── throttle.guard.ts        # Guard de rate limiting
├── interfaces/
│   ├── paginated-result.interface.ts # Interfaz para paginación
│   ├── api-response.interface.ts     # Interfaz para respuestas API
│   └── user-context.interface.ts     # Interfaz de contexto de usuario
├── constants/
│   ├── app.constants.ts         # Constantes de aplicación
│   ├── validation.constants.ts  # Constantes de validación
│   └── error-messages.constants.ts # Mensajes de error estandarizados
├── utils/
│   ├── password.util.ts         # Utilidades para passwords
│   ├── date.util.ts            # Utilidades de fecha
│   ├── string.util.ts          # Utilidades de string
│   └── file.util.ts            # Utilidades de archivos
└── types/
    ├── request.types.ts         # Tipos personalizados para requests
    └── response.types.ts        # Tipos personalizados para responses
```

## 📊 Componentes Principales

### 1. Enums Compartidos

#### UserStatus (Estado de Usuario)

```typescript
export enum UserStatus {
  ACTIVE = 'ACTIVE', // Usuario activo y funcional
  INACTIVE = 'INACTIVE', // Usuario temporalmente inactivo
  PENDING = 'PENDING', // Pendiente de activación
  SUSPENDED = 'SUSPENDED', // Suspendido por violaciones
}
```

#### CaseStatus (Estado de Caso)

```typescript
export enum CaseStatus {
  ACTIVE = 'ACTIVE', // Caso recién creado
  IN_PROGRESS = 'IN_PROGRESS', // En proceso de intervención
  COMPLETED = 'COMPLETED', // Intervención completada
  CLOSED = 'CLOSED', // Caso cerrado definitivamente
}
```

#### UserRole (Roles del Sistema)

```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
  COORDINATOR = 'COORDINATOR',
  SUPERVISOR = 'SUPERVISOR',
}
```

#### ParticipantStatus (Estado de Participante)

```typescript
export enum ParticipantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
}
```

### 2. Decoradores Personalizados

#### @Public() - Rutas Públicas

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas como públicas (sin autenticación JWT)
 * @example
 * @Public()
 * @Post('login')
 * async login(@Body() loginDto: LoginDto) {
 *   return this.authService.login(loginDto);
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### @Roles() - Control de Roles

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar roles requeridos para acceder a una ruta
 * @param roles - Array de roles permitidos
 * @example
 * @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
 * @Get('admin/users')
 * async getUsers() {
 *   return this.usersService.findAll();
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

#### @CurrentUser() - Usuario Actual

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Decorador para obtener el usuario autenticado actual
 * @example
 * @Get('profile')
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 3. Pipes de Validación

#### ValidationPipe Personalizado

```typescript
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Injectable()
export class CustomValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true, // Remover propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
      transform: true, // Transformar automáticamente tipos
      transformOptions: {
        enableImplicitConversion: true, // Conversión implícita de tipos
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = this.extractErrorMessages(errors);
        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
          statusCode: 400,
        });
      },
    });
  }

  private extractErrorMessages(errors: ValidationError[]): string[] {
    return errors.reduce((messages, error) => {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
      if (error.children && error.children.length > 0) {
        messages.push(...this.extractErrorMessages(error.children));
      }
      return messages;
    }, []);
  }
}
```

#### FileValidationPipe

```typescript
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

interface FileValidationOptions {
  maxSize?: number; // Tamaño máximo en bytes
  allowedMimeTypes?: string[]; // Tipos MIME permitidos
  allowedExtensions?: string[]; // Extensiones permitidas
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {}

  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validar tamaño
    if (this.options.maxSize && file.size > this.options.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.options.maxSize} bytes`,
      );
    }

    // Validar tipo MIME
    if (
      this.options.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    // Validar extensión
    if (this.options.allowedExtensions) {
      const extension = file.originalname.split('.').pop()?.toLowerCase();
      if (!extension || !this.options.allowedExtensions.includes(extension)) {
        throw new BadRequestException(
          `Invalid file extension. Allowed extensions: ${this.options.allowedExtensions.join(', ')}`,
        );
      }
    }

    return file;
  }
}
```

### 4. Filtros de Excepciones

#### HttpExceptionFilter Global

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exceptionResponse;
      }
    }

    // Log del error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // Respuesta estandarizada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errors && { errors }),
    };

    response.status(status).json(errorResponse);
  }
}
```

### 5. Interceptors

#### LoggingInterceptor

```typescript
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;
    const userId = request.user?.id || 'Anonymous';

    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - User: ${userId} - IP: ${ip} - UA: ${userAgent}`,
    );

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = Date.now() - startTime;

        this.logger.log(
          `Completed Request: ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`,
        );
      }),
    );
  }
}
```

#### TransformInterceptor

```typescript
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
```

### 6. Guards Personalizados

#### JwtAuthGuard Personalizado

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

#### RolesGuard

```typescript
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No hay roles requeridos, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
```

### 7. Interfaces Compartidas

#### PaginatedResult

```typescript
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### ApiResponse

```typescript
export interface StandardApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
  errors?: string[];
}
```

#### UserContext

```typescript
export interface UserContext {
  id: number;
  email: string;
  role: UserRole;
  permissions: string[];
  lastLoginAt: Date;
}
```

### 8. Constantes Compartidas

#### Constantes de Aplicación

```typescript
export const APP_CONSTANTS = {
  // Configuración JWT
  JWT: {
    EXPIRES_IN: '24h',
    REFRESH_EXPIRES_IN: '7d',
  },

  // Paginación
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 25,
    MAX_LIMIT: 100,
  },

  // Archivos
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGES: ['jpg', 'jpeg', 'png', 'gif'],
    ALLOWED_DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
  },

  // Cache
  CACHE: {
    TTL: 300, // 5 minutos
    MAX_ITEMS: 1000,
  },

  // Rate Limiting
  THROTTLE: {
    TTL: 60, // 1 minuto
    LIMIT: 100, // 100 requests por minuto
  },
} as const;
```

#### Mensajes de Error

```typescript
export const ERROR_MESSAGES = {
  // Autenticación
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    ACCOUNT_LOCKED: 'Account is locked due to too many failed attempts',
    ACCOUNT_SUSPENDED: 'Account has been suspended',
  },

  // Validación
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_EMAIL: 'Invalid email format',
    WEAK_PASSWORD: 'Password does not meet security requirements',
    INVALID_DATE: 'Invalid date format',
    FILE_TOO_LARGE: 'File size exceeds maximum allowed',
  },

  // Recursos
  RESOURCE: {
    NOT_FOUND: (resource: string) => `${resource} not found`,
    ALREADY_EXISTS: (resource: string) => `${resource} already exists`,
    CANNOT_DELETE: (resource: string) =>
      `Cannot delete ${resource} - it is in use`,
  },

  // Sistema
  SYSTEM: {
    INTERNAL_ERROR: 'Internal server error occurred',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    DATABASE_ERROR: 'Database operation failed',
  },
} as const;
```

### 9. Utilidades Compartidas

#### PasswordUtil

```typescript
import * as bcrypt from 'bcryptjs';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash de password con bcrypt
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verificar password
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generar password temporal seguro
   */
  static generateTemporary(): string {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Garantizar al menos un carácter de cada tipo
    password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz');
    password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    password += this.getRandomChar('0123456789');
    password += this.getRandomChar('!@#$%^&*');

    // Completar con caracteres aleatorios
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(charset);
    }

    // Mezclar los caracteres
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  private static getRandomChar(charset: string): string {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }

  /**
   * Validar fortaleza de password
   */
  static validateStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

#### DateUtil

```typescript
export class DateUtil {
  /**
   * Formatear fecha para Colombia (dd/mm/yyyy)
   */
  static formatToColombian(date: Date): string {
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Formatear fecha y hora completa
   */
  static formatToColombianDateTime(date: Date): string {
    return date.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Calcular edad en años
   */
  static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Obtener rango de fechas del mes actual
   */
  static getCurrentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return { start, end };
  }

  /**
   * Verificar si una fecha es del futuro
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Convertir string a fecha con validación
   */
  static parseDate(dateString: string): Date | null {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
}
```

#### StringUtil

```typescript
export class StringUtil {
  /**
   * Capitalizar primera letra de cada palabra
   */
  static capitalize(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generar slug URL-friendly
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno
  }

  /**
   * Formatear número de documento colombiano
   */
  static formatDocument(document: string): string {
    // Remover caracteres no numéricos
    const cleaned = document.replace(/\D/g, '');

    // Formatear con puntos como separadores de miles
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /**
   * Formatear número de teléfono colombiano
   */
  static formatPhoneNumber(phone: string): string {
    // Remover caracteres no numéricos
    const cleaned = phone.replace(/\D/g, '');

    // Formato: +57 300 123 4567
    if (cleaned.length === 10) {
      return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    return phone; // Retornar original si no coincide formato esperado
  }

  /**
   * Truncar texto con elipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }

  /**
   * Limpiar y validar email
   */
  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
}
```

## 🎯 Uso del Módulo Common

### Importación en otros módulos

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  GlobalHttpExceptionFilter,
  JwtAuthGuard,
  LoggingInterceptor,
  CustomValidationPipe,
} from './common';

@Module({
  providers: [
    // Providers globales
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule {}
```

### Uso en controladores

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  Public,
  Roles,
  CurrentUser,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '../common';
import { User } from '../users/entities/user.entity';

@Controller('api/v1/example')
@UseGuards(RolesGuard)
@UseInterceptors(TransformInterceptor)
export class ExampleController {
  @Public()
  @Get('public')
  getPublicData() {
    return { message: 'This is public data' };
  }

  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @Get('admin')
  getAdminData(@CurrentUser() user: User) {
    return { message: `Hello ${user.fullName}`, role: user.role };
  }
}
```

## 🧪 Testing

### Pruebas Unitarias de Utilidades

```typescript
describe('PasswordUtil', () => {
  describe('generateTemporary', () => {
    it('should generate password with required complexity', () => {
      const password = PasswordUtil.generateTemporary();
      const validation = PasswordUtil.validateStrength(password);

      expect(validation.isValid).toBe(true);
      expect(password.length).toBe(12);
    });
  });

  describe('validateStrength', () => {
    it('should validate strong password', () => {
      const result = PasswordUtil.validateStrength('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const result = PasswordUtil.validateStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('DateUtil', () => {
  describe('calculateAge', () => {
    it('should calculate correct age', () => {
      const birthDate = new Date('1990-01-01');
      const age = DateUtil.calculateAge(birthDate);
      expect(age).toBeGreaterThan(30);
    });
  });

  describe('formatToColombian', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = DateUtil.formatToColombian(date);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
```

## 📋 Contribución al Módulo Common

### Estándares de Código

1. **Naming Conventions:**
   - Clases: PascalCase (ej: `PasswordUtil`)
   - Métodos: camelCase (ej: `validateStrength`)
   - Constantes: UPPER_SNAKE_CASE (ej: `APP_CONSTANTS`)
   - Archivos: kebab-case (ej: `password.util.ts`)

2. **Documentación:**
   - Todos los métodos públicos deben tener JSDoc
   - Incluir ejemplos de uso cuando sea necesario
   - Especificar tipos de parámetros y retorno

3. **Testing:**
   - Cobertura mínima del 80%
   - Pruebas para casos edge
   - Mocks apropiados para dependencias

### Agregar Nueva Utilidad

```typescript
// 1. Crear archivo en utils/
// utils/new-util.ts
export class NewUtil {
  /**
   * Descripción de la funcionalidad
   * @param param - Descripción del parámetro
   * @returns Descripción del retorno
   * @example
   * const result = NewUtil.method('example');
   */
  static method(param: string): string {
    // Implementación
    return param;
  }
}

// 2. Exportar en index.ts
// common/index.ts
export * from './utils/new-util';

// 3. Agregar tests
// utils/new-util.spec.ts
describe('NewUtil', () => {
  it('should work correctly', () => {
    expect(NewUtil.method('test')).toBe('test');
  });
});
```

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas

1. **Caching Avanzado**: Redis para cache distribuido
2. **Monitoring**: Métricas y health checks
3. **Rate Limiting**: Implementación más sofisticada
4. **Internacionalización**: Soporte multi-idioma completo
5. **Audit Trail**: Sistema de auditoría transversal
6. **Event System**: Sistema de eventos para módulos

### Mejoras Técnicas

1. **TypeScript Estricto**: Configuración más restrictiva
2. **ESLint/Prettier**: Reglas más estrictas de formato
3. **Performance**: Optimizaciones de rendimiento
4. **Security**: Más validaciones de seguridad
5. **Testing**: Coverage del 100% en utilidades críticas

---

_Documentación del Módulo Common - OOTS Colombia v1.0.0_
