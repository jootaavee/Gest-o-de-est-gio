// backend/src/controllers/candidatura.controller.js

const { Prisma } = require("@prisma/client"); // Importante para error instanceof Prisma.PrismaClient...
const prisma = require("../prismaClient"); // Ajuste o caminho se necessário
const { CandidaturaStatus, DocumentType } = require("@prisma/client"); // Se precisar usar enums

// 1. Criar nova Candidatura (Acesso: Aluno)
exports.createCandidatura = async (req, res) => {
  const alunoId = req.user.id; // ID do aluno logado (do middleware de autenticação)
  const { vaga_id } = req.body; // Frontend DEVE enviar vaga_id (com underscore)

  if (!vaga_id) {
    return res.status(400).json({ error: "O ID da vaga é obrigatório no corpo da requisição." });
  }

  try {
    // 1. Verificar se a vaga existe e está aberta para candidaturas
    const vaga = await prisma.vaga.findUnique({
      where: { id: vaga_id },
    });

    if (!vaga) {
      return res.status(404).json({ error: "Vaga não encontrada." });
    }

    const agora = new Date();
    // As datas no Prisma (MongoDB com @db.Date) podem ser só data, mas `new Date()` cria DateTime.
    // Para comparar apenas datas, seria mais seguro normalizar ambas para meia-noite ou início do dia.
    // Contudo, para simplificar, assumindo que data_abertura/encerramento são consideradas como início do dia.
    if (agora < new Date(vaga.data_abertura.setUTCHours(0,0,0,0)) || agora > new Date(vaga.data_encerramento.setUTCHours(23,59,59,999))) {
        return res.status(400).json({ error: "Esta vaga não está aberta para candidaturas no momento." });
    }
    if (!vaga.ativa) {
        return res.status(400).json({ error: "Esta vaga não está mais ativa." });
    }

    // 2. Verificar se o aluno já se candidatou a esta vaga
    const candidaturaExistente = await prisma.candidatura.findUnique({
      where: {
        aluno_id_vaga_id: { // Usando o índice unique @unique([aluno_id, vaga_id])
          aluno_id: alunoId,
          vaga_id: vaga_id,
        },
      },
    });

    if (candidaturaExistente) {
      return res.status(400).json({ error: "Você já se candidatou para esta vaga anteriormente." });
    }

    // 3. Verificar se o aluno tem currículo enviado
    const curriculo = await prisma.documento.findFirst({
        where: {
            aluno_id: alunoId,
            tipo: DocumentType.CURRICULO // Usa o enum importado
        }
    });

    if (!curriculo) {
        return res.status(400).json({ error: "É necessário enviar seu currículo antes de se candidatar. Acesse 'Meus Documentos'." });
    }

    // 4. Criar a candidatura
    const novaCandidatura = await prisma.candidatura.create({
      data: {
        status: CandidaturaStatus.PENDENTE, // Usa o enum importado
        aluno: {
          connect: { id: alunoId },
        },
        vaga: {
          connect: { id: vaga_id },
        },
      },
      include: { // Para retornar informações úteis na resposta
        vaga: {
            select: { id: true, titulo: true, empresa: true }
        },
        aluno: {
            select: { id: true, nome_completo: true}
        }
      }
    });

    res.status(201).json({ message: "Candidatura realizada com sucesso!", candidatura: novaCandidatura });

  } catch (error) {
    console.error("Erro detalhado ao criar candidatura:", error);
    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ error: "Dados inválidos para a candidatura.", details: error.message });
    }
    if (error.code === 'P2002') { // Unique constraint violation
        return res.status(409).json({ error: "Você já se candidatou para esta vaga (verificação de segurança)." });
    }
    if (error.code === 'P2025') { // Record to connect not found
        const target = error.meta?.target || error.meta?.cause || "registro relacionado";
        return res.status(404).json({ error: `Não foi possível encontrar um ${target} necessário para a candidatura.`});
    }
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao processar sua candidatura." });
  }
};

// 2. Listar Minhas Candidaturas (Acesso: Aluno)
exports.getMinhasCandidaturas = async (req, res) => {
  const alunoId = req.user.id;

  try {
    const candidaturas = await prisma.candidatura.findMany({
      where: { aluno_id: alunoId },
      include: {
        vaga: {
          select: {
            id: true,
            titulo: true,
            empresa: true,
            local: true,
            data_encerramento: true
          },
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

// 3. NOVA FUNÇÃO: Obter minha candidatura para uma vaga específica (Acesso: Aluno)
exports.getMinhaCandidaturaPorVaga = async (req, res) => {
  const alunoId = req.user.id;
  const { vagaId } = req.params; // vem da URL /vaga/:vagaId/minha

  if (!vagaId) {
    return res.status(400).json({ error: "O ID da vaga é obrigatório na URL." });
  }

  try {
    const candidatura = await prisma.candidatura.findUnique({
      where: {
        aluno_id_vaga_id: { // Usando o índice @unique([aluno_id, vaga_id])
          aluno_id: alunoId,
          vaga_id: vagaId,
        },
      },
      // Opcional: incluir dados que você queira mostrar no frontend sobre a candidatura existente
      include: {
        vaga: { select: { titulo: true, empresa: true }}
      }
    });

    if (!candidatura) {
      // Isso é esperado se o aluno não se candidatou, o frontend trata 404
      return res.status(404).json({ message: "Nenhuma candidatura encontrada para esta vaga." });
    }

    res.status(200).json(candidatura);
  } catch (error) {
    console.error("Erro detalhado ao buscar candidatura específica por vaga:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2023') {
        // Este erro ocorre se o vagaId não for um ObjectId válido no MongoDB
        return res.status(400).json({ error: "O ID da vaga fornecido na URL é inválido." });
    }
    res.status(500).json({ error: "Ocorreu um erro interno ao buscar sua candidatura para esta vaga." });
  }
};


// 4. Atualizar Status da Candidatura (Acesso: Técnico)
exports.updateCandidaturaStatus = async (req, res) => {
    const { id: candidaturaId } = req.params; // ID da Candidatura
    const { status } = req.body;       // Novo status (Ex: "APROVADO", "REPROVADO")

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
            data: { status: status.toUpperCase() }, // Armazena em maiúsculas se a enum for assim
            include: { // Para retornar dados úteis
                aluno: { select: { id: true, nome_completo: true, email: true } },
                vaga: { select: { id: true, titulo: true } }
            }
        });

        // Aqui você implementaria a lógica de notificação para o aluno
        // Ex: await criarNotificacao(updatedCandidatura.aluno.id, req.user.id, "Status da Candidatura Atualizado", `Sua candidatura para a vaga "${updatedCandidatura.vaga.titulo}" foi atualizada para: ${status}.`);

        res.status(200).json({ message: `Status da candidatura atualizado para ${status}.`, candidatura: updatedCandidatura });

    } catch (error) {
        console.error(`Erro detalhado ao atualizar status da candidatura (${candidaturaId}):`, error);
        if (error.code === 'P2025') { // Record to update not found
            return res.status(404).json({ error: "Candidatura não encontrada para atualização de status." });
        }
        res.status(500).json({ error: "Ocorreu um erro interno no servidor ao atualizar o status da candidatura." });
    }
};

// Adicione outras funções como getCandidaturaById (para técnico ver detalhes) se necessário