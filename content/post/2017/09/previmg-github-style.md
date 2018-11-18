---
title: 'PrevimのMarkdownプレビューをGitHubっぽい見た目に変更した'
slug: 'previmg-github-style'
date: '2017-09-03'
image: ''
---

## はじめに

普段 Markdown に限らず、文書やコードを書く時、ほとんどの場合 Vim を使っています。Markdown はそのままの書式で十分に見やすいと感じますが、リポジトリのドキュメントを書いたりするような場合にプレビューが出来ると、実際の表示がどんな感じになるか確認しながら書き進められるため便利です。

僕は Vim で Markdown のプレビューを行うために [Previm](https://github.com/kannokanno/previm) を使用しています。必要な機能が実装されており、Markdown のプレビュー用途なら別ライブラリへの依存もないため導入がしやすく気に入っています。

> [kannokanno/previm](https://github.com/kannokanno/previm)

最近までほとんどデフォルトの設定で使用していたのですが、大きめの画像を表示させた際に画像がコンテンツ部分からはみ出してしまう点が少し気になっていました。

{{% image "画像がコンテンツからはみ出てしまう" "before.png" %}}

Previm では CSS の変更がサポートされているので該当部分だけさくっと修正しようと思い立ったのですが、せっかくなのでリポジトリで表示される内容に近いほうが良いと思い GitHub のスタイルに合わせてみました。

## 変更前と変更後

{{% image "GitHub の見た目にかなり近くなった" "after.png" %}}

タイトル周りも画像表示もいい感じです。上の画像では少し分かりづらいので、コンテンツ部分を比較してみると次のような感じです。

{{% image "変更前と変更後の比較" "detail.png" %}}

右側が変更後のスタイルです。シンタックスハイライトは GitHub とは結構違ったりしますが大分近くはなりました。

## 変更方法

Previm はインストールされている前提です。インストールされていない場合は、各自インストールをしておく必要があります。

まずは `.vimrc` にユーザ定義のスタイルを読み込むための設定を追加します。

```vim:.vimrc
let g:previm_disable_default_css = 1
let g:previm_custom_css_path = '~/dotfiles/templates/previm/markdown.css'
```

デフォルトで読み込まれる CSS を無効にして新たに CSS の指定を行っています。

次に上記で指定したファイルを作成して、次のスタイルを記述します。

> [dotfiles/templates/previm/markdown.css](https://github.com/tsuyoshiwada/dotfiles/blob/9023005bb30d4d895f69233156dd6f488d29e841/templates/previm/markdown.css)

これで Vim を再起動して実際にプレビューするだけです。Previm 便利...。

## おわりに

Emoji の表示 GFM への対応などは考慮せず、CSS で出来る範囲のことしかやっていませんが、見た目が整ったのでいざプレビューする時に大分見やすくなりました。  
もし同じようにプレビューの見た目を整えたいと思っている方がいたら、是非今回のスタイルを当てて快適な Vim x Markdown ライフを。
