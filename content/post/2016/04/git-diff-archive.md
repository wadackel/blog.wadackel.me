---
title: 'Gitの差分ファイルをZIPにまとめるCLIツールを作った'
slug: 'git-diff-archive'
date: '2016-04-24'
image: ''
---

サービス開発や、サーバの権限を持ち Git との連携が出来る環境下では無縁の内容ですが、受注開発の場合は社内においてのソースコードは Git 管理、しかし納品時は差分のみといったパターンがあると思います。

少し調べると関連記事が沢山出てきました。

> - [git で差分ファイルを抽出する - Qiita](http://qiita.com/kaminaly/items/28f9cb4e680deb700833)
> - [git で差分ファイルを抽出して zip にまとめる方法 - HAM MEDIA MEMO](https://h2ham.net/git-diff-file-zip)
> - [SourceTree でコミット間の差分ファイルを抽出しよう (カスタム操作を使う方法) - ICS MEDIA](https://ics.media/entry/4475)

1〜2 番目の記事が CLI から実行できるので、良い感じです。  
ただ、`git archive`を実行する際、既に削除済みのファイルが存在する場合エラーが発生してしまいました。

そこで少し前に、`Node.js`で同じ様な使用感の CLI ツールを作ってみました。

## インストール方法

`Node.js`を使った実装なので`npm`からインストールします。  
`Node.js`は`0.4.x`以降のバージョンが必須です。

```bash
$ npm install git-diff-archive -g
```

## 使い方

まずは Git 管理下の作業ディレクトリへ移動します。

```bash
$ cd /your/project/dir/
```

あとは`git_diff_archive`コマンドにリビジョンを指定して実行するだけです。  
`git_diff_archive`コマンドには`gda`というエイリアスがあるので、こちらを使うとより短いタイピングで実行できます。

以下のコマンドでは、5 つ前までのコミットで変更のあったファイルを zip ファイルにまとめています。

```bash
$ gda HEAD~5
```

`$ git log --oneline`などで確認したハッシュを使用することも出来ます。

```bash
$ gda 845e6bc
```

実際に実行してみると、以下の様に各種情報が表示されます。

{{% image "スクリーンショット" "screenshot.png" %}}

表示される内容は以下の内容です。

- 実行時間
- 内部で実行されたコマンドの詳細
- 生成されたファイル名
- ディレクトリ名
- ファイル一覧
- 既にファイルが存在せず除外されたファイル一覧

生成する zip ファイルの名前を変えたり、幾つか指定できるオプションがあります。詳細は以下のリポジトリで確認できます。

> [tsuyoshiwada/git-diff-archive](https://github.com/tsuyoshiwada/git-diff-archive)

## 動作の仕組みと実装について

`git_diff_archive`コマンドの実行時に渡したリビジョンをそのまま`git diff --name-only`に渡します。 そこで得られたファイル名の一覧を存在するファイルに限り、zip ファイルにまとめる実装をしているだけの簡単な動作になっています。

zip の生成やコマンド引数のパースなど以下のモジュールを使っています。

- [archiver](https://github.com/archiverjs/node-archiver) - zip,tar ファイルの実装を簡単に実装可能なモジュール
- [cli-spinner](https://github.com/helloIAmPau/node-spinner) - CLI 上でスピナーを表示
- [cli-table](https://github.com/Automattic/cli-table) - CLI 上でテーブル上に整形して情報を表示
- [colors](https://github.com/Marak/colors.js) - 同じく CLI 上で出力に対して色付けして見やすく出来る
- [which](https://github.com/npm/node-which) - 外部コマンドの存在チェック(`git`が存在するか念のためチェックするために使用)
- [minimist](https://github.com/substack/minimist) - コマンド引数をよしなに処理

始めて CLI ツールを作ってみたのですが、大抵欲しい機能は OSS で揃っているので自分の欲しかった機能の実装に注力出来るのは有り難い事だなぁと再認識しました。

## おわりに

年末〜年度末まで抱えていた仕事で、サーバの権限も無し+FTP 上でアップするファイルは変更した差分ファイルのみ。という環境下での作業だったので、~~つらみ~~温かみある手動デプロイの支援ツールとして作ったものになります。

同じ様な環境で CLI からさくっと使えるツールを探していた方がいたら是非使ってみて欲しいなぁなんて思います。
