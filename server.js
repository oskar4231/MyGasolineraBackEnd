require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

// DEBUG: Logging de todas las peticiones
app.use((req, res, next) => {
  console.log('------------------------------------------------');
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// CORS Manual - Añadir headers CORS manualmente ANTES del middleware cors()
// Esto asegura que los headers estén presentes incluso a través de Cloudflare Tunnel
app.use((req, res, next) => {
  // 1. Permitir el origen de la petición (o '*' si no hay origin)
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // 2. Permitir todos los métodos
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  // 3. Permitir headers dinámicos (echo de lo que pide el cliente)
  // Esto es crucial porque Flutter web manda headers específicos que a veces no están en la lista estática
  const requestHeaders = req.headers['access-control-request-headers'];
  if (requestHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestHeaders);
  } else {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  }

  // 4. Credenciales y Max Age
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Si es una petición OPTIONS (preflight), responder inmediatamente con 200 OK
  // y evitar que pase al siguiente middleware o a cors()
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// CORS - Configuración completa para manejar preflight requests
app.use(cors({
  origin: true, // Permite todos los orígenes
  credentials: true, // Permite cookies y credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Headers permitidos
  exposedHeaders: ['Content-Range', 'X-Content-Range'], // Headers expuestos al cliente
  maxAge: 86400 // Cache de preflight por 24 horas
}));

// Manejar explícitamente las peticiones OPTIONS (preflight)
app.options('*', cors());
// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Servir archivos estáticos (imágenes subidas)
// i18n Middleware
const i18n = require('./middleware/i18n');
app.use(i18n);

// Importar rutas
const authRoutes = require('./routes/usuarios.routes');
const facturasRoutes = require('./routes/facturas.routes');
const cochesRoutes = require('./routes/coches.routes');
const profileRoutes = require('./routes/perfil.routes'); // ← Volver a .routes
const estadisticasRoutes = require('./routes/estadisticas.routes');
const gasolinerasRoutes = require('./routes/gasolineras.routes');
// Montar rutas
app.use('/', authRoutes);
app.use('/', facturasRoutes);
app.use('/', cochesRoutes);
app.use('/api/perfil', profileRoutes); // ← MANTENER /api/perfil

// Endpoint para obtener la URL actual del backend
app.get('/api/current-url', async (req, res) => {
  try {
    const gistService = require('./services/gistService');
    const url = await gistService.getCurrentUrl();
    res.json({
      success: true,
      backend_url: url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'No se pudo obtener la URL del backend',
      message: error.message
    });
  }
});

app.use('/', estadisticasRoutes);
app.use('/', gasolinerasRoutes);
// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Error iniciando servidor:', err);
    return;
  }
  // Mensaje de inicio
  console.log('=================================');
  console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Red: http://127.0.0.1:${PORT}`);
  console.log('=================================');
});