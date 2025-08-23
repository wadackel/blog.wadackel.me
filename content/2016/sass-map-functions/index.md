---
title: 'Sassのmap操作をおさらいする+便利な関数をいくつか'
date: '2016-05-17'
---

Less や Stylus、Sass などの CSS プリプロセッサはもう手放せないツールの一つとなって久しい感じです。僕は業務内/プライベート問わず、スタイルの殆どを Sass(Scss)を使って書いています。

ただ、一旦覚えた知識のまま惰性で使っている点もあったりするので、改めて色々と調べてみたりして自分自身の知識を更新したいなと思い、中でもまだまだ使いこなせていなかった map に関する諸々をおさらいしてみました。

## map とは?

もう導入されてかなり経つので沢山の人が使っていると思いますが、Sass v3.3 以降に追加されたデータ型で、連想配列みたいに扱うことが出来るというものです。

以下はボタンのサイズを書き出す簡単なサンプルコードです。冒頭で宣言している変数の`$btn-sizes`が map に当たります。

```scss
$btn-sizes: (
  sm: 20px,
  md: 30px,
  lg: 40px,
);

@each $modifier, $size in $btn-sizes {
  .btn--#{$modifier} {
    width: $size;
    height: $size;
  }
}
```

関連する値をまとめられて、`@each`を使った繰り返し処理も直感的に書けて良い感じです。

最近見たコードだと、Bootstrap v4 で幾つか使っているのを見かけました。

https://github.com/twbs/bootstrap/blob/v4-dev/scss/_variables.scss

## 基本的な map 操作関数

以降全ての動作確認には`node-sass@3.7.0`を使いました。

### map-get($map,$key)

`$map`の中から`$key`に対応した値を取得します。

```scss
$breakpoints: (
  sm: 768px,
  md: 992px,
  lg: 1200px,
);

@debug map-get($breakpoints, lg); //1200px
```

### map-merge($map1,$map2)

`$map1`と`$map2`の 2 つの map をマージします。

```scss
$btn-default: (
  padding: 10px,
  background: #000,
);

$btn-primary: (
  color: #000,
  background: #fff,
);

@debug map-merge($btn-default, $btn-primary);
// (
//   padding: 10px,
//   background: #fff,
//   color: #000
// )
```

### map-remove($map,$keys...)

`$map`の中にある`$keys`に対応した値を削除して、新しい map を返します。

```scss
$breakpoints: (
  xs: 0,
  sm: 768px,
  md: 992px,
  lg: 1200px,
);

@debug map-remove($breakpoints, xs, lg);
// (
//   sm: 768px,
//   md: 992px
// )
```

### map-keys(\$map)

`$map`のキーをリストにして返します。結果を見てもらえるとわかりますが、ネストしたキーは得られません。

```scss
$user-configure: (
  columns: 12,
  breakpoints: (
    xs: 0,
    sm: 768px,
    md: 992px,
    lg: 1200px,
  ),
);

@debug map-keys($user-configure); // columns, breakpoints
```

### map-values(\$map)

`$map`の値をリストにして返します。

```scss
$user-configure: (
  columns: 12,
  breakpoints: (
    xs: 0,
    sm: 768px,
    md: 992px,
    lg: 1200px,
  ),
);

@debug map-values($user-configure);
// 12,
// (
//   xs: 0,
//   sm: 768px,
//   md: 992px,
//   lg: 1200px
// )
```

### map-has-key($map,$key)

`$map`の中に`$key`というキーが存在するかチェックして真偽値を返します。

```scss
$btn-states: (
  default: #000,
  hover: #333,
  active: #666,
);

@debug map-has-key($btn-states, hover); //true
@debug map-has-key($btn-states, hoge); //false
```

### keywords(\$args)

これは少し使い方に癖があるように思います。`$args`に`$key: value`の様に可変長引数を渡して、それを元にして新しい map を返します。

```scss
@function create-map($args...) {
  @return keywords($args);
}

@debug create-map($sm: 768px, $md: 992px);
// (
//   sm: 768px,
//   md: 992px
// )
```

## もっと便利に使いたい

`map-get()`はあるのに`map-set()`が無かったり、標準の関数だけだと map を扱う上で少し物足りない感が出てきます。

以下のブログ記事で紹介されていた関数群から、個人的に便利だと思った関数をいくつか抜粋します。これらの関数を`_map.scss`みたいに切り出しておいて、読み込ませておくと便利ですね。

http://www.sitepoint.com/extra-map-functions-sass/

### map-deep-get($map,$keys...)

`$map`の中から、可変長引数を使って指定したキーを使い、ネストした値を取得します。  
記事で紹介されていたコードから、`map-has-key()`による判定処理を追加しています。

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

以下、サンプルコードです。

```scss:sample.scss
$configure: (
  breakpoints: (
    md: 992px,
  ),
  z-index: (
    header: 1000,
    modal: 2000,
  ),
);

@debug map-deep-get($configure, z-index, modal); //2000
```

かゆいところに手が届く感じです。

### map-deep-set($map,$keys...)

`$map`に対してネストしたキーを指定して、一気に値を設定できます。  
可変長引数の最後の 1 つは設定する値になります。

```scss:_map.scss
@function map-deep-set($map, $keys...) {
  $map-list: ($map);
  $result: null;

  @if length($keys) == 2 {
    @return map-merge(
      $map,
      (
        nth($keys, 1): nth($keys, -1),
      )
    );
  }

  @for $i from 1 through length($keys) - 2 {
    $map-list: append($map-list, map-get(nth($map-list, -1), nth($keys, $i)));
  }

  @for $i from length($map-list) through 1 {
    $result: map-merge(
      nth($map-list, $i),
      (
        nth($keys, $i): if($i == length($map-list), nth($keys, -1), $result),
      )
    );
  }

  @return $result;
}
```

```scss:sample.scss
$configure: (
  breakpoints: (
    md: 992px,
  ),
  z-index: (
    header: 1000,
    modal: 2000,
  ),
);

@debug map-deep-set($configure, breakpoints, lg, 1200px);
// (
//   breakpoints: (
//     md: 992px,
//     lg: 1200px
//   ),
//   z-index: (
//     header: 1000,
//     modal: 2000
//   )
// )
```

### map-has-keys($map,$keys...)

`map-has-key()`では一つのキーを確認するのみでしたが、以下の関数では確認したいキーを複数指定できます。  
指定したキーの内、一つでも存在しないキーが存在する場合は`false`を返します。

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

```scss:sample.scss
$breakpoints: (
  sm: 768px,
  md: 992px,
  lg: 1200px,
);

@debug map-has-keys($breakpoints, sm, lg); //true
@debug map-has-keys($breakpoints, sm, xl); //false
@debug map-has-keys($breakpoints, hoge, fuga); //false
```

### map-zip($keys,$values)

キーのリスト、値のリストの 2 つから新しい map を生成して返します。

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
    $map: map-merge(
      $map,
      (
        nth($keys, $i): nth($values, $i),
      )
    );
  }

  @return $map;
}
```

```scss:sample.scss
$sizes: sm, md, lg;
$widths: 768px, 992px, 1200px;

@debug map-zip($sizes, $widths);
// (
//   sm: 768px,
//   md: 992px,
//   lg: 1200px
// )
```

### map-extend($map,$maps...)

複数の map をマージしていきます。可変長引数の最後の値に`true`を与えることで、ネストした map に対しても実行していきます。

```scss:_map.scss
@function map-extend($map, $maps...) {
  $last: nth($maps, -1);
  $deep: $last == true;
  $max: if($deep, length($maps) - 1, length($maps));

  @for $i from 1 through $max {
    $current: nth($maps, $i);

    @if not $deep {
      $map: map-merge($map, $current);
    } @else {
      @each $key, $value in $current {
        @if type-of($value) == 'map' and type-of(map-get($map, $key)) == 'map' {
          $value: map-extend(map-get($map, $key), $value, true);
        }
        $map: map-merge(
          $map,
          (
            $key: $value,
          )
        );
      }
    }
  }

  @return $map;
}
```

```scss:sample.scss
$map1: (
  key1: 'value1',
  key2: (
    key2-1: 'value2-1',
  ),
);

$map2: (
  key2: (
    key2-1: 'value2-1-2',
    key2-2: 'value2-2-2',
  ),
);

@debug map-extend($map1, $map2, true);
// (
//   key1: "value1",
//   key2: (
//     key2-1: "value2-1-2",
//     key2-2: "value2-2-2"
//   )
// )
```

## まとめ

- map を使うことで関連する変数をひとまとめに管理できるのでメンテが楽
- 普段プログラムに触れる機会の多いエンジニアにとって直感的に扱える
- 標準の関数だけだと、あと一歩足りない...
- 拡張する関数を作ってより便利に
