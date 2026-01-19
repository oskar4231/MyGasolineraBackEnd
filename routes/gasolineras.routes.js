const express = require('express');
const router = express.Router();
const gasolinerasController = require('../controllers/gasolinerasController');

router.get('/api/gasolineras', gasolinerasController.getGasolineras);

module.exports = router;
