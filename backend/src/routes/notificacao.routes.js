// backend/src/routes/notificacao.routes.js

const express = require("express");
const notificacaoController = require("../controllers/notificacao.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { UserRole } = require("@prisma/client");

const router = express.Router();

// Retorna apenas as notificações NÃO LIDAS para o contador do sino
router.get("/nao-lidas", 
    authMiddleware.authenticateToken, 
    notificacaoController.listarNaoLidas
);

// Marca TODAS as notificações como lidas quando o sino é aberto
router.post("/marcar-como-lidas", 
    authMiddleware.authenticateToken, 
    notificacaoController.marcarTodasComoLidas
);

// Rota para Técnico enviar uma notificação para um Aluno específico
router.post("/enviar",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.TECNICO),
    notificacaoController.sendNotificacao
);

// Rota para Aluno listar TODAS as suas notificações (para uma página completa)
router.get("/usuario/me",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.ALUNO),
    notificacaoController.getMinhasNotificacoes
);

// Rota para Aluno marcar UMA notificação como lida
router.patch("/:id/lida",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.ALUNO),
    notificacaoController.markAsRead
);


module.exports = router;