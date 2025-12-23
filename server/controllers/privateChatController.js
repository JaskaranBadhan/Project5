const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const startConversation = async (req, res) => {
    const { recipientId } = req.body;
    const userId = req.user._id;
    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, recipientId] }
        }).populate('participants', 'username email');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, recipientId],
                unreadCounts: { [userId]: 0, [recipientId]: 0 }
            });
            await conversation.populate('participants', 'username email');
        }
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getMyConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
            .populate('participants', 'username')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        const seenParticipants = new Set();
        const uniqueConversations = conversations.filter(c => {
            if (!c.participants) return false;
            const other = c.participants.find(p => p._id.toString() !== req.user._id.toString());
            if (!other) return false;

            if (seenParticipants.has(other._id.toString())) {
                return false;
            }
            seenParticipants.add(other._id.toString());
            return true;
        });
        res.json(uniqueConversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
            .populate('sender', 'username')
            .populate({
                path: 'replyTo',
                populate: { path: 'sender', select: 'username' }
            })
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const sendMessage = async (req, res) => {
    const { content, conversationId, replyTo, lat, lng } = req.body;
    const senderId = req.user._id;
    const files = req.files ? req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        mimetype: file.mimetype
    })) : [];
    const location = (lat !== undefined && lng !== undefined) ? { lat: Number(lat), lng: Number(lng) } : undefined;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        const recipientId = conversation.participants.find(p => p.toString() !== senderId.toString());
        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            conversationId,
            content: content || (files.length > 0 ? 'Sent an attachment' : (location ? 'Shared a location' : '')),
            files,
            location,
            replyTo
        });
        conversation.lastMessage = message._id;
        await conversation.save();
        const populatedMessage = await message.populate([{ path: 'sender', select: 'username' }, { path: 'replyTo', populate: { path: 'sender', select: 'username' } }]);
        const io = req.app.get('io');
        if (io) {
            io.to(conversationId).emit('receive_private_message', populatedMessage);
        }
        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const likeMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        const userIdStr = req.user._id.toString();
        const likeIndex = message.likes.findIndex(id => id.toString() === userIdStr);
        if (likeIndex > -1) {
            message.likes.splice(likeIndex, 1);
        } else {
            message.likes.push(req.user._id);
        }
        await message.save();
        await message.populate([{ path: 'sender', select: 'username' }, { path: 'replyTo', populate: { path: 'sender', select: 'username' } }]);
        const io = req.app.get('io');
        if (io) {
            io.to(message.conversationId.toString()).emit('update_private_message', message);
        }
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        message.isDeleted = true;
        message.deletedBy = req.user._id;
        await message.save();
        await message.populate([{ path: 'sender', select: 'username' }, { path: 'replyTo', populate: { path: 'sender', select: 'username' } }]);
        const io = req.app.get('io');
        if (io) {
            io.to(message.conversationId.toString()).emit('update_private_message', message);
        }
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Message.deleteMany({ conversationId: conversation._id });
        await Conversation.findByIdAndDelete(conversation._id);
        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    startConversation,
    getMyConversations,
    getMessages,
    sendMessage,
    likeMessage,
    deleteMessage,
    deleteConversation
};