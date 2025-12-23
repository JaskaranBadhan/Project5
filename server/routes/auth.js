const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    getMe
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { check, validationResult } = require('express-validator');
const validateRegister = [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];
const validateLogin = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
];
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
};
router.post('/register', validateRegister, handleValidation, registerUser);
router.post('/login', validateLogin, handleValidation, loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
module.exports = router;