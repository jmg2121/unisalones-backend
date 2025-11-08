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

## 🏗 Arquitectura del proyecto

El proyecto está estructurado bajo el patrón **MVC (Modelo -- Vista --
Controlador)**:

    src/
     ├── models/          # Definición de entidades Sequelize (User, Space, Reservation, etc.)
     ├── controllers/     # Lógica principal de endpoints
     ├── routes/          # Definición de rutas Express
     ├── services/        # Funciones auxiliares (auth, notificaciones, etc.)
     ├── middlewares/     # Autenticación, validación, roles, etc.
     ├── tests/           # Pruebas unitarias e integración con Jest + Supertest
     ├── config/          # Configuraciones (DB, Swagger)
     └── app.js           # Configuración global del servidor Express

------------------------------------------------------------------------

## ⚙️ Instalación y configuración

### 1️⃣ Clonar el repositorio

``` bash
git clone https://github.com/jmg2121/unisalones-backend.git
cd unisalones-backend
```

### 2️⃣ Instalar dependencias

``` bash
npm install
```

### 3️⃣ Configurar variables de entorno (.env)

``` env
PORT=3000
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=unisalones_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql
TEST_DB_STORAGE=:memory:
JWT_SECRET=clave_super_secreta
NODE_ENV=development
```

------------------------------------------------------------------------

## ▶ Ejecución del proyecto

### Modo desarrollo

``` bash
npm run dev
```

### Modo producción

``` bash
npm start
```

------------------------------------------------------------------------

## 🧪 Ejecución de pruebas (TDD)

``` bash
npm test
```

Ejecuta todas las pruebas unitarias e integración con Jest.\
Verifica automáticamente el flujo de autenticación, creación de
espacios, reservas y notificaciones.

Ejemplo de salida esperada:

    Test Suites: 7 passed, 7 total
    Tests: 12 passed, 12 total

------------------------------------------------------------------------

## 🧱 Modelos principales

  Entidad             Descripción
  ------------------- -----------------------------------------
  **User**            Representa usuarios (admin, estudiante)
  **Space**           Espacios físicos (salón, laboratorio)
  **Reservation**     Controla reservas con estado y horario
  **Notification**    Registra mensajes o correos enviados
  **WaitlistEntry**   Lista de espera para espacios ocupados

------------------------------------------------------------------------

## 📘 Documentación de la API (Swagger)

### Descripción

La API está documentada con **Swagger UI**, accesible desde cualquier
navegador.

### Rutas documentadas

-   `/api/spaces`
-   `/api/reservations`

### Acceso

``` bash
npm run dev
```

👉 <http://localhost:3000/api-docs>

### Scripts

``` bash
npm run swagger:gen
npm run swagger:check
```

------------------------------------------------------------------------

## 🧩 Pruebas de Swagger

Archivo: `tests/integration/api-docs.int.test.js`

``` js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /api-docs', () => {
  it('debe responder 200 y servir la interfaz Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Swagger UI');
  });
});
```

Resultado esperado:

    PASS tests/integration/api-docs.int.test.js
    ✓ debe responder 200 y servir la interfaz Swagger UI (50 ms)

------------------------------------------------------------------------

## ⚠️ Riesgos y Rollback -- Bloque A (Swagger)

### Riesgos detectados

  ------------------------------------------------------------------------------
  Riesgo             Descripción             Impacto          Solución
  ------------------ ----------------------- ---------------- ------------------
  Incompatibilidad   Versiones de Swagger    Swagger no       Fijar versiones en
  de dependencias    distintas a Express 4.x inicia.          package.json
                     pueden fallar.                           

  Errores de         Bloques mal cerrados    `/api-docs`      Validar
  anotación JSDoc    pueden romper el JSON.  falla.           anotaciones antes
                                                              de `swagger:gen`

  Ruta en conflicto  Otra librería puede     Documentación    Reservar
  (`/api-docs`)      usar la misma ruta.     inaccesible.     `/api-docs` solo
                                                              para Swagger

  Documentación      Cambios no reflejados   Swagger muestra  Actualizar junto
  desactualizada     en las anotaciones.     datos            con controladores
                                             incorrectos.     
  ------------------------------------------------------------------------------

### Rollback (reversión)

1.  Desinstalar dependencias:

    ``` bash
    npm uninstall swagger-ui-express swagger-jsdoc
    ```

2.  Limpiar el código:

    -   Quitar el bloque Swagger de `src/app.js`
    -   Borrar los comentarios `@swagger` en las rutas

3.  Restaurar versión estable:

    ``` bash
    git restore src/app.js package.json
    ```

4.  Probar funcionamiento normal:

    ``` bash
    npm run dev
    ```

------------------------------------------------------------------------

## 👥 Equipo de desarrollo

  Integrante                   Rol
  ---------------------------- ------------------------------
  Gabriel                      Backend y autenticación
  Camila                       Módulo de reservas (TDD)
  Isabella                     Modelos y rutas
  Johnatan                     Pruebas de integración
  **Juan José Muñoz Garzón**   Coordinación y documentación

------------------------------------------------------------------------

## 💻 Tecnologías utilizadas

Node.js, Express.js, Sequelize ORM, Jest + Supertest, Swagger UI +
JSDoc, dotenv, Nodemon

------------------------------------------------------------------------

## 🏁 Licencia

Proyecto académico desarrollado para la asignatura **Ingeniería de
Software II**\
en **Unicomfacauca -- 2025**.
