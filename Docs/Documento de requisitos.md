# Documento de Requisitos - Sistema de Gerenciamento de Estágios (SGE)

## 1. Descrição Geral

### 1.1 Perspectiva do Produto
Sistema web independente, acessado via navegador.

### 1.2 Funções do Produto
- Gerenciamento de contas de usuário (Alunos e Técnicos PRAE).
- Gerenciamento de perfil do aluno (dados pessoais e documentos).
- Gerenciamento de vagas de estágio (cadastro, publicação, visualização).
- Processo de candidatura a vagas.
- Sistema de notificações.

### 1.3 Características dos Usuários
- **Aluno:** Estudante regularmente matriculado na UERN, com conhecimentos básicos de informática e acesso à internet. Necessita gerenciar seu estágio.
- **Técnico (PRAE):** Servidor da UERN, responsável pela administração dos processos de estágio. Possui conhecimentos de informática e dos regulamentos de estágio.

### 1.4 Restrições Gerais
- O sistema deve seguir as normas e regulamentos de estágio da UERN e a legislação vigente.
- Deve respeitar as diretrizes da **LGPD** para tratamento de dados pessoais.
- Tecnologias utilizadas:
  - Backend: Node.js, Express, Prisma, MongoDB.
  - Frontend: React.

### 1.5 Premissas e Dependências
- Premissas:
  - Conexão à internet disponível para os usuários.
  - Disponibilidade da infraestrutura de hospedagem.
  - Dados dos alunos (matrícula, curso) podem ser validados manualmente ou via integração.
- Dependências:
  - Acesso aos regulamentos atualizados da UERN.
  - Definição clara dos tipos de documentos exigidos pela PRAE.

---

## 2. Requisitos

### 2.1 Requisitos Funcionais (RF)

#### Módulo de Autenticação e Acesso

| ID    | Nome                      | Descrição                                                                                      | Prioridade |
|-------|----------------------------|------------------------------------------------------------------------------------------------|------------|
| RF001 | Cadastro de aluno          | Permitir que alunos se cadastrem informando matrícula, e-mail institucional e senha.          | Essencial  |
| RF002 | Login de usuário           | Permitir login de alunos e técnicos com e-mail/matrícula e senha.                             | Essencial  |
| RF003 | Recuperação de senha       | Permitir recuperação de senha pelos usuários.                                                 | Importante |
| RF004 | Logout                     | Permitir que usuários encerrem suas sessões.                                                  | Essencial  |

#### Módulo do Aluno

| ID    | Nome                                | Descrição                                                                                      | Prioridade |
|-------|--------------------------------------|------------------------------------------------------------------------------------------------|------------|
| RF005 | Visualizar perfil do aluno           | Exibir dados cadastrais e pessoais.                                                           | Essencial  |
| RF006 | Atualizar dados pessoais             | Permitir atualização dos dados pessoais e de contato.                                         | Essencial  |
| RF007 | Upload de currículo (CV)             | Permitir envio de currículo em PDF.                                                           | Essencial  |
| RF008 | Upload de documento tipo 1           | Permitir envio de documentos como Histórico Escolar.                                          | Essencial  |
| RF009 | Upload de documento tipo 2           | Permitir envio de documentos como Comprovante de Matrícula.                                   | Essencial  |
| RF010 | Visualizar documentos enviados       | Permitir consulta dos documentos já enviados.                                                 | Essencial  |
| RF011 | Substituir documento enviado         | Permitir substituição de documentos já enviados.                                              | Importante |
| RF012 | Visualizar vagas de estágio          | Listar vagas disponíveis, com filtros.                                                        | Essencial  |
| RF013 | Visualizar detalhes da vaga          | Exibir informações completas sobre uma vaga.                                                  | Essencial  |
| RF014 | Candidatar-se a uma vaga             | Permitir candidatura a uma vaga, submetendo perfil e documentos.                              | Essencial  |
| RF015 | Visualizar histórico de candidaturas | Permitir consulta das vagas candidatas e seus status.                                         | Essencial  |
| RF016 | Visualizar notificações              | Exibir notificações como nova vaga, status de candidatura e pendências de documentos.         | Essencial  |

#### Módulo do Técnico (PRAE)

| ID    | Nome                                | Descrição                                                                                      | Prioridade |
|-------|--------------------------------------|------------------------------------------------------------------------------------------------|------------|
| RF017 | Cadastrar nova vaga                  | Permitir cadastro de vagas de estágio.                                                        | Essencial  |
| RF018 | Editar vaga                          | Permitir edição dos detalhes de uma vaga.                                                     | Essencial  |
| RF019 | Publicar/Despublicar vaga            | Controlar visibilidade das vagas.                                                             | Essencial  |
| RF020 | Visualizar lista de vagas            | Listar vagas cadastradas com filtros e status.                                                | Essencial  |
| RF021 | Visualizar candidatos por vaga       | Ver lista de alunos candidatos a uma vaga específica.                                         | Essencial  |
| RF022 | Visualizar lista de alunos           | Consultar alunos cadastrados no sistema, com filtros.                                         | Essencial  |
| RF023 | Visualizar perfil detalhado do aluno | Ver perfil completo do aluno, incluindo documentos.                                           | Essencial  |
| RF024 | Gerenciar status do aluno            | Alterar status do aluno (Ativo, Inativo, Estagiando).                                         | Média      |
| RF025 | Baixar documentos do aluno           | Permitir download dos documentos enviados pelos alunos.                                       | Essencial  |
| RF026 | Alterar status da candidatura        | Alterar status da candidatura (Ex: Em análise, Encaminhado, Aprovado, Rejeitado).             | Essencial  |
| RF027 | Enviar notificação para alunos       | Enviar notificações manuais para alunos individuais ou em grupo.                              | Média      |

---

## 3. Requisitos Não Funcionais (RNF)

### 3.1 Usabilidade

| ID     | Nome                           | Descrição                                                                                    | Prioridade |
|--------|---------------------------------|----------------------------------------------------------------------------------------------|------------|
| RNF001 | Interface intuitiva             | Interface amigável e consistente para alunos e técnicos.                                    | Alta       |
| RNF002 | Design responsivo               | Interface adaptável a desktop, tablet e mobile.                                             | Alta       |
| RNF003 | Feedback ao usuário             | Exibir mensagens claras de erro, sucesso e alertas.                                         | Média      |
| RNF004 | Facilidade de uso               | Processos rápidos: candidatura em menos de 2 min e cadastro de vaga em menos de 5 min.      | Alta       |
| RNF005 | Acessibilidade WCAG AA          | Compatível com as diretrizes WCAG 2.1 nível AA.                                             | Média      |

### 3.2 Confiabilidade

| ID     | Nome                           | Descrição                                                                                    | Prioridade |
|--------|---------------------------------|----------------------------------------------------------------------------------------------|------------|
| RNF006 | Alta disponibilidade            | Disponibilidade de 99% no horário da UERN.                                                  | Alta       |
| RNF007 | Backup diário                   | Backups automáticos diários do banco de dados.                                              | Alta       |
| RNF008 | Tratamento de erros             | Tratamento robusto para erros no upload, falhas de banco, entre outros.                     | Alta       |

### 3.3 Desempenho

| ID     | Nome                           | Descrição                                                                                    | Prioridade |
|--------|---------------------------------|----------------------------------------------------------------------------------------------|------------|
| RNF009 | Tempo de login                  | Tempo de login inferior a 3 segundos.                                                       | Alta       |
| RNF010 | Carregamento de vagas           | Carregamento da lista de vagas (até 100) em menos de 4 segundos.                            | Média      |
| RNF011 | Carregamento de alunos          | Carregamento da lista de alunos (até 5000 registros) em menos de 5 segundos.                | Média      |
| RNF012 | Upload rápido                   | Upload de documentos até 5MB em menos de 10 segundos com conexão padrão.                    | Alta       |

---

