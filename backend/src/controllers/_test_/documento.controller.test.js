// backend/src/controllers/_test_/documento.controller.test.js

const fs = require('fs');
const path = require('path');
const prisma = require('../../prismaClient');
const {
    uploadDocumento,
    getMeusDocumentos,
    deleteDocumento,
    downloadDocumento,
} = require('../documento.controller');
const { UserRole, DocumentType } = require('@prisma/client');

// Mockar os módulos `fs` e `prisma`
jest.mock('fs');
jest.mock('../../prismaClient', () => ({
  documento: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe('Documento Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            user: { id: 'aluno-id', tipo: UserRole.ALUNO },
            body: {},
            params: {},
            file: { // Mock do arquivo enviado pelo multer
                path: '/fake/path/to/uploads/newfile.pdf',
                filename: 'newfile.pdf',
                originalname: 'meu_curriculo.pdf'
            }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            sendFile: jest.fn(),
            setHeader: jest.fn(),
        };
    });

    describe('uploadDocumento', () => {
        it('deve criar um novo documento com sucesso', async () => {
            mockReq.body.tipo = DocumentType.CURRICULO;
            prisma.documento.findFirst.mockResolvedValue(null); // Nenhum documento existente
            prisma.documento.create.mockResolvedValue({ id: 'doc-novo-id', ...mockReq.body });

            await uploadDocumento(mockReq, mockRes);
            
            expect(prisma.documento.create).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: `Documento (CURRICULO) enviado com sucesso!` }));
        });
        
        it('deve atualizar um documento existente com sucesso', async () => {
            mockReq.body.tipo = DocumentType.CURRICULO;
            const existingDoc = { id: 'doc-existente-id', path: 'oldfile.pdf' };
            prisma.documento.findFirst.mockResolvedValue(existingDoc);
            prisma.documento.update.mockResolvedValue({ id: 'doc-existente-id', ...mockReq.body });
            fs.existsSync.mockReturnValue(true); // Simula que o arquivo antigo existe
            
            await uploadDocumento(mockReq, mockRes);
            
            expect(prisma.documento.update).toHaveBeenCalled();
            expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('oldfile.pdf'));
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: `Documento (CURRICULO) atualizado com sucesso!` }));
        });

        it('deve retornar 400 se nenhum arquivo for enviado', async () => {
            mockReq.file = null; // Simula a ausência do arquivo
            await uploadDocumento(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Nenhum arquivo foi enviado.' });
        });

        it('deve retornar 400 e deletar o arquivo se o tipo de documento for inválido', async () => {
            mockReq.body.tipo = 'TIPO_INVALIDO';
            await uploadDocumento(mockReq, mockRes);
            
            expect(fs.unlinkSync).toHaveBeenCalledWith(mockReq.file.path);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('deleteDocumento', () => {
        it('deve deletar um documento e o arquivo físico com sucesso', async () => {
            mockReq.params.id = 'doc-a-deletar';
            const mockDoc = { id: 'doc-a-deletar', aluno_id: 'aluno-id', path: 'file_to_delete.pdf' };
            prisma.documento.findUnique.mockResolvedValue(mockDoc);
            fs.existsSync.mockReturnValue(true);

            await deleteDocumento(mockReq, mockRes);
            
            expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('file_to_delete.pdf'));
            expect(prisma.documento.delete).toHaveBeenCalledWith({ where: { id: 'doc-a-deletar' } });
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('deve retornar 404 se o documento não for encontrado ou não pertencer ao usuário', async () => {
            mockReq.params.id = 'outro-doc';
            // Simula documento de outro usuário
            prisma.documento.findUnique.mockResolvedValue({ id: 'outro-doc', aluno_id: 'outro-aluno-id' }); 

            await deleteDocumento(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(prisma.documento.delete).not.toHaveBeenCalled();
        });
    });

    describe('downloadDocumento', () => {
        const mockDoc = { id: 'doc-id', aluno_id: 'aluno-id', path: 'download_file.pdf', nome_original: 'original_name.pdf' };

        beforeEach(() => {
            fs.existsSync.mockReturnValue(true);
        });

        it('deve permitir que o dono do documento faça o download', async () => {
            mockReq.params.id = 'doc-id';
            prisma.documento.findUnique.mockResolvedValue(mockDoc);
            
            await downloadDocumento(mockReq, mockRes);
            
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="original_name.pdf"');
            expect(mockRes.sendFile).toHaveBeenCalledWith(expect.stringContaining('download_file.pdf'));
        });
        
        it('deve permitir que um técnico faça o download de qualquer documento', async () => {
            mockReq.user.tipo = UserRole.TECNICO; // Muda o tipo do usuário para técnico no teste
            mockReq.params.id = 'doc-id';
            // Documento pertence a outro aluno, mas o usuário logado é técnico
            prisma.documento.findUnique.mockResolvedValue({ ...mockDoc, aluno_id: 'outro-aluno' });
            
            await downloadDocumento(mockReq, mockRes);

            expect(mockRes.sendFile).toHaveBeenCalled();
        });

        it('deve retornar 403 se um aluno tentar baixar um documento que não é seu', async () => {
            mockReq.params.id = 'doc-id';
            // Simula que o documento pertence a outro aluno
            prisma.documento.findUnique.mockResolvedValue({ ...mockDoc, aluno_id: 'outro-aluno-id' });
            
            await downloadDocumento(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });
});