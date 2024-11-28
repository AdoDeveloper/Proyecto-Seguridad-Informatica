//src\config\db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,      // Nombre de la base de datos
    process.env.DB_USER,      // Usuario
    process.env.DB_PASSWORD,  // Contraseña
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',       // Especifica el dialecto (MySQL en este caso)
        pool: {
            max: 10,            // Máximo número de conexiones en el pool
            min: 0,             // Mínimo número de conexiones
            acquire: 30000,     // Tiempo máximo para intentar conectar antes de un error
            idle: 10000         // Tiempo que una conexión puede estar inactiva antes de cerrarse
        },
        logging: true          // Configura si deseas ver los logs de las consultas
    }
);

// Verificar la conexión
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos exitosa con Sequelize');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

testConnection();

module.exports = sequelize;
