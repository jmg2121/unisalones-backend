const svc = require('../../src/services/space.service');
const { sequelize, Reservation } = require('../../src/models');
const { createUser, createSpace, createReservation } = require('../factories');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Space service - unit-like', () => {
  test('no permite capacity <= 0', async () => {
    await expect(svc.createSpace({ name: 'X', capacity: 0 }))
      .rejects.toThrow('capacity debe ser > 0');
  });

  test('evita borrar con reservas activas', async () => {
    const sp = await createSpace({ name: 'Lab 101', capacity: 25 });
    const user = await createUser();

    await createReservation({ user_id: user.id, space_id: sp.id });

    await expect(svc.deleteSpace(sp.id))
      .rejects.toThrow('No se puede eliminar un espacio con reservas activas');
  });
});
