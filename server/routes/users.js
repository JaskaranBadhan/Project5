const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/authController');
const { searchUsers } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
router.get('/me', protect, getMe);
router.get('/', protect, searchUsers);
module.exports = router;