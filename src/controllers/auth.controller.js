const { register, login } = require("../services/auth.service");

// ✅ Controlador para registro
async function registerCtrl(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios" });
    }

    const user = await register({ name, email, password, role });
    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "El correo electrónico ya está registrado" });
    }
    return res.status(400).json({ error: e.message || "Error al registrar usuario" });
  }
}

// ✅ Controlador para login
async function loginCtrl(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    const result = await login({ email, password });
    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token: result.token,
      user: { id: result.user.id, name: result.user.name, role: result.user.role }
    });
  } catch (e) {
    return res.status(400).json({ error: e.message || "Credenciales inválidas" });
  }
}

module.exports = { registerCtrl, loginCtrl };