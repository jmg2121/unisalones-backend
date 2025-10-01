const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', routes);
app.use(errorHandler);

// Ensure DB exists (for dev)
async function init() {
  try {
    console.log("🔍 Intentando conectar a la base de datos...");
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos exitosa.");
    await sequelize.sync();
    console.log("✅ Tablas sincronizadas.");
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos:");
    console.error(err); // imprime todo el error
  }
}
init();

module.exports = app;
