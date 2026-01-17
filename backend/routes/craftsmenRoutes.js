const express = require('express');
const router = express.Router();
const {
  getCraftsmen,
  getCraftsmanById,
  createCraftsman,
  updateCraftsman,
  deleteCraftsman
} = require('../controllers/craftsmenController');

// GET /api/craftsmen - Get all craftsmen with pagination and filtering
router.get('/', getCraftsmen);

// GET /api/craftsmen/:id - Get single craftsman by ID
router.get('/:id', getCraftsmanById);

// POST /api/craftsmen - Create new craftsman
router.post('/', createCraftsman);

// PUT /api/craftsmen/:id - Update craftsman
router.put('/:id', updateCraftsman);

// DELETE /api/craftsmen/:id - Delete craftsman
router.delete('/:id', deleteCraftsman);

module.exports = router;
