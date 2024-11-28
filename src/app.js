const express = require('express');
const morgan = require('morgan'); // Importar Morgan
const cookieParser = require('cookie-parser');
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const axios = require('axios');
const exphbs = require('express-handlebars');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const app = express();

// Usar Morgan para registrar solicitudes HTTP
app.use(morgan('dev')); // Usa el formato 'dev' para un registro más legible en desarrollo

// Configura express-session
app.use(session({
  secret: process.env.SECRET_KEY, // Cambia por algo más seguro
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Asegúrate de que el cookie es seguro en producción
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Configura el motor de plantillas y la ruta de vistas
app.set('views', path.join(__dirname, 'views'));

// Configuración del Motor de Plantillas (Handlebars)
app.engine('.hbs', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  Handlebars: require('./lib/handlebars'),
}));
app.set('view engine', '.hbs');

// Variables Globales para las Vistas
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Middleware adicional
app.use(express.static(path.join(__dirname, '..', 'public')));

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const registerRoutes = require('./routes/registerRoutes');
const homeRoutes = require('./routes/homeRoutes')
// Rutas
app.use('/login', authRoutes);
app.use('/register', registerRoutes);
app.use('/transactions', transactionRoutes);
app.use('',homeRoutes);

cron.schedule('*/14 * * * *', async () => {
    try {
      await axios.get('https://finance-alpha.onrender.com/');
      console.log('Ping exitoso.');
    } catch (error) {
      console.error('Error en el ping:', error.message);
    }
});

module.exports = app;
