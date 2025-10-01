const request = require('supertest');
const app = require('../src/app');

describe('Health check', () => {
  it('responde con { status: "ok" } en /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
