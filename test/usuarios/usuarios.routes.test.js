const bcrypt = require('bcryptjs');
const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse, createTestUser } = require('../helpers/testHelpers');

// Mock del pool de base de datos
jest.mock('../../config/bbdd', () => require('../mocks/database').mockPool);

// Mock del servicio de email para no enviar emails reales
jest.mock('../../config/emailService', () => ({
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

const usuariosRouter = require('../../routes/usuarios.routes');

function getHandler(path, method = 'post') {
    const layer = usuariosRouter.stack.find(
        l => l.route && l.route.path === path && l.route.methods[method]
    );
    return layer.route.stack[layer.route.stack.length - 1].handle;
}

function req(overrides = {}) {
    return mockRequest(overrides);
}

describe('Usuarios Routes Tests', () => {
    beforeEach(() => {
        resetMocks();
    });

    // ── POST /register ────────────────────────────────────────────
    describe('POST /register', () => {
        test('debe registrar un nuevo usuario y devolver token', async () => {
            const request = req({ body: { email: 'nuevo@example.com', password: 'pass123', nombre: 'Nuevo' } });
            const res = mockResponse();

            // Mock: email no existe
            mockConnection.query.mockResolvedValueOnce([[]]);
            // Mock: inserción exitosa
            mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]);

            await getHandler('/register')(request, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    token: expect.any(String),
                    user: expect.objectContaining({ email: 'nuevo@example.com' })
                })
            );
        });

        test('debe devolver 409 si el email ya está registrado', async () => {
            const request = req({ body: { email: 'existente@example.com', password: 'pass123' } });
            const res = mockResponse();

            // Mock: email ya existe
            mockConnection.query.mockResolvedValueOnce([[{ email: 'existente@example.com' }]]);

            await getHandler('/register')(request, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });

        test('debe devolver 400 si faltan email o password', async () => {
            const request = req({ body: { email: 'test@example.com' } }); // Sin password
            const res = mockResponse();

            await getHandler('/register')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('debe registrar usuario sin nombre (campo opcional)', async () => {
            const request = req({ body: { email: 'sinombre@example.com', password: 'pass123' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]);
            mockConnection.query.mockResolvedValueOnce([{ insertId: 2 }]);

            await getHandler('/register')(request, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({ nombre: '' })
                })
            );
        });
    });

    // ── POST /login ───────────────────────────────────────────────
    describe('POST /login', () => {
        test('debe hacer login correctamente con credenciales válidas', async () => {
            const testUser = createTestUser();
            const request = req({ body: { email: 'test@example.com', password: 'password123' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[testUser]]);

            await getHandler('/login')(request, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    token: expect.any(String)
                })
            );
        });

        test('debe devolver 401 con contraseña incorrecta', async () => {
            const testUser = createTestUser();
            const request = req({ body: { email: 'test@example.com', password: 'wrongpassword' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[testUser]]);

            await getHandler('/login')(request, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('debe devolver 401 si el usuario no existe', async () => {
            const request = req({ body: { email: 'noexiste@example.com', password: 'pass123' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]); // Sin resultados

            await getHandler('/login')(request, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('debe devolver 400 si faltan email o password', async () => {
            const request = req({ body: { email: 'test@example.com' } }); // Sin password
            const res = mockResponse();

            await getHandler('/login')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ── DELETE /usuarios/:email ───────────────────────────────────
    describe('DELETE /usuarios/:email', () => {
        test('debe marcar el usuario como inactivo correctamente', async () => {
            const request = req({
                params: { email: 'test@example.com' },
                body: { email: 'test@example.com' }
            });
            const res = mockResponse();

            mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await getHandler('/usuarios/:email', 'delete')(request, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true })
            );
        });

        test('debe devolver 404 si el usuario no existe', async () => {
            const request = req({
                params: { email: 'noexiste@example.com' },
                body: { email: 'noexiste@example.com' }
            });
            const res = mockResponse();

            mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

            await getHandler('/usuarios/:email', 'delete')(request, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('debe devolver 400 si no se proporciona email en el body', async () => {
            const request = req({ params: { email: 'test@example.com' }, body: {} });
            const res = mockResponse();

            await getHandler('/usuarios/:email', 'delete')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ── POST /forgot-password ─────────────────────────────────────
    describe('POST /forgot-password', () => {
        test('debe responder con éxito para email registrado y enviar el email', async () => {
            const { sendPasswordResetEmail } = require('../../config/emailService');
            const request = req({ body: { email: 'test@example.com' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{ email: 'test@example.com' }]]);
            mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]);

            await getHandler('/forgot-password')(request, res);

            expect(sendPasswordResetEmail).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'success' })
            );
        });

        test('debe responder con éxito aunque el email no exista (por seguridad)', async () => {
            const request = req({ body: { email: 'noexiste@example.com' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]); // Email no encontrado

            await getHandler('/forgot-password')(request, res);

            // Por seguridad, no debe revelar si el email existe o no
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'success' })
            );
        });

        test('debe devolver 400 si no se proporciona email', async () => {
            const request = req({ body: {} });
            const res = mockResponse();

            await getHandler('/forgot-password')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ── POST /verify-token ────────────────────────────────────────
    describe('POST /verify-token', () => {
        test('debe validar un token correcto y devolver el email', async () => {
            const request = req({ body: { token: '123456' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{
                token: '123456',
                email: 'test@example.com',
                used: false,
                expires_at: new Date(Date.now() + 3600000)
            }]]);

            await getHandler('/verify-token')(request, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    email: 'test@example.com'
                })
            );
        });

        test('debe devolver 400 para token inválido o expirado', async () => {
            const request = req({ body: { token: 'tokeninvalido' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]); // Token no encontrado

            await getHandler('/verify-token')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('debe devolver 400 si no se proporciona token', async () => {
            const request = req({ body: {} });
            const res = mockResponse();

            await getHandler('/verify-token')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ── POST /reset-password ──────────────────────────────────────
    describe('POST /reset-password', () => {
        test('debe resetear la contraseña con un token válido', async () => {
            const request = req({ body: { token: '123456', newPassword: 'nuevapass123' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{
                token: '123456',
                email: 'test@example.com'
            }]]);
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE contraseña
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE token usado

            await getHandler('/reset-password')(request, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'success' })
            );
        });

        test('debe devolver 400 si el token no existe o expiró', async () => {
            const request = req({ body: { token: 'tokenexpirado', newPassword: 'nuevapass123' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]); // Token no válido

            await getHandler('/reset-password')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('debe devolver 400 si la nueva contraseña es muy corta (menos de 6 chars)', async () => {
            const request = req({ body: { token: '123456', newPassword: '123' } });
            const res = mockResponse();

            await getHandler('/reset-password')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('debe devolver 400 si faltan token o newPassword', async () => {
            const request = req({ body: { token: '123456' } }); // Sin newPassword
            const res = mockResponse();

            await getHandler('/reset-password')(request, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
