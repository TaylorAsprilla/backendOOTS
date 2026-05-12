# Endpoints y Ejemplos de Uso para el Frontend

---

## Usuarios

### Obtener todos los usuarios (Admin o Admin País)

GET /users

- **Admin:** Ve todos
- **Admin País:** Ve solo los de su país

### Obtener usuario por ID

GET /users/:id

- **Usuario:** Solo puede ver su propio usuario

---

## Participantes

### Obtener todos los participantes

GET /participants

- **Admin:** Ve todos
- **Admin País:** Ve solo los de su país
- **Usuario:** Solo los asignados a él

### Obtener participante por ID

GET /participants/:id

---

## Casos

### Obtener todos los casos

GET /cases

- **Admin:** Ve todos
- **Admin País:** Ve solo los de su país
- **Usuario:** Solo los asignados a él

### Obtener caso por ID

GET /cases/:id

---

## Países

### Listar países

GET /countries

### Crear país

POST /countries

**Payload:**

```json
{
  "name": "Colombia",
  "code": "es-CO"
}
```

### Editar país

PATCH /countries/:id

**Payload:**

```json
{
  "name": "Puerto Rico",
  "code": "es-PR"
}
```

---

## Parámetros útiles

- `countryId` (query param): Para filtrar por país (solo Admin País)
- `userId` (query param): Para filtrar por usuario asignado (solo Usuario)

---

## Ejemplo de uso en el frontend (fetch):

```js
// Obtener participantes del país del usuario
fetch('/participants?countryId=1', {
  headers: { Authorization: 'Bearer <token>' },
});

// Obtener casos asignados al usuario
fetch('/cases?userId=10', { headers: { Authorization: 'Bearer <token>' } });

// Obtener usuario propio
fetch('/users/10', { headers: { Authorization: 'Bearer <token>' } });
```

---

**Nota:** El backend filtra automáticamente según el rol y país del usuario autenticado. El frontend solo debe enviar el JWT y, si aplica, los parámetros de filtro.
