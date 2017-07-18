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
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
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


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = document.body.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.addEventListener('focus', window.scrollTo(0, yPosition));
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                document.body.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    document.body.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    document.body.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.target) {
                    this.target.blur();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

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

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
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
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }]);

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
/**
 * A polyfill for Element.matches()
 */
if (Element && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element !== document) {
        if (element.matches(selector)) return element;
        element = element.parentNode;
    }
}

module.exports = closest;

},{}],4:[function(require,module,exports){
var closest = require('./closest');

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
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"./closest":3}],5:[function(require,module,exports){
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
(function (global){

/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(\w+)\b/i;
var uniqueId = 0;

var _ = _self.Prism = {
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					// Check for existence for IE8
					return o.map && o.map(function(v) { return _.util.clone(v); });
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need anobject and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before. If not provided, the function appends instead.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];

			if (arguments.length == 2) {
				insert = arguments[1];

				for (var newToken in insert) {
					if (insert.hasOwnProperty(newToken)) {
						grammar[newToken] = insert[newToken];
					}
				}

				return grammar;
			}

			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === root[inside] && key != inside) {
					this[key] = ret;
				}
			});

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type, visited) {
			visited = visited || {};
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, null, visited);
					}
					else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		var env = {
			callback: callback,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run("before-highlightall", env);

		var elements = env.elements || document.querySelectorAll(env.selector);

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1].toLowerCase();
			grammar = _.languages[language];
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		parent = element.parentNode;

		if (/pre/i.test(parent.nodeName)) {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-sanity-check', env);

		if (!env.code || !env.grammar) {
			if (env.code) {
				env.element.textContent = env.code;
			}
			_.hooks.run('complete', env);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = evt.data;

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	tokenize: function(text, grammar, language) {
		var Token = _.Token;

		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		tokenloop: for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				if (greedy && !pattern.pattern.global) {
					// Without the global flag, lastIndex won't work
					var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
					pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
				}

				pattern = pattern.pattern || pattern;

				// Don’t cache length as it changes during the loop
				for (var i=0, pos = 0; i<strarr.length; pos += strarr[i].length, ++i) {

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str),
					    delNum = 1;

					// Greedy patterns can override/remove up to two previously matched tokens
					if (!match && greedy && i != strarr.length - 1) {
						pattern.lastIndex = pos;
						match = pattern.exec(text);
						if (!match) {
							break;
						}

						var from = match.index + (lookbehind ? match[1].length : 0),
						    to = match.index + match[0].length,
						    k = i,
						    p = pos;

						for (var len = strarr.length; k < len && p < to; ++k) {
							p += strarr[k].length;
							// Move the index i to the element in strarr that is closest to from
							if (from >= p) {
								++i;
								pos = p;
							}
						}

						/*
						 * If strarr[i] is a Token, then the match starts inside another Token, which is invalid
						 * If strarr[k - 1] is greedy we are in conflict with another greedy pattern
						 */
						if (strarr[i] instanceof Token || strarr[k - 1].greedy) {
							continue;
						}

						// Number of tokens to delete and replace with the new match
						delNum = k - i;
						str = text.slice(pos, p);
						match.index -= pos;
					}

					if (!match) {
						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1].length;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);
				}
			}
		}

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || "").length|0;
	this.greedy = !!greedy;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (_.util.type(o) === 'Array') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (env.type == 'comment') {
		env.attributes['spellcheck'] = 'true';
	}

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = Object.keys(env.attributes).map(function(name) {
		return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}).join(' ');

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';

};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _self.Prism;
	}
 	// In worker
	_self.addEventListener('message', function(evt) {
		var message = JSON.parse(evt.data),
		    lang = message.language,
		    code = message.code,
		    immediateClose = message.immediateClose;

		_self.postMessage(_.highlight(code, _.languages[lang], lang));
		if (immediateClose) {
			_self.close();
		}
	}, false);

	return _self.Prism;
}

//Get current script and highlight
var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

if (script) {
	_.filename = script.src;

	if (document.addEventListener && !script.hasAttribute('data-manual')) {
		if(document.readyState !== "loading") {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(_.highlightAll);
			} else {
				window.setTimeout(_.highlightAll, 16);
			}
		}
		else {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}
}

return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\w\W]*?-->/,
	'prolog': /<\?[\w\W]+?\?>/,
	'doctype': /<!DOCTYPE[\w\W]+?>/i,
	'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
				inside: {
					'punctuation': /[=>"']/
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
	'string': {
		pattern: /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'property': /(\b|\B)[\w-]+(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css'
		}
	});
	
	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|').*?\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],
	'string': {
		pattern: /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(true|false)\b/,
	'function': /[a-z0-9_]+(?=\()/i,
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*\*?|\/|~|\^|%|\.{3}/
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true,
		greedy: true
	}
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\\\|\\?[^\\])*?`/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript'
		}
	});
}

Prism.languages.js = Prism.languages.javascript;

/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	self.Prism.fileHighlight = function() {

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		if(Array.prototype.forEach) { // Check to prevent error in IE8
			Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
				var src = pre.getAttribute('data-src');

				var language, parent = pre;
				var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
				while (parent && !lang.test(parent.className)) {
					parent = parent.parentNode;
				}

				if (parent) {
					language = (pre.className.match(lang) || [, ''])[1];
				}

				if (!language) {
					var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
					language = Extensions[extension] || extension;
				}

				var code = document.createElement('code');
				code.className = 'language-' + language;

				pre.textContent = '';

				code.textContent = 'Loading…';

				pre.appendChild(code);

				var xhr = new XMLHttpRequest();

				xhr.open('GET', src, true);

				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {

						if (xhr.status < 400 && xhr.responseText) {
							code.textContent = xhr.responseText;

							Prism.highlightElement(code);
						}
						else if (xhr.status >= 400) {
							code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
						}
						else {
							code.textContent = '✖ Error: File does not exist or is empty';
						}
					}
				};

				xhr.send(null);
			});
		}

	};

	document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
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
 * @author tsuyoshiwada
 * @license MIT
 * @version 2.1.0
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.SweetScroll = factory());
}(this, (function () { 'use strict';

var cos = Math.cos;
var sin = Math.sin;
var pow = Math.pow;
var abs = Math.abs;
var sqrt = Math.sqrt;
var asin = Math.asin;
var PI = Math.PI;
var max = Math.max;
var min = Math.min;
var round = Math.round;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
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







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var MAX_ARRAY_INDEX = pow(2, 53) - 1;
var classTypeList = ["Boolean", "Number", "String", "Function", "Array", "Object"];
var classTypes = {};

classTypeList.forEach(function (name) {
  classTypes["[object " + name + "]"] = name.toLowerCase();
});

function getType(obj) {
  if (obj == null) {
    return "";
  }

  return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof obj === "function" ? classTypes[Object.prototype.toString.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
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

function isArray(obj) {
  return Array.isArray(obj);
}

function isArrayLike(obj) {
  var length = obj == null ? null : obj.length;

  return isNumber(length) && length >= 0 && length <= MAX_ARRAY_INDEX;
}

function isNumeric(obj) {
  return !isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
}

function isObject(obj) {
  return !isArray(obj) && getType(obj) === "object";
}

function hasProp(obj, key) {
  return obj && obj.hasOwnProperty(key);
}



function each(obj, iterate, context) {
  if (obj == null) return obj;

  var ctx = context || obj;

  if (isObject(obj)) {
    for (var key in obj) {
      if (!hasProp(obj, key)) continue;
      if (iterate.call(ctx, obj[key], key) === false) break;
    }
  } else if (isArrayLike(obj)) {
    for (var i = 0; i < obj.length; i++) {
      if (iterate.call(ctx, obj[i], i) === false) break;
    }
  }

  return obj;
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

function removeSpaces(str) {
  return str.replace(/\s*/g, "") || "";
}

function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(message);
  }
  /* eslint-enable no-console */

  /* eslint-disable no-empty */
  try {
    throw new Error(message);
  } catch (e) {}
  /* eslint-enable no-empty */
}

var win = window;
var doc = document;

function $(selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!selector) return;

  return (context == null ? doc : context).querySelector(selector);
}

function $$(selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!selector) return;

  return (context == null ? doc : context).querySelectorAll(selector);
}

function matches(el, selector) {
  var results = (el.document || el.ownerDocument).querySelectorAll(selector);
  var i = results.length;
  while (--i >= 0 && results.item(i) !== el) {}

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
  return el === doc.documentElement || el === doc.body;
}

function getZoomLevel() {
  var outerWidth = win.outerWidth,
      innerWidth = win.innerWidth;


  return outerWidth ? outerWidth / innerWidth : 1;
}

function getScrollable(selectors) {
  var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "y";
  var all = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var method = directionMethodMap[direction];
  var elements = selectors instanceof Element ? [selectors] : $$(selectors);
  var scrollables = [];
  var $div = doc.createElement("div");

  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];

    if (el[method] > 0) {
      scrollables.push(el);
    } else {
      $div.style.width = el.clientWidth + 1 + "px";
      $div.style.height = el.clientHeight + 1 + "px";
      el.appendChild($div);

      el[method] = 1.5 / getZoomLevel();
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

  return scrollables.length >= 1 ? scrollables[0] : null;
}

function getWindow(el) {
  return el != null && el === el.window ? el : el.nodeType === 9 && el.defaultView;
}

function getHeight(el) {
  return max(el.scrollHeight, el.clientHeight, el.offsetHeight);
}

function getWidth(el) {
  return max(el.scrollWidth, el.clientWidth, el.offsetWidth);
}

function getSize(el) {
  return {
    width: getWidth(el),
    height: getHeight(el)
  };
}

function getDocumentSize() {
  return {
    width: max(getWidth(doc.body), getWidth(doc.documentElement)),
    height: max(getHeight(doc.body), getHeight(doc.documentElement))
  };
}

function getViewportAndElementSizes(el) {
  if (isRootContainer(el)) {
    return {
      viewport: {
        width: min(win.innerWidth, doc.documentElement.clientWidth),
        height: win.innerHeight
      },
      size: getDocumentSize()
    };
  }

  return {
    viewport: {
      width: el.clientWidth,
      height: el.clientHeight
    },
    size: getSize(el)
  };
}

function getScroll(el) {
  var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "y";

  var currentWindow = getWindow(el);

  return currentWindow ? currentWindow[directionPropMap[direction]] : el[directionMethodMap[direction]];
}

function setScroll(el, offset) {
  var direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "y";

  var currentWindow = getWindow(el);
  var top = direction === "y";
  if (currentWindow) {
    currentWindow.scrollTo(!top ? offset : currentWindow[directionPropMap.x], top ? offset : currentWindow[directionPropMap.y]);
  } else {
    el[directionMethodMap[direction]] = offset;
  }
}

function getOffset(el) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!el || el && !el.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  var rect = el.getBoundingClientRect();

  if (rect.width || rect.height) {
    var scroll = {};
    var ctx = null;
    if (context == null || isRootContainer(context)) {
      ctx = el.ownerDocument.documentElement;
      scroll.top = win.pageYOffset;
      scroll.left = win.pageXOffset;
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
var history = function () {
  var ua = navigator.userAgent;
  if ((ua.indexOf("Android 2.") !== -1 || ua.indexOf("Android 4.0") !== -1) && ua.indexOf("Mobile Safari") !== -1 && ua.indexOf("Chrome") === -1 && ua.indexOf("Windows Phone") === -1) {
    return false;
  }

  return win.history && "pushState" in win.history && win.location.protocol !== "file:";
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

/* eslint-disable no-param-reassign, newline-before-return, max-params, new-cap */
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
  return -c * cos(t / d * (PI / 2)) + c + b;
}

function OutSine(x, t, b, c, d) {
  return c * sin(t / d * (PI / 2)) + b;
}

function InOutSine(x, t, b, c, d) {
  return -c / 2 * (cos(PI * t / d) - 1) + b;
}

function InExpo(x, t, b, c, d) {
  return t === 0 ? b : c * pow(2, 10 * (t / d - 1)) + b;
}

function OutExpo(x, t, b, c, d) {
  return t === d ? b + c : c * (-pow(2, -10 * t / d) + 1) + b;
}

function InOutExpo(x, t, b, c, d) {
  if (t === 0) return b;
  if (t === d) return b + c;
  if ((t /= d / 2) < 1) return c / 2 * pow(2, 10 * (t - 1)) + b;
  return c / 2 * (-pow(2, -10 * --t) + 2) + b;
}

function InCirc(x, t, b, c, d) {
  return -c * (sqrt(1 - (t /= d) * t) - 1) + b;
}

function OutCirc(x, t, b, c, d) {
  return c * sqrt(1 - (t = t / d - 1) * t) + b;
}

function InOutCirc(x, t, b, c, d) {
  if ((t /= d / 2) < 1) {
    return -c / 2 * (sqrt(1 - t * t) - 1) + b;
  }
  return c / 2 * (sqrt(1 - (t -= 2) * t) + 1) + b;
}

function InElastic(x, t, b, c, d) {
  var s = 1.70158;
  var p = 0;
  var a = c;
  if (t === 0) return b;
  if ((t /= d) === 1) return b + c;
  if (!p) p = d * .3;
  if (a < abs(c)) {
    a = c;
    s = p / 4;
  } else {
    s = p / (2 * PI) * asin(c / a);
  }
  return -(a * pow(2, 10 * (t -= 1)) * sin((t * d - s) * (2 * PI) / p)) + b;
}

function OutElastic(x, t, b, c, d) {
  var s = 1.70158;
  var p = 0;
  var a = c;
  if (t === 0) return b;
  if ((t /= d) === 1) return b + c;
  if (!p) p = d * .3;
  if (a < abs(c)) {
    a = c;
    s = p / 4;
  } else {
    s = p / (2 * PI) * asin(c / a);
  }
  return a * pow(2, -10 * t) * sin((t * d - s) * (2 * PI) / p) + c + b;
}

function InOutElastic(x, t, b, c, d) {
  var s = 1.70158;
  var p = 0;
  var a = c;
  if (t === 0) return b;
  if ((t /= d / 2) === 2) return b + c;
  if (!p) p = d * (.3 * 1.5);
  if (a < abs(c)) {
    a = c;
    s = p / 4;
  } else {
    s = p / (2 * PI) * asin(c / a);
  }
  if (t < 1) {
    return -.5 * (a * pow(2, 10 * (t -= 1)) * sin((t * d - s) * (2 * PI) / p)) + b;
  }
  return a * pow(2, -10 * (t -= 1)) * sin((t * d - s) * (2 * PI) / p) * .5 + c + b;
}

function InBack(x, t, b, c, d) {
  var s = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1.70158;

  return c * (t /= d) * t * ((s + 1) * t - s) + b;
}

function OutBack(x, t, b, c, d) {
  var s = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1.70158;

  return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}

function InOutBack(x, t, b, c, d) {
  var s = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1.70158;

  if ((t /= d / 2) < 1) {
    return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
  }
  return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
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

function InBounce(x, t, b, c, d) {
  return c - OutBounce(x, d - t, 0, c, d) + b;
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
	OutBounce: OutBounce,
	InBounce: InBounce,
	InOutBounce: InOutBounce
});

var vendors = ["ms", "moz", "webkit"];
var lastTime = 0;

var raf = win.requestAnimationFrame;
var caf = win.cancelAnimationFrame;

for (var x = 0; x < vendors.length && !raf; ++x) {
  raf = win[vendors[x] + "RequestAnimationFrame"];
  caf = win[vendors[x] + "CancelAnimationFrame"] || win[vendors[x] + "CancelRequestAnimationFrame"];
}

if (!raf) {
  raf = function raf(callback) {
    var currentTime = Date.now();
    var timeToCall = max(0, 16 - (currentTime - lastTime));
    var id = setTimeout(function () {
      callback(currentTime + timeToCall);
    }, timeToCall);

    lastTime = currentTime + timeToCall;

    return id;
  };
}

if (!caf) {
  caf = function caf(id) {
    clearTimeout(id);
  };
}

var ScrollTween = function () {
  function ScrollTween(el) {
    classCallCheck(this, ScrollTween);

    this.el = el;
    this.props = {};
    this.options = {};
    this.progress = false;
    this.easing = null;
    this.startTime = null;
    this.rafId = null;
  }

  createClass(ScrollTween, [{
    key: "run",
    value: function run(x, y, options) {
      var _this = this;

      if (this.progress) return;
      this.props = { x: x, y: y };
      this.options = options;
      this.easing = isFunction(options.easing) ? options.easing : Easing[options.easing.replace("ease", "")];
      this.progress = true;

      setTimeout(function () {
        _this.startProps = _this.calcStartProps(x, y);
        _this.rafId = raf(function (time) {
          return _this._loop(time);
        });
      }, this.options.delay);
    }
  }, {
    key: "stop",
    value: function stop() {
      var gotoEnd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var complete = this.options.complete;

      this.startTime = null;
      this.progress = false;
      caf(this.rafId);

      if (gotoEnd) {
        setScroll(this.el, this.props.x, "x");
        setScroll(this.el, this.props.y, "y");
      }

      if (isFunction(complete)) {
        complete.call(this);
        this.options.complete = null;
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

      var el = this.el,
          props = this.props,
          options = this.options,
          startTime = this.startTime,
          startProps = this.startProps,
          easing = this.easing;
      var duration = options.duration,
          step = options.step;

      var toProps = {};
      var timeElapsed = time - startTime;
      var t = min(1, max(timeElapsed / duration, 0));

      each(props, function (value, key) {
        var initialValue = startProps[key];
        var delta = value - initialValue;
        if (delta === 0) return true;

        var val = easing(t, duration * t, 0, 1, duration);
        toProps[key] = round(initialValue + delta * val);
      });

      each(toProps, function (value, key) {
        setScroll(el, value, key);
      });

      if (timeElapsed <= duration) {
        step.call(this, t, toProps);
        this.rafId = raf(function (currentTime) {
          return _this2._loop(currentTime);
        });
      } else {
        this.stop(true);
      }
    }
  }, {
    key: "calcStartProps",
    value: function calcStartProps(x, y) {
      var startProps = {
        x: getScroll(this.el, "x"),
        y: getScroll(this.el, "y")
      };

      if (this.options.quickMode) {
        var _Dom$getViewportAndEl = getViewportAndElementSizes(this.el),
            _Dom$getViewportAndEl2 = _Dom$getViewportAndEl.viewport,
            width = _Dom$getViewportAndEl2.width,
            height = _Dom$getViewportAndEl2.height;

        if (abs(startProps.y - y) > height) {
          startProps.y = startProps.y > y ? y + height : y - height;
        }

        if (abs(startProps.x - x) > width) {
          startProps.x = startProps.x > x ? x + width : x - width;
        }
      }

      return startProps;
    }
  }]);
  return ScrollTween;
}();

var WHEEL_EVENT = function () {
  if ("onwheel" in doc) {
    return "wheel";
  } else if ("onmousewheel" in doc) {
    return "mousewheel";
  } else {
    return "DOMMouseScroll";
  }
}();

var CONTAINER_STOP_EVENTS = WHEEL_EVENT + ", touchstart, touchmove";

var SweetScroll = function () {
  /* eslint-enable max-len */

  /**
   * SweetScroll constructor
   * @constructor
   * @param {Object} options
   * @param {String | Element} container
   */
  function SweetScroll() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var container = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "body, html";
    classCallCheck(this, SweetScroll);

    this.options = merge({}, SweetScroll.defaults, options);
    this.container = this.getContainer(container);

    if (this.container == null) {
      this.header = null;
      this.tween = null;

      if (!/comp|inter|loaded/.test(doc.readyState)) {
        this.log("Should be initialize later than DOMContentLoaded.");
      } else {
        this.log("Not found scrollable container. => \"" + container + "\"");
      }
    } else {
      this.header = $(this.options.header);
      this.tween = new ScrollTween(this.container);
      this._trigger = null;
      this._shouldCallCancelScroll = false;
      this.bindContainerClick();
    }
  }

  /**
   * Output log
   * @param {String} message
   * @return {void}
   */


  // Default options
  /* eslint-disable max-len */


  createClass(SweetScroll, [{
    key: "log",
    value: function log(message) {
      if (this.options.outputLog) {
        warning("[SweetScroll] " + message);
      }
    }

    /**
     * Get scroll offset
     * @param {*} distance
     * @param {Object} options
     * @return {Object}
     * @private
     */

  }, {
    key: "getScrollOffset",
    value: function getScrollOffset(distance, options) {
      var container = this.container,
          header = this.header;

      var offset = this.parseCoodinate(options.offset);
      var scroll = this.parseCoodinate(distance);

      // Using the coordinates in the case of CSS Selector
      if (!scroll && isString(distance)) {
        if (distance === "#") {
          scroll = {
            top: 0,
            left: 0
          };
        } else {
          var target = $(distance);
          var targetOffset = getOffset(target, container);
          if (!targetOffset) return;
          scroll = targetOffset;
        }
      }

      if (!scroll) {
        return null;
      }

      // Apply `offset` value
      if (offset) {
        scroll.top += offset.top;
        scroll.left += offset.left;
      }

      // If the header is present apply the height
      if (header) {
        scroll.top = max(0, scroll.top - getSize(header).height);
      }

      return scroll;
    }

    /**
     * Normalize scroll offset
     * @param {Ojbect} scroll
     * @param {Ojbect} options
     * @return {Object}
     * @private
     */

  }, {
    key: "normalizeScrollOffset",
    value: function normalizeScrollOffset(scroll, options) {
      var container = this.container;

      var finalScroll = merge({}, scroll);

      // Determine the final scroll coordinates

      var _Dom$getViewportAndEl = getViewportAndElementSizes(container),
          viewport = _Dom$getViewportAndEl.viewport,
          size = _Dom$getViewportAndEl.size;

      // Adjustment of the maximum value


      finalScroll.top = options.verticalScroll ? max(0, min(size.height - viewport.height, finalScroll.top)) : getScroll(container, "y");

      finalScroll.left = options.horizontalScroll ? max(0, min(size.width - viewport.width, finalScroll.left)) : getScroll(container, "x");

      return finalScroll;
    }

    /**
     * Scroll animation to the specified position
     * @param {*} distance
     * @param {Object} options
     * @return {void}
     */

  }, {
    key: "to",
    value: function to(distance) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var container = this.container;

      var params = merge({}, this.options, options);
      var trigger = this._trigger;
      var hash = isString(distance) && /^#/.test(distance) ? distance : null;

      // Temporary options
      this._options = params;

      // Remove the triggering elements which has been temporarily retained
      this._trigger = null;

      // Disable the call flag of `cancelScroll`
      this._shouldCallCancelScroll = false;

      // Stop current animation
      this.stop();

      // Does not move if the container is not found
      if (!container) {
        return this.log("Not found container element.");
      }

      // Get scroll offset
      var scroll = this.getScrollOffset(distance, params);

      if (!scroll) {
        return this.log("Invalid parameter of distance. => " + distance);
      }

      // Call `beforeScroll`
      // Stop scrolling when it returns false
      if (this.hook(params, "beforeScroll", scroll, trigger) === false) {
        this._options = null;
        return;
      }

      scroll = this.normalizeScrollOffset(scroll, params);

      // Run the animation!!
      this.tween.run(scroll.left, scroll.top, {
        duration: params.duration,
        delay: params.delay,
        easing: params.easing,
        quickMode: params.quickMode,
        complete: function complete() {
          // Update URL
          if (hash != null && hash !== win.location.hash) {
            _this.updateURLHash(hash, params.updateURL);
          }

          // Unbind the scroll stop events, And call `afterScroll` or `cancelScroll`
          _this.unbindContainerStop();

          // Remove the temporary options
          _this._options = null;

          // Call `cancelScroll` or `afterScroll`
          if (_this._shouldCallCancelScroll) {
            _this.hook(params, "cancelScroll");
          } else {
            _this.hook(params, "afterScroll", scroll, trigger);
          }

          // Call `completeScroll`
          _this.hook(params, "completeScroll", _this._shouldCallCancelScroll);
        },
        step: function step(currentTime, props) {
          _this.hook(params, "stepScroll", currentTime, props);
        }
      });

      // Bind the scroll stop events
      this.bindContainerStop();
    }

    /**
     * Scroll animation to the specified top position
     * @param {*} distance
     * @param {Object} options
     * @return {void}
     */

  }, {
    key: "toTop",
    value: function toTop(distance) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.to(distance, merge({}, options, {
        verticalScroll: true,
        horizontalScroll: false
      }));
    }

    /**
     * Scroll animation to the specified left position
     * @param {*} distance
     * @param {Object} options
     * @return {void}
     */

  }, {
    key: "toLeft",
    value: function toLeft(distance) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.to(distance, merge({}, options, {
        verticalScroll: false,
        horizontalScroll: true
      }));
    }

    /**
     * Scroll animation to the specified element
     * @param {Element} el
     * @param {Object} options
     * @return {void}
     */

  }, {
    key: "toElement",
    value: function toElement(el) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (el instanceof Element) {
        var offset = getOffset(el, this.container);
        this.to(offset, merge({}, options));
      } else {
        this.log("Invalid parameter.");
      }
    }

    /**
     * Stop the current animation
     * @param {Boolean} gotoEnd
     * @return {void}
     */

  }, {
    key: "stop",
    value: function stop() {
      var gotoEnd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!this.container) {
        this.log("Not found scrollable container.");
      } else {
        if (this._stopScrollListener) {
          this._shouldCallCancelScroll = true;
        }

        this.tween.stop(gotoEnd);
      }
    }

    /**
     * Update the instance
     * @param {Object} options
     * @return {void}
     */

  }, {
    key: "update",
    value: function update() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!this.container) {
        this.log("Not found scrollable container.");
      } else {
        this.stop();
        this.unbindContainerClick();
        this.unbindContainerStop();
        this.options = merge({}, this.options, options);
        this.header = $(this.options.header);
        this.bindContainerClick();
      }
    }

    /**
     * Destroy SweetScroll instance
     * @return {void}
     */

  }, {
    key: "destroy",
    value: function destroy() {
      if (!this.container) {
        this.log("Not found scrollable container.");
      } else {
        this.stop();
        this.unbindContainerClick();
        this.unbindContainerStop();
        this.container = null;
        this.header = null;
        this.tween = null;
      }
    }

    /* eslint-disable no-unused-vars */
    /**
     * Called at before of the scroll.
     * @param {Object} toScroll
     * @param {Element} trigger
     * @return {Boolean}
     */

  }, {
    key: "beforeScroll",
    value: function beforeScroll(toScroll, trigger) {
      return true;
    }

    /**
     * Called at cancel of the scroll.
     * @return {void}
     */

  }, {
    key: "cancelScroll",
    value: function cancelScroll() {}

    /**
     * Called at after of the scroll.
     * @param {Object} toScroll
     * @param {Element} trigger
     * @return {void}
     */

  }, {
    key: "afterScroll",
    value: function afterScroll(toScroll, trigger) {}

    /**
     * Called at complete of the scroll.
     * @param {Boolean} isCancel
     * @return {void}
     */

  }, {
    key: "completeScroll",
    value: function completeScroll(isCancel) {}

    /**
     * Called at each animation frame of the scroll.
     * @param {Float} currentTime
     * @param {Object} props
     * @return {void}
     */

  }, {
    key: "stepScroll",
    value: function stepScroll(currentTime, props) {}
    /* eslint-enable no-unused-vars */

    /**
     * Parse the value of coordinate
     * @param {*} coodinate
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
        var trimedCoodinate = removeSpaces(coodinate);

        // "{n},{n}" (Array like syntax)
        if (/^\d+,\d+$/.test(trimedCoodinate)) {
          trimedCoodinate = trimedCoodinate.split(",");
          scroll.top = trimedCoodinate[0];
          scroll.left = trimedCoodinate[1];

          // "top:{n}, left:{n}" (Object like syntax)
        } else if (/^(top|left):\d+,?(?:(top|left):\d+)?$/.test(trimedCoodinate)) {
          var top = trimedCoodinate.match(/top:(\d+)/);
          var left = trimedCoodinate.match(/left:(\d+)/);
          scroll.top = top ? top[1] : 0;
          scroll.left = left ? left[1] : 0;

          // "+={n}", "-={n}" (Relative position)
        } else if (this.container && /^(\+|-)=(\d+)$/.test(trimedCoodinate)) {
          var current = getScroll(this.container, enableTop ? "y" : "x");
          var results = trimedCoodinate.match(/^(\+|-)=(\d+)$/);
          var op = results[1];
          var value = parseInt(results[2], 10);
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
     * @param {String} hash
     * @param {Boolean | String} historyType
     * @return {void}
     */

  }, {
    key: "updateURLHash",
    value: function updateURLHash(hash, historyType) {
      if (!history || !historyType) return;
      win.history[historyType === "replace" ? "replaceState" : "pushState"](null, null, hash);
    }

    /**
     * Get the container for the scroll, depending on the options.
     * @param {String | Element} selector
     * @return {?Element}
     * @private
     */

  }, {
    key: "getContainer",
    value: function getContainer(selector) {
      var _options = this.options,
          verticalScroll = _options.verticalScroll,
          horizontalScroll = _options.horizontalScroll;

      var container = null;

      if (verticalScroll) {
        container = scrollableFind(selector, "y");
      }

      if (!container && horizontalScroll) {
        container = scrollableFind(selector, "x");
      }

      return container;
    }

    /**
     * Bind a click event to the container
     * @return {void}
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
     * @return {void}
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
     * @return {void}
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
     * @return {void}
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
     * @param {Object} options
     * @param {String} type
     * @param {...*} args
     * @return {void}
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
        if (typeof result === "undefined") return result;
      }

      // method
      return this[type].apply(this, args);
    }

    /**
     * Handling of scroll stop event
     * @param {Event} e
     * @return {void}
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
     * @param {Event} e
     * @return {void}
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
     * @param {Element} el
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
  updateURL: false, // Update the URL hash on after scroll (true | false | "push" | "replace")
  preventDefault: true, // Cancels the container element click event
  stopPropagation: true, // Prevents further propagation of the container element click event in the bubbling phase
  outputLog: false, // Specify level of output to log
  quickMode: false, // Instantly scroll to the destination! (It's recommended to use it with `easeOutExpo`)

  // Callbacks
  beforeScroll: null,
  afterScroll: null,
  cancelScroll: null,
  completeScroll: null,
  stepScroll: null
};

return SweetScroll;

})));

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

var _prismjs = require("prismjs");

var _prismjs2 = _interopRequireDefault(_prismjs);

var _clipboard = require("clipboard");

var _clipboard2 = _interopRequireDefault(_clipboard);

var _sweetScroll = require("sweet-scroll");

var _sweetScroll2 = _interopRequireDefault(_sweetScroll);

var _gnav = require("./gnav");

var _gnav2 = _interopRequireDefault(_gnav);

var _selectors = require("./utils/selectors");

var _events = require("./utils/events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Enable fast click
(0, _fastclick2.default)(document.body);

// Disable auto highlight

// import 'prismjs';
(0, _events.removeEvent)(document, 'DOMContentLoaded', _prismjs2.default.highlightAll);

// Initialize app
(0, _events.addEvent)(document, "DOMContentLoaded", function () {
  var $html = (0, _selectors.$)("html");

  // Scroll
  new _sweetScroll2.default({
    duration: 1200,
    easing: "easeOutQuart"
  });

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

    _prismjs2.default.highlightElement($el);
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
    var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1200;

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

  // Logo
  var HEADER_LOGO_DURATION = 830;
  var $headerLogo = (0, _selectors.$)(".header__logo");
  var headerLogoTimer = false;

  (0, _events.addEvent)($headerLogo, "mouseenter, touchstart", function (e) {
    if (headerLogoTimer !== false) return;

    $headerLogo.classList.add("is-hover");

    clearInterval(headerLogoTimer);

    headerLogoTimer = setTimeout(function () {
      $headerLogo.classList.remove("is-hover");
      headerLogoTimer = false;
    }, HEADER_LOGO_DURATION);
  });

  // Gnav
  new _gnav2.default();
});

},{"./gnav":13,"./utils/events":14,"./utils/selectors":15,"clipboard":2,"fastclick":5,"prismjs":8,"sweet-scroll":10}],13:[function(require,module,exports){
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
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!selector) return;
  return (context == null ? document : context).querySelector(selector);
}

function $$(selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

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
