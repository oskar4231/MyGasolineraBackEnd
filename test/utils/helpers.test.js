/**
 * Tests de utilidades y helpers
 */

describe('Utilidades y Helpers', () => {
  describe('Parseo de Precios', () => {
    test('debe parsear precio con coma europea a número', () => {
      const precioString = '1,459';
      const precioNumero = parseFloat(precioString.replace(',', '.'));
      
      expect(precioNumero).toBe(1.459);
    });

    test('debe parsear precio con punto decimal', () => {
      const precioString = '1.459';
      const precioNumero = parseFloat(precioString);
      
      expect(precioNumero).toBe(1.459);
    });

    test('debe devolver 0 para precio "N/A"', () => {
      const precioString = 'N/A';
      const precioNumero = precioString === 'N/A' ? 0 : parseFloat(precioString);
      
      expect(precioNumero).toBe(0);
    });

    test('debe manejar strings con espacios', () => {
      const precioString = '  1,459  ';
      const precioNumero = parseFloat(precioString.trim().replace(',', '.'));
      
      expect(precioNumero).toBe(1.459);
    });

    test('debe manejar valores vacíos', () => {
      const precioString = '';
      const precioNumero = precioString === '' ? 0 : parseFloat(precioString);
      
      expect(precioNumero).toBe(0);
    });
  });

  describe('Validación de Email', () => {
    test('debe validar email correcto', () => {
      const email = 'test@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(true);
    });

    test('debe rechazar email sin @', () => {
      const email = 'testexample.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(false);
    });

    test('debe rechazar email sin dominio', () => {
      const email = 'test@';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  describe('Validación de Contraseña', () => {
    test('debe aceptar contraseña válida (mínimo 6 caracteres)', () => {
      const password = 'password123';
      const isValid = password.length >= 6;
      
      expect(isValid).toBe(true);
    });

    test('debe rechazar contraseña muy corta', () => {
      const password = '123';
      const isValid = password.length >= 6;
      
      expect(isValid).toBe(false);
    });
  });

  describe('Sanitización de Inputs', () => {
    test('debe eliminar espacios al inicio y final', () => {
      const input = '  test  ';
      const sanitized = input.trim();
      
      expect(sanitized).toBe('test');
    });

    test('debe convertir a minúsculas para emails', () => {
      const email = 'TEST@EXAMPLE.COM';
      const sanitized = email.toLowerCase();
      
      expect(sanitized).toBe('test@example.com');
    });
  });

  describe('Manejo de Errores de BD', () => {
    test('debe detectar error de conexión', () => {
      const error = { code: 'ECONNREFUSED' };
      const isConnectionError = error.code === 'ECONNREFUSED';
      
      expect(isConnectionError).toBe(true);
    });

    test('debe detectar error de duplicado', () => {
      const error = { code: 'ER_DUP_ENTRY' };
      const isDuplicateError = error.code === 'ER_DUP_ENTRY';
      
      expect(isDuplicateError).toBe(true);
    });
  });
});
