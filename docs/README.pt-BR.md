<div align="center">
  <img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/src/assets/img/sdg-agents-icon-light.svg" alt="SDG Agents" width="480" height="480" style="border-radius: 1rem;">
  <h1 align="center">Spec-Driven Guide — Agents</h1>
  <p align="center">
    Um CLI que instala um conjunto de instruções para agentes de IA no seu projeto.<br>
    <a href="../README.md">Read in English</a>
  </p>
  <p align="center">
      Leia o manifesto e o guia visual em <a href="https://specdrivenguide.org">specdrivenguide.org</a>
  </p>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D24-brightgreen?style=flat-square&logo=nodedotjs" alt="Node" /></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License: ISC" /></a>
</div>

<br>

`sdg-agents` instala um conjunto de arquivos de instrução em markdown no seu projeto. Agentes de IA (Claude Code, Cursor, Windsurf, Copilot, Codex e outros) leem esses arquivos e seguem o protocolo definido em cada tarefa.

> **Nota:** Se o seu agente não carregar as regras automaticamente, referencie `.ai/skill/AGENTS.md` no início da sessão.

O conjunto de instruções cobre:

- **Protocolo de trabalho**: um ciclo de 5 fases (SPEC → PLAN → CODE → TEST → END) que estrutura como o agente conduz qualquer tarefa. Inclui **Quality Gate** (CODE), **Audit Gate** (TEST) e um **Circuit Breaker** de 3 tentativas (STOP).
- **Regras de engenharia**: nomenclatura, estilo de código, padrões de clean code, limites de segurança
- **Padrões de linguagem**: convenções idiomáticas para o seu stack específico
- **Guia arquitetural**: regras para o padrão estrutural do projeto (vertical slice, MVC, etc.)
- **Toolkit de Design Criativo**: instruções especializadas para branding, estratégia de redes sociais e blueprints de landing pages
- **Harness Engineering (Memory)**: uma pasta `.ai-backlog/` que persiste contexto e estado de tarefas entre sessões

---

## Início Rápido

```bash
npx sdg-agents
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/src/assets/img/sdg-agents-menu-v2.png" alt="Spec Driven Guide CLI em ação" /></kbd>
</p>

O assistente interativo guia você na escolha do flavor arquitetural e um ou mais idiomas. Para uso não-interativo:

```bash
# Instalação sem prompts (padrão lite + JS/TS)
npx sdg-agents init --quick

# TypeScript + Vertical Slice
npx sdg-agents init --flavor vertical-slice --idiom typescript

# Multi-idioma
npx sdg-agents init --flavor mvc --idiom typescript,python

# Adicionar um idioma a um projeto existente
npx sdg-agents add
```

---

## O Que É Instalado

Após rodar `init`, seu projeto recebe:

```
seu-projeto/
├── .ai/                         ← Conjuntos de instruções (commitado)
│   ├── skill/AGENTS.md          ← Ponto de entrada
│   ├── instructions/            ← Lógica core, flavors e idiomas
│   ├── commands/                ← Contexto para os ciclos (feat/fix/docs/audit/land)
│   ├── workflows/               ← Protocolo de processos
│   └── dev-guides/              ← Templates de spec e guias
└── .ai-backlog/                 ← Harness Engineering (Memory) — gitignored
    └── ...                      ← (Veja docs/PROJECT-STRUCTURE.md para detalhes)
```

`dev-guides/` é sempre incluído. Contém o guia do ciclo de 5 fases, o fluxo de decisão interno, referência de SDLC, guia de prompts de UI e templates de spec (`prompt-tracks/`) para autoria da fase SPEC de qualquer tarefa.

Arquivos de entrada por agente (`CLAUDE.md`, `.cursorrules`, `.windsurfrules`, etc.) também são escritos na raiz do projeto.

> Para um detalhamento do papel de cada arquivo, veja [Estrutura do Projeto](PROJECT-STRUCTURE.md).

---

## Como o Protocolo Funciona

Ao prefixar uma mensagem ao agente, ele entra no ciclo correspondente:

| Trigger             | Ciclo   | O que acontece                                                                                                                                                   |
| :------------------ | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `land: <descrição>` | Land    | Agente transforma uma visão bruta em um backlog de tarefas `feat:` sequenciadas — roda antes de qualquer código ser escrito                                      |
| `feat: <descrição>` | Feature | Agente executa SPEC → PLAN → CODE → TEST → END                                                                                                                   |
| `fix: <descrição>`  | Fix     | Agente executa SPEC → PLAN → CODE → TEST → END com foco em RCA                                                                                                   |
| `docs: <descrição>` | Docs    | Agente atualiza changelogs, ADRs ou specs                                                                                                                        |
| `audit: <escopo>`   | Audit   | Agente verifica alinhamento do projeto contra as regras (detecção de drift)                                                                                      |
| `end:`              | —       | Encerra o ciclo ativo — executa o checklist do Phase: END (changelog, backlog, commit). Também recupera um ciclo se o agente perder o fio numa conversa paralela |
| Sem prefixo         | —       | Agente pergunta: "land, feat, fix, docs ou audit?" — e então prossegue                                                                                           |

O agente **para e aguarda sua aprovação** em SPEC e PLAN antes de escrever qualquer código.

```
SPEC  →  PLAN  →  CODE  →  TEST  →  END
  ↑           ↑                       ↑
  Wait        Wait                 "end:"
```

> Digite `end:` para encerrar o ciclo ativo. O agente executa o checklist completo do END — changelog, sincronização do backlog, proposta de commit. Se o agente perder o fio numa conversa paralela, `end:` também recupera o ciclo.

Para um guia detalhado de cada fase, veja [Guia Spec-Driven](../src/assets/dev-guides/spec-driven-dev-guide.md).
Para um diagrama visual dos gates de decisão, veja [Agent Deep-Flow](../src/assets/dev-guides/agent-deep-flow.md).

---

## Flavors Arquiteturais

Escolha o flavor que corresponde à estrutura do seu projeto:

| Flavor           | Padrão                                    | Use quando                          |
| :--------------- | :---------------------------------------- | :---------------------------------- |
| `vertical-slice` | Cortes verticais por feature              | Monorepo ou API orientada a domínio |
| `mvc`            | Camadas clássicas (Model-View-Controller) | Serviço REST padrão                 |
| `lite`           | Scaffold mínimo                           | Scripts, CLIs, utilitários          |
| `legacy`         | Padrões bridge seguros para refatoração   | Migrando bases de código existentes |

Para o diagrama de fluxo de dados de cada flavor, veja [Pipelines Arquiteturais](PIPELINES.md).

---

## Idiomas

Instale padrões específicos da linguagem junto com o protocolo:

`typescript` · `javascript` · `python` · `csharp` · `java` · `kotlin` · `go` · `rust` · `swift` · `flutter` · `sql` · `vbnet`

```bash
# Adicionar um idioma a um projeto existente
npx sdg-agents add
```

---

## Manutenção

```bash
npx sdg-agents review    # Detectar drift entre regras locais e a fonte
npx sdg-agents sync      # Atualizar rulesets da fonte
npx sdg-agents update    # Atualizar o registro de versões LTS
npx sdg-agents clear     # Remover a pasta .ai/
```

---

## Referência

- [Referência Rápida (CHEATSHEET)](CHEATSHEET.md) — todos os flags do CLI e triggers do agente
- [Estrutura do Projeto](PROJECT-STRUCTURE.md) — detalhamento de cada arquivo gerado
- [Pipelines Arquiteturais](PIPELINES.md) — diagramas de fluxo por flavor
- [Leis de Engenharia (CONSTITUTION)](CONSTITUTION.md) — os princípios por trás das regras
- [Sistema UI/UX](UI-UX.md) — hierarquia de design, escala tonal de superfície, presets e mapa de fonte única de verdade
- [Roadmap](ROADMAP.md) — trabalho planejado
- [Changelog](../CHANGELOG.md) — histórico de versões

---

> **Aviso:** Este projeto está em desenvolvimento inicial. Revise e ajuste as regras instaladas conforme os padrões da sua equipe antes de depender delas.

_O equilíbrio é a chave._

O SDG está em constante evolução — não existe solução perfeita, apenas melhoria contínua. Sinta-se à vontade para contribuir, fazer fork e compartilhar.
