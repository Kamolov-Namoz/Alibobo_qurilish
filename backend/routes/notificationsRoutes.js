const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationsController');

// GET /api/notifications - Get all notifications with pagination
router.get('/', getNotifications);

// GET /api/notifications/:id - Get single notification by ID
router.get('/:id', getNotificationById);

// POST /api/notifications - Create new notification
router.post('/', createNotification);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

// DELETE /api/notifications - Delete all notifications
router.delete('/', deleteAllNotifications);

module.exports = router;
