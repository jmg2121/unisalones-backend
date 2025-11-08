const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const {
  create,
  list,
  get,
  update,
  remove,
  available,
} = require("../controllers/space.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Spaces
 *   description: Gestión de espacios y disponibilidad
 */

/**
 * @swagger
 * /spaces/available:
 *   get:
 *     tags: [Spaces]
 *     summary: Consultar espacios disponibles
 *     description: Devuelve la disponibilidad de los espacios según los filtros de fecha u hora.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para verificar la disponibilidad (YYYY-MM-DD)
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           example: "08:00"
 *         description: Hora inicial del rango de búsqueda (HH:mm)
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           example: "18:00"
 *         description: Hora final del rango de búsqueda (HH:mm)
 *       - in: query
 *         name: spaceId
 *         schema:
 *           type: integer
 *         description: ID del espacio específico a consultar
 *     responses:
 *       200:
 *         description: Lista de espacios con sus intervalos disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   spaceId:
 *                     type: integer
 *                   slots:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                         end:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [available, reserved]
 *       400:
 *         description: Petición inválida
 *       401:
 *         description: No autorizado
 */
// Buscar espacios disponibles (requiere autenticación)
router.get("/available", authenticate, available);

/**
 * @swagger
 * /spaces:
 *   post:
 *     tags: [Spaces]
 *     summary: Crear un nuevo espacio
 *     description: Solo los administradores pueden crear nuevos espacios.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, capacity]
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Espacio creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
// Crear un nuevo espacio (solo para administradores)
router.post("/", authenticate, authorize(["admin"]), create);

/**
 * @swagger
 * /spaces:
 *   get:
 *     tags: [Spaces]
 *     summary: Listar todos los espacios
 *     description: Devuelve todos los espacios registrados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de espacios
 *       401:
 *         description: No autorizado
 */
// Listar todos los espacios
router.get("/", authenticate, list);

/**
 * @swagger
 * /spaces/{id}:
 *   get:
 *     tags: [Spaces]
 *     summary: Obtener un espacio por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del espacio
 *     responses:
 *       200:
 *         description: Datos del espacio encontrado
 *       404:
 *         description: Espacio no encontrado
 */
// Obtener un espacio específico
router.get("/:id", authenticate, get);

/**
 * @swagger
 * /spaces/{id}:
 *   put:
 *     tags: [Spaces]
 *     summary: Actualizar un espacio
 *     description: Solo administradores pueden modificar los datos de un espacio.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del espacio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Espacio actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 */
// Actualizar datos de un espacio (solo para administradores)
router.put("/:id", authenticate, authorize(["admin"]), update);

/**
 * @swagger
 * /spaces/{id}:
 *   delete:
 *     tags: [Spaces]
 *     summary: Eliminar un espacio
 *     description: Solo administradores pueden eliminar espacios.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del espacio a eliminar
 *     responses:
 *       200:
 *         description: Espacio eliminado correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
// Eliminar un espacio (solo para administradores)
router.delete("/:id", authenticate, authorize(["admin"]), remove);

module.exports = router;
