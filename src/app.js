// ==========================================================
// app.js — Versión mejorada, estable para PRODUCCIÓN y TEST
// ==========================================================

const express = require('express');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');
const { sequelize } = require('./models');

// Swagger
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec, swaggerCustomJs } = require('./config/swagger');

// Middlewares externos SOLO para entornos reales
const morgan = require('morgan');
const helmet = require('helmet');
const corsConfig = require('./config/corsConfig');
const { authLimiter, globalLimiter } = require('./middlewares/rateLimit');

// Rutas extra
const adminDocsRoutes = require("./routes/adminDocs.routes");
const reportRoutes = require('./routes/report.routes');

const app = express();

// ==========================================================
// Middlewares básicos (funcionan en test, dev y prod)
// ==========================================================
app.use(express.json());

// ==========================================================
// CONFIGURACIONES EXTRAS — SOLO PARA DESARROLLO Y PRODUCCIÓN
// ==========================================================
if (process.env.NODE_ENV !== 'test') {

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  app.use(corsConfig);

  app.use(morgan('dev'));

  // Rate Limits
  app.use(globalLimiter);
  app.use('/api/auth', authLimiter);

  // Swagger
  app.get('/swagger-custom.js', (req, res) => {
    res.type('application/javascript').send(swaggerCustomJs);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customJs: '/swagger-custom.js'
    })
  );

  // Admin Docs solo fuera de test
  app.use("/admin-docs", adminDocsRoutes);
}

// ==========================================================
// RUTAS PRINCIPALES
// ==========================================================
app.use('/api/reports', reportRoutes);
app.use('/api', routes);

// ==========================================================
// Middleware global de manejo de errores
// ==========================================================
app.use(errorHandler);

// ==========================================================
// Inicialización segura de la base de datos
// SOLO SE EJECUTA EN PRODUCCIÓN O DESARROLLO
// ==========================================================
let ready = Promise.resolve(); // valor por defecto para test

if (process.env.NODE_ENV !== 'test') {

  async function initDatabase() {
    try {
      console.log('Intentando conectar a la base de datos...');
      await sequelize.authenticate();
      console.log('Conexión a la base de datos exitosa.');

      const env = process.env.NODE_ENV;

      if (env === 'development') {
        await sequelize.sync({ alter: false });
        console.log('Sincronización no forzada: tus datos están preservados.');
      } else if (env === 'production') {
        console.log('Modo producción: sin sincronización automática.');
      }

    } catch (err) {
      console.error('Error al conectar o sincronizar BD:', err);
    }
  }

  ready = initDatabase();
}

// ==========================================================
// Cierre seguro — NO se usa en test
// ==========================================================
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('Conexión a la base de datos cerrada correctamente.');
  } catch (err) {
    console.error('Error cerrando la BD:', err);
  }
}

// ==========================================================
// EJECUCIÓN DIRECTA DEL SERVIDOR (NO para Jest)
// ==========================================================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/api`);
  });

  process.on('SIGINT', async () => {
    console.log('\nCerrando servidor...');
    await closeDatabase();
    server.close(() => process.exit(0));
  });
}

// ==========================================================
// EXPORTS PARA SUPERTEST Y JEST
// ==========================================================
module.exports = app;
module.exports.ready = ready;
module.exports.closeDatabase = closeDatabase;
