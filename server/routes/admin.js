const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');
const {
    getAllUsers,
    getUserStats,
    deleteUser,
    updateUserRole,
    toggleBanUser
} = require('../controllers/adminController');
router.use(protect, adminOnly);
router.get('/users', getAllUsers);
router.get('/stats', getUserStats);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/ban', toggleBanUser);
module.exports = router;