# Architectural Pipelines (Flavors)

SDG implements standardized architectural flows based on your chosen **Flavor**. These patterns represent the data and execution path of each architecture, ensuring consistency across the codebase.

## Standard Patterns

### ⚡ Vertical Slice (Feature-Driven)

Focuses on grouping code by feature rather than layer. Each slice is an independent vertical of the application.

`Request` → `Endpoint` → `UseCase` → `Domain` → `Repository` → `Response`

### 🏗️ MVC (Classic Layered)

The traditional Model-View-Controller approach, emphasizing clear separation between UI, logic, and data.

`Request` → `Controller` → `Service` → `Domain` → `Repository` → `Response`

### 🌐 Frontend (Client-Side Standard)

Standard flow for modern SPA/Client applications.

`Request` → `UI (Action)` → `ApiClient` → `Mapper` → `UI (Response)`

### 🎨 UI Component (Creation Flow)

Specific patterns for building reusable UI atomic components.

`UI` → `ViewModel` → `State` → `Effects`

### 🕰️ Legacy (Refactoring Standard)

A specialized flow designed to safely bridge legacy code towards cleaner patterns.

`UI (Shell)` → `Service` → `Repository` → `UI (Response DTO)`

---

## Why Use Flavors?

Using a specific Flavor ensures that AI Agents understand the **intent** of every file they create or modify. It eliminates ambiguity regarding where a piece of logic belongs, resulting in a codebase that reads like a unified narrative.

> [!NOTE]
> You can choose your flavor during `npx sdg-agents` initialization or specify it via the `--flavor` flag.
