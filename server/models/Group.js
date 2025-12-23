const mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['member', 'admin'],
            default: 'member'
        }
    }],
    inviteToken: {
        type: String,
        unique: true,
        required: true
    },
    inviteEnabled: {
        type: Boolean,
        default: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });
module.exports = mongoose.model('Group', GroupSchema);