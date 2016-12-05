---
title: "SlackとVimとメモ管理と私"
slug: "slack-memo-vim"
date: "2016-12-09"
categories: ["Vim"]
image: ""
draft: true
---

この記事は [Vim (その2) Advent Calendar 2016](http://qiita.com/advent-calendar/2016/vim2) の9日目の記事です。

Vimについて初めて記事書きます。  
去年の年末、仕事が凄く詰まっている時期に突然Vimを使い始めて、丁度1年が経とうとしています。

それまではターミナルを開くのも、Gulpやnpm scriptsを走らせるときくらいでそれ程使用頻度としては高くありませんでした。  
しかし、Vimと出会ってからは一変、黒い画面の中に篭もるようになりました。

そうなってくると「**Vimでなんでも完結させたい**」欲が出てきました。



## 皆さん、メモの管理はどうしてますか?

Vimで作業中、さくっとメモ書きを残しておきたいことがあります。例を挙げると、

* 備忘録を残しながら作業したい
* コードの設計を文書化して思案したい
* 突如ポエムを書きたくなった
* 別件の作業指示があった
* メールの下書きをしたい
* etc...

などなど、メモを残したくなるシチュエーションは多くあります。

---

先輩Vimmerの方々がどうしているのかと探してみると幾つか記事が見つかります。

> * [秒速でvimでメモを書く条件 | 遥か彼方の彼方から](http://tekkoc.tumblr.com/post/41943190314/%E7%A7%92%E9%80%9F%E3%81%A7vim%E3%81%A7%E3%83%A1%E3%83%A2%E3%82%92%E6%9B%B8%E3%81%8F%E6%9D%A1%E4%BB%B6)
> * [シンプルなメモ管理用プラグインmemolist.vimを作った - Glide Note](http://blog.glidenote.com/blog/2012/03/26/memolist.vim/)
> * [Big Sky :: 2012年のVimメモ取り環境はmemolistとctrlpに決まりだ](http://mattn.kaoriya.net/software/vim/20120328183428.htm)
> * [QFixHowm - vim用howmプラグイン - fudist](https://sites.google.com/site/fudist/Home/qfixhowm)

どれも良さそうなのですが、例えば、プライベートのPC+会社のPC+スマホで同じメモを参照しようとするとDropboxなどで同期する必要が出てきそうです。  
Dropboxでも問題ありませんが、スマホで見た際に見づらい感じがします。

しばらく頭を抱え考えみたら、それを解決するのにうってつけなものが見つかりました。



## Slackで管理したらよさそう

Slackの提供するアプリは使い勝手もよく見やすいと思います。そして、他サービスとの連携も非常に柔軟に行えます。

**#memo** みたいなメモ書き専用のチャンネルにVimからサクッと挙げることが出来れば、この悩みを解消できそうです。

というわけで、



## slack-memo-vim

Slackをメモ代わりに使えるためのプラグインを作ってみました。

![スクリーンショット]({{% image "screenshot.gif" %}})

上記では、新規バッファを開いてメモを書いてSlackに投稿したりしてます。

プラグインのリポジトリは以下です。

> [tsuyoshiwada/slack-memo-vim](https://github.com/tsuyoshiwada/slack-memo-vim)  



## 導入方法

TODO


## できること

TODO


## できないこと

TODO


## おわりに

TODO

