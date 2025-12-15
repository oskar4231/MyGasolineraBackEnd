const express = require('express');
const router = express.Router();
const pool = require('../config/bbdd');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: email_timestamp.extension
    const uniqueSuffix = Date.now();
    const email = req.user.email.replace(/[@.]/g, '_'); // Reemplazar caracteres especiales
    const ext = path.extname(file.originalname);
    cb(null, `${email}_${uniqueSuffix}${ext}`);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|jfif|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, jfif, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: fileFilter
});

// ==================== OBTENER PERFIL ====================
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      'SELECT email, nombre, apellido, telefono, foto_perfil FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==================== SUBIR FOTO DE PERFIL ====================
router.post('/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const conn = await pool.getConnection();

    // Obtener la foto anterior para eliminarla
    const [oldPhoto] = await conn.query(
      'SELECT foto_perfil FROM usuarios WHERE email = ?',
      [req.user.email]
    );

    // Actualizar la base de datos con la nueva ruta de la foto
    const photoPath = `uploads/profile-photos/${req.file.filename}`;
    await conn.query(
      'UPDATE usuarios SET foto_perfil = ? WHERE email = ?',
      [photoPath, req.user.email]
    );

    conn.release();

    // Eliminar la foto anterior si existe
    if (oldPhoto.length > 0 && oldPhoto[0].foto_perfil) {
      const oldPhotoPath = path.join(__dirname, '..', oldPhoto[0].foto_perfil);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    res.json({
      status: 'success',
      message: 'Foto de perfil actualizada correctamente',
      photoUrl: photoPath
    });

  } catch (error) {
    console.error('Error subiendo foto de perfil:', error);

    // Eliminar el archivo subido si hubo un error en la BD
    if (req.file) {
      const filePath = path.join(uploadDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Error al subir la foto de perfil: ' + error.message
    });
  }
});

// ==================== OBTENER FOTO DE PERFIL ====================
router.get('/profile-photo/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    res.sendFile(filepath);
  } catch (error) {
    console.error('Error obteniendo foto de perfil:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;

