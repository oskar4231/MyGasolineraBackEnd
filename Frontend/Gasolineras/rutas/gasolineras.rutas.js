const express = require('express');
const router = express.Router();
const gasolinerasController = require('../controladores/gasolinerasController');

router.get('/api/gasolineras', gasolinerasController.getGasolineras);

module.exports = router;
