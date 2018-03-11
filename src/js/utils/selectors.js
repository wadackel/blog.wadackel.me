export const $ = (selector, context = null) => {
  if (!selector) return undefined;
  return (context == null ? document : context).querySelector(selector);
};

export const $$ = (selector, context = null) => {
  if (!selector) return undefined;
  return (context == null ? document : context).querySelectorAll(selector);
};

export const matches = (el, selector) => {
  const m = (el.document || el.ownerDocument).querySelectorAll(selector);
  let i = m.length;
  while (--i >= 0 && m.item(i) !== el); // eslint-disable-line no-plusplus
  return i > -1;
};
