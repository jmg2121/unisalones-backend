console.log("🚀 Iniciando backend Unisalones...");

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Unisalones backend escuchando en http://localhost:${PORT}`);
});
