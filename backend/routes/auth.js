const express = require('express');
const router = express.Router();
const { register, login, getMe, setSecurityQuestions, verifySecurityQuestions, getSecurityQuestions, resetPassword, updatePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/security-questions', auth, setSecurityQuestions);
router.post('/verify-security-questions', verifySecurityQuestions);
router.get('/get-security-questions/:telephone', getSecurityQuestions);
router.post('/reset-password', auth, resetPassword);
router.post('/update-password', auth, updatePassword);

module.exports = router;
