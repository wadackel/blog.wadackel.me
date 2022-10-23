---
title: 'create-react-appを使ってReactコンポーネントの素振り、GitHub Pagesへのデプロイまで'
date: '2016-11-24'
---

今年の 7 月に[create-react-app](https://github.com/facebookincubator/create-react-app)がリリースされ、僕の観測範囲内ではかなり話題となりました。

昨晩、React コンポーネントの素振りを目的として初めて使ってみたのですが、なかなか便利だったので、素振り+GitHub Pages へデプロイするまでの作業メモです。

## 前提

あくまで`create-react-app`を Web アプリの開発用途としてではなく、React コンポーネントの素振りを目的として使います。そのため、詳しい使い方については触れません。

詳しい使い方については以下が参考になるかなと思います。

> - [create-react-app](https://github.com/facebookincubator/create-react-app)
> - [Facebook 公式の create-react-app コマンドを使って React.js アプリを爆速で作成する - Qiita](http://qiita.com/chibicode/items/8533dd72f1ebaeb4b614)

また、公式のドキュメントには GitHub Pages へのデプロイの他に Heroku なんかも記載されてますが、極々簡単に使いたいだけなので今回は特に触れません。

## ざっくりと概要

1. `create-react-app`をインストール
2. `create-react-app`コマンドで環境構築
3. React コンポーネントの素振り
4. `package.json`の`homepage`にデプロイ先の URL を設定
5. [gh-pages](https://www.npmjs.com/package/gh-pages)のインストール
6. `npm scripts`へ`deploy`を設定
7. GitHub で`gh-pages`の設定

## create-react-app をインストール

`create-react-app`コマンドとして使いたいので、グローバルにインストールしちゃいます。

```bash
$ npm i -g create-react-app
```

インストールが終わって、以下のコマンドでバージョンが出力されるか確認しておきます。

```bash
$ create-react-app --version
```

## 素振り環境の構築

`create-react-app`コマンドが使えるようになったので、早速素振り環境を作ります。

```bash
# my-app という名前で作成
$ create-react-app my-app

# インストールが完了したらディレクトリへ移動
$ cd my-app
```

ここで既に諸々の準備が出来ているので、`start`でブラウザが開いて動作が確認できます。  
設定いらずで簡単に React を試せる環境構築が出来て良い感じです。

```bash
$ npm start
```

---

あとはいつもどおり、`$ npm install`で必要なコンポーネントをインストールして、`src/App.js`辺りにコードを書くだけです。

ちなみに以下実行すると、`build`ディレクトリに最適化済みの静的ファイルが生成されます。

```bash
$ npm run build
```

## デプロイ

素振りに満足したら GitHub Pages で動かしてみたいので、デプロイの設定をしていきます。  
もし、まだ GitHub 上にリポジトリがなければ作っておく必要があります。

### 前準備

これは必須ではありませんが、やっておくと良いかもしれません。

1. `public/index.html`の`<title>`タグ変更
2. TODO

### package.json の編集

GitHub Pages として公開する URL を`package.json`の`homepage`に設定します。

```json:package.json
{
  "name": "my-app",
  "version": "0.1.0",
  "homepage": "https://[username].github.io/[your-repository-name]"
  // ...
}
```

上記`[]`の中身は適当に変える必要があります。

### npm scripts の編集

GitHub 上のリポジトリへ、gh-pages ブランチを作りそれを GitHub Pages として動作させます。  
そこらへんをコマンド一発でやるために[gh-pages](https://www.npmjs.com/package/gh-pages)を使うのでインストールしておきます。

```bash
$ npm i -D gh-pages
```

インストールが終わったら、`scripts`へ`deploy`を追加します。

```json:package.json
{
  // ...
  "scripts": {
    // ...
    "deploy": "npm run build && gh-pages -d build"
  }
}
```

これで`$ npm run deploy`を実行すると、`build`が実行された後、`gh-pages`ブランチへ`build`ディレクトリ以下のファイルが push されるので、先に`homepage`へ指定した URL で動作確認ができるようになります。

### GitHub 上で gh-pages を GitHub Pages へと登録

リポジトリ > Settings > GitHub Pages を開き、**Source**から`gh-pages`を選択して**Save**すれば完了です。

## まとめ

ほとんど公式のドキュメントに記載されている内容ですが、上記で簡単に React コンポーネントの素振りができました。

昨晩触ったきっかけですが、趣味リポジトリの`node_modules`をインストールしなおしている間(これがめっちゃ長い...)にさくっと触ったレベルですが、かなり短時間で気になっていたライブラリを触ってみることが出来ました。

https://twitter.com/wadackel/status/801423156456005632

素振りの他にも自作ライブラリの DEMO や動作確認なんかにも重宝しそうですね。

ただ、個人的にガッツリ開発するぞっとなった場合は、やっぱり一から設定していきたので、あくまで素振り+サンプルなんかに使っていきたいなという感じでした。
