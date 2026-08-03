const express = require('express');
const router = express.Router();
const { getBugs, getBugById, createBug, updateBug, addComment } = require('../controllers/bugController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', getBugs);
router.get('/:id', getBugById);
router.post('/', upload.single('attachment'), createBug);
router.put('/:id', upload.single('attachment'), updateBug);
router.post('/:id/comments', addComment);

module.exports = router;
