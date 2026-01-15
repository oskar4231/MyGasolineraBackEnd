const logger = require('../logger/logger');
const errorHandler = (err, req, res, next) => {
    // Registrar el error con toda la información relevante
    logger.error('Error no controlado', {
        mensaje: err.message,
        stack: err.stack,
        url: req.url,
        metodo: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        usuario_id: req.usuario?.id || 'anónimo',
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    // Determinar el código de estado
    const statusCode = err.status || err.statusCode || 500;
    // Responder al cliente
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Error interno del servidor',
        // Solo incluir stack trace en desarrollo
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
module.exports = errorHandler;