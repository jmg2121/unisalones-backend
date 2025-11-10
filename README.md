# 🎓 Unisalones -- Backend MVC (Express + Sequelize + TDD)

Backend funcional para el sistema de **reserva y gestión de espacios
académicos** en Unicomfacauca.\
El proyecto sigue el **patrón MVC**, está desarrollado con **Node.js,
Express y Sequelize**,\
y se diseñó aplicando un enfoque **TDD (Desarrollo Guiado por Pruebas)**
con **Jest y Supertest**.

------------------------------------------------------------------------

## 🧩 Descripción del proyecto

**Unisalones** permite a los usuarios (administradores y estudiantes)
gestionar la reserva de salones, laboratorios y otros espacios
institucionales.\
El sistema garantiza la disponibilidad, evita conflictos de horarios y
ofrece funcionalidades para crear, consultar y cancelar reservas.

**Objetivo:**\
Implementar un backend escalable, documentado y probado que cumpla con
los criterios de aceptación definidos en las historias de usuario del
*Sprint Backlog*.

------------------------------------------------------------------------
## Arquitectura

```
src/
 ├─ models/          # Sequelize models (User, Space, Reservation, Notification)
 ├─ controllers/     # Controladores (auth, reservation, calendar, space)
 ├─ routes/          # Rutas Express
 ├─ services/        # Lógica de negocio (auth, notifications, calendar)
 ├─ middlewares/     # JWT, roles, validación, manejo de errores
 ├─ config/          # DB, Email (Nodemailer), Swagger
 ├─ tests/           # Jest + Supertest (unit e integración)
 └─ app.js           # App Express (export para tests) + bootstrap DB (ready)
```

---

## Instalación

1) Clonar e instalar dependencias
```bash
git clone https://github.com/jmg2121/unisalones-backend.git
cd unisalones-backend
npm install
```

2) Variables de entorno (`.env`)
```bash
PORT=3000
DB_USER=root
DB_PASS=root
DB_NAME=unisalones_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql
TEST_DB_STORAGE=:memory:
JWT_SECRET=clave_super_secreta
NODE_ENV=development

# Bloque B – SMTP (Mailtrap)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=426d973747582d
SMTP_PASS=2682d9c45ccf68
SMTP_FROM="Unisalones <no-reply@unisalones.com>"

# Bloque D – Seguridad
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_MAX_AUTH=10
RATE_LIMIT_MAX_GLOBAL=100
JWT_EXPIRES=1h
LOCK_MINUTES=15
INSTITUTIONAL_DOMAIN=@unicomfacauca.edu.co
```

---

## Ejecución

Desarrollo
```bash
npm run dev
```

Producción
```bash
npm start
```

---

## Pruebas (TDD)

Todo
```bash
npm test
```

Un archivo específico
```bash
npm test -- tests/integration/notifications.int.test.js
```

Un patrón
```bash
npm test -- -t "calendar"
```

Salida esperada (ejemplo)
```
Test Suites: 12 passed, 12 total
Tests:       21 passed, 21 total
```

---

## Bloque A – Swagger (Documentación de la API)

Acceso
```
http://localhost:3000/api-docs
```

Rutas documentadas
- /api/auth
- /api/spaces
- /api/reservations
- /api/calendar
- /api/health

Scripts
```bash
npm run swagger:gen
npm run swagger:check
```

Riesgos y rollback

- Incompatibilidad de versiones → fijadas en package.json.
- JSDoc roto → ejecutar `swagger:check` antes de subir.
- Rollback: `npm uninstall swagger-ui-express swagger-jsdoc` y remover bloque Swagger en `app.js`.

---

## Bloque B – Notificaciones por Correo

Descripción  
Al crear/cancelar reservas se envían correos con **Nodemailer** (Mailtrap) y se registra un evento en `notifications`.

Flujo
- Reserva creada → correo “Reserva confirmada” + registro `notifications`.
- Reserva cancelada → correo “Reserva cancelada” + registro `notifications`.

Prueba de humo
```bash
npm run email:smoke
```

Riesgos y mitigación
| Riesgo | Mitigación |
|-------|------------|
| SMTP caído/credenciales malas | Envío asíncrono y logs; no bloquea la reserva |
| Usuario sin email | Validación previa (`user.email`) |
| Plantillas HTML | Plantillas simples y probadas |

Rollback
- Quitar llamadas a `sendReservationConfirmation`/`sendReservationCancellation` del controller.
- Borrar `src/config/email.js` y `src/services/templates/emailTemplates.js`.
- Limpiar variables SMTP en `.env`.
- Eliminar tests de notificaciones.

---

## Bloque C – Calendario de Disponibilidad

Endpoint
```
GET /api/calendar
```

Parámetros
- range: `day` o `week`
- date: `YYYY-MM-DD`
- spaceId: opcional (filtra por espacio)

Criterios de aceptación
- Devuelve franjas por día/semana.
- Detecta solapamientos con `Reservation`.
- Soporta `spaceId`.
- Documentado en Swagger.
- Tests de integración con Supertest.

Ejemplos
```
GET /api/calendar?range=day&date=2025-11-10
GET /api/calendar?range=week&date=2025-11-10&spaceId=1
```

Notas de rendimiento
- Índices recomendados: `Reservation(space_id, start_time, end_time, status)`.
- Consultas por rango usando `start_time < end AND end_time > start`.

---

## Bloque D – Seguridad (alineado a OWASP)

Controles implementados

1) Autenticación y control de acceso  
- JWT con expiración (`JWT_EXPIRES`) y verificación en middleware.  
- Roles básicos: admin, student (autorización por endpoint).

2) Dominio institucional  
- Registro/Login restringido a correos que terminan en `INSTITUTIONAL_DOMAIN`.

3) Lockout por intentos fallidos  
- Tras 3 intentos fallidos, bloqueo temporal por `LOCK_MINUTES`.

4) Rate limiting  
- Límites para rutas sensibles (auth) y globales (`RATE_LIMIT_MAX_AUTH`, `RATE_LIMIT_MAX_GLOBAL`).

5) CORS estricto  
- Orígenes permitidos desde `CORS_ORIGINS`.

6) Gestión de secretos  
- Variables en `.env` (no versionadas).

7) Validación y saneamiento  
- Validaciones en body/query/params y manejo centralizado de errores.

Riesgos y rollback

| Riesgo | Descripción | Rollback |
|-------|-------------|----------|
| Bloqueos falsos | Lockout por contraseñas mal ingresadas | Reducir `LOCK_MINUTES` o desactivar lockout |
| Expiración agresiva | JWT expira muy rápido | Ajustar `JWT_EXPIRES` |
| Orígenes bloqueados | CORS niega clientes válidos | Ampliar `CORS_ORIGINS` |
| Límite muy bajo | Rate limit corta tráfico normal | Subir `RATE_LIMIT_MAX_*` |

---

## Modelos

- User: id, name, email, password_hash, role, failed_attempts, lock_until
- Space: id, name, type, capacity, is_active
- Reservation: id, user_id, space_id, start_time, end_time, status, receipt_code
- Notification: id, user_id, message, type (enum), payload(json), is_read, sent_at
- WaitlistEntry: id, user_id, space_id, start_time, end_time, status, position

---

## Endpoints clave

Auth
- POST /api/auth/register
- POST /api/auth/login

Spaces
- POST /api/spaces  (admin)
- GET  /api/spaces/available?date=YYYY-MM-DD&start=HH:mm&end=HH:mm&type=laboratory

Reservations
- POST   /api/reservations
- DELETE /api/reservations/:id
- GET    /api/reservations/me

Calendar
- GET /api/calendar?range=day|week&date=YYYY-MM-DD[&spaceId=ID]

Health
- GET /api/health

---

## Datos de prueba rápidos (Swagger)

1) Registrar admin y estudiante
```json
POST /api/auth/register
{ "name": "Admin Prueba", "email": "admin@unicomfacauca.edu.co", "password": "secret123" }

POST /api/auth/register
{ "name": "Estudiante Prueba", "email": "estudiante@unicomfacauca.edu.co", "password": "secret123" }
```

2) Login y copiar tokens
```json
POST /api/auth/login
{ "email": "admin@unicomfacauca.edu.co", "password": "secret123" }

POST /api/auth/login
{ "email": "estudiante@unicomfacauca.edu.co", "password": "secret123" }
```

3) Crear espacio (con token de admin en Authorization: Bearer …)
```json
POST /api/spaces
{ "name": "Laboratorio A-101", "type": "laboratory", "capacity": 30 }
```

4) Crear reserva (con token de estudiante)
```json
POST /api/reservations
{
  "spaceId": 1,
  "start": "2025-11-10T21:00:00.000Z",
  "end":   "2025-11-10T22:00:00.000Z"
}
```

5) Cancelar reserva (usar el id devuelto al crearla)
```
DELETE /api/reservations/1
```

---

## Scripts útiles

```json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "test": "cross-env NODE_ENV=test jest --runInBand",
  "migrate": "sequelize db:migrate",
  "seed": "sequelize db:seed:all",
  "db:reset": "sequelize db:drop && sequelize db:create && sequelize db:migrate && sequelize db:seed:all",
  "swagger:check": "node ./src/config/swagger-build.js --check",
  "swagger:gen": "node ./src/config/swagger-build.js",
  "email:smoke": "node src/scripts/email-smoke.js"
}
```

---

## Equipo

- Gabriel – Backend y autenticación
- Camila – Reservas y notificaciones
- Isabella – Modelos y rutas
- Johnatan – Pruebas e integración
- Juan José Muñoz Garzón – Coordinación y documentación

---

## Tecnologías

Node.js, Express, Sequelize, SQLite/MySQL, JWT, Jest, Supertest, Swagger UI, Nodemailer (Mailtrap), dotenv, Nodemon

---

## Licencia

Proyecto académico – Ingeniería de Software II, Unicomfacauca (2025).
