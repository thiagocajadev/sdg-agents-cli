<div align="center">
  <img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/docs/img/sdg-agents-icon-light.svg" alt="SDG Agents" width="480" height="480" style="border-radius: 1rem;">
  <h1 align="center">Spec-Driven Guide — Agents</h1>
  <p align="center">
    Um CLI que instala um conjunto de instruções para agentes de IA no seu projeto.<br>
    <a href="../../README.md">Read in English</a>
  </p>
  <p align="center">
      Leia o manifesto e o guia visual em <a href="https://specdrivenguide.org">specdrivenguide.org</a>
  </p>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D24-brightgreen?style=flat-square&logo=nodedotjs" alt="Node" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License: ISC" /></a>
</div>

<br>

`sdg-agents` instala um conjunto de arquivos de instrução em markdown no seu projeto. Agentes de IA (Claude Code, Cursor, Windsurf, Copilot, Codex e outros) leem esses arquivos e seguem o protocolo definido em cada tarefa.

> **Nota:** Se o seu agente não carregar as regras automaticamente, referencie `.ai/skills/AGENTS.md` no início da sessão.

O conjunto de instruções cobre:

- **Protocolo de trabalho**: um ciclo de 5 fases (SPEC → PLAN → CODE → TEST → END) que estrutura como o agente conduz qualquer tarefa. Inclui **Quality Gate** (CODE), **Audit Gate** (TEST) e um **Circuit Breaker** de 3 tentativas (STOP).
- **Leis de Engenharia**: 8 leis universais (Protocol, Hardening, Resilience, Narrative Cascade, Visual Excellence, Boundaries, Reflection, Contextual Efficiency) carregadas apenas na fase CODE.
- **Skills sob demanda**: code style, testing, security, API design, data access, observability, CI/CD, cloud, SQL style, UI/UX — cada uma é uma unidade auto-contida carregada somente quando o ciclo atual precisa.
- **Idiomas de linguagem**: convenções idiomáticas para o seu stack (JS, TS, Python, C#, Java, Kotlin, Go, Rust, Swift, Flutter, SQL, VB.NET).
- **Flavors arquiteturais**: regras para o padrão estrutural do projeto (vertical slice, MVC, lite, legacy).
- **Compatível com qualquer agente**: uma única fonte canônica em `.ai/skills/AGENTS.md` que qualquer agente de IA (Claude Code, Cursor, Windsurf, Copilot, Codex, Gemini, Cline/Roo) pode referenciar. O `CLAUDE.md` é gerado automaticamente na raiz para o Claude Code; outras ferramentas são conectadas com um ponteiro de uma linha (veja "Usando com outras IDEs" abaixo).
- **Harness Engineering (Memory)**: uma pasta `.ai/backlog/` que persiste contexto e estado de tarefas entre sessões.
- **Impact Map**: um arquivo volátil de blast-radius (`.ai/backlog/impact-map.md`) criado no Phase PLAN e limpo no Phase END — diz ao agente exatamente quais arquivos carregar no ciclo atual, mantendo o contexto enxuto e focado.
- **Catálogo de tooling inerte**: `sdg-agents init` copia um bundle pré-pronto em `.ai/tooling/` — `prune-backlog.mjs` (enxuga entradas Done do backlog), `bump-version.mjs` (bump só de versão, sem side-effects), e templates de hooks husky (gate pré-commit + validação de prefixo commit-msg). Nada é ativado por padrão: nenhum `package.json` editado, nenhum `.husky/` criado, nenhuma devDep instalada. Ative sob demanda com o agente ou manualmente.

---

## Início Rápido

```bash
npx sdg-agents
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/docs/img/sdg-agents-menu-v2.png" alt="Spec Driven Guide CLI em ação" /></kbd>
</p>

O assistente interativo guia você na escolha do flavor arquitetural e um ou mais idiomas. Para uso não-interativo:

```bash
# Instalação sem prompts (padrão lite + JS/TS)
npx sdg-agents init --quick

# TypeScript + Vertical Slice
npx sdg-agents init --flavor vertical-slice --idiom typescript

# Multi-idioma
npx sdg-agents init --flavor mvc --idiom typescript,python
```

---

## O Que É Instalado

Após rodar `init`, seu projeto recebe:

```
seu-projeto/
├── .ai/                         ← Conjuntos de instruções (commitado)
│   ├── skills/                  ← Skills de engenharia (carregadas sob demanda por fase do ciclo)
│   │   ├── AGENTS.md            ← Ponto de entrada + registro de skills
│   │   ├── staff-dna.md         ← 8 Leis de Engenharia (carregada em Phase CODE)
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── ... (api-design, data-access, observability, ci-cd, cloud, sql-style, ui-ux)
│   ├── instructions/            ← Flavors, idiomas, competências, templates
│   ├── commands/                ← Comandos de ciclo (feat/fix/docs/audit/land/end)
│   ├── tooling/                 ← Bundle de tooling inerte (scripts + hooks husky — ative sob demanda)
│   └── backlog/                 ← Harness Engineering (Memory) — gitignored, estado local de trabalho
│       └── ...                  ← (Veja docs/reference/PROJECT-STRUCTURE.md para detalhes)
```

`.ai/skills/AGENTS.md` é um roteador mínimo: lista todas as skills disponíveis e as carrega sob demanda. Apenas `workflow.md` (o protocolo de 5 fases) fica sempre em contexto — tudo mais só é ativado quando o ciclo atual precisa.

O `CLAUDE.md` na raiz é um ponteiro fino que usa `@`-import para carregar `.ai/skills/AGENTS.md`, então o Claude Code carrega a governança automaticamente em toda sessão. Outras IDEs são conectadas apontando o arquivo de configuração nativo delas para a mesma fonte canônica — veja "Usando com outras IDEs" abaixo.

> Para um detalhamento do papel de cada arquivo, veja [Estrutura do Projeto](../reference/PROJECT-STRUCTURE.md).

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

Para um guia detalhado de cada fase, veja [Guia Spec-Driven Development](../concepts/SPEC-DRIVEN-DEV-GUIDE.md).
Para um diagrama visual dos gates de decisão e loops internos, veja [Agent Deep-Flow](../concepts/AGENT-DEEP-FLOW.md).

---

## Flavors Arquiteturais

Escolha o flavor que corresponde à estrutura do seu projeto:

| Flavor           | Padrão                                    | Use quando                          |
| :--------------- | :---------------------------------------- | :---------------------------------- |
| `vertical-slice` | Cortes verticais por feature              | Monorepo ou API orientada a domínio |
| `mvc`            | Camadas clássicas (Model-View-Controller) | Serviço REST padrão                 |
| `lite`           | Scaffold mínimo                           | Scripts, CLIs, utilitários          |
| `legacy`         | Padrões bridge seguros para refatoração   | Migrando bases de código existentes |

Para o diagrama de fluxo de dados de cada flavor, veja [Pipelines Arquiteturais](../reference/PIPELINES.md).

---

## Idiomas

Instale padrões específicos da linguagem junto com o protocolo:

`typescript` · `javascript` · `python` · `csharp` · `java` · `kotlin` · `go` · `rust` · `swift` · `flutter` · `sql` · `vbnet`

```bash
# Idioma único
npx sdg-agents init --idiom typescript

# Multi-idioma (projetos poliglotas)
npx sdg-agents init --idiom typescript,python,go
```

Para adicionar ou estender suporte a uma linguagem, cole o skill do idioma no seu agente via prompt — sem precisar de subcomando CLI.

---

## Usando com outras IDEs

O `sdg-agents` gera uma única fonte canônica em `.ai/skills/AGENTS.md` e um ponteiro `CLAUDE.md` na raiz do repositório. O Claude Code carrega automaticamente, sem nenhum passo extra. Para outras ferramentas, adicione um ponteiro de uma linha no arquivo de regras nativo da sua IDE:

| Agente           | Arquivo de config nativo          | Como conectar                                                                            |
| :--------------- | :-------------------------------- | :--------------------------------------------------------------------------------------- |
| Claude Code      | `CLAUDE.md` (raiz, auto-gerado)   | Carregado automaticamente. Nenhuma ação necessária.                                      |
| Cursor           | `.cursor/rules/sdg-agents.mdc`    | Crie o arquivo com uma única linha: `Read .ai/skills/AGENTS.md before any task.`         |
| Windsurf         | `.windsurfrules`                  | Mesma linha de ponteiro.                                                                 |
| GitHub Copilot   | `.github/copilot-instructions.md` | Mesma linha de ponteiro.                                                                 |
| Codex CLI        | `AGENTS.md` (raiz)                | Já está disponível via `.ai/skills/AGENTS.md`; ou crie um arquivo-ponteiro fino na raiz. |
| Gemini CLI       | `GEMINI.md`                       | Mesma linha de ponteiro.                                                                 |
| Cline / Roo Code | `.clinerules`                     | Mesma linha de ponteiro.                                                                 |

> **Quer um preset, voz ou skill customizado?** Cole o conteúdo do skill no seu agente como um prompt — do mesmo jeito que `docs/reference/REFERENCES.md` documenta influências externas. Skills customizados não exigem subcomando CLI.

---

## Manutenção

```bash
npx sdg-agents gate      # Executar revisão SDG gate contra o diff staged (pre-commit agnóstico de linguagem)
npx sdg-agents review    # Detectar drift entre regras locais e a fonte
npx sdg-agents sync      # Atualizar rulesets da fonte
npx sdg-agents update    # Atualizar o registro de versões LTS
npx sdg-agents audit     # Executar auditoria de governança (violações de leis, drift)
npx sdg-agents clear     # Remover a pasta .ai/
```

---

## Referência

- [Referência Rápida (CHEATSHEET)](../reference/CHEATSHEET.md) — todos os flags do CLI e triggers do agente
- [Estrutura do Projeto](../reference/PROJECT-STRUCTURE.md) — detalhamento de cada arquivo gerado
- [Pipelines Arquiteturais](../reference/PIPELINES.md) — diagramas de fluxo por flavor
- [Leis de Engenharia (CONSTITUTION)](../concepts/CONSTITUTION.md) — os princípios por trás das regras
- [Sistema UI/UX](../guides/UI-UX.md) — filosofia de design, hierarquia, escala tonal de superfície, presets e referências externas de pesquisa
- [Roadmap](../ROADMAP.md) — trabalho planejado
- [Otimização de Tokens](../guides/TOKEN-OPTIMIZATION.md) — modelo de custo, processo de compactação e eficiência do roteador
- [Migração v2 → v3](../guides/MIGRATION-v3.md) — breaking changes e guia de migração passo a passo
- [Changelog](../../CHANGELOG.md) — histórico de versões
- [Créditos e Filosofias](../reference/REFERENCES.md) — influências do projeto e créditos de pesquisa

---

> **Aviso:** Este projeto está em desenvolvimento inicial. Revise e ajuste as regras instaladas conforme os padrões da sua equipe antes de depender delas.

_O equilíbrio é a chave._

O SDG está em constante evolução — não existe solução perfeita, apenas melhoria contínua. Sinta-se à vontade para contribuir, fazer fork e compartilhar.
