import { createElement, Fragment, useEffect, useState, type JSX } from "react";
import rehypeReact from "rehype-react";
import { unified } from "unified";
import production from "react/jsx-runtime";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkDirective from "remark-directive";
import { directiveHandler, components } from "./directives";
import { MarkdownContextProvider } from "./context";

export interface Props {
  text: string;
}

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
        components: components,
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