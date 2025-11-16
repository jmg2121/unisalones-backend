

/*HU verificada:
 HU-006 – Reportes de uso*/



// Forzar logs en Jest (muestra console.log/error en la salida del test)
process.env.NODE_ENV = 'test';
beforeAll(() => {
  if (global.console && typeof console.log === 'function') {
    jest.spyOn(global.console, 'log').mockImplementation((...args) => {
      process.stdout.write(args.join(' ') + '\n');
    });
  }
  if (global.console && typeof console.error === 'function') {
    jest.spyOn(global.console, 'error').mockImplementation((...args) => {
      process.stdout.write(args.join(' ') + '\n');
    });
  }
});

afterAll(() => {
  try { console.log.mockRestore?.(); } catch (_) {}
  try { console.error.mockRestore?.(); } catch (_) {}
});

const request = require('supertest');
const app = require('../../src/app'); // Ajusta si tu app exporta express()
const { sequelize, Reservation, Space, User } = require('../../src/models');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');

function signToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
}

describe('HU-006 /api/reports/usage', () => {
  let admin, token, spaceA, spaceB;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin',
      password_hash: 'hash'
    });
    token = signToken(admin);

    // ⚠️ Si tu modelo Space usa ENUM sin "sala", cambia "type" a "classroom".
    spaceA = await Space.create({ name: 'Sala A', type: 'sala', capacity: 30, is_active: true });
    spaceB = await Space.create({ name: 'Sala B', type: 'sala', capacity: 20, is_active: true });

    const base = dayjs('2025-11-02T08:00:00');

    await Reservation.bulkCreate([
      { space_id: spaceA.id, user_id: admin.id, start_time: base.toDate(), end_time: base.add(2, 'hour').toDate(), status: 'confirmed' },
      { space_id: spaceA.id, user_id: admin.id, start_time: base.add(3, 'hour').toDate(), end_time: base.add(5, 'hour').toDate(), status: 'confirmed' },
      { space_id: spaceB.id, user_id: admin.id, start_time: base.add(1, 'day').toDate(), end_time: base.add(1, 'day').add(3, 'hour').toDate(), status: 'cancelled' },
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('JSON: 200 y estructura correcta', async () => {
    const res = await request(app)
      .get('/api/reports/usage')
      .query({ startDate: '2025-11-01', endDate: '2025-11-05', format: 'json' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('meta');
    expect(res.body).toHaveProperty('data.days');
    expect(Array.isArray(res.body.data.days)).toBe(true);
  });

    test('XLSX: content-type y descarga', async () => {
    const res = await request(app)
      .get('/api/reports/usage')
      .query({ startDate: '2025-11-01', endDate: '2025-11-05', format: 'xlsx' })
      .set('Authorization', `Bearer ${token}`)
      .buffer(true) // 🔹 fuerza lectura binaria
      .parse((res, callback) => {
        const data = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(data)));
      })
      .expect(200);

    expect(res.header['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(res.header['content-disposition']).toContain('attachment; filename=');
    expect(Buffer.isBuffer(res.body)).toBe(true); // 🔹 comprobación correcta
  });


  test('PDF: content-type y descarga', async () => {
    const res = await request(app)
      .get('/api/reports/usage')
      .query({ startDate: '2025-11-01', endDate: '2025-11-05', format: 'pdf' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.header['content-type']).toContain('application/pdf');
    expect(res.header['content-disposition']).toContain('attachment; filename=');
  });

  test('Filtrado por spaceId', async () => {
    const res = await request(app)
      .get('/api/reports/usage')
      .query({ startDate: '2025-11-01', endDate: '2025-11-05', format: 'json', spaceId: spaceA.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const allSpaces = res.body.data.days.flatMap((d) => d.spaces.map((s) => s.spaceId));
    const unique = new Set(allSpaces);
    expect(unique.size).toBe(1);
    expect([...unique][0]).toBe(spaceA.id);
  });

  test('400 por parámetros inválidos', async () => {
    await request(app)
      .get('/api/reports/usage')
      .query({ startDate: 'invalid', endDate: '2025-11-05', format: 'json' })
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  test('403 si no es admin', async () => {
    const user = await User.create({
      name: 'User',
      email: 'user@test.com',
      role: 'user',
      password_hash: 'hash'
    });
    const userToken = signToken(user);

    await request(app)
      .get('/api/reports/usage')
      .query({ startDate: '2025-11-01', endDate: '2025-11-05', format: 'json' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
