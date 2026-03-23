const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Genera un token JWT de prueba
 */
function generateTestToken(payload = { email: 'test@example.com', id: 1 }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Crea un usuario de prueba
 */
function createTestUser(overrides = {}) {
  return {
    id_usuario: 1,
    email: 'test@example.com',
    nombre: 'Test User',
    apellido: 'Apellido',
    telefono: '123456789',
    contraseña: bcrypt.hashSync('password123', 10),
    activo: 1,
    fecha_registro: new Date(),
    ultimo_login: new Date(),
    foto_perfil: null,
    ...overrides
  };
}

/**
 * Crea una gasolinera de prueba
 */
function createTestGasolinera(overrides = {}) {
  return {
    id: '12345',
    rotulo: 'Test Station',
    direccion: 'Calle Test 123',
    lat: 40.4168,
    lng: -3.7038,
    provincia: 'Madrid',
    horario: 'L-D: 08:00-22:00',
    gasolina95: 1.459,
    gasolina95E10: 0,
    gasolina98: 0,
    gasoleoA: 1.359,
    gasoleoPremium: 0,
    glp: 0,
    biodiesel: 0,
    bioetanol: 0,
    esterMetilico: 0,
    hidrogeno: 0,
    ...overrides
  };
}

/**
 * Crea un coche de prueba
 */
function createTestCoche(overrides = {}) {
  return {
    id_coche: 1,
    id_usuario: 1,
    marca: 'Toyota',
    modelo: 'Corolla',
    combustible: 'Gasolina',
    ...overrides
  };
}

/**
 * Crea una factura de prueba
 */
function createTestFactura(overrides = {}) {
  return {
    id_factura: 1,
    id_usuario: 1,
    titulo: 'Repostaje Test',
    coste: 50.00,
    fecha: '2025-01-15',
    hora: '10:00:00',
    descripcion: 'Descripción de prueba',
    imagenPath: null,
    ...overrides
  };
}

/**
 * Simula una request de Express
 */
function mockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: { id: 1, email: 'test@example.com' },
    file: null,
    files: null,
    t: (key) => key, // Mock de traducción
    ...overrides
  };
}

/**
 * Simula una response de Express
 */
function mockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis()
  };
  return res;
}

/**
 * Simula una función next de Express
 */
function mockNext() {
  return jest.fn();
}

module.exports = {
  generateTestToken,
  createTestUser,
  createTestGasolinera,
  createTestCoche,
  createTestFactura,
  mockRequest,
  mockResponse,
  mockNext
};
