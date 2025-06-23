const prisma = require("../prismaClient");
const fs = require("fs");
const path = require("path");
const { DocumentType, UserRole } = require("@prisma/client");

// Diretório de uploads
const uploadDir = path.join(__dirname, "../../uploads");

// Upload de Documento (Acesso: Aluno)
exports.uploadDocumento = async (req, res) => {
  const alunoId = req.user.id;
  const { tipo } = req.body; // Tipo do documento (CURRICULO, TCE, TRE) vindo do form-data

  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  if (!tipo || !Object.values(DocumentType).includes(tipo)) {
    // Se o tipo for inválido, deletar o arquivo que já foi salvo pelo multer
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: `Tipo de documento inválido. Use ${Object.values(DocumentType).join(", ")}.` });
  }

  try {
    // Verificar se já existe um documento do mesmo tipo para este aluno
    const existingDocument = await prisma.documento.findFirst({
        where: {
            aluno_id: alunoId,
            tipo: tipo
        }
    });

    // Se já existir, atualiza o registro (sobrescreve o path e nome)
    if (existingDocument) {
        // Deleta o arquivo antigo antes de atualizar o registro
        const oldFilePath = path.join(uploadDir, path.basename(existingDocument.path)); // Assume que path armazena apenas o nome do arquivo
        if (fs.existsSync(oldFilePath)) {
            try {
                fs.unlinkSync(oldFilePath);
            } catch (unlinkError) {
                console.error("Erro ao deletar arquivo antigo:", unlinkError);
                // Continuar mesmo se não conseguir deletar o antigo, mas logar o erro
            }
        }

        const updatedDocumento = await prisma.documento.update({
            where: { id: existingDocument.id },
            data: {
                path: req.file.filename, // Salva apenas o nome do arquivo gerado pelo multer
                nome_original: req.file.originalname,
                data_upload: new Date(),
            },
        });
         return res.json({ message: `Documento (${tipo}) atualizado com sucesso!`, documento: updatedDocumento });

    } else {
        // Se não existir, cria um novo registro
        const novoDocumento = await prisma.documento.create({
          data: {
            aluno: {
              connect: { id: alunoId },
            },
            tipo: tipo,
            path: req.file.filename, // Salva apenas o nome do arquivo gerado pelo multer
            nome_original: req.file.originalname,
          },
        });
        return res.status(201).json({ message: `Documento (${tipo}) enviado com sucesso!`, documento: novoDocumento });
    }

  } catch (error) {
    console.error("Erro ao fazer upload do documento:", error);
    // Se der erro no banco, deletar o arquivo que foi salvo
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Erro interno ao processar upload." });
  }
};

// Listar Meus Documentos (Acesso: Aluno)
exports.getMeusDocumentos = async (req, res) => {
  const alunoId = req.user.id;

  try {
    const documentos = await prisma.documento.findMany({
      where: { aluno_id: alunoId },
      orderBy: {
        data_upload: "desc",
      },
    });
    res.json(documentos);
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    res.status(500).json({ error: "Erro interno ao buscar documentos." });
  }
};

// Deletar Documento (Acesso: Aluno)
exports.deleteDocumento = async (req, res) => {
  const alunoId = req.user.id;
  const { id } = req.params; // ID do documento

  try {
    const documento = await prisma.documento.findUnique({
      where: { id },
    });

    // Verificar se o documento existe e pertence ao aluno logado
    if (!documento || documento.aluno_id !== alunoId) {
      return res.status(404).json({ error: "Documento não encontrado ou não pertence a você." });
    }

    // Deletar o arquivo físico
    const filePath = path.join(uploadDir, documento.path);
    if (fs.existsSync(filePath)) {
      try {
          fs.unlinkSync(filePath);
      } catch (unlinkError) {
          console.error("Erro ao deletar arquivo físico:", unlinkError);
          // Considerar se deve impedir a deleção do registro no DB ou apenas logar
          return res.status(500).json({ error: "Erro ao deletar arquivo físico." });
      }
    }

    // Deletar o registro no banco de dados
    await prisma.documento.delete({
      where: { id },
    });

    res.status(200).json({ message: "Documento deletado com sucesso!" });

  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    res.status(500).json({ error: "Erro interno ao deletar documento." });
  }
};

// Download/Servir Documento (Acesso: Aluno dono ou Técnico)
exports.downloadDocumento = async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.tipo;
    const { id } = req.params; // ID do documento

    try {
        const documento = await prisma.documento.findUnique({
            where: { id },
        });

        if (!documento) {
            return res.status(404).json({ error: "Documento não encontrado." });
        }

        // Verificar permissão: Aluno só pode baixar seus próprios docs, Técnico pode baixar qualquer um.
        if (userType === UserRole.ALUNO && documento.aluno_id !== userId) {
            return res.status(403).json({ error: "Você não tem permissão para acessar este documento." });
        }

        const filePath = path.join(uploadDir, documento.path);

        if (fs.existsSync(filePath)) {
            // Define o header para forçar o download ou exibir inline
            // res.setHeader('Content-Disposition', `attachment; filename="${documento.nome_original}"`);
            res.setHeader('Content-Disposition', `inline; filename="${documento.nome_original}"`); // Tenta exibir inline
            res.sendFile(filePath);
        } else {
            console.error(`Arquivo não encontrado no servidor: ${filePath}`);
            return res.status(404).json({ error: "Arquivo não encontrado no servidor." });
        }

    } catch (error) {
        console.error("Erro ao baixar/servir documento:", error);
        res.status(500).json({ error: "Erro interno ao processar a solicitação do documento." });
    }
};

  