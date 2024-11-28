const express = require('express');
const {
    getUserTransactions, 
    getAllTransactions, 
    createTransaction, 
    getFormCreateTransaction, 
    getUserTransactionsJSON
} = require('../controllers/transactionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Ruta para el dashboard de transacciones del usuario autenticado
router.get('/dashboard', verifyToken, getUserTransactions);

// Ruta para obtener las transacciones del usuario en formato JSON
router.get('/api/transactions', verifyToken, getUserTransactionsJSON);

// Ruta para el admin, obtiene todas las transacciones (requiere rol admin)
router.get('/api/admin', verifyToken, checkRole('admin'), getAllTransactions);

// Ruta para mostrar el formulario de creación de transacción
router.get('/create', verifyToken, getFormCreateTransaction);

// Ruta para procesar la creación de una nueva transacción
router.post('/create', verifyToken, createTransaction);

module.exports = router;
