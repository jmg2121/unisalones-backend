// tests/factories.js
const { User, Space, Reservation } = require('../src/models');
const { genReceiptCode } = require('./helpers');

async function createUser(attrs = {}) {
  return User.create({
    name: 'Test User',
    email: `test${Date.now()}@unicomfacauca.edu.co`, // correo institucional
    password_hash: 'hash',
    ...attrs
  });
}

async function createSpace(attrs = {}) {
  return Space.create({
    name: 'Default Space',
    capacity: 10,
    type: 'laboratory',
    ...attrs
  });
}

async function createReservation(attrs = {}) {
  return Reservation.create({
    user_id: attrs.user_id,
    space_id: attrs.space_id,
    start_time: new Date(),
    end_time: new Date(Date.now() + 60 * 60 * 1000),
    status: 'confirmed',
    receipt_code: genReceiptCode(),
    ...attrs
  });
}

module.exports = { createUser, createSpace, createReservation };
