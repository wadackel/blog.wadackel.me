---
title: 'ブログをCloudflare PagesからWorkersへ移行した作業ログ'
date: '2025-07-27'
---

## はじめに

先日、Cloudflare Pages のダッシュボードを開いたら以下のような通知が表示されていました。

> Cloudflare Workers now supports nearly all of Pages' features — plus extra tools and integrations not found in Pages.  
> Check out our migration guide and compatibility matrix to learn how to move to Workers today.

また、新規で Pages プロジェクトを作成しようとすると、Workers の利用が推奨されるメッセージも表示されるようになっています。

> We recommend using Cloudflare Workers for new projects. See how Workers compares to Pages in our compatibility matrix.

Cloudflare は Pages から Workers への移行を推奨しているとのことで、このブログ（`blog.wadackel.me`）を Pages から Workers へ移行することにしました。

移行作業は以下のマイグレーションガイドを参考に進めます。

https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/

## 前提

このブログは [Astro](https://github.com/withastro/astro) を使い SSG した HTML を配信するシンプルな構成です。ドメイン管理自体も Cloudflare Registrar で行っています。Cloudflare Pages などの高度な機能を使っている場合や、ドメイン管理が別の Registrar を使っている場合は、以降記載した内容よりは作業量が多いと思います。

ただ、ガイドを見る限り少なくとも Pages から Workers 自体の作業量自体はそれほど多くないように見えるのと、後述する AI Coding assistant 向けのプロンプト整備がされているおかげで作業負荷は低いと思います。

## 移行作業の流れ

ざっくりと移行の流れを整理すると次の手順となりました。

1. Workers のプロジェクト作成
1. コードベースの変更
1. ドメイン移行
1. Pages のプロジェクト削除

それぞれの手順について作業内容をまとめます。

### Workers プロジェクトの作成

まずは Workers 側でプロジェクトを作成します。Cloudflare のダッシュボードから、GitHub Repository を import する形式で新しい Workers プロジェクトを作成しました。Pages で使用していたプロジェクト名と同名が使用できるようです。

先に Workers 側でプロジェクトを作成しておくことで、カスタムドメインを設定する前でも Workers の動作確認が行える状態となります。

### コードベースの変更

Cloudflare が提供している [AI Coding assistant 向けのプロンプト](https://developers.cloudflare.com/workers/prompts/pages-to-workers.txt) を Claude Code に渡して、必要な変更を実施してもらいました。

結果として、このブログでは Pages Functions などの高度な機能を使用していなかったため、コードベースの変更はほぼ必要ありませんでした。

https://github.com/wadackel/blog.wadackel.me/pull/88

主な変更点は `wrangler.jsonc` の追加程度で済み、Cloudflare 側でビルド設定を行ったところ、すんなりビルドが通り、Preview Deployments で動作確認もできました。

### カスタムドメインの移行

カスタムドメインの設定は Cloudflare のダッシュボードから行います。

1. Pages 側で `blog.wadackel.me` のカスタムドメイン設定を削除
2. Workers 側で `blog.wadackel.me` のカスタムドメインを設定

まずは Pages 側での作業が必要、という点に注意は必要ですが難しいところもなくさくっと変更できました。

### Pages プロジェクトの削除

基本的な移行作業が完了したので、不要となった Pages 側のプロジェクトを削除しようとしたところ、以下のエラーが発生しました。

> Your project has too many deployments to be deleted, follow this guide to delete them: https://cfl.re/3CXesln

どうやら過去の Deployments が 100 を超えているとプロジェクトを削除できない既知の問題があるようです。このブログでは 100 以上の Deployments が存在していたため、[Known issues](https://developers.cloudflare.com/pages/platform/known-issues) のガイドに従い Deployments を削除する必要があります。

https://developers.cloudflare.com/pages/platform/known-issues/#delete-a-project-with-a-high-number-of-deployments

まず、ガイドから提供されている ZIP ファイルをダウンロードして解凍します。

```bash
# ZIP を解凍して移動
cd delete-all-deployments
npm i
```

このツールは3つの情報を必要とします。

- Cloudflare Pages のプロジェクト名
- Cloudflare の Account ID
- Cloudflare API Token

プロジェクト名はダッシュボードから確認しやすいので省略しますが、Account ID は以下のドキュメントを参考に取得できます。

https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/

次に、Cloudflare API Token を取得します。ダッシュボード > プロフィール > API Tokens から発行できますが、Pages 関連のテンプレートが存在しないため、Custom token を作成する必要があります。

以下の権限を設定しました:

- Permissions: Account > Cloudflare Pages > Edit
- Account Resources: Include > `{自身のアカウント}`
- Client IP Address Filtering: n/a
- TTL: 1日

一時的な利用を想定した API Token であるため、最小の TTL としています。API Token を取得したら、以下のコマンドで Deployments を削除します。

```bash
CF_API_TOKEN=<YOUR_CF_API_TOKEN> \
CF_ACCOUNT_ID=<ACCOUNT_ID> \
CF_PAGES_PROJECT_NAME=<PROJECT_NAME> \
npm start
```

[aliased deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-aliases) を含めるかどうかでドキュメントに記載されるコマンド例が別れますが、上記コマンドは **aliased deployments の削除は含めない** コマンドです。プロジェクトの状況によっては aliased deployments の削除も必要かもしれません。

実行すると Deployments が削除されるログが流れ続け、約6分半ですべての削除が完了しました。この状態で再度ダッシュボードから削除を試みたところ、無事に Pages プロジェクトを削除できました。

## おわりに

少し前に Cloudflare Workers が推奨されているのに気づいてはいたものの、腰が重く中々手つかずだったのですが、「AI Coding assistant 向けのプロンプトがある」という点で興味が惹かれ作業を進めてみました。結果として、前述した通りコードベース側の変更はほぼなかったわけですが、「Claude Code に任せればすぐに移行できそう」と感じれたのはよかったです。実際に作業開始から完了までおよそ30-40分程度だったので、やればすぐできる内容だったみたいです。Cloudflare よくできててすごい。

コードベースのマイグレーションが必要な際に、codemod などのツールが公式に提供される例はよく見かけますが、マイグレーション用のプロンプトが提供されるのは面白いと感じました。
