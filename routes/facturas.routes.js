const express = require('express');
const router = express.Router();
const pool = require('../config/bbdd');
const authenticateToken = require('../middleware/auth');
const upload = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');

// OBTENER FACTURAS
router.get('/facturas', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    const id_usuario = userRows[0].id_usuario;

    // Intentar obtener facturas con imagenPath
    const [facturas] = await conn.query(
      'SELECT id_factura, titulo, coste, fecha, hora, descripcion, imagenPath FROM facturas WHERE id_usuario = ? ORDER BY fecha DESC, hora DESC',
      [id_usuario]
    );

    res.json(facturas);

  } catch (error) {
    console.error('Error en /facturas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener las facturas: ' + error.message
    });
  } finally {
    if (conn) conn.release();
  }
});

// CREAR NUEVA FACTURA
router.post('/facturas', authenticateToken, upload.single('imagen'), async (req, res) => {
  let conn;
  try {
    const { titulo, coste, fecha, hora, descripcion } = req.body;
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

    conn = await pool.getConnection();

    // Obtener el ID del usuario actual
    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [userEmail]
    );

    if (userRows.length === 0) {
      // Eliminar archivo si el usuario no existe
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error eliminando archivo:', err);
        });
      }
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    const id_usuario = userRows[0].id_usuario;

    // Intentar insertar con imagenPath
    let result;
    try {
      [result] = await conn.query(
        'INSERT INTO facturas (id_usuario, titulo, coste, fecha, hora, descripcion, imagenPath) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_usuario, titulo, coste, fecha, hora, descripcion || '', imagenPath]
      );
    } catch (error) {
        console.error('Error insertando factura:', error);
        throw error;
    }

    console.log('Factura creada:', { 
      id: result.insertId, 
      id_usuario, 
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
  } finally {
    if (conn) conn.release();
  }
});

// ELIMINAR FACTURA
router.delete('/facturas/:id_factura', authenticateToken, async (req, res) => {
  let conn;
  try {
    const { id_factura } = req.params;

    if (!id_factura) {
      return res.status(400).json({
        status: 'error',
        message: 'id_factura es requerido'
      });
    }

    conn = await pool.getConnection();

    console.log('DELETE /facturas recibida para:', req.user.email);

    const [userRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    const id_usuario = userRows[0].id_usuario;

    // Verificar que la factura existe y pertenece al usuario
    const [factura] = await conn.query(
      'SELECT id_usuario FROM facturas WHERE id_factura = ?',
      [id_factura]
    );

    if (factura.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Factura no encontrada'
      });
    }

    if (factura[0].id_usuario !== id_usuario) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para eliminar esta factura'
      });
    }

    // Obtener la ruta de la imagen antes de eliminar
    let imagenPath = null;
    try {
      const [facturaData] = await conn.query(
        'SELECT imagenPath FROM facturas WHERE id_factura = ?',
        [id_factura]
      );
      if (facturaData.length > 0 && facturaData[0].imagenPath) {
        imagenPath = facturaData[0].imagenPath;
      }
    } catch (error) {
      console.log('No se pudo obtener imagenPath', error);
    }

    // Eliminar la factura
    await conn.query(
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

    console.log('Factura eliminada:', { id_factura, id_usuario });

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
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
