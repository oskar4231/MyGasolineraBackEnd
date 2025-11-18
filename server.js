require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// REGISTER
app.post('/register', async (req, res) => {
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
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email y contraseña son requeridos' 
      });
    }

    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
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

// PROFILE
app.get('/profile', authenticateToken, async (req, res) => {
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

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MyGasolinera Backend running',
    database: 'MariaDB'
  });
});

// TEST DB
app.get('/api/test-db', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT VERSION() AS version');
    conn.release();

    res.json({ 
      message: '✅ Conexión a MariaDB exitosa',
      version: rows[0].version 
    });
  } catch (error) {
    res.status(500).json({ 
      error: '❌ Error conectando a MariaDB',
      details: error.message 
    });
  }
});

// usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT email, nombre FROM usuarios');
    conn.release();

    res.json({ 
      message: `✅ Tabla 'usuarios' encontrada`,
      total: rows.length,
      usuarios: rows 
    });
  } catch (error) {
    res.status(500).json({ 
      error: '❌ Error accediendo a la tabla usuarios',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Error iniciando servidor:', err);
    return;
  }
  console.log('=================================');
  console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Red: http://127.0.0.1:${PORT}`);
  console.log('=================================');
});
