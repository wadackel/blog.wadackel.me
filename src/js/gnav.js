import {$, $$, matches} from "./utils/selectors"
import {addEvent, removeEvent} from "./utils/events"

const WHEEL_EVENT = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
const CLOSE_EVENTS = [WHEEL_EVENT, "touchmove"].join(",");

export default class Gnav {
  constructor() {
    this.status = Gnav.Status.CLOSE;
    this.$el = $("[data-gnav]");
    this.$trigger = $("[data-gnav-trigger]");
    this.$bg = $("[data-gnav-bg]");
    this.$html = $("html");
    this.bindEvents();
  }

  toggle() {
    if (this.status == Gnav.Status.CLOSE) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    this.status = Gnav.Status.OPEN;
    this.$html.classList.add("is-gnav-open");
    this.bindCloseEvents();
  }

  close() {
    this.status = Gnav.Status.CLOSE;
    this.$html.classList.remove("is-gnav-open");
    this.unbindCloseEvents();
  }

  bindEvents() {
    const handlers = [
      "handleClick",
      "handleBgClick",
      "handleWheel",
      "handleTriggerClick",
      "handleDocWheel",
      "handleDocClick"
    ];

    handlers.forEach((handler) => {
      this[handler] = this[handler].bind(this);
    });

    addEvent(this.$el, "click", this.handleClick);
    addEvent(this.$bg, "click", this.handleBgClick);
    addEvent(this.$trigger, "click", this.handleTriggerClick);
  }

  bindCloseEvents() {
    addEvent(this.$el, CLOSE_EVENTS, this.handleWheel);
    addEvent(document, CLOSE_EVENTS, this.handleDocWheel);
    addEvent(document, "click", this.handleDocClick);
  }

  unbindCloseEvents() {
    removeEvent(this.$el, CLOSE_EVENTS, this.handleWheel);
    removeEvent(document, CLOSE_EVENTS, this.handleDocWheel);
    removeEvent(document, "click", this.handleDocClick);
  }

  handleClick(e) {
    e.stopPropagation();
  }

  handleBgClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleWheel(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleTriggerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggle();
  }

  handleDocWheel() {
    this.close();
  }

  handleDocClick(e) {
    e.preventDefault();
    this.close();
  }
}

Gnav.Status = {
  OPEN: 1,
  CLOSE: 2
};
