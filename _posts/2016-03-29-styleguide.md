---
title:  "wadackel.meのスタイルガイド"
category: Documentation
---

wadakel.meでは以下の様なスタイルを提供します。必要に応じてスタイルを調整する必要があります。基本的にはローカル(vim)で編集後、`$ git push`でサーバへ反映させる流れを想定しています。


## 基本的な書式

Markdown + GFM(GitHub Flavored Markdown)を採用しています。GitHubで解釈されるMarkdownと同様に書くことが出来るためエンジニアにはとっつきやすいです。  
改行には`__`(2スペース)を使用します。

文法の基礎として、[Markdown記法 チートシート - Qiita](http://qiita.com/Qiita/items/c686397e4a0f4f11683d)がとても分かりやすいため参考とすることをおすすめします。

## 見出し2

### 見出し3

#### 見出し4

##### 見出し5

###### 見出し6

**強調**したいテキストは`**`で対象の文字列を囲みます。


## リスト

印付きのリストの場合はアスタリスク(*)やプラス記号(+)、
またはハイフン記号(-)を使用します。

リストの番号もしくは記号は通常左端からはじまりますが、
冒頭に3つのスペー スまでは許されています。
リストを綺麗に見せるために、リストの内容の二行目以降を揃えることができます。

### 番号無しリスト

* 1番目
    - ネスト1
    - ネスト2
    - ネスト3
* 2番目
* 3番目

### 番号有りリスト

1. 1番目
    - ネスト1
    - ネスト2
    - ネスト3
2. 2番目
3. 3番目


## ソースコード

文中にインラインで表現する場合は該当部分をバッククォートで囲みます。
複数行のコードブロックをソースコードとして表現する場合は、
該当のコードブロックを4つのスペースでインデント(字下げ)することにより
ソースコードのコードブロックとして表現出来ます。

```js:lib/Human.js
class Human {
  constructor(name) {
    this.name = name;
  }

  say() {
    return `Hello my name is ${this.name}`;
  }
}

const wada = new Human("tsuyoshi wada");
console.log(wada.say());
```

ファイル名を指定したパターンでは、以下の構文を使用します。

<div class="highlighter-rouge"><pre class="highlight"><code class="language-md">```js:filename.js
var str = "Hello World!!";
console.log(str);
```</code></pre></div>

```js:filename.js
var str = "Hello World!!";
console.log(str);
```


## 引用

Markdownで引用を表現するときにはEメールと同じ方法で>を用います。
もしあなたがEメールで引用をすることになじんでいるのであればMarkdownでの使用は容易です。

> これは引用です
> これは引用ですこれは引用です
> これは引用ですこれは引用です、これは引用ですこれは引用です  


## テーブル記法

```markdown
| 修飾 (Left)  | Markdown (Right) | HTML (Center)                |
| :----------- | ---------------: | :--------------------------: |
| ボールド     | ** **            | `<strong></strong>`          |
| イタリック   | _ _              | `<em></em>`                  |
| コード       | ``               | `<code></code>`              |
| リンク       | `[text](url)`    | `<a href="url">text</a>`     |
```

上記のように書くと、以下のように表示されます。

| 修飾 (Left)  | Markdown (Right) | HTML (Center)                |
| :----------- | ---------------: | :--------------------------: |
| ボールド     | ** **            | `<strong></strong>`          |
| イタリック   | _ _              | `<em></em>`                  |
| コード       | ``               | `<code></code>`              |
| リンク       | `[text](url)`    | `<a href="url">text</a>`     |



## 区切り線

3つ以上のハイフン(-)やアスタリスク(*)、アンダースコア(_)だけで構成されている行は
罫線となります。

---


## 打ち消し線

標準のMarkdown書式とは異なり、打ち消し線のサポートが入っています。  
`~~`で該当のテキストを囲むことで表現可能です。

~~テスト~~


## 画像の挿入

![画像のみ]({% asset_path IMG_3370.jpg %})

[![リンクあり]({% asset_path IMG_3293.jpg %})]({% asset_path IMG_3293.jpg %})



## キーボードショートカット

これはMarkdownのサポートからは外れてしまいますが、度々忘れてしまうためスタイルガイドに追加します。  
`<kbd>`タグで該当テキストを囲むことで表現可能です。

以下サンプルです。

<kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd>



## ツイートの埋め込み

次の様な構文を使うことで簡単にツイートの埋め込みを行うことが出来ます。

```
[tweet: ツイートのURL]
```

[tweet: https://twitter.com/wadackel/status/717735042827493376]
