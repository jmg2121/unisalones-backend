require('dotenv').config();

const common = {
  define: {
    underscored: true,
    freezeTableName: true
  },
  logging: false
};

// 🚨 Verifica que haya al menos un nombre de base de datos en desarrollo
if (!process.env.DB_NAME && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️  Falta definir DB_NAME en tu archivo .env');
}

module.exports = {
  development: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'unisalon',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    ...common
  },

  test: {
    dialect: process.env.TEST_DB_DIALECT || 'sqlite',
    // 💾 Puede ser ':memory:' o './tests/test.sqlite' si quieres persistir entre runs
    storage: process.env.TEST_DB_STORAGE || ':memory:',
    ...common
  },

  production: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    ...common
  }
};
