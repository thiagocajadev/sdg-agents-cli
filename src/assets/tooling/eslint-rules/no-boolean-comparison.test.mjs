import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import { noBooleanComparison } from "./no-boolean-comparison.mjs";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

const ERROR_MESSAGE =
  "Avoid comparing to boolean literals. Use the value directly.";

describe("no-boolean-comparison", () => {
  it("passes for truthy/falsy checks without literal comparison", () => {
    ruleTester.run("no-boolean-comparison", noBooleanComparison, {
      valid: [
        { code: "if (value) {}" },
        { code: "const isActive = value;" },
        { code: 'const isMatch = value === "string";' },
        { code: "const isEqual = a === b;" },
      ],
      invalid: [],
    });
  });

  it("flags and fixes value === true", () => {
    ruleTester.run("no-boolean-comparison", noBooleanComparison, {
      valid: [],
      invalid: [
        {
          code: "const isValid = value === true;",
          errors: [{ message: ERROR_MESSAGE }],
          output: "const isValid = value;",
        },
      ],
    });
  });

  it("flags and fixes value === false", () => {
    ruleTester.run("no-boolean-comparison", noBooleanComparison, {
      valid: [],
      invalid: [
        {
          code: "const isInvalid = value === false;",
          errors: [{ message: ERROR_MESSAGE }],
          output: "const isInvalid = !value;",
        },
      ],
    });
  });

  it("flags and fixes value !== true", () => {
    ruleTester.run("no-boolean-comparison", noBooleanComparison, {
      valid: [],
      invalid: [
        {
          code: "const isInvalid = value !== true;",
          errors: [{ message: ERROR_MESSAGE }],
          output: "const isInvalid = !value;",
        },
      ],
    });
  });

  it("flags and fixes value !== false", () => {
    ruleTester.run("no-boolean-comparison", noBooleanComparison, {
      valid: [],
      invalid: [
        {
          code: "const isValid = value !== false;",
          errors: [{ message: ERROR_MESSAGE }],
          output: "const isValid = value;",
        },
      ],
    });
  });

  it("flags and fixes literal on left: true === value", () => {
    ruleTester.run("no-boolean-comparison", noBooleanComparison, {
      valid: [],
      invalid: [
        {
          code: "const isValid = true === value;",
          errors: [{ message: ERROR_MESSAGE }],
          output: "const isValid = value;",
        },
      ],
    });
  });

  it("flags and fixes literal on left: false === value", () => {
    ruleTester.run("no-boolean-comparison", noBooleanComparison, {
      valid: [],
      invalid: [
        {
          code: "const isInvalid = false === value;",
          errors: [{ message: ERROR_MESSAGE }],
          output: "const isInvalid = !value;",
        },
      ],
    });
  });

  it("flags and fixes complex subject with parens: (a && b) === false", () => {
    ruleTester.run("no-boolean-comparison", noBooleanComparison, {
      valid: [],
      invalid: [
        {
          code: "const shouldSkip = (a && b) === false;",
          errors: [{ message: ERROR_MESSAGE }],
          output: "const shouldSkip = !(a && b);",
        },
      ],
    });
  });
});
