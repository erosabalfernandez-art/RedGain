# RedGain

Plataforma de recompensas: los usuarios se registran gratis, completan ofertas patrocinadas (vía offerwall) y reciben recompensas; pueden invitar a otras personas y recibir un porcentaje de lo que sus referidos directos obtengan en ofertas (un solo nivel). Los retiros se pagan en USDT (red BSC, BEP-20).

## Estructura

- `artifacts/redgain` — web (React + Vite), diseño negro y rojo.
- `artifacts/api-server` — API (Express). Las tablas se crean al arrancar en `src/lib/init-db.ts`.
- `lib/db` — esquema de base de datos (Drizzle, Postgres).
- `lib/api-spec` — contrato OpenAPI; de aquí se genera el cliente (`pnpm --filter @workspace/api-spec run codegen`).

## Variables de entorno necesarias

- `DATABASE_URL` — conexión a Postgres.
- `SESSION_SECRET` — secreto de sesión (obligatorio, largo y aleatorio).
- `APP_URL` — URL pública de la web (se usa en los enlaces de referido).

## Pendiente

- Integración del offerwall (Offerwall.GG): postback validado con firma, saldo RGC y historial, porcentaje de referidos.
- Retiros en USDT con monto mínimo y revisión manual.
