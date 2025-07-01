import { useState } from "react";
import { MarkdownView } from "./components";

function App() {
  const [text, setText] = useState(`# インタラクティブMarkdownテスト

## JavaScript実行

以下のJavaScriptコードが実行されます：

:::js
console.log("Hello, World!");
console.log("計算結果:", 2 + 3);
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("配列の合計:", sum);
:::

## テキスト入力フォーム

### 基本的な入力フィールド

:::textinput{placeholder="お名前を入力してください"}
お名前
:::

### メールアドレス入力

:::textinput{type="email" placeholder="メールアドレス" required="true"}
メールアドレス (必須)
:::

### パスワード入力

:::textinput{type="password" placeholder="パスワードを入力" defaultValue=""}
パスワード
:::

### 数値入力

:::textinput{type="number" placeholder="年齢" defaultValue="25"}
年齢
:::

## ボタン要素

### 基本的なボタン

:::button
クリックしてください
:::

### 様々なスタイルのボタン

:::button{variant="primary" size="lg"}
プライマリボタン（大）
:::

:::button{variant="secondary" size="md"}
セカンダリボタン（中）
:::

:::button{variant="danger" size="sm"}
危険なアクション（小）
:::

:::button{variant="success"}
成功ボタン
:::

:::button{variant="outline"}
アウトラインボタン
:::

### 無効化されたボタン

:::button{disabled="true"}
無効化されたボタン
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
