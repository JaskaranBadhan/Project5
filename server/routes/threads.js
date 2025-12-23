const express = require('express');
const router = express.Router();
const {
    getThreadById,
    createReply,
    deleteThread,
    likeThread,
    likeReply
} = require('../controllers/threadController');
const { protect } = require('../middlewares/authMiddleware');
router.route('/:id')
    .get(protect, getThreadById)
    .delete(protect, deleteThread);
router.post('/:id/replies', protect, createReply);
router.put('/:id/like', protect, likeThread);
router.put('/replies/:id/like', protect, likeReply);
module.exports = router;