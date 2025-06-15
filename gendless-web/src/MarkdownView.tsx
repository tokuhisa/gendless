import { createElement, Fragment, useEffect, useState } from "react"
import rehypeReact from "rehype-react"
import { unified } from "unified"
import production from 'react/jsx-runtime'
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { visit } from 'unist-util-visit'
import remarkDirective from "remark-directive"
import type { Node } from "unist"
import { h } from 'hastscript'

type MdNode = Node & {
    name?: string,
    attributes?: Record<string, string>,
    data?: {
        hName?: string,
        hProperties?: Record<string, any>
    }
}

function directiveHandler() {
    /**
     * @param {Root} tree
     *   Tree.
     * @returns {undefined}
     *   Nothing.
     */
    return function (tree: MdNode) {
        visit(tree, function (node) {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                if (node.name !== 'mycomponent') {
                    return;
                }

                const data = node.data || (node.data = {})
                const hast = h(node.name, node.attributes || {})

                data.hName = hast.tagName
                data.hProperties = hast.properties
            }
        })
    }
}

type Props = {
    text: string;
}

export const MarkdownView = (props: Props) => {
    const { text } = props
    const [Content, setContent] = useState(createElement(Fragment))

    useEffect(() => {
        (async function () {
            const file = await unified()
                .use(remarkParse)
                .use(remarkDirective)
                .use(directiveHandler)
                .use(remarkRehype)
                .use(rehypeReact, {
                    ...production,
                    components: {
                        mycomponent: (props: any) => {
                            console.log("props", props)
                            const { prop1, prop2 } = props
                            return <div>My Component: {prop1}, {prop2} <>{props.children}</></div>
                        }
                    }
                })
                .process(text)

            setContent(file.result)
        })()
    }, [text])

    return <>
        <article className="prose prose-slate">
            {Content}
        </article>
    </>
}