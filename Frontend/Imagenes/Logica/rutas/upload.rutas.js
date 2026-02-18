const express = require('express');
const router = express.Router();
const uploadController = require('../controladores/uploadController');

// Ruta POST /api/upload
// 1. uploadMiddleware: Recibe Y GUARDA el archivo en disco (Multer DiskStorage)
// 2. uploadImage: Responde con la URL
router.post('/upload', 
    uploadController.uploadMiddleware, 
    uploadController.uploadImage
);

module.exports = router;
