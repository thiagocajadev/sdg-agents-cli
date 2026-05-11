import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { WritingLint } from "./writing-lint.mjs";

const { isScopedPath, extractContent, scanContent, formatHits } = WritingLint;

describe("writing-lint.isScopedPath", () => {
  it("should accept skills markdown under src/assets/skills", () => {
    const inputPath = "src/assets/skills/writing-soul.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("should accept docs markdown", () => {
    const inputPath = "docs/concepts/CONSTITUTION.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("should accept top-level README markdown", () => {
    const inputPath = "/abs/path/README.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("should accept CHANGELOG.md", () => {
    const inputPath = "/repo/CHANGELOG.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("should reject working-state filenames even when path is otherwise scoped", () => {
    const inputPath = ".ai/backlog/tasks.md";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });

  it("should reject non-markdown files", () => {
    const inputPath = "src/engine/lib/domain/wizard.mjs";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });

  it("should reject empty filePath", () => {
    const inputPath = "";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });
});

describe("writing-lint.extractContent", () => {
  it("should extract content field for Write tool", () => {
    const inputTool = "Write";
    const inputPayload = { content: "hello world" };
    const expectedContent = "hello world";

    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });

  it("should extract new_string field for Edit tool", () => {
    const inputTool = "Edit";
    const inputPayload = { old_string: "a", new_string: "b" };
    const expectedContent = "b";

    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });

  it("should join all edits[].new_string for MultiEdit tool", () => {
    const inputTool = "MultiEdit";
    const inputPayload = {
      edits: [
        { old_string: "x", new_string: "first edit" },
        { old_string: "y", new_string: "second edit" },
      ],
    };

    const expectedContent = ["first edit", "second edit"].join("\n");
    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });

  it("should return null for unsupported tool name", () => {
    const inputTool = "Read";
    const inputPayload = { file_path: "x" };
    const expectedContent = null;

    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });

  it("should return null when toolInput is missing", () => {
    const inputTool = "Write";
    const inputPayload = null;
    const expectedContent = null;

    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });
});

describe("writing-lint.scanContent", () => {
  it("should flag banned adverbs case-insensitively", () => {
    const inputContent = [
      "# Title",
      "",
      "This is Simply a test of banned terms.",
    ].join("\n");

    const inputPath = "docs/sample.md";
    const expectedHitLine = 3;

    const actualHits = scanContent(inputContent, inputPath);
    const actualHasSimplyHit = actualHits.some((hit) => hit.term === "simply");
    const actualHitLine = actualHits[0]?.line;

    assert.ok(actualHasSimplyHit);
    assert.equal(actualHitLine, expectedHitLine);
  });

  it("should flag banned openers as phrase matches", () => {
    const inputContent = "Here's the thing: this is bad copy.";
    const inputPath = "docs/intro.md";

    const actualHits = scanContent(inputContent, inputPath);
    const actualHasOpenerHit = actualHits.some(
      (hit) => hit.category === "opener",
    );

    assert.ok(actualHasOpenerHit);
  });

  it("should flag jargon terms via word boundary", () => {
    const inputContent = "Let us deep dive into the landscape of options.";
    const inputPath = "docs/jargon.md";

    const actualHits = scanContent(inputContent, inputPath);
    const actualJargonCount = actualHits.filter(
      (hit) => hit.category === "jargon",
    ).length;

    const actualHasMultipleJargonHits = actualJargonCount >= 2;

    assert.ok(actualHasMultipleJargonHits);
  });

  it("should return empty array for empty content", () => {
    const inputContent = "";
    const inputPath = "docs/empty.md";
    const expectedHits = [];

    const actualHits = scanContent(inputContent, inputPath);

    assert.deepEqual(actualHits, expectedHits);
  });

  it("should return empty array for clean prose", () => {
    const inputContent = [
      "# Pedagogical title",
      "",
      "Treat the reader as a peer. Explain the model first.",
    ].join("\n");

    const inputPath = "docs/clean.md";
    const expectedHits = [];

    const actualHits = scanContent(inputContent, inputPath);

    assert.deepEqual(actualHits, expectedHits);
  });
});

describe("writing-lint.formatHits", () => {
  it("should format hits as file:line — banned category: term", () => {
    const inputHits = [
      { filePath: "docs/x.md", line: 12, term: "simply", category: "adverb" },
    ];

    const expectedLine = 'docs/x.md:12 — banned adverb: "simply"';
    const actualOutput = formatHits(inputHits);

    assert.equal(actualOutput, expectedLine);
  });

  it("should join multiple hits with newlines", () => {
    const inputHits = [
      { filePath: "a.md", line: 1, term: "just", category: "adverb" },
      { filePath: "a.md", line: 4, term: "navigate", category: "jargon" },
    ];

    const expectedLines = [
      'a.md:1 — banned adverb: "just"',
      'a.md:4 — banned jargon: "navigate"',
    ].join("\n");

    const actualOutput = formatHits(inputHits);

    assert.equal(actualOutput, expectedLines);
  });
});
