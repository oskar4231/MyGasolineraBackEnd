const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse, createTestGasolinera } = require('../helpers/testHelpers');

// Mock del pool de base de datos
jest.mock('../../config/bbdd', () => require('../mocks/database').mockPool);

const gasolinerasRouter = require('../../routes/gasolineras.routes');

function authedRequest(overrides = {}) {
    return mockRequest({
        user: { email: 'test@example.com' },
        ...overrides
    });
}

function getHandler(path, method = 'get') {
    const layer = gasolinerasRouter.stack.find(
        l => l.route && l.route.path === path && l.route.methods[method]
    );
    return layer.route.stack[layer.route.stack.length - 1].handle;
}

describe('Gasolineras Routes Tests', () => {
    beforeEach(() => {
        resetMocks();
    });

    // ── GET /gasolineras (sin coordenadas) ────────────────────────
    describe('GET /gasolineras — sin coordenadas', () => {
        test('debe devolver todas las gasolineras ordenadas por rótulo', async () => {
            const req = authedRequest({ query: {} });
            const res = mockResponse();

            const gasolineras = [
                createTestGasolinera({ id: '1', rotulo: 'Gasolinera A' }),
                createTestGasolinera({ id: '2', rotulo: 'Gasolinera B' })
            ];

            mockPool.execute.mockResolvedValueOnce([gasolineras]);

            await getHandler('/gasolineras')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    count: 2,
                    gasolineras: gasolineras
                })
            );
        });

        test('debe devolver array vacío si no hay gasolineras', async () => {
            const req = authedRequest({ query: {} });
            const res = mockResponse();

            mockPool.execute.mockResolvedValueOnce([[]]);

            await getHandler('/gasolineras')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    count: 0,
                    gasolineras: []
                })
            );
        });
    });

    // ── GET /gasolineras (con coordenadas) ────────────────────────
    describe('GET /gasolineras — con coordenadas lat/lng', () => {
        test('debe devolver las 50 más cercanas cuando se proporcionan coordenadas', async () => {
            const req = authedRequest({ query: { lat: '40.4168', lng: '-3.7038' } });
            const res = mockResponse();

            const gasolineras = [
                createTestGasolinera({ id: '1', distancia: 0.5 }),
                createTestGasolinera({ id: '2', distancia: 1.2 })
            ];

            mockPool.execute.mockResolvedValueOnce([gasolineras]);

            await getHandler('/gasolineras')(req, res);

            expect(mockPool.execute).toHaveBeenCalledWith(
                expect.stringContaining('distancia'),
                expect.arrayContaining([40.4168, -3.7038, 40.4168])
            );

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    count: 2
                })
            );
        });

        test('debe parsear lat y lng como floats', async () => {
            const req = authedRequest({ query: { lat: '41.3851', lng: '2.1734' } });
            const res = mockResponse();

            mockPool.execute.mockResolvedValueOnce([[]]);

            await getHandler('/gasolineras')(req, res);

            expect(mockPool.execute).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([41.3851, 2.1734, 41.3851])
            );
        });
    });

    // ── Manejo de errores ─────────────────────────────────────────
    describe('Manejo de errores de BD', () => {
        test('debe devolver 500 si la BD falla', async () => {
            const req = authedRequest({ query: {} });
            const res = mockResponse();

            mockPool.execute.mockRejectedValueOnce(new Error('DB connection error'));

            await getHandler('/gasolineras')(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false })
            );
        });
    });
});
