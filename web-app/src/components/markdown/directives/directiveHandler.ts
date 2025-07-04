import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { handleJavascriptExecutorNode } from "./JavaScriptExecutor";
import {VFile} from 'vfile'
import { handleButtonNode } from "./Button";
import { handleTextInputNode } from "./TextInput";
import { handleResultDisplayNode } from "./ResultDisplay";

/**
 * Remark plugin to handle custom directives
 */
export function directiveHandler() {
  return function (tree: Root, file: VFile) {
    visit(tree, function (node) {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        handleJavascriptExecutorNode(node, file);
        handleButtonNode(node);
        handleTextInputNode(node);
        handleResultDisplayNode(node);
      }
    });
  };
}