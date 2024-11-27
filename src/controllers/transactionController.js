const transactionModel = require('../models/transactionModel');

// Obtener transacciones del usuario autenticado
exports.getUserTransactions = async (req, res) => {
    try {
        const transactions = await transactionModel.getTransactionsByUserId(req.user.id);
        res.render('pages/dashboard', { transactions }); // Pasamos las transacciones a la vista EJS
    } catch (error) {
        console.error('Error al obtener transacciones del usuario:', error);
        res.status(500).send('Hubo un problema al cargar tus transacciones. Por favor, intenta nuevamente.');
    }
};


// Obtener transacciones del usuario autenticado en formato JSON
exports.getUserTransactionsJSON = async (req, res) => {
    try {
        const transactions = await transactionModel.getTransactionsByUserId(req.user.id);
        res.json(transactions);  // Retorna las transacciones como JSON
    } catch (error) {
        console.error('Error al obtener transacciones del usuario:', error);
        res.status(500).send('Hubo un problema al cargar tus transacciones. Por favor, intenta nuevamente.');
    }
};

// Obtener todas las transacciones (para administradores)
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await transactionModel.getAllTransactions();
        res.render('pages/admin_dashboard', { transactions });
    } catch (error) {
        console.error('Error al obtener todas las transacciones:', error);
        res.status(500).send('Hubo un problema al cargar las transacciones. Por favor, intenta nuevamente.');
    }
};

// Obtener transacciones del usuario autenticado
exports.getFormCreateTransaction = async (req, res) => {
    try {
        res.render('pages/transaction_form');
    } catch (error) {
        console.error('Error al obtener el formulario');
        res.status(500).send('Hubo un problema al cargar tus transacciones. Por favor, intenta nuevamente.');
    }
};

// Crear una nueva transacción
exports.createTransaction = async (req, res) => {
    try {
        const { amount, type, description } = req.body;

        // Validar inputs
        if (!amount || isNaN(amount) || !['Ingreso', 'Egreso'].includes(type)) {
            return res.status(400).send('Datos de transacción inválidos. Por favor verifica los campos.');
        }

        // Crear la transacción con descripción opcional
        await transactionModel.createTransaction(req.user.id, amount, type, description || null);
        res.redirect('/transactions/dashboard');
    } catch (error) {
        console.error('Error al crear transacción:', error);
        res.status(500).send('Hubo un problema al registrar la transacción. Por favor, intenta nuevamente.');
    }
};
