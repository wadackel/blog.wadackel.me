---
title: 'GitHubのIssueやPRのチェックボックスでワークフローを制御するJavaScriptアクションを作った'
date: '2025-07-02'
---

## はじめに

GitHub の Issue や Pull Request (PR) に含まれるチェックボックスの状態に応じて、ワークフローを制御できる GitHub Actions の [checkbox-workflow-action](https://github.com/wadackel/checkbox-workflow-action) を作りました。

https://github.com/wadackel/checkbox-workflow-action

この Action を使うことで、例えば以下のような制御が可能です。

- PR 内のチェックリストがすべてチェックされたら、自動的に Draft 解除して適当な Reviewer を割り当て
- 複数チームの承認チェックボックスがすべて完了したら、次のステップへ進む
- Issue のタスク進捗に応じて、ラベルを自動的に更新
- etc...

活用の幅はそれなりに広いと考えていますが、上記に例示したものより有効な活用についてはこれから検討していきたいです。以降、なぜ checkbox-workflow-action の作成に至ったのか、ざっくりとしたツールの概要について触れます。

## モチベーション

業務では IssueOps を多用しています。[github/command](https://github.com/github/command) が最も有名かなと思いますが、パラメータの解釈やその他の細かい動作などを自分たちのニーズに合わせて実装した [knowledge-work/command-action](https://github.com/knowledge-work/command-action) を利用したりしています。

IssueOps で柔軟なワークフロー制御を任意のタイミングで実行する、といったこと自体は十分に実現できています。ただ、より手軽にマウスでぽちぽちするだけで実行できれば楽なのに、一定の文字入力を要したり課題がないわけではありません。わかりやすくこの辺が活用されている例で個人的に馴染みあるものは Renovate の Dashboard だったりします。

Issue や PR にあるチェックボックスの変化に応じて、手軽にワークフロー制御ができたらより直感的なオペレーションができるケースもあるのでは？というのが開発に至った主要なモチベーションです。有効な活用はこれから考えたい、というのはこの辺の感覚から来ています。

## 使い方

checkbox-workflow-action は大きく2つのモードで動作します。

1. **Configuration Mode**: チェックボックスの初期設定
2. **Detection Mode**: チェックボックスの状態変化を検知

**Configuration Mode** では、管理対象としたいチェックボックスの初期化を行います。Issue の Body や Issue / PR のコメントを対象にすることができます。**Detection Mode** では、**Configuration Mode** で作成した対象のチェックボックスの値を検知、取得します。

イメージが湧きづらい部分もあると思うので、最小限の例を示します。

### 実装例

`[RELEASE]` という接頭辞がついた Issue を作成したら、一定の確認を強制したうえでデプロイを実行する例です。あくまで動作イメージを湧いてもらうためのガバガバ実装である点はご容赦ください。

```yaml:.github/workflows/sample.yml
name: 'Sample Workflow'

on:
  # Issue の作成、編集をトリガーとする
  issues:
    types: [opened, edited]

permissions:
  issues: write

jobs:
  setup:
    # 不必要に Job が動作しないように適切にスキップする
    # 以下の例では `[RELEASE] ...` というタイトルで作成された Issue のみを対象としている
    if: github.event.action == 'opened' && startsWith(github.event.issue.title, '[RELEASE]')
    runs-on: ubuntu-latest
    steps:
      - uses: wadackel/checkbox-workflow-action@v1
        with:
          id: deploy-checklist
          number: ${{ github.event.issue.number }}
          body: true
          config: |
            [
              {"security": "Security team approved"},
              {"qa": "QA team approved"},
            ]
          message: |
            # Release Checklist
            {{body}}

  execute:
    # Detection Mode では、対象の Issue Comment が変更された場合にのみ実行することを推奨
    if: github.event.action == 'edited' && startsWith(github.event.issue.body, '<!-- checkbox-workflow-action:managed -->')
    runs-on: ubuntu-latest
    steps:
      - name: Detect changes
        id: checklist
        uses: wadackel/checkbox-workflow-action@v1
        with:
          id: deploy-checklist
          number: ${{ github.event.issue.number }}
          body: true

      # Security team approved をチェックしたら...
      - name: Security Approval
        if: ${{ steps.checklist.outputs.changed == 'true' && contains(fromJSON(steps.checklist.outputs.changes), 'security') && fromJSON(steps.checklist.outputs.state).security }}
        run: echo "Do something..."

      # QA team approved をチェックしたら...
      - name: QA Approval
        if: ${{ steps.checklist.outputs.changed == 'true' && contains(fromJSON(steps.checklist.outputs.changes), 'qa') && fromJSON(steps.checklist.outputs.state).qa }}
        run: echo "Do something..."

      # 全てがチェックされたら...
      # 最小限の例としていますが、Deploy 完了後に Issue を Close するといった連携も可
      - name: Deploy
        if: ${{ steps.checklist.outputs.all-checked == 'true' }}
        run: echo "Deploying to production..."
```

**Configuration Mode** で初期化したチェックボックスは、`message` オプションに渡したテンプレート内の `{{body}}` に置き換わります。具体的には次のような Markdown が Issue の本体となります。

<!-- prettier-ignore-start -->
```markdown
# Release Checklist
- [ ] Security team approved
- [ ] QA team approved
```
<!-- prettier-ignore-end-->

`execute` Job では作成されたチェックすボックスが変化したタイミングで任意の処理を実行しています。`config` オプションを渡さないで checkbox-workflow-action を呼び出している状態を **Detection Mode** と読んでいます。

より踏み込んだ使い込みに関しては [README](https://github.com/wadackel/checkbox-workflow-action) を参照ください。重複実行制御、複雑なワークフロー制御を可能とするための工夫なども補足的に記載しています。

## 仕組みや工夫

チェックボックスが変更された、指定したチェックボックスがチェックされている、といった検知ができるように採用している仕組みや工夫について簡単に紹介します。

### JSON 設定と各チェックボックスの対応

`checkbox-workflow-action` では `config` オプションに設定した JSON 文字列をもとにチェックボックスの項目が決まります。各項目には表示するラベルだけでなく key に相当する ID 指定が必須となっています。これが Markdown 上に HTML コメントとして埋め込まれ、内部状態の管理や `outputs` に利用されます。

<!-- prettier-ignore-start -->
```markdown
# Release Checklist
- [ ] <!-- security --> Security team approved
- [ ] <!-- qa --> QA team approved
```
<!-- prettier-ignore-end-->

Renovate の Dashboard がまさにこうした仕組みを使っていたものを参考にしています。

### 状態管理と変更検知

チェックボックスが変更された、という状態を検知するには前回の状態との差分が必要となります。前回の状態として各項目の ID と選択状態の key/value を JSON 文字列化、それを base64 エンコードした内容を HTML コメントにして保持します。

```markdown
<!-- checkbox-workflow-action:state:deploy-checklist:eyJpZCI6ImRlcGxveS1jaGVja2xpc3QiLCJwcmV2aW91c1N0YXRlIjp7InNlY3VyaXR5IjpmYWxzZSwicWEiOmZhbHNlfX0= -->
```

`on.issue_comment` や `on.issues` などのイベントで渡ってきた Issue Body やコメント本文と比較することで、変更されたことを検知する方式を採用しています。

## おわりに

週末に思いついたツールを Claude Code のおかげでさくっと作れていて楽しいです。想定した使い方をまずは README にひたすら書いて、ある程度想定していた内部仕様を伝えて、あとはひたすら実装させて動作確認のループを回しているような開発スタイルでした。

まずは README をひたすら書いていく、はまさに [Readme Driven Development](https://tom.preston-werner.com/2010/08/23/readme-driven-development) です。2010年に出た記事が LLM の活用が進む2025年に重要性がさらに向上するのはなんだか面白い、と感じました。

checkbox-workflow-action はまだ本格的に利用できていないので、これから実験的に使いつつツールとして改善していければと思います。
