
# Manual do usuário – Gestão de Estágio

Este manual tem como objetivo guiar o usuário na configuração e execução do projeto de Gestão de Estágio. Ele detalha os passos necessários para obter o código-fonte, instalar as dependências e iniciar as aplicações de backend e frontend.

## 2. Pré-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas em seu ambiente:

- **Git**: Para clonar o repositório do projeto.
- **Node.js e npm**: Para executar as aplicações JavaScript (backend e frontend).

## 3. Configuração do projeto

Siga os passos abaixo para configurar o projeto em sua máquina local:

### 3.1. Clonar o repositório

Abra o terminal ou prompt de comando e execute o seguinte comando para clonar o repositório do projeto:

```bash
git clone https://github.com/jootaavee/Gest-o-de-est-gio.git
```

### 3.2. Navegar para a Branch `dev`

Após clonar o repositório, navegue para o diretório do projeto e, em seguida, para a branch de desenvolvimento (`dev`):

```bash
cd Gest-o-de-est-gio
git checkout dev
```

### 3.3. Configurar o arquivo `.env`

O projeto requer um arquivo `.env` para armazenar variáveis de ambiente sensíveis, como a URL de conexão com o banco de dados. Este arquivo **não está incluído no repositório por questões de segurança** e deverá ser fornecido separadamente. Certifique-se de colocar o arquivo `.env` na raiz da pasta `backend`.

Um exemplo básico do conteúdo do arquivo `.env` pode ser:

```
DATABASE_URL="mongodb://localhost:27017/gestao_estagio"
JWT_SECRET="exemplo-exemplo-exemplo"
```

**Observação:** A `DATABASE_URL` deve apontar para a sua instância do MongoDB. A `JWT_SECRET` deve ser uma string longa e complexa para garantir a segurança dos tokens de autenticação.

## 4. Instalação das dependências do Backend

Navegue até a pasta `backend` do projeto e instale as dependências necessárias:

```bash
cd backend
npm install
```

Em seguida, instale as bibliotecas globais `nodemon` e `dotenv` (se ainda não as tiver):

```bash
npm install -g nodemon
npm install dotenv
```

Após a instalação das dependências, gere o cliente Prisma para interagir com o banco de dados:

```bash
npx prisma generate
```

## 5. Instalação das dependências do Frontend

Navegue de volta para a raiz do projeto e, em seguida, para a pasta `Front` para instalar as dependências do frontend:

```bash
cd ..
cd Front
npm install
```

## 6. Execução do projeto

Com todas as dependências instaladas, você pode iniciar as aplicações de backend e frontend.

### 6.1. Iniciar o Backend

Ainda na pasta `backend`, execute o seguinte comando para iniciar o servidor de backend:

```bash
cd ../backend
npm run dev
```

O backend será iniciado e estará acessível, por padrão, em `http://localhost:3001` (ou a porta configurada no seu `.env`).

### 6.2. Iniciar o Frontend

Em um **novo terminal** ou prompt de comando, navegue até a pasta `Front` e inicie a aplicação frontend:

```bash
cd Front
npm start
```

O frontend será iniciado e abrirá automaticamente no seu navegador padrão, geralmente em `http://localhost:3000`.

Agora o sistema de Gestão de Estágio estará em execução e pronto para ser utilizado.


