---
title: 'Puppeteerを使ったStorybookの自動スクリーンショット撮影用のアドオンを作った'
slug: 'storybook-chrome-screenshot'
date: '2017-08-26'
image: ''
---

[storybook]: https://github.com/storybooks/storybook
[puppeteer]: https://github.com/GoogleChrome/puppeteer

先日、[Storybook][storybook] のストーリーを、[Puppeteer][puppeteer] を使って自動でスクリーンショットを撮影する Addon を作りました。まだ React のサポートのみだったり、API がまだ不十分だったりしますが、簡単に使い方と仕組みについて紹介していきたいと思います。

## はじめに

まず、[Puppeteer][puppeteer] が何者かという点は、以下の記事が大変参考になるため、ここでは触れません。

> [--headless 時代の本命？ Chrome を Node.js から操作するライブラリ puppeteer について - Qiita](http://qiita.com/Quramy/items/26058e83e898ec2ec078)

今回作った Addon は、上記 [Puppeeer][puppeteer] を使って、任意のストーリーのスクリーンショットを取るためのものになります。  
スクリーンショットを取るためのモチベーションは色々と考えられますが、ここでは開発時に使用している既存のストーリーを活用して、**最小限の労力**で Visual Testing の可能な状態に持ち込むことです。もっと言うと個人的に気になっている [reg-viz](https://github.com/reg-viz) を活用するためです。

## 作ったもの

![デモンストレーション]({{% image "demo.gif" %}})

> tsuyoshiwada/storybook-chrome-screenshot  
> https://github.com/tsuyoshiwada/storybook-chrome-screenshot

`storybook-chrome-screenshot` というまんまの名前の Addon を作りました。  
ローカルで動作させてみると、上記のアニメーションのようにスクリーンショットが生成されます。

## 使い方

基本は他の Addon と同じような API なので、何らかの Addon を導入したことがあれば難しくないと思います。  
冒頭にも書きましたが、`@storybook/react` で動作させる前提で使い方について紹介します。

### インストール

```bash
$ npm install --save-dev storybook-chrome-screenshot
```

### Addon の登録

```javascript:.storybook/addons.js
// Other addons...
import 'storybook-chrome-screenshot/register';
```

### ストーリーの編集

`Button` コンポーネントのスクリーンショットを撮影する例です。`withScreenshot()` という関数を使用します。撮影時の Viewport や、撮影するまでの遅延ミリ秒 (delay) をオプションとして渡すことができたりしますが、詳しくは README をご確認ください。

```javascript
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withScreenshot } from 'storybook-chrome-screenshot';
import Button from './Button';

storiesOf('Button', module).add('with text', withScreenshot()(() => <Button>Text</Button>));
```

`withScreenshot()` を使用していないストーリーはスクリーンショット撮影の対象から外れます。これは実行速度の壁があるので、使用者が必要なものだけを選べるための設計となってします。

### スクリーンショット撮影用コマンドの実行

`package.json` の `scripts` に 以下のようにして `screenshot` を追加します。

```json:package.json
{
  "scripts": {
    "screenshot": "storybook-chrome-screenshot -p 9001 -c .storybook"
  }
}
```

ポートや設定ファイルのディレクトリ指定は、Storybook 側の指定と合わせる必要があります。ここで渡したパラメータを元に Storybook を起動するためです。

### コマンドの実行

ここまで来たら、以下のコマンドを実行することで、デフォルトでは `__screenshots__` というディレクトリにスクリーンショット画像が保存されていきます。

```bash
$ npm run screenshot
```

## 仕組み

`storybook-chrome-screenshot` では、与えられたパラメータを元に Storybook 起動のコマンドを子プロセスで実行し、起動したサーバに対して Puppeteer を使ってアクセスするという方法をとっています。かなり簡単な仕組みなので、実装したコードは今のところかなりシンプルなものになっています。

また、使い方にも書きましたが、Storybook のストーリーとして作成した全てのコンポーネントを撮影対象にはせず、`withScreenshot` でラップした任意のコンポーネントを対象としています。対象を一部のコンポーネントに絞るためには、何らかの方法で実行側 (Puppeteer) にクライアント (Storybook) から通知する必要があります。

今回はざっくりと以下のような形式で実行側とクライアントでやりとりを行ってみました。

1. Storybook の `setStories` イベントをフックして全てのストーリーを取得
1. `withScreenshot` でラップされたコンポーネントを取得
1. 取得結果を Puppeteer 側で予めエクスポートしていた関数へフックして通知
1. それぞれのストーリーへ Puppeteer が順にアクセス
1. コンポーネント側で準備が完了したことを通知 (画像読み込みと delay 待ち)
1. 準備が出来たらスクリーンショットを撮影
1. 4 に戻って繰り返す

## おわりに

まだ CI で動作させたり、といった実際の運用を見越した検証が不十分です。もし実際に使ってみたよ！という方がいて問題や機能改善について何かあれば [Issues](https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues) や [PR](https://github.com/tsuyoshiwada/storybook-chrome-screenshot/pulls) お待ちしています。
