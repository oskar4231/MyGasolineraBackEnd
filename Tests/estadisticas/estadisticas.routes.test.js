const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse } = require('../helpers/testHelpers');

// Mock del pool de base de datos
jest.mock('../../Importante/BaseDeDatos/bbdd', () => require('../mocks/database').mockPool);

const estadisticasRouter = require('../../Frontend/Estadisticas/rutas/estadisticas.rutas');

function authedRequest(overrides = {}) {
    return mockRequest({
        user: { email: 'test@example.com' },
        ...overrides
    });
}

// Helper para obtener el handler de una ruta por path
function getHandler(path) {
    const layer = estadisticasRouter.stack.find(
        l => l.route && l.route.path === path
    );
    return layer.route.stack[layer.route.stack.length - 1].handle;
}

describe('Estadísticas Routes Tests', () => {
    beforeEach(() => {
        resetMocks();
    });

    // Helper reutilizable: mockear usuario y resultado de aggregación
    function mockUsuarioYResultado(resultado) {
        mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
        mockConnection.query.mockResolvedValueOnce([[resultado]]);
    }

    // ── GET /estadisticas/total ───────────────────────────────────
    describe('GET /estadisticas/total', () => {
        test('debe devolver gasto_total y total_facturas', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockUsuarioYResultado({ gasto_total: 250.75, total_facturas: 5 });

            await getHandler('/estadisticas/total')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ gasto_total: 250.75, total_facturas: 5 })
            );
        });

        test('debe devolver 404 si el usuario no existe', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[]]);

            await getHandler('/estadisticas/total')(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── GET /estadisticas/mes-actual ──────────────────────────────
    describe('GET /estadisticas/mes-actual', () => {
        test('debe devolver gasto_mes_actual y facturas_mes_actual', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockUsuarioYResultado({ gasto_mes_actual: 80.00, facturas_mes_actual: 2 });

            await getHandler('/estadisticas/mes-actual')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ gasto_mes_actual: 80.00 })
            );
        });
    });

    // ── GET /estadisticas/promedio-mensual ────────────────────────
    describe('GET /estadisticas/promedio-mensual', () => {
        test('debe devolver promedio_mensual de los últimos 6 meses', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockUsuarioYResultado({ promedio_mensual: 45.50 });

            await getHandler('/estadisticas/promedio-mensual')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ promedio_mensual: 45.50 })
            );
        });
    });

    // ── GET /estadisticas/anual ───────────────────────────────────
    describe('GET /estadisticas/anual', () => {
        test('debe devolver gasto_anual y facturas_anual', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockUsuarioYResultado({ gasto_anual: 600.00, facturas_anual: 15 });

            await getHandler('/estadisticas/anual')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ gasto_anual: 600.00, facturas_anual: 15 })
            );
        });
    });

    // ── GET /estadisticas/mes-comparacion ────────────────────────
    describe('GET /estadisticas/mes-comparacion', () => {
        test('debe calcular diferencia y porcentaje_cambio correctamente', async () => {
            const req = authedRequest();
            const res = mockResponse();

            // La ruta calcula diferencia y porcentaje en JS antes de responder
            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([[{
                gasto_mes_actual: 120,
                gasto_mes_anterior: 100
            }]]);

            await getHandler('/estadisticas/mes-comparacion')(req, res);

            const llamada = res.json.mock.calls[0][0];
            expect(llamada.diferencia).toBe(20);
            expect(parseFloat(llamada.porcentaje_cambio)).toBeCloseTo(20.00, 1);
        });

        test('debe manejar gasto_mes_anterior = 0 sin división por cero', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([[{
                gasto_mes_actual: 50,
                gasto_mes_anterior: 0
            }]]);

            await getHandler('/estadisticas/mes-comparacion')(req, res);

            const llamada = res.json.mock.calls[0][0];
            expect(llamada.porcentaje_cambio).toBe(0);
        });
    });

    // ── GET /estadisticas/por-mes ─────────────────────────────────
    describe('GET /estadisticas/por-mes', () => {
        test('debe devolver array con datos mensuales', async () => {
            const req = authedRequest();
            const res = mockResponse();

            const datosMensuales = [
                { mes: '2024-12', mes_nombre: 'December 2024', gasto: 100, num_facturas: 3 },
                { mes: '2025-01', mes_nombre: 'January 2025', gasto: 80, num_facturas: 2 }
            ];

            mockConnection.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);
            mockConnection.query.mockResolvedValueOnce([datosMensuales]);

            await getHandler('/estadisticas/por-mes')(req, res);

            expect(res.json).toHaveBeenCalledWith(datosMensuales);
        });
    });

    // ── GET /estadisticas/promedio-factura ────────────────────────
    describe('GET /estadisticas/promedio-factura', () => {
        test('debe devolver promedio, mínimo y máximo por factura', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockUsuarioYResultado({
                promedio_por_factura: 42.5,
                gasto_minimo: 10,
                gasto_maximo: 95
            });

            await getHandler('/estadisticas/promedio-factura')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    promedio_por_factura: 42.5,
                    gasto_minimo: 10,
                    gasto_maximo: 95
                })
            );
        });
    });

    // ── GET /estadisticas/proyeccion-fin-mes ──────────────────────
    describe('GET /estadisticas/proyeccion-fin-mes', () => {
        test('debe devolver proyeccion_fin_mes y datos del mes actual', async () => {
            const req = authedRequest();
            const res = mockResponse();

            mockUsuarioYResultado({
                gasto_actual: 100,
                dias_transcurridos: 10,
                dias_totales_mes: 30,
                proyeccion_fin_mes: 300
            });

            await getHandler('/estadisticas/proyeccion-fin-mes')(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ proyeccion_fin_mes: 300 })
            );
        });
    });

    // ── Sin autenticación → verificado en middleware, pero rutas retornan 404 si usuario no existe ──
    describe('Usuario no encontrado en todas las rutas', () => {
        const rutas = [
            '/estadisticas/total',
            '/estadisticas/mes-actual',
            '/estadisticas/promedio-mensual',
            '/estadisticas/anual',
            '/estadisticas/mes-comparacion',
            '/estadisticas/por-mes',
            '/estadisticas/promedio-factura',
            '/estadisticas/proyeccion-fin-mes'
        ];

        rutas.forEach(ruta => {
            test(`${ruta} debe devolver 404 si el usuario no existe`, async () => {
                const req = authedRequest();
                const res = mockResponse();

                mockConnection.query.mockResolvedValueOnce([[]]); // Usuario no encontrado

                await getHandler(ruta)(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
            });
        });
    });
});
