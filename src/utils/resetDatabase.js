const { sequelize } = require('../models');

(async () => {
  try {
    console.log('  Eliminando todas las tablas y recreándolas...');
    await sequelize.sync({ force: true });
    console.log(' Base de datos reiniciada con éxito (todas las tablas vacías).');
  } catch (err) {
    console.error(' Error al reiniciar la base de datos:', err);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
})();
