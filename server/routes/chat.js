const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
router.get('/:groupId', protect, async (req, res) => {
    try {
        const messages = await Message.find({ group: req.params.groupId })
            .populate('sender', 'username')
            .populate({
                path: 'replyTo',
                populate: { path: 'sender', select: 'username' }
            })
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.post('/:groupId', protect, upload.array('files', 10), async (req, res) => {
    try {
        const { content, replyTo, lat, lng } = req.body;
        const groupId = req.params.groupId;
        const senderId = req.user._id;
        const files = req.files ? req.files.map(file => ({
            name: file.originalname,
            path: file.path,
            mimetype: file.mimetype
        })) : [];
        const location = (lat !== undefined && lng !== undefined) ? { lat: Number(lat), lng: Number(lng) } : undefined;
        const message = await Message.create({
            sender: senderId,
            group: groupId,
            content: content || (files.length > 0 ? 'Sent an attachment' : (location ? 'Shared a location' : '')),
            files,
            location,
            replyTo
        });
        const populatedMessage = await message.populate([
            { path: 'sender', select: 'username' },
            { path: 'replyTo', populate: { path: 'sender', select: 'username' } }
        ]);
        const io = req.app.get('io');
        if (io) {
            io.to(groupId).emit('receive_message', populatedMessage);
        }
        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;