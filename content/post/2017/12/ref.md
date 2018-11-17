---
title: '2017年の振り返りと反省、2018年への抱負'
slug: 'ref'
date: '2017-12-31'
categories: ['diary']
image: ''
---

年末の大掃除も落ち着いて、夜まで少し時間あるのでここ一年の振り返りをしてみました。

## 転職

自分の中で今年一番の出来事は転職でした。8 月に退職が決まり、12 月一杯まで働きました。20 歳で専門学校を卒業後、前職では約 5 年間お世話になりました。

次はサイバーエージェントで Web フロントエンジニアとして働かせていただけることになりました。

これまでは受託制作という業務形態、エンジニアリングに関すること全般を担当する (いわゆるフルスタックエンジニア) 様な立ち回りでした。

これからは自社サービス開発になったり、環境や働き方、担当領域も一変するため、早めに慣れていかないとなと考えています。

## アウトプット

今年はあまりアウトプットが出来ていない年になってしまいました...。今年一番の反省点です。振り返ってみると、特にブログは全然書けていませんでした。もう少し気軽にその時取り組んでることとか、感じていることを書けるとよかったなと。

ブログ以外では、OSS として開発・公開してきたものをざっと振り返ってみました。

- [storybook-chrome-screenshot](https://github.com/tsuyoshiwada/storybook-chrome-screenshot)
  - Puppeteer を使って、Storybook のスクリーンショットを撮影する Addon
  - 今リファクタしつつ、Vue と Angular 対応を進めてます
  - 今見るとコードがホントひどい...
- [git-prout](https://github.com/tsuyoshiwada/git-prout)
  - GitHub の PR を簡単にチェックアウトするための CLI ツール
- [svg-to-jsx-with-gui](https://github.com/tsuyoshiwada/svg-to-jsx-with-gui)
  - SVG を JSX に変換する Web ツール
  - React 製
- [htmltojsx](https://github.com/tsuyoshiwada/htmltojsx)
  - `svg-to-jsx-with-gui` で使った変換ライブラリ
  - [reactjs/react-magic](https://github.com/reactjs/react-magic) の Fork でパッチを当てたもの。変更は PR 出してマージ済み
- [react-drip-form](https://github.com/tsuyoshiwada/react-drip-form)
  - HOC ベースの React フォームライブラリ
  - これも TypeScript 化を予定 (手が追いついてない...
- [drip-form-validator](https://github.com/tsuyoshiwada/drip-form-validator)
  - `react-drip-form` で使ったバリデーションライブラリ
- [dot-wild](https://github.com/tsuyoshiwada/dot-wild)
  - `drip-form-validator` で使ったコレクション操作ライブラリ
  - `*` (ワイルドカード) とドットシンタックスを使ってコレクションを操作する
- [react-drip-form-components](https://github.com/tsuyoshiwada/react-drip-form-components)
  - `react-drip-form` 用のコンポーネントセット
- [react-drip-form-bootstrap](https://github.com/tsuyoshiwada/react-drip-form-bootstrap)
  - `react-drip-form` の Bootstrap 対応コンポーネントセット
- [react-drip-form-material-ui](https://github.com/tsuyoshiwada/react-drip-form-material-ui)
  - `react-drip-form` の Material UI 対応コンポーネントセット
- [react-drip-form-test-utils](https://github.com/tsuyoshiwada/react-drip-form-test-utils)
  - `react-drip-form` のテスト用ユーティリティ
- [lime-grid.css](https://github.com/tsuyoshiwada/lime-grid.css)
  - Flexbox を使ったグリッドレイアウト用 CSS
- [sweet-scroll](https://github.com/tsuyoshiwada/sweet-scroll)
  - 今年作ったものでは無いけど、TypeScript で全書き直しした

振り返ると、`react-drip-form` に結構力を入れてたっぽいです。フォームに対する不満が爆発していたようです。

---

その他、最近は Go 言語にハマってて、API サーバ立てて遊んだりしてます。来年のどこかでサービスとしてリリースできればと思ってちょこちょこ進めてます。

## 読んだ本

ここ何年かまともに本を読んでなかったんですが、今年はちょこちょこと本を読みました。中でも印象深いのは以下の 2 冊。

- エリック・エヴァンスのドメイン駆動設計
- 実践ドメイン駆動設計

DDD に興味があったものの、なんとなく分かったつもりくらいで距離をおいていたのですが、よりよいプロダクトを作る時に武器になると思い、本を手に取ってみた次第です。正直まだ理解の足りない部分や実践不足だったりするので、少しずつ理解を深めていきたいと思います。

## 2018 年への抱負

新しい職場でサービスに全力で貢献していきたいというのは勿論のこと、プライベートではどこかの LT とかで発表する機会を設けてみたいなと考えています。これまでは勉強会に行っても聞き手にしかなったことが無いので、新しいことにもガンガン挑戦してみたい。

緊張しいな性格で、若干コミュ障っぽいところがあったりしますが、そこらへんを少しずつ改善して、積極的な姿勢を身に着けていければと思います。
