import { visit } from "unist-util-visit";
import { h } from "hastscript";
import type { Root } from "mdast";

/**
 * Remark plugin to handle custom directives
 */
export function directiveHandler() {
  return function (tree: Root) {
    visit(tree, function (node) {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        if (node.name !== "mycomponent" && node.name !== "js") {
          return;
        }

        const data = node.data ?? (node.data = {});
        const hast = h(node.name, node.attributes ?? {});

        data.hName = hast.tagName;
        data.hProperties = hast.properties;

        // For js directive, extract the code content
        if (node.name === "js") {
          let codeContent = "";
          for (const child of node.children) {
            if (child.type === "code") {
              codeContent += child.value;
            } else if (child.type === "text") {
              codeContent += child.value;
            }
          }
          // Pass the code content as a prop
          data.hProperties = { ...data.hProperties, codeContent };
        }
      }
    });
  };
}