const pool = require('../../../Importante/BaseDeDatos/bbdd');
const path = require('path');
const fs = require('fs');
const logger = require('../logger/logger');

exports.getProfile = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();

        const [rows] = await conn.query(
            'SELECT email, nombre, apellido, telefono, foto_perfil FROM usuarios WHERE email = ?',
            [req.user.email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: req.t('profile.user_not_found') });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        logger.error('Error obteniendo perfil:', { error: error.message });
        res.status(500).json({ error: req.t('errors.server_error') });
    } finally {
        if (conn) conn.release();
    }
};

exports.uploadPhoto = async (req, res) => {
    let conn;
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: req.t('profile.no_image_provided') });
        }

        conn = await pool.getConnection();

        // Obtener la foto anterior para eliminarla
        const [oldPhoto] = await conn.query('SELECT foto_perfil FROM usuarios WHERE email = ?', [req.user.email]);

        // Actualizar la base de datos con la nueva ruta de la foto
        const photoPath = `uploads/profile-photos/${req.file.filename}`;
        await conn.query('UPDATE usuarios SET foto_perfil = ? WHERE email = ?', [photoPath, req.user.email]);

        // Eliminar la foto anterior si existe
        if (oldPhoto.length > 0 && oldPhoto[0].foto_perfil) {
            const oldPhotoPath = path.join(__dirname, '..', oldPhoto[0].foto_perfil);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        res.json({ status: 'success', message: req.t('profile.photo_updated'), photoUrl: photoPath });

    } catch (error) {
        logger.error('Error subiendo foto de perfil:', { error: error.message });
        // Eliminar el archivo subido si hubo un error en la BD
        if (req.file) {
            const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-photos');
            const filePath = path.join(uploadDir, req.file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.status(500).json({ status: 'error', message: req.t('profile.photo_upload_error') + ': ' + error.message });
    } finally {
        if (conn) conn.release();
    }
};

exports.getProfilePhoto = (req, res) => {
    try {
        const filename = req.params.filename;
        const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-photos');
        const filepath = path.join(uploadDir, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: req.t('profile.photo_not_found') });
        }

        res.sendFile(filepath);
    } catch (error) {
        logger.error('Error obteniendo foto de perfil:', { error: error.message });
        res.status(500).json({ error: req.t('errors.server_error') });
    }
};
