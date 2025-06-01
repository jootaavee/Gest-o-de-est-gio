const prisma = require("../prismaClient");
const { UserRole } = require("@prisma/client");

// Enviar Notificação (Acesso: Técnico)
exports.sendNotificacao = async (req, res) => {
  const tecnicoId = req.user.id; // ID do técnico logado
  const { destinatario_id, titulo, mensagem } = req.body;

  if (!destinatario_id || !titulo || !mensagem) {
    return res.status(400).json({ error: "ID do destinatário, título e mensagem são obrigatórios." });
  }

  try {
    // Verificar se o destinatário é um Aluno válido
    const destinatario = await prisma.user.findUnique({
      where: { id: destinatario_id, tipo: UserRole.ALUNO },
    });

    if (!destinatario) {
      return res.status(404).json({ error: "Aluno destinatário não encontrado." });
    }

    // Criar a notificação
    const novaNotificacao = await prisma.notificacao.create({
      data: {
        titulo,
        mensagem,
        enviado_por: {
          connect: { id: tecnicoId },
        },
        destinatario: {
          connect: { id: destinatario_id },
        },
      },
    });

    res.status(201).json({ message: "Notificação enviada com sucesso!", notificacao: novaNotificacao });

  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({ error: "Erro interno ao enviar notificação." });
  }
};

// Listar Minhas Notificações (Acesso: Aluno)
exports.getMinhasNotificacoes = async (req, res) => {
  const alunoId = req.user.id;

  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: { destinatario_id: alunoId },
      orderBy: {
        data_envio: "desc",
      },
      include: {
        enviado_por: { // Incluir nome do técnico que enviou
          select: { nome_completo: true }
        }
      }
    });
    res.json(notificacoes);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ error: "Erro interno ao buscar notificações." });
  }
};

// Marcar Notificação como Lida (Acesso: Aluno)
exports.markAsRead = async (req, res) => {
  const alunoId = req.user.id;
  const { id } = req.params; // ID da notificação

  try {
    const notificacao = await prisma.notificacao.findUnique({
      where: { id },
    });

    // Verificar se a notificação existe e pertence ao aluno logado
    if (!notificacao || notificacao.destinatario_id !== alunoId) {
      return res.status(404).json({ error: "Notificação não encontrada ou não pertence a você." });
    }

    // Se já estiver lida, apenas retornar
    if (notificacao.lida) {
        return res.json({ message: "Notificação já estava marcada como lida.", notificacao });
    }

    // Atualizar o status para lida
    const updatedNotificacao = await prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });

    res.json({ message: "Notificação marcada como lida.", notificacao: updatedNotificacao });

  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    res.status(500).json({ error: "Erro interno ao atualizar notificação." });
  }
};

