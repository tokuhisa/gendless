import { useState } from "react";
import { MarkdownView } from "./MarkdownView";

function App() {
  const [name, setName] = useState("unknown");
  const [text, setText] = useState("markdown text");

  return (
    <>
      <MarkdownView text={text} />
      <button
        type="button"
        onClick={() => {
          fetch("/api/hono")
            .then((res) => res.json() as Promise<{ name: string }>)
            .then((data) => {
              setName(data.name);
            })
            .catch((err: unknown) => {
              console.error("Error fetching name:", err);
            });
        }}
        aria-label="get name"
      >
        Name from API is: {name}
      </button>
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
    </>
  );
}

export default App;
