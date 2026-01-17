const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrderStats
} = require('../controllers/ordersController');

// GET /api/orders - Get all orders with pagination and filtering
router.get('/', getOrders);

// GET /api/orders/stats - Get order statistics
router.get('/stats', getOrderStats);

// GET /api/orders/:id - Get single order by ID
router.get('/:id', getOrderById);

// POST /api/orders - Create new order
router.post('/', createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', updateOrder);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', updateOrderStatus);

// PUT /api/orders/:id/cancel - Cancel order and restore inventory
router.put('/:id/cancel', cancelOrder);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', deleteOrder);

module.exports = router;
