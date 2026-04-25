import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GateChecker } from "./gate-checker.mjs";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const resultsDir = path.resolve(
  currentDir,
  "../../../../tests/fixtures/gate/results"
);

describe("GateChecker", () => {
  describe("checkResult()", () => {
    it("should return canCommit false when BLOCK violation present", () => {
      const input = readFileSync(
        path.join(resultsDir, "block-result.json"),
        "utf8"
      );

      const expected = false;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });

    it("should return canCommit true when result is clean", () => {
      const input = readFileSync(
        path.join(resultsDir, "pass-result.json"),
        "utf8"
      );

      const expected = true;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });

    it("should return canCommit true when only WARN violations present", () => {
      const input = readFileSync(
        path.join(resultsDir, "warn-result.json"),
        "utf8"
      );

      const expected = true;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });

    it("should isolate block violations from warn violations", () => {
      const input = readFileSync(
        path.join(resultsDir, "block-result.json"),
        "utf8"
      );

      const expectedBlockCount = 1;

      const actual = GateChecker.checkResult(input);
      const actualBlockCount = actual.blockViolations.length;

      assert.equal(actualBlockCount, expectedBlockCount);
    });

    it("should fail open when JSON is invalid", () => {
      const input = "not valid json {{";

      const expected = true;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });

    it("should fail open when input is empty", () => {
      const input = "";

      const expected = true;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });
  });

  describe("formatViolationReport()", () => {
    it("should include rule id and file in report", () => {
      const input = readFileSync(
        path.join(resultsDir, "block-result.json"),
        "utf8"
      );

      const expectedRule = "explaining-returns";
      const expectedFile = "src/orders/order.service.cs";
      const parsed = GateChecker.checkResult(input);
      const actual = GateChecker.formatViolationReport(parsed.blockViolations);

      const containsRule = actual.includes(expectedRule);
      const containsFile = actual.includes(expectedFile);

      assert.ok(containsRule);
      assert.ok(containsFile);
    });
  });
});
