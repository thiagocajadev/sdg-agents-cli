/**
 * Semantic version registry for each instruction idiom.
 * Order convention: LTS → Frontend → Backend → Other
 *
 * Adding a new idiom: add an entry here and a corresponding folder under src/instructions/idioms/.
 */
export const STACK_VERSIONS = {
  idioms: {
    csharp: [
      { name: '.NET 10 (LTS)', value: 'dotnet@10', year: 2025 },
      { name: '.NET 11 (Preview)', value: 'dotnet@11', year: 2026 },
      { name: '.NET 8 (LTS Legacy)', value: 'dotnet@8', year: 2023 },
    ],
    flutter: [{ name: 'Flutter 3.x / Dart 3.x (Stable)', value: 'flutter@3', year: 2024 }],
    go: [
      { name: 'Go 1.24 (Latest)', value: 'go@1.24', year: 2025 },
      { name: 'Go 1.23 (Prev Supported)', value: 'go@1.23', year: 2024 },
    ],
    java: [
      { name: 'Java 25 (LTS Current)', value: 'java@25', year: 2025 },
      { name: 'Java 21 (LTS Legacy)', value: 'java@21', year: 2023 },
      { name: 'Java 17 (LTS Extended)', value: 'java@17', year: 2021 },
    ],
    javascript: [
      { name: 'ES2025 (Latest Stable)', value: 'js@2025', year: 2025 },
      { name: 'ES2024 (Prev Stable)', value: 'js@2024', year: 2024 },
    ],
    kotlin: [
      { name: 'Kotlin 2.1 (Latest Stable)', value: 'kotlin@2.1', year: 2025 },
      { name: 'Kotlin 2.0 (Prev Stable)', value: 'kotlin@2.0', year: 2024 },
    ],
    python: [
      { name: 'Python 3.14 (Latest)', value: 'py@3.14', year: 2025 },
      { name: 'Python 3.13 (Stable)', value: 'py@3.13', year: 2024 },
    ],
    rust: [
      { name: 'Rust 1.85 (Latest Stable)', value: 'rust@1.85', year: 2025 },
      { name: 'Rust 1.84 (Prev Stable)', value: 'rust@1.84', year: 2024 },
    ],
    scripts: [{ name: 'Bash 5.x / PowerShell 7.x', value: 'scripts@latest', year: 2024 }],
    sql: [
      { name: 'PostgreSQL 17 (Latest)', value: 'sql@pg17', year: 2024 },
      { name: 'PostgreSQL 16 (LTS)', value: 'sql@pg16', year: 2023 },
      { name: 'MySQL 8.x / MariaDB 11.x', value: 'sql@mysql8', year: 2023 },
      { name: 'SQL Server 2022', value: 'sql@mssql2022', year: 2022 },
    ],
    swift: [
      { name: 'Swift 6.x (Latest)', value: 'swift@6', year: 2024 },
      { name: 'Swift 5.10 (Prev Stable)', value: 'swift@5.10', year: 2024 },
    ],
    typescript: [
      { name: 'TS 6.0 (Latest Stable)', value: 'ts@6.0', year: 2026 },
      { name: 'TS 5.9 (Prev Stable)', value: 'ts@5.9', year: 2025 },
    ],
    vbnet: [
      { name: '.NET 10 (LTS)', value: 'dotnet@10', year: 2025 },
      { name: '.NET 8 (LTS Legacy)', value: 'dotnet@8', year: 2023 },
    ],
    'vbnet-legacy': [{ name: '.NET Framework 4.8', value: 'netfx@4.8', year: 2019 }],
  },
};

/**
 * Idioms that have no formal LTS release process.
 */
export const NO_LTS_STACKS = new Set([
  'javascript',
  'python',
  'typescript',
  'go',
  'rust',
  'swift',
  'kotlin',
  'flutter',
  'scripts',
]);

/**
 * Picks the right version entry for an idiom based on code style preference.
 * latest      → first entry (most recent features)
 * conservative → entry with 'LTS' in name, fallback to second entry, fallback to first
 */
export function selectVersionByStyle(idiom, codeStyle) {
  const available = STACK_VERSIONS.idioms?.[idiom] ?? [];
  const hasNoEntries = available.length === 0;
  if (hasNoEntries) return null;

  const isLatest = codeStyle === 'latest';
  if (isLatest) return available[0].value;

  const ltsEntry = available.find((entry) => entry.name.includes('LTS'));
  const conservativeVersion = ltsEntry?.value ?? available[1]?.value ?? available[0].value;
  return conservativeVersion;
}
