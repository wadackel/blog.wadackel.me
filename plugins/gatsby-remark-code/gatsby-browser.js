exports.onClientEntry = () => {
  const select = (el) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const clear = (el) => {
    document.activeElement.blur();
    el.focus();
    window.getSelection().removeAllRanges();
  };

  const copy = () => {
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    }
  };

  window.copyHighlightCode = (e) => {
    const trigger = e.currentTarget;
    const tooltip = trigger.querySelector('.highlight_copy_tooltip');
    const controls = trigger.getAttribute('aria-controls');
    const target = document.getElementById(controls);

    select(target);

    const succeeded = copy();

    if (succeeded) {
      clear(trigger);
      tooltip.textContent = 'Copied!!';
    } else {
      tooltip.textContent = 'Error...';
    }

    trigger.classList.add('is-active');
    tooltip.classList.add('is-active');

    setTimeout(() => {
      trigger.classList.remove('is-active');
      tooltip.classList.remove('is-active');
    }, 1200);
  };
};
