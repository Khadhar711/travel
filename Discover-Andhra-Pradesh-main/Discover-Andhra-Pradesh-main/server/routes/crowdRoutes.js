const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');

router.get('/:locationId', crowdController.getLiveCrowdInfo);

module.exports = router;
