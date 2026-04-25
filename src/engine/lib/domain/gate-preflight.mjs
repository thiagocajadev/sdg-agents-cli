const PREFLIGHT_PATTERNS = [
  {
    rule: "named-const-before-call",
    pattern:
      /assert\.(ok|equal|notEqual|deepEqual|strictEqual|throws|rejects)\s*\([^,)]*\.\w+\(/gm,
  },
];

function runPreflight(diff) {
  const matches = PREFLIGHT_PATTERNS.flatMap((entry) =>
    collectMatches(diff, entry)
  );

  return matches;
}

function collectMatches(diff, entry) {
  const hits = [...diff.matchAll(entry.pattern)];
  const results = hits.map((hit) => buildMatch(hit, entry.rule));
  return results;
}

function buildMatch(hit, rule) {
  const snippet = hit[0].trim();
  const lineNumber = computeLineNumber(hit.input, hit.index);

  const matchEntry = { rule, snippet, line: lineNumber };
  return matchEntry;
}

function computeLineNumber(source, index) {
  const lineNumber = source.slice(0, index).split("\n").length;
  return lineNumber;
}

export const GatePreflight = { runPreflight };
