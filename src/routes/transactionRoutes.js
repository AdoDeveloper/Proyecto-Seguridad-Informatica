const express = require('express');
const { getUserTransactions, getAllTransactions, createTransaction } = require('../controllers/transactionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', verifyToken, getUserTransactions);
router.get('/admin', verifyToken, checkRole('admin'), getAllTransactions);
router.post('/create', verifyToken, createTransaction);

module.exports = router;
