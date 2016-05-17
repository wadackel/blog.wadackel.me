---
title: "Sassのmap操作をおさらいする+便利な関数をいくつか"
slug: "sass-map-functions"
date: "2016-05-17"
categories: ["Sass"]
draft: true
image: ""
---


LessやStylus、SassなどのCSSプリプロセッサはもう手放せないツールの一つとなって久しい感じです。僕は業務内/プライベート問わず、スタイルの殆どをSass(Scss)を使って書いています。

ただ、一旦覚えた知識のまま惰性で使っている点もあったりするので、改めて色々と調べてみたりして自分自身の知識を更新したいなと思い、中でもまだまだ使いこなせていなかったmapに関する諸々をおさらいしてみました。


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



## まずは基本的な関数

http://sass-lang.com/documentation/Sass/Script/Functions.html#map-functions

### map-get()

### map-merge()

### map-remove()

### map-keys()

### map-values()

### map-has-key()


## もっと便利に使いたい

以下のブログ記事で紹介されていた関数群から、個人的に便利だと思った関数をいくつか抜粋します。これらの関数を`_map.scss`みたいに切り出しておいて、読み込ませておくと便利ですね。

> [Extra Map Functions in Sass](http://www.sitepoint.com/extra-map-functions-sass/)


### map-deep-get()

* 紹介されていたコードに`@if`を追加

```scss:_map.scss
@function map-deep-get($map, $keys...) {
  @each $key in $keys {
    @if not map-has-key($map, $key) {
      @return null;
    }
    $map: map-get($map, $key);
  }

  @return $map;
}
```


### map-deep-set()

```scss:_map.scss
@function map-deep-set($map, $keys...) {
  $map-list: ($map,);
  $result: null;

  @if length($keys) == 2 {
    @return map-merge($map, (nth($keys, 1): nth($keys, -1)));
  }

  @for $i from 1 through length($keys) - 2 {
    $map-list: append($map-list, map-get(nth($map-list, -1), nth($keys, $i)));
  }

  @for $i from length($map-list) through 1 {
    $result: map-merge(nth($map-list, $i), (nth($keys, $i): if($i == length($map-list), nth($keys, -1), $result)));
  }

  @return $result;
}
```


### map-has-keys()

```scss:_map.scss
@function map-has-keys($map, $keys...) {
  @each $key in $keys {
    @if not map-has-key($map, $key) {
      @return false;
    }
  }

  @return true;
}
```



### map-zip()

```scss:_map.scss
@function map-zip($keys, $values) {
  $l-keys: length($keys);
  $l-values: length($values);
  $min: min($l-keys, $l-values);
  $map: ();

  @if $l-keys != $l-values {
    @warn "There are #{$l-keys} key(s) for #{$l-values} value(s) in the map for `map-zip`. "
        + "Resulting map will only have #{$min} pairs.";
  }

  @if $min == 0 {
    @return $map;
  }

  @for $i from 1 through $min {
    $map: map-merge($map, (nth($keys, $i): nth($values, $i)));
  }

  @return $map;
}
```


### map-extend()

```scss:_map.scss
@function map-extend($map, $maps.../*, $deep */) {
  $last: nth($maps, -1);
  $deep: $last == true;
  $max: if($deep, length($maps) - 1, length($maps));

  @for $i from 1 through $max {
    $current: nth($maps, $i);

    @if not $deep {
      $map: map-merge($map, $current);

    } @else {
      @each $key, $value in $current {
        @if type-of($value) == "map" and type-of(map-get($map, $key)) == "map" {
          $value: map-extend(map-get($map, $key), $value, true);
        }
        $map: map-merge($map, ($key: $value));
      }
    }
  }

  @return $map;
}
```


## まとめ

* mapを使うことで関連する変数をひとまとめに管理できるのでメンテが楽
* 普段プログラムに触れる機会の多いエンジニアにとって直感的に扱える
* 標準の関数だけだと、あと一歩足りない...
* 拡張する関数を作ってより便利に
