const perfilController = require('../../Frontend/Perfil/controladores/perfilController');
const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse, createTestUser, generateTestToken } = require('../helpers/testHelpers');
const path = require('path');
const fs = require('fs');

// Mock del pool de base de datos
jest.mock('../../Importante/BaseDeDatos/bbdd', () => require('../mocks/database').mockPool);

// Mock de fs para no crear archivos reales
jest.mock('fs');

describe('PerfilController Tests', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    test('debe obtener perfil de usuario autenticado', async () => {
      const testUser = createTestUser();
      const req = mockRequest({
        user: { email: 'test@example.com' }
      });
      const res = mockResponse();

      mockConnection.query.mockResolvedValueOnce([[{
        email: 'test@example.com',
        nombre: 'Test User',
        apellido: 'Apellido',
        telefono: '123456789',
        foto_perfil: 'uploads/profile-photos/test.jpg'
      }]]);

      await perfilController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            email: 'test@example.com',
            nombre: 'Test User'
          })
        })
      );
    });

    test('debe devolver error 404 si usuario no existe', async () => {
      const req = mockRequest({
        user: { email: 'noexiste@example.com' }
      });
      const res = mockResponse();

      mockConnection.query.mockResolvedValueOnce([[]]);

      await perfilController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('uploadPhoto', () => {
    test('debe subir foto de perfil exitosamente', async () => {
      const req = mockRequest({
        user: { email: 'test@example.com' },
        file: {
          filename: 'test_123456.jpg',
          path: '/tmp/test_123456.jpg'
        }
      });
      const res = mockResponse();

      // Mock: obtener foto anterior
      mockConnection.query.mockResolvedValueOnce([[{ foto_perfil: null }]]);
      // Mock: actualizar foto
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      fs.existsSync.mockReturnValue(false);

      await perfilController.uploadPhoto(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          photoUrl: expect.stringContaining('test_123456.jpg')
        })
      );
    });

    test('debe devolver error si no se proporciona archivo', async () => {
      const req = mockRequest({
        user: { email: 'test@example.com' },
        file: null
      });
      const res = mockResponse();

      await perfilController.uploadPhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('debe eliminar foto anterior al subir nueva', async () => {
      const req = mockRequest({
        user: { email: 'test@example.com' },
        file: {
          filename: 'new_photo.jpg',
          path: '/tmp/new_photo.jpg'
        }
      });
      const res = mockResponse();

      // Mock: obtener foto anterior
      mockConnection.query.mockResolvedValueOnce([[{
        foto_perfil: 'uploads/profile-photos/old_photo.jpg'
      }]]);
      // Mock: actualizar foto
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(undefined);

      await perfilController.uploadPhoto(req, res);

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  describe('getProfilePhoto', () => {
    test('debe servir foto de perfil existente', async () => {
      const req = mockRequest({
        params: { filename: 'test_photo.jpg' }
      });
      const res = mockResponse();

      fs.existsSync.mockReturnValue(true);

      await perfilController.getProfilePhoto(req, res);

      expect(res.sendFile).toHaveBeenCalled();
    });

    test('debe devolver error 404 si foto no existe', async () => {
      const req = mockRequest({
        params: { filename: 'noexiste.jpg' }
      });
      const res = mockResponse();

      fs.existsSync.mockReturnValue(false);

      await perfilController.getProfilePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
