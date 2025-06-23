const { Prisma, CandidaturaStatus, DocumentType } = require("@prisma/client");
const prisma = require("../prismaClient");

exports.createCandidatura = async (req, res) => {
  const alunoId = req.user.id;
  const { vaga_id } = req.body;

  if (!vaga_id) {
    return res.status(400).json({ error: "O ID da vaga é obrigatório no corpo da requisição." });
  }

  try {
    const vaga = await prisma.vaga.findUnique({
      where: { id: vaga_id },
    });

    if (!vaga) {
      return res.status(404).json({ error: "Vaga não encontrada." });
    }

    const agora = new Date();
    if (agora < new Date(vaga.data_abertura.setUTCHours(0,0,0,0)) || agora > new Date(vaga.data_encerramento.setUTCHours(23,59,59,999))) {
        return res.status(400).json({ error: "Esta vaga não está aberta para candidaturas no momento." });
    }
    if (!vaga.ativa) {
        return res.status(400).json({ error: "Esta vaga não está mais ativa." });
    }

    const candidaturaExistente = await prisma.candidatura.findUnique({
      where: {
        aluno_id_vaga_id: {
          aluno_id: alunoId,
          vaga_id: vaga_id,
        },
      },
    });

    if (candidaturaExistente) {
      return res.status(400).json({ error: "Você já se candidatou para esta vaga anteriormente." });
    }

    const curriculo = await prisma.documento.findFirst({
        where: {
            aluno_id: alunoId,
            tipo: DocumentType.CURRICULO
        }
    });

    if (!curriculo) {
        return res.status(400).json({ error: "É necessário enviar seu currículo antes de se candidatar. Acesse 'Meus Documentos'." });
    }

    const novaCandidatura = await prisma.candidatura.create({
      data: {
        status: CandidaturaStatus.PENDENTE,
        aluno: { connect: { id: alunoId } },
        vaga: { connect: { id: vaga_id } },
      },
      include: {
        vaga: { select: { id: true, titulo: true, empresa: true } },
        aluno: { select: { id: true, nome_completo: true} }
      }
    });

    res.status(201).json({ message: "Candidatura realizada com sucesso!", candidatura: novaCandidatura });

  } catch (error) {
    console.error("Erro detalhado ao criar candidatura:", error);
    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ error: "Dados inválidos para a candidatura.", details: error.message });
    }
    if (error.code === 'P2002') {
        return res.status(409).json({ error: "Você já se candidatou para esta vaga (verificação de segurança)." });
    }
    if (error.code === 'P2025') {
        const target = error.meta?.target || error.meta?.cause || "registro relacionado";
        return res.status(404).json({ error: `Não foi possível encontrar um ${target} necessário para a candidatura.`});
    }
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao processar sua candidatura." });
  }
};

exports.getMinhasCandidaturas = async (req, res) => {
  const alunoId = req.user.id;

  try {
    const candidaturas = await prisma.candidatura.findMany({
      where: { aluno_id: alunoId },
      include: {
        vaga: {
          select: { id: true, titulo: true, empresa: true, local: true, data_encerramento: true },
        },
      },
      orderBy: { data_candidatura: "desc" },
    });
    res.status(200).json(candidaturas);
  } catch (error) {
    console.error("Erro detalhado ao listar minhas candidaturas:", error);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao buscar suas candidaturas." });
  }
};

exports.getMinhaCandidaturaPorVaga = async (req, res) => {
  const alunoId = req.user.id;
  const { vagaId } = req.params;

  if (!vagaId) {
    return res.status(400).json({ error: "O ID da vaga é obrigatório na URL." });
  }

  try {
    const candidatura = await prisma.candidatura.findUnique({
      where: {
        aluno_id_vaga_id: {
          aluno_id: alunoId,
          vaga_id: vagaId,
        },
      },
      include: {
        vaga: { select: { titulo: true, empresa: true }}
      }
    });

    if (!candidatura) {
      return res.status(404).json({ message: "Nenhuma candidatura encontrada para esta vaga." });
    }
    res.status(200).json(candidatura);
  } catch (error) {
    console.error("Erro detalhado ao buscar candidatura específica por vaga:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2023') {
        return res.status(400).json({ error: "O ID da vaga fornecido na URL é inválido." });
    }
    res.status(500).json({ error: "Ocorreu um erro interno ao buscar sua candidatura para esta vaga." });
  }
};

exports.updateCandidaturaStatus = async (req, res) => {
    const { id: candidaturaId } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(CandidaturaStatus).includes(status.toUpperCase())) {
        return res.status(400).json({ error: `Status inválido. Valores permitidos: ${Object.values(CandidaturaStatus).join(', ')}.` });
    }

    try {
        const candidaturaExistente = await prisma.candidatura.findUnique({
            where: { id: candidaturaId },
        });
        if (!candidaturaExistente) {
            return res.status(404).json({ error: "Candidatura não encontrada." });
        }
        const updatedCandidatura = await prisma.candidatura.update({
            where: { id: candidaturaId },
            data: { status: status.toUpperCase() },
            include: {
                aluno: { select: { id: true, nome_completo: true, email: true } },
                vaga: { select: { id: true, titulo: true } }
            }
        });
        res.status(200).json({ message: `Status da candidatura atualizado para ${status}.`, candidatura: updatedCandidatura });

    } catch (error) {
        console.error(`Erro detalhado ao atualizar status da candidatura (${candidaturaId}):`, error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Candidatura não encontrada para atualização de status." });
        }
        res.status(500).json({ error: "Ocorreu um erro interno no servidor ao atualizar o status da candidatura." });
    }
};