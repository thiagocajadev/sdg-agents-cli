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

> **Nota:** Se o seu agente não carregar as regras automaticamente, referencie `AGENTS.md` no início da sessão.

O conjunto de instruções cobre:

- **Protocolo de trabalho**: um ciclo de 5 fases (SPEC → PLAN → CODE → TEST → END) que estrutura como o agente conduz qualquer tarefa. Carrega um **Work Checklist** unificado e um **Circuit Breaker** de 3 tentativas que interrompe loops de regressão.
  - Os itens de Intent são recitados na entrada da CODE. Os itens de Form são recitados na entrada da CODE e verificados no TEST.
- **Estilo de código e quality gates**: uma única regra `WorkChecklist` em `code-style.md`, dividida em duas seções binárias conectadas às heurísticas de narrativa em `governance.mjs`.
  - **Intent**: Mental Reset, Target Files, Naming, Narrative, Comments, Tests planned, Security, Blockers.
  - **Form**: Pure entry point, Narrative Siblings, Explaining Returns, Revealing Module Pattern, Vertical Density, Boolean prefix, No framework abbreviations, No section banners.
- **Skills sob demanda**: unidades auto-contidas carregadas somente quando o ciclo atual precisa. Cobrem code style, testing, security, API design, data access, observability, CI/CD, cloud, SQL style, UI/UX, code review, performance e domain modeling.
- **Contexto de stack dinâmico**: o ciclo `land:` pede ao desenvolvedor as linguagens e versões do projeto, opcionalmente as enriquece via uma lista de fontes de documentação canônicas, e escreve `.ai/backlog/stack.md`. A fase CODE lê esse arquivo como fonte única de verdade. Sem catálogo estático de idiomas, sem flag `--idiom` para manter.
- **Contrato de entrega**: o envelope de resposta BFF (server-side) e a execução de contrato UI (client-side), fundidos em um único `competencies/delivery.md` auto-gateado e carregado quando a tarefa toca lógica de entrega.
- **Flavors arquiteturais**: regras para o padrão estrutural do projeto (vertical slice, MVC, lite, legacy).
- **Compatível com qualquer agente**: uma única fonte canônica em `AGENTS.md` na raiz do repositório, onde Codex, Cursor e os demais já procuram. O `CLAUDE.md` é gerado ao lado dele para o Claude Code; outras ferramentas se conectam com um ponteiro de uma linha (veja "Usando com outras IDEs" abaixo).
  - Um `AGENTS.md` escrito por você nunca é sobrescrito: a governança chega como `AGENTS.sdg.md` e o `init` avisa para você fazer o merge.
- **Harness Engineering (Memory)**: uma pasta `.ai/backlog/` que persiste contexto e estado de tarefas entre sessões.
- **Impact Map**: um arquivo volátil de blast-radius (`.ai/backlog/impact-map.md`) criado no Phase PLAN e limpo no Phase END. Diz ao agente quais arquivos carregar no ciclo atual, mantendo o contexto enxuto.
- **Catálogo de tooling inerte**: `sdg-agents init` copia um bundle pré-pronto em `.ai/tooling/`. Nada é ativado por padrão: nenhum `package.json` editado, nenhum `.husky/` criado, nenhuma devDep instalada. Ative sob demanda, com o agente ou à mão.
  - `prune-backlog.mjs` enxuga entradas Done do backlog.
  - `bump-version.mjs` faz um bump só de versão, sem side-effects.
  - Templates de hooks husky: um gate pré-commit e uma validação de prefixo commit-msg.

---

## Início Rápido

```bash
npx sdg-agents
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/sgd-agents-cli/main/docs/img/sdg-agents-menu-v2.png" alt="Spec Driven Guide CLI em ação" /></kbd>
</p>

O assistente interativo guia você na escolha do flavor arquitetural. A descoberta de stack (linguagens + versões) acontece depois via o ciclo `land:`. Ela fica fora da instalação para que o desenvolvedor a declare de forma consciente, quando o brief do projeto estiver claro. Para uso não-interativo:

```bash
# Instalação sem prompts (flavor lite + stack.md placeholder)
npx sdg-agents init --quick

# Vertical Slice — qualquer stack
npx sdg-agents init --flavor vertical-slice

# MVC — qualquer stack
npx sdg-agents init --flavor mvc
```

Após a instalação, abra o chat do agente e execute `land: <visão>`. O agente elicita o stack, escreve `.ai/backlog/stack.md` e semeia o backlog.

---

## O Que É Instalado

Após rodar `init`, seu projeto recebe:

```
seu-projeto/
├── AGENTS.md                    ← Ponto de entrada + registro de skills (canônico)
├── CLAUDE.md                    ← Ponteiro fino, carregado pelo Claude Code
├── .ai/                         ← Conjuntos de instruções (commitado)
│   ├── skills/                  ← Skills de engenharia (carregadas sob demanda por fase do ciclo)
│   │   ├── code-style.md        ← Code style + Work Checklist (Intent + Form) — núcleo da Phase CODE
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── ... (api-design, data-access, observability, ci-cd, cloud, sql-style, ui-ux)
│   ├── instructions/            ← Flavors, idiomas, competências, templates
│   ├── commands/                ← Comandos de ciclo (feat/fix/docs/audit/land/end)
│   ├── tooling/                 ← Bundle de tooling inerte (scripts + hooks husky — ative sob demanda)
│   └── backlog/                 ← Harness Engineering (Memory) — conhecimento versionado, estado volátil gitignored
│       └── ...                  ← (Veja docs/reference/PROJECT-STRUCTURE.md para detalhes)
```

`AGENTS.md` é um roteador mínimo: lista todas as skills disponíveis e as carrega sob demanda. Apenas `workflow.md` (o protocolo de 5 fases) fica sempre em contexto. Tudo mais só é ativado quando o ciclo atual precisa.

O `CLAUDE.md` fica ao lado dele como ponteiro fino que usa `@`-import para carregar `AGENTS.md`, então o Claude Code carrega a governança automaticamente em toda sessão. Outras IDEs são conectadas apontando o arquivo de configuração nativo delas para a mesma fonte canônica (veja "Usando com outras IDEs" abaixo).

> Para um detalhamento do papel de cada arquivo, veja [Estrutura do Projeto](../reference/PROJECT-STRUCTURE.md).

---

## Como o Protocolo Funciona

Ao prefixar uma mensagem ao agente, ele entra no ciclo correspondente:

| Trigger             | Ciclo   | O que acontece                                                                                                                                                  |
| :------------------ | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `land: <descrição>` | Land    | Agente transforma uma visão bruta em um backlog de tarefas `feat:` sequenciadas. Roda antes de qualquer código ser escrito                                      |
| `feat: <descrição>` | Feature | Agente executa SPEC → PLAN → CODE → TEST → END                                                                                                                  |
| `fix: <descrição>`  | Fix     | Agente executa SPEC → PLAN → CODE → TEST → END com foco em RCA                                                                                                  |
| `docs: <descrição>` | Docs    | Agente atualiza changelogs, ADRs ou specs                                                                                                                       |
| `audit: <escopo>`   | Audit   | Agente verifica alinhamento do projeto contra as regras (detecção de drift)                                                                                     |
| `end:`              | —       | Encerra o ciclo ativo. Executa o checklist do Phase: END (changelog, backlog, commit). Também recupera um ciclo se o agente perder o fio numa conversa paralela |
| Sem prefixo         | —       | Agente pergunta: "land, feat, fix, docs ou audit?", e então prossegue                                                                                           |

O agente **para e aguarda sua aprovação** em SPEC e PLAN antes de escrever qualquer código.

```
SPEC  →  PLAN  →  CODE  →  TEST  →  END
  ↑           ↑                       ↑
  Wait        Wait                 "end:"
```

> Digite `end:` para encerrar o ciclo ativo. O agente executa o checklist completo do END: changelog, sincronização do backlog, proposta de commit. Se o agente perder o fio numa conversa paralela, `end:` também recupera o ciclo.

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

## Declaração de Stack via `land:`

Stack é **dinâmico, não catalogado**. Após o `sdg-agents init`, execute o ciclo `land:` para declarar as linguagens, runtimes e versões de framework do projeto:

```
land: uma API Node.js + TypeScript servindo um dashboard React
```

O agente:

1. Pede que você liste cada linguagem e versão (formato livre).
2. Classifica cada entrada por papel (Backend / Frontend / Data / Scripts).
3. Oferece enriquecimento **opcional** via uma lista de fontes de documentação canônicas (`nodejs.org/api`, `react.dev`, `typescriptlang.org`, `tc39.es`, `docs.astro.build`, `docs.python.org`, `go.dev/doc`, `doc.rust-lang.org`, `kotlinlang.org/docs`, `dart.dev`, `learn.microsoft.com/dotnet`, `developer.apple.com/documentation/swift`).
4. Escreve `.ai/backlog/stack.md`, a fonte única de verdade para idiomas específicos do stack. Edite diretamente quando as versões mudarem; sem necessidade de regen.

A fase CODE carrega `stack.md` em todo ciclo. Sem catálogo estático de idiomas, sem flag `--idiom`.

---

## Usando com outras IDEs

O `sdg-agents` gera uma única fonte canônica em `AGENTS.md` na raiz do repositório, com um ponteiro `CLAUDE.md` ao lado. Codex e Claude Code carregam o seu automaticamente, sem nenhum passo extra. Para outras ferramentas, adicione um ponteiro de uma linha no arquivo de regras nativo da sua IDE:

| Agente           | Arquivo de config nativo          | Como conectar                                                         |
| :--------------- | :-------------------------------- | :-------------------------------------------------------------------- |
| Claude Code      | `CLAUDE.md` (raiz, auto-gerado)   | Carregado automaticamente. Nenhuma ação necessária.                   |
| Cursor           | `.cursor/rules/sdg-agents.mdc`    | Crie o arquivo com uma única linha: `Read AGENTS.md before any task.` |
| Windsurf         | `.windsurfrules`                  | Mesma linha de ponteiro.                                              |
| GitHub Copilot   | `.github/copilot-instructions.md` | Mesma linha de ponteiro.                                              |
| Codex CLI        | `AGENTS.md` (raiz)                | Carregado automaticamente. Nenhuma ação necessária.                   |
| Gemini CLI       | `GEMINI.md`                       | Mesma linha de ponteiro.                                              |
| Cline / Roo Code | `.clinerules`                     | Mesma linha de ponteiro.                                              |

> **Quer um preset, voz ou skill customizado?** Cole o conteúdo do skill no seu agente como um prompt, do mesmo jeito que `docs/reference/REFERENCES.md` documenta influências externas. Skills customizados não exigem subcomando CLI.

---

## Manutenção

```bash
npx sdg-agents gate      # Executar revisão SDG gate contra o diff staged (pre-commit agnóstico de linguagem)
npx sdg-agents review    # Detectar drift entre regras locais e a fonte
npx sdg-agents audit     # Executar auditoria de governança (violações de leis, drift)
npx sdg-agents clear     # Remover a pasta .ai/
```

---

## Referência

- [Referência Rápida (CHEATSHEET)](../reference/CHEATSHEET.md): todos os flags do CLI e triggers do agente
- [Estrutura do Projeto](../reference/PROJECT-STRUCTURE.md): detalhamento de cada arquivo gerado
- [Pipelines Arquiteturais](../reference/PIPELINES.md): diagramas de fluxo por flavor
- [Constituição de Engenharia (CONSTITUTION)](../concepts/CONSTITUTION.md): os princípios filosóficos por trás das regras (referência apenas; regras em runtime ficam em `code-style.md`)
- [Sistema UI/UX](../guides/UI-UX.md): filosofia de design, hierarquia, escala tonal de superfície, presets e referências externas de pesquisa
- [Roadmap](../ROADMAP.md): trabalho planejado
- [Otimização de Tokens](../guides/TOKEN-OPTIMIZATION.md): modelo de custo, processo de compactação e eficiência do roteador
- [Migração v2 → v3](../guides/MIGRATION-v3.md): breaking changes e guia de migração passo a passo
- [Changelog](../../CHANGELOG.md): histórico de versões
- [Créditos e Filosofias](../reference/REFERENCES.md): influências do projeto e créditos de pesquisa

---

> **Aviso:** Este projeto está em desenvolvimento inicial. Revise e ajuste as regras instaladas conforme os padrões da sua equipe antes de depender delas.

_O equilíbrio é a chave._

O SDG está em constante evolução. Não existe solução perfeita, apenas melhoria contínua. Sinta-se à vontade para contribuir, fazer fork e compartilhar.
