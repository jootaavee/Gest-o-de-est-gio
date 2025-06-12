// backend/src/controllers/_test_/candidatura.controller.test.js

const prisma = require('../../prismaClient');
const { 
    createCandidatura, 
    getMinhasCandidaturas, 
    getMinhaCandidaturaPorVaga,
    updateCandidaturaStatus 
} = require('../candidatura.controller');
const { UserRole, CandidaturaStatus, DocumentType } = require('@prisma/client');

jest.mock('../../prismaClient', () => ({
  candidatura: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  vaga: {
    findUnique: jest.fn(),
  },
  documento: {
    findFirst: jest.fn(),
  }
}));

describe('Candidatura Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { 
      user: { id: 'aluno-id-xyz', tipo: UserRole.ALUNO }, // Mock do aluno logado
      body: {}, 
      params: {} 
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Testes para createCandidatura
  describe('createCandidatura', () => {
    const vagaIdValida = 'vaga-valida-id';
    const mockVagaAberta = { 
        id: vagaIdValida, 
        ativa: true, 
        data_abertura: new Date(Date.now() - 86400000), // Ontem
        data_encerramento: new Date(Date.now() + 86400000) // Amanhã
    };

    test('deve criar uma candidatura com sucesso', async () => {
      mockReq.body.vaga_id = vagaIdValida;
      prisma.vaga.findUnique.mockResolvedValue(mockVagaAberta);
      prisma.candidatura.findUnique.mockResolvedValue(null); // Aluno ainda não se candidatou
      prisma.documento.findFirst.mockResolvedValue({ tipo: DocumentType.CURRICULO }); // Aluno tem currículo
      const mockNovaCandidatura = { id: 'nova-cand-id', vaga_id: vagaIdValida, aluno_id: 'aluno-id-xyz', status: CandidaturaStatus.PENDENTE, vaga:{}, aluno: {} };
      prisma.candidatura.create.mockResolvedValue(mockNovaCandidatura);

      await createCandidatura(mockReq, mockRes);

      expect(prisma.candidatura.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          aluno: { connect: { id: 'aluno-id-xyz' } },
          vaga: { connect: { id: vagaIdValida } },
        })
      }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Candidatura realizada com sucesso!' }));
    });

    test('deve retornar 400 se vaga_id estiver faltando', async () => {
      // mockReq.body já está vazio
      await createCandidatura(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "O ID da vaga é obrigatório no corpo da requisição." });
    });

    test('deve retornar 404 se a vaga não for encontrada', async () => {
      mockReq.body.vaga_id = 'vaga-inexistente';
      prisma.vaga.findUnique.mockResolvedValue(null);
      await createCandidatura(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Vaga não encontrada." });
    });

    test('deve retornar 400 se a vaga não estiver aberta (data de encerramento passada)', async () => {
        mockReq.body.vaga_id = vagaIdValida;
        prisma.vaga.findUnique.mockResolvedValue({ 
            ...mockVagaAberta, 
            data_encerramento: new Date(Date.now() - 86400000*2) // Encerrada ontem
        });
        await createCandidatura(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Esta vaga não está aberta para candidaturas no momento." });
    });
    
    test('deve retornar 400 se a vaga não estiver ativa', async () => {
        mockReq.body.vaga_id = vagaIdValida;
        prisma.vaga.findUnique.mockResolvedValue({ ...mockVagaAberta, ativa: false });
        await createCandidatura(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Esta vaga não está mais ativa." });
    });

    test('deve retornar 400 se o aluno já se candidatou', async () => {
        mockReq.body.vaga_id = vagaIdValida;
        prisma.vaga.findUnique.mockResolvedValue(mockVagaAberta);
        prisma.candidatura.findUnique.mockResolvedValue({ id: 'cand-existente' }); // Já existe candidatura
        await createCandidatura(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Você já se candidatou para esta vaga anteriormente." });
    });

    test('deve retornar 400 se o aluno não tiver currículo', async () => {
        mockReq.body.vaga_id = vagaIdValida;
        prisma.vaga.findUnique.mockResolvedValue(mockVagaAberta);
        prisma.candidatura.findUnique.mockResolvedValue(null);
        prisma.documento.findFirst.mockResolvedValue(null); // Sem currículo
        await createCandidatura(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "É necessário enviar seu currículo antes de se candidatar. Acesse 'Meus Documentos'." });
    });
  });

  // Testes para getMinhasCandidaturas
  describe('getMinhasCandidaturas', () => {
    test('deve retornar as candidaturas do aluno logado', async () => {
      const mockCandidaturas = [{ id: 'cand1' }, { id: 'cand2' }];
      prisma.candidatura.findMany.mockResolvedValue(mockCandidaturas);
      await getMinhasCandidaturas(mockReq, mockRes);
      expect(prisma.candidatura.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { aluno_id: 'aluno-id-xyz' },
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCandidaturas);
    });
  });

  // Testes para getMinhaCandidaturaPorVaga
  describe('getMinhaCandidaturaPorVaga', () => {
    test('deve retornar uma candidatura específica se existir', async () => {
        mockReq.params.vagaId = 'vaga-especifica-id';
        const mockCandidatura = {id: 'cand-especifica', vaga_id: 'vaga-especifica-id'};
        prisma.candidatura.findUnique.mockResolvedValue(mockCandidatura);
        await getMinhaCandidaturaPorVaga(mockReq, mockRes);
        expect(prisma.candidatura.findUnique).toHaveBeenCalledWith(expect.objectContaining({
            where: { aluno_id_vaga_id: { aluno_id: 'aluno-id-xyz', vaga_id: 'vaga-especifica-id' }}
        }));
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockCandidatura);
    });
    test('deve retornar 404 se a candidatura para a vaga específica não existir', async () => {
        mockReq.params.vagaId = 'vaga-sem-candidatura-id';
        prisma.candidatura.findUnique.mockResolvedValue(null);
        await getMinhaCandidaturaPorVaga(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Nenhuma candidatura encontrada para esta vaga." });
    });
  });
  
  // Testes para updateCandidaturaStatus (Assume que o usuário é Técnico)
  describe('updateCandidaturaStatus', () => {
      beforeEach(() => {
        // Para este teste, o usuário no req deveria ser um técnico
        mockReq.user = { id: 'tecnico-atualizador-id', tipo: UserRole.TECNICO };
      });

    test('deve atualizar o status de uma candidatura com sucesso', async () => {
        mockReq.params.id = 'candidatura-para-atualizar-id'; // ID da candidatura
        mockReq.body.status = CandidaturaStatus.APROVADO;
        prisma.candidatura.findUnique.mockResolvedValue({id: 'candidatura-para-atualizar-id'}); // Simula que a candidatura existe
        const mockUpdatedCandidatura = { id: 'candidatura-para-atualizar-id', status: CandidaturaStatus.APROVADO };
        prisma.candidatura.update.mockResolvedValue(mockUpdatedCandidatura);

        await updateCandidaturaStatus(mockReq, mockRes);
        expect(prisma.candidatura.update).toHaveBeenCalledWith(expect.objectContaining({
            where: {id: 'candidatura-para-atualizar-id'},
            data: {status: CandidaturaStatus.APROVADO}
        }));
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({message: expect.stringContaining('Status da candidatura atualizado')}));
    });

    test('deve retornar 400 para status inválido', async () => {
        mockReq.params.id = 'candidatura-id';
        mockReq.body.status = 'STATUS_INVALIDO';
        await updateCandidaturaStatus(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Status inválido.')}));
    });
    
    test('deve retornar 404 se a candidatura a ser atualizada não for encontrada', async () => {
        mockReq.params.id = 'candidatura-inexistente-id';
        mockReq.body.status = CandidaturaStatus.REPROVADO;
        prisma.candidatura.findUnique.mockResolvedValue(null); // Simula candidatura não existente
        await updateCandidaturaStatus(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Candidatura não encontrada."});
    });
  });
});