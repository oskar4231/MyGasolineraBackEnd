const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse, createTestUser, createTestCoche, generateTestToken } = require('../helpers/testHelpers');

// Mock del pool de base de datos
jest.mock('../../Importante/BaseDeDatos/bbdd', () => require('../mocks/database').mockPool);

// Importar el router después del mock
const cochesRouter = require('../../Frontend/Coches/rutas/coches.rutas');

// Helper: simular req con user autenticado (como lo haría el middleware)
function authedRequest(overrides = {}) {
    return mockRequest({
        user: { id: 1, email: 'test@example.com' },
        ...overrides
    });
}

describe('Coches Routes Tests', () => {
    beforeEach(() => {
        resetMocks();
    });

    // ── POST /insertCar ──────────────────────────────────────────
    describe('POST /insertCar', () => {
        test('debe crear un coche correctamente con datos válidos', async () => {
            const req = authedRequest({
                body: { marca: 'Toyota', modelo: 'Corolla', combustible: 'Gasolina' }
            });
            const res = mockResponse();

            // Mock: usuario encontrado
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            // Mock: coche no existente
            mockConnection.query.mockResolvedValueOnce([[]]);
            // Mock: inserción exitosa
            mockConnection.query.mockResolvedValueOnce([{ insertId: 10 }]);

            // Ejecutar handler directamente (sin levantar servidor)
            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/insertCar')
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'success', carId: 10 })
            );
        });

        test('debe devolver 400 si faltan campos obligatorios', async () => {
            const req = authedRequest({
                body: { marca: 'Toyota' } // Falta modelo y combustible
            });
            const res = mockResponse();

            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/insertCar')
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('debe devolver 409 si el coche ya existe para el usuario', async () => {
            const req = authedRequest({
                body: { marca: 'Toyota', modelo: 'Corolla', combustible: 'Gasolina' }
            });
            const res = mockResponse();

            // Mock: usuario encontrado
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            // Mock: coche ya existe
            mockConnection.query.mockResolvedValueOnce([[{ id_coche: 1 }]]);

            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/insertCar')
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });

        test('debe devolver 404 si el usuario no existe en BD', async () => {
            const req = authedRequest({
                body: { marca: 'Toyota', modelo: 'Corolla', combustible: 'Gasolina' }
            });
            const res = mockResponse();

            // Mock: usuario no encontrado
            mockConnection.query.mockResolvedValueOnce([[]]);

            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/insertCar')
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── GET /coches ──────────────────────────────────────────────
    describe('GET /coches', () => {
        test('debe devolver la lista de coches del usuario', async () => {
            const req = authedRequest();
            const res = mockResponse();

            const coches = [
                createTestCoche({ id_coche: 1 }),
                createTestCoche({ id_coche: 2, modelo: 'Yaris' })
            ];

            // Mock: usuario encontrado
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            // Mock: lista de coches
            mockConnection.query.mockResolvedValueOnce([coches]);

            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/coches' && l.route.methods.get)
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.json).toHaveBeenCalledWith(coches);
        });

        test('debe devolver 404 si el usuario no existe', async () => {
            const req = authedRequest();
            const res = mockResponse();

            // Mock: usuario no encontrado
            mockConnection.query.mockResolvedValueOnce([[]]);

            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/coches' && l.route.methods.get)
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── DELETE /coches/:id_coche ─────────────────────────────────
    describe('DELETE /coches/:id_coche', () => {
        test('debe eliminar el coche correctamente', async () => {
            const req = authedRequest({ params: { id_coche: '1' } });
            const res = mockResponse();

            // Mock: usuario encontrado
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            // Mock: coche encontrado y pertenece al usuario
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            // Mock: eliminación exitosa
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/coches/:id_coche')
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'success' })
            );
        });

        test('debe devolver 403 si el coche pertenece a otro usuario', async () => {
            const req = authedRequest({ params: { id_coche: '5' } });
            const res = mockResponse();

            // Mock: usuario encontrado (id 1)
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            // Mock: coche pertenece al usuario id 2
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 2 }]]);

            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/coches/:id_coche')
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('debe devolver 404 si el coche no existe', async () => {
            const req = authedRequest({ params: { id_coche: '999' } });
            const res = mockResponse();

            // Mock: usuario encontrado
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            // Mock: coche no encontrado
            mockConnection.query.mockResolvedValueOnce([[]]);

            const handler = cochesRouter.stack.find(l => l.route && l.route.path === '/coches/:id_coche')
                .route.stack[1].handle;
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
