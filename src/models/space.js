module.exports = (sequelize, DataTypes) => {
  const Space = sequelize.define('Space', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { type: DataTypes.ENUM('auditorium','laboratory','classroom','systemsrooms','other'), allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'spaces' });
  return Space;
};
