// backend/src/controllers/notificacao.controller.js

const prisma = require("../prismaClient");
const { UserRole } = require("@prisma/client");

// Sua função sendNotificacao (MANTIDA - SEM ALTERAÇÕES)
exports.sendNotificacao = async (req, res) => {
  const tecnicoId = req.user.id;
  const { destinatario_matricula, titulo, mensagem } = req.body;
  if (!destinatario_matricula || !titulo || !mensagem) {
    return res.status(400).json({ error: "Matrícula do destinatário, título e mensagem são obrigatórios." });
  }
  try {
    const destinatario = await prisma.user.findUnique({ where: { matricula: destinatario_matricula } });
    if (!destinatario || destinatario.tipo !== UserRole.ALUNO) {
      return res.status(404).json({ error: "Aluno com a matrícula informada não foi encontrado." });
    }
    const novaNotificacao = await prisma.notificacao.create({
      data: {
        titulo,
        mensagem,
        lida: false,
        enviado_por_id: tecnicoId,
        destinatario_id: destinatario.id,
      },
    });
    res.status(201).json({ message: "Notificação enviada com sucesso!", notificacao: novaNotificacao });
  } catch (error) {
    console.error("ERRO DETALHADO AO ENVIAR NOTIFICAÇÃO:", error);
    res.status(500).json({ error: "Erro interno do servidor ao processar a notificação." });
  }
};


// Sua função getMinhasNotificacoes (MANTIDA - SEM ALTERAÇÕES)
exports.getMinhasNotificacoes = async (req, res) => {
  const alunoId = req.user.id;
  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: { destinatario_id: alunoId },
      orderBy: { data_envio: "desc" },
      include: { enviado_por: { select: { nome_completo: true } } }
    });
    res.json(notificacoes);
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao buscar notificações." });
  }
};

// Sua função markAsRead (MANTIDA - SEM ALTERAÇÕES)
exports.markAsRead = async (req, res) => {
  const alunoId = req.user.id;
  const { id } = req.params;
  try {
    const updated = await prisma.notificacao.updateMany({
      where: { id: id, destinatario_id: alunoId },
      data: { lida: true },
    });
    if (updated.count === 0) {
      return res.status(404).json({ error: "Notificação não encontrada ou não pertence a você." });
    }
    res.json({ message: "Notificação marcada como lida." });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao atualizar notificação." });
  }
};

// ==========================================================
// FUNÇÃO CORRIGIDA COM AJUSTE NA CONSULTA (WHERE)
// ==========================================================
exports.listarNaoLidas = async (req, res) => {
  const userId = req.user.id;
  console.log(`[DEBUG] Tentando buscar para User ID: ${userId}`);

  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        // CORREÇÃO: Usando 'equals' para garantir a correspondência exata do ObjectId
        destinatario_id: {
          equals: userId,
        },
        lida: false,
      },
      orderBy: { data_envio: 'desc' },
      take: 10,
    });
    
    console.log(`[DEBUG] Prisma encontrou ${notificacoes.length} notificações com 'equals'.`);
    if (notificacoes.length > 0) {
        console.log('[DEBUG] Detalhes:', JSON.stringify(notificacoes, null, 2));
    }
    
    res.status(200).json(notificacoes);
  } catch (error) {
    console.error('[ERRO] Falha ao buscar notificações não lidas:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações não lidas.' });
  }
};


// Sua função marcarTodasComoLidas (com o mesmo ajuste por segurança)
exports.marcarTodasComoLidas = async (req, res) => {
  const userId = req.user.id;
  try {
    await prisma.notificacao.updateMany({
      where: {
        destinatario_id: {
          equals: userId, // Aplicando a mesma correção aqui
        },
        lida: false,
      },
      data: { lida: true },
    });
    res.status(200).json({ message: 'Notificações marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar notificações.' });
  }
};