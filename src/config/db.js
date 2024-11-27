const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
});

// Verificar si la conexión es exitosa
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos exitosa');
        connection.release(); // Liberar la conexión
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

testConnection();

module.exports = pool;
