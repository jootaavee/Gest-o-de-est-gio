// backend/src/middlewares/_test_/auth.middleware.test.js

const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../auth.middleware');
const { UserRole } = require('@prisma/client');

// Mock da biblioteca jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = { headers: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            sendStatus: jest.fn(),
        };
        mockNext = jest.fn(); // Mock da função next() do Express
    });

    describe('authenticateToken', () => {
        it('deve chamar next() e adicionar req.user se o token for válido', () => {
            const fakeUserPayload = { user: { id: 'user123', tipo: UserRole.ALUNO } };
            mockReq.headers['authorization'] = 'Bearer fake-valid-token';
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, fakeUserPayload); // Simula uma verificação bem-sucedida
            });
            
            authenticateToken(mockReq, mockRes, mockNext);
            
            expect(jwt.verify).toHaveBeenCalledWith('fake-valid-token', process.env.JWT_SECRET, expect.any(Function));
            expect(mockReq.user).toBe(fakeUserPayload.user);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockRes.sendStatus).not.toHaveBeenCalled();
        });

        it('deve retornar 401 se não houver token no header', () => {
            authenticateToken(mockReq, mockRes, mockNext);
            
            expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });
        
        it('deve retornar 401 se o header de autorização estiver mal formatado', () => {
            mockReq.headers['authorization'] = 'InvalidHeaderFormat';
            authenticateToken(mockReq, mockRes, mockNext);

            expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });
        
        it('deve retornar 403 se o token for inválido ou expirado', () => {
            mockReq.headers['authorization'] = 'Bearer fake-invalid-token';
            const error = new Error("Token Inválido");
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(error, null); // Simula um erro na verificação
            });

            authenticateToken(mockReq, mockRes, mockNext);

            expect(mockRes.sendStatus).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('authorizeRole', () => {
        it('deve chamar next() se o usuário tiver a role necessária', () => {
            mockReq.user = { tipo: UserRole.TECNICO }; // Usuário mockado com a role correta
            const middleware = authorizeRole(UserRole.TECNICO); // Cria o middleware para a role 'TECNICO'
            
            middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockRes.status).not.toHaveBeenCalled();
        });
        
        it('deve retornar 403 se o usuário NÃO tiver a role necessária', () => {
            mockReq.user = { tipo: UserRole.ALUNO }; // Usuário tem a role errada
            const middleware = authorizeRole(UserRole.TECNICO);
            
            middleware(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Acesso negado. Permissão insuficiente.' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('deve retornar 403 se não houver um usuário na requisição', () => {
            // mockReq.user não é definido neste teste
            const middleware = authorizeRole(UserRole.TECNICO);
            
            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});