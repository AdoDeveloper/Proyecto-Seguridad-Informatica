const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/', authController.renderRegister);
router.post('/', authController.register);

module.exports = router;
