// tests/integration/notifications.int.test.js


/* HU verificada:
 HU-004 – Notificaciones de reservas */


const request = require('supertest');
const dayjs = require('dayjs'); 
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev';

const app = require('../../src/app');
const { sequelize, User, Reservation, Space, Notification } = require('../../src/models');

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'America/Bogota';

const STRONG_PASSWORD = 'Secret123!';
const secret = process.env.JWT_SECRET;

async function createUserWithToken({ name, email, role }) {
  const password_hash = await bcrypt.hash(STRONG_PASSWORD, 10);

  const user = await User.create({
    name,
    email,
    password_hash,
    role,
  });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    secret,
    { expiresIn: '1h' }
  );

  return { user, token };
}

describe('HU-004 Notificaciones (integración)', () => {
  let student;
  let tokenStudent;
  let space;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    ({ user: student, token: tokenStudent } = await createUserWithToken({
      name: 'Student Notifications',
      email: 'studentnotif@unicomfacauca.edu.co',
      role: 'student',
    }));

    space = await Space.create({
      name: 'Sala Notif 1',
      type: 'classroom',
      capacity: 20,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Notification.destroy({ where: {} });
    await Reservation.destroy({ where: {} });
  });

  test('crear reserva genera notificación', async () => {
    const date = '2025-11-10';
    const start = dayjs.tz(`${date}T08:00`, TZ).utc().toDate();
    const end = dayjs.tz(`${date}T09:00`, TZ).utc().toDate();

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .send({
        spaceId: space.id,
        start: start,       // ✔ CAMBIO CORRECTO
        end: end,           // ✔ CAMBIO CORRECTO
      });

    console.log("DEBUG CREATE RESERVATION RESPONSE:", res.status, res.body);

    expect(res.status).toBe(201);
    const reservationId = res.body.id;
    expect(reservationId).toBeDefined();

    await new Promise(r => setTimeout(r, 100));

    const notif = await Notification.findOne({ order: [['id', 'DESC']] });
    expect(notif).not.toBeNull();
    expect(notif.type).toBe('reservation_confirmed');
    expect(notif.user_id).toBe(student.id);
  });

  test('cancelar reserva genera notificación', async () => {
    const date = '2025-11-10';
    const start = dayjs.tz(`${date}T10:00`, TZ).utc().toDate();
    const end = dayjs.tz(`${date}T11:00`, TZ).utc().toDate();

    const created = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .send({
        spaceId: space.id,
        start: start,       // ✔ CAMBIO CORRECTO
        end: end,           // ✔ CAMBIO CORRECTO
      });

    console.log("DEBUG CANCEL-FLOW CREATE RESPONSE:", created.status, created.body);

    expect(created.status).toBe(201);
    const id = created.body.id;

    const res = await request(app)
      .delete(`/api/reservations/${id}`)
      .set('Authorization', `Bearer ${tokenStudent}`);

    console.log("DEBUG DELETE RESERVATION RESPONSE:", res.status, res.body);

    expect(res.status).toBe(200);

    await new Promise(r => setTimeout(r, 100));

    const notif = await Notification.findOne({ order: [['id', 'DESC']] });
    expect(notif).not.toBeNull();
    expect(notif.type).toBe('reservation_canceled');
    expect(notif.user_id).toBe(student.id);
  });
});
