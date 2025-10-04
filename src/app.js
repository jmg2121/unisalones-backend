const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');
const { sequelize } = require('./models');

const app = express();

// 🌐 Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 📦 Rutas principales
app.use('/api', routes);

// ⚠️ Middleware global de manejo de errores (siempre al final)
app.use(errorHandler);

// 🧠 Inicialización de la base de datos (solo en desarrollo)
async function init() {
  try {
    console.log('🔍 Intentando conectar a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync(); // Evita sincronizar en producción
      console.log('✅ Tablas sincronizadas (modo desarrollo).');
    }
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  }
}
init();

// 🧩 Si se ejecuta directamente con Node, inicia el servidor
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}/api`);
  });
}

module.exports = app;
