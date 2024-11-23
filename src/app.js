const express = require('express');
const morgan = require('morgan'); // Importar Morgan
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
require('dotenv').config();

const app = express();

// Usar Morgan para registrar solicitudes HTTP
app.use(morgan('dev')); // Usa el formato 'dev' para un registro más legible en desarrollo

// Middleware adicional
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Configura el motor de plantillas y la ruta de vistas
app.set('view engine', 'ejs');
app.set('views', './src/views'); // Asegura la configuración correcta de la carpeta de vistas

// Rutas
app.use('/', authRoutes);
app.use('/transactions', transactionRoutes);

module.exports = app;
