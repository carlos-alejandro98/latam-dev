import { ESLintUtils } from '@typescript-eslint/utils';

export const noLogicInDesignSystemRule = ESLintUtils.RuleCreator(() => '')({
  name: 'no-logic-in-design-system',
  meta: {
    type: 'problem',
    docs: {
      description: 'Design system wrappers must not contain business logic',
    },
    schema: [],
    messages: {
      noLogic: 'Design system components must not contain logic.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      IfStatement(node) {
        context.report({
          node,
          messageId: 'noLogic',
        });
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name.startsWith('use')
        ) {
          context.report({
            node,
            messageId: 'noLogic',
          });
        }
      },
    };
  },
});
