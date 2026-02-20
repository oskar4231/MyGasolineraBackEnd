const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse, createTestFactura } = require('../helpers/testHelpers');

// Mock del pool de base de datos
jest.mock('../../config/bbdd', () => require('../mocks/database').mockPool);

const facturasRouter = require('../../routes/facturas.routes');

function authedRequest(overrides = {}) {
    return mockRequest({
        user: { email: 'test@example.com' },
        ...overrides
    });
}

// Helper para obtener el handler de una ruta por path y método
function getHandler(path, method = 'get') {
    const layer = facturasRouter.stack.find(
        l => l.route && l.route.path === path && l.route.methods[method]
    );
    // El handler real está en la segunda capa (primero es el middleware auth)
    return layer.route.stack[layer.route.stack.length - 1].handle;
}

describe('Facturas Routes Tests', () => {
    beforeEach(() => {
        resetMocks();
    });

    // ── GET /facturas ─────────────────────────────────────────────
    describe('GET /facturas', () => {
        test('debe devolver la lista de facturas del usuario', async () => {
            const req = authedRequest();
            const res = mockResponse();

            const facturas = [
                createTestFactura({ id_factura: 1 }),
                createTestFactura({ id_factura: 2, titulo: 'Segunda factura', coste: 30 })
            ];

            // Mock: usuario encontrado
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            // Mock: facturas devueltas
            mockConnection.query.mockResolvedValueOnce([facturas]);

            await getHandler('/facturas', 'get')(req, res);

            expect(res.json).toHaveBeenCalledWith(facturas);
        });

        test('debe devolver 404 si el usuario no existe', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]);

            await getHandler('/facturas', 'get')(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('debe devolver array vacío si el usuario no tiene facturas', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([[]]);

            await getHandler('/facturas', 'get')(req, res);

            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    // ── POST /facturas ────────────────────────────────────────────
    describe('POST /facturas', () => {
        test('debe crear una factura correctamente con datos válidos', async () => {
            const req = authedRequest({
                body: {
                    titulo: 'Repostaje',
                    coste: 60.50,
                    fecha: '2025-02-15',
                    hora: '09:30',
                    descripcion: 'Test'
                }
            });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([{ insertId: 5 }]);

            await getHandler('/facturas', 'post')(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'success', facturaId: 5 })
            );
        });

        test('debe devolver 400 si faltan campos obligatorios', async () => {
            const req = authedRequest({
                body: { titulo: 'Solo título' } // Falta coste, fecha, hora
            });
            const res = mockResponse();

            await getHandler('/facturas', 'post')(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('debe devolver 404 si el usuario no existe en BD', async () => {
            const req = authedRequest({
                body: { titulo: 'Test', coste: 10, fecha: '2025-02-15', hora: '10:00' }
            });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]);

            await getHandler('/facturas', 'post')(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('debe aceptar factura sin descripción (campo opcional)', async () => {
            const req = authedRequest({
                body: { titulo: 'Sin descripción', coste: 20, fecha: '2025-02-15', hora: '11:00' }
            });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([{ insertId: 7 }]);

            await getHandler('/facturas', 'post')(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    // ── DELETE /facturas/:id_factura ──────────────────────────────
    describe('DELETE /facturas/:id_factura', () => {
        test('debe eliminar la factura correctamente', async () => {
            const req = authedRequest({ params: { id_factura: '1' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await getHandler('/facturas/:id_factura', 'delete')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'success' })
            );
        });

        test('debe devolver 403 si la factura pertenece a otro usuario', async () => {
            const req = authedRequest({ params: { id_factura: '99' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 2 }]]); // Otro usuario

            await getHandler('/facturas/:id_factura', 'delete')(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('debe devolver 404 si la factura no existe', async () => {
            const req = authedRequest({ params: { id_factura: '999' } });
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([[]]); // Factura no encontrada

            await getHandler('/facturas/:id_factura', 'delete')(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
