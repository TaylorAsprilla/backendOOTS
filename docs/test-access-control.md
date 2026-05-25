# Ejemplos de Pruebas de Acceso por Perfil y País

## 1. Admin Global

- **Token:** Usuario con `role: ADMIN`
- **Prueba:**
  - GET `/users` → Debe ver todos los usuarios
  - GET `/participants` → Debe ver todos los participantes
  - GET `/cases` → Debe ver todos los casos

## 2. Admin País (Colombia, countryId=1)

- **Token:** Usuario con `role: ADMIN_COUNTRY`, `countryId: 1`
- **Prueba:**
  - GET `/users?countryId=1` → Debe ver solo usuarios de Colombia
  - GET `/participants?countryId=1` → Solo participantes de Colombia
  - GET `/cases?countryId=1` → Solo casos de Colombia
  - GET `/users?countryId=2` → **Debe fallar** (403)

## 3. Usuario (Trabajador Social, id=10)

- **Token:** Usuario con `role: USER`, `id: 10`
- **Prueba:**
  - GET `/users/10` → Debe ver su propio usuario
  - GET `/participants?userId=10` → Solo participantes asignados a él
  - GET `/cases?userId=10` → Solo casos asignados a él
  - GET `/users/11` → **Debe fallar** (403)

## 4. Casos de Acceso Denegado

- Admin país de otro país intenta acceder a datos de país distinto → 403
- Usuario intenta acceder a datos de otro usuario → 403

## 5. Pruebas con JWT

- Usar JWT con los claims correctos (`role`, `countryId`, `id`)
- Probar endpoints con y sin parámetros `countryId` y `userId`

---

**Nota:**

- Para pruebas automáticas, usar Postman, Insomnia o pruebas e2e con Jest.
- Simular los distintos roles y países en los tokens.
