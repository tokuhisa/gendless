import { useState } from 'react'


function App() {
  const [name, setName] = useState("unknown");

  return (
    <>
      <button
        type='button'
        onClick={() => {
          fetch("/api/hono")
            .then((res) => res.json() as Promise<{ name: string }>)
            .then((data) => { setName(data.name); })
            .catch((err: unknown) => {
              console.error("Error fetching name:", err);
            });
        }}
        aria-label="get name"
      >
        Name from API is: {name}
      </button>
    </>
  )
}

export default App
