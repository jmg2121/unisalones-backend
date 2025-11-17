require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// 🚫 NO iniciar servidor cuando Jest corre
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      console.log("Iniciando backend Unisalones...");
      console.log("Intentando conectar a la base de datos...");

      await sequelize.authenticate();
      console.log("Conexión a la base de datos exitosa.");

      const server = app.listen(PORT, () => {
        console.log(`Unisalones backend escuchando en http://localhost:${PORT}`);
      });

      process.on('SIGINT', async () => {
        console.log('Cerrando servidor...');
        await sequelize.close();
        server.close(() => process.exit(0));
      });

    } catch (error) {
      console.error("Error al iniciar servidor:", error);
    }
  })();
}

module.exports = app;
