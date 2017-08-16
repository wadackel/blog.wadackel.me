---
title: "PinterestなレイアウトのためのReactコンポーネントを作った"
slug: "react-stack-grid"
date: "2016-11-21"
categories: ["javascript"]
image: ""
---


ここ最近はずっと、[前の記事](https://blog.wadackel.me/2016/personal-work-notes/)で書いたWebサービスをコツコツ作り進めています。その中で、よくあるPinterestっぽいレイアウトを使いたかったのですが、既存のReactコンポーネントがやりたいこととマッチしなかったのでReactStackGridというコンポーネントを作りました。

リポジトリは以下です。

> tsuyoshiwada/react-stack-grid  
> https://github.com/tsuyoshiwada/react-stack-grid



## DEMO

![スクリーンショット]({{% image "screenshot.png" %}})

実際の動作はGitHub Pagesから確認できます。  
https://tsuyoshiwada.github.io/react-stack-grid/

単純な`<div>`を使った矩形と、画像を入れ込んだサンプルとなっています。幾つかのアニメーション用のプリセットもあるので是非試してみてください。

![Gifアニメ]({{% image "live-demo.gif" %}})

手持ちのiPhone6sでも必要十分な感じで動作してます。



## 特徴

ReactStackGridでは以下のような特徴があります。

1. アニメーションを柔軟に設定可能 (`enter`, `leaved` etc...)
2. 初期表示(`appear`)のアニメーションも対応 (これが一番やりたかった)
3. 親の要素に対して横幅や縦幅をいちいち指定しなくても良い ([react-sizeme](https://github.com/ctrlplusb/react-sizeme)で解決)
4. 子要素も同様、サイズ指定は不要 (した方がスムーズ)
5. 一応Server Side Rederingにも対応

5のSSRに関してはエラー無く動くという程度で、サーバ側でレイアウトを決定できなかったので、クライアントでマウント後にレイアウトが再計算されます。



## 簡単な使い方

一つもオプションを指定しなくても動作しますが、現実的にはカラムの横幅や余白の指定くらいは行う必要があると思います。

```javascript
import React, { Component } from "react";
import StackGrid from "react-stack-grid";

class MyComponent extends Component {
  render() {
    return (
      <StackGrid
        columnWidth={300}
        gutterWidth={10}
        gutterHeight={10}
      >
        <div key="A">Item A</div>
        <div key="B">Item B</div>
        <div key="C">Item C</div>
      </StackGrid>
    );
  }
}
```

一点必須なのは、内部的にReactTransitionGroupを使っているので子要素に対して、必ず`key`プロパティが必要なことが挙げられます。  
多くの場合、何らかのデータを回すことになると思うのであまり気にする必要はないかなと思います。

その他いくつかプロパティが設定可能ですので、詳細は[リポジトリ](https://github.com/tsuyoshiwada/react-stack-grid)をご確認ください。



## アニメーションの調整

以下のプロパティにコールバック関数を渡し、スタイルオブジェクトを返すことでアニメーションを変更できます。

* `appear`
* `appeared`
* `enter`
* `entered`
* `leaved`

スタイルオブジェクトには`translateX`や`scale`、`rotate`などの拡張構文が指定可能です。  
`transform`の値を作るのが意外と大変なので、直感的に書けるかなと思います。ここらへんの処理は[easy-css-transform-builder](https://github.com/tsuyoshiwada/easy-css-transform-builder)という別パッケージに切り出しています。

先ほどのコールバック関数には3つの引数が渡ってきます。それらを使うことで柔軟な対応ができると思います。  
渡ってくる引数は以下のとおりです。

* `rect: { top: number; left: number; width: number; height: number; }`
* `containerSize: { width: number; height: number; }`
* `index: number`


### 実際の使用例

イージング、アニメーションを調整して少し上からふわっと表示されるような例です。

```javascript
import StackGrid, { easings } from "react-stack-grid";

const appear = rect => ({
  translateY: rect.top - 10,
  scale: 1.1,
  opacity: 0
});

const appeared = () => ({
  scale: 1,
  opacity: 1
});

const enter = appear;

const entered = appeared;

const leaved = rect => ({
  translateY: rect.top + 10
  scale: 0.95,
  opacity: 0
});

class MyComponent extends Component {
  render() {
    return (
      <StackGrid
        ...
        easing={easings.expoOut}
        appear={appear}
        appeared={appeared}
        enter={enter}
        entered={entered}
        leaved={leaved}
      >
        ...
      </StackGrid>
    );
  }
}
```

[DEMO](https://tsuyoshiwada.github.io/react-stack-grid/)で使っているアニメーションは元から用意しているので、`transitiions`を`import`することで使用可能です。

```javascript
import StackGrid, { transitions, easings } from "react-stack-grid";

class MyComponent extends Component {
  render() {
    return (
      <StackGrid
        ...
        easing={easings.expoOut}
        {...transitions.fadeUp}
      >
        ...
      </StackGrid>
    );
  }
}
```

使えるのは以下のアニメーションです。

* `fade`
* `fadeDown`
* `fadeUp`
* `scaleDown`
* `scaleUp`
* `flip`
* `helix`



## まとめ

これを作る前は[react-stonecutter](https://github.com/dantrain/react-stonecutter)というライブラリを使ってみていて、おおよそいい感じだったのですが、カラムサイズを変更してもレイアウトの再計算がされなかったり、コンテナーのサイズが不自由だったり、細かい部分でクセがありました。

開発中のサービスでは、このレイアウトがメインのコンテンツとして使われることになるので、絶対に妥協をしたくなくて自作することになりました。

あまり使用頻度が高いとは思いませんが、もしPinterestっぽいレイアウトを実装する必要があれば使ってみていただけると嬉しいです。

[Issues](https://github.com/tsuyoshiwada/react-stack-grid/issues) & PR お待ちしております。
