// backend/src/middlewares/upload.middleware.js (VERSÃO CORRIGIDA E TESTÁVEL)

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const configureUpload = () => {
    const uploadDir = path.join(__dirname, "../../uploads");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            // Requer que req.user esteja disponível, então authenticateToken deve rodar antes
            const uniqueSuffix = Date.now() + "-" + (req.user?.id || 'unknown_user');
            cb(null, uniqueSuffix + "-" + file.originalname);
        },
    });

    const fileFilter = (req, file, cb) => {
        cb(null, true);
    };

    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 1024 * 1024 * 10,
        },
    });

    return upload;
};

// Em vez de exportar o resultado, exportamos a função que o cria
module.exports = configureUpload(); // AINDA EXPORTAMOS A INSTÂNCIA PARA O APP USAR
// Para os testes, vamos importar e testar `configureUpload`
module.exports.configureUploadForTest = configureUpload; 