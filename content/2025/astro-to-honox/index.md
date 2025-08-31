---
title: 'AstroからHonoのSSGへ移行した'
date: '2025-08-30'
---

## はじめに

少し前にこのブログを Cloudflare Pages から Cloudflare Workers へ移行しました。

https://blog.wadackel.me/2025/cloudflare-pages-to-workers

久しぶりにブログ自体のコードをメンテナンスしてみて、色々と気になることも出てきました。そのため、以前から名前だけは知っているものの使ったことのなかった [Hono](https://github.com/honojs/hono) へ移行してみることとしました。作業自体は例によってほぼ Claude Code で進めたので、その点についても触れておきたいと思います。

## 変遷

このブログは当初 [Hugo](https://gohugo.io/) で実装され、その次に [Gatsby](https://www.gatsbyjs.com/docs/glossary/static-site-generator/) となり最近までは [Astro](https://astro.build/) で実装していました。いずれも Static Site Generation（SSG）として利用しています。

Hono に関しては v4 から SSG がサポートされています。いつか試してみようと思いつつ中々その機会を作れずにいたのですが、Cloudflare Workers への移行タイミングもあり折角なので着手してみることとしました。

https://github.com/honojs/hono/releases/tag/v4.0.0

移行背景の補足なのですが、Hono が気になっていたのは以下の理由から:

- リンクカードの機能で Hono/HonoX を採用してみて感触が非常によかった
  - HonoX が JSX で Component 実装が可能。Islands hydration もサポートされている
- Gatsby/Astro はこのブログに対して機能過多
  - よりミニマムな構成にしたいという思いがあった
  - 依存する package も減らしたい

ブログを実装するにあたって欲しい機能が Hono 及び HonoX を利用することで実現可能でありつつ、API 自体がシンプルで直感的であることが決め手となりました。個人的な開発で積極的に今後も使ってみたいと感じました。

## 移行の流れ

冒頭で記述した通り、基本的に Claude Code を使って作業を進めました。最初は全体を一気に移行するような指示を出してみたのですが、案の定様々な問題が発生しました。適用されるデザインが全然違う、そもそもページ構成が根本的に異なる、そもそも開発サーバーが起動できないなど。そのため、大きく2つのフェーズに分けて段階的に移行を進めることとしました。

1. Hono 及び HonoX での SSG 基盤
2. 各 UI パーツの移行

それぞれのフェーズに対して具体的に作業した内容をまとめます。移行作業は以下の PR で行いました。

https://github.com/wadackel/blog.wadackel.me/pull/91

### Hono 及び HonoX での SSG 基盤

Hono SSG を利用する場合、Gatsby や Astro と異なり Markdown 処理を自前で処理する必要があります。Astro で利用していた unified/remark のツールチェーンをなるべくそのまま流用する方向性としました。

結論から述べると unified/remark を Hono SSG と組み合わせて利用する場合は、vite の設定ファイルで `ssr.external` を指定し vite のバンドルを避けないと CJS/ESM の互換性問題でうまく動作しません。この辺が Claude Code 単体での解決が難しかったです。解決に向かうまでの過程で、create hono して最小限の構成で動作するところまで簡易的なブログシステムを構築させて、その構成を参考にさせて移行作業を進めてもらうことでうまく動作するところまでもっていけました。

### 各 UI パーツの移行

SSG 基盤まで実装できたところで動作確認をしても、多くの UI が期待する結果と全く異なるものとなっていました。そこで `.astro` や `.tsx` で実装された各 UI Component を一つ一つ移行する作業を進めました。具体的には以下のような手順で Claude Code に作業を進めさせました:

1. `origin/main` に相当するコードベースを git worktree で別の場所に配置
2. `/fix-original` という一時的なスラッシュコマンドを作成し、Claude Code に差分を継続的に伝達
3. 「フッターのサイズが異なる」「ページネーションのアイコンサイズや色が異なる」といった具体的な差分を指摘
4. 実装された内容を確認し、適宜修正指示を出して次のタスクへ移行

2の手順で利用した `/fix-original` は以下のような定義をしました。

```markdown
---
description: もともとの実装になるべく合わせるように適切な修正計画を立てる
---

## Context

- AstroからHono/HonoXへ移行を進めている
- UI Componentのスタイルがまだ完全に移行しきれていない
- AstroとHono/HonoXの差分も存在するが、Tailwind v3からv4へも移行している
- `origin/main` の実装は `<git worktreeのパス>` に存在する
  - `git fetch` などを利用せず、このディレクトリにある実装を適宜参照可能

## Your task

1. ユーザーがClaude Codeに対して、解消したい課題を伝える
2. 1で指示された内容をもとにClaude Codeは `origin/main` との差異を徹底的に調査する（この段階では一切実装をしない）
3. Claude Codeはユーザーに作業計画を伝えて、実装を進めるべきか確認する
4. ユーザーからの修正指示があれば、計画を修正する
5. **ユーザーから承認が得られたら**、修正作業を進める

## Task points

直接的な作業ではないが、「Your task」で確定した作業を進めるにあたって以下の点に留意する。

- npm packageを使った実装の際は、常に最新情報を参照する
  - Webの情報を適宜参照して、古い知識のまま作業を進めないこと
- スタイル指定は基本的にTailwindCSSのユーティリティクラス利用をベースとした実装とする
  - 独自クラスを定義したスタイル指定は原則避ける
- 基本的な作業が完了したら、Playwright MCPを用いてブラウザで動作確認する
  - ユーザーの動作確認負荷を低減する
- 作業がすべて完了したらtypecheck, lint, formatが正常に通るか確認する
  - 問題がある場合は適宜修正する
- 対応方針に悩む場合は、ユーザーへ方針を相談すること
```

幸い？Astro の機能を使いこなしているわけではなかったため、基本的な移行作業は円滑に進みました。ただ、実装された内容に細かい不具合や不備があることも多く、人間による動作確認がそれなりに時間を要しました。

余談ですが、Claude Code が HonoX を React と勘違いして作業を進めることがあったので、差分のレビューをするときはそれなりに注意が必要でした。

## その他の取り組み

移行に際して、やりたいと思いつつやれていなかったいくつかの取り組みもついでに実施しました。

### Visual Regression Testing（VRT）の導入

Claude Code をはじめ Agentic Coding での作業を前提とした場合、視覚的な差分に対する安心感が欲しくなってきたため、ブログ程度だからと手を抜かず VRT の基盤を整備しました。

Vitest の Browser Mode で各 UI Component のテストを記述、加えてスクリーンショット画像の撮影を行っています。スクリーンショット画像の撮影結果は [reg-actions](https://github.com/reg-viz/reg-actions) を用いて VRT を実施するようにしています。GitHub Actions のみで完結できるため使い勝手が非常に良いです。

### ESLint から Oxlint への移行

これも完全についでの改修ですが、ESLint から [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) への移行を実施しました。最近 Type-Aware Linting のサポート[^1]が開始されたり、JavaScript Plugin の対応が予定されていたりと個人的に将来性に期待しているためです。

JavaScript Plugin は以下の Issue でマイルストーンを示されており、個人的に筋の良い方向性だと感じています。継続的に情報は追っておきたいですね。

https://github.com/oxc-project/oxc/issues/9905

## おわりに

Gatsby から Astro へ移行した際に、手を抜いて雑に実装した部分が多くありました。その点も含めて今回の移行で多くの場所を整理しきれたのでスッキリしました。

[^1]: [Oxlint Type-Aware Preview | The JavaScript Oxidation Compiler](https://oxc.rs/blog/2025-08-17-oxlint-type-aware.html)
