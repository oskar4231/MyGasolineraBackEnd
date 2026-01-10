const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const upload = require('../config/multerConfig');
const facturasController = require('../controllers/facturasController');

// OBTENER FACTURAS
router.get('/facturas', authenticateToken, facturasController.getFacturas);

// CREAR NUEVA FACTURA
router.post('/facturas', authenticateToken, upload.single('imagen'), facturasController.createFactura);

// ELIMINAR FACTURA
router.delete('/facturas/:id_factura', authenticateToken, facturasController.deleteFactura);

module.exports = router;
