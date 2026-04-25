import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import { blankBeforeAssertion } from "./blank-before-assertion.mjs";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

const ERROR_MESSAGE = "Expected a blank line before the first assertion.";

describe("blank-before-assertion", () => {
  it("passes when blank line precedes expect()", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [
        {
          code: [
            "it('test', () => {",
            "  const actual = fn();",
            "  const expected = 1;",
            "",
            "  expect(actual).toBe(expected);",
            "});",
          ].join("\n"),
        },
      ],
      invalid: [],
    });
  });

  it("passes when blank line precedes assert.equal()", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [
        {
          code: [
            "it('test', () => {",
            "  const actual = fn();",
            "  const expected = 1;",
            "",
            "  assert.equal(actual, expected);",
            "});",
          ].join("\n"),
        },
      ],
      invalid: [],
    });
  });

  it("passes when assertion is first statement in block", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [
        {
          code: [
            "it('test', () => {",
            "  expect(true).toBe(true);",
            "});",
          ].join("\n"),
        },
      ],
      invalid: [],
    });
  });

  it("passes for consecutive assert calls without blank between them", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [
        {
          code: [
            "it('test', () => {",
            "  const actual = fn();",
            "",
            "  assert.equal(actual.a, 1);",
            "  assert.equal(actual.b, 2);",
            "  assert.equal(actual.c, 3);",
            "});",
          ].join("\n"),
        },
      ],
      invalid: [],
    });
  });

  it("passes for consecutive expect calls without blank between them", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [
        {
          code: [
            "it('test', () => {",
            "  const actual = fn();",
            "",
            "  expect(actual.a).toBe(1);",
            "  expect(actual.b).toBe(2);",
            "});",
          ].join("\n"),
        },
      ],
      invalid: [],
    });
  });

  it("passes for chained expect().not.toBe()", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [
        {
          code: [
            "it('test', () => {",
            "  const actual = fn();",
            "",
            "  expect(actual).not.toBe(null);",
            "});",
          ].join("\n"),
        },
      ],
      invalid: [],
    });
  });

  it("flags and fixes missing blank line before expect()", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [],
      invalid: [
        {
          code: [
            "it('test', () => {",
            "  const actual = fn();",
            "  const expected = 1;",
            "  expect(actual).toBe(expected);",
            "});",
          ].join("\n"),
          errors: [{ message: ERROR_MESSAGE }],
          output: [
            "it('test', () => {",
            "  const actual = fn();",
            "  const expected = 1;",
            "",
            "  expect(actual).toBe(expected);",
            "});",
          ].join("\n"),
        },
      ],
    });
  });

  it("flags and fixes missing blank line before assert.equal()", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [],
      invalid: [
        {
          code: [
            "it('test', () => {",
            "  const actual = fn();",
            "  const expected = 1;",
            "  assert.equal(actual, expected);",
            "});",
          ].join("\n"),
          errors: [{ message: ERROR_MESSAGE }],
          output: [
            "it('test', () => {",
            "  const actual = fn();",
            "  const expected = 1;",
            "",
            "  assert.equal(actual, expected);",
            "});",
          ].join("\n"),
        },
      ],
    });
  });

  it("flags only the first assert in a group when missing blank", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [],
      invalid: [
        {
          code: [
            "it('test', () => {",
            "  const actual = fn();",
            "  assert.equal(actual.a, 1);",
            "  assert.equal(actual.b, 2);",
            "});",
          ].join("\n"),
          errors: [{ message: ERROR_MESSAGE }],
          output: [
            "it('test', () => {",
            "  const actual = fn();",
            "",
            "  assert.equal(actual.a, 1);",
            "  assert.equal(actual.b, 2);",
            "});",
          ].join("\n"),
        },
      ],
    });
  });

  it("flags and fixes missing blank line before expect().resolves", () => {
    ruleTester.run("blank-before-assertion", blankBeforeAssertion, {
      valid: [],
      invalid: [
        {
          code: [
            "it('test', async () => {",
            "  const actual = await fn();",
            "  expect(actual).resolves.toBe(true);",
            "});",
          ].join("\n"),
          errors: [{ message: ERROR_MESSAGE }],
          output: [
            "it('test', async () => {",
            "  const actual = await fn();",
            "",
            "  expect(actual).resolves.toBe(true);",
            "});",
          ].join("\n"),
        },
      ],
    });
  });
});
