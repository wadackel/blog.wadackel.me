---
title: 'IntersectionObserver を扱う React Hooks を作った'
date: '2019-03-24'
---

## はじめに

気になってはいたけど、特に触ることなく過ごしていた [React Hooks](https://reactjs.org/docs/hooks-intro.html) なのですが、最近少しずつですが仕事でも趣味でも導入を始めました。

最近 Lazy Image 的な実装をすることがあったので、React Hooks で置き換えてみようと思い、練習がてら `IntersectionObserver` を簡単に扱うための Custom Hook を作ってみました。

## 作ったもの

`use-intersection` というライブラリを作成しました。以下リポジトリです。

> use-intersection  
> https://github.com/cats-oss/use-intersection

npm にパッケージとして公開しているため、

```bash
$ yarn add use-intersection
```

でインストールできます。

## 使い方

監視対象である `ref` を受け取り、要素が `root` 要素 (デフォルトは Viewport) に交差しているかどうかの真偽値を返す実装となっています。

<!-- prettier-ignore-start -->
```javascript:Component.tsx
import * as React from 'react';
import { useIntersection } from 'use-intersection';

const Component: React.FC = () => {
  const target = React.useRef<HTMLDivElement>(null);
  const intersecting = useIntersection(target);

  return <div ref={target}>{intersecting ? 'visible' : 'invisible'}</div>;
};
```
<!-- prettier-ignore-end -->

もともとそれほど複雑な処理ではありませんが、さくっと使えて気に入っています。

ちなみに、内部的には `useEffect` で `IntersectionObserver` を使うので、SSR 時でもエラーにはならないです。

### Lazy Image を実装してみる

冒頭に書いた、Lazy Image を実装しようとすると最低限のコードでは次のようになります。

<!-- prettier-ignore-start -->
```javascript:LazyImage.tsx
import * as React from 'react';
import { useIntersection } from 'use-intersection';

const LazyImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const target = React.useRef<HTMLDivElement>(null);
  const intersected = useIntersection(target, {
    rootMargin: '250px', // Viewport に入る上下左右 250px で交差したと判断する
    once: true,          // 一度でも交差した段階で IntersectionObserver の監視を止める
  });

  return intersected ? <img {...props} /> : <span />;
};
```
<!-- prettier-ignore-end -->

## React Hooks 所感

関数が状態を持ち、class のようにライフサイクルが明示されている訳ではなく、React 内部に隠蔽されているため、ぱっと見の気持ち悪さは感じたものの、書き心地という面での体験が良かったです。

実際、今回作った `use-intersection` の実装も型定義を含めても 60 行程度の小さなコードでおさまっています。

`IntersectionObserver` を使うだけのシンプルな I/F なら、以下のようにかなり小さく書くことができます。

<!-- prettier-ignore-start -->
```javascript:最小限のコード例
export const useIntersection = (ref) => {
  const [intersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    });

    observer.observe(ref.current);

    return () => {
      observer.unobserve(ref.current);
    };
  });

  return intersecting;
};
```
<!-- prettier-ignore-end -->

実際のコードはこれにオプションの扱いを足したりしているためもう少しだけ複雑ですが、Class Component で同様の処理を書くよりもぐっと簡潔なコードになると思います。

---

また、他の方の記事でも紹介されているように、React Hooks を使用するとロジックを切り出しやすいので、コンポーネント内は View にのみ専念するといった責務分離がしやすい印象です。  
個人的には HoC と比較して型安全に書きやすいのも魅力だなぁーと感じました。

Class Component を使うまでもないかな、というコンポーネントに対して積極的に使ってみようと思います。
