require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const logger = require('./Backend/Logger/LoggerLogica/logger');
const loggerMiddleware = require('./Backend/Logger/LoggerLogica/Middleware/loggerMiddleware');
const errorHandler = require('./Backend/ManejoDeErrores/errorHandler');

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
// app.use(cors({
//   origin: true, // Permite todos los orígenes
//   credentials: true, // Permite cookies y credenciales
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos permitidos
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Headers permitidos
//   exposedHeaders: ['Content-Range', 'X-Content-Range'], // Headers expuestos al cliente
//   maxAge: 86400 // Cache de preflight por 24 horas
// }));

// Manejar explícitamente las peticiones OPTIONS (preflight)
// app.options('*', cors());
// Middleware
app.use(express.json());
app.use(loggerMiddleware);
app.use('/uploads', express.static(path.join(__dirname, 'Frontend', 'Imagenes', 'imagenes')));
// Servir archivos estáticos (imágenes subidas)
// i18n Middleware
const i18n = require('./Frontend/Idiomas/i18n');
app.use(i18n);

// Importar rutas
const authRoutes = require('./Frontend/Perfil/rutas/usuarios.rutas');
const facturasRoutes = require('./Frontend/Facturas/rutas/facturas.rutas');
const cochesRoutes = require('./Frontend/Coches/rutas/coches.rutas');
const profileRoutes = require('./Frontend/Perfil/rutas/perfil.rutas');
const estadisticasRoutes = require('./Frontend/Estadisticas/rutas/estadisticas.rutas');
const gasolinerasRoutes = require('./Frontend/Gasolineras/rutas/gasolineras.rutas');
// Montar rutas
app.use('/', authRoutes);
app.use('/', facturasRoutes);
app.use('/', cochesRoutes);
app.use('/api/perfil', profileRoutes); // ← MANTENER /api/perfil

// Endpoint para obtener la URL actual del backend - DESHABILITADO (gistService eliminado)
/*
app.get('/api/current-url', async (req, res) => {
  try {
    logger.info('Obteniendo URL actual del backend');
    // gistService eliminado - ya no existe
    const url = await gistService.getCurrentUrl();
    logger.info('URL obtenida exitosamente', { url });
    res.json({
      success: true,
      backend_url: url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error obteniendo URL del backend', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'No se pudo obtener la URL del backend',
      message: error.message
    });
  }
});
*/

app.use('/', estadisticasRoutes);
app.use('/', estadisticasRoutes);
app.use('/', gasolinerasRoutes);
const uploadRoutes = require('./Frontend/Imagenes/Logica/rutas/upload.rutas');
app.use('/api', uploadRoutes);

app.use((err, req, res, next) => {
  logger.error('Error no controlado', {
    mensaje: err.message,
    stack: err.stack,
    url: req.url,
    metodo: req.method
  });
  res.status(err.status || 500).json({
    success: false,
    error: err.message
  });
});

app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    logger.fatal('Error iniciando servidor', { error: err.message, stack: err.stack });
    return;
  }

  logger.info('Servidor iniciado correctamente', {
    puerto: PORT,
    entorno: process.env.NODE_ENV || 'development'
  });

  logger.info('=================================');
  logger.info('✅ SERVIDOR INICIADO CORRECTAMENTE');
  logger.info(`📍 Puerto: ${PORT}`);
  logger.info(`🌐 Local: http://localhost:${PORT}`);
  logger.info('=================================');
});