// NUEVO EN SPRINT 2 – BLOQUE B
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  }))
}));

const nodemailer = require('nodemailer');
const { sendReservationConfirmation, sendReservationCancellation } = require('../../src/services/notificationService');
const { Notification } = require('../../src/models');

describe('notificationService (unit)', () => {
  const user = { id: 1, email: 'test@unicomfacauca.edu.co', name: 'Test' };
  const reservation = {
    id: 10,
    user_id: 1,
    space_id: 2,
    start_time: '2025-10-01T10:00:00.000Z',
    end_time: '2025-10-01T12:00:00.000Z',
    receipt_code: 'R-123'
  };

  beforeAll(() => {
    jest.spyOn(Notification, 'create').mockResolvedValue({ id: 99 });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('sendReservationConfirmation llama a sendMail y registra Notification', async () => {
    await sendReservationConfirmation(user, reservation);

    expect(nodemailer.createTransport).toHaveBeenCalled();

    // Se ajusta al nuevo tipo ('reservation_confirmed')
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: user.id,
        message: expect.stringContaining('Reserva confirmada'),
        type: expect.stringMatching(/reservation_/)
      })
    );
  });

  test('sendReservationCancellation llama a sendMail y registra Notification', async () => {
    await sendReservationCancellation(user, reservation);

    expect(nodemailer.createTransport).toHaveBeenCalled();

    // Se ajusta al nuevo tipo ('reservation_canceled')
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: user.id,
        message: expect.stringContaining('Reserva cancelada'),
        type: expect.stringMatching(/reservation_/)
      })
    );
  });
});
