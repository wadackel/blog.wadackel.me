---
title: 'sweet-scroll.jsの1.0.0をリリースした'
slug: 'sweet-scroll-release-major'
date: '2016-05-20'
image: ''
---

去年の末に、jQuery 無しで動かせて、ES2015 フレンドリーな感じのスムーススクロール用ライブラリ、[sweet-scroll.js](https://github.com/wadackel/sweet-scroll)を公開したのですが、ブログ以外のサイトで使ってみたり Issue もらった内容の改善を経て、`v1.0.0`(メジャーバージョン)をリリースしました。

どのタイミングでメジャーバージョンに上げるか迷ったのですが、今後大きく機能が変わることは無さそうだなと感じたので、このタイミングです。

改善した部分や、その他雑感についてまとめました。

公開した際の記事は以下。

> [ES6 フレンドリーなスムーススクロール「sweet-scroll.js」を作りました | WebDesign Dackel](http://webdesign-dackel.com/2015/12/17/sweet-scroll/)

リポジトリは以下です。

> [wadackel/sweet-scroll](https://github.com/wadackel/sweet-scroll)

## 改善点

- `updateURL`オプションの追加 (スクロール完了後に`#`を書き換え)
- 以下のコールバックオプションを追加
  - `initialized` (インスタンスの初期化完了時に実行)
  - `completeScroll` (スクロールがキャンセル、又はキャンセルした際に実行)
  - `stepScroll` (スクロール中、各アニメーションフレームで実行)
- 継承クラスで各コールバックを捕捉出来るように
- 連続してアニメーションを実行した際の挙動を修正

普通に使う分に一番大きく変わったのは、`updateURL`オプション、`completeScroll`コールバックの追加かなと思います。

## スクロール完了時に URL を更新する

あるブランドサイトを作っている時に、スムーススクロールが完了したら URL を書き換える必要があったので機能として追加しました。  
ライブラリ自体は`IE9`から動作しますが、このオプションについては`pushState`/`replaceState`を使うため、`IE10+`の対応です。

以下の様な指定となります。

```javascript:sample.js
const sweetScroll = new SweetScroll({
  updateURL: true,
});
```

これでスクロールが完了したら、URL の更新が行われます。

デフォルトでは`pushState`を使って、URL の更新が履歴として残るようになっていますが、前のページに戻る際のストレスになってしまうような場合もあります。

そんな時に`updateURL`に対して、`"replace"`を渡すことで内部的に`replaceState`を使うため、履歴を汚さずにハッシュの変更のみ出来るようになります。

```javascript:sample.js
const sweetScroll = new SweetScroll({
  updateURL: 'replace',
});
```

## 異なるページ間でスムーススクロールする

ページを開き、URL にある`#`(ハッシュ)と対応した要素がある場合にもスムーススクロールをしたい場合もあります。  
個人的には必要ない機能だと思っていたのですが、先ほどのブランドサイト構築時に必要になりました...。

`updateURL`オプションの組み合わせを使って、以下の様なコードを使うことで実現できます。

```javascript:app.js
const sweetScroll = new SweetScroll();
const hash = window.location.hash;
let needsInitialScroll = false;

document.addEventListener(
  'DOMContentLoaded',
  function() {
    needsInitialScroll = document.getElementById(hash.substr(1)) != null;
    if (needsInitialScroll) {
      window.location.hash = '';
    }
  },
  false,
);

window.addEventListener(
  'load',
  function() {
    if (needsInitialScroll) {
      sweetScroll.to(hash, { updateURL: 'replace' });
    }
  },
  false,
);
```

この機能は、それほど重要視していなかったので内部的に処理するようにはせず、あくまでカスタマイズ例として`README`に書く程度にしました。

## 雑感など

「`jQuery`とか、外部ライブラリ無しでどのくらい`JavaScript`書けんの自分？」というところからのスタートだったので、思いつく限り機能盛り込んで、細かい調整も色々と出来るようにしていった結果、minify したファイルで ~~15KB 前後~~ `9.3KB` と比較的大きなものになってしまいました。  
(**2018-03-27 追記: 約 40%程ファイルサイズ落としました**)

よっぽどファイルサイズに拘らないかぎりあまり問題は無さそうですが、これを使うのは、他の単体で動くスムーススクロールライブラリで出来ないことが出てきたタイミングでもいいのかなと思います。

---

リリースから半年近く経って、24 releases で`v1.0.0`としてリリースしました。

自分の作ったものの中では`GitHub`で一番スターをもらえたので大満足です(それでも 20 前後ですが...)。  
ただ、少しでも反響をもらえたことで、もっと精進して良いライブラリを作ったり、積極的に他のライブラリへコントリビュートしたりしていきたいなぁと思えました。
