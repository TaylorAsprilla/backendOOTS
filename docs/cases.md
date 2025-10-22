# 📁 Sistema de Gestión de Casos

## 🎯 Descripción General

El sistema de gestión de casos permite asociar múltiples consultas y seguimientos a cada participante del sistema OOTS. Cada caso es identificado mediante un número único secuencial y puede pasar por diferentes estados durante su ciclo de vida.

## 🏗️ Arquitectura

### Entidades Principales

#### **CaseEntity** (Tabla: `cases`)

```typescript
{
  id: number; // Primary key autoincrement
  caseNumber: string; // Número único (ej: "CASE-0001")
  title: string; // Título breve del caso
  description: string; // Descripción detallada
  status: CaseStatus; // Estado actual del caso
  participantId: number; // FK al participante
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
}
```

#### **CaseStatus** (Enum)

- `open`: Caso abierto, requiere atención
- `in_progress`: Caso en proceso de atención
- `closed`: Caso cerrado/resuelto

### Relaciones

- **ManyToOne**: `Case` → `Participant` (Un caso pertenece a un participante)
- **OneToMany**: `Participant` → `Case[]` (Un participante puede tener múltiples casos)

## 🔧 Endpoints API

### Base URL: `/cases`

| Método | Endpoint                  | Descripción                     |
| ------ | ------------------------- | ------------------------------- |
| POST   | `/participants/:id/cases` | Crear nuevo caso                |
| GET    | `/participants/:id/cases` | Listar casos de un participante |
| GET    | `/cases/:id`              | Obtener caso por ID             |
| PATCH  | `/cases/:id/status`       | Actualizar estado del caso      |
| GET    | `/cases`                  | Listar todos los casos          |

## 📝 Uso de la API

### 1. Crear un nuevo caso

```bash
POST /participants/1/cases
Content-Type: application/json

{
  "title": "Consulta por ansiedad post-separación",
  "description": "Paciente presenta síntomas de ansiedad y dificultades para conciliar el sueño tras separación matrimonial reciente. Requiere acompañamiento psicológico y orientación espiritual."
}
```

**Respuesta:**

```json
{
  "id": 1,
  "caseNumber": "CASE-0001",
  "title": "Consulta por ansiedad post-separación",
  "description": "Paciente presenta síntomas de ansiedad...",
  "status": "open",
  "participantId": 1,
  "createdAt": "2024-10-22T10:30:00.000Z",
  "updatedAt": "2024-10-22T10:30:00.000Z"
}
```

### 2. Listar casos de un participante

```bash
GET /participants/1/cases
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "caseNumber": "CASE-0001",
    "title": "Consulta por ansiedad post-separación",
    "status": "in_progress",
    "createdAt": "2024-10-22T10:30:00.000Z"
  },
  {
    "id": 2,
    "caseNumber": "CASE-0002",
    "title": "Seguimiento familiar",
    "status": "open",
    "createdAt": "2024-10-21T14:15:00.000Z"
  }
]
```

### 3. Obtener detalles de un caso

```bash
GET /cases/1
```

**Respuesta:**

```json
{
  "id": 1,
  "caseNumber": "CASE-0001",
  "title": "Consulta por ansiedad post-separación",
  "description": "Descripción completa del caso...",
  "status": "in_progress",
  "participantId": 1,
  "participant": {
    "id": 1,
    "firstName": "María",
    "firstLastName": "González",
    "email": "maria.gonzalez@email.com"
  },
  "createdAt": "2024-10-22T10:30:00.000Z",
  "updatedAt": "2024-10-22T11:45:00.000Z"
}
```

### 4. Actualizar estado del caso

```bash
PATCH /cases/1/status
Content-Type: application/json

{
  "status": "closed"
}
```

## 🔐 Validaciones y Reglas de Negocio

### **Transiciones de Estado Válidas:**

| Estado Actual | Estados Permitidos      |
| ------------- | ----------------------- |
| `open`        | `in_progress`, `closed` |
| `in_progress` | `open`, `closed`        |
| `closed`      | `open`, `in_progress`   |

### **Validaciones de Entrada:**

- **title**: Mínimo 5 caracteres, máximo 200 caracteres
- **description**: Mínimo 10 caracteres
- **participantId**: Debe existir en la base de datos

### **Generación de Números de Caso:**

- Formato: `CASE-XXXX` donde XXXX es secuencial con ceros a la izquierda
- Ejemplos: `CASE-0001`, `CASE-0002`, `CASE-0050`, `CASE-1234`
- Único en toda la base de datos

## 🚀 Flujo de Trabajo Recomendado

### **Flujo Típico:**

1. **Participante solicita consulta** → Crear caso con estado `open`
2. **Se asigna profesional** → Cambiar estado a `in_progress`
3. **Se completa atención** → Cambiar estado a `closed`
4. **Se requiere seguimiento** → Reabrir caso o crear nuevo caso

### **Casos de Uso:**

- **Consultas iniciales**: Crear caso para nueva consulta
- **Seguimientos**: Actualizar estado existente o crear nuevo caso
- **Reportes**: Consultar todos los casos por participante
- **Auditoría**: Revisar historial de cambios de estado

## 🔍 Integración con Otros Módulos

### **Con Participantes:**

- Cada caso está ligado a un participante específico
- Al crear caso se valida existencia del participante

### **Con Autenticación:**

- Los endpoints pueden protegerse con JWT si es necesario
- Se puede agregar auditoria de quién modifica cada caso

### **Extensiones Futuras:**

- Agregar comentarios/notas por caso
- Asignación de profesionales responsables
- Notificaciones automáticas por cambios de estado
- Reportes estadísticos por estado y fechas

## 📊 Casos de Error

| Código | Descripción                   | Ejemplo                                  |
| ------ | ----------------------------- | ---------------------------------------- |
| 404    | Participante no encontrado    | Crear caso para participante inexistente |
| 404    | Caso no encontrado            | Buscar caso con ID inválido              |
| 400    | Transición de estado inválida | Cambiar de `open` a estado inexistente   |
| 400    | Datos de entrada inválidos    | Título muy corto o descripción vacía     |

---

## 🧩 Resultado del Sistema

✅ **Casos únicos identificables** con numeración automática  
✅ **Gestión completa del ciclo de vida** de cada consulta  
✅ **API REST coherente** con validaciones robustas  
✅ **Relaciones bien definidas** con participantes  
✅ **Sistema escalable** para futuras extensiones
