const express = require('express');
const router = express.Router();
const { getDashboardStats, getRTMData } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/rtm', getRTMData);

module.exports = router;
