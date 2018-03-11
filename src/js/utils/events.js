const SUPPORTS_PASSIVE_OPTIONS = (() => {
  let enablePassive = false;

  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() { // eslint-disable-line getter-return
        enablePassive = true;
      },
    });
    window.addEventListener('test', null, opts);
  } catch (e) {} // eslint-disable-line no-empty

  return enablePassive;
})();

export const addEvent = (el, event, listener, options) => {
  const events = event.split(',');
  const opts = SUPPORTS_PASSIVE_OPTIONS ? options : options.capture;

  events.forEach((eventName) => {
    el.addEventListener(eventName.trim(), listener, opts);
  });
};

export const removeEvent = (el, event, listener, options) => {
  const events = event.split(',');
  const opts = SUPPORTS_PASSIVE_OPTIONS ? options : options.capture;

  events.forEach((eventName) => {
    el.removeEventListener(eventName.trim(), listener, opts);
  });
};
