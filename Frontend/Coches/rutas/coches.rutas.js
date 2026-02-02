const express = require('express');
const router = express.Router();
const authenticateToken = require('../../../Middleware/Autentificacion/auth');
const cochesController = require('../controladores/cochesController');

// INSERTAR COCHE
router.post('/insertCar', authenticateToken, cochesController.insertCar);

// OBTENER COCHES
router.get('/coches', authenticateToken, cochesController.getCoches);

// ELIMINAR COCHE
router.delete('/coches/:id_coche', authenticateToken, cochesController.deleteCoche);

// OBTENER COMBUSTIBLES POR COCHE
router.get('/coches/:id_coche/combustibles', authenticateToken, cochesController.getCombustiblesByCoche);

module.exports = router;
