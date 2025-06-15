import { useState } from "react";
import { MarkdownView } from "./MarkdownView";

function App() {
  const [name, setName] = useState("unknown");

  return (
    <>
      <MarkdownView
        text={`
# Markdown Example

::::mycomponent{prop1="hoge" prop2="fuga"}

:::mycomponent{prop1="bar" prop2="baz"}
test

* item1
* item2
* item3

:::

::::
      `}
      />
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
    </>
  );
}

export default App;
