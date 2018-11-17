---
title: 'GitHubのWebhookをNode.jsで受け取る'
slug: 'github-webhook-nodejs'
date: '2016-04-19'
categories: ['node']
image: ''
---

このブログではテーマファイル、及び記事データを GitHub で管理し、`$ git push` した際のフックを仕込む事で VPS 上に自動デプロイされるような構成になっています。

[Jekyll](https://jekyllrb.com/) や [Hugo](https://gohugo.io/) などの静的サイトジェネレータを使ったブログだと、GitHub Pages での運用例が沢山出てくるのですが、VPS でやるとなった場合に意外と情報が少ないように感じました。

一応セキュリティを意識しつつ`X-Hub-Signature`を使った署名確認をしつつ、GitHub Webhook を Node.js で受け取るところまでを書いてみようと思います。

## 前提とやりたいこと

実際のコード例を示す前に簡単に前提を整理しておきます。この記事では自動更新部分や、bot の動かし方については書いていません。

- GitHub Webhook を Node.js で受け取りたい
  - PHP の方が気軽に出来そうだけど、そもそもサーバに PHP 入れてない
  - [GitHub では Ruby の実装例がある](https://developer.github.com/webhooks/securing/)
  - しかし、Ruby 力低いので出来れば別言語で...
  - じゃあ Node.js でやろう
- `X-Hub-Signature`の検証はしたい
  - Webhook のページでシークレットキーを設定する
  - JSON 文字列+設定したキーを使い、SHA-1 HMAC でハッシュした Signature(署名)がヘッダに入ってくる
  - Webhook を受け取る側でも同様の処理を行い、整合性の確認を行う
  - ハッシュ化部分、Node.js なら標準の[crypto](https://nodejs.org/api/crypto.html)モジュールで簡単に実装可能
- `master`ブランチに`push`されたら...
  - サイトの自動更新(ビルド)をしたい
  - Twitter,Slack などの bot を動かしたい
  - etc...

## GitHub で Webhook の設定

まず、リポジトリの Settings->Webhooks & services にアクセスします。画面右上にある Add webhook を選択後、設定画面が表示されたら以下の項目を設定します。

- **Payload URL** - Webhook の送信先 URL
- **Secret** - 任意のシークレットキー

Secret には推測し辛い文字列を指定しておきます。その他の設定項目はデフォルトで問題無いと思います。

## Webhook の受け取り実装例

まず大前提として先ほど設定した Payload URL を Node.js で捌けるように、サーバ側で設定しておく必要があります。この記事では扱いませんので各自おググりください。

GitHub Webhook では、Payload URL に対して様々な情報が POST で送信されます。  
それらを一から処理していくのでも良いのですが、[github-webhook-handler](https://github.com/rvagg/github-webhook-handler)を使うと簡単なコードで実装可能です。  
本体が 90 行程度のシンプルなコードの為、何かあった際にもデバッグしやすそうで安心です。

以下、[github-webhook-handler](https://github.com/rvagg/github-webhook-handler)を使った最小限の実装例です。

```javascript:hooks.js
'use strict';

const PORT = process.env.PORT || 8080;
const SECRET = 'your_secret_key'; //設定した任意のキー
const REPOSITORY_NAME = 'your_repo_name'; //リポジトリ名

const http = require('http');
const createHandler = require('github-webhook-handler');
const handler = createHandler({
  path: '/',
  secret: SECRET,
});

http
  .createServer((req, res) => {
    handler(req, res, (err) => {
      res.statusCode = 404;
      res.end('no such location');
    });
  })
  .listen(PORT);

handler.on('error', (err) => {
  console.error('Error:', err.message);
});

handler.on('push', (event) => {
  const payload = event.payload;
  const repoName = payload.repository.name;
  const branch = payload.ref.split('/').pop();

  if (repoName === REPOSITORY_NAME && branch === 'master') {
    // デプロイ処理や更新通知など (Twitter,Slack,etc...)
  }
});
```

これだけで、Signature の検証含めた Webhook のハンドリングが出来ました。  
もしサーバ側で[Express](http://expressjs.com/)を使う場合は、[Express X-Hub](https://github.com/alexcurtis/express-x-hub)というミドルウェアがあるので、そちらでも同じような感じで簡単に実装できます。

コメントアウトにも書きましたが、あとは

- 受け取ったリポジトリ名の一致
- `master`ブランチの`push`

上記が揃った場合の任意処理を実装して完成です。一通り実装を終えたら、[forever](https://github.com/foreverjs/forever)や[node-supervisor](https://github.com/petruisfan/node-supervisor)といったツールを使いデーモン化しておきます。

## おわりに

ググってみると GitHub の Webhook 受け取りは、Ruby(Sinatra)か PHP を使った例が沢山出て来るので、Node.js での実装は少数派な感じっぽいです。  
もし、似たような事をしてみよ〜と思っていた方の参考になれば嬉しいです。
