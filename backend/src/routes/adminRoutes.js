const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAdminStats,
  getAdminProperties,
  updatePropertyStatus,
  deleteAdminProperty,
  getAdminUsers,
} = require('../controllers/adminController');

// All admin routes require JWT auth and role === 'admin'
router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/properties', getAdminProperties);
router.put('/properties/:id/status', updatePropertyStatus);
router.delete('/properties/:id', deleteAdminProperty);
router.get('/users', getAdminUsers);

module.exports = router;
