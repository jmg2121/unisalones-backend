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
const { swaggerSpec, swaggerCustomJs } = require('./config/swagger');

const app = express();

// ==========================================================
// Seguridad OWASP (Bloque D)
// ==========================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // permite Swagger y Mailtrap
  })
);
app.use(corsConfig);

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
//  Servir script externo para el botón "Copiar token"
// ==========================================================
app.get('/swagger-custom.js', (req, res) => {
  res.type('application/javascript').send(`
    window.addEventListener('load', function() {
      const observer = new MutationObserver(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          if (block.innerText.includes('"token"') && !block.parentElement.querySelector('.copy-btn')) {
            const button = document.createElement('button');
            button.textContent = '📋 Copiar token';
            button.className = 'copy-btn';
            button.style = \`
              position: absolute;
              top: 5px;
              right: 5px;
              background-color: #007bff;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 6px 10px;
              cursor: pointer;
              font-size: 12px;
              z-index: 10;
            \`;

            button.addEventListener('click', () => {
              const match = block.innerText.match(/"token"\\s*:\\s*"([^"]+)"/);
              if (match && match[1]) {
                navigator.clipboard.writeText(match[1]);
                button.textContent = '✅ Copiado';
                button.style.backgroundColor = '#28a745';
                setTimeout(() => {
                  button.textContent = '📋 Copiar Token';
                  button.style.backgroundColor = '#007bff';
                }, 1500);
              }
            });

            const wrapper = block.parentElement;
            wrapper.style.position = 'relative';
            wrapper.appendChild(button);
          }
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  `);
});


// ==========================================================
// Documentación Swagger (con botón "Copiar token")
// ==========================================================
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customJs: '/swagger-custom.js',
    customCss: `
      .copy-btn:hover {
        opacity: 0.9;
      }
      .swagger-ui .topbar { background-color: #003366 !important; }
      .swagger-ui .info h2, .swagger-ui .info p { color: #222 !important; }
    `
  })
);

// ==========================================================
// Rutas principales
// ==========================================================

//  Bloque H – HU-006 (Reportes de uso)
const reportRoutes = require('./routes/report.routes');
app.use('/api/reports', reportRoutes); //  Endpoint /api/reports/usage habilitado

// Resto de rutas globales
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
    console.log(' Conexión a la base de datos cerrada correctamente.');
  } catch (err) {
    console.error(' Error cerrando la base de datos:', err);
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
