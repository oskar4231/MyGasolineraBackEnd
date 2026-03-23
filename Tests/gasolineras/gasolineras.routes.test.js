const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse, createTestGasolinera } = require('../helpers/testHelpers');

// Mock del pool de base de datos
jest.mock('../../Importante/BaseDeDatos/bbdd', () => require('../mocks/database').mockPool);

const gasolinerasRouter = require('../../Frontend/Gasolineras/rutas/gasolineras.rutas');

// Mock node-cache para evitar persistencia entre tests
jest.mock('node-cache', () => {
    return jest.fn().mockImplementation(() => ({
        get: jest.fn().mockReturnValue(null),
        set: jest.fn()
    }));
});

function authedRequest(overrides = {}) {
    return mockRequest({
        user: { id: 1, email: 'test@example.com' },
        ...overrides
    });
}

function getHandler(path, method = 'get') {
    const layer = gasolinerasRouter.stack.find(
        l => l.route && l.route.path === path && l.route.methods[method]
    );
    if (!layer) {
        throw new Error(`Ruta no encontrada: ${method.toUpperCase()} ${path}`);
    }
    return layer.route.stack[layer.route.stack.length - 1].handle;
}

describe('Gasolineras Routes Tests', () => {
    beforeEach(() => {
        resetMocks();
    });

    // ── GET /api/gasolineras (sin coordenadas) ────────────────────
    describe('GET /api/gasolineras — sin coordenadas', () => {
        test('debe devolver todas las gasolineras ordenadas por rótulo', async () => {
            const req = authedRequest({ query: {} });
            const res = mockResponse();

            const gasolineras = [
                createTestGasolinera({ id: '1', rotulo: 'Gasolinera A' }),
                createTestGasolinera({ id: '2', rotulo: 'Gasolinera B' })
            ];

            mockPool.execute.mockResolvedValueOnce([gasolineras]);

            await getHandler('/api/gasolineras')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    count: 2,
                    gasolineras: expect.any(Array)
                })
            );
        });

        test('debe devolver array vacío si no hay gasolineras', async () => {
            const req = authedRequest({ query: {} });
            const res = mockResponse();

            mockPool.execute.mockResolvedValueOnce([[]]);

            await getHandler('/api/gasolineras')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    count: 0,
                    gasolineras: []
                })
            );
        });
    });

    // ── GET /api/gasolineras (con coordenadas) ────────────────────
    describe('GET /api/gasolineras — con coordenadas lat/lng', () => {
        test('debe devolver las gasolineras más cercanas', async () => {
            const req = authedRequest({ query: { lat: '40.4168', lng: '-3.7038' } });
            const res = mockResponse();

            const gasolineras = [
                createTestGasolinera({ id: '1', distancia: 0.5 }),
                createTestGasolinera({ id: '2', distancia: 1.2 })
            ];

            mockPool.execute.mockResolvedValueOnce([gasolineras]);

            await getHandler('/api/gasolineras')(req, res);

            expect(mockPool.execute).toHaveBeenCalledWith(
                expect.stringContaining('distancia'),
                expect.arrayContaining([40.4168, -3.7038, 40.4168])
            );

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    count: 2,
                    gasolineras: expect.any(Array)
                })
            );
        });

        test('debe parsear lat y lng como floats', async () => {
            const req = authedRequest({ query: { lat: '41.3851', lng: '2.1734' } });
            const res = mockResponse();

            mockPool.execute.mockResolvedValueOnce([[]]);

            await getHandler('/api/gasolineras')(req, res);

            expect(mockPool.execute).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([41.3851, 2.1734, 41.3851])
            );
        });
    });

    // ── Manejo de errores de BD ───────────────────────────────────
    describe('Manejo de errores de BD', () => {
        test('debe devolver 500 si la BD falla', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockPool.execute.mockRejectedValueOnce(new Error('DB failure'));

            await getHandler('/api/gasolineras')(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: 'Error interno del servidor' })
            );
        });
    });
});
