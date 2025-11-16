const express = require("express");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Cargar manualmente el JSON privado desde archivo
const adminDocPath = path.join(__dirname, "../config/swagger-admin.json");
const adminSwaggerJson = JSON.parse(fs.readFileSync(adminDocPath, "utf8"));

// Forzar Swagger a usar el documento PRIVADO
router.use("/", swaggerUi.serve);
router.get("/", (req, res, next) => {
  return swaggerUi.setup(adminSwaggerJson)(
    req,
    res,
    next
  );
});

module.exports = router;
