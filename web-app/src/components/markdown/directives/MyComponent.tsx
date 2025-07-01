import type { MyComponentProps } from "../../../types";

/**
 * Example custom component for Markdown directives
 */
export const MyComponent = (props: MyComponentProps) => {
  const { prop1, prop2, children } = props;
  return (
    <div>
      My Component: {prop1}, {prop2} <>{children}</>
    </div>
  );
};