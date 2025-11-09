// ✅ SPRINT 2 – BLOQUE B (corregido para Bloque D)
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { sequelize, User, Notification } = require('../../src/models');

describe('HU-004 Notificaciones (integración)', () => {
  let tokenAdmin, tokenStudent, spaceId, reservationId;

  beforeAll(async () => {
    if (app.ready) await app.ready;
    await sequelize.sync({ force: true });

    // Crear usuarios base
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@unicomfacauca.edu.co',
      password_hash: 'hash',
      role: 'admin'
    });

    const student = await User.create({
      name: 'Student Test',
      email: 'student@unicomfacauca.edu.co',
      password_hash: 'hash',
      role: 'student'
    });

    // Generar tokens JWT válidos
    const secret = process.env.JWT_SECRET || 'clave_super_secreta';
    tokenAdmin = jwt.sign({ id: admin.id, role: 'admin' }, secret, { expiresIn: '1h' });
    tokenStudent = jwt.sign({ id: student.id, role: 'student' }, secret, { expiresIn: '1h' });

    // Crear un espacio usando token de admin
    const createSpace = await request(app)
      .post('/api/spaces')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        name: 'B-Lab',
        type: 'laboratory',
        capacity: 20
      });

    spaceId = createSpace.body.space?.id || createSpace.body.id;
  });

  // ✅ Prueba 1: Crear reserva genera notificación
  test('crear reserva dispara notificación en DB', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .send({
        spaceId,
        startTime: '2025-11-10T10:00:00.000Z', // ✅ cambiado
        endTime: '2025-11-10T11:00:00.000Z'    // ✅ cambiado
      });

    expect(res.status).toBe(201);
    reservationId = res.body.id;

    await new Promise(r => setTimeout(r, 100));

    const notif = await Notification.findOne({ order: [['id', 'DESC']] });
    expect(notif).toBeTruthy();
    expect(notif.message).toContain('Reserva confirmada');
  });

  // ✅ Prueba 2: Cancelar reserva genera notificación
  test('cancelar reserva dispara notificación en DB', async () => {
    const res = await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${tokenStudent}`);

    expect(res.status).toBe(200);

    await new Promise(r => setTimeout(r, 100));

    const notif = await Notification.findOne({ order: [['id', 'DESC']] });
    expect(notif).toBeTruthy();
    expect(notif.message).toContain('Reserva cancelada');
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
