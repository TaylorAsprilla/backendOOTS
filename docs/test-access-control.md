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
- El alcance se obtiene del usuario autenticado en el servidor, no de filtros enviados por el navegador. Por ejemplo, un administrador asignado a EEUU solo consulta participantes y usuarios de EEUU y los casos de esos participantes, independientemente del profesional que los haya registrado.
- Sin país asignado se responde **403**; los registros sin país no forman parte de su alcance.
- **Prueba:**
  - GET `/users`, `/users/all/with-deleted`, `/participants`, `/participants/all`, `/cases`, `/cases/all` sin filtro de país → Solo registros del país asignado
  - GET `/users?countryId=1` → Debe ver solo usuarios de Colombia
  - GET `/participants/by-country/1` → Solo participantes de Colombia
  - GET `/participants/by-country/2` → **Debe fallar** (403)
  - GET `/cases?countryId=1` → Solo casos de Colombia
  - GET `/users?countryId=2` → **Debe fallar** (403)
  - GET `/participants/:id`, `/cases/:id`, `/users/:id` de otro país o sin país → **Debe fallar** (403), incluso por URL directa
  - GET `/cases/participants/:participantId/cases` de otro país → **Debe fallar** (404)
  - GET `/participants/by-user/:userId` y `/cases/by-user/:userId` → Solo registros que también pertenezcan al país del administrador
  - GET `/cases/by-country/1` → Todos los casos de participantes de Colombia, sin filtrar por profesional; respuesta `{ countryId, total, cases }` dentro del envoltorio habitual de la API
  - GET `/cases/by-country/2` → **Debe fallar** (403)
  - GET `/participants/stats/demographic` → Totales y desgloses del mismo país
  - Las consultas de documento/email de participantes y documento/MITA de usuarios no devuelven registros de otros países. La validación de unicidad al guardar conserva su comportamiento.
  - GET de listado/detalle y operaciones de discusiones de un caso de otro país → **Debe fallar** (403)
  - PATCH `/participants/:id` de un participante con `countryId=1` → Permitido
  - PATCH `/participants/:id` de un participante con otro país o sin país → **Debe fallar** (403)
  - No puede cambiar el país de un participante a otro país. La gestión de usuarios es de solo consulta para `ADMIN_COUNTRY`: no puede editar, eliminar, restaurar ni cambiar roles o contraseñas a través de `/users`; conserva sus opciones personales de perfil y contraseña.
  - El listado de participantes, el listado de casos y el dashboard de Angular consultan el consolidado del país. Los demás roles conservan sus consultas existentes.
  - No se agregan permisos de auditoría, administración global, supervisión o transferencia a `ADMIN_COUNTRY`.

Pruebas de regresión (HTTP con repositorios en memoria y servicios reales; unitarias de filtros y autorización):

```powershell
npm test -- --runInBand --runTestsByPath src/common/country-access.http.spec.ts src/common/utils/country-access.spec.ts src/participants/participants.service.spec.ts src/cases/cases.service.spec.ts src/users/users.service.spec.ts src/case-discussions/case-discussions.service.spec.ts src/cases/case-document-history.service.spec.ts src/documents/documents.http.spec.ts
```

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

## 6. PDF dinámicos e integridad histórica

Todos los PDF se generan en memoria al solicitarlos; no hay almacenamiento de PDF, S3, archivos temporales, tareas programadas ni generación al cerrar. El cierre solo persiste información histórica en MySQL.

### Fuentes y autorización

- Al crear un caso se conserva el participante (incluidos nombres de catálogos, dirección y edad al abrir), su composición familiar y la identidad del profesional.
- En casos activos, los PDF combinan esos snapshots con las notas, planes, evaluaciones y seguimientos actuales del expediente.
- Las correcciones de composición familiar realizadas en el caso activo actualizan su snapshot familiar en la misma transacción; ese snapshot queda inmutable al cerrar. Los datos del participante permanecen como estaban al abrir el caso.
- Al cerrar, en la misma transacción se congelan todos los datos del expediente, etiquetas de catálogos, discusiones y nombres/cargos/correos de los responsables, así como la identidad del usuario que cierra. No se almacenan contraseñas ni tokens.
- Los PDF cerrados se generan exclusivamente desde ese cierre persistido. No recargan el participante, notas ni usuarios actuales. Las fechas de contenido se formatean en UTC y la fecha de referencia de los documentos queda fija al cierre.
- Los expedientes cerrados no admiten edición, transferencias, cambios de discusión ni reapertura. Para continuar la atención se crea otro caso.
- ADMIN descarga cualquier caso; ADMIN_COUNTRY solo casos del país histórico de apertura cuyo participante siga perteneciendo a su país asignado; TRABAJO_SOCIAL solo casos cuyo `createdById` corresponde a su usuario. El servidor verifica JWT y permisos en cada descarga, antes de cargar datos clínicos; otros roles reciben 403.
- La descarga no depende de quién la realiza para mostrar el profesional histórico.
- Para casos anteriores se conserva una referencia con los datos disponibles al migrar (`source=legacy`); no se presenta como una reconstrucción exacta de la apertura o del cierre original. Si se desconoce el autor de un cierre anterior, no se inventa.

### Endpoints

Todos usan GET con JWT y devuelven `application/pdf`, `Content-Disposition` y `Cache-Control: no-store`:

- `/api/v1/cases/:id/pdf` (diseño de descarga existente).
- `/api/v1/cases/:caseId/documents/full-case/pdf`.
- `/api/v1/cases/:caseId/documents/help-process-completion/pdf`.
- `/api/v1/cases/:caseId/documents/intervention-plan/pdf`.
- `/api/v1/cases/:caseId/documents/progress-notes/:progressNoteId/pdf`.
- `/api/v1/cases/:caseId/documents/closing-note/pdf`.
- `/api/v1/cases/:caseId/discussions/:discussionId/pdf`.

Los IDs de notas/discusiones deben pertenecer al caso autorizado. Los endpoints de documentos/discusiones aceptan únicamente `disposition=inline|attachment`.

Los errores de generación y de persistencia del histórico no imprimen datos clínicos. El logger de base de datos oculta SQL y parámetros de consultas fallidas; los logs de autenticación identifican usuarios por ID, sin correos.

Las lecturas activas cargan relaciones por tipo de documento con consultas agrupadas, sin consultas por cada nota. Los documentos reutilizan una sola imagen del logo por PDF sin cambiar el diseño. Angular bloquea el botón durante la generación y comparte únicamente solicitudes simultáneas al mismo documento; no mantiene una caché de PDF finalizados y permite reintentos tras error o cancelación.

### Pruebas

Pruebas unitarias:

```powershell
npm test -- --runInBand --runTestsByPath src/cases/cases.service.spec.ts src/cases/case-document-history.service.spec.ts src/documents/documents.service.spec.ts
```

Las pruebas HTTP de las siete rutas comprueban JWT ausente/caducado, acceso del creador y de ADMIN, denegación por país o propietario ajeno, `no-store` e IDs de notas/discusiones ajenos al caso:

```powershell
npm test -- --runInBand --runTestsByPath src/documents/documents.http.spec.ts src/common/logging/redacted-database.logger.spec.ts
```

Prueba de integración explícita contra MySQL local de desarrollo, después de aplicar la migración:

```powershell
$env:CASE_HISTORY_DB_TEST='true'
npm test -- --runInBand --runTestsByPath src/cases/case-document-history.integration.spec.ts
Remove-Item Env:CASE_HISTORY_DB_TEST
```

La integración usa una transacción exterior y revierte todos sus datos de prueba. Verifica:

1. Participante de 35 años, notas nuevas visibles en el segundo PDF activo y datos de apertura sin cambios.
2. Dirección histórica A después de cambiar la dirección actual y de simular una descarga seis meses después; mismo contenido renderizado del expediente cerrado.
3. Invariancia tras cambiar notas, composición familiar, catálogos, discusiones y nombres del profesional; notas individuales accesibles por su ID histórico.
4. Denegación a otro trabajador social y a un administrador de otro país; prohibición de editar/reabrir el caso cerrado.
5. Reversión del cierre si falla el snapshot y ausencia de escrituras de archivos durante la generación.

Las pruebas del frontend cubren solicitudes simultáneas, nueva generación después de completar, reintentos y cancelación.

## 7. Pruebas con JWT

- Usar JWT con los claims correctos (`role`, `countryId`, `id`)
- La atribución del participante debe provenir del usuario autenticado; no se debe confiar en `registeredById` enviado en el body.
- El frontend debe omitir `registeredById` en las solicitudes PATCH, incluso al reutilizar los datos del formulario de creación. La API rechaza este campo con 400 y conserva el registrador original.
- Probar los endpoints de edición con registros propios y ajenos.

---

**Nota:**

- Para pruebas automáticas, usar Postman, Insomnia o pruebas e2e con Jest.
- Simular los distintos roles y países en los tokens.
