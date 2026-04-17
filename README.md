# Stock API REST — Node.js + Alpha Vantage

API REST construida en Node.js + TypeScript que consume datos financieros en tiempo real de Alpha Vantage, los transforma y los expone mediante endpoints propios protegidos con JWT. Incluye caché en base de datos y carga de archivos a Azure Blob Storage con SAS tokens.

---

## Qué hace el proyecto

- Autentica usuarios con JWT (registro y login)
- Consulta la API de Alpha Vantage (serie de tiempo diaria de AAPL)
- Transforma los datos: renombra campos, convierte tipos y calcula la variación porcentual diaria
- Guarda los resultados en base de datos como caché (SQLite en dev, PostgreSQL en prod)
- Permite subir archivos a Azure Blob Storage y devuelve una URL firmada con SAS token

---

## API externa usada

**Alpha Vantage** — [https://www.alphavantage.co](https://www.alphavantage.co)  
Endpoint consumido:

```
GET https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=YOUR_KEY
```

Devuelve series de tiempo diarias (open, high, low, close, volume) del ticker AAPL.

---

## Cómo ejecutarlo localmente

### 1. Requisitos previos

- Node.js 22 LTS
- npm

### 2. Clonar el repositorio

```bash
git https://github.com/DelgadoBrayan/stock-API-pink.git
cd stock-API-pink
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=un_secreto_seguro

# Alpha Vantage
ALPHA_VANTAGE_API_KEY=tu_api_key
ALPHA_VANTAGE_SYMBOL=AAPL

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=tu_connection_string
AZURE_STORAGE_CONTAINER_NAME=uploads
```

### 5. Ejecutar en modo desarrollo

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`

---

## Endpoints disponibles


| Método | Endpoint                 | Descripción                          | Auth |
| ------ | ------------------------ | ------------------------------------ | ---- |
| POST   | `/auth/register`         | Registrar usuario                    | No   |
| POST   | `/auth/login`            | Login, devuelve JWT                  | No   |
| GET    | `/external-data`         | Datos transformados de Alpha Vantage | Sí   |
| GET    | `/external-data/history` | Historial guardado en DB             | Sí   |
| POST   | `/storage/upload`        | Subir archivo, retorna SAS URL       | Sí   |


---

## Despliegue en Azure

La API está desplegada en **Azure App Service** con las siguientes configuraciones:

- Despliegue continuo desde GitHub (GitHub Actions)
- Variables de entorno configuradas en App Service → Configuration
- Almacenamiento de archivos en **Azure Blob Storage** con SAS tokens de tiempo limitado
- URL pública generada automáticamente por Azure App Service

---

## URL pública

La API está disponible en:

**https://stock-api-service-bd-gvhmhmecbghefrcg.canadacentral-01.azurewebsites.net**

## Estructura del proyecto

```
src/
├── config/          # Base de datos y variables de entorno
├── modules/
│   ├── auth/        # Registro, login, JWT
│   ├── market/      # Integración Alpha Vantage + caché
│   └── storage/     # Azure Blob Storage + SAS
├── shared/
│   └── middlewares/ # Auth guard, manejo de errores
├── app.ts
└── server.ts
```

