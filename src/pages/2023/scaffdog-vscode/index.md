---
title: 'scaffdog の VS Code 拡張機能をリリースした'
date: '2023-02-27'
---

## はじめに

Markdown Driven な scaffolding ツールとして開発している [scaffdog](https://github.com/scaffdog/scaffdog) ですが、週末に VS Code 向けの拡張機能をリリースしました。

![DEMO](demo.gif)

> [scaffdog - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=scaffdog.scaffdog-vscode)

scaffdog は CLI ツールとして機能提供を行っていますが、VS Code 拡張機能を通じて、GUI 操作から直感的に scaffolding を行うことを目的としています。Gif アニメーションで表示されているように、File Explorer からディレクトリを選択し、直接ファイル生成を行えるような体験を提供します。基本的にはプロジェクトローカルにインストールされた scaffdog を利用するため、CLI と GUI 間で生成されるファイルや機能に差分はありません。

この記事では、作成にするにあたってのモチベーション、使い方や利用時の注意点についてまとめたいと思います。

## モチベーション

僕自身は普段エディタとして Vim / Neovim を利用するため、VS Code は常用しません。ただ、scaffdog をツールとしてより便利にしたいなぁと感じていました。

VS Code を利用するチームメンバーとのモブプログラミングなどで作業を見ているとき、File Explorer から直接ファイルを生成するように scaffolding も行えたら便利だろうと思い拡張機能を作り始めました[^1]。

[^1]: 詳しくなくて勘違いがあるかもしれませんが、同じような機能を IntelliJ が提供しているみたいです。

GUI で直感的な操作を行える、というもの以外だと単純に「VS Code 拡張機能を作ってみたかった」という理由があります。過去 Atom や Vim などの自分自身が使ったエディタに対して、一度はプラグインを実装してみていました。その点、VS Code は多少使ったことはあっても、拡張機能の実装経験が一度もありませんでした。自分自身が普段使わなくとも、メンバーが利用してくれそうな未来が見えることが最初の理由を後押しする題材となりました。

## 使い方

以下の拡張機能をインストールします。

> [scaffdog - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=scaffdog.scaffdog-vscode)

インストール後、scaffdog が利用されているプロジェクトで以下の手順を踏むとファイル生成を行うことができます。

1. File Explorer から生成先とするディレクトリを右クリック
1. ContextMenus に表示される `Run scaffdog in selected folder` を選択
1. ドキュメント（テンプレート種類）を選択
1. ドキュメントで定義されている質問を回答

冒頭の Gif アニメーションがこの操作を行っている DEMO となります。

## 注意点

プロジェクトで利用されている scaffdog のバージョンは `v2.5.0` 以上を推奨としています。

**推奨** としているニュアンスですが、プロジェクトで利用されている scaffdog が `v2.5.0` より前のバージョンの場合、拡張機能に Bundle された scaffdog でフォールバックする機構が関係しています。

`v2.0.0` 以上のバージョンであれば動作はすると思うのですが、scaffdog のバージョンが異なるため、機能差が生じる可能性があります。実際に生成されるファイルが CLI と GUI で異なる結果となることは理想とは言えないため、`v2.5.0` 以上のバージョン利用を推奨としています。

## おわりに

VS Code の拡張機能はドキュメントも充実しているし、作り始めは Yeoman を使ってサクッと環境構築したあと、すぐに TypeScript で書き始めることができてとても整備されている印象でした。

まだ作成した拡張機能に自動テストが書かれていなかったり、荒削りな部分も多分に含んだ状態です。もしそれでも、プロジェクトに scaffdog が使われていて、利用しているエディタが VS Code であれば是非一度試しに使ってみていただけると嬉しいです。
