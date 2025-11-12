// src/config/swagger.js
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Unisalones API',
    version: '1.0.3',
    description: `
  API REST del **Sistema de Gestión de Espacios - Unicomfacauca (Unisalones)**.  
  Ofrece módulos de **Autenticación JWT**, **Gestión de Espacios**, **Gestión de Reservas**, **Notificaciones Automáticas**, 
  **Calendario de Disponibilidad** y **Reportes en formatos JSON, PDF y XLSX**.
`,
    contact: { name: 'Equipo Unisalones' }
  },
  servers: [
    {
      url: 'http://localhost:{port}/api',
      variables: { port: { default: '3000' } },
      description: 'Servidor local (desarrollo)'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Autenticación y Usuarios' },
    { name: 'Spaces', description: 'Gestión y Disponibilidad de Espacios' },
    { name: 'Reservations', description: 'Reservas de Espacios' },
    { name: 'Notifications', description: 'Notificaciones de Reservas' },
    { name: 'Reports', description: 'Reportes de Uso — JSON, PDF y XLSX' }
  ],
  components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: `
Autenticación Mediante **TOKEN JWT**.  
PEGA TU TOKEN EN EL CAMPO INFERIOR **(Sin Incluir El Prefijo "Bearer")**.  
Ejemplo: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\`
      `
    }
  },
    schemas: {
      // =========================================================
      // Esquemas base reutilizables
      // =========================================================
      Space: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Laboratorio de Redes' },
          type: { type: 'string', example: 'laboratory' },
          capacity: { type: 'integer', example: 25 }
        },
        required: ['name', 'type', 'capacity']
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
          details: { type: 'array', items: { type: 'string' } }
        }
      },
      // =========================================================
      // Esquema Reporte de Uso
      // =========================================================
      ReportUsage: {
        type: 'object',
        properties: {
          meta: {
            type: 'object',
            properties: {
              startDate: { type: 'string', example: '2025-11-01' },
              endDate: { type: 'string', example: '2025-11-07' },
              spaceId: { type: 'integer', example: 2 },
              generatedAt: { type: 'string', example: '2025-11-12T13:00:00Z' }
            }
          },
          data: {
            type: 'object',
            properties: {
              days: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    day: { type: 'string', example: '2025-11-01' },
                    totals: {
                      type: 'object',
                      properties: {
                        reservationsCount: { type: 'integer', example: 5 },
                        totalHours: { type: 'number', example: 12.5 },
                        spacesUsed: { type: 'integer', example: 3 }
                      }
                    },
                    spaces: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          spaceId: { type: 'integer', example: 1 },
                          spaceName: { type: 'string', example: 'Sala A' },
                          reservationsCount: { type: 'integer', example: 2 },
                          totalHours: { type: 'number', example: 5.5 },
                          statusBreakdown: {
                            type: 'object',
                            example: { confirmed: 2, cancelled: 1 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

// ==========================================================
// Exporta la especificación y la ruta del JS personalizado
// ==========================================================
const swaggerCustomJs = '/swagger-custom.js';

module.exports = { swaggerSpec, swaggerCustomJs };
