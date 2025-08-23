---
title: 'Hugo から Gatsby への移行と、やりたかったこと'
date: '2020-08-16'
---

## はじめに

このブログが採用している静的サイトジェネレータ (以降 SSG) を [Hugo](https://gohugo.io) から [Gatsby](https://www.gatsbyjs.org) へと移行しました。この記事では移行したいと思うに至ったモチベーションや、移行するなかでやりたかったことについて書いていきたいと思います。

## 移行理由

そもそもの前提として Hugo に対して、強い不満があった訳ではありません。欲しい機能は大抵揃っているし、ビルドも高速で快適です。ただ、**Markdown から HTML へ変換する際に細かい拡張が難しい**、それ一点の理由で移行を決めました。

例えば、コードブロックにタイトルを付けたい場合、以下のような記法でタイトルを付けることのできるサービスは幾つかあるかと思います。

````markdown:コードブロックの例
```javascript:タイトルを入力したい
const msg = 'hello';
console.log(`${msg} world`);
```
````

これまでブラウザに読み込ませる JavaScript 側でなんとか実現していましたが、どこか釈然としない部分がありました。他にも `<img />` に対して `loading` 属性を付けたい場合 Hugo の [Shortcode](https://gohugo.io/content-management/shortcodes/) と言われる機能を使用して、実現していたりしました。

なくてもなんとかなっていたような部分の不満ではあるのですが、少しでも改善できるのならさくっとやってしまうかぁという理由からの移行です。

## なぜ Gatsby ?

SSG として利用できるツールは多く存在します。最近だと Gatsby はもちろん、[Next.js](https://nextjs.org) も利用されることが多いようです。

このブログで Gatsby を利用することに決めた理由は以下のとおりです。

- Markdown -> HTML の変換に [remark](https://github.com/remarkjs/remark) を使用することができ、拡張が楽そう
  - 前述したような拡張ができるのであれば移行理由に沿っている
  - 拡張容易性の背景としてプラグイン機構が整備されている点が挙げられる
- Official、Community 共に多くのプラグインが存在し、欲しい機能の導入が楽そう
- Next.js は仕事で使ったことがあり、使い勝手がある程度分かっている
  - Gatsby はまともに使ったことがない
  - せっかくなら使ったことのないものを使ってみたい

移行先は決めたとき、「**Hugo と比べるとビルド速度が遅いんじゃないか?**」という点が気になったのですが、このブログはそれほど記事数も無い (年間で 10 記事前後しか書けてない) のでスルーすることにしました。

## Markdown から HTML への変換を拡張する

Gatsby の一般的な導入、プラグイン機構についてはここでは触れません。

Gatsby を使って Markdown ファイルをページとして扱う場合、[gatsby-transformer-remark](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) を使うことが多いかと思います。これを使っている場合、Markdown から HTML への変換を拡張することは容易に行えます。

[gatsbyjs/gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog) を見る限り以下のようなプラグインが使われています。

- [gatsby-remark-images](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-images)
- [gatsby-remark-responsive-iframe](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-responsive-iframe)
- [gatsby-remark-prismjs](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-prismjs)
- [gatsby-remark-copy-linked-files](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-copy-linked-files)
- [gatsby-remark-smartypants](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-smartypants)

拡張したい内容に則したプラグインが存在していれば、そちらを使うのが良いでしょう。もし存在しないようなら、これらの実装を参考にすればよいかと考えていました。ところが Gatsby のドキュメントを眺めていると [Creating a Remark Transformer Plugin](https://www.gatsbyjs.com/tutorial/remark-plugin-tutorial/) というページが用意されており、やりたいことズバリそのものが記載されていました。

Hugo ではできなかった (少なくとも僕はやり方が分からなかった...) けど、やりたかったことの一つとして、`<table />` の横スクロールに対応するために `<div />` でラップする、というものが簡単そうなので手始めに対応しました。以降、これを題材に拡張方法をまとめます。

### Local Plugin の作成

Gatsby には [Local Plugin](https://www.gatsbyjs.com/docs/creating-a-local-plugin/) という仕組みがあり、`plugins` ディレクトリに配置した npm package (`"private"` フィールドは`true` でも OK) がプラグインとして利用できるようです。

```text
blog/
├─gatsby-config.js
└─plugins/
  └─gatsby-remark-table/ # 作ろうとしている Local Plugin
    ├─index.js
    └─package.json
```

`gatsby-remark-table` パッケージとして実装します。`package.json` は最低限の内容だけ記述しました。

```json:package.json
{
  "private": true,
  "name": "gatsby-remark-table",
  "main": "index.js"
}
```

そして `gatsby-transformer-remark` のプラグインとして利用したいため、`gatsby-config.js` の中で `options.plugins` にパッケージ名を指定します。

```javascript:gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: ['gatsby-remark-table'],
      },
    },
  ],
};
```

### Remark Transformer Plugin 本体の実装

プラグインの本体となる `index.js` は、Remark Transformer Plugin として実装を行います。

やることは非常に単純で、Markdown ファイルのパース結果である AST を受け取り、AST を返す関数を実装するだけです。

```javascript:プラグインの最小構成
module.exports = ({ markdownAST }) => {
  // markdownAST をあれこれするだけ
  return markdownAST;
};
```

ここで渡ってくる `markdownAST` は [mdast](https://github.com/syntax-tree/mdast) 仕様のものです。これは [unist](https://github.com/syntax-tree/unist) (Universal Syntax Tree) を拡張した仕様で、unist のエコシステムを利用することができるようになっています。

前述したドキュメントでは [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) を利用しており、これを使うことでノードの探索が楽になります。

```bash:npmからインストール可能
$ npm i -D unist-util-visit
```

mdast では Markdown で記載したテーブルを以下の定義としています。

```text:Tableノードの定義
interface Table <: Parent {
  type: "table"
  align: [alignType]?
  children: [TableContent]
}
```

これを `unist-util-visit` を使って探索すると次のように書けます。

```javascript:unist-util-visitの利用
const visit = require('unist-util-visit');

module.exports = ({ markdownAST }) => {
  // 第二引数に `type` フィールドの値を指定することができる
  visit(markdownAST, 'table', (node) => {
    // node = table node
  });

  return markdownAST;
};
```

あとは必要なロジックを実装するだけです。

今回はテーブルを `<div />` でラップするだけなので非常にシンプルです。一度 Table のノードを HTML に変換し、スタイリングに使用するクラス名を振ったラッパーに含めました。

```javascript:gatsby-remark-tableの実装
// 追加で mdast を HTML に変換するための
// 諸々をインストール、利用しています
const unified = require('unified');
const remark2rehype = require('remark-rehype');
const html = require('hast-util-to-html');
const visit = require('unist-util-visit');

module.exports = ({ markdownAST }) => {
  visit(markdownAST, 'table', (node) => {
    // Table ノードを HTML 文字列に変換し
    const table = html(unified().use(remark2rehype).runSync(node));

    // HTML ノードに変換してしまう
    node.type = 'html';

    // `div.table-wrapper` で囲えば完了
    node.value = `
      <div class="table-wrapper">
        ${table}
      </div>
    `;
  });

  return markdownAST;
};
```

拡張方法がわかれば、あとは必要なところを自分の好きなように変更するだけです。

## その他の拡張

このブログではあと 2 つ独自の拡張を行いました。せっかくなので、やったことだけを簡単にまとめてみます。

### img に loading 属性を付与

Markdown 中に書いた以下のような画像に対して

```markdown:変換前
![alt](https://example.com/path/to.png)
```

`loading` 属性に `lazy` を指定するだけの拡張を行っています。

```html:変換後
<img alt="alt" src="https://example.com/path/to.png" loading="lazy" />
```

Local Plugin として実装し終わったあとに全く同じことができる [gatsby-remark-images-native-lazy-load](https://github.com/QingpingMeng/gatsby-remark-images-native-lazy-load) というプラグインの存在を知りました。残念。

### コードブロック

やりたかったこととして以下のものがありました。

- [Prism](https://prismjs.com/) を使った Syntax Highlight
- コードのコピー機能
- タイトルの指定

これら全て、実現するためのプラグインが存在します。

- [gatsby-remark-prismjs](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-prismjs) - Syntax Highlight
- [gatsby-remark-code-buttons](https://github.com/iamskok/gatsby-remark-code-buttons) - コピーボタン設置
- [gatsby-remark-prismjs-title](https://github.com/otanu/gatsby-remark-prismjs-title) - タイトルの指定

ただ、それらを組み合わせたときの HTML が自分の良しとするものと異なってしまったのと、細かい調整が難しい (コードのコピーで使っているアニメーション) ため、自分で実装してしまいました。結果、今こうして記事を書いてみていて、満足いくものになったと感じているのでやってよかったです。

## ついでにやったこと

Gatsby への移行とは直接関係無いのですが、手を付けるならとついでにやったことを残しておきます。(自分の振り返り用)

- CircleCI から GitHub Actions への移行
  - 特別な理由はなく、最近使っていて楽だから
- Netlify へのデプロイ方法変更
  - これまで GitHub の Integration を利用し、`push` されたソースコードを Netlify 側でビルドしていた
  - Netlify のリソース節約のために CI でビルドした結果を [netlify/actions/cli](https://github.com/netlify/actions/tree/master/cli) を使ってデプロイするようにした
- 本文中の見出しにリンクを付与
  - Hugo でも実現できる機能だったのですが、当時デザイン悩んでやっていなかっただけ...
  - 記事の引用するときとかに欲しいなぁと思う場面があったので追加
- 記事の書き始めに用意する Markdown ファイルを [scaffdog](https://github.com/cats-oss/scaffdog) で生成するようにした
  - ドッグフーディング :dog:

## やらなかったこと

画像最適化系のプラグインは入れませんでした ([gatsby-remark-images](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-images) 等)。これはビルド速度の劣化が激しそうなのと、それに対するメリットがこのブログでは薄そうというものからです。

## 移行してみて

細かい部分で気になっていた部分が概ね解消できて満足です。また、ブログに SPA として要素はいらないかなぁと考えていたのですが、いざ SPA になるとページ遷移が早くていい感じだなとも思いました (こういうブログで他のページに遷移することはまれだと思いますが)。

あと Gatsby は React がベースになるため、View が TypeScript で書けるようになって管理しやすくなったのは良い変化でした。(実際にビルドされるのは Preact)

このブログも前に使っていたブログからの作り直しで、4 年ほど前に Hugo で作り直したものです。そのため 4 年ぶりの大改修となりました。たまにメンテすると楽しいです。

> [Hugo で新しくブログ作り直した](https://blog.wadackel.me/2016/hello/)
