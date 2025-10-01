'use strict';
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const sequelize = new Sequelize(config);

const db = {};

db.User = require('./user')(sequelize, DataTypes);
db.Space = require('./space')(sequelize, DataTypes);
db.Reservation = require('./reservation')(sequelize, DataTypes);
db.WaitlistEntry = require('./waitlist_entry')(sequelize, DataTypes);
db.Notification = require('./notification')(sequelize, DataTypes);

// Associations
db.User.hasMany(db.Reservation, { foreignKey: 'user_id' });
db.Reservation.belongsTo(db.User, { foreignKey: 'user_id' });

db.Space.hasMany(db.Reservation, { foreignKey: 'space_id' });
db.Reservation.belongsTo(db.Space, { foreignKey: 'space_id' });

db.User.hasMany(db.WaitlistEntry, { foreignKey: 'user_id' });
db.WaitlistEntry.belongsTo(db.User, { foreignKey: 'user_id' });

db.Space.hasMany(db.WaitlistEntry, { foreignKey: 'space_id' });
db.WaitlistEntry.belongsTo(db.Space, { foreignKey: 'space_id' });

db.User.hasMany(db.Notification, { foreignKey: 'user_id' });
db.Notification.belongsTo(db.User, { foreignKey: 'user_id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
