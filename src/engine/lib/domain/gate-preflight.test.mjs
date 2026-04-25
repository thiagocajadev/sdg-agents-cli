import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GatePreflight } from "./gate-preflight.mjs";

describe("GatePreflight", () => {
  describe("runPreflight()", () => {
    it("should detect method-call-as-subject in assert.ok", () => {
      const diff = ["+assert.ok(actual.includes(expectedSubstring));"].join(
        "\n"
      );

      const actual = GatePreflight.runPreflight(diff);

      const actualLength = actual.length;
      const actualRule = actual[0].rule;
      const expectedLength = 1;
      const expectedRule = "named-const-before-call";

      assert.strictEqual(actualLength, expectedLength);
      assert.strictEqual(actualRule, expectedRule);
    });

    it("should return empty array for clean diff", () => {
      const diff = [
        "+const hasExpected = actual.includes(expected);",
        "+assert.ok(hasExpected);",
      ].join("\n");

      const actual = GatePreflight.runPreflight(diff);

      const actualLength = actual.length;
      const expectedLength = 0;

      assert.strictEqual(actualLength, expectedLength);
    });

    it("should detect violations across multiple assert methods", () => {
      const diff = [
        "+assert.ok(result.includes(expected));",
        "+assert.deepEqual(obj.getProp(), target);",
        "+assert.strictEqual(list.find(x), item);",
      ].join("\n");

      const actual = GatePreflight.runPreflight(diff);

      const actualLength = actual.length;
      const expectedLength = 3;

      assert.strictEqual(actualLength, expectedLength);
    });

    it("should include snippet and line number in each match", () => {
      const diff = "+assert.ok(actual.startsWith(prefix));";

      const actual = GatePreflight.runPreflight(diff);

      const actualRule = actual[0].rule;
      const actualSnippet = actual[0].snippet;
      const actualLine = actual[0].line;
      const expectedRule = "named-const-before-call";
      const hasSnippet =
        typeof actualSnippet === "string" && actualSnippet.length > 0;

      const hasLine = typeof actualLine === "number";

      assert.strictEqual(actualRule, expectedRule);
      assert.ok(hasSnippet);
      assert.ok(hasLine);
    });
  });
});
