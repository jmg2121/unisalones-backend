const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Unisalones API',
    version: '1.0.0',
    description: 'API REST del Sistema de Gestión de Espacios - Unicomfacauca (Unisalones)',
    contact: { name: 'Equipo Unisalones' }
  },
  servers: [
    {
      url: 'http://localhost:{port}/api',
      variables: {
        port: {
          default: '3000'
        }
      },
      description: 'Servidor local (desarrollo)'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Autenticación y usuarios' },
    { name: 'Spaces', description: 'Gestión y disponibilidad de espacios' },
    { name: 'Reservations', description: 'Reservas de espacios' },
    { name: 'Notifications', description: 'Notificaciones de reservas' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce el token con el formato: Bearer <tu_token_JWT>'
      }
    },
    schemas: {
      // Esquemas base reutilizables
      Space: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          capacity: { type: 'integer' }
        }
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          spaceId: { type: 'integer' },
          userId: { type: 'integer' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          details: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  },
  // 🔐 NUEVO EN SPRINT 2 – BLOQUE A: seguridad global JWT
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Archivos a escanear para anotaciones @swagger
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
