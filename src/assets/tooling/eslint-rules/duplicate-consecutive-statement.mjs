// No autofix: deleting a statement is destructive, and the rule cannot tell a
// copy-paste slip from a side effect the author meant to run twice.
export const duplicateConsecutiveStatement = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow two adjacent statements with identical source",
    },
    schema: [],
  },

  create(context) {
    const MESSAGE =
      "Duplicate consecutive statement. Remove it, or silence this line with a comment stating why the repetition is deliberate.";

    function isSkippable(node) {
      const hasEmptyStatement = node.type === "EmptyStatement";
      return hasEmptyStatement;
    }

    function isDuplicatePair(first, second) {
      if (isSkippable(first) || isSkippable(second)) {
        const skipped = false;
        return skipped;
      }

      const firstText = context.sourceCode.getText(first);
      const secondText = context.sourceCode.getText(second);

      const isIdentical = firstText === secondText;
      return isIdentical;
    }

    function reportDuplicates(body) {
      body.forEach((statement, index) => {
        if (index === 0) {
          return;
        }

        if (isDuplicatePair(body[index - 1], statement)) {
          context.report({ node: statement, message: MESSAGE });
        }
      });
    }

    return {
      Program(node) {
        reportDuplicates(node.body);
      },
      BlockStatement(node) {
        reportDuplicates(node.body);
      },
      StaticBlock(node) {
        reportDuplicates(node.body);
      },
      SwitchCase(node) {
        reportDuplicates(node.consequent);
      },
    };
  },
};
