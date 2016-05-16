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

ライブラリへ切り出して、殆ど書き終わったなという段階で[color-diff](https://github.com/markusn/color-diff)というライブラリを知りました。  
`diff.closest(color, palette, bc)`というメソッドを使うことで、同様の機能を実現できたみたいです。

全力で車輪の再発明をしてしまった感に押しつぶされそうだったので、ブログに書いて消化していきたいと思います。


### 色の分類を実現するステップ

__TODO__


### 色の色差を求める

__TODO__



## インストール

__TODO__



## 使い方

__TODO__



## まとめ

__TODO__
