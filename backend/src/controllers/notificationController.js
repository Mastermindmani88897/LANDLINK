const Notification = require('../models/Notification');

// GET /api/v1/notifications (Get user's notifications)
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user_id: req.user._id })
    .populate('sender_id', '-password_hash')
    .sort({ created_at: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({ user_id: req.user._id, is_read: false });

  res.json({
    notifications: notifications.map((n) => n.toJSON()),
    unread_count: unreadCount,
  });
};

// PATCH /api/v1/notifications/:id/read (Mark as read)
const markAsRead = async (req, res) => {
  const { id } = req.params;
  const notif = await Notification.findOne({ _id: id, user_id: req.user._id });
  if (notif) {
    notif.is_read = true;
    await notif.save();
  }
  res.json({ status: 'success' });
};

// PATCH /api/v1/notifications/read-all (Mark all as read)
const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user_id: req.user._id, is_read: false }, { is_read: true });
  res.json({ status: 'success' });
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
