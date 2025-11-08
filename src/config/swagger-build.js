// NUEVO EN SPRINT 2 – BLOQUE A
// Genera un swagger.json estático a partir de swaggerSpec
const fs = require('fs');
const path = require('path');
const { swaggerSpec } = require('./swagger');

const outPath = path.join(process.cwd(), 'swagger.json');
const isCheck = process.argv.includes('--check');

try {
  const json = JSON.stringify(swaggerSpec, null, 2);
  if (isCheck) {
    // simple sanity check
    const spec = JSON.parse(json);
    if (!spec.openapi || !spec.paths) {
      console.error('Swagger spec incompleta');
      process.exit(1);
    }
    console.log('Swagger spec OK');
    process.exit(0);
  } else {
    fs.writeFileSync(outPath, json);
    console.log('Swagger JSON generado en:', outPath);
  }
} catch (err) {
  console.error('Error generando swagger.json:', err);
  process.exit(1);
}
