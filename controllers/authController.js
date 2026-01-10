const pool = require('../config/bbdd');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../config/emailService');

exports.register = async (req, res) => {
    try {
        const { email, password, nombre } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email y contraseña son requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const [userExists] = await pool.query(
            'SELECT email FROM usuarios WHERE email = ?',
            [email]
        );

        if (userExists.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        const [result] = await pool.query(
            'INSERT INTO usuarios (email, contraseña, nombre) VALUES (?, ?, ?)',
            [email, passwordHash, nombre || '']
        );

        const token = jwt.sign({ email, id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '24h' });

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
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar por email O por nombre
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ? OR nombre = ? AND activo = 1',
            [email, email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Email o contraseña incorrectos o cuenta inactiva'
            });
        }

        const user = rows[0];

        const validPassword = await bcrypt.compare(password, user.contraseña);
        if (!validPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Email o contraseña incorrectos'
            });
        }

        const token = jwt.sign({ email: user.email, id: user.id_usuario }, process.env.JWT_SECRET, { expiresIn: '24h' });

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
};

exports.deleteUser = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const [result] = await pool.query(
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

    } catch (error) {
        console.error('Error en eliminar usuario:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor: ' + error.message
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email es requerido'
            });
        }

        const [users] = await pool.query(
            'SELECT email FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.json({
                status: 'success',
                message: 'Si el email existe, recibirás un correo con instrucciones'
            });
        }

        const userEmail = users[0].email;

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            'INSERT INTO token_reiniciar_contraseña (email, token, expires_at) VALUES (?, ?, ?)',
            [userEmail, token, expiresAt]
        );

        await sendPasswordResetEmail(userEmail, token);

        res.json({
            status: 'success',
            message: 'Si el email existe, recibirás un correo con instrucciones'
        });

    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor: ' + error.message
        });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                status: 'error',
                message: 'Token es requerido'
            });
        }

        const [tokens] = await pool.query(
            'SELECT * FROM token_reiniciar_contraseña WHERE token = ? AND used = FALSE AND expires_at > NOW()',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Token inválido o expirado'
            });
        }

        res.json({
            status: 'success',
            message: 'Token válido',
            email: tokens[0].email
        });

    } catch (error) {
        console.error('Error en verify-token:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor: ' + error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Token y nueva contraseña son requeridos'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const [tokens] = await pool.query(
            'SELECT * FROM token_reiniciar_contraseña WHERE token = ? AND used = FALSE AND expires_at > NOW()',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Token inválido o expirado'
            });
        }

        const email = tokens[0].email;

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE usuarios SET contraseña = ? WHERE email = ?',
            [passwordHash, email]
        );

        await pool.query(
            'UPDATE token_reiniciar_contraseña SET used = TRUE WHERE token = ?',
            [token]
        );

        res.json({
            status: 'success',
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor: ' + error.message
        });
    }
};

exports.getProfileImage = async (req, res) => {
    try {
        // Obtener el email del parámetro de la URL
        let email = req.params.email;
        console.log('🔍 Buscando foto de perfil para email:', email);

        // Si no contiene '@', asumimos que es un nombre de usuario
        if (!email.includes('@')) {
            console.log('🔍 Nombre de usuario proporcionado, buscando email...');
            const [userEmail] = await pool.query(
                'SELECT email FROM usuarios WHERE nombre = ?',
                [email]
            );

            if (userEmail.length === 0) {
                console.log('❌ Usuario no encontrado con nombre:', email);
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuario no encontrado'
                });
            }

            email = userEmail[0].email;
            console.log('🔍 Email resuelto a:', email);
        }

        // Buscar la foto de perfil directamente por email
        const [imagen] = await pool.query(
            'SELECT foto_perfil FROM usuarios WHERE email = ?',
            [email]
        );

        // Verificar si se encontró el usuario
        if (imagen.length === 0) {
            console.log('❌ Usuario no encontrado con email:', email);
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Log de éxito
        const fotoPerfil = imagen[0].foto_perfil;
        console.log('✅ Foto de perfil encontrada:', fotoPerfil ? 'Sí' : 'NULL');

        // Retornar la imagen
        res.json(imagen[0]);

    } catch (error) {
        console.error('❌ Error en /cargarImagen:', error);
        res.status(500).json({
            status: 'error',
            error: 'Error al obtener la imagen de perfil',
            details: error.message
        });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { email } = req.params;

        console.log('🔍 Obteniendo perfil del usuario:', email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const [results] = await pool.query(
            'SELECT nombre, email FROM usuarios WHERE email = ? AND activo = 1',
            [email]
        );

        if (results.length === 0) {
            console.log('⚠️ Usuario no encontrado:', email);
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const usuario = results[0];
        console.log('✅ Usuario encontrado:', usuario.nombre);

        res.status(200).json({
            success: true,
            nombre: usuario.nombre || email.split('@')[0],
            email: usuario.email,
        });

    } catch (error) {
        console.error('❌ Error en /usuarios/perfil/:email:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
};
