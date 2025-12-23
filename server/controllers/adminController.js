const User = require('../models/User');
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -refresh_token')
            .sort({ createdAt: -1 });

        const onlineUsers = req.app.get('onlineUsers');

        const usersWithStatus = users.map(user => ({
            ...user.toObject(),
            isOnline: onlineUsers ? onlineUsers.has(user._id.toString()) : false
        }));

        res.json(usersWithStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const bannedCount = await User.countDocuments({ isBanned: true });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentSignups = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        const recentLogins = await User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });

        res.json({
            totalUsers,
            adminCount,
            bannedCount,
            recentSignups,
            recentLogins
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot change your own role' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated', user: { _id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot ban your own account' });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        const io = req.app.get('io');
        if (io && user.isBanned) {
            io.emit('user_banned', { userId: user._id.toString() });
        }

        res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', isBanned: user.isBanned });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const searchUsers = async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.json([]);
        }

        const users = await User.find({
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        })
            .select('_id username email')
            .limit(10);

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = {
    getAllUsers,
    getUserStats,
    deleteUser,
    updateUserRole,
    toggleBanUser,
    searchUsers
};