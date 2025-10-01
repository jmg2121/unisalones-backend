# Unisalones – Backend MVC (Express + Sequelize + TDD)

Backend funcional para el sistema de **reserva y gestión de espacios** (Unicomfacauca). Cumple historias clave: búsqueda, reserva, cancelación/modificación, notificaciones, administración de espacios, validación de identidad, historial y lista de espera.

## Tecnologías
- Node.js + Express
- Sequelize (SQLite por defecto)
- JWT Auth, Bcrypt
- Jest + Supertest (TDD)
- MVC + Services + Middlewares

## Requisitos previos
- Node 18+
- npm

## Instalación rápida
1. Copia variables:
   cp .env.sample .env
2. Instala dependencias:
   npm install
3. Inicia en desarrollo:
   npm run dev

> Por defecto usa SQLite (archivo `./data/dev.sqlite`). No requiere instalar una base de datos externa.

## Scripts
- `npm run dev` – inicia servidor con nodemon.
- `npm start` – servidor en producción.
- `npm test` – ejecuta pruebas (usa DB en memoria).
- `npm run migrate` / `npm run seed` – opcional si incorporas CLI para migraciones/seeders.

## Estructura
src/
  models/ (Sequelize)
  services/ (lógica de dominio)
  controllers/ (casos de uso HTTP)
  routes/
  middlewares/
  utils/
  app.js, server.js
tests/
  unit/
  integration/

## Endpoints principales
- POST /api/auth/register – email institucional requerido; bloqueo tras 3 intentos fallidos.
- POST /api/auth/login – devuelve JWT.
- GET /api/spaces/available?date=YYYY-MM-DD&start=HH:mm&end=HH:mm&type=...
- POST /api/spaces (admin) – crear espacio.
- PUT /api/spaces/:id (admin) – editar.
- DELETE /api/spaces/:id (admin) – elimina si no hay reservas activas.
- POST /api/reservations – crea reserva; si hay conflicto, sugiere lista de espera.
- PATCH /api/reservations/:id – modifica (dueño o admin).
- DELETE /api/reservations/:id – cancela y promueve lista de espera.
- GET /api/reservations/me – historial del usuario.
- POST /api/reservations/waitlist – unirse a lista de espera.

## Criterios de aceptación mapeados a historias
- HU-001 (búsqueda de espacios): filtro por tipo y disponibilidad real por rango, respuesta rápida.
- HU-002 (reserva): valida solapamientos, genera comprobante (receipt_code) y notificación inmediata.
- HU-003 (cancelar/modificar): solo dueño o admin; refleja cambios en tiempo real.
- HU-004 (notificaciones): se registra en DB y se "envía" con transport simulado (apto para tests).
- HU-005 (administración): CRUD de espacios; evita eliminar con reservas activas.
- HU-007 (validación de identidad): login institucional + bloqueo temporal tras intentos fallidos.
- HU-008 (horarios): el endpoint de disponibilidad soporta vistas por rango; base para calendario.
- HU-009 (historial): endpoint de historial del usuario.
- HU-010 (lista de espera): unirse, promoción automática al liberarse un espacio.

## Notificaciones
Se registra en `notifications` y se emula envío de email con Nodemailer en modo stream (ver `src/utils/mailer.js`).

## TDD
Incluye pruebas unitarias y de integración con Supertest (sin DB externa).

## Próximos pasos sugeridos
- Vistas de calendario por día/semana/mes.
- Reportes (HU-006) y exportación a PDF/Excel.
- SMTP real y/o integración con directorio institucional.
