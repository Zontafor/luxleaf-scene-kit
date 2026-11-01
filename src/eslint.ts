// Derived from @react-three/eslint-plugin (MIT); source and license preserved in foundations/react-three-fiber.
interface Context {
  report(value: { messageId: string; node: unknown }): void;
}
function rule(selector: string, message: string) {
  return {
    meta: {
      type: "suggestion" as const,
      schema: [],
      messages: { allocation: message },
    },
    create(context: Context) {
      return {
        [selector]: (node: unknown) =>
          context.report({ messageId: "allocation", node }),
      };
    },
  };
}
export const rules = {
  "no-new-in-loop": rule(
    "CallExpression[callee.name=useFrame] NewExpression",
    "Allocate objects outside the frame loop.",
  ),
  "no-clone-in-loop": rule(
    "CallExpression[callee.name=useFrame] CallExpression MemberExpression Identifier[name=clone]",
    "Reuse vectors instead of cloning inside the frame loop.",
  ),
};
const plugin = { rules };
export default plugin;
export const flatConfig = {
  plugins: { "luxleaf-scene": plugin },
  rules: {
    "luxleaf-scene/no-new-in-loop": "warn",
    "luxleaf-scene/no-clone-in-loop": "warn",
  },
};
