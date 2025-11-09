const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');
const { sequelize } = require('./models');

// Swagger (Sprint 2 – Bloque A)
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

const app = express();

// ---------------------------
// Middlewares globales
// ---------------------------
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ---------------------------
// Documentación Swagger
// ---------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ---------------------------
// Rutas principales
// ---------------------------
app.use('/api', routes);

// ---------------------------
// Middleware global de manejo de errores (siempre al final)
// ---------------------------
app.use(errorHandler);

// ---------------------------
// Inicialización de la base de datos (usada en desarrollo y test)
// ---------------------------
async function initDatabase() {
  try {
    console.log(' Intentando conectar a la base de datos...');
    await sequelize.authenticate();
    console.log(' Conexión a la base de datos exitosa.');

    if (['development', 'test'].includes(process.env.NODE_ENV)) {
      await sequelize.sync({ force: true });
      console.log(' Tablas sincronizadas (modo desarrollo o test).');
    }
  } catch (err) {
    console.error(' Error al conectar a la base de datos:', err);
  }
}

// Exporta una promesa que Jest puede esperar
const ready = initDatabase();

// ---------------------------
// Cierre seguro para Jest o servidores
// ---------------------------
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('  Conexión a la base de datos cerrada correctamente.');
  } catch (err) {
    console.error('  Error cerrando la base de datos:', err);
  }
}

// ---------------------------
// Si se ejecuta directamente con Node → inicia el servidor
// ---------------------------
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}/api`);
    console.log(` Documentación Swagger en http://localhost:${PORT}/api-docs`);
  });

  // Manejo elegante de cierre (Ctrl+C o kill)
  process.on('SIGINT', async () => {
    console.log('\n🧹 Cerrando servidor...');
    await closeDatabase();
    server.close(() => process.exit(0));
  });
}

// ---------------------------
// Export dual (para Supertest y Jest)
// ---------------------------
module.exports = app;
module.exports.ready = ready;
module.exports.closeDatabase = closeDatabase;
