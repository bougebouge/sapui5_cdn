/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (Log, Service, ServiceFactory) {
  "use strict";

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Mock implementation of the ShellService for OpenFE
   *
   * @implements {IShellServices}
   * @private
   */
  var ShellServiceMock = /*#__PURE__*/function (_Service) {
    _inheritsLoose(ShellServiceMock, _Service);
    function ShellServiceMock() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = ShellServiceMock.prototype;
    _proto.init = function init() {
      this.initPromise = Promise.resolve(this);
      this.instanceType = "mock";
    };
    _proto.getLinks = function getLinks( /*oArgs: object*/
    ) {
      return Promise.resolve([]);
    };
    _proto.getLinksWithCache = function getLinksWithCache( /*oArgs: object*/
    ) {
      return Promise.resolve([]);
    };
    _proto.toExternal = function toExternal( /*oNavArgumentsArr: Array<object>, oComponent: object*/
    ) {
      /* Do Nothing */
    };
    _proto.getStartupAppState = function getStartupAppState( /*oArgs: object*/
    ) {
      return Promise.resolve(null);
    };
    _proto.backToPreviousApp = function backToPreviousApp() {
      /* Do Nothing */
    };
    _proto.hrefForExternal = function hrefForExternal( /*oArgs?: object, oComponent?: object, bAsync?: boolean*/
    ) {
      return "";
    };
    _proto.hrefForExternalAsync = function hrefForExternalAsync( /*oArgs?: object, oComponent?: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.getAppState = function getAppState( /*oComponent: object, sAppStateKey: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.createEmptyAppState = function createEmptyAppState( /*oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.createEmptyAppStateAsync = function createEmptyAppStateAsync( /*oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.isNavigationSupported = function isNavigationSupported( /*oNavArgumentsArr: Array<object>, oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.isInitialNavigation = function isInitialNavigation() {
      return false;
    };
    _proto.isInitialNavigationAsync = function isInitialNavigationAsync() {
      return Promise.resolve({});
    };
    _proto.expandCompactHash = function expandCompactHash( /*sHashFragment: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.parseShellHash = function parseShellHash( /*sHash: string*/
    ) {
      return {};
    };
    _proto.splitHash = function splitHash( /*sHash: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.constructShellHash = function constructShellHash( /*oNewShellHash: object*/
    ) {
      return "";
    };
    _proto.setDirtyFlag = function setDirtyFlag( /*bDirty: boolean*/
    ) {
      /* Do Nothing */
    };
    _proto.registerDirtyStateProvider = function registerDirtyStateProvider( /*fnDirtyStateProvider: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.deregisterDirtyStateProvider = function deregisterDirtyStateProvider( /*fnDirtyStateProvider: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.createRenderer = function createRenderer() {
      return {};
    };
    _proto.getUser = function getUser() {
      return {};
    };
    _proto.hasUShell = function hasUShell() {
      return false;
    };
    _proto.registerNavigationFilter = function registerNavigationFilter( /*fnNavFilter: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.unregisterNavigationFilter = function unregisterNavigationFilter( /*fnNavFilter: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.setBackNavigation = function setBackNavigation( /*fnCallBack?: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.setHierarchy = function setHierarchy( /*aHierarchyLevels: Array<object>*/
    ) {
      /* Do Nothing */
    };
    _proto.setTitle = function setTitle( /*sTitle: string*/
    ) {
      /* Do Nothing */
    };
    _proto.getContentDensity = function getContentDensity() {
      // in case there is no shell we probably need to look at the classes being defined on the body
      if (document.body.classList.contains("sapUiSizeCozy")) {
        return "cozy";
      } else if (document.body.classList.contains("sapUiSizeCompact")) {
        return "compact";
      } else {
        return "";
      }
    };
    _proto.getPrimaryIntent = function getPrimaryIntent( /*sSemanticObject: string, mParameters?: object*/
    ) {
      return Promise.resolve();
    };
    _proto.waitForPluginsLoad = function waitForPluginsLoad() {
      return Promise.resolve(true);
    };
    return ShellServiceMock;
  }(Service);
  /**
   * @typedef ShellServicesSettings
   * @private
   */
  /**
   * Wrap a JQuery Promise within a native {Promise}.
   *
   * @template {object} T
   * @param jqueryPromise The original jquery promise
   * @returns A native promise wrapping the same object
   * @private
   */
  function wrapJQueryPromise(jqueryPromise) {
    return new Promise(function (resolve, reject) {
      // eslint-disable-next-line promise/catch-or-return
      jqueryPromise.done(resolve).fail(reject);
    });
  }

  /**
   * Base implementation of the ShellServices
   *
   * @implements {IShellServices}
   * @private
   */
  var ShellServices = /*#__PURE__*/function (_Service2) {
    _inheritsLoose(ShellServices, _Service2);
    function ShellServices() {
      return _Service2.apply(this, arguments) || this;
    }
    var _proto2 = ShellServices.prototype;
    // !: means that we know it will be assigned before usage
    _proto2.init = function init() {
      var _this = this;
      var oContext = this.getContext();
      var oComponent = oContext.scopeObject;
      this.oShellContainer = oContext.settings.shellContainer;
      this.instanceType = "real";
      this.linksCache = {};
      this.fnFindSemanticObjectsInCache = function (oArgs) {
        var _oArgs = oArgs;
        var aCachedSemanticObjects = [];
        var aNonCachedSemanticObjects = [];
        for (var i = 0; i < _oArgs.length; i++) {
          if (!!_oArgs[i][0] && !!_oArgs[i][0].semanticObject) {
            if (this.linksCache[_oArgs[i][0].semanticObject]) {
              aCachedSemanticObjects.push(this.linksCache[_oArgs[i][0].semanticObject].links);
              Object.defineProperty(oArgs[i][0], "links", {
                value: this.linksCache[_oArgs[i][0].semanticObject].links
              });
            } else {
              aNonCachedSemanticObjects.push(_oArgs[i]);
            }
          }
        }
        return {
          oldArgs: oArgs,
          newArgs: aNonCachedSemanticObjects,
          cachedLinks: aCachedSemanticObjects
        };
      };
      this.initPromise = new Promise(function (resolve, reject) {
        _this.resolveFn = resolve;
        _this.rejectFn = reject;
      });
      var oCrossAppNavServicePromise = this.oShellContainer.getServiceAsync("CrossApplicationNavigation");
      var oUrlParsingServicePromise = this.oShellContainer.getServiceAsync("URLParsing");
      var oShellNavigationServicePromise = this.oShellContainer.getServiceAsync("ShellNavigation");
      var oShellPluginManagerPromise = this.oShellContainer.getServiceAsync("PluginManager");
      var oShellUIServicePromise = oComponent.getService("ShellUIService");
      Promise.all([oCrossAppNavServicePromise, oUrlParsingServicePromise, oShellNavigationServicePromise, oShellUIServicePromise, oShellPluginManagerPromise]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 5),
          oCrossAppNavService = _ref2[0],
          oUrlParsingService = _ref2[1],
          oShellNavigation = _ref2[2],
          oShellUIService = _ref2[3],
          oShellPluginManager = _ref2[4];
        _this.crossAppNavService = oCrossAppNavService;
        _this.urlParsingService = oUrlParsingService;
        _this.shellNavigation = oShellNavigation;
        _this.shellUIService = oShellUIService;
        _this.shellPluginManager = oShellPluginManager;
        _this.resolveFn();
      }).catch(this.rejectFn);
    }

    /**
     * Retrieves the target links configured for a given semantic object & action
     * Will retrieve the CrossApplicationNavigation
     * service reference call the getLinks method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getLinks arguments
     * @returns Promise which will be resolved to target links array
     */;
    _proto2.getLinks = function getLinks(oArgs) {
      var _this2 = this;
      return new Promise(function (resolve, reject) {
        // eslint-disable-next-line promise/catch-or-return
        _this2.crossAppNavService.getLinks(oArgs).fail(function (oError) {
          reject(new Error("".concat(oError, " sap.fe.core.services.ShellServicesFactory.getLinks")));
        }).then(resolve);
      });
    }

    /**
     * Retrieves the target links configured for a given semantic object & action in cache
     * Will retrieve the CrossApplicationNavigation
     * service reference call the getLinks method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getLinks arguments
     * @returns Promise which will be resolved to target links array
     */;
    _proto2.getLinksWithCache = function getLinksWithCache(oArgs) {
      var _this3 = this;
      return new Promise(function (resolve, reject) {
        // eslint-disable-next-line promise/catch-or-return
        if (oArgs.length === 0) {
          resolve([]);
        } else {
          var oCacheResults = _this3.fnFindSemanticObjectsInCache(oArgs);
          if (oCacheResults.newArgs.length === 0) {
            resolve(oCacheResults.cachedLinks);
          } else {
            // eslint-disable-next-line promise/catch-or-return
            _this3.crossAppNavService.getLinks(oCacheResults.newArgs).fail(function (oError) {
              reject(new Error("".concat(oError, " sap.fe.core.services.ShellServicesFactory.getLinksWithCache")));
            }).then(function (aLinks) {
              if (aLinks.length !== 0) {
                var oSemanticObjectsLinks = {};
                for (var i = 0; i < aLinks.length; i++) {
                  if (aLinks[i].length > 0 && oCacheResults.newArgs[i][0].links === undefined) {
                    oSemanticObjectsLinks[oCacheResults.newArgs[i][0].semanticObject] = {
                      links: aLinks[i]
                    };
                    _this3.linksCache = Object.assign(_this3.linksCache, oSemanticObjectsLinks);
                  }
                }
              }
              if (oCacheResults.cachedLinks.length === 0) {
                resolve(aLinks);
              } else {
                var aMergedLinks = [];
                var j = 0;
                for (var k = 0; k < oCacheResults.oldArgs.length; k++) {
                  if (j < aLinks.length) {
                    if (aLinks[j].length > 0 && oCacheResults.oldArgs[k][0].semanticObject === oCacheResults.newArgs[j][0].semanticObject) {
                      aMergedLinks.push(aLinks[j]);
                      j++;
                    } else {
                      aMergedLinks.push(oCacheResults.oldArgs[k][0].links);
                    }
                  } else {
                    aMergedLinks.push(oCacheResults.oldArgs[k][0].links);
                  }
                }
                resolve(aMergedLinks);
              }
            });
          }
        }
      });
    }

    /**
     * Will retrieve the ShellContainer.
     *
     * @private
     * @ui5-restricted
     * sap.ushell.container
     * @returns Object with predefined shellContainer methods
     */;
    _proto2.getShellContainer = function getShellContainer() {
      return this.oShellContainer;
    }

    /**
     * Will call toExternal method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oNavArgumentsArr And
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>toExternal arguments
     */;
    _proto2.toExternal = function toExternal(oNavArgumentsArr, oComponent) {
      this.crossAppNavService.toExternal(oNavArgumentsArr, oComponent);
    }

    /**
     * Retrieves the target startupAppState
     * Will check the existance of the ShellContainer and retrieve the CrossApplicationNavigation
     * service reference call the getStartupAppState method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getStartupAppState arguments
     * @returns Promise which will be resolved to Object
     */;
    _proto2.getStartupAppState = function getStartupAppState(oArgs) {
      var _this4 = this;
      return new Promise(function (resolve, reject) {
        // JQuery Promise behaves differently
        // eslint-disable-next-line promise/catch-or-return
        _this4.crossAppNavService.getStartupAppState(oArgs).fail(function (oError) {
          reject(new Error("".concat(oError, " sap.fe.core.services.ShellServicesFactory.getStartupAppState")));
        }).then(resolve);
      });
    }

    /**
     * Will call backToPreviousApp method of CrossApplicationNavigation service.
     *
     * @returns Something that indicate we've navigated
     * @private
     * @ui5-restricted
     */;
    _proto2.backToPreviousApp = function backToPreviousApp() {
      return this.crossAppNavService.backToPreviousApp();
    }

    /**
     * Will call hrefForExternal method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * @param oComponent The appComponent
     * @param bAsync Whether this call should be async or not
     * sap.ushell.services.CrossApplicationNavigation=>hrefForExternal arguments
     * @returns Promise which will be resolved to string
     */;
    _proto2.hrefForExternal = function hrefForExternal(oArgs, oComponent, bAsync) {
      return this.crossAppNavService.hrefForExternal(oArgs, oComponent, !!bAsync);
    }

    /**
     * Will call hrefForExternal method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * @param oComponent The appComponent
     * sap.ushell.services.CrossApplicationNavigation=>hrefForExternalAsync arguments
     * @returns Promise which will be resolved to string
     */;
    _proto2.hrefForExternalAsync = function hrefForExternalAsync(oArgs, oComponent) {
      return this.crossAppNavService.hrefForExternalAsync(oArgs, oComponent);
    }

    /**
     * Will call getAppState method of CrossApplicationNavigation service with oComponent and oAppStateKey.
     *
     * @private
     * @ui5-restricted
     * @param oComponent
     * @param sAppStateKey Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getAppState arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.getAppState = function getAppState(oComponent, sAppStateKey) {
      return wrapJQueryPromise(this.crossAppNavService.getAppState(oComponent, sAppStateKey));
    }

    /**
     * Will call createEmptyAppState method of CrossApplicationNavigation service with oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>createEmptyAppState arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.createEmptyAppState = function createEmptyAppState(oComponent) {
      return this.crossAppNavService.createEmptyAppState(oComponent);
    }

    /**
     * Will call createEmptyAppStateAsync method of CrossApplicationNavigation service with oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>createEmptyAppStateAsync arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.createEmptyAppStateAsync = function createEmptyAppStateAsync(oComponent) {
      return this.crossAppNavService.createEmptyAppStateAsync(oComponent);
    }

    /**
     * Will call isNavigationSupported method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oNavArgumentsArr
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>isNavigationSupported arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.isNavigationSupported = function isNavigationSupported(oNavArgumentsArr, oComponent) {
      return wrapJQueryPromise(this.crossAppNavService.isNavigationSupported(oNavArgumentsArr, oComponent));
    }

    /**
     * Will call isInitialNavigation method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @returns Promise which will be resolved to boolean
     */;
    _proto2.isInitialNavigation = function isInitialNavigation() {
      return this.crossAppNavService.isInitialNavigation();
    }

    /**
     * Will call isInitialNavigationAsync method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @returns Promise which will be resolved to boolean
     */;
    _proto2.isInitialNavigationAsync = function isInitialNavigationAsync() {
      return this.crossAppNavService.isInitialNavigationAsync();
    }

    /**
     * Will call expandCompactHash method of CrossApplicationNavigation service.
     *
     * @param sHashFragment An (internal format) shell hash
     * @returns A promise the success handler of the resolve promise get an expanded shell hash as first argument
     * @private
     * @ui5-restricted
     */;
    _proto2.expandCompactHash = function expandCompactHash(sHashFragment) {
      return this.crossAppNavService.expandCompactHash(sHashFragment);
    }

    /**
     * Will call parseShellHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param sHash Check the definition of
     * sap.ushell.services.URLParsing=>parseShellHash arguments
     * @returns The parsed url
     */;
    _proto2.parseShellHash = function parseShellHash(sHash) {
      return this.urlParsingService.parseShellHash(sHash);
    }

    /**
     * Will call splitHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param sHash Check the definition of
     * sap.ushell.services.URLParsing=>splitHash arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.splitHash = function splitHash(sHash) {
      return this.urlParsingService.splitHash(sHash);
    }

    /**
     * Will call constructShellHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param oNewShellHash Check the definition of
     * sap.ushell.services.URLParsing=>constructShellHash arguments
     * @returns Shell Hash string
     */;
    _proto2.constructShellHash = function constructShellHash(oNewShellHash) {
      return this.urlParsingService.constructShellHash(oNewShellHash);
    }

    /**
     * Will call setDirtyFlag method with given dirty state.
     *
     * @private
     * @ui5-restricted
     * @param bDirty Check the definition of sap.ushell.Container.setDirtyFlag arguments
     */;
    _proto2.setDirtyFlag = function setDirtyFlag(bDirty) {
      this.oShellContainer.setDirtyFlag(bDirty);
    }

    /**
     * Will call registerDirtyStateProvider method with given dirty state provider callback method.
     *
     * @private
     * @ui5-restricted
     * @param fnDirtyStateProvider Check the definition of sap.ushell.Container.registerDirtyStateProvider arguments
     */;
    _proto2.registerDirtyStateProvider = function registerDirtyStateProvider(fnDirtyStateProvider) {
      this.oShellContainer.registerDirtyStateProvider(fnDirtyStateProvider);
    }

    /**
     * Will call deregisterDirtyStateProvider method with given dirty state provider callback method.
     *
     * @private
     * @ui5-restricted
     * @param fnDirtyStateProvider Check the definition of sap.ushell.Container.deregisterDirtyStateProvider arguments
     */;
    _proto2.deregisterDirtyStateProvider = function deregisterDirtyStateProvider(fnDirtyStateProvider) {
      this.oShellContainer.deregisterDirtyStateProvider(fnDirtyStateProvider);
    }

    /**
     * Will call createRenderer method of ushell container.
     *
     * @private
     * @ui5-restricted
     * @returns Returns renderer object
     */;
    _proto2.createRenderer = function createRenderer() {
      return this.oShellContainer.createRenderer();
    }

    /**
     * Will call getUser method of ushell container.
     *
     * @private
     * @ui5-restricted
     * @returns Returns User object
     */;
    _proto2.getUser = function getUser() {
      return this.oShellContainer.getUser();
    }

    /**
     * Will check if ushell container is available or not.
     *
     * @private
     * @ui5-restricted
     * @returns Returns true
     */;
    _proto2.hasUShell = function hasUShell() {
      return true;
    }

    /**
     * Will call registerNavigationFilter method of shellNavigation.
     *
     * @param fnNavFilter The filter function to register
     * @private
     * @ui5-restricted
     */;
    _proto2.registerNavigationFilter = function registerNavigationFilter(fnNavFilter) {
      this.shellNavigation.registerNavigationFilter(fnNavFilter);
    }

    /**
     * Will call unregisterNavigationFilter method of shellNavigation.
     *
     * @param fnNavFilter The filter function to unregister
     * @private
     * @ui5-restricted
     */;
    _proto2.unregisterNavigationFilter = function unregisterNavigationFilter(fnNavFilter) {
      this.shellNavigation.unregisterNavigationFilter(fnNavFilter);
    }

    /**
     * Will call setBackNavigation method of ShellUIService
     * that displays the back button in the shell header.
     *
     * @param [fnCallBack] A callback function called when the button is clicked in the UI.
     * @private
     * @ui5-restricted
     */;
    _proto2.setBackNavigation = function setBackNavigation(fnCallBack) {
      this.shellUIService.setBackNavigation(fnCallBack);
    }

    /**
     * Will call setHierarchy method of ShellUIService
     * that displays the given hierarchy in the shell header.
     *
     * @param [aHierarchyLevels] An array representing hierarchies of the currently displayed app.
     * @private
     * @ui5-restricted
     */;
    _proto2.setHierarchy = function setHierarchy(aHierarchyLevels) {
      this.shellUIService.setHierarchy(aHierarchyLevels);
    }

    /**
     * Will call setTitle method of ShellUIService
     * that displays the given title in the shell header.
     *
     * @param [sTitle] The new title. The default title is set if this argument is not given.
     * @private
     * @ui5-restricted
     */;
    _proto2.setTitle = function setTitle(sTitle) {
      this.shellUIService.setTitle(sTitle);
    }

    /**
     * Retrieves the currently defined content density.
     *
     * @returns The content density value
     */;
    _proto2.getContentDensity = function getContentDensity() {
      return this.oShellContainer.getUser().getContentDensity();
    }

    /**
     * For a given semantic object, this method considers all actions associated with the semantic object and
     * returns the one tagged as a "primaryAction". If no inbound tagged as "primaryAction" exists, then it returns
     * the intent of the first inbound (after sorting has been applied) matching the action "displayFactSheet".
     *
     * @private
     * @ui5-restricted
     * @param sSemanticObject Semantic object.
     * @param mParameters See #CrossApplicationNavigation#getLinks for description.
     * @returns Promise which will be resolved with an object containing the intent if it exists.
     */;
    _proto2.getPrimaryIntent = function getPrimaryIntent(sSemanticObject, mParameters) {
      var _this5 = this;
      return new Promise(function (resolve, reject) {
        // eslint-disable-next-line promise/catch-or-return
        _this5.crossAppNavService.getPrimaryIntent(sSemanticObject, mParameters).fail(function (oError) {
          reject(new Error("".concat(oError, " sap.fe.core.services.ShellServicesFactory.getPrimaryIntent")));
        }).then(resolve);
      });
    }

    /**
     * Wait for the render extensions plugin to be loaded.
     * If true is returned by the promise we were able to wait for it, otherwise we couldn't and cannot rely on it.
     */;
    _proto2.waitForPluginsLoad = function waitForPluginsLoad() {
      var _this6 = this;
      return new Promise(function (resolve) {
        var _this6$shellPluginMan;
        if (!((_this6$shellPluginMan = _this6.shellPluginManager) !== null && _this6$shellPluginMan !== void 0 && _this6$shellPluginMan.getPluginLoadingPromise)) {
          resolve(false);
        } else {
          // eslint-disable-next-line promise/catch-or-return
          _this6.shellPluginManager.getPluginLoadingPromise("RendererExtensions").fail(function (oError) {
            Log.error(oError, "sap.fe.core.services.ShellServicesFactory.waitForPluginsLoad");
            resolve(false);
          }).then(function () {
            return resolve(true);
          });
        }
      });
    };
    return ShellServices;
  }(Service);
  /**
   * Service Factory for the ShellServices
   *
   * @private
   */
  var ShellServicesFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(ShellServicesFactory, _ServiceFactory);
    function ShellServicesFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto3 = ShellServicesFactory.prototype;
    /**
     * Creates either a standard or a mock Shell service depending on the configuration.
     *
     * @param oServiceContext The shellservice context
     * @returns A promise for a shell service implementation
     * @see ServiceFactory#createInstance
     */
    _proto3.createInstance = function createInstance(oServiceContext) {
      oServiceContext.settings.shellContainer = sap.ushell && sap.ushell.Container;
      var oShellService = oServiceContext.settings.shellContainer ? new ShellServices(oServiceContext) : new ShellServiceMock(oServiceContext);
      return oShellService.initPromise.then(function () {
        // Enrich the appComponent with this method
        oServiceContext.scopeObject.getShellServices = function () {
          return oShellService;
        };
        return oShellService;
      });
    };
    return ShellServicesFactory;
  }(ServiceFactory);
  return ShellServicesFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGVsbFNlcnZpY2VNb2NrIiwiaW5pdCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbnN0YW5jZVR5cGUiLCJnZXRMaW5rcyIsImdldExpbmtzV2l0aENhY2hlIiwidG9FeHRlcm5hbCIsImdldFN0YXJ0dXBBcHBTdGF0ZSIsImJhY2tUb1ByZXZpb3VzQXBwIiwiaHJlZkZvckV4dGVybmFsIiwiaHJlZkZvckV4dGVybmFsQXN5bmMiLCJnZXRBcHBTdGF0ZSIsImNyZWF0ZUVtcHR5QXBwU3RhdGUiLCJjcmVhdGVFbXB0eUFwcFN0YXRlQXN5bmMiLCJpc05hdmlnYXRpb25TdXBwb3J0ZWQiLCJpc0luaXRpYWxOYXZpZ2F0aW9uIiwiaXNJbml0aWFsTmF2aWdhdGlvbkFzeW5jIiwiZXhwYW5kQ29tcGFjdEhhc2giLCJwYXJzZVNoZWxsSGFzaCIsInNwbGl0SGFzaCIsImNvbnN0cnVjdFNoZWxsSGFzaCIsInNldERpcnR5RmxhZyIsInJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciIsImNyZWF0ZVJlbmRlcmVyIiwiZ2V0VXNlciIsImhhc1VTaGVsbCIsInJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlciIsInVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyIiwic2V0QmFja05hdmlnYXRpb24iLCJzZXRIaWVyYXJjaHkiLCJzZXRUaXRsZSIsImdldENvbnRlbnREZW5zaXR5IiwiZG9jdW1lbnQiLCJib2R5IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJnZXRQcmltYXJ5SW50ZW50Iiwid2FpdEZvclBsdWdpbnNMb2FkIiwiU2VydmljZSIsIndyYXBKUXVlcnlQcm9taXNlIiwianF1ZXJ5UHJvbWlzZSIsInJlamVjdCIsImRvbmUiLCJmYWlsIiwiU2hlbGxTZXJ2aWNlcyIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9Db21wb25lbnQiLCJzY29wZU9iamVjdCIsIm9TaGVsbENvbnRhaW5lciIsInNldHRpbmdzIiwic2hlbGxDb250YWluZXIiLCJsaW5rc0NhY2hlIiwiZm5GaW5kU2VtYW50aWNPYmplY3RzSW5DYWNoZSIsIm9BcmdzIiwiX29BcmdzIiwiYUNhY2hlZFNlbWFudGljT2JqZWN0cyIsImFOb25DYWNoZWRTZW1hbnRpY09iamVjdHMiLCJpIiwibGVuZ3RoIiwic2VtYW50aWNPYmplY3QiLCJwdXNoIiwibGlua3MiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwib2xkQXJncyIsIm5ld0FyZ3MiLCJjYWNoZWRMaW5rcyIsInJlc29sdmVGbiIsInJlamVjdEZuIiwib0Nyb3NzQXBwTmF2U2VydmljZVByb21pc2UiLCJnZXRTZXJ2aWNlQXN5bmMiLCJvVXJsUGFyc2luZ1NlcnZpY2VQcm9taXNlIiwib1NoZWxsTmF2aWdhdGlvblNlcnZpY2VQcm9taXNlIiwib1NoZWxsUGx1Z2luTWFuYWdlclByb21pc2UiLCJvU2hlbGxVSVNlcnZpY2VQcm9taXNlIiwiZ2V0U2VydmljZSIsImFsbCIsInRoZW4iLCJvQ3Jvc3NBcHBOYXZTZXJ2aWNlIiwib1VybFBhcnNpbmdTZXJ2aWNlIiwib1NoZWxsTmF2aWdhdGlvbiIsIm9TaGVsbFVJU2VydmljZSIsIm9TaGVsbFBsdWdpbk1hbmFnZXIiLCJjcm9zc0FwcE5hdlNlcnZpY2UiLCJ1cmxQYXJzaW5nU2VydmljZSIsInNoZWxsTmF2aWdhdGlvbiIsInNoZWxsVUlTZXJ2aWNlIiwic2hlbGxQbHVnaW5NYW5hZ2VyIiwiY2F0Y2giLCJvRXJyb3IiLCJFcnJvciIsIm9DYWNoZVJlc3VsdHMiLCJhTGlua3MiLCJvU2VtYW50aWNPYmplY3RzTGlua3MiLCJ1bmRlZmluZWQiLCJhc3NpZ24iLCJhTWVyZ2VkTGlua3MiLCJqIiwiayIsImdldFNoZWxsQ29udGFpbmVyIiwib05hdkFyZ3VtZW50c0FyciIsImJBc3luYyIsInNBcHBTdGF0ZUtleSIsInNIYXNoRnJhZ21lbnQiLCJzSGFzaCIsIm9OZXdTaGVsbEhhc2giLCJiRGlydHkiLCJmbkRpcnR5U3RhdGVQcm92aWRlciIsImZuTmF2RmlsdGVyIiwiZm5DYWxsQmFjayIsImFIaWVyYXJjaHlMZXZlbHMiLCJzVGl0bGUiLCJzU2VtYW50aWNPYmplY3QiLCJtUGFyYW1ldGVycyIsImdldFBsdWdpbkxvYWRpbmdQcm9taXNlIiwiTG9nIiwiZXJyb3IiLCJTaGVsbFNlcnZpY2VzRmFjdG9yeSIsImNyZWF0ZUluc3RhbmNlIiwib1NlcnZpY2VDb250ZXh0Iiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwib1NoZWxsU2VydmljZSIsImdldFNoZWxsU2VydmljZXMiLCJTZXJ2aWNlRmFjdG9yeSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hlbGxTZXJ2aWNlc0ZhY3RvcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBDb250YWluZXIgZnJvbSBcInNhcC91c2hlbGwvc2VydmljZXMvQ29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBmcm9tIFwic2FwL3VzaGVsbC9zZXJ2aWNlcy9Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiO1xuaW1wb3J0IHR5cGUgU2hlbGxOYXZpZ2F0aW9uIGZyb20gXCJzYXAvdXNoZWxsL3NlcnZpY2VzL1NoZWxsTmF2aWdhdGlvblwiO1xuaW1wb3J0IHR5cGUgVVJMUGFyc2luZyBmcm9tIFwic2FwL3VzaGVsbC9zZXJ2aWNlcy9VUkxQYXJzaW5nXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZpY2VDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuLyoqXG4gKiBAaW50ZXJmYWNlIElTaGVsbFNlcnZpY2VzXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElTaGVsbFNlcnZpY2VzIHtcblx0aW5pdFByb21pc2U6IFByb21pc2U8SVNoZWxsU2VydmljZXM+O1xuXHRpbnN0YW5jZVR5cGU6IHN0cmluZztcblx0Y3Jvc3NBcHBOYXZTZXJ2aWNlPzogQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb247XG5cdGdldExpbmtzKG9BcmdzOiBvYmplY3QpOiBQcm9taXNlPGFueT47XG5cblx0Z2V0TGlua3NXaXRoQ2FjaGUob0FyZ3M6IG9iamVjdCk6IFByb21pc2U8YW55W10+O1xuXG5cdHRvRXh0ZXJuYWwob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KTogdm9pZDtcblxuXHRnZXRTdGFydHVwQXBwU3RhdGUob0FyZ3M6IG9iamVjdCk6IFByb21pc2U8YW55PjtcblxuXHRiYWNrVG9QcmV2aW91c0FwcCgpOiB2b2lkO1xuXG5cdGhyZWZGb3JFeHRlcm5hbChvQXJncz86IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCwgYkFzeW5jPzogYm9vbGVhbik6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPjtcblxuXHRocmVmRm9yRXh0ZXJuYWxBc3luYyhvQXJncz86IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCk6IFByb21pc2U8YW55PjtcblxuXHRnZXRBcHBTdGF0ZShvQ29tcG9uZW50OiBDb21wb25lbnQsIHNBcHBTdGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+O1xuXG5cdGNyZWF0ZUVtcHR5QXBwU3RhdGUob0NvbXBvbmVudDogQ29tcG9uZW50KTogb2JqZWN0O1xuXG5cdGNyZWF0ZUVtcHR5QXBwU3RhdGUob0NvbXBvbmVudDogQ29tcG9uZW50KTogUHJvbWlzZTxhbnk+O1xuXG5cdGlzTmF2aWdhdGlvblN1cHBvcnRlZChvTmF2QXJndW1lbnRzQXJyOiBBcnJheTxvYmplY3Q+LCBvQ29tcG9uZW50Pzogb2JqZWN0KTogUHJvbWlzZTxhbnk+O1xuXG5cdGlzSW5pdGlhbE5hdmlnYXRpb24oKTogYm9vbGVhbjtcblxuXHRpc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMoKTogUHJvbWlzZTxhbnk+O1xuXG5cdGV4cGFuZENvbXBhY3RIYXNoKHNIYXNoRnJhZ21lbnQ6IHN0cmluZyk6IGFueTtcblxuXHRwYXJzZVNoZWxsSGFzaChzSGFzaDogc3RyaW5nKTogYW55O1xuXG5cdHNwbGl0SGFzaChzSGFzaDogc3RyaW5nKTogb2JqZWN0O1xuXG5cdGNvbnN0cnVjdFNoZWxsSGFzaChvTmV3U2hlbGxIYXNoOiBvYmplY3QpOiBzdHJpbmc7XG5cblx0c2V0RGlydHlGbGFnKGJEaXJ0eTogYm9vbGVhbik6IHZvaWQ7XG5cblx0cmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoZm5EaXJ0eVN0YXRlUHJvdmlkZXI6IEZ1bmN0aW9uKTogdm9pZDtcblxuXHRkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbik6IHZvaWQ7XG5cblx0Y3JlYXRlUmVuZGVyZXIoKTogb2JqZWN0O1xuXG5cdGdldFVzZXIoKTogYW55O1xuXG5cdGhhc1VTaGVsbCgpOiBib29sZWFuO1xuXG5cdHJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcihmbk5hdkZpbHRlcjogRnVuY3Rpb24pOiB2b2lkO1xuXG5cdHVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyOiBGdW5jdGlvbik6IHZvaWQ7XG5cblx0c2V0QmFja05hdmlnYXRpb24oZm5DYWxsQmFjaz86IEZ1bmN0aW9uKTogdm9pZDtcblxuXHRzZXRIaWVyYXJjaHkoYUhpZXJhcmNoeUxldmVsczogQXJyYXk8b2JqZWN0Pik6IHZvaWQ7XG5cblx0c2V0VGl0bGUoc1RpdGxlOiBzdHJpbmcpOiB2b2lkO1xuXG5cdGdldENvbnRlbnREZW5zaXR5KCk6IHN0cmluZztcblxuXHRnZXRQcmltYXJ5SW50ZW50KHNTZW1hbnRpY09iamVjdDogc3RyaW5nLCBtUGFyYW1ldGVycz86IG9iamVjdCk6IFByb21pc2U8YW55PjtcblxuXHR3YWl0Rm9yUGx1Z2luc0xvYWQoKTogUHJvbWlzZTxib29sZWFuPjtcbn1cblxuLyoqXG4gKiBNb2NrIGltcGxlbWVudGF0aW9uIG9mIHRoZSBTaGVsbFNlcnZpY2UgZm9yIE9wZW5GRVxuICpcbiAqIEBpbXBsZW1lbnRzIHtJU2hlbGxTZXJ2aWNlc31cbiAqIEBwcml2YXRlXG4gKi9cbmNsYXNzIFNoZWxsU2VydmljZU1vY2sgZXh0ZW5kcyBTZXJ2aWNlPFNoZWxsU2VydmljZXNTZXR0aW5ncz4gaW1wbGVtZW50cyBJU2hlbGxTZXJ2aWNlcyB7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXHRpbnN0YW5jZVR5cGUhOiBzdHJpbmc7XG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuXHRcdHRoaXMuaW5zdGFuY2VUeXBlID0gXCJtb2NrXCI7XG5cdH1cblxuXHRnZXRMaW5rcygvKm9BcmdzOiBvYmplY3QqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cblx0Z2V0TGlua3NXaXRoQ2FjaGUoLypvQXJnczogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblx0fVxuXG5cdHRvRXh0ZXJuYWwoLypvTmF2QXJndW1lbnRzQXJyOiBBcnJheTxvYmplY3Q+LCBvQ29tcG9uZW50OiBvYmplY3QqLykge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdGdldFN0YXJ0dXBBcHBTdGF0ZSgvKm9BcmdzOiBvYmplY3QqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdH1cblxuXHRiYWNrVG9QcmV2aW91c0FwcCgpIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRocmVmRm9yRXh0ZXJuYWwoLypvQXJncz86IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCwgYkFzeW5jPzogYm9vbGVhbiovKSB7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHRocmVmRm9yRXh0ZXJuYWxBc3luYygvKm9BcmdzPzogb2JqZWN0LCBvQ29tcG9uZW50Pzogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcblx0fVxuXG5cdGdldEFwcFN0YXRlKC8qb0NvbXBvbmVudDogb2JqZWN0LCBzQXBwU3RhdGVLZXk6IHN0cmluZyovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRjcmVhdGVFbXB0eUFwcFN0YXRlKC8qb0NvbXBvbmVudDogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcblx0fVxuXG5cdGNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYygvKm9Db21wb25lbnQ6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRpc05hdmlnYXRpb25TdXBwb3J0ZWQoLypvTmF2QXJndW1lbnRzQXJyOiBBcnJheTxvYmplY3Q+LCBvQ29tcG9uZW50OiBvYmplY3QqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0aXNJbml0aWFsTmF2aWdhdGlvbigpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMoKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRleHBhbmRDb21wYWN0SGFzaCgvKnNIYXNoRnJhZ21lbnQ6IHN0cmluZyovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRwYXJzZVNoZWxsSGFzaCgvKnNIYXNoOiBzdHJpbmcqLykge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdHNwbGl0SGFzaCgvKnNIYXNoOiBzdHJpbmcqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0Y29uc3RydWN0U2hlbGxIYXNoKC8qb05ld1NoZWxsSGFzaDogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdHNldERpcnR5RmxhZygvKmJEaXJ0eTogYm9vbGVhbiovKSB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0cmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoLypmbkRpcnR5U3RhdGVQcm92aWRlcjogRnVuY3Rpb24qLykge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdGRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoLypmbkRpcnR5U3RhdGVQcm92aWRlcjogRnVuY3Rpb24qLykge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdGNyZWF0ZVJlbmRlcmVyKCkge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdGdldFVzZXIoKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0aGFzVVNoZWxsKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcigvKmZuTmF2RmlsdGVyOiBGdW5jdGlvbiovKTogdm9pZCB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0dW5yZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoLypmbk5hdkZpbHRlcjogRnVuY3Rpb24qLyk6IHZvaWQge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdHNldEJhY2tOYXZpZ2F0aW9uKC8qZm5DYWxsQmFjaz86IEZ1bmN0aW9uKi8pOiB2b2lkIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRzZXRIaWVyYXJjaHkoLyphSGllcmFyY2h5TGV2ZWxzOiBBcnJheTxvYmplY3Q+Ki8pOiB2b2lkIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRzZXRUaXRsZSgvKnNUaXRsZTogc3RyaW5nKi8pOiB2b2lkIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRnZXRDb250ZW50RGVuc2l0eSgpOiBzdHJpbmcge1xuXHRcdC8vIGluIGNhc2UgdGhlcmUgaXMgbm8gc2hlbGwgd2UgcHJvYmFibHkgbmVlZCB0byBsb29rIGF0IHRoZSBjbGFzc2VzIGJlaW5nIGRlZmluZWQgb24gdGhlIGJvZHlcblx0XHRpZiAoZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoXCJzYXBVaVNpemVDb3p5XCIpKSB7XG5cdFx0XHRyZXR1cm4gXCJjb3p5XCI7XG5cdFx0fSBlbHNlIGlmIChkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucyhcInNhcFVpU2l6ZUNvbXBhY3RcIikpIHtcblx0XHRcdHJldHVybiBcImNvbXBhY3RcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0Z2V0UHJpbWFyeUludGVudCgvKnNTZW1hbnRpY09iamVjdDogc3RyaW5nLCBtUGFyYW1ldGVycz86IG9iamVjdCovKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHR3YWl0Rm9yUGx1Z2luc0xvYWQoKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0fVxufVxuXG4vKipcbiAqIEB0eXBlZGVmIFNoZWxsU2VydmljZXNTZXR0aW5nc1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IHR5cGUgU2hlbGxTZXJ2aWNlc1NldHRpbmdzID0ge1xuXHRzaGVsbENvbnRhaW5lcj86IENvbnRhaW5lcjtcbn07XG5cbi8qKlxuICogV3JhcCBhIEpRdWVyeSBQcm9taXNlIHdpdGhpbiBhIG5hdGl2ZSB7UHJvbWlzZX0uXG4gKlxuICogQHRlbXBsYXRlIHtvYmplY3R9IFRcbiAqIEBwYXJhbSBqcXVlcnlQcm9taXNlIFRoZSBvcmlnaW5hbCBqcXVlcnkgcHJvbWlzZVxuICogQHJldHVybnMgQSBuYXRpdmUgcHJvbWlzZSB3cmFwcGluZyB0aGUgc2FtZSBvYmplY3RcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHdyYXBKUXVlcnlQcm9taXNlPFQ+KGpxdWVyeVByb21pc2U6IGpRdWVyeS5Qcm9taXNlKTogUHJvbWlzZTxUPiB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0anF1ZXJ5UHJvbWlzZS5kb25lKHJlc29sdmUgYXMgYW55KS5mYWlsKHJlamVjdCk7XG5cdH0pO1xufVxuXG4vKipcbiAqIEJhc2UgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNoZWxsU2VydmljZXNcbiAqXG4gKiBAaW1wbGVtZW50cyB7SVNoZWxsU2VydmljZXN9XG4gKiBAcHJpdmF0ZVxuICovXG5jbGFzcyBTaGVsbFNlcnZpY2VzIGV4dGVuZHMgU2VydmljZTxSZXF1aXJlZDxTaGVsbFNlcnZpY2VzU2V0dGluZ3M+PiBpbXBsZW1lbnRzIElTaGVsbFNlcnZpY2VzIHtcblx0cmVzb2x2ZUZuOiBhbnk7XG5cdHJlamVjdEZuOiBhbnk7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXHQvLyAhOiBtZWFucyB0aGF0IHdlIGtub3cgaXQgd2lsbCBiZSBhc3NpZ25lZCBiZWZvcmUgdXNhZ2Vcblx0Y3Jvc3NBcHBOYXZTZXJ2aWNlITogQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb247XG5cdHVybFBhcnNpbmdTZXJ2aWNlITogVVJMUGFyc2luZztcblx0c2hlbGxOYXZpZ2F0aW9uITogU2hlbGxOYXZpZ2F0aW9uO1xuXHRzaGVsbFBsdWdpbk1hbmFnZXIhOiB7XG5cdFx0Z2V0UGx1Z2luTG9hZGluZ1Byb21pc2UoY2F0ZWdvcnk6IHN0cmluZyk6IGpRdWVyeS5Qcm9taXNlO1xuXHR9O1xuXHRvU2hlbGxDb250YWluZXIhOiBDb250YWluZXI7XG5cdHNoZWxsVUlTZXJ2aWNlITogYW55O1xuXHRpbnN0YW5jZVR5cGUhOiBzdHJpbmc7XG5cdGxpbmtzQ2FjaGUhOiBhbnk7XG5cdGZuRmluZFNlbWFudGljT2JqZWN0c0luQ2FjaGU6IGFueTtcblxuXHRpbml0KCkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0IGFzIGFueTtcblx0XHR0aGlzLm9TaGVsbENvbnRhaW5lciA9IG9Db250ZXh0LnNldHRpbmdzLnNoZWxsQ29udGFpbmVyO1xuXHRcdHRoaXMuaW5zdGFuY2VUeXBlID0gXCJyZWFsXCI7XG5cdFx0dGhpcy5saW5rc0NhY2hlID0ge307XG5cdFx0dGhpcy5mbkZpbmRTZW1hbnRpY09iamVjdHNJbkNhY2hlID0gZnVuY3Rpb24gKG9BcmdzOiBhbnkpOiBvYmplY3Qge1xuXHRcdFx0Y29uc3QgX29BcmdzOiBhbnkgPSBvQXJncztcblx0XHRcdGNvbnN0IGFDYWNoZWRTZW1hbnRpY09iamVjdHMgPSBbXTtcblx0XHRcdGNvbnN0IGFOb25DYWNoZWRTZW1hbnRpY09iamVjdHMgPSBbXTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgX29BcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghIV9vQXJnc1tpXVswXSAmJiAhIV9vQXJnc1tpXVswXS5zZW1hbnRpY09iamVjdCkge1xuXHRcdFx0XHRcdGlmICh0aGlzLmxpbmtzQ2FjaGVbX29BcmdzW2ldWzBdLnNlbWFudGljT2JqZWN0XSkge1xuXHRcdFx0XHRcdFx0YUNhY2hlZFNlbWFudGljT2JqZWN0cy5wdXNoKHRoaXMubGlua3NDYWNoZVtfb0FyZ3NbaV1bMF0uc2VtYW50aWNPYmplY3RdLmxpbmtzKTtcblx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvQXJnc1tpXVswXSwgXCJsaW5rc1wiLCB7XG5cdFx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLmxpbmtzQ2FjaGVbX29BcmdzW2ldWzBdLnNlbWFudGljT2JqZWN0XS5saW5rc1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGFOb25DYWNoZWRTZW1hbnRpY09iamVjdHMucHVzaChfb0FyZ3NbaV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHsgb2xkQXJnczogb0FyZ3MsIG5ld0FyZ3M6IGFOb25DYWNoZWRTZW1hbnRpY09iamVjdHMsIGNhY2hlZExpbmtzOiBhQ2FjaGVkU2VtYW50aWNPYmplY3RzIH07XG5cdFx0fTtcblx0XHR0aGlzLmluaXRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0dGhpcy5yZXNvbHZlRm4gPSByZXNvbHZlO1xuXHRcdFx0dGhpcy5yZWplY3RGbiA9IHJlamVjdDtcblx0XHR9KTtcblx0XHRjb25zdCBvQ3Jvc3NBcHBOYXZTZXJ2aWNlUHJvbWlzZSA9IHRoaXMub1NoZWxsQ29udGFpbmVyLmdldFNlcnZpY2VBc3luYyhcIkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uXCIpO1xuXHRcdGNvbnN0IG9VcmxQYXJzaW5nU2VydmljZVByb21pc2UgPSB0aGlzLm9TaGVsbENvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJVUkxQYXJzaW5nXCIpO1xuXHRcdGNvbnN0IG9TaGVsbE5hdmlnYXRpb25TZXJ2aWNlUHJvbWlzZSA9IHRoaXMub1NoZWxsQ29udGFpbmVyLmdldFNlcnZpY2VBc3luYyhcIlNoZWxsTmF2aWdhdGlvblwiKTtcblx0XHRjb25zdCBvU2hlbGxQbHVnaW5NYW5hZ2VyUHJvbWlzZSA9IHRoaXMub1NoZWxsQ29udGFpbmVyLmdldFNlcnZpY2VBc3luYyhcIlBsdWdpbk1hbmFnZXJcIik7XG5cdFx0Y29uc3Qgb1NoZWxsVUlTZXJ2aWNlUHJvbWlzZSA9IG9Db21wb25lbnQuZ2V0U2VydmljZShcIlNoZWxsVUlTZXJ2aWNlXCIpO1xuXHRcdFByb21pc2UuYWxsKFtcblx0XHRcdG9Dcm9zc0FwcE5hdlNlcnZpY2VQcm9taXNlLFxuXHRcdFx0b1VybFBhcnNpbmdTZXJ2aWNlUHJvbWlzZSxcblx0XHRcdG9TaGVsbE5hdmlnYXRpb25TZXJ2aWNlUHJvbWlzZSxcblx0XHRcdG9TaGVsbFVJU2VydmljZVByb21pc2UsXG5cdFx0XHRvU2hlbGxQbHVnaW5NYW5hZ2VyUHJvbWlzZVxuXHRcdF0pXG5cdFx0XHQudGhlbigoW29Dcm9zc0FwcE5hdlNlcnZpY2UsIG9VcmxQYXJzaW5nU2VydmljZSwgb1NoZWxsTmF2aWdhdGlvbiwgb1NoZWxsVUlTZXJ2aWNlLCBvU2hlbGxQbHVnaW5NYW5hZ2VyXSkgPT4ge1xuXHRcdFx0XHR0aGlzLmNyb3NzQXBwTmF2U2VydmljZSA9IG9Dcm9zc0FwcE5hdlNlcnZpY2U7XG5cdFx0XHRcdHRoaXMudXJsUGFyc2luZ1NlcnZpY2UgPSBvVXJsUGFyc2luZ1NlcnZpY2U7XG5cdFx0XHRcdHRoaXMuc2hlbGxOYXZpZ2F0aW9uID0gb1NoZWxsTmF2aWdhdGlvbjtcblx0XHRcdFx0dGhpcy5zaGVsbFVJU2VydmljZSA9IG9TaGVsbFVJU2VydmljZTtcblx0XHRcdFx0dGhpcy5zaGVsbFBsdWdpbk1hbmFnZXIgPSBvU2hlbGxQbHVnaW5NYW5hZ2VyO1xuXHRcdFx0XHR0aGlzLnJlc29sdmVGbigpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCh0aGlzLnJlamVjdEZuKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHRhcmdldCBsaW5rcyBjb25maWd1cmVkIGZvciBhIGdpdmVuIHNlbWFudGljIG9iamVjdCAmIGFjdGlvblxuXHQgKiBXaWxsIHJldHJpZXZlIHRoZSBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblxuXHQgKiBzZXJ2aWNlIHJlZmVyZW5jZSBjYWxsIHRoZSBnZXRMaW5rcyBtZXRob2QuIEluIGNhc2Ugc2VydmljZSBpcyBub3QgYXZhaWxhYmxlIG9yIGFueSBleGNlcHRpb25cblx0ICogbWV0aG9kIHRocm93cyBleGNlcHRpb24gZXJyb3IgaW4gY29uc29sZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQXJncyBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5nZXRMaW5rcyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIHRhcmdldCBsaW5rcyBhcnJheVxuXHQgKi9cblx0Z2V0TGlua3Mob0FyZ3M6IG9iamVjdCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJvbWlzZS9jYXRjaC1vci1yZXR1cm5cblx0XHRcdHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlXG5cdFx0XHRcdC5nZXRMaW5rcyhvQXJncylcblx0XHRcdFx0LmZhaWwoKG9FcnJvcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihgJHtvRXJyb3J9IHNhcC5mZS5jb3JlLnNlcnZpY2VzLlNoZWxsU2VydmljZXNGYWN0b3J5LmdldExpbmtzYCkpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbihyZXNvbHZlKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHRhcmdldCBsaW5rcyBjb25maWd1cmVkIGZvciBhIGdpdmVuIHNlbWFudGljIG9iamVjdCAmIGFjdGlvbiBpbiBjYWNoZVxuXHQgKiBXaWxsIHJldHJpZXZlIHRoZSBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblxuXHQgKiBzZXJ2aWNlIHJlZmVyZW5jZSBjYWxsIHRoZSBnZXRMaW5rcyBtZXRob2QuIEluIGNhc2Ugc2VydmljZSBpcyBub3QgYXZhaWxhYmxlIG9yIGFueSBleGNlcHRpb25cblx0ICogbWV0aG9kIHRocm93cyBleGNlcHRpb24gZXJyb3IgaW4gY29uc29sZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQXJncyBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5nZXRMaW5rcyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIHRhcmdldCBsaW5rcyBhcnJheVxuXHQgKi9cblx0Z2V0TGlua3NXaXRoQ2FjaGUob0FyZ3M6IG9iamVjdCk6IFByb21pc2U8YW55W10+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHRpZiAoKG9BcmdzIGFzIE9iamVjdFtdKS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmVzb2x2ZShbXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBvQ2FjaGVSZXN1bHRzID0gdGhpcy5mbkZpbmRTZW1hbnRpY09iamVjdHNJbkNhY2hlKG9BcmdzKTtcblxuXHRcdFx0XHRpZiAob0NhY2hlUmVzdWx0cy5uZXdBcmdzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdHJlc29sdmUob0NhY2hlUmVzdWx0cy5jYWNoZWRMaW5rcyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHRcdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2Vcblx0XHRcdFx0XHRcdC5nZXRMaW5rcyhvQ2FjaGVSZXN1bHRzLm5ld0FyZ3MpXG5cdFx0XHRcdFx0XHQuZmFpbCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihgJHtvRXJyb3J9IHNhcC5mZS5jb3JlLnNlcnZpY2VzLlNoZWxsU2VydmljZXNGYWN0b3J5LmdldExpbmtzV2l0aENhY2hlYCkpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50aGVuKChhTGlua3M6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoYUxpbmtzLmxlbmd0aCAhPT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9TZW1hbnRpY09iamVjdHNMaW5rczogYW55ID0ge307XG5cblx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFMaW5rcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGFMaW5rc1tpXS5sZW5ndGggPiAwICYmIG9DYWNoZVJlc3VsdHMubmV3QXJnc1tpXVswXS5saW5rcyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9TZW1hbnRpY09iamVjdHNMaW5rc1tvQ2FjaGVSZXN1bHRzLm5ld0FyZ3NbaV1bMF0uc2VtYW50aWNPYmplY3RdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxpbmtzOiBhTGlua3NbaV1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5saW5rc0NhY2hlID0gT2JqZWN0LmFzc2lnbih0aGlzLmxpbmtzQ2FjaGUsIG9TZW1hbnRpY09iamVjdHNMaW5rcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKG9DYWNoZVJlc3VsdHMuY2FjaGVkTGlua3MubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVzb2x2ZShhTGlua3MpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFNZXJnZWRMaW5rcyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRcdGxldCBqID0gMDtcblxuXHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGsgPSAwOyBrIDwgb0NhY2hlUmVzdWx0cy5vbGRBcmdzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoaiA8IGFMaW5rcy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFMaW5rc1tqXS5sZW5ndGggPiAwICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0NhY2hlUmVzdWx0cy5vbGRBcmdzW2tdWzBdLnNlbWFudGljT2JqZWN0ID09PSBvQ2FjaGVSZXN1bHRzLm5ld0FyZ3Nbal1bMF0uc2VtYW50aWNPYmplY3Rcblx0XHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YU1lcmdlZExpbmtzLnB1c2goYUxpbmtzW2pdKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YU1lcmdlZExpbmtzLnB1c2gob0NhY2hlUmVzdWx0cy5vbGRBcmdzW2tdWzBdLmxpbmtzKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YU1lcmdlZExpbmtzLnB1c2gob0NhY2hlUmVzdWx0cy5vbGRBcmdzW2tdWzBdLmxpbmtzKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0cmVzb2x2ZShhTWVyZ2VkTGlua3MpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgcmV0cmlldmUgdGhlIFNoZWxsQ29udGFpbmVyLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogc2FwLnVzaGVsbC5jb250YWluZXJcblx0ICogQHJldHVybnMgT2JqZWN0IHdpdGggcHJlZGVmaW5lZCBzaGVsbENvbnRhaW5lciBtZXRob2RzXG5cdCAqL1xuXHRnZXRTaGVsbENvbnRhaW5lcigpIHtcblx0XHRyZXR1cm4gdGhpcy5vU2hlbGxDb250YWluZXI7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHRvRXh0ZXJuYWwgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2Ugd2l0aCBOYXZpZ2F0aW9uIEFyZ3VtZW50cyBhbmQgb0NvbXBvbmVudC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvTmF2QXJndW1lbnRzQXJyIEFuZFxuXHQgKiBAcGFyYW0gb0NvbXBvbmVudCBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT50b0V4dGVybmFsIGFyZ3VtZW50c1xuXHQgKi9cblx0dG9FeHRlcm5hbChvTmF2QXJndW1lbnRzQXJyOiBBcnJheTxvYmplY3Q+LCBvQ29tcG9uZW50OiBvYmplY3QpOiB2b2lkIHtcblx0XHR0aGlzLmNyb3NzQXBwTmF2U2VydmljZS50b0V4dGVybmFsKG9OYXZBcmd1bWVudHNBcnIsIG9Db21wb25lbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgdGFyZ2V0IHN0YXJ0dXBBcHBTdGF0ZVxuXHQgKiBXaWxsIGNoZWNrIHRoZSBleGlzdGFuY2Ugb2YgdGhlIFNoZWxsQ29udGFpbmVyIGFuZCByZXRyaWV2ZSB0aGUgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cblx0ICogc2VydmljZSByZWZlcmVuY2UgY2FsbCB0aGUgZ2V0U3RhcnR1cEFwcFN0YXRlIG1ldGhvZC4gSW4gY2FzZSBzZXJ2aWNlIGlzIG5vdCBhdmFpbGFibGUgb3IgYW55IGV4Y2VwdGlvblxuXHQgKiBtZXRob2QgdGhyb3dzIGV4Y2VwdGlvbiBlcnJvciBpbiBjb25zb2xlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9BcmdzIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb249PmdldFN0YXJ0dXBBcHBTdGF0ZSBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIE9iamVjdFxuXHQgKi9cblx0Z2V0U3RhcnR1cEFwcFN0YXRlKG9BcmdzOiBDb21wb25lbnQpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gSlF1ZXJ5IFByb21pc2UgYmVoYXZlcyBkaWZmZXJlbnRseVxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHQodGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgYXMgYW55KVxuXHRcdFx0XHQuZ2V0U3RhcnR1cEFwcFN0YXRlKG9BcmdzKVxuXHRcdFx0XHQuZmFpbCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHRyZWplY3QobmV3IEVycm9yKGAke29FcnJvcn0gc2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc0ZhY3RvcnkuZ2V0U3RhcnR1cEFwcFN0YXRlYCkpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbihyZXNvbHZlKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgYmFja1RvUHJldmlvdXNBcHAgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFNvbWV0aGluZyB0aGF0IGluZGljYXRlIHdlJ3ZlIG5hdmlnYXRlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGJhY2tUb1ByZXZpb3VzQXBwKCkge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5iYWNrVG9QcmV2aW91c0FwcCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBocmVmRm9yRXh0ZXJuYWwgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0FyZ3MgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogQHBhcmFtIG9Db21wb25lbnQgVGhlIGFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0gYkFzeW5jIFdoZXRoZXIgdGhpcyBjYWxsIHNob3VsZCBiZSBhc3luYyBvciBub3Rcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+aHJlZkZvckV4dGVybmFsIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gc3RyaW5nXG5cdCAqL1xuXHRocmVmRm9yRXh0ZXJuYWwob0FyZ3M6IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCwgYkFzeW5jPzogYm9vbGVhbikge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5ocmVmRm9yRXh0ZXJuYWwob0FyZ3MsIG9Db21wb25lbnQgYXMgb2JqZWN0LCAhIWJBc3luYyk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGhyZWZGb3JFeHRlcm5hbCBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQXJncyBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBAcGFyYW0gb0NvbXBvbmVudCBUaGUgYXBwQ29tcG9uZW50XG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb249PmhyZWZGb3JFeHRlcm5hbEFzeW5jIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gc3RyaW5nXG5cdCAqL1xuXHRocmVmRm9yRXh0ZXJuYWxBc3luYyhvQXJnczogb2JqZWN0LCBvQ29tcG9uZW50Pzogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmhyZWZGb3JFeHRlcm5hbEFzeW5jKG9BcmdzLCBvQ29tcG9uZW50IGFzIG9iamVjdCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGdldEFwcFN0YXRlIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlIHdpdGggb0NvbXBvbmVudCBhbmQgb0FwcFN0YXRlS2V5LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9Db21wb25lbnRcblx0ICogQHBhcmFtIHNBcHBTdGF0ZUtleSBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5nZXRBcHBTdGF0ZSBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIG9iamVjdFxuXHQgKi9cblx0Z2V0QXBwU3RhdGUob0NvbXBvbmVudDogQ29tcG9uZW50LCBzQXBwU3RhdGVLZXk6IHN0cmluZykge1xuXHRcdHJldHVybiB3cmFwSlF1ZXJ5UHJvbWlzZSgodGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgYXMgYW55KS5nZXRBcHBTdGF0ZShvQ29tcG9uZW50LCBzQXBwU3RhdGVLZXkpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgY3JlYXRlRW1wdHlBcHBTdGF0ZSBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZSB3aXRoIG9Db21wb25lbnQuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0NvbXBvbmVudCBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5jcmVhdGVFbXB0eUFwcFN0YXRlIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqL1xuXHRjcmVhdGVFbXB0eUFwcFN0YXRlKG9Db21wb25lbnQ6IENvbXBvbmVudCkge1xuXHRcdHJldHVybiAodGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgYXMgYW55KS5jcmVhdGVFbXB0eUFwcFN0YXRlKG9Db21wb25lbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBjcmVhdGVFbXB0eUFwcFN0YXRlQXN5bmMgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2Ugd2l0aCBvQ29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9Db21wb25lbnQgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Y3JlYXRlRW1wdHlBcHBTdGF0ZUFzeW5jIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqL1xuXHRjcmVhdGVFbXB0eUFwcFN0YXRlQXN5bmMob0NvbXBvbmVudDogQ29tcG9uZW50KSB7XG5cdFx0cmV0dXJuICh0aGlzLmNyb3NzQXBwTmF2U2VydmljZSBhcyBhbnkpLmNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYyhvQ29tcG9uZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlIHdpdGggTmF2aWdhdGlvbiBBcmd1bWVudHMgYW5kIG9Db21wb25lbnQuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb05hdkFyZ3VtZW50c0FyclxuXHQgKiBAcGFyYW0gb0NvbXBvbmVudCBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5pc05hdmlnYXRpb25TdXBwb3J0ZWQgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBvYmplY3Rcblx0ICovXG5cdGlzTmF2aWdhdGlvblN1cHBvcnRlZChvTmF2QXJndW1lbnRzQXJyOiBBcnJheTxvYmplY3Q+LCBvQ29tcG9uZW50OiBvYmplY3QpIHtcblx0XHRyZXR1cm4gd3JhcEpRdWVyeVByb21pc2UodGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuaXNOYXZpZ2F0aW9uU3VwcG9ydGVkKG9OYXZBcmd1bWVudHNBcnIsIG9Db21wb25lbnQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgaXNJbml0aWFsTmF2aWdhdGlvbiBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBib29sZWFuXG5cdCAqL1xuXHRpc0luaXRpYWxOYXZpZ2F0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5pc0luaXRpYWxOYXZpZ2F0aW9uKCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGlzSW5pdGlhbE5hdmlnYXRpb25Bc3luYyBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBib29sZWFuXG5cdCAqL1xuXHRpc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmlzSW5pdGlhbE5hdmlnYXRpb25Bc3luYygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBleHBhbmRDb21wYWN0SGFzaCBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZS5cblx0ICpcblx0ICogQHBhcmFtIHNIYXNoRnJhZ21lbnQgQW4gKGludGVybmFsIGZvcm1hdCkgc2hlbGwgaGFzaFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhlIHN1Y2Nlc3MgaGFuZGxlciBvZiB0aGUgcmVzb2x2ZSBwcm9taXNlIGdldCBhbiBleHBhbmRlZCBzaGVsbCBoYXNoIGFzIGZpcnN0IGFyZ3VtZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0ZXhwYW5kQ29tcGFjdEhhc2goc0hhc2hGcmFnbWVudDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmV4cGFuZENvbXBhY3RIYXNoKHNIYXNoRnJhZ21lbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBwYXJzZVNoZWxsSGFzaCBtZXRob2Qgb2YgVVJMUGFyc2luZyBzZXJ2aWNlIHdpdGggZ2l2ZW4gc0hhc2guXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc0hhc2ggQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5VUkxQYXJzaW5nPT5wYXJzZVNoZWxsSGFzaCBhcmd1bWVudHNcblx0ICogQHJldHVybnMgVGhlIHBhcnNlZCB1cmxcblx0ICovXG5cdHBhcnNlU2hlbGxIYXNoKHNIYXNoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy51cmxQYXJzaW5nU2VydmljZS5wYXJzZVNoZWxsSGFzaChzSGFzaCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHNwbGl0SGFzaCBtZXRob2Qgb2YgVVJMUGFyc2luZyBzZXJ2aWNlIHdpdGggZ2l2ZW4gc0hhc2guXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc0hhc2ggQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5VUkxQYXJzaW5nPT5zcGxpdEhhc2ggYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBvYmplY3Rcblx0ICovXG5cdHNwbGl0SGFzaChzSGFzaDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMudXJsUGFyc2luZ1NlcnZpY2Uuc3BsaXRIYXNoKHNIYXNoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgY29uc3RydWN0U2hlbGxIYXNoIG1ldGhvZCBvZiBVUkxQYXJzaW5nIHNlcnZpY2Ugd2l0aCBnaXZlbiBzSGFzaC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvTmV3U2hlbGxIYXNoIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuVVJMUGFyc2luZz0+Y29uc3RydWN0U2hlbGxIYXNoIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBTaGVsbCBIYXNoIHN0cmluZ1xuXHQgKi9cblx0Y29uc3RydWN0U2hlbGxIYXNoKG9OZXdTaGVsbEhhc2g6IG9iamVjdCkge1xuXHRcdHJldHVybiB0aGlzLnVybFBhcnNpbmdTZXJ2aWNlLmNvbnN0cnVjdFNoZWxsSGFzaChvTmV3U2hlbGxIYXNoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgc2V0RGlydHlGbGFnIG1ldGhvZCB3aXRoIGdpdmVuIGRpcnR5IHN0YXRlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIGJEaXJ0eSBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZiBzYXAudXNoZWxsLkNvbnRhaW5lci5zZXREaXJ0eUZsYWcgYXJndW1lbnRzXG5cdCAqL1xuXHRzZXREaXJ0eUZsYWcoYkRpcnR5OiBib29sZWFuKSB7XG5cdFx0dGhpcy5vU2hlbGxDb250YWluZXIuc2V0RGlydHlGbGFnKGJEaXJ0eSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIG1ldGhvZCB3aXRoIGdpdmVuIGRpcnR5IHN0YXRlIHByb3ZpZGVyIGNhbGxiYWNrIG1ldGhvZC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBmbkRpcnR5U3RhdGVQcm92aWRlciBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZiBzYXAudXNoZWxsLkNvbnRhaW5lci5yZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciBhcmd1bWVudHNcblx0ICovXG5cdHJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbikge1xuXHRcdHRoaXMub1NoZWxsQ29udGFpbmVyLnJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciBtZXRob2Qgd2l0aCBnaXZlbiBkaXJ0eSBzdGF0ZSBwcm92aWRlciBjYWxsYmFjayBtZXRob2QuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gZm5EaXJ0eVN0YXRlUHJvdmlkZXIgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Ygc2FwLnVzaGVsbC5Db250YWluZXIuZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciBhcmd1bWVudHNcblx0ICovXG5cdGRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoZm5EaXJ0eVN0YXRlUHJvdmlkZXI6IEZ1bmN0aW9uKSB7XG5cdFx0dGhpcy5vU2hlbGxDb250YWluZXIuZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcihmbkRpcnR5U3RhdGVQcm92aWRlcik7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGNyZWF0ZVJlbmRlcmVyIG1ldGhvZCBvZiB1c2hlbGwgY29udGFpbmVyLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHJldHVybnMgUmV0dXJucyByZW5kZXJlciBvYmplY3Rcblx0ICovXG5cdGNyZWF0ZVJlbmRlcmVyKCkge1xuXHRcdHJldHVybiB0aGlzLm9TaGVsbENvbnRhaW5lci5jcmVhdGVSZW5kZXJlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBnZXRVc2VyIG1ldGhvZCBvZiB1c2hlbGwgY29udGFpbmVyLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHJldHVybnMgUmV0dXJucyBVc2VyIG9iamVjdFxuXHQgKi9cblx0Z2V0VXNlcigpIHtcblx0XHRyZXR1cm4gKHRoaXMub1NoZWxsQ29udGFpbmVyIGFzIGFueSkuZ2V0VXNlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2hlY2sgaWYgdXNoZWxsIGNvbnRhaW5lciBpcyBhdmFpbGFibGUgb3Igbm90LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlXG5cdCAqL1xuXHRoYXNVU2hlbGwoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlciBtZXRob2Qgb2Ygc2hlbGxOYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gZm5OYXZGaWx0ZXIgVGhlIGZpbHRlciBmdW5jdGlvbiB0byByZWdpc3RlclxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdHJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcihmbk5hdkZpbHRlcjogRnVuY3Rpb24pIHtcblx0XHQodGhpcy5zaGVsbE5hdmlnYXRpb24gYXMgYW55KS5yZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoZm5OYXZGaWx0ZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCB1bnJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlciBtZXRob2Qgb2Ygc2hlbGxOYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gZm5OYXZGaWx0ZXIgVGhlIGZpbHRlciBmdW5jdGlvbiB0byB1bnJlZ2lzdGVyXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0dW5yZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoZm5OYXZGaWx0ZXI6IEZ1bmN0aW9uKSB7XG5cdFx0KHRoaXMuc2hlbGxOYXZpZ2F0aW9uIGFzIGFueSkudW5yZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoZm5OYXZGaWx0ZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBzZXRCYWNrTmF2aWdhdGlvbiBtZXRob2Qgb2YgU2hlbGxVSVNlcnZpY2Vcblx0ICogdGhhdCBkaXNwbGF5cyB0aGUgYmFjayBidXR0b24gaW4gdGhlIHNoZWxsIGhlYWRlci5cblx0ICpcblx0ICogQHBhcmFtIFtmbkNhbGxCYWNrXSBBIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBidXR0b24gaXMgY2xpY2tlZCBpbiB0aGUgVUkuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0c2V0QmFja05hdmlnYXRpb24oZm5DYWxsQmFjaz86IEZ1bmN0aW9uKTogdm9pZCB7XG5cdFx0dGhpcy5zaGVsbFVJU2VydmljZS5zZXRCYWNrTmF2aWdhdGlvbihmbkNhbGxCYWNrKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgc2V0SGllcmFyY2h5IG1ldGhvZCBvZiBTaGVsbFVJU2VydmljZVxuXHQgKiB0aGF0IGRpc3BsYXlzIHRoZSBnaXZlbiBoaWVyYXJjaHkgaW4gdGhlIHNoZWxsIGhlYWRlci5cblx0ICpcblx0ICogQHBhcmFtIFthSGllcmFyY2h5TGV2ZWxzXSBBbiBhcnJheSByZXByZXNlbnRpbmcgaGllcmFyY2hpZXMgb2YgdGhlIGN1cnJlbnRseSBkaXNwbGF5ZWQgYXBwLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdHNldEhpZXJhcmNoeShhSGllcmFyY2h5TGV2ZWxzOiBBcnJheTxvYmplY3Q+KTogdm9pZCB7XG5cdFx0dGhpcy5zaGVsbFVJU2VydmljZS5zZXRIaWVyYXJjaHkoYUhpZXJhcmNoeUxldmVscyk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHNldFRpdGxlIG1ldGhvZCBvZiBTaGVsbFVJU2VydmljZVxuXHQgKiB0aGF0IGRpc3BsYXlzIHRoZSBnaXZlbiB0aXRsZSBpbiB0aGUgc2hlbGwgaGVhZGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gW3NUaXRsZV0gVGhlIG5ldyB0aXRsZS4gVGhlIGRlZmF1bHQgdGl0bGUgaXMgc2V0IGlmIHRoaXMgYXJndW1lbnQgaXMgbm90IGdpdmVuLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdHNldFRpdGxlKHNUaXRsZTogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy5zaGVsbFVJU2VydmljZS5zZXRUaXRsZShzVGl0bGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgY3VycmVudGx5IGRlZmluZWQgY29udGVudCBkZW5zaXR5LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY29udGVudCBkZW5zaXR5IHZhbHVlXG5cdCAqL1xuXHRnZXRDb250ZW50RGVuc2l0eSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiAodGhpcy5vU2hlbGxDb250YWluZXIgYXMgYW55KS5nZXRVc2VyKCkuZ2V0Q29udGVudERlbnNpdHkoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb3IgYSBnaXZlbiBzZW1hbnRpYyBvYmplY3QsIHRoaXMgbWV0aG9kIGNvbnNpZGVycyBhbGwgYWN0aW9ucyBhc3NvY2lhdGVkIHdpdGggdGhlIHNlbWFudGljIG9iamVjdCBhbmRcblx0ICogcmV0dXJucyB0aGUgb25lIHRhZ2dlZCBhcyBhIFwicHJpbWFyeUFjdGlvblwiLiBJZiBubyBpbmJvdW5kIHRhZ2dlZCBhcyBcInByaW1hcnlBY3Rpb25cIiBleGlzdHMsIHRoZW4gaXQgcmV0dXJuc1xuXHQgKiB0aGUgaW50ZW50IG9mIHRoZSBmaXJzdCBpbmJvdW5kIChhZnRlciBzb3J0aW5nIGhhcyBiZWVuIGFwcGxpZWQpIG1hdGNoaW5nIHRoZSBhY3Rpb24gXCJkaXNwbGF5RmFjdFNoZWV0XCIuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc1NlbWFudGljT2JqZWN0IFNlbWFudGljIG9iamVjdC5cblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFNlZSAjQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24jZ2V0TGlua3MgZm9yIGRlc2NyaXB0aW9uLlxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgaW50ZW50IGlmIGl0IGV4aXN0cy5cblx0ICovXG5cdGdldFByaW1hcnlJbnRlbnQoc1NlbWFudGljT2JqZWN0OiBzdHJpbmcsIG1QYXJhbWV0ZXJzPzogb2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHR0aGlzLmNyb3NzQXBwTmF2U2VydmljZVxuXHRcdFx0XHQuZ2V0UHJpbWFyeUludGVudChzU2VtYW50aWNPYmplY3QsIG1QYXJhbWV0ZXJzKVxuXHRcdFx0XHQuZmFpbCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHRyZWplY3QobmV3IEVycm9yKGAke29FcnJvcn0gc2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc0ZhY3RvcnkuZ2V0UHJpbWFyeUludGVudGApKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4ocmVzb2x2ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogV2FpdCBmb3IgdGhlIHJlbmRlciBleHRlbnNpb25zIHBsdWdpbiB0byBiZSBsb2FkZWQuXG5cdCAqIElmIHRydWUgaXMgcmV0dXJuZWQgYnkgdGhlIHByb21pc2Ugd2Ugd2VyZSBhYmxlIHRvIHdhaXQgZm9yIGl0LCBvdGhlcndpc2Ugd2UgY291bGRuJ3QgYW5kIGNhbm5vdCByZWx5IG9uIGl0LlxuXHQgKi9cblx0d2FpdEZvclBsdWdpbnNMb2FkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0aWYgKCF0aGlzLnNoZWxsUGx1Z2luTWFuYWdlcj8uZ2V0UGx1Z2luTG9hZGluZ1Byb21pc2UpIHtcblx0XHRcdFx0cmVzb2x2ZShmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJvbWlzZS9jYXRjaC1vci1yZXR1cm5cblx0XHRcdFx0dGhpcy5zaGVsbFBsdWdpbk1hbmFnZXJcblx0XHRcdFx0XHQuZ2V0UGx1Z2luTG9hZGluZ1Byb21pc2UoXCJSZW5kZXJlckV4dGVuc2lvbnNcIilcblx0XHRcdFx0XHQuZmFpbCgob0Vycm9yOiB1bmtub3duKSA9PiB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3Iob0Vycm9yIGFzIHN0cmluZywgXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5TaGVsbFNlcnZpY2VzRmFjdG9yeS53YWl0Rm9yUGx1Z2luc0xvYWRcIik7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKGZhbHNlKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKCgpID0+IHJlc29sdmUodHJ1ZSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogU2VydmljZSBGYWN0b3J5IGZvciB0aGUgU2hlbGxTZXJ2aWNlc1xuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNsYXNzIFNoZWxsU2VydmljZXNGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPiB7XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGVpdGhlciBhIHN0YW5kYXJkIG9yIGEgbW9jayBTaGVsbCBzZXJ2aWNlIGRlcGVuZGluZyBvbiB0aGUgY29uZmlndXJhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9TZXJ2aWNlQ29udGV4dCBUaGUgc2hlbGxzZXJ2aWNlIGNvbnRleHRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGZvciBhIHNoZWxsIHNlcnZpY2UgaW1wbGVtZW50YXRpb25cblx0ICogQHNlZSBTZXJ2aWNlRmFjdG9yeSNjcmVhdGVJbnN0YW5jZVxuXHQgKi9cblx0Y3JlYXRlSW5zdGFuY2Uob1NlcnZpY2VDb250ZXh0OiBTZXJ2aWNlQ29udGV4dDxTaGVsbFNlcnZpY2VzU2V0dGluZ3M+KTogUHJvbWlzZTxJU2hlbGxTZXJ2aWNlcz4ge1xuXHRcdG9TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5zaGVsbENvbnRhaW5lciA9IHNhcC51c2hlbGwgJiYgKHNhcC51c2hlbGwuQ29udGFpbmVyIGFzIENvbnRhaW5lcik7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZSA9IG9TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5zaGVsbENvbnRhaW5lclxuXHRcdFx0PyBuZXcgU2hlbGxTZXJ2aWNlcyhvU2VydmljZUNvbnRleHQgYXMgU2VydmljZUNvbnRleHQ8UmVxdWlyZWQ8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPj4pXG5cdFx0XHQ6IG5ldyBTaGVsbFNlcnZpY2VNb2NrKG9TZXJ2aWNlQ29udGV4dCk7XG5cdFx0cmV0dXJuIG9TaGVsbFNlcnZpY2UuaW5pdFByb21pc2UudGhlbigoKSA9PiB7XG5cdFx0XHQvLyBFbnJpY2ggdGhlIGFwcENvbXBvbmVudCB3aXRoIHRoaXMgbWV0aG9kXG5cdFx0XHQob1NlcnZpY2VDb250ZXh0LnNjb3BlT2JqZWN0IGFzIGFueSkuZ2V0U2hlbGxTZXJ2aWNlcyA9ICgpID0+IG9TaGVsbFNlcnZpY2U7XG5cdFx0XHRyZXR1cm4gb1NoZWxsU2VydmljZTtcblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTaGVsbFNlcnZpY2VzRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBZ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLElBTU1BLGdCQUFnQjtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQUlyQkMsSUFBSSxHQUFKLGdCQUFPO01BQ04sSUFBSSxDQUFDQyxXQUFXLEdBQUdDLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztNQUN4QyxJQUFJLENBQUNDLFlBQVksR0FBRyxNQUFNO0lBQzNCLENBQUM7SUFBQSxPQUVEQyxRQUFRLEdBQVIsbUJBQVM7SUFBQSxFQUFtQjtNQUMzQixPQUFPSCxPQUFPLENBQUNDLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUFBLE9BRURHLGlCQUFpQixHQUFqQiw0QkFBa0I7SUFBQSxFQUFtQjtNQUNwQyxPQUFPSixPQUFPLENBQUNDLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUFBLE9BRURJLFVBQVUsR0FBVixxQkFBVztJQUFBLEVBQXlEO01BQ25FO0lBQUEsQ0FDQTtJQUFBLE9BRURDLGtCQUFrQixHQUFsQiw2QkFBbUI7SUFBQSxFQUFtQjtNQUNyQyxPQUFPTixPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUFBLE9BRURNLGlCQUFpQixHQUFqQiw2QkFBb0I7TUFDbkI7SUFBQSxDQUNBO0lBQUEsT0FFREMsZUFBZSxHQUFmLDBCQUFnQjtJQUFBLEVBQTJEO01BQzFFLE9BQU8sRUFBRTtJQUNWLENBQUM7SUFBQSxPQUVEQyxvQkFBb0IsR0FBcEIsK0JBQXFCO0lBQUEsRUFBeUM7TUFDN0QsT0FBT1QsT0FBTyxDQUFDQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUFBLE9BRURTLFdBQVcsR0FBWCxzQkFBWTtJQUFBLEVBQThDO01BQ3pELE9BQU9WLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVEVSxtQkFBbUIsR0FBbkIsOEJBQW9CO0lBQUEsRUFBd0I7TUFDM0MsT0FBT1gsT0FBTyxDQUFDQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUFBLE9BRURXLHdCQUF3QixHQUF4QixtQ0FBeUI7SUFBQSxFQUF3QjtNQUNoRCxPQUFPWixPQUFPLENBQUNDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQUEsT0FFRFkscUJBQXFCLEdBQXJCLGdDQUFzQjtJQUFBLEVBQXlEO01BQzlFLE9BQU9iLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVEYSxtQkFBbUIsR0FBbkIsK0JBQXNCO01BQ3JCLE9BQU8sS0FBSztJQUNiLENBQUM7SUFBQSxPQUVEQyx3QkFBd0IsR0FBeEIsb0NBQTJCO01BQzFCLE9BQU9mLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVEZSxpQkFBaUIsR0FBakIsNEJBQWtCO0lBQUEsRUFBMkI7TUFDNUMsT0FBT2hCLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVEZ0IsY0FBYyxHQUFkLHlCQUFlO0lBQUEsRUFBbUI7TUFDakMsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDO0lBQUEsT0FFREMsU0FBUyxHQUFULG9CQUFVO0lBQUEsRUFBbUI7TUFDNUIsT0FBT2xCLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVEa0Isa0JBQWtCLEdBQWxCLDZCQUFtQjtJQUFBLEVBQTJCO01BQzdDLE9BQU8sRUFBRTtJQUNWLENBQUM7SUFBQSxPQUVEQyxZQUFZLEdBQVosdUJBQWE7SUFBQSxFQUFxQjtNQUNqQztJQUFBLENBQ0E7SUFBQSxPQUVEQywwQkFBMEIsR0FBMUIscUNBQTJCO0lBQUEsRUFBb0M7TUFDOUQ7SUFBQSxDQUNBO0lBQUEsT0FFREMsNEJBQTRCLEdBQTVCLHVDQUE2QjtJQUFBLEVBQW9DO01BQ2hFO0lBQUEsQ0FDQTtJQUFBLE9BRURDLGNBQWMsR0FBZCwwQkFBaUI7TUFDaEIsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDO0lBQUEsT0FFREMsT0FBTyxHQUFQLG1CQUFVO01BQ1QsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDO0lBQUEsT0FFREMsU0FBUyxHQUFULHFCQUFZO01BQ1gsT0FBTyxLQUFLO0lBQ2IsQ0FBQztJQUFBLE9BRURDLHdCQUF3QixHQUF4QixtQ0FBeUI7SUFBQSxFQUFpQztNQUN6RDtJQUFBLENBQ0E7SUFBQSxPQUVEQywwQkFBMEIsR0FBMUIscUNBQTJCO0lBQUEsRUFBaUM7TUFDM0Q7SUFBQSxDQUNBO0lBQUEsT0FFREMsaUJBQWlCLEdBQWpCLDRCQUFrQjtJQUFBLEVBQWlDO01BQ2xEO0lBQUEsQ0FDQTtJQUFBLE9BRURDLFlBQVksR0FBWix1QkFBYTtJQUFBLEVBQTJDO01BQ3ZEO0lBQUEsQ0FDQTtJQUFBLE9BRURDLFFBQVEsR0FBUixtQkFBUztJQUFBLEVBQTBCO01BQ2xDO0lBQUEsQ0FDQTtJQUFBLE9BRURDLGlCQUFpQixHQUFqQiw2QkFBNEI7TUFDM0I7TUFDQSxJQUFJQyxRQUFRLENBQUNDLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxRQUFRLENBQUMsZUFBZSxDQUFDLEVBQUU7UUFDdEQsT0FBTyxNQUFNO01BQ2QsQ0FBQyxNQUFNLElBQUlILFFBQVEsQ0FBQ0MsSUFBSSxDQUFDQyxTQUFTLENBQUNDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQ2hFLE9BQU8sU0FBUztNQUNqQixDQUFDLE1BQU07UUFDTixPQUFPLEVBQUU7TUFDVjtJQUNELENBQUM7SUFBQSxPQUVEQyxnQkFBZ0IsR0FBaEIsMkJBQWlCO0lBQUEsRUFBaUU7TUFDakYsT0FBT3BDLE9BQU8sQ0FBQ0MsT0FBTyxFQUFFO0lBQ3pCLENBQUM7SUFBQSxPQUVEb0Msa0JBQWtCLEdBQWxCLDhCQUFxQjtNQUNwQixPQUFPckMsT0FBTyxDQUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFBQTtFQUFBLEVBMUk2QnFDLE9BQU87RUE2SXRDO0FBQ0E7QUFDQTtBQUNBO0VBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLGlCQUFpQixDQUFJQyxhQUE2QixFQUFjO0lBQ3hFLE9BQU8sSUFBSXhDLE9BQU8sQ0FBQyxVQUFDQyxPQUFPLEVBQUV3QyxNQUFNLEVBQUs7TUFDdkM7TUFDQUQsYUFBYSxDQUFDRSxJQUFJLENBQUN6QyxPQUFPLENBQVEsQ0FBQzBDLElBQUksQ0FBQ0YsTUFBTSxDQUFDO0lBQ2hELENBQUMsQ0FBQztFQUNIOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLElBTU1HLGFBQWE7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBSWxCO0lBQUEsUUFhQTlDLElBQUksR0FBSixnQkFBTztNQUFBO01BQ04sSUFBTStDLFFBQVEsR0FBRyxJQUFJLENBQUNDLFVBQVUsRUFBRTtNQUNsQyxJQUFNQyxVQUFVLEdBQUdGLFFBQVEsQ0FBQ0csV0FBa0I7TUFDOUMsSUFBSSxDQUFDQyxlQUFlLEdBQUdKLFFBQVEsQ0FBQ0ssUUFBUSxDQUFDQyxjQUFjO01BQ3ZELElBQUksQ0FBQ2pELFlBQVksR0FBRyxNQUFNO01BQzFCLElBQUksQ0FBQ2tELFVBQVUsR0FBRyxDQUFDLENBQUM7TUFDcEIsSUFBSSxDQUFDQyw0QkFBNEIsR0FBRyxVQUFVQyxLQUFVLEVBQVU7UUFDakUsSUFBTUMsTUFBVyxHQUFHRCxLQUFLO1FBQ3pCLElBQU1FLHNCQUFzQixHQUFHLEVBQUU7UUFDakMsSUFBTUMseUJBQXlCLEdBQUcsRUFBRTtRQUNwQyxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0gsTUFBTSxDQUFDSSxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO1VBQ3ZDLElBQUksQ0FBQyxDQUFDSCxNQUFNLENBQUNHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQ0gsTUFBTSxDQUFDRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ0UsY0FBYyxFQUFFO1lBQ3BELElBQUksSUFBSSxDQUFDUixVQUFVLENBQUNHLE1BQU0sQ0FBQ0csQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNFLGNBQWMsQ0FBQyxFQUFFO2NBQ2pESixzQkFBc0IsQ0FBQ0ssSUFBSSxDQUFDLElBQUksQ0FBQ1QsVUFBVSxDQUFDRyxNQUFNLENBQUNHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDRSxjQUFjLENBQUMsQ0FBQ0UsS0FBSyxDQUFDO2NBQy9FQyxNQUFNLENBQUNDLGNBQWMsQ0FBQ1YsS0FBSyxDQUFDSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUU7Z0JBQzNDTyxLQUFLLEVBQUUsSUFBSSxDQUFDYixVQUFVLENBQUNHLE1BQU0sQ0FBQ0csQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNFLGNBQWMsQ0FBQyxDQUFDRTtjQUNyRCxDQUFDLENBQUM7WUFDSCxDQUFDLE1BQU07Y0FDTkwseUJBQXlCLENBQUNJLElBQUksQ0FBQ04sTUFBTSxDQUFDRyxDQUFDLENBQUMsQ0FBQztZQUMxQztVQUNEO1FBQ0Q7UUFDQSxPQUFPO1VBQUVRLE9BQU8sRUFBRVosS0FBSztVQUFFYSxPQUFPLEVBQUVWLHlCQUF5QjtVQUFFVyxXQUFXLEVBQUVaO1FBQXVCLENBQUM7TUFDbkcsQ0FBQztNQUNELElBQUksQ0FBQ3pELFdBQVcsR0FBRyxJQUFJQyxPQUFPLENBQUMsVUFBQ0MsT0FBTyxFQUFFd0MsTUFBTSxFQUFLO1FBQ25ELEtBQUksQ0FBQzRCLFNBQVMsR0FBR3BFLE9BQU87UUFDeEIsS0FBSSxDQUFDcUUsUUFBUSxHQUFHN0IsTUFBTTtNQUN2QixDQUFDLENBQUM7TUFDRixJQUFNOEIsMEJBQTBCLEdBQUcsSUFBSSxDQUFDdEIsZUFBZSxDQUFDdUIsZUFBZSxDQUFDLDRCQUE0QixDQUFDO01BQ3JHLElBQU1DLHlCQUF5QixHQUFHLElBQUksQ0FBQ3hCLGVBQWUsQ0FBQ3VCLGVBQWUsQ0FBQyxZQUFZLENBQUM7TUFDcEYsSUFBTUUsOEJBQThCLEdBQUcsSUFBSSxDQUFDekIsZUFBZSxDQUFDdUIsZUFBZSxDQUFDLGlCQUFpQixDQUFDO01BQzlGLElBQU1HLDBCQUEwQixHQUFHLElBQUksQ0FBQzFCLGVBQWUsQ0FBQ3VCLGVBQWUsQ0FBQyxlQUFlLENBQUM7TUFDeEYsSUFBTUksc0JBQXNCLEdBQUc3QixVQUFVLENBQUM4QixVQUFVLENBQUMsZ0JBQWdCLENBQUM7TUFDdEU3RSxPQUFPLENBQUM4RSxHQUFHLENBQUMsQ0FDWFAsMEJBQTBCLEVBQzFCRSx5QkFBeUIsRUFDekJDLDhCQUE4QixFQUM5QkUsc0JBQXNCLEVBQ3RCRCwwQkFBMEIsQ0FDMUIsQ0FBQyxDQUNBSSxJQUFJLENBQUMsZ0JBQXVHO1FBQUE7VUFBckdDLG1CQUFtQjtVQUFFQyxrQkFBa0I7VUFBRUMsZ0JBQWdCO1VBQUVDLGVBQWU7VUFBRUMsbUJBQW1CO1FBQ3RHLEtBQUksQ0FBQ0Msa0JBQWtCLEdBQUdMLG1CQUFtQjtRQUM3QyxLQUFJLENBQUNNLGlCQUFpQixHQUFHTCxrQkFBa0I7UUFDM0MsS0FBSSxDQUFDTSxlQUFlLEdBQUdMLGdCQUFnQjtRQUN2QyxLQUFJLENBQUNNLGNBQWMsR0FBR0wsZUFBZTtRQUNyQyxLQUFJLENBQUNNLGtCQUFrQixHQUFHTCxtQkFBbUI7UUFDN0MsS0FBSSxDQUFDZixTQUFTLEVBQUU7TUFDakIsQ0FBQyxDQUFDLENBQ0RxQixLQUFLLENBQUMsSUFBSSxDQUFDcEIsUUFBUSxDQUFDO0lBQ3ZCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVhDO0lBQUEsUUFZQW5FLFFBQVEsR0FBUixrQkFBU21ELEtBQWEsRUFBRTtNQUFBO01BQ3ZCLE9BQU8sSUFBSXRELE9BQU8sQ0FBQyxVQUFDQyxPQUFPLEVBQUV3QyxNQUFNLEVBQUs7UUFDdkM7UUFDQSxNQUFJLENBQUM0QyxrQkFBa0IsQ0FDckJsRixRQUFRLENBQUNtRCxLQUFLLENBQUMsQ0FDZlgsSUFBSSxDQUFDLFVBQUNnRCxNQUFXLEVBQUs7VUFDdEJsRCxNQUFNLENBQUMsSUFBSW1ELEtBQUssV0FBSUQsTUFBTSx5REFBc0QsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FDRFosSUFBSSxDQUFDOUUsT0FBTyxDQUFDO01BQ2hCLENBQUMsQ0FBQztJQUNIOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVhDO0lBQUEsUUFZQUcsaUJBQWlCLEdBQWpCLDJCQUFrQmtELEtBQWEsRUFBa0I7TUFBQTtNQUNoRCxPQUFPLElBQUl0RCxPQUFPLENBQUMsVUFBQ0MsT0FBTyxFQUFFd0MsTUFBTSxFQUFLO1FBQ3ZDO1FBQ0EsSUFBS2EsS0FBSyxDQUFjSyxNQUFNLEtBQUssQ0FBQyxFQUFFO1VBQ3JDMUQsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNaLENBQUMsTUFBTTtVQUNOLElBQU00RixhQUFhLEdBQUcsTUFBSSxDQUFDeEMsNEJBQTRCLENBQUNDLEtBQUssQ0FBQztVQUU5RCxJQUFJdUMsYUFBYSxDQUFDMUIsT0FBTyxDQUFDUixNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3ZDMUQsT0FBTyxDQUFDNEYsYUFBYSxDQUFDekIsV0FBVyxDQUFDO1VBQ25DLENBQUMsTUFBTTtZQUNOO1lBQ0EsTUFBSSxDQUFDaUIsa0JBQWtCLENBQ3JCbEYsUUFBUSxDQUFDMEYsYUFBYSxDQUFDMUIsT0FBTyxDQUFDLENBQy9CeEIsSUFBSSxDQUFDLFVBQUNnRCxNQUFXLEVBQUs7Y0FDdEJsRCxNQUFNLENBQUMsSUFBSW1ELEtBQUssV0FBSUQsTUFBTSxrRUFBK0QsQ0FBQztZQUMzRixDQUFDLENBQUMsQ0FDRFosSUFBSSxDQUFDLFVBQUNlLE1BQVcsRUFBSztjQUN0QixJQUFJQSxNQUFNLENBQUNuQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixJQUFNb0MscUJBQTBCLEdBQUcsQ0FBQyxDQUFDO2dCQUVyQyxLQUFLLElBQUlyQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdvQyxNQUFNLENBQUNuQyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO2tCQUN2QyxJQUFJb0MsTUFBTSxDQUFDcEMsQ0FBQyxDQUFDLENBQUNDLE1BQU0sR0FBRyxDQUFDLElBQUlrQyxhQUFhLENBQUMxQixPQUFPLENBQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDSSxLQUFLLEtBQUtrQyxTQUFTLEVBQUU7b0JBQzVFRCxxQkFBcUIsQ0FBQ0YsYUFBYSxDQUFDMUIsT0FBTyxDQUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ0UsY0FBYyxDQUFDLEdBQUc7c0JBQ25FRSxLQUFLLEVBQUVnQyxNQUFNLENBQUNwQyxDQUFDO29CQUNoQixDQUFDO29CQUNELE1BQUksQ0FBQ04sVUFBVSxHQUFHVyxNQUFNLENBQUNrQyxNQUFNLENBQUMsTUFBSSxDQUFDN0MsVUFBVSxFQUFFMkMscUJBQXFCLENBQUM7a0JBQ3hFO2dCQUNEO2NBQ0Q7Y0FFQSxJQUFJRixhQUFhLENBQUN6QixXQUFXLENBQUNULE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzNDMUQsT0FBTyxDQUFDNkYsTUFBTSxDQUFDO2NBQ2hCLENBQUMsTUFBTTtnQkFDTixJQUFNSSxZQUFZLEdBQUcsRUFBRTtnQkFDdkIsSUFBSUMsQ0FBQyxHQUFHLENBQUM7Z0JBRVQsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdQLGFBQWEsQ0FBQzNCLE9BQU8sQ0FBQ1AsTUFBTSxFQUFFeUMsQ0FBQyxFQUFFLEVBQUU7a0JBQ3RELElBQUlELENBQUMsR0FBR0wsTUFBTSxDQUFDbkMsTUFBTSxFQUFFO29CQUN0QixJQUNDbUMsTUFBTSxDQUFDSyxDQUFDLENBQUMsQ0FBQ3hDLE1BQU0sR0FBRyxDQUFDLElBQ3BCa0MsYUFBYSxDQUFDM0IsT0FBTyxDQUFDa0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUN4QyxjQUFjLEtBQUtpQyxhQUFhLENBQUMxQixPQUFPLENBQUNnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ3ZDLGNBQWMsRUFDeEY7c0JBQ0RzQyxZQUFZLENBQUNyQyxJQUFJLENBQUNpQyxNQUFNLENBQUNLLENBQUMsQ0FBQyxDQUFDO3NCQUM1QkEsQ0FBQyxFQUFFO29CQUNKLENBQUMsTUFBTTtzQkFDTkQsWUFBWSxDQUFDckMsSUFBSSxDQUFDZ0MsYUFBYSxDQUFDM0IsT0FBTyxDQUFDa0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUN0QyxLQUFLLENBQUM7b0JBQ3JEO2tCQUNELENBQUMsTUFBTTtvQkFDTm9DLFlBQVksQ0FBQ3JDLElBQUksQ0FBQ2dDLGFBQWEsQ0FBQzNCLE9BQU8sQ0FBQ2tDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDdEMsS0FBSyxDQUFDO2tCQUNyRDtnQkFDRDtnQkFDQTdELE9BQU8sQ0FBQ2lHLFlBQVksQ0FBQztjQUN0QjtZQUNELENBQUMsQ0FBQztVQUNKO1FBQ0Q7TUFDRCxDQUFDLENBQUM7SUFDSDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxRQVFBRyxpQkFBaUIsR0FBakIsNkJBQW9CO01BQ25CLE9BQU8sSUFBSSxDQUFDcEQsZUFBZTtJQUM1Qjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FSQztJQUFBLFFBU0E1QyxVQUFVLEdBQVYsb0JBQVdpRyxnQkFBK0IsRUFBRXZELFVBQWtCLEVBQVE7TUFDckUsSUFBSSxDQUFDc0Msa0JBQWtCLENBQUNoRixVQUFVLENBQUNpRyxnQkFBZ0IsRUFBRXZELFVBQVUsQ0FBQztJQUNqRTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FYQztJQUFBLFFBWUF6QyxrQkFBa0IsR0FBbEIsNEJBQW1CZ0QsS0FBZ0IsRUFBRTtNQUFBO01BQ3BDLE9BQU8sSUFBSXRELE9BQU8sQ0FBQyxVQUFDQyxPQUFPLEVBQUV3QyxNQUFNLEVBQUs7UUFDdkM7UUFDQTtRQUNDLE1BQUksQ0FBQzRDLGtCQUFrQixDQUN0Qi9FLGtCQUFrQixDQUFDZ0QsS0FBSyxDQUFDLENBQ3pCWCxJQUFJLENBQUMsVUFBQ2dELE1BQVcsRUFBSztVQUN0QmxELE1BQU0sQ0FBQyxJQUFJbUQsS0FBSyxXQUFJRCxNQUFNLG1FQUFnRSxDQUFDO1FBQzVGLENBQUMsQ0FBQyxDQUNEWixJQUFJLENBQUM5RSxPQUFPLENBQUM7TUFDaEIsQ0FBQyxDQUFDO0lBQ0g7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLFFBT0FNLGlCQUFpQixHQUFqQiw2QkFBb0I7TUFDbkIsT0FBTyxJQUFJLENBQUM4RSxrQkFBa0IsQ0FBQzlFLGlCQUFpQixFQUFFO0lBQ25EOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FWQztJQUFBLFFBV0FDLGVBQWUsR0FBZix5QkFBZ0I4QyxLQUFhLEVBQUVQLFVBQW1CLEVBQUV3RCxNQUFnQixFQUFFO01BQ3JFLE9BQU8sSUFBSSxDQUFDbEIsa0JBQWtCLENBQUM3RSxlQUFlLENBQUM4QyxLQUFLLEVBQUVQLFVBQVUsRUFBWSxDQUFDLENBQUN3RCxNQUFNLENBQUM7SUFDdEY7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FUQztJQUFBLFFBVUE5RixvQkFBb0IsR0FBcEIsOEJBQXFCNkMsS0FBYSxFQUFFUCxVQUFtQixFQUFFO01BQ3hELE9BQU8sSUFBSSxDQUFDc0Msa0JBQWtCLENBQUM1RSxvQkFBb0IsQ0FBQzZDLEtBQUssRUFBRVAsVUFBVSxDQUFXO0lBQ2pGOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BVEM7SUFBQSxRQVVBckMsV0FBVyxHQUFYLHFCQUFZcUMsVUFBcUIsRUFBRXlELFlBQW9CLEVBQUU7TUFDeEQsT0FBT2pFLGlCQUFpQixDQUFFLElBQUksQ0FBQzhDLGtCQUFrQixDQUFTM0UsV0FBVyxDQUFDcUMsVUFBVSxFQUFFeUQsWUFBWSxDQUFDLENBQUM7SUFDakc7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUkM7SUFBQSxRQVNBN0YsbUJBQW1CLEdBQW5CLDZCQUFvQm9DLFVBQXFCLEVBQUU7TUFDMUMsT0FBUSxJQUFJLENBQUNzQyxrQkFBa0IsQ0FBUzFFLG1CQUFtQixDQUFDb0MsVUFBVSxDQUFDO0lBQ3hFOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVJDO0lBQUEsUUFTQW5DLHdCQUF3QixHQUF4QixrQ0FBeUJtQyxVQUFxQixFQUFFO01BQy9DLE9BQVEsSUFBSSxDQUFDc0Msa0JBQWtCLENBQVN6RSx3QkFBd0IsQ0FBQ21DLFVBQVUsQ0FBQztJQUM3RTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVRDO0lBQUEsUUFVQWxDLHFCQUFxQixHQUFyQiwrQkFBc0J5RixnQkFBK0IsRUFBRXZELFVBQWtCLEVBQUU7TUFDMUUsT0FBT1IsaUJBQWlCLENBQUMsSUFBSSxDQUFDOEMsa0JBQWtCLENBQUN4RSxxQkFBcUIsQ0FBQ3lGLGdCQUFnQixFQUFFdkQsVUFBVSxDQUFDLENBQUM7SUFDdEc7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLFFBT0FqQyxtQkFBbUIsR0FBbkIsK0JBQXNCO01BQ3JCLE9BQU8sSUFBSSxDQUFDdUUsa0JBQWtCLENBQUN2RSxtQkFBbUIsRUFBRTtJQUNyRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsUUFPQUMsd0JBQXdCLEdBQXhCLG9DQUEyQjtNQUMxQixPQUFPLElBQUksQ0FBQ3NFLGtCQUFrQixDQUFDdEUsd0JBQXdCLEVBQUU7SUFDMUQ7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVBDO0lBQUEsUUFRQUMsaUJBQWlCLEdBQWpCLDJCQUFrQnlGLGFBQXFCLEVBQUU7TUFDeEMsT0FBTyxJQUFJLENBQUNwQixrQkFBa0IsQ0FBQ3JFLGlCQUFpQixDQUFDeUYsYUFBYSxDQUFDO0lBQ2hFOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVJDO0lBQUEsUUFTQXhGLGNBQWMsR0FBZCx3QkFBZXlGLEtBQWEsRUFBRTtNQUM3QixPQUFPLElBQUksQ0FBQ3BCLGlCQUFpQixDQUFDckUsY0FBYyxDQUFDeUYsS0FBSyxDQUFDO0lBQ3BEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVJDO0lBQUEsUUFTQXhGLFNBQVMsR0FBVCxtQkFBVXdGLEtBQWEsRUFBRTtNQUN4QixPQUFPLElBQUksQ0FBQ3BCLGlCQUFpQixDQUFDcEUsU0FBUyxDQUFDd0YsS0FBSyxDQUFDO0lBQy9DOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVJDO0lBQUEsUUFTQXZGLGtCQUFrQixHQUFsQiw0QkFBbUJ3RixhQUFxQixFQUFFO01BQ3pDLE9BQU8sSUFBSSxDQUFDckIsaUJBQWlCLENBQUNuRSxrQkFBa0IsQ0FBQ3dGLGFBQWEsQ0FBQztJQUNoRTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsUUFPQXZGLFlBQVksR0FBWixzQkFBYXdGLE1BQWUsRUFBRTtNQUM3QixJQUFJLENBQUMzRCxlQUFlLENBQUM3QixZQUFZLENBQUN3RixNQUFNLENBQUM7SUFDMUM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLFFBT0F2RiwwQkFBMEIsR0FBMUIsb0NBQTJCd0Ysb0JBQThCLEVBQUU7TUFDMUQsSUFBSSxDQUFDNUQsZUFBZSxDQUFDNUIsMEJBQTBCLENBQUN3RixvQkFBb0IsQ0FBQztJQUN0RTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsUUFPQXZGLDRCQUE0QixHQUE1QixzQ0FBNkJ1RixvQkFBOEIsRUFBRTtNQUM1RCxJQUFJLENBQUM1RCxlQUFlLENBQUMzQiw0QkFBNEIsQ0FBQ3VGLG9CQUFvQixDQUFDO0lBQ3hFOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxRQU9BdEYsY0FBYyxHQUFkLDBCQUFpQjtNQUNoQixPQUFPLElBQUksQ0FBQzBCLGVBQWUsQ0FBQzFCLGNBQWMsRUFBRTtJQUM3Qzs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsUUFPQUMsT0FBTyxHQUFQLG1CQUFVO01BQ1QsT0FBUSxJQUFJLENBQUN5QixlQUFlLENBQVN6QixPQUFPLEVBQUU7SUFDL0M7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLFFBT0FDLFNBQVMsR0FBVCxxQkFBWTtNQUNYLE9BQU8sSUFBSTtJQUNaOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxRQU9BQyx3QkFBd0IsR0FBeEIsa0NBQXlCb0YsV0FBcUIsRUFBRTtNQUM5QyxJQUFJLENBQUN2QixlQUFlLENBQVM3RCx3QkFBd0IsQ0FBQ29GLFdBQVcsQ0FBQztJQUNwRTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsUUFPQW5GLDBCQUEwQixHQUExQixvQ0FBMkJtRixXQUFxQixFQUFFO01BQ2hELElBQUksQ0FBQ3ZCLGVBQWUsQ0FBUzVELDBCQUEwQixDQUFDbUYsV0FBVyxDQUFDO0lBQ3RFOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLFFBUUFsRixpQkFBaUIsR0FBakIsMkJBQWtCbUYsVUFBcUIsRUFBUTtNQUM5QyxJQUFJLENBQUN2QixjQUFjLENBQUM1RCxpQkFBaUIsQ0FBQ21GLFVBQVUsQ0FBQztJQUNsRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxRQVFBbEYsWUFBWSxHQUFaLHNCQUFhbUYsZ0JBQStCLEVBQVE7TUFDbkQsSUFBSSxDQUFDeEIsY0FBYyxDQUFDM0QsWUFBWSxDQUFDbUYsZ0JBQWdCLENBQUM7SUFDbkQ7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVBDO0lBQUEsUUFRQWxGLFFBQVEsR0FBUixrQkFBU21GLE1BQWMsRUFBUTtNQUM5QixJQUFJLENBQUN6QixjQUFjLENBQUMxRCxRQUFRLENBQUNtRixNQUFNLENBQUM7SUFDckM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsUUFLQWxGLGlCQUFpQixHQUFqQiw2QkFBNEI7TUFDM0IsT0FBUSxJQUFJLENBQUNrQixlQUFlLENBQVN6QixPQUFPLEVBQUUsQ0FBQ08saUJBQWlCLEVBQUU7SUFDbkU7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVZDO0lBQUEsUUFXQUssZ0JBQWdCLEdBQWhCLDBCQUFpQjhFLGVBQXVCLEVBQUVDLFdBQW9CLEVBQWdCO01BQUE7TUFDN0UsT0FBTyxJQUFJbkgsT0FBTyxDQUFDLFVBQUNDLE9BQU8sRUFBRXdDLE1BQU0sRUFBSztRQUN2QztRQUNBLE1BQUksQ0FBQzRDLGtCQUFrQixDQUNyQmpELGdCQUFnQixDQUFDOEUsZUFBZSxFQUFFQyxXQUFXLENBQUMsQ0FDOUN4RSxJQUFJLENBQUMsVUFBQ2dELE1BQVcsRUFBSztVQUN0QmxELE1BQU0sQ0FBQyxJQUFJbUQsS0FBSyxXQUFJRCxNQUFNLGlFQUE4RCxDQUFDO1FBQzFGLENBQUMsQ0FBQyxDQUNEWixJQUFJLENBQUM5RSxPQUFPLENBQUM7TUFDaEIsQ0FBQyxDQUFDO0lBQ0g7O0lBRUE7QUFDRDtBQUNBO0FBQ0EsT0FIQztJQUFBLFFBSUFvQyxrQkFBa0IsR0FBbEIsOEJBQXVDO01BQUE7TUFDdEMsT0FBTyxJQUFJckMsT0FBTyxDQUFDLFVBQUNDLE9BQU8sRUFBSztRQUFBO1FBQy9CLElBQUksMkJBQUMsTUFBSSxDQUFDd0Ysa0JBQWtCLGtEQUF2QixzQkFBeUIyQix1QkFBdUIsR0FBRTtVQUN0RG5ILE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDZixDQUFDLE1BQU07VUFDTjtVQUNBLE1BQUksQ0FBQ3dGLGtCQUFrQixDQUNyQjJCLHVCQUF1QixDQUFDLG9CQUFvQixDQUFDLENBQzdDekUsSUFBSSxDQUFDLFVBQUNnRCxNQUFlLEVBQUs7WUFDMUIwQixHQUFHLENBQUNDLEtBQUssQ0FBQzNCLE1BQU0sRUFBWSw4REFBOEQsQ0FBQztZQUMzRjFGLE9BQU8sQ0FBQyxLQUFLLENBQUM7VUFDZixDQUFDLENBQUMsQ0FDRDhFLElBQUksQ0FBQztZQUFBLE9BQU05RSxPQUFPLENBQUMsSUFBSSxDQUFDO1VBQUEsRUFBQztRQUM1QjtNQUNELENBQUMsQ0FBQztJQUNILENBQUM7SUFBQTtFQUFBLEVBNWlCMEJxQyxPQUFPO0VBK2lCbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUpBLElBS01pRixvQkFBb0I7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQ3pCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTkMsUUFPQUMsY0FBYyxHQUFkLHdCQUFlQyxlQUFzRCxFQUEyQjtNQUMvRkEsZUFBZSxDQUFDdkUsUUFBUSxDQUFDQyxjQUFjLEdBQUd1RSxHQUFHLENBQUNDLE1BQU0sSUFBS0QsR0FBRyxDQUFDQyxNQUFNLENBQUNDLFNBQXVCO01BQzNGLElBQU1DLGFBQWEsR0FBR0osZUFBZSxDQUFDdkUsUUFBUSxDQUFDQyxjQUFjLEdBQzFELElBQUlQLGFBQWEsQ0FBQzZFLGVBQWUsQ0FBb0QsR0FDckYsSUFBSTVILGdCQUFnQixDQUFDNEgsZUFBZSxDQUFDO01BQ3hDLE9BQU9JLGFBQWEsQ0FBQzlILFdBQVcsQ0FBQ2dGLElBQUksQ0FBQyxZQUFNO1FBQzNDO1FBQ0MwQyxlQUFlLENBQUN6RSxXQUFXLENBQVM4RSxnQkFBZ0IsR0FBRztVQUFBLE9BQU1ELGFBQWE7UUFBQTtRQUMzRSxPQUFPQSxhQUFhO01BQ3JCLENBQUMsQ0FBQztJQUNILENBQUM7SUFBQTtFQUFBLEVBbEJpQ0UsY0FBYztFQUFBLE9BcUJsQ1Isb0JBQW9CO0FBQUEifQ==