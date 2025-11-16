const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_for_tests";
const EXPIRES_IN = "7d"; // como en los tests

// Genera token con payload seguro
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

// Verifica token (si lo necesita algún middleware)
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
