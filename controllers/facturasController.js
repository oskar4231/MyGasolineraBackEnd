const pool = require('../config/bbdd');
const fs = require('fs');
const path = require('path');

exports.getFacturas = async (req, res) => {
    try {
        // Intentar obtener facturas con imagenPath
        const [facturas] = await pool.query(
            'SELECT id_factura, titulo, coste, fecha, hora, descripcion, imagenPath FROM facturas WHERE id_usuario = ? ORDER BY fecha DESC, hora DESC',
            [req.user.id]
        );

        res.json(facturas);

    } catch (error) {
        console.error('Error en /facturas:', error);
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

        // Log de los datos recibidos para debugging
        console.log('POST /facturas recibida para:', userEmail);
        console.log('Datos recibidos:', { titulo, coste, fecha, hora, descripcion });
        console.log('Imagen subida:', req.file ? req.file.filename : 'No se subió imagen');

        if (!titulo || coste === undefined || coste === null || !fecha || !hora) {
            console.log('Validación fallida - datos faltantes');
            // Si hay un archivo subido pero la validación falla, eliminarlo
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error eliminando archivo:', err);
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
            [result] = await pool.query(
                'INSERT INTO facturas (id_usuario, titulo, coste, fecha, hora, descripcion, imagenPath, litros_repostados, precio_por_litro, kilometraje_actual, tipo_combustible, id_coche) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [req.user.id, titulo, coste, fecha, hora, descripcion || '', imagenPath, litros_repostados || null, precio_por_litro || null, kilometraje_actual || null, tipo_combustible || null, id_coche || null]
            );

        } catch (error) {
            console.error('Error insertando factura:', error);
            throw error;
        }

        console.log('Factura creada:', {
            id: result.insertId,
            id_usuario: req.user.id,
            titulo,
            imagenPath: imagenPath
        });

        res.status(201).json({
            status: 'success',
            message: 'Factura creada correctamente',
            facturaId: result.insertId,
            imagenPath: imagenPath
        });

    } catch (error) {
        console.error('Error en POST /facturas:', error);
        // Eliminar archivo si hubo error en el servidor
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error eliminando archivo:', err);
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

        if (!id_factura) {
            return res.status(400).json({
                status: 'error',
                message: 'id_factura es requerido'
            });
        }

        console.log('DELETE /facturas recibida para:', req.user.email);

        // Verificar que la factura existe y pertenece al usuario
        const [factura] = await pool.query(
            'SELECT id_usuario, imagenPath FROM facturas WHERE id_factura = ?',
            [id_factura]
        );

        if (factura.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Factura no encontrada'
            });
        }

        if (factura[0].id_usuario !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permiso para eliminar esta factura'
            });
        }

        // Obtener la ruta de la imagen antes de eliminar
        let imagenPath = factura[0].imagenPath;

        // Eliminar la factura
        await pool.query(
            'DELETE FROM facturas WHERE id_factura = ?',
            [id_factura]
        );

        // Eliminar el archivo de imagen si existe
        if (imagenPath && fs.existsSync(imagenPath)) {
            fs.unlink(imagenPath, (err) => {
                if (err) {
                    console.error('Error eliminando archivo de imagen:', err);
                } else {
                    console.log('Archivo de imagen eliminado:', imagenPath);
                }
            });
        }

        console.log('Factura eliminada:', { id_factura, id_usuario: req.user.id });

        res.json({
            status: 'success',
            message: 'Factura eliminada correctamente'
        });

    } catch (error) {
        console.error('Error en DELETE /facturas:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor: ' + error.message
        });
    }
};
