
const prisma = require('../../prismaClient');
const {
    sendNotificacao,
    getMinhasNotificacoes,
    markAsRead,
    listarNaoLidas,
    marcarTodasComoLidas,
    deleteNotificacao
} = require('../notificacao.controller');
const { UserRole } = require('@prisma/client');

// Mocking do Prisma Client para todas as operações necessárias
jest.mock('../../prismaClient', () => ({
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    notificacao: {
        createMany: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
    }
}));

describe('Notificacao Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            user: { id: 'test-user-id', tipo: UserRole.TECNICO }, // Usuário padrão
            body: {},
            params: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('sendNotificacao', () => {
        const baseBody = { titulo: 'Teste', mensagem: 'Mensagem de teste' };

        it('deve enviar notificação para um aluno por matrícula com sucesso', async () => {
            mockReq.body = { ...baseBody, tipo_destinatario: 'MATRICULA', valor_destinatario: '12345' };
            prisma.user.findUnique.mockResolvedValue({ id: 'aluno-id-123', tipo: UserRole.ALUNO });

            await sendNotificacao(mockReq, mockRes);

            expect(prisma.notificacao.createMany).toHaveBeenCalledWith({
                data: [{
                    titulo: 'Teste',
                    mensagem: 'Mensagem de teste',
                    enviado_por_id: 'test-user-id',
                    destinatario_id: 'aluno-id-123'
                }]
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Notificação enviada com sucesso para 1 aluno(s)!" });
        });

        it('deve enviar notificações para um curso com sucesso', async () => {
            mockReq.body = { ...baseBody, tipo_destinatario: 'CURSO', valor_destinatario: 'Direito' };
            const mockAlunos = [{ id: 'aluno-a' }, { id: 'aluno-b' }];
            prisma.user.findMany.mockResolvedValue(mockAlunos);

            await sendNotificacao(mockReq, mockRes);

            expect(prisma.notificacao.createMany).toHaveBeenCalled();
            expect(prisma.notificacao.createMany.mock.calls[0][0].data.length).toBe(2); // Verifica se 2 notificações foram criadas
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Notificação enviada com sucesso para 2 aluno(s)!' });
        });

        it('deve enviar notificações para TODOS os alunos com sucesso', async () => {
            mockReq.body = { ...baseBody, tipo_destinatario: 'TODOS' };
            const mockAlunos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
            prisma.user.findMany.mockResolvedValue(mockAlunos);
            
            await sendNotificacao(mockReq, mockRes);
            
            expect(prisma.notificacao.createMany).toHaveBeenCalled();
            expect(prisma.notificacao.createMany.mock.calls[0][0].data.length).toBe(3);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('deve retornar 404 se a matrícula não for encontrada', async () => {
            mockReq.body = { ...baseBody, tipo_destinatario: 'MATRICULA', valor_destinatario: 'nao-existe' };
            prisma.user.findUnique.mockResolvedValue(null);

            await sendNotificacao(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Aluno com matrícula nao-existe não encontrado.' });
        });

        it('deve retornar 400 se faltarem campos obrigatórios', async () => {
            mockReq.body = { tipo_destinatario: 'TODOS' }; // Faltando título e mensagem

            await sendNotificacao(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "Tipo de destinatário, título e mensagem são obrigatórios." });
        });
    });

    describe('getMinhasNotificacoes', () => {
        it('deve retornar as notificações de um usuário com sucesso', async () => {
            const mockNotificacoes = [{ id: 'n1', titulo: 'Vaga nova' }];
            prisma.notificacao.findMany.mockResolvedValue(mockNotificacoes);
            
            await getMinhasNotificacoes(mockReq, mockRes);
            
            expect(mockRes.json).toHaveBeenCalledWith(mockNotificacoes);
        });
    });
    
    describe('deleteNotificacao', () => {
        it('deve deletar uma notificação com sucesso', async () => {
            mockReq.params.id = 'notificacao-para-deletar';
            prisma.notificacao.deleteMany.mockResolvedValue({ count: 1 });

            await deleteNotificacao(mockReq, mockRes);

            expect(prisma.notificacao.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: 'notificacao-para-deletar',
                    destinatario_id: 'test-user-id',
                },
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Notificação deletada com sucesso.' });
        });

        it('deve retornar 404 se a notificação não existir ou não pertencer ao usuário', async () => {
            mockReq.params.id = 'id-errado';
            prisma.notificacao.deleteMany.mockResolvedValue({ count: 0 });
            
            await deleteNotificacao(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Notificação não encontrada ou você não tem permissão para deletá-la.' });
        });
    });

    describe('listarNaoLidas', () => {
        it('deve listar as notificações não lidas de um usuário', async () => {
            const mockNaoLidas = [{ id: 'nl1', titulo: 'Nao lida', lida: false }];
            prisma.notificacao.findMany.mockResolvedValue(mockNaoLidas);
            
            await listarNaoLidas(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockNaoLidas);
        });
    });
});