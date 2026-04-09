<div align="center">
  <img src="../packages/cli/src/assets/img/sdg-agents-icon-light.svg" alt="SDG Icon" width="480" height="480" style="border-radius: 1rem; opacity: 0.95;">
  <h1 align="center">Spec Driven Guide</h1>
  <p align="center">
    Seu guia para Desenvolvimento Baseado em Especificações com Agentes de IA<br>
    <a href="../README.md">Read in English</a>
  </p>
  <a href="https://github.com/thiagocajadev/sdg-agents/actions/workflows/ci.yml"><img src="https://github.com/thiagocajadev/sdg-agents/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square&logo=nodedotjs" alt="Node" /></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License: ISC" /></a>
  <img src="https://img.shields.io/badge/idiomas-14%20stacks-purple?style=flat-square" alt="Idiomas" />
  <img src="https://img.shields.io/badge/agentes-5%20suportados-orange?style=flat-square" alt="Agentes" />
</div>
<p align="center"><b><a href="https://sdg-agents.vercel.app">Teste o Preview no Gerador de Prompts Web</a></b></p>
<br>

> **SDG** é um framework de **Governança Arquitetural Padronizada** para repositórios nativos em IA. Ele atua como um guia para que ambos, **Agentes de IA** e **Desenvolvedores**, trabalhem sob uma orientação rigorosa de processos. Ao distinguir conceitos fundamentais de engenharia da inteligência aplicada na automação, o SDG garante uma execução de nível Staff através de instruções integradas e ciclos automatizados.
> **"O equilíbrio é a chave."**

<p align="center">
  <kbd><img src="../packages/cli/src/assets/sdg-agents-menu.png" alt="Spec Driven Guide CLI em ação" /></kbd>
</p>

---

## Início Rápido (CLI)

Injete regras de engenharia e prompts diretamente no seu projeto:

```bash
npx sdg-agents
```

### Referência Rápida

Para um mapa completo de todos os comandos CLI e triggers de instrução para IA, consulte o [**Cheat Sheet de Referência Rápida (docs/CHEATSHEET.md)**](CHEATSHEET.md).

### Modos Padrão

1. **SDG - Agents**: Injeta instruções para Agentes de IA (Claude, Cursor, Windsurf, etc.).
2. **SDG - Prompts**: Injeta os templates da **Esteira de Especificações** para Desenvolvedores.
3. **Quick Setup**: Escolha padrão. Injeta tanto as regras para Agentes quanto os Prompts de uma só vez.

### Estrutura Gerada

Após a inicialização, seu projeto recebe uma estrutura de **Governança Técnica** padronizada:

```
├── .ai/               ← Governança (instruções, comandos, prompts)
└── .ai-backlog/       ← Memória de Trabalho (contexto e tarefas gitignored)
```

> [!TIP]
> **Mergulho Técnico Profundo**: Para um detalhamento completo de cada pasta, papel dos artefatos e da **Esteira de Especificações**, consulte nosso [**Guia de Estrutura do Projeto (PROJECT-STRUCTURE.md)**](PROJECT-STRUCTURE.md).

### Integração com IDEs

O SDG carrega automaticamente as regras para **Claude Code** (`CLAUDE.md`), **Antigravity (Gemini)**, **Codex**, **Copilot**, **Cursor** (`.mdc`), **Windsurf** (`.windsurfrules`) e outros.

---

## Engenharia Liderada por Agente

Em vez de escrever cada linha você mesmo, você define a direção e deixa o Agente cuidar da execução. Ele lê a base de código, propõe um plano estruturado, escreve o código e roda os testes, parando nos pontos certos para a sua aprovação antes de continuar.

Você mantém o controle das decisões que exigem julgamento real. O Agente cuida do resto.

---

## Sabores Arquiteturais e Multi-Stack

Durante a inicialização, você escolhe o **Sabor Arquitetural** (Flavor) que melhor se adapta ao seu projeto. Isso garante que o Agente de IA entenda o fluxo dos dados e as regras estruturais da sua base de código.

`Vertical Slice` → Desenvolvimento orientado a funcionalidades com fatias verticais independentes.  
`MVC` → Arquitetura clássica em camadas (Model-View-Controller).  
`Frontend` → Fluxo de dados cliente padrão para SPAs modernas.  
`UI Component` → Design atômico e fluxos de componentes baseados em estado.  
`Legacy` → Padrões de refatoração especializados para migração de código antigo.

> [!TIP]
> **Ver Pipelines Arquiteturais**: Para um detalhamento completo do caminho de dados de cada sabor, consulte o guia de [**Pipelines Arquiteturais (PIPELINES.md)**](PIPELINES.md).

O SDG suporta **14+ stacks** nativamente, incluindo:  
`C#` · `TypeScript` · `JavaScript` · `Python` · `Go` · `Rust` · `Java` · `Kotlin` · `Swift` · `Flutter` · `SQL` · `VB.NET`

---

## O Ciclo Spec-Driven de 5 Fases

Cada tarefa segue um ciclo de alta disciplina para garantir o alinhamento arquitetural e dívida técnica zero:

| Fase     | Objetivo    | Resultado Principal                                                        |
| :------- | :---------- | :------------------------------------------------------------------------- |
| **SPEC** | Contrato    | Especificação formal & checklist (usando a **Esteira de Especificações**). |
| **PLAN** | Estratégia  | Plano numerado aprovado e escrito em `.ai-backlog/tasks.md`.               |
| **CODE** | Execução    | Implementação limpa seguindo o plano aprovado.                             |
| **TEST** | Verificação | Todos os itens do checklist passados (Loop de correção se preciso).        |
| **END**  | Entrega     | Changelog atualizado, tarefas limpas, contexto sincronizado.               |

> [!TIP]
> **Fluxo Nível Staff**: O Agente para para **aprovação do desenvolvedor** em cada ponto crítico (Spec e Plano).
> [**Leia o Guia Completo de Desenvolvimento Spec-Driven**](../packages/cli/src/assets/dev-guides/spec-driven-dev-guide.md).

---

## As Leis da Governança Técnica

A Governança do SDG não é apenas sobre pastas; trata-se de princípios inegociáveis que garantem a qualidade de nível Staff:

`Hardening` · `Resiliência` · `A Cascata` · `Excelência Visual` · `Fronteiras` · `Reflexão` · `The Writing Soul`

### Exploração Técnica

- [**SDLC (Trilha Arquitetural para Desenvolvedores)**](../packages/cli/src/assets/dev-guides/software-development-lifecycle-sdlc.md) → _Manual para acompanhamento e auditoria do desenvolvedor em grandes evoluções._
- [**A Constituição SDG (Leis de Engenharia)**](CONSTITUTION.md) → _A fundação filosófica e os padrões inegociáveis do projeto._
- [**Estrutura Técnica do Projeto**](PROJECT-STRUCTURE.md) → _Detalhamento de Governança, Memória de Trabalho e caminhos locais._

---

## Manutenção Avançada

```bash
npx sdg-agents review    # Compara regras locais vs fonte
npx sdg-agents sync      # Atualiza padrões via web
npx sdg-agents clear     # Remove a pasta .ai/ (Governança)
```

---

## Estado do Projeto

- [**Roadmap**](ROADMAP.md) → Visão futura e marcos estratégicos.
- [**CHANGELOG**](../CHANGELOG.md) → Histórico técnico completo e versões passadas.

---

> [!WARNING]
> **Projeto Experimental**: Este projeto está em fase inicial. Use com cuidado e adapte as regras conforme necessário.

O SDG está em constante evolução. Não existe uma solução 100% perfeita, nosso propósito é melhorar continuamente o processo de desenvolvimento.

Sinta-se à vontade para contribuir, fazer fork e compartilhar!
