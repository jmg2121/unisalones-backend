module.exports = (sequelize, DataTypes) => {
  const WaitlistEntry = sequelize.define('WaitlistEntry', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    space_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('pending','notified','converted','canceled'), defaultValue: 'pending' },
    position: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'waitlist_entries' });
  return WaitlistEntry;
};
