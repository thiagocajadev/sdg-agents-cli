import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Linter, RuleTester } from "eslint";
import { duplicateConsecutiveStatement } from "./duplicate-consecutive-statement.mjs";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

// RuleTester runs the rule directly, so inline disable directives are invisible
// to it. The escape hatch only exists in the linter, so test it there.
const linter = new Linter();

const linterConfig = {
  plugins: {
    local: {
      rules: {
        "duplicate-consecutive-statement": duplicateConsecutiveStatement,
      },
    },
  },
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: { "local/duplicate-consecutive-statement": "error" },
};

const ERROR_MESSAGE =
  "Duplicate consecutive statement. Remove it, or silence this line with a comment stating why the repetition is deliberate.";

describe("duplicate-consecutive-statement", () => {
  it("passes for adjacent statements that differ", () => {
    const distinctCalls = [
      "function run() {",
      '  console.log("first");',
      '  console.log("second");',
      "}",
    ].join("\n");

    const separatedDuplicates = [
      "function run() {",
      '  console.log("same");',
      "  flush();",
      '  console.log("same");',
      "}",
    ].join("\n");

    ruleTester.run(
      "duplicate-consecutive-statement",
      duplicateConsecutiveStatement,
      {
        valid: [{ code: distinctCalls }, { code: separatedDuplicates }],
        invalid: [],
      },
    );
  });

  it("flags an identical call repeated on the next line", () => {
    const duplicatedCall = [
      "function run() {",
      '  console.log("done");',
      '  console.log("done");',
      "}",
    ].join("\n");

    ruleTester.run(
      "duplicate-consecutive-statement",
      duplicateConsecutiveStatement,
      {
        valid: [],
        invalid: [
          { code: duplicatedCall, errors: [{ message: ERROR_MESSAGE }] },
        ],
      },
    );
  });

  it("flags duplicates separated only by a blank line", () => {
    const duplicatedAcrossBlank = [
      "function run() {",
      "  emit();",
      "",
      "  emit();",
      "}",
    ].join("\n");

    ruleTester.run(
      "duplicate-consecutive-statement",
      duplicateConsecutiveStatement,
      {
        valid: [],
        invalid: [
          {
            code: duplicatedAcrossBlank,
            errors: [{ message: ERROR_MESSAGE }],
          },
        ],
      },
    );
  });

  it("flags an identical if-block repeated at module scope", () => {
    const duplicatedGuard = [
      "if (isReady) {",
      "  start();",
      "}",
      "if (isReady) {",
      "  start();",
      "}",
    ].join("\n");

    ruleTester.run(
      "duplicate-consecutive-statement",
      duplicateConsecutiveStatement,
      {
        valid: [],
        invalid: [
          { code: duplicatedGuard, errors: [{ message: ERROR_MESSAGE }] },
        ],
      },
    );
  });

  it("flags duplicates inside a switch case", () => {
    const duplicatedInCase = [
      "switch (mode) {",
      "  case 1:",
      "    reset();",
      "    reset();",
      "    break;",
      "}",
    ].join("\n");

    ruleTester.run(
      "duplicate-consecutive-statement",
      duplicateConsecutiveStatement,
      {
        valid: [],
        invalid: [
          { code: duplicatedInCase, errors: [{ message: ERROR_MESSAGE }] },
        ],
      },
    );
  });

  it("reports each duplicate once in a run of three", () => {
    const tripledCall = [
      "function run() {",
      "  emit();",
      "  emit();",
      "  emit();",
      "}",
    ].join("\n");

    ruleTester.run(
      "duplicate-consecutive-statement",
      duplicateConsecutiveStatement,
      {
        valid: [],
        invalid: [
          {
            code: tripledCall,
            errors: [{ message: ERROR_MESSAGE }, { message: ERROR_MESSAGE }],
          },
        ],
      },
    );
  });

  it("stays silent when the repetition carries an eslint-disable comment", () => {
    const deliberateDoubleRead = [
      "function run() {",
      "  reader.readByte();",
      "  // Skip the checksum byte: the format stores it twice.",
      "  // eslint-disable-next-line local/duplicate-consecutive-statement",
      "  reader.readByte();",
      "}",
    ].join("\n");

    const actualMessages = linter.verify(deliberateDoubleRead, linterConfig);
    const expectedMessages = [];

    assert.deepStrictEqual(actualMessages, expectedMessages);
  });

  it("still reports the same code without the disable comment", () => {
    const undocumentedDoubleRead = [
      "function run() {",
      "  reader.readByte();",
      "  reader.readByte();",
      "}",
    ].join("\n");

    const actualMessages = linter.verify(undocumentedDoubleRead, linterConfig);
    const actualMessageCount = actualMessages.length;
    const expectedMessageCount = 1;

    assert.strictEqual(actualMessageCount, expectedMessageCount);
  });
});
