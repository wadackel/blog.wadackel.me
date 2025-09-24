---
title: 'Storybook Vitest addonで安定したVisual Regression Testingを行うためのnpm packageを公開した'
date: '2025-09-24'
---

## はじめに

以前、[Storybook Test runner](https://github.com/storybookjs/test-runner)（以降 Test runner） で Visual Regression Testing（以降 VRT） を安定化するための取り組みについて以下の記事を公開しました。

https://zenn.dev/knowledgework/articles/297ccfb866a5b5

この記事で記載している構成を実現する過程で、[storycap-testrun](https://www.npmjs.com/package/storycap-testrun) というライブラリを作成していました。このライブラリは、Test runner での VRT を安定化するために、描画の完了待機やスクリーンショット画像撮影時の各種調整機能を提供していました。

今回、新たに [@storycap-testrun/browser](https://github.com/reg-viz/storycap-testrun/tree/main/packages/browser) という [@storybook/addon-vitest](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon) を利用するテスト実行時にスクリーンショット画像を撮影するための npm package を公開しました。

この記事では、公開した package のモチベーションや仕組み、簡単な使い方についてまとめます。また、従来作成していた `storycap-testrun` に対しても変更が入ったため、それについても言及します。

## モチベーション

今年（2025年）の6月に Storybook から以下のブログが公開されました。

https://storybook.js.org/blog/storybook-9/

また、7月末には以下のブログが公開されました。

https://storybook.js.org/blog/component-test-with-storybook-and-vitest/

これらのブログでも述べられている通り、[Vitest](https://vitest.dev) の高速なテスト実行と組み合わせたコンポーネントテストが公式にサポートされるようになりました。そして、気付いたら Test runner の公式ドキュメントでも、`@storybook/addon-vitest` が推奨されるようになっていました。

https://storybook.js.org/docs/writing-tests/integrations/test-runner

> The test runner has been superseded by the Vitest addon, which offers the same functionality, powered by the faster and more modern Vitest browser mode. It also enables the full Storybook Test experience, allowing you to run interaction, accessibility, and visual tests from your Storybook app.
>
> If you are using a Vite-powered Storybook framework, we recommend using the Vitest addon instead of the test runner.

前述した通り `@storybook/addon-vitest` は推奨されたテスト実行の手段ではあるものの、安定した VRT を実現するにあたって必要な機能に関してはほとんど提供されません。基本的に portable stories への変換後、Vitest Browser Mode で Story のスモークテストや `play` 関数の実行を行ってくれるに留まります。もちろん `play` 関数が待機されるため、一定の安定化は図りやすいと言えますがそれでも十分ではありません。

Test runner では `waitForPageReady` が提供されていたため、もう少し VRT の安定化を図りやすかったと感じます。`@storybook/addon-vitest` を利用する場合は細々とした工夫を取り入れるために、必要に応じて自前で各々実装を行う必要があります。

`@storybook/addon-vitest` は Vitest の Browser Mode と組み合わせて実行するため、Node.js での動作を前提とした従来の `storycap-testrun` はそのままでは使えません。Vitest Browser Mode でも動作するさせるにはどうしたらよいか、調査や実装が手間に感じてなかなか手をつけられていませんでした。しかし、検証を進めていく中で対応方針も見えてきたので `storycap-testrun` の `@storybook/addon-vitest` 対応作業を進めることにしました。

## 仕組み

Vitest Browser Mode での動作を前提とした `@storycap-testrun/browser` の仕組みについて簡単に説明します。

基本的には `@vitest/browser/context` から利用可能な `page` インスタンスを介して `screenshot` メソッドを呼び出しているだけです。これに、`storycap-testrun` が従来提供していた描画の完了待機判定や、カスタマイズ可能な [Hook の機能](https://github.com/reg-viz/storycap-testrun/tree/main/packages/browser#hooks) を追加しています。Hook はアプリケーション独自の待機処理などを介入させることのできる口となります。

描画の完了待機判定については従来の `storycap-testrun` では [storycap](https://github.com/reg-viz/storycap) で行っている手法と似た形で、Chromium 限定で[Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)（CDP）を利用したパフォーマンスメトリクスの監視を行っています。具体的には、bounding-box の再計算回数や DOM Node の数をみて描画が安定しただろうタイミングを推測してスクリーンショットを撮影します。`@vitest/browser/context` では `cdp` 関数を介して CDP へアクセスできるため、この機能も実現できています。

また、`afterEach` などの Test API を通じて渡ってくる `context` には、`story` の情報や実行対象となっているファイル名が含まれています。`context` から得ることのできる Story の情報などを用いてファイル名の決定などを行います。ファイル名の決定ロジックには、一部 Node.js での実行が必要な処理があるため、[Commands API](https://vitest.dev/guide/browser/commands.html) を使った拡張を行っています。そのため Vitest Plugin のセットアップを必要とします。

余談ですが、`@vitest/browser/context` から利用できる `page` の `screenshot` メソッドも、内部的には Commands API を活用した実装[^1]となっています。

[^1]: [該当のソースコード](https://github.com/vitest-dev/vitest/blob/6acdc3a5eda66a2e0bf600427ee82e99a297180c/packages/browser/src/client/tester/context.ts#L302-L314)。そもそも `screenshot` をどうやってブラウザプロセスで動かしているんだろう、と気になって調べ始めたことで対応の道筋が立ちました。

原則、従来の `storycap-testrun` とほぼ同等の機能提供を行うことを目指しましたが、動作する環境が異なったり依存する package が異なることから、完全な共通化は難しい部分がありました。そのため泣く泣く npm package を分割することとしました。

とはいえ、`@storycap-testrun/browser` と従来の `storycap-testrun` では多くの共通ロジックが存在するため、`@storycap-testrun/internal` という内部向けの package に多くの実装を集約しています。これにより、重複した実装を避けつつそれぞれの環境に最適化された機能を提供できるようにしています。

## セットアップ

ここまでで `@storycap-testrun/browser` の作成背景や簡単な仕組みについて述べました。実際に利用する際の最小限のセットアップについてまとめておきます。より詳細な設定については [README](https://github.com/reg-viz/storycap-testrun/tree/main/packages/browser) をご確認ください。

以降の手順では、`@storybook/addon-vitest` をはじめとした Storybook 側の設定は完了していることを前提とします。適宜以下のドキュメントを参照するのが確実です。

https://storybook.js.org/docs/writing-tests/integrations/vitest-addon

`@storycap-testrun/browser` をインストールします。

```bash
npm install --save-dev @storycap-testrun/browser
```

Vitest の設定ファイルにて、`@storycap-testrun/browsewr/vitest-plugin` から export される Plugin を設定します。

```typescript{5,15-17}:vitest.config.ts
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import storycap from '@storycap-testrun/browser/vitest-plugin';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(path.dirname(fileURLToPath(import.meta.url)), '.storybook') }),
          storycap({
            // options
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
```

デフォルトでは `__screenshots__/{Storyのファイルパス}/{Story名}.png` のようなパスへスクリーンショット画像が保存されます。オプションで保存先を変更することができます。

あとは `@storycap-testrun/browser` から export される `screenshot` を利用するだけです。引数には `@vitest/browser/context` から `page` を、`afterEach` のコールバック関数で渡ってくる `context` を渡します。

```typescript{5,11-13}:.storybook/vitest.setup.ts
import { afterEach, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import { screenshot } from '@storycap-testrun/browser';
import * as projectAnnotations from './preview';

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

afterEach(async (context) => {
  await screenshot(page, context, {
    // options
  });
});
```

setup file の `afterEach` で `screenshot` を実行することですべての Story に対してスクリーンショット画像を撮影することができます。あとは Storybook のセットアップ状況に併せて Vitest を実行するだけです。

```bash
vitest --project=storybook
```

また、起動した Storybook へブラウザからアクセスし、UI 上から個別に Story のテストを実行してもスクリーンショット画像は撮影されます。

![Storybook の UI からテスト実行している様子](./demo.gif)

## VRT の実装例

以下のリポジトリで `@storycap-testrun/browser` と [reg-viz/reg-actions](https://github.com/reg-viz/reg-actions) を組み合わせた VRT の導入例を実装しました。ベースはこの記事に書いた内容と、Storybook のドキュメントを参照したセットアップで最小構成です。

https://github.com/wadackel/storycap-testrun-browser-example

`reg-viz/reg-actions` では GitHub Actions 単体で VRT が実装できます。このブログの実装でも活用していますが、GCS や S3 などの外部ストレージを用意することなく VRT が実装可能であるためセットアップが容易です。`reg-viz/reg-actions` の詳細は [@bokuweb](https://x.com/bokuweb17) さんの記事を参照ください。

https://zenn.dev/fraim/articles/e020e82985ac6d

余談ではありますが、Agentic Coding の成果物として UI が存在する場合、VRT があると入念な動作検証を人間が行わなくても一定の安心感を得やすいです。ただ、VRT 導入はセットアップが大変だったり一定の金銭的費用を必要とするケースも多いと思います。実装例に示した構成は、金銭的にも作業負荷的にも低いハードルで VRT が導入できるため中規模程度のプロジェクト[^2]、かつ Agentic Coding を活用するプロジェクトでおすすめです。

[^2]: 例えば数千枚を超えるような VRT 実行環境の場合は、[reg-suit](https://github.com/reg-viz/reg-suit) をはじめ別のツールを個人的には採用しています。

## storycap-testrun v1からv2への移行

ここまでメインで触れてきた `@storycap-testrun/browser` の公開に合わせて、従来の `storycap-testrun` に対する扱いにも変更が発生しています。重要な変更点の概要をまとめます。

### package 名の変更

最も大きな変更は対象の package 名が変更されたことです。

|            | npm package              |
| :--------- | :----------------------- |
| **Before** | `storycap-testrun`       |
| **After**  | `@storycap-testrun/node` |

対象 package をインストール後、import path を変更するだけで基本的な部分は動くはずです。

```typescript
// Before
import { screenshot } from 'storycap-testrun';

// After
import { screenshot } from '@storycap-testrun/node';
```

### その他の変更点

package 名変更の他にいくつか細かい点で Breaking Changes が含まれています。

- **Storybook v7 のサポートを終了**: Storybook v8 以降での利用を前提としています
- **Hook API の変更**: `postCapture` フックで受け取れる情報が変更されています。以前は画像の `Buffer` も含まれていましたが、現在はファイルパスのみとなっています
- **設定項目の削除**: `output.dry` オプションが削除されています

移行作業を行う必要がある場合は [MIGRATION.md](https://github.com/reg-viz/storycap-testrun/blob/main/MIGRATION.md) も参照ください。実際の移行作業は多くの場合 package 名の変更が主な作業となるかなと思います。

## おわりに

`@storybook/addon-vitest` を利用する環境でも、安定した VRT を楽に実現するために新たに npm package を公開しました。メンテナンスついでに [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) にも対応しました。

従来の Test runner と比較して、Vitest を使った手法ではセットアップや実行が楽になった一方で、VRT の安定化に必要な機能が不足していました。`@storycap-testrun/browser` によってそのギャップを埋めることができるようになりました。

まだ公開後きちんと使い倒せていないので、不具合があったらごめんなさい。もし何かお気づきの点があれば、[GitHub Issues](https://github.com/reg-viz/storycap-testrun/issues) や [X](https://x.com/wadackel) で優しく教えていただけると嬉しいです。
