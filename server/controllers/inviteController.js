const Invite = require('../models/Invite');
const Group = require('../models/Group');
const User = require('../models/User');
const inviteUser = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
        if (!isMember) return res.status(403).json({ message: 'Not authorized' });
        const invitedUser = await User.findById(userId);
        if (!invitedUser) return res.status(404).json({ message: 'User not found' });
        const isAlreadyMember = group.members.some(m => m.user.toString() === userId);
        if (isAlreadyMember) return res.status(400).json({ message: 'User is already a member' });
        const existingInvite = await Invite.findOne({ group: groupId, invitedUser: userId, status: 'pending' });
        if (existingInvite) return res.status(400).json({ message: 'User already invited' });
        const invite = await Invite.create({
            group: groupId,
            inviter: req.user._id,
            invitedUser: userId
        });
        await invite.populate(['group', 'inviter', 'invitedUser']);
        res.status(201).json(invite);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getMyInvites = async (req, res) => {
    try {
        const invites = await Invite.find({ invitedUser: req.user._id, status: 'pending' })
            .populate('group', 'name description')
            .populate('inviter', 'username')
            .sort({ createdAt: -1 });
        res.json(invites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const acceptInvite = async (req, res) => {
    try {
        const invite = await Invite.findById(req.params.id);
        if (!invite) return res.status(404).json({ message: 'Invite not found' });
        if (invite.invitedUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'Invite already processed' });
        }
        const group = await Group.findById(invite.group);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
        if (!isMember) {
            group.members.push({ user: req.user._id, role: 'member' });
            await group.save();
        }
        invite.status = 'accepted';
        await invite.save();
        res.json({ message: 'Invite accepted', group });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const rejectInvite = async (req, res) => {
    try {
        const invite = await Invite.findById(req.params.id);
        if (!invite) return res.status(404).json({ message: 'Invite not found' });
        if (invite.invitedUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'Invite already processed' });
        }
        invite.status = 'rejected';
        await invite.save();
        res.json({ message: 'Invite rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getGroupInvites = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const invites = await Invite.find({ group: req.params.groupId, status: 'pending' })
            .populate('invitedUser', 'username email')
            .populate('inviter', 'username')
            .sort({ createdAt: -1 });
        res.json(invites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = {
    inviteUser,
    getMyInvites,
    acceptInvite,
    rejectInvite,
    getGroupInvites
};