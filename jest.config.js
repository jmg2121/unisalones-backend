// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleDirectories: ['node_modules', 'src'],

  //  Evita ruido innecesario en consola
  verbose: false,
  silent: true,

  //  Cierra procesos abiertos (sequelize, nodemailer, etc.)
  detectOpenHandles: true,
  forceExit: true,

  // Ignora rutas que no queremos probar
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/src/config/',
    '/src/scripts/'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
};
