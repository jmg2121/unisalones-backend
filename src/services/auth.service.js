const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const { User } = require('../models');

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 15;

function emailDomainOk(email) {
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || 'unicomfacauca.edu.co';
  return email.endsWith('@' + domain);
}

async function register({ name, email, password, role }) {
  if (!emailDomainOk(email)) throw new Error('Email no permitido: debe ser institucional');
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash: hash, role: role || 'student' });
  return user;
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Credenciales inválidas');

  // Lockout
  if (user.lock_until && dayjs(user.lock_until).isAfter(dayjs())) {
    throw new Error('Cuenta bloqueada temporalmente. Intente más tarde.');
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    user.failed_attempts = (user.failed_attempts || 0) + 1;
    if (user.failed_attempts >= MAX_ATTEMPTS) {
      user.lock_until = dayjs().add(LOCK_MINUTES, 'minute').toDate();
      user.failed_attempts = 0;
    }
    await user.save();
    throw new Error('Credenciales inválidas');
  }

  user.failed_attempts = 0;
  user.lock_until = null;
  await user.save();

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '12h' });
  return { token, user };
}

module.exports = { register, login, emailDomainOk };
