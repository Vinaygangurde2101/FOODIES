const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updatePreferences } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validator');

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
