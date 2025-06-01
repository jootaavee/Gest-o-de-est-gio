const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o script de seed...");

  // Limpar dados existentes (opcional, cuidado em produção)
  // await prisma.candidatura.deleteMany({});
  // await prisma.documento.deleteMany({});
  // await prisma.notificacao.deleteMany({});
  // await prisma.vaga.deleteMany({});
  // await prisma.user.deleteMany({});
  // console.log("Dados antigos removidos.");

  // Criar usuário Técnico
  const saltTecnico = await bcrypt.genSalt(10);
  const hashedPasswordTecnico = await bcrypt.hash("senhaTecnico123", saltTecnico); // Senha padrão para o técnico

  const tecnico = await prisma.user.upsert({
    where: { email: "tecnico@uern.br" },
    update: {},
    create: {
      nome_completo: "Administrador Técnico",
      email: "tecnico@uern.br",
      senha: hashedPasswordTecnico,
      tipo: UserRole.TECNICO,
      // Outros campos podem ser adicionados se necessário
    },
  });
  console.log(`Usuário Técnico criado/atualizado: ${tecnico.email}`);

  // Criar usuário Aluno
  const saltAluno = await bcrypt.genSalt(10);
  const hashedPasswordAluno = await bcrypt.hash("senhaAluno123", saltAluno); // Senha padrão para o aluno

  const aluno = await prisma.user.upsert({
    where: { email: "aluno.teste@email.com" },
    update: {},
    create: {
      nome_completo: "Aluno de Teste",
      email: "aluno.teste@email.com",
      senha: hashedPasswordAluno,
      tipo: UserRole.ALUNO,
      numero: "(84) 98888-7777",
      data_nascimento: new Date("2002-05-15"),
      cpf: "111.222.333-44",
      curso: "Ciência da Computação",
      periodo: 5,
      matricula: "2024001122",
    },
  });
  console.log(`Usuário Aluno criado/atualizado: ${aluno.email}`);

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

