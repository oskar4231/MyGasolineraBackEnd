const express = require('express');
const router = express.Router();
const pool = require('../config/bbdd');
const authenticateToken = require('../middleware/auth');

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

    // Intentar obtener facturas con imagenPath, si falla usar schema original
    let facturas;
    try {
      [facturas] = await conn.query(
        'SELECT id_factura, titulo, coste, fecha, hora, descripcion, imagenPath FROM facturas WHERE id_usuario = ? ORDER BY fecha DESC, hora DESC',
        [id_usuario]
      );
    } catch (error) {
      // Si imagenPath no existe, usar schema original
      console.log('Usando schema sin imagenPath');
      [facturas] = await conn.query(
        'SELECT id_factura, titulo, coste, fecha, hora, descripcion FROM facturas WHERE id_usuario = ? ORDER BY fecha DESC, hora DESC',
        [id_usuario]
      );
    }

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
router.post('/facturas', authenticateToken, async (req, res) => {
  let conn;
  try {
    const { titulo, coste, fecha, hora, descripcion, imagenPath } = req.body;
    const userEmail = req.user.email;

    // Log de los datos recibidos para debugging
    console.log('POST /facturas recibida para:', userEmail);
    console.log('Datos recibidos:', { titulo, coste, fecha, hora, descripcion, imagenPath });

    if (!titulo || coste === undefined || coste === null || !fecha || !hora) {
      console.log('Validación fallida - datos faltantes');
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
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    const id_usuario = userRows[0].id_usuario;

    // Intentar insertar con imagenPath, si falla usar schema original
    let result;
    try {
      [result] = await conn.query(
        'INSERT INTO facturas (id_usuario, titulo, coste, fecha, hora, descripcion, imagenPath) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_usuario, titulo, coste, fecha, hora, descripcion || '', imagenPath || null]
      );
    } catch (error) {
      // Si imagenPath no existe en la tabla, usar schema original
      console.log('Insertando sin imagenPath (schema original)');
      [result] = await conn.query(
        'INSERT INTO facturas (id_usuario, titulo, coste, fecha, hora, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
        [id_usuario, titulo, coste, fecha, hora, descripcion || '']
      );
    }

    console.log('Factura creada:', { 
      id: result.insertId, 
      id_usuario, 
      titulo 
    });

    res.status(201).json({
      status: 'success',
      message: 'Factura creada correctamente',
      facturaId: result.insertId
    });

  } catch (error) {
    console.error('Error en POST /facturas:', error);
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

    // Eliminar la factura
    await conn.query(
      'DELETE FROM facturas WHERE id_factura = ?',
      [id_factura]
    );

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
