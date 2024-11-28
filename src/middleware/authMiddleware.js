const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('connect.sid'); // Eliminar la cookie de sesión
        res.status(200).redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;  // Guardamos el usuario decodificado en req.user

        // Pasar el usuario a res.locals para que esté disponible en todas las vistas
        res.locals.userAuth = req.user;

        next();
    } catch (error) {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('connect.sid'); // Eliminar la cookie de sesión
        res.status(200).redirect('/login');
    }
};

// Middleware para verificar el rol del usuario
exports.checkRole = (role) => (req, res, next) => {
    // Verificamos el rol del usuario
    if (req.user.role !== role) {
        return res.redirect('/transactions/dashboard');
    }
    next();
};
