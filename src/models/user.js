module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('student', 'professor', 'admin'), defaultValue: 'student' },
    failed_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    lock_until: { type: DataTypes.DATE, allowNull: true }
  }, { tableName: 'users' });
  return User;
};
