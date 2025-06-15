import { createElement, Fragment, useEffect, useState, type JSX } from "react";
import rehypeReact from "rehype-react";
import { unified } from "unified";
import production from "react/jsx-runtime";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { visit } from "unist-util-visit";
import remarkDirective from "remark-directive";
import { h } from "hastscript";
import type {Root} from 'mdast'

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
        if (node.name !== "mycomponent") {
          return;
        }

        const data = node.data ?? (node.data = {});
        const hast = h(node.name, node.attributes ?? {});

        data.hName = hast.tagName;
        data.hProperties = hast.properties;
      }
    });
  };
}

interface Props {
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
