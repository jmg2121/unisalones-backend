const { User } = require('../models');
const bcrypt = require("bcryptjs");

async function createInitialAdmin() {
  try {
    const email = "equipounisalones@unicomfacauca.edu.co";

    // Verificar si ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(" Ya existe un admin con este correo.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("123456", 10);

    await User.create({
      name: "Administrador Inicial",
      email,
      password_hash: passwordHash,  
      role: "admin"
    });

    console.log("Admin inicial creado correctamente.");
    console.log("➡ Correo:", email);
    console.log("➡ Contraseña: 123456");

    process.exit(0);

  } catch (err) {
    console.error("Error creando admin:", err);
    process.exit(1);
  }
}

createInitialAdmin();


//node src/scripts/createInitialAdmin.js
