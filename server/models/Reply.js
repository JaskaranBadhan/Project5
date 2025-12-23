const mongoose = require('mongoose');
const ReplySchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread'
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    },
    parentReply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply',
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });
module.exports = mongoose.model('Reply', ReplySchema);