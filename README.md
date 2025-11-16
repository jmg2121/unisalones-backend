<p align="center">
  <img src="assets/logo.png" width="180" alt="Unisalones Logo" />
</p>

# 🎓 Unisalones — Backend MVC (Express + Sequelize + TDD)

Backend oficial del sistema de **gestión y reserva de espacios académicos** de *Unicomfacauca*.

Desarrollado con **Node.js**, **Express**, **Sequelize**, arquitectura **MVC** y enfoque **TDD** (Jest + Supertest).

Este backend garantiza:

- 📡 Disponibilidad en tiempo real  
- 🚫 Prevención de solapamientos  
- 🏫 Gestión completa de espacios  
- 🔐 Seguridad alineada al **OWASP API Security Top 10**  
- 📘 Documentación con **Swagger**  
- 🧪 Pruebas unitarias e integradas  

---

## 🧩 Descripción General

**Unisalones** permite que estudiantes, profesores y administradores gestionen reservas institucionales de manera eficiente.

El sistema asegura:

- Validación horaria  
- Prevención de conflictos  
- Notificaciones por correo  
- Calendario diario y semanal  
- Control de acceso basado en roles  
- Auditoría por reportes de uso  

**Objetivo del proyecto:**  
Construir un backend **robusto, seguro y completamente probado**, cumpliendo las historias de usuario de los **Sprint 1, 2 y 3**.

---

## 🏛 Arquitectura del Proyecto

```
src/
├─ models/          # Modelos Sequelize (User, Space, Reservation, etc.)
├─ controllers/     # Controladores: Auth, Reservations, Calendar, Reports
├─ routes/          # Rutas Express agrupadas por módulo
├─ services/        # Lógica de negocio (Auth, Calendar, Mail, Reports)
├─ middlewares/     # JWT, roles, validaciones, rate limit, errores
├─ config/          # Configuración DB, SMTP, Swagger, CORS, seguridad
├─ tests/           # Pruebas unitarias e integración con Supertest
└─ app.js           # Aplicación Express (exportada para Jest)
```

---

## ⚙️ Instalación

### 1️⃣ Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/jmg2121/unisalones-backend.git
cd unisalones-backend
npm install
```

### 2️⃣ Variables de entorno (`.env`)

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

## 🧪 Ejecución y Pruebas

```bash
# 🚀 Modo desarrollo
npm run dev

# 🚀 Modo producción
npm start

# 🧪 Ejecutar todas las pruebas (TDD)
npm test

# 🧪 Ejecutar un archivo de prueba específico
npm test -- tests/integration/notifications.int.test.js

# 🧪 Filtrar pruebas por patrón
npm test -- -t "calendar"

# 🔄 Reiniciar base de datos (desarrollo)
npm run db:reset

# 📘 Generar documentación Swagger
npm run swagger:gen

# 🔍 Verificar errores en Swagger
npm run swagger:check

# ✉️ Prueba de correo SMTP (Mailtrap)
npm run email:smoke
```

**Salida esperada:**

```
Test Suites: 15 passed, 15 total
Tests:       31 passed, 31 total
```

---

## 🏁 Sprint 1 — Fundamentos del Sistema

Se construyó la base del backend siguiendo la arquitectura **MVC**, autenticación con **JWT**, control de acceso y creación de los modelos principales.

### 📌 Historias de Usuario

#### **HU-001 — Registro de usuario institucional**
- Permite registrar únicamente correos institucionales.
- Se valida el dominio usando `INSTITUTIONAL_DOMAIN`.
- Contraseñas cifradas con `bcrypt`.

#### **HU-002 — Login del usuario**
- Autenticación por correo y contraseña.
- Token JWT con expiración.
- Protección de rutas privadas.

#### **HU-003 — Roles básicos**
- Roles: `admin`, `student`.
- Rutas sensibles requieren `admin`.

#### **HU-004 — Crear espacios**
- Admin crea salones, laboratorios o auditorios.
- Campos: nombre, tipo, capacidad, is_active.

#### **HU-005 — Consultar espacios disponibles**
- Filtro por fecha, hora y tipo.
- Lista de espacios sin reservas.

### ⚙️ Componentes Técnicos
- **Modelos:** User, Space, Reservation.  
- **Rutas:** `/api/auth/register`, `/api/auth/login`, `/api/spaces`.  
- **Middlewares:** autenticación, roles, manejo de errores.  
- **Pruebas:** registro, login, CRUD de espacios.

✅ **Resultado:** núcleo del backend funcional y probado.

---

## 🚀 Sprint 2 — Funcionalidades Avanzadas y Seguridad

Se amplió la funcionalidad del sistema con **Swagger**, **notificaciones por correo**, **calendario**, **seguridad OWASP** y **pruebas integradas**.

### 📌 Historias de Usuario

#### **HU-004 — Notificaciones por correo**
- Reserva confirmada o cancelada.
- Correos registrados en `notifications`.
- SMTP con Mailtrap.

#### **HU-006 — Reportes de uso (JSON / PDF / XLSX)**
- `/api/reports/usage`
- Filtro por fecha o `spaceId`.
- Exportación en JSON, XLSX o PDF.

#### **HU-008 — Calendario de disponibilidad**
- `/api/calendar?range=day|week&date=YYYY-MM-DD`
- Detección de solapamientos.
- Respuesta agrupada por slots.

#### **HU-009 — Historial del usuario**
- `/api/reservations/me`
- Reservas del usuario autenticado.

#### **HU-010 — Lista de espera**
- Promoción automática en cancelaciones.

---

## 🛡️ Seguridad OWASP (Bloque D)

Medidas alineadas a **OWASP API Security Top 10**:

1. 🔑 Autenticación robusta (JWT firmado).  
2. 🎓 Dominio institucional obligatorio.  
3. 🚫 Lockout tras intentos fallidos.  
4. ⚡ Rate limiting global y en auth.  
5. 🌐 CORS estricto por entorno.  
6. 🧼 Validación y sanitización exhaustiva.  
7. 🔐 Gestión segura de secretos (.env).

---

## 📚 Bloque A — Swagger

**URL:**  
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

# 🧱 Sprint 3 — Integración Final

El Sprint 3 consolidó todas las funcionalidades: **lista de espera, reportes avanzados, calendario mejorado, seguridad reforzada y 100% de pruebas exitosas.**

### 🎯 Objetivos
- Finalizar funcionalidades faltantes.  
- Integrar HU-010 (Waitlist).  
- Reportes HU-006 en PDF/XLSX.  
- Garantizar estabilidad total.  
- Sustentación final.

---

## 🧪 HU-006 — Reportes de Uso

**Endpoint:**  
`GET /api/reports/usage?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=json|pdf|xlsx`

**Formatos:** JSON, PDF, XLSX  
**Validaciones:** fechas correctas, rol admin, zonas horarias.  
**Tecnologías:** openpyxl, reportlab, dayjs, Sequelize.

---

## 📌 HU-010 — Lista de Espera

**Flujo:**
1. Horario ocupado → el usuario se une a la lista.  
2. Si se cancela la reserva principal → el primer usuario es promovido automáticamente.  
3. Se crea nueva reserva y se notifica por correo.

**Endpoints:**
- `POST /api/reservations/waitlist`
- `GET /api/reservations/waitlist`

**Validaciones:**  
- Sin duplicados.  
- Orden ascendente por posición.  
- Promoción automática funcional.

---

## 🗓️ HU-008 — Calendario Mejorado

**Mejoras:**
- Zona horaria “America/Bogota”.  
- Slots dinámicos (`day`/`week`).  
- Consultas optimizadas.  
- Compatible con frontend.

✅ **Todas las pruebas pasaron:**
```
Test Suites: 15 passed, 15 total
Tests:       31 passed, 31 total
```

---

## 🔐 Seguridad Sprint 3

- Validación estricta en reportes.  
- Verificación de permisos admin.  
- Protección contra abuso en lista de espera.  
- Sanitización en parámetros.

---

## 🧩 Integración Final

**Ramas integradas:**
- `feature/johnatan` — Calendar  
- `feature/isabella` — Seguridad OWASP  
- `feature/camila` — Notificaciones  
- `feature/gabriel` — Waitlist  
- `feature/juan` — Pruebas + README  

**Conflictos corregidos:**
`routes/index.js`, `calendar.controller.js`, `notification.test.js`.

---

## 📘 Documentación Consolidada

Incluye:
- README completo  
- Swagger sincronizado  
- Reportes, calendario, notificaciones  
- Seguridad OWASP funcional  
- Tests 100% aprobados  

---

## 🎯 Resultado Final

✅ 100% funcional  
✅ 100% probado  
✅ 100% documentado  
✅ 100% listo para producción  

**Sistema listo para sustentación final de Ingeniería de Software II.**

---

## 🧱 Modelos Principales

| Modelo | Campos principales |
|--------|--------------------|
| **User** | id, name, email, password_hash, role, failed_attempts, lock_until |
| **Space** | id, name, type, capacity, is_active |
| **Reservation** | id, user_id, space_id, start_time, end_time, status, receipt_code |
| **Notification** | id, user_id, message, type, payload, is_read, sent_at |
| **WaitlistEntry** | id, user_id, space_id, start_time, end_time, status, position |

---

## 🧰 Scripts útiles

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

## 👥 Equipo de Desarrollo

- **Gabriel Esteban Manquillo**  
- **Camila Gómez Rengifo**  
- **Isabella Sánchez Torres**  
- **Johnatan Ortiz Gaviria**  
- **Juan José Muñoz Garzón**

---

## 🧠 Tecnologías Principales

Node.js · Express · Sequelize · SQLite/MySQL · JWT · Jest · Supertest · Swagger UI · Nodemailer (Mailtrap) · dotenv · Nodemon

---

## 📄 Licencia

Proyecto académico — *Ingeniería de Software II, Unicomfacauca (2025)*.

