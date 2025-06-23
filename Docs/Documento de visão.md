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

**O Sistema de Gerenciamento de Estágio (SGE)**  
**É UMA** plataforma web  
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
