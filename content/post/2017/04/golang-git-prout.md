---
title: 'Goの勉強を兼ねてGitHubのPull RequestをCheckoutするCLIツールを作った'
slug: 'golang-git-prout'
date: '2017-04-03'
image: ''
---

最近、年度末の忙しさにかまけてインプット+アウトプットが殆ど出来ていませんでした。  
リハビリがてら、書きたいと思いつつ中々書く機会が無かった Go を使い、GitHub の Pull Request をローカルに Checkout する為の CLI ツールを作ってみました。

## 作ったもの

{{% image "DEMO" "demo.gif" %}}

> [tsuyoshiwada/git-prout: Checkout pull request locally with Golang.](https://github.com/tsuyoshiwada/git-prout)

## インストール

macOS の場合は Homebrew を使ってインストール可能です。

```bash
$ brew tap tsuyoshiwada/git-prout
$ brew install git-prout
```

それ以外の場合は[リリースページ](https://github.com/tsuyoshiwada/git-prout/releases)の中から必要なファイルを落としてきて、PATH の通ったところに配置し、`git-prout` にリネームします。

Go を使用する場合は以下。

```bash
$ go get -u github.com/tsuyoshiwada/git-prout
```

## 使い方

基本の使い方は以下。

```bash
$ git-prout [<options>] <number>
```

`<number>` に Pull Request の番号を指定するだけです。

### フォーク元のリポジトリを参照

例えばフォークしたリポジトリで作業して、`upstream` など、フォーク元リポジトリにある Pull Request をローカルで動かしてみたい時なんかは、`--remote`(`-r`) オプションでリモートの指定を追加します。

```bash
$ git-prout --remote upstream 123
```

### Git サブコマンドとして動作

`git-**` というコマンド名にしているので、インストール後、そのまま Git のサブコマンドとして動作します。

```bash
$ git prout 123
```

> 参考: [便利な「git-サブコマンド」を作成する - Qiita](http://qiita.com/b4b4r07/items/6b76a5f969231e5e9748)

---

他にも `--force` オプションがあったりしますが、基本的な使い方は以上となります。

## 実装について

GitHub の Pull Request をローカルに取り込む方法は、探せば無限に出てくると思います。

> - [Checking out pull requests locally - User Documentation](https://help.github.com/articles/checking-out-pull-requests-locally/)
> - [GitHub の Pull Request を簡単にチェックアウトするたった 1 つの方法 - アジャイル SE の憂鬱](http://sinsoku.hatenablog.com/entry/2016/01/05/124957)
> - [GitHub のプルリクエストを fetch しとくと便利 - HWPS 別館](http://d.hatena.ne.jp/holysugar/20130129/p1)

正直、コマンドにしたら 2 行程度の内容なので作ったツールの優位性はそれほど無いかなと思います。

しかし、Go 初心者がさっと何か作る〜リリースまで経験するためには丁度良さそうな規模に思えたので作ってみた次第です。

以下はコード書いてリリースするまでのメモ書きです。

### dep を使った依存解決

普段はフロントエンド周りを触ることが多いので、npm を使って依存関係の解決をしています。  
Go ではそこらへんどうするの? と思っていたところ [dep](https://github.com/golang/dep) という依存関係解決のツールがあるようなので使ってみました。

> - [golang/dep: Go dependency tool](https://github.com/golang/dep)
> - [Big Sky :: golang オフィシャル謹製のパッケージ依存解決ツール「dep」](http://mattn.kaoriya.net/software/lang/go/20170125023240.htm)

まだ不完全なプロジェクトみたいですが、今回のツールで使用する分には問題なかったです。

> Alpha. Functionality is known to be broken, missing or incomplete.

### kingpin を使った CLI

各種フラグ+コマンドライン引数のパーサーには [kingpin](https://github.com/alecthomas/kingpin) を使用しています。採用理由は以下。

- 標準パッケージの flag に近い使用感
  - そのため、学習コストが低そう
  - 他の CLI パーサーに比べ、やり過ぎ感もなく丁度良く感じた
- flag とは違い、引数もフラグと同様に扱えた
  - Go 初心者には有り難い...

しかし、kingpin は少し情報が少なく感じました。ただ、困ったらコードを追えるような規模だったのであまり問題ないかもしれません。

以下参考になりました。

> - [flag 並にシンプルでより強力な CLI パーサ kingpin の紹介 - Qiita](http://qiita.com/kumatch/items/258d7984c0270f6dd73a)

### テスト

申し訳程度にテストコードは書いていますが、「肝心の Pull Request を fetch する」、というメインの処理周りのテストが書けていません...。(書き方分からず保留)  
ここらへん、次回何か作るときの課題になりそうです。カバレッジを出したりしてみたい。

初めて Go でテストコードを書くにあたって、「そういえば `assert` 無いな??」ってなりましたが、以下のページを読むことでスッキリしました。

> - [Go の Test に対する考え方 - Qiita](http://qiita.com/Jxck_/items/8717a5982547cfa54ebc)

また、CLI のテストを書く際の設計指針として、以下大変参考になりました。

> - [Go 言語でテストしやすいコマンドラインツールをつくる | SOTA](http://deeeet.com/writing/2014/12/18/golang-cli-test/)

ポイントは `io.Writer` をメインの処理に渡す部分になりますが、kingpin を使っている場合は以下のようにして渡すことが出来ました。

```go
// errStream io.Writer
app.ErrorWriter(errStream)
app.UsageWriter(errStream)

// 同様の機能提供として `Writer(w io.Writer)` もあるが非推奨
```

### gox+ghr を使ったリリース

一番やってみたかったリリース部分。  
CI に TravisCI を使用しているので、今回はそこからリリースさせることにしました。

- GitHub 上で、`repo` への操作権限を付けた Personal access token を発行
- TravisCI に `GITHUB_TOKEN` で登録

あとは `.travis.yml` を以下のように設定するだけで、クロスコンパイル+自動リリースが出来ました。

```yml
language: go
sudo: false
go:
  - 1.8
  - tip
before_install:
  - go get github.com/golang/dep/...
  - go get golang.org/x/tools/cmd/cover
  - go get github.com/mitchellh/gox
  - go get github.com/tcnksm/ghr
install:
  - $GOPATH/bin/dep ensure
script:
  - go test -v
branches:
  only:
    - master
after_success:
  - gox -output "dist/{{.OS}}_{{.Arch}}_{{.Dir}}"
  - ghr --username tsuyoshiwada --token $GITHUB_TOKEN --replace `grep 'Version =' version.go | sed -E 's/.*"(.+)"$$/\1/'` dist/
```

`ghr` に渡すバージョンは `version.go` で定義した `Version` 定数の値を拾って指定しました。

> - [mitchellh/gox: A dead simple, no frills Go cross compile tool](https://github.com/mitchellh/gox)
> - [tcnksm/ghr: Upload multiple artifacts to GitHub Release in parallel](https://github.com/tcnksm/ghr)
> - [高速に自作パッケージを Github にリリースする ghr というツールをつくった | SOTA](http://deeeet.com/writing/2014/07/29/ghr/)

## おわりに

慣れない部分(構文含め...)が多く、単純な機能なのにリリースまでなんだかんだで 1 週間くらいかかってしまいました...。もう少しさくっと作れるように定期的に Go で遊んでみたいなと思います。  
次は API サーバを Go で書いて、デプロイまでやってみたい。
