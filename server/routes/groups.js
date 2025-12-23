const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroupById,
    deleteGroup,
    generateInviteLink,
    joinViaInvite,
    toggleInviteLink,
    likeGroup
} = require('../controllers/groupController');
const { createThread, getThreadsByGroup } = require('../controllers/threadController');
const { protect } = require('../middlewares/authMiddleware');
router.route('/')
    .post(protect, createGroup)
    .get(protect, getGroups);
const { createNote, getNotesByGroup } = require('../controllers/noteController');
const upload = require('../middlewares/uploadMiddleware');
router.route('/:id')
    .get(protect, getGroupById)
    .delete(protect, deleteGroup);
router.post('/:id/invite/generate', protect, generateInviteLink);
router.post('/:id/invite/toggle', protect, toggleInviteLink);
router.post('/join/:inviteToken', protect, joinViaInvite);
router.route('/:id/threads')
    .post(protect, createThread)
    .get(protect, getThreadsByGroup);
router.route('/:id/notes')
    .get(protect, getNotesByGroup)
    .post(protect, upload.array('files', 20), createNote);
router.post('/:id/like', protect, likeGroup);
module.exports = router;