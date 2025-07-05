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

- 1
- 2

:::

## テキスト入力フォーム

### 基本的な入力フィールド

::textinput[お名前]{placeholder="お名前を入力してください"}

### メールアドレス入力

::textinput[メールアドレス (必須)]{type="email" placeholder="メールアドレス" required="true"}

### パスワード入力

::textinput[パスワード]{type="password" placeholder="パスワードを入力" defaultValue=""}

### 数値入力

::textinput[年齢]{type="number" placeholder="年齢" defaultValue="25"}

## ボタン要素

### 基本的なボタン

::button[クリックしてください]

### 様々なスタイルのボタン

::button[プライマリボタン（大）]{variant="primary" size="lg"}


::button[セカンダリボタン（中）]{variant="secondary" size="md"}

::button[危険なアクション（小）]{variant="danger" size="sm"}

::button[成功ボタン]{variant="success"}

::button[アウトラインボタン]{variant="outline"}

### 無効化されたボタン

::button[無効化されたボタン]{disabled="true"}

## インタラクティブ計算機能

### BMI計算機

身長と体重を入力してBMIを計算できます：

::textinput[身長 (cm)]{id="height" type="number" placeholder="170" defaultValue="170"}

::textinput[体重 (kg)]{id="weight" type="number" placeholder="65" defaultValue="65"}

::button[BMI計算]{variant="primary" eventId="bmi-calculator"}

:::js{eventId="bmi-calculator" resultId="bmi-result"}
const height = parseFloat(inputs.height) / 100;
const weight = parseFloat(inputs.weight);
const bmi = weight / (height * height);
console.log('身長:', inputs.height + 'cm');
console.log('体重:', inputs.weight + 'kg');
console.log('BMI:', bmi.toFixed(2));
bmi.toFixed(2);
:::

::resultdisplay[BMI計算結果がここに表示されます]{resultId="bmi-result"}


通常のMarkdownテキストも表示されます。`);

  return (
    <>
    <div className="w-full flex mx-auto justify-center">
      
    <div className="p-4">
      <MarkdownView text={text} />
    </div>
    </div>
    <div className="w-full max-w-2xl mx-auto gap-2 flex flex-row">

      <button
        type="button"
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
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
    </div>
    </>
  );
}

export default App;
