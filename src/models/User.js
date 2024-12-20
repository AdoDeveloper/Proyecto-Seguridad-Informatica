const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Instancia de Sequelize

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user', // Rol predeterminado
    },
    account_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Número de cuenta único
    },
    balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0, // Saldo inicial
    }
}, {
    tableName: 'users',
    timestamps: true,
});

module.exports = User;
