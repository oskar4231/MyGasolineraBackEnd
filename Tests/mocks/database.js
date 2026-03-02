// Mock de la conexión a base de datos para tests
const mockPool = {
  query: jest.fn(),
  getConnection: jest.fn(),
  execute: jest.fn()
};

const mockConnection = {
  query: jest.fn(),
  execute: jest.fn(),
  release: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn()
};

// Configurar mock para devolver conexión
mockPool.getConnection.mockResolvedValue(mockConnection);

module.exports = {
  mockPool,
  mockConnection,
  
  // Helper para resetear mocks entre tests
  resetMocks: () => {
    mockPool.query.mockReset();
    mockPool.getConnection.mockReset();
    mockPool.execute.mockReset();
    mockConnection.query.mockReset();
    mockConnection.execute.mockReset();
    mockConnection.release.mockReset();
    mockConnection.beginTransaction.mockReset();
    mockConnection.commit.mockReset();
    mockConnection.rollback.mockReset();
    
    // Reconfigurar getConnection
    mockPool.getConnection.mockResolvedValue(mockConnection);
  }
};
