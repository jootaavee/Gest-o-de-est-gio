const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Diretório onde os uploads serão armazenados
const uploadDir = path.join(__dirname, "../../uploads");

// Cria o diretório de uploads se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de armazenamento do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Define o diretório de destino
  },
  filename: function (req, file, cb) {
    // Define o nome do arquivo: timestamp + id do usuário + nome original
    // Isso ajuda a evitar conflitos de nome e associa o arquivo ao usuário
    const uniqueSuffix = Date.now() + "-" + req.user.id;
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Filtro de arquivos (opcional - permitir apenas certos tipos, ex: PDF)
const fileFilter = (req, file, cb) => {
  // Exemplo: permitir apenas PDFs
  // if (file.mimetype === "application/pdf") {
  //   cb(null, true);
  // } else {
  //   cb(new Error("Tipo de arquivo não suportado. Envie apenas PDF."), false);
  // }
  // Por enquanto, aceita qualquer arquivo enviado pelo campo "documento"
  cb(null, true);
};

// Configuração do Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // Limite de 10MB por arquivo (ajuste conforme necessário)
  },
});

module.exports = upload;

