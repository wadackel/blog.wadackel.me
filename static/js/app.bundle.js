!function t(e,n,i){function o(a,l){if(!n[a]){if(!e[a]){var c="function"==typeof require&&require;if(!l&&c)return c(a,!0);if(r)return r(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var u=n[a]={exports:{}};e[a][0].call(u.exports,function(t){var n=e[a][1][t];return o(n?n:t)},u,u.exports,t,e,n,i)}return n[a].exports}for(var r="function"==typeof require&&require,a=0;a<i.length;a++)o(i[a]);return o}({1:[function(t,e,n){!function(i,o){if("function"==typeof define&&define.amd)define(["module","select"],o);else if("undefined"!=typeof n)o(e,t("select"));else{var r={exports:{}};o(r,i.select),i.clipboardAction=r.exports}}(this,function(t,e){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=n(e),r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t},a=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),l=function(){function t(e){i(this,t),this.resolveOptions(e),this.initSelection()}return t.prototype.resolveOptions=function(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.action=t.action,this.emitter=t.emitter,this.target=t.target,this.text=t.text,this.trigger=t.trigger,this.selectedText=""},t.prototype.initSelection=function(){this.text?this.selectFake():this.target&&this.selectTarget()},t.prototype.selectFake=function(){var t=this,e="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandler=document.body.addEventListener("click",function(){return t.removeFake()}),this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="fixed",this.fakeElem.style[e?"right":"left"]="-9999px",this.fakeElem.style.top=(window.pageYOffset||document.documentElement.scrollTop)+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,document.body.appendChild(this.fakeElem),this.selectedText=(0,o["default"])(this.fakeElem),this.copyText()},t.prototype.removeFake=function(){this.fakeHandler&&(document.body.removeEventListener("click"),this.fakeHandler=null),this.fakeElem&&(document.body.removeChild(this.fakeElem),this.fakeElem=null)},t.prototype.selectTarget=function(){this.selectedText=(0,o["default"])(this.target),this.copyText()},t.prototype.copyText=function(){var t=void 0;try{t=document.execCommand(this.action)}catch(e){t=!1}this.handleResult(t)},t.prototype.handleResult=function(t){t?this.emitter.emit("success",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)}):this.emitter.emit("error",{action:this.action,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})},t.prototype.clearSelection=function(){this.target&&this.target.blur(),window.getSelection().removeAllRanges()},t.prototype.destroy=function(){this.removeFake()},a(t,[{key:"action",set:function(){var t=arguments.length<=0||void 0===arguments[0]?"copy":arguments[0];if(this._action=t,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function(){return this._action}},{key:"target",set:function(t){if(void 0!==t){if(!t||"object"!==("undefined"==typeof t?"undefined":r(t))||1!==t.nodeType)throw new Error('Invalid "target" value, use a valid Element');if("copy"===this.action&&t.hasAttribute("disabled"))throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');if("cut"===this.action&&(t.hasAttribute("readonly")||t.hasAttribute("disabled")))throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');this._target=t}},get:function(){return this._target}}]),t}();t.exports=l})},{select:9}],2:[function(t,e,n){!function(i,o){if("function"==typeof define&&define.amd)define(["module","./clipboard-action","tiny-emitter","good-listener"],o);else if("undefined"!=typeof n)o(e,t("./clipboard-action"),t("tiny-emitter"),t("good-listener"));else{var r={exports:{}};o(r,i.clipboardAction,i.tinyEmitter,i.goodListener),i.clipboard=r.exports}}(this,function(t,e,n,i){"use strict";function o(t){return t&&t.__esModule?t:{"default":t}}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function c(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}var s=o(e),u=o(n),h=o(i),f=function(t){function e(n,i){r(this,e);var o=a(this,t.call(this));return o.resolveOptions(i),o.listenClick(n),o}return l(e,t),e.prototype.resolveOptions=function(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.action="function"==typeof t.action?t.action:this.defaultAction,this.target="function"==typeof t.target?t.target:this.defaultTarget,this.text="function"==typeof t.text?t.text:this.defaultText},e.prototype.listenClick=function(t){var e=this;this.listener=(0,h["default"])(t,"click",function(t){return e.onClick(t)})},e.prototype.onClick=function(t){var e=t.delegateTarget||t.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new s["default"]({action:this.action(e),target:this.target(e),text:this.text(e),trigger:e,emitter:this})},e.prototype.defaultAction=function(t){return c("action",t)},e.prototype.defaultTarget=function(t){var e=c("target",t);return e?document.querySelector(e):void 0},e.prototype.defaultText=function(t){return c("text",t)},e.prototype.destroy=function(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)},e}(u["default"]);t.exports=f})},{"./clipboard-action":1,"good-listener":7,"tiny-emitter":11}],3:[function(t,e,n){var i=t("matches-selector");e.exports=function(t,e,n){for(var o=n?t:t.parentNode;o&&o!==document;){if(i(o,e))return o;o=o.parentNode}}},{"matches-selector":8}],4:[function(t,e,n){function i(t,e,n,i,r){var a=o.apply(this,arguments);return t.addEventListener(n,a,r),{destroy:function(){t.removeEventListener(n,a,r)}}}function o(t,e,n,i){return function(n){n.delegateTarget=r(n.target,e,!0),n.delegateTarget&&i.call(t,n)}}var r=t("closest");e.exports=i},{closest:3}],5:[function(t,e,n){!function(){"use strict";/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */
function t(e,n){function o(t,e){return function(){return t.apply(e,arguments)}}var r;if(n=n||{},this.trackingClick=!1,this.trackingClickStart=0,this.targetElement=null,this.touchStartX=0,this.touchStartY=0,this.lastTouchIdentifier=0,this.touchBoundary=n.touchBoundary||10,this.layer=e,this.tapDelay=n.tapDelay||200,this.tapTimeout=n.tapTimeout||700,!t.notNeeded(e)){for(var a=["onMouse","onClick","onTouchStart","onTouchMove","onTouchEnd","onTouchCancel"],l=this,c=0,s=a.length;s>c;c++)l[a[c]]=o(l[a[c]],l);i&&(e.addEventListener("mouseover",this.onMouse,!0),e.addEventListener("mousedown",this.onMouse,!0),e.addEventListener("mouseup",this.onMouse,!0)),e.addEventListener("click",this.onClick,!0),e.addEventListener("touchstart",this.onTouchStart,!1),e.addEventListener("touchmove",this.onTouchMove,!1),e.addEventListener("touchend",this.onTouchEnd,!1),e.addEventListener("touchcancel",this.onTouchCancel,!1),Event.prototype.stopImmediatePropagation||(e.removeEventListener=function(t,n,i){var o=Node.prototype.removeEventListener;"click"===t?o.call(e,t,n.hijacked||n,i):o.call(e,t,n,i)},e.addEventListener=function(t,n,i){var o=Node.prototype.addEventListener;"click"===t?o.call(e,t,n.hijacked||(n.hijacked=function(t){t.propagationStopped||n(t)}),i):o.call(e,t,n,i)}),"function"==typeof e.onclick&&(r=e.onclick,e.addEventListener("click",function(t){r(t)},!1),e.onclick=null)}}var n=navigator.userAgent.indexOf("Windows Phone")>=0,i=navigator.userAgent.indexOf("Android")>0&&!n,o=/iP(ad|hone|od)/.test(navigator.userAgent)&&!n,r=o&&/OS 4_\d(_\d)?/.test(navigator.userAgent),a=o&&/OS [6-7]_\d/.test(navigator.userAgent),l=navigator.userAgent.indexOf("BB10")>0;t.prototype.needsClick=function(t){switch(t.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(t.disabled)return!0;break;case"input":if(o&&"file"===t.type||t.disabled)return!0;break;case"label":case"iframe":case"video":return!0}return/\bneedsclick\b/.test(t.className)},t.prototype.needsFocus=function(t){switch(t.nodeName.toLowerCase()){case"textarea":return!0;case"select":return!i;case"input":switch(t.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return!1}return!t.disabled&&!t.readOnly;default:return/\bneedsfocus\b/.test(t.className)}},t.prototype.sendClick=function(t,e){var n,i;document.activeElement&&document.activeElement!==t&&document.activeElement.blur(),i=e.changedTouches[0],n=document.createEvent("MouseEvents"),n.initMouseEvent(this.determineEventType(t),!0,!0,window,1,i.screenX,i.screenY,i.clientX,i.clientY,!1,!1,!1,!1,0,null),n.forwardedTouchEvent=!0,t.dispatchEvent(n)},t.prototype.determineEventType=function(t){return i&&"select"===t.tagName.toLowerCase()?"mousedown":"click"},t.prototype.focus=function(t){var e;o&&t.setSelectionRange&&0!==t.type.indexOf("date")&&"time"!==t.type&&"month"!==t.type?(e=t.value.length,t.setSelectionRange(e,e)):t.focus()},t.prototype.updateScrollParent=function(t){var e,n;if(e=t.fastClickScrollParent,!e||!e.contains(t)){n=t;do{if(n.scrollHeight>n.offsetHeight){e=n,t.fastClickScrollParent=n;break}n=n.parentElement}while(n)}e&&(e.fastClickLastScrollTop=e.scrollTop)},t.prototype.getTargetElementFromEventTarget=function(t){return t.nodeType===Node.TEXT_NODE?t.parentNode:t},t.prototype.onTouchStart=function(t){var e,n,i;if(t.targetTouches.length>1)return!0;if(e=this.getTargetElementFromEventTarget(t.target),n=t.targetTouches[0],o){if(i=window.getSelection(),i.rangeCount&&!i.isCollapsed)return!0;if(!r){if(n.identifier&&n.identifier===this.lastTouchIdentifier)return t.preventDefault(),!1;this.lastTouchIdentifier=n.identifier,this.updateScrollParent(e)}}return this.trackingClick=!0,this.trackingClickStart=t.timeStamp,this.targetElement=e,this.touchStartX=n.pageX,this.touchStartY=n.pageY,t.timeStamp-this.lastClickTime<this.tapDelay&&t.preventDefault(),!0},t.prototype.touchHasMoved=function(t){var e=t.changedTouches[0],n=this.touchBoundary;return Math.abs(e.pageX-this.touchStartX)>n||Math.abs(e.pageY-this.touchStartY)>n},t.prototype.onTouchMove=function(t){return this.trackingClick?((this.targetElement!==this.getTargetElementFromEventTarget(t.target)||this.touchHasMoved(t))&&(this.trackingClick=!1,this.targetElement=null),!0):!0},t.prototype.findControl=function(t){return void 0!==t.control?t.control:t.htmlFor?document.getElementById(t.htmlFor):t.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")},t.prototype.onTouchEnd=function(t){var e,n,l,c,s,u=this.targetElement;if(!this.trackingClick)return!0;if(t.timeStamp-this.lastClickTime<this.tapDelay)return this.cancelNextClick=!0,!0;if(t.timeStamp-this.trackingClickStart>this.tapTimeout)return!0;if(this.cancelNextClick=!1,this.lastClickTime=t.timeStamp,n=this.trackingClickStart,this.trackingClick=!1,this.trackingClickStart=0,a&&(s=t.changedTouches[0],u=document.elementFromPoint(s.pageX-window.pageXOffset,s.pageY-window.pageYOffset)||u,u.fastClickScrollParent=this.targetElement.fastClickScrollParent),l=u.tagName.toLowerCase(),"label"===l){if(e=this.findControl(u)){if(this.focus(u),i)return!1;u=e}}else if(this.needsFocus(u))return t.timeStamp-n>100||o&&window.top!==window&&"input"===l?(this.targetElement=null,!1):(this.focus(u),this.sendClick(u,t),o&&"select"===l||(this.targetElement=null,t.preventDefault()),!1);return o&&!r&&(c=u.fastClickScrollParent,c&&c.fastClickLastScrollTop!==c.scrollTop)?!0:(this.needsClick(u)||(t.preventDefault(),this.sendClick(u,t)),!1)},t.prototype.onTouchCancel=function(){this.trackingClick=!1,this.targetElement=null},t.prototype.onMouse=function(t){return this.targetElement?t.forwardedTouchEvent?!0:t.cancelable&&(!this.needsClick(this.targetElement)||this.cancelNextClick)?(t.stopImmediatePropagation?t.stopImmediatePropagation():t.propagationStopped=!0,t.stopPropagation(),t.preventDefault(),!1):!0:!0},t.prototype.onClick=function(t){var e;return this.trackingClick?(this.targetElement=null,this.trackingClick=!1,!0):"submit"===t.target.type&&0===t.detail?!0:(e=this.onMouse(t),e||(this.targetElement=null),e)},t.prototype.destroy=function(){var t=this.layer;i&&(t.removeEventListener("mouseover",this.onMouse,!0),t.removeEventListener("mousedown",this.onMouse,!0),t.removeEventListener("mouseup",this.onMouse,!0)),t.removeEventListener("click",this.onClick,!0),t.removeEventListener("touchstart",this.onTouchStart,!1),t.removeEventListener("touchmove",this.onTouchMove,!1),t.removeEventListener("touchend",this.onTouchEnd,!1),t.removeEventListener("touchcancel",this.onTouchCancel,!1)},t.notNeeded=function(t){var e,n,o,r;if("undefined"==typeof window.ontouchstart)return!0;if(n=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1]){if(!i)return!0;if(e=document.querySelector("meta[name=viewport]")){if(-1!==e.content.indexOf("user-scalable=no"))return!0;if(n>31&&document.documentElement.scrollWidth<=window.outerWidth)return!0}}if(l&&(o=navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/),o[1]>=10&&o[2]>=3&&(e=document.querySelector("meta[name=viewport]")))){if(-1!==e.content.indexOf("user-scalable=no"))return!0;if(document.documentElement.scrollWidth<=window.outerWidth)return!0}return"none"===t.style.msTouchAction||"manipulation"===t.style.touchAction?!0:(r=+(/Firefox\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1],r>=27&&(e=document.querySelector("meta[name=viewport]"),e&&(-1!==e.content.indexOf("user-scalable=no")||document.documentElement.scrollWidth<=window.outerWidth))?!0:"none"===t.style.touchAction||"manipulation"===t.style.touchAction)},t.attach=function(e,n){return new t(e,n)},"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return t}):"undefined"!=typeof e&&e.exports?(e.exports=t.attach,e.exports.FastClick=t):window.FastClick=t}()},{}],6:[function(t,e,n){n.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},n.nodeList=function(t){var e=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===e||"[object HTMLCollection]"===e)&&"length"in t&&(0===t.length||n.node(t[0]))},n.string=function(t){return"string"==typeof t||t instanceof String},n.fn=function(t){var e=Object.prototype.toString.call(t);return"[object Function]"===e}},{}],7:[function(t,e,n){function i(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!l.string(e))throw new TypeError("Second argument must be a String");if(!l.fn(n))throw new TypeError("Third argument must be a Function");if(l.node(t))return o(t,e,n);if(l.nodeList(t))return r(t,e,n);if(l.string(t))return a(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function o(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function r(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function a(t,e,n){return c(document.body,t,e,n)}var l=t("./is"),c=t("delegate");e.exports=i},{"./is":6,delegate:4}],8:[function(t,e,n){function i(t,e){if(r)return r.call(t,e);for(var n=t.parentNode.querySelectorAll(e),i=0;i<n.length;++i)if(n[i]==t)return!0;return!1}var o=Element.prototype,r=o.matchesSelector||o.webkitMatchesSelector||o.mozMatchesSelector||o.msMatchesSelector||o.oMatchesSelector;e.exports=i},{}],9:[function(t,e,n){function i(t){var e;if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName)t.focus(),t.setSelectionRange(0,t.value.length),e=t.value;else{t.hasAttribute("contenteditable")&&t.focus();var n=window.getSelection(),i=document.createRange();i.selectNodeContents(t),n.removeAllRanges(),n.addRange(i),e=n.toString()}return e}e.exports=i},{}],10:[function(t,e,n){/*!
 * sweet-scroll
 * Modern and the sweet smooth scroll library.
 * 
 * @author tsuyoshiwada
 * @homepage https://github.com/tsuyoshiwada/sweet-scroll
 * @license MIT
 * @version 0.6.2
 */
!function(t,i){"object"==typeof n&&"undefined"!=typeof e?e.exports=i():"function"==typeof define&&define.amd?define(i):t.SweetScroll=i()}(this,function(){"use strict";function t(t){return null==t?t+"":"object"===("undefined"==typeof t?"undefined":at["typeof"](t))||"function"==typeof t?st[Object.prototype.toString.call(t)]||"object":"undefined"==typeof t?"undefined":at["typeof"](t)}function e(t){return Array.isArray(t)}function n(t){var e=null==t?null:t.length;return o(e)&&e>=0&&lt>=e}function i(n){return!e(n)&&"object"===t(n)}function o(e){return"number"===t(e)}function r(e){return"string"===t(e)}function a(e){return"function"===t(e)}function l(t){return!e(t)&&t-parseFloat(t)+1>=0}function c(t,e){return t&&t.hasOwnProperty(e)}function s(t){for(var e=arguments.length,n=Array(e>1?e-1:0),i=1;e>i;i++)n[i-1]=arguments[i];return u(n,function(e){u(e,function(e,n){t[n]=e})}),t}function u(t,e,o){if(null==t)return t;if(o=o||t,i(t)){for(var r in t)if(c(t,r)&&e.call(o,t[r],r)===!1)break}else if(n(t)){var a=void 0,l=t.length;for(a=0;l>a&&e.call(o,t[a],a)!==!1;a++);}return t}function h(t){return t.replace(/\s*/g,"")||""}function f(t){var e=arguments.length<=1||void 0===arguments[1]?null:arguments[1];if(t)return(null==e?document:e).querySelector(t)}function d(t){var e=arguments.length<=1||void 0===arguments[1]?null:arguments[1];if(t)return(null==e?document:e).querySelectorAll(t)}function p(t,e){for(var n=(t.document||t.ownerDocument).querySelectorAll(e),i=n.length;--i>=0&&n.item(i)!==t;);return i>-1}function v(t){var e=document;return t===e.documentElement||t===e.body}function g(t){for(var e=arguments.length<=1||void 0===arguments[1]?"y":arguments[1],n=arguments.length<=2||void 0===arguments[2]?!0:arguments[2],i=ut[e],o=t instanceof Element?[t]:d(t),r=[],a=document.createElement("div"),l=0;l<o.length;l++){var c=o[l];if(c[i]>0?r.push(c):(a.style.width=c.clientWidth+1+"px",a.style.height=c.clientHeight+1+"px",c.appendChild(a),c[i]=1,c[i]>0&&r.push(c),c[i]=0,c.removeChild(a)),!n&&r.length>0)break}return r}function m(t,e){var n=g(t,e,!1);return n.length>=1?n[0]:void 0}function y(t){return null!=t&&t===t.window?t:9===t.nodeType&&t.defaultView}function k(t){return Math.max(t.scrollHeight,t.clientHeight,t.offsetHeight)}function b(t){return Math.max(t.scrollWidth,t.clientWidth,t.offsetWidth)}function E(t){return{width:b(t),height:k(t)}}function C(){return{width:Math.max(b(document.body),b(document.documentElement)),height:Math.max(k(document.body),k(document.documentElement))}}function S(t){return v(t)?{viewport:{width:Math.min(window.innerWidth,document.documentElement.clientWidth),height:window.innerHeight},size:C()}:{viewport:{width:t.clientWidth,height:t.clientHeight},size:E(t)}}function w(t){var e=arguments.length<=1||void 0===arguments[1]?"y":arguments[1],n=y(t);return n?n[ht[e]]:t[ut[e]]}function T(t,e){var n=arguments.length<=2||void 0===arguments[2]?"y":arguments[2],i=y(t),o="y"===n;i?i.scrollTo(o?i[ht.x]:e,o?e:i[ht.y]):t[ut[n]]=e}function x(t){var e=arguments.length<=1||void 0===arguments[1]?null:arguments[1];if(!t||t&&!t.getClientRects().length)return{top:0,left:0};var n=t.getBoundingClientRect();if(n.width||n.height){var i={},o=void 0;if(null==e||v(e))o=t.ownerDocument.documentElement,i.top=window.pageYOffset,i.left=window.pageXOffset;else{o=e;var r=o.getBoundingClientRect();i.top=-1*r.top+o.scrollTop,i.left=-1*r.left+o.scrollLeft}return{top:n.top+i.top-o.clientTop,left:n.left+i.left-o.clientLeft}}return n}function L(t,e,n){var i=e.split(",");i.forEach(function(e){t.addEventListener(e.trim(),n,!1)})}function O(t,e,n){var i=e.split(",");i.forEach(function(e){t.removeEventListener(e.trim(),n,!1)})}function _(t){return t}function A(t,e,n,i,o){return i*(e/=o)*e+n}function M(t,e,n,i,o){return-i*(e/=o)*(e-2)+n}function D(t,e,n,i,o){return(e/=o/2)<1?i/2*e*e+n:-i/2*(--e*(e-2)-1)+n}function P(t,e,n,i,o){return i*(e/=o)*e*e+n}function I(t,e,n,i,o){return i*((e=e/o-1)*e*e+1)+n}function N(t,e,n,i,o){return(e/=o/2)<1?i/2*e*e*e+n:i/2*((e-=2)*e*e+2)+n}function j(t,e,n,i,o){return i*(e/=o)*e*e*e+n}function $(t,e,n,i,o){return-i*((e=e/o-1)*e*e*e-1)+n}function F(t,e,n,i,o){return(e/=o/2)<1?i/2*e*e*e*e+n:-i/2*((e-=2)*e*e*e-2)+n}function W(t,e,n,i,o){return i*(e/=o)*e*e*e*e+n}function q(t,e,n,i,o){return i*((e=e/o-1)*e*e*e*e+1)+n}function H(t,e,n,i,o){return(e/=o/2)<1?i/2*e*e*e*e*e+n:i/2*((e-=2)*e*e*e*e+2)+n}function R(t,e,n,i,o){return-i*pt(e/o*(bt/2))+i+n}function B(t,e,n,i,o){return i*vt(e/o*(bt/2))+n}function z(t,e,n,i,o){return-i/2*(pt(bt*e/o)-1)+n}function X(t,e,n,i,o){return 0===e?n:i*gt(2,10*(e/o-1))+n}function Y(t,e,n,i,o){return e===o?n+i:i*(-gt(2,-10*e/o)+1)+n}function Q(t,e,n,i,o){return 0===e?n:e===o?n+i:(e/=o/2)<1?i/2*gt(2,10*(e-1))+n:i/2*(-gt(2,-10*--e)+2)+n}function U(t,e,n,i,o){return-i*(yt(1-(e/=o)*e)-1)+n}function V(t,e,n,i,o){return i*yt(1-(e=e/o-1)*e)+n}function J(t,e,n,i,o){return(e/=o/2)<1?-i/2*(yt(1-e*e)-1)+n:i/2*(yt(1-(e-=2)*e)+1)+n}function G(t,e,n,i,o){var r=1.70158,a=0,l=i;return 0===e?n:1===(e/=o)?n+i:(a||(a=.3*o),l<mt(i)?(l=i,r=a/4):r=a/(2*bt)*kt(i/l),-(l*gt(2,10*(e-=1))*vt((e*o-r)*(2*bt)/a))+n)}function K(t,e,n,i,o){var r=1.70158,a=0,l=i;return 0===e?n:1===(e/=o)?n+i:(a||(a=.3*o),l<mt(i)?(l=i,r=a/4):r=a/(2*bt)*kt(i/l),l*gt(2,-10*e)*vt((e*o-r)*(2*bt)/a)+i+n)}function Z(t,e,n,i,o){var r=1.70158,a=0,l=i;return 0===e?n:2===(e/=o/2)?n+i:(a||(a=o*(.3*1.5)),l<mt(i)?(l=i,r=a/4):r=a/(2*bt)*kt(i/l),1>e?-.5*(l*gt(2,10*(e-=1))*vt((e*o-r)*(2*bt)/a))+n:l*gt(2,-10*(e-=1))*vt((e*o-r)*(2*bt)/a)*.5+i+n)}function tt(t,e,n,i,o){var r=arguments.length<=5||void 0===arguments[5]?1.70158:arguments[5];return i*(e/=o)*e*((r+1)*e-r)+n}function et(t,e,n,i,o){var r=arguments.length<=5||void 0===arguments[5]?1.70158:arguments[5];return i*((e=e/o-1)*e*((r+1)*e+r)+1)+n}function nt(t,e,n,i,o){var r=arguments.length<=5||void 0===arguments[5]?1.70158:arguments[5];return(e/=o/2)<1?i/2*(e*e*(((r*=1.525)+1)*e-r))+n:i/2*((e-=2)*e*(((r*=1.525)+1)*e+r)+2)+n}function it(t,e,n,i,o){return i-ot(t,o-e,0,i,o)+n}function ot(t,e,n,i,o){return(e/=o)<1/2.75?i*(7.5625*e*e)+n:2/2.75>e?i*(7.5625*(e-=1.5/2.75)*e+.75)+n:2.5/2.75>e?i*(7.5625*(e-=2.25/2.75)*e+.9375)+n:i*(7.5625*(e-=2.625/2.75)*e+.984375)+n}function rt(t,e,n,i,o){return o/2>e?.5*it(t,2*e,0,i,o)+n:.5*ot(t,2*e-o,0,i,o)+.5*i+n}var at={};at["typeof"]="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t},at.classCallCheck=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},at.createClass=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}();var lt=Math.pow(2,53)-1,ct=["Boolean","Number","String","Function","Array","Object"],st={};ct.forEach(function(t){st["[object "+t+"]"]=t.toLowerCase()});var ut={y:"scrollTop",x:"scrollLeft"},ht={y:"pageYOffset",x:"pageXOffset"},ft=function(){var t=navigator.userAgent;return-1===t.indexOf("Android 2.")&&-1===t.indexOf("Android 4.0")||-1===t.indexOf("Mobile Safari")||-1!==t.indexOf("Chrome")||-1!==t.indexOf("Windows Phone")?window.history&&"pushState"in window.history&&"file:"!==window.location.protocol:!1}(),dt=Math,pt=dt.cos,vt=dt.sin,gt=dt.pow,mt=dt.abs,yt=dt.sqrt,kt=dt.asin,bt=dt.PI,Et=Object.freeze({linear:_,InQuad:A,OutQuad:M,InOutQuad:D,InCubic:P,OutCubic:I,InOutCubic:N,InQuart:j,OutQuart:$,InOutQuart:F,InQuint:W,OutQuint:q,InOutQuint:H,InSine:R,OutSine:B,InOutSine:z,InExpo:X,OutExpo:Y,InOutExpo:Q,InCirc:U,OutCirc:V,InOutCirc:J,InElastic:G,OutElastic:K,InOutElastic:Z,InBack:tt,OutBack:et,InOutBack:nt,InBounce:it,OutBounce:ot,InOutBounce:rt}),Ct=0,St=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(t){var e=Date.now(),n=Math.max(0,16-(e-Ct)),i=window.setTimeout(function(){t(e+n)},n);return Ct=e+n,i},wt=function(){function t(e){at.classCallCheck(this,t),this.el=e,this.props={},this.progress=!1,this.startTime=null}return at.createClass(t,[{key:"run",value:function(t,e,n,i,o){var r=this,a=arguments.length<=5||void 0===arguments[5]?function(){}:arguments[5];this.progress||(this.props={x:t,y:e},this.duration=n,this.delay=i,this.easing=o.replace("ease",""),this.callback=a,this.progress=!0,setTimeout(function(){r.startProps={x:w(r.el,"x"),y:w(r.el,"y")},St(function(t){return r._loop(t)})},i))}},{key:"stop",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];this.startTime=null,this.progress=!1,t&&(T(this.el,this.props.x,"x"),T(this.el,this.props.y,"y")),a(this.callback)&&(this.callback(),this.callback=null)}},{key:"_loop",value:function(t){var e=this;if(this.startTime||(this.startTime=t),!this.progress)return void this.stop(!1);var n=this.el,i=this.props,o=this.duration,r=this.startTime,a=this.startProps,l={},c=Et[this.easing],s=t-r,h=Math.min(1,Math.max(s/o,0));u(i,function(t,e){var n=a[e],i=t-n;if(0===i)return!0;var r=c(h,o*h,0,1,o);l[e]=Math.round(n+i*r)}),u(l,function(t,e){T(n,t,e)}),o>=s?St(function(t){return e._loop(t)}):this.stop(!0)}}]),t}(),Tt=window,xt=document,Lt="onwheel"in xt?"wheel":"onmousewheel"in xt?"mousewheel":"DOMMouseScroll",Ot=Lt+", touchstart, touchmove",_t="DOMContentLoaded",At=!1;L(xt,_t,function(){At=!0});var Mt=function(){function t(){var e=this,n=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],i=arguments.length<=1||void 0===arguments[1]?"body, html":arguments[1];at.classCallCheck(this,t);var o=s({},t.defaults,n);this.options=o,this.getContainer(i,function(t){e.container=t,e.header=f(o.header),e.tween=new wt(t),e._trigger=null,e._shouldCallCancelScroll=!1,e.bindContainerClick(),e.hook(o,"initialized")})}return at.createClass(t,[{key:"to",value:function(t){var e=this,n=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],i=this.container,o=this.header,a=s({},this.options,n);this._options=a;var l=this.parseCoodinate(a.offset),c=this._trigger,u=this.parseCoodinate(t),h=null;if(this._trigger=null,this._shouldCallCancelScroll=!1,this.stop(),i){if(!u&&r(t))if(h=/^#/.test(t)?t:null,"#"===t)u={top:0,left:0};else{var d=f(t),p=x(d,i);if(!p)return;u=p}if(u){l&&(u.top+=l.top,u.left+=l.left),o&&(u.top=Math.max(0,u.top-E(o).height));var v=S(i),g=v.viewport,m=v.size;this.hook(a,"beforeScroll",u,c)!==!1&&(u.top=a.verticalScroll?Math.max(0,Math.min(m.height-g.height,u.top)):w(i,"y"),u.left=a.horizontalScroll?Math.max(0,Math.min(m.width-g.width,u.left)):w(i,"x"),this.tween.run(u.left,u.top,a.duration,a.delay,a.easing,function(){null!=h&&h!==window.location.hash&&a.updateURL&&e.updateURLHash(h),e.unbindContainerStop(),e._options=null,e._shouldCallCancelScroll?e.hook(a,"cancelScroll"):e.hook(a,"afterScroll",u,c),e.hook(a,"completeScroll",e._shouldCallCancelScroll)}),this.bindContainerStop())}}}},{key:"toTop",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];this.to(t,s({},e,{verticalScroll:!0,horizontalScroll:!1}))}},{key:"toLeft",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];this.to(t,s({},e,{verticalScroll:!1,horizontalScroll:!0}))}},{key:"toElement",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];if(t instanceof Element){var n=x(t,this.container);this.to(n,s({},e))}}},{key:"stop",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!1:arguments[0];this._stopScrollListener&&(this._shouldCallCancelScroll=!0),this.tween.stop(t)}},{key:"update",value:function(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.stop(),this.unbindContainerClick(),this.unbindContainerStop(),this.options=s({},this.options,t),this.header=f(this.options.header),this.bindContainerClick()}},{key:"destroy",value:function(){this.stop(),this.unbindContainerClick(),this.unbindContainerStop(),this.container=null,this.header=null,this.tween=null}},{key:"initialized",value:function(){}},{key:"beforeScroll",value:function(t,e){return!0}},{key:"cancelScroll",value:function(){}},{key:"afterScroll",value:function(t,e){}},{key:"completeScroll",value:function(t){}},{key:"parseCoodinate",value:function(t){var n=this._options?this._options.verticalScroll:this.options.verticalScroll,i={top:0,left:0};if(c(t,"top")||c(t,"left"))i=s(i,t);else if(e(t))2===t.length?(i.top=t[0],i.left=t[1]):(i.top=n?t[0]:0,i.left=n?0:t[0]);else if(l(t))i.top=n?t:0,i.left=n?0:t;else{if(!r(t))return null;if(t=h(t),/^\d+,\d+$/.test(t))t=t.split(","),i.top=t[0],i.left=t[1];else if(/^(top|left):\d+,?(?:(top|left):\d+)?$/.test(t)){var o=t.match(/top:(\d+)/),a=t.match(/left:(\d+)/);i.top=o?o[1]:0,i.left=a?a[1]:0}else{if(!this.container||!/^(\+|-)=(\d+)$/.test(t))return null;var u=w(this.container,n?"y":"x"),f=t.match(/^(\+|-)\=(\d+)$/),d=f[1],p=parseInt(f[2],10);"+"===d?(i.top=n?u+p:0,i.left=n?0:u+p):(i.top=n?u-p:0,i.left=n?0:u-p)}}return i.top=parseInt(i.top,10),i.left=parseInt(i.left,10),i}},{key:"updateURLHash",value:function(t){ft&&window.history.pushState(null,null,t)}},{key:"getContainer",value:function(t,e){var n=this,i=this.options,o=i.verticalScroll,r=i.horizontalScroll,a=void 0;o&&(a=m(t,"y")),!a&&r&&(a=m(t,"x")),a||At?e.call(this,a):!function(){var i=!1;L(xt,_t,function(){i=!0,n.getContainer(t,e)}),L(Tt,"load",function(){i||n.getContainer(t,e)})}()}},{key:"bindContainerClick",value:function(){var t=this.container;t&&(this._containerClickListener=this.handleContainerClick.bind(this),L(t,"click",this._containerClickListener))}},{key:"unbindContainerClick",value:function(){var t=this.container;t&&this._containerClickListener&&(O(t,"click",this._containerClickListener),this._containerClickListener=null)}},{key:"bindContainerStop",value:function(){var t=this.container;t&&(this._stopScrollListener=this.handleStopScroll.bind(this),L(t,Ot,this._stopScrollListener))}},{key:"unbindContainerStop",value:function(){var t=this.container;t&&this._stopScrollListener&&(O(t,Ot,this._stopScrollListener),this._stopScrollListener=null)}},{key:"hook",value:function(t,e){for(var n=t[e],i=arguments.length,o=Array(i>2?i-2:0),r=2;i>r;r++)o[r-2]=arguments[r];if(a(n)){var l=n.apply(this,o);if(void 0!==l)return l}return this[e].apply(this,o)}},{key:"handleStopScroll",value:function(t){var e=this._options?this._options.stopScroll:this.options.stopScroll;e?this.stop():t.preventDefault()}},{key:"handleContainerClick",value:function(t){for(var e=this.options,n=t.target;n&&n!==xt;n=n.parentNode)if(p(n,e.trigger)){var i=n.getAttribute("data-scroll"),o=this.parseDataOptions(n),r=i||n.getAttribute("href");e=s({},e,o),e.preventDefault&&t.preventDefault(),e.stopPropagation&&t.stopPropagation(),this._trigger=n,e.horizontalScroll&&e.verticalScroll?this.to(r,e):e.verticalScroll?this.toTop(r,e):e.horizontalScroll&&this.toLeft(r,e)}}},{key:"parseDataOptions",value:function(t){var e=t.getAttribute("data-scroll-options");return e?JSON.parse(e):{}}}]),t}();return Mt.defaults={trigger:"[data-scroll]",header:"[data-scroll-header]",duration:1e3,delay:0,easing:"easeOutQuint",offset:0,verticalScroll:!0,horizontalScroll:!1,stopScroll:!0,updateURL:!1,preventDefault:!0,stopPropagation:!0,initialized:null,beforeScroll:null,afterScroll:null,cancelScroll:null,completeScroll:null},Mt})},{}],11:[function(t,e,n){function i(){}i.prototype={on:function(t,e,n){var i=this.e||(this.e={});return(i[t]||(i[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function i(){o.off(t,i),e.apply(n,arguments)}var o=this;return i._=e,this.on(t,i,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),i=0,o=n.length;for(i;o>i;i++)n[i].fn.apply(n[i].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),i=n[t],o=[];if(i&&e)for(var r=0,a=i.length;a>r;r++)i[r].fn!==e&&i[r].fn._!==e&&o.push(i[r]);return o.length?n[t]=o:delete n[t],this}},e.exports=i},{}],12:[function(t,e,n){"use strict";function i(t){return t&&t.__esModule?t:{"default":t}}var o=t("fastclick"),r=i(o),a=t("clipboard"),l=i(a),c=t("sweet-scroll"),s=i(c),u=t("./gnav"),h=i(u),f=t("./utils/selectors"),d=t("./utils/events");(0,r["default"])(document.body),new s["default"]({duration:1200}),(0,d.addEvent)(document,"DOMContentLoaded",function(){function t(t,e){var n="highlight-"+e,i=t.parentNode,o=t.className.match(/language-.+:(.+)/);i.id=n,o&&(t.className=t.className.replace(/(language-.+)(:.+)/,"$1"),i.insertAdjacentHTML("afterbegin",'<span class="highlight-filename">'+o[1]+"</span>")),i.insertAdjacentHTML("afterbegin",'<span class="highlight-copy" data-clipboard-target="#'+n+'"><span class="highlight-copy__msg"></span></span>'),hljs.highlightBlock(t)}function e(t,e){var n=arguments.length<=2||void 0===arguments[2]?1200:arguments[2],i=(0,f.$)(".highlight-copy__msg",t);i.textContent=e,i.classList.add("is-active"),t.classList.add("is-active"),setTimeout(function(){i.classList.remove("is-active"),t.classList.remove("is-active")},n)}var n=((0,f.$)("html"),(0,f.$$)("pre code"));n&&Array.prototype.slice.call(n).forEach(t);var i=new l["default"](".highlight-copy",{target:function(t){var e=(0,f.$)(t.getAttribute("data-clipboard-target")),n=(0,f.$)("code",e);return n}});i.on("success",function(t){e(t.trigger,"Copied!!"),t.clearSelection()}),i.on("error",function(t){e(t.trigger,"Error...")}),new h["default"]})},{"./gnav":13,"./utils/events":14,"./utils/selectors":15,clipboard:2,fastclick:5,"sweet-scroll":10}],13:[function(t,e,n){"use strict";function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(n,"__esModule",{value:!0});var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),r=t("./utils/selectors"),a=t("./utils/events"),l="onwheel"in document?"wheel":"onmousewheel"in document?"mousewheel":"DOMMouseScroll",c=[l,"touchmove"].join(","),s=function(){function t(){i(this,t),this.status=t.Status.CLOSE,this.$el=(0,r.$)("[data-gnav]"),this.$trigger=(0,r.$)("[data-gnav-trigger]"),this.$bg=(0,r.$)("[data-gnav-bg]"),this.$html=(0,r.$)("html"),this.bindEvents()}return o(t,[{key:"toggle",value:function(){this.status==t.Status.CLOSE?this.open():this.close()}},{key:"open",value:function(){this.status=t.Status.OPEN,this.$html.classList.add("is-gnav-open"),this.bindCloseEvents()}},{key:"close",value:function(){this.status=t.Status.CLOSE,this.$html.classList.remove("is-gnav-open"),this.unbindCloseEvents()}},{key:"bindEvents",value:function(){var t=this,e=["handleClick","handleBgClick","handleWheel","handleTriggerClick","handleDocWheel","handleDocClick"];e.forEach(function(e){t[e]=t[e].bind(t)}),(0,a.addEvent)(this.$el,"click",this.handleClick),(0,a.addEvent)(this.$bg,"click",this.handleBgClick),(0,a.addEvent)(this.$trigger,"click",this.handleTriggerClick)}},{key:"bindCloseEvents",value:function(){(0,a.addEvent)(this.$el,c,this.handleWheel),(0,a.addEvent)(document,c,this.handleDocWheel),(0,a.addEvent)(document,"click",this.handleDocClick)}},{key:"unbindCloseEvents",value:function(){(0,a.removeEvent)(this.$el,c,this.handleWheel),(0,a.removeEvent)(document,c,this.handleDocWheel),(0,a.removeEvent)(document,"click",this.handleDocClick)}},{key:"handleClick",value:function(t){t.stopPropagation()}},{key:"handleBgClick",value:function(t){t.preventDefault(),t.stopPropagation()}},{key:"handleWheel",value:function(t){t.preventDefault(),t.stopPropagation()}},{key:"handleTriggerClick",value:function(t){t.preventDefault(),t.stopPropagation(),this.toggle()}},{key:"handleDocWheel",value:function(){this.close()}},{key:"handleDocClick",value:function(t){t.preventDefault(),this.close()}}]),t}();n["default"]=s,s.Status={OPEN:1,CLOSE:2}},{"./utils/events":14,"./utils/selectors":15}],14:[function(t,e,n){"use strict";function i(t,e,n){var i=e.split(",");i.forEach(function(e){t.addEventListener(e.trim(),n,!1)})}function o(t,e,n){var i=e.split(",");i.forEach(function(e){t.removeEventListener(e.trim(),n,!1)})}Object.defineProperty(n,"__esModule",{value:!0}),n.addEvent=i,n.removeEvent=o},{}],15:[function(t,e,n){"use strict";function i(t){var e=arguments.length<=1||void 0===arguments[1]?null:arguments[1];if(t)return(null==e?document:e).querySelector(t)}function o(t){var e=arguments.length<=1||void 0===arguments[1]?null:arguments[1];if(t)return(null==e?document:e).querySelectorAll(t)}function r(t,e){for(var n=(t.document||t.ownerDocument).querySelectorAll(e),i=n.length;--i>=0&&n.item(i)!==t;);return i>-1}Object.defineProperty(n,"__esModule",{value:!0}),n.$=i,n.$$=o,n.matches=r},{}]},{},[12]);