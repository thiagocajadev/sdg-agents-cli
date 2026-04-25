export const blankBeforeAssertion = {
  meta: {
    type: "layout",
    docs: {
      description:
        "require a blank line before the first assertion in each test block",
    },
    fixable: "whitespace",
    schema: [],
  },

  create(context) {
    function isAssertionCall(node) {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        if (callee.type === "Identifier") {
          return callee.name === "expect";
        }

        if (callee.type === "MemberExpression") {
          if (
            callee.object.type === "Identifier" &&
            callee.object.name === "assert"
          ) {
            return true;
          }

          return isAssertionCall(callee.object);
        }
      }

      if (node.type === "MemberExpression") {
        return isAssertionCall(node.object);
      }

      return false;
    }

    function isPrevSiblingAssertion(node) {
      const siblings = node.parent?.body;
      if (!siblings) {
        return false;
      }

      const index = siblings.indexOf(node);
      if (index <= 0) {
        return false;
      }

      const prev = siblings[index - 1];
      return (
        prev.type === "ExpressionStatement" && isAssertionCall(prev.expression)
      );
    }

    function hasBlankLineBefore(node) {
      const tokenBefore = context.sourceCode.getTokenBefore(node);
      if (!tokenBefore) {
        return true;
      }

      if (tokenBefore.value === "{") {
        return true;
      }

      const textBetween = context.sourceCode.text.slice(
        tokenBefore.range[1],
        node.range[0]
      );

      return textBetween.includes("\n\n");
    }

    return {
      ExpressionStatement(node) {
        if (!isAssertionCall(node.expression)) {
          return;
        }

        if (isPrevSiblingAssertion(node)) {
          return;
        }

        if (hasBlankLineBefore(node)) {
          return;
        }

        context.report({
          node,
          message: "Expected a blank line before the first assertion.",
          fix(fixer) {
            const tokenBefore = context.sourceCode.getTokenBefore(node);
            return fixer.insertTextAfter(tokenBefore, "\n");
          },
        });
      },
    };
  },
};
