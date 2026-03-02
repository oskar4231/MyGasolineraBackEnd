const pool = require('../../../Importante/BaseDeDatos/bbdd');
const logger = require('../../../Backend/Logger/LoggerLogica/logger');

exports.insertCar = async (req, res) => {
    let conn;
    try {
        const { marca, modelo, combustible, kilometraje_inicial,
            capacidad_tanque, consumo_teorico, fecha_ultimo_cambio_aceite,
            km_ultimo_cambio_aceite, intervalo_cambio_aceite_km, intervalo_cambio_aceite_meses } = req.body;
        const userEmail = req.user.email;

        if (!marca || !modelo || !combustible) {
            logger.warn('Intento de insertar coche sin datos completos', { usuario: userEmail });
            return res.status(400).json({ status: 'error', message: 'Marca, modelo y combustible son requeridos' });
        }

        logger.info('Iniciando inserción de coche', { usuario: userEmail, marca, modelo });

        conn = await pool.getConnection();
        const [userRows] = await conn.query('SELECT id_usuario FROM usuarios WHERE email = ?', [userEmail]);

        if (userRows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }

        const id_usuario = userRows[0].id_usuario;
        const [carExists] = await conn.query('SELECT id_coche FROM coches WHERE id_usuario = ? AND marca = ? AND modelo = ?', [id_usuario, marca, modelo]);

        if (carExists.length > 0) {
            return res.status(409).json({ status: 'error', message: 'Este coche ya está registrado' });
        }

        const [result] = await conn.query(
            'INSERT INTO coches (id_usuario, marca, modelo, combustible, kilometraje_inicial, capacidad_tanque, consumo_teorico, fecha_ultimo_cambio_aceite, km_ultimo_cambio_aceite, intervalo_cambio_aceite_km, intervalo_cambio_aceite_meses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id_usuario, marca, modelo, combustible, kilometraje_inicial || null, capacidad_tanque || null, consumo_teorico || null, fecha_ultimo_cambio_aceite || null, km_ultimo_cambio_aceite || null, intervalo_cambio_aceite_km || 15000, intervalo_cambio_aceite_meses || 12]
        );

        logger.info('Coche registrado exitosamente', { id_coche: result.insertId, usuario_id: id_usuario, marca, modelo, combustible });

        res.status(201).json({ status: 'success', message: 'Coche creado correctamente', carId: result.insertId });

    } catch (error) {
        logger.error('Error al insertar coche', { error: error.message, stack: error.stack, usuario: req.user?.email });
        res.status(500).json({ status: 'error', message: 'Error en el servidor: ' + error.message });
    } finally {
        if (conn) conn.release();
    }
};

exports.getCoches = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const [userRows] = await conn.query('SELECT id_usuario FROM usuarios WHERE email = ?', [req.user.email]);

        if (userRows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }

        const id_usuario = userRows[0].id_usuario;
        const [coches] = await conn.query('SELECT id_coche, marca, modelo, combustible, kilometraje_inicial, capacidad_tanque, consumo_teorico FROM coches WHERE id_usuario = ?', [id_usuario]);

        res.json(coches);

    } catch (error) {
        logger.error('Error al obtener coches', { error: error.message, stack: error.stack, usuario: req.user?.email });
        res.status(500).json({ error: 'Error al obtener los coches' });
    } finally {
        if (conn) conn.release();
    }
};

exports.deleteCoche = async (req, res) => {
    let conn;
    try {
        const { id_coche } = req.params;
        if (!id_coche) return res.status(400).json({ status: 'error', message: 'id_coche es requerido' });

        conn = await pool.getConnection();
        logger.info('Iniciando eliminación de coche', { id_coche, usuario: req.user.email });

        const [userRows] = await conn.query('SELECT id_usuario FROM usuarios WHERE email = ?', [req.user.email]);

        if (userRows.length === 0) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });

        const id_usuario = userRows[0].id_usuario;
        const [coche] = await conn.query('SELECT id_usuario FROM coches WHERE id_coche = ?', [id_coche]);

        if (coche.length === 0) return res.status(404).json({ status: 'error', message: 'Coche no encontrado' });
        if (coche[0].id_usuario !== id_usuario) return res.status(403).json({ status: 'error', message: 'No tienes permiso para eliminar este coche' });

        await conn.query('DELETE FROM coches WHERE id_coche = ?', [id_coche]);

        logger.info('Coche eliminado exitosamente', { id_coche, usuario_id: id_usuario });
        res.json({ status: 'success', message: 'Coche eliminado correctamente' });

    } catch (error) {
        logger.error('Error al eliminar coche', { error: error.message, stack: error.stack, id_coche: req.params.id_coche, usuario: req.user?.email });
        res.status(500).json({ status: 'error', message: 'Error en el servidor: ' + error.message });
    } finally {
        if (conn) conn.release();
    }
};

exports.getCombustiblesByCoche = async (req, res) => {
    let conn;
    try {
        const { id_coche } = req.params;
        if (!id_coche) return res.status(400).json({ status: 'error', message: 'id_coche es requerido' });

        conn = await pool.getConnection();
        logger.info('Iniciando busqueda de combustibles por coche', { id_coche, usuario: req.user.email });

        const [userRows] = await conn.query('SELECT id_usuario FROM usuarios WHERE email = ?', [req.user.email]);

        if (userRows.length === 0) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });

        const id_usuario = userRows[0].id_usuario;
        const [coche] = await conn.query('SELECT id_usuario FROM coches WHERE id_coche = ?', [id_coche]);

        if (coche.length === 0) return res.status(404).json({ status: 'error', message: 'Coche no encontrado' });

        const [combustibles] = await conn.query('SELECT combustible FROM coches WHERE id_coche = ?', [id_coche]);

        if (combustibles.length == 0 || combustibles.length == '') {
            logger.error('No se encontraron combustibles para el coche', { id_coche, usuario: req.user.email });
            return res.status(404).json({ status: 'error', message: 'No se encontraron combustibles para el coche' });
        }
        res.json(combustibles);
    } catch (error) {
        logger.error('Error al obtener combustibles', { error: error.message, stack: error.stack, usuario: req.user?.email });
        res.status(500).json({ error: 'Error al obtener los combustibles' });
    } finally {
        if (conn) conn.release();
    }
}
