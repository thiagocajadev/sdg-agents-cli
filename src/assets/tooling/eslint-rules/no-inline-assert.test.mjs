import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import { noInlineAssert } from "./no-inline-assert.mjs";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

const TEST_FILENAME = "spec.test.mjs";
const ERROR_ID = "inlineArgument";

describe("no-inline-assert", () => {
  it("passes when both arguments are named identifiers", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [
        {
          code: "assert.strictEqual(actual, expected);",
          filename: TEST_FILENAME,
        },
        { code: "assert.ok(actualId);", filename: TEST_FILENAME },
        { code: "assert.rejects(actual, expected);", filename: TEST_FILENAME },
        {
          code: "assert.deepStrictEqual(actualItems, expectedItems);",
          filename: TEST_FILENAME,
        },
      ],
      invalid: [],
    });
  });

  it("skips non-test files", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [
        {
          code: "assert.strictEqual(result.pass, true);",
          filename: "src/lib/util.mjs",
        },
      ],
      invalid: [],
    });
  });

  it("exempts ArrowFunction as first argument of assert.throws", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [
        { code: "assert.throws(() => fn());", filename: TEST_FILENAME },
        { code: "assert.doesNotThrow(() => fn());", filename: TEST_FILENAME },
      ],
      invalid: [],
    });
  });

  it("exempts string literal message as last argument of assert.ok", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [
        {
          code: 'assert.ok(isPresent, "must be present");',
          filename: TEST_FILENAME,
        },
        {
          code: 'assert.equal(actual, expected, "must match");',
          filename: TEST_FILENAME,
        },
      ],
      invalid: [],
    });
  });

  it("flags property access as first argument", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [],
      invalid: [
        {
          code: "assert.strictEqual(result.pass, expected);",
          filename: TEST_FILENAME,
          errors: [{ messageId: ERROR_ID }],
        },
      ],
    });
  });

  it("flags boolean literal as second argument", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [],
      invalid: [
        {
          code: "assert.strictEqual(actual, true);",
          filename: TEST_FILENAME,
          errors: [{ messageId: ERROR_ID }],
        },
      ],
    });
  });

  it("flags regex literal as second argument", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [],
      invalid: [
        {
          code: "assert.match(actual, /pattern/);",
          filename: TEST_FILENAME,
          errors: [{ messageId: ERROR_ID }],
        },
      ],
    });
  });

  it("flags call expression as first argument", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [],
      invalid: [
        {
          code: "assert.strictEqual(formatName(user), expected);",
          filename: TEST_FILENAME,
          errors: [{ messageId: ERROR_ID }],
        },
      ],
    });
  });

  it("flags both arguments when neither is an identifier", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [],
      invalid: [
        {
          code: "assert.strictEqual(result.pass, true);",
          filename: TEST_FILENAME,
          errors: [{ messageId: ERROR_ID }, { messageId: ERROR_ID }],
        },
      ],
    });
  });

  it("does not flag string literal when it is the expected value in 2-arg equal", () => {
    ruleTester.run("no-inline-assert", noInlineAssert, {
      valid: [],
      invalid: [
        {
          code: 'assert.equal(actual, "expected string");',
          filename: TEST_FILENAME,
          errors: [{ messageId: ERROR_ID }],
        },
      ],
    });
  });
});
