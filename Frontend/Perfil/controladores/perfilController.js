const pool = require('../../../Importante/BaseDeDatos/bbdd');
const path = require('path');
const fs = require('fs');
const logger = require('../../../Backend/Logger/LoggerLogica/logger');
const QUERIES = require('../../../Importante/BaseDeDatos/queries');

// Ruta base donde Multer guarda las fotos de perfil
const FOTOS_PERFIL_DIR = path.join(__dirname, '..', '..', 'Imagenes', 'imagenes', 'fotos_perfil');

exports.getProfile = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.query(QUERIES.PERFIL.GET_PROFILE, [req.user.email]);

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
        const [oldPhoto] = await conn.query(QUERIES.PERFIL.GET_OLD_PHOTO, [req.user.email]);

        // Fix: ruta relativa consistente con el servidor estático
        // server.js sirve /uploads → Frontend/Imagenes/imagenes/
        // Multer guarda en Frontend/Imagenes/imagenes/fotos_perfil/
        // → La URL pública debe ser: uploads/fotos_perfil/<filename>
        const photoPath = `uploads/fotos_perfil/${req.file.filename}`;
        await conn.query(QUERIES.PERFIL.UPDATE_PHOTO, [photoPath, req.user.email]);

        // Eliminar la foto anterior si existe en disco
        if (oldPhoto.length > 0 && oldPhoto[0].foto_perfil) {
            // Construir ruta absoluta desde el filename almacenado en BD
            const oldFilename = path.basename(oldPhoto[0].foto_perfil);
            const oldPhotoAbsPath = path.join(FOTOS_PERFIL_DIR, oldFilename);
            if (fs.existsSync(oldPhotoAbsPath)) {
                fs.unlinkSync(oldPhotoAbsPath);
                logger.debug('Foto de perfil anterior eliminada', { path: oldPhotoAbsPath });
            }
        }

        logger.info('Foto de perfil actualizada', { email: req.user.email, photoPath });
        res.json({ status: 'success', message: req.t('profile.photo_updated'), photoUrl: photoPath });

    } catch (error) {
        logger.error('Error subiendo foto de perfil:', { error: error.message });
        // Eliminar el archivo recién subido si hubo error en BD
        if (req.file) {
            const filePath = path.join(FOTOS_PERFIL_DIR, req.file.filename);
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
        const filepath = path.join(FOTOS_PERFIL_DIR, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: req.t('profile.photo_not_found') });
        }

        res.sendFile(filepath);
    } catch (error) {
        logger.error('Error obteniendo foto de perfil:', { error: error.message });
        res.status(500).json({ error: req.t('errors.server_error') });
    }
};
