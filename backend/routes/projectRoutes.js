const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('Admin', 'QA Engineer'), createProject);
router.put('/:id', authorize('Admin', 'QA Engineer'), updateProject);

module.exports = router;
