const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const cochesController = require('../controllers/cochesController');

// INSERTAR COCHE
router.post('/insertCar', authenticateToken, cochesController.insertCar);

// OBTENER COCHES
router.get('/coches', authenticateToken, cochesController.getCoches);

// ELIMINAR COCHE
router.delete('/coches/:id_coche', authenticateToken, cochesController.deleteCoche);

module.exports = router;
