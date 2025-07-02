import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface MarkdownContextValue {
  inputValues: Record<string, string>;
  setInputValue: (id: string, value: string) => void;
  executionResults: Record<string, unknown>;
  setExecutionResult: (id: string, result: unknown) => void;
  triggerJavaScriptExecution: (resultId: string) => void;
  executionTriggers: Record<string, { timestamp: number }>;
  registerJavaScriptCode: (resultId: string, code: string) => void;
  javascriptCode: Record<string, string>;
}

const MarkdownContext = createContext<MarkdownContextValue | undefined>(undefined);

export const useMarkdownContext = () => {
  const context = useContext(MarkdownContext);
  if (!context) {
    throw new Error('useMarkdownContext must be used within a MarkdownContextProvider');
  }
  return context;
};

interface MarkdownContextProviderProps {
  children: ReactNode;
}

export const MarkdownContextProvider = ({ children }: MarkdownContextProviderProps) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [executionResults, setExecutionResults] = useState<Record<string, unknown>>({});
  const [executionTriggers, setExecutionTriggers] = useState<Record<string, { timestamp: number }>>({});
  const [javascriptCode, setJavascriptCode] = useState<Record<string, string>>({});

  const setInputValue = useCallback((id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const setExecutionResult = useCallback((id: string, result: unknown) => {
    setExecutionResults(prev => ({ ...prev, [id]: result }));
  }, []);

  const triggerJavaScriptExecution = useCallback((resultId: string) => {
    setExecutionTriggers(prev => ({ 
      ...prev, 
      [resultId]: { timestamp: Date.now() }
    }));
  }, []);

  const registerJavaScriptCode = useCallback((resultId: string, code: string) => {
    setJavascriptCode(prev => ({ ...prev, [resultId]: code }));
  }, []);

  return (
    <MarkdownContext.Provider
      value={{
        inputValues,
        setInputValue,
        executionResults,
        setExecutionResult,
        triggerJavaScriptExecution,
        executionTriggers,
        registerJavaScriptCode,
        javascriptCode,
      }}
    >
      {children}
    </MarkdownContext.Provider>
  );
};