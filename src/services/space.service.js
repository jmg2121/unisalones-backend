const { Space, Reservation } = require('../models');
const { Op } = require('sequelize');

async function listAvailable({ dateStart, dateEnd, type }) {
  const where = { is_active: true };
  if (type) where.type = type;
  const spaces = await Space.findAll({ where });

  const reservations = await Reservation.findAll({
    where: {
      status: 'confirmed',
      [Op.or]: [
        { start_time: { [Op.lt]: dateEnd }, end_time: { [Op.gt]: dateStart } }
      ]
    }
  });

  const bySpace = new Map();
  reservations.forEach(r => {
    const arr = bySpace.get(r.space_id) || [];
    arr.push(r);
    bySpace.set(r.space_id, arr);
  });

  return spaces.filter(s => {
    const rs = bySpace.get(s.id) || [];
    // overlap check
    return !rs.some(r => (dateStart < r.end_time) && (r.start_time < dateEnd));
  });
}

module.exports = { listAvailable };
