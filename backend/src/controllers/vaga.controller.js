// backend/src/controllers/vaga.controller.js

const { Prisma } = require("@prisma/client");
const prisma = require("../prismaClient");

// 1. Criar Nova Vaga
exports.createVaga = async (req, res) => {
  const {
    titulo, descricao, empresa, localizacao, remuneracao, carga_horaria,
    requisitos, beneficios, data_abertura, data_expiracao, ativa,
    curso_requerido, periodo_minimo, turno, imagem, link_edital,
  } = req.body;
  const tecnicoId = req.user.id;

  if (!titulo || !descricao || !empresa || !localizacao || !data_abertura || !data_expiracao) {
    return res.status(400).json({
      error: "Campos obrigatórios (Título, Descrição, Empresa, Localização, Data de Abertura, Data de Expiração) devem ser preenchidos.",
    });
  }

  try {
    const novaVaga = await prisma.vaga.create({
      data: {
        titulo, descricao, empresa: empresa || null,
        local: localizacao || null, bolsa: remuneracao || null,
        carga_horaria: carga_horaria ? parseInt(carga_horaria, 10) : null,
        requisitos: requisitos || null, beneficios: beneficios || null,
        data_abertura: new Date(data_abertura), data_encerramento: new Date(data_expiracao),
        ativa: ativa !== undefined ? Boolean(ativa) : true,
        curso_requerido: curso_requerido || null,
        periodo_minimo: periodo_minimo ? parseInt(periodo_minimo, 10) : null,
        turno: turno || null, imagem: imagem || null, link_edital: link_edital || null,
        criado_por: { connect: { id: tecnicoId } },
      },
    });
    res.status(201).json({ message: "Vaga cadastrada com sucesso!", vaga: novaVaga });
  } catch (error) {
    console.error("Erro detalhado ao criar vaga:", error);
    if (error instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Erro de validação nos dados fornecidos para a vaga.", details: error.message });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Conflito: Uma vaga com alguns desses dados únicos já pode existir." });
    }
    if (error.code === 'P2025') {
      return res.status(400).json({ error: `Erro ao conectar registros relacionados. Verifique se o técnico com ID '${tecnicoId}' existe.` });
    }
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao tentar cadastrar a vaga." });
  }
};

// 2. Listar Todas as Vagas (públicas/ativas)
exports.getAllVagas = async (req, res) => {
  try {
    const vagas = await prisma.vaga.findMany({
      where: {
        ativa: true, // Listar apenas vagas ativas
      },
      orderBy: { data_abertura: "desc" },
      select: {
        id: true, titulo: true, empresa: true, local: true, bolsa: true,
        data_abertura: true, data_encerramento: true, ativa: true,
        imagem: true, // Para exibir na listagem
        // curso_requerido: true, // Adicionar se necessário na listagem rápida
        // periodo_minimo: true, // Adicionar se necessário
      },
    });
    res.status(200).json(vagas);
  } catch (error) {
    console.error("Erro detalhado ao listar vagas:", error);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao tentar listar as vagas." });
  }
};

// NOVA FUNÇÃO: Listar Vagas Criadas pelo Técnico Logado
exports.getMinhasVagasTecnico = async (req, res) => {
  const tecnicoId = req.user.id;
  try {
    const vagas = await prisma.vaga.findMany({
      where: {
        criado_por_id: tecnicoId,
      },
      orderBy: { createdAt: "desc" }, // Ou data_abertura, etc.
      // Selecione os campos que a AdminHomePage precisa
      select: {
        id: true,
        titulo: true,
        empresa: true,
        local: true, // Se AdminHomePage usa 'localizacao', ajuste o select ou o frontend
        data_encerramento: true, // Para "Expira em"
        ativa: true,
        // Adicione outros campos se necessário para a tabela de admin
      },
    });
    res.status(200).json(vagas);
  } catch (error) {
    console.error("Erro detalhado ao buscar vagas do técnico:", error);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao buscar as vagas do técnico." });
  }
};

// 3. Obter Vaga por ID
exports.getVagaById = async (req, res) => {
  const { id } = req.params;
  try {
    const vaga = await prisma.vaga.findUnique({
      where: { id: id },
      include: {
        criado_por: { select: { nome_completo: true, email: true } }
      }
    });
    if (!vaga) {
      return res.status(404).json({ error: "Vaga não encontrada." });
    }
    res.status(200).json(vaga);
  } catch (error) {
    console.error(`Erro detalhado ao buscar vaga por ID (${id}):`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2023') {
      return res.status(400).json({ error: "O ID da vaga fornecido é inválido."});
    }
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao tentar buscar a vaga." });
  }
};

// 4. Atualizar Vaga
exports.updateVaga = async (req, res) => {
  const { id } = req.params;
  const {
    titulo, descricao, empresa, localizacao, remuneracao, carga_horaria,
    requisitos, beneficios, data_abertura, data_expiracao, ativa,
    curso_requerido, periodo_minimo, turno, imagem, link_edital,
  } = req.body;

  try {
    const dataToUpdate = {
      titulo, descricao, empresa,
      local: localizacao, bolsa: remuneracao,
      carga_horaria: carga_horaria ? parseInt(carga_horaria, 10) : undefined,
      requisitos, beneficios,
      data_abertura: data_abertura ? new Date(data_abertura) : undefined,
      data_encerramento: data_expiracao ? new Date(data_expiracao) : undefined,
      ativa: ativa !== undefined ? Boolean(ativa) : undefined,
      curso_requerido,
      periodo_minimo: periodo_minimo ? parseInt(periodo_minimo, 10) : undefined,
      turno, imagem, link_edital,
    };
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: "Nenhum dado fornecido para atualização." });
    }

    const updatedVaga = await prisma.vaga.update({
      where: { id: id }, data: dataToUpdate,
    });
    res.status(200).json({ message: "Vaga atualizada com sucesso!", vaga: updatedVaga });
  } catch (error) {
    console.error(`Erro detalhado ao atualizar vaga (${id}):`, error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Vaga não encontrada para atualização." });
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ error: "Erro de validação nos dados fornecidos para a vaga.", details: error.message });
    }
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao tentar atualizar a vaga." });
  }
};

// 5. Deletar Vaga
exports.deleteVaga = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.candidatura.deleteMany({ where: { vaga_id: id } });
    await prisma.vaga.delete({ where: { id: id } });
    res.status(200).json({ message: "Vaga e suas candidaturas associadas foram deletadas com sucesso." });
  } catch (error) {
    console.error(`Erro detalhado ao deletar vaga (${id}):`, error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Vaga não encontrada para exclusão." });
    }
    res.status(500).json({ error: "Ocorreu um erro interno no servidor ao tentar deletar a vaga." });
  }
};

// 6. Obter Candidaturas de uma Vaga
exports.getVagaCandidaturas = async (req, res) => {
    const { id: vagaId } = req.params;
    try {
        const vagaExiste = await prisma.vaga.findUnique({ where: { id: vagaId } });
        if (!vagaExiste) {
            return res.status(404).json({ error: "Vaga não encontrada." });
        }
        const candidaturas = await prisma.candidatura.findMany({
            where: { vaga_id: vagaId },
            include: {
                aluno: { select: { id: true, nome_completo: true, email: true, curso: true, periodo: true } }
            },
            orderBy: { data_candidatura: 'asc' }
        });
        res.status(200).json(candidaturas);
    } catch (error) {
        console.error(`Erro detalhado ao buscar candidaturas da vaga (${vagaId}):`, error);
        res.status(500).json({ error: "Ocorreu um erro interno no servidor ao buscar as candidaturas." });
    }
};