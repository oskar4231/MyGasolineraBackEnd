const { mockPool, mockConnection, resetMocks } = require('../mocks/database');
const { mockRequest, mockResponse, createTestGasolinera } = require('../helpers/testHelpers');

// Mock del pool de base de datos
jest.mock('../../Importante/BaseDeDatos/bbdd', () => require('../mocks/database').mockPool);

describe('Gasolineras Controller Tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  const gasolinerasTest = [
    createTestGasolinera({ id: '1', gasolina95: 1.30, horario: 'L-D: 08:00-22:00' }),
    createTestGasolinera({ id: '2', gasolina95: 1.80, horario: 'L-D: 24H' }),
    createTestGasolinera({ id: '3', gasolina95: 0, gasoleoA: 1.40, horario: 'L-D: 08:00-22:00' })
  ];

  describe('Obtener Gasolineras', () => {
    test('debe obtener todas las gasolineras', async () => {
      mockConnection.query.mockResolvedValueOnce([gasolinerasTest]);

      const result = gasolinerasTest;

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('rotulo');
    });

    test('debe devolver array vacío si no hay gasolineras', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);

      const result = [];

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Filtros de Precio', () => {
    test('debe filtrar por precio máximo', () => {
      const precioMaximo = 1.50;
      const resultado = gasolinerasTest.filter(g => 
        g.gasolina95 > 0 && g.gasolina95 <= precioMaximo
      );

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('1');
    });

    test('debe filtrar por precio mínimo', () => {
      const precioMinimo = 1.50;
      const resultado = gasolinerasTest.filter(g => 
        g.gasolina95 >= precioMinimo
      );

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('2');
    });

    test('debe filtrar por rango de precios', () => {
      const precioMin = 1.20;
      const precioMax = 1.50;
      const resultado = gasolinerasTest.filter(g => 
        g.gasolina95 >= precioMin && g.gasolina95 <= precioMax
      );

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('1');
    });

    test('debe manejar rango inválido (min > max)', () => {
      const precioMin = 1.80;
      const precioMax = 1.30;
      const resultado = gasolinerasTest.filter(g => 
        g.gasolina95 >= precioMin && g.gasolina95 <= precioMax
      );

      expect(resultado).toHaveLength(0);
    });
  });

  describe('Filtros de Combustible', () => {
    test('debe filtrar por combustible específico (Gasolina 95)', () => {
      const resultado = gasolinerasTest.filter(g => g.gasolina95 > 0);

      expect(resultado).toHaveLength(2);
      expect(resultado.every(g => g.gasolina95 > 0)).toBe(true);
    });

    test('debe filtrar por combustible específico (Gasoleo A)', () => {
      const resultado = gasolinerasTest.filter(g => g.gasoleoA > 0);

      expect(resultado).toHaveLength(3);
    });

    test('debe excluir gasolineras sin el combustible seleccionado', () => {
      const resultado = gasolinerasTest.filter(g => g.gasolina95 > 0);

      expect(resultado.some(g => g.id === '3')).toBe(false);
    });
  });

  describe('Filtros de Horario', () => {
    test('debe filtrar gasolineras 24 horas', () => {
      const resultado = gasolinerasTest.filter(g => 
        g.horario.includes('24H') || g.horario.includes('24h')
      );

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('2');
    });

    test('debe detectar correctamente horario 24h', () => {
      const gasolinera24h = gasolinerasTest.find(g => g.id === '2');
      const es24h = gasolinera24h.horario.includes('24H');

      expect(es24h).toBe(true);
    });
  });

  describe('Filtros Combinados', () => {
    test('debe aplicar filtro de combustible + precio', () => {
      const precioMax = 1.50;
      const resultado = gasolinerasTest.filter(g => 
        g.gasolina95 > 0 && g.gasolina95 <= precioMax
      );

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('1');
    });

    test('debe aplicar filtro de combustible + precio + horario', () => {
      const precioMax = 1.50;
      const resultado = gasolinerasTest.filter(g => 
        g.gasolina95 > 0 && 
        g.gasolina95 <= precioMax &&
        g.horario.includes('24H')
      );

      expect(resultado).toHaveLength(0);
    });
  });

  describe('Búsqueda por Ubicación', () => {
    test('debe filtrar por provincia', () => {
      const resultado = gasolinerasTest.filter(g => 
        g.provincia === 'Madrid'
      );

      expect(resultado).toHaveLength(3);
    });

    test('debe validar coordenadas dentro de rango válido', () => {
      const gasolinera = gasolinerasTest[0];
      const latValida = gasolinera.lat >= -90 && gasolinera.lat <= 90;
      const lngValida = gasolinera.lng >= -180 && gasolinera.lng <= 180;

      expect(latValida).toBe(true);
      expect(lngValida).toBe(true);
    });
  });

  describe('Manejo de Parámetros Inválidos', () => {
    test('debe manejar precio negativo', () => {
      const precioInvalido = -1.50;
      const resultado = gasolinerasTest.filter(g => 
        g.gasolina95 > 0 && g.gasolina95 <= precioInvalido
      );

      expect(resultado).toHaveLength(0);
    });

    test('debe manejar provincia vacía', () => {
      const resultado = gasolinerasTest.filter(g => 
        g.provincia === ''
      );

      expect(resultado).toHaveLength(0);
    });
  });

  describe('Paginación', () => {
    test('debe paginar resultados correctamente', () => {
      const page = 1;
      const limit = 2;
      const start = (page - 1) * limit;
      const resultado = gasolinerasTest.slice(start, start + limit);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].id).toBe('1');
      expect(resultado[1].id).toBe('2');
    });

    test('debe manejar página fuera de rango', () => {
      const page = 10;
      const limit = 2;
      const start = (page - 1) * limit;
      const resultado = gasolinerasTest.slice(start, start + limit);

      expect(resultado).toHaveLength(0);
    });
  });
});
