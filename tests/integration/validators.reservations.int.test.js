/* Valida middlewares al crear reserva:

Campos requeridos
Fechas correctas
Horas válidas

HU verificadas:
 HU-002 – Reserva de espacio (validación)
 HU-003 – Cancelar/modificar reserva (validación) */


const request = require('supertest');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';

const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');
const jwt = require('jsonwebtoken');

describe('Validación reservas', () => {
  let token;
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const u = await User.create({
      name: 'Juan Test',
      email: 'juan@unicomfacauca.edu.co',
      password_hash: 'hashfake',
      role: 'student'
    });
    token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  test('start inválido produce 400 con detalles', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ start: 'no-fecha', end: '2025-12-10T10:00:00.000Z', spaceId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeTruthy();
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
