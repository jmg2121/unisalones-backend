/* HU verificadas:
 HU-002 – Reserva de espacio
 HU-008 – Visualización de horarios */


const { overlaps } = require('../../src/utils/availability');

describe('overlaps()', () => {
  test('true when overlapping', () => {
    const a1 = new Date('2025-01-01T10:00:00Z');
    const a2 = new Date('2025-01-01T12:00:00Z');
    const b1 = new Date('2025-01-01T11:00:00Z');
    const b2 = new Date('2025-01-01T13:00:00Z');
    expect(overlaps(a1,a2,b1,b2)).toBe(true);
  });
  test('false when adjacent', () => {
    const a1 = new Date('2025-01-01T10:00:00Z');
    const a2 = new Date('2025-01-01T12:00:00Z');
    const b1 = new Date('2025-01-01T12:00:00Z');
    const b2 = new Date('2025-01-01T13:00:00Z');
    expect(overlaps(a1,a2,b1,b2)).toBe(false);
  });
});
