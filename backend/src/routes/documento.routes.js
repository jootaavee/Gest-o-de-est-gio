const express = require("express");
const documentoController = require("../controllers/documento.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");
const { UserRole } = require("@prisma/client");

const router = express.Router();

// Rota para Aluno fazer upload de um documento (currículo, tce, tre)
// O middleware 'uploadMiddleware.single("documento")' espera um campo chamado "documento" no form-data
router.post("/meus", 
    authMiddleware.authenticateToken, 
    authMiddleware.authorizeRole(UserRole.ALUNO), 
    uploadMiddleware.single("documento"), // Middleware do Multer para um único arquivo
    documentoController.uploadDocumento
);

// Rota para Aluno visualizar seus documentos enviados
router.get("/meus", authMiddleware.authenticateToken, authMiddleware.authorizeRole(UserRole.ALUNO), documentoController.getMeusDocumentos);

// Rota para Aluno deletar um documento específico
router.delete("/:id", authMiddleware.authenticateToken, authMiddleware.authorizeRole(UserRole.ALUNO), documentoController.deleteDocumento);

// Rota para servir/download de um documento específico (requer autenticação e autorização)
// GET /api/documentos/download/:id (Implementação no controller)
router.get("/download/:id", authMiddleware.authenticateToken, documentoController.downloadDocumento);


module.exports = router;

