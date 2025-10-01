module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('reservation_confirmed','reservation_canceled','reservation_modified','waitlist_promoted','reminder'), allowNull: false },
    payload: { type: DataTypes.JSON, allowNull: false },
    sent_at: { type: DataTypes.DATE, allowNull: true }
  }, { tableName: 'notifications' });
  return Notification;
};
