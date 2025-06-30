import { useState } from "react";
import { MarkdownView } from "./MarkdownView";

function App() {
  const [text, setText] = useState("markdown text");

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
              const { text: generatedText } = JSON.parse(data);
              setText(generatedText);
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
