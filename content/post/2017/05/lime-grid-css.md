---
title: 'ブレイクポイント毎に柔軟な調整ができるFlexboxベースのCSSグリッドシステムを作った'
slug: 'lime-grid-css'
date: '2017-05-28'
---

「ブレイクポイント毎にカラム間の余白を変えられるグリッドシステムってなかなか無いな」と思いたち、[lime-grid.css](https://github.com/wadackel/lime-grid.css) という Flexbox ベースの CSS グリッドシステムを公開しました。

{{% image "LIME GRID" "repo-banner.png" %}}

> lime-grid.css  
> https://wadackel.github.io/lime-grid.css/

以降、作った背景や使い方、カスタマイズの方法について書いていきたいと思います。

## 背景

CSS のグリッドシステムは既にかなりの数のフレームワークが公開されています。グリッドシステムに沿ったデザインをコーディングしていく際は、その中から適切に選んだものを使う、という方も多いと思います。

しかし、一般的に使われているものの多くはカラム間の余白 (gutter width) が固定値で、以下の様なデザインの要件によっては使いづらいことも。

{{% image "イメージ" "image.png" %}}

- デスクトップ = `40px`
- タブレット = `30px`
- モバイル = `20px`

それぞれの端末や環境に応じて適切な UI を提供することを念頭に置くと、「レスポンシブだから」といって妥協せずに上記の要件は満たしたいです。

## 設計指針

新たに公開するものでは、上述した要件を満たし、その他細かい不満点を潰せる設計としました。

- Flexbox ベース
  - モダンブラウザの殆どが対応してる
  - 横幅の自動算出、整列位置の設定など柔軟性が高い
- モバイルファーストを基本とする
- ブレイクポイント毎に細かい調整がきく
  - カラム間の余白
  - コンテナサイズ
- 使用者が適宜設定を変更可能に
- 一般的に広く使われてそうな API に寄せる
  - Bootstrap, Flexbox Grid でも使われている構成に近いように
  - `div.row>div.col-**` みたいなイメージ
- PostCSS に組み込みやすい
  - Sass にしようかとも考えたが、最近の流れを見てこちらに
  - 個人的に最近は Sass をほとんど触らないため...
- npm からインストールできるように
  - フロントエンドのリソースはなるべく npm で管理したい

## インストール

他の JavaScript のモジュールと同様に npm で入れることができます。

```bash
$ npm install lime-grid.css --save
# or
$ yarn add lime-grid.css
```

又は [lime-grid.min.css](https://raw.githubusercontent.com/wadackel/lime-grid.css/master/lime-grid.min.css) をダウンロードします。

## 使い方

npm でインストールして、PostCSS な環境の場合は以下のように `@import` します。

```css
@import 'lime-grid.css';
```

ファイルを直接配置している場合は普通に `<link>` で読み込みます。

```html
<link rel="stylesheet" href="/path/to/lime-grid.min.css" />
```

### 基本的な使い方

最も基本となるレスポンシブなグリッドについてです。

```html
<div class="container">
  <div class="row">
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4">...</div>
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4">...</div>
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4">...</div>
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4">...</div>
  </div>
</div>
```

Flexbox Grid を使ったことのある方であれば、違和感なく使い始めることができると思いますが、基本的な構成は以下。

| クラス名                       | 概要                                               |
| :----------------------------- | :------------------------------------------------- |
| `.container`                   | ブレイクポイント毎に幅の可変するレイアウトコンテナ |
| `.row`                         | カラムを内包する行                                 |
| `.col-{xs,sm,md,lg,xl}-[1-12]` | 各カラムでサイズをそれぞれ指定                     |

実際の挙動は[デモ](https://wadackel.github.io/lime-grid.css/)を見ていただきたいのですが、それぞれのブレイクポイントで各カラム間の余白が微妙に変わっていることが分かると思います。  
`10px` 等の小さな変化ではありますが、モバイルの 2 カラムで `30px` は空きすぎだよなぁという場面もあるので、それぞれ変化を付けられるのは重宝します。

~~ただ、全てのブレイクポイントで基本的には余白が変わることが前提となるので、以下のようにカラム指定の省略は不可です。~~

```html
<!-- xs, sm, md, lg, xl の全てのブレイクポイントを指定 -->
<div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4">...</div>

<!-- xs, md, xl のように省略してもOK -->
<div class="col-xs-12 col-md-6 col-lg-4">...</div>
```

~~クラス数の指定が増えてしまうのは気になるので、今後何らかの形で構成を変えるかもしれません。~~

**2017-05-30 追記：**  
あまりに冗長なのが気になったので、上記対応しました。

### デフォルトのグリッド設定

後述する PostCSS からの利用で変更可能ですが、デフォルトでは以下のような設定となっています。

|                     | xs      | sm       | md       | lg       | xl        |
| :------------------ | :------ | :------- | :------- | :------- | :-------- |
| ブレイクポイント    | < 576px | >= 576px | >= 768px | >= 992px | >= 1200px |
| コンテナサイズ      | auto    | 540px    | 720px    | 960px    | 1150px    |
| カラム間余白        | 20px    | 20px     | 30px     | 30px     | 40px      |
| カラム間余白 (外側) | 15px    | 15px     | 15px     | 15px     | 20px      |

### 常に同じカラム数の場合

先程は全てのブレイクポイントに応じてクラス指定が必須、と書きましたが全て同じカラム数が同一の場合はショートハンド指定が可能です。

```html
<div class="container">
  <div class="row">
    <div class="col-2">...</div>
    <div class="col-2">...</div>
    <div class="col-2">...</div>
    <div class="col-2">...</div>
    <div class="col-2">...</div>
    <div class="col-2">...</div>
  </div>
</div>
```

### 均等配置

カラムの数に応じたサイズに自動で調整させます。こういうのは Flexbox ならではな感じがしますね。

```html
<div class="container">
  <div class="row">
    <div class="col">...</div>
    <div class="col">...</div>
    <div class="col">...</div>
  </div>
</div>
```

---

他にも整列位置の調整や、並び順の設定が可能です。詳しくはデモを参照ください。  
https://wadackel.github.io/lime-grid.css/

## カスタマイズ

PostCSS を使ってオプションを変更した状態で使用することができます。

### 必須プラグイン

ビルドには以下のプラグインが必須です。cssnext らへんを使うことで大体揃うような基本的なものだけで動くようにしています。

- [postcss-import](https://github.com/postcss/postcss-import)
- [postcss-custom-properties](https://github.com/postcss/postcss-custom-properties)
- [postcss-calc](https://github.com/postcss/postcss-calc)
- [postcss-custom-media](https://github.com/postcss/postcss-custom-media)

### 推奨プラグイン

必須ではありませんが、ブラウザサポートの観点から以下のプラグインを追加することをおすすめします。

- [postcss-flexbugs-fixes](https://github.com/luisrudge/postcss-flexbugs-fixes)
- [autoprefixer](https://github.com/postcss/autoprefixer)

### 設定値を上書き

基本的な流れは次のようになります。

1. `lime-grid.css` の変数定義を読み込む
1. オリジナルの設定を行い、オーバーライドする
1. `lime-grid.css` のグリッドスタイルを読み込む

一部の変数をオーバーライドする例です。

```css
@import 'lime-grid.css/src/variables.css';

/* Change options */
:root {
  --container-width-xs: auto;
  --container-width-sm: 540px;
  --container-width-md: 720px;
  --container-width-lg: 960px;
  --container-width-xl: 1150px;
}

@import 'lime-grid.css/src/grid-system.css';

/* ...Your stylesheet */
```

変数の詳細は以下のソースコードを参照してください。  
https://github.com/wadackel/lime-grid.css/blob/master/src/variables.css

## 所感

冒頭で書いた「ブレイクポイントでカラム間余白を調整したい」といった要望が、どの程度一般的にあるかは分かりませんが、少なくとも僕はやりたいと思うことが多いため作りました。  
同じような考えを持っている方は是非使ってみてフィードバックいただけると嬉しいです。

バグや機能要望などは [Twitter](https://twitter.com/wadackel) や、[Issues](https://github.com/wadackel/lime-grid.css/issues) までいただければと思います。

---

最後に、配布方法などについて Twitter で迷ってる発言した際に助言をくれた、[@ktsn](https://twitter.com/ktsn)さん、[@wreulicke](https://twitter.com/wreulicke)さんに感謝です。
