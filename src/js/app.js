import attachFastClick from "fastclick"
import Clipboard from "clipboard"
import SweetScroll from "sweet-scroll"
import {$, $$, matches} from "./utils/selectors"
import {addEvent, removeEvent} from "./utils/events"


attachFastClick(document.body);

new SweetScroll({
  duration: 1200
});



addEvent(document, "DOMContentLoaded", () => {
  const $html = $("html");


  // Copy code
  const clipboard = new Clipboard(".highlight__copy", {
    target(trigger) {
      const $pre = $(trigger.getAttribute("data-clipboard-target"));
      const $code = $("code", $pre);
      return $code;
    }
  });

  function clipboardMsg(trigger, msg, timeout = 1200) {
    const $msg = $(".highlight__copy__msg", trigger);
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
  const $gnav = $("[data-gnav]");
  const $gnavTrigger = $("[data-gnav-trigger]");

  addEvent($gnavTrigger, "click", (e) => {
    e.preventDefault();
    $html.classList.toggle("is-gnav-open");
  });
}, false);
