---
title: 'SlackとVimとメモ管理と私'
slug: 'slack-memo-vim'
date: '2016-12-09'
image: ''
---

この記事は [Vim (その 2) Advent Calendar 2016](http://qiita.com/advent-calendar/2016/vim2) の 9 日目の記事です。  
Vim に関する記事 + Advent Calendar 初投稿です。よろしくお願いします。

---

昨年末、仕事が凄く詰まっている時期に突然 Vim を使い始めて、丁度 1 年が経とうとしています。

それまではターミナルを開くのも、Gulp や npm scripts を走らせるときくらいで、それ程使用頻度としては高くありませんでした。  
しかし、Vim と出会ってからは一変、黒い画面の中に篭もるようになりました。

そうなってくると **Vim でなんでも完結させたい** 欲が出てきました。

## 皆さん、メモの管理はどうしてますか?

Vim で作業中、さくっとメモ書きを残しておきたいことがあります。例を挙げると、

- 備忘録を残しながら作業したい
- コードの設計を文書化して思案したい
- TODO の管理
- 突如ポエムを書きたくなった
- 別件の作業指示があった
- メールの下書きをしたい
- etc...

などなど、メモを残したくなるシチュエーションは多くあると思います。

---

先輩 Vimmer の方々がどうしているのかと探してみると幾つか記事が見つかります。

> - [秒速で vim でメモを書く条件 | 遥か彼方の彼方から](http://tekkoc.tumblr.com/post/41943190314/%E7%A7%92%E9%80%9F%E3%81%A7vim%E3%81%A7%E3%83%A1%E3%83%A2%E3%82%92%E6%9B%B8%E3%81%8F%E6%9D%A1%E4%BB%B6)
> - [シンプルなメモ管理用プラグイン memolist.vim を作った - Glide Note](http://blog.glidenote.com/blog/2012/03/26/memolist.vim/)
> - [Big Sky :: 2012 年の Vim メモ取り環境は memolist と ctrlp に決まりだ](http://mattn.kaoriya.net/software/vim/20120328183428.htm)
> - [QFixHowm - vim 用 howm プラグイン - fudist](https://sites.google.com/site/fudist/Home/qfixhowm)

どれも良さそうです。ただ、作成したメモを様々な環境で参照しようとすると Dropbox あたりを使うことになりそうです。

Dropbox でも問題無いのですが、出先や休憩中にスマホでメモを見返したい時に、やや見づらいのが難点です。

改善の余地が無いかなぁとぼんやり考えていたら、それを解決するのにうってつけなものが見つかりました。

## Slack で管理したらよさそう

Slack の提供するアプリは使い勝手もよく見やすいと思います。他サービスとの連携も非常に柔軟に行えます。そして、デフォルトで優秀な検索機能が付いています。

**#memo** みたいなメモ書き専用のチャンネルに Vim からサクッと挙げることが出来れば、先述した悩みを解消できそうです。

というわけで、

## Slack! Memo! Vim!

Slack をメモ代わりに使うためのプラグインを作ってみました。

{{% image "スクリーンショット" "screenshot.gif" %}}

上記では新規バッファを開き、メモを書いて Slack に投稿したりしてます。

極力シンプルに使えることを目指し、オプションや API を一つでも減らすことで、複数チャンネルやユーザには対応していません。

プラグインのリポジトリは以下です。

> wadackel/slack-memo-vim  
> https://github.com/wadackel/slack-memo-vim

Windows 環境が手元に無いため未確認です。すみません。

## 導入方法

他プラグインと同様にインストールします。内部的に[mattn](https://twitter.com/mattn_jp)さんの[webapi-vim](https://github.com/mattn/webapi-vim)を使用しているので、別途インストールする必要があります。

### [dein](https://github.com/Shougo/dein.vim)

```vim:.vimrc
call dein#add('mattn/webapi-vim')
call dein#add('wadackel/slack-memo-vim', {'depends': 'mattn/webapi-vim'})
```

### [NeoBundle](https://github.com/Shougo/neobundle.vim)

```vim:.vimrc
NeoBundle 'mattn/webapi-vim'
NeoBundle 'wadackel/slack-memo-vim', {'depends': 'mattn/webapi-vim'}
```

### Slack のトークン、メモ用チャンネルの設定

Slack の API を叩く必要があるので、以下のように API トークンの設定が必要です。

```vim:.vimrc
let g:slack_memo_token = '<YOUR_TOKEN>'
let g:slack_memo_channel = '<YOUR_MEMO_CHANNEL_ID>'
```

これらの設定後は、すぐに使い始めることができます。

トークンの取得方法はググればすぐに出ると思うので割愛します。  
`g:slack_memo_channel`にはチャンネル名ではなく、チャンネルの**ID**が必要です。  
[API > Methods > channels.list](https://api.slack.com/methods/channels.list/test)のテスターを使うことで ID の確認が簡単にできます。

余談ですが、トークンは基本的に非公開とするのが良いので、dotfiles などで.vimrc を管理している際は別ファイルとして管理するのが良いと思います。

```vim:.vimrc
if filereadable(expand('~/.vimrc.local'))
  source ~/.vimrc.local
endif
```

```vim:.vimrc.local
let g:slack_memo_token = '<YOUR_TOKEN>'
let g:slack_memo_channel = '<YOUR_MEMO_CHANNEL_ID>'
```

以上で導入完了です。

## できること

できることはそれほど多くありませんが簡単にご紹介します。

### 新規メモ

何かしらのバッファを開きメモを書いたあと、以下のコマンドを実行します。

```vim
:SlackMemoPost
```

{{% image "メモの投稿デモ" "demo-post.gif" %}}

メモの投稿後は通常のファイルと同様に`:w`などで保存すると、そのまま Slack 上のメモが更新されるようになっています。

また、1 行目は後述するメモ一覧時にタイトルとして扱われます。そのため、分かりやすいものにしておくと良いと思います。`$ git log --oneline`なんかと同じ感じです。

### メモの一覧

以下のコマンドを実行するとメモを一覧し、`<CR>`又は`o`でバッファにカーソル上のメモを展開します。

```vim
:SlackMemoList
```

{{% image "メモの一覧デモ" "demo-list.gif" %}}

一覧を閉じるときは`<Esc>`か`q`をタイプします。勿論`:q`でも OK です。

本筋とは少しずれますが、新規メモ追加時に Slack の API でタイムスタンプを返してくれるので、投稿した日時をメモの本文に入れなくても自動で残せるのが地味に便利です。

一覧中に使用できるキーマップは以下の通りです。

| キー                             | 概要                                         |
| :------------------------------- | :------------------------------------------- |
| <kbd>Enter</kbd> or <kbd>o</kbd> | カーソル上のメモを開く.                      |
| <kbd>Esc</kbd> or <kbd>q</kbd>   | 一覧を閉じる.                                |
| <kbd>d</kbd>                     | カーソル上のメモを削除.                      |
| <kbd>y</kbd>                     | カーソル上のメモ本文を Yank.                 |
| <kbd>r</kbd>                     | 一覧を更新します. (Slack 上の変更を取り込み) |

### メモの削除

キーマップの一覧でも示しましたが、削除したいメモにカーソルを合わせ、`d`をタイプすると確認が出るので`y`で削除します。

{{% image "メモの削除デモ" "demo-delete.gif" %}}

複数選択で削除したいのですが未実装です...。

### GFM の TODO リストをサポート

GFM の TODO リストはそのままでも充分に見やすいですが、Slack 上ではやや見づらく感じたので emoji として表示するようになっています。

{{% image "GFMのTODOリストデモ" "demo-gfm.gif" %}}

### Bot のユーザ名やアイコンを変更

アイコンには画像、又は emoji が使用可能です。デフォルトではアイコンは未指定になります。

```vim:デフォルトの設定
let g:slack_memo_bot_username = 'Vim (bot)'
let g:slack_memo_bot_icon_url = ''
" 又は
let g:slack_memo_bot_icon_emoji = ''
```

### キーマップなど

デフォルトではキーマップは当ててません。必要に応じて各自設定する必要があります。  
以下、設定例です。

```vim:.vimrc
nnoremap smp :SlackMemoPost<CR>
nnoremap sml :SlackMemoList<CR>
```

### CtrlP で一覧する

以下コマンドを使用すると CtrlP でメモを一覧することもできます。CtrlP がインストール済みの場合にのみ動作します。

```vim
:SlackMemoCtrlP
```

ただ、今のところ先述した削除などのアクションが出来ないので、使い勝手はそれほど良くないかもしれません...。

## できないこと

正直なところ、できないことがまだまだ多くあります...。(是非 PR ください!!)

### 検索できないです...

僕自身の Vim script 力が足らなすぎて、まだ検索機能がありません。かなり致命的な感じがするので、そのうち気が向いた時に実装する予定です。

### カテゴリ、タグなどはありません

良い実装が浮かばなかったのと、タイトル(1 行目)を工夫することで概ね問題無いように思うので多分対応しないと思います。

カテゴリごとに投稿する Bot のユーザ名を変えれば分かりやすいかもと思ったのですが、投稿者は後から変更出来なそうだったので諦めました。

### 最大で 1000 件までしかリストできません

Slack の API で各チャンネルの履歴を一度に取得出来るのが、1000 件が限界です。 ページネーション的な実装がまだなので、現状 1000 件のメモが限界です...。

### 一つのメモに対する文字数制限

しっかりと確認しているわけではないのですが、[Real Time Messaging API](https://api.slack.com/rtm)の Limits の項によると、4,000 文字(マルチバイト関連未確認です...)が送信出来ないみたいです。  
試しに手元にあった長めのコードをそのままポストしてみると、分割された状態で保存されました。

そのため、あくまで簡易的なメモに向きそうです。

## おわりに

まだまだエラー処理が雑だったり、至らないところばかりですが、なんとかぎりぎりプラグインとして動くところまで出来ました。  
これを作るまで、10 行以上の Vim Script を書いたことが無いくらいだったのでご容赦いただければ幸いです。

機能要望やバグなどありましたら[Issues](https://github.com/wadackel/slack-memo-vim/issues)や[Twitter](https://twitter.com/wadackel)までご連絡いただければ嬉しいです。

---

最後に、実装に関して mattn さんの[gist-vim](https://github.com/mattn/gist-vim)をもの凄く参考にさせていただきました。  
有難うございます。

次の Advent Calendar は wordijp さんで「**exepath でスーパーサイヤ人か判定する**」です。  
気になります。
