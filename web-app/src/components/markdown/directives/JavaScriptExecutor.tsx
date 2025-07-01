import { useState, useEffect } from "react";
import { getQuickJS } from "quickjs-emscripten";
import type { JavaScriptExecutorProps } from "../../../types";
import { extractTextFromReactNode, safeStringify } from "../../../utils";

/**
 * Component that executes JavaScript code using QuickJS in a sandboxed environment
 */
export const JavaScriptExecutor = (props: JavaScriptExecutorProps) => {
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
      
      if (evalResult.error) {
        const errorMsg = vm.dump(evalResult.error) as unknown;
        const errorString = typeof errorMsg === 'string' ? errorMsg : String(errorMsg);
        setError(`Error: ${errorString}`);
        evalResult.error.dispose();
      } else {
        const output = vm.dump(evalResult.value) as unknown;
        if (output !== undefined && output !== null) {
          const outputString = safeStringify(output);
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
        code = extractTextFromReactNode(props.children);
      }
    }
    
    if (code.trim()) {
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