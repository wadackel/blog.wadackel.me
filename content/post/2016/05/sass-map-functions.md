---
title: "Sassのmap操作を少し便利にする関数をいくつか"
slug: "sass-map-functions"
date: "2016-05-17"
categories: ["Sass"]
image: ""
---


LessやStylus、SassなどのCSSプリプロセッサはもう手放せないツールの一つとなって久しい感じです。僕は業務内/プライベート問わず、スタイルの殆どをSass(Scss)を使って書いています。

ただ、一旦覚えた知識のまま惰性で使っている点もあったりするので、改めて色々と調べてみたりして自分自身の知識を更新したいなと思いました。


## mapとは?

もう導入されてかなり経つので沢山の人が使っていると思いますが、Sass v3.3以降に追加されたデータ型で、連想配列みたいに扱うことが出来るというものです。

以下はボタンのサイズを書き出す簡単なサンプルコードです。冒頭で宣言している変数の`$btn-sizes`がmapに当たります。

```scss
$btn-sizes: (
  sm: 20px,
  md: 30px,
  lg: 40px
);

@each $modifier, $size in $btn-sizes {
  .btn--#{$modifier} {
    width: $size;
    height: $size;
  }
}
```

`@each`を使った繰り返し処理が直感的にかけて良い感じです。

最近見たコードだと、Bootstrap v4で幾つか使っているのを見かけました。

> https://github.com/twbs/bootstrap/blob/v4-dev/scss/_variables.scss



## もっと便利に使いたい

以下のブログ記事で紹介されていた関数群から、個人的に便利だと思った関数をいくつか書いてみます。

> [Extra Map Functions in Sass](http://www.sitepoint.com/extra-map-functions-sass/)


### map-deep-get()

__TODO__


### map-deep-set()

__TODO__


### map-has-keys()

__TODO__


### map-zip()

__TODO__


### map-extend()

__TODO__


## まとめ

__TODO__
