# 🎓 Unisalones – Backend MVC (Express + Sequelize + TDD)

Backend funcional para el sistema de **reserva y gestión de espacios académicos** en Unicomfacauca.  
El proyecto sigue el **patrón MVC**, está desarrollado con **Node.js, Express y Sequelize**,  
y se diseñó aplicando un enfoque **TDD (Desarrollo Guiado por Pruebas)** con **Jest y Supertest**.

---

##  Descripción del proyecto

**Unisalones** permite a los usuarios (administradores y estudiantes) gestionar la reserva de salones, laboratorios y otros espacios institucionales.  
El sistema garantiza la disponibilidad, evita conflictos de horarios y ofrece funcionalidades para crear, consultar y cancelar reservas.

**Objetivo:**  
Implementar un backend escalable y probado que cumpla con los criterios de aceptación definidos en las historias de usuario del *Spring Backlog*.

---

##  Arquitectura del proyecto

El proyecto está estructurado bajo el patrón **MVC (Modelo – Vista – Controlador)**:

```
src/
 ├── models/          # Definición de entidades Sequelize (User, Space, Reservation, etc.)
 ├── controllers/     # Lógica principal de endpoints
 ├── routes/          # Definición de rutas Express
 ├── services/        # Funciones auxiliares (auth, notificaciones, etc.)
 ├── middlewares/     # Autenticación, validación, roles, etc.
 ├── tests/           # Pruebas unitarias e integración con Jest + Supertest
 └── app.js           # Configuración global del servidor Express
```

---

##  Instalación y configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/jmg2121/unisalones-backend.git
cd unisalones-backend
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno  
Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido (puedes usar `.env.example` como base):

```env
# Puerto del servidor
PORT=3000

# Base de datos MySQL (modo desarrollo)
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=unisalones_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql

# Base de datos para pruebas (SQLite)
TEST_DB_STORAGE=:memory:

# Clave secreta para JWT
JWT_SECRET=clave_super_secreta
```

---

##  Ejecución del proyecto

### ▶ Modo desarrollo
```bash
npm run dev
```
Inicia el servidor Express con **nodemon**, conexión a MySQL y logs activos.

---

###  Ejecutar pruebas (modo TDD)
```bash
npm test
```
Ejecuta todas las pruebas unitarias e integración con Jest.  
Verifica automáticamente el flujo de:
- Registro y login de usuarios  
- Creación y consulta de espacios  
- Reserva y cancelación de espacios  

Ejemplo de salida:
```
Test Suites: 6 passed, 6 total
Tests:       11 passed, 11 total
```

---

##  Modelos principales

| Entidad | Descripción | Relaciones |
|----------|--------------|-------------|
| **User** | Representa a los usuarios (admin, estudiante) | Tiene muchas reservas |
| **Space** | Representa los espacios físicos (salón, laboratorio) | Tiene muchas reservas |
| **Reservation** | Controla las reservas con estado y horario | Pertenece a User y Space |

---

##  Pruebas implementadas

- **Unitarias:** validan funciones específicas (`authLockout`, `availability`, `space`).
- **Integración:** prueban el flujo completo de reserva (`app.test.js`).
- **Evidencias:** todas las pruebas pasan correctamente (`6 suites, 11 tests`).

---

##  Equipo de desarrollo

| Integrante | Rol | Rama |
|-------------|-----|------|
| Gabriel     | Lógica de backend y autenticación | `feature/gabriel` |
| Camila      | Módulo de reservas (TDD) | `feature/camila` |
| Isabella    | Modelos y rutas | `feature/isabella` |
| Johnatan    | Pruebas de integración y corrección final | `feature/johnatan` |
| Juan José Muñoz Garzón | Coordinación, documentación y soporte técnico | `feature/juan` |

---

##  Tecnologías utilizadas

- **Node.js** – entorno de ejecución  
- **Express.js** – framework backend  
- **Sequelize ORM** – conexión con MySQL y SQLite  
- **Jest + Supertest** – pruebas automáticas (TDD)  
- **dotenv** – manejo de variables de entorno  
- **Nodemon** – reinicio automático en desarrollo

---

##  Licencia
Proyecto académico desarrollado para la asignatura **Grupo Ingeniería de Software II**  
en **Unicomfacauca – 2025**.
