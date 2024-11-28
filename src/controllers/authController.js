const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Modelo Sequelize de usuario

// Función para generar un número de cuenta único
const generateAccountNumber = () => {
    // Genera un número aleatorio de 10 dígitos
    return 'AC' + Math.floor(1000000000 + Math.random() * 9000000000); 
};

// Renderizar la vista de login
exports.renderLogin = (req, res) => {
    res.render('pages/login', { error: null });
};

// Renderizar la vista de registro
exports.renderRegister = (req, res) => {
    res.render('pages/register', { error: null, defaultLayout: 'main' });
};

// Lógica para el registro
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el nombre de usuario ya existe con Sequelize
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.render('pages/register', { error: 'El nombre de usuario ya está en uso.' });
        }

        // Verificar si el correo electrónico ya está en uso con Sequelize
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.render('pages/register', { error: 'El correo electrónico ya está en uso.' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 12); // Aumento de salt rounds

        // Generar el número de cuenta automáticamente
        const accountNumber = generateAccountNumber();

        // Crear el nuevo usuario
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user', // Rol predeterminado
            account_number: accountNumber, // Asignar el número de cuenta generado
        });

        // Redirigir al login después de registrarse
        res.redirect('login');
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).render('pages/register', { error: 'Error interno del servidor. Por favor, intente más tarde.' });
    }
};

// Lógica para el inicio de sesión
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario por correo electrónico con Sequelize
        const user = await User.findOne({ where: { email } });

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

        // Guardar el email del usuario en la sesión
        req.session.user = user;

        // Redirigir al dashboard
        res.redirect('/transactions/dashboard');
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).render('pages/login', { error: 'Error interno del servidor. Por favor, intente más tarde.' });
    }
};

// Lógica para cerrar sesión
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            req.flash('error_msg', 'Error al cerrar sesión.');
            return res.redirect('/login');
        }
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('connect.sid'); // Eliminar la cookie de sesión
        res.status(200).redirect('/login');
    });
};
