require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
// CORS
app.use(cors({
  origin: true,
  credentials: true
}));
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
const estadisticasRoutes = require('./routes/estadisticas.routes');const gasolinerasRoutes = require('./routes/gasolineras.routes');
const SincronizadorGasolineras = require('./routes/sincronizarGasolineras');

// Montar rutas
app.use('/', authRoutes);
app.use('/', facturasRoutes);
app.use('/', cochesRoutes);
app.use('/api/perfil', profileRoutes); // ← MANTENER /api/perfil
app.use('/', estadisticasRoutes);
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