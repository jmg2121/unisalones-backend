const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const { User } = require("../models");

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 15;

// Validación de dominio institucional
function emailDomainOk(email) {
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || "unicomfacauca.edu.co";
  return email.toLowerCase().endsWith("@" + domain.toLowerCase());
}

// Registro de usuario
async function register({ name, email, password, role }) {
  if (!emailDomainOk(email)) {
    throw new Error("Email no permitido: debe ser institucional (@unicomfacauca.edu.co)");
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password_hash: hash,
    role: role || "student"
  });

  console.log("Usuario registrado:", email);
  return user;
}

// Inicio de sesión con bloqueo por intentos fallidos
async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Credenciales inválidas");

  // Bloqueo temporal si ya está bloqueado
  if (user.lock_until && dayjs(user.lock_until).isAfter(dayjs())) {
    const remaining = dayjs(user.lock_until).diff(dayjs(), "minute");
    throw new Error("Cuenta bloqueada temporalmente. Intente en " + remaining + " minutos.");
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {

    // Sumar intento fallido
    user.failed_attempts = (user.failed_attempts || 0) + 1;

    // 🔥 BLOQUEO AL SUPERAR LOS INTENTOS PERMITIDOS
    if (user.failed_attempts >= MAX_ATTEMPTS) {
      user.lock_until = dayjs().add(LOCK_MINUTES, "minute").toDate();
      user.failed_attempts = 0;

      await user.save();

      console.warn("Usuario " + email + " bloqueado temporalmente por " + LOCK_MINUTES + " minutos");

      // 🔥 RESPUESTA CORRECTA → lo que el test espera
      throw new Error(
        "Cuenta bloqueada temporalmente. Intente en " + LOCK_MINUTES + " minutos."
      );
    }

    // Si aún no se bloquea
    await user.save();
    throw new Error("Credenciales inválidas");
  }

  // Login correcto: limpiar contadores
  user.failed_attempts = 0;
  user.lock_until = null;
  await user.save();

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "dev",
    { expiresIn: process.env.JWT_EXPIRES || "12h" }
  );

  console.log("Login exitoso:", email);
  return { token, user };
}

module.exports = { register, login, emailDomainOk };