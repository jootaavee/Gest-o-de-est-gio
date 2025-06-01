// backend/src/routes/vagas.routes.js

const express = require("express");
const vagaController = require("../controllers/vaga.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { UserRole } = require("@prisma/client");

const router = express.Router();

// ROTA PRINCIPAL DE LISTAGEM DE VAGAS (PÚBLICAS OU PARA TODOS OS AUTENTICADOS)
// GET /api/vagas
router.get(
  "/",
  authMiddleware.authenticateToken, // Todos os usuários logados podem ver
  vagaController.getAllVagas // Esta função no controller deve filtrar por ativa:true ou outra lógica pública
);

// ROTA PARA TÉCNICO VER SUAS PRÓPRIAS VAGAS CRIADAS
// GET /api/vagas/tecnico/minhas
router.get(
  "/tecnico/minhas",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRole(UserRole.TECNICO),
  vagaController.getMinhasVagasTecnico // Nova função no controller
);

// ROTA PARA OBTER DETALHES DE UMA VAGA ESPECÍFICA POR ID
// GET /api/vagas/:id
router.get(
  "/:id",
  authMiddleware.authenticateToken,
  vagaController.getVagaById
);

// --- Rotas de Gerenciamento para Técnico ---

// CRIAR NOVA VAGA
// POST /api/vagas
router.post(
  "/",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRole(UserRole.TECNICO),
  vagaController.createVaga
);

// ATUALIZAR VAGA
// PUT /api/vagas/:id
router.put(
  "/:id",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRole(UserRole.TECNICO),
  vagaController.updateVaga
);

// DELETAR VAGA
// DELETE /api/vagas/:id
router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRole(UserRole.TECNICO),
  vagaController.deleteVaga
);

// VER CANDIDATURAS DE UMA VAGA
// GET /api/vagas/:id/candidaturas
router.get(
  "/:id/candidaturas",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRole(UserRole.TECNICO),
  vagaController.getVagaCandidaturas
);

module.exports = router;