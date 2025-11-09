// tests/setupTests.js
// ------------------------------------------------------------
// Silencia logs innecesarios durante las pruebas con Jest
// ------------------------------------------------------------
if (process.env.NODE_ENV === 'test') {
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => {
    const msg = args.join(' ');
    // Muestra solo errores o advertencias relevantes
    if (msg.includes('Error') || msg.includes('WARN')) {
      originalLog(...args);
    }
  };

  console.error = (...args) => {
    const msg = args.join(' ');
    // Muestra solo errores graves, no warnings de DB o sync
    if (
      msg.includes('Error') &&
      !msg.includes('Conexión a la base de datos') &&
      !msg.includes('Tablas sincronizadas')
    ) {
      originalError(...args);
    }
  };
}
