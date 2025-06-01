// backend/src/routes/user.routes.js

const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { UserRole } = require("@prisma/client");

const router = express.Router();

// Rota para buscar o perfil do usuário logado
// Acessível por GET /api/usuarios/profile (ou o path base que você usa + /profile)
router.get(
    "/profile", 
    authMiddleware.authenticateToken,
    userController.getUserProfile // Esta função DEVE retornar o campo 'configuracoes'
);

// Rota para atualizar o perfil principal do usuário logado (Aluno ou Técnico)
// Acessível por PUT /api/usuarios/profile
router.put(
    "/profile", 
    authMiddleware.authenticateToken,
    userController.updateUserProfile
);

// ROTA PARA ATUALIZAR AS CONFIGURAÇÕES (tema, idioma, etc.) DO USUÁRIO LOGADO
// Acessível por PUT /api/usuarios/me/configuracoes (conforme o frontend chama)
router.put(
    "/me/configuracoes", // Rota específica para as configurações, como o frontend está chamando
    authMiddleware.authenticateToken,
    userController.updateUserConfiguracoes 
);

// --- Rotas de ADMIN/TÉCNICO ---

// Rota para buscar todos os alunos
// Acessível por GET /api/usuarios/alunos
router.get(
    "/alunos",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.TECNICO),
    userController.getAllAlunos
);

// Rota para buscar um aluno específico por ID
// Acessível por GET /api/usuarios/alunos/:id
router.get(
    "/alunos/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.TECNICO),
    userController.getAlunoById
);

module.exports = router;