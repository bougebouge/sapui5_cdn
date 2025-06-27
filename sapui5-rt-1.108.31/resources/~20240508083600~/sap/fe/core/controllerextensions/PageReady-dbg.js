/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/pageReady/DataQueryWatcher", "sap/fe/core/services/TemplatedViewServiceFactory", "sap/ui/base/EventProvider", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "../CommonUtils", "../helpers/ClassSupport"], function (Log, DataQueryWatcher, TemplatedViewServiceFactory, EventProvider, Component, Core, ControllerExtension, OverrideExecution, CommonUtils, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  var PageReadyControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.PageReady"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = methodOverride("_routing"), _dec7 = methodOverride("_routing"), _dec8 = methodOverride("_routing"), _dec9 = publicExtension(), _dec10 = finalExtension(), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = publicExtension(), _dec14 = finalExtension(), _dec15 = publicExtension(), _dec16 = finalExtension(), _dec17 = publicExtension(), _dec18 = finalExtension(), _dec19 = privateExtension(), _dec20 = extensible(OverrideExecution.Instead), _dec21 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(PageReadyControllerExtension, _ControllerExtension);
    function PageReadyControllerExtension() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ControllerExtension.call.apply(_ControllerExtension, [this].concat(args)) || this;
      _this.pageReadyTimeoutDefault = 7000;
      return _this;
    }
    var _proto = PageReadyControllerExtension.prototype;
    _proto.onInit = function onInit() {
      var _manifestContent$sap,
        _manifestContent$sap2,
        _this2 = this;
      this._nbWaits = 0;
      this._oEventProvider = this._oEventProvider ? this._oEventProvider : new EventProvider();
      this._oView = this.getView();
      this._oAppComponent = CommonUtils.getAppComponent(this._oView);
      this._oPageComponent = Component.getOwnerComponentFor(this._oView);
      var manifestContent = this._oAppComponent.getManifest();
      this.pageReadyTimeout = (_manifestContent$sap = (_manifestContent$sap2 = manifestContent["sap.ui5"]) === null || _manifestContent$sap2 === void 0 ? void 0 : _manifestContent$sap2.pageReadyTimeout) !== null && _manifestContent$sap !== void 0 ? _manifestContent$sap : this.pageReadyTimeoutDefault;
      if (this._oPageComponent && this._oPageComponent.attachContainerDefined) {
        this._oPageComponent.attachContainerDefined(function (oEvent) {
          return _this2.registerContainer(oEvent.getParameter("container"));
        });
      } else {
        this.registerContainer(this._oView);
      }
      var oRootControlController = this._oAppComponent.getRootControl().getController();
      var oPlaceholder = (oRootControlController === null || oRootControlController === void 0 ? void 0 : oRootControlController.getPlaceholder) && oRootControlController.getPlaceholder();
      if (oPlaceholder !== null && oPlaceholder !== void 0 && oPlaceholder.isPlaceholderDebugEnabled()) {
        this.attachEvent("pageReady", null, function () {
          oPlaceholder.getPlaceholderDebugStats().iPageReadyEventTimestamp = Date.now();
        }, this);
        this.attachEvent("heroesBatchReceived", null, function () {
          oPlaceholder.getPlaceholderDebugStats().iHeroesBatchReceivedEventTimestamp = Date.now();
        }, this);
      }
      this.queryWatcher = new DataQueryWatcher(this._oEventProvider, this.checkPageReadyDebounced.bind(this));
    };
    _proto.onExit = function onExit() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oAppComponent;
      if (this._oContainer) {
        this._oContainer.removeEventDelegate(this._fnContainerDelegate);
      }
    };
    _proto.waitFor = function waitFor(oPromise) {
      var _this3 = this;
      this._nbWaits++;
      oPromise.finally(function () {
        setTimeout(function () {
          _this3._nbWaits--;
        }, 0);
      }).catch(null);
    };
    _proto.onRouteMatched = function onRouteMatched() {
      this._bIsPageReady = false;
    };
    _proto.onRouteMatchedFinished = function onRouteMatchedFinished() {
      try {
        var _this5 = this;
        return Promise.resolve(_this5.onAfterBindingPromise).then(function () {
          _this5.checkPageReadyDebounced();
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto.registerAggregatedControls = function registerAggregatedControls(mainBindingContext) {
      var _this6 = this;
      if (mainBindingContext) {
        var mainObjectBinding = mainBindingContext.getBinding();
        this.queryWatcher.registerBinding(mainObjectBinding);
      }
      var aPromises = [];
      var aControls = this.getView().findAggregatedObjects(true);
      aControls.forEach(function (oElement) {
        var oObjectBinding = oElement.getObjectBinding();
        if (oObjectBinding) {
          // Register on all object binding (mostly used on object pages)
          _this6.queryWatcher.registerBinding(oObjectBinding);
        } else {
          var aBindingKeys = Object.keys(oElement.mBindingInfos);
          aBindingKeys.forEach(function (sPropertyName) {
            var oListBinding = oElement.mBindingInfos[sPropertyName].binding;
            if (oListBinding && oListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
              _this6.queryWatcher.registerBinding(oListBinding);
            }
          });
        }
        // This is dirty but MDCTables and MDCCharts have a weird loading lifecycle
        if (oElement.isA("sap.ui.mdc.Table") || oElement.isA("sap.ui.mdc.Chart")) {
          _this6.bTablesChartsLoaded = false;
          aPromises.push(_this6.queryWatcher.registerTableOrChart(oElement));
        } else if (oElement.isA("sap.fe.core.controls.FilterBar")) {
          _this6.queryWatcher.registerFilterBar(oElement);
        }
      });
      return aPromises;
    };
    _proto.onAfterBinding = function onAfterBinding(oBindingContext) {
      var _this8 = this;
      var _this7 = this;
      // In case the page is rebind we need to clear the timer (eg: in FCL, the user can select 2 items successively in the list report)
      if (this.pageReadyTimeoutTimer) {
        clearTimeout(this.pageReadyTimeoutTimer);
      }
      this.pageReadyTimeoutTimer = setTimeout(function () {
        Log.error("The PageReady Event was not fired within the ".concat(_this7.pageReadyTimeout, " ms timeout . It has been forced."));
        _this7._oEventProvider.fireEvent("pageReady");
      }, this.pageReadyTimeout);
      if (this._bAfterBindingAlreadyApplied) {
        return;
      }
      this._bAfterBindingAlreadyApplied = true;
      if (this.isContextExpected() && oBindingContext === undefined) {
        // Force to mention we are expecting data
        this.bHasContext = false;
        return;
      } else {
        this.bHasContext = true;
      }
      this.attachEventOnce("pageReady", null, function () {
        clearTimeout(_this7.pageReadyTimeoutTimer);
        _this7.pageReadyTimeoutTimer = undefined;
        _this7._bAfterBindingAlreadyApplied = false;
        _this7.queryWatcher.reset();
      }, null);
      this.onAfterBindingPromise = new Promise(function (resolve) {
        try {
          var aTableChartInitializedPromises = _this8.registerAggregatedControls(oBindingContext);
          var _temp2 = function () {
            if (aTableChartInitializedPromises.length > 0) {
              return Promise.resolve(Promise.all(aTableChartInitializedPromises)).then(function () {
                _this8.bTablesChartsLoaded = true;
                _this8.checkPageReadyDebounced();
                resolve();
              });
            } else {
              _this8.checkPageReadyDebounced();
              resolve();
            }
          }();
          return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      });
    };
    _proto.isPageReady = function isPageReady() {
      return this._bIsPageReady;
    };
    _proto.waitPageReady = function waitPageReady() {
      var _this9 = this;
      return new Promise(function (resolve) {
        if (_this9.isPageReady()) {
          resolve();
        } else {
          _this9.attachEventOnce("pageReady", null, function () {
            resolve();
          }, _this9);
        }
      });
    };
    _proto.attachEventOnce = function attachEventOnce(sEventId, oData, fnFunction, oListener) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.attachEventOnce(sEventId, oData, fnFunction, oListener);
    };
    _proto.attachEvent = function attachEvent(sEventId, oData, fnFunction, oListener) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.attachEvent(sEventId, oData, fnFunction, oListener);
    };
    _proto.detachEvent = function detachEvent(sEventId, fnFunction) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.detachEvent(sEventId, fnFunction);
    };
    _proto.registerContainer = function registerContainer(oContainer) {
      var _this10 = this;
      this._oContainer = oContainer;
      this._fnContainerDelegate = {
        onBeforeShow: function () {
          _this10.bShown = false;
          _this10._bIsPageReady = false;
        },
        onBeforeHide: function () {
          _this10.bShown = false;
          _this10._bIsPageReady = false;
        },
        onAfterShow: function () {
          var _this10$onAfterBindin;
          _this10.bShown = true;
          (_this10$onAfterBindin = _this10.onAfterBindingPromise) === null || _this10$onAfterBindin === void 0 ? void 0 : _this10$onAfterBindin.then(function () {
            _this10._checkPageReady(true);
          });
        }
      };
      this._oContainer.addEventDelegate(this._fnContainerDelegate, this);
    };
    _proto.isContextExpected = function isContextExpected() {
      return false;
    };
    _proto.checkPageReadyDebounced = function checkPageReadyDebounced() {
      var _this11 = this;
      if (this.pageReadyTimer) {
        clearTimeout(this.pageReadyTimer);
      }
      this.pageReadyTimer = setTimeout(function () {
        _this11._checkPageReady();
      }, 200);
    };
    _proto._checkPageReady = function _checkPageReady() {
      var _this12 = this;
      var bFromNav = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var fnUIUpdated = function () {
        // Wait until the UI is no longer dirty
        if (!Core.getUIDirty()) {
          Core.detachEvent("UIUpdated", fnUIUpdated);
          _this12._bWaitingForRefresh = false;
          setTimeout(function () {
            _this12._checkPageReady();
          }, 20);
        }
      };

      // In case UIUpdate does not get called, check if UI is not dirty and then call _checkPageReady
      var checkUIUpdated = function () {
        if (Core.getUIDirty()) {
          setTimeout(checkUIUpdated, 500);
        } else if (_this12._bWaitingForRefresh) {
          _this12._bWaitingForRefresh = false;
          Core.detachEvent("UIUpdated", fnUIUpdated);
          _this12._checkPageReady();
        }
      };
      if (this.bShown && this.queryWatcher.isDataReceived() !== false && this.bTablesChartsLoaded !== false && (!this.isContextExpected() || this.bHasContext) // Either no context is expected or there is one
      ) {
        if (this.queryWatcher.isDataReceived() === true && !bFromNav && !this._bWaitingForRefresh && Core.getUIDirty()) {
          // If we requested data we get notified as soon as the data arrived, so before the next rendering tick
          this.queryWatcher.resetDataReceived();
          this._bWaitingForRefresh = true;
          Core.attachEvent("UIUpdated", fnUIUpdated);
          setTimeout(checkUIUpdated, 500);
        } else if (!this._bWaitingForRefresh && Core.getUIDirty() || this._nbWaits !== 0 || TemplatedViewServiceFactory.getNumberOfViewsInCreationState() > 0 || this.queryWatcher.isSearchPending()) {
          this._bWaitingForRefresh = true;
          Core.attachEvent("UIUpdated", fnUIUpdated);
          setTimeout(checkUIUpdated, 500);
        } else if (!this._bWaitingForRefresh) {
          // In the case we're not waiting for any data (navigating back to a page we already have loaded)
          // just wait for a frame to fire the event.
          this._bIsPageReady = true;
          this._oEventProvider.fireEvent("pageReady");
        }
      }
    };
    return PageReadyControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "waitFor", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "waitFor"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatched", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatched"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatchedFinished", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatchedFinished"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isPageReady", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "isPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "waitPageReady", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "waitPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "attachEventOnce", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "attachEventOnce"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "attachEvent", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "attachEvent"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "detachEvent", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "detachEvent"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isContextExpected", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "isContextExpected"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "checkPageReadyDebounced", [_dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "checkPageReadyDebounced"), _class2.prototype)), _class2)) || _class);
  return PageReadyControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdlUmVhZHlDb250cm9sbGVyRXh0ZW5zaW9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJtZXRob2RPdmVycmlkZSIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwYWdlUmVhZHlUaW1lb3V0RGVmYXVsdCIsIm9uSW5pdCIsIl9uYldhaXRzIiwiX29FdmVudFByb3ZpZGVyIiwiRXZlbnRQcm92aWRlciIsIl9vVmlldyIsImdldFZpZXciLCJfb0FwcENvbXBvbmVudCIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiX29QYWdlQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJtYW5pZmVzdENvbnRlbnQiLCJnZXRNYW5pZmVzdCIsInBhZ2VSZWFkeVRpbWVvdXQiLCJhdHRhY2hDb250YWluZXJEZWZpbmVkIiwib0V2ZW50IiwicmVnaXN0ZXJDb250YWluZXIiLCJnZXRQYXJhbWV0ZXIiLCJvUm9vdENvbnRyb2xDb250cm9sbGVyIiwiZ2V0Um9vdENvbnRyb2wiLCJnZXRDb250cm9sbGVyIiwib1BsYWNlaG9sZGVyIiwiZ2V0UGxhY2Vob2xkZXIiLCJpc1BsYWNlaG9sZGVyRGVidWdFbmFibGVkIiwiYXR0YWNoRXZlbnQiLCJnZXRQbGFjZWhvbGRlckRlYnVnU3RhdHMiLCJpUGFnZVJlYWR5RXZlbnRUaW1lc3RhbXAiLCJEYXRlIiwibm93IiwiaUhlcm9lc0JhdGNoUmVjZWl2ZWRFdmVudFRpbWVzdGFtcCIsInF1ZXJ5V2F0Y2hlciIsIkRhdGFRdWVyeVdhdGNoZXIiLCJjaGVja1BhZ2VSZWFkeURlYm91bmNlZCIsImJpbmQiLCJvbkV4aXQiLCJfb0NvbnRhaW5lciIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJfZm5Db250YWluZXJEZWxlZ2F0ZSIsIndhaXRGb3IiLCJvUHJvbWlzZSIsImZpbmFsbHkiLCJzZXRUaW1lb3V0IiwiY2F0Y2giLCJvblJvdXRlTWF0Y2hlZCIsIl9iSXNQYWdlUmVhZHkiLCJvblJvdXRlTWF0Y2hlZEZpbmlzaGVkIiwib25BZnRlckJpbmRpbmdQcm9taXNlIiwicmVnaXN0ZXJBZ2dyZWdhdGVkQ29udHJvbHMiLCJtYWluQmluZGluZ0NvbnRleHQiLCJtYWluT2JqZWN0QmluZGluZyIsImdldEJpbmRpbmciLCJyZWdpc3RlckJpbmRpbmciLCJhUHJvbWlzZXMiLCJhQ29udHJvbHMiLCJmaW5kQWdncmVnYXRlZE9iamVjdHMiLCJmb3JFYWNoIiwib0VsZW1lbnQiLCJvT2JqZWN0QmluZGluZyIsImdldE9iamVjdEJpbmRpbmciLCJhQmluZGluZ0tleXMiLCJPYmplY3QiLCJrZXlzIiwibUJpbmRpbmdJbmZvcyIsInNQcm9wZXJ0eU5hbWUiLCJvTGlzdEJpbmRpbmciLCJiaW5kaW5nIiwiaXNBIiwiYlRhYmxlc0NoYXJ0c0xvYWRlZCIsInB1c2giLCJyZWdpc3RlclRhYmxlT3JDaGFydCIsInJlZ2lzdGVyRmlsdGVyQmFyIiwib25BZnRlckJpbmRpbmciLCJvQmluZGluZ0NvbnRleHQiLCJwYWdlUmVhZHlUaW1lb3V0VGltZXIiLCJjbGVhclRpbWVvdXQiLCJMb2ciLCJlcnJvciIsImZpcmVFdmVudCIsIl9iQWZ0ZXJCaW5kaW5nQWxyZWFkeUFwcGxpZWQiLCJpc0NvbnRleHRFeHBlY3RlZCIsInVuZGVmaW5lZCIsImJIYXNDb250ZXh0IiwiYXR0YWNoRXZlbnRPbmNlIiwicmVzZXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImFUYWJsZUNoYXJ0SW5pdGlhbGl6ZWRQcm9taXNlcyIsImxlbmd0aCIsImFsbCIsImlzUGFnZVJlYWR5Iiwid2FpdFBhZ2VSZWFkeSIsInNFdmVudElkIiwib0RhdGEiLCJmbkZ1bmN0aW9uIiwib0xpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJvQ29udGFpbmVyIiwib25CZWZvcmVTaG93IiwiYlNob3duIiwib25CZWZvcmVIaWRlIiwib25BZnRlclNob3ciLCJ0aGVuIiwiX2NoZWNrUGFnZVJlYWR5IiwiYWRkRXZlbnREZWxlZ2F0ZSIsInBhZ2VSZWFkeVRpbWVyIiwiYkZyb21OYXYiLCJmblVJVXBkYXRlZCIsIkNvcmUiLCJnZXRVSURpcnR5IiwiX2JXYWl0aW5nRm9yUmVmcmVzaCIsImNoZWNrVUlVcGRhdGVkIiwiaXNEYXRhUmVjZWl2ZWQiLCJyZXNldERhdGFSZWNlaXZlZCIsIlRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeSIsImdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUiLCJpc1NlYXJjaFBlbmRpbmciLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQYWdlUmVhZHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IERhdGFRdWVyeVdhdGNoZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3BhZ2VSZWFkeS9EYXRhUXVlcnlXYXRjaGVyXCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9UZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IEV2ZW50UHJvdmlkZXIgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50UHJvdmlkZXJcIjtcbmltcG9ydCB0eXBlIE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCIuLi9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBtZXRob2RPdmVycmlkZSwgcHJpdmF0ZUV4dGVuc2lvbiwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcIi4uL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlBhZ2VSZWFkeVwiKVxuY2xhc3MgUGFnZVJlYWR5Q29udHJvbGxlckV4dGVuc2lvbiBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcm90ZWN0ZWQgYmFzZSE6IFBhZ2VDb250cm9sbGVyO1xuXHRwcml2YXRlIF9vRXZlbnRQcm92aWRlciE6IEV2ZW50UHJvdmlkZXI7XG5cdHByaXZhdGUgX29WaWV3PzogVmlldztcblx0cHJpdmF0ZSBfb0FwcENvbXBvbmVudCE6IEFwcENvbXBvbmVudDtcblx0cHJpdmF0ZSBfb1BhZ2VDb21wb25lbnQhOiBhbnk7XG5cdHByaXZhdGUgX29Db250YWluZXIhOiBhbnk7XG5cdHByaXZhdGUgX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCE6IGJvb2xlYW47XG5cdHByaXZhdGUgX2ZuQ29udGFpbmVyRGVsZWdhdGU6IGFueTtcblx0cHJpdmF0ZSBfbmJXYWl0cyE6IG51bWJlcjtcblx0cHJpdmF0ZSBfYklzUGFnZVJlYWR5ITogYm9vbGVhbjtcblx0cHJpdmF0ZSBfYldhaXRpbmdGb3JSZWZyZXNoITogYm9vbGVhbjtcblx0cHJpdmF0ZSBiU2hvd24hOiBib29sZWFuO1xuXHRwcml2YXRlIGJIYXNDb250ZXh0ITogYm9vbGVhbjtcblx0cHJpdmF0ZSBiVGFibGVzQ2hhcnRzTG9hZGVkPzogYm9vbGVhbjtcblx0cHJpdmF0ZSBwYWdlUmVhZHlUaW1lcjogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG5cdHByaXZhdGUgcXVlcnlXYXRjaGVyITogRGF0YVF1ZXJ5V2F0Y2hlcjtcblx0cHJpdmF0ZSBvbkFmdGVyQmluZGluZ1Byb21pc2UhOiBQcm9taXNlPHZvaWQ+O1xuXHRwcml2YXRlIHBhZ2VSZWFkeVRpbWVvdXREZWZhdWx0ID0gNzAwMDtcblx0cHJpdmF0ZSBwYWdlUmVhZHlUaW1lb3V0VGltZXI/OiBudW1iZXI7XG5cdHByaXZhdGUgcGFnZVJlYWR5VGltZW91dD86IG51bWJlcjtcblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRwdWJsaWMgb25Jbml0KCkge1xuXHRcdHRoaXMuX25iV2FpdHMgPSAwO1xuXHRcdHRoaXMuX29FdmVudFByb3ZpZGVyID0gdGhpcy5fb0V2ZW50UHJvdmlkZXIgPyB0aGlzLl9vRXZlbnRQcm92aWRlciA6IG5ldyBFdmVudFByb3ZpZGVyKCk7XG5cdFx0dGhpcy5fb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHR0aGlzLl9vQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuX29WaWV3KTtcblx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcih0aGlzLl9vVmlldyk7XG5cblx0XHRjb25zdCBtYW5pZmVzdENvbnRlbnQgPSB0aGlzLl9vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCkgYXMgYW55O1xuXHRcdHRoaXMucGFnZVJlYWR5VGltZW91dCA9IG1hbmlmZXN0Q29udGVudFtcInNhcC51aTVcIl0/LnBhZ2VSZWFkeVRpbWVvdXQgPz8gdGhpcy5wYWdlUmVhZHlUaW1lb3V0RGVmYXVsdDtcblxuXHRcdGlmICh0aGlzLl9vUGFnZUNvbXBvbmVudCAmJiB0aGlzLl9vUGFnZUNvbXBvbmVudC5hdHRhY2hDb250YWluZXJEZWZpbmVkKSB7XG5cdFx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudC5hdHRhY2hDb250YWluZXJEZWZpbmVkKChvRXZlbnQ6IEV2ZW50KSA9PiB0aGlzLnJlZ2lzdGVyQ29udGFpbmVyKG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJjb250YWluZXJcIikpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5yZWdpc3RlckNvbnRhaW5lcih0aGlzLl9vVmlldyk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb1Jvb3RDb250cm9sQ29udHJvbGxlciA9ICh0aGlzLl9vQXBwQ29tcG9uZW50LmdldFJvb3RDb250cm9sKCkgYXMgVmlldykuZ2V0Q29udHJvbGxlcigpIGFzIGFueTtcblx0XHRjb25zdCBvUGxhY2Vob2xkZXIgPSBvUm9vdENvbnRyb2xDb250cm9sbGVyPy5nZXRQbGFjZWhvbGRlciAmJiBvUm9vdENvbnRyb2xDb250cm9sbGVyLmdldFBsYWNlaG9sZGVyKCk7XG5cdFx0aWYgKG9QbGFjZWhvbGRlcj8uaXNQbGFjZWhvbGRlckRlYnVnRW5hYmxlZCgpKSB7XG5cdFx0XHR0aGlzLmF0dGFjaEV2ZW50KFxuXHRcdFx0XHRcInBhZ2VSZWFkeVwiLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHQoKSA9PiB7XG5cdFx0XHRcdFx0b1BsYWNlaG9sZGVyLmdldFBsYWNlaG9sZGVyRGVidWdTdGF0cygpLmlQYWdlUmVhZHlFdmVudFRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRoaXNcblx0XHRcdCk7XG5cdFx0XHR0aGlzLmF0dGFjaEV2ZW50KFxuXHRcdFx0XHRcImhlcm9lc0JhdGNoUmVjZWl2ZWRcIixcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdG9QbGFjZWhvbGRlci5nZXRQbGFjZWhvbGRlckRlYnVnU3RhdHMoKS5pSGVyb2VzQmF0Y2hSZWNlaXZlZEV2ZW50VGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dGhpc1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR0aGlzLnF1ZXJ5V2F0Y2hlciA9IG5ldyBEYXRhUXVlcnlXYXRjaGVyKHRoaXMuX29FdmVudFByb3ZpZGVyLCB0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkLmJpbmQodGhpcykpO1xuXHR9XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0cHVibGljIG9uRXhpdCgpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGRlbGV0ZSB0aGlzLl9vQXBwQ29tcG9uZW50O1xuXHRcdGlmICh0aGlzLl9vQ29udGFpbmVyKSB7XG5cdFx0XHR0aGlzLl9vQ29udGFpbmVyLnJlbW92ZUV2ZW50RGVsZWdhdGUodGhpcy5fZm5Db250YWluZXJEZWxlZ2F0ZSk7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHB1YmxpYyB3YWl0Rm9yKG9Qcm9taXNlOiBhbnkpIHtcblx0XHR0aGlzLl9uYldhaXRzKys7XG5cdFx0b1Byb21pc2Vcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fbmJXYWl0cy0tO1xuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2gobnVsbCk7XG5cdH1cblx0QG1ldGhvZE92ZXJyaWRlKFwiX3JvdXRpbmdcIilcblx0b25Sb3V0ZU1hdGNoZWQoKSB7XG5cdFx0dGhpcy5fYklzUGFnZVJlYWR5ID0gZmFsc2U7XG5cdH1cblx0QG1ldGhvZE92ZXJyaWRlKFwiX3JvdXRpbmdcIilcblx0YXN5bmMgb25Sb3V0ZU1hdGNoZWRGaW5pc2hlZCgpIHtcblx0XHRhd2FpdCB0aGlzLm9uQWZ0ZXJCaW5kaW5nUHJvbWlzZTtcblx0XHR0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkKCk7XG5cdH1cblxuXHRwdWJsaWMgcmVnaXN0ZXJBZ2dyZWdhdGVkQ29udHJvbHMobWFpbkJpbmRpbmdDb250ZXh0PzogQ29udGV4dCk6IFByb21pc2U8dm9pZD5bXSB7XG5cdFx0aWYgKG1haW5CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Y29uc3QgbWFpbk9iamVjdEJpbmRpbmcgPSBtYWluQmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpO1xuXHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJCaW5kaW5nKG1haW5PYmplY3RCaW5kaW5nKTtcblx0XHR9XG5cblx0XHRjb25zdCBhUHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXHRcdGNvbnN0IGFDb250cm9scyA9IHRoaXMuZ2V0VmlldygpLmZpbmRBZ2dyZWdhdGVkT2JqZWN0cyh0cnVlKTtcblxuXHRcdGFDb250cm9scy5mb3JFYWNoKChvRWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvT2JqZWN0QmluZGluZyA9IG9FbGVtZW50LmdldE9iamVjdEJpbmRpbmcoKTtcblx0XHRcdGlmIChvT2JqZWN0QmluZGluZykge1xuXHRcdFx0XHQvLyBSZWdpc3RlciBvbiBhbGwgb2JqZWN0IGJpbmRpbmcgKG1vc3RseSB1c2VkIG9uIG9iamVjdCBwYWdlcylcblx0XHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJCaW5kaW5nKG9PYmplY3RCaW5kaW5nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGFCaW5kaW5nS2V5cyA9IE9iamVjdC5rZXlzKG9FbGVtZW50Lm1CaW5kaW5nSW5mb3MpO1xuXHRcdFx0XHRhQmluZGluZ0tleXMuZm9yRWFjaCgoc1Byb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IG9FbGVtZW50Lm1CaW5kaW5nSW5mb3Nbc1Byb3BlcnR5TmFtZV0uYmluZGluZztcblxuXHRcdFx0XHRcdGlmIChvTGlzdEJpbmRpbmcgJiYgb0xpc3RCaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnF1ZXJ5V2F0Y2hlci5yZWdpc3RlckJpbmRpbmcob0xpc3RCaW5kaW5nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gVGhpcyBpcyBkaXJ0eSBidXQgTURDVGFibGVzIGFuZCBNRENDaGFydHMgaGF2ZSBhIHdlaXJkIGxvYWRpbmcgbGlmZWN5Y2xlXG5cdFx0XHRpZiAob0VsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSB8fCBvRWxlbWVudC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRcdHRoaXMuYlRhYmxlc0NoYXJ0c0xvYWRlZCA9IGZhbHNlO1xuXHRcdFx0XHRhUHJvbWlzZXMucHVzaCh0aGlzLnF1ZXJ5V2F0Y2hlci5yZWdpc3RlclRhYmxlT3JDaGFydChvRWxlbWVudCkpO1xuXHRcdFx0fSBlbHNlIGlmIChvRWxlbWVudC5pc0EoXCJzYXAuZmUuY29yZS5jb250cm9scy5GaWx0ZXJCYXJcIikpIHtcblx0XHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJGaWx0ZXJCYXIob0VsZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGFQcm9taXNlcztcblx0fVxuXG5cdEBtZXRob2RPdmVycmlkZShcIl9yb3V0aW5nXCIpXG5cdG9uQWZ0ZXJCaW5kaW5nKG9CaW5kaW5nQ29udGV4dD86IENvbnRleHQpIHtcblx0XHQvLyBJbiBjYXNlIHRoZSBwYWdlIGlzIHJlYmluZCB3ZSBuZWVkIHRvIGNsZWFyIHRoZSB0aW1lciAoZWc6IGluIEZDTCwgdGhlIHVzZXIgY2FuIHNlbGVjdCAyIGl0ZW1zIHN1Y2Nlc3NpdmVseSBpbiB0aGUgbGlzdCByZXBvcnQpXG5cdFx0aWYgKHRoaXMucGFnZVJlYWR5VGltZW91dFRpbWVyKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5wYWdlUmVhZHlUaW1lb3V0VGltZXIpO1xuXHRcdH1cblx0XHR0aGlzLnBhZ2VSZWFkeVRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0TG9nLmVycm9yKGBUaGUgUGFnZVJlYWR5IEV2ZW50IHdhcyBub3QgZmlyZWQgd2l0aGluIHRoZSAke3RoaXMucGFnZVJlYWR5VGltZW91dH0gbXMgdGltZW91dCAuIEl0IGhhcyBiZWVuIGZvcmNlZC5gKTtcblx0XHRcdHRoaXMuX29FdmVudFByb3ZpZGVyLmZpcmVFdmVudChcInBhZ2VSZWFkeVwiKTtcblx0XHR9LCB0aGlzLnBhZ2VSZWFkeVRpbWVvdXQpO1xuXG5cdFx0aWYgKHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCA9IHRydWU7XG5cdFx0aWYgKHRoaXMuaXNDb250ZXh0RXhwZWN0ZWQoKSAmJiBvQmluZGluZ0NvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gRm9yY2UgdG8gbWVudGlvbiB3ZSBhcmUgZXhwZWN0aW5nIGRhdGFcblx0XHRcdHRoaXMuYkhhc0NvbnRleHQgPSBmYWxzZTtcblx0XHRcdHJldHVybjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5iSGFzQ29udGV4dCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5hdHRhY2hFdmVudE9uY2UoXG5cdFx0XHRcInBhZ2VSZWFkeVwiLFxuXHRcdFx0bnVsbCxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMucGFnZVJlYWR5VGltZW91dFRpbWVyKTtcblx0XHRcdFx0dGhpcy5wYWdlUmVhZHlUaW1lb3V0VGltZXIgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLnF1ZXJ5V2F0Y2hlci5yZXNldCgpO1xuXHRcdFx0fSxcblx0XHRcdG51bGxcblx0XHQpO1xuXG5cdFx0dGhpcy5vbkFmdGVyQmluZGluZ1Byb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Y29uc3QgYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzID0gdGhpcy5yZWdpc3RlckFnZ3JlZ2F0ZWRDb250cm9scyhvQmluZGluZ0NvbnRleHQpO1xuXG5cdFx0XHRpZiAoYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzKTtcblx0XHRcdFx0dGhpcy5iVGFibGVzQ2hhcnRzTG9hZGVkID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5jaGVja1BhZ2VSZWFkeURlYm91bmNlZCgpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkKCk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgaXNQYWdlUmVhZHkoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2JJc1BhZ2VSZWFkeTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgd2FpdFBhZ2VSZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGlmICh0aGlzLmlzUGFnZVJlYWR5KCkpIHtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5hdHRhY2hFdmVudE9uY2UoXG5cdFx0XHRcdFx0XCJwYWdlUmVhZHlcIixcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRoaXNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgYXR0YWNoRXZlbnRPbmNlKHNFdmVudElkOiBzdHJpbmcsIG9EYXRhOiBhbnksIGZuRnVuY3Rpb24/OiBGdW5jdGlvbiwgb0xpc3RlbmVyPzogYW55KSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuXHRcdHJldHVybiB0aGlzLl9vRXZlbnRQcm92aWRlci5hdHRhY2hFdmVudE9uY2Uoc0V2ZW50SWQsIG9EYXRhLCBmbkZ1bmN0aW9uIGFzIEZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgYXR0YWNoRXZlbnQoc0V2ZW50SWQ6IHN0cmluZywgb0RhdGE6IGFueSwgZm5GdW5jdGlvbjogRnVuY3Rpb24sIG9MaXN0ZW5lcjogYW55KSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuXHRcdHJldHVybiB0aGlzLl9vRXZlbnRQcm92aWRlci5hdHRhY2hFdmVudChzRXZlbnRJZCwgb0RhdGEsIGZuRnVuY3Rpb24sIG9MaXN0ZW5lcik7XG5cdH1cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHB1YmxpYyBkZXRhY2hFdmVudChzRXZlbnRJZDogc3RyaW5nLCBmbkZ1bmN0aW9uOiBGdW5jdGlvbikge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcblx0XHRyZXR1cm4gdGhpcy5fb0V2ZW50UHJvdmlkZXIuZGV0YWNoRXZlbnQoc0V2ZW50SWQsIGZuRnVuY3Rpb24pO1xuXHR9XG5cdHByaXZhdGUgcmVnaXN0ZXJDb250YWluZXIob0NvbnRhaW5lcjogTWFuYWdlZE9iamVjdCkge1xuXHRcdHRoaXMuX29Db250YWluZXIgPSBvQ29udGFpbmVyO1xuXHRcdHRoaXMuX2ZuQ29udGFpbmVyRGVsZWdhdGUgPSB7XG5cdFx0XHRvbkJlZm9yZVNob3c6ICgpID0+IHtcblx0XHRcdFx0dGhpcy5iU2hvd24gPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5fYklzUGFnZVJlYWR5ID0gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0b25CZWZvcmVIaWRlOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYlNob3duID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuX2JJc1BhZ2VSZWFkeSA9IGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdG9uQWZ0ZXJTaG93OiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYlNob3duID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5vbkFmdGVyQmluZGluZ1Byb21pc2U/LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2NoZWNrUGFnZVJlYWR5KHRydWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX29Db250YWluZXIuYWRkRXZlbnREZWxlZ2F0ZSh0aGlzLl9mbkNvbnRhaW5lckRlbGVnYXRlLCB0aGlzKTtcblx0fVxuXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZClcblx0cHVibGljIGlzQ29udGV4dEV4cGVjdGVkKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRwdWJsaWMgY2hlY2tQYWdlUmVhZHlEZWJvdW5jZWQoKSB7XG5cdFx0aWYgKHRoaXMucGFnZVJlYWR5VGltZXIpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnBhZ2VSZWFkeVRpbWVyKTtcblx0XHR9XG5cdFx0dGhpcy5wYWdlUmVhZHlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGhpcy5fY2hlY2tQYWdlUmVhZHkoKTtcblx0XHR9LCAyMDApO1xuXHR9XG5cblx0cHVibGljIF9jaGVja1BhZ2VSZWFkeShiRnJvbU5hdjogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Y29uc3QgZm5VSVVwZGF0ZWQgPSAoKSA9PiB7XG5cdFx0XHQvLyBXYWl0IHVudGlsIHRoZSBVSSBpcyBubyBsb25nZXIgZGlydHlcblx0XHRcdGlmICghQ29yZS5nZXRVSURpcnR5KCkpIHtcblx0XHRcdFx0Q29yZS5kZXRhY2hFdmVudChcIlVJVXBkYXRlZFwiLCBmblVJVXBkYXRlZCk7XG5cdFx0XHRcdHRoaXMuX2JXYWl0aW5nRm9yUmVmcmVzaCA9IGZhbHNlO1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9jaGVja1BhZ2VSZWFkeSgpO1xuXHRcdFx0XHR9LCAyMCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIEluIGNhc2UgVUlVcGRhdGUgZG9lcyBub3QgZ2V0IGNhbGxlZCwgY2hlY2sgaWYgVUkgaXMgbm90IGRpcnR5IGFuZCB0aGVuIGNhbGwgX2NoZWNrUGFnZVJlYWR5XG5cdFx0Y29uc3QgY2hlY2tVSVVwZGF0ZWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAoQ29yZS5nZXRVSURpcnR5KCkpIHtcblx0XHRcdFx0c2V0VGltZW91dChjaGVja1VJVXBkYXRlZCwgNTAwKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoKSB7XG5cdFx0XHRcdHRoaXMuX2JXYWl0aW5nRm9yUmVmcmVzaCA9IGZhbHNlO1xuXHRcdFx0XHRDb3JlLmRldGFjaEV2ZW50KFwiVUlVcGRhdGVkXCIsIGZuVUlVcGRhdGVkKTtcblx0XHRcdFx0dGhpcy5fY2hlY2tQYWdlUmVhZHkoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5iU2hvd24gJiZcblx0XHRcdHRoaXMucXVlcnlXYXRjaGVyLmlzRGF0YVJlY2VpdmVkKCkgIT09IGZhbHNlICYmXG5cdFx0XHR0aGlzLmJUYWJsZXNDaGFydHNMb2FkZWQgIT09IGZhbHNlICYmXG5cdFx0XHQoIXRoaXMuaXNDb250ZXh0RXhwZWN0ZWQoKSB8fCB0aGlzLmJIYXNDb250ZXh0KSAvLyBFaXRoZXIgbm8gY29udGV4dCBpcyBleHBlY3RlZCBvciB0aGVyZSBpcyBvbmVcblx0XHQpIHtcblx0XHRcdGlmICh0aGlzLnF1ZXJ5V2F0Y2hlci5pc0RhdGFSZWNlaXZlZCgpID09PSB0cnVlICYmICFiRnJvbU5hdiAmJiAhdGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoICYmIENvcmUuZ2V0VUlEaXJ0eSgpKSB7XG5cdFx0XHRcdC8vIElmIHdlIHJlcXVlc3RlZCBkYXRhIHdlIGdldCBub3RpZmllZCBhcyBzb29uIGFzIHRoZSBkYXRhIGFycml2ZWQsIHNvIGJlZm9yZSB0aGUgbmV4dCByZW5kZXJpbmcgdGlja1xuXHRcdFx0XHR0aGlzLnF1ZXJ5V2F0Y2hlci5yZXNldERhdGFSZWNlaXZlZCgpO1xuXHRcdFx0XHR0aGlzLl9iV2FpdGluZ0ZvclJlZnJlc2ggPSB0cnVlO1xuXHRcdFx0XHRDb3JlLmF0dGFjaEV2ZW50KFwiVUlVcGRhdGVkXCIsIGZuVUlVcGRhdGVkKTtcblx0XHRcdFx0c2V0VGltZW91dChjaGVja1VJVXBkYXRlZCwgNTAwKTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdCghdGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoICYmIENvcmUuZ2V0VUlEaXJ0eSgpKSB8fFxuXHRcdFx0XHR0aGlzLl9uYldhaXRzICE9PSAwIHx8XG5cdFx0XHRcdFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS5nZXROdW1iZXJPZlZpZXdzSW5DcmVhdGlvblN0YXRlKCkgPiAwIHx8XG5cdFx0XHRcdHRoaXMucXVlcnlXYXRjaGVyLmlzU2VhcmNoUGVuZGluZygpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoID0gdHJ1ZTtcblx0XHRcdFx0Q29yZS5hdHRhY2hFdmVudChcIlVJVXBkYXRlZFwiLCBmblVJVXBkYXRlZCk7XG5cdFx0XHRcdHNldFRpbWVvdXQoY2hlY2tVSVVwZGF0ZWQsIDUwMCk7XG5cdFx0XHR9IGVsc2UgaWYgKCF0aGlzLl9iV2FpdGluZ0ZvclJlZnJlc2gpIHtcblx0XHRcdFx0Ly8gSW4gdGhlIGNhc2Ugd2UncmUgbm90IHdhaXRpbmcgZm9yIGFueSBkYXRhIChuYXZpZ2F0aW5nIGJhY2sgdG8gYSBwYWdlIHdlIGFscmVhZHkgaGF2ZSBsb2FkZWQpXG5cdFx0XHRcdC8vIGp1c3Qgd2FpdCBmb3IgYSBmcmFtZSB0byBmaXJlIHRoZSBldmVudC5cblx0XHRcdFx0dGhpcy5fYklzUGFnZVJlYWR5ID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5fb0V2ZW50UHJvdmlkZXIuZmlyZUV2ZW50KFwicGFnZVJlYWR5XCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYWdlUmVhZHlDb250cm9sbGVyRXh0ZW5zaW9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztNQWtCTUEsNEJBQTRCLFdBRGpDQyxjQUFjLENBQUMsNENBQTRDLENBQUMsVUF1QjNEQyxjQUFjLEVBQUUsVUF5Q2hCQSxjQUFjLEVBQUUsVUFVaEJDLGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBV2hCRixjQUFjLENBQUMsVUFBVSxDQUFDLFVBSTFCQSxjQUFjLENBQUMsVUFBVSxDQUFDLFVBMEMxQkEsY0FBYyxDQUFD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