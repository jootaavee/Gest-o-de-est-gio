// backend/src/controllers/user.controller.js

const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const { UserRole, Prisma } = require("@prisma/client");

// Configurações padrão reutilizáveis (SEM IDIOMA)
const defaultUserConfigurations = {
  tema: 'light',
  notificacoesEmail: true,
};

// Formata dados do usuário para enviar ao frontend
const formatUserData = (userFromDb) => {
  if (!userFromDb) return null;

  // Garante que o objeto de configurações sempre exista com os padrões corretos
  const effectiveConfiguracoes = {
    ...defaultUserConfigurations,
    ...(typeof userFromDb.configuracoes === 'object' && userFromDb.configuracoes !== null 
        ? userFromDb.configuracoes 
        : {}),
  };

  const userToSend = { ...userFromDb };
  delete userToSend.senha; // Nunca envie a senha
  userToSend.numero = userFromDb.numero || null;
  userToSend.data_nascimento = userFromDb.data_nascimento
    ? new Date(userFromDb.data_nascimento).toISOString().split("T")[0]
    : null;
  userToSend.configuracoes = effectiveConfiguracoes;

  return userToSend;
};

// 1. Buscar perfil do usuário logado
exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const userFromDb = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, nome_completo: true, email: true, tipo: true, numero: true,
        foto_perfil: true, data_nascimento: true, cpf: true, curso: true,
        periodo: true, matricula: true, configuracoes: true, // Inclui configurações
        documentos: {
          select: { id: true, tipo: true, nome_original: true, path: true, data_upload: true },
          orderBy: { data_upload: 'desc' }
        }
      }
    });

    if (!userFromDb) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.status(200).json(formatUserData(userFromDb));
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    res.status(500).json({ error: "Erro interno ao buscar seu perfil." });
  }
};

// 2. Atualizar perfil principal do usuário logado
exports.updateUserProfile = async (req, res) => {
  const { id: userId } = req.user;
  const {
    nome_completo, numero, data_nascimento, cpf, curso, periodo, matricula,
    email, senha_antiga, nova_senha, confirmar_nova_senha, foto_perfil
  } = req.body;

  try {
    const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToUpdate) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const dataToUpdate = {};
    if (nome_completo !== undefined) dataToUpdate.nome_completo = nome_completo;
    if (numero !== undefined) dataToUpdate.numero = numero;
    if (data_nascimento !== undefined) dataToUpdate.data_nascimento = data_nascimento ? new Date(data_nascimento) : null;
    if (foto_perfil !== undefined) dataToUpdate.foto_perfil = foto_perfil;

    if (userToUpdate.tipo === UserRole.ALUNO) {
      if (cpf !== undefined) dataToUpdate.cpf = cpf;
      if (curso !== undefined) dataToUpdate.curso = curso;
      if (periodo !== undefined) dataToUpdate.periodo = periodo ? parseInt(periodo, 10) : null;
      if (matricula !== undefined) dataToUpdate.matricula = matricula;
    }
    
    if (email && email.toLowerCase() !== userToUpdate.email.toLowerCase()) {
      const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({ error: "Este e-mail já está sendo utilizado." });
      }
      dataToUpdate.email = email.toLowerCase();
    }

    if (nova_senha) {
      if (!senha_antiga) return res.status(400).json({ error: "Confirme sua senha atual para definir uma nova." });
      if (nova_senha.length < 6) return res.status(400).json({ error: "A nova senha deve ter no mínimo 6 caracteres." });
      if (nova_senha !== confirmar_nova_senha) return res.status(400).json({ error: "As novas senhas não coincidem." });
      const isMatch = await bcrypt.compare(senha_antiga, userToUpdate.senha);
      if (!isMatch) return res.status(400).json({ error: "Senha atual incorreta." });
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.senha = await bcrypt.hash(nova_senha, salt);
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: "Nenhum dado fornecido para atualização do perfil."});
    }

    const updatedUserFromDb = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { 
        id: true, nome_completo: true, email: true, tipo: true, numero: true,
        foto_perfil: true, data_nascimento: true, cpf: true, curso: true,
        periodo: true, matricula: true, configuracoes: true,
      }
    });

    res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      user: formatUserData(updatedUserFromDb)
    });

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const targetField = error.meta?.target?.[0] || 'Campo';
        return res.status(400).json({ error: `O campo '${Array.isArray(targetField) ? targetField.join(', ') : targetField}' já está em uso.` });
      }
      if (error.code === 'P2025') {
         return res.status(404).json({ error: "Usuário não encontrado para atualização." });
      }
    }
    res.status(500).json({ error: "Erro interno ao atualizar seu perfil." });
  }
};

// 3. Atualizar CONFIGURAÇÕES do usuário logado (VERSÃO SIMPLIFICADA SEM IDIOMA)
exports.updateUserConfiguracoes = async (req, res) => {
  const userId = req.user.id;
  const { tema, notificacoesEmail } = req.body;

  if (tema === undefined || notificacoesEmail === undefined) {
    return res.status(400).json({ error: "Os campos de configuração (tema, notificacoesEmail) são obrigatórios." });
  }
  const validTemas = ['light', 'dark', 'system'];
  if (!validTemas.includes(tema)) {
    return res.status(400).json({ error: `Tema inválido. Valores permitidos: ${validTemas.join(', ')}.` });
  }
  if (typeof notificacoesEmail !== 'boolean') {
    return res.status(400).json({ error: "O campo 'notificacoesEmail' deve ser um valor booleano (true ou false)." });
  }

  const novasConfiguracoes = { tema, notificacoesEmail };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { configuracoes: novasConfiguracoes },
      select: { configuracoes: true }
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado para atualizar configurações." });
    }

    res.status(200).json({
      message: "Suas configurações foram atualizadas com sucesso!",
      configuracoes: updatedUser.configuracoes,
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações do usuário:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.status(500).json({ error: "Erro interno ao salvar suas configurações." });
  }
};

// 4. Buscar todos os Alunos (para Admin/Técnico)
exports.getAllAlunos = async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { tipo: UserRole.ALUNO },
      select: {
        id: true, nome_completo: true, email: true, numero: true,
        curso: true, periodo: true, matricula: true, foto_perfil: true,
      },
      orderBy: { nome_completo: 'asc' }
    });
    res.status(200).json(alunos.map(aluno => formatUserData(aluno)));
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    res.status(500).json({ error: "Erro interno ao buscar a lista de alunos." });
  }
};

// 5. Buscar Aluno por ID (para Admin/Técnico)
exports.getAlunoById = async (req, res) => {
  const { id: alunoId } = req.params;
  try {
    const alunoFromDb = await prisma.user.findUnique({
      where: { id: alunoId, tipo: UserRole.ALUNO },
      include: {
        documentos: { orderBy: { data_upload: 'desc'} },
        candidaturas: { 
            include: { vaga: { select: { id: true, titulo: true, empresa: true } } },
            orderBy: { data_candidatura: 'desc'}
        },
      }
    });

    if (!alunoFromDb) {
      return res.status(404).json({ error: "Aluno não encontrado ou o ID não corresponde a um aluno." });
    }
    res.status(200).json(formatUserData(alunoFromDb));
  } catch (error) {
    console.error("Erro ao buscar aluno por ID:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2023') {
      return res.status(400).json({ error: "O ID do aluno fornecido é inválido."});
    }
    res.status(500).json({ error: "Erro interno ao buscar detalhes do aluno." });
  }
};