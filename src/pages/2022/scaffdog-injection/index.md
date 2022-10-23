---
title: scaffdog で既存ファイルへのコード追加を行う機能を追加した
date: '2022-06-27'
---

## はじめに

[scaffdog] は Markdown Driven な scaffolding ツールです。GitHub の Repository は以下。

> [cats-oss/scaffdog: scaffdog is Markdown driven scaffolding tool.][scaffdog]

[去年の 1 月に v1.0.0 をリリース](/2021/scaffdog-v1/)し、最近になってまた少し改修を加えました。この記事では、その改修内容によって実現可能となった機能について紹介します。

## 追加した機能

執筆時点での最新バージョンは `v1.5.0` です。`v1.0.0` から追加された機能の概要は次のとおりです。

### 組み込みヘルパー関数

- `before`
  - 指定パターン、または行数に一致する行より前の文字列を切り出す
- `after`
  - 指定パターン、または行数に一致する行より後ろの文字列を切り出す
- `resolve`
  - Node.js `path` モジュールの `path.resolve` エイリアス（一連のパスを絶対パスに解決）

### 組み込み変数

- `cwd`
  - `scaffdog` 実行時の Current Working Directory
- `document.dir`
  - ドキュメントの入ったディレクトリパス（ほとんどの場合 `.scaffdog`）
- `output.root`
  - 出力先のディレクトリパス

### CLI

- `scaffdog generate` の `--force` フラグ
  - 出力先に既にファイルが存在する場合に、強制的に上書き保存
  - 未指定の場合、基本は確認用 Prompt が表示される

## 既存ファイルへのコード追加

表題の回収です。

追加された機能、及び以前から存在した機能群を用いて、様々なパターンのファイル追加へ対応することができるようになりました。

いくつかのユースケースと共にファイル追加の手法についてまとめておきます。

### ファイル先頭

まずはファイル先頭にテキストを追加したいケースです。これは以前から存在する `read` ヘルパー関数を使うことで実現可能です。

```typescript:template.md
import "./{{ inputs.name }}"; // ファイルの先頭
{{ read output.abs }}
```

`read` ヘルパー関数は、指定したパスに一致するファイルの中身を読み込み展開します。引数に渡すパスは、自身のパスを示す `output.abs` を渡すことが多くなるでしょう。

### ファイル末尾

ファイル先頭のケースとほとんど同様です。

```typescript:template.md
{{ read output.abs }}
export * from "./{{ inputs.name }}"; // ファイルの末尾
```

`read` ヘルパー関数の呼び出し位置と、追記したいテキストの位置が異なるだけです。

### 位置指定

ファイル内の特定の位置にテキストを追加したいケースです。例えば次のファイルが既に存在するとします。

```javascript:server.js
const fastify = require('fastify')();

fastify.register(require('./routes/foo'));

fastify.listen({ port: 3000 });
```

`fastify.register` の呼び出しを追加したいとします。このケースでは、`before` 及び `after` ヘルパー関数が有用です。

```javascript:template.md
{{- read output.abs | define "file" -}}

{{ file | before "fastify.register\(" }}
fastify.register(require('./routes/{{ inputs.name }}'));
{{ file | after "fastify.register\(" -1 }}
```

これまでの例より一気に複雑に見えるので、順を追って整理します。

#### 1. 変数宣言

`read` ヘルパー関数を使うのはさきほども登場した手法です。

```javascript:template.md
{{- read output.abs | define "file" -}}
```

`define` ヘルパー関数は、入力を指定した変数名で保存します。この例では `output.abs` の中身を `file` 変数に入れています。ここまでは特に出力はありません。

#### 2. 特定位置までの内容切り出し

`before` ヘルパー関数は、指定したパターン、または行数と一致する行までの結果を返します。**一致する行は含まれない点** に注意が必要です。

```javascript:template.md
{{- read output.abs | define "file" -}}

{{ file | before "fastify.register\(" }}
```

ここまでの結果を実際にみると次のようになります。

```javascript:server.js
const fastify = require('fastify')();
(空行)
```

最初に現れる `fastify.register(...);` の **1 つ前までの行** が出力されていることがわかります。

#### 3. 特定位置にテキスト追加

追加したいテキストを記述します。ここは特別なことはなく、普段のテンプレートと同じです。

```javascript:template.md
{{- read output.abs | define "file" -}}

{{ file | before "fastify.register\(" }}
fastify.register(require('./routes/{{ inputs.name }}'));
```

ここまでの出力結果は以下。

```javascript:server.js
const fastify = require('fastify')();

fastify.register(require('./routes/<入力内容>'));
```

#### 4. 特定位置以降のテキスト追加

最後に、元のファイルから指定行以降の文字列を加えたら目的が達成できます。

`after` ヘルパー関数は、指定したパターン、または行数と **一致する行以降の結果** を返します。`before` ヘルパー関数同様に一致する行は含まれない点に注意が必要です。

今回のケースでは、一致する行を含む、それ以降の文字列が必要となるため、オフセットを `-1` することで一致する行を含めた結果を返すようにします。

```javascript:template.md
{{- read output.abs | define "file" -}}

{{ file | before "fastify.register\(" }}
fastify.register(require('./routes/{{ inputs.name }}'));
{{ file | after "fastify.register\(" -1 }}
```

最終的な出力結果は次のようになります。

```javascript:server.js
const fastify = require('fastify')();

fastify.register(require('./routes/<入力内容>'));
fastify.register(require('./routes/foo'));

fastify.listen({ port: 3000 });
```

オフセットを用いることで、特定のパターンに一致する行前後の編集が行える仕組みです。

### 複数位置指定

`before` / `after` ヘルパー関数を使うことで、複数位置にテキストの追加が必要なケースをカバーすることができます。

例えば次のファイルが既に存在するとします。

```typescript:index.stories.tsx
import { FooIcon } from './FooIcon';

export default Meta = {
  title: 'icons',
};

export const Default: ComponentStoryObj<any> = {
  render: () => (
    <>
      <FooIcon />
    </>
  ),
};
```

冒頭の `import ` 文、及び `render` 以降に、入力した内容を追加したいとします。

テンプレートは次のようになります。

```typescript:template.md
{{- read output.abs | define "file" -}}

{{ file | before "^$" }}
import { {{ inputs.name }} } from './{{ inputs.name }}';
{{ file | after "^$" -1 | before "</>" }}
      <{{ inputs.name }} />
{{ file | after "</>" -1 }}
```

`before` と `after` ヘルパー関数をパイプで組み合わせて、特定のパターンに一致する行を切り出すことが肝となります。最初の `before` ヘルパー関数に渡している `^$` は、空行を示す正規表現です。

実際に出力される内容は以下。

```typescript:index.stories.tsx
import { FooIcon } from './FooIcon';
import { <入力内容> } from './<入力内容>';

export default Meta = {
  title: 'icons',
};

export const Default: ComponentStoryObj<any> = {
  render: () => (
    <>
      <FooIcon />
      <<入力内容> />
    </>
  ),
};
```

### 行数指定

パターンではなく、決め打ちの行数に追加する場合でも `before` と `after` ヘルパー関数を利用することができます。

```javascript:template.md
{{- read output.abs | define "file" -}}

{{ file | before 3 }}
fastify.register(require('./routes/bar'));
{{ file | after 3 -1 }}
```

## その他のテクニック

scaffdog は出力先を Prompt で選択する機構を持ちます。都度出力先が代わる可能性があるため、出力先を簡潔に固定にする手段がありませんでした。

`resolve` ヘルパー関数、`document.dir` 変数を使うことで、テンプレートを記述している Markdown ファイルからの相対パスで出力先を固定することができるようになりました。

````markdown
# `{{ resolve document.dir "../src/index.ts" }}`

```typescript
// ...
```
````

ある特定のファイルを編集させたいケースで有用となってきます。

## おわりに

既存ファイルへの追加を実現する機能は、これまで「やりたいことの案」としては常に持っていたものでした。

例えば [Hygen](https://github.com/jondot/hygen/) などでは、[テンプレートに対するメタ情報](http://www.hygen.io/docs/templates#injection)を提供することでコード追加が実現できます。scaffdog ではコードブロックがテンプレートになりますが、コードブロックにタイトル以外のメタ情報を自然に付与することは Markdown の表現では難しいと判断しました。

そのため、scaffdog ではテンプレート内のヘルパー関数を利用することで、ファイル追加を実現する手段を提供するような API 設計としました。より良い API の形が浮かんだら改善していきたいですが、しばらくはこちらを使ってみようと思います。

[scaffdog]: https://github.com/cats-oss/scaffdog
