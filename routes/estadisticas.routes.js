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

router.get('/estadisticas/consumo-real', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );
    const id_usuario = userRows[0].id_usuario;
    // Calcular consumo entre repostajes
    const [result] = await conn.query(
      `SELECT 
        f1.id_factura,
        f1.fecha,
        f1.litros_repostados,
        f1.kilometraje_actual as km_actual,
        f2.kilometraje_actual as km_anterior,
        (f1.kilometraje_actual - f2.kilometraje_actual) as km_recorridos,
        (f1.litros_repostados / (f1.kilometraje_actual - f2.kilometraje_actual) * 100) as consumo_l_100km
      FROM facturas f1
      LEFT JOIN facturas f2 ON f2.id_usuario = f1.id_usuario 
        AND f2.id_coche = f1.id_coche
        AND f2.fecha < f1.fecha
        AND f2.kilometraje_actual IS NOT NULL
      WHERE f1.id_usuario = ?
        AND f1.litros_repostados IS NOT NULL
        AND f1.kilometraje_actual IS NOT NULL
        AND f2.id_factura = (
          SELECT id_factura 
          FROM facturas 
          WHERE id_usuario = f1.id_usuario 
            AND id_coche = f1.id_coche 
            AND fecha < f1.fecha 
            AND kilometraje_actual IS NOT NULL
          ORDER BY fecha DESC 
          LIMIT 1
        )
      ORDER BY f1.fecha DESC`,
      [id_usuario]
    );
    // Calcular promedio
    const consumos = result.filter(r => r.consumo_l_100km > 0 && r.consumo_l_100km < 50);
    const promedioConsumo = consumos.length > 0
      ? consumos.reduce((sum, r) => sum + r.consumo_l_100km, 0) / consumos.length
      : 0;
    res.json({
      consumo_promedio: promedioConsumo.toFixed(2),
      historial: result
    });
  } catch (error) {
    console.error('Error en /estadisticas/consumo-real:', error);
    res.status(500).json({ error: 'Error al obtener consumo real' });
  } finally {
    if (conn) conn.release();
  }
});
// 💰 COSTO POR KILÓMETRO
router.get('/estadisticas/costo-por-km', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );
    const id_usuario = userRows[0].id_usuario;
    const [result] = await conn.query(
      `SELECT 
        f1.fecha,
        f1.coste,
        (f1.kilometraje_actual - f2.kilometraje_actual) as km_recorridos,
        (f1.coste / (f1.kilometraje_actual - f2.kilometraje_actual)) as costo_por_km
      FROM facturas f1
      LEFT JOIN facturas f2 ON f2.id_usuario = f1.id_usuario 
        AND f2.id_coche = f1.id_coche
        AND f2.fecha < f1.fecha
        AND f2.kilometraje_actual IS NOT NULL
      WHERE f1.id_usuario = ?
        AND f1.kilometraje_actual IS NOT NULL
        AND f2.id_factura = (
          SELECT id_factura 
          FROM facturas 
          WHERE id_usuario = f1.id_usuario 
            AND id_coche = f1.id_coche 
            AND fecha < f1.fecha 
            AND kilometraje_actual IS NOT NULL
          ORDER BY fecha DESC 
          LIMIT 1
        )
      ORDER BY f1.fecha DESC`,
      [id_usuario]
    );
    const costos = result.filter(r => r.costo_por_km > 0 && r.costo_por_km < 1);
    const promedioCosto = costos.length > 0
      ? costos.reduce((sum, r) => sum + r.costo_por_km, 0) / costos.length
      : 0;
    res.json({
      costo_promedio_por_km: promedioCosto.toFixed(4),
      historial: result
    });
  } catch (error) {
    console.error('Error en /estadisticas/costo-por-km:', error);
    res.status(500).json({ error: 'Error al obtener costo por km' });
  } finally {
    if (conn) conn.release();
  }
});
// 🔧 MANTENIMIENTO - Cambio de Aceite
router.get('/estadisticas/mantenimiento', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );
    const id_usuario = userRows[0].id_usuario;
    // Obtener coches con información de mantenimiento
    const [coches] = await conn.query(
      `SELECT 
        id_coche,
        marca,
        modelo,
        fecha_ultimo_cambio_aceite,
        km_ultimo_cambio_aceite,
        intervalo_cambio_aceite_km,
        intervalo_cambio_aceite_meses,
        (
          SELECT kilometraje_actual 
          FROM facturas 
          WHERE id_coche = coches.id_coche 
          ORDER BY fecha DESC 
          LIMIT 1
        ) as kilometraje_actual
      FROM coches
      WHERE id_usuario = ?`,
      [id_usuario]
    );
    const mantenimiento = coches.map(coche => {
      const kmDesdeUltimoCambio = coche.kilometraje_actual - (coche.km_ultimo_cambio_aceite || 0);
      const kmRestantes = coche.intervalo_cambio_aceite_km - kmDesdeUltimoCambio;
      
      const mesesDesdeUltimoCambio = coche.fecha_ultimo_cambio_aceite
        ? Math.floor((new Date() - new Date(coche.fecha_ultimo_cambio_aceite)) / (1000 * 60 * 60 * 24 * 30))
        : 0;
      const mesesRestantes = coche.intervalo_cambio_aceite_meses - mesesDesdeUltimoCambio;
      return {
        id_coche: coche.id_coche,
        marca: coche.marca,
        modelo: coche.modelo,
        km_desde_ultimo_cambio: kmDesdeUltimoCambio,
        km_restantes: kmRestantes,
        meses_desde_ultimo_cambio: mesesDesdeUltimoCambio,
        meses_restantes: mesesRestantes,
        necesita_cambio: kmRestantes <= 500 || mesesRestantes <= 1,
        progreso_km: (kmDesdeUltimoCambio / coche.intervalo_cambio_aceite_km * 100).toFixed(1)
      };
    });
    res.json(mantenimiento);
  } catch (error) {
    console.error('Error en /estadisticas/mantenimiento:', error);
    res.status(500).json({ error: 'Error al obtener mantenimiento' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;