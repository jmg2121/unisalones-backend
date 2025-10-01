// tests/helpers.js
function genReceiptCode(prefix = 'TEST') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

module.exports = { genReceiptCode };
