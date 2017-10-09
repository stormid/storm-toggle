(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _component = require('./libs/component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var onDOMContentLoadedTasks = [function () {
	var toggle = _component2.default.init('.js-toggle');
	var localToggle = _component2.default.init('.js-toggle-local', { local: true });
	console.log(toggle);
}];

if ('addEventListener' in window) window.addEventListener('DOMContentLoaded', function () {
	onDOMContentLoadedTasks.forEach(function (fn) {
		return fn();
	});
});

},{"./libs/component":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _defaults = require('./lib/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _componentPrototype = require('./lib/component-prototype');

var _componentPrototype2 = _interopRequireDefault(_componentPrototype);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var init = function init(sel, opts) {
	var els = [].slice.call(document.querySelectorAll(sel));

	if (els.length === 0) throw new Error('Toggle cannot be initialised, no trigger elements found');

	return els.map(function (el) {
		return Object.assign(Object.create(_componentPrototype2.default), {
			node: el,
			settings: Object.assign({}, _defaults2.default, el.dataset, opts)
		}).init();
	});
};

exports.default = { init: init };

},{"./lib/component-prototype":3,"./lib/defaults":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var TRIGGER_EVENTS = ['click', 'keydown'],
    TRIGGER_KEYCODES = [13, 32],
    FOCUSABLE_ELEMENTS = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex="-1"])'];

exports.default = {
	init: function init() {
		this.toggles = this.node.getAttribute('data-toggle') && [].slice.call(document.querySelectorAll('.' + this.node.getAttribute('data-toggle')));
		if (!this.toggles) return console.warn('Toggle cannot be initialised, no toggle buttons elements found'), false;

		this.isOpen = false;
		if (this.settings.focus) this.focusableChildren = this.getFocusableChildren();
		if (this.settings.trapTab) this.boundKeyListener = this.keyListener.bind(this);
		this.classTarget = !this.settings.local ? document.documentElement : this.node.parentNode;
		this.statusClass = !this.settings.local ? 'on--' + this.node.getAttribute('id') : 'active';
		this.animatingClass = !this.settings.local ? 'animating--' + this.node.getAttribute('id') : 'animating';

		this.initToggles();

		return this;
	},
	initToggles: function initToggles() {
		var _this = this;

		this.toggles.forEach(function (toggle) {
			toggle.setAttribute('role', 'button');
			toggle.setAttribute('aria-controls', _this.node.getAttribute('id'));
			toggle.setAttribute('aria-expanded', 'false');
			TRIGGER_EVENTS.forEach(function (ev) {
				toggle.addEventListener(ev, function (e) {
					if (!!e.keyCode && !~TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
					e.preventDefault();
					_this.toggle();
				});
			});
		});
	},
	getFocusableChildren: function getFocusableChildren() {
		return [].slice.call(this.node.querySelectorAll(FOCUSABLE_ELEMENTS.join(',')));
	},

	toggleAttributes: function toggleAttributes() {
		this.isOpen = !this.isOpen;
		this.toggles.forEach(function (toggle) {
			toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
		});
	},
	toggleState: function toggleState() {
		this.classTarget.classList.remove(this.animatingClass);
		this.classTarget.classList.toggle(this.statusClass);
	},
	manageFocus: function manageFocus() {
		var _this2 = this;

		if (!this.isOpen) {
			this.lastFocused = document.activeElement;
			this.focusableChildren.length && window.setTimeout(function () {
				return _this2.focusableChildren[0].focus();
			}, this.settings.delay);
			this.settings.trapTab && document.addEventListener('keydown', this.boundKeyListener);
		} else {
			this.settings.trapTab && document.removeEventListener('keydown', this.boundKeyListener);
			this.focusableChildren.length && window.setTimeout(function () {
				_this2.lastFocused.focus();
				_this2.lastFocused = false;
			}, this.settings.delay);
		}
	},
	trapTab: function trapTab(e) {
		var focusedIndex = this.focusableChildren.indexOf(document.activeElement);
		if (e.shiftKey && focusedIndex === 0) {
			e.preventDefault();
			this.focusableChildren[this.focusableChildren.length - 1].focus();
		} else {
			if (!e.shiftKey && focusedIndex === this.focusableChildren.length - 1) {
				e.preventDefault();
				this.focusableChildren[0].focus();
			}
		}
	},
	keyListener: function keyListener(e) {
		if (this.isOpen && e.keyCode === 27) {
			e.preventDefault();
			this.toggle();
		}
		if (this.isOpen && e.keyCode === 9) this.trapTab(e);
	},

	toggle: function toggle(e) {
		var _this3 = this;

		var delay = this.classTarget.classList.contains(this.statusClass) ? this.settings.delay : 0;

		!!this.settings.prehook && typeof this.settings.prehook === 'function' && this.settings.prehook.call(this);

		if (e) e.preventDefault(), e.stopPropagation();

		this.classTarget.classList.add(this.animatingClass);

		window.setTimeout(function () {
			!!_this3.settings.focus && _this3.focusableChildren && _this3.manageFocus();
			_this3.toggleAttributes();
			_this3.toggleState();
			!!_this3.settings.callback && typeof _this3.settings.callback === 'function' && _this3.settings.callback.call(_this3);
		}, delay);
	}
};

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {
	delay: 0,
	startOpen: false,
	local: false,
	prehook: false,
	callback: false,
	focus: true,
	trapTab: false
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2RlZmF1bHRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7Ozs7QUFFQSxJQUFNLDJCQUEyQixZQUFNLEFBQ3RDO0tBQUksU0FBUyxvQkFBQSxBQUFPLEtBQXBCLEFBQWEsQUFBWSxBQUN6QjtLQUFJLGNBQWMsb0JBQUEsQUFBTyxLQUFQLEFBQVksb0JBQW9CLEVBQUUsT0FBcEQsQUFBa0IsQUFBZ0MsQUFBUyxBQUMzRDtTQUFBLEFBQVEsSUFBUixBQUFZLEFBRVo7QUFMRCxBQUFnQyxDQUFBOztBQU9oQyxJQUFHLHNCQUFILEFBQXlCLGVBQVEsQUFBTyxpQkFBUCxBQUF3QixvQkFBb0IsWUFBTSxBQUFFO3lCQUFBLEFBQXdCLFFBQVEsY0FBQTtTQUFBLEFBQU07QUFBdEMsQUFBOEM7QUFBbEcsQ0FBQTs7Ozs7Ozs7O0FDVGpDOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTSxPQUFPLFNBQVAsQUFBTyxLQUFBLEFBQUMsS0FBRCxBQUFNLE1BQVMsQUFDM0I7S0FBSSxNQUFNLEdBQUEsQUFBRyxNQUFILEFBQVMsS0FBSyxTQUFBLEFBQVMsaUJBQWpDLEFBQVUsQUFBYyxBQUEwQixBQUVsRDs7S0FBRyxJQUFBLEFBQUksV0FBUCxBQUFrQixHQUFHLE1BQU0sSUFBQSxBQUFJLE1BQVYsQUFBTSxBQUFVLEFBRXJDOztZQUFPLEFBQUksSUFBSSxjQUFBO2dCQUFNLEFBQU8sT0FBTyxPQUFBLEFBQU8sNEJBQXJCO1NBQWlELEFBQzlELEFBQ047YUFBVSxPQUFBLEFBQU8sT0FBUCxBQUFjLHdCQUFjLEdB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Q0FBQyxPQUFBLEFBQUssU0FBUCxBQUFnQixTQUFTLE9BQTFCLEFBQStCLHFCQUFzQixPQUFyRCxBQUFxRCxBQUFLLEFBQzFEO1VBQUEsQUFBSyxBQUNMO1VBQUEsQUFBSyxBQUNKO0lBQUMsQ0FBQyxPQUFBLEFBQUssU0FBUCxBQUFnQixZQUFZLE9BQU8sT0FBQSxBQUFLLFNBQVosQUFBcUIsYUFBbEQsQUFBK0QsY0FBZSxPQUFBLEFBQUssU0FBTCxBQUFjLFNBQWQsQUFBdUIsS0FBckcsQUFDQTtBQUxELEtBQUEsQUFLRyxBQUNIO0EsQUEzRmE7QUFBQSxBQUNkOzs7Ozs7Ozs7UUNMYyxBQUNQLEFBQ1A7WUFGYyxBQUVILEFBQ1g7UUFIYyxBQUdQLEFBQ1A7VUFKYyxBQUlMLEFBQ1Q7V0FMYyxBQUtKLEFBQ1Y7UUFOYyxBQU1QLEFBQ1A7VSxBQVBjLEFBT0w7QUFQSyxBQUNkIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBUb2dnbGUgZnJvbSAnLi9saWJzL2NvbXBvbmVudCc7XG5cbmNvbnN0IG9uRE9NQ29udGVudExvYWRlZFRhc2tzID0gWygpID0+IHtcblx0bGV0IHRvZ2dsZSA9IFRvZ2dsZS5pbml0KCcuanMtdG9nZ2xlJyk7XG5cdGxldCBsb2NhbFRvZ2dsZSA9IFRvZ2dsZS5pbml0KCcuanMtdG9nZ2xlLWxvY2FsJywgeyBsb2NhbDogdHJ1ZSB9KTtcblx0Y29uc29sZS5sb2codG9nZ2xlKTtcblxufV07XG4gICAgXG5pZignYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93KSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHsgb25ET01Db250ZW50TG9hZGVkVGFza3MuZm9yRWFjaChmbiA9PiBmbigpKTsgfSk7XG4iLCJpbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi9saWIvZGVmYXVsdHMnO1xuaW1wb3J0IGNvbXBvbmVudFByb3RvdHlwZSBmcm9tICcuL2xpYi9jb21wb25lbnQtcHJvdG90eXBlJztcblxuY29uc3QgaW5pdCA9IChzZWwsIG9wdHMpID0+IHtcblx0bGV0IGVscyA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcblx0XG5cdGlmKGVscy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignVG9nZ2xlIGNhbm5vdCBiZSBpbml0aWFsaXNlZCwgbm8gdHJpZ2dlciBlbGVtZW50cyBmb3VuZCcpO1xuXHRcblx0cmV0dXJuIGVscy5tYXAoZWwgPT4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGNvbXBvbmVudFByb3RvdHlwZSksIHtcblx0XHRcdG5vZGU6IGVsLFxuXHRcdFx0c2V0dGluZ3M6IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBlbC5kYXRhc2V0LCBvcHRzKVxuXHRcdH0pLmluaXQoKSk7XG59O1xuICAgIFxuZXhwb3J0IGRlZmF1bHQgeyBpbml0IH07IiwiY29uc3QgVFJJR0dFUl9FVkVOVFMgPSBbJ2NsaWNrJywgJ2tleWRvd24nXSxcbiAgICAgIFRSSUdHRVJfS0VZQ09ERVMgPSBbMTMsIDMyXSxcblx0ICBGT0NVU0FCTEVfRUxFTUVOVFMgPSBbJ2FbaHJlZl0nLCAnYXJlYVtocmVmXScsICdpbnB1dDpub3QoW2Rpc2FibGVkXSknLCAnc2VsZWN0Om5vdChbZGlzYWJsZWRdKScsICd0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSknLCAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKScsICdpZnJhbWUnLCAnb2JqZWN0JywgJ2VtYmVkJywgJ1tjb250ZW50ZWRpdGFibGVdJywgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSddO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdGluaXQoKSB7XG5cdFx0dGhpcy50b2dnbGVzID0gdGhpcy5ub2RlLmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKSAmJiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgdGhpcy5ub2RlLmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKSkpO1xuXHRcdGlmKCF0aGlzLnRvZ2dsZXMpIHJldHVybiBjb25zb2xlLndhcm4oJ1RvZ2dsZSBjYW5ub3QgYmUgaW5pdGlhbGlzZWQsIG5vIHRvZ2dsZSBidXR0b25zIGVsZW1lbnRzIGZvdW5kJyksIGZhbHNlO1xuXHRcdFxuXHRcdHRoaXMuaXNPcGVuID0gZmFsc2U7XG5cdFx0aWYodGhpcy5zZXR0aW5ncy5mb2N1cykgdGhpcy5mb2N1c2FibGVDaGlsZHJlbiA9IHRoaXMuZ2V0Rm9jdXNhYmxlQ2hpbGRyZW4oKTtcblx0XHRpZih0aGlzLnNldHRpbmdzLnRyYXBUYWIpIHRoaXMuYm91bmRLZXlMaXN0ZW5lciA9IHRoaXMua2V5TGlzdGVuZXIuYmluZCh0aGlzKTtcblx0XHR0aGlzLmNsYXNzVGFyZ2V0ID0gKCF0aGlzLnNldHRpbmdzLmxvY2FsKSA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6IHRoaXMubm9kZS5wYXJlbnROb2RlO1xuXHRcdHRoaXMuc3RhdHVzQ2xhc3MgPSAhdGhpcy5zZXR0aW5ncy5sb2NhbCA/IGBvbi0tJHt0aGlzLm5vZGUuZ2V0QXR0cmlidXRlKCdpZCcpfWAgOiAnYWN0aXZlJztcblx0XHR0aGlzLmFuaW1hdGluZ0NsYXNzID0gIXRoaXMuc2V0dGluZ3MubG9jYWwgPyBgYW5pbWF0aW5nLS0ke3RoaXMubm9kZS5nZXRBdHRyaWJ1dGUoJ2lkJyl9YCA6ICdhbmltYXRpbmcnO1xuXG5cdFx0dGhpcy5pbml0VG9nZ2xlcygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGluaXRUb2dnbGVzKCkge1xuXHRcdHRoaXMudG9nZ2xlcy5mb3JFYWNoKHRvZ2dsZSA9PiB7XG5cdFx0XHR0b2dnbGUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2J1dHRvbicpO1xuXHRcdFx0dG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycsIHRoaXMubm9kZS5nZXRBdHRyaWJ1dGUoJ2lkJykpO1xuXHRcdFx0dG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXHRcdFx0VFJJR0dFUl9FVkVOVFMuZm9yRWFjaChldiA9PiB7XG5cdFx0XHRcdHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0XHRpZighIWUua2V5Q29kZSAmJiAhflRSSUdHRVJfS0VZQ09ERVMuaW5kZXhPZihlLmtleUNvZGUpKSByZXR1cm47XG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdHRoaXMudG9nZ2xlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cdGdldEZvY3VzYWJsZUNoaWxkcmVuKCkge1xuXHRcdHJldHVybiBbXS5zbGljZS5jYWxsKHRoaXMubm9kZS5xdWVyeVNlbGVjdG9yQWxsKEZPQ1VTQUJMRV9FTEVNRU5UUy5qb2luKCcsJykpKTtcblx0fSxcblx0dG9nZ2xlQXR0cmlidXRlczogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmlzT3BlbiA9ICF0aGlzLmlzT3Blbjtcblx0XHR0aGlzLnRvZ2dsZXMuZm9yRWFjaCh0b2dnbGUgPT4ge1xuXHRcdFx0dG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIHRvZ2dsZS5nZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnKSA9PT0gJ3RydWUnID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cdFx0fSk7XG5cdH0sXG5cdHRvZ2dsZVN0YXRlOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2xhc3NUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmFuaW1hdGluZ0NsYXNzKTtcblx0XHR0aGlzLmNsYXNzVGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zdGF0dXNDbGFzcyk7XG5cdH0sXG5cdG1hbmFnZUZvY3VzOiBmdW5jdGlvbigpe1xuXHRcdGlmKCF0aGlzLmlzT3Blbil7XG5cdFx0XHR0aGlzLmxhc3RGb2N1c2VkID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblx0XHRcdHRoaXMuZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoICYmIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHRoaXMuZm9jdXNhYmxlQ2hpbGRyZW5bMF0uZm9jdXMoKSwgdGhpcy5zZXR0aW5ncy5kZWxheSk7XG5cdFx0XHR0aGlzLnNldHRpbmdzLnRyYXBUYWIgJiYgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuYm91bmRLZXlMaXN0ZW5lcik7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5zZXR0aW5ncy50cmFwVGFiICYmIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmJvdW5kS2V5TGlzdGVuZXIpO1xuXHRcdFx0dGhpcy5mb2N1c2FibGVDaGlsZHJlbi5sZW5ndGggJiYgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmxhc3RGb2N1c2VkLmZvY3VzKCk7XG5cdFx0XHRcdHRoaXMubGFzdEZvY3VzZWQgPSBmYWxzZTtcblx0XHRcdH0sIHRoaXMuc2V0dGluZ3MuZGVsYXkpO1xuXHRcdH1cblx0fSxcblx0dHJhcFRhYjogZnVuY3Rpb24oZSl7XG5cdFx0bGV0IGZvY3VzZWRJbmRleCA9IHRoaXMuZm9jdXNhYmxlQ2hpbGRyZW4uaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcblx0XHRpZihlLnNoaWZ0S2V5ICYmIGZvY3VzZWRJbmRleCA9PT0gMCkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5mb2N1c2FibGVDaGlsZHJlblt0aGlzLmZvY3VzYWJsZUNoaWxkcmVuLmxlbmd0aCAtIDFdLmZvY3VzKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKCFlLnNoaWZ0S2V5ICYmIGZvY3VzZWRJbmRleCA9PT0gdGhpcy5mb2N1c2FibGVDaGlsZHJlbi5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0dGhpcy5mb2N1c2FibGVDaGlsZHJlblswXS5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0a2V5TGlzdGVuZXIoZSl7XG5cdFx0aWYgKHRoaXMuaXNPcGVuICYmIGUua2V5Q29kZSA9PT0gMjcpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMudG9nZ2xlKCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmlzT3BlbiAmJiBlLmtleUNvZGUgPT09IDkpIHRoaXMudHJhcFRhYihlKTtcblx0fSxcblx0dG9nZ2xlOiBmdW5jdGlvbihlKXtcblx0XHRsZXQgZGVsYXkgPSB0aGlzLmNsYXNzVGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnN0YXR1c0NsYXNzKSA/ICB0aGlzLnNldHRpbmdzLmRlbGF5IDogMDtcblxuXHRcdCghIXRoaXMuc2V0dGluZ3MucHJlaG9vayAmJiB0eXBlb2YgdGhpcy5zZXR0aW5ncy5wcmVob29rID09PSAnZnVuY3Rpb24nKSAmJiB0aGlzLnNldHRpbmdzLnByZWhvb2suY2FsbCh0aGlzKTtcblx0XHRcblx0XHRpZihlKSBlLnByZXZlbnREZWZhdWx0KCksIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XG5cdFx0dGhpcy5jbGFzc1RhcmdldC5jbGFzc0xpc3QuYWRkKHRoaXMuYW5pbWF0aW5nQ2xhc3MpO1xuXHRcdFxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdCghIXRoaXMuc2V0dGluZ3MuZm9jdXMgJiYgdGhpcy5mb2N1c2FibGVDaGlsZHJlbikgJiYgdGhpcy5tYW5hZ2VGb2N1cygpO1xuXHRcdFx0dGhpcy50b2dnbGVBdHRyaWJ1dGVzKCk7XG5cdFx0XHR0aGlzLnRvZ2dsZVN0YXRlKCk7XG5cdFx0XHQoISF0aGlzLnNldHRpbmdzLmNhbGxiYWNrICYmIHR5cGVvZiB0aGlzLnNldHRpbmdzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSAmJiB0aGlzLnNldHRpbmdzLmNhbGxiYWNrLmNhbGwodGhpcyk7XG5cdFx0fSwgZGVsYXkpO1xuXHR9XG59OyIsImV4cG9ydCBkZWZhdWx0IHtcblx0ZGVsYXk6IDAsXG5cdHN0YXJ0T3BlbjogZmFsc2UsXG5cdGxvY2FsOiBmYWxzZSxcblx0cHJlaG9vazogZmFsc2UsXG5cdGNhbGxiYWNrOiBmYWxzZSxcblx0Zm9jdXM6IHRydWUsXG5cdHRyYXBUYWI6IGZhbHNlXG59OyJdfQ==
