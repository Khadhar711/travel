const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.post('/', authenticateToken, locationController.createLocation);

module.exports = router;
