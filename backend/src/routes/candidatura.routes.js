// backend/src/routes/candidaturas.routes.js

const express = require("express");
const candidaturaController = require("../controllers/candidatura.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { UserRole } = require("@prisma/client");

const router = express.Router();

// Rota para Aluno se candidatar a uma vaga
// POST /api/candidaturas
router.post(
  "/",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRole(UserRole.ALUNO),
  candidaturaController.createCandidatura
);

// Rota para Aluno visualizar TODAS as suas próprias candidaturas
// GET /api/candidaturas/minhas
router.get(
  "/minhas",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRole(UserRole.ALUNO),
  candidaturaController.getMinhasCandidaturas
);

// ROTA ADICIONADA: Para Aluno verificar se tem candidatura para UMA vaga específica
// GET /api/candidaturas/vaga/:vagaId/minha
router.get(
    "/vaga/:vagaId/minha",
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRole(UserRole.ALUNO),
    candidaturaController.getMinhaCandidaturaPorVaga // Nova função no controller
);

// Rota para Técnico visualizar uma candidatura específica (pode ser descomentada se necessário)
// GET /api/candidaturas/:id
// router.get(
//   "/:id",
//   authMiddleware.authenticateToken,
//   authMiddleware.authorizeRole(UserRole.TECNICO),
//   candidaturaController.getCandidaturaById // Precisaria implementar esta função
// );

// Rota para Técnico atualizar o status de uma candidatura
// PATCH /api/candidaturas/:id/status
router.patch(
  "/:id/status",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRole(UserRole.TECNICO),
  candidaturaController.updateCandidaturaStatus
);

module.exports = router;