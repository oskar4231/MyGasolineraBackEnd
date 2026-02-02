const express = require('express');
const router = express.Router();
const authController = require('../controladores/authController');

// ==================== REGISTER ====================
router.post('/register', authController.register);

// ==================== LOGIN ====================
router.post('/login', authController.login);

// ==================== BORRAR / INACTIVAR USUARIO ====================
router.delete('/usuarios/:email', authController.deleteUser);

// ==================== FORGOT PASSWORD ====================
router.post('/forgot-password', authController.forgotPassword);

// ==================== VERIFY TOKEN ====================
router.post('/verify-token', authController.verifyToken);

// ==================== RESET PASSWORD ====================
router.post('/reset-password', authController.resetPassword);

router.get('/cargarImagen/:email', authController.getProfileImage);

// ==================== OBTENER NOMBRE DE USUARIO ====================
router.get('/usuarios/perfil/:email', authController.getUserProfile);

module.exports = router;