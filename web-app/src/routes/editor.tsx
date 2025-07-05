import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MarkdownView } from '../components'

export const Route = createFileRoute('/editor')({
  component: EditorComponent,
})

function EditorComponent() {
  const [markdownText, setMarkdownText] = useState(`# Markdownエディター

このエディターでは、左側でMarkdownを編集し、右側でプレビューを確認できます。

## 使用可能な機能

### インタラクティブ要素

以下のディレクティブを使用してインタラクティブなコンテンツを作成できます：

#### テキスト入力

::textinput[お名前]{id="name" placeholder="名前を入力してください"}

#### ボタンとJavaScript実行

::button[挨拶を実行]{eventId="greeting" variant="primary"}

:::js{eventId="greeting" resultId="greeting-result"}
const name = inputs.name || "名無し";
const greeting = \`こんにちは、\${name}さん！\`;
console.log(greeting);
greeting;
:::

::resultdisplay[挨拶結果がここに表示されます]{resultId="greeting-result"}

## その他のMarkdown要素

### リスト
- 項目1
- 項目2
- 項目3

### コードブロック
\`\`\`javascript
const hello = "Hello, World!";
console.log(hello);
\`\`\`

### テーブル
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| 1   | 2   | 3   |

### 引用
> これは引用文です。

**太字** と *斜体* のテキストも使用できます。
`)
  
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split')

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gray-100 border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Markdownエディター</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'edit'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            編集
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            分割
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            プレビュー
          </button>
        </div>
      </div>

      {/* エディターとプレビューエリア */}
      <div className="flex-1 flex overflow-hidden">
        {/* エディターエリア */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col border-r`}>
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h2 className="text-sm font-medium text-gray-700">Markdown編集</h2>
            </div>
            <textarea
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
              className="flex-1 p-4 font-mono text-sm resize-none border-none focus:outline-none focus:ring-0"
              placeholder="Markdownを入力してください..."
              spellCheck={false}
            />
          </div>
        )}

        {/* プレビューエリア */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h2 className="text-sm font-medium text-gray-700">プレビュー</h2>
            </div>
            <div className="flex-1 overflow-auto bg-white flex justify-center">
              <div className="w-full max-w-4xl p-4 flex justify-center">
                <MarkdownView text={markdownText} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}