const Thread = require('../models/Thread');
const Reply = require('../models/Reply');
const Group = require('../models/Group');
const createThread = async (req, res) => {
    const { title, body } = req.body;
    const groupId = req.params.id;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Not a member of this group' });
        }
        const thread = await Thread.create({
            title,
            body,
            group: groupId,
            author: req.user._id
        });
        await thread.populate('author', 'username');
        const io = req.app.get('io');
        if (io) {
            io.to(groupId).emit('new_thread', thread);
        }
        res.status(201).json(thread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getThreadById = async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id)
            .populate('author', 'username')
            .populate('group', 'name isPrivate');
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        const group = await Group.findById(thread.group._id);
        if (group.isPrivate) {
            const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
            if (!isMember) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }
        thread.viewCount += 1;
        await thread.save();
        const replies = await Reply.find({ thread: thread._id })
            .populate('author', 'username')
            .sort({ createdAt: 1 });
        res.json({ ...thread.toObject(), replies });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const createReply = async (req, res) => {
    const { body, parentReply } = req.body;
    const threadId = req.params.id;
    try {
        const thread = await Thread.findById(threadId);
        if (!thread) return res.status(404).json({ message: 'Thread not found' });
        const reply = await Reply.create({
            body,
            thread: threadId,
            author: req.user._id,
            parentReply: parentReply || null
        });
        const populatedReply = await reply.populate('author', 'username');
        const io = req.app.get('io');
        if (io) {
            io.emit('thread_updated', { threadId });
        }
        res.status(201).json(populatedReply);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteThread = async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        if (thread.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await Reply.deleteMany({ thread: thread._id });
        await thread.deleteOne();
        const io = req.app.get('io');
        if (io) {
            io.emit('thread_deleted', { threadId: req.params.id, groupId: thread.group });
        }
        res.json({ message: 'Thread removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const likeThread = async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: 'Thread not found' });
        if (thread.likes.includes(req.user._id)) {
            thread.likes = thread.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            thread.likes.push(req.user._id);
        }
        await thread.save();
        const io = req.app.get('io');
        if (io) {
            io.emit('thread_updated', { threadId: req.params.id });
        }
        res.json(thread.likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const likeReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });
        if (reply.likes.includes(req.user._id)) {
            reply.likes = reply.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            reply.likes.push(req.user._id);
        }
        await reply.save();
        const io = req.app.get('io');
        if (io) {
            if (reply.thread) {
                io.emit('thread_updated', { threadId: reply.thread });
            } else if (reply.note) {
                io.emit('note_updated', { noteId: reply.note });
            }
        }
        res.json(reply.likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getThreadsByGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.isPrivate) {
            const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
            if (!isMember) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }
        const threads = await Thread.find({ group: id })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        const threadsWithCounts = await Promise.all(threads.map(async (thread) => {
            const replyCount = await Reply.countDocuments({ thread: thread._id });
            return {
                ...thread.toObject(),
                replyCount,
                replies: []
            };
        }));
        res.json(threadsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    createThread,
    getThreadById,
    createReply,
    getThreadsByGroup,
    deleteThread,
    likeThread,
    likeReply
};