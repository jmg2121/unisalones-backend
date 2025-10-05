jest.setTimeout(10000);

const request = require('supertest');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
const app = require('../../src/app');
const { sequelize, User, Reservation } = require('../../src/models');
const bcrypt = require('bcryptjs');

async function authToken(email, password, role='student') {
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name: 'Test', email, password_hash: hash, role });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

describe('Flujo básico', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  test('Registro y login', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Ana', email: 'ana@unicomfacauca.edu.co', password: 'secret123' });
    expect(reg.status).toBe(201);
    const login = await request(app).post('/api/auth/login').send({ email: 'ana@unicomfacauca.edu.co', password: 'secret123' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });

  test('Admin crea espacio, usuario busca, reserva y cancela', async () => {
    const adminToken = await authToken('admin@unicomfacauca.edu.co', 'adminpass', 'admin');

    // Crear espacio
    const cs = await request(app).post('/api/spaces')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Lab 101', type: 'laboratory', capacity: 30 });

    expect(cs.status).toBe(201);

    // DEBUG: ver exactamente qué devuelve el endpoint de creación de espacio
    console.log('TEST DEBUG created space response body:', cs.body);
    console.log('TEST DEBUG created space response text:', cs.text);

    // Obtener el id de forma tolerante a distintas formas de respuesta
    const spaceId = cs.body?.space?.id
      ?? cs.body?.id
      ?? cs.body?.spaceId
      ?? cs.body?.space_id
      ?? cs.body?.data?.id
      ?? cs.body?.dataValues?.id
      ?? (Array.isArray(cs.body) && cs.body[0] && cs.body[0].id);

    // DEBUG opcional (ahora sí después de resolver)
    console.log('TEST DEBUG resolved spaceId ->', spaceId);

    // Asegurarnos de que tenemos un id válido antes de continuar
    expect(spaceId).toBeTruthy();

    // Usuario crea reserva
    const userToken = await authToken('est@unicomfacauca.edu.co', 'userpass', 'student');
    const date = '2025-09-30';
    const start = `${date}T10:00:00.000Z`;
    const end = `${date}T12:00:00.000Z`;

    const avail = await request(app).get('/api/spaces/available')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ date, start: '10:00', end: '12:00', type: 'laboratory' });
    expect(avail.status).toBe(200);
    expect(Array.isArray(avail.body)).toBe(true);
    expect(avail.body.length).toBeGreaterThanOrEqual(1);

    // Crear reserva (envío explícito)
    const resv = await request(app).post('/api/reservations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ spaceId: spaceId, start, end });

    // DEBUG: ver respuesta de la creación de reserva
    console.log('TEST DEBUG reservation response status:', resv.status);
    console.log('TEST DEBUG reservation response body:', resv.body);

    // Comprobar que la reserva se creó OK (o fallar mostrando body)
    expect(resv.status).toBe(201);
    expect(resv.body.receipt_code).toBeTruthy();

    // DEBUG: listar reservas en la DB para verificar estado y tiempos
    const allResvs = await Reservation.findAll({ where: {}, raw: true });
    console.log('TEST DEBUG all reservations in DB:', allResvs);

    // Ya no disponible (consultar disponibilidad en horario que solapa)
    const avail2 = await request(app).get('/api/spaces/available')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ date, start: '11:00', end: '12:30', type: 'laboratory' });

    // DEBUG: ver qué devuelve la disponibilidad
    console.log('TEST DEBUG avail2 body:', avail2.body);

    // En vez de toBeUndefined:
    expect(avail2.body.some(s => s.id === spaceId)).toBe(false);

    // Cancelar
    const cancel = await request(app).delete(`/api/reservations/${resv.body.id}`).set('Authorization', `Bearer ${userToken}`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.status).toBe('canceled');
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
