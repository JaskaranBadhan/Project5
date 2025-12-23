const Note = require('../models/Note');
const Reply = require('../models/Reply');
const Group = require('../models/Group');
const createNote = async (req, res) => {
    const { title, content } = req.body;
    const groupId = req.params.id;
    try {
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
        if (!isMember) return res.status(403).json({ message: 'Not authorized' });
        let files = [];
        if (req.files) {
            files = req.files.map(file => ({
                name: file.originalname,
                path: file.path,
                mimetype: file.mimetype
            }));
        }
        const note = await Note.create({
            title,
            content,
            group: groupId,
            author: req.user._id,
            files
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('note_created', { groupId });
        }
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getNotesByGroup = async (req, res) => {
    try {
        const notes = await Note.find({ group: req.params.id })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        const notesWithReplies = await Promise.all(notes.map(async (note) => {
            const replies = await Reply.find({ note: note._id })
                .populate('author', 'username')
                .sort({ createdAt: 1 });
            const replyCount = replies.length;
            return {
                ...note.toObject(),
                replyCount,
                replies
            };
        }));
        res.json(notesWithReplies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).populate('author', 'username');
        if (!note) return res.status(404).json({ message: 'Note not found' });
        const replies = await Reply.find({ note: note._id })
            .populate('author', 'username')
            .sort({ createdAt: 1 });
        res.json({ ...note.toObject(), replies });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        if (note.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await Reply.deleteMany({ note: note._id });
        await note.deleteOne();
        const io = req.app.get('io');
        if (io) {
            io.emit('note_deleted', { noteId: req.params.id, groupId: note.group });
        }
        res.json({ message: 'Note removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const likeNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        if (note.likes.includes(req.user._id)) {
            note.likes = note.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            note.likes.push(req.user._id);
        }
        await note.save();
        const io = req.app.get('io');
        if (io) {
            io.emit('note_updated', { noteId: req.params.id });
        }
        res.json(note.likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const createReply = async (req, res) => {
    const { body } = req.body;
    const noteId = req.params.id;
    try {
        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        const reply = await Reply.create({
            body,
            note: noteId,
            author: req.user._id
        });
        const populatedReply = await reply.populate('author', 'username');
        const io = req.app.get('io');
        if (io) {
            io.emit('note_updated', { noteId });
        }
        res.status(201).json(populatedReply);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const likeReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.replyId);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });

        if (reply.likes.includes(req.user._id)) {
            reply.likes = reply.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            reply.likes.push(req.user._id);
        }
        await reply.save();
        const io = req.app.get('io');
        if (io) {
            io.emit('note_updated', { noteId: reply.note });
        }
        res.json(reply.likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.replyId);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });

        if (reply.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const noteId = reply.note;
        await reply.deleteOne();
        const io = req.app.get('io');
        if (io) {
            io.emit('note_updated', { noteId });
        }
        res.json({ message: 'Reply deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    createNote,
    getNotesByGroup,
    getNoteById,
    deleteNote,
    likeNote,
    createReply,
    likeReply,
    deleteReply
};