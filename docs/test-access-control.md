# Pruebas de acceso por perfil, país y propiedad

## 1. Admin Global

- **Token:** Usuario con `role: ADMIN`
- **Prueba:**
  - GET `/users` → Debe ver todos los usuarios
  - GET `/participants` → Debe ver todos los participantes
  - GET `/cases` → Debe ver todos los casos
  - PATCH `/participants/:id` → Puede editar cualquier participante

## 2. Admin País (Colombia, countryId=1)

- **Token:** Usuario con `role: ADMIN_COUNTRY`, `countryId: 1`
- **Prueba:**
  - GET `/users?countryId=1` → Debe ver solo usuarios de Colombia
  - GET `/participants/by-country/1` → Solo participantes de Colombia
  - GET `/participants/by-country/2` → **Debe fallar** (403)
  - GET `/cases?countryId=1` → Solo casos de Colombia
  - GET `/users?countryId=2` → **Debe fallar** (403)
  - PATCH `/participants/:id` de un participante con `countryId=1` → Permitido
  - PATCH `/participants/:id` de un participante con otro país o sin país → **Debe fallar** (403)

## 3. Trabajo Social (id=10)

- **Token:** Usuario con `role: TRABAJO_SOCIAL`, `id: 10`
- **Prueba:**
  - PATCH `/participants/:id` con `registeredById=10` → Permitido
  - PATCH `/participants/:id` registrado por otro usuario → **Debe fallar** (403)

## 4. Propiedad de casos

- Cualquier rol intenta modificar `PATCH /cases/:id` si `createdById` no coincide con su ID → **Debe fallar** (403)
- Cualquier rol intenta modificar `PATCH /cases/:id/status` si `createdById` no coincide con su ID → **Debe fallar** (403)
- El creador del caso puede modificar sus datos y cambiar su estado.
- `PATCH /cases/:id/transfer` conserva el permiso específico para SUPERVISOR, COORDINADOR y ADMIN.

## 5. Auditoría de participantes

- Cada creación, actualización y eliminación lógica exitosa genera un registro en `participant_audit_logs`.
- Se guardan el ID del participante, ID/nombre/correo del usuario autenticado, acción (`CREATE`, `UPDATE`, `DELETE`) y fecha/hora UTC (`createdAt`).
- El actor se obtiene del JWT, nunca del cuerpo de la solicitud. No se guardan valores anteriores/nuevos ni copias de la información del participante.
- El cambio y su auditoría se guardan en la misma transacción: si falla cualquiera, ambos se revierten. Los intentos rechazados no generan una acción exitosa.
- El historial conserva la identidad del actor al momento de la operación, incluso si cambia su perfil. No tiene eliminación en cascada ni endpoints para editarlo o borrarlo.
- GET `/api/v1/audit-logs/participants/:participantId?page=1&limit=20` consulta el historial, incluso después de eliminar lógicamente al participante. Conserva los roles de consulta de auditoría: ADMIN, SUPERVISOR y COORDINADOR.
- Respuesta: `{ data, total, page, limit, totalPages }`, con orden descendente por fecha e ID; `page` debe ser positivo y `limit` estar entre 1 y 100.
- Probar las tres acciones y comprobar el actor y la fecha/hora. Una operación fallida no debe dejar cambios ni auditorías parciales.
- La auditoría comienza al desplegar este cambio; no reconstruye autores ni fechas de operaciones históricas.
- Antes de desplegar, ejecutar [la migración de auditoría](../migrations/create-participant-audit-logs.sql) y reiniciar el backend.

## 6. Pruebas con JWT

- Usar JWT con los claims correctos (`role`, `countryId`, `id`)
- La atribución del participante debe provenir del usuario autenticado; no se debe confiar en `registeredById` enviado en el body.
- El frontend debe omitir `registeredById` en las solicitudes PATCH, incluso al reutilizar los datos del formulario de creación. La API rechaza este campo con 400 y conserva el registrador original.
- Probar los endpoints de edición con registros propios y ajenos.

---

**Nota:**

- Para pruebas automáticas, usar Postman, Insomnia o pruebas e2e con Jest.
- Simular los distintos roles y países en los tokens.
