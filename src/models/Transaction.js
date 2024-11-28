const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Instancia de Sequelize
const User = require('./User'); // Importamos el modelo User

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Nombre de la tabla en la base de datos
            key: 'id',     // Relacionamos con el ID del usuario
        },
    },
    destination_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Ahora permite que sea NULL para transacciones de ingreso
        references: {
            model: 'users', // Nombre de la tabla en la base de datos
            key: 'id',     // Relacionamos con el ID del destinatario
        },
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['income', 'expense']], // Validación de tipo de transacción
        },
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'transactions',
    timestamps: true,
});

// Asociaciones
Transaction.belongsTo(User, { as: 'user', foreignKey: 'user_id' }); // Relacionamos el usuario que hace la transacción
Transaction.belongsTo(User, { as: 'destination', foreignKey: 'destination_user_id' }); // Relacionamos el usuario destinatario

module.exports = Transaction;
