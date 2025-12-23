const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
    createNote,
    deleteNote,
    getNotesByGroup,
    getNoteById,
    likeNote,
    createReply,
    likeReply,
    deleteReply
} = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');
router.get('/:id', protect, getNoteById);
router.delete('/:id', protect, deleteNote);
router.put('/:id/like', protect, likeNote);
router.post('/:id/replies', protect, createReply);
router.put('/replies/:replyId/like', protect, likeReply);
router.delete('/replies/:replyId', protect, deleteReply);
module.exports = router;