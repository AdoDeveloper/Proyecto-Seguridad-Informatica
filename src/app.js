const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const axios = require('axios');
const exphbs = require('express-handlebars');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');

// Módulo de IP tracking
const ipTracker = new Map(); // Mitigacion

require('dotenv').config();

const app = express();

// Usar Morgan para registrar solicitudes HTTP
app.use(morgan('dev'));  // Usa el formato 'dev' para un registro más legible en desarrollo

// Configura express-session
app.use(session({
  secret: process.env.SECRET_KEY,  // Cambia por algo más seguro
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }  // Asegúrate de que el cookie es seguro en producción
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
// Middleware que pasa el usuario de la sesión a todas las vistas
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Verifica si hay usuario en la sesión
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);  // Imprimir el error en consola
  res.status(500).render('errors/500');  // Renderizar la vista personalizada de error 500
});

// Middleware adicional
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const registerRoutes = require('./routes/registerRoutes');
const homeRoutes = require('./routes/homeRoutes');

// Rutas
app.use('/login', authRoutes);
app.use('/register', registerRoutes);
app.use('/transactions', transactionRoutes);
app.use('', homeRoutes);

// Cron job para realizar ping a la aplicación cada 14 minutos
cron.schedule('*/14 * * * *', async () => {
  try {
    await axios.get('https://finance-alpha.onrender.com/');
    console.log('Ping exitoso.');
  } catch (error) {
    console.error('Error en el ping:', error.message);
  }
});

// Middleware para limitar solicitudes (rate limiter) // Mitigacion
const limiter = rateLimit({
  windowMs: 20 * 1000, // 20 segundos
  max: 100, // Limita a 100 solicitudes por IP en 20 segundos
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
  headers: true, // Añadir cabeceras en la respuesta con el límite
});

// Aplica el rate limiter a todas las rutas
app.use(limiter); // Mitigacion

// Middleware para detectar y bloquear IPs que realicen demasiadas solicitudes // Mitigacion
const trackRequests = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Si la IP ya está registrada en ipTracker, incrementa el contador de solicitudes
  if (ipTracker.has(ip)) {
    ipTracker.get(ip).requests += 1;
  } else {
    ipTracker.set(ip, { requests: 1, lastRequest: Date.now() });
  }

  // Obtener el registro de solicitudes de la IP
  const ipData = ipTracker.get(ip); // Mitigacion

  // Si han pasado menos de 60 segundos desde la última solicitud y la IP ha realizado más de 1000 solicitudes // Mitigacion
  if (Date.now() - ipData.lastRequest < 60 * 1000 && ipData.requests > 1000) {
    return res.status(429).send('Demasiadas solicitudes desde esta IP, su acceso está temporalmente bloqueado.');
  }

  // Si han pasado más de 60 segundos, restablece el contador de solicitudes // Mitigacion
  if (Date.now() - ipData.lastRequest > 60 * 1000) {
    ipData.requests = 1; // Resetea el contador de solicitudes
    ipData.lastRequest = Date.now();
  }

  next();
};

// Aplica el middleware de tracking de IPs // Mitigacion
app.use(trackRequests);

// Middleware para la protección contra lentitud de solicitudes (slow down) // Mitigacion
const speedLimiter = slowDown({
  windowMs: 20 * 1000, // 20 segundos
  delayAfter: 50, // Retrasa las solicitudes después de 50 peticiones
  delayMs: () => 500, // Retrasa 500ms por cada solicitud adicional
});

// Aplica el slow down a todas las rutas // Mitigacion
app.use(speedLimiter);

// Configura Helmet para mejorar la seguridad de la aplicación // Mitigacion
app.use(helmet());

// Manejo de rutas
app.use('/', homeRoutes);
app.use('/login', authRoutes);
app.use('/register', registerRoutes);
app.use('/transactions', transactionRoutes);

module.exports = app;
