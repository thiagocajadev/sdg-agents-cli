import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GatePrompt } from "./gate-prompt.mjs";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(currentDir, "../../../../tests/fixtures/gate");

describe("GatePrompt", () => {
  describe("buildPrompt()", () => {
    it("should include the diff content in the prompt", () => {
      const input = readFileSync(
        path.join(fixturesDir, "violations/explaining-returns.diff"),
        "utf8"
      );

      const expectedFragment = "return Result<Order>.Ok(order);";

      const actual = GatePrompt.buildPrompt(input);
      const containsDiff = actual.includes(expectedFragment);

      assert.ok(containsDiff);
    });

    it("should include BLOCK rule ids in the prompt", () => {
      const input = "diff --git a/foo.cs b/foo.cs";

      const expectedRuleId = "explaining-returns";

      const actual = GatePrompt.buildPrompt(input);
      const containsRule = actual.includes(expectedRuleId);

      assert.ok(containsRule);
    });

    it("should request JSON-only response", () => {
      const input = "diff --git a/foo.cs b/foo.cs";

      const expectedInstruction = "ONLY valid JSON";

      const actual = GatePrompt.buildPrompt(input);
      const containsInstruction = actual.includes(expectedInstruction);

      assert.ok(containsInstruction);
    });

    it("should include canCommit blocking instruction", () => {
      const input = "diff --git a/foo.cs b/foo.cs";

      const expectedField = "canCommit";

      const actual = GatePrompt.buildPrompt(input);
      const containsField = actual.includes(expectedField);

      assert.ok(containsField);
    });

    it("should include exclusion patterns", () => {
      const input = "diff --git a/foo.cs b/foo.cs";

      const expectedFragment = "migrations";

      const actual = GatePrompt.buildPrompt(input);
      const containsExclusion = actual.includes(expectedFragment);

      assert.ok(containsExclusion);
    });

    it("should include ceremonial-void-return rule id in the prompt", () => {
      const input = "diff --git a/foo.mjs b/foo.mjs";

      const expectedRuleId = "ceremonial-void-return";

      const actual = GatePrompt.buildPrompt(input);
      const containsRule = actual.includes(expectedRuleId);

      assert.ok(containsRule);
    });

    it("should include named-const-before-call diff content in the prompt", () => {
      const input = readFileSync(
        path.join(fixturesDir, "violations/named-const-before-call.diff"),
        "utf8"
      );

      const expectedFragment = "assert.ok(actualBytes < 2700";

      const actual = GatePrompt.buildPrompt(input);
      const containsDiff = actual.includes(expectedFragment);

      assert.ok(containsDiff);
    });

    it("should include named-const-before-call method-call-as-subject fixture case", () => {
      const input = readFileSync(
        path.join(fixturesDir, "violations/named-const-before-call.diff"),
        "utf8"
      );

      const expectedFragment = "assert.ok(actual.includes(expectedSubstring))";

      const actual = GatePrompt.buildPrompt(input);
      const containsMethodCallSubject = actual.includes(expectedFragment);

      assert.ok(containsMethodCallSubject);
    });

    it("should include named-const-before-call rule id in the prompt", () => {
      const input = "diff --git a/foo.mjs b/foo.mjs";

      const expectedRuleId = "named-const-before-call";

      const actual = GatePrompt.buildPrompt(input);
      const containsRule = actual.includes(expectedRuleId);

      assert.ok(containsRule);
    });

    it("should include pre-filter signals section when diff has preflight match", () => {
      const input = "+assert.ok(actual.includes(expectedSubstring));";

      const expectedSection = "## Pre-filter Signals";

      const actual = GatePrompt.buildPrompt(input);
      const containsSection = actual.includes(expectedSection);

      assert.ok(containsSection);
    });

    it("should not include pre-filter signals section for clean diff", () => {
      const input = [
        "+const hasExpected = actual.includes(expected);",
        "+assert.ok(hasExpected);",
      ].join("\n");

      const unexpectedSection = "## Pre-filter Signals";
      const actual = GatePrompt.buildPrompt(input);
      const containsSection = actual.includes(unexpectedSection);
      const isSectionAbsent = !containsSection;

      assert.ok(isSectionAbsent);
    });
  });
});
