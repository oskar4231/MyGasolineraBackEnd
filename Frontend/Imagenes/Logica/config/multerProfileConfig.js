const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '..', '..', 'imagenes', 'fotos_perfil');
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

module.exports = upload;
