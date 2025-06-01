const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Rota para cadastro de Aluno
router.post("/register/aluno", authController.registerAluno);

// Rota para login (Aluno e Técnico)
router.post("/login", authController.login);

// Rota para cadastro de Técnico (Pode ser interna ou protegida)
// Por segurança, o PDF sugere que o técnico é cadastrado direto no banco.
// Vamos criar uma rota protegida para isso posteriormente, ou deixar para o seed.
// router.post("/register/tecnico", authController.registerTecnico); 

module.exports = router;

