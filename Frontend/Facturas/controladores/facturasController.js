const pool = require('../../../Importante/BaseDeDatos/bbdd');
const path = require('path');
const fs = require('fs');
const logger = require('../../../Backend/Logger/LoggerLogica/logger');
const QUERIES = require('../../../Importante/BaseDeDatos/queries');

// Helper: Transformar ruta absoluta de Windows a ruta relativa URL
function transformToRelativePath(imagenPath) {
    if (!imagenPath) return null;

    if (imagenPath.startsWith('uploads/')) {
        return imagenPath;
    }

    const normalizedPath = imagenPath.replace(/\\/g, '/');
    const parts = normalizedPath.split('imagenes/');
    if (parts.length > 1 && parts[1]) {
        return `uploads/${parts[1]}`;
    }

    logger.warn('No se pudo transformar imagenPath a formato relativo', { imagenPath });
    return null;
}

exports.getFacturas = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const id_usuario = req.user.id;
        logger.debug('Obteniendo facturas', { usuario_id: id_usuario, page, limit });

        // Caso 1: Sin paginación
        if (!page || !limit) {
            const [facturas] = await pool.query(QUERIES.FACTURAS.GET_ALL, [id_usuario]);
            const facturasTransformadas = facturas.map(f => ({
                ...f,
                imagenPath: f.imagenPath ? transformToRelativePath(f.imagenPath) : null
            }));
            return res.json({
                data: facturasTransformadas,
                totalItems: facturasTransformadas.length,
                totalPages: 1,
                currentPage: 1
            });
        }

        // Caso 2: Con paginación
        const limitInt = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitInt;

        const [countResult] = await pool.query(QUERIES.FACTURAS.GET_COUNT, [id_usuario]);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limitInt);

        const [facturas] = await pool.query(QUERIES.FACTURAS.GET_PAGINATED, [id_usuario, limitInt, offset]);
        const facturasTransformadas = facturas.map(f => ({
            ...f,
            imagenPath: f.imagenPath ? transformToRelativePath(f.imagenPath) : null
        }));

        logger.info('Facturas paginadas obtenidas', { usuario_id: id_usuario, cantidad: facturasTransformadas.length, page, totalItems });

        res.json({ data: facturasTransformadas, totalItems, totalPages, currentPage: parseInt(page) });

    } catch (error) {
        logger.error('Error al obtener facturas', { error: error.message, stack: error.stack, usuario_id: req.user.id });
        res.status(500).json({ status: 'error', message: 'Error al obtener las facturas: ' + error.message });
    }
};

exports.createFactura = async (req, res) => {
    try {
        const {
            titulo, coste, fecha, hora, descripcion,
            litros_repostados, precio_por_litro, kilometraje_actual,
            tipo_combustible, id_coche
        } = req.body;
        const userEmail = req.user.email;

        let imagenPath = null;
        if (req.file) {
            const relativePath = req.file.path.replace(/\\/g, '/').split('imagenes/')[1];
            imagenPath = relativePath ? `uploads/${relativePath}` : null;
        }

        logger.info('Iniciando creación de factura', { usuario_id: req.user.id, email: userEmail, titulo, coste, tiene_imagen: !!req.file });
        logger.debug('Datos de factura recibidos', { titulo, coste, fecha, hora, litros_repostados, precio_por_litro, kilometraje_actual, tipo_combustible, id_coche });

        if (!titulo || coste === undefined || coste === null || !fecha || !hora) {
            logger.warn('Validación fallida al crear factura - datos faltantes', { usuario_id: req.user.id, datos_recibidos: { titulo, coste, fecha, hora } });
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) logger.error('Error eliminando archivo tras validación fallida', { error: err.message, path: req.file.path });
                });
            }
            return res.status(400).json({ status: 'error', message: 'Título, costo total, fecha y hora son requeridos', received: { titulo, coste, fecha, hora } });
        }

        let result;
        try {
            logger.trace('Ejecutando INSERT de factura en BD', { usuario_id: req.user.id, titulo });
            [result] = await pool.query(QUERIES.FACTURAS.INSERT, [
                req.user.id, titulo, coste, fecha, hora, descripcion || '', imagenPath,
                litros_repostados || null, precio_por_litro || null, kilometraje_actual || null,
                tipo_combustible || null, id_coche || null
            ]);
        } catch (error) {
            logger.error('Error insertando factura en BD', { error: error.message, stack: error.stack, usuario_id: req.user.id, titulo });
            throw error;
        }

        logger.info('Factura creada exitosamente', { id_factura: result.insertId, usuario_id: req.user.id, titulo, coste, tiene_imagen: !!imagenPath });
        res.status(201).json({ status: 'success', message: 'Factura creada correctamente', facturaId: result.insertId, imagenPath });

    } catch (error) {
        logger.error('Error en creación de factura', { error: error.message, stack: error.stack, usuario_id: req.user.id, titulo: req.body.titulo });
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) logger.error('Error eliminando archivo tras error en servidor', { error: err.message, path: req.file.path });
            });
        }
        res.status(500).json({ status: 'error', message: 'Error en el servidor: ' + error.message });
    }
};

exports.deleteFactura = async (req, res) => {
    try {
        const { id_factura } = req.params;
        logger.info('Iniciando eliminación de factura', { id_factura, usuario_id: req.user.id, email: req.user.email });

        if (!id_factura) {
            logger.warn('Intento de eliminar factura sin ID', { usuario_id: req.user.id });
            return res.status(400).json({ status: 'error', message: 'id_factura es requerido' });
        }

        logger.trace('Verificando existencia y permisos de factura', { id_factura });
        const [factura] = await pool.query(QUERIES.FACTURAS.GET_OWNER_AND_PATH, [id_factura]);

        if (factura.length === 0) {
            logger.warn('Intento de eliminar factura inexistente', { id_factura, usuario_id: req.user.id });
            return res.status(404).json({ status: 'error', message: 'Factura no encontrada' });
        }

        if (factura[0].id_usuario !== req.user.id) {
            logger.warn('Intento de eliminar factura sin permisos', { id_factura, usuario_solicitante: req.user.id, usuario_propietario: factura[0].id_usuario });
            return res.status(403).json({ status: 'error', message: 'No tienes permiso para eliminar esta factura' });
        }

        const imagenPath = factura[0].imagenPath;

        logger.trace('Ejecutando DELETE de factura en BD', { id_factura });
        await pool.query(QUERIES.FACTURAS.DELETE, [id_factura]);

        if (imagenPath && fs.existsSync(imagenPath)) {
            fs.unlink(imagenPath, (err) => {
                if (err) {
                    logger.error('Error eliminando archivo de imagen', { error: err.message, path: imagenPath, id_factura });
                } else {
                    logger.debug('Archivo de imagen eliminado', { path: imagenPath, id_factura });
                }
            });
        }

        logger.info('Factura eliminada exitosamente', { id_factura, usuario_id: req.user.id, tenia_imagen: !!imagenPath });
        res.json({ status: 'success', message: 'Factura eliminada correctamente' });

    } catch (error) {
        logger.error('Error al eliminar factura', { error: error.message, stack: error.stack, id_factura: req.params.id_factura, usuario_id: req.user.id });
        res.status(500).json({ status: 'error', message: 'Error en el servidor: ' + error.message });
    }
};
