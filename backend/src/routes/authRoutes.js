const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, updateMe, adminLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/login-json', login);       // alias for JSON login used by frontend
router.post('/google-login', googleLogin);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
