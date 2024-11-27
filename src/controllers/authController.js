const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

// Renderizar la vista de login
exports.renderLogin = (req, res) => {
    // Renderizamos la vista de login, con error null si no hay errores previos
    res.render('pages/login', { error: null });
};

// Renderizar la vista de registro
exports.renderRegister = (req, res) => {
    // Renderizamos la vista de registro, con error null si no hay errores previos
    res.render('pages/register', { error: null, defaultLayout: 'main' });
};

// Lógica para el registro
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el nombre de usuario ya existe
        const existingUser = await userModel.findUserByUsername(username);
        if (existingUser) {
            return res.render('pages/register', { error: 'El nombre de usuario ya está en uso.' });
        }

        // Verificar si el correo electrónico ya está en uso
        const existingEmail = await userModel.findUserByEmail(email);
        if (existingEmail) {
            return res.render('pages/register', { error: 'El correo electrónico ya está en uso.' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const newUser = {
            username,
            email,
            password: hashedPassword,
            role: 'user', // Rol predeterminado, puede ajustarse según sea necesario
        };

        // Guardar el nuevo usuario en la base de datos
        await userModel.createUser(newUser);

        // Redirigir al login después de registrarse
        res.redirect('login');
    } catch (error) {
        console.error('Error en el registro:', error);
        // Si ocurre un error interno, renderizamos el formulario de registro con un mensaje de error
        res.status(500).render('pages/register', { error: 'Error interno del servidor.' });
    }
};

// Lógica para el inicio de sesión
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario por correo electrónico
        const user = await userModel.findUserByEmail(email);

        // Si el usuario no existe o la contraseña es incorrecta
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('pages/login', { error: 'Credenciales inválidas.' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Configurar cookie para almacenar el token
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo en producción
            maxAge: 3600000, // 1 hora
            sameSite: 'strict',
        });

        req.session.user = user.email;

        // Redirigir al dashboard
        res.redirect('/transactions/dashboard');
    } catch (error) {
        console.error('Error en el login:', error);
        // Si ocurre un error en el proceso de login, renderizamos el formulario de login con un mensaje de error
        res.status(500).render('pages/login', { error: 'Error interno del servidor.' });
    }
};

// Lógica para cerrar sesión
exports.logout = (req, res) => {
    // Limpiar la cookie de autenticación
    req.session.destroy((err) => {
        if (err) {
          console.error('Error al cerrar sesión:', err);
          req.flash('error_msg', 'Error al cerrar sesión.');
          return res.redirect('/login');
        }
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo en producción
            sameSite: 'strict',
        });
        res.clearCookie('connect.sid'); // Eliminar la cookie de sesión
        res.status(200).redirect('/login');
      });
};
