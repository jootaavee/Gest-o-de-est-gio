# Sistema de Gerenciamento de Estágios (SGE)
> Plataforma web para gerenciamento de vagas de estágio, documentos e acompanhamento de estudantes na UERN.

[![Build Status][travis-image]][travis-url]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

O **SGE** é um sistema web desenvolvido para auxiliar a Pró-Reitoria de Assuntos Estudantis (PRAE) da UERN no gerenciamento de vagas de estágio, cadastro de alunos, envio de documentos e acompanhamento de candidaturas. O sistema facilita a comunicação entre estudantes e setor técnico, promovendo organização e eficiência.

![](header.png) <!-- Você pode substituir por um banner do projeto -->

---

## 📦 Instalação

### Linux & macOS:

```sh
git clone https://github.com/usuario/sge.git
cd sge
npm install
```

### Windows:

```sh
git clone https://github.com/usuario/sge.git
cd sge
npm install
```

## 🚀 Exemplo de uso

- Aluno se cadastra e visualiza vagas de estágio disponíveis.
- PRAE analisa documentos enviados.
- Candidaturas são organizadas com status e notificações automáticas.
- Integração futura com sistema acadêmico da UERN (API).

```js
// Exemplo fictício de requisição para listagem de vagas
fetch('/api/vagas')
  .then(res => res.json())
  .then(data => console.log(data));
```

> Para mais exemplos e detalhes, acesse o [Wiki][wiki].

---

## ⚙️ Configuração do ambiente de desenvolvimento

1. Instale as dependências:
```sh
npm install
```

2. Execute o ambiente de desenvolvimento:
```sh
npm run dev
```

3. Execute os testes automatizados:
```sh
npm run test
```

---

## 📜 Histórico de Versões

* 0.2.0
    * ADD: Funcionalidade de candidatura a vagas
    * ADD: Notificações automáticas
* 0.1.0
    * ADD: Cadastro de alunos e vagas
    * ADD: Upload de documentos
* 0.0.1
    * Projeto iniciado

---

## 👨‍🏫 Meta

**Projeto Acadêmico** — _Disciplina_: Engenharia de Software  
**Professor**: Alysson Oliveira  
**Discentes**:  
- Alicia Monteiro  
- Ciro Assuero  
- Kleiton Josivan  
- João Vitor Fernandes  
- Robert Danilo

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais detalhes.  
[Repositório GitHub](https://github.com/usuario/sge)

---

## 🤝 Contribuindo

1. Faça o fork (<https://github.com/usuario/sge/fork>)
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas alterações (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Crie um Pull Request

<!-- Markdown link & img dfn's -->
[travis-image]: https://img.shields.io/travis/com/github/usuario/sge/main.svg?style=flat-square
[travis-url]: https://travis-ci.com/github/usuario/sge
[wiki]: https://github.com/usuario/sge/wiki
