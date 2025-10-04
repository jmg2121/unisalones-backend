jest.setTimeout(10000);

const request = require('supertest');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');
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
    const cs = await request(app).post('/api/spaces').set('Authorization', `Bearer ${adminToken}`).send({
      name: 'Lab 101', type: 'laboratory', capacity: 30
    });
    expect(cs.status).toBe(201);
    const spaceId = cs.body.id;

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

    const resv = await request(app).post('/api/reservations').set('Authorization', `Bearer ${userToken}`).send({
      spaceId, start, end
    });
    expect(resv.status).toBe(201);
    expect(resv.body.receipt_code).toBeTruthy();

    // Ya no disponible
    
   const avail2 = await request(app).get('/api/spaces/available')
  .set('Authorization', `Bearer ${userToken}`)
  .query({ date, start: '11:00', end: '12:30', type: 'laboratory' });

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
