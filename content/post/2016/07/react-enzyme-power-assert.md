---
title: 'enzyme+mocha+power-assertでReactコンポーネントのフルレンダリングテスト'
slug: 'react-enzyme-mocha-power-assert'
date: '2016-07-05'
categories: ['javascript']
image: ''
---

公開されている React コンポーネントのテストコードを見てみると、[enzyme](https://github.com/airbnb/enzyme)を使ってテストしているものを結構見かけます。enzyme は[React 公式](https://facebook.github.io/react/docs/test-utils.html)でも押しているっぽいので、積極的に使っていきたいです。

> **Note:**  
> Airbnb has released a testing utility called Enzyme, which makes it easy to assert, manipulate, and traverse your React Components' output. If you're deciding on a unit testing library, it's worth checking out: http://airbnb.io/enzyme/

日本語の紹介記事では[@syossan27](https://twitter.com/syossan27)さんの記事が参考になりました。

> [React のテストを Enzyme で書いてみよう - Qiita](http://qiita.com/syossan27/items/4a66b4fe5d6c19a4df84)

上記の記事では、コンポーネントの shallow レンダリングでのテストが実施されています。shallow レンダリングでは、全てのライフサイクルイベントが呼ばれないので、それらが必要な場合はフルレンダリングした状態でテストを実施する必要があります。

---

という訳で、表題にある通り、enzyme+mocha+power-assert で React コンポーネントのフルレンダリングテストを実施するまでを書いていきたいと思います。

## 前提

- `browserify`や`webpack`等のビルド環境は整ってる
- 今回対象したのは`browserify`+`babelify`
- 使用する React のバージョン
  - react v15.2.0
  - react-dom v15.2.0

ビルド周りは特に関係無いと思いますが念のため。既に対象となるコンポーネントがコーディング済み、という前提で進めたいと思います。

### テスト対象のコンポーネント

対象とするのは、通知などに使われる Toast コンポーネントを想定したいと思います。仮コンポーネントの為、雑な作りとなっている点は大目に見てやってください。

```javascript
import React, { Component, PropTypes } from 'react';

export default class Toast extends Component {
  static propTypes = {
    children: PropTypes.node,
    onRequestClose: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    this.timer = setTimeout(this.handleClose, 3000);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  handleClose() {
    const { onRequestClose } = this.props;

    if (typeof onRequestClose === 'function') {
      onRequestClose();
    }
  }

  render() {
    return (
      <div className="toast">
        <button className="toast__close" onClick={this.handleClose}>
          Close!
        </button>
        <div className="toast__body">{this.props.children}</div>
      </div>
    );
  }
}
```

以下の様な動作を期待します。

- マウント後、3 秒後に`onRequestClose`コールバックを呼び出す
- `button`要素のクリックで同じく`onRequestClose`コールバックを呼び出す

### ファイル/ディレクトリ構成

ここまでで以下の様なディレクトリ構成となっています。

```bash
.
├── dist          #bundleファイル
│   └── index.js
├── package.json
└── src           #各コンポーネントファイル等
    ├── Toast.js  #テスト対象のToastコンポーネント
    └── index.js  #エントリーファイル (本記事では未使用)
```

---

今回使用したファイルは以下のリポジトリにあるので、記事に書かれていない箇所で不明な点があればご確認ください。

> tsuyoshiwada/enzyme-sample  
> https://github.com/tsuyoshiwada/enzyme-sample

## テストに必要なパッケージのインストール

必要なパッケージをインストールしていきます。

```bash
$ npm i -D mocha enzyme react-addons-test-utils jsdom babel-register power-assert
```

それぞれ以下のバージョンがインストールされました。

```json
{
  "devDependencies": {
    "babel-register": "^6.9.0",
    "enzyme": "^2.3.0",
    "jsdom": "^9.4.0",
    "mocha": "^2.5.3",
    "power-assert": "^1.4.1",
    "react-addons-test-utils": "^15.2.0"
  }
}
```

react-addons-test-utils は直接使用しませんが、インストールしておかないと enzyme 実行時に怒られます。

あと、`onRequestClose`が呼ばれたかどうか、3 秒後に ◯◯ する、などの処理を簡単にテストしたいので`sinon`もインストールしておきます。これは表題に直接関係無いのでお好みで。

```bash
$ npm i -D sinon
```

## テストのセットアップ

`test`ディレクトリを作成後、jsdom の設定ファイルとテストファイルを追加します。

```bash
$ mkdir test
$ touch test/.setup.js test/Toast.spec.js
```

ここまでで以下のファイル構成です。

```bash
.
├── dist
│   └── index.js
├── package.json
├── src
│   ├── Toast.js
│   └── index.js
└── test
    ├── .setup.js
    └── Toast.spec.js
```

### npm scripts へ test を追加

`$ npm test`を叩いたら、テストが実行されるように設定します。

```json
"scripts": {
  "test": "mocha test/**/*.spec.js -r test/.setup.js --compilers js:babel-register"
}
```

ポイントは以下。

- 後述する jsdom の設定ファイル`.setup.js`を読み込み
- コンパイラに`babel-register`を設定

### jsdom の設定

フルレンダリングを使ったテストでは、shallow レンダリングとは異なり`document`オブジェクトに対してグローバルにアクセス出来る状態が必要です。enzyme のガイドを参考に jsdom の設定を行います。

> enzyme/jsdom.md at master · airbnb/enzyme  
> https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md

```javascript
require('babel-register')();

import { jsdom } from 'jsdom';

const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
};
```

`window`や`document`など、ブラウザ固有の値をグローバル変数へ登録しているみたいです。

## コンポーネントのテストコードを書く

準備が整ったので、`Toast`コンポーネントのテストを書いてみます。

```javascript
import assert from 'power-assert';
import sinon from 'sinon';
import React from 'react';
import { mount } from 'enzyme';
import Toast from '../src/Toast';

describe('<Toast />', () => {
  it('Should call onRequestClose callback on close click', () => {
    const props = { onRequestClose: sinon.spy() };
    const wrapper = mount(<Toast {...props} />);

    wrapper.find('.toast__close').simulate('click');
    assert(props.onRequestClose.called === true);
  });

  it('Should call onRequestClose callback on 3 seconds after the mount', () => {
    const clock = sinon.useFakeTimers();
    const props = { onRequestClose: sinon.spy() };
    const wrapper = mount(<Toast {...props} />);

    clock.tick(1000);
    assert(props.onRequestClose.called === false);

    clock.tick(2000);
    assert(props.onRequestClose.called === true);
  });
});
```

`onRequestClose`が呼ばれるかどうか、といった最低限の内容ですがこれで実際にテストを走らせてみます。

```bash
$ npm test

  <Toast />
    ✓ Should call onRequestClose callback on close click (43ms)
    ✓ Should call onRequestClose callback on 3 seconds after the mount


  2 passing (84ms)
```

`componentDidMount`内で設定した`setTimeout`が正常に動き、マウント後 3 秒経過時に`onRequestClose`が呼び出されていることが確認できました。

---

週末に公開した[react-md-spinner](https://github.com/tsuyoshiwada/react-md-spinner)でテストを書く時に、enzyme どうやって使おうっていうところを軽く調べた内容について纏めました。enzyme 使ってみよう、という方の参考になれば嬉しいです。

React に限らず mocha+power-assert を使ったテストが自分の中でよく使うスタックなので、enzyme はそれらと簡単に統合出来て、割と直感的な API でテストが書き進められるので良い感じですね。

## 追記: 2016.07.15

{{% tweet "753817777421418496" %}}

azu さんのツイートで言及いただいていたので、該当箇所を修正しました。恥ずかしながら`--require`オプションを使ったことが無かったので参考になりました。ありがとうございます。

一応変更箇所の diff を貼っておきます。

```diff:package.json
-    "test": "mocha test/.setup.js test/**/*.spec.js --compilers js:babel-register"
+    "test": "mocha test/**/*.spec.js -r test/.setup --compilers js:babel-register"
```
