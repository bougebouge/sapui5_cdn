/*!
 * TinyMCE
 *
 * Copyright (c) 2023 Ephox Corporation DBA Tiny Technologies, Inc.
 * Licensed under the Tiny commercial license. See https://www.tiny.cloud/legal/
 *
 * Version: 5.10.9
 */
(function () {
    'use strict';

    var Cell = function (initial) {
      var value = initial;
      var get = function () {
        return value;
      };
      var set = function (v) {
        value = v;
      };
      return {
        get: get,
        set: set
      };
    };

    var global$1 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var get$2 = function (toggleState) {
      var isEnabled = function () {
        return toggleState.get();
      };
      return { isEnabled: isEnabled };
    };

    var fireVisualChars = function (editor, state) {
      return editor.fire('VisualChars', { state: state });
    };

    var typeOf = function (x) {
      var t = typeof x;
      if (x === null) {
        return 'null';
      } else if (t === 'object' && (Array.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'Array')) {
        return 'array';
      } else if (t === 'object' && (String.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'String')) {
        return 'string';
      } else {
        return t;
      }
    };
    var isType$1 = function (type) {
      return function (value) {
        return typeOf(value) === type;
      };
    };
    var isSimpleType = function (type) {
      return function (value) {
        return typeof value === type;
      };
    };
    var isString = isType$1('string');
    var isBoolean = isSimpleType('boolean');
    var isNumber = isSimpleType('number');

    var noop = function () {
    };
    var constant = function (value) {
      return function () {
        return value;
      };
    };
    var identity = function (x) {
      return x;
    };
    var never = constant(false);
    var always = constant(true);

    var none = function () {
      return NONE;
    };
    var NONE = function () {
      var call = function (thunk) {
        return thunk();
      };
      var id = identity;
      var me = {
        fold: function (n, _s) {
          return n();
        },
        isSome: never,
        isNone: always,
        getOr: id,
        getOrThunk: call,
        getOrDie: function (msg) {
          throw new Error(msg || 'error: getOrDie called on none.');
        },
        getOrNull: constant(null),
        getOrUndefined: constant(undefined),
        or: id,
        orThunk: call,
        map: none,
        each: noop,
        bind: none,
        exists: never,
        forall: always,
        filter: function () {
          return none();
        },
        toArray: function () {
          return [];
        },
        toString: constant('none()')
      };
      return me;
    }();
    var some = function (a) {
      var constant_a = constant(a);
      var self = function () {
        return me;
      };
      var bind = function (f) {
        return f(a);
      };
      var me = {
        fold: function (n, s) {
          return s(a);
        },
        isSome: always,
        isNone: never,
        getOr: constant_a,
        getOrThunk: constant_a,
        getOrDie: constant_a,
        getOrNull: constant_a,
        getOrUndefined: constant_a,
        or: self,
        orThunk: self,
        map: function (f) {
          return some(f(a));
        },
        each: function (f) {
          f(a);
        },
        bind: bind,
        exists: bind,
        forall: bind,
        filter: function (f) {
          return f(a) ? me : NONE;
        },
        toArray: function () {
          return [a];
        },
        toString: function () {
          return 'some(' + a + ')';
        }
      };
      return me;
    };
    var from = function (value) {
      return value === null || value === undefined ? NONE : some(value);
    };
    var Optional = {
      some: some,
      none: none,
      from: from
    };

    var map = function (xs, f) {
      var len = xs.length;
      var r = new Array(len);
      for (var i = 0; i < len; i++) {
        var x = xs[i];
        r[i] = f(x, i);
      }
      return r;
    };
    var each$1 = function (xs, f) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        f(x, i);
      }
    };
    var filter = function (xs, pred) {
      var r = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i)) {
          r.push(x);
        }
      }
      return r;
    };

    var keys = Object.keys;
    var each = function (obj, f) {
      var props = keys(obj);
      for (var k = 0, len = props.length; k < len; k++) {
        var i = props[k];
        var x = obj[i];
        f(x, i);
      }
    };

    typeof window !== 'undefined' ? window : Function('return this;')();

    var TEXT = 3;

    var type = function (element) {
      return element.dom.nodeType;
    };
    var value = function (element) {
      return element.dom.nodeValue;
    };
    var isType = function (t) {
      return function (element) {
        return type(element) === t;
      };
    };
    var isText = isType(TEXT);

    var rawSet = function (dom, key, value) {
      if (isString(value) || isBoolean(value) || isNumber(value)) {
        dom.setAttribute(key, value + '');
      } else {
        console.error('Invalid call to Attribute.set. Key ', key, ':: Value ', value, ':: Element ', dom);
        throw new Error('Attribute value was not simple');
      }
    };
    var set = function (element, key, value) {
      rawSet(element.dom, key, value);
    };
    var get$1 = function (element, key) {
      var v = element.dom.getAttribute(key);
      return v === null ? undefined : v;
    };
    var remove$3 = function (element, key) {
      element.dom.removeAttribute(key);
    };

    var read = function (element, attr) {
      var value = get$1(element, attr);
      return value === undefined || value === '' ? [] : value.split(' ');
    };
    var add$2 = function (element, attr, id) {
      var old = read(element, attr);
      var nu = old.concat([id]);
      set(element, attr, nu.join(' '));
      return true;
    };
    var remove$2 = function (element, attr, id) {
      var nu = filter(read(element, attr), function (v) {
        return v !== id;
      });
      if (nu.length > 0) {
        set(element, attr, nu.join(' '));
      } else {
        remove$3(element, attr);
      }
      return false;
    };

    var supports = function (element) {
      return element.dom.classList !== undefined;
    };
    var get = function (element) {
      return read(element, 'class');
    };
    var add$1 = function (element, clazz) {
      return add$2(element, 'class', clazz);
    };
    var remove$1 = function (element, clazz) {
      return remove$2(element, 'class', clazz);
    };

    var add = function (element, clazz) {
      if (supports(element)) {
        element.dom.classList.add(clazz);
      } else {
        add$1(element, clazz);
      }
    };
    var cleanClass = function (element) {
      var classList = supports(element) ? element.dom.classList : get(element);
      if (classList.length === 0) {
        remove$3(element, 'class');
      }
    };
    var remove = function (element, clazz) {
      if (supports(element)) {
        var classList = element.dom.classList;
        classList.remove(clazz);
      } else {
        remove$1(element, clazz);
      }
      cleanClass(element);
    };

    var fromHtml = function (html, scope) {
      var doc = scope || document;
      var div = doc.createElement('div');
      div.innerHTML = html;
      if (!div.hasChildNodes() || div.childNodes.length > 1) {
        console.error('HTML does not have a single root node', html);
        throw new Error('HTML must have a single root node');
      }
      return fromDom(div.childNodes[0]);
    };
    var fromTag = function (tag, scope) {
      var doc = scope || document;
      var node = doc.createElement(tag);
      return fromDom(node);
    };
    var fromText = function (text, scope) {
      var doc = scope || document;
      var node = doc.createTextNode(text);
      return fromDom(node);
    };
    var fromDom = function (node) {
      if (node === null || node === undefined) {
        throw new Error('Node cannot be null or undefined');
      }
      return { dom: node };
    };
    var fromPoint = function (docElm, x, y) {
      return Optional.from(docElm.dom.elementFromPoint(x, y)).map(fromDom);
    };
    var SugarElement = {
      fromHtml: fromHtml,
      fromTag: fromTag,
      fromText: fromText,
      fromDom: fromDom,
      fromPoint: fromPoint
    };

    var charMap = {
      '\xA0': 'nbsp',
      '\xAD': 'shy'
    };
    var charMapToRegExp = function (charMap, global) {
      var regExp = '';
      each(charMap, function (_value, key) {
        regExp += key;
      });
      return new RegExp('[' + regExp + ']', global ? 'g' : '');
    };
    var charMapToSelector = function (charMap) {
      var selector = '';
      each(charMap, function (value) {
        if (selector) {
          selector += ',';
        }
        selector += 'span.mce-' + value;
      });
      return selector;
    };
    var regExp = charMapToRegExp(charMap);
    var regExpGlobal = charMapToRegExp(charMap, true);
    var selector = charMapToSelector(charMap);
    var nbspClass = 'mce-nbsp';

    var wrapCharWithSpan = function (value) {
      return '<span data-mce-bogus="1" class="mce-' + charMap[value] + '">' + value + '</span>';
    };

    var isMatch = function (n) {
      var value$1 = value(n);
      return isText(n) && value$1 !== undefined && regExp.test(value$1);
    };
    var filterDescendants = function (scope, predicate) {
      var result = [];
      var dom = scope.dom;
      var children = map(dom.childNodes, SugarElement.fromDom);
      each$1(children, function (x) {
        if (predicate(x)) {
          result = result.concat([x]);
        }
        result = result.concat(filterDescendants(x, predicate));
      });
      return result;
    };
    var findParentElm = function (elm, rootElm) {
      while (elm.parentNode) {
        if (elm.parentNode === rootElm) {
          return elm;
        }
        elm = elm.parentNode;
      }
    };
    var replaceWithSpans = function (text) {
      return text.replace(regExpGlobal, wrapCharWithSpan);
    };

    var isWrappedNbsp = function (node) {
      return node.nodeName.toLowerCase() === 'span' && node.classList.contains('mce-nbsp-wrap');
    };
    var show = function (editor, rootElm) {
      var nodeList = filterDescendants(SugarElement.fromDom(rootElm), isMatch);
      each$1(nodeList, function (n) {
        var parent = n.dom.parentNode;
        if (isWrappedNbsp(parent)) {
          add(SugarElement.fromDom(parent), nbspClass);
        } else {
          var withSpans = replaceWithSpans(editor.dom.encode(value(n)));
          var div = editor.dom.create('div', null, withSpans);
          var node = void 0;
          while (node = div.lastChild) {
            editor.dom.insertAfter(node, n.dom);
          }
          editor.dom.remove(n.dom);
        }
      });
    };
    var hide = function (editor, rootElm) {
      var nodeList = editor.dom.select(selector, rootElm);
      each$1(nodeList, function (node) {
        if (isWrappedNbsp(node)) {
          remove(SugarElement.fromDom(node), nbspClass);
        } else {
          editor.dom.remove(node, true);
        }
      });
    };
    var toggle = function (editor) {
      var body = editor.getBody();
      var bookmark = editor.selection.getBookmark();
      var parentNode = findParentElm(editor.selection.getNode(), body);
      parentNode = parentNode !== undefined ? parentNode : body;
      hide(editor, parentNode);
      show(editor, parentNode);
      editor.selection.moveToBookmark(bookmark);
    };

    var applyVisualChars = function (editor, toggleState) {
      fireVisualChars(editor, toggleState.get());
      var body = editor.getBody();
      if (toggleState.get() === true) {
        show(editor, body);
      } else {
        hide(editor, body);
      }
    };
    var toggleVisualChars = function (editor, toggleState) {
      toggleState.set(!toggleState.get());
      var bookmark = editor.selection.getBookmark();
      applyVisualChars(editor, toggleState);
      editor.selection.moveToBookmark(bookmark);
    };

    var register$1 = function (editor, toggleState) {
      editor.addCommand('mceVisualChars', function () {
        toggleVisualChars(editor, toggleState);
      });
    };

    var isEnabledByDefault = function (editor) {
      return editor.getParam('visualchars_default_state', false);
    };
    var hasForcedRootBlock = function (editor) {
      return editor.getParam('forced_root_block') !== false;
    };

    var setup$1 = function (editor, toggleState) {
      editor.on('init', function () {
        applyVisualChars(editor, toggleState);
      });
    };

    var global = tinymce.util.Tools.resolve('tinymce.util.Delay');

    var setup = function (editor, toggleState) {
      var debouncedToggle = global.debounce(function () {
        toggle(editor);
      }, 300);
      if (hasForcedRootBlock(editor)) {
        editor.on('keydown', function (e) {
          if (toggleState.get() === true) {
            e.keyCode === 13 ? toggle(editor) : debouncedToggle();
          }
        });
      }
      editor.on('remove', debouncedToggle.stop);
    };

    var toggleActiveState = function (editor, enabledStated) {
      return function (api) {
        api.setActive(enabledStated.get());
        var editorEventCallback = function (e) {
          return api.setActive(e.state);
        };
        editor.on('VisualChars', editorEventCallback);
        return function () {
          return editor.off('VisualChars', editorEventCallback);
        };
      };
    };
    var register = function (editor, toggleState) {
      var onAction = function () {
        return editor.execCommand('mceVisualChars');
      };
      editor.ui.registry.addToggleButton('visualchars', {
        tooltip: 'Show invisible characters',
        icon: 'visualchars',
        onAction: onAction,
        onSetup: toggleActiveState(editor, toggleState)
      });
      editor.ui.registry.addToggleMenuItem('visualchars', {
        text: 'Show invisible characters',
        icon: 'visualchars',
        onAction: onAction,
        onSetup: toggleActiveState(editor, toggleState)
      });
    };

    function Plugin () {
      global$1.add('visualchars', function (editor) {
        var toggleState = Cell(isEnabledByDefault(editor));
        register$1(editor, toggleState);
        register(editor, toggleState);
        setup(editor, toggleState);
        setup$1(editor, toggleState);
        return get$2(toggleState);
      });
    }

    Plugin();

}());
