const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/bbdd');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../config/emailService');

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y contraseña son requeridos'
      });
    }

    const conn = await pool.getConnection();

    // Verificar si el usuario ya existe
    const [userExists] = await conn.query(
      'SELECT email FROM usuarios WHERE email = ?',
      [email]
    );

    if (userExists.length > 0) {
      conn.release();
      return res.status(409).json({
        status: 'error',
        message: 'El email ya está registrado'
      });
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    await conn.query(
      'INSERT INTO usuarios (email, contraseña, nombre) VALUES (?, ?, ?)',
      [email, passwordHash, nombre || '']
    );

    conn.release();

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      status: 'success',
      message: 'Usuario creado correctamente',
      user: { email, nombre: nombre || '' },
      token
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor: ' + error.message
    });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y contraseña son requeridos'
      });
    }

    const conn = await pool.getConnection();

    // Buscar por email O por nombre
    const [rows] = await conn.query(
      'SELECT * FROM usuarios WHERE email = ? OR nombre = ? AND activo = 1',
      [email, email]
    );

    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Email o contraseña incorrectos o cuenta inactiva'
      });
    }

    const user = rows[0];



    const validPassword = await bcrypt.compare(password, user.contraseña);
    if (!validPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Email o contraseña incorrectos'
      });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      status: 'success',
      message: 'Login exitoso',
      user: { email: user.email, nombre: user.nombre },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor: ' + error.message
    });
  }
});

// ==================== BORRAR / INACTIVAR USUARIO ====================
router.delete('/usuarios/:email', async (req, res) => {
  let conn;
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    conn = await pool.getConnection();

    const [result] = await conn.execute(
      'UPDATE usuarios SET activo = 0 WHERE email = ?',
      [email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario marcado como inactivo',
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error('Error en eliminar usuario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor: ' + error.message
    });
  }
});

// ==================== FORGOT PASSWORD ====================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email es requerido'
      });
    }

    const conn = await pool.getConnection();

    const [users] = await conn.query(
      'SELECT email FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      conn.release();
      return res.json({
        status: 'success',
        message: 'Si el email existe, recibirás un correo con instrucciones'
      });
    }

    const userEmail = users[0].email;

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await conn.query(
      'INSERT INTO token_reiniciar_contraseña (email, token, expires_at) VALUES (?, ?, ?)',
      [userEmail, token, expiresAt]
    );

    conn.release();

    await sendPasswordResetEmail(userEmail, token);

    res.json({
      status: 'success',
      message: 'Si el email existe, recibirás un correo con instrucciones'
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor: ' + error.message
    });
  }
});

// ==================== VERIFY TOKEN ====================
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token es requerido'
      });
    }

    const conn = await pool.getConnection();

    const [tokens] = await conn.query(
      'SELECT * FROM token_reiniciar_contraseña WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    conn.release();

    if (tokens.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Token inválido o expirado'
      });
    }

    res.json({
      status: 'success',
      message: 'Token válido',
      email: tokens[0].email
    });

  } catch (error) {
    console.error('Error en verify-token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor: ' + error.message
    });
  }
});

// ==================== RESET PASSWORD ====================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const conn = await pool.getConnection();

    const [tokens] = await conn.query(
      'SELECT * FROM token_reiniciar_contraseña WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      conn.release();
      return res.status(400).json({
        status: 'error',
        message: 'Token inválido o expirado'
      });
    }

    const email = tokens[0].email;

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await conn.query(
      'UPDATE usuarios SET contraseña = ? WHERE email = ?',
      [passwordHash, email]
    );

    await conn.query(
      'UPDATE token_reiniciar_contraseña SET used = TRUE WHERE token = ?',
      [token]
    );

    conn.release();

    res.json({
      status: 'success',
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor: ' + error.message
    });
  }
});

module.exports = router;
