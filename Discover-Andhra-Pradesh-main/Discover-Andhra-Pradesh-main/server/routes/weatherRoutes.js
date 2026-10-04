const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

router.get('/:locationId', weatherController.getWeatherByLocation);

module.exports = router;
