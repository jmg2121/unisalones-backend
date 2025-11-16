// tests/integration/app.test.js

/* HU verificadas:
 HU-001 – Búsqueda de espacios (parcial, porque valida creación)
 HU-002 – Reserva de espacio
 HU-003 – Cancelar o modificar reserva
 HU-005 – Administración de espacios (crear espacio) */

const request = require('supertest');
const bcrypt = require('bcryptjs');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev';

const app = require('../../src/app');
const { sequelize, User, Reservation } = require('../../src/models');

const STRONG_PASSWORD = 'Secret123!'; // Cumple validaciones

// Helper reutilizable para registrar y hacer login
async function createUserAndLogin({ name, email, role = 'student' }) {
  // Registro (NO devuelve token)
  const reg = await request(app).post('/api/auth/register').send({
    name,
    email,
    password: STRONG_PASSWORD,
    role,
  });

  if (reg.status !== 201) {
    throw new Error(
      `Fallo en registro (${email}): status=${reg.status} body=${JSON.stringify(
        reg.body
      )}`
    );
  }

  // Login (aquí sí obtenemos el token)
  const login = await request(app).post('/api/auth/login').send({
    email,
    password: STRONG_PASSWORD,
  });

  if (login.status !== 200) {
    throw new Error(
      `Fallo en login (${email}): status=${login.status} body=${JSON.stringify(
        login.body
      )}`
    );
  }

  return {
    token: login.body.token,
    user: login.body.user,
  };
}

describe('Flujos básicos de la API', () => {
  beforeAll(async () => {
    // Aseguramos BD limpia antes de los tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Registro y login correcto devuelve token', async () => {
    const { token, user } = await createUserAndLogin({
      name: 'Ana Estudiante',
      email: 'ana@unicomfacauca.edu.co',
      role: 'student',
    });

    expect(token).toBeDefined();
    expect(user).toBeDefined();
    expect(user.email).toBe('ana@unicomfacauca.edu.co');
  });

  test('Admin crea espacio, reserva y cancela', async () => {
    // 1) Crear admin directo en BD
    const passwordHash = await bcrypt.hash(STRONG_PASSWORD, 10);
    await User.create({
      name: 'Admin Unisalones',
      email: 'admin@unicomfacauca.edu.co',
      password_hash: passwordHash,
      role: 'admin',
    });

    // 2) Login admin
    const loginAdmin = await request(app).post('/api/auth/login').send({
      email: 'admin@unicomfacauca.edu.co',
      password: STRONG_PASSWORD,
    });

    expect(loginAdmin.status).toBe(200);
    const tokenAdmin = loginAdmin.body.token;
    expect(tokenAdmin).toBeDefined();

    // 3) Crear espacio
    const cs = await request(app)
      .post('/api/spaces')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: 'Lab 101', type: 'laboratory', capacity: 30 });

    expect(cs.status).toBe(201);
    const spaceId = cs.body.id || cs.body.space?.id;
    expect(spaceId).toBeDefined();

    // 4) Crear estudiante y obtener token
    const { token: tokenStudent } = await createUserAndLogin({
      name: 'Pedro Estudiante',
      email: 'pedro@unicomfacauca.edu.co',
      role: 'student',
    });

    // Fecha muy futura para no chocar con validadores tipo "debe ser en el futuro"
    const date = '2099-09-30';
    const start = `${date}T08:00:00.000Z`;
    const end = `${date}T09:00:00.000Z`;

   // 5) Crear reserva
const cr = await request(app)
  .post('/api/reservations')
  .set('Authorization', `Bearer ${tokenStudent}`)
  .send({
    spaceId: spaceId,
    start: start,
    end: end,
    reason: 'Reserva de prueba para integración',
  });

expect(cr.status).toBe(201);
const reservationId = cr.body.id;
expect(reservationId).toBeDefined();


    // 6) Cancelar reserva
    const cancel = await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${tokenStudent}`);

    expect(cancel.status).toBe(200);

    const rInDb = await Reservation.findByPk(reservationId);
    expect(rInDb.status).toBe('cancelled');
  });
});
