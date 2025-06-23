// backend/src/middlewares/_test_/upload.middleware.test.js (VERSÃO CORRIGIDA)

const { configureUploadForTest } = require('../upload.middleware');
const multer = require('multer');

jest.mock('multer', () => {
    const storageMock = jest.fn();
    const multerFn = jest.fn(() => ({}));
    multerFn.diskStorage = storageMock;
    return multerFn;
});

describe('Upload Middleware Configuration', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Limpa mocks antes de cada teste
    });

    it('deve chamar o multer com a configuração correta', () => {
        // Chama a função de configuração para acionar a lógica
        configureUploadForTest();

        expect(multer).toHaveBeenCalled();
        const multerOptions = multer.mock.calls[0][0];

        expect(multerOptions).toHaveProperty('storage');
        expect(multerOptions).toHaveProperty('fileFilter');
        expect(multerOptions).toHaveProperty('limits');
        expect(multerOptions.limits.fileSize).toBe(10 * 1024 * 1024);
    });

    it('deve configurar o destino (destination) corretamente', () => {
        configureUploadForTest();

        const storageOptions = multer.diskStorage.mock.calls[0][0];
        const destinationFn = storageOptions.destination;
        const cbMock = jest.fn();

        destinationFn({}, {}, cbMock);

        expect(cbMock).toHaveBeenCalledWith(null, expect.stringContaining('uploads'));
    });

    it('deve gerar um nome de arquivo (filename) único e correto', () => {
        configureUploadForTest();

        const storageOptions = multer.diskStorage.mock.calls[0][0];
        const filenameFn = storageOptions.filename;
        const cbMock = jest.fn();
        const mockReq = { user: { id: 'test-user-id-123' } };
        const mockFile = { originalname: 'document.pdf' };
        
        // Simula o Date.now para ter um resultado previsível
        const fixedTimestamp = 1678886400000;
        jest.spyOn(Date, 'now').mockImplementation(() => fixedTimestamp);

        filenameFn(mockReq, mockFile, cbMock);
        
        const expectedFilename = `${fixedTimestamp}-${mockReq.user.id}-${mockFile.originalname}`;
        expect(cbMock).toHaveBeenCalledWith(null, expectedFilename);

        // Restaura o mock do Date.now
        Date.now.mockRestore();
    });
});