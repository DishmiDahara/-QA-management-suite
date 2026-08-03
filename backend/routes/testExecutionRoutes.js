const express = require('express');
const router = express.Router();
const { recordExecution, getExecutionHistory } = require('../controllers/testExecutionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getExecutionHistory);
router.post('/', authorize('Admin', 'QA Engineer'), recordExecution);

module.exports = router;
