// backend/src/controllers/_test_/user.controller.test.js

const prisma = require('../../prismaClient');
// Importar defaultUserConfigurations se ele for exportado pelo controller,
// ou defini-lo aqui no teste para a asserção.
const { 
    getUserProfile, 
    updateUserConfiguracoes,
    // Se defaultUserConfigurations não é exportado de user.controller, defina-o aqui:
    // formatUserData // (NÃO precisa importar formatUserData se ele NÃO é exportado)
} = require('../user.controller');
const { UserRole } = require('@prisma/client');

// Se defaultUserConfigurations não for exportado pelo user.controller.js,
// defina uma cópia dele aqui para usar nos testes.
const testDefaultUserConfigurations = {
  tema: 'light',
  idioma: 'pt-br',
  notificacoesEmail: true,
};


jest.mock('../../prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

describe('User Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { user: { id: 'user-profile-id' }, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getUserProfile', () => {
    test('deve retornar o perfil do usuário e status 200 se o usuário for encontrado', async () => {
      const mockUserFromDb = {
        id: 'user-profile-id', nome_completo: 'Perfil Teste', email: 'perfil@teste.com',
        tipo: UserRole.ALUNO, configuracoes: { tema: 'dark', idioma: 'en', notificacoesEmail: false },
        data_nascimento: new Date('1990-07-10T00:00:00.000Z'), numero: '123'
      };
      prisma.user.findUnique.mockResolvedValue(mockUserFromDb);

      await getUserProfile(mockReq, mockRes);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-profile-id' },
        select: expect.any(Object),
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        nome_completo: 'Perfil Teste',
        data_nascimento: '1990-07-10', // Após formatação
        configuracoes: { tema: 'dark', idioma: 'en', notificacoesEmail: false },
      }));
    });

    test('deve formatar data de nascimento e usar configurações padrão se não presentes no DB', async () => {
        const mockUserFromDb = {
            id: 'user-profile-id', nome_completo: 'Perfil Sem Data Ou Config',
            email: 'perfil2@teste.com', tipo: UserRole.ALUNO,
            data_nascimento: new Date('1990-12-20T03:00:00.000Z'), // Para garantir que a data ISO seja '1990-12-20'
            configuracoes: null // Configurações não definidas no DB
        };
        prisma.user.findUnique.mockResolvedValue(mockUserFromDb);
    
        await getUserProfile(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        // A função formatUserData no controller vai aplicar os padrões.
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            data_nascimento: '1990-12-20',
            configuracoes: testDefaultUserConfigurations // CORREÇÃO AQUI
        }));
    });

    test('deve retornar 404 se o usuário não for encontrado', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await getUserProfile(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });
  });

  describe('updateUserConfiguracoes', () => {
    const validConfigData = { tema: 'dark', idioma: 'en', notificacoesEmail: false };

    test('deve atualizar as configurações do usuário com sucesso', async () => {
      mockReq.body = validConfigData;
      const mockUpdatedUser = { configuracoes: validConfigData };
      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      await updateUserConfiguracoes(mockReq, mockRes);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-profile-id' },
        data: { configuracoes: validConfigData },
        select: { configuracoes: true },
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Suas configurações foram atualizadas com sucesso!',
        configuracoes: validConfigData,
      });
    });

    test('deve retornar 400 se algum campo de configuração estiver faltando', async () => {
      mockReq.body = { tema: 'light', idioma: 'pt-br' }; // Faltando notificacoesEmail
      await updateUserConfiguracoes(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Todos os campos de configuração (tema, idioma, notificacoesEmail) são obrigatórios." });
    });
  });
});