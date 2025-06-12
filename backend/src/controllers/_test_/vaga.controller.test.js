// backend/src/controllers/_test_/vaga.controller.test.js

const prisma = require('../../prismaClient'); // Ajuste o caminho se necessário
const { 
    createVaga, 
    getAllVagas, 
    getVagaById, 
    updateVaga, 
    deleteVaga,
    getMinhasVagasTecnico, // Adicionado com base no seu controller
    getVagaCandidaturas   // Adicionado com base no seu controller
} = require('../vaga.controller');
const { UserRole } = require('@prisma/client'); // Para mock de usuário

jest.mock('../../prismaClient', () => ({
  vaga: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  candidatura: { // Necessário para deleteVaga e getVagaCandidaturas
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe('Vaga Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { 
      user: { id: 'tecnico-id-123', tipo: UserRole.TECNICO }, // Usuário técnico mockado
      body: {}, 
      params: {} 
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Testes para createVaga
  describe('createVaga', () => {
    const validVagaData = {
      titulo: 'Nova Vaga de Teste',
      descricao: 'Descrição da vaga de teste',
      empresa: 'Empresa Teste',
      localizacao: 'Local Teste',
      data_abertura: '2024-01-01',
      data_expiracao: '2024-01-31',
      // Outros campos opcionais: remuneracao, carga_horaria, etc.
    };

    test('deve criar uma vaga com sucesso', async () => {
      mockReq.body = validVagaData;
      const mockCreatedVaga = { id: 'vaga-uuid-new', ...validVagaData, criado_por_id: 'tecnico-id-123' };
      prisma.vaga.create.mockResolvedValue(mockCreatedVaga);

      await createVaga(mockReq, mockRes);

      expect(prisma.vaga.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ titulo: validVagaData.titulo, criado_por: { connect: { id: 'tecnico-id-123' } } })
      }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Vaga cadastrada com sucesso!',
        vaga: mockCreatedVaga,
      });
    });

    test('deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
      mockReq.body = { titulo: 'Vaga Incompleta' }; // Faltando descrição, empresa, etc.
      await createVaga(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Campos obrigatórios'),
      }));
    });
  });

  // Testes para getAllVagas
  describe('getAllVagas', () => {
    test('deve retornar todas as vagas ativas', async () => {
      const mockVagas = [
        { id: 'vaga1', titulo: 'Vaga 1', ativa: true },
        { id: 'vaga2', titulo: 'Vaga 2', ativa: true },
      ];
      prisma.vaga.findMany.mockResolvedValue(mockVagas);
      await getAllVagas(mockReq, mockRes);
      expect(prisma.vaga.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { ativa: true },
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockVagas);
    });
  });
  
  // Testes para getMinhasVagasTecnico
  describe('getMinhasVagasTecnico', () => {
    test('deve retornar as vagas criadas pelo técnico logado', async () => {
        const mockMinhasVagas = [{ id: 'vaga-minha-1', titulo: 'Minha Vaga 1', criado_por_id: 'tecnico-id-123' }];
        prisma.vaga.findMany.mockResolvedValue(mockMinhasVagas);

        await getMinhasVagasTecnico(mockReq, mockRes);

        expect(prisma.vaga.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { criado_por_id: 'tecnico-id-123' }
        }));
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockMinhasVagas);
    });
  });


  // Testes para getVagaById
  describe('getVagaById', () => {
    test('deve retornar uma vaga se o ID for válido e a vaga existir', async () => {
      mockReq.params.id = 'vaga-existente-id';
      const mockVaga = { id: 'vaga-existente-id', titulo: 'Vaga Encontrada', criado_por: {} };
      prisma.vaga.findUnique.mockResolvedValue(mockVaga);

      await getVagaById(mockReq, mockRes);
      expect(prisma.vaga.findUnique).toHaveBeenCalledWith({
        where: { id: 'vaga-existente-id' },
        include: expect.any(Object)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockVaga);
    });

    test('deve retornar 404 se a vaga não for encontrada', async () => {
      mockReq.params.id = 'vaga-inexistente-id';
      prisma.vaga.findUnique.mockResolvedValue(null);
      await getVagaById(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Vaga não encontrada.' });
    });
  });

  // Testes para updateVaga
  describe('updateVaga', () => {
    const vagaUpdateData = { titulo: 'Vaga Teste Atualizada', descricao: 'Nova descrição' };
    test('deve atualizar uma vaga com sucesso', async () => {
        mockReq.params.id = 'vaga-para-atualizar-id';
        mockReq.body = vagaUpdateData;
        const mockUpdatedVaga = { id: 'vaga-para-atualizar-id', ...vagaUpdateData };
        prisma.vaga.update.mockResolvedValue(mockUpdatedVaga);

        await updateVaga(mockReq, mockRes);
        expect(prisma.vaga.update).toHaveBeenCalledWith({
            where: { id: 'vaga-para-atualizar-id' },
            data: expect.objectContaining(vagaUpdateData)
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Vaga atualizada com sucesso!'}));
    });

    test('deve retornar 404 se tentar atualizar uma vaga inexistente (P2025)', async () => {
        mockReq.params.id = 'vaga-inexistente-id';
        mockReq.body = vagaUpdateData;
        const prismaError = new Error("Record to update not found.");
        prismaError.code = "P2025"; // Erro do Prisma para "não encontrado para update"
        prisma.vaga.update.mockRejectedValue(prismaError);

        await updateVaga(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Vaga não encontrada para atualização.' });
    });
  });
  
  // Testes para deleteVaga
  describe('deleteVaga', () => {
    test('deve deletar uma vaga e suas candidaturas com sucesso', async () => {
        mockReq.params.id = 'vaga-para-deletar-id';
        prisma.candidatura.deleteMany.mockResolvedValue({ count: 2 }); // Simula 2 candidaturas deletadas
        prisma.vaga.delete.mockResolvedValue({ id: 'vaga-para-deletar-id' }); // Simula vaga deletada

        await deleteVaga(mockReq, mockRes);
        expect(prisma.candidatura.deleteMany).toHaveBeenCalledWith({ where: { vaga_id: 'vaga-para-deletar-id' }});
        expect(prisma.vaga.delete).toHaveBeenCalledWith({ where: { id: 'vaga-para-deletar-id' }});
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Vaga e suas candidaturas associadas foram deletadas com sucesso.'});
    });

    test('deve retornar 404 se tentar deletar vaga inexistente (P2025)', async () => {
        mockReq.params.id = 'vaga-inexistente-id';
        const prismaError = new Error("Record to delete not found.");
        prismaError.code = "P2025";
        // Mockar a primeira operação que falharia (ex: deleteMany pode não falhar se não houver nada para deletar)
        // Mas o vaga.delete é mais provável de lançar P2025 se o ID for inválido para a vaga.
        // Ou, podemos assumir que o `deleteMany` pode ser chamado primeiro, e depois o `vaga.delete`
        prisma.candidatura.deleteMany.mockResolvedValue({ count: 0 }); // Nenhuma candidatura encontrada, ok
        prisma.vaga.delete.mockRejectedValue(prismaError); // Vaga não encontrada para deletar

        await deleteVaga(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Vaga não encontrada para exclusão.' });
    });
  });

  // Testes para getVagaCandidaturas
  describe('getVagaCandidaturas', () => {
    test('deve retornar as candidaturas de uma vaga existente', async () => {
        mockReq.params.id = 'vaga-com-candidaturas-id';
        prisma.vaga.findUnique.mockResolvedValue({ id: 'vaga-com-candidaturas-id' }); // Vaga existe
        const mockCandidaturas = [{id: 'cand1', aluno: {nome_completo: 'Aluno A'}}, {id: 'cand2', aluno: {nome_completo: 'Aluno B'}}];
        prisma.candidatura.findMany.mockResolvedValue(mockCandidaturas);

        await getVagaCandidaturas(mockReq, mockRes);
        expect(prisma.vaga.findUnique).toHaveBeenCalledWith({where: {id: 'vaga-com-candidaturas-id'}});
        expect(prisma.candidatura.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {vaga_id: 'vaga-com-candidaturas-id'}
        }));
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockCandidaturas);
    });

    test('deve retornar 404 se a vaga não for encontrada', async () => {
        mockReq.params.id = 'vaga-inexistente-id';
        prisma.vaga.findUnique.mockResolvedValue(null); // Vaga não existe

        await getVagaCandidaturas(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Vaga não encontrada."});
    });
  });

});