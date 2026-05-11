#!/usr/bin/env node
/**
 * writing-lint — advisory PostToolUse hook for Markdown writes.
 *
 * Reads Claude Code's hook JSON from stdin, scans Write/Edit/MultiEdit
 * content against the banlists derived from .ai/skills/writing-soul.md
 * (conceptual SSOT). Hits are reported to stderr; exit code is always 0
 * so the hook stays advisory and never blocks a tool call.
 *
 * Scope: src/assets/skills/*.md, docs/**.md, top-level README*.md, CHANGELOG.md.
 * Working-state files (tasks.md, context.md, impact-map.md, stack.md,
 * troubleshoot.md, learned.md) are excluded.
 *
 * Project artifacts are English-only, so all banlists are English-only.
 */

import process from "node:process";
import path from "node:path";
import fileSystem from "node:fs";
import { fileURLToPath } from "node:url";

const BANNED_ADVERBS = [
  "really",
  "just",
  "literally",
  "genuinely",
  "simply",
  "actually",
  "deeply",
  "truly",
  "fundamentally",
  "inherently",
  "importantly",
  "crucially",
];

const BANNED_OPENERS = [
  "Here's the thing:",
  "The uncomfortable truth is",
  "Let me be clear",
  "Let me walk you through",
  "In this section, we'll",
];

const BANNED_EMPHASIS = [
  "Full stop.",
  "This matters because",
  "Make no mistake",
  "Let that sink in.",
];

const BANNED_JARGON = [
  "navigate",
  "unpack",
  "deep dive",
  "game-changer",
  "moving forward",
  "circle back",
  "landscape",
];

const SCOPE_REGEXES = [
  /(^|\/)src\/assets\/skills\/[^/]+\.md$/,
  /(^|\/)docs\/.*\.md$/,
  /(^|\/)README[^/]*\.md$/,
  /(^|\/)CHANGELOG\.md$/,
];

const EXCLUDED_BASENAMES = new Set([
  "tasks.md",
  "context.md",
  "impact-map.md",
  "stack.md",
  "troubleshoot.md",
  "learned.md",
]);

const SUPPORTED_TOOLS = new Set(["Write", "Edit", "MultiEdit"]);

function isScopedPath(filePath) {
  if (typeof filePath !== "string" || filePath.length === 0) {
    const isInvalid = false;
    return isInvalid;
  }

  const basename = path.basename(filePath);

  if (EXCLUDED_BASENAMES.has(basename)) {
    const isExcluded = false;
    return isExcluded;
  }

  const isInScope = SCOPE_REGEXES.some((regex) => regex.test(filePath));
  return isInScope;
}

function extractContent(toolName, toolInput) {
  if (!SUPPORTED_TOOLS.has(toolName) || !toolInput) {
    const noContent = null;
    return noContent;
  }

  if (toolName === "Write") {
    const writeContent = toolInput.content ?? "";
    return writeContent;
  }

  if (toolName === "Edit") {
    const editContent = toolInput.new_string ?? "";
    return editContent;
  }

  const editsArray = Array.isArray(toolInput.edits) ? toolInput.edits : [];
  const multiEditContent = editsArray
    .map((edit) => edit?.new_string ?? "")
    .join("\n");

  return multiEditContent;
}

function scanContent(content, filePath) {
  if (typeof content !== "string" || content.length === 0) {
    const noHits = [];
    return noHits;
  }

  const lines = content.split("\n");
  const hits = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    collectHitsForLine(line, lineIndex + 1, filePath, hits);
  }

  return hits;
}

function collectHitsForLine(line, lineNumber, filePath, hits) {
  for (const adverb of BANNED_ADVERBS) {
    const adverbRegex = new RegExp(`\\b${escapeRegex(adverb)}\\b`, "i");

    if (adverbRegex.test(line)) {
      hits.push({
        filePath,
        line: lineNumber,
        term: adverb,
        category: "adverb",
      });
    }
  }

  pushPhraseHits(BANNED_OPENERS, "opener", line, lineNumber, filePath, hits);
  pushPhraseHits(BANNED_EMPHASIS, "emphasis", line, lineNumber, filePath, hits);

  for (const jargon of BANNED_JARGON) {
    const jargonRegex = new RegExp(`\\b${escapeRegex(jargon)}\\b`, "i");

    if (jargonRegex.test(line)) {
      hits.push({
        filePath,
        line: lineNumber,
        term: jargon,
        category: "jargon",
      });
    }
  }
}

function pushPhraseHits(phrases, category, line, lineNumber, filePath, hits) {
  const lowerLine = line.toLowerCase();

  for (const phrase of phrases) {
    if (lowerLine.includes(phrase.toLowerCase())) {
      hits.push({ filePath, line: lineNumber, term: phrase, category });
    }
  }
}

function escapeRegex(value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped;
}

function formatHits(hits) {
  const formattedLines = hits.map(formatHit);
  const joinedOutput = formattedLines.join("\n");
  return joinedOutput;
}

function formatHit(hit) {
  const formattedLine = `${hit.filePath}:${hit.line} — banned ${hit.category}: "${hit.term}"`;
  return formattedLine;
}

async function readStdinJson() {
  let raw = "";

  for await (const chunk of process.stdin) {
    raw += chunk;
  }

  if (raw.trim().length === 0) {
    const emptyPayload = null;
    return emptyPayload;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    const malformedPayload = null;
    return malformedPayload;
  }
}

async function run() {
  const payload = await readStdinJson();

  if (!payload) {
    process.exit(0);
  }

  const toolName = payload.tool_name;
  const toolInput = payload.tool_input;
  const filePath = toolInput?.file_path;

  if (!isScopedPath(filePath)) {
    process.exit(0);
  }

  const content = extractContent(toolName, toolInput);

  if (content === null) {
    process.exit(0);
  }

  const hits = scanContent(content, filePath);

  if (hits.length > 0) {
    process.stderr.write(`${formatHits(hits)}\n`);
  }

  process.exit(0);
}

const WritingLint = {
  isScopedPath,
  extractContent,
  scanContent,
  formatHits,
  run,
};

export { WritingLint };

function isDirectInvocation() {
  if (!process.argv[1]) {
    const noEntry = false;
    return noEntry;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const entryFile = fileSystem.realpathSync(path.resolve(process.argv[1]));

  const isEntry = currentFile === entryFile;
  return isEntry;
}

if (isDirectInvocation()) {
  run();
}
