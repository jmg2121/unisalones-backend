// tests/integration/calendar.int.test.js


/* HU verificada:
 HU-008 – Visualización de horarios */

 
const request = require('supertest');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev';

const app = require('../../src/app');
const { sequelize, User, Space, Reservation } = require('../../src/models');

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'America/Bogota';

const STRONG_PASSWORD = 'Secret123!';

describe('GET /api/calendar', () => {
  let student;
  let tokenStudent;
  let space1;
  let space2;
  const date = '2025-11-08';

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const passwordHash = await bcrypt.hash(STRONG_PASSWORD, 10);
    student = await User.create({
      name: 'Calendar Student',
      email: 'calendar@unicomfacauca.edu.co',
      password_hash: passwordHash,
      role: 'student',
    });

    const secret = process.env.JWT_SECRET;
    tokenStudent = jwt.sign(
  { id: student.id, role: student.role, email: student.email },
  secret,
  { expiresIn: '1h' }
);


    space1 = await Space.create({
      name: 'Aula 101',
      type: 'classroom',
      capacity: 30,
    });

    space2 = await Space.create({
      name: 'Aula 102',
      type: 'classroom',
      capacity: 25,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Reservation.destroy({ where: {} });
  });

  test('Día sin reservas (con spaceId) → todos available', async () => {
    const res = await request(app)
      .get('/api/calendar')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .query({ range: 'day', date, spaceId: space1.id });

    expect(res.status).toBe(200);
    expect(res.body.range).toBe('day');
    expect(res.body.date).toBe(date);
    expect(Array.isArray(res.body.days)).toBe(true);
    expect(res.body.days.length).toBe(1);

    const slots = res.body.days[0].slots;
    expect(Array.isArray(slots)).toBe(true);

    const statuses = slots.flatMap(slot =>
      slot.spaces.filter(s => s.id === space1.id).map(s => s.status)
    );

    expect(statuses.length).toBeGreaterThan(0);
    // En un día sin reservas, debe estar todo disponible
    expect(statuses.every(st => st === 'available')).toBe(true);
  });

  test('Día con reserva solapada (con spaceId)', async () => {
    const start = dayjs.tz(`${date}T09:00`, TZ).utc().toDate();
    const end = dayjs.tz(`${date}T10:30`, TZ).utc().toDate();

    await Reservation.create({
      space_id: space1.id,
      user_id: student.id,
      start_time: start,
      end_time: end,
      status: 'confirmed',
    });

    const res = await request(app)
      .get('/api/calendar')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .query({ range: 'day', date, spaceId: space1.id });

    expect(res.status).toBe(200);
    expect(res.body.date).toBe(date);

    const slots = res.body.days[0].slots;

    const statuses = slots.flatMap(slot =>
      slot.spaces.filter(s => s.id === space1.id).map(s => s.status)
    );

    expect(statuses).toContain('busy');
  });

  test('Sin spaceId → estado global', async () => {
    const sUTC = dayjs.tz(`${date}T09:00`, TZ).utc().toDate();
    const eUTC = dayjs.tz(`${date}T10:00`, TZ).utc().toDate();

    await Reservation.bulkCreate([
      {
        space_id: space1.id,
        user_id: student.id,
        start_time: sUTC,
        end_time: eUTC,
        status: 'confirmed',
      },
      {
        space_id: space2.id,
        user_id: student.id,
        start_time: sUTC,
        end_time: eUTC,
        status: 'confirmed',
      },
    ]);

    const res = await request(app)
      .get('/api/calendar')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .query({ range: 'day', date });

    expect(res.status).toBe(200);
    expect(res.body.date).toBe(date);
    expect(Array.isArray(res.body.days)).toBe(true);

    const allSlots = res.body.days[0].slots;

    const statuses1 = allSlots.flatMap(slot =>
      slot.spaces.filter(s => s.id === space1.id).map(s => s.status)
    );
    const statuses2 = allSlots.flatMap(slot =>
      slot.spaces.filter(s => s.id === space2.id).map(s => s.status)
    );

    expect(statuses1).toContain('busy');
    expect(statuses2).toContain('busy');
  });
});
