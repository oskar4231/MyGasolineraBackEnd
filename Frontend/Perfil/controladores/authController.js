const pool = require('../../../Importante/BaseDeDatos/bbdd');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../../../Backend/Emails/config/emailService');
const logger = require('../../../Backend/Logger/LoggerLogica/logger');
const QUERIES = require('../../../Importante/BaseDeDatos/queries');

exports.register = async (req, res) => {
    try {
        const { email, password, nombre } = req.body;

        if (!email || !password) {
            logger.warn('Intento de registro sin email o password', { email });
            return res.status(400).json({
                status: 'error',
                message: req.t('auth.email_password_required')
            });
        }

        const [userExists] = await pool.query(QUERIES.AUTH.CHECK_EMAIL_EXISTS, [email]);
        if (userExists.length > 0) {
            logger.warn('Intento de registro con email duplicado', { email });
            return res.status(409).json({
                status: 'error',
                message: req.t('auth.email_already_registered')
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        logger.trace('Ejecutando query INSERT usuario', { email });
        const [result] = await pool.query(QUERIES.AUTH.INSERT_USUARIO, [email, passwordHash, nombre || '']);

        const token = jwt.sign({ email, id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '24h' });

        logger.info('Usuario registrado exitosamente', { email, nombre, id_usuario: result.insertId });

        res.status(201).json({
            status: 'success',
            message: req.t('auth.user_created'),
            user: { email, nombre: nombre || '' },
            token
        });

    } catch (error) {
        logger.error('Error en registro de usuario', { error: error.message, stack: error.stack, email: req.body.email });
        res.status(500).json({
            status: 'error',
            message: req.t('general.server_error') + ': ' + error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        logger.debug('Intento de login', { email });

        if (!email || !password) {
            logger.warn('Login sin credenciales completas', { email });
            return res.status(400).json({
                status: 'error',
                message: req.t('auth.email_password_required')
            });
        }

        logger.trace('Buscando usuario en BD', { email });
        // Fix: paréntesis para correcta precedencia (email OR nombre) AND activo
        const [rows] = await pool.query(QUERIES.AUTH.LOGIN_BY_EMAIL_OR_NOMBRE, [email, email]);

        if (rows.length === 0) {
            logger.warn('Login fallido: usuario no encontrado o inactivo', { email });
            return res.status(401).json({
                status: 'error',
                message: req.t('auth.account_inactive')
            });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.contraseña);
        if (!validPassword) {
            logger.warn('Login fallido: contraseña incorrecta', { email, id_usuario: user.id_usuario });
            return res.status(401).json({
                status: 'error',
                message: req.t('auth.incorrect_credentials')
            });
        }

        if (user.activo === 0) {
            logger.warn('Login fallido: cuenta inactiva', { email, id_usuario: user.id_usuario });
            return res.status(401).json({
                status: 'error',
                message: req.t('auth.account_inactive')
            });
        }

        const token = jwt.sign({ email: user.email, id: user.id_usuario }, process.env.JWT_SECRET, { expiresIn: '24h' });
        logger.info('Login exitoso', { email: user.email, id_usuario: user.id_usuario, nombre: user.nombre });

        res.json({
            status: 'success',
            message: req.t('auth.login_successful'),
            user: { email: user.email, nombre: user.nombre },
            token
        });
    } catch (error) {
        logger.error('Error en login', { error: error.message, stack: error.stack, email: req.body.email });
        res.status(500).json({
            status: 'error',
            message: req.t('general.server_error') + ': ' + error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { email } = req.params;
        logger.info('Iniciando desactivación de usuario', { email });

        if (!email) {
            logger.warn('Intento de desactivar usuario sin identificador', {});
            return res.status(400).json({ success: false, message: req.t('auth.identifier_required') });
        }

        logger.trace('Ejecutando UPDATE para desactivar usuario', { email });
        const [result] = await pool.query(QUERIES.AUTH.DEACTIVATE_USER, [email, email]);

        if (result.affectedRows === 0) {
            logger.debug('No se encontró usuario activo para desactivar', { email });
            const [check] = await pool.query(QUERIES.AUTH.CHECK_USER_ACTIVE, [email, email]);
            if (check.length > 0 && check[0].activo === 0) {
                logger.info('Usuario ya estaba inactivo', { email, id_usuario: check[0].id_usuario });
                return res.json({ success: true, message: req.t('auth.user_already_inactive'), affectedRows: 0 });
            }
            logger.warn('Usuario no encontrado para desactivar', { email });
            return res.status(404).json({ success: false, message: req.t('auth.user_not_found') });
        }

        logger.info('Usuario desactivado correctamente', { email, affectedRows: result.affectedRows });
        res.json({ success: true, message: req.t('auth.user_deactivated'), affectedRows: result.affectedRows });

    } catch (error) {
        logger.error('Error al desactivar usuario', { error: error.message, stack: error.stack, email: req.params.email });
        res.status(500).json({ status: 'error', message: req.t('general.server_error') + ': ' + error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        logger.info('Solicitud de recuperación de contraseña', { email });

        if (!email) {
            logger.warn('Solicitud de recuperación sin email', {});
            return res.status(400).json({ status: 'error', message: req.t('auth.email_required') });
        }

        logger.trace('Buscando usuario para recuperación de contraseña', { email });
        const [users] = await pool.query(QUERIES.AUTH.CHECK_EMAIL_EXISTS, [email]);

        if (users.length === 0) {
            logger.warn('Solicitud de recuperación para email no registrado', { email });
            // Por seguridad, respondemos como si fuera exitoso
            return res.json({ status: 'success', message: req.t('auth.email_sent') });
        }

        const userEmail = users[0].email;
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        logger.trace('Generando token de recuperación', { email: userEmail });
        await pool.query(QUERIES.AUTH.INSERT_RESET_TOKEN, [userEmail, token, expiresAt]);

        logger.debug('Enviando email de recuperación', { email: userEmail });
        await sendPasswordResetEmail(userEmail, token);

        logger.info('Email de recuperación enviado exitosamente', { email: userEmail });
        res.json({ status: 'success', message: req.t('auth.email_sent') });

    } catch (error) {
        logger.error('Error en recuperación de contraseña', { error: error.message, stack: error.stack, email: req.body.email });
        res.status(500).json({ status: 'error', message: req.t('general.server_error') + ': ' + error.message });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const { token } = req.body;
        logger.debug('Verificando token de recuperación', {});

        if (!token) {
            logger.warn('Intento de verificación sin token', {});
            return res.status(400).json({ status: 'error', message: req.t('auth.token_required') });
        }

        logger.trace('Buscando token en BD', {});
        const [tokens] = await pool.query(QUERIES.AUTH.VERIFY_RESET_TOKEN, [token]);

        if (tokens.length === 0) {
            logger.warn('Token inválido o expirado', {});
            return res.status(400).json({ status: 'error', message: req.t('auth.token_invalid') });
        }

        logger.info('Token verificado exitosamente', { email: tokens[0].email });
        res.json({ status: 'success', message: req.t('auth.token_valid'), email: tokens[0].email });

    } catch (error) {
        logger.error('Error al verificar token', { error: error.message, stack: error.stack });
        res.status(500).json({ status: 'error', message: req.t('general.server_error') + ': ' + error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        logger.info('Iniciando reinicio de contraseña', {});

        if (!token || !newPassword) {
            logger.warn('Intento de reinicio sin token o contraseña', {});
            return res.status(400).json({ status: 'error', message: req.t('auth.token_password_required') });
        }

        if (newPassword.length < 6) {
            logger.warn('Contraseña demasiado corta en reinicio', {});
            return res.status(400).json({ status: 'error', message: req.t('auth.password_min_length') });
        }

        logger.trace('Verificando token para reinicio', {});
        const [tokens] = await pool.query(QUERIES.AUTH.VERIFY_RESET_TOKEN, [token]);

        if (tokens.length === 0) {
            logger.warn('Token inválido en reinicio de contraseña', {});
            return res.status(400).json({ status: 'error', message: req.t('auth.token_invalid') });
        }

        const email = tokens[0].email;
        const passwordHash = await bcrypt.hash(newPassword, 10);

        logger.trace('Actualizando contraseña en BD', { email });
        await pool.query(QUERIES.AUTH.UPDATE_PASSWORD, [passwordHash, email]);

        logger.trace('Marcando token como usado', {});
        await pool.query(QUERIES.AUTH.MARK_TOKEN_USED, [token]);

        logger.info('Contraseña actualizada exitosamente', { email });
        res.json({ status: 'success', message: req.t('auth.password_updated') });

    } catch (error) {
        logger.error('Error al reiniciar contraseña', { error: error.message, stack: error.stack });
        res.status(500).json({ status: 'error', message: req.t('general.server_error') + ': ' + error.message });
    }
};

exports.getProfileImage = async (req, res) => {
    try {
        let email = req.params.email;
        logger.debug('Buscando foto de perfil', { email });

        if (!email.includes('@')) {
            logger.trace('Resolviendo nombre de usuario a email', { nombre: email });
            const [userEmail] = await pool.query(QUERIES.AUTH.GET_EMAIL_BY_NOMBRE, [email]);

            if (userEmail.length === 0) {
                logger.warn('Usuario no encontrado por nombre', { nombre: email });
                return res.status(404).json({ status: 'error', message: req.t('auth.user_not_found') });
            }

            email = userEmail[0].email;
            logger.trace('Email resuelto', { email });
        }

        logger.trace('Consultando foto de perfil en BD', { email });
        const [imagen] = await pool.query(QUERIES.AUTH.GET_FOTO_PERFIL, [email]);

        if (imagen.length === 0) {
            logger.warn('Usuario no encontrado por email', { email });
            return res.status(404).json({ status: 'error', message: req.t('auth.user_not_found') });
        }

        logger.info('Foto de perfil obtenida', { email, tiene_foto: !!imagen[0].foto_perfil });
        res.json(imagen[0]);

    } catch (error) {
        logger.error('Error al obtener foto de perfil', { error: error.message, stack: error.stack, email: req.params.email });
        res.status(500).json({ status: 'error', error: req.t('profile.profile_image_error'), details: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { email } = req.params;
        logger.debug('Obteniendo perfil de usuario', { email });

        if (!email) {
            logger.warn('Solicitud de perfil sin email', {});
            return res.status(400).json({ success: false, message: req.t('auth.email_required') });
        }

        logger.trace('Consultando perfil en BD', { email });
        const [results] = await pool.query(QUERIES.AUTH.GET_PERFIL, [email, email]);

        if (results.length === 0) {
            logger.warn('Perfil de usuario no encontrado', { email });
            return res.status(404).json({ success: false, message: req.t('auth.user_not_found') });
        }

        const usuario = results[0];
        logger.info('Perfil de usuario obtenido exitosamente', { email: usuario.email, nombre: usuario.nombre });

        res.status(200).json({
            success: true,
            nombre: usuario.nombre || email.split('@')[0],
            email: usuario.email,
        });

    } catch (error) {
        logger.error('Error al obtener perfil de usuario', { error: error.message, stack: error.stack, email: req.params.email });
        res.status(500).json({ success: false, message: req.t('errors.server_error'), error: error.message });
    }
};
