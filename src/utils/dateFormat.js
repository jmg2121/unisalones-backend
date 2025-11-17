const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TZ = 'America/Bogota';

function formatCOL(date) {
  if (!date) return null;
  return dayjs(date).tz(APP_TZ).format('YYYY-MM-DD HH:mm:ss');
}

module.exports = { formatCOL };
