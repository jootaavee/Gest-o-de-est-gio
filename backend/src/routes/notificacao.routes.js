const express = require("express");
const notificacaoController = require("../controllers/notificacao.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { UserRole } = require("@prisma/client");

const router = express.Router();

router.get("/nao-lidas", 
    authMiddleware.authenticateToken, 
    notificacaoController.listarNaoLidas
);

router.post("/marcar-como-lidas", 
    authMiddleware.authenticateToken, 
    notificacaoController.marcarTodasComoLidas
);

router.post("/enviar",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.TECNICO),
    notificacaoController.sendNotificacao
);

router.get("/usuario/me",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.ALUNO),
    notificacaoController.getMinhasNotificacoes
);

router.patch("/:id/lida",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.ALUNO),
    notificacaoController.markAsRead
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    notificacaoController.deleteNotificacao
);

module.exports = router;