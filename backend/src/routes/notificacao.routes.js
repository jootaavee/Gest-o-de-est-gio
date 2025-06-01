const express = require("express");
const notificacaoController = require("../controllers/notificacao.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { UserRole } = require("@prisma/client");

const router = express.Router();

// Rota para Técnico enviar uma notificação para um Aluno específico
router.post("/enviar", authMiddleware.authenticateToken, authMiddleware.authorizeRole(UserRole.TECNICO), notificacaoController.sendNotificacao);

router.get("/usuario/me", authMiddleware.authenticateToken, authMiddleware.authorizeRole(UserRole.ALUNO), notificacaoController.getMinhasNotificacoes);

// Rota para Aluno marcar uma notificação como lida
router.patch("/:id/lida", authMiddleware.authenticateToken, authMiddleware.authorizeRole(UserRole.ALUNO), notificacaoController.markAsRead);

// Rota para Técnico listar notificações enviadas (opcional)
// router.get("/enviadas", authMiddleware.authenticateToken, authMiddleware.authorizeRole(UserRole.TECNICO), notificacaoController.getNotificacoesEnviadas);

module.exports = router;

