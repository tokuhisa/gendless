import { createElement, Fragment, useEffect, useState, type JSX } from "react";
import rehypeReact from "rehype-react";
import { unified } from "unified";
import production from "react/jsx-runtime";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkDirective from "remark-directive";
import type { MarkdownViewProps } from "../../types";
import { JavaScriptExecutor, MyComponent, TextInput, Button, ResultDisplay, directiveHandler } from "./directives";
import { MarkdownContextProvider } from "./context";

export const MarkdownView = (props: MarkdownViewProps) => {
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
          mycomponent: MyComponent,
          js: JavaScriptExecutor,
          textinput: TextInput,
          button: Button,
          resultdisplay: ResultDisplay,
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
    <MarkdownContextProvider>
      <article className="prose prose-slate">{Content}</article>
    </MarkdownContextProvider>
  );
};