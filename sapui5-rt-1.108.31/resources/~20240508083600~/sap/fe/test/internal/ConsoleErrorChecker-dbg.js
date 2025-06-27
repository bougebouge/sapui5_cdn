/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  function wrapPatterns(pattern) {
    if (pattern instanceof RegExp) {
      return function (message) {
        return message.match(pattern) !== null;
      };
    } else {
      return function (message) {
        return message.includes(pattern);
      };
    }
  }

  /**
   * List of error message patterns that are always accepted.
   */
  var GLOBALLY_ACCEPTED_ERRORS = ["failed to load JavaScript resource: sap/esh/search/ui/i18n.js" // shell
  ].map(wrapPatterns);
  var ConsoleErrorChecker = /*#__PURE__*/function () {
    function ConsoleErrorChecker(window) {
      var _this = this;
      this.matchers = [];
      this.messages = [];
      this.observer = new MutationObserver(function (mutations) {
        var opaFrame = mutations.reduce(function (iFrame, mutation) {
          if (iFrame !== null) {
            return iFrame;
          }
          for (var _i = 0, _Array$from = Array.from(mutation.addedNodes); _i < _Array$from.length; _i++) {
            var node = _Array$from[_i];
            if (node instanceof Element) {
              var element = node.querySelector("#OpaFrame");
              if (element instanceof HTMLIFrameElement && element.contentWindow) {
                return element;
              }
            }
          }
          return iFrame;
        }, null);
        if (opaFrame && opaFrame.contentWindow) {
          _this.prepareWindow(opaFrame.contentWindow);
        }
      });
      QUnit.moduleStart(function () {
        _this.observer.observe(window.document.body, {
          childList: true
        });
      });
      QUnit.moduleDone(function () {
        _this.observer.disconnect();
      });
      QUnit.testStart(function () {
        _this.reset();
      });
      QUnit.log(function () {
        _this.handleFailedMessages();
      });
      this.karma = window.__karma__;

      // either go for Karma config option "ui5.config.strictConsoleErrors" or use URL query parameter "strict"
      var search = new URLSearchParams(window.location.search);
      var urlParam = search.get("strictConsoleErrors");
      if (urlParam !== null) {
        this.isStrict = urlParam === "true";
      } else {
        var _this$karma$config$ui, _this$karma, _this$karma$config$ui2;
        this.isStrict = (_this$karma$config$ui = (_this$karma = this.karma) === null || _this$karma === void 0 ? void 0 : (_this$karma$config$ui2 = _this$karma.config.ui5) === null || _this$karma$config$ui2 === void 0 ? void 0 : _this$karma$config$ui2.config.strictconsoleerrors) !== null && _this$karma$config$ui !== void 0 ? _this$karma$config$ui : false;
      }
      this.reset();
    }
    var _proto = ConsoleErrorChecker.prototype;
    _proto.handleFailedMessages = function handleFailedMessages() {
      var failedMessages = this.messages;
      this.messages = [];
      if (failedMessages.length > 0) {
        QUnit.assert.pushResult({
          result: false,
          source: "FE Console Log Check",
          message: "There were ".concat(failedMessages.length, " unexpected console errors"),
          actual: failedMessages,
          expected: []
        });
      }
    };
    _proto.reset = function reset() {
      this.messages = [];

      // this sets the default to apply if no allowed patterns are set via setAcceptedErrorPatterns().
      if (this.isStrict) {
        this.matchers = GLOBALLY_ACCEPTED_ERRORS;
      } else {
        this.matchers = [function () {
          return true;
        }];
      }
    };
    _proto.setAcceptedErrorPatterns = function setAcceptedErrorPatterns(patterns) {
      if (!patterns || patterns.length === 0) {
        this.matchers = GLOBALLY_ACCEPTED_ERRORS;
      } else {
        this.matchers = patterns.map(wrapPatterns).concat(GLOBALLY_ACCEPTED_ERRORS);
      }
    };
    _proto.checkAndLog = function checkAndLog(type) {
      for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }
      // only check the error messages
      if (type === "error") {
        var messageText = data[0];
        var isAllowed = this.matchers.some(function (matcher) {
          return matcher(messageText);
        });
        if (!isAllowed) {
          this.messages.push(messageText);
        }
      }
      if (this.karma) {
        // wrap the data to facilitate parsing in the backend
        var wrappedData = data.map(function (d) {
          return [d];
        });
        this.karma.log(type, wrappedData);
      }
    };
    _proto.prepareWindow = function prepareWindow(window) {
      var _this2 = this;
      var console = window.console;

      // capture console.log(), console.debug(), etc.
      var patchConsoleMethod = function (method) {
        var fnOriginal = console[method];
        console[method] = function () {
          for (var _len2 = arguments.length, data = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            data[_key2] = arguments[_key2];
          }
          _this2.checkAndLog.apply(_this2, [method].concat(data));
          return fnOriginal.apply(console, data);
        };
      };
      patchConsoleMethod("log");
      patchConsoleMethod("debug");
      patchConsoleMethod("info");
      patchConsoleMethod("warn");
      patchConsoleMethod("error");

      // capture console.assert()
      // see https://console.spec.whatwg.org/#assert
      console.assert = function () {
        var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        if (condition) {
          return;
        }
        var message = "Assertion failed";
        for (var _len3 = arguments.length, data = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          data[_key3 - 1] = arguments[_key3];
        }
        if (data.length === 0) {
          data.push(message);
        } else {
          var first = data[0];
          if (typeof first !== "string") {
            data.unshift(message);
          } else {
            first = "".concat(message, ": ").concat(first);
            data[0] = first;
          }
        }
        console.error.apply(console, data);
      };

      // capture errors
      function onPromiseRejection(event) {
        var _event$reason;
        var message = "UNHANDLED PROMISE REJECTION: ".concat(event.reason);
        this.checkAndLog("error", message, (_event$reason = event.reason) === null || _event$reason === void 0 ? void 0 : _event$reason.stack);
      }
      function onError(event) {
        var message = event.message;
        this.checkAndLog("error", message, event.filename);
      }
      window.addEventListener("error", onError.bind(this), {
        passive: true
      });
      window.addEventListener("unhandledrejection", onPromiseRejection.bind(this), {
        passive: true
      });
    };
    ConsoleErrorChecker.getInstance = function getInstance(window) {
      // the global instance is needed to support multiple tests in a row (in Karma)
      if (!window.sapFEConsoleErrorChecker) {
        window.sapFEConsoleErrorChecker = new ConsoleErrorChecker(window);
      }
      return window.sapFEConsoleErrorChecker;
    };
    return ConsoleErrorChecker;
  }();
  return ConsoleErrorChecker.getInstance(window);
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3cmFwUGF0dGVybnMiLCJwYXR0ZXJuIiwiUmVnRXhwIiwibWVzc2FnZSIsIm1hdGNoIiwiaW5jbHVkZXMiLCJHTE9CQUxMWV9BQ0NFUFRFRF9FUlJPUlMiLCJtYXAiLCJDb25zb2xlRXJyb3JDaGVja2VyIiwid2luZG93IiwibWF0Y2hlcnMiLCJtZXNzYWdlcyIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm11dGF0aW9ucyIsIm9wYUZyYW1lIiwicmVkdWNlIiwiaUZyYW1lIiwibXV0YXRpb24iLCJBcnJheSIsImZyb20iLCJhZGRlZE5vZGVzIiwibm9kZSIsIkVsZW1lbnQiLCJlbGVtZW50IiwicXVlcnlTZWxlY3RvciIsIkhUTUxJRnJhbWVFbGVtZW50IiwiY29udGVudFdpbmRvdyIsInByZXBhcmVXaW5kb3ciLCJRVW5pdCIsIm1vZHVsZVN0YXJ0Iiwib2JzZXJ2ZSIsImRvY3VtZW50IiwiYm9keSIsImNoaWxkTGlzdCIsIm1vZHVsZURvbmUiLCJkaXNjb25uZWN0IiwidGVzdFN0YXJ0IiwicmVzZXQiLCJsb2ciLCJoYW5kbGVGYWlsZWRNZXNzYWdlcyIsImthcm1hIiwiX19rYXJtYV9fIiwic2VhcmNoIiwiVVJMU2VhcmNoUGFyYW1zIiwibG9jYXRpb24iLCJ1cmxQYXJhbSIsImdldCIsImlzU3RyaWN0IiwiY29uZmlnIiwidWk1Iiwic3RyaWN0Y29uc29sZWVycm9ycyIsImZhaWxlZE1lc3NhZ2VzIiwibGVuZ3RoIiwiYXNzZXJ0IiwicHVzaFJlc3VsdCIsInJlc3VsdCIsInNvdXJjZSIsImFjdHVhbCIsImV4cGVjdGVkIiwic2V0QWNjZXB0ZWRFcnJvclBhdHRlcm5zIiwicGF0dGVybnMiLCJjb25jYXQiLCJjaGVja0FuZExvZyIsInR5cGUiLCJkYXRhIiwibWVzc2FnZVRleHQiLCJpc0FsbG93ZWQiLCJzb21lIiwibWF0Y2hlciIsInB1c2giLCJ3cmFwcGVkRGF0YSIsImQiLCJjb25zb2xlIiwicGF0Y2hDb25zb2xlTWV0aG9kIiwibWV0aG9kIiwiZm5PcmlnaW5hbCIsImFwcGx5IiwiY29uZGl0aW9uIiwiZmlyc3QiLCJ1bnNoaWZ0IiwiZXJyb3IiLCJvblByb21pc2VSZWplY3Rpb24iLCJldmVudCIsInJlYXNvbiIsInN0YWNrIiwib25FcnJvciIsImZpbGVuYW1lIiwiYWRkRXZlbnRMaXN0ZW5lciIsImJpbmQiLCJwYXNzaXZlIiwiZ2V0SW5zdGFuY2UiLCJzYXBGRUNvbnNvbGVFcnJvckNoZWNrZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbnNvbGVFcnJvckNoZWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBCcm93c2VyQ29uc29sZUxvZ09wdGlvbnMgfSBmcm9tIFwia2FybWFcIjtcblxudHlwZSBNZXNzYWdlTWF0Y2hlckZ1bmN0aW9uID0gKG1lc3NhZ2U6IHN0cmluZykgPT4gYm9vbGVhbjtcbnR5cGUgS2FybWEgPSB7XG5cdGxvZzogKGxldmVsOiBCcm93c2VyQ29uc29sZUxvZ09wdGlvbnNbXCJsZXZlbFwiXSwgLi4uZGF0YTogYW55W10pID0+IHZvaWQ7XG5cdGNvbmZpZzoge1xuXHRcdHVpNT86IHtcblx0XHRcdGNvbmZpZzoge1xuXHRcdFx0XHRzdHJpY3Rjb25zb2xlZXJyb3JzPzogYm9vbGVhbjsgLy8gS2FybWEgb3B0aW9ucyBhcmUgYWxsIGxvd2VyY2FzZSBhdCBydW50aW1lIVxuXHRcdFx0fTtcblx0XHR9O1xuXHR9O1xufTtcblxuZnVuY3Rpb24gd3JhcFBhdHRlcm5zKHBhdHRlcm46IFJlZ0V4cCB8IHN0cmluZyk6IE1lc3NhZ2VNYXRjaGVyRnVuY3Rpb24ge1xuXHRpZiAocGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdHJldHVybiAobWVzc2FnZSkgPT4gbWVzc2FnZS5tYXRjaChwYXR0ZXJuKSAhPT0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gKG1lc3NhZ2UpID0+IG1lc3NhZ2UuaW5jbHVkZXMocGF0dGVybik7XG5cdH1cbn1cblxuLyoqXG4gKiBMaXN0IG9mIGVycm9yIG1lc3NhZ2UgcGF0dGVybnMgdGhhdCBhcmUgYWx3YXlzIGFjY2VwdGVkLlxuICovXG5jb25zdCBHTE9CQUxMWV9BQ0NFUFRFRF9FUlJPUlMgPSBbXG5cdFwiZmFpbGVkIHRvIGxvYWQgSmF2YVNjcmlwdCByZXNvdXJjZTogc2FwL2VzaC9zZWFyY2gvdWkvaTE4bi5qc1wiIC8vIHNoZWxsXG5dLm1hcCh3cmFwUGF0dGVybnMpO1xuXG5jbGFzcyBDb25zb2xlRXJyb3JDaGVja2VyIHtcblx0cHJpdmF0ZSBtYXRjaGVyczogTWVzc2FnZU1hdGNoZXJGdW5jdGlvbltdID0gW107XG5cdHByaXZhdGUgbWVzc2FnZXM6IHN0cmluZ1tdID0gW107XG5cdHByaXZhdGUgcmVhZG9ubHkga2FybWE6IEthcm1hIHwgdW5kZWZpbmVkO1xuXHRwcml2YXRlIHJlYWRvbmx5IGlzU3RyaWN0OiBib29sZWFuO1xuXG5cdHByaXZhdGUgcmVhZG9ubHkgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG5cdFx0Y29uc3Qgb3BhRnJhbWUgPSBtdXRhdGlvbnMucmVkdWNlKChpRnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCwgbXV0YXRpb246IE11dGF0aW9uUmVjb3JkKSA9PiB7XG5cdFx0XHRpZiAoaUZyYW1lICE9PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBpRnJhbWU7XG5cdFx0XHR9XG5cblx0XHRcdGZvciAoY29uc3Qgbm9kZSBvZiBBcnJheS5mcm9tKG11dGF0aW9uLmFkZGVkTm9kZXMpKSB7XG5cdFx0XHRcdGlmIChub2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuXHRcdFx0XHRcdGNvbnN0IGVsZW1lbnQgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoXCIjT3BhRnJhbWVcIik7XG5cdFx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSUZyYW1lRWxlbWVudCAmJiBlbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlbGVtZW50O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaUZyYW1lO1xuXHRcdH0sIG51bGwpO1xuXG5cdFx0aWYgKG9wYUZyYW1lICYmIG9wYUZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcblx0XHRcdHRoaXMucHJlcGFyZVdpbmRvdyhvcGFGcmFtZS5jb250ZW50V2luZG93KTtcblx0XHR9XG5cdH0pO1xuXG5cdGNvbnN0cnVjdG9yKHdpbmRvdzogV2luZG93ICYgeyBfX2thcm1hX18/OiBLYXJtYSB9KSB7XG5cdFx0UVVuaXQubW9kdWxlU3RhcnQoKCkgPT4ge1xuXHRcdFx0dGhpcy5vYnNlcnZlci5vYnNlcnZlKHdpbmRvdy5kb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSB9KTtcblx0XHR9KTtcblxuXHRcdFFVbml0Lm1vZHVsZURvbmUoKCkgPT4ge1xuXHRcdFx0dGhpcy5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG5cdFx0fSk7XG5cblx0XHRRVW5pdC50ZXN0U3RhcnQoKCkgPT4ge1xuXHRcdFx0dGhpcy5yZXNldCgpO1xuXHRcdH0pO1xuXG5cdFx0UVVuaXQubG9nKCgpID0+IHtcblx0XHRcdHRoaXMuaGFuZGxlRmFpbGVkTWVzc2FnZXMoKTtcblx0XHR9KTtcblxuXHRcdHRoaXMua2FybWEgPSB3aW5kb3cuX19rYXJtYV9fO1xuXG5cdFx0Ly8gZWl0aGVyIGdvIGZvciBLYXJtYSBjb25maWcgb3B0aW9uIFwidWk1LmNvbmZpZy5zdHJpY3RDb25zb2xlRXJyb3JzXCIgb3IgdXNlIFVSTCBxdWVyeSBwYXJhbWV0ZXIgXCJzdHJpY3RcIlxuXHRcdGNvbnN0IHNlYXJjaCA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cdFx0Y29uc3QgdXJsUGFyYW0gPSBzZWFyY2guZ2V0KFwic3RyaWN0Q29uc29sZUVycm9yc1wiKTtcblx0XHRpZiAodXJsUGFyYW0gIT09IG51bGwpIHtcblx0XHRcdHRoaXMuaXNTdHJpY3QgPSB1cmxQYXJhbSA9PT0gXCJ0cnVlXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaXNTdHJpY3QgPSB0aGlzLmthcm1hPy5jb25maWcudWk1Py5jb25maWcuc3RyaWN0Y29uc29sZWVycm9ycyA/PyBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLnJlc2V0KCk7XG5cdH1cblxuXHRwcml2YXRlIGhhbmRsZUZhaWxlZE1lc3NhZ2VzKCkge1xuXHRcdGNvbnN0IGZhaWxlZE1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcztcblx0XHR0aGlzLm1lc3NhZ2VzID0gW107XG5cblx0XHRpZiAoZmFpbGVkTWVzc2FnZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0UVVuaXQuYXNzZXJ0LnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRyZXN1bHQ6IGZhbHNlLFxuXHRcdFx0XHRzb3VyY2U6IFwiRkUgQ29uc29sZSBMb2cgQ2hlY2tcIixcblx0XHRcdFx0bWVzc2FnZTogYFRoZXJlIHdlcmUgJHtmYWlsZWRNZXNzYWdlcy5sZW5ndGh9IHVuZXhwZWN0ZWQgY29uc29sZSBlcnJvcnNgLFxuXHRcdFx0XHRhY3R1YWw6IGZhaWxlZE1lc3NhZ2VzLFxuXHRcdFx0XHRleHBlY3RlZDogW11cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVzZXQoKSB7XG5cdFx0dGhpcy5tZXNzYWdlcyA9IFtdO1xuXG5cdFx0Ly8gdGhpcyBzZXRzIHRoZSBkZWZhdWx0IHRvIGFwcGx5IGlmIG5vIGFsbG93ZWQgcGF0dGVybnMgYXJlIHNldCB2aWEgc2V0QWNjZXB0ZWRFcnJvclBhdHRlcm5zKCkuXG5cdFx0aWYgKHRoaXMuaXNTdHJpY3QpIHtcblx0XHRcdHRoaXMubWF0Y2hlcnMgPSBHTE9CQUxMWV9BQ0NFUFRFRF9FUlJPUlM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubWF0Y2hlcnMgPSBbKCkgPT4gdHJ1ZV07XG5cdFx0fVxuXHR9XG5cblx0c2V0QWNjZXB0ZWRFcnJvclBhdHRlcm5zKHBhdHRlcm5zPzogKFJlZ0V4cCB8IHN0cmluZylbXSkge1xuXHRcdGlmICghcGF0dGVybnMgfHwgcGF0dGVybnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1hdGNoZXJzID0gR0xPQkFMTFlfQUNDRVBURURfRVJST1JTO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1hdGNoZXJzID0gcGF0dGVybnMubWFwKHdyYXBQYXR0ZXJucykuY29uY2F0KEdMT0JBTExZX0FDQ0VQVEVEX0VSUk9SUyk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjaGVja0FuZExvZyh0eXBlOiBCcm93c2VyQ29uc29sZUxvZ09wdGlvbnNbXCJsZXZlbFwiXSwgLi4uZGF0YTogYW55W10pIHtcblx0XHQvLyBvbmx5IGNoZWNrIHRoZSBlcnJvciBtZXNzYWdlc1xuXHRcdGlmICh0eXBlID09PSBcImVycm9yXCIpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2VUZXh0ID0gZGF0YVswXTtcblx0XHRcdGNvbnN0IGlzQWxsb3dlZCA9IHRoaXMubWF0Y2hlcnMuc29tZSgobWF0Y2hlcikgPT4gbWF0Y2hlcihtZXNzYWdlVGV4dCkpO1xuXHRcdFx0aWYgKCFpc0FsbG93ZWQpIHtcblx0XHRcdFx0dGhpcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2VUZXh0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5rYXJtYSkge1xuXHRcdFx0Ly8gd3JhcCB0aGUgZGF0YSB0byBmYWNpbGl0YXRlIHBhcnNpbmcgaW4gdGhlIGJhY2tlbmRcblx0XHRcdGNvbnN0IHdyYXBwZWREYXRhID0gZGF0YS5tYXAoKGQpID0+IFtkXSk7XG5cdFx0XHR0aGlzLmthcm1hLmxvZyh0eXBlLCB3cmFwcGVkRGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBwcmVwYXJlV2luZG93KHdpbmRvdzogV2luZG93KSB7XG5cdFx0Y29uc3QgY29uc29sZTogQ29uc29sZSA9ICh3aW5kb3cgYXMgYW55KS5jb25zb2xlO1xuXG5cdFx0Ly8gY2FwdHVyZSBjb25zb2xlLmxvZygpLCBjb25zb2xlLmRlYnVnKCksIGV0Yy5cblx0XHRjb25zdCBwYXRjaENvbnNvbGVNZXRob2QgPSAobWV0aG9kOiBcImxvZ1wiIHwgXCJpbmZvXCIgfCBcIndhcm5cIiB8IFwiZXJyb3JcIiB8IFwiZGVidWdcIikgPT4ge1xuXHRcdFx0Y29uc3QgZm5PcmlnaW5hbCA9IGNvbnNvbGVbbWV0aG9kXTtcblx0XHRcdGNvbnNvbGVbbWV0aG9kXSA9ICguLi5kYXRhOiBhbnlbXSk6IHZvaWQgPT4ge1xuXHRcdFx0XHR0aGlzLmNoZWNrQW5kTG9nKG1ldGhvZCwgLi4uZGF0YSk7XG5cdFx0XHRcdHJldHVybiBmbk9yaWdpbmFsLmFwcGx5KGNvbnNvbGUsIGRhdGEpO1xuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0cGF0Y2hDb25zb2xlTWV0aG9kKFwibG9nXCIpO1xuXHRcdHBhdGNoQ29uc29sZU1ldGhvZChcImRlYnVnXCIpO1xuXHRcdHBhdGNoQ29uc29sZU1ldGhvZChcImluZm9cIik7XG5cdFx0cGF0Y2hDb25zb2xlTWV0aG9kKFwid2FyblwiKTtcblx0XHRwYXRjaENvbnNvbGVNZXRob2QoXCJlcnJvclwiKTtcblxuXHRcdC8vIGNhcHR1cmUgY29uc29sZS5hc3NlcnQoKVxuXHRcdC8vIHNlZSBodHRwczovL2NvbnNvbGUuc3BlYy53aGF0d2cub3JnLyNhc3NlcnRcblx0XHRjb25zb2xlLmFzc2VydCA9IGZ1bmN0aW9uIChjb25kaXRpb24gPSBmYWxzZSwgLi4uZGF0YTogYW55W10pIHtcblx0XHRcdGlmIChjb25kaXRpb24pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtZXNzYWdlID0gXCJBc3NlcnRpb24gZmFpbGVkXCI7XG5cdFx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0ZGF0YS5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0IGZpcnN0ID0gZGF0YVswXTtcblx0XHRcdFx0aWYgKHR5cGVvZiBmaXJzdCAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGRhdGEudW5zaGlmdChtZXNzYWdlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmaXJzdCA9IGAke21lc3NhZ2V9OiAke2ZpcnN0fWA7XG5cdFx0XHRcdFx0ZGF0YVswXSA9IGZpcnN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoLi4uZGF0YSk7XG5cdFx0fTtcblxuXHRcdC8vIGNhcHR1cmUgZXJyb3JzXG5cdFx0ZnVuY3Rpb24gb25Qcm9taXNlUmVqZWN0aW9uKHRoaXM6IENvbnNvbGVFcnJvckNoZWNrZXIsIGV2ZW50OiBQcm9taXNlUmVqZWN0aW9uRXZlbnQpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBgVU5IQU5ETEVEIFBST01JU0UgUkVKRUNUSU9OOiAke2V2ZW50LnJlYXNvbn1gO1xuXHRcdFx0dGhpcy5jaGVja0FuZExvZyhcImVycm9yXCIsIG1lc3NhZ2UsIGV2ZW50LnJlYXNvbj8uc3RhY2spO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG9uRXJyb3IodGhpczogQ29uc29sZUVycm9yQ2hlY2tlciwgZXZlbnQ6IEVycm9yRXZlbnQpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBldmVudC5tZXNzYWdlO1xuXHRcdFx0dGhpcy5jaGVja0FuZExvZyhcImVycm9yXCIsIG1lc3NhZ2UsIGV2ZW50LmZpbGVuYW1lKTtcblx0XHR9XG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIG9uRXJyb3IuYmluZCh0aGlzKSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwidW5oYW5kbGVkcmVqZWN0aW9uXCIsIG9uUHJvbWlzZVJlamVjdGlvbi5iaW5kKHRoaXMpLCB7IHBhc3NpdmU6IHRydWUgfSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0SW5zdGFuY2Uod2luZG93OiBXaW5kb3cgJiB7IHNhcEZFQ29uc29sZUVycm9yQ2hlY2tlcj86IENvbnNvbGVFcnJvckNoZWNrZXIgfSk6IENvbnNvbGVFcnJvckNoZWNrZXIge1xuXHRcdC8vIHRoZSBnbG9iYWwgaW5zdGFuY2UgaXMgbmVlZGVkIHRvIHN1cHBvcnQgbXVsdGlwbGUgdGVzdHMgaW4gYSByb3cgKGluIEthcm1hKVxuXHRcdGlmICghd2luZG93LnNhcEZFQ29uc29sZUVycm9yQ2hlY2tlcikge1xuXHRcdFx0d2luZG93LnNhcEZFQ29uc29sZUVycm9yQ2hlY2tlciA9IG5ldyBDb25zb2xlRXJyb3JDaGVja2VyKHdpbmRvdyk7XG5cdFx0fVxuXHRcdHJldHVybiB3aW5kb3cuc2FwRkVDb25zb2xlRXJyb3JDaGVja2VyO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnNvbGVFcnJvckNoZWNrZXIuZ2V0SW5zdGFuY2Uod2luZG93KTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQWNBLFNBQVNBLFlBQVksQ0FBQ0MsT0FBd0IsRUFBMEI7SUFDdkUsSUFBSUEsT0FBTyxZQUFZQyxNQUFNLEVBQUU7TUFDOUIsT0FBTyxVQUFDQyxPQUFPO1FBQUEsT0FBS0EsT0FBTyxDQUFDQyxLQUFLLENBQUNILE9BQU8sQ0FBQyxLQUFLLElBQUk7TUFBQTtJQUNwRCxDQUFDLE1BQU07TUFDTixPQUFPLFVBQUNFLE9BQU87UUFBQSxPQUFLQSxPQUFPLENBQUNFLFFBQVEsQ0FBQ0osT0FBTyxDQUFDO01BQUE7SUFDOUM7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7RUFDQSxJQUFNSyx3QkFBd0IsR0FBRyxDQUNoQywrREFBK0QsQ0FBQztFQUFBLENBQ2hFLENBQUNDLEdBQUcsQ0FBQ1AsWUFBWSxDQUFDO0VBQUMsSUFFZFEsbUJBQW1CO0lBNkJ4Qiw2QkFBWUMsTUFBc0MsRUFBRTtNQUFBO01BQUEsS0E1QjVDQyxRQUFRLEdBQTZCLEVBQUU7TUFBQSxLQUN2Q0MsUUFBUSxHQUFhLEVBQUU7TUFBQSxLQUlkQyxRQUFRLEdBQUcsSUFBSUMsZ0JBQWdCLENBQUMsVUFB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