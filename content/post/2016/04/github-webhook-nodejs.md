---
title: "GitHubのWebhookをNode.jsで受け取る"
slug: "github-webhook-nodejs"
date: "2016-04-19"
draft: true
categories: ["Node.js"]
image: ""
---


* GitHub WebhookをNode.jsで受信したい
    - このブログはGitHubで管理、masterへのpushで自動ビルドを実行してる
    - その時のメモ
    - masterにpushされたタイミングデプロイしたい
    - SlackやTwitterのbotを動かしたりしたい
    - GitHub Pagesでは無くVPSを前提とする
    - [Securing your webhooks | GitHub Developer Guide](https://developer.github.com/webhooks/securing/) Ruby(Sinatra)での実装例
* `X-Hub-Signature`の判定
    - JSON文字列+設定したSECRETキーを使用し、SHA-1 HMACでハッシュしたSignature(署名)が`X-Hub-Signature`に入る
    - 同様の処理をサーバ(今回はNode.js)でやればセキュアな感じ??
* [github-webhook-handler](https://github.com/rvagg/github-webhook-handler)を使用
    - `error`イベントを監視しないと例外を吐いてしまうので必須
* サーバにPHP入れてないし、ある程度慣れてきたしNode.jsでやりたい
* 日本語の情報があまりなかったけど、
    - PHP,Ruby(Sinatra)が多い気がする
    - そもそも調べなくてもちょろい??
    - Node.jsでやる人が希少??
* 動作確認中は`Redeliver`ボタンが便利


---


サーバ側のコード例。

```javascript:hooks.js
"use strict";

const PORT = process.env.PORT || 8080;
const SECRET = "your_secret_key";
const REPOSITORY_NAME = "your_repo_name";

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
