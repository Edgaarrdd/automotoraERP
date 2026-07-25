# 🐳 Docker — Guía de Despliegue

Guía completa para construir y ejecutar **CRM Automotora ERP** usando Docker y Docker Compose.

---

## Índice

1. [Pre-requisitos](#pre-requisitos)
2. [Arquitectura de Contenedores](#arquitectura-de-contenedores)
3. [Inicio Rápido](#inicio-rápido)
4. [Configuración](#configuración)
5. [Comandos Útiles](#comandos-útiles)
6. [Estructura de Archivos Docker](#estructura-de-archivos-docker)
7. [Volumes y Persistencia](#volumes-y-persistencia)
8. [Networking](#networking)
9. [Producción](#producción)
10. [Solución de Problemas](#solución-de-problemas)

---

## Pre-requisitos

| Software         | Versión mínima | Verificar instalación       |
|------------------|----------------|-----------------------------|
| Docker Engine    | 24.0+          | `docker --version`          |
| Docker Compose   | 2.20+          | `docker compose version`    |

> **Windows/macOS**: Instala [Docker Desktop](https://www.docker.com/products/docker-desktop/) que incluye ambos.
>
> **Linux**: Instala Docker Engine y el plugin Compose siguiendo la [documentación oficial](https://docs.docker.com/engine/install/).

---

## Arquitectura de Contenedores

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
│                (automotora-network)                   │
│                                                       │
│  ┌──────────────────┐    ┌──────────────────────┐    │
│  │   frontend        │    │   backend             │    │
│  │   (Nginx)         │───▶│   (FastAPI/Uvicorn)   │    │
│  │                   │    │                       │    │
│  │  Puerto: 3000:80  │    │  Puerto: 8000:8000    │    │
│  │  /api ──proxy──▶  │    │  SQLite: /app/data/   │    │
│  └──────────────────┘    └──────────────────────┘    │
│                                   │                   │
│                           ┌───────▼───────┐          │
│                           │  backend-data  │          │
│                           │  (volume)      │          │
│                           └───────────────┘          │
└─────────────────────────────────────────────────────┘
```

| Servicio    | Imagen Base         | Puerto Host | Puerto Contenedor | Descripción                         |
|-------------|---------------------|-------------|-------------------|-------------------------------------|
| `backend`   | `python:3.12-slim`  | 8000        | 8000              | API REST (FastAPI + Uvicorn)        |
| `frontend`  | `nginx:1.27-alpine` | 3000        | 80                | SPA React servida por Nginx         |

---

## Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-org/automotoraERP.git
cd automotoraERP
```

### 2. Configurar variables de entorno

```bash
cp .env.docker.example .env.docker
```

> ⚠️ **Importante**: Edita `.env.docker` y cambia `JWT_SECRET` por un valor seguro antes de ir a producción.

### 3. Construir y levantar

```bash
docker compose up -d --build
```

### 4. Verificar que los servicios estén corriendo

```bash
docker compose ps
```

### 5. Acceder a la aplicación

| Recurso        | URL                              |
|----------------|----------------------------------|
| Frontend (App) | http://localhost:3000             |
| Backend API    | http://localhost:8000             |
| Swagger Docs   | http://localhost:8000/docs        |
| ReDoc          | http://localhost:8000/redoc       |

---

## Configuración

El archivo `.env.docker` controla toda la configuración de los contenedores:

```env
# Seguridad
JWT_SECRET=tu-clave-secreta-de-32-bytes-minimo
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Base de datos (SQLite por defecto)
DATABASE_URL=sqlite:///./data/automotora_crm.db

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:80

# Puertos del host
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### Cambiar puertos

Si los puertos 8000 o 3000 están ocupados, modifica en `.env.docker`:

```env
BACKEND_PORT=9000
FRONTEND_PORT=4000
```

### Usar PostgreSQL (producción)

1. Agrega un servicio `db` al `docker-compose.yml` o apunta a un PostgreSQL externo.
2. Cambia `DATABASE_URL` en `.env.docker`:

```env
DATABASE_URL=postgresql://user:password@db:5432/automotora_crm
```

3. Agrega `psycopg2-binary` al `requirements.txt` del backend.

---

## Comandos Útiles

### Ciclo de vida

```bash
# Construir imágenes sin cache
docker compose build --no-cache

# Levantar en segundo plano
docker compose up -d

# Levantar con rebuild
docker compose up -d --build

# Detener servicios
docker compose down

# Detener y eliminar volúmenes (⚠️ borra la base de datos)
docker compose down -v
```

### Monitoreo

```bash
# Ver estado de servicios
docker compose ps

# Ver logs de todos los servicios
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Ver logs solo del frontend
docker compose logs -f frontend

# Verificar health checks
docker inspect --format='{{json .State.Health}}' automotora-backend
docker inspect --format='{{json .State.Health}}' automotora-frontend
```

### Interacción

```bash
# Abrir shell en el backend
docker compose exec backend bash

# Abrir shell en el frontend (Alpine)
docker compose exec frontend sh

# Ejecutar seed manualmente
docker compose exec backend python -m app.seed

# Ejecutar tests del backend
docker compose exec backend pytest
```

---

## Estructura de Archivos Docker

```
automotoraERP/
├── docker-compose.yml          # Orquestación de servicios
├── .env.docker.example         # Template de variables de entorno
├── .env.docker                 # Variables de entorno (no versionado)
├── DOCKER.md                   # Esta documentación
│
├── backend/
│   ├── Dockerfile              # Build multi-stage del backend
│   ├── .dockerignore           # Archivos excluidos del build
│   ├── requirements.txt        # Dependencias Python
│   └── app/                    # Código fuente
│
└── frontend/
    ├── Dockerfile              # Build multi-stage del frontend
    ├── .dockerignore           # Archivos excluidos del build
    ├── nginx.conf              # Config de Nginx (proxy + SPA)
    ├── package.json            # Dependencias Node
    └── src/                    # Código fuente
```

---

## Volumes y Persistencia

| Volume          | Montado en       | Propósito                          |
|-----------------|------------------|------------------------------------|
| `backend-data`  | `/app/data/`     | Base de datos SQLite persistente   |

### Backup de la base de datos

```bash
# Copiar la base de datos al host
docker compose cp backend:/app/data/automotora_crm.db ./backup_$(date +%Y%m%d).db
```

### Restaurar backup

```bash
# Copiar un backup al contenedor
docker compose cp ./mi_backup.db backend:/app/data/automotora_crm.db

# Reiniciar el backend para que tome los cambios
docker compose restart backend
```

---

## Networking

Todos los contenedores se comunican a través de la red bridge `automotora-network`.

- El **frontend (Nginx)** actúa como reverse proxy, reenviando peticiones `/api/*` al backend.
- El backend es accesible internamente como `http://backend:8000`.
- Desde el navegador del usuario, las llamadas a `/api` llegan al Nginx que las proxea al backend.

---

## Producción

### Recomendaciones

1. **Cambiar `JWT_SECRET`**: Usa un valor criptográficamente seguro:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

2. **Usar PostgreSQL**: SQLite no es recomendado para producción con concurrencia.

3. **HTTPS**: Coloca un reverse proxy externo (Traefik, Caddy, o Nginx) con certificados SSL delante de los contenedores.

4. **Limitar recursos**:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1.0'
             memory: 512M
   ```

5. **Logs centralizados**: Configura un driver de logging como `json-file` con rotación:
   ```yaml
   services:
     backend:
       logging:
         driver: json-file
         options:
           max-size: "10m"
           max-file: "3"
   ```

---

## Solución de Problemas

### El frontend no puede conectar con el backend

1. Verifica que el backend esté healthy:
   ```bash
   docker compose ps
   ```
2. Revisa los logs del backend:
   ```bash
   docker compose logs backend
   ```
3. Asegúrate de que `CORS_ORIGINS` en `.env.docker` incluya la URL del frontend.

### Error "port already in use"

Cambia los puertos en `.env.docker`:
```env
BACKEND_PORT=9000
FRONTEND_PORT=4000
```

### La base de datos no persiste después de `docker compose down`

Asegúrate de **no** usar la flag `-v` al detener:
```bash
# ✅ Correcto: mantiene los volúmenes
docker compose down

# ❌ Esto borra los volúmenes (y la BD)
docker compose down -v
```

### Rebuild completo (nuclear option)

```bash
docker compose down -v --rmi all
docker compose up -d --build
```

---

## Usuarios por Defecto

Al iniciar por primera vez, el backend ejecuta un seed automático con los siguientes usuarios:

| Rol               | Email                | Contraseña     |
|--------------------|----------------------|----------------|
| Admin              | admin@origen.cl      | Admin123!      |
| Gerente Comercial  | gerente@origen.cl    | Gerente123!    |
| Asesor Comercial   | vendedor1@origen.cl  | Vendedor123!   |
| Asesora Comercial  | vendedor2@origen.cl  | Vendedor123!   |
| Ejecutivo F&I      | fi@origen.cl         | Fi123!         |
| Agente BDC         | bdc@origen.cl        | Bdc123!        |

> ⚠️ **Cambia estas contraseñas inmediatamente** en un entorno de producción.
