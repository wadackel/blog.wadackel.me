---
title: "create-react-appを使ってReactコンポーネントの素振り、GitHub Pagesへのデプロイまで"
slug: "create-react-app"
date: "2016-11-24"
categories: ["JavaScript"]
image: ""
draft: true
---

今年の7月に[create-react-app](https://github.com/facebookincubator/create-react-app)がリリースされ、僕の観測範囲内ではかなり話題となりました。  
昨晩、Reactコンポーネントの素振りを目的として初めて使ってみたのですがなかなか便利だったので、コンポーネントの素振り+GitHub Pagesへデプロイするまでの作業メモです。




## 前提

あくまで`create-react-app`をWebアプリの開発用途としてではなく、Reactコンポーネントの素振りを目的として使います。そのため、詳しい使い方については触れません。  
詳しい使い方については以下が参考になるかなと思います。

* [create-react-app](https://github.com/facebookincubator/create-react-app)
* [Facebook公式のcreate-react-appコマンドを使ってReact.jsアプリを爆速で作成する - Qiita](http://qiita.com/chibicode/items/8533dd72f1ebaeb4b614)

また、公式のドキュメントにはGitHub Pagesへのデプロイの他にHerokuなんかも記載されてますが、極々簡単に使いたいだけなので今回は特に触れません。




## ざっくりと概要

1. `create-react-app`をインストール
2. `create-react-app`コマンドで環境構築
3. Reactコンポーネントの素振り
4. `package.json`の`homepage`にデプロイ先のURLを設定
5. [gh-pages](https://www.npmjs.com/package/gh-pages)のインストール
6. `npm scripts`へ`deploy`を設定
7. GitHubで`gh-pages`の設定




## create-react-appをインストール

`create-react-app`コマンドとして使いたいので、グローバルにインストールしちゃいます。

```bash
$ npm i -g create-react-app
```

インストールが終わって、以下のコマンドでバージョンが出力されるか確認しておきます。

```bash
$ create-react-app --version
```




## 環境構築

`create-react-app`コマンドが使えるようになったので、早速素振り環境を作ります。

```bash
# my-app という名前で作成
$ create-react-app my-app

# インストールが完了したらディレクトリへ移動
$ cd my-app
```

ここで既に準備が出来ているので、`start`でブラウザが開いて動作が確認できます。  
設定いらずで簡単にReactの環境構築が出来てらくちんですね。

```bash
$ npm start
```

---

あとはいつもどおり、`npm install`で必要なコンポーネントをインストールして、`src/App.js`辺りにコードを書くだけです。




## デプロイ

素振りに満足したらGitHub Pagesで動かしてみたいので、デプロイの設定をしていきます。  
もし、まだGitHub上にリポジトリがなければ作っておく必要があります。


### package.jsonの編集

GitHub Pagesとして公開するURLを`package.json`の`homepage`に設定します。

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "homepage": "https://[username].github.io/[your-repository-name]",
  // ...
}
```

上記`[]`の中身適当に帰る必要があります。


### npm scriptsの編集

GitHub上のリポジトリへ、gh-pagesブランチを作りそれをGitHub Pagesとして動作させます。  
そこらへんをコマンド一発でやるために[gh-pages](https://www.npmjs.com/package/gh-pages)を使うのでインストールしておきます。

```bash
$ npm i -D gh-pages
```

インストールが終わったら、`scripts`へ`deploy`を追加します。

```json
{
  // ...
  "scripts": {
    // ...
    "deploy": "npm run build && gh-pages -d build"
  }
}
```

これで`$ npm run deploy`を実行すると、`gh-pages`ブランチへ`build`ディレクトリ以下のファイルがpushされるので、先に`homepage`に指定URLで動作確認ができるようになります。



## まとめ
