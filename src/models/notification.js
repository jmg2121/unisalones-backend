'use strict';

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(
          'reservation_confirmed',
          'reservation_canceled',
          'reservation_modified',
          'waitlist_promoted',
          'reminder'
        ),
        allowNull: false,
        defaultValue: 'reservation_confirmed'
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {} // evita el error notNull Violation
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'notifications',
      timestamps: true
    }
  );

  return Notification;
};
