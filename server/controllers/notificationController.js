const Notification = require('../models/Notification');
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('group', 'name')
            .populate('thread', 'title');
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getNotifications,
    markAsRead
};