const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validateRegister, validateLogin } = require('../middlewares/validation');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Password reset routes (public)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-reset-token/:token', authController.verifyResetToken);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/refresh-token', authenticate, authController.refreshToken);

module.exports = router;