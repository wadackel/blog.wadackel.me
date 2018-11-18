---
title: 'Go製のCHANGELOGジェネレータを作った'
slug: 'git-chglog'
date: '2018-02-20'
image: '/post/2018/02/git-chglog/banner.png'
---

## はじめに

タイトルにある通り、[git-chglog][git-chglog] という Go 製の CHANGELOG ジェネレータを作りました。

{{% image "git-chglog" "banner.png" %}}

> git-chglog/git-chglog  
> https://github.com/git-chglog/git-chglog

Git を使用したコミットとタグからなる情報を元に CHANGELOG を作成するためのツールです。

まだまともなサンプルが用意出来ていないのですが、以下は Angular のリポジトリで試しに作ってみたイメージです。

{{% image "Angularのリポジトリでgit-chglogを使ったサンプル" "angular.png" %}}

2018/02/20 時点の Angular のコミット数がおよそ 9600 程度で、生成までの時間が 2.5〜3.5s なので、まぁストレスなく使えるレベルの速度かなと思います。

---

僕が普段仕事としている Web Front-End 界隈では、[conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) というツールが存在し、恐らく最も使われています。今回作った `git-chglog` はこれにインスパイアされたツールになってます。

個人的な観測範囲では conventional-changelog は広く使われているし、機能も必要十分揃っている印象です。しかし、Node.js で実装されているため、使用者を選ぶ点が不自由だなと感じていました。

Go であればシングルバイナリで動作させることが出来る利点に加え、Cross-platform 対応も見込め、作るのも楽しそうだな (重要) という訳で少しずつ実装を進め、つい先日リリースしました。

## git-chglog の思想

以下の 3 つの思想に沿ったツールとなっています。それぞれ簡単に説明していきます。

### 1. 対象の使用言語に依存しないツールとして使えること

前述したように Go であればバイナリを配布し、`$PATH` 配下に設置するだけで使用することが出来ます。CHANGELOG を作る対象のプロジェクトで扱っている言語に依存しない、という大きなメリットがあります。

CHANGELOG を作るという行為は **どの言語・環境でも行うこと** なので、そういった制約に縛られること無く同じツールを使いまわすことが出来ます。学習コストが下がるのは正義かなと思います。

### 2. 全自動も良いけど手直しが効く状態に

使い方の紹介でも記載しますが、`$ git-chglog` コマンドを実行した際、デフォルトでは標準出力へ吐き出され、ファイルへの保存は行われません。

これには以下の理由があります。

- 出力された内容を手動で `CHANGELOG.md` に記載する
- 他の CLI ツールと連携を取りやすく

前者についてですが、全てのコミットに CHANGELOG へ含めるべき内容を記載することが理想ではあります。しかし、様々な事情から **現実的にそれを完璧にこなすことは難しい** と思います。(コミットだけでは情報が足りない、コミットに Typo があった、~~誰だよこの適当なコミットは...、~~等など...)

あとで手直しが入るということを考慮して、直接ファイルを上書きしないのがデフォルトの挙動となっています。勿論オプションでファイルに書き出すことも出来ます。

### 3. 簡単に、柔軟に扱えること

CLI はサブコマンドも無く、引数も必要に応じて 1 つ取るだけのシンプルな API です。

```bash:最シンプルな使い方
$ git-chglog
```

CHANGELOG の生成に関する設定は、YAML ファイル + テンプレートファイルを使用して柔軟に表示形式やデータの扱いを変更することが出来ます。

## インストール

Homebrew で入れることが出来ます。

```bash
$ brew tap git-chglog/git-chglog
$ brew install git-chglog
```

Go が入っている場合は以下でも OK です。

```bash
$ go get -u github.com/git-chglog/git-chglog/cmd/git-chglog
```

その他、[Release Page](https://github.com/git-chglog/git-chglog/releases) から直接バイナリを落として、`$PATH` の通っている場所に `git-chglog` として配置しても問題ないです。

## 使い方

思想の部分でも書いた通り、`git-chglog` は YAML で書かれた設定ファイルとテンプレートファイルの 2 つから CHANGELOG を生成します。

設定ファイルは次のような形式です。

```yaml:設定ファイル(config.yml)
style: github
template: CHANGELOG.tpl.md
info:
  title: CHANGELOG
  repository_url: https://github.com/git-chglog/git-chglog
options:
  commits:
    filters:
      Type:
        - feat
        - fix
        - perf
        - refactor
  commit_groups:
    title_maps:
      feat: Features
      fix: Bug Fixes
      perf: Performance Improvements
      refactor: Code Refactoring
  header:
    pattern: "^(\\w*)\\:\\s(.*)$"
    pattern_maps:
      - Type
      - Subject
  notes:
    keywords:
      - BREAKING CHANGE
```

テンプレートファイルは以下。

```markdown:テンプレートファイル(CHANGELOG.tpl.md)
{{range .Versions}}
<a name="{{.Tag.Name}}"></a>

## {{if .Tag.Previous}}[{{.Tag.Name}}]({{$.Info.RepositoryURL}}/compare/{{.Tag.Previous.Name}}...{{.Tag.Name}}){{else}}{{.Tag.Name}}{{end}} ({{datetime "2006-01-02" .Tag.Date}})

{{range .CommitGroups}}

### {{.Title}}

{{range .Commits}}

- {{.Subject}}{{end}}
  {{end}}{{if .RevertCommits}}

### Reverts

{{range .RevertCommits}}

- {{.Revert.Header}}{{end}}
  {{end}}{{if .MergeCommits}}

### Pull Requests

{{range .MergeCommits}}

- {{.Header}}{{end}}
  {{end}}{{range .NoteGroups}}

### {{.Title}}

{{range .Notes}}
{{.Body}}
{{end}}
{{end}}
{{end}}
```

### 1 からこれを作るのはダルすぎる...

これらをスクラッチで作るのはいくらなんでも乱暴過ぎます。  
対話形式で設定ファイル + テンプレートを作るための `--init` オプションを用意しています。

```bash:対話形式で設定とテンプレートを作成できる
$ git-chglog --init
```

{{% image "--initオプションのデモ" "init.gif" %}}

設定とテンプレートはデフォルトでは `.chglog` ディレクトリに展開されます。

`$ git-chglog` を実行した際にデフォルトでこのディレクトリを読みに行きますが、`-c` オプションで設定ファイルのパスを指定出来るので、配置場所に関する制約はありません。

### CHANGELOG の生成

設定ファイルとテンプレートが出来たら、以下のコマンドを実行することで標準出力に全てのタグを含む CHANGELOG が吐き出されます。

```bash
$ git-chglog
```

明示的に設定ファイルの場所を指定する場合は以下。

```bash
$ git-chglog --config dir/to/config.yml
```

ファイルに書き出す場合は以下。

```bash
$ git-chglog --output CHANGELOG.md
```

### タグの範囲指定

CHANGELOG に含めるタグの範囲を、`..` (Double dot) で指定することが出来ます。

```bash
$ git-chglog 1.0.0..2.0.0
```

例えば以下のタグが存在するとして、

- `1.0.0`
- `1.1.0`
- `1.1.1`
- `1.1.2`
- `2.0.0`

指定方法は 4 通り存在し、それぞれの対応は以下の通りです。

- `1.0.0..1.1.2`
  - `1.0.0` 〜 `1.1.2` の全てのタグ (`2.0.0` は含まない)
- `1.1.1..`
  - `1.1.1` 〜 最新のタグ (`2.0.0`) までの全てのタグ
- `..1.1.2`
  - 最も古いタグ (`1.0.0`) 〜 `1.1.2` までの全てのタグ
- `1.1.0`
  - `1.1.0` のみ

この範囲指定は、運用上 `2.0.0` 以下のタグを含める必要が無い、といった場合に有用です。

### コミットメッセージのフォーマット

デフォルトで幾つか有名所のフォーマットに対応しています。

```
feat(core): Add new feature
```

```
feat: Add new feature
```

```
Add new feature
```

これらは全て、コミットの一行目をパースするための正規表現の指定で実現しています。  
例えば一番上のフォーマットだと次の通りです。

```yaml
header:
  pattern: "^(\\w*)(?:\\(([\\w\\$\\.\\-\\*\\s]*)\\))?\\:\\s(.*)$"
  pattern_maps:
    - Type
    - Scope
    - Subject
```

正規表現でキャプチャしたものを対応するフィールドにマップするための設定例です。変更が必要な場合は、近いフォーマットを `--init` で指定してカスタマイズするのが早い気がします。

## 今後の予定

リリースしたてで手が間に合ってないですが、今後の課題や予定についてです。

- [ドキュメント][git-chglog]を充実させる
  - ちょっと不足しすぎている自覚有り
- 設定ファイルのスニペット化 (アイデア募集)
  - 設定ファイルに記載すべき内容を最小限にできたら嬉しい
  - 具体的な内容はまだ思案中
- monorepo どうする? (アイデア募集)
  - どうする??
  - 言語依存しないで表現できる方法が無いか検討中
- 規約に沿ったコミットの支援ツール
  - `git-chglog` の設定ファイルを活かして何らかの支援ツールが出来たら嬉しい
  - Echosystem の充実が出来るといいな
- Windows サポート
  - バイナリの配布はしてるけど、動作が未検証...

## さいごに

`git-chglog` をこれから少しずつツールとして使い勝手が良いものにしたいと思っています。

使ってみたよ、という方がいましたら [Issues](https://github.com/git-chglog/git-chglog/issues) や [Twitter](https://twitter.com/wadackel) などで、問題の報告や感想など何らかのフィードバックをいただけると嬉しいです。(勿論 PR でも)

> git-chglog/git-chglog  
> https://github.com/git-chglog/git-chglog

---

{{% tweet "964860562952765441" %}}

対して使って無いけど、作っているものに自分が満足行くロゴがあるとやる気が出ますね。これは継続していきたい。

{{% tweet "964806910246440965" %}}

進捗が目に見える形になってくると楽しいですね、やっぱり。ただ、ここまでの道のりが長くて途中ちょっとダレたのは失敗でした。

本当に Go 楽しいなぁ。

[git-chglog]: https://github.com/git-chglog/git-chglog
