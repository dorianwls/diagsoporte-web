# Diagnósticos UNI

SPA institucional para registrar, almacenar, consultar e imprimir diagnósticos técnicos realizados sobre los equipos tecnológicos de una universidad.

Este producto es un inventario y repositorio histórico de diagnósticos. No es un sistema de tickets ni una mesa de ayuda.

## Stack

- React 19 y TypeScript
- Vite
- Tailwind CSS 4
- shadcn/ui
- TanStack Router
- Lucide React

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación estará disponible normalmente en `http://localhost:5173`.

## Verificaciones

```bash
npm run lint
npm run typecheck
npm run build
```

## Estado actual

La aplicación incluye la arquitectura base, rutas tipadas, layout responsive, identidad visual, dashboard de demostración, ficha técnica, vista de impresión y un login validado con React Hook Form y Zod.

La autenticación actual utiliza una sesión demostrativa en `sessionStorage`. No sustituye la autenticación y autorización que deberá proporcionar el backend.

Credenciales de demostración:

```text
Usuario: dorian
Contraseña: soporte123
```

Las tablas conectadas, los formularios del dominio y la persistencia se implementarán por funcionalidades en incrementos posteriores.
