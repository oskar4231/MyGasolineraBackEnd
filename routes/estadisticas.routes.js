const express = require('express');
const router = express.Router();
const pool = require('../config/bbdd');
const authenticateToken = require('../middleware/auth');

// 1️⃣ Gasto Total del Usuario
router.get('/estadisticas/total', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = userRows[0].id_usuario;

    const [result] = await conn.query(
      `SELECT 
        COALESCE(SUM(coste), 0) as gasto_total,
        COUNT(*) as total_facturas
      FROM facturas
      WHERE id_usuario = ?`,
      [id_usuario]
    );

    res.json(result[0]);
  } catch (error) {
    console.error('Error en /estadisticas/total:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas totales' });
  } finally {
    if (conn) conn.release();
  }
});

// 2️⃣ Gasto Mensual Actual
router.get('/estadisticas/mes-actual', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = userRows[0].id_usuario;

    const [result] = await conn.query(
      `SELECT 
        COALESCE(SUM(coste), 0) as gasto_mes_actual,
        COUNT(*) as facturas_mes_actual
      FROM facturas
      WHERE id_usuario = ?
        AND YEAR(fecha) = YEAR(CURDATE())
        AND MONTH(fecha) = MONTH(CURDATE())`,
      [id_usuario]
    );

    res.json(result[0]);
  } catch (error) {
    console.error('Error en /estadisticas/mes-actual:', error);
    res.status(500).json({ error: 'Error al obtener gasto mensual' });
  } finally {
    if (conn) conn.release();
  }
});

// 3️⃣ Gasto Mensual Promedio (Últimos 6 Meses)
router.get('/estadisticas/promedio-mensual', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = userRows[0].id_usuario;

    const [result] = await conn.query(
      `SELECT 
        COALESCE(AVG(gasto_mensual), 0) as promedio_mensual
      FROM (
        SELECT 
          YEAR(fecha) as anio,
          MONTH(fecha) as mes,
          SUM(coste) as gasto_mensual
        FROM facturas
        WHERE id_usuario = ?
          AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY YEAR(fecha), MONTH(fecha)
      ) as gastos_mensuales`,
      [id_usuario]
    );

    res.json(result[0]);
  } catch (error) {
    console.error('Error en /estadisticas/promedio-mensual:', error);
    res.status(500).json({ error: 'Error al obtener promedio mensual' });
  } finally {
    if (conn) conn.release();
  }
});

// 5️⃣ Gasto Anual (Últimos 12 Meses)
router.get('/estadisticas/anual', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = userRows[0].id_usuario;

    const [result] = await conn.query(
      `SELECT 
        COALESCE(SUM(coste), 0) as gasto_anual,
        COUNT(*) as facturas_anual
      FROM facturas
      WHERE id_usuario = ?
        AND fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`,
      [id_usuario]
    );

    res.json(result[0]);
  } catch (error) {
    console.error('Error en /estadisticas/anual:', error);
    res.status(500).json({ error: 'Error al obtener gasto anual' });
  } finally {
    if (conn) conn.release();
  }
});

// 6️⃣ Comparación Mes Actual vs Mes Anterior
router.get('/estadisticas/mes-comparacion', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = userRows[0].id_usuario;

    const [result] = await conn.query(
      `SELECT 
        COALESCE(SUM(CASE 
          WHEN YEAR(fecha) = YEAR(CURDATE()) 
           AND MONTH(fecha) = MONTH(CURDATE()) 
          THEN coste ELSE 0 
        END), 0) as gasto_mes_actual,
        
        COALESCE(SUM(CASE 
          WHEN fecha >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
           AND fecha < DATE_FORMAT(CURDATE(), '%Y-%m-01')
          THEN coste ELSE 0 
        END), 0) as gasto_mes_anterior
      FROM facturas
      WHERE id_usuario = ?`,
      [id_usuario]
    );

    const data = result[0];
    data.diferencia = data.gasto_mes_actual - data.gasto_mes_anterior;
    data.porcentaje_cambio = data.gasto_mes_anterior > 0 
      ? ((data.diferencia / data.gasto_mes_anterior) * 100).toFixed(2)
      : 0;

    res.json(data);
  } catch (error) {
    console.error('Error en /estadisticas/mes-comparacion:', error);
    res.status(500).json({ error: 'Error al obtener comparación mensual' });
  } finally {
    if (conn) conn.release();
  }
});

// 7️⃣ Gasto por Mes (Últimos 6 Meses) - Para Gráficas
router.get('/estadisticas/por-mes', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = userRows[0].id_usuario;

    const [result] = await conn.query(
      `SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as mes,
        DATE_FORMAT(fecha, '%M %Y') as mes_nombre,
        COALESCE(SUM(coste), 0) as gasto,
        COUNT(*) as num_facturas
      FROM facturas
      WHERE id_usuario = ?
        AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes ASC`,
      [id_usuario]
    );

    res.json(result);
  } catch (error) {
    console.error('Error en /estadisticas/por-mes:', error);
    res.status(500).json({ error: 'Error al obtener gasto por mes' });
  } finally {
    if (conn) conn.release();
  }
});

// 8️⃣ Gasto Promedio por Factura
router.get('/estadisticas/promedio-factura', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = userRows[0].id_usuario;

    const [result] = await conn.query(
      `SELECT 
        COALESCE(AVG(coste), 0) as promedio_por_factura,
        MIN(coste) as gasto_minimo,
        MAX(coste) as gasto_maximo
      FROM facturas
      WHERE id_usuario = ?`,
      [id_usuario]
    );

    res.json(result[0]);
  } catch (error) {
    console.error('Error en /estadisticas/promedio-factura:', error);
    res.status(500).json({ error: 'Error al obtener promedio por factura' });
  } finally {
    if (conn) conn.release();
  }
});

// 1️⃣3️⃣ Proyección de Gasto para Fin de Mes
router.get('/estadisticas/proyeccion-fin-mes', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id_usuario = userRows[0].id_usuario;

    const [result] = await conn.query(
      `SELECT 
        COALESCE(SUM(coste), 0) as gasto_actual,
        DAY(CURDATE()) as dias_transcurridos,
        DAY(LAST_DAY(CURDATE())) as dias_totales_mes,
        COALESCE(
          SUM(coste) * DAY(LAST_DAY(CURDATE())) / DAY(CURDATE()), 
          0
        ) as proyeccion_fin_mes
      FROM facturas
      WHERE id_usuario = ?
        AND YEAR(fecha) = YEAR(CURDATE())
        AND MONTH(fecha) = MONTH(CURDATE())`,
      [id_usuario]
    );

    res.json(result[0]);
  } catch (error) {
    console.error('Error en /estadisticas/proyeccion-fin-mes:', error);
    res.status(500).json({ error: 'Error al obtener proyección de fin de mes' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;