const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    inviteUser,
    getMyInvites,
    acceptInvite,
    rejectInvite,
    getGroupInvites
} = require('../controllers/inviteController');
router.post('/', protect, inviteUser);
router.get('/my', protect, getMyInvites);
router.post('/:id/accept', protect, acceptInvite);
router.post('/:id/reject', protect, rejectInvite);
router.get('/group/:groupId', protect, getGroupInvites);
module.exports = router;