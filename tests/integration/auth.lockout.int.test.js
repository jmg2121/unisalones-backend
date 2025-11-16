// tests/integration/auth.lockout.int.test.js


/* HU verificadas:
 HU-007 – Validación de identidad */

 
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev';

const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');

const STRONG_PASSWORD = 'Secret123!';

describe('Auth integration (registro, login y lockout)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('registro + login correcto devuelve token', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Ana Lockout',
      email: 'ana@unicomfacauca.edu.co',
      password: STRONG_PASSWORD,
      role: 'student',
    });

    expect(reg.status).toBe(201);
    expect(reg.body).toHaveProperty('user');
    expect(reg.body).toHaveProperty('token');

    const loginOk = await request(app).post('/api/auth/login').send({
      email: 'ana@unicomfacauca.edu.co',
      password: STRONG_PASSWORD,
    });

    expect(loginOk.status).toBe(200);
    expect(loginOk.body).toHaveProperty('token');
  });

  test('múltiples intentos fallidos bloquean el usuario', async () => {
    const email = 'lock@unicomfacauca.edu.co';

    const reg = await request(app).post('/api/auth/register').send({
      name: 'Usuario Lock',
      email,
      password: STRONG_PASSWORD,
      role: 'student',
    });

    expect(reg.status).toBe(201);

    // 1er intento fallido
    const l1 = await request(app).post('/api/auth/login').send({
      email,
      password: 'Wrong123!',
    });
    expect(l1.status).toBe(400);

    // 2º intento fallido
    const l2 = await request(app).post('/api/auth/login').send({
      email,
      password: 'Wrong123!',
    });
    expect(l2.status).toBe(400);

    // 3er intento: debería disparar bloqueo
    const l3 = await request(app).post('/api/auth/login').send({
      email,
      password: 'Wrong123!',
    });

    expect(l3.status).toBe(400);
    expect(l3.body.error).toMatch(/bloqueada temporalmente/i);   // ✔ FIX

    const userDb = await User.findOne({ where: { email } });
    expect(userDb.lock_until).not.toBeNull();

    // Incluso con contraseña correcta mientras está bloqueado
    const l4 = await request(app).post('/api/auth/login').send({
      email,
      password: STRONG_PASSWORD,
    });

    expect(l4.status).toBe(400);
    expect(l4.body.error).toMatch(/bloqueada temporalmente/i);   // ✔ FIX
  });
});
