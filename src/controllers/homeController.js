// Obtener transacciones del usuario autenticado
exports.renderHome = async (req, res) => {
    try {
        res.render('pages/home');
    } catch (error) {
        console.error('Error al renderizar el home:', error);
        res.status(500).send('Hubo un problema. Por favor, intenta nuevamente.');
    }
};