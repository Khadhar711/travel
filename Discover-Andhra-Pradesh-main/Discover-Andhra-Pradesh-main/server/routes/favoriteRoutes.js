const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/toggle', authenticateToken, favoriteController.toggleFavorite);
router.get('/', authenticateToken, favoriteController.getUserFavorites);

module.exports = router;
