# Diagnósticos UNI

Sistema institucional para digitalizar, almacenar y consultar los diagnósticos
técnicos realizados sobre equipos tecnológicos de una universidad. Mantiene el
historial por equipo y genera nuevamente la hoja institucional en PDF y Word.

No es un sistema de tickets ni una mesa de ayuda.

## Stack

- React 19, TypeScript y Vite.
- Tailwind CSS y shadcn/ui.
- TanStack Router y TanStack Table.
- React Hook Form, Zod y `zodResolver`.
- ASP.NET Core, Entity Framework Core, Identity y PostgreSQL.
- Razor/Playwright para PDF y Open XML para Word.

## Ejecutar el sistema

Primero configure y levante PostgreSQL y la API:

```bash
cd API
cp .env.example .env
# Configure POSTGRES_PASSWORD y ADMIN_PASSWORD en .env
docker compose up --build
```

En otra terminal, levante la SPA:

```bash
npm install
npm run dev
```

La SPA estará en `http://localhost:5173` y Vite enviará `/api` a
`http://localhost:5080`. El administrador inicial se obtiene de los valores
`ADMIN_USERNAME` y `ADMIN_PASSWORD` configurados en `API/.env`.

Si la API usa otra dirección, puede iniciar Vite con:

```bash
DIAGSOPORTE_API_URL=http://localhost:5080 npm run dev
```

`DIAGSOPORTE_API_URL` configura solamente el proxy de desarrollo. Para una API
publicada en otro origen use `VITE_API_URL` y autorice el origen del frontend en
`Cors:AllowedOrigins`.

## Integración y seguridad

- La sesión usa la cookie HttpOnly emitida por ASP.NET Core Identity.
- React no guarda sesiones, contraseñas ni tokens en `localStorage`.
- El cliente obtiene y renueva el token CSRF para todas las escrituras.
- Los permisos de la sesión controlan navegación y rutas, y la API vuelve a
  autorizarlos en el servidor.
- PostgreSQL es la única fuente de verdad para catálogos y diagnósticos.
- Las tablas solicitan búsqueda, filtros, ordenamiento y páginas al backend.
- PDF y Word se descargan desde la API y se construyen usando el snapshot
  histórico del diagnóstico.

## Verificaciones

Frontend:

```bash
npm run lint
npm run typecheck
npm run build
```

Backend:

```bash
cd API
dotnet format DiagSoporte.slnx --verify-no-changes
dotnet build DiagSoporte.slnx --configuration Release
dotnet test DiagSoporte.slnx --configuration Release
```

La documentación detallada del backend está en [`API/README.md`](API/README.md).
