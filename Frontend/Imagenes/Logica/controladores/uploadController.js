const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../../../Backend/Logger/LoggerLogica/logger');

// Configuración de Multer: DiskStorage (Directo al disco, más eficiente que memoria)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Asegurar que la carpeta existe (server.js ya la crea, pero por seguridad)
        const uploadPath = path.join(__dirname, '../../imagenes');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Extraer extensión original o usar .jpg por defecto si falla
        const ext = path.extname(file.originalname) || '.jpg';
        // Generar nombre único: img-UUID.ext
        const filename = `img-${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Aumentamos límite a 10MB por si acaso (aunque front mandará ~200KB)
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'), false);
        }
    }
});

// Controlador Simple: Solo devuelve la respuesta, Multer ya guardó el archivo
const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No se ha subido ninguna imagen'
        });
    }

    const relativePath = `/uploads/${req.file.filename}`;
    
    logger.info('Imagen guardada exitosamente', { 
        filename: req.file.filename, 
        size: req.file.size,
        path: relativePath
    });

    res.json({
        success: true,
        message: 'Imagen subida correctamente',
        url: relativePath 
    });
};

module.exports = {
    uploadMiddleware: upload.single('imagen'),
    uploadImage
};
