const sequelize = require('../config/db')
const {DataTypes} = require("sequelize");

const UserModel = sequelize.define('users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    pseudo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('ROLE_USER', 'ROLE_ADMIN'),
        allowNull: false,
    }
}, {
    timestamps: true,
})

module.exports = UserModel;