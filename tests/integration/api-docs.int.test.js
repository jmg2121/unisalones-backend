// tests/integration/api-docs.int.test.js

// HU-000 (Documentación) No pertenece a una HU funcional, solo valida que Swagger /api-docs funciona.



const request = require('supertest');
const app = require('../../src/app');

describe('GET /api-docs', () => {
  it('NO debe estar disponible en entorno de test (retorna 404)', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(404);   // ✔ correcto
  });
});
