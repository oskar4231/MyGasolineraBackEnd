const pool = require('../../../Importante/BaseDeDatos/bbdd');
const fs = require('fs');
const path = require('path');
const logger = require('../logger/logger');

exports.getFacturas = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const id_usuario = req.user.id;

        logger.debug('Obteniendo facturas', { usuario_id: id_usuario, page, limit });

        // Caso 1: Sin paginación (comportamiento original)
        if (!page || !limit) {
            const [facturas] = await pool.query(
                'SELECT id_factura, titulo, coste, fecha, hora, descripcion, imagenPath FROM facturas WHERE id_usuario = ? ORDER BY fecha DESC, hora DESC',
                [id_usuario]
            );
            return res.json({
                data: facturas,
                totalItems: facturas.length,
                totalPages: 1,
                currentPage: 1
            });
        }

        // Caso 2: Con Paginación
        const limitInt = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitInt;

        // Obtener total
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM facturas WHERE id_usuario = ?',
            [id_usuario]
        );
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limitInt);

        // Obtener datos paginados
        const [facturas] = await pool.query(
            'SELECT id_factura, titulo, coste, fecha, hora, descripcion, imagenPath FROM facturas WHERE id_usuario = ? ORDER BY fecha DESC, hora DESC LIMIT ? OFFSET ?',
            [id_usuario, limitInt, offset]
        );

        logger.info('Facturas paginadas obtenidas', {
            usuario_id: id_usuario,
            cantidad: facturas.length,
            page,
            totalItems
        });

        res.json({
            data: facturas,
            totalItems,
            totalPages,
            currentPage: parseInt(page)
        });

    } catch (error) {
        logger.error('Error al obtener facturas', {
            error: error.message,
            stack: error.stack,
            usuario_id: req.user.id
        });
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener las facturas: ' + error.message
        });
    }
};

exports.createFactura = async (req, res) => {
    try {
        const { titulo, coste, fecha, hora, descripcion,
            litros_repostados,      // NUEVO - Para calcular consumo
            precio_por_litro,       // NUEVO - Para análisis de precios
            kilometraje_actual,     // NUEVO - Para calcular distancia
            tipo_combustible,       // NUEVO - Para filtrar por tipo
            id_coche } = req.body;
        const userEmail = req.user.email;
        const imagenPath = req.file ? req.file.path : null;

        logger.info('Iniciando creación de factura', {
            usuario_id: req.user.id,
            email: userEmail,
            titulo,
            coste,
            tiene_imagen: !!req.file
        });

        logger.debug('Datos de factura recibidos', {
            titulo, coste, fecha, hora,
            litros_repostados, precio_por_litro,
            kilometraje_actual, tipo_combustible,
            id_coche
        });

        if (!titulo || coste === undefined || coste === null || !fecha || !hora) {
            logger.warn('Validación fallida al crear factura - datos faltantes', {
                usuario_id: req.user.id,
                datos_recibidos: { titulo, coste, fecha, hora }
            });

            // Si hay un archivo subido pero la validación falla, eliminarlo
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) logger.error('Error eliminando archivo tras validación fallida', {
                        error: err.message,
                        path: req.file.path
                    });
                });
            }
            return res.status(400).json({
                status: 'error',
                message: 'Título, costo total, fecha y hora son requeridos',
                received: { titulo, coste, fecha, hora }
            });
        }

        // Intentar insertar con imagenPath
        let result;
        try {
            logger.trace('Ejecutando INSERT de factura en BD', {
                usuario_id: req.user.id,
                titulo
            });

            [result] = await pool.query(
                'INSERT INTO facturas (id_usuario, titulo, coste, fecha, hora, descripcion, imagenPath, litros_repostados, precio_por_litro, kilometraje_actual, tipo_combustible, id_coche) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [req.user.id, titulo, coste, fecha, hora, descripcion || '', imagenPath, litros_repostados || null, precio_por_litro || null, kilometraje_actual || null, tipo_combustible || null, id_coche || null]
            );

        } catch (error) {
            logger.error('Error insertando factura en BD', {
                error: error.message,
                stack: error.stack,
                usuario_id: req.user.id,
                titulo
            });
            throw error;
        }

        logger.info('Factura creada exitosamente', {
            id_factura: result.insertId,
            usuario_id: req.user.id,
            titulo,
            coste,
            tiene_imagen: !!imagenPath
        });

        res.status(201).json({
            status: 'success',
            message: 'Factura creada correctamente',
            facturaId: result.insertId,
            imagenPath: imagenPath
        });

    } catch (error) {
        logger.error('Error en creación de factura', {
            error: error.message,
            stack: error.stack,
            usuario_id: req.user.id,
            titulo: req.body.titulo
        });

        // Eliminar archivo si hubo error en el servidor
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) logger.error('Error eliminando archivo tras error en servidor', {
                    error: err.message,
                    path: req.file.path
                });
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor: ' + error.message
        });
    }
};

exports.deleteFactura = async (req, res) => {
    try {
        const { id_factura } = req.params;

        logger.info('Iniciando eliminación de factura', {
            id_factura,
            usuario_id: req.user.id,
            email: req.user.email
        });

        if (!id_factura) {
            logger.warn('Intento de eliminar factura sin ID', { usuario_id: req.user.id });
            return res.status(400).json({
                status: 'error',
                message: 'id_factura es requerido'
            });
        }

        // Verificar que la factura existe y pertenece al usuario
        logger.trace('Verificando existencia y permisos de factura', { id_factura });
        const [factura] = await pool.query(
            'SELECT id_usuario, imagenPath FROM facturas WHERE id_factura = ?',
            [id_factura]
        );

        if (factura.length === 0) {
            logger.warn('Intento de eliminar factura inexistente', {
                id_factura,
                usuario_id: req.user.id
            });
            return res.status(404).json({
                status: 'error',
                message: 'Factura no encontrada'
            });
        }

        if (factura[0].id_usuario !== req.user.id) {
            logger.warn('Intento de eliminar factura sin permisos', {
                id_factura,
                usuario_solicitante: req.user.id,
                usuario_propietario: factura[0].id_usuario
            });
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permiso para eliminar esta factura'
            });
        }

        // Obtener la ruta de la imagen antes de eliminar
        let imagenPath = factura[0].imagenPath;

        // Eliminar la factura
        logger.trace('Ejecutando DELETE de factura en BD', { id_factura });
        await pool.query(
            'DELETE FROM facturas WHERE id_factura = ?',
            [id_factura]
        );

        // Eliminar el archivo de imagen si existe
        if (imagenPath && fs.existsSync(imagenPath)) {
            fs.unlink(imagenPath, (err) => {
                if (err) {
                    logger.error('Error eliminando archivo de imagen', {
                        error: err.message,
                        path: imagenPath,
                        id_factura
                    });
                } else {
                    logger.debug('Archivo de imagen eliminado', {
                        path: imagenPath,
                        id_factura
                    });
                }
            });
        }

        logger.info('Factura eliminada exitosamente', {
            id_factura,
            usuario_id: req.user.id,
            tenia_imagen: !!imagenPath
        });

        res.json({
            status: 'success',
            message: 'Factura eliminada correctamente'
        });

    } catch (error) {
        logger.error('Error al eliminar factura', {
            error: error.message,
            stack: error.stack,
            id_factura: req.params.id_factura,
            usuario_id: req.user.id
        });
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor: ' + error.message
        });
    }
};
