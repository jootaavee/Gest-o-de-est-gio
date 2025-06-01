const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { UserRole } = require("@prisma/client");

const router = express.Router();

// Rota para buscar o perfil do usuário logado
router.get("/profile", authMiddleware.authenticateToken, userController.getUserProfile);

// Rota para atualizar o perfil do usuário logado (Aluno ou Técnico)
router.put("/profile", authMiddleware.authenticateToken, userController.updateUserProfile);

// Rota para buscar todos os alunos (acesso restrito ao Técnico)
router.get("/alunos", authMiddleware.authenticateToken, authMiddleware.authorizeRole(UserRole.TECNICO), userController.getAllAlunos);

// Rota para buscar um aluno específico por ID (acesso restrito ao Técnico)
router.get("/alunos/:id", authMiddleware.authenticateToken, authMiddleware.authorizeRole(UserRole.TECNICO), userController.getAlunoById);

// Outras rotas relacionadas a usuários (ex: deletar usuário) podem ser adicionadas aqui

module.exports = router;

