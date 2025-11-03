# 📚 Ejemplos de API - Sistema OOTS

## Índice de Documentación

Esta carpeta contiene ejemplos completos de uso de las APIs del sistema OOTS después de la reestructuración Case-centric.

## 🏗️ Arquitectura del Sistema

### Antes de la Reestructuración

```
Participant → [Información Médica Directa]
```

### Después de la Reestructuración (Actual)

```
Participant → [Información Personal] → Case → [Información Médica]
                                    → Case → [Información Médica]
                                    → Case → [Información Médica]
```

## 📖 Documentaciones Disponibles

### 🔐 [Autenticación](./auth-examples.md)

- Login de usuarios
- Manejo de tokens JWT
- Refresh tokens
- Logout seguro

### 👤 [Gestión de Usuarios](./user-examples.md)

- Crear usuarios del sistema
- Gestión de roles y permisos
- Actualización de usuarios
- Consultas de usuarios

### 📊 [Catálogos del Sistema](./catalog-examples.md)

- Tipos de documento
- Géneros
- Estados civiles
- Seguros de salud
- Relaciones familiares
- Niveles académicos

### 👥 [**Gestión de Participantes**](../cases.md) ⭐

**📋 INFORMACIÓN PERSONAL Y DEMOGRÁFICA**

- Datos personales completos
- Contactos de emergencia
- Miembros de familia
- Documentación en casos.md

### 🏥 [**Gestión de Casos**](../cases.md) ⭐

**🩺 INFORMACIÓN MÉDICA Y CLÍNICA**

- Historia biopsicosocial
- Motivos de consulta
- Evaluaciones médicas
- Planes de intervención
- Notas de progreso
- Referencias médicas
- Documentación completa en cases.md

## 🚀 Flujo de Trabajo Recomendado

### 1. **Configuración Inicial**

```bash
# 1. Autenticarse
POST /auth/login

# 2. Obtener catálogos necesarios
GET /catalog/document-types
GET /catalog/genders
GET /catalog/marital-statuses
# ... otros catálogos
```

### 2. **Crear Participante**

```bash
# Crear participante con información personal
POST /participants
{
  "firstName": "María",
  "firstLastName": "García",
  "phoneNumber": "+57 301 234 5678",
  "documentTypeId": 1,
  # ... información personal completa
  "familyMembers": [...],  # Opcional
  "identifiedSituations": [...],  # Opcional
}
```

📖 **[Ver ejemplos completos →](../cases.md)**

### 3. **Crear Caso(s) con Información Médica**

```bash
# Crear caso con información médica
POST /cases
{
  "participantId": 15,
  "title": "Primera consulta por ansiedad",
  "description": "Descripción detallada...",
  "bioPsychosocialHistory": {...},  # Opcional
  "consultationReason": {...},     # Opcional
  "assessment": {...},             # Opcional
  # ... toda la información médica
}
```

📖 **[Ver ejemplos completos →](../cases.md)**

### 4. **Gestión Continua**

```bash
# Consultar participantes
GET /participants

# Consultar casos de un participante
GET /participants/{id}/cases

# Actualizar estado de caso
PATCH /cases/{id}/status

# Agregar notas de progreso
# (Al crear nuevo caso o actualizar existente)
```

## 🔄 Casos de Uso Comunes

### 🏃‍♀️ Flujo Rápido - Participante Simple

```json
// 1. Participante mínimo
POST /participants { "firstName": "Juan", ... }

// 2. Caso básico
POST /cases { "participantId": 1, "title": "Primera consulta", ... }
```

### 🏥 Flujo Completo - Caso Médico Complejo

```json
// 1. Participante con familia
POST /participants {
  "firstName": "María",
  "familyMembers": [...],
  "identifiedSituations": [...]
}

// 2. Caso con información médica completa
POST /cases {
  "participantId": 15,
  "title": "Trastorno ansioso-depresivo",
  "bioPsychosocialHistory": {...},
  "mentalHealthHistory": {...},
  "assessment": {...},
  "interventionPlans": [...],
  "progressNotes": [...]
}
```

### 👨‍👩‍👧‍👦 Flujo Familiar - Múltiples Casos

```json
// 1. Participante principal
POST /participants { "firstName": "Laura", "familyMembers": [...] }

// 2. Caso individual
POST /cases { "participantId": 20, "title": "Consulta individual" }

// 3. Caso familiar
POST /cases { "participantId": 20, "title": "Terapia familiar" }

// 4. Caso de pareja
POST /cases { "participantId": 20, "title": "Terapia de pareja" }
```

## ⚡ Tips de Implementación

### 🎯 Mejores Prácticas

- ✅ **Crear primero el participante** con información personal completa
- ✅ **Usar IDs de catálogos válidos** (documentTypeId, genderId, etc.)
- ✅ **Validar formatos** especialmente teléfonos (+57 3XX XXX XXXX)
- ✅ **Incluir familyMembers** si es relevante para el caso
- ✅ **Crear casos específicos** para cada consulta/proceso
- ✅ **Usar títulos descriptivos** para casos (facilita seguimiento)

### 🚫 Errores Comunes

- ❌ Intentar incluir información médica en CreateParticipantDto
- ❌ Usar IDs de catálogos inexistentes
- ❌ Formato incorrecto de teléfonos
- ❌ Crear casos sin participante existente
- ❌ No incluir campos obligatorios (title, description, participantId)

### 🔍 Validación de Datos

```json
// ✅ Formato correcto de teléfono
"phoneNumber": "+57 301 234 5678"

// ❌ Formatos incorrectos
"phoneNumber": "3012345678"      // Sin +57
"phoneNumber": "+57 401 234 5678" // No empieza con 3
"phoneNumber": "+57 301 234 567"  // Muy corto
```

## 📋 Checklist de Implementación

### Antes de Empezar

- [ ] Token JWT válido obtenido
- [ ] IDs de catálogos consultados
- [ ] Datos del participante validados
- [ ] Estructura del caso planificada

### Al Crear Participante

- [ ] Todos los campos obligatorios incluidos
- [ ] Formato de teléfonos correcto
- [ ] IDs de catálogos válidos
- [ ] FamilyMembers estructurados correctamente

### Al Crear Caso

- [ ] Participante existe en el sistema
- [ ] Title y description con longitud adecuada
- [ ] Información médica estructurada por secciones
- [ ] Arrays (interventionPlans, progressNotes) bien formateados

### Testing

- [ ] Probar con casos mínimos (solo obligatorios)
- [ ] Probar con casos completos
- [ ] Validar respuestas y errores
- [ ] Confirmar creación de relaciones

## 📞 Soporte

### Para Desarrolladores

- **Documentación técnica**: `/docs`
- **Swagger UI**: `/api` (cuando el servidor esté ejecutándose)
- **Repositorio**: GitHub - backend-oots

### Para Usuarios Funcionales

- **Documentación de flujos**: Esta carpeta `/docs/examples`
- **Validaciones de negocio**: Ver archivos individuales
- **Casos de uso**: Ver ejemplos por documento

---

## 🎯 Próximos Pasos

1. **Leer documentación específica** según tu necesidad
2. **Probar endpoints** con datos de prueba
3. **Implementar flujo completo** en tu aplicación
4. **Contactar soporte** si encuentras problemas

**¡Comienza aquí!** 👉 [**Documentación de Casos**](../cases.md)
