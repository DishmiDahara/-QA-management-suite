const express = require('express');
const router = express.Router();
const { getTestCases, createTestCase, updateTestCase, deleteTestCase } = require('../controllers/testCaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTestCases);
router.post('/', authorize('Admin', 'QA Engineer'), createTestCase);
router.put('/:id', authorize('Admin', 'QA Engineer'), updateTestCase);
router.delete('/:id', authorize('Admin', 'QA Engineer'), deleteTestCase);

module.exports = router;
