'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // La tabla 'users' debe existir primero
          key: 'id',
        },
        onDelete: 'RESTRICT', // Restricción cuando se elimina el usuario
        onUpdate: 'RESTRICT', // Restricción cuando se actualiza el usuario
      },
      destination_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,  // Permite que sea NULL
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL', // Si se elimina un usuario de destino, se establece a NULL
        onUpdate: 'RESTRICT', // Restricción cuando se actualiza el usuario de destino
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('income', 'expense'),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};
