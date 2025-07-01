import { useState } from "react";
import { MarkdownView } from "./MarkdownView";

function App() {
  const [text, setText] = useState(`# JavaScript実行テスト

以下のJavaScriptコードが実行されます：

:::js
console.log("Hello, World!");
console.log("計算結果:", 2 + 3);
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("配列の合計:", sum);
:::

通常のMarkdownテキストも表示されます。`);

  return (
    <>
      <MarkdownView text={text} />
      <button
        type="button"
        onClick={() => {
          fetch("/api/documents/example.md")
            .then((res) => res.text())
            .then((data) => {
              setText(data);
            })
            .catch((err: unknown) => {
              console.error("Error fetching markdown text:", err);
            });
        }}
      >
        Set Markdown Text
      </button>
      <button
        type="button"
        onClick={() => {
          fetch("/api/documents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputFileName: "example.md",
            }),
          })
            .then((res) => res.text())
            .then((data) => {
              console.log("Generated Markdown Text:", data);
              const parsed = JSON.parse(data) as { text: string };
              setText(parsed.text);
            })
            .catch((err: unknown) => {
              console.error("Error fetching markdown text:", err);
            });
        }}
      >
        Geneate Markdown Text
      </button>
    </>
  );
}

export default App;
