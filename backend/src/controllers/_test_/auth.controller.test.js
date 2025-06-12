// backend/src/controllers/_test_/auth.controller.test.js

// Definir a variável de ambiente ANTES de importar os módulos que a utilizam.
// Se o JWT_SECRET no seu .env de desenvolvimento real é diferente, não há problema,
// pois para os testes, usaremos este valor.
process.env.JWT_SECRET = 'test_secret_key_for_jwt_auth_consistent';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../prismaClient');
const { registerAluno, login } = require('../auth.controller');
const { UserRole } = require('@prisma/client');

// Mock das dependências
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));


describe('Auth Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Garante que o JWT_SECRET é o de teste a cada vez, caso algo o altere
    process.env.JWT_SECRET = 'test_secret_key_for_jwt_auth_consistent';
  });

  describe('registerAluno', () => {
    const alunoData = {
      nome_completo: 'Aluno Teste', email: 'aluno@teste.com', senha: 'senha123',
      confirmar_senha: 'senha123', cpf: '12345678900', numero: '999999999',
      data_nascimento: '2000-01-01', curso: 'Engenharia Mock', periodo: 3, matricula: '2024001'
    };

    test('deve registrar um novo aluno com sucesso', async () => {
      mockReq.body = alunoData;
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('somesalt');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      const mockCreatedUser = { id: 'aluno-uuid', ...alunoData, tipo: UserRole.ALUNO };
      delete mockCreatedUser.senha; delete mockCreatedUser.confirmar_senha;
      prisma.user.create.mockResolvedValue(mockCreatedUser);

      await registerAluno(mockReq, mockRes);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 'somesalt');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: alunoData.email, senha: 'hashedPassword123', tipo: UserRole.ALUNO }),
        select: expect.any(Object)
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Aluno cadastrado com sucesso!', user: mockCreatedUser });
    });

    test('deve retornar erro 400 se campos obrigatórios estiverem faltando', async () => {
      mockReq.body = { email: 'teste@teste.com', senha: '123', confirmar_senha: '123' };
      await registerAluno(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    });

    test('deve retornar erro 400 se as senhas não coincidirem', async () => {
      mockReq.body = { ...alunoData, confirmar_senha: 'outrasenha' };
      await registerAluno(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'As senhas não coincidem.' });
    });

    test('deve retornar erro 400 se o email já estiver cadastrado', async () => {
      mockReq.body = alunoData;
      prisma.user.findUnique.mockImplementation(({ where }) => {
        if (where.email === alunoData.email) return Promise.resolve({ id: 'existing-user-id' });
        return Promise.resolve(null);
      });
      await registerAluno(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Este email já está cadastrado.' });
    });
    
    test('deve retornar erro 400 se o CPF já estiver cadastrado', async () => {
      mockReq.body = alunoData;
      prisma.user.findUnique.mockImplementation(({ where }) => {
        if (where.email === alunoData.email) return Promise.resolve(null); // Email não existe
        if (where.cpf === alunoData.cpf) return Promise.resolve({ id: 'existing-user-cpf-id' }); // CPF existe
        return Promise.resolve(null);
      });
      await registerAluno(mockReq, mockRes);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Este CPF já está cadastrado.' });
    });

    test('deve retornar erro 500 se houver erro ao criar usuário no Prisma', async () => {
        mockReq.body = alunoData;
        prisma.user.findUnique.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue('somesalt');
        bcrypt.hash.mockResolvedValue('hashedPassword123');
        prisma.user.create.mockRejectedValue(new Error('Prisma create error'));
        await registerAluno(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Erro interno ao cadastrar usuário." });
    });
  });

  describe('login', () => {
    const loginCredentials = { email: 'logado@example.com', senha: 'password123' };
    const dbUserMock = {
      id: 'user-logged-id', nome_completo: 'Usuário Logado', email: loginCredentials.email,
      senha: 'hashedPasswordFromDB', tipo: UserRole.ALUNO, numero: '123123123',
      foto_perfil: null, data_nascimento: new Date('1995-05-05T00:00:00.000Z'), // Use a data completa para mock
      cpf: '00011122233', curso: 'Engenharia', periodo: 5, matricula: '2023001'
    };
    // O que a função login formata e retorna em 'user' na resposta JSON
    const userForFrontendResponse = {
        id: dbUserMock.id, nome_completo: dbUserMock.nome_completo, email: dbUserMock.email,
        tipo: dbUserMock.tipo, numero: dbUserMock.numero, foto_perfil: dbUserMock.foto_perfil,
        data_nascimento: '1995-05-05', // Como é formatado pelo controller
        cpf: dbUserMock.cpf, curso: dbUserMock.curso, periodo: dbUserMock.periodo, matricula: dbUserMock.matricula,
    };


    test('deve logar um usuário com sucesso e retornar token e dados do usuário', async () => {
      mockReq.body = loginCredentials;
      prisma.user.findUnique.mockResolvedValue(dbUserMock);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'mocked.jwt.token.string');
      });

      await login(mockReq, mockRes);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: loginCredentials.email }, select: expect.any(Object) });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginCredentials.senha, dbUserMock.senha);
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: { id: dbUserMock.id, tipo: dbUserMock.tipo } },
        process.env.JWT_SECRET, // Usa o valor de process.env.JWT_SECRET que definimos no topo/beforeEach
        { expiresIn: '1h' },
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login bem-sucedido!',
        token: 'mocked.jwt.token.string',
        user: userForFrontendResponse // Compara com o objeto formatado
      });
    });

    test('deve retornar 401 se o email não for encontrado', async () => {
      mockReq.body = loginCredentials;
      prisma.user.findUnique.mockResolvedValue(null);
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Credenciais inválidas." });
    });

    test('deve retornar 401 se a senha estiver incorreta', async () => {
      mockReq.body = loginCredentials;
      prisma.user.findUnique.mockResolvedValue(dbUserMock);
      bcrypt.compare.mockResolvedValue(false);
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Credenciais inválidas." });
    });
    
    test('deve retornar erro 500 se jwt.sign falhar', async () => {
        mockReq.body = loginCredentials;
        prisma.user.findUnique.mockResolvedValue(dbUserMock);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockImplementation((payload, secret, options, callback) => {
            callback(new Error('JWT sign error'));
        });
        await login(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro ao gerar token de autenticação.' });
    });
  });
});