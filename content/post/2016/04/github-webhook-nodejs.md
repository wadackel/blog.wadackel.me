---
title: "GitHubのWebhookをNode.jsで受け取る"
slug: "github-webhook-nodejs"
date: "2016-04-19"
draft: true
categories: ["Node.js"]
image: ""
---

このブログではテーマファイル、及び記事データをGitHubで管理し、`$ git push`した際のフックを仕込む事でVPS上に自動デプロイされるような構成になっています。

[Jekyll](https://jekyllrb.com/)や[Hugo](https://gohugo.io/)などの静的サイトジェネレータを使ったブログだと、GitHub Pagesでの運用例が沢山出てくるのですが、VPSでやるとなった場合に意外と情報が少ないように感じました。

一応セキュリティを意識しつつ`X-Hub-Signature`を使った署名確認をしつつ、GitHub WebhookをNode.jsで受け取るところまでを書いてみようと思います。



## 前提とやりたいこと

実際のコード例を示す前に簡単に前提を整理しておきます。この記事では自動更新部分や、botの動かし方については書いていません。

* GitHub WebhookをNode.jsで受け取りたい
    - PHPの方が気軽に出来そうだけど、そもそもサーバにPHP入れてない
    - [GitHubではRubyの実装例がある](https://developer.github.com/webhooks/securing/)
    - しかし、Ruby力低いので出来れば別言語で...
    - じゃあNode.jsでやろう
* `X-Hub-Signature`の検証はしたい
    - Webhookのページでシークレットキーを設定する
    - JSON文字列+設定したキーを使い、SHA-1 HMACでハッシュしたSignature(署名)がヘッダに入ってくる
    - Webhookを受け取る側でも同様の処理を行い、整合性の確認を行う
    - ハッシュ化部分、Node.jsなら標準の[crypto](https://nodejs.org/api/crypto.html)モジュールで簡単に実装可能
* `master`ブランチに`push`されたら...
    - サイトの自動更新(ビルド)をしたい
    - Twitter,Slackなどのbotを動かしたい
    - etc...



## GitHubでWebhookの設定

まず、リポジトリのSettings->Webhooks & servicesにアクセスします。画面右上にあるAdd webhookを選択後、設定画面が表示されたら以下の項目を設定します。

* **Payload URL** - Webhookの送信先URL
* **Secret** - 任意のシークレットキー

Secretには推測し辛い文字列を指定しておきます。その他の設定項目はデフォルトで問題無いと思います。



## Webhookの受け取り実装例

まず大前提として先ほど設定したPayload URLをNode.jsで捌けるように、サーバ側で設定しておく必要があります。この記事では扱いませんがググればすぐに出てくるので問題無いかなと思います。

GitHub Webhookでは、Payload URLに対してPOST送信で様々な情報が送られてきます。  
それらを一から処理していくのでも良いのですが、[github-webhook-handler](https://github.com/rvagg/github-webhook-handler)を使うと簡単なコードで実装可能です。  
本体が90行程度のシンプルなコードの為、何かあった際にもデバッグしやすそうで安心です。

以下、[github-webhook-handler](https://github.com/rvagg/github-webhook-handler)を使った最小限の実装例です。

```javascript:hooks.js
"use strict";

const PORT = process.env.PORT || 8080;
const SECRET = "your_secret_key"; //設定した任意のキー
const REPOSITORY_NAME = "your_repo_name"; //リポジトリ名

const http = require("http");
const createHandler = require("github-webhook-handler");
const handler = createHandler({
  path: "/",
  secret: SECRET
});


http.createServer((req, res) => {
  handler(req, res, (err) => {
    res.statusCode = 404;
    res.end("no such location");
  });
}).listen(PORT);


handler.on("error", (err) => {
  console.error("Error:", err.message);
});


handler.on("push", (event) => {
  const payload = event.payload;
  const repoName = payload.repository.name;
  const branch = payload.ref.split("/").pop();

  if (repoName === REPOSITORY_NAME && branch === "master") {
    // デプロイ処理や更新通知など (Twitter,Slack,etc...)
  }
});
```

これだけで、Signatureの検証含めたWebhookのハンドリングが出来ました。  
もしサーバ側で[Express](http://expressjs.com/)を使う場合は、[Express X-Hub](https://github.com/alexcurtis/express-x-hub)というミドルウェアがあるので、そちらでも同じような感じで簡単に実装できます。

コメントアウトにも書きましたが、あとは

* 受け取ったリポジトリ名の一致
* `master`ブランチの`push`

上記が揃った場合の任意処理を実装して完成です。一通り実装を終えたら、[forever](https://github.com/foreverjs/forever)や[node-supervisor](https://github.com/petruisfan/node-supervisor)といったツールを使いデーモン化しておきます。

---

一点注意点があり、`github-webhook-handler`ではSignatureの`error`イベントを監視していないと例外を投げるので必ず設定しておきましょう。



## おわりに

ググってみるとGitHubのWebhook受け取りは、Ruby(Sinatra)かPHPを使った例が沢山出て来るので、Node.jsでの実装は少数派な感じっぽいです。  
もし、似たような事をしてみよ〜と思っていた方の参考になれば嬉しいです。
