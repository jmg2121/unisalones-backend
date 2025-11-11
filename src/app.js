const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const corsConfig = require('./config/corsConfig'); // configuración CORS
const { authLimiter, globalLimiter } = require('./middlewares/rateLimit'); // límites de peticiones
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');
const { sequelize } = require('./models');

// Swagger (Sprint 2 – Bloque A)
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

const app = express();

// ==========================================================
// Seguridad OWASP (Bloque D – Isabella)
// ==========================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // permite Swagger y Mailtrap
  })
);
app.use(corsConfig());

// Limitadores de peticiones
if (process.env.NODE_ENV !== 'test') {
  app.use(globalLimiter); // límite global
  app.use('/api/auth', authLimiter); // límite específico para rutas de autenticación
}
// ==========================================================
// Fin Seguridad OWASP
// ==========================================================

// ==========================================================
// Middlewares globales
// ==========================================================
app.use(express.json());
app.use(morgan('dev'));

// ==========================================================
// Documentación Swagger
// ==========================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ==========================================================
// Rutas principales
// ==========================================================
app.use('/api', routes);

// ==========================================================
// Middleware global de manejo de errores
// ==========================================================
app.use(errorHandler);

// ==========================================================
// Inicialización segura de la base de datos
// ==========================================================
async function initDatabase() {
  try {
    console.log('Intentando conectar a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa.');

    const env = process.env.NODE_ENV || 'development';

    if (env === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Sincronización no forzada: tus datos están preservados.');
    } else if (env === 'test') {
      await sequelize.sync({ force: true });
      console.log('Modo test: sincronización forzada solo para pruebas.');
    } else {
      console.log('Modo producción: sin sincronización automática.');
    }
  } catch (err) {
    console.error('Error al conectar o sincronizar la base de datos:', err);
  }
}

// Exporta una promesa para Jest
const ready = initDatabase();

// ==========================================================
// Cierre seguro para Jest o entornos de prueba
// ==========================================================
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('🧹 Conexión a la base de datos cerrada correctamente.');
  } catch (err) {
    console.error('💥 Error cerrando la base de datos:', err);
  }
}

// ==========================================================
// Ejecución directa del servidor
// ==========================================================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/api`);
    console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
  });

  // Cierre elegante al detener el servidor
  process.on('SIGINT', async () => {
    console.log('\n🧹 Cerrando servidor...');
    await closeDatabase();
    server.close(() => process.exit(0));
  });
}

// ==========================================================
// Export dual (para Supertest, Jest y uso general)
// ==========================================================
module.exports = app;
module.exports.ready = ready;
module.exports.closeDatabase = closeDatabase;

