const express = require('express');
const router = express.Router();
const { getRequirements, createRequirement, updateRequirement, deleteRequirement } = require('../controllers/requirementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRequirements);
router.post('/', authorize('Admin', 'QA Engineer'), createRequirement);
router.put('/:id', authorize('Admin', 'QA Engineer'), updateRequirement);
router.delete('/:id', authorize('Admin', 'QA Engineer'), deleteRequirement);

module.exports = router;
