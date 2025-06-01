const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserRole } = require("@prisma/client");

const JWT_SECRET = process.env.JWT_SECRET;

// Função para registrar um novo Aluno
exports.registerAluno = async (req, res) => {
  const {
    nome_completo,
    email,
    senha,
    confirmar_senha,
    numero,
    data_nascimento,
    cpf,
    curso,
    periodo,
    matricula
  } = req.body;

  // Validação básica
  if (!nome_completo || !email || !senha || !confirmar_senha || !cpf) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  if (senha !== confirmar_senha) {
    return res.status(400).json({ error: "As senhas não coincidem." });
  }

  try {
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Este email já está cadastrado." });
    }

    // Verificar se o CPF já existe
    const cpfExistente = await prisma.user.findUnique({
      where: { cpf },
    });

    if (cpfExistente) {
      return res.status(400).json({ error: "Este CPF já está cadastrado." });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // Criar usuário Aluno
    const newUser = await prisma.user.create({
      data: {
        nome_completo,
        email,
        senha: hashedPassword,
        numero,
        cpf,
        data_nascimento: new Date(data_nascimento),
        curso,
        periodo,
        matricula,
        tipo: UserRole.ALUNO,
      },
      select: {
        id: true,
        nome_completo: true,
        email: true,
        tipo: true,
        numero: true,
        curso: true,
        periodo: true,
        matricula: true
      }
    });

    return res.status(201).json({
      message: "Aluno cadastrado com sucesso!",
      user: newUser
    });

  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    return res.status(500).json({ error: "Erro interno ao cadastrar usuário." });
  }
};

// Função para login (Aluno e Técnico)
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  try {
    const userFromDb = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        nome_completo: true, 
        email: true,         
        tipo: true,          
        numero: true,        
        foto_perfil: true,   
        data_nascimento: true, 
        cpf: true,           
        curso: true,         
        periodo: true,       
        matricula: true,     
        senha: true          
      }
    });

    if (!userFromDb) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const isMatch = await bcrypt.compare(senha, userFromDb.senha);

    if (!isMatch) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const tokenJWTPayload = {
      user: { 
        id: userFromDb.id,
        tipo: userFromDb.tipo,   
      },
    };

    jwt.sign(
      tokenJWTPayload, 
      JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
            console.error("Erro ao assinar o token JWT:", err);
            return res.status(500).json({ error: "Erro ao gerar token de autenticação." });
        }

        const userForFrontendResponse = {
          id: userFromDb.id,
          nome_completo: userFromDb.nome_completo, 
          email: userFromDb.email,
          tipo: userFromDb.tipo,
          numero: userFromDb.numero,
          foto_perfil: userFromDb.foto_perfil,
          data_nascimento: userFromDb.data_nascimento ? new Date(userFromDb.data_nascimento).toISOString().split('T')[0] : null,
          cpf: userFromDb.cpf,
          curso: userFromDb.curso,
          periodo: userFromDb.periodo,
          matricula: userFromDb.matricula,
        };

        res.json({
          message: "Login bem-sucedido!",
          token,
          user: userForFrontendResponse 
        });
      }
    );

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno ao fazer login." });
  }
};
