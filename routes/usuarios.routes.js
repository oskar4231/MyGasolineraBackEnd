const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/bbdd');

// REGISTER
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
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar usuario
    await conn.query(
      'INSERT INTO usuarios (email, contraseña, nombre) VALUES (?, ?, ?)',
      [email, passwordHash, nombre || '']
    );

    conn.release();
    console.log('Usuario registrado:', email);

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

// LOGIN
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
      'SELECT * FROM usuarios WHERE email = ? OR nombre = ?',
      [email, email]
    );

    conn.release();

    if (rows.length === 0) {
      console.log('Login fallido - usuario no encontrado:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Email o contraseña incorrectos'
      });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.contraseña);

    if (!validPassword) {
      console.log('Login fallido - contraseña incorrecta:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Email o contraseña incorrectos'
      });
    }

    console.log('Login exitoso:', email);

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

router.delete('/usuarios/:email', async (req, res) => {
  let conn;
  try{
    const { email} = req.body;

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

  }catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor: ' + error.message
    });
  }
});

module.exports = router;
