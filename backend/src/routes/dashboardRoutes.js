const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserDashboard } = require('../controllers/dashboardController');

router.get('/', protect, getUserDashboard);
router.get('/seller', protect, getUserDashboard);
router.get('/buyer', protect, getUserDashboard);

module.exports = router;
