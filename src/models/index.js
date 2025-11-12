'use strict';
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

// Inicializar conexión Sequelize
const sequelize = new Sequelize(config);
const db = {};

// ============================================================
// 1️ Cargar modelos
// ============================================================
db.User = require('./user')(sequelize, DataTypes);
db.Space = require('./space')(sequelize, DataTypes);
db.Reservation = require('./reservation')(sequelize, DataTypes);
db.WaitlistEntry = require('./waitlist_entry')(sequelize, DataTypes);
db.Notification = require('./notification')(sequelize, DataTypes);

// ============================================================
// 2️ Definir asociaciones principales
// ============================================================

// --- Usuarios y Reservas ---
db.User.hasMany(db.Reservation, { foreignKey: 'user_id', as: 'reservations' });
db.Reservation.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// --- Espacios y Reservas ---
db.Space.hasMany(db.Reservation, { foreignKey: 'space_id', as: 'reservations' });
db.Reservation.belongsTo(db.Space, { foreignKey: 'space_id', as: 'space' });

// --- Usuarios y Lista de Espera ---
db.User.hasMany(db.WaitlistEntry, { foreignKey: 'user_id', as: 'waitlist_entries' });
db.WaitlistEntry.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// --- Espacios y Lista de Espera ---
db.Space.hasMany(db.WaitlistEntry, { foreignKey: 'space_id', as: 'waitlist_entries' });
db.WaitlistEntry.belongsTo(db.Space, { foreignKey: 'space_id', as: 'space' });

// --- Usuarios y Notificaciones ---
db.User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'notifications' });
db.Notification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// ============================================================
// 3️ Exportar conexión y modelos
// ============================================================
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
