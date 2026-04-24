export const noBooleanComparison = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow comparisons to boolean literals',
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    function isBooleanLiteral(node) {
      return node.type === 'Literal' && typeof node.value === 'boolean';
    }

    function requiresParens(node) {
      return node.type === 'BinaryExpression' || node.type === 'LogicalExpression';
    }

    return {
      BinaryExpression(node) {
        if (!['==', '===', '!=', '!=='].includes(node.operator)) {
          return;
        }

        const leftIsBool = isBooleanLiteral(node.left);
        const rightIsBool = isBooleanLiteral(node.right);
        if (!leftIsBool && !rightIsBool) {
          return;
        }

        const subject = rightIsBool ? node.left : node.right;
        const literal = rightIsBool ? node.right : node.left;
        const isNegated = node.operator === '!=' || node.operator === '!==';
        const wantNegated = literal.value ? isNegated : !isNegated;

        context.report({
          node,
          message: 'Avoid comparing to boolean literals. Use the value directly.',
          fix(fixer) {
            const subjectText = context.sourceCode.getText(subject);
            const wrapped = requiresParens(subject) ? `(${subjectText})` : subjectText;

            const replacement = wantNegated ? `!${wrapped}` : wrapped;
            return fixer.replaceText(node, replacement);
          },
        });
      },
    };
  },
};
