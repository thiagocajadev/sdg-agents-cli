/**
 * Human-readable display names and metadata for instruction idioms.
 */
export const STACK_DISPLAY_NAMES = {
  csharp: {
    name: 'C# (.NET / Blazor / Razor)',
    isBackend: true,
    isFrontend: true,
  },
  flutter: {
    name: 'Flutter (Dart / Cross-platform)',
    isBackend: false,
    isFrontend: true,
  },
  go: {
    name: 'Go (Standard Library / Gin / Echo)',
    isBackend: true,
    isFrontend: false,
  },
  java: {
    name: 'Java (Spring / Modern Ecosystem)',
    isBackend: true,
    isFrontend: false,
  },
  javascript: {
    name: 'JavaScript (Vanilla / ESM)',
    isBackend: true,
    isFrontend: true,
  },
  kotlin: {
    name: 'Kotlin (Android / Ktor / Spring)',
    isBackend: true,
    isFrontend: true,
  },
  python: {
    name: 'Python (Agnostic / Pydantic)',
    isBackend: true,
    isFrontend: false,
  },
  rust: {
    name: 'Rust (Axum / Actix / Tokio)',
    isBackend: true,
    isFrontend: false,
  },
  scripts: {
    name: 'Scripts (Shell / Bash / PowerShell)',
    isBackend: false,
    isFrontend: false,
  },
  sql: {
    name: 'SQL (Relational Databases)',
    isBackend: true,
    isFrontend: false,
  },
  swift: {
    name: 'Swift (iOS / macOS / SwiftUI)',
    isBackend: false,
    isFrontend: true,
  },
  typescript: {
    name: 'TypeScript (React / Angular / Node / Astro)',
    isBackend: true,
    isFrontend: true,
  },
  vbnet: {
    name: 'VB.NET (ASP.NET Core / Blazor)',
    isBackend: true,
    isFrontend: true,
  },
  'vbnet-legacy': {
    name: 'VB.NET Legacy (.NET Framework 4.8 Desktop)',
    isBackend: false,
    isFrontend: false,
  },
};
