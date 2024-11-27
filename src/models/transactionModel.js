const pool = require('../config/db');

/**
 * Obtener todas las transacciones.
 * @returns {Promise<Array>} Lista de todas las transacciones.
 */
exports.getAllTransactions = async () => {
    try {
        const query = 'SELECT t.id, t.user_id, t.amount, t.type, t.description, t.created_at, t.updated_at, u.username AS user_name, u.role AS user_role ' +
                      'FROM transaction t ' +
                      'JOIN user u ON t.user_id = u.id';
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        console.error('Error al obtener todas las transacciones:', error);
        throw new Error('Error al obtener todas las transacciones');
    }
};

/**
 * Obtener las transacciones de un usuario específico.
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Array>} Lista de transacciones del usuario.
 */
exports.getTransactionsByUserId = async (userId) => {
    try {
        const query = 'SELECT id, amount, type, description, created_at, updated_at FROM transaction WHERE user_id = ?';
        const [rows] = await pool.execute(query, [userId]);
        return rows;
    } catch (error) {
        console.error(`Error al obtener transacciones del usuario con ID ${userId}:`, error);
        throw new Error(`Error al obtener las transacciones del usuario con ID ${userId}`);
    }
};

/**
 * Crear una nueva transacción.
 * @param {number} userId - ID del usuario.
 * @param {number} amount - Monto de la transacción.
 * @param {string} type - Tipo de transacción ('income' o 'expense').
 * @param {string} description - Descripción de la transacción (opcional).
 * @returns {Promise<number>} ID de la nueva transacción creada.
 */
exports.createTransaction = async (userId, amount, type, description = null) => {
    try {
        // Validación de tipo de transacción
        if (!['Ingreso', 'Egreso'].includes(type)) {
            throw new Error('El tipo de transacción debe ser "income" o "expense"');
        }

        const query = 'INSERT INTO transaction (user_id, amount, type, description) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [userId, amount, type, description]);
        return result.insertId;
    } catch (error) {
        console.error('Error al crear una nueva transacción:', error);
        throw new Error('Error al crear una nueva transacción');
    }
};
