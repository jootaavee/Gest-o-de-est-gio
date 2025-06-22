const prisma = require("../prismaClient");

exports.sendNotificacao = async (req, res) => {
  const { tipo_destinatario, valor_destinatario, titulo, mensagem } = req.body;
  const enviadoPorId = req.user.id;

  if (!tipo_destinatario || !titulo || !mensagem) {
    return res.status(400).json({ error: "Tipo de destinatário, título e mensagem são obrigatórios." });
  }

  let destinatariosIds = [];

  try {
    switch (tipo_destinatario.toUpperCase()) {
      case 'TODOS':
        const todosAlunos = await prisma.user.findMany({ where: { tipo: 'ALUNO' }, select: { id: true } });
        destinatariosIds = todosAlunos.map(aluno => aluno.id);
        break;
      case 'CURSO':
        if (!valor_destinatario) {
          return res.status(400).json({ error: "O nome do curso é obrigatório para este tipo de envio." });
        }
        const alunosPorCurso = await prisma.user.findMany({ 
            where: { tipo: 'ALUNO', curso: valor_destinatario }, 
            select: { id: true } 
        });
        destinatariosIds = alunosPorCurso.map(aluno => aluno.id);
        break;
      case 'MATRICULA':
        if (!valor_destinatario) {
          return res.status(400).json({ error: "A matrícula do aluno é obrigatória para este tipo de envio." });
        }
        const alunoPorMatricula = await prisma.user.findUnique({ where: { matricula: valor_destinatario } });
        if (!alunoPorMatricula) {
            return res.status(404).json({ error: `Aluno com matrícula ${valor_destinatario} não encontrado.` });
        }
        destinatariosIds.push(alunoPorMatricula.id);
        break;
      default:
        return res.status(400).json({ error: "Tipo de destinatário inválido. Valores permitidos: TODOS, CURSO, MATRICULA." });
    }

    if (destinatariosIds.length === 0) {
      return res.status(404).json({ error: "Nenhum aluno destinatário foi encontrado para os critérios fornecidos." });
    }
    
    const notificacoesParaCriar = destinatariosIds.map(destinatarioId => ({
      titulo,
      mensagem,
      enviado_por_id: enviadoPorId,
      destinatario_id: destinatarioId,
    }));
    
    await prisma.notificacao.createMany({
      data: notificacoesParaCriar
    });
    
    res.status(200).json({ message: `Notificação enviada com sucesso para ${destinatariosIds.length} aluno(s)!` });

  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao tentar enviar a notificação." });
  }
};

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

exports.listarNaoLidas = async (req, res) => {
    const userId = req.user.id;
    try {
        const notificacoes = await prisma.notificacao.findMany({
            where: {
                destinatario_id: { equals: userId },
                lida: false,
            },
            orderBy: { data_envio: 'desc' },
            take: 10,
        });
        res.status(200).json(notificacoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar notificações não lidas.' });
    }
};

exports.marcarTodasComoLidas = async (req, res) => {
    const userId = req.user.id;
    try {
        await prisma.notificacao.updateMany({
            where: {
                destinatario_id: { equals: userId },
                lida: false,
            },
            data: { lida: true },
        });
        res.status(200).json({ message: 'Notificações marcadas como lidas.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar notificações.' });
    }
};

exports.deleteNotificacao = async (req, res) => {
    const userId = req.user.id;
    const { id: notificacaoId } = req.params;

    try {
        const deleteResult = await prisma.notificacao.deleteMany({
            where: {
                id: notificacaoId,
                destinatario_id: userId,
            },
        });

        if (deleteResult.count === 0) {
            return res.status(404).json({ error: "Notificação não encontrada ou você não tem permissão para deletá-la." });
        }

        res.status(200).json({ message: "Notificação deletada com sucesso." });
    } catch (error) {
        console.error("Erro ao deletar notificação:", error);
        res.status(500).json({ error: "Erro interno ao tentar deletar a notificação." });
    }
};