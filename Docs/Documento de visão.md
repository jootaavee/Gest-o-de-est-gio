# Documento de Visão - Sistema de Gerenciamento de Estágios (SGE)

## 1. Introdução

Este documento apresenta a visão geral do Sistema de Gerenciamento de Estágio (SGE), uma plataforma web projetada para facilitar e centralizar a gestão de estágios acadêmicos. Ele descreve o problema atual, a proposta de solução, os usuários envolvidos (stakeholders), suas necessidades, as principais funcionalidades esperadas e as restrições do projeto. O objetivo é alinhar expectativas e fornecer uma base clara para o desenvolvimento do sistema.

## 2. Posicionamento

### 2.1 Problema

A atual gestão de estágios é descentralizada, manual e altamente dependente de e-mails, planilhas e documentos físicos. Esse modelo consome tempo, é suscetível a erros e dificulta a comunicação entre os envolvidos. Alunos têm dificuldade para encontrar vagas adequadas, empresas enfrentam desafios para divulgar oportunidades e encontrar candidatos qualificados, e as instituições têm pouca visibilidade e controle sobre o progresso dos estágios.

### 2.2 Afeta quem?

- Alunos
- Coordenadores de curso
- Setor de estágios da instituição
- Empresas parceiras
- Orientadores acadêmicos
- Supervisores de estágio nas empresas

### 2.3 Impacto do problema

- Perda de oportunidades de estágio
- Sobrecarga administrativa para a instituição
- Dificuldade no acompanhamento do desempenho dos alunos
- Risco de não conformidade com a legislação vigente (ex: Lei de Estágio)
- Falta de rastreabilidade e histórico centralizado dos estágios

### 2.4 Solução encontrada

Um sistema web centralizado, intuitivo e automatizado que permita a gestão completa de estágios, desde a publicação de vagas até a avaliação final, integrando todos os envolvidos no processo.

## 3. Declaração de visão do produto

**PARA** alunos, coordenadores de estágio da instituição, empresas parceiras e orientadores,  
**QUE** necessitam de um processo eficiente, transparente e centralizado para gerenciar estágios,  

**O Sistema de Gerenciamento de Estágio (SGE)** **É UMA** plataforma web  
**QUE** permite o cadastro de vagas, candidaturas, gerenciamento de documentos, acompanhamento e avaliação de estágios, facilitando a comunicação entre todas as partes.  
**DIFERENTE DE** processos manuais baseados em e-mail e planilhas, ou sistemas genéricos não especializados,  
**NOSSO PRODUTO** oferece uma solução completa e integrada, focada nas necessidades específicas do ecossistema de estágios, com interface intuitiva e fluxos otimizados.

## 4. Stakeholders

| Stakeholder               | Papel principal            | Interesses                                                                 | Influência |
|---------------------------|----------------------------|----------------------------------------------------------------------------|------------|
| **Alunos**                | Usuários primários         | Encontrar vagas, gerenciar candidaturas, submeter documentos, receber feedback | Alta       |
| **Empresas/Recrutadores** | Ofertantes de vagas        | Publicar vagas, gerenciar candidatos, formalizar contratação, avaliar estagiários | Alta    |
| **Coordenadores de Curso**| Gestores acadêmicos        | Acompanhar alunos, aprovar planos de estágio, garantir qualidade pedagógica | Média      |
| **Setor de Estágios (IES)**| Administradores do processo | Gerenciar convênios, validar documentos, garantir conformidade, gerar relatórios | Alta     |
| **Orientadores Acadêmicos**| Acompanhamento pedagógico | Orientar alunos, aprovar planos, avaliar relatórios e desempenho            | Média      |
| **Supervisores (Empresa)**| Acompanhamento na empresa | Acompanhar estagiários, definir atividades, avaliar desempenho              | Média      |
| **Equipe de Desenvolvimento** | Construtores do sistema | Compreender requisitos, entregar uma solução robusta e de qualidade         | Alta       |

# 5. Backlogs do produto 

| ID  | Funcionalidade                  | História de Usuário                                                                                      | Prioridade |
|-----|---------------------------------|-----------------------------------------------------------------------------------------------------------|------------|
| 01  | Autenticação e acesso           | Como discente, desejo me cadastrar e fazer login, para acessar o sistema de estágios.                    | Alta       |
| 02  | Autenticação e acesso           | Como técnico da PRAE, desejo acessar o sistema, para gerenciar os dados dos estágios.                    | Alta       |
| 03  | Gerenciamento de vagas          | Como técnico da PRAE, desejo cadastrar vagas de estágio, para que os discentes possam se candidatar.     | Alta       |
| 04  | Gerenciamento de vagas          | Como discente, desejo visualizar vagas disponíveis, para escolher a que mais se encaixa no meu perfil.   | Alta       |
| 05  | Gerenciamento de vagas          | Como discente, desejo me candidatar a uma vaga, para participar do processo de estágio.                  | Alta       |
| 06  | Gerenciamento de estágios       | Como técnico da PRAE, desejo acompanhar o status dos discentes em estágio, para realizar o controle.     | Média      |
| 07  | Documentação de estágio         | Como discente, desejo enviar documentos obrigatórios, para formalizar meu estágio.                       | Média      |
| 08  | Documentação de estágio         | Como técnico da PRAE, desejo validar documentos enviados, para assegurar que estão corretos.             | Média      |
| 09  | Notificações e comunicação      | Como discente, desejo receber notificações sobre meu processo de estágio, para acompanhar meu status.    | Média      |
| 10  | Notificações e comunicação      | Como técnico da PRAE, desejo enviar atualizações e avisos aos discentes, para manter a comunicação ativa.| Média      |
| 11  | Gestão administrativa           | Como técnico da PRAE, desejo gerenciar dados dos discentes e empresas, para manter o cadastro atualizado.| Baixa      |
| 12  | Relatórios                      | Como técnico da PRAE, desejo gerar relatórios de vagas, alunos e status de estágio, para acompanhamento. | Baixa      |
| 13  | Requisitos não Funcionais       | Como usuário, desejo que o sistema tenha uma interface responsiva, para acesso em qualquer dispositivo.  | Média      |
| 14  | Requisitos não Funcionais       | Como desenvolvedor, desejo integração contínua, para garantir deploy automatizado e testes constantes.   | Alta       |
| 15  | Requisitos não Funcionais       | Como usuário, desejo que o sistema seja seguro, para proteger meus dados pessoais.                       | Alta       |

---

## 6. Características principais do produto

- Cadastro e gerenciamento de usuários (alunos, empresas, orientadores).
- Publicação e busca de vagas de estágio.
- Processo de candidatura e seleção.
- Upload, validação e acompanhamento de documentos.
- Avaliação de desempenho e feedback.
- Comunicação via mensagens e notificações.
- Geração de relatórios gerenciais e estatísticas.
- Controle de permissões por perfil de usuário.

## 7. Restrições e exclusões

- O sistema será inicialmente disponibilizado apenas como plataforma web (sem app mobile nativo).
- Integrações com sistemas acadêmicos (ex: matrícula, notas) podem ser incluídas em versões futuras.
- O sistema não atuará como intermediador legal entre empresa e aluno — apenas facilitará a troca de informações e documentos.
- Funcionalidades como videochamadas ou entrevistas online não fazem parte do escopo inicial.
