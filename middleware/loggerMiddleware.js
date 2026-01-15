const logger = require('../logger/logger');
const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  // 1. Registrar petición entrante
  logger.info('Petición entrante', {
    metodo: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    // Registrar body solo si no contiene datos sensibles
    body: sanitizeBody(req.body)
  });
  // 2. Capturar la respuesta original
  const originalJson = res.json;
  const originalSend = res.send;
  // 3. Interceptar res.json()
  res.json = function (data) {
    logResponse(req, res, start, data);
    return originalJson.call(this, data);
  };
  // 4. Interceptar res.send() (para respuestas que no usan json)
  res.send = function (data) {
    logResponse(req, res, start, data);
    return originalSend.call(this, data);
  };
  next();
};
// Función auxiliar para registrar respuestas
function logResponse(req, res, start, data) {
  const duration = Date.now() - start;
  const statusCode = res.statusCode;

  const logData = {
    metodo: req.method,
    url: req.url,
    status: statusCode,
    duracion_ms: duration,
    usuario_id: req.usuario?.id || 'anónimo',
    ip: req.ip
  };
  // Usar diferentes niveles según el status code
  if (statusCode >= 500) {
    logger.error('Error del servidor', { ...logData, respuesta: data });
  } else if (statusCode >= 400) {
    logger.warn('Error del cliente', logData);
  } else {
    logger.info('Respuesta exitosa', logData);
  }
}
// Función para sanitizar datos sensibles del body
function sanitizeBody(body) {
  if (!body) return {};

  const sanitized = { ...body };

  // Eliminar campos sensibles
  const sensibleFields = ['password', 'contraseña', 'token', 'newPassword'];
  sensibleFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
}
module.exports = loggerMiddleware;