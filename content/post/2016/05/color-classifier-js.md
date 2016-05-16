---
title: "指定した色をある基準色に分類する"
slug: "color-classifier-js"
date: "2016-05-16"
categories: ["JavaScript"]
image: ""
---

Node.jsとReactを使って作成しているWebアプリ内で、画像の色を自動的に取得後、用意しておいた幾つかの基準色(カラーパレット)にその色を分類したくなりました。  
この機能を実現するために実装した内容を[color-classifier.js](https://github.com/tsuyoshiwada/color-classifier)というライブラリに切り出したので、処理内容や使い方について書いてみます。


## はじめに

ライブラリへ切り出して、殆ど書き終わったなという段階で[color-diff](https://github.com/markusn/color-diff)というライブラリを知りました。`diff.closest()`というメソッドを使うことで、同様の機能を実現できたみたいです。

全力で車輪の再発明をしてしまった感に押しつぶされそうだったので、ブログに書いて消化していきたいと思います。


### 色の分類を実現するステップ

まず、色の分類を行うためのステップを整理します。  
以下の2ステップで基準色への分類を行うことができそうです。

1. 指定色と基準色間の色差(後述)を求める
2. 最も色差の少なかったものを分類先とする

上記で肝となるのは、**色差を求める**という部分になります。


### 色の色差を求める

正直、詳細なアルゴリズムについては研究者ではないためさっぱりですが、[CIEDE2000](https://en.wikipedia.org/wiki/Color_difference#CIEDE2000)というアルゴリズムが最も人間の色覚に近い色差を求めることが出来るようです。

計算式はJavaで書かれていましたが、以下の記事が大変参考になりました。

> [色の距離（色差）の計算方法 - Qiita](http://qiita.com/shinido/items/2904fa1e9a6c78650b93)

JavaScriptに書き直して、[The CIEDE2000 Color-Difference Formula](http://www.ece.rochester.edu/~gsharma/ciede2000/)にあった[テストデータ](http://www.ece.rochester.edu/~gsharma/ciede2000/dataNprograms/ciede2000testdata.txt)もパスする事を確認しました。

実際のソースは以下で確認できます。

> [color-classifier/src/utils/color-diff.js](https://github.com/tsuyoshiwada/color-classifier/blob/master/src/utils/color-diff.js)


## インストール

__TODO__



## 使い方

__TODO__



## まとめ

__TODO__
