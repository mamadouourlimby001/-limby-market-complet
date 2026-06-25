const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getMe, setSecurityQuestions, verifySecurityQuestions, getSecurityQuestions, resetPassword, updatePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Rate limit strict sur login : 10 tentatives par 15 min par IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit sur register : 5 comptes par heure par IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Trop de comptes créés. Réessayez dans 1 heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit sur reset password : 5 tentatives par heure par IP
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Trop de tentatives de réinitialisation. Réessayez dans 1 heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', auth, getMe);
router.put('/security-questions', auth, setSecurityQuestions);
router.post('/verify-security-questions', resetLimiter, verifySecurityQuestions);
router.get('/get-security-questions/:telephone', resetLimiter, getSecurityQuestions);
router.post('/reset-password', auth, resetPassword);
router.post('/update-password', auth, updatePassword);

module.exports = router;
