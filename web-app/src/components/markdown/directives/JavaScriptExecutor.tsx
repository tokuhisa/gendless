import { useState, useEffect } from "react";
import { getQuickJS } from "quickjs-emscripten";
import type { JavaScriptExecutorProps } from "../../../types";
import { extractTextFromReactNode, safeStringify } from "../../../utils";
import { useMarkdownContext } from "../context";

/**
 * Component that executes JavaScript code using QuickJS in a sandboxed environment
 */
export const JavaScriptExecutor = (props: JavaScriptExecutorProps) => {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showCode, setShowCode] = useState(false);
  const { inputValues, executionTriggers, setExecutionResult, registerJavaScriptCode, javascriptCode } = useMarkdownContext();

  const executeCode = async (code: string, resultId?: string) => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const QuickJS = await getQuickJS();
      const vm = QuickJS.newContext();

      // Create inputs object with all input values
      const inputsObject = vm.newObject();
      for (const [key, value] of Object.entries(inputValues)) {
        vm.setProp(inputsObject, key, vm.newString(value));
      }
      vm.setProp(vm.global, "inputs", inputsObject);

      // Add console.log implementation
      const logMessages: string[] = [];
      const logHandle = vm.newFunction("log", (...args) => {
        const nativeArgs = args.map(arg => {
          const dumped = vm.dump(arg) as unknown;
          return typeof dumped === 'string' ? dumped : String(dumped);
        });
        const message = nativeArgs.join(" ");
        logMessages.push(message);
        setResult(prev => prev + message + "\n");
      });
      const consoleHandle = vm.newObject();
      vm.setProp(consoleHandle, "log", logHandle);
      vm.setProp(vm.global, "console", consoleHandle);

      // Execute the code
      const evalResult = vm.evalCode(code);
      
      let executionResult: unknown;
      if (evalResult.error) {
        const errorMsg = vm.dump(evalResult.error) as unknown;
        const errorString = typeof errorMsg === 'string' ? errorMsg : String(errorMsg);
        setError(`Error: ${errorString}`);
        executionResult = { error: errorString, logs: logMessages };
        evalResult.error.dispose();
      } else {
        const output = vm.dump(evalResult.value) as unknown;
        if (output !== undefined && output !== null) {
          const outputString = safeStringify(output);
          setResult(prev => prev + `Return value: ${outputString}\n`);
          executionResult = { 
            value: output, 
            logs: logMessages,
            display: outputString
          };
        } else {
          executionResult = { logs: logMessages };
        }
        evalResult.value.dispose();
      }

      // Store result in context if resultId is provided
      if (resultId) {
        setExecutionResult(resultId, executionResult);
      }

      // Cleanup
      inputsObject.dispose();
      consoleHandle.dispose();
      logHandle.dispose();
      vm.dispose();
    } catch (err) {
      const errorString = err instanceof Error ? err.message : String(err);
      const errorMessage = `Execution error: ${errorString}`;
      setError(errorMessage);
      if (resultId) {
        setExecutionResult(resultId, { error: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for execution triggers from buttons
  useEffect(() => {
    if (props.resultId && executionTriggers[props.resultId] && javascriptCode[props.resultId]) {
      const code = javascriptCode[props.resultId];
      void executeCode(code, props.resultId);
    }
  }, [executionTriggers, props.resultId, javascriptCode]);

  // Register code and execute on mount
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
      // Register the code if resultId is provided
      if (props.resultId) {
        registerJavaScriptCode(props.resultId, code.trim());
      } else {
        // Execute immediately if no resultId (for standalone js directives)
        void executeCode(code.trim());
      }
    }
  }, [props.children, props.codeContent, props.resultId, registerJavaScriptCode]);

  // Get the current code for this executor
  const getCurrentCode = () => {
    if (props.resultId && javascriptCode[props.resultId]) {
      return javascriptCode[props.resultId];
    }
    if (props.codeContent) {
      return props.codeContent;
    }
    if (props.children) {
      return typeof props.children === 'string' ? props.children : extractTextFromReactNode(props.children);
    }
    return "";
  };

  const currentCode = getCurrentCode();

  return (
    <div className="border border-gray-300 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">
          JavaScript Execution
          {props.resultId && (
            <span className="ml-2 text-xs text-gray-500">(ID: {props.resultId})</span>
          )}
        </h4>
        <div className="flex items-center gap-2">
          {currentCode && (
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showCode ? 'コードを隠す' : 'コードを表示'}
            </button>
          )}
          {isLoading && <span className="text-sm text-blue-600">実行中...</span>}
        </div>
      </div>
      
      {showCode && currentCode && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1">JavaScript Code:</div>
          <pre className="bg-gray-100 border p-3 rounded text-sm overflow-x-auto">
            <code className="text-gray-900">{currentCode}</code>
          </pre>
        </div>
      )}
      
      {!showCode && !props.resultId && (props.codeContent ?? props.children) && (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-3">
          <code className="text-gray-900">{props.codeContent ?? props.children}</code>
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