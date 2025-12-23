const File = require('../models/File');
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { groupId } = req.body;
        if (!groupId) {
            return res.status(400).json({ message: 'Group ID is required' });
        }
        const fileData = await File.create({
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploader: req.user._id,
            group: groupId
        });
        res.status(201).json(fileData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ message: 'File not found' });
        res.json({
            ...file.toObject(),
            url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    uploadFile,
    getFile
};