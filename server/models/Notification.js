const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['group_invite', 'reply', 'mention', 'new_thread'],
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread'
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
module.exports = mongoose.model('Notification', NotificationSchema);