// NUEVO EN SPRINT 2 – BLOQUE A (versión corregida)
const request = require('supertest');
const app = require('../../src/app');

describe('GET /api-docs', () => {
  it('debe responder 200 y servir la interfaz Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Swagger UI'); // ← corregido
  });
});