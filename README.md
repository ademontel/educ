# User CRUD App (React + FastAPI + Docker)

## Estructura de carpetas

- **frontend/**: Aplicación React+Vite con Context API y Tailwind
- **backend/**: Servicio FastAPI
- **docker-compose.yml**: Levanta frontend, backend y PostgreSQL

## Requisitos

- Docker
- Docker Compose

## Levantar en desarrollo

1. Clona el repo y ve a la raíz del proyecto.
2. Asegúrate de tener el archivo `backend/.env.development`.
3. Ejecuta:
   ```
   docker-compose up --build
   ```
4. Accede a:
   - Frontend: http://localhost:5173
   - API: http://localhost:8000
   - Documentación FastAPI: http://localhost:8000/docs

## Variables de entorno

- **backend/.env.development**:
  ```
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_DB=users_db
  DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
  ```

## Scripts útiles

- `docker-compose down`: Detiene y elimina contenedores.
- `docker-compose up --build frontend`: Levanta solo el frontend.
- `docker-compose up --build backend db`: Levanta solo backend y base de datos.

## Si da rerores raros al clonar por primera vez

# 🔄 1. Eliminar imágenes cacheadas o dañadas
docker builder prune --all --force

# 📦 2. Borrar contenedores y volúmenes persistentes (base de datos, migraciones previas, etc.)
docker-compose down -v

# 🧱 3. Recompilar todo desde cero
docker-compose build --no-cache

# 🚀 4. Levantar el entorno
docker-compose up

## Producción

Ajusta el archivo `backend/.env.production` con tus credenciales externas y ejecuta:

```bash
docker-compose -f docker-compose.yml up --build -d
```
