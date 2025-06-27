/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/helpers/AppStartupHelper", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/ui/base/BindingParser", "sap/ui/base/EventProvider", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/model/odata/v4/ODataUtils"], function (Log, BusyLocker, messageHandling, Placeholder, AppStartupHelper, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, CollaborationHelper, BindingParser, EventProvider, Service, ServiceFactory, ODataUtils) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var RoutingServiceEventing = (_dec = defineUI5Class("sap.fe.core.services.RoutingServiceEventing"), _dec2 = event(), _dec3 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_EventProvider) {
    _inheritsLoose(RoutingServiceEventing, _EventProvider);
    function RoutingServiceEventing() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _EventProvider.call.apply(_EventProvider, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "routeMatched", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterRouteMatched", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    return RoutingServiceEventing;
  }(EventProvider), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "routeMatched", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "afterRouteMatched", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  var RoutingService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(RoutingService, _Service);
    function RoutingService() {
      var _this2;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      _this2 = _Service.call.apply(_Service, [this].concat(args)) || this;
      _this2.navigationInfoQueue = [];
      return _this2;
    }
    _exports.RoutingService = RoutingService;
    var _proto = RoutingService.prototype;
    _proto.init = function init() {
      var oContext = this.getContext();
      if (oContext.scopeType === "component") {
        this.oAppComponent = oContext.scopeObject;
        this.oModel = this.oAppComponent.getModel();
        this.oMetaModel = this.oModel.getMetaModel();
        this.oRouter = this.oAppComponent.getRouter();
        this.oRouterProxy = this.oAppComponent.getRouterProxy();
        this.eventProvider = new RoutingServiceEventing();
        var oRoutingConfig = this.oAppComponent.getManifestEntry("/sap.ui5/routing");
        var oRootViewConfig = this.oAppComponent.getManifestEntry("/sap.ui5/rootView");
        this._parseRoutingConfiguration(oRoutingConfig, oRootViewConfig);
        var oAppConfig = this.oAppComponent.getManifestEntry("/sap.app");
        this.outbounds = oAppConfig && oAppConfig.crossNavigation && oAppConfig.crossNavigation.outbounds;
      }
      this.initPromise = Promise.resolve(this);
    };
    _proto.beforeExit = function beforeExit() {
      this.oRouter.detachRouteMatched(this._fnOnRouteMatched, this);
      this.eventProvider.fireEvent("routeMatched", {});
    };
    _proto.exit = function exit() {
      this.eventProvider.destroy();
    }

    /**
     * Parse a manifest routing configuration for internal usage.
     *
     * @param oRoutingConfig The routing configuration from the manifest
     * @param oRootViewConfig The root view configuration from the manifest
     * @private
     */;
    _proto._parseRoutingConfiguration = function _parseRoutingConfiguration(oRoutingConfig, oRootViewConfig) {
      var _this3 = this;
      var isFCL = (oRootViewConfig === null || oRootViewConfig === void 0 ? void 0 : oRootViewConfig.viewName) === "sap.fe.core.rootView.Fcl" || (oRootViewConfig === null || oRootViewConfig === void 0 ? void 0 : oRootViewConfig.viewName) === "sap.fe.templates.RootContainer.view.Fcl";

      // Information of targets
      this._mTargets = {};
      Object.keys(oRoutingConfig.targets).forEach(function (sTargetName) {
        _this3._mTargets[sTargetName] = Object.assign({
          targetName: sTargetName
        }, oRoutingConfig.targets[sTargetName]);

        // View level for FCL cases is calculated from the target pattern
        if (_this3._mTargets[sTargetName].contextPattern !== undefined) {
          _this3._mTargets[sTargetName].viewLevel = _this3._getViewLevelFromPattern(_this3._mTargets[sTargetName].contextPattern, 0);
        }
      });

      // Information of routes
      this._mRoutes = {};
      for (var sRouteKey in oRoutingConfig.routes) {
        var oRouteManifestInfo = oRoutingConfig.routes[sRouteKey],
          aRouteTargets = Array.isArray(oRouteManifestInfo.target) ? oRouteManifestInfo.target : [oRouteManifestInfo.target],
          sRouteName = Array.isArray(oRoutingConfig.routes) ? oRouteManifestInfo.name : sRouteKey,
          sRoutePattern = oRouteManifestInfo.pattern;

        // Check route pattern: all patterns need to end with ':?query:', that we use for parameters
        if (sRoutePattern.length < 8 || sRoutePattern.indexOf(":?query:") !== sRoutePattern.length - 8) {
          Log.warning("Pattern for route ".concat(sRouteName, " doesn't end with ':?query:' : ").concat(sRoutePattern));
        }
        var iRouteLevel = this._getViewLevelFromPattern(sRoutePattern, 0);
        this._mRoutes[sRouteName] = {
          name: sRouteName,
          pattern: sRoutePattern,
          targets: aRouteTargets,
          routeLevel: iRouteLevel
        };

        // Add the parent targets in the list of targets for the route
        for (var i = 0; i < aRouteTargets.length; i++) {
          var sParentTargetName = this._mTargets[aRouteTargets[i]].parent;
          if (sParentTargetName) {
            aRouteTargets.push(sParentTargetName);
          }
        }
        if (!isFCL) {
          // View level for non-FCL cases is calculated from the route pattern
          if (this._mTargets[aRouteTargets[0]].viewLevel === undefined || this._mTargets[aRouteTargets[0]].viewLevel < iRouteLevel) {
            // There are cases when different routes point to the same target. We take the
            // largest viewLevel in that case.
            this._mTargets[aRouteTargets[0]].viewLevel = iRouteLevel;
          }

          // FCL level for non-FCL cases is equal to -1
          this._mTargets[aRouteTargets[0]].FCLLevel = -1;
        } else if (aRouteTargets.length === 1 && this._mTargets[aRouteTargets[0]].controlAggregation !== "beginColumnPages") {
          // We're in the case where there's only 1 target for the route, and it's not in the first column
          // --> this is a fullscreen column after all columns in the FCL have been used
          this._mTargets[aRouteTargets[0]].FCLLevel = 3;
        } else {
          // Other FCL cases
          aRouteTargets.forEach(function (sTargetName) {
            switch (_this3._mTargets[sTargetName].controlAggregation) {
              case "beginColumnPages":
                _this3._mTargets[sTargetName].FCLLevel = 0;
                break;
              case "midColumnPages":
                _this3._mTargets[sTargetName].FCLLevel = 1;
                break;
              default:
                _this3._mTargets[sTargetName].FCLLevel = 2;
            }
          });
        }
      }

      // Propagate viewLevel, contextPattern, FCLLevel and controlAggregation to parent targets
      Object.keys(this._mTargets).forEach(function (sTargetName) {
        while (_this3._mTargets[sTargetName].parent) {
          var _sParentTargetName = _this3._mTargets[sTargetName].parent;
          _this3._mTargets[_sParentTargetName].viewLevel = _this3._mTargets[_sParentTargetName].viewLevel || _this3._mTargets[sTargetName].viewLevel;
          _this3._mTargets[_sParentTargetName].contextPattern = _this3._mTargets[_sParentTargetName].contextPattern || _this3._mTargets[sTargetName].contextPattern;
          _this3._mTargets[_sParentTargetName].FCLLevel = _this3._mTargets[_sParentTargetName].FCLLevel || _this3._mTargets[sTargetName].FCLLevel;
          _this3._mTargets[_sParentTargetName].controlAggregation = _this3._mTargets[_sParentTargetName].controlAggregation || _this3._mTargets[sTargetName].controlAggregation;
          sTargetName = _sParentTargetName;
        }
      });

      // Determine the root entity for the app
      var aLevel0RouteNames = [];
      var aLevel1RouteNames = [];
      var sDefaultRouteName;
      for (var sName in this._mRoutes) {
        var iLevel = this._mRoutes[sName].routeLevel;
        if (iLevel === 0) {
          aLevel0RouteNames.push(sName);
        } else if (iLevel === 1) {
          aLevel1RouteNames.push(sName);
        }
      }
      if (aLevel0RouteNames.length === 1) {
        sDefaultRouteName = aLevel0RouteNames[0];
      } else if (aLevel1RouteNames.length === 1) {
        sDefaultRouteName = aLevel1RouteNames[0];
      }
      if (sDefaultRouteName) {
        var sDefaultTargetName = this._mRoutes[sDefaultRouteName].targets.slice(-1)[0];
        this.sContextPath = "";
        if (this._mTargets[sDefaultTargetName].options && this._mTargets[sDefaultTargetName].options.settings) {
          var oSettings = this._mTargets[sDefaultTargetName].options.settings;
          this.sContextPath = oSettings.contextPath || "/".concat(oSettings.entitySet);
        }
        if (!this.sContextPath) {
          Log.warning("Cannot determine default contextPath: contextPath or entitySet missing in default target: ".concat(sDefaultTargetName));
        }
      } else {
        Log.warning("Cannot determine default contextPath: no default route found.");
      }

      // We need to establish the correct path to the different pages, including the navigation properties
      Object.keys(this._mTargets).map(function (sTargetKey) {
        return _this3._mTargets[sTargetKey];
      }).sort(function (a, b) {
        return a.viewLevel < b.viewLevel ? -1 : 1;
      }).forEach(function (target) {
        // After sorting the targets per level we can then go through their navigation object and update the paths accordingly.
        if (target.options) {
          var settings = target.options.settings;
          var sContextPath = settings.contextPath || (settings.entitySet ? "/".concat(settings.entitySet) : "");
          if (!settings.fullContextPath && sContextPath) {
            settings.fullContextPath = "".concat(sContextPath, "/");
          }
          Object.keys(settings.navigation || {}).forEach(function (sNavName) {
            // Check if it's a navigation property
            var targetRoute = _this3._mRoutes[settings.navigation[sNavName].detail.route];
            if (targetRoute && targetRoute.targets) {
              targetRoute.targets.forEach(function (sTargetName) {
                if (_this3._mTargets[sTargetName].options && _this3._mTargets[sTargetName].options.settings && !_this3._mTargets[sTargetName].options.settings.fullContextPath) {
                  if (target.viewLevel === 0) {
                    _this3._mTargets[sTargetName].options.settings.fullContextPath = "".concat((sNavName.startsWith("/") ? "" : "/") + sNavName, "/");
                  } else {
                    _this3._mTargets[sTargetName].options.settings.fullContextPath = "".concat(settings.fullContextPath + sNavName, "/");
                  }
                }
              });
            }
          });
        }
      });
    }

    /**
     * Calculates a view level from a pattern by counting the number of segments.
     *
     * @param sPattern The pattern
     * @param viewLevel The current level of view
     * @returns The level
     */;
    _proto._getViewLevelFromPattern = function _getViewLevelFromPattern(sPattern, viewLevel) {
      sPattern = sPattern.replace(":?query:", "");
      var regex = new RegExp("/[^/]*$");
      if (sPattern && sPattern[0] !== "/" && sPattern[0] !== "?") {
        sPattern = "/".concat(sPattern);
      }
      if (sPattern.length) {
        sPattern = sPattern.replace(regex, "");
        if (this.oRouter.match(sPattern) || sPattern === "") {
          return this._getViewLevelFromPattern(sPattern, ++viewLevel);
        } else {
          return this._getViewLevelFromPattern(sPattern, viewLevel);
        }
      } else {
        return viewLevel;
      }
    };
    _proto._getRouteInformation = function _getRouteInformation(sRouteName) {
      return this._mRoutes[sRouteName];
    };
    _proto._getTargetInformation = function _getTargetInformation(sTargetName) {
      return this._mTargets[sTargetName];
    };
    _proto._getComponentId = function _getComponentId(sOwnerId, sComponentId) {
      if (sComponentId.indexOf("".concat(sOwnerId, "---")) === 0) {
        return sComponentId.substr(sOwnerId.length + 3);
      }
      return sComponentId;
    }

    /**
     * Get target information for a given component.
     *
     * @param oComponentInstance Instance of the component
     * @returns The configuration for the target
     */;
    _proto.getTargetInformationFor = function getTargetInformationFor(oComponentInstance) {
      var _this4 = this;
      var sTargetComponentId = this._getComponentId(oComponentInstance._sOwnerId, oComponentInstance.getId());
      var sCorrectTargetName = null;
      Object.keys(this._mTargets).forEach(function (sTargetName) {
        if (_this4._mTargets[sTargetName].id === sTargetComponentId || _this4._mTargets[sTargetName].viewId === sTargetComponentId) {
          sCorrectTargetName = sTargetName;
        }
      });
      return this._getTargetInformation(sCorrectTargetName);
    };
    _proto.getLastSemanticMapping = function getLastSemanticMapping() {
      return this.oLastSemanticMapping;
    };
    _proto.setLastSemanticMapping = function setLastSemanticMapping(oMapping) {
      this.oLastSemanticMapping = oMapping;
    };
    _proto.navigateTo = function navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory) {
      var _this5 = this;
      var sTargetURLPromise, bIsStickyMode;
      if (oContext.getModel() && oContext.getModel().getMetaModel && oContext.getModel().getMetaModel()) {
        bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
      }
      if (!mParameterMapping) {
        // if there is no parameter mapping define this mean we rely entirely on the binding context path
        sTargetURLPromise = Promise.resolve(SemanticKeyHelper.getSemanticPath(oContext));
      } else {
        sTargetURLPromise = this.prepareParameters(mParameterMapping, sRouteName, oContext).then(function (mParameters) {
          return _this5.oRouter.getURL(sRouteName, mParameters);
        });
      }
      return sTargetURLPromise.then(function (sTargetURL) {
        _this5.oRouterProxy.navToHash(sTargetURL, bPreserveHistory, false, false, !bIsStickyMode);
      });
    }

    /**
     * Method to return a map of routing target parameters where the binding syntax is resolved to the current model.
     *
     * @param mParameters Parameters map in the format [k: string] : ComplexBindingSyntax
     * @param sTargetRoute Name of the target route
     * @param oContext The instance of the binding context
     * @returns A promise which resolves to the routing target parameters
     */;
    _proto.prepareParameters = function prepareParameters(mParameters, sTargetRoute, oContext) {
      var _this6 = this;
      var oParametersPromise;
      try {
        var sContextPath = oContext.getPath();
        var oMetaModel = oContext.getModel().getMetaModel();
        var aContextPathParts = sContextPath.split("/");
        var aAllResolvedParameterPromises = Object.keys(mParameters).map(function (sParameterKey) {
          var sParameterMappingExpression = mParameters[sParameterKey];
          // We assume the defined parameters will be compatible with a binding expression
          var oParsedExpression = BindingParser.complexParser(sParameterMappingExpression);
          var aParts = oParsedExpression.parts || [oParsedExpression];
          var aResolvedParameterPromises = aParts.map(function (oPathPart) {
            var aRelativeParts = oPathPart.path.split("../");
            // We go up the current context path as many times as necessary
            var aLocalParts = aContextPathParts.slice(0, aContextPathParts.length - aRelativeParts.length + 1);
            var localContextPath = aLocalParts.join("/");
            var localContext = localContextPath === oContext.getPath() ? oContext : oContext.getModel().bindContext(localContextPath).getBoundContext();
            var oMetaContext = oMetaModel.getMetaContext(localContextPath + "/" + aRelativeParts[aRelativeParts.length - 1]);
            return localContext.requestProperty(aRelativeParts[aRelativeParts.length - 1]).then(function (oValue) {
              var oPropertyInfo = oMetaContext.getObject(); // Returns any in master for some reason
              var sEdmType = oPropertyInfo.$Type;
              return ODataUtils.formatLiteral(oValue, sEdmType);
            });
          });
          return Promise.all(aResolvedParameterPromises).then(function (aResolvedParameters) {
            var value = oParsedExpression.formatter ? oParsedExpression.formatter.apply(_this6, aResolvedParameters) : aResolvedParameters.join("");
            return {
              key: sParameterKey,
              value: value
            };
          });
        });
        oParametersPromise = Promise.all(aAllResolvedParameterPromises).then(function (aAllResolvedParameters) {
          var oParameters = {};
          aAllResolvedParameters.forEach(function (oResolvedParameter) {
            oParameters[oResolvedParameter.key] = oResolvedParameter.value;
          });
          return oParameters;
        });
      } catch (oError) {
        Log.error("Could not parse the parameters for the navigation to route ".concat(sTargetRoute));
        oParametersPromise = Promise.resolve(undefined);
      }
      return oParametersPromise;
    };
    _proto._fireRouteMatchEvents = function _fireRouteMatchEvents(mParameters) {
      this.eventProvider.fireEvent("routeMatched", mParameters);
      this.eventProvider.fireEvent("afterRouteMatched", mParameters);
      EditState.cleanProcessedEditState(); // Reset UI state when all bindings have been refreshed
    }

    /**
     * Navigates to a context.
     *
     * @param oContext The Context to be navigated to
     * @param [mParameters] Optional, map containing the following attributes:
     * @param [mParameters.checkNoHashChange] Navigate to the context without changing the URL
     * @param [mParameters.asyncContext] The context is created async, navigate to (...) and
     *                    wait for Promise to be resolved and then navigate into the context
     * @param [mParameters.bDeferredContext] The context shall be created deferred at the target page
     * @param [mParameters.editable] The target page shall be immediately in the edit mode to avoid flickering
     * @param [mParameters.bPersistOPScroll] The bPersistOPScroll will be used for scrolling to first tab
     * @param [mParameters.updateFCLLevel] `+1` if we add a column in FCL, `-1` to remove a column, 0 to stay on the same column
     * @param [mParameters.noPreservationCache] Do navigation without taking into account the preserved cache mechanism
     * @param [mParameters.bRecreateContext] Force re-creation of the context instead of using the one passed as parameter
     * @param [mParameters.bForceFocus] Forces focus selection after navigation
     * @param [oViewData] View data
     * @param [oCurrentTargetInfo] The target information from which the navigation is triggered
     * @returns Promise which is resolved once the navigation is triggered
     * @ui5-restricted
     * @final
     */;
    _proto.navigateToContext = function navigateToContext(oContext, mParameters, oViewData, oCurrentTargetInfo) {
      var _this7 = this;
      var sTargetRoute = "",
        oRouteParametersPromise,
        bIsStickyMode = false;
      if (oContext.getModel() && oContext.getModel().getMetaModel) {
        bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
      }
      // Manage parameter mapping
      if (mParameters && mParameters.targetPath && oViewData && oViewData.navigation) {
        var oRouteDetail = oViewData.navigation[mParameters.targetPath].detail;
        sTargetRoute = oRouteDetail.route;
        if (oRouteDetail.parameters) {
          oRouteParametersPromise = this.prepareParameters(oRouteDetail.parameters, sTargetRoute, oContext);
        }
      }
      var sTargetPath = this._getPathFromContext(oContext, mParameters);
      // If the path is empty, we're supposed to navigate to the first page of the app
      // Check if we need to exit from the app instead
      if (sTargetPath.length === 0 && this.bExitOnNavigateBackToRoot) {
        this.oRouterProxy.exitFromApp();
        return Promise.resolve(true);
      }

      // If the context is deferred or async, we add (...) to the path
      if (mParameters !== null && mParameters !== void 0 && mParameters.asyncContext || mParameters !== null && mParameters !== void 0 && mParameters.bDeferredContext) {
        sTargetPath += "(...)";
      }

      // Add layout parameter if needed
      var sLayout = this._calculateLayout(sTargetPath, mParameters);
      if (sLayout) {
        sTargetPath += "?layout=".concat(sLayout);
      }

      // Navigation parameters for later usage
      var oNavigationInfo = {
        oAsyncContext: mParameters === null || mParameters === void 0 ? void 0 : mParameters.asyncContext,
        bDeferredContext: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bDeferredContext,
        bTargetEditable: mParameters === null || mParameters === void 0 ? void 0 : mParameters.editable,
        bPersistOPScroll: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bPersistOPScroll,
        useContext: (mParameters === null || mParameters === void 0 ? void 0 : mParameters.updateFCLLevel) === -1 || mParameters !== null && mParameters !== void 0 && mParameters.bRecreateContext ? undefined : oContext,
        bDraftNavigation: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bDraftNavigation,
        bShowPlaceholder: (mParameters === null || mParameters === void 0 ? void 0 : mParameters.showPlaceholder) !== undefined ? mParameters === null || mParameters === void 0 ? void 0 : mParameters.showPlaceholder : true
      };
      if (mParameters !== null && mParameters !== void 0 && mParameters.checkNoHashChange) {
        // Check if the new hash is different from the current one
        var sCurrentHashNoAppState = this.oRouterProxy.getHash().replace(/[&?]{1}sap-iapp-state=[A-Z0-9]+/, "");
        if (sTargetPath === sCurrentHashNoAppState) {
          // The hash doesn't change, but we fire the routeMatch event to trigger page refresh / binding
          var mEventParameters = this.oRouter.getRouteInfoByHash(this.oRouterProxy.getHash());
          if (mEventParameters) {
            mEventParameters.navigationInfo = oNavigationInfo;
            mEventParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
            mEventParameters.routePattern = this.sCurrentRoutePattern;
            mEventParameters.views = this.aCurrentViews;
          }
          this.oRouterProxy.setFocusForced(!!mParameters.bForceFocus);
          this._fireRouteMatchEvents(mEventParameters);
          return Promise.resolve(true);
        }
      }
      if (mParameters !== null && mParameters !== void 0 && mParameters.transient && mParameters.editable == true && sTargetPath.indexOf("(...)") === -1) {
        if (sTargetPath.indexOf("?") > -1) {
          sTargetPath += "&i-action=create";
        } else {
          sTargetPath += "?i-action=create";
        }
      }

      // Clear unbound messages upon navigating from LR to OP
      // This is to ensure stale error messages from LR are not shown to the user after navigation to OP.
      if (oCurrentTargetInfo && oCurrentTargetInfo.name === "sap.fe.templates.ListReport") {
        var oRouteInfo = this.oRouter.getRouteInfoByHash(sTargetPath);
        if (oRouteInfo) {
          var oRoute = this._getRouteInformation(oRouteInfo.name);
          if (oRoute && oRoute.targets && oRoute.targets.length > 0) {
            var sLastTargetName = oRoute.targets[oRoute.targets.length - 1];
            var oTarget = this._getTargetInformation(sLastTargetName);
            if (oTarget && oTarget.name === "sap.fe.templates.ObjectPage") {
              messageHandling.removeUnboundTransitionMessages();
            }
          }
        }
      }

      // Add the navigation parameters in the queue
      this.navigationInfoQueue.push(oNavigationInfo);
      if (sTargetRoute && oRouteParametersPromise) {
        return oRouteParametersPromise.then(function (oRouteParameters) {
          oRouteParameters.bIsStickyMode = bIsStickyMode;
          _this7.oRouter.navTo(sTargetRoute, oRouteParameters);
          return Promise.resolve(true);
        });
      }
      return this.oRouterProxy.navToHash(sTargetPath, false, mParameters === null || mParameters === void 0 ? void 0 : mParameters.noPreservationCache, mParameters === null || mParameters === void 0 ? void 0 : mParameters.bForceFocus, !bIsStickyMode).then(function (bNavigated) {
        if (!bNavigated) {
          // The navigation did not happen --> remove the navigation parameters from the queue as they shouldn't be used
          _this7.navigationInfoQueue.pop();
        }
        return bNavigated;
      });
    }

    /**
     * Navigates to a route.
     *
     * @function
     * @name sap.fe.core.controllerextensions.Routing#navigateToRoute
     * @memberof sap.fe.core.controllerextensions.Routing
     * @static
     * @param sTargetRouteName Name of the target route
     * @param [oRouteParameters] Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     * @final
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oRouteParameters) {
      var sTargetURL = this.oRouter.getURL(sTargetRouteName, oRouteParameters);
      return this.oRouterProxy.navToHash(sTargetURL, undefined, undefined, undefined, !oRouteParameters.bIsStickyMode);
    }

    /**
     * Checks if one of the current views on the screen is bound to a given context.
     *
     * @param oContext The context
     * @returns `true` or `false` if the current state is impacted or not
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(oContext) {
      var sPath = oContext.getPath();

      // First, check with the technical path. We have to try it, because for level > 1, we
      // uses technical keys even if Semantic keys are enabled
      if (this.oRouterProxy.isCurrentStateImpactedBy(sPath)) {
        return true;
      } else if (/^[^\(\)]+\([^\(\)]+\)$/.test(sPath)) {
        // If the current path can be semantic (i.e. is like xxx(yyy))
        // check with the semantic path if we can find it
        var sSemanticPath;
        if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
          // We have already resolved this semantic path
          sSemanticPath = this.oLastSemanticMapping.semanticPath;
        } else {
          sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext);
        }
        return sSemanticPath != sPath ? this.oRouterProxy.isCurrentStateImpactedBy(sSemanticPath) : false;
      } else {
        return false;
      }
    };
    _proto._findPathToNavigate = function _findPathToNavigate(sPath) {
      var regex = new RegExp("/[^/]*$");
      sPath = sPath.replace(regex, "");
      if (this.oRouter.match(sPath) || sPath === "") {
        return sPath;
      } else {
        return this._findPathToNavigate(sPath);
      }
    };
    _proto._checkIfContextSupportsSemanticPath = function _checkIfContextSupportsSemanticPath(oContext) {
      var sPath = oContext.getPath();

      // First, check if this is a level-1 object (path = /aaa(bbb))
      if (!/^\/[^\(]+\([^\)]+\)$/.test(sPath)) {
        return false;
      }

      // Then check if the entity has semantic keys
      var oMetaModel = oContext.getModel().getMetaModel();
      var sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name");
      if (!SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName)) {
        return false;
      }

      // Then check the entity is draft-enabled
      return ModelHelper.isDraftSupported(oMetaModel, sPath);
    };
    _proto._getPathFromContext = function _getPathFromContext(oContext, mParameters) {
      var sPath;
      if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding") && oContext.isRelative()) {
        sPath = oContext.getHeaderContext().getPath();
      } else {
        sPath = oContext.getPath();
      }
      if (mParameters.updateFCLLevel === -1) {
        // When navigating back from a context, we need to remove the last component of the path
        sPath = this._findPathToNavigate(sPath);

        // Check if we're navigating back to a semantic path that was previously resolved
        if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
          sPath = this.oLastSemanticMapping.semanticPath;
        }
      } else if (this._checkIfContextSupportsSemanticPath(oContext)) {
        // We check if we have to use a semantic path
        var sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext, true);
        if (!sSemanticPath) {
          // We were not able to build the semantic path --> Use the technical path and
          // clear the previous mapping, otherwise the old mapping is used in EditFlow#updateDocument
          // and it leads to unwanted page reloads
          this.setLastSemanticMapping(undefined);
        } else if (sSemanticPath !== sPath) {
          // Store the mapping technical <-> semantic path to avoid recalculating it later
          // and use the semantic path instead of the technical one
          this.setLastSemanticMapping({
            technicalPath: sPath,
            semanticPath: sSemanticPath
          });
          sPath = sSemanticPath;
        }
      }

      // remove extra '/' at the beginning of path
      if (sPath[0] === "/") {
        sPath = sPath.substring(1);
      }
      return sPath;
    };
    _proto._calculateLayout = function _calculateLayout(sPath, mParameters) {
      var FCLLevel = mParameters.FCLLevel;
      if (mParameters.updateFCLLevel) {
        FCLLevel += mParameters.updateFCLLevel;
        if (FCLLevel < 0) {
          FCLLevel = 0;
        }
      }
      return this.oAppComponent.getRootViewController().calculateLayout(FCLLevel, sPath, mParameters.sLayout, mParameters.keepCurrentLayout);
    }

    /**
     * Event handler before a route is matched.
     * Displays a busy indicator.
     *
     */;
    _proto._beforeRouteMatched = function _beforeRouteMatched( /*oEvent: Event*/
    ) {
      var bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (!bPlaceholderEnabled) {
        var oRootView = this.oAppComponent.getRootControl();
        BusyLocker.lock(oRootView);
      }
    }

    /**
     * Event handler when a route is matched.
     * Hides the busy indicator and fires its own 'routematched' event.
     *
     * @param oEvent The event
     */;
    _proto._onRouteMatched = function _onRouteMatched(oEvent) {
      var _this8 = this;
      var oAppStateHandler = this.oAppComponent.getAppStateHandler(),
        oRootView = this.oAppComponent.getRootControl();
      var bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (BusyLocker.isLocked(oRootView) && !bPlaceholderEnabled) {
        BusyLocker.unlock(oRootView);
      }
      var mParameters = oEvent.getParameters();
      if (this.navigationInfoQueue.length) {
        mParameters.navigationInfo = this.navigationInfoQueue[0];
        this.navigationInfoQueue = this.navigationInfoQueue.slice(1);
      } else {
        mParameters.navigationInfo = {};
      }
      if (oAppStateHandler.checkIfRouteChangedByIApp()) {
        mParameters.navigationInfo.bReasonIsIappState = true;
        oAppStateHandler.resetRouteChangedByIApp();
      }
      this.sCurrentRouteName = oEvent.getParameter("name");
      this.sCurrentRoutePattern = mParameters.config.pattern;
      this.aCurrentViews = oEvent.getParameter("views");
      mParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
      mParameters.routePattern = this.sCurrentRoutePattern;
      this._fireRouteMatchEvents(mParameters);

      // Check if current hash has been set by the routerProxy.navToHash function
      // If not, rebuild history properly (both in the browser and the RouterProxy)
      if (!history.state || history.state.feLevel === undefined) {
        this.oRouterProxy.restoreHistory().then(function () {
          _this8.oRouterProxy.resolveRouteMatch();
        }).catch(function (oError) {
          Log.error("Error while restoring history", oError);
        });
      } else {
        this.oRouterProxy.resolveRouteMatch();
      }
    };
    _proto.attachRouteMatched = function attachRouteMatched(oData, fnFunction, oListener) {
      this.eventProvider.attachEvent("routeMatched", oData, fnFunction, oListener);
    };
    _proto.detachRouteMatched = function detachRouteMatched(fnFunction, oListener) {
      this.eventProvider.detachEvent("routeMatched", fnFunction, oListener);
    };
    _proto.attachAfterRouteMatched = function attachAfterRouteMatched(oData, fnFunction, oListener) {
      this.eventProvider.attachEvent("afterRouteMatched", oData, fnFunction, oListener);
    };
    _proto.detachAfterRouteMatched = function detachAfterRouteMatched(fnFunction, oListener) {
      this.eventProvider.detachEvent("afterRouteMatched", fnFunction, oListener);
    };
    _proto.getRouteFromHash = function getRouteFromHash(oRouter, oAppComponent) {
      var sHash = oRouter.getHashChanger().hash;
      var oRouteInfo = oRouter.getRouteInfoByHash(sHash);
      return oAppComponent.getMetadata().getManifestEntry("/sap.ui5/routing/routes").filter(function (oRoute) {
        return oRoute.name === oRouteInfo.name;
      })[0];
    };
    _proto.getTargetsFromRoute = function getTargetsFromRoute(oRoute) {
      var _this9 = this;
      var oTarget = oRoute.target;
      if (typeof oTarget === "string") {
        return [this._mTargets[oTarget]];
      } else {
        var aTarget = [];
        oTarget.forEach(function (sTarget) {
          aTarget.push(_this9._mTargets[sTarget]);
        });
        return aTarget;
      }
    };
    _proto.initializeRouting = function initializeRouting() {
      try {
        var _this11 = this;
        // Attach router handlers
        return Promise.resolve(CollaborationHelper.processAndExpandHash()).then(function () {
          _this11._fnOnRouteMatched = _this11._onRouteMatched.bind(_this11);
          _this11.oRouter.attachRouteMatched(_this11._fnOnRouteMatched, _this11);
          var bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
          if (!bPlaceholderEnabled) {
            _this11.oRouter.attachBeforeRouteMatched(_this11._beforeRouteMatched.bind(_this11));
          }
          // Reset internal state
          _this11.navigationInfoQueue = [];
          EditState.resetEditState();
          _this11.bExitOnNavigateBackToRoot = !_this11.oRouter.match("");
          var bIsIappState = _this11.oRouter.getHashChanger().getHash().indexOf("sap-iapp-state") !== -1;
          var _temp3 = _catch(function () {
            return Promise.resolve(_this11.oAppComponent.getStartupParameters()).then(function (oStartupParameters) {
              var bHasStartUpParameters = oStartupParameters !== undefined && Object.keys(oStartupParameters).length !== 0;
              var sHash = _this11.oRouter.getHashChanger().getHash();
              // Manage startup parameters (in case of no iapp-state)
              var _temp2 = function () {
                if (!bIsIappState && bHasStartUpParameters && !sHash) {
                  var _temp4 = function () {
                    if (oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("CREATE") !== -1) {
                      // Create mode
                      // This check will catch multiple modes like create, createWith and autoCreateWith which all need
                      // to be handled like create startup!
                      return Promise.resolve(_this11._manageCreateStartup(oStartupParameters)).then(function () {});
                    } else {
                      // Deep link
                      return Promise.resolve(_this11._manageDeepLinkStartup(oStartupParameters)).then(function () {});
                    }
                  }();
                  if (_temp4 && _temp4.then) return _temp4.then(function () {});
                }
              }();
              if (_temp2 && _temp2.then) return _temp2.then(function () {});
            });
          }, function (oError) {
            Log.error("Error during routing initialization", oError);
          });
          if (_temp3 && _temp3.then) return _temp3.then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto.getDefaultCreateHash = function getDefaultCreateHash(oStartupParameters) {
      return AppStartupHelper.getDefaultCreateHash(oStartupParameters, this.getContextPath(), this.oRouter);
    };
    _proto._manageCreateStartup = function _manageCreateStartup(oStartupParameters) {
      var _this12 = this;
      return AppStartupHelper.getCreateStartupHash(oStartupParameters, this.getContextPath(), this.oRouter, this.oMetaModel).then(function (sNewHash) {
        if (sNewHash) {
          _this12.oRouter.getHashChanger().replaceHash(sNewHash);
          if (oStartupParameters !== null && oStartupParameters !== void 0 && oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("AUTOCREATE") !== -1) {
            _this12.oAppComponent.setStartupModeAutoCreate();
          } else {
            _this12.oAppComponent.setStartupModeCreate();
          }
          _this12.bExitOnNavigateBackToRoot = true;
        }
      });
    };
    _proto._manageDeepLinkStartup = function _manageDeepLinkStartup(oStartupParameters) {
      var _this13 = this;
      return AppStartupHelper.getDeepLinkStartupHash(this.oAppComponent.getManifest()["sap.ui5"].routing, oStartupParameters, this.oModel).then(function (oDeepLink) {
        var sHash;
        if (oDeepLink.context) {
          var sTechnicalPath = oDeepLink.context.getPath();
          var sSemanticPath = _this13._checkIfContextSupportsSemanticPath(oDeepLink.context) ? SemanticKeyHelper.getSemanticPath(oDeepLink.context) : sTechnicalPath;
          if (sSemanticPath !== sTechnicalPath) {
            // Store the mapping technical <-> semantic path to avoid recalculating it later
            // and use the semantic path instead of the technical one
            _this13.setLastSemanticMapping({
              technicalPath: sTechnicalPath,
              semanticPath: sSemanticPath
            });
          }
          sHash = sSemanticPath.substring(1); // To remove the leading '/'
        } else if (oDeepLink.hash) {
          sHash = oDeepLink.hash;
        }
        if (sHash) {
          //Replace the hash with newly created hash
          _this13.oRouter.getHashChanger().replaceHash(sHash);
          _this13.oAppComponent.setStartupModeDeeplink();
        }
      });
    };
    _proto.getOutbounds = function getOutbounds() {
      return this.outbounds;
    }

    /**
     * Gets the name of the Draft root entity set or the sticky-enabled entity set.
     *
     * @returns The name of the root EntitySet
     * @ui5-restricted
     */;
    _proto.getContextPath = function getContextPath() {
      return this.sContextPath;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return RoutingService;
  }(Service);
  _exports.RoutingService = RoutingService;
  var RoutingServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(RoutingServiceFactory, _ServiceFactory);
    function RoutingServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = RoutingServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      var oRoutingService = new RoutingService(oServiceContext);
      return oRoutingService.initPromise;
    };
    return RoutingServiceFactory;
  }(ServiceFactory);
  return RoutingServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiUm91dGluZ1NlcnZpY2VFdmVudGluZyIsImRlZmluZVVJNUNsYXNzIiwiZXZlbnQiLCJFdmVudFByb3ZpZGVyIiwiUm91dGluZ1NlcnZpY2UiLCJuYXZpZ2F0aW9uSW5mb1F1ZXVlIiwiaW5pdCIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsInNjb3BlVHlwZSIsIm9BcHBDb21wb25lbnQiLCJzY29wZU9iamVjdCIsIm9Nb2RlbCIsImdldE1vZGVsIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsIm9Sb3V0ZXIiLCJnZXRSb3V0ZXIiLCJvUm91dGVyUHJveHkiLCJnZXRSb3V0ZXJQcm94eSIsImV2ZW50UHJvdmlkZXIiLCJvUm91dGluZ0NvbmZpZyIsImdldE1hbmlmZXN0RW50cnkiLCJvUm9vdFZpZXdDb25maWciLCJfcGFyc2VSb3V0aW5nQ29uZmlndXJhdGlvbiIsIm9BcHBDb25maWciLCJvdXRib3VuZHMiLCJjcm9zc05hdmlnYXRpb24iLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiYmVmb3JlRXhpdCIsImRldGFjaFJvdXRlTWF0Y2hlZCIsIl9mbk9uUm91dGVNYXRjaGVkIiwiZmlyZUV2ZW50IiwiZXhpdCIsImRlc3Ryb3kiLCJpc0ZDTCIsInZpZXdOYW1lIiwiX21UYXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsInRhcmdldHMiLCJmb3JFYWNoIiwic1RhcmdldE5hbWUiLCJhc3NpZ24iLCJ0YXJnZXROYW1lIiwiY29udGV4dFBhdHRlcm4iLCJ1bmRlZmluZWQiLCJ2aWV3TGV2ZWwiLCJfZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4iLCJfbVJvdXRlcyIsInNSb3V0ZUtleSIsInJvdXRlcyIsIm9Sb3V0ZU1hbmlmZXN0SW5mbyIsImFSb3V0ZVRhcmdldHMiLCJBcnJheSIsImlzQXJyYXkiLCJ0YXJnZXQiLCJzUm91dGVOYW1lIiwibmFtZSIsInNSb3V0ZVBhdHRlcm4iLCJwYXR0ZXJuIiwibGVuZ3RoIiwiaW5kZXhPZiIsIkxvZyIsIndhcm5pbmciLCJpUm91dGVMZXZlbCIsInJvdXRlTGV2ZWwiLCJpIiwic1BhcmVudFRhcmdldE5hbWUiLCJwYXJlbnQiLCJwdXNoIiwiRkNMTGV2ZWwiLCJjb250cm9sQWdncmVnYXRpb24iLCJhTGV2ZWwwUm91dGVOYW1lcyIsImFMZXZlbDFSb3V0ZU5hbWVzIiwic0RlZmF1bHRSb3V0ZU5hbWUiLCJzTmFtZSIsImlMZXZlbCIsInNEZWZhdWx0VGFyZ2V0TmFtZSIsInNsaWNlIiwic0NvbnRleHRQYXRoIiwib3B0aW9ucyIsInNldHRpbmdzIiwib1NldHRpbmdzIiwiY29udGV4dFBhdGgiLCJlbnRpdHlTZXQiLCJtYXAiLCJzVGFyZ2V0S2V5Iiwic29ydCIsImEiLCJiIiwiZnVsbENvbnRleHRQYXRoIiwibmF2aWdhdGlvbiIsInNOYXZOYW1lIiwidGFyZ2V0Um91dGUiLCJkZXRhaWwiLCJyb3V0ZSIsInN0YXJ0c1dpdGgiLCJzUGF0dGVybiIsInJlcGxhY2UiLCJyZWdleCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2dldFJvdXRlSW5mb3JtYXRpb24iLCJfZ2V0VGFyZ2V0SW5mb3JtYXRpb24iLCJfZ2V0Q29tcG9uZW50SWQiLCJzT3duZXJJZCIsInNDb21wb25lbnRJZCIsInN1YnN0ciIsImdldFRhcmdldEluZm9ybWF0aW9uRm9yIiwib0NvbXBvbmVudEluc3RhbmNlIiwic1RhcmdldENvbXBvbmVudElkIiwiX3NPd25lcklkIiwiZ2V0SWQiLCJzQ29ycmVjdFRhcmdldE5hbWUiLCJpZCIsInZpZXdJZCIsImdldExhc3RTZW1hbnRpY01hcHBpbmciLCJvTGFzdFNlbWFudGljTWFwcGluZyIsInNldExhc3RTZW1hbnRpY01hcHBpbmciLCJvTWFwcGluZyIsIm5hdmlnYXRlVG8iLCJtUGFyYW1ldGVyTWFwcGluZyIsImJQcmVzZXJ2ZUhpc3RvcnkiLCJzVGFyZ2V0VVJMUHJvbWlzZSIsImJJc1N0aWNreU1vZGUiLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIlNlbWFudGljS2V5SGVscGVyIiwiZ2V0U2VtYW50aWNQYXRoIiwicHJlcGFyZVBhcmFtZXRlcnMiLCJtUGFyYW1ldGVycyIsImdldFVSTCIsInNUYXJnZXRVUkwiLCJuYXZUb0hhc2giLCJzVGFyZ2V0Um91dGUiLCJvUGFyYW1ldGVyc1Byb21pc2UiLCJnZXRQYXRoIiwiYUNvbnRleHRQYXRoUGFydHMiLCJzcGxpdCIsImFBbGxSZXNvbHZlZFBhcmFtZXRlclByb21pc2VzIiwic1BhcmFtZXRlcktleSIsInNQYXJhbWV0ZXJNYXBwaW5nRXhwcmVzc2lvbiIsIm9QYXJzZWRFeHByZXNzaW9uIiwiQmluZGluZ1BhcnNlciIsImNvbXBsZXhQYXJzZXIiLCJhUGFydHMiLCJwYXJ0cyIsImFSZXNvbHZlZFBhcmFtZXRlclByb21pc2VzIiwib1BhdGhQYXJ0IiwiYVJlbGF0aXZlUGFydHMiLCJwYXRoIiwiYUxvY2FsUGFydHMiLCJsb2NhbENvbnRleHRQYXRoIiwiam9pbiIsImxvY2FsQ29udGV4dCIsImJpbmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0Iiwib01ldGFDb250ZXh0IiwiZ2V0TWV0YUNvbnRleHQiLCJyZXF1ZXN0UHJvcGVydHkiLCJvVmFsdWUiLCJvUHJvcGVydHlJbmZvIiwiZ2V0T2JqZWN0Iiwic0VkbVR5cGUiLCIkVHlwZSIsIk9EYXRhVXRpbHMiLCJmb3JtYXRMaXRlcmFsIiwiYWxsIiwiYVJlc29sdmVkUGFyYW1ldGVycyIsInZhbHVlIiwiZm9ybWF0dGVyIiwiYXBwbHkiLCJrZXkiLCJhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJzIiwib1BhcmFtZXRlcnMiLCJvUmVzb2x2ZWRQYXJhbWV0ZXIiLCJvRXJyb3IiLCJlcnJvciIsIl9maXJlUm91dGVNYXRjaEV2ZW50cyIsIkVkaXRTdGF0ZSIsImNsZWFuUHJvY2Vzc2VkRWRpdFN0YXRlIiwibmF2aWdhdGVUb0NvbnRleHQiLCJvVmlld0RhdGEiLCJvQ3VycmVudFRhcmdldEluZm8iLCJvUm91dGVQYXJhbWV0ZXJzUHJvbWlzZSIsInRhcmdldFBhdGgiLCJvUm91dGVEZXRhaWwiLCJwYXJhbWV0ZXJzIiwic1RhcmdldFBhdGgiLCJfZ2V0UGF0aEZyb21Db250ZXh0IiwiYkV4aXRPbk5hdmlnYXRlQmFja1RvUm9vdCIsImV4aXRGcm9tQXBwIiwiYXN5bmNDb250ZXh0IiwiYkRlZmVycmVkQ29udGV4dCIsInNMYXlvdXQiLCJfY2FsY3VsYXRlTGF5b3V0Iiwib05hdmlnYXRpb25JbmZvIiwib0FzeW5jQ29udGV4dCIsImJUYXJnZXRFZGl0YWJsZSIsImVkaXRhYmxlIiwiYlBlcnNpc3RPUFNjcm9sbCIsInVzZUNvbnRleHQiLCJ1cGRhdGVGQ0xMZXZlbCIsImJSZWNyZWF0ZUNvbnRleHQiLCJiRHJhZnROYXZpZ2F0aW9uIiwiYlNob3dQbGFjZWhvbGRlciIsInNob3dQbGFjZWhvbGRlciIsImNoZWNrTm9IYXNoQ2hhbmdlIiwic0N1cnJlbnRIYXNoTm9BcHBTdGF0ZSIsImdldEhhc2giLCJtRXZlbnRQYXJhbWV0ZXJzIiwiZ2V0Um91dGVJbmZvQnlIYXNoIiwibmF2aWdhdGlvbkluZm8iLCJyb3V0ZUluZm9ybWF0aW9uIiwic0N1cnJlbnRSb3V0ZU5hbWUiLCJyb3V0ZVBhdHRlcm4iLCJzQ3VycmVudFJvdXRlUGF0dGVybiIsInZpZXdzIiwiYUN1cnJlbnRWaWV3cyIsInNldEZvY3VzRm9yY2VkIiwiYkZvcmNlRm9jdXMiLCJ0cmFuc2llbnQiLCJvUm91dGVJbmZvIiwib1JvdXRlIiwic0xhc3RUYXJnZXROYW1lIiwib1RhcmdldCIsIm1lc3NhZ2VIYW5kbGluZyIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJvUm91dGVQYXJhbWV0ZXJzIiwibmF2VG8iLCJub1ByZXNlcnZhdGlvbkNhY2hlIiwiYk5hdmlnYXRlZCIsInBvcCIsIm5hdmlnYXRlVG9Sb3V0ZSIsInNUYXJnZXRSb3V0ZU5hbWUiLCJpc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkiLCJzUGF0aCIsInRlc3QiLCJzU2VtYW50aWNQYXRoIiwidGVjaG5pY2FsUGF0aCIsInNlbWFudGljUGF0aCIsIl9maW5kUGF0aFRvTmF2aWdhdGUiLCJfY2hlY2tJZkNvbnRleHRTdXBwb3J0c1NlbWFudGljUGF0aCIsInNFbnRpdHlTZXROYW1lIiwiZ2V0U2VtYW50aWNLZXlzIiwiaXNEcmFmdFN1cHBvcnRlZCIsImlzQSIsImlzUmVsYXRpdmUiLCJnZXRIZWFkZXJDb250ZXh0Iiwic3Vic3RyaW5nIiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiY2FsY3VsYXRlTGF5b3V0Iiwia2VlcEN1cnJlbnRMYXlvdXQiLCJfYmVmb3JlUm91dGVNYXRjaGVkIiwiYlBsYWNlaG9sZGVyRW5hYmxlZCIsIlBsYWNlaG9sZGVyIiwiaXNQbGFjZWhvbGRlckVuYWJsZWQiLCJvUm9vdFZpZXciLCJnZXRSb290Q29udHJvbCIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwiX29uUm91dGVNYXRjaGVkIiwib0V2ZW50Iiwib0FwcFN0YXRlSGFuZGxlciIsImdldEFwcFN0YXRlSGFuZGxlciIsImlzTG9ja2VkIiwidW5sb2NrIiwiZ2V0UGFyYW1ldGVycyIsImNoZWNrSWZSb3V0ZUNoYW5nZWRCeUlBcHAiLCJiUmVhc29uSXNJYXBwU3RhdGUiLCJyZXNldFJvdXRlQ2hhbmdlZEJ5SUFwcCIsImdldFBhcmFtZXRlciIsImNvbmZpZyIsImhpc3RvcnkiLCJzdGF0ZSIsImZlTGV2ZWwiLCJyZXN0b3JlSGlzdG9yeSIsInJlc29sdmVSb3V0ZU1hdGNoIiwiY2F0Y2giLCJhdHRhY2hSb3V0ZU1hdGNoZWQiLCJvRGF0YSIsImZuRnVuY3Rpb24iLCJvTGlzdGVuZXIiLCJhdHRhY2hFdmVudCIsImRldGFjaEV2ZW50IiwiYXR0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQiLCJkZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsImdldFJvdXRlRnJvbUhhc2giLCJzSGFzaCIsImdldEhhc2hDaGFuZ2VyIiwiaGFzaCIsImdldE1ldGFkYXRhIiwiZmlsdGVyIiwiZ2V0VGFyZ2V0c0Zyb21Sb3V0ZSIsImFUYXJnZXQiLCJzVGFyZ2V0IiwiaW5pdGlhbGl6ZVJvdXRpbmciLCJDb2xsYWJvcmF0aW9uSGVscGVyIiwicHJvY2Vzc0FuZEV4cGFuZEhhc2giLCJiaW5kIiwiYXR0YWNoQmVmb3JlUm91dGVNYXRjaGVkIiwicmVzZXRFZGl0U3RhdGUiLCJiSXNJYXBwU3RhdGUiLCJnZXRTdGFydHVwUGFyYW1ldGVycyIsIm9TdGFydHVwUGFyYW1ldGVycyIsImJIYXNTdGFydFVwUGFyYW1ldGVycyIsInByZWZlcnJlZE1vZGUiLCJ0b1VwcGVyQ2FzZSIsIl9tYW5hZ2VDcmVhdGVTdGFydHVwIiwiX21hbmFnZURlZXBMaW5rU3RhcnR1cCIsImdldERlZmF1bHRDcmVhdGVIYXNoIiwiQXBwU3RhcnR1cEhlbHBlciIsImdldENvbnRleHRQYXRoIiwiZ2V0Q3JlYXRlU3RhcnR1cEhhc2giLCJzTmV3SGFzaCIsInJlcGxhY2VIYXNoIiwic2V0U3RhcnR1cE1vZGVBdXRvQ3JlYXRlIiwic2V0U3RhcnR1cE1vZGVDcmVhdGUiLCJnZXREZWVwTGlua1N0YXJ0dXBIYXNoIiwiZ2V0TWFuaWZlc3QiLCJyb3V0aW5nIiwib0RlZXBMaW5rIiwiY29udGV4dCIsInNUZWNobmljYWxQYXRoIiwic2V0U3RhcnR1cE1vZGVEZWVwbGluayIsImdldE91dGJvdW5kcyIsImdldEludGVyZmFjZSIsIlNlcnZpY2UiLCJSb3V0aW5nU2VydmljZUZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsIm9Sb3V0aW5nU2VydmljZSIsIlNlcnZpY2VGYWN0b3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSb3V0aW5nU2VydmljZUZhY3RvcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IFBsYWNlaG9sZGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9QbGFjZWhvbGRlclwiO1xuaW1wb3J0IHR5cGUgUm91dGVyUHJveHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvUm91dGVyUHJveHlcIjtcbmltcG9ydCBBcHBTdGFydHVwSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0FwcFN0YXJ0dXBIZWxwZXJcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBldmVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEVkaXRTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9FZGl0U3RhdGVcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNlbWFudGljS2V5SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljS2V5SGVscGVyXCI7XG5pbXBvcnQgQ29sbGFib3JhdGlvbkhlbHBlciBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uSGVscGVyXCI7XG5pbXBvcnQgQmluZGluZ1BhcnNlciBmcm9tIFwic2FwL3VpL2Jhc2UvQmluZGluZ1BhcnNlclwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgRXZlbnRQcm92aWRlciBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRQcm92aWRlclwiO1xuaW1wb3J0IHR5cGUgUm91dGVyIGZyb20gXCJzYXAvdWkvY29yZS9yb3V0aW5nL1JvdXRlclwiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCBPRGF0YVV0aWxzIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFVdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxudHlwZSBSb3V0aW5nU2VydmljZVNldHRpbmdzID0ge307XG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5Sb3V0aW5nU2VydmljZUV2ZW50aW5nXCIpXG5jbGFzcyBSb3V0aW5nU2VydmljZUV2ZW50aW5nIGV4dGVuZHMgRXZlbnRQcm92aWRlciB7XG5cdEBldmVudCgpXG5cdHJvdXRlTWF0Y2hlZCE6IEZ1bmN0aW9uO1xuXHRAZXZlbnQoKVxuXHRhZnRlclJvdXRlTWF0Y2hlZCE6IEZ1bmN0aW9uO1xufVxuXG5leHBvcnQgdHlwZSBTZW1hbnRpY01hcHBpbmcgPSB7XG5cdHNlbWFudGljUGF0aDogc3RyaW5nO1xuXHR0ZWNobmljYWxQYXRoOiBzdHJpbmc7XG59O1xuZXhwb3J0IGNsYXNzIFJvdXRpbmdTZXJ2aWNlIGV4dGVuZHMgU2VydmljZTxSb3V0aW5nU2VydmljZVNldHRpbmdzPiB7XG5cdG9BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cdG9Nb2RlbCE6IE9EYXRhTW9kZWw7XG5cdG9NZXRhTW9kZWwhOiBPRGF0YU1ldGFNb2RlbDtcblx0b1JvdXRlciE6IFJvdXRlcjtcblx0b1JvdXRlclByb3h5ITogUm91dGVyUHJveHk7XG5cdGV2ZW50UHJvdmlkZXIhOiBFdmVudFByb3ZpZGVyO1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55Pjtcblx0b3V0Ym91bmRzOiBhbnk7XG5cdF9tVGFyZ2V0czogYW55O1xuXHRfbVJvdXRlczogYW55O1xuXHRvTGFzdFNlbWFudGljTWFwcGluZz86IFNlbWFudGljTWFwcGluZztcblx0YkV4aXRPbk5hdmlnYXRlQmFja1RvUm9vdD86IGJvb2xlYW47XG5cdHNDdXJyZW50Um91dGVOYW1lPzogc3RyaW5nO1xuXHRzQ3VycmVudFJvdXRlUGF0dGVybj86IHN0cmluZztcblx0YUN1cnJlbnRWaWV3cz86IGFueVtdO1xuXHRuYXZpZ2F0aW9uSW5mb1F1ZXVlOiBhbnlbXSA9IFtdO1xuXHRzQ29udGV4dFBhdGghOiBzdHJpbmc7XG5cdF9mbk9uUm91dGVNYXRjaGVkITogRnVuY3Rpb247XG5cdGluaXQoKSB7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldENvbnRleHQoKTtcblx0XHRpZiAob0NvbnRleHQuc2NvcGVUeXBlID09PSBcImNvbXBvbmVudFwiKSB7XG5cdFx0XHR0aGlzLm9BcHBDb21wb25lbnQgPSBvQ29udGV4dC5zY29wZU9iamVjdDtcblx0XHRcdHRoaXMub01vZGVsID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbDtcblx0XHRcdHRoaXMub01ldGFNb2RlbCA9IHRoaXMub01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0dGhpcy5vUm91dGVyID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldFJvdXRlcigpO1xuXHRcdFx0dGhpcy5vUm91dGVyUHJveHkgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKTtcblx0XHRcdHRoaXMuZXZlbnRQcm92aWRlciA9IG5ldyAoUm91dGluZ1NlcnZpY2VFdmVudGluZyBhcyBhbnkpKCk7XG5cblx0XHRcdGNvbnN0IG9Sb3V0aW5nQ29uZmlnID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0RW50cnkoXCIvc2FwLnVpNS9yb3V0aW5nXCIpO1xuXHRcdFx0Y29uc3Qgb1Jvb3RWaWV3Q29uZmlnID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0RW50cnkoXCIvc2FwLnVpNS9yb290Vmlld1wiKTtcblx0XHRcdHRoaXMuX3BhcnNlUm91dGluZ0NvbmZpZ3VyYXRpb24ob1JvdXRpbmdDb25maWcsIG9Sb290Vmlld0NvbmZpZyk7XG5cblx0XHRcdGNvbnN0IG9BcHBDb25maWcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcIi9zYXAuYXBwXCIpO1xuXHRcdFx0dGhpcy5vdXRib3VuZHMgPSBvQXBwQ29uZmlnICYmIG9BcHBDb25maWcuY3Jvc3NOYXZpZ2F0aW9uICYmIG9BcHBDb25maWcuY3Jvc3NOYXZpZ2F0aW9uLm91dGJvdW5kcztcblx0XHR9XG5cblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuXHR9XG5cdGJlZm9yZUV4aXQoKSB7XG5cdFx0dGhpcy5vUm91dGVyLmRldGFjaFJvdXRlTWF0Y2hlZCh0aGlzLl9mbk9uUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuZmlyZUV2ZW50KFwicm91dGVNYXRjaGVkXCIsIHt9KTtcblx0fVxuXHRleGl0KCkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5kZXN0cm95KCk7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBtYW5pZmVzdCByb3V0aW5nIGNvbmZpZ3VyYXRpb24gZm9yIGludGVybmFsIHVzYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1JvdXRpbmdDb25maWcgVGhlIHJvdXRpbmcgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdFxuXHQgKiBAcGFyYW0gb1Jvb3RWaWV3Q29uZmlnIFRoZSByb290IHZpZXcgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3BhcnNlUm91dGluZ0NvbmZpZ3VyYXRpb24ob1JvdXRpbmdDb25maWc6IGFueSwgb1Jvb3RWaWV3Q29uZmlnOiBhbnkpIHtcblx0XHRjb25zdCBpc0ZDTCA9XG5cdFx0XHRvUm9vdFZpZXdDb25maWc/LnZpZXdOYW1lID09PSBcInNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbFwiIHx8XG5cdFx0XHRvUm9vdFZpZXdDb25maWc/LnZpZXdOYW1lID09PSBcInNhcC5mZS50ZW1wbGF0ZXMuUm9vdENvbnRhaW5lci52aWV3LkZjbFwiO1xuXG5cdFx0Ly8gSW5mb3JtYXRpb24gb2YgdGFyZ2V0c1xuXHRcdHRoaXMuX21UYXJnZXRzID0ge307XG5cdFx0T2JqZWN0LmtleXMob1JvdXRpbmdDb25maWcudGFyZ2V0cykuZm9yRWFjaCgoc1RhcmdldE5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdID0gT2JqZWN0LmFzc2lnbih7IHRhcmdldE5hbWU6IHNUYXJnZXROYW1lIH0sIG9Sb3V0aW5nQ29uZmlnLnRhcmdldHNbc1RhcmdldE5hbWVdKTtcblxuXHRcdFx0Ly8gVmlldyBsZXZlbCBmb3IgRkNMIGNhc2VzIGlzIGNhbGN1bGF0ZWQgZnJvbSB0aGUgdGFyZ2V0IHBhdHRlcm5cblx0XHRcdGlmICh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uY29udGV4dFBhdHRlcm4gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0udmlld0xldmVsID0gdGhpcy5fZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4odGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLmNvbnRleHRQYXR0ZXJuLCAwKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIEluZm9ybWF0aW9uIG9mIHJvdXRlc1xuXHRcdHRoaXMuX21Sb3V0ZXMgPSB7fTtcblx0XHRmb3IgKGNvbnN0IHNSb3V0ZUtleSBpbiBvUm91dGluZ0NvbmZpZy5yb3V0ZXMpIHtcblx0XHRcdGNvbnN0IG9Sb3V0ZU1hbmlmZXN0SW5mbyA9IG9Sb3V0aW5nQ29uZmlnLnJvdXRlc1tzUm91dGVLZXldLFxuXHRcdFx0XHRhUm91dGVUYXJnZXRzID0gQXJyYXkuaXNBcnJheShvUm91dGVNYW5pZmVzdEluZm8udGFyZ2V0KSA/IG9Sb3V0ZU1hbmlmZXN0SW5mby50YXJnZXQgOiBbb1JvdXRlTWFuaWZlc3RJbmZvLnRhcmdldF0sXG5cdFx0XHRcdHNSb3V0ZU5hbWUgPSBBcnJheS5pc0FycmF5KG9Sb3V0aW5nQ29uZmlnLnJvdXRlcykgPyBvUm91dGVNYW5pZmVzdEluZm8ubmFtZSA6IHNSb3V0ZUtleSxcblx0XHRcdFx0c1JvdXRlUGF0dGVybiA9IG9Sb3V0ZU1hbmlmZXN0SW5mby5wYXR0ZXJuO1xuXG5cdFx0XHQvLyBDaGVjayByb3V0ZSBwYXR0ZXJuOiBhbGwgcGF0dGVybnMgbmVlZCB0byBlbmQgd2l0aCAnOj9xdWVyeTonLCB0aGF0IHdlIHVzZSBmb3IgcGFyYW1ldGVyc1xuXHRcdFx0aWYgKHNSb3V0ZVBhdHRlcm4ubGVuZ3RoIDwgOCB8fCBzUm91dGVQYXR0ZXJuLmluZGV4T2YoXCI6P3F1ZXJ5OlwiKSAhPT0gc1JvdXRlUGF0dGVybi5sZW5ndGggLSA4KSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKGBQYXR0ZXJuIGZvciByb3V0ZSAke3NSb3V0ZU5hbWV9IGRvZXNuJ3QgZW5kIHdpdGggJzo/cXVlcnk6JyA6ICR7c1JvdXRlUGF0dGVybn1gKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGlSb3V0ZUxldmVsID0gdGhpcy5fZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4oc1JvdXRlUGF0dGVybiwgMCk7XG5cdFx0XHR0aGlzLl9tUm91dGVzW3NSb3V0ZU5hbWVdID0ge1xuXHRcdFx0XHRuYW1lOiBzUm91dGVOYW1lLFxuXHRcdFx0XHRwYXR0ZXJuOiBzUm91dGVQYXR0ZXJuLFxuXHRcdFx0XHR0YXJnZXRzOiBhUm91dGVUYXJnZXRzLFxuXHRcdFx0XHRyb3V0ZUxldmVsOiBpUm91dGVMZXZlbFxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gQWRkIHRoZSBwYXJlbnQgdGFyZ2V0cyBpbiB0aGUgbGlzdCBvZiB0YXJnZXRzIGZvciB0aGUgcm91dGVcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVJvdXRlVGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBzUGFyZW50VGFyZ2V0TmFtZSA9IHRoaXMuX21UYXJnZXRzW2FSb3V0ZVRhcmdldHNbaV1dLnBhcmVudDtcblx0XHRcdFx0aWYgKHNQYXJlbnRUYXJnZXROYW1lKSB7XG5cdFx0XHRcdFx0YVJvdXRlVGFyZ2V0cy5wdXNoKHNQYXJlbnRUYXJnZXROYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWlzRkNMKSB7XG5cdFx0XHRcdC8vIFZpZXcgbGV2ZWwgZm9yIG5vbi1GQ0wgY2FzZXMgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSByb3V0ZSBwYXR0ZXJuXG5cdFx0XHRcdGlmICh0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS52aWV3TGV2ZWwgPT09IHVuZGVmaW5lZCB8fCB0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS52aWV3TGV2ZWwgPCBpUm91dGVMZXZlbCkge1xuXHRcdFx0XHRcdC8vIFRoZXJlIGFyZSBjYXNlcyB3aGVuIGRpZmZlcmVudCByb3V0ZXMgcG9pbnQgdG8gdGhlIHNhbWUgdGFyZ2V0LiBXZSB0YWtlIHRoZVxuXHRcdFx0XHRcdC8vIGxhcmdlc3Qgdmlld0xldmVsIGluIHRoYXQgY2FzZS5cblx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS52aWV3TGV2ZWwgPSBpUm91dGVMZXZlbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEZDTCBsZXZlbCBmb3Igbm9uLUZDTCBjYXNlcyBpcyBlcXVhbCB0byAtMVxuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS5GQ0xMZXZlbCA9IC0xO1xuXHRcdFx0fSBlbHNlIGlmIChhUm91dGVUYXJnZXRzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS5jb250cm9sQWdncmVnYXRpb24gIT09IFwiYmVnaW5Db2x1bW5QYWdlc1wiKSB7XG5cdFx0XHRcdC8vIFdlJ3JlIGluIHRoZSBjYXNlIHdoZXJlIHRoZXJlJ3Mgb25seSAxIHRhcmdldCBmb3IgdGhlIHJvdXRlLCBhbmQgaXQncyBub3QgaW4gdGhlIGZpcnN0IGNvbHVtblxuXHRcdFx0XHQvLyAtLT4gdGhpcyBpcyBhIGZ1bGxzY3JlZW4gY29sdW1uIGFmdGVyIGFsbCBjb2x1bW5zIGluIHRoZSBGQ0wgaGF2ZSBiZWVuIHVzZWRcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbYVJvdXRlVGFyZ2V0c1swXV0uRkNMTGV2ZWwgPSAzO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gT3RoZXIgRkNMIGNhc2VzXG5cdFx0XHRcdGFSb3V0ZVRhcmdldHMuZm9yRWFjaCgoc1RhcmdldE5hbWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLmNvbnRyb2xBZ2dyZWdhdGlvbikge1xuXHRcdFx0XHRcdFx0Y2FzZSBcImJlZ2luQ29sdW1uUGFnZXNcIjpcblx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLkZDTExldmVsID0gMDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdGNhc2UgXCJtaWRDb2x1bW5QYWdlc1wiOlxuXHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uRkNMTGV2ZWwgPSAxO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLkZDTExldmVsID0gMjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFByb3BhZ2F0ZSB2aWV3TGV2ZWwsIGNvbnRleHRQYXR0ZXJuLCBGQ0xMZXZlbCBhbmQgY29udHJvbEFnZ3JlZ2F0aW9uIHRvIHBhcmVudCB0YXJnZXRzXG5cdFx0T2JqZWN0LmtleXModGhpcy5fbVRhcmdldHMpLmZvckVhY2goKHNUYXJnZXROYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdHdoaWxlICh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ucGFyZW50KSB7XG5cdFx0XHRcdGNvbnN0IHNQYXJlbnRUYXJnZXROYW1lID0gdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLnBhcmVudDtcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLnZpZXdMZXZlbCA9XG5cdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLnZpZXdMZXZlbCB8fCB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0udmlld0xldmVsO1xuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0uY29udGV4dFBhdHRlcm4gPVxuXHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS5jb250ZXh0UGF0dGVybiB8fCB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uY29udGV4dFBhdHRlcm47XG5cdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS5GQ0xMZXZlbCA9XG5cdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLkZDTExldmVsIHx8IHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5GQ0xMZXZlbDtcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLmNvbnRyb2xBZ2dyZWdhdGlvbiA9XG5cdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLmNvbnRyb2xBZ2dyZWdhdGlvbiB8fCB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uY29udHJvbEFnZ3JlZ2F0aW9uO1xuXHRcdFx0XHRzVGFyZ2V0TmFtZSA9IHNQYXJlbnRUYXJnZXROYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gRGV0ZXJtaW5lIHRoZSByb290IGVudGl0eSBmb3IgdGhlIGFwcFxuXHRcdGNvbnN0IGFMZXZlbDBSb3V0ZU5hbWVzID0gW107XG5cdFx0Y29uc3QgYUxldmVsMVJvdXRlTmFtZXMgPSBbXTtcblx0XHRsZXQgc0RlZmF1bHRSb3V0ZU5hbWU7XG5cblx0XHRmb3IgKGNvbnN0IHNOYW1lIGluIHRoaXMuX21Sb3V0ZXMpIHtcblx0XHRcdGNvbnN0IGlMZXZlbCA9IHRoaXMuX21Sb3V0ZXNbc05hbWVdLnJvdXRlTGV2ZWw7XG5cdFx0XHRpZiAoaUxldmVsID09PSAwKSB7XG5cdFx0XHRcdGFMZXZlbDBSb3V0ZU5hbWVzLnB1c2goc05hbWUpO1xuXHRcdFx0fSBlbHNlIGlmIChpTGV2ZWwgPT09IDEpIHtcblx0XHRcdFx0YUxldmVsMVJvdXRlTmFtZXMucHVzaChzTmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGFMZXZlbDBSb3V0ZU5hbWVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0c0RlZmF1bHRSb3V0ZU5hbWUgPSBhTGV2ZWwwUm91dGVOYW1lc1swXTtcblx0XHR9IGVsc2UgaWYgKGFMZXZlbDFSb3V0ZU5hbWVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0c0RlZmF1bHRSb3V0ZU5hbWUgPSBhTGV2ZWwxUm91dGVOYW1lc1swXTtcblx0XHR9XG5cblx0XHRpZiAoc0RlZmF1bHRSb3V0ZU5hbWUpIHtcblx0XHRcdGNvbnN0IHNEZWZhdWx0VGFyZ2V0TmFtZSA9IHRoaXMuX21Sb3V0ZXNbc0RlZmF1bHRSb3V0ZU5hbWVdLnRhcmdldHMuc2xpY2UoLTEpWzBdO1xuXHRcdFx0dGhpcy5zQ29udGV4dFBhdGggPSBcIlwiO1xuXHRcdFx0aWYgKHRoaXMuX21UYXJnZXRzW3NEZWZhdWx0VGFyZ2V0TmFtZV0ub3B0aW9ucyAmJiB0aGlzLl9tVGFyZ2V0c1tzRGVmYXVsdFRhcmdldE5hbWVdLm9wdGlvbnMuc2V0dGluZ3MpIHtcblx0XHRcdFx0Y29uc3Qgb1NldHRpbmdzID0gdGhpcy5fbVRhcmdldHNbc0RlZmF1bHRUYXJnZXROYW1lXS5vcHRpb25zLnNldHRpbmdzO1xuXHRcdFx0XHR0aGlzLnNDb250ZXh0UGF0aCA9IG9TZXR0aW5ncy5jb250ZXh0UGF0aCB8fCBgLyR7b1NldHRpbmdzLmVudGl0eVNldH1gO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0aGlzLnNDb250ZXh0UGF0aCkge1xuXHRcdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XHRgQ2Fubm90IGRldGVybWluZSBkZWZhdWx0IGNvbnRleHRQYXRoOiBjb250ZXh0UGF0aCBvciBlbnRpdHlTZXQgbWlzc2luZyBpbiBkZWZhdWx0IHRhcmdldDogJHtzRGVmYXVsdFRhcmdldE5hbWV9YFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cud2FybmluZyhcIkNhbm5vdCBkZXRlcm1pbmUgZGVmYXVsdCBjb250ZXh0UGF0aDogbm8gZGVmYXVsdCByb3V0ZSBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0Ly8gV2UgbmVlZCB0byBlc3RhYmxpc2ggdGhlIGNvcnJlY3QgcGF0aCB0byB0aGUgZGlmZmVyZW50IHBhZ2VzLCBpbmNsdWRpbmcgdGhlIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuX21UYXJnZXRzKVxuXHRcdFx0Lm1hcCgoc1RhcmdldEtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0S2V5XTtcblx0XHRcdH0pXG5cdFx0XHQuc29ydCgoYTogYW55LCBiOiBhbnkpID0+IHtcblx0XHRcdFx0cmV0dXJuIGEudmlld0xldmVsIDwgYi52aWV3TGV2ZWwgPyAtMSA6IDE7XG5cdFx0XHR9KVxuXHRcdFx0LmZvckVhY2goKHRhcmdldDogYW55KSA9PiB7XG5cdFx0XHRcdC8vIEFmdGVyIHNvcnRpbmcgdGhlIHRhcmdldHMgcGVyIGxldmVsIHdlIGNhbiB0aGVuIGdvIHRocm91Z2ggdGhlaXIgbmF2aWdhdGlvbiBvYmplY3QgYW5kIHVwZGF0ZSB0aGUgcGF0aHMgYWNjb3JkaW5nbHkuXG5cdFx0XHRcdGlmICh0YXJnZXQub3B0aW9ucykge1xuXHRcdFx0XHRcdGNvbnN0IHNldHRpbmdzID0gdGFyZ2V0Lm9wdGlvbnMuc2V0dGluZ3M7XG5cdFx0XHRcdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gc2V0dGluZ3MuY29udGV4dFBhdGggfHwgKHNldHRpbmdzLmVudGl0eVNldCA/IGAvJHtzZXR0aW5ncy5lbnRpdHlTZXR9YCA6IFwiXCIpO1xuXHRcdFx0XHRcdGlmICghc2V0dGluZ3MuZnVsbENvbnRleHRQYXRoICYmIHNDb250ZXh0UGF0aCkge1xuXHRcdFx0XHRcdFx0c2V0dGluZ3MuZnVsbENvbnRleHRQYXRoID0gYCR7c0NvbnRleHRQYXRofS9gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRPYmplY3Qua2V5cyhzZXR0aW5ncy5uYXZpZ2F0aW9uIHx8IHt9KS5mb3JFYWNoKChzTmF2TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eVxuXHRcdFx0XHRcdFx0Y29uc3QgdGFyZ2V0Um91dGUgPSB0aGlzLl9tUm91dGVzW3NldHRpbmdzLm5hdmlnYXRpb25bc05hdk5hbWVdLmRldGFpbC5yb3V0ZV07XG5cdFx0XHRcdFx0XHRpZiAodGFyZ2V0Um91dGUgJiYgdGFyZ2V0Um91dGUudGFyZ2V0cykge1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRSb3V0ZS50YXJnZXRzLmZvckVhY2goKHNUYXJnZXROYW1lOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ub3B0aW9ucyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLm9wdGlvbnMuc2V0dGluZ3MgJiZcblx0XHRcdFx0XHRcdFx0XHRcdCF0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ub3B0aW9ucy5zZXR0aW5ncy5mdWxsQ29udGV4dFBhdGhcblx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0YXJnZXQudmlld0xldmVsID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5vcHRpb25zLnNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aCA9IGAke1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdChzTmF2TmFtZS5zdGFydHNXaXRoKFwiL1wiKSA/IFwiXCIgOiBcIi9cIikgKyBzTmF2TmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9L2A7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ub3B0aW9ucy5zZXR0aW5ncy5mdWxsQ29udGV4dFBhdGggPSBgJHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzZXR0aW5ncy5mdWxsQ29udGV4dFBhdGggKyBzTmF2TmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9L2A7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyBhIHZpZXcgbGV2ZWwgZnJvbSBhIHBhdHRlcm4gYnkgY291bnRpbmcgdGhlIG51bWJlciBvZiBzZWdtZW50cy5cblx0ICpcblx0ICogQHBhcmFtIHNQYXR0ZXJuIFRoZSBwYXR0ZXJuXG5cdCAqIEBwYXJhbSB2aWV3TGV2ZWwgVGhlIGN1cnJlbnQgbGV2ZWwgb2Ygdmlld1xuXHQgKiBAcmV0dXJucyBUaGUgbGV2ZWxcblx0ICovXG5cdF9nZXRWaWV3TGV2ZWxGcm9tUGF0dGVybihzUGF0dGVybjogc3RyaW5nLCB2aWV3TGV2ZWw6IG51bWJlcik6IG51bWJlciB7XG5cdFx0c1BhdHRlcm4gPSBzUGF0dGVybi5yZXBsYWNlKFwiOj9xdWVyeTpcIiwgXCJcIik7XG5cdFx0Y29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKFwiL1teL10qJFwiKTtcblx0XHRpZiAoc1BhdHRlcm4gJiYgc1BhdHRlcm5bMF0gIT09IFwiL1wiICYmIHNQYXR0ZXJuWzBdICE9PSBcIj9cIikge1xuXHRcdFx0c1BhdHRlcm4gPSBgLyR7c1BhdHRlcm59YDtcblx0XHR9XG5cdFx0aWYgKHNQYXR0ZXJuLmxlbmd0aCkge1xuXHRcdFx0c1BhdHRlcm4gPSBzUGF0dGVybi5yZXBsYWNlKHJlZ2V4LCBcIlwiKTtcblx0XHRcdGlmICh0aGlzLm9Sb3V0ZXIubWF0Y2goc1BhdHRlcm4pIHx8IHNQYXR0ZXJuID09PSBcIlwiKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9nZXRWaWV3TGV2ZWxGcm9tUGF0dGVybihzUGF0dGVybiwgKyt2aWV3TGV2ZWwpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldFZpZXdMZXZlbEZyb21QYXR0ZXJuKHNQYXR0ZXJuLCB2aWV3TGV2ZWwpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdmlld0xldmVsO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRSb3V0ZUluZm9ybWF0aW9uKHNSb3V0ZU5hbWU6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9tUm91dGVzW3NSb3V0ZU5hbWVdO1xuXHR9XG5cblx0X2dldFRhcmdldEluZm9ybWF0aW9uKHNUYXJnZXROYW1lOiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdO1xuXHR9XG5cblx0X2dldENvbXBvbmVudElkKHNPd25lcklkOiBhbnksIHNDb21wb25lbnRJZDogYW55KSB7XG5cdFx0aWYgKHNDb21wb25lbnRJZC5pbmRleE9mKGAke3NPd25lcklkfS0tLWApID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gc0NvbXBvbmVudElkLnN1YnN0cihzT3duZXJJZC5sZW5ndGggKyAzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHNDb21wb25lbnRJZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGFyZ2V0IGluZm9ybWF0aW9uIGZvciBhIGdpdmVuIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHBhcmFtIG9Db21wb25lbnRJbnN0YW5jZSBJbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50XG5cdCAqIEByZXR1cm5zIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgdGFyZ2V0XG5cdCAqL1xuXHRnZXRUYXJnZXRJbmZvcm1hdGlvbkZvcihvQ29tcG9uZW50SW5zdGFuY2U6IGFueSkge1xuXHRcdGNvbnN0IHNUYXJnZXRDb21wb25lbnRJZCA9IHRoaXMuX2dldENvbXBvbmVudElkKG9Db21wb25lbnRJbnN0YW5jZS5fc093bmVySWQsIG9Db21wb25lbnRJbnN0YW5jZS5nZXRJZCgpKTtcblx0XHRsZXQgc0NvcnJlY3RUYXJnZXROYW1lID0gbnVsbDtcblx0XHRPYmplY3Qua2V5cyh0aGlzLl9tVGFyZ2V0cykuZm9yRWFjaCgoc1RhcmdldE5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5pZCA9PT0gc1RhcmdldENvbXBvbmVudElkIHx8IHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS52aWV3SWQgPT09IHNUYXJnZXRDb21wb25lbnRJZCkge1xuXHRcdFx0XHRzQ29ycmVjdFRhcmdldE5hbWUgPSBzVGFyZ2V0TmFtZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0VGFyZ2V0SW5mb3JtYXRpb24oc0NvcnJlY3RUYXJnZXROYW1lKTtcblx0fVxuXG5cdGdldExhc3RTZW1hbnRpY01hcHBpbmcoKTogU2VtYW50aWNNYXBwaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZztcblx0fVxuXG5cdHNldExhc3RTZW1hbnRpY01hcHBpbmcob01hcHBpbmc/OiBTZW1hbnRpY01hcHBpbmcpIHtcblx0XHR0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nID0gb01hcHBpbmc7XG5cdH1cblxuXHRuYXZpZ2F0ZVRvKG9Db250ZXh0OiBhbnksIHNSb3V0ZU5hbWU6IGFueSwgbVBhcmFtZXRlck1hcHBpbmc6IGFueSwgYlByZXNlcnZlSGlzdG9yeTogYW55KSB7XG5cdFx0bGV0IHNUYXJnZXRVUkxQcm9taXNlLCBiSXNTdGlja3lNb2RlOiBib29sZWFuO1xuXHRcdGlmIChvQ29udGV4dC5nZXRNb2RlbCgpICYmIG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsICYmIG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkpIHtcblx0XHRcdGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0fVxuXHRcdGlmICghbVBhcmFtZXRlck1hcHBpbmcpIHtcblx0XHRcdC8vIGlmIHRoZXJlIGlzIG5vIHBhcmFtZXRlciBtYXBwaW5nIGRlZmluZSB0aGlzIG1lYW4gd2UgcmVseSBlbnRpcmVseSBvbiB0aGUgYmluZGluZyBjb250ZXh0IHBhdGhcblx0XHRcdHNUYXJnZXRVUkxQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljUGF0aChvQ29udGV4dCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzVGFyZ2V0VVJMUHJvbWlzZSA9IHRoaXMucHJlcGFyZVBhcmFtZXRlcnMobVBhcmFtZXRlck1hcHBpbmcsIHNSb3V0ZU5hbWUsIG9Db250ZXh0KS50aGVuKChtUGFyYW1ldGVyczogYW55KSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm9Sb3V0ZXIuZ2V0VVJMKHNSb3V0ZU5hbWUsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gc1RhcmdldFVSTFByb21pc2UudGhlbigoc1RhcmdldFVSTDogYW55KSA9PiB7XG5cdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eS5uYXZUb0hhc2goc1RhcmdldFVSTCwgYlByZXNlcnZlSGlzdG9yeSwgZmFsc2UsIGZhbHNlLCAhYklzU3RpY2t5TW9kZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHJldHVybiBhIG1hcCBvZiByb3V0aW5nIHRhcmdldCBwYXJhbWV0ZXJzIHdoZXJlIHRoZSBiaW5kaW5nIHN5bnRheCBpcyByZXNvbHZlZCB0byB0aGUgY3VycmVudCBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFBhcmFtZXRlcnMgbWFwIGluIHRoZSBmb3JtYXQgW2s6IHN0cmluZ10gOiBDb21wbGV4QmluZGluZ1N5bnRheFxuXHQgKiBAcGFyYW0gc1RhcmdldFJvdXRlIE5hbWUgb2YgdGhlIHRhcmdldCByb3V0ZVxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBiaW5kaW5nIGNvbnRleHRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIHRoZSByb3V0aW5nIHRhcmdldCBwYXJhbWV0ZXJzXG5cdCAqL1xuXHRwcmVwYXJlUGFyYW1ldGVycyhtUGFyYW1ldGVyczogYW55LCBzVGFyZ2V0Um91dGU6IHN0cmluZywgb0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHRsZXQgb1BhcmFtZXRlcnNQcm9taXNlO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0XHRjb25zdCBhQ29udGV4dFBhdGhQYXJ0cyA9IHNDb250ZXh0UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRjb25zdCBhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyA9IE9iamVjdC5rZXlzKG1QYXJhbWV0ZXJzKS5tYXAoKHNQYXJhbWV0ZXJLZXk6IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBzUGFyYW1ldGVyTWFwcGluZ0V4cHJlc3Npb24gPSBtUGFyYW1ldGVyc1tzUGFyYW1ldGVyS2V5XTtcblx0XHRcdFx0Ly8gV2UgYXNzdW1lIHRoZSBkZWZpbmVkIHBhcmFtZXRlcnMgd2lsbCBiZSBjb21wYXRpYmxlIHdpdGggYSBiaW5kaW5nIGV4cHJlc3Npb25cblx0XHRcdFx0Y29uc3Qgb1BhcnNlZEV4cHJlc3Npb24gPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoc1BhcmFtZXRlck1hcHBpbmdFeHByZXNzaW9uKTtcblx0XHRcdFx0Y29uc3QgYVBhcnRzID0gb1BhcnNlZEV4cHJlc3Npb24ucGFydHMgfHwgW29QYXJzZWRFeHByZXNzaW9uXTtcblx0XHRcdFx0Y29uc3QgYVJlc29sdmVkUGFyYW1ldGVyUHJvbWlzZXMgPSBhUGFydHMubWFwKGZ1bmN0aW9uIChvUGF0aFBhcnQ6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IGFSZWxhdGl2ZVBhcnRzID0gb1BhdGhQYXJ0LnBhdGguc3BsaXQoXCIuLi9cIik7XG5cdFx0XHRcdFx0Ly8gV2UgZ28gdXAgdGhlIGN1cnJlbnQgY29udGV4dCBwYXRoIGFzIG1hbnkgdGltZXMgYXMgbmVjZXNzYXJ5XG5cdFx0XHRcdFx0Y29uc3QgYUxvY2FsUGFydHMgPSBhQ29udGV4dFBhdGhQYXJ0cy5zbGljZSgwLCBhQ29udGV4dFBhdGhQYXJ0cy5sZW5ndGggLSBhUmVsYXRpdmVQYXJ0cy5sZW5ndGggKyAxKTtcblx0XHRcdFx0XHRjb25zdCBsb2NhbENvbnRleHRQYXRoID0gYUxvY2FsUGFydHMuam9pbihcIi9cIik7XG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxDb250ZXh0ID1cblx0XHRcdFx0XHRcdGxvY2FsQ29udGV4dFBhdGggPT09IG9Db250ZXh0LmdldFBhdGgoKVxuXHRcdFx0XHRcdFx0XHQ/IG9Db250ZXh0XG5cdFx0XHRcdFx0XHRcdDogKG9Db250ZXh0LmdldE1vZGVsKCkuYmluZENvbnRleHQobG9jYWxDb250ZXh0UGF0aCkuZ2V0Qm91bmRDb250ZXh0KCkgYXMgQ29udGV4dCk7XG5cblx0XHRcdFx0XHRjb25zdCBvTWV0YUNvbnRleHQgPSBvTWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KGxvY2FsQ29udGV4dFBhdGggKyBcIi9cIiArIGFSZWxhdGl2ZVBhcnRzW2FSZWxhdGl2ZVBhcnRzLmxlbmd0aCAtIDFdKTtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxDb250ZXh0LnJlcXVlc3RQcm9wZXJ0eShhUmVsYXRpdmVQYXJ0c1thUmVsYXRpdmVQYXJ0cy5sZW5ndGggLSAxXSkudGhlbihmdW5jdGlvbiAob1ZhbHVlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvUHJvcGVydHlJbmZvID0gb01ldGFDb250ZXh0LmdldE9iamVjdCgpIGFzIGFueTsgLy8gUmV0dXJucyBhbnkgaW4gbWFzdGVyIGZvciBzb21lIHJlYXNvblxuXHRcdFx0XHRcdFx0Y29uc3Qgc0VkbVR5cGUgPSBvUHJvcGVydHlJbmZvLiRUeXBlO1xuXHRcdFx0XHRcdFx0cmV0dXJuIE9EYXRhVXRpbHMuZm9ybWF0TGl0ZXJhbChvVmFsdWUsIHNFZG1UeXBlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKGFSZXNvbHZlZFBhcmFtZXRlclByb21pc2VzKS50aGVuKChhUmVzb2x2ZWRQYXJhbWV0ZXJzOiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IG9QYXJzZWRFeHByZXNzaW9uLmZvcm1hdHRlclxuXHRcdFx0XHRcdFx0PyBvUGFyc2VkRXhwcmVzc2lvbi5mb3JtYXR0ZXIuYXBwbHkodGhpcywgYVJlc29sdmVkUGFyYW1ldGVycylcblx0XHRcdFx0XHRcdDogYVJlc29sdmVkUGFyYW1ldGVycy5qb2luKFwiXCIpO1xuXHRcdFx0XHRcdHJldHVybiB7IGtleTogc1BhcmFtZXRlcktleSwgdmFsdWU6IHZhbHVlIH07XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdG9QYXJhbWV0ZXJzUHJvbWlzZSA9IFByb21pc2UuYWxsKGFBbGxSZXNvbHZlZFBhcmFtZXRlclByb21pc2VzKS50aGVuKGZ1bmN0aW9uIChcblx0XHRcdFx0YUFsbFJlc29sdmVkUGFyYW1ldGVyczogeyBrZXk6IGFueTsgdmFsdWU6IGFueSB9W11cblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBvUGFyYW1ldGVyczogYW55ID0ge307XG5cdFx0XHRcdGFBbGxSZXNvbHZlZFBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1Jlc29sdmVkUGFyYW1ldGVyOiB7IGtleTogYW55OyB2YWx1ZTogYW55IH0pIHtcblx0XHRcdFx0XHRvUGFyYW1ldGVyc1tvUmVzb2x2ZWRQYXJhbWV0ZXIua2V5XSA9IG9SZXNvbHZlZFBhcmFtZXRlci52YWx1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBvUGFyYW1ldGVycztcblx0XHRcdH0pO1xuXHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0TG9nLmVycm9yKGBDb3VsZCBub3QgcGFyc2UgdGhlIHBhcmFtZXRlcnMgZm9yIHRoZSBuYXZpZ2F0aW9uIHRvIHJvdXRlICR7c1RhcmdldFJvdXRlfWApO1xuXHRcdFx0b1BhcmFtZXRlcnNQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cdFx0fVxuXHRcdHJldHVybiBvUGFyYW1ldGVyc1Byb21pc2U7XG5cdH1cblxuXHRfZmlyZVJvdXRlTWF0Y2hFdmVudHMobVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5maXJlRXZlbnQoXCJyb3V0ZU1hdGNoZWRcIiwgbVBhcmFtZXRlcnMpO1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5maXJlRXZlbnQoXCJhZnRlclJvdXRlTWF0Y2hlZFwiLCBtUGFyYW1ldGVycyk7XG5cblx0XHRFZGl0U3RhdGUuY2xlYW5Qcm9jZXNzZWRFZGl0U3RhdGUoKTsgLy8gUmVzZXQgVUkgc3RhdGUgd2hlbiBhbGwgYmluZGluZ3MgaGF2ZSBiZWVuIHJlZnJlc2hlZFxuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgQ29udGV4dCB0byBiZSBuYXZpZ2F0ZWQgdG9cblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwsIG1hcCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5jaGVja05vSGFzaENoYW5nZV0gTmF2aWdhdGUgdG8gdGhlIGNvbnRleHQgd2l0aG91dCBjaGFuZ2luZyB0aGUgVVJMXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYXN5bmNDb250ZXh0XSBUaGUgY29udGV4dCBpcyBjcmVhdGVkIGFzeW5jLCBuYXZpZ2F0ZSB0byAoLi4uKSBhbmRcblx0ICogICAgICAgICAgICAgICAgICAgIHdhaXQgZm9yIFByb21pc2UgdG8gYmUgcmVzb2x2ZWQgYW5kIHRoZW4gbmF2aWdhdGUgaW50byB0aGUgY29udGV4dFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJEZWZlcnJlZENvbnRleHRdIFRoZSBjb250ZXh0IHNoYWxsIGJlIGNyZWF0ZWQgZGVmZXJyZWQgYXQgdGhlIHRhcmdldCBwYWdlXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZWRpdGFibGVdIFRoZSB0YXJnZXQgcGFnZSBzaGFsbCBiZSBpbW1lZGlhdGVseSBpbiB0aGUgZWRpdCBtb2RlIHRvIGF2b2lkIGZsaWNrZXJpbmdcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iUGVyc2lzdE9QU2Nyb2xsXSBUaGUgYlBlcnNpc3RPUFNjcm9sbCB3aWxsIGJlIHVzZWQgZm9yIHNjcm9sbGluZyB0byBmaXJzdCB0YWJcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbF0gYCsxYCBpZiB3ZSBhZGQgYSBjb2x1bW4gaW4gRkNMLCBgLTFgIHRvIHJlbW92ZSBhIGNvbHVtbiwgMCB0byBzdGF5IG9uIHRoZSBzYW1lIGNvbHVtblxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm5vUHJlc2VydmF0aW9uQ2FjaGVdIERvIG5hdmlnYXRpb24gd2l0aG91dCB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBwcmVzZXJ2ZWQgY2FjaGUgbWVjaGFuaXNtXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYlJlY3JlYXRlQ29udGV4dF0gRm9yY2UgcmUtY3JlYXRpb24gb2YgdGhlIGNvbnRleHQgaW5zdGVhZCBvZiB1c2luZyB0aGUgb25lIHBhc3NlZCBhcyBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iRm9yY2VGb2N1c10gRm9yY2VzIGZvY3VzIHNlbGVjdGlvbiBhZnRlciBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBbb1ZpZXdEYXRhXSBWaWV3IGRhdGFcblx0ICogQHBhcmFtIFtvQ3VycmVudFRhcmdldEluZm9dIFRoZSB0YXJnZXQgaW5mb3JtYXRpb24gZnJvbSB3aGljaCB0aGUgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWRcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRuYXZpZ2F0ZVRvQ29udGV4dChcblx0XHRvQ29udGV4dDogYW55LFxuXHRcdG1QYXJhbWV0ZXJzOlxuXHRcdFx0fCB7XG5cdFx0XHRcdFx0Y2hlY2tOb0hhc2hDaGFuZ2U/OiBib29sZWFuO1xuXHRcdFx0XHRcdGFzeW5jQ29udGV4dD86IFByb21pc2U8YW55Pjtcblx0XHRcdFx0XHRiRGVmZXJyZWRDb250ZXh0PzogYm9vbGVhbjtcblx0XHRcdFx0XHRlZGl0YWJsZT86IGJvb2xlYW47XG5cdFx0XHRcdFx0dHJhbnNpZW50PzogYm9vbGVhbjtcblx0XHRcdFx0XHRiUGVyc2lzdE9QU2Nyb2xsPzogYm9vbGVhbjtcblx0XHRcdFx0XHR1cGRhdGVGQ0xMZXZlbD86IG51bWJlcjtcblx0XHRcdFx0XHRub1ByZXNlcnZhdGlvbkNhY2hlPzogYm9vbGVhbjtcblx0XHRcdFx0XHRiUmVjcmVhdGVDb250ZXh0PzogYm9vbGVhbjtcblx0XHRcdFx0XHRiRm9yY2VGb2N1cz86IGJvb2xlYW47XG5cdFx0XHRcdFx0dGFyZ2V0UGF0aD86IHN0cmluZztcblx0XHRcdFx0XHRzaG93UGxhY2Vob2xkZXI/OiBib29sZWFuO1xuXHRcdFx0XHRcdGJEcmFmdE5hdmlnYXRpb24/OiBib29sZWFuO1xuXHRcdFx0ICB9XG5cdFx0XHR8IHVuZGVmaW5lZCxcblx0XHRvVmlld0RhdGE6IGFueSB8IHVuZGVmaW5lZCxcblx0XHRvQ3VycmVudFRhcmdldEluZm86IGFueSB8IHVuZGVmaW5lZFxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRsZXQgc1RhcmdldFJvdXRlOiBzdHJpbmcgPSBcIlwiLFxuXHRcdFx0b1JvdXRlUGFyYW1ldGVyc1Byb21pc2UsXG5cdFx0XHRiSXNTdGlja3lNb2RlOiBib29sZWFuID0gZmFsc2U7XG5cblx0XHRpZiAob0NvbnRleHQuZ2V0TW9kZWwoKSAmJiBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCkge1xuXHRcdFx0YklzU3RpY2t5TW9kZSA9IE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpKTtcblx0XHR9XG5cdFx0Ly8gTWFuYWdlIHBhcmFtZXRlciBtYXBwaW5nXG5cdFx0aWYgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLnRhcmdldFBhdGggJiYgb1ZpZXdEYXRhICYmIG9WaWV3RGF0YS5uYXZpZ2F0aW9uKSB7XG5cdFx0XHRjb25zdCBvUm91dGVEZXRhaWwgPSBvVmlld0RhdGEubmF2aWdhdGlvblttUGFyYW1ldGVycy50YXJnZXRQYXRoXS5kZXRhaWw7XG5cdFx0XHRzVGFyZ2V0Um91dGUgPSBvUm91dGVEZXRhaWwucm91dGU7XG5cblx0XHRcdGlmIChvUm91dGVEZXRhaWwucGFyYW1ldGVycykge1xuXHRcdFx0XHRvUm91dGVQYXJhbWV0ZXJzUHJvbWlzZSA9IHRoaXMucHJlcGFyZVBhcmFtZXRlcnMob1JvdXRlRGV0YWlsLnBhcmFtZXRlcnMsIHNUYXJnZXRSb3V0ZSwgb0NvbnRleHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBzVGFyZ2V0UGF0aCA9IHRoaXMuX2dldFBhdGhGcm9tQ29udGV4dChvQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHRcdC8vIElmIHRoZSBwYXRoIGlzIGVtcHR5LCB3ZSdyZSBzdXBwb3NlZCB0byBuYXZpZ2F0ZSB0byB0aGUgZmlyc3QgcGFnZSBvZiB0aGUgYXBwXG5cdFx0Ly8gQ2hlY2sgaWYgd2UgbmVlZCB0byBleGl0IGZyb20gdGhlIGFwcCBpbnN0ZWFkXG5cdFx0aWYgKHNUYXJnZXRQYXRoLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmJFeGl0T25OYXZpZ2F0ZUJhY2tUb1Jvb3QpIHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5LmV4aXRGcm9tQXBwKCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBjb250ZXh0IGlzIGRlZmVycmVkIG9yIGFzeW5jLCB3ZSBhZGQgKC4uLikgdG8gdGhlIHBhdGhcblx0XHRpZiAobVBhcmFtZXRlcnM/LmFzeW5jQ29udGV4dCB8fCBtUGFyYW1ldGVycz8uYkRlZmVycmVkQ29udGV4dCkge1xuXHRcdFx0c1RhcmdldFBhdGggKz0gXCIoLi4uKVwiO1xuXHRcdH1cblxuXHRcdC8vIEFkZCBsYXlvdXQgcGFyYW1ldGVyIGlmIG5lZWRlZFxuXHRcdGNvbnN0IHNMYXlvdXQgPSB0aGlzLl9jYWxjdWxhdGVMYXlvdXQoc1RhcmdldFBhdGgsIG1QYXJhbWV0ZXJzKTtcblx0XHRpZiAoc0xheW91dCkge1xuXHRcdFx0c1RhcmdldFBhdGggKz0gYD9sYXlvdXQ9JHtzTGF5b3V0fWA7XG5cdFx0fVxuXG5cdFx0Ly8gTmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGZvciBsYXRlciB1c2FnZVxuXHRcdGNvbnN0IG9OYXZpZ2F0aW9uSW5mbyA9IHtcblx0XHRcdG9Bc3luY0NvbnRleHQ6IG1QYXJhbWV0ZXJzPy5hc3luY0NvbnRleHQsXG5cdFx0XHRiRGVmZXJyZWRDb250ZXh0OiBtUGFyYW1ldGVycz8uYkRlZmVycmVkQ29udGV4dCxcblx0XHRcdGJUYXJnZXRFZGl0YWJsZTogbVBhcmFtZXRlcnM/LmVkaXRhYmxlLFxuXHRcdFx0YlBlcnNpc3RPUFNjcm9sbDogbVBhcmFtZXRlcnM/LmJQZXJzaXN0T1BTY3JvbGwsXG5cdFx0XHR1c2VDb250ZXh0OiBtUGFyYW1ldGVycz8udXBkYXRlRkNMTGV2ZWwgPT09IC0xIHx8IG1QYXJhbWV0ZXJzPy5iUmVjcmVhdGVDb250ZXh0ID8gdW5kZWZpbmVkIDogb0NvbnRleHQsXG5cdFx0XHRiRHJhZnROYXZpZ2F0aW9uOiBtUGFyYW1ldGVycz8uYkRyYWZ0TmF2aWdhdGlvbixcblx0XHRcdGJTaG93UGxhY2Vob2xkZXI6IG1QYXJhbWV0ZXJzPy5zaG93UGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCA/IG1QYXJhbWV0ZXJzPy5zaG93UGxhY2Vob2xkZXIgOiB0cnVlXG5cdFx0fTtcblxuXHRcdGlmIChtUGFyYW1ldGVycz8uY2hlY2tOb0hhc2hDaGFuZ2UpIHtcblx0XHRcdC8vIENoZWNrIGlmIHRoZSBuZXcgaGFzaCBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgY3VycmVudCBvbmVcblx0XHRcdGNvbnN0IHNDdXJyZW50SGFzaE5vQXBwU3RhdGUgPSB0aGlzLm9Sb3V0ZXJQcm94eS5nZXRIYXNoKCkucmVwbGFjZSgvWyY/XXsxfXNhcC1pYXBwLXN0YXRlPVtBLVowLTldKy8sIFwiXCIpO1xuXHRcdFx0aWYgKHNUYXJnZXRQYXRoID09PSBzQ3VycmVudEhhc2hOb0FwcFN0YXRlKSB7XG5cdFx0XHRcdC8vIFRoZSBoYXNoIGRvZXNuJ3QgY2hhbmdlLCBidXQgd2UgZmlyZSB0aGUgcm91dGVNYXRjaCBldmVudCB0byB0cmlnZ2VyIHBhZ2UgcmVmcmVzaCAvIGJpbmRpbmdcblx0XHRcdFx0Y29uc3QgbUV2ZW50UGFyYW1ldGVyczogYW55ID0gdGhpcy5vUm91dGVyLmdldFJvdXRlSW5mb0J5SGFzaCh0aGlzLm9Sb3V0ZXJQcm94eS5nZXRIYXNoKCkpO1xuXHRcdFx0XHRpZiAobUV2ZW50UGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG1FdmVudFBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8gPSBvTmF2aWdhdGlvbkluZm87XG5cdFx0XHRcdFx0bUV2ZW50UGFyYW1ldGVycy5yb3V0ZUluZm9ybWF0aW9uID0gdGhpcy5fZ2V0Um91dGVJbmZvcm1hdGlvbih0aGlzLnNDdXJyZW50Um91dGVOYW1lKTtcblx0XHRcdFx0XHRtRXZlbnRQYXJhbWV0ZXJzLnJvdXRlUGF0dGVybiA9IHRoaXMuc0N1cnJlbnRSb3V0ZVBhdHRlcm47XG5cdFx0XHRcdFx0bUV2ZW50UGFyYW1ldGVycy52aWV3cyA9IHRoaXMuYUN1cnJlbnRWaWV3cztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMub1JvdXRlclByb3h5LnNldEZvY3VzRm9yY2VkKCEhbVBhcmFtZXRlcnMuYkZvcmNlRm9jdXMpO1xuXG5cdFx0XHRcdHRoaXMuX2ZpcmVSb3V0ZU1hdGNoRXZlbnRzKG1FdmVudFBhcmFtZXRlcnMpO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzPy50cmFuc2llbnQgJiYgbVBhcmFtZXRlcnMuZWRpdGFibGUgPT0gdHJ1ZSAmJiBzVGFyZ2V0UGF0aC5pbmRleE9mKFwiKC4uLilcIikgPT09IC0xKSB7XG5cdFx0XHRpZiAoc1RhcmdldFBhdGguaW5kZXhPZihcIj9cIikgPiAtMSkge1xuXHRcdFx0XHRzVGFyZ2V0UGF0aCArPSBcIiZpLWFjdGlvbj1jcmVhdGVcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNUYXJnZXRQYXRoICs9IFwiP2ktYWN0aW9uPWNyZWF0ZVwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENsZWFyIHVuYm91bmQgbWVzc2FnZXMgdXBvbiBuYXZpZ2F0aW5nIGZyb20gTFIgdG8gT1Bcblx0XHQvLyBUaGlzIGlzIHRvIGVuc3VyZSBzdGFsZSBlcnJvciBtZXNzYWdlcyBmcm9tIExSIGFyZSBub3Qgc2hvd24gdG8gdGhlIHVzZXIgYWZ0ZXIgbmF2aWdhdGlvbiB0byBPUC5cblx0XHRpZiAob0N1cnJlbnRUYXJnZXRJbmZvICYmIG9DdXJyZW50VGFyZ2V0SW5mby5uYW1lID09PSBcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydFwiKSB7XG5cdFx0XHRjb25zdCBvUm91dGVJbmZvID0gdGhpcy5vUm91dGVyLmdldFJvdXRlSW5mb0J5SGFzaChzVGFyZ2V0UGF0aCk7XG5cdFx0XHRpZiAob1JvdXRlSW5mbykge1xuXHRcdFx0XHRjb25zdCBvUm91dGUgPSB0aGlzLl9nZXRSb3V0ZUluZm9ybWF0aW9uKG9Sb3V0ZUluZm8ubmFtZSk7XG5cdFx0XHRcdGlmIChvUm91dGUgJiYgb1JvdXRlLnRhcmdldHMgJiYgb1JvdXRlLnRhcmdldHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGNvbnN0IHNMYXN0VGFyZ2V0TmFtZSA9IG9Sb3V0ZS50YXJnZXRzW29Sb3V0ZS50YXJnZXRzLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXQgPSB0aGlzLl9nZXRUYXJnZXRJbmZvcm1hdGlvbihzTGFzdFRhcmdldE5hbWUpO1xuXHRcdFx0XHRcdGlmIChvVGFyZ2V0ICYmIG9UYXJnZXQubmFtZSA9PT0gXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2VcIikge1xuXHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlIG5hdmlnYXRpb24gcGFyYW1ldGVycyBpbiB0aGUgcXVldWVcblx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUucHVzaChvTmF2aWdhdGlvbkluZm8pO1xuXG5cdFx0aWYgKHNUYXJnZXRSb3V0ZSAmJiBvUm91dGVQYXJhbWV0ZXJzUHJvbWlzZSkge1xuXHRcdFx0cmV0dXJuIG9Sb3V0ZVBhcmFtZXRlcnNQcm9taXNlLnRoZW4oKG9Sb3V0ZVBhcmFtZXRlcnM6IGFueSkgPT4ge1xuXHRcdFx0XHRvUm91dGVQYXJhbWV0ZXJzLmJJc1N0aWNreU1vZGUgPSBiSXNTdGlja3lNb2RlO1xuXHRcdFx0XHR0aGlzLm9Sb3V0ZXIubmF2VG8oc1RhcmdldFJvdXRlLCBvUm91dGVQYXJhbWV0ZXJzKTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5vUm91dGVyUHJveHlcblx0XHRcdC5uYXZUb0hhc2goc1RhcmdldFBhdGgsIGZhbHNlLCBtUGFyYW1ldGVycz8ubm9QcmVzZXJ2YXRpb25DYWNoZSwgbVBhcmFtZXRlcnM/LmJGb3JjZUZvY3VzLCAhYklzU3RpY2t5TW9kZSlcblx0XHRcdC50aGVuKChiTmF2aWdhdGVkOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKCFiTmF2aWdhdGVkKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIG5hdmlnYXRpb24gZGlkIG5vdCBoYXBwZW4gLS0+IHJlbW92ZSB0aGUgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGZyb20gdGhlIHF1ZXVlIGFzIHRoZXkgc2hvdWxkbid0IGJlIHVzZWRcblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUucG9wKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGJOYXZpZ2F0ZWQ7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYSByb3V0ZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcjbmF2aWdhdGVUb1JvdXRlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5Sb3V0aW5nXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIHNUYXJnZXRSb3V0ZU5hbWUgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBbb1JvdXRlUGFyYW1ldGVyc10gUGFyYW1ldGVycyB0byBiZSB1c2VkIHdpdGggcm91dGUgdG8gY3JlYXRlIHRoZSB0YXJnZXQgaGFzaFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0bmF2aWdhdGVUb1JvdXRlKHNUYXJnZXRSb3V0ZU5hbWU6IHN0cmluZywgb1JvdXRlUGFyYW1ldGVycz86IGFueSkge1xuXHRcdGNvbnN0IHNUYXJnZXRVUkwgPSB0aGlzLm9Sb3V0ZXIuZ2V0VVJMKHNUYXJnZXRSb3V0ZU5hbWUsIG9Sb3V0ZVBhcmFtZXRlcnMpO1xuXHRcdHJldHVybiB0aGlzLm9Sb3V0ZXJQcm94eS5uYXZUb0hhc2goc1RhcmdldFVSTCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgIW9Sb3V0ZVBhcmFtZXRlcnMuYklzU3RpY2t5TW9kZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIG9uZSBvZiB0aGUgY3VycmVudCB2aWV3cyBvbiB0aGUgc2NyZWVuIGlzIGJvdW5kIHRvIGEgZ2l2ZW4gY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIGB0cnVlYCBvciBgZmFsc2VgIGlmIHRoZSBjdXJyZW50IHN0YXRlIGlzIGltcGFjdGVkIG9yIG5vdFxuXHQgKi9cblx0aXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblxuXHRcdC8vIEZpcnN0LCBjaGVjayB3aXRoIHRoZSB0ZWNobmljYWwgcGF0aC4gV2UgaGF2ZSB0byB0cnkgaXQsIGJlY2F1c2UgZm9yIGxldmVsID4gMSwgd2Vcblx0XHQvLyB1c2VzIHRlY2huaWNhbCBrZXlzIGV2ZW4gaWYgU2VtYW50aWMga2V5cyBhcmUgZW5hYmxlZFxuXHRcdGlmICh0aGlzLm9Sb3V0ZXJQcm94eS5pc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkoc1BhdGgpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKC9eW15cXChcXCldK1xcKFteXFwoXFwpXStcXCkkLy50ZXN0KHNQYXRoKSkge1xuXHRcdFx0Ly8gSWYgdGhlIGN1cnJlbnQgcGF0aCBjYW4gYmUgc2VtYW50aWMgKGkuZS4gaXMgbGlrZSB4eHgoeXl5KSlcblx0XHRcdC8vIGNoZWNrIHdpdGggdGhlIHNlbWFudGljIHBhdGggaWYgd2UgY2FuIGZpbmQgaXRcblx0XHRcdGxldCBzU2VtYW50aWNQYXRoO1xuXHRcdFx0aWYgKHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcgJiYgdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZy50ZWNobmljYWxQYXRoID09PSBzUGF0aCkge1xuXHRcdFx0XHQvLyBXZSBoYXZlIGFscmVhZHkgcmVzb2x2ZWQgdGhpcyBzZW1hbnRpYyBwYXRoXG5cdFx0XHRcdHNTZW1hbnRpY1BhdGggPSB0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nLnNlbWFudGljUGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNTZW1hbnRpY1BhdGggPSBTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY1BhdGgob0NvbnRleHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gc1NlbWFudGljUGF0aCAhPSBzUGF0aCA/IHRoaXMub1JvdXRlclByb3h5LmlzQ3VycmVudFN0YXRlSW1wYWN0ZWRCeShzU2VtYW50aWNQYXRoKSA6IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0X2ZpbmRQYXRoVG9OYXZpZ2F0ZShzUGF0aDogYW55KTogc3RyaW5nIHtcblx0XHRjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoXCIvW14vXSokXCIpO1xuXHRcdHNQYXRoID0gc1BhdGgucmVwbGFjZShyZWdleCwgXCJcIik7XG5cdFx0aWYgKHRoaXMub1JvdXRlci5tYXRjaChzUGF0aCkgfHwgc1BhdGggPT09IFwiXCIpIHtcblx0XHRcdHJldHVybiBzUGF0aDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2ZpbmRQYXRoVG9OYXZpZ2F0ZShzUGF0aCk7XG5cdFx0fVxuXHR9XG5cblx0X2NoZWNrSWZDb250ZXh0U3VwcG9ydHNTZW1hbnRpY1BhdGgob0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHRjb25zdCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblxuXHRcdC8vIEZpcnN0LCBjaGVjayBpZiB0aGlzIGlzIGEgbGV2ZWwtMSBvYmplY3QgKHBhdGggPSAvYWFhKGJiYikpXG5cdFx0aWYgKCEvXlxcL1teXFwoXStcXChbXlxcKV0rXFwpJC8udGVzdChzUGF0aCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBUaGVuIGNoZWNrIGlmIHRoZSBlbnRpdHkgaGFzIHNlbWFudGljIGtleXNcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRjb25zdCBzRW50aXR5U2V0TmFtZSA9IG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQob0NvbnRleHQuZ2V0UGF0aCgpKS5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKSBhcyBhbnkgYXMgc3RyaW5nO1xuXHRcdGlmICghU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNLZXlzKG9NZXRhTW9kZWwsIHNFbnRpdHlTZXROYW1lKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIFRoZW4gY2hlY2sgdGhlIGVudGl0eSBpcyBkcmFmdC1lbmFibGVkXG5cdFx0cmV0dXJuIE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCwgc1BhdGgpO1xuXHR9XG5cblx0X2dldFBhdGhGcm9tQ29udGV4dChvQ29udGV4dDogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0bGV0IHNQYXRoO1xuXG5cdFx0aWYgKG9Db250ZXh0LmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpICYmIG9Db250ZXh0LmlzUmVsYXRpdmUoKSkge1xuXHRcdFx0c1BhdGggPSBvQ29udGV4dC5nZXRIZWFkZXJDb250ZXh0KCkuZ2V0UGF0aCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWwgPT09IC0xKSB7XG5cdFx0XHQvLyBXaGVuIG5hdmlnYXRpbmcgYmFjayBmcm9tIGEgY29udGV4dCwgd2UgbmVlZCB0byByZW1vdmUgdGhlIGxhc3QgY29tcG9uZW50IG9mIHRoZSBwYXRoXG5cdFx0XHRzUGF0aCA9IHRoaXMuX2ZpbmRQYXRoVG9OYXZpZ2F0ZShzUGF0aCk7XG5cblx0XHRcdC8vIENoZWNrIGlmIHdlJ3JlIG5hdmlnYXRpbmcgYmFjayB0byBhIHNlbWFudGljIHBhdGggdGhhdCB3YXMgcHJldmlvdXNseSByZXNvbHZlZFxuXHRcdFx0aWYgKHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcgJiYgdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZy50ZWNobmljYWxQYXRoID09PSBzUGF0aCkge1xuXHRcdFx0XHRzUGF0aCA9IHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcuc2VtYW50aWNQYXRoO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGhpcy5fY2hlY2tJZkNvbnRleHRTdXBwb3J0c1NlbWFudGljUGF0aChvQ29udGV4dCkpIHtcblx0XHRcdC8vIFdlIGNoZWNrIGlmIHdlIGhhdmUgdG8gdXNlIGEgc2VtYW50aWMgcGF0aFxuXHRcdFx0Y29uc3Qgc1NlbWFudGljUGF0aCA9IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljUGF0aChvQ29udGV4dCwgdHJ1ZSk7XG5cblx0XHRcdGlmICghc1NlbWFudGljUGF0aCkge1xuXHRcdFx0XHQvLyBXZSB3ZXJlIG5vdCBhYmxlIHRvIGJ1aWxkIHRoZSBzZW1hbnRpYyBwYXRoIC0tPiBVc2UgdGhlIHRlY2huaWNhbCBwYXRoIGFuZFxuXHRcdFx0XHQvLyBjbGVhciB0aGUgcHJldmlvdXMgbWFwcGluZywgb3RoZXJ3aXNlIHRoZSBvbGQgbWFwcGluZyBpcyB1c2VkIGluIEVkaXRGbG93I3VwZGF0ZURvY3VtZW50XG5cdFx0XHRcdC8vIGFuZCBpdCBsZWFkcyB0byB1bndhbnRlZCBwYWdlIHJlbG9hZHNcblx0XHRcdFx0dGhpcy5zZXRMYXN0U2VtYW50aWNNYXBwaW5nKHVuZGVmaW5lZCk7XG5cdFx0XHR9IGVsc2UgaWYgKHNTZW1hbnRpY1BhdGggIT09IHNQYXRoKSB7XG5cdFx0XHRcdC8vIFN0b3JlIHRoZSBtYXBwaW5nIHRlY2huaWNhbCA8LT4gc2VtYW50aWMgcGF0aCB0byBhdm9pZCByZWNhbGN1bGF0aW5nIGl0IGxhdGVyXG5cdFx0XHRcdC8vIGFuZCB1c2UgdGhlIHNlbWFudGljIHBhdGggaW5zdGVhZCBvZiB0aGUgdGVjaG5pY2FsIG9uZVxuXHRcdFx0XHR0aGlzLnNldExhc3RTZW1hbnRpY01hcHBpbmcoeyB0ZWNobmljYWxQYXRoOiBzUGF0aCwgc2VtYW50aWNQYXRoOiBzU2VtYW50aWNQYXRoIH0pO1xuXHRcdFx0XHRzUGF0aCA9IHNTZW1hbnRpY1BhdGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlIGV4dHJhICcvJyBhdCB0aGUgYmVnaW5uaW5nIG9mIHBhdGhcblx0XHRpZiAoc1BhdGhbMF0gPT09IFwiL1wiKSB7XG5cdFx0XHRzUGF0aCA9IHNQYXRoLnN1YnN0cmluZygxKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc1BhdGg7XG5cdH1cblxuXHRfY2FsY3VsYXRlTGF5b3V0KHNQYXRoOiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRsZXQgRkNMTGV2ZWwgPSBtUGFyYW1ldGVycy5GQ0xMZXZlbDtcblx0XHRpZiAobVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWwpIHtcblx0XHRcdEZDTExldmVsICs9IG1QYXJhbWV0ZXJzLnVwZGF0ZUZDTExldmVsO1xuXHRcdFx0aWYgKEZDTExldmVsIDwgMCkge1xuXHRcdFx0XHRGQ0xMZXZlbCA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuICh0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55KS5jYWxjdWxhdGVMYXlvdXQoXG5cdFx0XHRGQ0xMZXZlbCxcblx0XHRcdHNQYXRoLFxuXHRcdFx0bVBhcmFtZXRlcnMuc0xheW91dCxcblx0XHRcdG1QYXJhbWV0ZXJzLmtlZXBDdXJyZW50TGF5b3V0XG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIGJlZm9yZSBhIHJvdXRlIGlzIG1hdGNoZWQuXG5cdCAqIERpc3BsYXlzIGEgYnVzeSBpbmRpY2F0b3IuXG5cdCAqXG5cdCAqL1xuXHRfYmVmb3JlUm91dGVNYXRjaGVkKC8qb0V2ZW50OiBFdmVudCovKSB7XG5cdFx0Y29uc3QgYlBsYWNlaG9sZGVyRW5hYmxlZCA9IG5ldyBQbGFjZWhvbGRlcigpLmlzUGxhY2Vob2xkZXJFbmFibGVkKCk7XG5cdFx0aWYgKCFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHRjb25zdCBvUm9vdFZpZXcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRcdEJ1c3lMb2NrZXIubG9jayhvUm9vdFZpZXcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHdoZW4gYSByb3V0ZSBpcyBtYXRjaGVkLlxuXHQgKiBIaWRlcyB0aGUgYnVzeSBpbmRpY2F0b3IgYW5kIGZpcmVzIGl0cyBvd24gJ3JvdXRlbWF0Y2hlZCcgZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50XG5cdCAqL1xuXHRfb25Sb3V0ZU1hdGNoZWQob0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG9BcHBTdGF0ZUhhbmRsZXIgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0QXBwU3RhdGVIYW5kbGVyKCksXG5cdFx0XHRvUm9vdFZpZXcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRjb25zdCBiUGxhY2Vob2xkZXJFbmFibGVkID0gbmV3IFBsYWNlaG9sZGVyKCkuaXNQbGFjZWhvbGRlckVuYWJsZWQoKTtcblx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvUm9vdFZpZXcpICYmICFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvUm9vdFZpZXcpO1xuXHRcdH1cblx0XHRjb25zdCBtUGFyYW1ldGVyczogYW55ID0gb0V2ZW50LmdldFBhcmFtZXRlcnMoKTtcblx0XHRpZiAodGhpcy5uYXZpZ2F0aW9uSW5mb1F1ZXVlLmxlbmd0aCkge1xuXHRcdFx0bVBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8gPSB0aGlzLm5hdmlnYXRpb25JbmZvUXVldWVbMF07XG5cdFx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUgPSB0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUuc2xpY2UoMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLm5hdmlnYXRpb25JbmZvID0ge307XG5cdFx0fVxuXHRcdGlmIChvQXBwU3RhdGVIYW5kbGVyLmNoZWNrSWZSb3V0ZUNoYW5nZWRCeUlBcHAoKSkge1xuXHRcdFx0bVBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8uYlJlYXNvbklzSWFwcFN0YXRlID0gdHJ1ZTtcblx0XHRcdG9BcHBTdGF0ZUhhbmRsZXIucmVzZXRSb3V0ZUNoYW5nZWRCeUlBcHAoKTtcblx0XHR9XG5cblx0XHR0aGlzLnNDdXJyZW50Um91dGVOYW1lID0gb0V2ZW50LmdldFBhcmFtZXRlcihcIm5hbWVcIik7XG5cdFx0dGhpcy5zQ3VycmVudFJvdXRlUGF0dGVybiA9IG1QYXJhbWV0ZXJzLmNvbmZpZy5wYXR0ZXJuO1xuXHRcdHRoaXMuYUN1cnJlbnRWaWV3cyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2aWV3c1wiKTtcblxuXHRcdG1QYXJhbWV0ZXJzLnJvdXRlSW5mb3JtYXRpb24gPSB0aGlzLl9nZXRSb3V0ZUluZm9ybWF0aW9uKHRoaXMuc0N1cnJlbnRSb3V0ZU5hbWUpO1xuXHRcdG1QYXJhbWV0ZXJzLnJvdXRlUGF0dGVybiA9IHRoaXMuc0N1cnJlbnRSb3V0ZVBhdHRlcm47XG5cblx0XHR0aGlzLl9maXJlUm91dGVNYXRjaEV2ZW50cyhtUGFyYW1ldGVycyk7XG5cblx0XHQvLyBDaGVjayBpZiBjdXJyZW50IGhhc2ggaGFzIGJlZW4gc2V0IGJ5IHRoZSByb3V0ZXJQcm94eS5uYXZUb0hhc2ggZnVuY3Rpb25cblx0XHQvLyBJZiBub3QsIHJlYnVpbGQgaGlzdG9yeSBwcm9wZXJseSAoYm90aCBpbiB0aGUgYnJvd3NlciBhbmQgdGhlIFJvdXRlclByb3h5KVxuXHRcdGlmICghaGlzdG9yeS5zdGF0ZSB8fCBoaXN0b3J5LnN0YXRlLmZlTGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5vUm91dGVyUHJveHlcblx0XHRcdFx0LnJlc3RvcmVIaXN0b3J5KClcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMub1JvdXRlclByb3h5LnJlc29sdmVSb3V0ZU1hdGNoKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXN0b3JpbmcgaGlzdG9yeVwiLCBvRXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vUm91dGVyUHJveHkucmVzb2x2ZVJvdXRlTWF0Y2goKTtcblx0XHR9XG5cdH1cblxuXHRhdHRhY2hSb3V0ZU1hdGNoZWQob0RhdGE6IGFueSwgZm5GdW5jdGlvbj86IGFueSwgb0xpc3RlbmVyPzogYW55KSB7XG5cdFx0dGhpcy5ldmVudFByb3ZpZGVyLmF0dGFjaEV2ZW50KFwicm91dGVNYXRjaGVkXCIsIG9EYXRhLCBmbkZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cdGRldGFjaFJvdXRlTWF0Y2hlZChmbkZ1bmN0aW9uOiBhbnksIG9MaXN0ZW5lcj86IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5kZXRhY2hFdmVudChcInJvdXRlTWF0Y2hlZFwiLCBmbkZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cdGF0dGFjaEFmdGVyUm91dGVNYXRjaGVkKG9EYXRhOiBhbnksIGZuRnVuY3Rpb246IGFueSwgb0xpc3RlbmVyPzogYW55KSB7XG5cdFx0dGhpcy5ldmVudFByb3ZpZGVyLmF0dGFjaEV2ZW50KFwiYWZ0ZXJSb3V0ZU1hdGNoZWRcIiwgb0RhdGEsIGZuRnVuY3Rpb24sIG9MaXN0ZW5lcik7XG5cdH1cblx0ZGV0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQoZm5GdW5jdGlvbjogYW55LCBvTGlzdGVuZXI6IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5kZXRhY2hFdmVudChcImFmdGVyUm91dGVNYXRjaGVkXCIsIGZuRnVuY3Rpb24sIG9MaXN0ZW5lcik7XG5cdH1cblxuXHRnZXRSb3V0ZUZyb21IYXNoKG9Sb3V0ZXI6IGFueSwgb0FwcENvbXBvbmVudDogYW55KSB7XG5cdFx0Y29uc3Qgc0hhc2ggPSBvUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkuaGFzaDtcblx0XHRjb25zdCBvUm91dGVJbmZvID0gb1JvdXRlci5nZXRSb3V0ZUluZm9CeUhhc2goc0hhc2gpO1xuXHRcdHJldHVybiBvQXBwQ29tcG9uZW50XG5cdFx0XHQuZ2V0TWV0YWRhdGEoKVxuXHRcdFx0LmdldE1hbmlmZXN0RW50cnkoXCIvc2FwLnVpNS9yb3V0aW5nL3JvdXRlc1wiKVxuXHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob1JvdXRlOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Sb3V0ZS5uYW1lID09PSBvUm91dGVJbmZvLm5hbWU7XG5cdFx0XHR9KVswXTtcblx0fVxuXHRnZXRUYXJnZXRzRnJvbVJvdXRlKG9Sb3V0ZTogYW55KSB7XG5cdFx0Y29uc3Qgb1RhcmdldCA9IG9Sb3V0ZS50YXJnZXQ7XG5cdFx0aWYgKHR5cGVvZiBvVGFyZ2V0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRyZXR1cm4gW3RoaXMuX21UYXJnZXRzW29UYXJnZXRdXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgYVRhcmdldDogYW55W10gPSBbXTtcblx0XHRcdG9UYXJnZXQuZm9yRWFjaCgoc1RhcmdldDogYW55KSA9PiB7XG5cdFx0XHRcdGFUYXJnZXQucHVzaCh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0XSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhVGFyZ2V0O1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGluaXRpYWxpemVSb3V0aW5nKCkge1xuXHRcdC8vIEF0dGFjaCByb3V0ZXIgaGFuZGxlcnNcblx0XHRhd2FpdCBDb2xsYWJvcmF0aW9uSGVscGVyLnByb2Nlc3NBbmRFeHBhbmRIYXNoKCk7XG5cdFx0dGhpcy5fZm5PblJvdXRlTWF0Y2hlZCA9IHRoaXMuX29uUm91dGVNYXRjaGVkLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5vUm91dGVyLmF0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLl9mbk9uUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHRjb25zdCBiUGxhY2Vob2xkZXJFbmFibGVkID0gbmV3IFBsYWNlaG9sZGVyKCkuaXNQbGFjZWhvbGRlckVuYWJsZWQoKTtcblx0XHRpZiAoIWJQbGFjZWhvbGRlckVuYWJsZWQpIHtcblx0XHRcdHRoaXMub1JvdXRlci5hdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5fYmVmb3JlUm91dGVNYXRjaGVkLmJpbmQodGhpcykpO1xuXHRcdH1cblx0XHQvLyBSZXNldCBpbnRlcm5hbCBzdGF0ZVxuXHRcdHRoaXMubmF2aWdhdGlvbkluZm9RdWV1ZSA9IFtdO1xuXHRcdEVkaXRTdGF0ZS5yZXNldEVkaXRTdGF0ZSgpO1xuXHRcdHRoaXMuYkV4aXRPbk5hdmlnYXRlQmFja1RvUm9vdCA9ICF0aGlzLm9Sb3V0ZXIubWF0Y2goXCJcIik7XG5cblx0XHRjb25zdCBiSXNJYXBwU3RhdGUgPSB0aGlzLm9Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5nZXRIYXNoKCkuaW5kZXhPZihcInNhcC1pYXBwLXN0YXRlXCIpICE9PSAtMTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb1N0YXJ0dXBQYXJhbWV0ZXJzID0gYXdhaXQgdGhpcy5vQXBwQ29tcG9uZW50LmdldFN0YXJ0dXBQYXJhbWV0ZXJzKCk7XG5cdFx0XHRjb25zdCBiSGFzU3RhcnRVcFBhcmFtZXRlcnMgPSBvU3RhcnR1cFBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCAmJiBPYmplY3Qua2V5cyhvU3RhcnR1cFBhcmFtZXRlcnMpLmxlbmd0aCAhPT0gMDtcblx0XHRcdGNvbnN0IHNIYXNoID0gdGhpcy5vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkuZ2V0SGFzaCgpO1xuXHRcdFx0Ly8gTWFuYWdlIHN0YXJ0dXAgcGFyYW1ldGVycyAoaW4gY2FzZSBvZiBubyBpYXBwLXN0YXRlKVxuXHRcdFx0aWYgKCFiSXNJYXBwU3RhdGUgJiYgYkhhc1N0YXJ0VXBQYXJhbWV0ZXJzICYmICFzSGFzaCkge1xuXHRcdFx0XHRpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGUgJiYgb1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGVbMF0udG9VcHBlckNhc2UoKS5pbmRleE9mKFwiQ1JFQVRFXCIpICE9PSAtMSkge1xuXHRcdFx0XHRcdC8vIENyZWF0ZSBtb2RlXG5cdFx0XHRcdFx0Ly8gVGhpcyBjaGVjayB3aWxsIGNhdGNoIG11bHRpcGxlIG1vZGVzIGxpa2UgY3JlYXRlLCBjcmVhdGVXaXRoIGFuZCBhdXRvQ3JlYXRlV2l0aCB3aGljaCBhbGwgbmVlZFxuXHRcdFx0XHRcdC8vIHRvIGJlIGhhbmRsZWQgbGlrZSBjcmVhdGUgc3RhcnR1cCFcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9tYW5hZ2VDcmVhdGVTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVycyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gRGVlcCBsaW5rXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5fbWFuYWdlRGVlcExpbmtTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVycyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3I6IHVua25vd24pIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIGR1cmluZyByb3V0aW5nIGluaXRpYWxpemF0aW9uXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdH1cblx0fVxuXG5cdGdldERlZmF1bHRDcmVhdGVIYXNoKG9TdGFydHVwUGFyYW1ldGVycz86IGFueSkge1xuXHRcdHJldHVybiBBcHBTdGFydHVwSGVscGVyLmdldERlZmF1bHRDcmVhdGVIYXNoKG9TdGFydHVwUGFyYW1ldGVycywgdGhpcy5nZXRDb250ZXh0UGF0aCgpLCB0aGlzLm9Sb3V0ZXIpO1xuXHR9XG5cblx0X21hbmFnZUNyZWF0ZVN0YXJ0dXAob1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRyZXR1cm4gQXBwU3RhcnR1cEhlbHBlci5nZXRDcmVhdGVTdGFydHVwSGFzaChvU3RhcnR1cFBhcmFtZXRlcnMsIHRoaXMuZ2V0Q29udGV4dFBhdGgoKSwgdGhpcy5vUm91dGVyLCB0aGlzLm9NZXRhTW9kZWwpLnRoZW4oXG5cdFx0XHQoc05ld0hhc2g6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoc05ld0hhc2gpIHtcblx0XHRcdFx0XHQodGhpcy5vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkucmVwbGFjZUhhc2ggYXMgYW55KShzTmV3SGFzaCk7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzPy5wcmVmZXJyZWRNb2RlICYmXG5cdFx0XHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJBVVRPQ1JFQVRFXCIpICE9PSAtMVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0dGhpcy5vQXBwQ29tcG9uZW50LnNldFN0YXJ0dXBNb2RlQXV0b0NyZWF0ZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLm9BcHBDb21wb25lbnQuc2V0U3RhcnR1cE1vZGVDcmVhdGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5iRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHRfbWFuYWdlRGVlcExpbmtTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVyczogYW55KSB7XG5cdFx0cmV0dXJuIEFwcFN0YXJ0dXBIZWxwZXIuZ2V0RGVlcExpbmtTdGFydHVwSGFzaChcblx0XHRcdCh0aGlzLm9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKSBhcyBhbnkpW1wic2FwLnVpNVwiXS5yb3V0aW5nLFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzLFxuXHRcdFx0dGhpcy5vTW9kZWxcblx0XHQpLnRoZW4oKG9EZWVwTGluazogYW55KSA9PiB7XG5cdFx0XHRsZXQgc0hhc2g7XG5cdFx0XHRpZiAob0RlZXBMaW5rLmNvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgc1RlY2huaWNhbFBhdGggPSBvRGVlcExpbmsuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRcdGNvbnN0IHNTZW1hbnRpY1BhdGggPSB0aGlzLl9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoKG9EZWVwTGluay5jb250ZXh0KVxuXHRcdFx0XHRcdD8gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9EZWVwTGluay5jb250ZXh0KVxuXHRcdFx0XHRcdDogc1RlY2huaWNhbFBhdGg7XG5cblx0XHRcdFx0aWYgKHNTZW1hbnRpY1BhdGggIT09IHNUZWNobmljYWxQYXRoKSB7XG5cdFx0XHRcdFx0Ly8gU3RvcmUgdGhlIG1hcHBpbmcgdGVjaG5pY2FsIDwtPiBzZW1hbnRpYyBwYXRoIHRvIGF2b2lkIHJlY2FsY3VsYXRpbmcgaXQgbGF0ZXJcblx0XHRcdFx0XHQvLyBhbmQgdXNlIHRoZSBzZW1hbnRpYyBwYXRoIGluc3RlYWQgb2YgdGhlIHRlY2huaWNhbCBvbmVcblx0XHRcdFx0XHR0aGlzLnNldExhc3RTZW1hbnRpY01hcHBpbmcoeyB0ZWNobmljYWxQYXRoOiBzVGVjaG5pY2FsUGF0aCwgc2VtYW50aWNQYXRoOiBzU2VtYW50aWNQYXRoIH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c0hhc2ggPSBzU2VtYW50aWNQYXRoLnN1YnN0cmluZygxKTsgLy8gVG8gcmVtb3ZlIHRoZSBsZWFkaW5nICcvJ1xuXHRcdFx0fSBlbHNlIGlmIChvRGVlcExpbmsuaGFzaCkge1xuXHRcdFx0XHRzSGFzaCA9IG9EZWVwTGluay5oYXNoO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc0hhc2gpIHtcblx0XHRcdFx0Ly9SZXBsYWNlIHRoZSBoYXNoIHdpdGggbmV3bHkgY3JlYXRlZCBoYXNoXG5cdFx0XHRcdCh0aGlzLm9Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5yZXBsYWNlSGFzaCBhcyBhbnkpKHNIYXNoKTtcblx0XHRcdFx0dGhpcy5vQXBwQ29tcG9uZW50LnNldFN0YXJ0dXBNb2RlRGVlcGxpbmsoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdldE91dGJvdW5kcygpIHtcblx0XHRyZXR1cm4gdGhpcy5vdXRib3VuZHM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgbmFtZSBvZiB0aGUgRHJhZnQgcm9vdCBlbnRpdHkgc2V0IG9yIHRoZSBzdGlja3ktZW5hYmxlZCBlbnRpdHkgc2V0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgbmFtZSBvZiB0aGUgcm9vdCBFbnRpdHlTZXRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRDb250ZXh0UGF0aCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zQ29udGV4dFBhdGg7XG5cdH1cblx0Z2V0SW50ZXJmYWNlKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cblxuY2xhc3MgUm91dGluZ1NlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8Um91dGluZ1NlcnZpY2VTZXR0aW5ncz4ge1xuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PFJvdXRpbmdTZXJ2aWNlU2V0dGluZ3M+KSB7XG5cdFx0Y29uc3Qgb1JvdXRpbmdTZXJ2aWNlID0gbmV3IFJvdXRpbmdTZXJ2aWNlKG9TZXJ2aWNlQ29udGV4dCk7XG5cdFx0cmV0dXJuIG9Sb3V0aW5nU2VydmljZS5pbml0UHJvbWlzZTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVs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