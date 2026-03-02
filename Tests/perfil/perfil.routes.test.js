const path = require('path');
const fs = require('fs');
const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse } = require('../helpers/testHelpers');

// Mock de módulos con efectos de sistema de ficheros
jest.mock('../../config/bbdd', () => require('../mocks/database').mockPool);
jest.mock('fs');

// Mock de multer para evitar subida real de archivos
jest.mock('multer', () => {
    const multerMock = () => ({
        single: () => (req, res, next) => next()
    });
    multerMock.diskStorage = () => ({});
    return multerMock;
});

// Importar router DESPUÉS de los mocks
const perfilRouter = require('../../routes/perfil.routes');

function authedRequest(overrides = {}) {
    return mockRequest({
        user: { email: 'test@example.com' },
        ...overrides
    });
}

function getHandler(path, method = 'get') {
    const layer = perfilRouter.stack.find(
        l => l.route && l.route.path === path && l.route.methods[method]
    );
    return layer.route.stack[layer.route.stack.length - 1].handle;
}

describe('Perfil Routes Tests', () => {
    beforeEach(() => {
        resetMocks();
        jest.clearAllMocks();
    });

    // ── GET /profile ──────────────────────────────────────────────
    describe('GET /profile', () => {
        test('debe devolver el perfil del usuario autenticado', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{
                email: 'test@example.com',
                nombre: 'Test User',
                apellido: 'Apellido',
                telefono: '600000000',
                foto_perfil: null
            }]]);

            await getHandler('/profile')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({ email: 'test@example.com' })
                })
            );
        });

        test('debe devolver 404 si el usuario no existe', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]); // No rows

            await getHandler('/profile')(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('debe devolver 500 si la BD falla', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockPool.getConnection.mockRejectedValueOnce(new Error('DB error'));

            await getHandler('/profile')(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ── POST /upload-photo ────────────────────────────────────────
    describe('POST /upload-photo', () => {
        test('debe actualizar la foto de perfil correctamente', async () => {
            const req = authedRequest({
                file: { filename: 'test_123.jpg', path: '/tmp/test_123.jpg' }
            });
            const res = mockResponse();

            // Mock: obtener foto anterior (sin foto previa)
            mockConnection.query.mockResolvedValueOnce([[{ foto_perfil: null }]]);
            // Mock: actualizar BD
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            fs.existsSync.mockReturnValue(false);

            await getHandler('/upload-photo', 'post')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    photoUrl: expect.stringContaining('test_123.jpg')
                })
            );
        });

        test('debe eliminar la foto anterior al subir una nueva', async () => {
            const req = authedRequest({
                file: { filename: 'nueva_foto.jpg', path: '/tmp/nueva_foto.jpg' }
            });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{
                foto_perfil: 'uploads/profile-photos/vieja_foto.jpg'
            }]]);
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            // Simular que el archivo anterior existe
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockReturnValue(undefined);

            await getHandler('/upload-photo', 'post')(req, res);

            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'success' })
            );
        });

        test('debe devolver 400 si no se proporciona archivo', async () => {
            const req = authedRequest({ file: null });
            const res = mockResponse();

            await getHandler('/upload-photo', 'post')(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ── GET /profile-photo/:filename ─────────────────────────────
    describe('GET /profile-photo/:filename', () => {
        test('debe servir la foto si existe', async () => {
            const req = authedRequest({ params: { filename: 'test_photo.jpg' } });
            const res = mockResponse();

            fs.existsSync.mockReturnValue(true);

            const handler = perfilRouter.stack.find(
                l => l.route && l.route.path === '/profile-photo/:filename'
            ).route.stack[0].handle;

            await handler(req, res);

            expect(res.sendFile).toHaveBeenCalled();
        });

        test('debe devolver 404 si la foto no existe', async () => {
            const req = authedRequest({ params: { filename: 'noexiste.jpg' } });
            const res = mockResponse();

            fs.existsSync.mockReturnValue(false);

            const handler = perfilRouter.stack.find(
                l => l.route && l.route.path === '/profile-photo/:filename'
            ).route.stack[0].handle;

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
