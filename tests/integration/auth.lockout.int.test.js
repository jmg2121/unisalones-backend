const request = require('supertest');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.JWT_EXPIRES = '1h';

const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');
const bcrypt = require('bcryptjs');

describe('Auth integration (registro, login y lockout)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  test('registro + login correcto devuelve token', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Ana',
      email: 'ana@unicomfacauca.edu.co',
      password: 'secret123'
    });
    expect(reg.status).toBe(201);

    const loginOk = await request(app).post('/api/auth/login').send({
      email: 'ana@unicomfacauca.edu.co',
      password: 'secret123'
    });
    expect(loginOk.status).toBe(200);
    expect(loginOk.body.token).toBeTruthy();
  });

  test('lockout tras 3 intentos fallidos y bloqueo en el 4to', async () => {
    const hash = await bcrypt.hash('correcta', 10);
    await User.create({
      name: 'Lock User',
      email: 'lock@unicomfacauca.edu.co',
      password_hash: hash,
      role: 'student'
    });

    // 3 intentos fallidos → siguen respondiendo "Credenciales inválidas"
    for (let i = 0; i < 3; i++) {
      const bad = await request(app).post('/api/auth/login').send({
        email: 'lock@unicomfacauca.edu.co',
        password: 'mala'
      });
      expect(bad.status).toBe(400);
      expect(bad.body.error).toBe('Credenciales inválidas');
    }

    // 4to intento (ya bloqueado)
    const blocked = await request(app).post('/api/auth/login').send({
      email: 'lock@unicomfacauca.edu.co',
      password: 'mala'
    });
    expect(blocked.status).toBe(400);
    expect(blocked.body.error).toMatch(/Cuenta bloqueada temporalmente/);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});