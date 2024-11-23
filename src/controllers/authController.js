const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

// Renderizar la vista de login
exports.renderLogin = (req, res) => {
    res.render('login', { error: null });
};

// Renderizar la vista de registro
exports.renderRegister = (req, res) => {
    res.render('register', { error: null });
};

// Lógica para el registro
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await userModel.findUserByUsername(username);
        if (existingUser) {
            return res.render('register', { error: 'El nombre de usuario ya está en uso.' });
        }

        const existingEmail = await userModel.findUserByEmail(email);
        if (existingEmail) {
            return res.render('register', { error: 'El correo electrónico ya está en uso.' });
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

        await userModel.createUser(newUser);

        // Redirigir al login después de registrarse
        res.redirect('/');
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).render('register', { error: 'Error interno del servidor.' });
    }
};

// Lógica para el inicio de sesión (vulnerable a SQL Injection)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Llamar a la consulta insegura
        const user = await userModel.findUserByEmail(email);

        // Si no se encuentra el usuario o la contraseña es inválida
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { error: 'Credenciales inválidas.' });
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
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'strict',
        });

        // Redirigir al dashboard
        res.redirect('/transactions/dashboard');
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).render('login', { error: 'Error interno del servidor.' });
    }
};


// Lógica para cerrar sesión
exports.logout = (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.redirect('/');
};
