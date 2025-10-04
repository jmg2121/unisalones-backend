const { register, login } = require('../services/auth.service');

// ✅ Controlador para registro
async function registerCtrl(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // 🔍 Validaciones básicas antes del registro
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
    }

    const user = await register({ name, email, password, role });

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    // ⚠️ Manejo específico de correo duplicado
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
    }

    if (process.env.NODE_ENV === 'development') console.error('Error en registro:', e);
    next(e);
  }
}

// ✅ Controlador para login
async function loginCtrl(req, res, next) {
  try {
    const { email, password } = req.body;

    // 🔍 Validaciones básicas antes del login
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const result = await login({ email, password });

    res.json({
      message: 'Inicio de sesión exitoso',
      token: result.token,
      user: { id: result.user.id, name: result.user.name, role: result.user.role }
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error en login:', e);
    next(e);
  }
}

module.exports = { registerCtrl, loginCtrl };