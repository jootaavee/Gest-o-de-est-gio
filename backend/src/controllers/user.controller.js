const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const { UserRole } = require("@prisma/client");

// Formata dados do usuário para o padrão esperado pelo front-end
const formatUserData = (user) => {
  return {
    ...user,
    numero: user.numero, // Padroniza nome do campo
    data_nascimento: user.data_nascimento ? 
      new Date(user.data_nascimento).toISOString().split('T')[0] : null // Formata data
  };
};

// Buscar perfil do usuário logado
exports.getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome_completo: true,
        email: true,
        tipo: true,
        numero: true,          // Será mapeado para numero
        foto_perfil: true,
        data_nascimento: true,
        cpf: true,
        curso: true,
        periodo: true,
        matricula: true,
        documentos: {
          select: {
            id: true,
            tipo: true,
            nome_original: true,
            path: true,
            data_upload: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(formatUserData(user));
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro interno ao buscar perfil do usuário." });
  }
};

// Atualizar perfil do usuário logado
exports.updateUserProfile = async (req, res) => {
  const { id } = req.user;
  const {
    nome_completo,
    numero,  // Recebe do front-end como numero
    data_nascimento,
    cpf,
    curso,
    periodo,
    matricula,
    email,
    senha_antiga,
    nova_senha,
    confirmar_nova_senha,
    foto_perfil
  } = req.body;

  try {
    const userToUpdate = await prisma.user.findUnique({ where: { id } });

    if (!userToUpdate) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const dataToUpdate = {
      nome_completo,
      numero: numero,  // Mapeia para o campo 'numero' no banco
      data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
      foto_perfil,
      ...(userToUpdate.tipo === UserRole.ALUNO && {
        cpf,
        curso,
        periodo: periodo ? parseInt(periodo, 10) : undefined,
        matricula
      })
    };

    // Validação de email
    if (email && email !== userToUpdate.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: "Este email já está em uso." });
      }
      dataToUpdate.email = email;
    }

    // Validação de senha
    if (nova_senha) {
      if (!senha_antiga) {
        return res.status(400).json({ error: "Confirme sua senha atual." });
      }
      if (nova_senha !== confirmar_nova_senha) {
        return res.status(400).json({ error: "As novas senhas não coincidem." });
      }

      const isMatch = await bcrypt.compare(senha_antiga, userToUpdate.senha);
      if (!isMatch) {
        return res.status(400).json({ error: "Senha atual incorreta." });
      }

      const salt = await bcrypt.genSalt(10);
      dataToUpdate.senha = await bcrypt.hash(nova_senha, salt);
    }

    // Atualiza no banco
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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
        matricula: true
      }
    });

    res.json({
      message: "Perfil atualizado com sucesso!",
      user: formatUserData(updatedUser)  // Formata a resposta
    });

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    
    // Tratamento de erros específicos do Prisma
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0];
      if (target === 'email') return res.status(400).json({ error: "Email já em uso." });
      if (target === 'cpf') return res.status(400).json({ error: "CPF já cadastrado." });
      if (target === 'matricula') return res.status(400).json({ error: "Matrícula já existe." });
    }

    res.status(500).json({ error: "Erro interno ao atualizar perfil." });
  }
};

// Buscar todos os Alunos (para técnicos)
exports.getAllAlunos = async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { tipo: UserRole.ALUNO },
      select: {
        id: true,
        nome_completo: true,
        email: true,
        numero: true,
        curso: true,
        periodo: true,
        matricula: true
      },
      orderBy: { nome_completo: 'asc' }
    });

    // Formata os dados de saída
    const formattedAlunos = alunos.map(aluno => ({
      ...aluno,
      numero: aluno.numero
    }));

    res.json(formattedAlunos);
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    res.status(500).json({ error: "Erro interno ao buscar alunos." });
  }
};

// Buscar Aluno por ID (para técnicos)
exports.getAlunoById = async (req, res) => {
  try {
    const aluno = await prisma.user.findUnique({
      where: { 
        id: req.params.id, 
        tipo: UserRole.ALUNO 
      },
      include: {
        documentos: {
          select: {
            id: true,
            tipo: true,
            nome_original: true,
            path: true,
            data_upload: true
          }
        },
        candidaturas: {
          select: {
            id: true,
            status: true,
            vaga: { select: { id: true, titulo: true } }
          }
        }
      }
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    res.json(formatUserData(aluno));
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    res.status(500).json({ error: "Erro interno ao buscar aluno." });
  }
};