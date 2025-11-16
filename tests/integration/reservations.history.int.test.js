/**
 * HU verificada:
 * HU-009 — Historial de reservas del usuario
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Reservation, Space } = require('../../src/models');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');

// Firma un token para Jest
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
}

describe('HU-009 — GET /api/reservations/me', () => {
  
  let user, token, spaceA;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Usuario normal
    user = await User.create({
      name: 'Juan',
      email: 'juan@test.com',
      role: 'student',
      password_hash: 'hash123'
    });

    token = signToken(user);

    // Espacio
    spaceA = await Space.create({
      name: 'Aula 101',
      type: 'classroom',
      capacity: 20,
      is_active: true
    });

    // Fechas
    const base = dayjs('2025-11-10T09:00:00');

    // Crear reservas del usuario
    await Reservation.bulkCreate([
      {
        user_id: user.id,
        space_id: spaceA.id,
        start_time: base.toDate(),
        end_time: base.add(2, 'hour').toDate(),
        status: 'confirmed'
      },
      {
        user_id: user.id,
        space_id: spaceA.id,
        start_time: base.add(1, 'day').toDate(),
        end_time: base.add(1, 'day').add(3, 'hour').toDate(),
        status: 'cancelled'
      }
    ]);

    // Crear otra reserva de otra persona (NO debe incluirse)
    const otherUser = await User.create({
      name: 'Otro',
      email: 'otro@test.com',
      role: 'student',
      password_hash: 'hashx'
    });

    await Reservation.create({
      user_id: otherUser.id,
      space_id: spaceA.id,
      start_time: base.add(3, 'day').toDate(),
      end_time: base.add(3, 'day').add(2, 'hour').toDate(),
      status: 'confirmed'
    });

  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Debe retornar SOLO las reservas del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/reservations/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    // Todas las reservas deben pertenecer al mismo usuario
    const allUserIds = new Set(res.body.map(r => r.user_id));
    expect([...allUserIds]).toEqual([user.id]);
  });

});
