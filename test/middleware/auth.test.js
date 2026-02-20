const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middleware/auth');
const { mockRequest, mockResponse, mockNext, generateTestToken } = require('../helpers/testHelpers');

describe('Middleware: authenticateToken', () => {
    describe('Token ausente', () => {
        test('debe devolver 401 si no hay header Authorization', () => {
            const req = mockRequest({ headers: {} });
            const res = mockResponse();
            const next = mockNext();

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.any(String) })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('debe devolver 401 si el header Authorization existe pero no tiene Bearer', () => {
            const req = mockRequest({ headers: { authorization: 'SinBearer' } });
            const res = mockResponse();
            const next = mockNext();

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Token inválido', () => {
        test('debe devolver 403 con token malformado', () => {
            const req = mockRequest({ headers: { authorization: 'Bearer tokeninvalido.abc.xyz' } });
            const res = mockResponse();
            const next = mockNext();

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.any(String) })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('debe devolver 403 con token firmado con secret incorrecto', () => {
            const tokenConOtroSecret = jwt.sign({ email: 'test@example.com' }, 'otro-secret');
            const req = mockRequest({ headers: { authorization: `Bearer ${tokenConOtroSecret}` } });
            const res = mockResponse();
            const next = mockNext();

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Token válido', () => {
        test('debe llamar a next() con token JWT correcto', () => {
            const token = generateTestToken({ email: 'test@example.com', id: 1 });
            const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });
            const res = mockResponse();
            const next = mockNext();

            authenticateToken(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeDefined();
            expect(req.user.email).toBe('test@example.com');
            expect(res.status).not.toHaveBeenCalled();
        });

        test('debe poblar req.user con los datos del token', () => {
            const payload = { email: 'usuario@ejemplo.es', id: 42 };
            const token = generateTestToken(payload);
            const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });
            const res = mockResponse();
            const next = mockNext();

            authenticateToken(req, res, next);

            expect(req.user.email).toBe(payload.email);
            expect(req.user.id).toBe(payload.id);
        });
    });
});
