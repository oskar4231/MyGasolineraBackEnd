const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const estadisticasController = require('../controllers/estadisticasController');

// 1️⃣ Gasto Total del Usuario
router.get('/estadisticas/total', authenticateToken, estadisticasController.getTotal);

// 2️⃣ Gasto Mensual Actual
router.get('/estadisticas/mes-actual', authenticateToken, estadisticasController.getMesActual);

// 3️⃣ Gasto Mensual Promedio (Últimos 6 Meses)
router.get('/estadisticas/promedio-mensual', authenticateToken, estadisticasController.getPromedioMensual);

// 5️⃣ Gasto Anual (Últimos 12 Meses)
router.get('/estadisticas/anual', authenticateToken, estadisticasController.getAnual);

// 6️⃣ Comparación Mes Actual vs Mes Anterior
router.get('/estadisticas/mes-comparacion', authenticateToken, estadisticasController.getMesComparacion);

// 7️⃣ Gasto por Mes (Últimos 6 Meses) - Para Gráficas
router.get('/estadisticas/por-mes', authenticateToken, estadisticasController.getPorMes);

// 8️⃣ Gasto Promedio por Factura
router.get('/estadisticas/promedio-factura', authenticateToken, estadisticasController.getPromedioFactura);

// 1️⃣3️⃣ Proyección de Gasto para Fin de Mes
router.get('/estadisticas/proyeccion-fin-mes', authenticateToken, estadisticasController.getProyeccionFinMes);

router.get('/estadisticas/consumo-real', authenticateToken, estadisticasController.getConsumoReal);

// 💰 COSTO POR KILÓMETRO
router.get('/estadisticas/costo-por-km', authenticateToken, estadisticasController.getCostoPorKm);

// 🔧 MANTENIMIENTO - Cambio de Aceite
router.get('/estadisticas/mantenimiento', authenticateToken, estadisticasController.getMantenimiento);

// 🎯 CONSEJOS PERSONALIZADOS
router.get('/estadisticas/consejos', authenticateToken, estadisticasController.getConsejos);

module.exports = router;