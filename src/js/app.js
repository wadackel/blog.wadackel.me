import attachFastClick from "fastclick"
import Clipboard from "clipboard"
import SweetScroll from "sweet-scroll"
import Gnav from "./gnav"
import {$, $$, matches} from "./utils/selectors"
import {addEvent, removeEvent} from "./utils/events"

attachFastClick(document.body);

new SweetScroll({
  duration: 1200
});



addEvent(document, "DOMContentLoaded", () => {
  const $html = $("html");


  // Code block
  const $codeBlocks = $$("pre code");

  function initializeCodeBlock($el, index) {
    const id = `highlight-${index}`;
    const $pre = $el.parentNode;
    const filename = $el.className.match(/language-.+:(.+)/);

    $pre.id = id;

    // filename
    if (filename) {
      $el.className = $el.className.replace(/(language-.+)(:.+)/, "$1");
      $pre.insertAdjacentHTML("afterbegin", `<span class="highlight-filename">${filename[1]}</span>`);
    }

    // btn copy
    $pre.insertAdjacentHTML("afterbegin", `<span class="highlight-copy" data-clipboard-target="#${id}"><span class="highlight-copy__msg"></span></span>`);

    hljs.highlightBlock($el);
  }

  if ($codeBlocks) {
    Array.prototype.slice.call($codeBlocks).forEach(initializeCodeBlock);
  }


  // Copy code
  const clipboard = new Clipboard(".highlight-copy", {
    target(trigger) {
      const $pre = $(trigger.getAttribute("data-clipboard-target"));
      const $code = $("code", $pre);
      return $code;
    }
  });

  function clipboardMsg(trigger, msg, timeout = 1200) {
    const $msg = $(".highlight-copy__msg", trigger);
    $msg.textContent = msg;
    $msg.classList.add("is-active");
    trigger.classList.add("is-active");
    setTimeout(() => {
      $msg.classList.remove("is-active");
      trigger.classList.remove("is-active");
    }, timeout);
  }

  clipboard.on("success", (e) => {
    clipboardMsg(e.trigger, "Copied!!");
    e.clearSelection();
  });

  clipboard.on("error", (e) => {
    clipboardMsg(e.trigger, "Error...");
  });


  // Gnav
  new Gnav();
});
