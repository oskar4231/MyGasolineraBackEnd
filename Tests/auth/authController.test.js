const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../../Frontend/Perfil/controladores/authController');
const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse, createTestUser } = require('../helpers/testHelpers');

// Mock del pool de base de datos
jest.mock('../../Importante/BaseDeDatos/bbdd', () => require('../mocks/database').mockPool);

// Mock del servicio de email
jest.mock('../../Backend/Emails/config/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

describe('AuthController Tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('register', () => {
    test('debe registrar un nuevo usuario exitosamente', async () => {
      const req = mockRequest({
        body: {
          email: 'nuevo@example.com',
          password: 'password123',
          nombre: 'Nuevo Usuario'
        }
      });
      const res = mockResponse();

      // Mock: usuario no existe
      mockPool.query.mockResolvedValueOnce([[]]);
      // Mock: inserción exitosa
      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          user: expect.objectContaining({
            email: 'nuevo@example.com'
          }),
          token: expect.any(String)
        })
      );
    });

    test('debe rechazar registro con email duplicado', async () => {
      const req = mockRequest({
        body: {
          email: 'existente@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse();

      // Mock: usuario ya existe
      mockPool.query.mockResolvedValueOnce([[{ email: 'existente@example.com' }]]);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error'
        })
      );
    });

    test('debe rechazar registro sin email o password', async () => {
      const req = mockRequest({
        body: { email: 'test@example.com' } // Falta password
      });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    test('debe hacer login exitosamente con credenciales válidas', async () => {
      const testUser = createTestUser();
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse();

      // Mock: usuario encontrado
      mockPool.query.mockResolvedValueOnce([[testUser]]);

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          token: expect.any(String)
        })
      );
    });

    test('debe rechazar login con contraseña incorrecta', async () => {
      const testUser = createTestUser();
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });
      const res = mockResponse();

      // Mock: usuario encontrado
      mockPool.query.mockResolvedValueOnce([[testUser]]);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('debe rechazar login de usuario inexistente', async () => {
      const req = mockRequest({
        body: {
          email: 'noexiste@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse();

      // Mock: usuario no encontrado
      mockPool.query.mockResolvedValueOnce([[]]);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('forgotPassword', () => {
    test('debe enviar email de recuperación para usuario válido', async () => {
      const req = mockRequest({
        body: { email: 'test@example.com' }
      });
      const res = mockResponse();

      // Mock: usuario encontrado
      mockPool.query.mockResolvedValueOnce([[{ email: 'test@example.com' }]]);
      // Mock: token insertado
      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      await authController.forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });

    test('debe manejar email no registrado sin revelar información', async () => {
      const req = mockRequest({
        body: { email: 'noexiste@example.com' }
      });
      const res = mockResponse();

      // Mock: usuario no encontrado
      mockPool.query.mockResolvedValueOnce([[]]);

      await authController.forgotPassword(req, res);

      // Por seguridad, debe responder como si fuera exitoso
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  describe('verifyToken', () => {
    test('debe verificar token válido correctamente', async () => {
      const req = mockRequest({
        body: { token: '123456' }
      });
      const res = mockResponse();

      const futureDate = new Date(Date.now() + 3600000);
      // Mock: token válido encontrado
      mockPool.query.mockResolvedValueOnce([[{
        token: '123456',
        email: 'test@example.com',
        used: false,
        expires_at: futureDate
      }]]);

      await authController.verifyToken(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          email: 'test@example.com'
        })
      );
    });

    test('debe rechazar token inválido o expirado', async () => {
      const req = mockRequest({
        body: { token: 'invalid' }
      });
      const res = mockResponse();

      // Mock: token no encontrado
      mockPool.query.mockResolvedValueOnce([[]]);

      await authController.verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('resetPassword', () => {
    test('debe resetear contraseña con token válido', async () => {
      const req = mockRequest({
        body: {
          token: '123456',
          newPassword: 'newpassword123'
        }
      });
      const res = mockResponse();

      const futureDate = new Date(Date.now() + 3600000);
      // Mock: token válido
      mockPool.query.mockResolvedValueOnce([[{
        token: '123456',
        email: 'test@example.com',
        used: false,
        expires_at: futureDate
      }]]);
      // Mock: actualizar contraseña
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Mock: marcar token como usado
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await authController.resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });

    test('debe rechazar contraseña muy corta', async () => {
      const req = mockRequest({
        body: {
          token: '123456',
          newPassword: '123' // Muy corta
        }
      });
      const res = mockResponse();

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
