const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/', authController.renderLogin);
router.post('/', authController.login);
router.get('/register', authController.renderRegister);
router.post('/auth/register', authController.register);
router.get('/logout', authController.logout);

module.exports = router;
