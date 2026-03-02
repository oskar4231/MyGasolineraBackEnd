const pool = require('../../../Importante/BaseDeDatos/bbdd');
const logger = require('../../../Backend/Logger/LoggerLogica/logger');
const QUERIES = require('../../../Importante/BaseDeDatos/queries');

// Helper para obtener ID de usuario
const getUserId = async (conn, email) => {
    const [userRows] = await conn.query(QUERIES.ESTADISTICAS.GET_USUARIO_ID, [email]);
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.GASTO_TOTAL, [id_usuario]);
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.GASTO_MES_ACTUAL, [id_usuario]);
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.PROMEDIO_MENSUAL, [id_usuario]);
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.GASTO_ANUAL, [id_usuario]);
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.MES_COMPARACION, [id_usuario]);
        const data = result[0];
        data.diferencia = data.gasto_mes_actual - data.gasto_mes_anterior;
        data.porcentaje_cambio = data.gasto_mes_anterior > 0
            ? ((data.diferencia / data.gasto_mes_anterior) * 100).toFixed(2)
            : 0;
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.GASTO_POR_MES, [id_usuario]);
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.PROMEDIO_FACTURA, [id_usuario]);
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.PROYECCION_FIN_MES, [id_usuario]);
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.CONSUMO_REAL, [id_usuario]);
        const consumos = result.filter(r => r.consumo_l_100km > 0 && r.consumo_l_100km < 50);
        const promedioConsumo = consumos.length > 0
            ? consumos.reduce((sum, r) => sum + r.consumo_l_100km, 0) / consumos.length
            : 0;
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
        const [result] = await conn.query(QUERIES.ESTADISTICAS.COSTO_POR_KM, [id_usuario]);
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
        const [coches] = await conn.query(QUERIES.ESTADISTICAS.MANTENIMIENTO, [id_usuario]);
        const mantenimiento = coches.map(coche => {
            const kmDesdeUltimoCambio = coche.kilometraje_actual - (coche.km_ultimo_cambio_aceite || 0);
            const kmRestantes = coche.intervalo_cambio_aceite_km - kmDesdeUltimoCambio;
            const mesesDesdeUltimoCambio = coche.fecha_ultimo_cambio_aceite
                ? Math.floor((new Date() - new Date(coche.fecha_ultimo_cambio_aceite)) / (1000 * 60 * 60 * 24 * 30))
                : 0;
            const mesesRestantes = coche.intervalo_cambio_aceite_meses - mesesDesdeUltimoCambio;
            return {
                id_coche: coche.id_coche, marca: coche.marca, modelo: coche.modelo,
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
        const [consumoData] = await conn.query(QUERIES.ESTADISTICAS.CONSEJOS_CONSUMO, [id_usuario]);
        const consumoPromedio = parseFloat(consumoData[0]?.consumo_promedio || 0);
        const consejos = [];
        if (consumoPromedio > 8)       consejos.push('⛽ Mantén una velocidad constante entre 80-100 km/h para mejorar la eficiencia.');
        else if (consumoPromedio > 6)  consejos.push('⛽ Tu consumo es moderado. Evita aceleraciones bruscas para ahorrar combustible.');
        else if (consumoPromedio > 0)  consejos.push('⛽ ¡Excelente! Tu consumo es muy eficiente. Mantén estos hábitos.');
        consejos.push(
            '🔧 Verifica la presión de los neumáticos mensualmente.',
            '🛢️ Realiza cambios de aceite a tiempo.',
            '🚗 Reduce peso innecesario.',
            '🪟 Cierra ventanillas a alta velocidad.',
            '⏸️ Evita horas pico.'
        );
        res.json({ consumo_promedio: consumoPromedio.toFixed(2), consejos });
    } catch (error) {
        logger.error('Error en /estadisticas/consejos:', { error: error.message });
        res.status(500).json({ error: 'Error al generar consejos' });
    } finally {
        if (conn) conn.release();
    }
};
