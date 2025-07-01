import { createElement, Fragment, useEffect, useState, type JSX } from "react";
import rehypeReact from "rehype-react";
import { unified } from "unified";
import production from "react/jsx-runtime";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { visit } from "unist-util-visit";
import remarkDirective from "remark-directive";
import { h } from "hastscript";
import type { Root } from "mdast";
import { getQuickJS } from "quickjs-emscripten";

function directiveHandler() {
  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
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

interface Props {
  text: string;
}

// QuickJS JavaScript execution component
const JavaScriptExecutor = (props: { children?: React.ReactNode; codeContent?: string }) => {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const executeCode = async (code: string) => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const QuickJS = await getQuickJS();
      const vm = QuickJS.newContext();

      // Add a simple console.log implementation
      const logHandle = vm.newFunction("log", (...args) => {
        const nativeArgs = args.map(arg => {
          const dumped = vm.dump(arg) as unknown;
          return typeof dumped === 'string' ? dumped : String(dumped);
        });
        setResult(prev => prev + nativeArgs.join(" ") + "\n");
      });
      const consoleHandle = vm.newObject();
      vm.setProp(consoleHandle, "log", logHandle);
      vm.setProp(vm.global, "console", consoleHandle);
      consoleHandle.dispose();
      logHandle.dispose();

      // Execute the code
      const evalResult = vm.evalCode(code);
      console.log("JavaScript code executed:", code, "Result:", evalResult);
      
      if (evalResult.error) {
        const errorMsg = vm.dump(evalResult.error) as unknown;
        const errorString = typeof errorMsg === 'string' ? errorMsg : String(errorMsg);
        setError(`Error: ${errorString}`);
        evalResult.error.dispose();
      } else {
        const output = vm.dump(evalResult.value) as unknown;
        if (output !== undefined && output !== null) {
          const outputString = typeof output === 'string' ? output : 
                              typeof output === 'number' ? output.toString() :
                              typeof output === 'boolean' ? output.toString() :
                              JSON.stringify(output);
          setResult(prev => prev + `Return value: ${outputString}\n`);
        }
        evalResult.value.dispose();
      }

      vm.dispose();
    } catch (err) {
      const errorString = err instanceof Error ? err.message : String(err);
      setError(`Execution error: ${errorString}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let code = "";
    
    // Try to get code from codeContent prop first
    if (props.codeContent) {
      code = props.codeContent;
    } 
    // Fallback to extracting from children
    else if (props.children) {
      if (typeof props.children === "string") {
        code = props.children;
      } else {
        // If children is a React node, try to extract text content
        const extractText = (node: React.ReactNode): string => {
          if (typeof node === "string") return node;
          if (typeof node === "number") return String(node);
          if (Array.isArray(node)) return node.map(extractText).join("");
          if (node && typeof node === "object" && "props" in node) {
            return extractText((node as { props: { children: React.ReactNode } }).props.children);
          }
          return "";
        };
        code = extractText(props.children);
      }
    }
    
    if (code.trim()) {
      console.log("Executing JavaScript code:", code);
      void executeCode(code.trim());
    }
  }, [props.children, props.codeContent]);

  return (
    <div className="border border-gray-300 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">JavaScript Execution</h4>
        {isLoading && <span className="text-sm text-blue-600">実行中...</span>}
      </div>
      
      {(props.codeContent ?? props.children) && (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-3">
          <code>{props.codeContent ?? props.children}</code>
        </pre>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-2">
          {error}
        </div>
      )}
      
      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
          <strong>Output:</strong>
          <pre className="mt-1 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
};

export const MarkdownView = (props: Props) => {
  const { text } = props;
  const [Content, setContent] = useState(createElement(Fragment));

  useEffect(() => {
    const update = async () => {
      const processor = unified();
      processor.use(remarkParse);
      processor.use(remarkDirective);
      processor.use(directiveHandler);
      processor.use(remarkRehype);
      processor.use(rehypeReact, {
        ...production,
        components: {
          mycomponent: (props: {
            prop1: string | undefined;
            prop2: string | undefined;
            children: JSX.Element | undefined;
          }) => {
            const { prop1, prop2, children } = props;
            return (
              <div>
                My Component: {prop1}, {prop2} <>{children}</>
              </div>
            );
          },
          js: JavaScriptExecutor,
        },
      });
      const file = await processor.process(text);

      setContent(file.result as JSX.Element);
    };
    update().catch((err: unknown) => {
      console.error("Error processing markdown:", err);
    });
  }, [text]);

  return (
    <>
      <article className="prose prose-slate">{Content}</article>
    </>
  );
};
