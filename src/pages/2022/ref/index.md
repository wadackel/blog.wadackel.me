---
title: '2022年の振り返りと反省、2023年への抱負'
date: '2022-12-31'
---

## はじめに

2021 年は何かとバタバタとしてしまい振り返りができませんでしたが、今年こそは 1 年を振り返りつつ、簡単に来年への抱負をまとめられたらと思います。

## 前半戦（1-6 月）

今年 1 年の前半を遡ると、仕事においては準備期間と感じる時間が長かったように感じます。

### 開発組織へのビジョン提示準備

2020 年に[WINTICKET](https://www.winticket.jp) というサービスの開発責任者という役割を受け持つようになりました。以来、自分なりの事業・組織に対する貢献の形を模索・実行してきました。

自分なりの新たなチャレンジとして、ある課題を元にビジョナリーな方向性を示し事業成果を創出するような働きかけをすることとなりました。課題の解像度を上げ、開発に関わる各メンバーをモチベートできるような方向性とするために、過去の開発を振り返ったり、事業責任者とすり合わせするような時間を意識的に設けた期間でした。

### Web インフラ刷新準備

前述した WINTICKET の Web 版をホストしているインフラ環境を GKE から Cloud Run へ移行する計画と設計を詰めていました。これも一つ前の、これからの開発組織に必要な方向性の一つとして取り組んだものです。

実際に今年の後半、無事にダウンタイムゼロで移行が完遂したのですが、計画・設計までは僕が進めつつ、実際の実行推進は別のメンバーに依頼しました。今後、社のブログなどで外部発信をしていく想定なので詳しくそちらで。

### Visual Regression Testing の改善

今年前半、VRT の高速化に関するブログを書きました。

> [reg-suit と storycap で行う Visual Regression Testing の高速化 - wadackel.me](https://blog.wadackel.me/2022/vrt-performance-optimize/)

検証対象とする Viewport を増やしつつも最終的には 56% 程度まで実行時間を短縮した戦術に関する内容です。

高速化と合わせて、一部の検証対象が安定しない（スクリーンショット撮影の度に異なる結果となる）部分の徹底排除などを中心に、業務で行っている VRT 全般の品質向上を行ったりしていました。

### WINTICKET x Flutter の外部発信

2021 年から取り組んでいた Flutter に関する意思決定の経緯、その後の動きを社の Developer's blog にて公開しました。

https://twitter.com/wadackel/status/1508607924121190403?s=20&t=Sfz0XWuaBQuOSLNbdIAhrQ

> [WINTICKET における Flutter を利用したクロスプラットフォームアプリケーションへの取り組み | CyberAgent Developers Blog](https://developers.cyberagent.co.jp/blog/archives/34808/)

その後は実際に開発を担当する App チームのメンバーから様々な記事が公開されました。

- [WINTICKET アプリ Flutter リプレース戦略 | CyberAgent Developers Blog](https://developers.cyberagent.co.jp/blog/archives/36144/)
- [Flutter 棒グラフの実装から学ぶ Container と Canvas の使い分け | CyberAgent Developers Blog](https://developers.cyberagent.co.jp/blog/archives/36573/)
- [Flutter レンダリングパイプライン入門 | CyberAgent Developers Blog](https://developers.cyberagent.co.jp/blog/archives/36869/)

これから、まだいくつかの記事が公開されることと思いますので、ぜひ目を通していただけると幸いです。

そして、技術的な外部発信はスポットで終えることなく、継続的に行えることにこそ価値があるとも思うので、その点を今後は組織的に解決できるようにしていきたいなと考えています。

### ありがとう GitHub

PR のレビュー品質を少しでも高められるようにと作った [github-pr-diff-tree](https://github.com/wadackel/github-pr-diff-tree) という GitHub Action を公開しました。

> [Pull Request に含まれる差分ファイルを Tree 形式で可視化する GitHub Action を作った - wadackel.me](https://blog.wadackel.me/2021/github-pr-diff-tree/)

公開後、すぐに GitHub 公式から Pull Request File Tree がリリースされ役割を終えました。

> [Pull Request File Tree (Beta) | GitHub Changelog](https://github.blog/changelog/2022-03-16-pull-request-file-tree-beta/)

公開直後ということもあり少しやるせなさを感じつつも Action を実践的に作ってみる経験ができたことはプラスになりました。そして、なんの設定も必要とせず公式が提供してくれることが一番ユーザとして嬉しいですね。

### 結婚式

プライベートな出来事として、5 月に結婚式を挙げることができました。実際、挙式を迎える前までは準備などに土日の可処分時間がとられることも多く、今年の前半は慌ただしく過ごしていました。しかし、引き続きコロナ禍という状況ではありましたが、参加いただいた皆様のおかげで幸せな時間を過ごすことができました。

https://twitter.com/wadackel/status/1523993773612535809?s=20&t=Sfz0XWuaBQuOSLNbdIAhrQ

## 後半戦（7-12 月）

### 開発組織へのビジョン提示・実行推進

Web インフラ刷新を皮切りに、開発に関わる様々な領域で幅広いメンバーを巻き込みつつ実行に移し始めました。まだ、これらの成果が分かりやすく発露できているものはありませんが、今後何かしらの形で外部発信に繋げることできればと考えています。

自分自身が言い出しっぺで様々なメンバーを巻き込んでいるからには、何をもっても成功だったと言えるように実行を推進できればと考えています。（現時点では抽象的な物言いとなってしまいもどかしい）

実行を推進する過程で、メンバーに対するマイクロマネジメントを行う機会が増えた期間でもありました。直接育成・評価を担当しないメンバーであっても、どうしたら抱える悩みを解決できるかを一緒に考えて、必要に応じてサポートするような時間が多くなっていました。そういった動きから、メンバーの成果を引き出すための引き出しは少しずつ増えてきた感覚を得られた期間でもありました。

### scaffdog v2 へのアップグレード

[scaffdog](https://scaff.dog) を v2 に向けて延々と作業をしていました。v2 に向けては以下のようなモチベーションを持ちつつ作業を進めていました。

- 既存ファイルへの追加・編集機能を拡充したい
- 対話型プロンプトの完全スキップを実現したい
- ドキュメントサイトを新設したい
- etc...

無事にドキュメントサイトも公開することができました。

https://twitter.com/wadackel/status/1558612350868959233?s=20&t=Sfz0XWuaBQuOSLNbdIAhrQ

v2 にアップグレードする過程で、Markdown 内に記述されるテンプレートエンジンを parser combinator で 1 から構築しました。それまでは字句解析器に [Esprima](https://esprima.org) を利用していたのですが、完全に依存から外すこともできたため、エンジンの柔軟性を得ることができ、ツールとしての柔軟性を獲得することができたのに加えて、parser combinator に対する知識をある程度みにつけることができたのはよかったなぁと思います。

### ブログを Astro へ移行

やったことをブログにまとめたいと思いつつ、完全にモチベーションが失われしまっていた類のものです。

以前このブログは Hugo で作られており、Gatsby へ移行しました。

> [Hugo から Gatsby への移行と、やりたかったこと - wadackel.me](https://blog.wadackel.me/2020/hugo-to-gatsby/)

そこから更に今年後半に Gatsby から Astro に移行しました。Astro 以外では以下のような FW を検討していました。

- [Framework reimagined for the edge! - Qwik](https://qwik.builder.io/)
- [Lume, the static site generator for Deno - Lume](https://lume.land/)
- [Next.js by Vercel - The React Framework](https://nextjs.org/)

完全な SSG であるこのブログに最も "ちょうどよかった" ことと、Markdown の拡張が remark 経由で簡単なことがある程度の決め手となり Astro を採用しました。

ブログのリニューアルに伴ってこの記事にも表示されている OGP 画像を自動生成するようにしてみました。画像の生成は Astro をビルドするタイミングで satori を利用して生成しています。

> [vercel/satori: Enlightened library to convert HTML and CSS to SVG](https://github.com/vercel/satori)

### 久しぶりの忘年会

12 月に某所でコロナ禍に入って会えてなかった方々と会える機会がありました。久しぶりに会えた方、初めて会えた方と様々な話をすることができ刺激的でした。

オンラインでのコミュニケーションが当たり前になっている昨今ではありますが、オフラインでのコミュニケーションの情報量の多さと密度はやはり魅力的だよなぁとも感じました。

### スプラトゥーン

スプラトゥーン 3 発売後、プライベートな時間の多くを吸われ続けています。底辺プレイヤーではありますが、XP 2200 目指してがんばります。

## 2023 年への抱負

今年を 1 年をざっくりと振り返ると、ミクロとマクロな視点の反復横跳びを繰り返しているような年でした。そして目の前に整理したい、しなければならない課題をやっつけることに精一杯だった 1 年でもありました。

新しいインプットを増やしたというより、アウトプットよりな動きが多かったです。（0 ではないにしろ、過去と比較して）そして、この状況が続くと中期にかけて引き出しが減っていくような感触を得た年でもありました。

来年に向けては、インプットの量と質を上げていきたいと感じています。なんとなくで理解しているような部分を、新たな知識としてインプットする時間を増やしたいです。仕事においては、今やっている仕事を成功だった、と言えるように推進していきたいと考えています。

## おわりに

今年はお酒が入ってしまった状態でダラダラと書いたため、纏まりのない文章となってしまいました。

皆様良いお年を！そして来年も引き続きお付き合いよろしくおねがいします。