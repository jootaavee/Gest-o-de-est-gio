# Backend - Sistema de Gerenciamento de Estágio

Este é o backend desenvolvido em Node.js com Express, Prisma e MongoDB para o Sistema de Gerenciamento de Estágio.

## Instruções de Configuração e Execução (Ambiente Windows)

Siga estes passos para configurar e executar o backend em seu ambiente Windows:

### 1. Pré-requisitos:

Antes de começar, certifique-se de ter instalado:

*   **Node.js:** (Versão 16 ou superior recomendada). Você pode baixar em [https://nodejs.org/](https://nodejs.org/)
*   **npm:** Geralmente vem instalado com o Node.js.
*   **MongoDB:** Um banco de dados NoSQL. Siga as instruções abaixo para instalá-lo.

### 2. Instalação do MongoDB:

*   **Download:** Baixe o MongoDB Community Server para Windows no site oficial: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
*   **Instalação:** Siga o assistente de instalação. Recomenda-se instalar como um serviço do Windows para que ele seja executado automaticamente em segundo plano.
*   **MongoDB Compass (Opcional, mas recomendado):** Durante a instalação, você pode optar por instalar o MongoDB Compass, uma ferramenta gráfica para visualizar e gerenciar seu banco de dados.
*   **Verificação:** Após a instalação, o serviço MongoDB deve estar rodando. Você pode verificar isso no Gerenciador de Serviços do Windows (procurando por "MongoDB Server").

### 3. Configuração do Backend:

*   **Extraia os arquivos:** Descompacte o arquivo `sistema-estagio-backend.zip` que enviei em uma pasta de sua preferência.
*   **Abra o Terminal:** Navegue até a pasta do backend (`sistema-estagio/backend`) usando o terminal (Prompt de Comando, PowerShell ou Git Bash).
*   **Instale as Dependências:** Execute o comando abaixo para instalar todas as bibliotecas necessárias:
    ```bash
    npm install
    ```
*   **Configure as Variáveis de Ambiente:**
    *   Renomeie o arquivo `.env.example` (se existir) para `.env` ou crie um novo arquivo chamado `.env` na raiz da pasta `backend`.
    *   Abra o arquivo `.env` e configure as variáveis:
        ```dotenv
        # String de conexão do MongoDB. Se estiver rodando localmente na porta padrão,
        # geralmente é assim. 'sistema_estagio' é o nome do banco de dados que será criado.
        DATABASE_URL="mongodb://localhost:27017/sistema_estagio"

        # Segredo para gerar tokens JWT. Troque por uma string longa e segura.
        JWT_SECRET="COLOQUE_AQUI_UM_SEGREDO_FORTE_E_UNICO"

        # Porta em que o backend será executado.
        PORT=3001
        ```
    *   **Importante:** Substitua `"COLOQUE_AQUI_UM_SEGREDO_FORTE_E_UNICO"` por uma chave secreta segura de sua escolha.

### 4. Preparação do Banco de Dados (Prisma):

*   **Sincronizar Schema com o Banco:** Este comando aplica o schema do Prisma ao seu banco de dados MongoDB.
    ```bash
    npx prisma db push
    ```
    *Nota: Este comando pode pedir confirmação, especialmente na primeira vez.* 
*   **Gerar o Prisma Client:** Garante que o cliente Prisma esteja atualizado com o schema.
    ```bash
    npx prisma generate
    ```
*   **Popular o Banco com Dados Iniciais (Seed):** Este comando executa o script `prisma/seed.js` para criar o usuário Técnico e o usuário Aluno iniciais.
    ```bash
    npx prisma db seed
    ```
    *   **Credenciais Iniciais:**
        *   **Técnico:**
            *   Email: `tecnico@uern.br`
            *   Senha: `senhaTecnico123`
        *   **Aluno:**
            *   Email: `aluno.teste@email.com`
            *   Senha: `senhaAluno123`
    *   **Recomendação:** Altere essas senhas padrão após o primeiro login.

### 5. Executando o Backend:

*   **Modo de Desenvolvimento (com recarga automática):**
    ```bash
    npm run dev
    ```
    *Este comando usa o `nodemon` para reiniciar o servidor automaticamente quando você fizer alterações nos arquivos.* 
*   **Modo de Produção (simples):**
    ```bash
    npm start
    ```
*   Após iniciar, você deverá ver a mensagem `Servidor rodando na porta 3001` (ou a porta que você definiu no `.env`).
*   O backend estará acessível em `http://localhost:3001`.

### 6. Conectando o Frontend:

*   Você precisará configurar o seu projeto frontend (React) para fazer requisições para a URL base do backend (`http://localhost:3001/api`).
*   Normalmente, isso é feito em um arquivo de configuração de ambiente (como `.env`) ou em um arquivo de constantes no frontend.
*   Certifique-se de que as chamadas de API no frontend (usando `fetch` ou `axios`, por exemplo) apontem para os endpoints corretos (ex: `http://localhost:3001/api/auth/login`, `http://localhost:3001/api/vagas`, etc.).

## Estrutura do Projeto Backend:

```
backend/
├── prisma/
│   ├── schema.prisma     # Definição do modelo de dados
│   └── seed.js           # Script para popular dados iniciais
├── src/
│   ├── controllers/      # Lógica de negócio para cada rota
│   ├── middlewares/      # Funções intermediárias (autenticação, upload)
│   ├── routes/           # Definição dos endpoints da API
│   ├── services/         # (Opcional) Lógica de serviço reutilizável
│   └── prismaClient.js   # Instância única do Prisma Client
├── uploads/              # Pasta onde os documentos enviados são armazenados
├── .env                  # Arquivo de variáveis de ambiente (NÃO versionar)
├── package.json          # Dependências e scripts do projeto
├── package-lock.json     # Lock das versões das dependências
└── server.js             # Ponto de entrada principal da aplicação Express
```

Se encontrar qualquer problema durante a configuração ou execução, verifique as mensagens de erro no terminal e consulte a documentação das ferramentas (Node.js, Prisma, MongoDB).

