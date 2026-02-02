const pool = require('../../../Importante/BaseDeDatos/bbdd');
const logger = require('../logger/logger'); // Asumiendo que existe el logger

// Helper para obtener ID de usuario
const getUserId = async (conn, email) => {
    const [userRows] = await conn.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (userRows.length === 0) return null;
    return userRows[0].id_usuario;
};

// 1️⃣ Gasto Total del Usuario
exports.getTotal = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT COALESCE(SUM(coste), 0) as gasto_total, COUNT(*) as total_facturas
             FROM facturas WHERE id_usuario = ?`,
            [id_usuario]
        );
        res.json(result[0]);
    } catch (error) {
        logger.error('Error en /estadisticas/total:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener estadísticas totales' });
    } finally {
        if (conn) conn.release();
    }
};

// 2️⃣ Gasto Mensual Actual
exports.getMesActual = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT COALESCE(SUM(coste), 0) as gasto_mes_actual, COUNT(*) as facturas_mes_actual
             FROM facturas WHERE id_usuario = ? AND YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE())`,
            [id_usuario]
        );
        res.json(result[0]);
    } catch (error) {
        logger.error('Error en /estadisticas/mes-actual:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener gasto mensual' });
    } finally {
        if (conn) conn.release();
    }
};

// 3️⃣ Gasto Mensual Promedio (Últimos 6 Meses)
exports.getPromedioMensual = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT COALESCE(AVG(gasto_mensual), 0) as promedio_mensual
             FROM (
                SELECT YEAR(fecha) as anio, MONTH(fecha) as mes, SUM(coste) as gasto_mensual
                FROM facturas WHERE id_usuario = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY YEAR(fecha), MONTH(fecha)
             ) as gastos_mensuales`,
            [id_usuario]
        );
        res.json(result[0]);
    } catch (error) {
        logger.error('Error en /estadisticas/promedio-mensual:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener promedio mensual' });
    } finally {
        if (conn) conn.release();
    }
};

// 5️⃣ Gasto Anual (Últimos 12 Meses)
exports.getAnual = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT COALESCE(SUM(coste), 0) as gasto_anual, COUNT(*) as facturas_anual
             FROM facturas WHERE id_usuario = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`,
            [id_usuario]
        );
        res.json(result[0]);
    } catch (error) {
        logger.error('Error en /estadisticas/anual:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener gasto anual' });
    } finally {
        if (conn) conn.release();
    }
};

// 6️⃣ Comparación Mes Actual vs Mes Anterior
exports.getMesComparacion = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE()) THEN coste ELSE 0 END), 0) as gasto_mes_actual,
                COALESCE(SUM(CASE WHEN fecha >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) AND fecha < DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN coste ELSE 0 END), 0) as gasto_mes_anterior
             FROM facturas WHERE id_usuario = ?`,
            [id_usuario]
        );

        const data = result[0];
        data.diferencia = data.gasto_mes_actual - data.gasto_mes_anterior;
        data.porcentaje_cambio = data.gasto_mes_anterior > 0 ? ((data.diferencia / data.gasto_mes_anterior) * 100).toFixed(2) : 0;

        res.json(data);
    } catch (error) {
        logger.error('Error en /estadisticas/mes-comparacion:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener comparación mensual' });
    } finally {
        if (conn) conn.release();
    }
};

// 7️⃣ Gasto por Mes (Últimos 6 Meses)
exports.getPorMes = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, DATE_FORMAT(fecha, '%M %Y') as mes_nombre,
                    COALESCE(SUM(coste), 0) as gasto, COUNT(*) as num_facturas
             FROM facturas WHERE id_usuario = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(fecha, '%Y-%m') ORDER BY mes ASC`,
            [id_usuario]
        );
        res.json(result);
    } catch (error) {
        logger.error('Error en /estadisticas/por-mes:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener gasto por mes' });
    } finally {
        if (conn) conn.release();
    }
};

// 8️⃣ Gasto Promedio por Factura
exports.getPromedioFactura = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT COALESCE(AVG(coste), 0) as promedio_por_factura, MIN(coste) as gasto_minimo, MAX(coste) as gasto_maximo
             FROM facturas WHERE id_usuario = ?`,
            [id_usuario]
        );
        res.json(result[0]);
    } catch (error) {
        logger.error('Error en /estadisticas/promedio-factura:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener promedio por factura' });
    } finally {
        if (conn) conn.release();
    }
};

// 1️⃣3️⃣ Proyección de Gasto para Fin de Mes
exports.getProyeccionFinMes = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT COALESCE(SUM(coste), 0) as gasto_actual, DAY(CURDATE()) as dias_transcurridos, DAY(LAST_DAY(CURDATE())) as dias_totales_mes,
                    COALESCE(SUM(coste) * DAY(LAST_DAY(CURDATE())) / DAY(CURDATE()), 0) as proyeccion_fin_mes
             FROM facturas WHERE id_usuario = ? AND YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE())`,
            [id_usuario]
        );
        res.json(result[0]);
    } catch (error) {
        logger.error('Error en /estadisticas/proyeccion-fin-mes:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener proyección de fin de mes' });
    } finally {
        if (conn) conn.release();
    }
};

exports.getConsumoReal = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [result] = await conn.query(
            `SELECT f1.id_factura, f1.fecha, f1.litros_repostados, f1.kilometraje_actual as km_actual, f2.kilometraje_actual as km_anterior,
                    (f1.kilometraje_actual - f2.kilometraje_actual) as km_recorridos,
                    (f1.litros_repostados / (f1.kilometraje_actual - f2.kilometraje_actual) * 100) as consumo_l_100km
             FROM facturas f1
             LEFT JOIN facturas f2 ON f2.id_usuario = f1.id_usuario AND f2.id_coche = f1.id_coche AND f2.fecha < f1.fecha AND f2.kilometraje_actual IS NOT NULL
             WHERE f1.id_usuario = ? AND f1.litros_repostados IS NOT NULL AND f1.kilometraje_actual IS NOT NULL
               AND f2.id_factura = (SELECT id_factura FROM facturas WHERE id_usuario = f1.id_usuario AND id_coche = f1.id_coche AND fecha < f1.fecha AND kilometraje_actual IS NOT NULL ORDER BY fecha DESC LIMIT 1)
             ORDER BY f1.fecha DESC`,
            [id_usuario]
        );

        const consumos = result.filter(r => r.consumo_l_100km > 0 && r.consumo_l_100km < 50);
        const promedioConsumo = consumos.length > 0 ? consumos.reduce((sum, r) => sum + r.consumo_l_100km, 0) / consumos.length : 0;

        res.json({ consumo_promedio: promedioConsumo.toFixed(2), historial: result });
    } catch (error) {
        logger.error('Error en /estadisticas/consumo-real:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener consumo real' });
    } finally {
        if (conn) conn.release();
    }
};

exports.getCostoPorKm = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const query = `
          WITH costos_individuales AS (
          SELECT f1.id_coche, f1.id_factura, f1.coste, f1.fecha, f1.kilometraje_actual, c.marca, c.modelo, c.kilometraje_inicial,
            LAG(f1.kilometraje_actual) OVER (PARTITION BY f1.id_coche ORDER BY f1.fecha) as kilometraje_anterior
          FROM facturas f1 JOIN coches c ON c.id_coche = f1.id_coche
          WHERE f1.id_usuario = ? AND f1.kilometraje_actual IS NOT NULL AND f1.coste > 0
        ),
        costos_calculados AS (
          SELECT id_coche, marca, modelo, kilometraje_inicial, id_factura, coste, kilometraje_actual, kilometraje_anterior,
            CASE WHEN kilometraje_anterior IS NULL AND kilometraje_actual > kilometraje_inicial THEN kilometraje_actual - kilometraje_inicial
                 WHEN kilometraje_anterior IS NOT NULL AND kilometraje_actual > kilometraje_anterior THEN kilometraje_actual - kilometraje_anterior ELSE NULL END as km_recorridos,
            CASE WHEN kilometraje_anterior IS NULL AND kilometraje_actual > kilometraje_inicial THEN ROUND(coste / (kilometraje_actual - kilometraje_inicial), 4)
                 WHEN kilometraje_anterior IS NOT NULL AND kilometraje_actual > kilometraje_anterior THEN ROUND(coste / (kilometraje_actual - kilometraje_anterior), 4) ELSE NULL END as costo_por_km
          FROM costos_individuales
        )
        SELECT id_coche, marca, modelo, COUNT(id_factura) as num_facturas, ROUND(AVG(costo_por_km), 4) as costo_promedio_por_km,
          MAX(kilometraje_actual) - MIN(kilometraje_inicial) as km_totales, SUM(coste) as gasto_total,
          ROUND(SUM(coste) / NULLIF(SUM(CASE WHEN km_recorridos IS NOT NULL THEN km_recorridos ELSE 0 END), 0), 4) as costo_ponderado_por_km
        FROM costos_calculados
        GROUP BY id_coche, marca, modelo, kilometraje_inicial
        ORDER BY marca, modelo`;

        const [result] = await conn.query(query, [id_usuario]);
        res.json({ costos_por_coche: result, total_coches: result.length });
    } catch (error) {
        logger.error('Error en /estadisticas/costo-por-km:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener costo por km' });
    } finally {
        if (conn) conn.release();
    }
};

exports.getMantenimiento = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [coches] = await conn.query(
            `SELECT id_coche, marca, modelo, fecha_ultimo_cambio_aceite, km_ultimo_cambio_aceite, intervalo_cambio_aceite_km, intervalo_cambio_aceite_meses,
                (SELECT kilometraje_actual FROM facturas WHERE id_coche = coches.id_coche ORDER BY fecha DESC LIMIT 1) as kilometraje_actual
             FROM coches WHERE id_usuario = ?`,
            [id_usuario]
        );

        const mantenimiento = coches.map(coche => {
            const kmDesdeUltimoCambio = coche.kilometraje_actual - (coche.km_ultimo_cambio_aceite || 0);
            const kmRestantes = coche.intervalo_cambio_aceite_km - kmDesdeUltimoCambio;
            const mesesDesdeUltimoCambio = coche.fecha_ultimo_cambio_aceite ? Math.floor((new Date() - new Date(coche.fecha_ultimo_cambio_aceite)) / (1000 * 60 * 60 * 24 * 30)) : 0;
            const mesesRestantes = coche.intervalo_cambio_aceite_meses - mesesDesdeUltimoCambio;
            return {
                id_coche: coche.id_coche, marca: coche.marca, modelo: coche.modelo,
                km_desde_ultimo_cambio: kmDesdeUltimoCambio, km_restantes: kmRestantes,
                meses_desde_ultimo_cambio: mesesDesdeUltimoCambio, meses_restantes: mesesRestantes,
                necesita_cambio: kmRestantes <= 500 || mesesRestantes <= 1,
                progreso_km: (kmDesdeUltimoCambio / coche.intervalo_cambio_aceite_km * 100).toFixed(1)
            };
        });
        res.json(mantenimiento);
    } catch (error) {
        logger.error('Error en /estadisticas/mantenimiento:', { error: error.message });
        res.status(500).json({ error: 'Error al obtener mantenimiento' });
    } finally {
        if (conn) conn.release();
    }
};

exports.getConsejos = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const id_usuario = await getUserId(conn, req.user.email);
        if (!id_usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const [consumoData] = await conn.query(`
          SELECT AVG(consumo_l_100km) as consumo_promedio
          FROM (SELECT (f1.litros_repostados / ((f1.kilometraje_actual - f2.kilometraje_actual) / 100)) as consumo_l_100km
                FROM facturas f1 JOIN facturas f2 ON f1.id_coche = f2.id_coche
                WHERE f1.id_usuario = ? AND f1.litros_repostados > 0 AND f1.kilometraje_actual > f2.kilometraje_actual
                  AND f2.fecha = (SELECT MAX(fecha) FROM facturas WHERE id_coche = f1.id_coche AND fecha < f1.fecha AND kilometraje_actual < f1.kilometraje_actual ORDER BY fecha DESC LIMIT 1)
                ORDER BY f1.fecha DESC) as consumos
          WHERE consumo_l_100km > 0 AND consumo_l_100km < 50
        `, [id_usuario]);

        const consumoPromedio = parseFloat(consumoData[0]?.consumo_promedio || 0);
        const consejos = [];
        if (consumoPromedio > 8) consejos.push('⛽ Mantén una velocidad constante entre 80-100 km/h para mejorar la eficiencia.');
        else if (consumoPromedio > 6) consejos.push('⛽ Tu consumo es moderado. Evita aceleraciones bruscas para ahorrar combustible.');
        else if (consumoPromedio > 0) consejos.push('⛽ ¡Excelente! Tu consumo es muy eficiente. Mantén estos hábitos.');
        consejos.push('🔧 Verifica la presión de los neumáticos mensualmente.', '🛢️ Realiza cambios de aceite a tiempo.', '🚗 Reduce peso innecesario.', '🪟 Cierra ventanillas a alta velocidad.', '⏸️ Evita horas pico.');

        res.json({ consumo_promedio: consumoPromedio.toFixed(2), consejos });
    } catch (error) {
        logger.error('Error en /estadisticas/consejos:', { error: error.message });
        res.status(500).json({ error: 'Error al generar consejos' });
    } finally {
        if (conn) conn.release();
    }
};
