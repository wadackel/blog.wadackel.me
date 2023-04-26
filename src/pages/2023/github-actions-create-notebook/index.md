---
title: 'GiftHub Actions の JavaScript アクション実装と公開に関する備忘録'
date: '2023-04-26'
---

## はじめに

先日、GitHub Actions の JavaScript アクションを公開した旨の記事を公開しました。

> [複数リポジトリ間でファイルを同期する GitHub Actions の JavaScript アクションを作った - wadackel.me](/2023/files-sync-action/)

JavaScript アクションを公開するのは 2 回目で、多少なりとも開発に関する勘所が見えてきたので、次回の開発での参考用として自分なりに意識したことや工夫したことをまとめておきたいと思います。

## 前提

本記事では JavaScript アクションの開発を中心とした内容を前提としています。開発に伴う流れは、以下のドキュメントに倣うことが推奨します。

> [Creating a JavaScript action - GitHub Docs](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)

ドキュメントにも記載がありますが、JavaScript 及び TypeScript のアクション向けテンプレートリポジトリが存在するため、こちらを利用することが手っ取り早く開発に入ることができます。以下は TypeScript 向けのテンプレートリポジトリ。

> [GitHub - actions/typescript-action: Create a TypeScript Action with tests, linting, workflow, publishing, and versioning](https://github.com/actions/typescript-action)

前回の開発では、個人的な好みにより上記テンプレートを利用することはなかったのですが、大枠の構成は踏襲しています。この記事では TypeScript テンプレートに近い構成を前提とします。

また、記事全体を通じて **2023 年 4 月時点での情報** である点にご注意ください。

## 実装

直接的に実装に関わる部分とその準備、その他ビルドやテストに関する事柄についてまとめます。

### メタデータの準備

アクションのメタデータとして `action.yml` を作成する必要があります。指定するべき値については、以下のドキュメントを参照します。

> [Metadata syntax for GitHub Actions - GitHub Docs](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions)

他のアクションでは、どのような値がどのように指定されているか参考にしたい場合、[actions](https://github.com/actions) Organization のリポジトリ群や、Awesome 系のリポジトリからいくつか見てみるのが良いかもしれません。

- [actions/checkout](https://github.com/actions/checkout)
- [actions/stale](https://github.com/actions/stale)
- [actions/cache](https://github.com/actions/cache)
- [actions/labeler](https://github.com/actions/labeler)
- [sdras/awesome-actions](https://github.com/sdras/awesome-actions)

アクションの I/F を早期に固めることと、Workflow として実際に GitHub Actions で動作させる上でも序盤に必須のフィールドだけでも埋めておきたいです。

ちなみに Marketplace にアクションを公開する際は `name` フィールドに記述する名前はユニークである必要があります。[^2]

[^2]: この仕様に気付かず `owner/repo` でユニークであればよいと勘違いして痛い目を見ました。。

### 有用なパーケージ群

JavaScript アクションの開発をする上で有用となるのが [@actions/core](https://github.com/actions/toolkit/tree/master/packages/core) パッケージで、Inputs や Outputs の処理、Logging などの処理を適切に行うための関数群を提供します。これはほぼ全てのアクションで必須と言えるかと思います。

また、アクションとして何をさせるかにもよりますが、多くの場合で GitHub API を利用することになるため [octokit.js](https://github.com/octokit/octokit.js/) を GitHub Actions の実行環境に適した形でラップした [@actions/github](https://github.com/actions/toolkit/blob/master/packages/github) も有用です。

その他、GitHub Actions Toolkit のパッケージ群は有用なものが多いため開発時には一度目を通しおきたいです。

> [toolkit/README.md at master · actions/toolkit · GitHub](https://github.com/actions/toolkit/blob/master/README.md#packages)

### シークレットのマスク

アクションの処理によっては、アクション内でシークレットを生成することがあるかと思います。それらは `@actions/core` が提供する `setSecret` 関数を用いて、適切に値をマスクしてあげることを忘れないようにしたいです。

```typescript
import * as core from '@actions/core';

const generatedSecretValue = '...';

core.setSecret(generatedSecretValue);
```

生成したシークレットを意図せずログに出力してしまった場合などに、シークレット本体が漏洩しないように気をつける必要があります。

### ビルド

公式のテンプレートでは [@vercel/ncc](https://github.com/vercel/ncc) を利用して、JavaScript あるいは TypeScript で記述されたソースコードを単一のファイルへとコンパイルします。基本的には `@vercel/ncc` を利用することがベターですが、ビルド周りは個人的な好みにより若干手を加えておきたいです。

TypeScript テンプレートでは、一度 `tsc` で `lib` ディレクトリへとビルドファイルを出力し、ビルドされたファイルを対象に `@vercel/ncc` を利用してコンパイルするような流れになっています。ref: [package.json](https://github.com/actions/typescript-action/blob/3cba8bfd13c5d91e07b576d5af543e5ba5f01614/package.json#L8-L12)

```json{3,7}:package.jsonの一部抜粋
{
  "scripts": {
    "build": "tsc",
    "format": "prettier --write '**/*.ts'",
    "format-check": "prettier --check '**/*.ts'",
    "lint": "eslint src/**/*.ts",
    "package": "ncc build --source-map --license licenses.txt",
    "test": "jest",
    "all": "npm run build && npm run format && npm run lint && npm run package && npm test"
  }
}
```

`@vercel/ncc` は TypeScript にも対応しているため、`ncc build` のみへと変更します。

```json{3,8}:改修後のpackage.json例
{
  "scripts": {
    "build": "ncc build src/main.ts --source-map --license licenses.txt",
    "format": "prettier --write '**/*.ts'",
    "format-check": "prettier --check '**/*.ts'",
    "lint": "eslint src/**/*.ts",
    "test": "jest",
    "all": "npm run build && npm run format && npm run lint && npm test"
  }
}
```

一度 `lib` ディレクトリが中間的に作られることの必要性をあまり感じなかったため、このような変更を加えています。

また、2023 年 4 月時点で利用できるアクションの Node 実行環境は `node16` が最新で ESM に対応しているバージョンであるため、最初から ESM で実装しておけると利用するパッケージによるトラブルを早期に対処できるかもしれません。

```json
{
  "type": "module"
}
```

### テスト

ユニットテストは普段の開発と変わらず行うことができます。TypeScript テンプレートでは [jest](https://github.com/jestjs/jest) を利用していますが、前述した ESM を前提とすると [vitest](https://github.com/vitest-dev/vitest) を利用する方が楽にテストができるかもしれません。これは完全に個人的な好みで良さそうです。

アクションとしての挙動を実際の Workflow で動かしてみるには、公式ドキュメントの [Example using a private action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#example-using-a-private-action) が参考となります。ビルド成果物を `dist` に含んだ前提で push することで動作を確認することができるようになるはずです。

```yaml:.github/workflows/main.yml
on: [push]

jobs:
  hello_world_job:
    runs-on: ubuntu-latest
    name: A job to say hello
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Hello world action step
        uses: ./ # `action.yml` の存在するローカルディレクトリを指す
        id: hello
        with:
          who-to-greet: 'Mona the Octocat'
      - name: Get the output time
        run: echo "The time was ${{ steps.hello.outputs.time }}"
```

次に、リモートリポジトリに push する前に、ローカルで動作検証したいケースについてです。

[wadackel/files-sync-action] では、ローカル実行用のスクリプトを用意してコンパイル後のファイルを呼び出す手法をとりました。アクションとして動作させる上で `inputs` に渡る値のエミュレートが必要でしたが、これは環境変数に値を入れることで対応しています。

[アクションメタデータのドキュメント](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#inputs) にも記載のあるとおり、`inputs` に渡した値は `INPUT_<VARIABLE_NAME>` という環境変数に設定されます。スペースは `_` で埋められた後、変数名が大文字に変換されます。`inputs` に指定した変数とそれに対応する環境変数は次の関係性となるはずです。

| オリジナル | 環境変数名      |
| :--------- | :-------------- |
| `fooBar`   | `INPUT_FOOBAR`  |
| `foo-bar`  | `INPUT_FOO-BAR` |
| `foo_bar`  | `INPUT_FOO_BAR` |
| `foo bar`  | `INPUT_FOO_BAR` |

これらを加味して、`inputs.github_token` という入力を期待するアクションの場合、次のようなスクリプトで実装したアクションをローカルで動作させることができます。

```javascript:test.js
process.env['INPUT_GITHUB_TOKEN'] = '...';
process.env['GITHUB_REPOSITORY'] = 'local/test'; // この辺は必要に応じて
await import('./dist/index.js');
```

試せてないですが、[act](https://github.com/nektos/act) を使うことでこのへんうまく検証できるのかもしれません。(要検証)

## 公開

Marketplace への公開とその準備についてまとめます。

### ドキュメンテーション

アクションのメタデータである `action.yml` を書き切ります。

README にはアクションの使い方を示す Usage、入出力を示す Inputs/Outputs、制限事項があれば Limitations などは最低限欲しいです。

Inputs/Outputs に関しては、多くのケースで `action.yml` に記述された内容を転記することで事足りるかと思います。僕は何度か `action.yml` を書き換えながら内容を追従させることが続き、この作業が辛かったため [gha-docgen] というツールを作成しドキュメントを自動生成させる方針としました。

[gha-docgen] の利用イメージについて、かなり簡素化したものですが次の `action.yml` があった場合を例に紹介します。

```yaml:action.yml
name: 'DEMO Action'
description: 'Here is an example of Action Metadata description. This is a description used in gha-docgen Usage.'
author: 'wadackel'

inputs:
  github_token:
    description: 'The GitHub token.'
    required: true

runs:
  using: 'node16'
  main: 'dist/index.js'
```

`README.md` に `action.yml` の内容を記述させたい箇所に `<!-- gha-***-(start|end) -->` のコメントアウトを入れます。

```markdown:README.md
# DEMO Action

badge...

<!-- gha-description-start -->
<!-- gha-description-end -->

## Inputs

Overview of Inputs.

<!-- gha-inputs-start -->
<!-- gha-inputs-end -->

## LICENSE

license...
```

コメントアウトを記述したら、`gha-docgen` を呼び出します。

```bash
$ npx gha-docgen
```

実行が完了すると `action.yml` に記述された内容がコメントアウトの範囲に挿入されます。

```markdown:README.md
# DEMO Action

badge...

<!-- gha-description-start -->
Here is an example of Action Metadata description. This is a description used in gha-docgen Usage.
<!-- gha-description-end -->

## Inputs

Overview of Inputs.

<!-- gha-inputs-start -->
### `github_token`

**Required:** `true`
**Default:** n/a

The GitHub token.
<!-- gha-inputs-end -->

## LICENSE

license...
```

ちょっとしたことですが、楽できるところは楽したいです。

### バージョニング

GitHub Actions では例えば `v1.2.3` というタグに対して、メジャー番号のみを切り取ったバージョンである `v1` をエイリアスとして追従させるようなバージョニングを推奨しています。

[公式のドキュメント](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github) に従えば必要十分ではあるのですが、手動でのリリースは億劫なのでできれば自動化しておきたいところです。

まだまだ工夫の余地があるような気はしつつ、[wadackel/files-sync-action] で採用したリリースフローは次のとおりです。

- [semantic-release](https://github.com/semantic-release/semantic-release) や [changesets](https://github.com/changesets/changesets) などのバージョニングマネージャを利用し、タグとリリースを作成
  - 該当アクションでは `semantic-release` を採用
- [nowactions/update-majorver](https://github.com/nowactions/update-majorver) を利用し、メジャー番号を自動追従

`nowactions/update-majorver` を利用するにあたって、ドキュメントに記載がなかった点について補足です。

デフォルトで提供される `secrets.GITHUB_TOKEN` を利用する場合、リポジトリの Actions に関する設定から、Workflow permissions を `Read and write permissions` に設定するか、各 Workflow や Job 単位で指定できる `permissions` から `contents: write` を設定する必要があります。

多くの場合 `secrets.GITHUB_TOKEN` に与える Permission は最小限であるに越したことはないため、後者の設定で対応する方向が良いかと思います。

```yaml{10-11}:.github/workflows/update-major-version.yml
name: Update Major Version Tag
on:
  push:
    tags:
      - 'v*'
jobs:
  update-majorver:
    name: Update Major Version Tag
    runs-on: ubuntu-20.04
    permissions:
      contents: write
    steps:
      - uses: nowactions/update-majorver@f2014bbbba95b635e990ce512c5653bd0f4753fb # v1.1.2
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### ワークフロー

テストの実行、ビルドや Lint など通常の開発で用いる Job は普段と同じように設定します。

JavaScript アクションを開発する上で特筆して注意すべき点は、成果物が push できているかを検証しておく必要がある点です。公式のテンプレートを参考にしつつ、コンパイル結果と push された内容の間で差分がないことを確認するステップの例です。

```yaml:.github/workflows/ci.yml
- run: pnpm build
- name: Compare the expected and actual dist/ directories
  run: |
    if [ "$(git diff --ignore-space-at-eol dist/ | wc -l)" -gt "0" ]; then
      echo "Detected uncommitted changes after build.  See status below:"
      git diff
      exit 1
    fi
```

また、[wadackel/files-sync-action] では [gha-docgen] を使いドキュメントの一部を自動生成しているため、ドキュメントにも差分がないかを確認したりしています。

### Marketplace への公開

動作確認を行い、問題なさそうならリポジトリ上部に表示されるボタンを選択後、表示される画面に従い Marketplace へ公開します。簡単に公開できるので便利ですね。

## おわりに

JavaScript アクションを開発する上で、自分なりの工夫や意識している点についてまとめました。まだ凝ったアクションを開発したわけではないので、浅い内容になってしまった感がありますが、今後の開発で気づいた点があれば追記したいと思います。

もし記載した内容について「こんな方法もあるぞい」なポイントがあれば [Twitter](https://twitter.com/wadackel) などで教えてくださると幸いです。

[wadackel/files-sync-action]: https://github.com/wadackel/files-sync-action
[gha-docgen]: https://github.com/wadackel/gha-docgen
