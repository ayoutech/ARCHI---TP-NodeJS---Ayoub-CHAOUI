const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize').sequelize; // L’instance de Sequelize
const UserModel = require('./User');
const MonumentModel = require('./Monument');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserModel,
      key: 'id',
    },
  },
  monumentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MonumentModel,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

// Associations nécessaires
Favorite.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
Favorite.belongsTo(MonumentModel, { foreignKey: 'monumentId', as: 'monument' });

module.exports = Favorite;
