module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    space_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled'),
      defaultValue: 'confirmed',
    },
    receipt_code: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'reservations',
  });

  //  Asociaciones correctas con alias
  Reservation.associate = (models) => {
    Reservation.belongsTo(models.Space, {
      foreignKey: 'space_id',
      as: 'space',
    });
    Reservation.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Reservation;
};
