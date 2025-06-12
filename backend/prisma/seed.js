// backend/prisma/seed.js

// IMPORTANTE: Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seedTecnico() {
  console.log("  Verificando/Criando usuário Técnico...");
  const saltTecnico = await bcrypt.genSalt(10);
  const hashedPasswordTecnico = await bcrypt.hash("123456", saltTecnico); // Senha PADRÃO para o técnico

  // Dados para o técnico
  const tecnicoData = {
    nome_completo: "Administrador Técnico UERN",
    email: "tecnico@uern.br",
    senha: hashedPasswordTecnico,
    tipo: UserRole.TECNICO,
    // Adicione quaisquer outros campos OBRIGATÓRIOS do seu model User que não tenham valor padrão
    // Ex: cpf: "000.000.000-01", matricula: "TEC001" (devem ser únicos)
    configuracoes: { // Exemplo de configurações iniciais
      tema: 'system',
      idioma: 'pt-br',
      notificacoesEmail: true
    }
  };

  const tecnico = await prisma.user.upsert({
    where: { email: "tecnico@uern.br" }, // Deve ser um campo @unique
    update: { // O que atualizar se o usuário já existir
      nome_completo: "Administrador Técnico UERN (Atualizado)", // Para ver que o update ocorreu
      senha: hashedPasswordTecnico, // Atualiza a senha para o padrão, caso tenha sido alterada
      // Não precisa definir 'updatedAt' aqui, o Prisma faz.
    },
    create: tecnicoData, // Se não existir, cria com todos os dados. Prisma define 'createdAt' e 'updatedAt'.
  });
  console.log(`    -> Técnico: ${tecnico.email} (ID: ${tecnico.id})`);
  return tecnico;
}

async function seedAluno() {
  console.log("  Verificando/Criando usuário Aluno...");
  const saltAluno = await bcrypt.genSalt(10);
  const hashedPasswordAluno = await bcrypt.hash("123456", saltAluno); // Senha PADRÃO para o aluno

  // Dados para o aluno
  const alunoData = {
    nome_completo: "Aluno Teste Silva",
    email: "aluno.teste@email.com",
    senha: hashedPasswordAluno,
    tipo: UserRole.ALUNO,
    numero: "(84) 91234-5678",
    data_nascimento: new Date("2002-05-15"), // Formato correto para JavaScript
    cpf: "111.222.333-44",         // Deve ser @unique
    curso: "Ciência da Computação",
    periodo: 5,
    matricula: "2024001122",       // Deve ser @unique
    configuracoes: {
      tema: 'light',
      idioma: 'pt-br',
      notificacoesEmail: true
    }
    // Prisma definirá 'createdAt' e 'updatedAt' automaticamente
  };

  const aluno = await prisma.user.upsert({
    where: { email: "aluno.teste@email.com" }, // Email deve ser @unique
    update: { // O que atualizar se o usuário já existir
      nome_completo: "Aluno Teste Silva (Atualizado)",
      senha: hashedPasswordAluno, // Atualiza senha para o padrão
      numero: "(84) 98888-7777", // Exemplo de campo a ser atualizado
    },
    create: alunoData,
  });
  console.log(`    -> Aluno: ${aluno.email} (ID: ${aluno.id})`);
  return aluno;
}

// Exemplo de como você poderia criar vagas, se quisesse
// async function seedVagas(tecnicoCriador) {
//   console.log("  Criando algumas vagas de exemplo...");
//   if (!tecnicoCriador || !tecnicoCriador.id) {
//     console.error("    ERRO: ID do técnico criador não fornecido para criar vagas.");
//     return;
//   }
//   const vagaExemplo1 = await prisma.vaga.upsert({
//     where: { titulo: "Estágio Dev Frontend (Seed)" }, // Assumindo que 'titulo' seja um bom candidato para @unique, ou crie um ID específico.
//     update: {
//         descricao: "Atualização: Vaga para desenvolvedor frontend júnior para atuar com React e TailwindCSS.",
//         bolsa: "R$ 1300,00",
//     },
//     create: {
//       titulo: "Estágio Dev Frontend (Seed)",
//       descricao: "Vaga para desenvolvedor frontend júnior para atuar com React e TailwindCSS.",
//       empresa: "Tech Inovadora Ltda",
//       local: "Remoto (Brasil)",
//       bolsa: "R$ 1200,00",
//       carga_horaria: 30,
//       ativa: true,
//       data_abertura: new Date(new Date().setDate(new Date().getDate() - 7)), // Abriu 7 dias atrás
//       data_encerramento: new Date(new Date().setDate(new Date().getDate() + 30)), // Encerra em 30 dias
//       criado_por_id: tecnicoCriador.id,
//     },
//   });
//   console.log(`    -> Vaga criada/atualizada: ${vagaExemplo1.titulo}`);
// }


async function main() {
  console.log("==========================================");
  console.log("🚀 Iniciando o script de seed do banco de dados...");
  console.log("==========================================");

  // LIMPEZA OPCIONAL (Use com MUITO CUIDADO em desenvolvimento)
  // A ordem importa se houver chaves estrangeiras. Delete "filhos" antes de "pais".
  // console.log("\n⚠️ Atenção: Limpando coleções (se descomentado)...");
  // await prisma.candidatura.deleteMany({});
  // await prisma.documento.deleteMany({});
  // await prisma.notificacao.deleteMany({});
  // await prisma.vaga.deleteMany({});
  // await prisma.user.deleteMany({
  //   where: { // Condição para não apagar usuários que não são de seed
  //     OR: [
  //       { email: "tecnico@uern.br" },
  //       { email: "aluno.teste@email.com" }
  //     ]
  //   }
  // });
  // console.log("  Limpeza de dados relevantes concluída.");

  console.log("\n👤 Processando Usuários...");
  const tecnicoUser = await seedTecnico();
  const alunoUser = await seedAluno();

  // Se quiser criar vagas de exemplo, descomente e ajuste:
  // if (tecnicoUser) {
  //   console.log("\n📄 Processando Vagas de Exemplo...");
  //   await seedVagas(tecnicoUser);
  // }

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("==========================================");
}

main()
  .catch(async (e) => {
    console.error("\n❌ Erro crítico durante o processo de seed:");
    console.error(e); // Log completo do erro
    await prisma.$disconnect(); // Garante que desconecta mesmo se der erro
    process.exit(1);
  })
  .finally(async () => {
    console.log("\n🔌 Desconectando do Prisma Client...");
    await prisma.$disconnect(); // Desconecta após sucesso ou falha (se não saiu antes)
    console.log("   Desconexão concluída.");
  });