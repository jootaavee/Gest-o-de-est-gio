// backend/jest.config.js
module.exports = {
  // Ambiente de teste para Node.js
  testEnvironment: 'node',

  // Pastas a serem ignoradas ao procurar por testes e código
  testPathIgnorePatterns: ['/node_modules/', '/dist/'], // '/dist/' se tiver pasta de build

  // Ativar a coleta de cobertura de código
  collectCoverage: true,

  // Pasta onde os relatórios de cobertura serão salvos
  coverageDirectory: 'coverage',

  // O provedor de cobertura a ser usado (v8 é bom para Node.js)
  coverageProvider: 'v8',

  // De quais arquivos a cobertura DEVE ser coletada
  // IMPORTANTE: Ajuste 'src/**/*.js' para o caminho da sua pasta de código fonte.
  collectCoverageFrom: [
    'src/**/*.js',          // Todos os arquivos .js dentro de 'src' e suas subpastas
    '!src/server.js',       // EXCLUA seu arquivo principal do servidor (server.js ou app.js)
    '!src/prismaClient.js', // EXCLUA o arquivo que inicializa o PrismaClient
    '!src/routes/**/*.js',  // OPCIONAL: Exclua arquivos de rotas se você os testa mais como integração
                            // com Supertest, e não unitariamente cada função de rota.
    // EXCLUA qualquer pasta ou arquivo que não contém lógica testável (ex: migrations, logs)
    // EXCLUA seus próprios arquivos de teste:
    '!**/__tests__/**',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!jest.config.js'       // Exclua este próprio arquivo
  ],

  // OPCIONAL: Definir um mínimo de cobertura para os testes passarem
  // Se você definir isso, `npm test` falhará se a cobertura não for atingida.
  // Por enquanto, pode deixar comentado até você ter alguns testes.
  /*
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 45,
      lines: 50,    // Nosso objetivo é atingir 50% de linhas
      statements: 50,
    },
  },
  */

  // Reseta os mocks automaticamente antes de cada teste
  resetMocks: true,

  // Limpa os mocks automaticamente antes de cada teste
  clearMocks: true,
};