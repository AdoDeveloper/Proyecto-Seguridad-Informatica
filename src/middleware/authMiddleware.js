const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('authToken');
        res.redirect('/login');
    }
};

exports.checkRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.redirect('/transactions/dashboard');
    }
    next();
};
