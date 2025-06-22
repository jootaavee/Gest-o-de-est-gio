require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes (serão criados a seguir)
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const vagaRoutes = require("./src/routes/vaga.routes");
const candidaturaRoutes = require("./src/routes/candidatura.routes");
const documentoRoutes = require("./src/routes/documento.routes");
const notificacaoRoutes = require("./src/routes/notificacao.routes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Configurar origens permitidas em produção
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (para uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/vagas", vagaRoutes);
app.use("/api/candidaturas", candidaturaRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/notificacoes", notificacaoRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.send("Backend Sistema de Estágio rodando!");
});

// Error Handling Middleware (simples)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Algo deu errado!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

