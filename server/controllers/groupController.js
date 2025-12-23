const Group = require('../models/Group');
const User = require('../models/User');
const crypto = require('crypto');
const createGroup = async (req, res) => {
    const { name, description } = req.body;
    try {
        const group = await Group.create({
            name,
            description,
            inviteToken: crypto.randomBytes(16).toString('hex'),
            inviteEnabled: true,
            creator: req.user._id,
            members: [{ user: req.user._id, role: 'admin' }]
        });
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({
            $or: [
                { isPrivate: false },
                { 'members.user': req.user._id }
            ]
        }).populate('creator', 'username');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members.user', 'username email role');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const isMember = group.members.some(member => member.user._id.toString() === req.user._id.toString());
        if (!isMember) {
            return res.json({
                _id: group._id,
                name: group.name,
                description: group.description,
                isMember: false,
                members: []
            });
        }
        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const generateInviteLink = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        group.inviteToken = crypto.randomBytes(16).toString('hex');
        await group.save();
        res.json({ inviteToken: group.inviteToken, inviteLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/join/${group.inviteToken}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const joinViaInvite = async (req, res) => {
    try {
        const { inviteToken } = req.params;
        const group = await Group.findOne({ inviteToken });
        if (!group) return res.status(404).json({ message: 'Invalid invite link' });
        if (!group.inviteEnabled) return res.status(403).json({ message: 'Invites are disabled for this group' });
        const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
        if (isMember) return res.status(400).json({ message: 'Already a member' });
        group.members.push({ user: req.user._id, role: 'member' });
        await group.save();
        res.json({ message: 'Joined successfully', group });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const toggleInviteLink = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        group.inviteEnabled = !group.inviteEnabled;
        await group.save();
        res.json({ inviteEnabled: group.inviteEnabled });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this group' });
        }
        await group.deleteOne();
        res.json({ id: req.params.id, message: 'Group removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const likeGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const userId = req.user._id;
        const likeIndex = group.likes.indexOf(userId);
        if (likeIndex > -1) {
            group.likes.splice(likeIndex, 1);
        } else {
            group.likes.push(userId);
        }
        await group.save();
        res.json({ likes: group.likes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    deleteGroup,
    generateInviteLink,
    joinViaInvite,
    toggleInviteLink,
    likeGroup
};