import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const checkerPath = path.join(currentDirectory, "check-sync.mjs");

function loadCheckerSource() {
  const checkerSource = fileSystem.readFileSync(checkerPath, "utf8");
  return checkerSource;
}

describe("SyncChecker", () => {
  it("should pair live and source trees explicitly rather than by shared name", () => {
    const checkerSource = loadCheckerSource();

    const actualHasFlatCommandsPair =
      checkerSource.includes('live: "commands"') &&
      checkerSource.includes('source: "instructions/commands"');

    const expectedHasFlatCommandsPair = true;

    assert.equal(actualHasFlatCommandsPair, expectedHasFlatCommandsPair);
  });

  it("should mirror every tree that init writes into .ai/", () => {
    const checkerSource = loadCheckerSource();

    const mirroredTreeNames = [
      "instructions/templates",
      "instructions/competencies",
      "commands",
      "skills",
      "tooling",
    ];

    const actualMissing = mirroredTreeNames.filter(
      (treeName) => !checkerSource.includes(`live: "${treeName}"`),
    );

    const expectedMissing = [];

    assert.deepEqual(actualMissing, expectedMissing);
  });

  it("should compare files of any extension, not markdown alone", () => {
    const checkerSource = loadCheckerSource();

    const actualHasMarkdownFilter = checkerSource.includes('endsWith(".md")');
    const expectedHasMarkdownFilter = false;

    assert.equal(actualHasMarkdownFilter, expectedHasMarkdownFilter);
  });

  it("should resolve the flavor tree through the manifest selection", () => {
    const checkerSource = loadCheckerSource();

    const actualReadsSelection = checkerSource.includes(
      "manifest?.selections?.flavor",
    );

    const expectedReadsSelection = true;

    assert.equal(actualReadsSelection, expectedReadsSelection);
  });

  it("should exempt the assembled AGENTS.md from drift comparison", () => {
    const checkerSource = loadCheckerSource();

    const actualExemptsAgents = checkerSource.includes('"skills/AGENTS.md"');
    const expectedExemptsAgents = true;

    assert.equal(actualExemptsAgents, expectedExemptsAgents);
  });
});

describe("SyncCheckerMirror", () => {
  it("should report the tooling tree as in sync with its source", () => {
    const projectRoot = path.join(currentDirectory, "..", "..", "..", "..");
    const liveDirectory = path.join(projectRoot, ".ai", "tooling");
    const sourceDirectory = path.join(projectRoot, "src", "assets", "tooling");

    const liveNames = fileSystem.readdirSync(liveDirectory).sort();
    const sourceNames = fileSystem.readdirSync(sourceDirectory).sort();

    assert.deepEqual(liveNames, sourceNames);
  });
});
