<p align="center">
  <img src="assets/logo.png" width="180" />
</p> 

\# 🎓 Unisalones — Backend MVC (Express + Sequelize + TDD)

Backend oficial del sistema de \*\*gestión y reserva de espacios académicos\*\* de Unicomfacauca.

Desarrollado con \*\*Node.js\*\*, \*\*Express\*\*, \*\*Sequelize\*\*, arquitectura \*\*MVC\*\* y enfoque \*\*TDD\*\* (Jest + Supertest).

Este backend garantiza:

- Disponibilidad en tiempo real
- Prevención de solapamientos
- Gestión completa de espacios
- Seguridad alineada al \*\*OWASP API Security Top 10\*\*
- Documentación con \*\*Swagger\*\*
- Pruebas: unitarias + integración

\---

\## 🧩 Descripción General

\*\*Unisalones\*\* permite que estudiantes, profesores y administradores gestionen reservas institucionales.

El sistema asegura:

- Validación horaria
- Prevención de conflictos
- Notificaciones por correo
- Calendario diario y semanal
- Control de acceso basado en roles
- Auditoría por reportes de uso

\*\*Objetivo del proyecto:\*\*

Construir un backend \*\*robusto, seguro y completamente probado\*\*, cumpliendo las historias de usuario de los \*\*Sprint 1, 2 y 3\*\*.

\---

\## 🏛 Arquitectura del Proyecto

\---

src/

├─ models/ # Modelos Sequelize (User, Space, Reservation, etc.)

├─ controllers/ # Controladores: Auth, Reservations, Calendar, Reports

├─ routes/ # Rutas Express agrupadas por módulo

├─ services/ # Lógica de negocio (Auth, Calendar, Mail, Reports)

├─ middlewares/ # JWT, roles, validaciones, rate limit, errores

├─ config/ # Configuración DB, SMTP, Swagger, CORS, seguridad

├─ tests/ # Pruebas unitarias e integración con Supertest

└─ app.js # Aplicación Express (exportada para Jest)

\---

\## ⚙️ Instalación

\### 1) Clonar el repositorio e instalar dependencias

\```bash

git clone https://github.com/jmg2121/unisalones-backend.git

cd unisalones-backend

npm install


\2) Variables de entorno (`\.env`)

\```bash

PORT=3000

DB\_USER=root

DB\_PASS=root

DB\_NAME=unisalones\_db

DB\_HOST=127.0.0.1

DB\_PORT=3306

DB\_DIALECT=mysql

TEST\_DB\_STORAGE=:memory:

JWT\_SECRET=clave\_super\_secreta

NODE\_ENV=development

\# Bloque B – SMTP (Mailtrap)

SMTP\_HOST=sandbox.smtp.mailtrap.io

SMTP\_PORT=2525

SMTP\_USER=426d973747582d

SMTP\_PASS=2682d9c45ccf68

SMTP\_FROM="Unisalones <no-reply@unisalones.com>"

\# Bloque D – Seguridad

CORS\_ORIGINS=http://localhost:5173,http://localhost:3000

RATE\_LIMIT\_MAX\_AUTH=10

RATE\_LIMIT\_MAX\_GLOBAL=100

JWT\_EXPIRES=1h

LOCK\_MINUTES=15

INSTITUTIONAL\_DOMAIN=@unicomfacauca.edu.co

\```

\---

\## Ejecución y Pruebas

\```bash

\# 🚀 Modo desarrollo

npm run dev

\# 🚀 Modo producción

npm start

\# 🧪 Ejecutar todas las pruebas (TDD)

npm test

\# 🧪 Ejecutar un archivo de prueba específico

npm test -- tests/integration/notifications.int.test.js

\# 🧪 Ejecutar pruebas filtrando por patrón

npm test -- -t "calendar"

\# 🔄 Reiniciar la base de datos (desarrollo)

npm run db:reset

\# 📘 Generar documentación Swagger

npm run swagger:gen

\# 🔍 Verificar que Swagger no tenga errores

npm run swagger:check

\# ✉️ Prueba de correo SMTP (Mailtrap)

npm run email:smoke


Salida esperada (ejemplo)

\```

Test Suites: 15 passed, 15 total

Tests:       31 passed, 31 total

\```

\---

\## 🏁 Sprint 1 — Fundamentos del Sistema (Backend Inicial)

En este sprint se construyó la base del backend siguiendo arquitectura \*\*MVC\*\*, autenticación con \*\*JWT\*\*, control de acceso y creación de los modelos principales del sistema.

También se definieron las primeras historias de usuario funcionales.

\---

\## 📌 Historias de Usuario Implementadas en Sprint 1

\### \*\*HU-001 — Registro de usuario institucional\*\*

- Permite registrar únicamente correos institucionales.
- Se valida el dominio usando `INSTITUTIONAL\_DOMAIN` del `.env`.
- Se almacena la contraseña en hash (`bcrypt`).

\### \*\*HU-002 — Login del usuario\*\*

- Autenticación con correo y contraseña.
- Generación de token JWT (expira según `JWT\_EXPIRES`).
- Prevención de acceso a rutas protegidas sin token.

\### \*\*HU-003 — Roles básicos\*\*

- Usuarios con rol:
- `admin`
- `student`
- Las rutas sensibles (como espacios) requieren rol `admin`.

\### \*\*HU-004 — Crear espacios\*\*

- Administradores pueden crear “salones, laboratorios, auditorios”.
- Campos: nombre, tipo, capacidad, is\_active.

\### \*\*HU-005 — Consultar espacios disponibles\*\*

- Filtro por fecha, hora y tipo.
- Respuesta con lista de espacios que NO tienen reservas en el rango suministrado.

\---

\## 🏗️ Componentes Técnicos de Sprint 1

\### ✔️ Modelos creados

- `User`
- `Space`
- `Reservation` (estructura inicial)
- Conexión Sequelize + MySQL/SQLite

\### ✔️ Rutas implementadas

- `/api/auth/register`
- `/api/auth/login`
- `/api/spaces`
- `/api/spaces/available`

\### ✔️ Middlewares esenciales

- Autenticación JWT (`authenticate`)
- Autorización por roles (`authorizeAdmin`)
- Manejo global de errores

\### ✔️ Pruebas iniciales

- Registro y login funcionan.
- Token válido protege rutas privadas.
- CRUD básico de espacios.

\---

\## 🧩 Resultado del Sprint 1

Con este sprint quedó listo el \*\*núcleo del backend\*\*:

- Usuarios autenticados y verificados.
- Roles que controlan permisos.
- API capaz de gestionar espacios académicos.
- Base sólida para construir reservas, calendario y notificaciones en sprints posteriores.

El Sprint 1 sienta toda la infraestructura necesaria del sistema.


\---

\## 🚀 Sprint 2 — Funcionalidades Avanzadas y Seguridad (OWASP + Calendario + Notificaciones)

En este sprint se ampliaron las funcionalidades esenciales del sistema:

\*\*documentación con Swagger, notificaciones por correo, calendario de disponibilidad, controles OWASP y pruebas completas de integración.\*\*

\---

\## 📌 Historias de Usuario Implementadas en Sprint 2

\### \*\*HU-004 — Notificaciones por correo\*\*

- Al crear una reserva → se envía correo “Reserva confirmada”.
- Al cancelar una reserva → se envía correo “Reserva cancelada”.
- Los correos se registran en la tabla `notifications`.
- SMTP mediante \*\*Mailtrap\*\*.

\### \*\*HU-006 — Reportes de uso (JSON / PDF / XLSX)\*\*

- Endpoint: `/api/reports/usage`
- Filtrado por fechas y por `spaceId`.
- Exportación en:
- `json`
- `xlsx`
- `pdf`
- Validaciones en query params (express-validator).
- Roles: solo \*\*admin\*\* accede.

\### \*\*HU-008 — Calendario de disponibilidad\*\*

- Endpoint: `/api/calendar`
- Parámetros:
- `range`: `day` o `week`
- `date`: YYYY-MM-DD
- `spaceId`: opcional
- Cálculo automático de slots por rango.
- Manejo de huso horario “America/Bogota”.
- Detección de solapamientos con reservas.
- Respuesta agrupada por día → slots → estado.

\### \*\*HU-009 — Historial del usuario\*\*

- Endpoint: `/api/reservations/me`
- Devuelve todas las reservas del usuario autenticado, ordenadas de más reciente a más antigua.

\### \*\*HU-010 — Lista de espera\*\*

- Un estudiante puede unirse a una lista de espera.
- Si una reserva se cancela, se promueve automáticamente al siguiente en la lista.

\---

\## 🛡️ Seguridad — OWASP (Bloque D)

Se incorporaron medidas reales de seguridad alineadas a OWASP API Security Top 10:

\### 1️⃣ Autenticación robusta

- JWT firmado con `JWT\_SECRET`.
- Expiración definida con `JWT\_EXPIRES`.

\### 2️⃣ Dominio institucional

- Solo correos `@unicomfacauca.edu.co` (configurable).

\### 3️⃣ Lockout por intentos fallidos

- Tras 3 intentos fallidos → bloqueo por `LOCK\_MINUTES`.

\### 4️⃣ Rate limiting completo

- Global
- Rutas de autenticación

\### 5️⃣ CORS estricto

- Dominios permitidos desde `.env`.

\### 6️⃣ Validación exhaustiva

- Paramétricas, sanitización, manejo de errores.

\### 7️⃣ Gestión segura de secretos

- JWT, SMTP, DB, etc., en `.env` (no versionado).

\---

\## 📚 Bloque A — Swagger (Documentación de la API)

\### URL

http://localhost:3000/api-docs

\---

\# 🚀 Sprint 3 — Integración Final, Lista de Espera, Reportes Avanzados y Estabilidad Total

El Sprint 3 consolidó TODA la funcionalidad del proyecto Unisalones, integrando lista de espera avanzada, reportes PDF/XLSX, mejoras internas del calendario, pruebas finales de todo el sistema y preparación total para sustentación.

Este documento reúne TODA la información de Sprint 3 en un solo bloque Markdown.

\---

\## 🎯 Objetivos del Sprint 3

- Finalizar funcionalidades faltantes del sistema.
- Integrar listas de espera (HU-010).
- Implementar reportes avanzados HU-006 (PDF, XLSX, JSON).
- Garantizar la estabilidad total del backend.
- Ejecutar 100% de pruebas unitarias e integración.
- Actualizar y consolidar toda la documentación.
- Preparar el backend para sustentación y conexión con el frontend.

\---

\## 🧪 HU-006 — Reportes de Uso (JSON, PDF, XLSX)

Se implementó un sistema profesional de reportes de uso por fechas.

\### \*\*Endpoint\*\*

GET /api/reports/usage?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=json|pdf|xlsx


\### \*\*Formatos soportados\*\*

- \*\*JSON\*\* → respuesta estructurada para el frontend
- \*\*PDF\*\* → reporte visual (ReportLab)
- \*\*XLSX\*\* → reporte tabular (Excel, generado con openpyxl)

\### \*\*Características\*\*

- Filtrado por:
- Rango de fechas
- `spaceId`
- estado de la reserva
- Cálculo de horas totales usadas por espacio
- Totales por día y por salón
- Nombre del archivo con timestamp
- Descarga automática desde Swagger

\### \*\*Tecnologías\*\*

- openpyxl
- reportlab
- dayjs
- Sequelize ORM

\### \*\*Validaciones HU-006\*\*

- Admin obligatorio (403 para usuarios normales)
- Validación estricta: fechas correctas
- Soporte de timezones
- Horas calculadas sin errores

\---

\## 📌 HU-010 — Lista de Espera (Waitlist)

La lista de espera es una de las funcionalidades más importantes del Sprint 3.

\### \*\*Flujo implementado\*\*

1. Si un horario está ocupado → el usuario puede unirse a la lista de espera.
1. Cada usuario obtiene una \*\*posición\*\* inicial.
1. Si la reserva principal se cancela →

✔ El primer usuario de la lista es promovido automáticamente.

✔ Se genera nueva reserva.

✔ Se envía correo de confirmación.

✔ Su estado cambia a `converted`.

\### \*\*Endpoints\*\*

- Unirse:

POST /api/reservations/waitlist


- Consultar lista:

GET /api/reservations/waitlist



\### \*\*Validaciones HU-010\*\*

- Un usuario no puede unirse dos veces a la misma franja.
- El sistema respeta la posición (ordenamiento ASC).
- Promoción automática totalmente funcional.
- Notificaciones enviadas por Mailtrap.

\---

\## 🗓️ Mejoras al Calendario (HU-008)

El Sprint 3 corrigió, optimizó y estabilizó el calendario.

\### \*\*Mejoras aplicadas\*\*

- Soporte correcto a zonas horarias (America/Bogota).
- Slots generados dinámicamente.
- Soporte a week/day.
- Soporte 100% a `spaceId`.
- Respuestas más rápidas gracias a consultas consolidadas.
- Estructura final compatible con el frontend.

\### \*\*Pruebas HU-008\*\*

- Día sin reservas → todos los slots `available`.
- Reserva solapada → `reserved`.
- Varios espacios → estado global (`full` o `available`).

Todas las pruebas PASS.

Test Suites: 15 passed, 15 total

Tests: 31 passed, 31 total

\---

\## 🔐 Seguridad Sprint 3 (añadido a OWASP)

Aparte de lo del Sprint 2, en el Sprint 3 se reforzó:

- Validación estricta de reportes
- Verificación de permisos administrativos
- Protección anti-abuso en lista de espera
- Respuestas más claras en errores de calendario
- Sanitización en parámetros del report controller

\---

\## 🧩 Integración Final del Proyecto (Back + Tests)

\### \*\*Ramas integradas:\*\*

- `feature/johnatan` — Calendario
- `feature/isabella` — Seguridad OWASP
- `feature/camila` — Notificaciones
- `feature/gabriel` — Lista de espera
- `feature/juan` — Pruebas finales + README

\### \*\*Conflictos corregidos\*\*

- `routes/index.js`
- `notification.test.js`
- `calendar.controller.js`
- Sequelize loops

\### \*\*Pruebas finales del Sprint 3\*\*

Todas en verde:


\---

\## 📘 Documentación consolidada Sprint 3

\### Contenido entregado:

- README completo
- Documentación del backend
- Swagger 100% sincronizado
- Reportes funcionando
- Lista de espera funcionando
- Calendario funcionando
- Notificaciones funcionando
- Seguridad OWASP funcionando
- Tests unitarios e integración funcionando

\---

\## 🎯 Resultado Final del Sprint 3

El backend quedó:

- 100% funcional
- 100% probado
- 100% documentado
- 100% listo para producción
- Sin errores en Swagger
- Con correo operativo en Mailtrap
- Con reportes PDF/XLSX profesionales
- Con calendar y waitlist funcionando
- Con seguridad OWASP completa

\*\*Sistema listo para sustentación y entrega final de Ingeniería de Software II.\*\*



\---

\## Modelos

- User: id, name, email, password\_hash, role, failed\_attempts, lock\_until
- Space: id, name, type, capacity, is\_active
- Reservation: id, user\_id, space\_id, start\_time, end\_time, status, receipt\_code
- Notification: id, user\_id, message, type (enum), payload(json), is\_read, sent\_at
- WaitlistEntry: id, user\_id, space\_id, start\_time, end\_time, status, position

\---

\## Scripts útiles

\```json

"scripts": {

"dev": "nodemon src/server.js",

"start": "node src/server.js",

"test": "cross-env NODE\_ENV=test jest --runInBand",

"migrate": "sequelize db:migrate",

"seed": "sequelize db:seed:all",

"db:reset": "sequelize db:drop && sequelize db:create && sequelize db:migrate && sequelize db:seed:all",

"swagger:check": "node ./src/config/swagger-build.js --check",

"swagger:gen": "node ./src/config/swagger-build.js",

"email:smoke": "node src/scripts/email-smoke.js"

}

\```

\---

\## Equipo

- Gabriel Esteban Manquillo
- Camila Gomez Rengifo
- Isabella Sanchez Torres
- Johnatan Oritz Gaviria
- Juan José Muñoz Garzón

\---

\## Tecnologías

Node.js, Express, Sequelize, SQLite/MySQL, JWT, Jest, Supertest, Swagger UI, Nodemailer (Mailtrap), dotenv, Nodemon

\---

\## Licencia

Proyecto académico – Ingeniería de Software II, Unicomfacauca (2025).


