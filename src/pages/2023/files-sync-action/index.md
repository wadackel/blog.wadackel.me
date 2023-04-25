---
title: '複数リポジトリ間でファイルを同期する GitHub Actions の JavaScript アクションを作った'
date: '2023-04-25'
---

## はじめに

複数リポジトリ間でファイル、又はディレクトリを同期する GitHub Actions の JavaScript アクションを作りました。

> [GitHub - wadackel/files-sync-action: A customizable action that synchronizes files across multiple repositories.](https://github.com/wadackel/files-sync-action)

後述する設定によって、あるリポジトリに含まれるファイルを同期先リポジトリに push し Pull Request を作ってくれる、といった動作をします。以下、実際に動作している様子がわかる Pull Request 及び Workflow の実行ログです。

- [実際にファイル同期が行われている Pull Request](https://github.com/wadackel/files-sync-action-sandbox1/pull/1)
- [wadackel/files-sync-action が動作している Workflow の実行ログ](https://github.com/wadackel/files-sync-action/actions/runs/4740171900/jobs/8415765398#step:4:8) [^1]

[^1]: 実行ログの保存期間が切れたら見れなくなるかと思います

この記事では作成に至ったモチベーション、使い方についてまとめます。

## モチベーション

リポジトリ間で同期したいと考えていたファイルは `commitlint` や `prettier` の設定ファイル、GitHub Actions の Workflow ファイルなどです。

そして、今回作成したアクションとおよそ同じことができる既存のアクションもいくつか存在します。

- [BetaHuhn/repo-file-sync-action](https://github.com/BetaHuhn/repo-file-sync-action)
- [adrianjost/files-sync-action](https://github.com/adrianjost/files-sync-action)

いくつか試した限りでは `BetaHuhn/repo-file-sync-action` が、僕が満たしたいとしていたファイル同期に対する要件をカバーできそうでした。ただ、細かいところでの設定に不満があったことに加え、執筆時点で巨大なリポジトリではエラーが発生し動作しないという問題を抱えていました。

それらを踏まえ、既存のアクションを工夫して使うのではなくアクションを自作する方向としました。ざっくりと自作するにあたり、満たしたいと考えていた要件をまとめます。

- 巨大なリポジトリでも安定して動作して欲しい
- 同期先によって、レビュアーやラベルの設定を細かく行いたい
- 同期するファイルによって同期元、同期先でファイルパスを柔軟に変更したい
  - 特に Workflow ファイルや、gitignore のファイルなど同一パスに置いてしまうと意図せず機能してしまうものたちに関しては必須機能
- テンプレート処理を行い、同じファイルでも同期先によって中身を一部変更したい
  - 基本共通の内容だが、一部同期先によって異なるケースに対応したい

## 使い方

`wadackel/files-sync-action` の動作には通常のアクションと同様に Workflow を定義することに加え、設定ファイルを定義する必要があります。

この記事では全てのオプションや機能については記載しないため、詳細は [ドキュメント](https://github.com/wadackel/files-sync-action) を参照いただけると嬉しいです。

### Workflow の定義

`wadackel/files-sync-action` を実行するには 、以下の Repository Permissions を満たす Access Token（Personal Access Token or GitHub Apps Token）を発行する必要があります。Personal Access Token を利用する場合は [Fine-grained personal access tokens](https://docs.github.com/en/rest/overview/permissions-required-for-fine-grained-personal-access-tokens?apiVersion=2022-11-28) の利用を推奨します。

| Type              | Permission                                                                        |
| :---------------- | :-------------------------------------------------------------------------------- |
| **Contents**      | `Read and write`                                                                  |
| **Pull requests** | `Read and write`                                                                  |
| **Metadata**      | `Read and write`                                                                  |
| **Workflows**     | Workflow ファイルを同期する場合: `Read and write` <br />その他の場合: `No access` |

発行した Access Toknen を `GH_FILES_SYNC_TOKEN` という名前のシークレットに登録し、実行する例です。

```yaml{12-14}:.github/workflows/files-sync.yml
name: Sync Files
on:
  push:
    branches:
      - main
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: wadackel/files-sync-action@v2
        with:
          github_token: ${{ secrets.GH_FILES_SYNC_TOKEN }}
```

[tibdex/github-app-token](https://github.com/tibdex/github-app-token) などのアクションを利用し、GitHub App から Access Token を発行する場合は次のようになります。

```yaml{12-18,21}:.github/workflows/files-sync.yml
name: Sync Files
on:
  push:
    branches:
      - main
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate token
        id: generate_token
        uses: tibdex/github-app-token@v1
        with:
          app_id: ${{ secrets.GH_APP_ID }}
          installation_id: ${{ secrets.GH_APP_INSTALLATION_ID }}
          private_key: ${{ secrets.GH_APP_PRIVATE_KEY }}
      - uses: wadackel/files-sync-action@v2
        with:
          github_token: ${{ steps.generate_token.outputs.token }}
```

### 設定ファイルの定義

ファイル同期に関する設定は、デフォルトで `.github/files-sync-config.yml` に定義します。オプションで変更が可能ですが、多くの場合は不要でしょう。

設定ファイルの構成は、同期の動作に関する共通設定である `settings` と、各同期パターンの設定である `patterns` からなります。共通設定は各同期パターンに継承されますが、各同期パターンで追加の設定も可能です。

同期パターンにはファイルやディレクトリの同期元ファイルパス、同期先ファイルパスとリポジトリを指定します。

以下、いくつかのファイルを同期する例を示します。

```yaml:.github/files-sync-config.yml
settings:
  pull_request:
    reviewers:
      - 'wadackel'
      - 'team:team_slug' # レビュアーにチームを設定する場合は、slug を用いて `team:` 接頭辞をつける
    labels:
      - 'files-sync'

patterns:
  - files:
      - .prettierrc.json
      - commitlint.config.cjs
      - from: workflows/example.yml
        to: .github/workflows/example.yml
    repositories:
      - owner/repo1
      - owner/repo2

  - files:
      - from: .releaserc.json
        to: .releaserc.json
        template:
          preset: 'angular'
    repositories:
      - owner/repo1
      - owner/repo2
    commit:
      prefix: 'build'
    pull_request:
      reviewers:
        - 'reviewer1'
      assignees:
        - 'assignee1'

  - files:
      - from: .releaserc.json
        to: .releaserc.json
        template:
          preset: 'conventionalcommits'
    repositories:
      - owner/repo5
      - owner/repo6
    pull_request:
      labels:
        - 'A-build'
      assignees:
        - 'assignee2'
```

`patterns[].files` は `from` と `to` のキーを持つオブジェクト配列で、同期元・同期先ファイルパスを指定します。`from` と `to` を省略し、文字列として指定することも可能です。`template` にオブジェクトを設定することで [EJS](https://ejs.co/) によるテンプレーティングも行えます。

`patterns[].repositories` は同期先のリポジトリを指定します。

`patterns[].files` 及び `patterns[].repositories` は必須で指定する必要がありますが、同期する際のコミットメッセージや Pull Request の設定を個別に設定もできます。

## おわりに

類似したアクションにはある機能で、`wadackel/files-sync-action` にはない機能もあったりしますが、僕自身が必要としていた機能が揃ったものとなりました。

GitHub Actions の JavaScript アクションを作るのは [2 回目](https://blog.wadackel.me/2021/github-pr-diff-tree/) でしたが、初めて作ってから日が開いてしまったことで色々なものを忘れていました。JavaScript アクションを作る上で工夫したことや意識したことについては別途まとめたいと思います。
