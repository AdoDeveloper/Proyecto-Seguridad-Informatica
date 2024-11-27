const express = require('express');
const { getUserTransactions, getAllTransactions, createTransaction, getFormCreateTransaction, getUserTransactionsJSON } = require('../controllers/transactionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', verifyToken, getUserTransactions);
router.get('/api/transactions', verifyToken, getUserTransactionsJSON);
router.get('/api/admin', verifyToken, checkRole('admin'), getAllTransactions);
router.get('/create',verifyToken, getFormCreateTransaction)
router.post('/create', verifyToken, createTransaction);

module.exports = router;