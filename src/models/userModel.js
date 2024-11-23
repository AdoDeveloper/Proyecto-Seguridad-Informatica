const pool = require('../config/db');

/**
 * Buscar un usuario por su nombre de usuario.
 * @param {string} username - Nombre de usuario.
 * @returns {Promise<Object|null>} Usuario encontrado o null si no existe.
 */
exports.findUserByUsername = async (username) => {
    try {
        const query = 'SELECT * FROM user WHERE username = ?';
        const [rows] = await pool.execute(query, [username]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error al buscar usuario por nombre de usuario:', error);
        throw error;
    }
};

/**
 * Buscar un usuario por su correo electrónico (insegura).
 * Esta función es vulnerable a SQL Injection.
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Promise<Object|null>} Usuario encontrado o null si no existe.
 */
exports.findUserByEmail = async (email) => {
    try {
        // Consulta insegura que concatena el valor directamente
        const query = `SELECT * FROM user WHERE email = '${email}'`;
        const [rows] = await pool.query(query); // pool.query permite ejecutar una consulta sin parámetros.
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error al buscar usuario por correo electrónico (inseguro):', error);
        throw error;
    }
};
/**
 * Crear un nuevo usuario.
 * @param {Object} user - Datos del usuario.
 * @param {string} user.username - Nombre de usuario.
 * @param {string} user.email - Correo electrónico del usuario.
 * @param {string} user.password - Contraseña del usuario encriptada.
 * @param {string} user.role - Rol del usuario.
 * @returns {Promise<number>} ID del nuevo usuario creado.
 */
exports.createUser = async ({ username, email, password, role }) => {
    try {
        const query = 'INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [username, email, password, role]);
        return result.insertId;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
};
