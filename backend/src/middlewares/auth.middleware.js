const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

const JWT_SECRET = process.env.JWT_SECRET;

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Se não há token, não autorizado
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Erro na verificação do token:", err);
      return res.sendStatus(403); // Se o token não for válido, proibido
    }
    // Adiciona os dados decodificados do usuário (payload) ao objeto req
    req.user = decoded.user; 
    next(); // Passa para o próximo middleware ou rota
  });
};

// Middleware para autorizar baseado no tipo (Role)
exports.authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.tipo !== requiredRole) {
      return res.status(403).json({ error: "Acesso negado. Permissão insuficiente." });
    }
    next();
  };
};

