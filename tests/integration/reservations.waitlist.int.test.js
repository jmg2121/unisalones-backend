/*HU verificada:
 HU-010 – Lista de espera */



// tests/integration/reservations.waitlist.int.test.js
const request = require('supertest');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dayjs.extend(utc);
dayjs.extend(timezone);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev';

const app = require('../../src/app');
const { sequelize, User, Space, Reservation, WaitlistEntry } = require('../../src/models');

const TZ = 'America/Bogota';
const STRONG_PASSWORD = 'Secret123!';

describe('HU-010 Lista de espera', () => {
  let student;
  let tokenStudent;
  let space;

  const date = '2025-11-15';

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const hash = await bcrypt.hash(STRONG_PASSWORD, 10);

    student = await User.create({
      name: 'Waitlist Student',
      email: 'waitlist@unicomfacauca.edu.co',
      password_hash: hash,
      role: 'student',
    });

    tokenStudent = jwt.sign(
      { id: student.id, role: student.role, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    space = await Space.create({
      name: 'Sala Espera',
      type: 'classroom',
      capacity: 30,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Reservation.destroy({ where: {} });
    await WaitlistEntry.destroy({ where: {} });
  });

  test('Añadir usuario a la lista de espera', async () => {
    const start = dayjs.tz(`${date}T10:00`, TZ).utc().toDate();
    const end   = dayjs.tz(`${date}T11:00`, TZ).utc().toDate();

    const res = await request(app)
      .post('/api/reservations/waitlist')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .send({
        spaceId: space.id,
        start,
        end,
      });

    expect(res.status).toBe(201);
    expect(res.body.entry).toBeDefined();
    expect(res.body.entry.space_id).toBe(space.id);
    expect(res.body.entry.user_id).toBe(student.id);
    expect(res.body.entry.status).toBe('pending');
  });

  test('No duplica entrada si ya está en la lista', async () => {
    const start = dayjs.tz(`${date}T12:00`, TZ).utc().toDate();
    const end   = dayjs.tz(`${date}T13:00`, TZ).utc().toDate();

    // Primera vez
    await request(app)
      .post('/api/reservations/waitlist')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .send({
        spaceId: space.id,
        start,
        end,
      })
      .expect(201);

    // Segunda vez → NO debe crear duplicado
    const res = await request(app)
      .post('/api/reservations/waitlist')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .send({
        spaceId: space.id,
        start,
        end,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Ya estás en la lista/i);

    const entries = await WaitlistEntry.findAll();
    expect(entries.length).toBe(1);
  });

  test('Obtener la lista de espera del usuario', async () => {
    const start = dayjs.tz(`${date}T15:00`, TZ).utc().toDate();
    const end   = dayjs.tz(`${date}T16:00`, TZ).utc().toDate();

    // Crear entrada
    await WaitlistEntry.create({
      space_id: space.id,
      user_id: student.id,
      start_time: start,
      end_time: end,
      status: 'pending',
      position: 1,
    });

    const res = await request(app)
      .get('/api/reservations/waitlist')
      .set('Authorization', `Bearer ${tokenStudent}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].user_id).toBe(student.id);
  });
});
