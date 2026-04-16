# Despliegue en Azure (App Service + GitHub Actions)

## Requisitos

- Cuenta de Azure
- Repo en GitHub
- Node.js 22 (Azure App Service)
- (Prod recomendado) Azure Database for PostgreSQL Flexible Server
- Azure Storage Account (Blob) + contenedor `uploads`

## 1) Crear recursos en Azure

### App Service

1. Crear un **App Service Plan** (Linux).
2. Crear una **Web App** (Runtime: **Node 22 LTS**).
3. La API quedará accesible en:
   - `https://<APP_NAME>.azurewebsites.net`

### Base de datos (PostgreSQL recomendado en producción)

1. Crear **Azure Database for PostgreSQL - Flexible Server**.
2. Obtener el connection string/URL.

### Storage (Azure Blob)

1. Crear un **Storage Account**.
2. Crear un contenedor llamado `uploads` (o el nombre que uses).
3. Obtener el **connection string** del Storage Account.

## 2) Configurar variables de entorno en App Service

Ir a **App Service > Configuration > Application settings** y agregar:

- `NODE_ENV=production`
- `PORT=8080`

### Base de datos

Recomendado:

- `DATABASE_URL=<postgres connection string>`

Alternativo (si no usas `DATABASE_URL`):

- `DB_HOST=...`
- `DB_PORT=5432`
- `DB_USER=...`
- `DB_PASSWORD=...`
- `DB_NAME=...`

Opcional:

- `DB_SYNC=false` (recomendado en prod)

### Auth / JWT

- `JWT_SECRET=<un secreto fuerte>`
- `JWT_EXPIRES_IN=1d`

### Alpha Vantage

- `ALPHA_VANTAGE_API_KEY=<tu api key>`
- `ALPHA_VANTAGE_SYMBOL=AAPL`
- `ALPHA_VANTAGE_OUTPUT_SIZE=compact`

### Azure Blob Storage (para `/storage/upload`)

- `AZURE_STORAGE_CONNECTION_STRING=<connection string>`
- `AZURE_STORAGE_CONTAINER_NAME=uploads`
- `AZURE_STORAGE_SAS_EXPIRES_MINUTES=30`

## 3) Configurar el startup command

En **App Service > Configuration > General settings**:

- **Startup Command**: `npm run start`

> El build lo hace GitHub Actions. App Service solo ejecuta `dist/server.js`.

## 4) Deploy desde GitHub (GitHub Actions)

Este repo incluye el workflow: `.github/workflows/azure-app-service.yml`.

### Opción A (más simple): Publish Profile

1. En Azure Portal: **App Service > Overview > Get publish profile** (descargar el archivo).
2. En GitHub: **Settings > Secrets and variables > Actions**:
   - Crear secret `AZURE_WEBAPP_PUBLISH_PROFILE` con el contenido completo del publish profile.
   - Crear variable `AZURE_WEBAPP_NAME` con el nombre de la Web App.
3. Hacer push a `main` y el workflow desplegará automáticamente.

## 5) Verificación (evidencia)

- Health básico (si tu app está arriba verás respuestas en rutas públicas como auth):
  - `POST https://<APP_NAME>.azurewebsites.net/auth/register`
  - `POST https://<APP_NAME>.azurewebsites.net/auth/login`

- Endpoints protegidos (requieren JWT `Authorization: Bearer <token>`):
  - `GET https://<APP_NAME>.azurewebsites.net/external-data`
  - `GET https://<APP_NAME>.azurewebsites.net/external-data/history`
  - `POST https://<APP_NAME>.azurewebsites.net/storage/upload` (multipart `file`)

## 6) Notas importantes

- **SQLite** solo es para dev local. En Azure App Service, usa PostgreSQL.
- Si no tienes `ALPHA_VANTAGE_API_KEY` válido, `/external-data` responderá error.
- Para Azure Blob, el endpoint retorna una URL con **SAS temporal** (expira según `AZURE_STORAGE_SAS_EXPIRES_MINUTES`).

