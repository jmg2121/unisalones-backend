// tests/helpers.js
function genReceiptCode(prefix = 'TEST') {
  const timestamp = Date.now().toString(36); // más corto y estable
  const rand = Math.floor(Math.random() * 100000)
    .toString(36)
    .padStart(4, '0');

  return `${prefix}-${timestamp}-${rand}`;
}

module.exports = { genReceiptCode };
