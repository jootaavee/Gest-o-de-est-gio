// /home/ubuntu/frontend_only/mockData.js

export const mockUserAluno = {
  _id: "60d5ecb4b48f4a001f9e8f8f",
  nome_completo: "Aluno Mock da Silva",
  email: "aluno.mock@exemplo.com",
  tipo: "aluno",
  numero: "(84) 91234-5678",
  curso: "Ciência da Computação",
  periodo: 5,
  matricula: "202312345",
  cpf: "111.222.333-44",
  data_nascimento: { "$date": "2002-05-10T00:00:00.000Z" }, // Formato MongoDB
  foto_perfil_url: null,
  configuracoes: { tema: "light", idioma: "pt-br" },
  ativo: true,
  data_criacao: { "$date": "2024-01-15T10:00:00.000Z" }
};

export const mockUserTecnico = {
  _id: "60d5eccab48f4a001f9e8f90",
  nome_completo: "Técnico Mock Admin",
  email: "tecnico.mock@exemplo.com",
  tipo: "tecnico",
  numero: "(84) 98765-4321",
  foto_perfil_url: null,
  configuracoes: { tema: "dark", idioma: "pt-br" },
  ativo: true,
  data_criacao: { "$date": "2024-01-10T09:00:00.000Z" }
};

export const mockVagas = [
  {
    _id: "vaga1",
    titulo: "Estágio em Desenvolvimento Web (React)",
    empresa: "Empresa Tech Mock",
    descricao: "Oportunidade para atuar com desenvolvimento frontend utilizando React, Redux e outras tecnologias modernas. Trabalho em equipe ágil.",
    requisitos: "Cursando Ciência da Computação ou áreas afins a partir do 4º período. Conhecimento em HTML, CSS, JavaScript e React. Inglês intermediário.",
    beneficios: "Bolsa auxílio compatível com o mercado, vale transporte, vale refeição, seguro de vida.",
    carga_horaria: 30,
    remuneracao: 1200.00,
    localizacao: "Remoto",
    data_publicacao: { "$date": "2025-05-20T14:00:00.000Z" },
    data_expiracao: { "$date": "2025-06-20T23:59:59.000Z" },
    imagem_url: null,
    ativa: true
  },
  {
    _id: "vaga2",
    titulo: "Estágio em Análise de Dados (Python)",
    empresa: "Consultoria Mock Data",
    descricao: "Vaga para auxiliar na coleta, tratamento e análise de dados utilizando Python (Pandas, NumPy) e SQL. Elaboração de relatórios e dashboards.",
    requisitos: "Cursando Estatística, Matemática, Engenharias ou áreas correlatas. Conhecimento em Python e SQL. Familiaridade com ferramentas de BI é um diferencial.",
    beneficios: "Bolsa auxílio, vale transporte.",
    carga_horaria: 20,
    remuneracao: 900.00,
    localizacao: "Mossoró/RN",
    data_publicacao: { "$date": "2025-05-15T10:30:00.000Z" },
    data_expiracao: { "$date": "2025-06-15T23:59:59.000Z" },
    imagem_url: null,
    ativa: true
  }
];

export const mockDocumentos = [
  { _id: "doc1", nome_arquivo: "Historico_Escolar.pdf", tipo: "Histórico Escolar", data_upload: { "$date": "2025-03-10T11:00:00.000Z" }, url: "#" },
  { _id: "doc2", nome_arquivo: "Comprovante_Matricula_2025.1.pdf", tipo: "Comprovante de Matrícula", data_upload: { "$date": "2025-03-10T11:05:00.000Z" }, url: "#" },
  { _id: "doc3", nome_arquivo: "Curriculo_Atualizado.pdf", tipo: "Currículo", data_upload: { "$date": "2025-04-22T09:30:00.000Z" }, url: "#" }
];

export const mockInscricoesAluno = [
  { _id: "insc1", vaga: mockVagas[0], data_inscricao: { "$date": "2025-05-21T10:00:00.000Z" }, status: "Em análise" },
  { _id: "insc2", vaga: mockVagas[1], data_inscricao: { "$date": "2025-05-16T15:30:00.000Z" }, status: "Aprovado para entrevista" }
];

export const mockInscricoesVaga = [
  { _id: "insc1", aluno: { _id: "aluno1", nome_completo: "Aluno Mock da Silva", email: "aluno.mock@exemplo.com", curso: "Ciência da Computação", periodo: 5 }, data_inscricao: { "$date": "2025-05-21T10:00:00.000Z" }, status: "Em análise" },
  { _id: "insc3", aluno: { _id: "aluno2", nome_completo: "Maria Mock Oliveira", email: "maria.mock@exemplo.com", curso: "Engenharia de Software", periodo: 6 }, data_inscricao: { "$date": "2025-05-22T11:00:00.000Z" }, status: "Pendente" },
];

