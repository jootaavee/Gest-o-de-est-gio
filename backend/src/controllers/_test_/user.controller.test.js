const prisma = require('../../prismaClient');
const bcrypt = require('bcrypt');
const { 
    getUserProfile, updateUserProfile, updateUserConfiguracoes, getAllAlunos, getAlunoById 
} = require('../user.controller');
const { UserRole } = require('@prisma/client');

jest.mock('../../prismaClient', () => ({
  user: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), },
}));
jest.mock('bcrypt');

describe('User Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { user: { id: 'user-id', tipo: UserRole.ALUNO }, body: {}, params: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn(), };
  });

  // Describe para getUserProfile (sem mudanças)
  describe('getUserProfile', () => { /* ... seus testes de getUserProfile aqui ... */ });

  describe('updateUserProfile', () => {
    const mockUserFromDb = { id: 'user-id', tipo: UserRole.ALUNO, email: 'original@teste.com', senha: 'hashedPassword' };
    
    beforeEach(() => {
        prisma.user.findUnique.mockResolvedValue(mockUserFromDb);
    });

    // ... outros testes de updateUserProfile aqui ...
    test('deve atualizar os dados do aluno com sucesso', async () => {
        mockReq.body = { nome_completo: 'Nome Atualizado', curso: 'Ciência da Computação' };
        prisma.user.update.mockResolvedValue({ ...mockUserFromDb, ...mockReq.body });
        await updateUserProfile(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
            data: { nome_completo: 'Nome Atualizado', curso: 'Ciência da Computação' }
        }));
    });


    // CORREÇÃO 1: Adicionar a senha antiga ao corpo da requisição
    test('deve retornar 400 se a nova senha e a confirmação não coincidirem', async () => {
        mockReq.body = {
            senha_antiga: 'any_password', // Necessário para passar da primeira validação
            nova_senha: 'newpass',
            confirmar_nova_senha: 'differentpass'
        };
        await updateUserProfile(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "As novas senhas não coincidem." });
    });

    test('deve retornar 400 se a senha antiga estiver incorreta', async () => {
        mockReq.body = { senha_antiga: 'wrongoldpass', nova_senha: 'newpass', confirmar_nova_senha: 'newpass' };
        bcrypt.compare.mockResolvedValue(false);
        await updateUserProfile(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Senha atual incorreta." });
    });
    
    // CORREÇÃO 2: Mockar o bcrypt.genSalt
    test('deve atualizar a senha com sucesso se todos os dados estiverem corretos', async () => {
        mockReq.body = { senha_antiga: 'correctoldpass', nova_senha: 'newpassword123', confirmar_nova_senha: 'newpassword123' };
        const fakeSalt = '$2b$10$somefakesalt';
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.genSalt.mockResolvedValue(fakeSalt); // Mock do genSalt
        bcrypt.hash.mockResolvedValue('hashedNewPassword');
        
        prisma.user.update.mockResolvedValue({});
        await updateUserProfile(mockReq, mockRes);

        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', fakeSalt);
        expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
            data: { senha: 'hashedNewPassword' }
        }));
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    // ... resto dos testes (getAllAlunos, getAlunoById, etc.) sem mudanças ...
    test('deve retornar 400 se nenhum dado for fornecido para atualização', async () => {
        mockReq.body = {}; // Corpo vazio
        await updateUserProfile(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Nenhum dado fornecido para atualização do perfil." });
    });
  });

  // Outros describes (getAllAlunos, getAlunoById) aqui
  describe('getAllAlunos', () => {
      test('deve retornar uma lista de todos os alunos com status 200', async () => {
          const mockAlunos = [
              { id: 'aluno1', nome_completo: 'Aluno A', email: 'alunoa@teste.com' },
              { id: 'aluno2', nome_completo: 'Aluno B', email: 'alunob@teste.com' }
          ];
          prisma.user.findMany.mockResolvedValue(mockAlunos);
          
          await getAllAlunos(mockReq, mockRes);
          
          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.json).toHaveBeenCalledWith(expect.any(Array));
          expect(mockRes.json.mock.calls[0][0].length).toBe(2);
          expect(mockRes.json.mock.calls[0][0][0].nome_completo).toBe('Aluno A');
      });
  });

  describe('getAlunoById', () => {
      test('deve retornar os detalhes de um aluno específico', async () => {
          mockReq.params.id = 'aluno-id-123';
          const mockAluno = { id: 'aluno-id-123', nome_completo: 'Aluno Detalhado', tipo: UserRole.ALUNO };
          prisma.user.findUnique.mockResolvedValue(mockAluno);

          await getAlunoById(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ nome_completo: 'Aluno Detalhado' }));
          expect(prisma.user.findUnique).toHaveBeenCalledWith({
              where: { id: 'aluno-id-123', tipo: UserRole.ALUNO },
              include: expect.any(Object)
          });
      });

      test('deve retornar 404 se nenhum aluno for encontrado com o ID fornecido', async () => {
          mockReq.params.id = 'id-nao-existe';
          prisma.user.findUnique.mockResolvedValue(null);
          
          await getAlunoById(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(404);
          expect(mockRes.json).toHaveBeenCalledWith({ error: "Aluno não encontrado ou o ID não corresponde a um aluno." });
      });
  });

});