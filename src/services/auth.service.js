const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const { User } = require("../models");

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 15;

function emailDomainOk(email) {
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || "unicomfacauca.edu.co";
  return email.endsWith("@" + domain);
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || 'unicomfacauca.edu.co';
  return email.toLowerCase().endsWith('@' + domain.toLowerCase());
}

async function register({ name, email, password, role }) {
  if (!emailDomainOk(email)) {
    throw new Error("Email no permitido: debe ser institucional (@unicomfacauca.edu.co)");
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name,
    email: email,
    password_hash: hash,
    role: role || "student"
  });

  console.log("Usuario registrado:", email);
  return user;
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Credenciales invalidas");

  // Verificar si la cuenta esta bloqueada temporalmente
  // Si está bloqueado, no permitir login
  if (user.lock_until && dayjs(user.lock_until).isAfter(dayjs())) {
    const remaining = dayjs(user.lock_until).diff(dayjs(), "minute");
    throw new Error("Cuenta bloqueada temporalmente. Intente en " + remaining + " minutos.");
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    user.failed_attempts = (user.failed_attempts || 0) + 1;

    if (user.failed_attempts >= MAX_ATTEMPTS) {
      user.lock_until = dayjs().add(LOCK_MINUTES, "minute").toDate();
      user.failed_attempts = 0;
      console.warn("Usuario " + email + " bloqueado temporalmente por " + LOCK_MINUTES + " minutos");
    }

    await user.save();
    throw new Error("Credenciales invalidas");
  }

  // Si el login es exitoso, se resetean los bloqueos
  // Login correcto: limpiar contadores
  user.failed_attempts = 0;
  user.lock_until = null;
  await user.save();

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "dev",
    { expiresIn: "12h" }
  );

  console.log("Login exitoso:", email);
  return { token, user };
}

module.exports = { register, login, emailDomainOk };
    process.env.JWT_SECRET || 'dev',
    { expiresIn: process.env.JWT_EXPIRES || '12h' }
  );

  return { token, user };
}

module.exports = { register, login, emailDomainOk };
