const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Space, Reservation } = require('../../src/models');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const bcrypt = require('bcryptjs');
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'America/Bogota';

describe('GET /api/calendar', () => {
  let space;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear usuario con contraseña cifrada (campo password_hash)
    const password_hash = await bcrypt.hash('123456', 10);

    const user = await sequelize.models.User.create({
      name: 'Test User',
      email: 'test@correo.com',
      password_hash
    });

    // Crear espacio (para las FK)
    space = await sequelize.models.Space.create({
      name: 'Lab 101',
      type: 'laboratory',
      capacity: 30,
      is_active: true
    });

    // Guardar ID del usuario para las reservas
    global.testUserId = user.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Día sin reservas (con spaceId) → todos available', async () => {
    const date = '2025-11-08';
    const res = await request(app).get('/api/calendar').query({ range:'day', date, spaceId: space.id });
    expect(res.status).toBe(200);
    expect(res.body.date).toBe(date);
    expect(res.body.days).toHaveLength(1);
    const slots = res.body.days[0].slots;
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every(s => s.status === 'available')).toBe(true);
  });

  test('Día con reserva solapada (con spaceId) → mezcla reserved/available', async () => {
    const date = '2025-11-09';
    const start = dayjs.tz(`${date}T09:00:00`, TZ).utc().toDate();
    const end   = dayjs.tz(`${date}T10:30:00`, TZ).utc().toDate();

    const r = await Reservation.create({
      space_id: space.id,
      user_id: global.testUserId,
      start_time: start,
      end_time: end,
      status: 'confirmed'
    });

    const res = await request(app).get('/api/calendar').query({ range:'day', date, spaceId: space.id });
    expect(res.status).toBe(200);
    const slots = res.body.days[0].slots;
    expect(slots.some(s => s.status === 'reserved' && s.reservationId === r.id)).toBe(true);
    expect(slots.some(s => s.status === 'available')).toBe(true);
  });

  test('Sin spaceId → estado global available/full con contadores', async () => {
    const date = '2025-11-10';
    const space2 = await Space.create({ name: 'Lab 102', type:'laboratory', capacity: 20, is_active: true });

    const sUTC = dayjs.tz(`${date}T08:00:00`, TZ).utc().toDate();
    const eUTC = dayjs.tz(`${date}T09:00:00`, TZ).utc().toDate();

    await Reservation.bulkCreate([
      { space_id: space.id,  user_id: global.testUserId, start_time: sUTC, end_time: eUTC, status: 'confirmed' },
      { space_id: space2.id, user_id: global.testUserId, start_time: sUTC, end_time: eUTC, status: 'confirmed' }
    ]);

    const res = await request(app).get('/api/calendar').query({ range:'day', date });
    expect(res.status).toBe(200);
    const slot = res.body.days[0].slots.find(s => s.start === '08:00' && s.end === '09:00');
    expect(slot).toBeDefined();
    expect(slot.status).toBe('full');
    expect(slot.availableSpaces).toBe(0);
    expect(slot.reservedSpaces).toBe(2);
  });
});
