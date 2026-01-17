const Notification = require('../models/Notification');

// Simple in-memory cache with TTL
const cache = {
  notifications: {
    data: null,
    expiry: 0,
    queries: {} // Store different query results separately
  },
  unreadCount: {
    data: null,
    expiry: 0
  }
};

const CACHE_TTL = 30 * 1000; // 30 seconds cache TTL for most data
const COUNT_CACHE_TTL = 60 * 1000; // 60 seconds cache TTL for count queries (less volatile)

// Helper to get cached data or fetch fresh data
const getCachedOrCompute = async (cacheKey, queryHash = 'default', ttl, computeFn) => {
  const now = Date.now();
  const cacheItem = cache[cacheKey];
  
  // Check if we have a cache for this specific query
  if (cacheItem.queries && queryHash !== 'default') {
    const queryCache = cacheItem.queries[queryHash];
    if (queryCache && queryCache.data !== null && queryCache.expiry > now) {
      return queryCache.data;
    }
  } else if (cacheItem && cacheItem.data !== null && cacheItem.expiry > now) {
    // Return cached data if valid
    return cacheItem.data;
  }
  
  // Compute fresh data
  const freshData = await computeFn();
  
  // Update cache
  if (cacheItem.queries && queryHash !== 'default') {
    if (!cacheItem.queries[queryHash]) {
      cacheItem.queries[queryHash] = {};
    }
    cacheItem.queries[queryHash] = {
      data: freshData,
      expiry: now + ttl
    };
  } else {
    cache[cacheKey] = {
      ...cacheItem,
      data: freshData,
      expiry: now + ttl
    };
  }
  
  return freshData;
};

// Invalidate cache for specific keys
const invalidateCache = (keys = []) => {
  if (keys.length === 0) {
    // Invalidate all cache
    Object.keys(cache).forEach(key => {
      cache[key].data = null;
      cache[key].expiry = 0;
    });
  } else {
    // Invalidate specific keys
    keys.forEach(key => {
      if (cache[key]) {
        cache[key].data = null;
        cache[key].expiry = 0;
      }
    });
  }
};

// GET all notifications with pagination
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, entityType, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Generate a cache key based on query parameters
    const queryHash = `p${pageNum}-l${limitNum}-r${read || ''}-e${entityType || ''}-s${search || ''}`;
    
    // Return cached data for queries
    const isCacheable = pageNum === 1 && limitNum <= 50;
    
    if (isCacheable) {
      const notificationsData = await getCachedOrCompute('notifications', queryHash, CACHE_TTL, async () => {
        // Build query object based on filters
        const query = {};
        
        if (read !== undefined) {
          query.read = read === 'true';
        }
        
        if (entityType) {
          query.entityType = entityType;
        }
        
        // Add text search if provided
        const searchQuery = search ? { $text: { $search: search } } : {};
        const finalQuery = search ? { ...query, ...searchQuery } : query;
        
        // Use Promise.all for concurrent queries
        const [notifications, count] = await Promise.all([
          Notification.find(finalQuery)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .lean()
            .exec(),
          Notification.countDocuments(finalQuery)
        ]);
        
        return {
          notifications,
          totalPages: Math.ceil(count / limitNum),
          currentPage: pageNum,
          totalCount: count
        };
      });
      
      // Get unread count separately from cache
      const unreadCount = await getCachedOrCompute('unreadCount', 'default', COUNT_CACHE_TTL, async () => {
        return await Notification.countDocuments({ read: false });
      });
      
      return res.json({
        ...notificationsData,
        unreadCount
      });
    }
    
    // Handle non-cached custom queries
    const query = {};
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    if (entityType) {
      query.entityType = entityType;
    }
    
    // Add text search if provided
    const searchQuery = search ? { $text: { $search: search } } : {};
    const finalQuery = search ? { ...query, ...searchQuery } : query;
    
    // Use Promise.all for concurrent queries
    const [notifications, count] = await Promise.all([
      Notification.find(finalQuery)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean()
        .exec(),
      Notification.countDocuments(finalQuery)
    ]);
    
    // Get unread count separately or from cache
    const unreadCount = await getCachedOrCompute('unreadCount', 'default', COUNT_CACHE_TTL, async () => {
      return await Notification.countDocuments({ read: false });
    });
    
    res.json({
      notifications,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalCount: count,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      message: error.message 
    });
  }
};

// GET single notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Bildirishnoma topilmadi' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notification',
      message: error.message 
    });
  }
};

// POST create new notification
const createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const newNotification = await notification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(400).json({ 
      error: 'Failed to create notification',
      message: error.message 
    });
  }
};

// PUT mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    ).lean();
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirishnoma topilmadi' });
    }
    
    // Invalidate relevant caches
    invalidateCache(['notifications', 'unreadCount']);
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(400).json({ 
      error: 'Failed to mark notification as read',
      message: error.message 
    });
  }
};

// PUT mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    // Use the optimized static method from the model
    await Notification.markAllAsRead();
    
    // Invalidate caches
    invalidateCache(['notifications', 'unreadCount']);
    
    res.json({ message: 'Barcha bildirishnomalar o\'qilgan deb belgilandi' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark all notifications as read',
      message: error.message 
    });
  }
};

// DELETE notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirishnoma topilmadi' });
    }
    
    res.json({ message: 'Bildirishnoma muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      error: 'Failed to delete notification',
      message: error.message 
    });
  }
};

// DELETE all notifications
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'Barcha bildirishnomalar o\'chirildi' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ 
      error: 'Failed to delete all notifications',
      message: error.message 
    });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};
