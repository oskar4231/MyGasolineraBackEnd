require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL (usando tu configuración)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

// REGISTER - Crear nuevo usuario
app.post('/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT id FROM clientes WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'El email ya está registrado'
      });
    }

    // Hash de la contraseña (NO guardar en texto plano)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const result = await pool.query(
      'INSERT INTO clientes (email, contraseña, nombre) VALUES ($1, $2, $3) RETURNING id, email, nombre',
      [email, passwordHash, nombre || '']
    );

    console.log('Usuario registrado:', email);

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: result.rows[0].id, 
        email: result.rows[0].email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Usuario creado correctamente',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        nombre: result.rows[0].nombre
      },
      token
    });

  } catch (error) {
    console.error('Error en register:', error);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(409).json({
        status: 'error',
        message: 'El email ya está registrado'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor: ' + error.message
    });
  }
});

// LOGIN - Autenticar usuario
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email
    const result = await pool.query(
      'SELECT * FROM clientes WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('Login fallido - usuario no encontrado:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Email o contraseña incorrectos'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña (comparar hash)
    const validPassword = await bcrypt.compare(password, user.contraseña);

    if (!validPassword) {
      console.log('Login fallido - contraseña incorrecta:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Email o contraseña incorrectos'
      });
    }

    console.log('Login exitoso:', email);

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre
      },
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

// Ruta protegida - ejemplo de perfil de usuario
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, nombre FROM clientes WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Health check y rutas de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MyGasolinera Backend running',
    database: 'PostgreSQL'
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT version()');
    res.json({ 
      message: '✅ Conexión a PostgreSQL exitosa',
      version: result.rows[0].version 
    });
  } catch (error) {
    res.status(500).json({ 
      error: '❌ Error conectando a PostgreSQL',
      details: error.message 
    });
  }
});

app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, nombre FROM clientes');
    res.json({ 
      message: `✅ Tabla 'clientes' encontrada`,
      total: result.rows.length,
      clientes: result.rows 
    });
  } catch (error) {
    res.status(500).json({ 
      error: '❌ Error accediendo a la tabla clientes',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 MyGasolinera Backend Node.js');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('✅ Autenticación JWT habilitada');
  console.log('=================================');
});