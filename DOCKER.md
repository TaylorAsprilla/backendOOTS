# Docker MySQL Setup - OOTS Colombia Backend

## 📋 Descripción

Configuración de Docker Compose para ejecutar únicamente la base de datos MySQL para el proyecto backend de OOTS Colombia.

## 🔧 Configuración

### Servicios incluidos:

- **MySQL 8.0** - Base de datos principal

### Variables de entorno configuradas:

- **MYSQL_ROOT_PASSWORD**: `root123`
- **MYSQL_DATABASE**: `oots_db`
- **MYSQL_USER**: `oots_user`
- **MYSQL_PASSWORD**: `oots_password`

## 🚀 Comandos principales

### Iniciar MySQL

```bash
docker-compose up -d
```

### Ver logs de MySQL

```bash
docker-compose logs -f mysql
```

### Detener MySQL

```bash
docker-compose down
```

### Reiniciar MySQL

```bash
docker-compose restart mysql
```

### Eliminar contenedor y volumen (CUIDADO: Borra todos los datos)

```bash
docker-compose down -v
```

## 📊 Conexión a la base de datos

### Desde tu aplicación local:

- **Host**: `localhost`
- **Puerto**: `3307` (Docker MySQL)
- **Base de datos**: `oots_db`
- **Usuario**: `oots_user`
- **Contraseña**: `oots_password`

### Nota importante:

- **Puerto 3306**: XAMPP MySQL (si está activo)
- **Puerto 3307**: Docker MySQL (contenedor)

### Conexión como root:

- **Usuario**: `root`
- **Contraseña**: `root123`

## 🔍 Verificar el estado

### Verificar que el contenedor esté corriendo:

```bash
docker ps
```

### Conectarse al contenedor MySQL:

```bash
docker exec -it mysql-oots mysql -u root -p
```

### Verificar la base de datos:

```sql
SHOW DATABASES;
USE oots_db;
SHOW TABLES;
```

## 📁 Archivos importantes

- `docker-compose.yml` - Configuración principal
- `mysql-init/init.sql` - Script de inicialización de la base de datos
- `.env` - Variables de entorno (si necesitas personalizar)

## 🛠️ Solución de problemas

### Si el puerto 3306 está ocupado:

```bash
# Verificar qué está usando el puerto
netstat -tulpn | grep 3306

# Cambiar el puerto en docker-compose.yml a otro puerto como 3307:3306
```

### Si hay problemas de permisos:

```bash
# Reiniciar con limpieza completa
docker-compose down -v
docker-compose up -d
```

### Verificar logs en caso de errores:

```bash
docker-compose logs mysql
```

## 📝 Notas importantes

- Los datos se persisten en el volumen `mysql_data`
- El script `init.sql` se ejecuta solo la primera vez que se crea el contenedor
- Para cambios en la configuración, detén el servicio y vuelve a iniciarlo
- El plugin de autenticación está configurado como `mysql_native_password` para compatibilidad
