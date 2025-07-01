import { useState, useId } from "react";
import { getQuickJS } from "quickjs-emscripten";
import type { ButtonProps } from "../../../types";
import { useMarkdownContext } from "../context";
import { safeStringify } from "../../../utils";

/**
 * Interactive button component for Markdown directives
 */
export const Button = (props: ButtonProps) => {
  const {
    variant = "primary",
    size = "md",
    disabled = false,
    type = "button",
    execute,
    resultId,
    children
  } = props;

  const [isExecuting, setIsExecuting] = useState(false);
  const generatedId = useId();
  const executionId = resultId ?? generatedId;
  const { inputValues, setExecutionResult } = useMarkdownContext();

  const handleClick = async () => {
    if (disabled || isExecuting || !execute) return;

    setIsExecuting(true);
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
        logMessages.push(nativeArgs.join(" "));
      });
      const consoleHandle = vm.newObject();
      vm.setProp(consoleHandle, "log", logHandle);
      vm.setProp(vm.global, "console", consoleHandle);

      // Execute the code
      const evalResult = vm.evalCode(execute);
      
      let result: unknown;
      if (evalResult.error) {
        const errorMsg = vm.dump(evalResult.error) as unknown;
        const errorString = typeof errorMsg === 'string' ? errorMsg : String(errorMsg);
        result = { error: errorString, logs: logMessages };
        evalResult.error.dispose();
      } else {
        const output = vm.dump(evalResult.value) as unknown;
        result = { 
          value: output, 
          logs: logMessages,
          display: safeStringify(output)
        };
        evalResult.value.dispose();
      }

      // Store result in context
      setExecutionResult(executionId, result);

      // Cleanup
      inputsObject.dispose();
      consoleHandle.dispose();
      logHandle.dispose();
      vm.dispose();
    } catch (err) {
      const errorString = err instanceof Error ? err.message : String(err);
      setExecutionResult(executionId, { error: `Execution error: ${errorString}` });
    } finally {
      setIsExecuting(false);
    }
  };

  // Style variants
  const getVariantClasses = () => {
    const baseClasses = "font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300`;
      case 'secondary':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-300`;
      case 'success':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-300`;
      case 'outline':
        return `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300`;
    }
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return "px-3 py-1.5 text-sm";
      case 'md':
        return "px-4 py-2 text-sm";
      case 'lg':
        return "px-6 py-3 text-base";
      default:
        return "px-4 py-2 text-sm";
    }
  };

  const buttonText = children && typeof children === 'string' ? children : 'Button';

  return (
    <button
      type={type}
      disabled={disabled || isExecuting}
      onClick={() => void handleClick()}
      className={`${getVariantClasses()} ${getSizeClasses()} my-2`}
    >
      {isExecuting ? '実行中...' : buttonText}
    </button>
  );
};