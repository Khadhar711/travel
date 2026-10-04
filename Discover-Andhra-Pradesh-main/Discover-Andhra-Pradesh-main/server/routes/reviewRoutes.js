const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/:locationId', reviewController.getReviewsByLocation);
router.post('/', authenticateToken, reviewController.addReview);

module.exports = router;
