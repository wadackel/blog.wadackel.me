(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'select'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */

        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        ClipboardAction.prototype.resolveOptions = function resolveOptions() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            this.action = options.action;
            this.emitter = options.emitter;
            this.target = options.target;
            this.text = options.text;
            this.trigger = options.trigger;

            this.selectedText = '';
        };

        ClipboardAction.prototype.initSelection = function initSelection() {
            if (this.text) {
                this.selectFake();
            } else if (this.target) {
                this.selectTarget();
            }
        };

        ClipboardAction.prototype.selectFake = function selectFake() {
            var _this = this;

            var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

            this.removeFake();

            this.fakeHandler = document.body.addEventListener('click', function () {
                return _this.removeFake();
            });

            this.fakeElem = document.createElement('textarea');
            // Prevent zooming on iOS
            this.fakeElem.style.fontSize = '12pt';
            // Reset box model
            this.fakeElem.style.border = '0';
            this.fakeElem.style.padding = '0';
            this.fakeElem.style.margin = '0';
            // Move element out of screen horizontally
            this.fakeElem.style.position = 'fixed';
            this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
            // Move element to the same position vertically
            this.fakeElem.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
            this.fakeElem.setAttribute('readonly', '');
            this.fakeElem.value = this.text;

            document.body.appendChild(this.fakeElem);

            this.selectedText = (0, _select2.default)(this.fakeElem);
            this.copyText();
        };

        ClipboardAction.prototype.removeFake = function removeFake() {
            if (this.fakeHandler) {
                document.body.removeEventListener('click');
                this.fakeHandler = null;
            }

            if (this.fakeElem) {
                document.body.removeChild(this.fakeElem);
                this.fakeElem = null;
            }
        };

        ClipboardAction.prototype.selectTarget = function selectTarget() {
            this.selectedText = (0, _select2.default)(this.target);
            this.copyText();
        };

        ClipboardAction.prototype.copyText = function copyText() {
            var succeeded = undefined;

            try {
                succeeded = document.execCommand(this.action);
            } catch (err) {
                succeeded = false;
            }

            this.handleResult(succeeded);
        };

        ClipboardAction.prototype.handleResult = function handleResult(succeeded) {
            if (succeeded) {
                this.emitter.emit('success', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            } else {
                this.emitter.emit('error', {
                    action: this.action,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        };

        ClipboardAction.prototype.clearSelection = function clearSelection() {
            if (this.target) {
                this.target.blur();
            }

            window.getSelection().removeAllRanges();
        };

        ClipboardAction.prototype.destroy = function destroy() {
            this.removeFake();
        };

        _createClass(ClipboardAction, [{
            key: 'action',
            set: function set() {
                var action = arguments.length <= 0 || arguments[0] === undefined ? 'copy' : arguments[0];

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});
},{"select":9}],2:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './clipboard-action', 'tiny-emitter', 'good-listener'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */

        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, _Emitter.call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        Clipboard.prototype.resolveOptions = function resolveOptions() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
            this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
            this.text = typeof options.text === 'function' ? options.text : this.defaultText;
        };

        Clipboard.prototype.listenClick = function listenClick(trigger) {
            var _this2 = this;

            this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                return _this2.onClick(e);
            });
        };

        Clipboard.prototype.onClick = function onClick(e) {
            var trigger = e.delegateTarget || e.currentTarget;

            if (this.clipboardAction) {
                this.clipboardAction = null;
            }

            this.clipboardAction = new _clipboardAction2.default({
                action: this.action(trigger),
                target: this.target(trigger),
                text: this.text(trigger),
                trigger: trigger,
                emitter: this
            });
        };

        Clipboard.prototype.defaultAction = function defaultAction(trigger) {
            return getAttributeValue('action', trigger);
        };

        Clipboard.prototype.defaultTarget = function defaultTarget(trigger) {
            var selector = getAttributeValue('target', trigger);

            if (selector) {
                return document.querySelector(selector);
            }
        };

        Clipboard.prototype.defaultText = function defaultText(trigger) {
            return getAttributeValue('text', trigger);
        };

        Clipboard.prototype.destroy = function destroy() {
            this.listener.destroy();

            if (this.clipboardAction) {
                this.clipboardAction.destroy();
                this.clipboardAction = null;
            }
        };

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});
},{"./clipboard-action":1,"good-listener":7,"tiny-emitter":11}],3:[function(require,module,exports){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf) {
  var parent = checkYoSelf ? element : element.parentNode

  while (parent && parent !== document) {
    if (matches(parent, selector)) return parent;
    parent = parent.parentNode
  }
}

},{"matches-selector":8}],4:[function(require,module,exports){
var closest = require('closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector, true);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"closest":3}],5:[function(require,module,exports){
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

},{}],6:[function(require,module,exports){
/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};

},{}],7:[function(require,module,exports){
var is = require('./is');
var delegate = require('delegate');

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;

},{"./is":6,"delegate":4}],8:[function(require,module,exports){

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}
},{}],9:[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        element.focus();
        element.setSelectionRange(0, element.value.length);

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;

},{}],10:[function(require,module,exports){
/*!
 * sweet-scroll
 * Modern and the sweet smooth scroll library.
 * 
 * @author tsuyoshiwada
 * @homepage https://github.com/tsuyoshiwada/sweet-scroll
 * @license MIT
 * @version 0.6.2
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.SweetScroll = factory());
}(this, function () { 'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers;

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var classTypeList = ["Boolean", "Number", "String", "Function", "Array", "Object"];
  var classTypes = {};

  classTypeList.forEach(function (name) {
    classTypes["[object " + name + "]"] = name.toLowerCase();
  });

  function getType(obj) {
    if (obj == null) {
      return obj + "";
    }
    return (typeof obj === "undefined" ? "undefined" : babelHelpers.typeof(obj)) === "object" || typeof obj === "function" ? classTypes[Object.prototype.toString.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : babelHelpers.typeof(obj);
  }

  function isArray(obj) {
    return Array.isArray(obj);
  }

  function isArrayLike(obj) {
    var length = obj == null ? null : obj.length;
    return isNumber(length) && length >= 0 && length <= MAX_ARRAY_INDEX;
  }

  function isObject(obj) {
    return !isArray(obj) && getType(obj) === "object";
  }

  function isNumber(obj) {
    return getType(obj) === "number";
  }

  function isString(obj) {
    return getType(obj) === "string";
  }

  function isFunction(obj) {
    return getType(obj) === "function";
  }

  function isNumeric(obj) {
    return !isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
  }

  function hasProp(obj, key) {
    return obj && obj.hasOwnProperty(key);
  }

  function merge(obj) {
    for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      sources[_key - 1] = arguments[_key];
    }

    each(sources, function (source) {
      each(source, function (value, key) {
        obj[key] = value;
      });
    });
    return obj;
  }

  function each(obj, iterate, context) {
    if (obj == null) return obj;

    context = context || obj;

    if (isObject(obj)) {
      for (var key in obj) {
        if (!hasProp(obj, key)) continue;
        if (iterate.call(context, obj[key], key) === false) break;
      }
    } else if (isArrayLike(obj)) {
      var i = void 0,
          length = obj.length;
      for (i = 0; i < length; i++) {
        if (iterate.call(context, obj[i], i) === false) break;
      }
    }

    return obj;
  }

  function removeSpaces(str) {
    return str.replace(/\s*/g, "") || "";
  }

  function $(selector) {
    var context = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (!selector) return;
    return (context == null ? document : context).querySelector(selector);
  }

  function $$(selector) {
    var context = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (!selector) return;
    return (context == null ? document : context).querySelectorAll(selector);
  }

  function matches(el, selector) {
    var matches = (el.document || el.ownerDocument).querySelectorAll(selector);
    var i = matches.length;
    while (--i >= 0 && matches.item(i) !== el) {}
    return i > -1;
  }

  var directionMethodMap = {
    y: "scrollTop",
    x: "scrollLeft"
  };

  var directionPropMap = {
    y: "pageYOffset",
    x: "pageXOffset"
  };

  function isRootContainer(el) {
    var doc = document;
    return el === doc.documentElement || el === doc.body;
  }

  function getScrollable(selectors) {
    var direction = arguments.length <= 1 || arguments[1] === undefined ? "y" : arguments[1];
    var all = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    var method = directionMethodMap[direction];
    var elements = selectors instanceof Element ? [selectors] : $$(selectors);
    var scrollables = [];
    var $div = document.createElement("div");

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];

      if (el[method] > 0) {
        scrollables.push(el);
      } else {
        $div.style.width = el.clientWidth + 1 + "px";
        $div.style.height = el.clientHeight + 1 + "px";
        el.appendChild($div);

        el[method] = 1;
        if (el[method] > 0) {
          scrollables.push(el);
        }
        el[method] = 0;

        el.removeChild($div);
      }

      if (!all && scrollables.length > 0) break;
    }

    return scrollables;
  }

  function scrollableFind(selectors, direction) {
    var scrollables = getScrollable(selectors, direction, false);
    return scrollables.length >= 1 ? scrollables[0] : undefined;
  }

  function getWindow(el) {
    return el != null && el === el.window ? el : el.nodeType === 9 && el.defaultView;
  }

  function getHeight(el) {
    return Math.max(el.scrollHeight, el.clientHeight, el.offsetHeight);
  }

  function getWidth(el) {
    return Math.max(el.scrollWidth, el.clientWidth, el.offsetWidth);
  }

  function getSize(el) {
    return {
      width: getWidth(el),
      height: getHeight(el)
    };
  }

  function getDocumentSize() {
    return {
      width: Math.max(getWidth(document.body), getWidth(document.documentElement)),
      height: Math.max(getHeight(document.body), getHeight(document.documentElement))
    };
  }

  function getViewportAndElementSizes(el) {
    if (isRootContainer(el)) {
      return {
        viewport: {
          width: Math.min(window.innerWidth, document.documentElement.clientWidth),
          height: window.innerHeight
        },
        size: getDocumentSize()
      };
    }

    return {
      viewport: { width: el.clientWidth, height: el.clientHeight },
      size: getSize(el)
    };
  }

  function getScroll(el) {
    var direction = arguments.length <= 1 || arguments[1] === undefined ? "y" : arguments[1];

    var win = getWindow(el);
    return win ? win[directionPropMap[direction]] : el[directionMethodMap[direction]];
  }

  function setScroll(el, offset) {
    var direction = arguments.length <= 2 || arguments[2] === undefined ? "y" : arguments[2];

    var win = getWindow(el);
    var top = direction === "y";
    if (win) {
      win.scrollTo(!top ? offset : win[directionPropMap.x], top ? offset : win[directionPropMap.y]);
    } else {
      el[directionMethodMap[direction]] = offset;
    }
  }

  function getOffset(el) {
    var context = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (!el || el && !el.getClientRects().length) {
      return { top: 0, left: 0 };
    }
    var rect = el.getBoundingClientRect();
    if (rect.width || rect.height) {
      var scroll = {};
      var ctx = void 0;
      if (context == null || isRootContainer(context)) {
        ctx = el.ownerDocument.documentElement;
        scroll.top = window.pageYOffset;
        scroll.left = window.pageXOffset;
      } else {
        ctx = context;
        var ctxRect = ctx.getBoundingClientRect();
        scroll.top = ctxRect.top * -1 + ctx.scrollTop;
        scroll.left = ctxRect.left * -1 + ctx.scrollLeft;
      }
      return {
        top: rect.top + scroll.top - ctx.clientTop,
        left: rect.left + scroll.left - ctx.clientLeft
      };
    }
    return rect;
  }

  // @link https://github.com/Modernizr/Modernizr
  var pushState = function () {
    var ua = navigator.userAgent;
    if ((ua.indexOf("Android 2.") !== -1 || ua.indexOf("Android 4.0") !== -1) && ua.indexOf("Mobile Safari") !== -1 && ua.indexOf("Chrome") === -1 && ua.indexOf("Windows Phone") === -1) {
      return false;
    }
    return window.history && "pushState" in window.history && window.location.protocol !== "file:";
  }();

  function addEvent(el, event, listener) {
    var events = event.split(",");
    events.forEach(function (eventName) {
      el.addEventListener(eventName.trim(), listener, false);
    });
  }

  function removeEvent(el, event, listener) {
    var events = event.split(",");
    events.forEach(function (eventName) {
      el.removeEventListener(eventName.trim(), listener, false);
    });
  }

  var math = Math;
  var mathCos = math.cos;
  var mathSin = math.sin;
  var mathPow = math.pow;
  var mathAbs = math.abs;
  var mathSqrt = math.sqrt;
  var mathAsin = math.asin;
  var PI = math.PI;

  function linear(p) {
    return p;
  }

  function InQuad(x, t, b, c, d) {
    return c * (t /= d) * t + b;
  }

  function OutQuad(x, t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  }

  function InOutQuad(x, t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t + b;
    }
    return -c / 2 * (--t * (t - 2) - 1) + b;
  }

  function InCubic(x, t, b, c, d) {
    return c * (t /= d) * t * t + b;
  }

  function OutCubic(x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  }

  function InOutCubic(x, t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t * t + b;
    }
    return c / 2 * ((t -= 2) * t * t + 2) + b;
  }

  function InQuart(x, t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
  }

  function OutQuart(x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  }

  function InOutQuart(x, t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t * t * t + b;
    }
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
  }

  function InQuint(x, t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  }

  function OutQuint(x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  }

  function InOutQuint(x, t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t * t * t * t + b;
    }
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  }

  function InSine(x, t, b, c, d) {
    return -c * mathCos(t / d * (PI / 2)) + c + b;
  }

  function OutSine(x, t, b, c, d) {
    return c * mathSin(t / d * (PI / 2)) + b;
  }

  function InOutSine(x, t, b, c, d) {
    return -c / 2 * (mathCos(PI * t / d) - 1) + b;
  }

  function InExpo(x, t, b, c, d) {
    return t === 0 ? b : c * mathPow(2, 10 * (t / d - 1)) + b;
  }

  function OutExpo(x, t, b, c, d) {
    return t === d ? b + c : c * (-mathPow(2, -10 * t / d) + 1) + b;
  }

  function InOutExpo(x, t, b, c, d) {
    if (t === 0) return b;
    if (t === d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * mathPow(2, 10 * (t - 1)) + b;
    return c / 2 * (-mathPow(2, -10 * --t) + 2) + b;
  }

  function InCirc(x, t, b, c, d) {
    return -c * (mathSqrt(1 - (t /= d) * t) - 1) + b;
  }

  function OutCirc(x, t, b, c, d) {
    return c * mathSqrt(1 - (t = t / d - 1) * t) + b;
  }

  function InOutCirc(x, t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return -c / 2 * (mathSqrt(1 - t * t) - 1) + b;
    }
    return c / 2 * (mathSqrt(1 - (t -= 2) * t) + 1) + b;
  }

  function InElastic(x, t, b, c, d) {
    var s = 1.70158,
        p = 0,
        a = c;
    if (t === 0) return b;
    if ((t /= d) === 1) return b + c;
    if (!p) p = d * .3;
    if (a < mathAbs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * PI) * mathAsin(c / a);
    }
    return -(a * mathPow(2, 10 * (t -= 1)) * mathSin((t * d - s) * (2 * PI) / p)) + b;
  }

  function OutElastic(x, t, b, c, d) {
    var s = 1.70158,
        p = 0,
        a = c;
    if (t === 0) return b;
    if ((t /= d) === 1) return b + c;
    if (!p) p = d * .3;
    if (a < mathAbs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * PI) * mathAsin(c / a);
    }
    return a * mathPow(2, -10 * t) * mathSin((t * d - s) * (2 * PI) / p) + c + b;
  }

  function InOutElastic(x, t, b, c, d) {
    var s = 1.70158,
        p = 0,
        a = c;
    if (t === 0) return b;
    if ((t /= d / 2) === 2) return b + c;
    if (!p) p = d * (.3 * 1.5);
    if (a < mathAbs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * PI) * mathAsin(c / a);
    }
    if (t < 1) {
      return -.5 * (a * mathPow(2, 10 * (t -= 1)) * mathSin((t * d - s) * (2 * PI) / p)) + b;
    }
    return a * mathPow(2, -10 * (t -= 1)) * mathSin((t * d - s) * (2 * PI) / p) * .5 + c + b;
  }

  function InBack(x, t, b, c, d) {
    var s = arguments.length <= 5 || arguments[5] === undefined ? 1.70158 : arguments[5];

    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  }

  function OutBack(x, t, b, c, d) {
    var s = arguments.length <= 5 || arguments[5] === undefined ? 1.70158 : arguments[5];

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  }

  function InOutBack(x, t, b, c, d) {
    var s = arguments.length <= 5 || arguments[5] === undefined ? 1.70158 : arguments[5];

    if ((t /= d / 2) < 1) {
      return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
    }
    return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
  }

  function InBounce(x, t, b, c, d) {
    return c - OutBounce(x, d - t, 0, c, d) + b;
  }

  function OutBounce(x, t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
    }
  }

  function InOutBounce(x, t, b, c, d) {
    if (t < d / 2) {
      return InBounce(x, t * 2, 0, c, d) * .5 + b;
    }
    return OutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
  }

var Easing = Object.freeze({
    linear: linear,
    InQuad: InQuad,
    OutQuad: OutQuad,
    InOutQuad: InOutQuad,
    InCubic: InCubic,
    OutCubic: OutCubic,
    InOutCubic: InOutCubic,
    InQuart: InQuart,
    OutQuart: OutQuart,
    InOutQuart: InOutQuart,
    InQuint: InQuint,
    OutQuint: OutQuint,
    InOutQuint: InOutQuint,
    InSine: InSine,
    OutSine: OutSine,
    InOutSine: InOutSine,
    InExpo: InExpo,
    OutExpo: OutExpo,
    InOutExpo: InOutExpo,
    InCirc: InCirc,
    OutCirc: OutCirc,
    InOutCirc: InOutCirc,
    InElastic: InElastic,
    OutElastic: OutElastic,
    InOutElastic: InOutElastic,
    InBack: InBack,
    OutBack: OutBack,
    InOutBack: InOutBack,
    InBounce: InBounce,
    OutBounce: OutBounce,
    InOutBounce: InOutBounce
  });

  var lastTime = 0;

  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
    var currentTime = Date.now();
    var timeToCall = Math.max(0, 16 - (currentTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currentTime + timeToCall);
    }, timeToCall);
    lastTime = currentTime + timeToCall;
    return id;
  };

  var ScrollTween = function () {
    function ScrollTween(el) {
      babelHelpers.classCallCheck(this, ScrollTween);

      this.el = el;
      this.props = {};
      this.progress = false;
      this.startTime = null;
    }

    babelHelpers.createClass(ScrollTween, [{
      key: "run",
      value: function run(x, y, duration, delay, easing) {
        var _this = this;

        var callback = arguments.length <= 5 || arguments[5] === undefined ? function () {} : arguments[5];

        if (this.progress) return;
        this.props = { x: x, y: y };
        this.duration = duration;
        this.delay = delay;
        this.easing = easing.replace("ease", "");
        this.callback = callback;
        this.progress = true;

        setTimeout(function () {
          _this.startProps = {
            x: getScroll(_this.el, "x"),
            y: getScroll(_this.el, "y")
          };
          raf(function (time) {
            return _this._loop(time);
          });
        }, delay);
      }
    }, {
      key: "stop",
      value: function stop() {
        var gotoEnd = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

        this.startTime = null;
        this.progress = false;

        if (gotoEnd) {
          setScroll(this.el, this.props.x, "x");
          setScroll(this.el, this.props.y, "y");
        }

        if (isFunction(this.callback)) {
          this.callback();
          this.callback = null;
        }
      }
    }, {
      key: "_loop",
      value: function _loop(time) {
        var _this2 = this;

        if (!this.startTime) {
          this.startTime = time;
        }

        if (!this.progress) {
          this.stop(false);
          return;
        }

        var el = this.el;
        var props = this.props;
        var duration = this.duration;
        var startTime = this.startTime;
        var startProps = this.startProps;

        var toProps = {};
        var easing = Easing[this.easing];
        var timeElapsed = time - startTime;
        var t = Math.min(1, Math.max(timeElapsed / duration, 0));

        each(props, function (value, key) {
          var initialValue = startProps[key];
          var delta = value - initialValue;
          if (delta === 0) return true;

          var val = easing(t, duration * t, 0, 1, duration);
          toProps[key] = Math.round(initialValue + delta * val);
        });

        each(toProps, function (value, key) {
          setScroll(el, value, key);
        });

        timeElapsed <= duration ? raf(function (time) {
          return _this2._loop(time);
        }) : this.stop(true);
      }
    }]);
    return ScrollTween;
  }();

  var win = window;
  var doc = document;
  var WHEEL_EVENT = "onwheel" in doc ? "wheel" : "onmousewheel" in doc ? "mousewheel" : "DOMMouseScroll";
  var CONTAINER_STOP_EVENTS = WHEEL_EVENT + ", touchstart, touchmove";
  var DOM_CONTENT_LOADED = "DOMContentLoaded";
  var isDomContentLoaded = false;

  addEvent(doc, DOM_CONTENT_LOADED, function () {
    isDomContentLoaded = true;
  });

  var SweetScroll = function () {

    /**
     * SweetScroll constructor
     * @param {Object}
     * @param {String} | {Element}
     */

    function SweetScroll() {
      var _this = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var container = arguments.length <= 1 || arguments[1] === undefined ? "body, html" : arguments[1];
      babelHelpers.classCallCheck(this, SweetScroll);

      var params = merge({}, SweetScroll.defaults, options);
      this.options = params;
      this.getContainer(container, function (target) {
        _this.container = target;
        _this.header = $(params.header);
        _this.tween = new ScrollTween(target);
        _this._trigger = null;
        _this._shouldCallCancelScroll = false;
        _this.bindContainerClick();
        _this.hook(params, "initialized");
      });
    }

    /**
     * Scroll animation to the specified position
     * @param {Any}
     * @param {Object}
     * @return {Void}
     */


    // Default options


    babelHelpers.createClass(SweetScroll, [{
      key: "to",
      value: function to(distance) {
        var _this2 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var container = this.container;
        var header = this.header;

        var params = merge({}, this.options, options);

        // Temporary options
        this._options = params;

        var offset = this.parseCoodinate(params.offset);
        var trigger = this._trigger;
        var scroll = this.parseCoodinate(distance);
        var hash = null;

        // Remove the triggering elements which has been temporarily retained
        this._trigger = null;

        // Disable the call flag of `cancelScroll`
        this._shouldCallCancelScroll = false;

        // Stop current animation
        this.stop();

        // Does not move if the container is not found
        if (!container) return;

        // Using the coordinates in the case of CSS Selector
        if (!scroll && isString(distance)) {
          hash = /^#/.test(distance) ? distance : null;

          if (distance === "#") {
            scroll = { top: 0, left: 0 };
          } else {
            var target = $(distance);
            var targetOffset = getOffset(target, container);
            if (!targetOffset) return;
            scroll = targetOffset;
          }
        }

        if (!scroll) return;

        // Apply `offset` value
        if (offset) {
          scroll.top += offset.top;
          scroll.left += offset.left;
        }

        // If the header is present apply the height
        if (header) {
          scroll.top = Math.max(0, scroll.top - getSize(header).height);
        }

        // Determine the final scroll coordinates

        var _Dom$getViewportAndEl = getViewportAndElementSizes(container);

        var viewport = _Dom$getViewportAndEl.viewport;
        var size = _Dom$getViewportAndEl.size;

        // Call `beforeScroll`
        // Stop scrolling when it returns false

        if (this.hook(params, "beforeScroll", scroll, trigger) === false) {
          return;
        }

        // Adjustment of the maximum value
        scroll.top = params.verticalScroll ? Math.max(0, Math.min(size.height - viewport.height, scroll.top)) : getScroll(container, "y");
        scroll.left = params.horizontalScroll ? Math.max(0, Math.min(size.width - viewport.width, scroll.left)) : getScroll(container, "x");

        // Run the animation!!
        this.tween.run(scroll.left, scroll.top, params.duration, params.delay, params.easing, function () {
          // Update URL
          if (hash != null && hash !== window.location.hash && params.updateURL) {
            _this2.updateURLHash(hash);
          }

          // Unbind the scroll stop events, And call `afterScroll` or `cancelScroll`
          _this2.unbindContainerStop();

          // Remove the temporary options
          _this2._options = null;

          // Call `cancelScroll` or `afterScroll`
          if (_this2._shouldCallCancelScroll) {
            _this2.hook(params, "cancelScroll");
          } else {
            _this2.hook(params, "afterScroll", scroll, trigger);
          }

          // Call `completeScroll`
          _this2.hook(params, "completeScroll", _this2._shouldCallCancelScroll);
        });

        // Bind the scroll stop events
        this.bindContainerStop();
      }

      /**
       * Scroll animation to the specified top position
       * @param {Any}
       * @param {Object}
       * @return {Void}
       */

    }, {
      key: "toTop",
      value: function toTop(distance) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        this.to(distance, merge({}, options, {
          verticalScroll: true,
          horizontalScroll: false
        }));
      }

      /**
       * Scroll animation to the specified left position
       * @param {Any}
       * @param {Object}
       * @return {Void}
       */

    }, {
      key: "toLeft",
      value: function toLeft(distance) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        this.to(distance, merge({}, options, {
          verticalScroll: false,
          horizontalScroll: true
        }));
      }

      /**
       * Scroll animation to the specified element
       * @param {Element}
       * @param {Object}
       * @return {Void}
       */

    }, {
      key: "toElement",
      value: function toElement($el) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        if ($el instanceof Element) {
          var offset = getOffset($el, this.container);
          this.to(offset, merge({}, options));
        }
      }

      /**
       * Stop the current animation
       * @param {Boolean}
       * @return {Void}
       */

    }, {
      key: "stop",
      value: function stop() {
        var gotoEnd = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (this._stopScrollListener) {
          this._shouldCallCancelScroll = true;
        }
        this.tween.stop(gotoEnd);
      }

      /**
       * Update the instance
       * @param {Object}
       * @return {Void}
       */

    }, {
      key: "update",
      value: function update() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.stop();
        this.unbindContainerClick();
        this.unbindContainerStop();
        this.options = merge({}, this.options, options);
        this.header = $(this.options.header);
        this.bindContainerClick();
      }

      /**
       * Destroy SweetScroll instance
       * @param {Boolean}
       * @return {Void}
       */

    }, {
      key: "destroy",
      value: function destroy() {
        this.stop();
        this.unbindContainerClick();
        this.unbindContainerStop();
        this.container = null;
        this.header = null;
        this.tween = null;
      }

      /**
       * Called at after of the initialize.
       * @return {Void}
       */

    }, {
      key: "initialized",
      value: function initialized() {}

      /**
       * Called at before of the scroll.
       * @param {Object}
       * @param {Element}
       * @return {Boolean}
       */

    }, {
      key: "beforeScroll",
      value: function beforeScroll(toScroll, trigger) {
        return true;
      }

      /**
       * Called at cancel of the scroll.
       * @return {Void}
       */

    }, {
      key: "cancelScroll",
      value: function cancelScroll() {}

      /**
       * Called at after of the scroll.
       * @param {Object}
       * @param {Element}
       * @return {Void}
       */

    }, {
      key: "afterScroll",
      value: function afterScroll(toScroll, trigger) {}

      /**
       * Called at complete of the scroll.
       * @param {Boolean}
       * @return {Void}
       */

    }, {
      key: "completeScroll",
      value: function completeScroll(isCancel) {}

      /**
       * Parse the value of coordinate
       * @param {Any}
       * @return {Object}
       */

    }, {
      key: "parseCoodinate",
      value: function parseCoodinate(coodinate) {
        var enableTop = this._options ? this._options.verticalScroll : this.options.verticalScroll;
        var scroll = { top: 0, left: 0 };

        // Object
        if (hasProp(coodinate, "top") || hasProp(coodinate, "left")) {
          scroll = merge(scroll, coodinate);

          // Array
        } else if (isArray(coodinate)) {
            if (coodinate.length === 2) {
              scroll.top = coodinate[0];
              scroll.left = coodinate[1];
            } else {
              scroll.top = enableTop ? coodinate[0] : 0;
              scroll.left = !enableTop ? coodinate[0] : 0;
            }

            // Number
          } else if (isNumeric(coodinate)) {
              scroll.top = enableTop ? coodinate : 0;
              scroll.left = !enableTop ? coodinate : 0;

              // String
            } else if (isString(coodinate)) {
                coodinate = removeSpaces(coodinate);

                // "{n},{n}" (Array like syntax)
                if (/^\d+,\d+$/.test(coodinate)) {
                  coodinate = coodinate.split(",");
                  scroll.top = coodinate[0];
                  scroll.left = coodinate[1];

                  // "top:{n}, left:{n}" (Object like syntax)
                } else if (/^(top|left):\d+,?(?:(top|left):\d+)?$/.test(coodinate)) {
                    var top = coodinate.match(/top:(\d+)/);
                    var left = coodinate.match(/left:(\d+)/);
                    scroll.top = top ? top[1] : 0;
                    scroll.left = left ? left[1] : 0;

                    // "+={n}", "-={n}" (Relative position)
                  } else if (this.container && /^(\+|-)=(\d+)$/.test(coodinate)) {
                      var current = getScroll(this.container, enableTop ? "y" : "x");
                      var _matches = coodinate.match(/^(\+|-)\=(\d+)$/);
                      var op = _matches[1];
                      var value = parseInt(_matches[2], 10);
                      if (op === "+") {
                        scroll.top = enableTop ? current + value : 0;
                        scroll.left = !enableTop ? current + value : 0;
                      } else {
                        scroll.top = enableTop ? current - value : 0;
                        scroll.left = !enableTop ? current - value : 0;
                      }
                    } else {
                      return null;
                    }
              } else {
                return null;
              }

        scroll.top = parseInt(scroll.top, 10);
        scroll.left = parseInt(scroll.left, 10);

        return scroll;
      }

      /**
       * Update the Hash of the URL.
       * @param {String}
       * @return {Void}
       */

    }, {
      key: "updateURLHash",
      value: function updateURLHash(hash) {
        if (pushState) {
          window.history.pushState(null, null, hash);
        }
      }

      /**
       * Get the container for the scroll, depending on the options.
       * @param {String} | {Element}
       * @param {Function}
       * @return {Void}
       * @private
       */

    }, {
      key: "getContainer",
      value: function getContainer(selector, callback) {
        var _this3 = this;

        var _options = this.options;
        var verticalScroll = _options.verticalScroll;
        var horizontalScroll = _options.horizontalScroll;

        var container = void 0;

        if (verticalScroll) {
          container = scrollableFind(selector, "y");
        }

        if (!container && horizontalScroll) {
          container = scrollableFind(selector, "x");
        }

        if (!container && !isDomContentLoaded) {
          (function () {
            var isCompleted = false;

            addEvent(doc, DOM_CONTENT_LOADED, function () {
              isCompleted = true;
              _this3.getContainer(selector, callback);
            });

            // Fallback for DOMContentLoaded
            addEvent(win, "load", function () {
              if (!isCompleted) {
                _this3.getContainer(selector, callback);
              }
            });
          })();
        } else {
          callback.call(this, container);
        }
      }

      /**
       * Bind a click event to the container
       * @return {Void}
       * @private
       */

    }, {
      key: "bindContainerClick",
      value: function bindContainerClick() {
        var container = this.container;

        if (!container) return;
        this._containerClickListener = this.handleContainerClick.bind(this);
        addEvent(container, "click", this._containerClickListener);
      }

      /**
       * Unbind a click event to the container
       * @return {Void}
       * @private
       */

    }, {
      key: "unbindContainerClick",
      value: function unbindContainerClick() {
        var container = this.container;

        if (!container || !this._containerClickListener) return;
        removeEvent(container, "click", this._containerClickListener);
        this._containerClickListener = null;
      }

      /**
       * Bind the scroll stop of events
       * @return {Void}
       * @private
       */

    }, {
      key: "bindContainerStop",
      value: function bindContainerStop() {
        var container = this.container;

        if (!container) return;
        this._stopScrollListener = this.handleStopScroll.bind(this);
        addEvent(container, CONTAINER_STOP_EVENTS, this._stopScrollListener);
      }

      /**
       * Unbind the scroll stop of events
       * @return {Void}
       * @private
       */

    }, {
      key: "unbindContainerStop",
      value: function unbindContainerStop() {
        var container = this.container;

        if (!container || !this._stopScrollListener) return;
        removeEvent(container, CONTAINER_STOP_EVENTS, this._stopScrollListener);
        this._stopScrollListener = null;
      }

      /**
       * Call the specified callback
       * @param {Object}
       * @param {String}
       * @param {...Any}
       * @return {Void}
       * @private
       */

    }, {
      key: "hook",
      value: function hook(options, type) {
        var callback = options[type];

        // callback

        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        if (isFunction(callback)) {
          var result = callback.apply(this, args);
          if (result !== undefined) return result;
        }

        // method
        return this[type].apply(this, args);
      }

      /**
       * Handling of scroll stop event
       * @param {Event}
       * @return {Void}
       * @private
       */

    }, {
      key: "handleStopScroll",
      value: function handleStopScroll(e) {
        var stopScroll = this._options ? this._options.stopScroll : this.options.stopScroll;
        if (stopScroll) {
          this.stop();
        } else {
          e.preventDefault();
        }
      }

      /**
       * Handling of container click event
       * @param {Event}
       * @return {Void}
       * @private
       */

    }, {
      key: "handleContainerClick",
      value: function handleContainerClick(e) {
        var options = this.options;

        var el = e.target;

        // Explore parent element until the trigger selector matches
        for (; el && el !== doc; el = el.parentNode) {
          if (!matches(el, options.trigger)) continue;
          var data = el.getAttribute("data-scroll");
          var dataOptions = this.parseDataOptions(el);
          var href = data || el.getAttribute("href");

          options = merge({}, options, dataOptions);

          if (options.preventDefault) e.preventDefault();
          if (options.stopPropagation) e.stopPropagation();

          // Passes the trigger elements to callback
          this._trigger = el;

          if (options.horizontalScroll && options.verticalScroll) {
            this.to(href, options);
          } else if (options.verticalScroll) {
            this.toTop(href, options);
          } else if (options.horizontalScroll) {
            this.toLeft(href, options);
          }
        }
      }

      /**
       * Parse the data-scroll-options attribute
       * @param {Element}
       * @return {Object}
       * @private
       */

    }, {
      key: "parseDataOptions",
      value: function parseDataOptions(el) {
        var options = el.getAttribute("data-scroll-options");
        return options ? JSON.parse(options) : {};
      }
    }]);
    return SweetScroll;
  }();

  // Export SweetScroll class


  SweetScroll.defaults = {
    trigger: "[data-scroll]", // Selector for trigger (must be a valid css selector)
    header: "[data-scroll-header]", // Selector for fixed header (must be a valid css selector)
    duration: 1000, // Specifies animation duration in integer
    delay: 0, // Specifies timer for delaying the execution of the scroll in milliseconds
    easing: "easeOutQuint", // Specifies the pattern of easing
    offset: 0, // Specifies the value to offset the scroll position in pixels
    verticalScroll: true, // Enable the vertical scroll
    horizontalScroll: false, // Enable the horizontal scroll
    stopScroll: true, // When fired wheel or touchstart events to stop scrolling
    updateURL: false, // Update the URL hash on after scroll
    preventDefault: true, // Cancels the container element click event
    stopPropagation: true, // Prevents further propagation of the container element click event in the bubbling phase

    // Callbacks
    initialized: null,
    beforeScroll: null,
    afterScroll: null,
    cancelScroll: null,
    completeScroll: null
  };

  return SweetScroll;

}));
},{}],11:[function(require,module,exports){
function E () {
	// Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
	on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],12:[function(require,module,exports){
"use strict";

var _fastclick = require("fastclick");

var _fastclick2 = _interopRequireDefault(_fastclick);

var _clipboard = require("clipboard");

var _clipboard2 = _interopRequireDefault(_clipboard);

var _sweetScroll = require("sweet-scroll");

var _sweetScroll2 = _interopRequireDefault(_sweetScroll);

var _gnav = require("./gnav");

var _gnav2 = _interopRequireDefault(_gnav);

var _selectors = require("./utils/selectors");

var _events = require("./utils/events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _fastclick2.default)(document.body);

new _sweetScroll2.default({
  duration: 1200
});

(0, _events.addEvent)(document, "DOMContentLoaded", function () {
  var $html = (0, _selectors.$)("html");

  // Code block
  var $codeBlocks = (0, _selectors.$$)("pre code");

  function initializeCodeBlock($el, index) {
    var id = "highlight-" + index;
    var $pre = $el.parentNode;
    var filename = $el.className.match(/language-.+:(.+)/);

    $pre.id = id;

    // filename
    if (filename) {
      $el.className = $el.className.replace(/(language-.+)(:.+)/, "$1");
      $pre.insertAdjacentHTML("afterbegin", "<span class=\"highlight-filename\">" + filename[1] + "</span>");
    }

    // btn copy
    $pre.insertAdjacentHTML("afterbegin", "<span class=\"highlight-copy\" data-clipboard-target=\"#" + id + "\"><span class=\"highlight-copy__msg\"></span></span>");

    hljs.highlightBlock($el);
  }

  if ($codeBlocks) {
    Array.prototype.slice.call($codeBlocks).forEach(initializeCodeBlock);
  }

  // Copy code
  var clipboard = new _clipboard2.default(".highlight-copy", {
    target: function target(trigger) {
      var $pre = (0, _selectors.$)(trigger.getAttribute("data-clipboard-target"));
      var $code = (0, _selectors.$)("code", $pre);
      return $code;
    }
  });

  function clipboardMsg(trigger, msg) {
    var timeout = arguments.length <= 2 || arguments[2] === undefined ? 1200 : arguments[2];

    var $msg = (0, _selectors.$)(".highlight-copy__msg", trigger);
    $msg.textContent = msg;
    $msg.classList.add("is-active");
    trigger.classList.add("is-active");
    setTimeout(function () {
      $msg.classList.remove("is-active");
      trigger.classList.remove("is-active");
    }, timeout);
  }

  clipboard.on("success", function (e) {
    clipboardMsg(e.trigger, "Copied!!");
    e.clearSelection();
  });

  clipboard.on("error", function (e) {
    clipboardMsg(e.trigger, "Error...");
  });

  // Gnav
  new _gnav2.default();
});

},{"./gnav":13,"./utils/events":14,"./utils/selectors":15,"clipboard":2,"fastclick":5,"sweet-scroll":10}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _selectors = require("./utils/selectors");

var _events = require("./utils/events");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WHEEL_EVENT = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
var CLOSE_EVENTS = [WHEEL_EVENT, "touchmove"].join(",");

var Gnav = function () {
  function Gnav() {
    _classCallCheck(this, Gnav);

    this.status = Gnav.Status.CLOSE;
    this.$el = (0, _selectors.$)("[data-gnav]");
    this.$trigger = (0, _selectors.$)("[data-gnav-trigger]");
    this.$bg = (0, _selectors.$)("[data-gnav-bg]");
    this.$html = (0, _selectors.$)("html");
    this.bindEvents();
  }

  _createClass(Gnav, [{
    key: "toggle",
    value: function toggle() {
      if (this.status == Gnav.Status.CLOSE) {
        this.open();
      } else {
        this.close();
      }
    }
  }, {
    key: "open",
    value: function open() {
      this.status = Gnav.Status.OPEN;
      this.$html.classList.add("is-gnav-open");
      this.bindCloseEvents();
    }
  }, {
    key: "close",
    value: function close() {
      this.status = Gnav.Status.CLOSE;
      this.$html.classList.remove("is-gnav-open");
      this.unbindCloseEvents();
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;

      var handlers = ["handleClick", "handleBgClick", "handleWheel", "handleTriggerClick", "handleDocWheel", "handleDocClick"];

      handlers.forEach(function (handler) {
        _this[handler] = _this[handler].bind(_this);
      });

      (0, _events.addEvent)(this.$el, "click", this.handleClick);
      (0, _events.addEvent)(this.$bg, "click", this.handleBgClick);
      (0, _events.addEvent)(this.$trigger, "click", this.handleTriggerClick);
    }
  }, {
    key: "bindCloseEvents",
    value: function bindCloseEvents() {
      (0, _events.addEvent)(this.$el, CLOSE_EVENTS, this.handleWheel);
      (0, _events.addEvent)(document, CLOSE_EVENTS, this.handleDocWheel);
      (0, _events.addEvent)(document, "click", this.handleDocClick);
    }
  }, {
    key: "unbindCloseEvents",
    value: function unbindCloseEvents() {
      (0, _events.removeEvent)(this.$el, CLOSE_EVENTS, this.handleWheel);
      (0, _events.removeEvent)(document, CLOSE_EVENTS, this.handleDocWheel);
      (0, _events.removeEvent)(document, "click", this.handleDocClick);
    }
  }, {
    key: "handleClick",
    value: function handleClick(e) {
      e.stopPropagation();
    }
  }, {
    key: "handleBgClick",
    value: function handleBgClick(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, {
    key: "handleWheel",
    value: function handleWheel(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, {
    key: "handleTriggerClick",
    value: function handleTriggerClick(e) {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    }
  }, {
    key: "handleDocWheel",
    value: function handleDocWheel() {
      this.close();
    }
  }, {
    key: "handleDocClick",
    value: function handleDocClick(e) {
      e.preventDefault();
      this.close();
    }
  }]);

  return Gnav;
}();

exports.default = Gnav;


Gnav.Status = {
  OPEN: 1,
  CLOSE: 2
};

},{"./utils/events":14,"./utils/selectors":15}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addEvent = addEvent;
exports.removeEvent = removeEvent;
function addEvent(el, event, listener) {
  var events = event.split(",");
  events.forEach(function (eventName) {
    el.addEventListener(eventName.trim(), listener, false);
  });
}

function removeEvent(el, event, listener) {
  var events = event.split(",");
  events.forEach(function (eventName) {
    el.removeEventListener(eventName.trim(), listener, false);
  });
}

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$ = $;
exports.$$ = $$;
exports.matches = matches;
function $(selector) {
  var context = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  if (!selector) return;
  return (context == null ? document : context).querySelector(selector);
}

function $$(selector) {
  var context = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  if (!selector) return;
  return (context == null ? document : context).querySelectorAll(selector);
}

function matches(el, selector) {
  var matches = (el.document || el.ownerDocument).querySelectorAll(selector);
  var i = matches.length;
  while (--i >= 0 && matches.item(i) !== el) {}
  return i > -1;
}

},{}]},{},[12]);
