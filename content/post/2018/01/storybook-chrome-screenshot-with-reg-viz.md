---
title: "Storybookとreg-suitで気軽にはじめるVisual Regression Testing"
slug: "storybook-chrome-screenshot-with-reg-viz"
date: "2018-01-14"
categories: ["javascript"]
image: ""
---

[scs]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot
[reg]: https://github.com/reg-viz/reg-suit
[quramy]: https://twitter.com/Quramy
[bokuweb]: https://twitter.com/bokuweb17


約半年前に「[Puppeteerを使ったStorybookの自動スクリーンショット撮影用のアドオンを作った](https://blog.wadackel.me/2017/storybook-chrome-screenshot/)」という記事を書きました。この時 [storybook-chrome-screenshot][scs] というアドオンを作って公開した紹介でした。

当初は React のみのサポートだったのですが継続的に手を加えていて、最近 Angular と Vue.js へのサポートが完了したり、機能的にも大分実用的になってきました。

そこで今回は、storybook-chrome-screenshot と [reg-viz/reg-suit][reg] を使って Visual Regression Testing (視覚回帰テスト) を導入して、ありがたみを感じるところまでを書いていきたいと思います。

---

だらだら書いていたら思っていたよりも長くなってしまったので、<a href="#toc_10" data-scroll>各種ツールのセットアップ</a> だけで充分という方は読み飛ばしていただけると幸いです。




## 各ツールの選択理由

まず、「**何故このツールを使うのか？**」といったところをざっと整理しておきます。

* **reg-suit**
    - Visual Regression Testing の為のツール
    - 比較元、比較先の画像を検証に掛け、差分の有無を検知
    - 検証の結果を分かりやすい形式でレポートしてくれる
    - 比較に使用する画像は自前で用意する必要がある
    - 画像生成に関知しないことで、汎用的な Visual Regression Testing の枠組みを提供する
* **Storybook**
    - 実際に動作するコンポーネントカタログを提供する
    - 便利なアドオンの資産がある
    - 視覚的にコンポーネントの確認ができるため
        - 新規参入する開発者が、各コンポーネントの挙動を把握する時間の短縮に繋がる
        - デザイナとの協業もやりやすい
* **storybook-chrome-screenshot**
    - Storybook の 各ストーリーからスクリーンショット画像を生成する
    - それ以上でもそれ以下でも無い
    - React, Angular, Vue.js で同じように使用できる

reg-suit と storybook-chrome-screenshot は互いに疎なライブラリです。どちらも責務は単一のもので、片方の役割を別のものへ差し替えることも可能です。必然的に一つのものにロックインし過ぎない構成となるため、選択に遊びが入る点は魅力です。(ここは個人差があると思います)




## 目指すべきゴール

次に Storybook でコンポーネントカタログを作り、reg-suit で Visual Regression Testing を導入したあとに、どのような恩恵を受けることが可能かを整理します。大きく分けて3つです。


### 1. UI の変更に対する品質の担保

前述したように、Storybook では **実際に動作するコンポーネントをカタログ化** するという点が開発時にとても有用です。しかし、コンポーネント数が多くなってきた際に、あるコンポーネントの変更がどこまで影響するかを把握することは、例えカタログ化され、一覧して見やすくても難しくなってきます。全コンポーネントを目視、関係ありそうなコンポーネントを grep みたいな手法を取ると、確実に漏れが出ます。

Visual Regression Testing を導入することで、そういった漏れ減らし、変更容易性を高めることで品質の担保へ繋げることが可能です。


### 2. 開発者の変更に対する精神的負荷を低減

1で挙げたように、変更容易性が高まることで、コンポーネントに手を加える際に、開発者の精神的負荷を低減することに繋がります。

開発者が触れない、触りたくないと感じるコンポーネントが増え、全体のコードが不安定になればなるほど、プロジェクトの全体の品質低下に直結します。その為、この精神的負荷の低減というのは個人的に一番重要だと感じています。


### 3. レビュー速度の向上

機械的な視覚回帰テストが実施されるため、レビュワーの負荷が大幅に低減されます。

しかし、スクリーンショットを撮影したり、画像検証を挟む都合上、CI 上での実行時間は対象コンポーネントが増えるにつれてかなり伸びていきます。対象コンポーネントを本当に必要なものに絞り込むか、実行時間は仕方ないと割り切るか、プロジェクトによって方針を考えるべきポイントにはなりそうです。

ただし、実行時間が増えてもあくまで機械的なものなので、レビュワーを含めた開発者がより有意義な開発に注力することが出来る、という点は非常に大きいです。


---


ここらへんまでの話は、reg-viz のメンテナである [@Quramy][quramy] さん、[@bokuweb][bokuweb] さんの記事で分かりやすく纏められています。

> * [コンポーネント/単体テスト単位でのvisual regressionテストを行うためのツールを作った話し - Qiita](https://qiita.com/bokuweb/items/bf9de229a3c91c01a480)
> * [1日10万枚の画像を検証するためにやったこと - Qiita](https://qiita.com/Quramy/items/46d0b09ae4d8887b0941)




## 前提

React + Storybook でごく単純なプロジェクトを想定します。[create-react-app](https://github.com/facebookincubator/create-react-app) を使ってさくっと環境を作るところから始めます。最後は GitHub 上のリポジトリと CircleCI が連携して、実用的な段階まで進めます。

以下、全ての工程が終わっている状態のサンプルリポジトリは以下です。

> tsuyoshiwada/scs-with-reg-viz  
> https://github.com/tsuyoshiwada/scs-with-reg-viz


### サンプルプロジェクト作成

`scs-with-reg-viz` というプロジェクトを作成します。以下、`npm` の代わりに `yarn` を使用し、グローバルに入れる必要がありそうなものは `npx` を使っているので、「俺はグローバルインストールするぜっ!!」という方は適宜読み替えてください。

```bash:プロジェクトを作って移動しておく
$ npx create-react-app scs-with-reg-viz
$ cd scs-with-reg-viz
```


### Storybookのセットアップ

まずは Storybook が動作可能な状態を作っておきます。

```bash:必要なモジュールをインストール
$ yarn add -D @storybook/react babel-core
```

`.storybook/config.js` を作って設定を記述します。

```bash
$ mkdir .storybook
$ touch .storybook/config.js
```

```javascript:.storybook/config.js
import { configure } from '@storybook/react';

// Load stories
const req = require.context('../src', true, /\.stories\.js$/);

configure(() => {
  req.keys().forEach(filename => req(filename));
}, module);
```

`src` 以下の `*.stories.js` をストーリー記述用のファイルとして使用します。


### 対象コンポーネントの作成

ごく単純な例なので、`<Button />` という単一のコンポーネントのみ作成します。

```bash
$ touch src/Button.js src/Button.stories.js
```

`primary` という Props を受け取り、2種類のスタイルを提供するだけのボタンです。

```javascript:src/Button.js
import React from 'react';

export const Button = ({ children, primary }) => (
  <button
    style={{
      display: 'inline-block',
      padding: '0 2em',
      height: 50,
      borderRadius: 50,
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: primary ? '#00c4a7' : '#adadad',
      background: primary ? '#00c4a7' : '#fff',
      color: primary ? '#fff' : '#363636',
      font: 'normal 16px/50px sans-serif',
      textRendering: 'optimizeLegibility',
    }}
  >
    {children}
  </button>
);
```

デフォルトのスタイル、`primary` のスタイルをストーリーとして定義します。

```javascript:src/Button.stories.js
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from './Button';

storiesOf('Button', module)
  .add('with default style', () => (
    <Button>Default</Button>
  ))
  .add('with primary style', () => (
    <Button primary>Primary</Button>
  ));
```


### Storybookを動かしてみる

まず `package.json` の `scripts` に `storybook` を作成。これを通して Storybook を起動するようにします。

```json:package.json
{
  "scripts": {
    "storybook": "start-storybook -p 9001 -c .storybook"
  }
}
```

実際に動作するか確認。

```bash
$ yarn storybook
```

http://localhost:9001 で以下のように Storybook が動作していれば、サンプルプロジェクトの作成は完了です。

![Storybookの動作確認]({{% image "storybook-setup.png" %}})




## セットアップ

ここまでで Storybook が動作するところまで来たので、Visual Regression Testing を実現するために storybook-chrome-screenshot と reg-suit、最後に CircleCI をそれぞれセットアップしていきます。


### storybook-chrome-screenshot

まずはインストールから。

```bash
$ yarn add -D storybook-chrome-screenshot
```

次に `.storybook/addons.js` を作って、アドオンの登録を行います。

```bash
$ touch .storybook/addons.js
```

```javascript:.storybook/addons.js
// 他のアドオンを使用する場合は、適宜ここに追加する
import 'storybook-chrome-screenshot/register';
```

次に `.storybook/config.js` でアドオンの初期化を行います。

```diff:.storybook/config.js
-import { configure } from '@storybook/react';
+import { configure, addDecorator } from '@storybook/react';
+import { initScreenshot } from 'storybook-chrome-screenshot';
+
+// Initialize `storybook-chrome-screenshot`
+addDecorator(initScreenshot());
```

`addDecorator` で `initScreenshot()` を登録しているだけです。今回は React を例にしていますが、Angular や Vue.js でも読み込むモジュールが異なるだけで基本は変わりありません。

次に `<Button />` コンポーネントに対して、スクリーンショット撮影の設定を加えます。

```diff:src/Button.stories.js
 import React from 'react';
 import { storiesOf } from '@storybook/react';
+import { withScreenshot } from 'storybook-chrome-screenshot';
 import { Button } from './Button';
 
 storiesOf('Button', module)
+  .addDecorator(withScreenshot())
   .add('with default style', () => (
     <Button>Default</Button>
   ))
```

`addDecorator` で `withScreenshot` を実行することで、全てのストーリーを対象にスクリーンショットを撮影することができます。今回の例では、デフォルトスタイルと `primary` スタイルの2つです。

基本的なセットアップが終わったら、Storybook と同様に npm scripts を通して実行できるように `package.json` に設定します。

```json:package.json
{
  "scripts": {
    ...
    "screenshot": "storybook-chrome-screenshot -p 9001 -c .storybook"
  }
}
```

実際に動作するか、ローカルで試してみます。

```bash
$ yarn screenshot
```

少し待ち、次のような表示になれば OK です。

![2つのスクリーンショット画像が生成されている]({{% image "storybook-chrome-screenshot.png" %}})

デフォルトで storybook-chrome-screenshot は `__screenshots__` というディレクトリに画像を生成するので、これは Git の管理対象外にしておきます。

```text:.gitignore
/__screenshots__
```


### reg-suit

まず始めに、S3 へのアクセス (AmazonS3FullAccess) が出来る AccessKey と SecretKey を設定ファイルか、環境変数へ入れておく必要があります。

準備が出来たら reg-suit の初期化を行います。

```bash:対話形式でオプションを決めていく
$ npx reg-suit init --use-yarn

# 使用するプラグインは以下選択
# - reg-keygen-git-hash-plugin
# - reg-notify-github-plugin
# - reg-publish-s3-plugin

# Working directory of reg-suit. (デフォルトのまま
# => .reg

# Append ".reg" entry to yout .gitignore file. (`.reg`はGitで管理する必要がないためYes
# => Y

# Directory contains actual images. (storybook-chrome-screenshotの画像生成場所に合わせる
# => __screenshots__

# Threshold, ranges from 0 to 1. Smaller value makes the comparison more sensitive. (差分検知の閾値, お好みで
# => 0

# notify-github plugin requires a client ID of reg-suit GitHub app. Open installation window in your browser
# => Y
#    ブラウザの画面に従って GitHub の ClientID を取得
#    取得した ClientID をターミナルに入力

# Create a new S3 bucket (S3のBucketはここで作成しちゃう, 手間要らず :)
# => Y

# Update configuration file (ここまでの設定を`regconfig.json`に反映する
# => Y

# Copy sample images to working dir (サンプル用の画像は要らないのでNo
# => n
```

幾つか質問に答えるだけでとりあえず設定は完了です。簡単ですね！

他と同様に、npm scripts から実行したいので `package.json` に以下を追記。

```json:package.json
{
  "scripts": {
    ...
    "regression": "reg-suit run"
  }
}
```

実際に実行してみて、動作しているようなら OK です。

```bash
$ yarn regression
```


### CircleCI

https://circleci.com/add-projects/gh/<username> から、対象プロジェクトを追加してください。  
プロジェクトの追加が出来たら、 Settings > AWS Permissions で AWS の AccessKey と SecretKey を設定します。

次に CircleCI の設定ファイルを作成します。

```bash
$ mkdir .circleci
$ touch .circleci/config.yml
```

`config.yml` の最小限の中身だけ記載します。

```yaml:.circleci/config.yml
version: 2
jobs:
  build:
    docker:
      - image: regviz/node-xcb

    working_directory: ~/repo

    steps:
      - checkout
      - restore_cache:
          keys:
          - v1-dependencies-{{ checksum "package.json" }}-{{ checksum "yarn.lock" }}
          - v1-dependencies-

      - run: yarn

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}-{{ checksum "yarn.lock" }}

      - run: yarn screenshot
      - run: yarn regression
```

Docker の Primary Image として、[reg-viz/node-xcb](https://hub.docker.com/r/regviz/node-xcb/) を使用していますが、これは Headless Chrome を Node.js で動かすのに適した Image となっています。storybook-chrome-screenshot は内部で [Puppeteer](https://github.com/GoogleChrome/puppeteer) を使用しているため、これをベースにしておけば楽できます。reg-viz が提供しているという点もいい感じです。

実際にスクリーンショットを撮影し、Visual Regression Testing を実行しているのは最後の2行です。




## 実際に動かしてみる

一通りのセットアップが終わったので、例はショボいですが実際の開発に近い形で動作確認を行います。


### ブランチを切って作業

まずここまでの作業はリモート (GitHub) に push しておきます。

次に作業用のブランチを切ります。

```bash
$ git checkout -b monosugoi-feature
```


### Buttonのスタイルを変更

`padding` と `font-size` を変更します。もちろん作業中は Storybook で動作確認しながら。

```diff:src/Button.js
 export const Button = ({ children, primary }) => (
   <button
     style={{
       display: 'inline-block',
-      padding: '0 2em',
+      padding: '0 3em',
       height: 50,
       borderRadius: 50,
       borderStyle: 'solid',
       borderColor: primary ? '#00c4a7' : '#adadad',
       background: primary ? '#00c4a7' : '#fff',
       color: primary ? '#fff' : '#363636',
-      font: 'normal 16px/50px sans-serif',
+      font: 'normal 14px/50px sans-serif',
       textRendering: 'optimizeLegibility',
     }}
   >
```



### Pull Request を送る

`<Button />` のスタイル変更をコミットしてリモートに push します。

```bash
$ git commit -am "Update button styles"
$ git push origin monosugoi-feature
```

push したら GitHub 上で master に向けて PR を作成します。

---

CircleCI 上での Visual Regression Testing が完了したら、次のように PR に reg-suit が結果をレポートしてくれます。

![PRにreg-suitが結果をレポートしてくれる]({{% image "pull-request.png" %}})

> 画像撮影したのが Merge したあとですが気にしないでください...

実際の PR は https://github.com/tsuyoshiwada/scs-with-reg-viz/pull/1 です。

さらにレポート用の HTML を確認すると、次のように視覚的に変更の差分を確認することができます。

![reg-suitのレポート]({{% image "reg-suit-summary.png" %}})

対象の画像を選択することで詳細に差分を確認出来るので分かりやすいです。

![reg-suitの差分詳細]({{% image "reg-suit-detail.png" %}})

あとは、レビュワーが変更内容を確認して問題無いようなら Approve するだけで OK です。仮に変更内容に意図しない差分が含まれる場合は、ここで修正する、といったフローになります。





## おわりに

自分の備忘録的に纏めた側面があるため、できるだけ詳細にと思って書いたら長くなってしまいましたが、既に Storybook のセットアップが出来ている環境なら短時間で導入可能です。  
個人的には UI の変更に恐怖心を抱く前に、是非導入すべき仕組みだと感じます。

---

便利な reg-suit を作ってくれた [@Quramy][quramy] さん、[@bokuweb][bokuweb] さんには感謝感激です。  
[@Quramy][quramy] さんは storybook-chrome-screenshot の [Angular 対応](https://github.com/tsuyoshiwada/storybook-chrome-screenshot/pull/21) もしていただりしました。

{{% tweet "951460726178070528" %}}

また、Vue.js のサポートを実装している際、[@kazu_pon](https://twitter.com/kazu_pon) さんにアドバイスいただきました。

皆さんにこの場を借りて、お礼申し上げます :)
