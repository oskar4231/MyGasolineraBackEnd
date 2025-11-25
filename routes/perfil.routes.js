const express = require('express');
const router = express.Router();
const pool = require('../config/bbdd');
const authenticateToken = require('../middleware/auth');

// OBTENER PERFIL
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      'SELECT email, nombre FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
