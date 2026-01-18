const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const upload = require('../config/multerProfileConfig');
const perfilController = require('../controllers/perfilController');

// ==================== OBTENER PERFIL ====================
router.get('/profile', authenticateToken, perfilController.getProfile);

// ==================== SUBIR FOTO DE PERFIL ====================
router.post('/upload-photo', authenticateToken, upload.single('photo'), perfilController.uploadPhoto);

// ==================== OBTENER FOTO DE PERFIL ====================
router.get('/profile-photo/:filename', perfilController.getProfilePhoto);

module.exports = router;
