const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadFile, getFile } = require('../controllers/fileController');
const { protect } = require('../middlewares/authMiddleware');
router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/:id', protect, getFile);
module.exports = router;