---
title:  "記事投稿のテスト"
category: jekyll
---

記事投稿のテストです。

```js
const sweetScroll = new SweetScroll();
const hash = window.location.hash;
let needsInitialScroll = false;

document.addEventListener("DOMContentLoaded", function() {
  needsInitialScroll = document.getElementById(hash.substr(1)) != null;
  if (needsInitialScroll) {
    window.location.hash = "";
  }
}, false);

window.addEventListener("load", function() {
  if (needsInitialScroll) {
    sweetScroll.to(hash, {updateURL: true});
  }
}, false);
```

```html
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
  <meta name="description" content="{% if page.excerpt %}{{ page.excerpt | strip_html | strip_newlines | truncate: 160 }}{% else %}{{ site.description }}{% endif %}">
  <meta name="format-detection" content="telephone=no,address=no,email=no">
  <meta property="og:locale" content="ja_JP" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="__TODO__" />
  <meta property="og:description" content="__TODO__" />
  <meta property="og:url" content="__TODO__" />
  <meta property="og:site_name" content="__TODO__" />
  <meta property="og:image" content="__TODO__" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:description" content="__TODO__" />
  <meta name="twitter:title" content="__TODO__" />
  <meta name="twitter:site" content="@wadackel" />
  <meta name="twitter:image" content="__TODO__" />
  <title>{% if page.title %}{{ page.title | escape }}{% else %}{{ site.title | escape }}{% endif %}</title>
  <link rel="canonical" href="{{ page.url | replace:'index.html','' | prepend: site.baseurl | prepend: site.url }}">
  <link rel="alternate" type="application/rss+xml" title="{{ site.title }}" href="{{ "/feed.xml" | prepend: site.baseurl | prepend: site.url }}">
  <link rel="me" href="https://twitter.com/wadackel">
  <link rel="shortcut icon" href="{{ "/favicon.co" | prepend: site.baseurl }}">
  <link rel="stylesheet" href="{{ "/assets/css/style.css" | prepend: site.baseurl }}">
</head>
```


```css
* {
  margin: 0;
  padding: 0;
}

body {
  font-size: 12px;
}

@media screen and (max-width: 210px) {
  html {
    font-size: 14px;
  }
}
```
