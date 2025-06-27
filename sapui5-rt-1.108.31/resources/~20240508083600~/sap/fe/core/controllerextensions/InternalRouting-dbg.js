/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, CommonUtils, BusyLocker, draft, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, Component, Core, ControllerExtension, OverrideExecution, Filter, FilterOperator) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
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
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.InternalRouting
   * @private
   * @since 1.74.0
   */
  var InternalRouting = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalRouting"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = extensible(OverrideExecution.After), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = publicExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = extensible(OverrideExecution.Before), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalRouting, _ControllerExtension);
    function InternalRouting() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalRouting.prototype;
    _proto.onExit = function onExit() {
      if (this._oRoutingService) {
        this._oRoutingService.detachRouteMatched(this._fnRouteMatchedBound);
      }
    };
    _proto.onInit = function onInit() {
      var _this = this;
      this._oView = this.base.getView();
      this._oAppComponent = CommonUtils.getAppComponent(this._oView);
      this._oPageComponent = Component.getOwnerComponentFor(this._oView);
      this._oRouter = this._oAppComponent.getRouter();
      this._oRouterProxy = this._oAppComponent.getRouterProxy();
      if (!this._oAppComponent || !this._oPageComponent) {
        throw new Error("Failed to initialize controler extension 'sap.fe.core.controllerextesions.InternalRouting");
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (this._oAppComponent === this._oPageComponent) {
        // The view isn't hosted in a dedicated UIComponent, but directly in the app
        // --> just keep the view
        this._oPageComponent = null;
      }
      this._oAppComponent.getService("routingService").then(function (oRoutingService) {
        _this._oRoutingService = oRoutingService;
        _this._fnRouteMatchedBound = _this._onRouteMatched.bind(_this);
        _this._oRoutingService.attachRouteMatched(_this._fnRouteMatchedBound);
        _this._oTargetInformation = oRoutingService.getTargetInformationFor(_this._oPageComponent || _this._oView);
      }).catch(function () {
        throw new Error("This controller extension cannot work without a 'routingService' on the main AppComponent");
      });
    }

    /**
     * Triggered every time this controller is a navigation target.
     */;
    _proto.onRouteMatched = function onRouteMatched() {
      /**/
    };
    _proto.onRouteMatchedFinished = function onRouteMatchedFinished() {
      /**/
    };
    _proto.onBeforeBinding = function onBeforeBinding(oBindingContext, mParameters) {
      var oRouting = this.base.getView().getController().routing;
      if (oRouting && oRouting.onBeforeBinding) {
        oRouting.onBeforeBinding(oBindingContext, mParameters);
      }
    };
    _proto.onAfterBinding = function onAfterBinding(oBindingContext, mParameters) {
      this._oAppComponent.getRootViewController().onContextBoundToView(oBindingContext);
      var oRouting = this.base.getView().getController().routing;
      if (oRouting && oRouting.onAfterBinding) {
        oRouting.onAfterBinding(oBindingContext, mParameters);
      }
    }

    ///////////////////////////////////////////////////////////
    // Methods triggering a navigation after a user action
    // (e.g. click on a table row, button, etc...)
    ///////////////////////////////////////////////////////////

    /**
     * Navigates to the specified navigation target.
     *
     * @param oContext Context instance
     * @param sNavigationTargetName Navigation target name
     * @param oSemanticObject Semantic object
     * @param bPreserveHistory True to force the new URL to be added at the end of the browser history (no replace)
     * @ui5-restricted
     */;
    _proto.navigateToTarget = function navigateToTarget(oContext, sNavigationTargetName, oSemanticObject, bPreserveHistory) {
      var oNavigationConfiguration = this._oPageComponent && this._oPageComponent.getNavigationConfiguration && this._oPageComponent.getNavigationConfiguration(sNavigationTargetName);
      if (oNavigationConfiguration) {
        var oDetailRoute = oNavigationConfiguration.detail;
        var sRouteName = oDetailRoute.route;
        var mParameterMapping = oDetailRoute.parameters;
        this._oRoutingService.navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory);
      } else {
        this._oRoutingService.navigateTo(oContext, null, null, bPreserveHistory);
      }
      this._oView.getViewData();
    }

    /**
     * Navigates to the specified navigation target route.
     *
     * @param sTargetRouteName Name of the target route
     * @param [oParameters] Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oParameters) {
      return this._oRoutingService.navigateToRoute(sTargetRouteName, oParameters);
    }

    /**
     * Navigates to a specific context.
     *
     * @param oContext The context to be navigated to
     * @param [mParameters] Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateToContext = function navigateToContext(oContext, mParameters) {
      var _this2 = this;
      var oContextInfo = {};
      mParameters = mParameters || {};
      if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        if (mParameters.asyncContext) {
          // the context is either created async (Promise)
          // We need to activate the routeMatchSynchro on the RouterProxy to avoid that
          // the subsequent call to navigateToContext conflicts with the current one
          this._oRouterProxy.activateRouteMatchSynchronization();
          mParameters.asyncContext.then(function (asyncContext) {
            // once the context is returned we navigate into it
            _this2.navigateToContext(asyncContext, {
              checkNoHashChange: mParameters.checkNoHashChange,
              editable: mParameters.editable,
              bPersistOPScroll: mParameters.bPersistOPScroll,
              updateFCLLevel: mParameters.updateFCLLevel,
              bForceFocus: mParameters.bForceFocus
            });
          }).catch(function (oError) {
            Log.error("Error with the async context", oError);
          });
        } else if (!mParameters.bDeferredContext) {
          // Navigate to a list binding not yet supported
          throw "navigation to a list binding is not yet supported";
        }
      }
      if (mParameters.callExtension) {
        var oInternalModel = this._oView.getModel("internal");
        oInternalModel.setProperty("/paginatorCurrentContext", null);
        oContextInfo.sourceBindingContext = oContext.getObject();
        oContextInfo.bindingContext = oContext;
        if (mParameters.oEvent) {
          oContextInfo.oEvent = mParameters.oEvent;
        }
        // Storing the selected context to use it in internal route navigation if neccessary.
        var bOverrideNav = this.base.getView().getController().routing.onBeforeNavigation(oContextInfo);
        if (bOverrideNav) {
          oInternalModel.setProperty("/paginatorCurrentContext", oContext);
          return Promise.resolve(true);
        }
      }
      mParameters.FCLLevel = this._getFCLLevel();
      return this._oRoutingService.navigateToContext(oContext, mParameters, this._oView.getViewData(), this._oTargetInformation);
    }

    /**
     * Navigates backwards from a context.
     *
     * @param oContext Context to be navigated from
     * @param [mParameters] Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateBackFromContext = function navigateBackFromContext(oContext, mParameters) {
      mParameters = mParameters || {};
      mParameters.updateFCLLevel = -1;
      return this.navigateToContext(oContext, mParameters);
    }

    /**
     * Navigates forwards to a context.
     *
     * @param oContext Context to be navigated to
     * @param mParameters Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateForwardToContext = function navigateForwardToContext(oContext, mParameters) {
      var _this$_oView$getBindi;
      if (((_this$_oView$getBindi = this._oView.getBindingContext("internal")) === null || _this$_oView$getBindi === void 0 ? void 0 : _this$_oView$getBindi.getProperty("messageFooterContainsErrors")) === true) {
        return Promise.resolve(true);
      }
      mParameters = mParameters || {};
      mParameters.updateFCLLevel = 1;
      return this.navigateToContext(oContext, mParameters);
    }

    /**
     * Navigates back in history if the current hash corresponds to a transient state.
     */;
    _proto.navigateBackFromTransientState = function navigateBackFromTransientState() {
      var sHash = this._oRouterProxy.getHash();

      // if triggered while navigating to (...), we need to navigate back
      if (sHash.indexOf("(...)") !== -1) {
        this._oRouterProxy.navBack();
      }
    };
    _proto.navigateToMessagePage = function navigateToMessagePage(sErrorMessage, mParameters) {
      mParameters = mParameters || {};
      if (this._oRouterProxy.getHash().indexOf("i-action=create") > -1 || this._oRouterProxy.getHash().indexOf("i-action=autoCreate") > -1) {
        return this._oRouterProxy.navToHash(this._oRoutingService.getDefaultCreateHash());
      } else {
        mParameters.FCLLevel = this._getFCLLevel();
        return this._oAppComponent.getRootViewController().displayMessagePage(sErrorMessage, mParameters);
      }
    }

    /**
     * Checks if one of the current views on the screen is bound to a given context.
     *
     * @param oContext
     * @returns `true` if the state is impacted by the context
     * @ui5-restricted
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(oContext) {
      return this._oRoutingService.isCurrentStateImpactedBy(oContext);
    };
    _proto._isViewPartOfRoute = function _isViewPartOfRoute(routeInformation) {
      var aTargets = routeInformation === null || routeInformation === void 0 ? void 0 : routeInformation.targets;
      if (!aTargets || aTargets.indexOf(this._oTargetInformation.targetName) === -1) {
        var _this$_oTargetInforma, _routeInformation$rou;
        // If the target for this view has a view level greater than the route level, it means this view comes "after" the route
        // in terms of navigation.
        // In such case, we remove its binding context, to avoid this view to have data if we navigate to it later on
        if (((_this$_oTargetInforma = this._oTargetInformation.viewLevel) !== null && _this$_oTargetInforma !== void 0 ? _this$_oTargetInforma : 0) >= ((_routeInformation$rou = routeInformation === null || routeInformation === void 0 ? void 0 : routeInformation.routeLevel) !== null && _routeInformation$rou !== void 0 ? _routeInformation$rou : 0)) {
          this._setBindingContext(null); // This also call setKeepAlive(false) on the current context
        }

        return false;
      }
      return true;
    };
    _proto._buildBindingPath = function _buildBindingPath(routeArguments, bindingPattern, navigationParameters) {
      var path = bindingPattern.replace(":?query:", "");
      var deferred = false;
      for (var sKey in routeArguments) {
        var sValue = routeArguments[sKey];
        if (sValue === "..." && bindingPattern.indexOf("{".concat(sKey, "}")) >= 0) {
          deferred = true;
          // Sometimes in preferredMode = create, the edit button is shown in background when the
          // action parameter dialog shows up, setting bTargetEditable passes editable as true
          // to onBeforeBinding in _bindTargetPage function
          navigationParameters.bTargetEditable = true;
        }
        path = path.replace("{".concat(sKey, "}"), sValue);
      }
      if (routeArguments["?query"] && routeArguments["?query"].hasOwnProperty("i-action")) {
        navigationParameters.bActionCreate = true;
      }

      // the binding path is always absolute
      if (path && path[0] !== "/") {
        path = "/".concat(path);
      }
      return {
        path: path,
        deferred: deferred
      };
    }

    ///////////////////////////////////////////////////////////
    // Methods to bind the page when a route is matched
    ///////////////////////////////////////////////////////////

    /**
     * Called when a route is matched.
     * Builds the binding context from the navigation parameters, and bind the page accordingly.
     *
     * @param oEvent
     * @ui5-restricted
     */;
    _proto._onRouteMatched = function _onRouteMatched(oEvent) {
      var _this3 = this;
      // Check if the target for this view is part of the event targets (i.e. is a target for the current route).
      // If not, we don't need to bind it --> return
      if (!this._isViewPartOfRoute(oEvent.getParameter("routeInformation"))) {
        return;
      }

      // Retrieve the binding context pattern
      var bindingPattern;
      if (this._oPageComponent && this._oPageComponent.getBindingContextPattern) {
        bindingPattern = this._oPageComponent.getBindingContextPattern();
      }
      bindingPattern = bindingPattern || this._oTargetInformation.contextPattern;
      if (bindingPattern === null || bindingPattern === undefined) {
        // Don't do this if we already got sTarget == '', which is a valid target pattern
        bindingPattern = oEvent.getParameter("routePattern");
      }

      // Replace the parameters by their values in the binding context pattern
      var mArguments = oEvent.getParameters().arguments;
      var oNavigationParameters = oEvent.getParameter("navigationInfo");
      var _this$_buildBindingPa = this._buildBindingPath(mArguments, bindingPattern, oNavigationParameters),
        path = _this$_buildBindingPa.path,
        deferred = _this$_buildBindingPa.deferred;
      this.onRouteMatched();
      var oModel = this._oView.getModel();
      var oOut;
      if (deferred) {
        oOut = this._bindDeferred(path, oNavigationParameters);
      } else {
        oOut = this._bindPage(path, oModel, oNavigationParameters);
      }
      // eslint-disable-next-line promise/catch-or-return
      oOut.finally(function () {
        _this3.onRouteMatchedFinished();
      });
      this._oAppComponent.getRootViewController().updateUIStateForView(this._oView, this._getFCLLevel());
    }

    /**
     * Deferred binding (during object creation).
     *
     * @param sTargetPath The path to the deffered context
     * @param oNavigationParameters Navigation parameters
     * @returns A Promise
     * @ui5-restricted
     */;
    _proto._bindDeferred = function _bindDeferred(sTargetPath, oNavigationParameters) {
      this.onBeforeBinding(null, {
        editable: oNavigationParameters.bTargetEditable
      });
      if (oNavigationParameters.bDeferredContext || !oNavigationParameters.oAsyncContext) {
        // either the context shall be created in the target page (deferred Context) or it shall
        // be created async but the user refreshed the page / bookmarked this URL
        // TODO: currently the target component creates this document but we shall move this to
        // a central place
        if (this._oPageComponent && this._oPageComponent.createDeferredContext) {
          this._oPageComponent.createDeferredContext(sTargetPath, oNavigationParameters.useContext, oNavigationParameters.bActionCreate);
        }
      }
      var currentBindingContext = this._getBindingContext();
      if (currentBindingContext !== null && currentBindingContext !== void 0 && currentBindingContext.hasPendingChanges()) {
        // For now remove the pending changes to avoid the model raises errors and the object page is at least bound
        // Ideally the user should be asked for
        currentBindingContext.getBinding().resetChanges();
      }

      // remove the context to avoid showing old data
      this._setBindingContext(null);
      this.onAfterBinding(null);
      return Promise.resolve();
    }

    /**
     * Sets the binding context of the page from a path.
     *
     * @param sTargetPath The path to the context
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @returns A Promise resolved once the binding has been set on the page
     * @ui5-restricted
     */;
    _proto._bindPage = function _bindPage(sTargetPath, oModel, oNavigationParameters) {
      var _this4 = this;
      if (sTargetPath === "") {
        return Promise.resolve(this._bindPageToContext(null, oModel, oNavigationParameters));
      } else {
        return this._resolveSemanticPath(sTargetPath, oModel).then(function (sTechnicalPath) {
          _this4._bindPageToPath(sTechnicalPath, oModel, oNavigationParameters);
        }).catch(function (oError) {
          // Error handling for erroneous metadata request
          var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
          _this4.navigateToMessagePage(oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
            title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
            description: oError.message
          });
        });
      }
    }

    /**
     * Creates the filter to retrieve a context corresponding to a semantic path.
     *
     * @param sSemanticPath The semantic path
     * @param aSemanticKeys The semantic keys for the path
     * @param oMetaModel The instance of the meta model
     * @returns The filter
     * @ui5-restricted
     */;
    _proto._createFilterFromSemanticPath = function _createFilterFromSemanticPath(sSemanticPath, aSemanticKeys, oMetaModel) {
      var fnUnquoteAndDecode = function (sValue) {
        if (sValue.indexOf("'") === 0 && sValue.lastIndexOf("'") === sValue.length - 1) {
          // Remove the quotes from the value and decode special chars
          sValue = decodeURIComponent(sValue.substring(1, sValue.length - 1));
        }
        return sValue;
      };
      var aKeyValues = sSemanticPath.substring(sSemanticPath.indexOf("(") + 1, sSemanticPath.length - 1).split(",");
      var aFilters;
      if (aSemanticKeys.length != aKeyValues.length) {
        return null;
      }
      var bFilteringCaseSensitive = ModelHelper.isFilteringCaseSensitive(oMetaModel);
      if (aSemanticKeys.length === 1) {
        // Take the first key value
        var sKeyValue = fnUnquoteAndDecode(aKeyValues[0]);
        aFilters = [new Filter({
          path: aSemanticKeys[0].$PropertyPath,
          operator: FilterOperator.EQ,
          value1: sKeyValue,
          caseSensitive: bFilteringCaseSensitive
        })];
      } else {
        var mKeyValues = {};
        // Create a map of all key values
        aKeyValues.forEach(function (sKeyAssignment) {
          var aParts = sKeyAssignment.split("="),
            sKeyValue = fnUnquoteAndDecode(aParts[1]);
          mKeyValues[aParts[0]] = sKeyValue;
        });
        var bFailed = false;
        aFilters = aSemanticKeys.map(function (oSemanticKey) {
          var sKey = oSemanticKey.$PropertyPath,
            sValue = mKeyValues[sKey];
          if (sValue !== undefined) {
            return new Filter({
              path: sKey,
              operator: FilterOperator.EQ,
              value1: sValue,
              caseSensitive: bFilteringCaseSensitive
            });
          } else {
            bFailed = true;
            return new Filter({
              path: "XX"
            }); // will be ignore anyway since we return after
          }
        });

        if (bFailed) {
          return null;
        }
      }

      // Add a draft filter to make sure we take the draft entity if there is one
      // Or the active entity otherwise
      var oDraftFilter = new Filter({
        filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
        and: false
      });
      aFilters.push(oDraftFilter);
      return new Filter(aFilters, true);
    }

    /**
     * Converts a path with semantic keys to a path with technical keys.
     *
     * @param sSemanticPath The path with semantic keys
     * @param oModel The model for the path
     * @param aSemanticKeys The semantic keys for the path
     * @returns A Promise containing the path with technical keys if sSemanticPath could be interpreted as a semantic path, null otherwise
     * @ui5-restricted
     */;
    _proto._getTechnicalPathFromSemanticPath = function _getTechnicalPathFromSemanticPath(sSemanticPath, oModel, aSemanticKeys) {
      var _sEntitySetPath;
      var oMetaModel = oModel.getMetaModel();
      var sEntitySetPath = oMetaModel.getMetaContext(sSemanticPath).getPath();
      if (!aSemanticKeys || aSemanticKeys.length === 0) {
        // No semantic keys
        return Promise.resolve(null);
      }

      // Create a set of filters corresponding to all keys
      var oFilter = this._createFilterFromSemanticPath(sSemanticPath, aSemanticKeys, oMetaModel);
      if (oFilter === null) {
        // Couldn't interpret the path as a semantic one
        return Promise.resolve(null);
      }

      // Load the corresponding object
      if (!((_sEntitySetPath = sEntitySetPath) !== null && _sEntitySetPath !== void 0 && _sEntitySetPath.startsWith("/"))) {
        sEntitySetPath = "/".concat(sEntitySetPath);
      }
      var oListBinding = oModel.bindList(sEntitySetPath, undefined, undefined, oFilter, {
        "$$groupId": "$auto.Heroes"
      });
      return oListBinding.requestContexts(0, 2).then(function (oContexts) {
        if (oContexts && oContexts.length) {
          return oContexts[0].getPath();
        } else {
          // No data could be loaded
          return null;
        }
      });
    }

    /**
     * Checks if a path is eligible for semantic bookmarking.
     *
     * @param sPath The path to test
     * @param oMetaModel The associated metadata model
     * @returns `true` if the path is eligible
     * @ui5-restricted
     */;
    _proto._checkPathForSemanticBookmarking = function _checkPathForSemanticBookmarking(sPath, oMetaModel) {
      // Only path on root objects allow semantic bookmarking, i.e. sPath = xxx(yyy)
      var aMatches = /^[\/]?(\w+)\([^\/]+\)$/.exec(sPath);
      if (!aMatches) {
        return false;
      }
      // Get the entitySet name
      var sEntitySetPath = "/".concat(aMatches[1]);
      // Check the entity set supports draft (otherwise we don't support semantic bookmarking)
      var oDraftRoot = oMetaModel.getObject("".concat(sEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot"));
      var oDraftNode = oMetaModel.getObject("".concat(sEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftNode"));
      return oDraftRoot || oDraftNode ? true : false;
    }

    /**
     * Builds a path with semantic keys from a path with technical keys.
     *
     * @param sPathToResolve The path to be transformed
     * @param oModel The OData model
     * @returns String promise for the new path. If sPathToResolved couldn't be interpreted as a semantic path, it is returned as is.
     * @ui5-restricted
     */;
    _proto._resolveSemanticPath = function _resolveSemanticPath(sPathToResolve, oModel) {
      var _this5 = this;
      var oMetaModel = oModel.getMetaModel();
      var oLastSemanticMapping = this._oRoutingService.getLastSemanticMapping();
      var sCurrentHashNoParams = this._oRouter.getHashChanger().getHash().split("?")[0];
      if (sCurrentHashNoParams && sCurrentHashNoParams.lastIndexOf("/") === sCurrentHashNoParams.length - 1) {
        // Remove trailing '/'
        sCurrentHashNoParams = sCurrentHashNoParams.substring(0, sCurrentHashNoParams.length - 1);
      }
      var sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
      if (sRootEntityName.indexOf("/") === 0) {
        sRootEntityName = sRootEntityName.substring(1);
      }
      var bAllowSemanticBookmark = this._checkPathForSemanticBookmarking(sCurrentHashNoParams, oMetaModel),
        aSemanticKeys = bAllowSemanticBookmark && SemanticKeyHelper.getSemanticKeys(oMetaModel, sRootEntityName);
      if (!aSemanticKeys) {
        // No semantic keys available --> use the path as is
        return Promise.resolve(sPathToResolve);
      } else if (oLastSemanticMapping && oLastSemanticMapping.semanticPath === sPathToResolve) {
        // This semantic path has been resolved previously
        return Promise.resolve(oLastSemanticMapping.technicalPath);
      } else {
        // We need resolve the semantic path to get the technical keys
        return this._getTechnicalPathFromSemanticPath(sCurrentHashNoParams, oModel, aSemanticKeys).then(function (sTechnicalPath) {
          if (sTechnicalPath && sTechnicalPath !== sPathToResolve) {
            // The semantic path was resolved (otherwise keep the original value for target)
            _this5._oRoutingService.setLastSemanticMapping({
              technicalPath: sTechnicalPath,
              semanticPath: sPathToResolve
            });
            return sTechnicalPath;
          } else {
            return sPathToResolve;
          }
        });
      }
    }

    /**
     * Sets the binding context of the page from a path.
     *
     * @param sTargetPath The path to build the context. Needs to contain technical keys only.
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @ui5-restricted
     */;
    _proto._bindPageToPath = function _bindPageToPath(sTargetPath, oModel, oNavigationParameters) {
      var oCurrentContext = this._getBindingContext(),
        sCurrentPath = oCurrentContext && oCurrentContext.getPath(),
        oUseContext = oNavigationParameters.useContext;

      // We set the binding context only if it's different from the current one
      // or if we have a context already selected
      if (sCurrentPath !== sTargetPath || oUseContext && oUseContext.getPath() === sTargetPath) {
        var oTargetContext;
        if (oUseContext && oUseContext.getPath() === sTargetPath) {
          // We already have the context to be used
          oTargetContext = oUseContext;
        } else {
          // Otherwise we need to create it from sTargetPath
          oTargetContext = this._createContext(sTargetPath, oModel);
        }
        if (oTargetContext !== oCurrentContext) {
          this._bindPageToContext(oTargetContext, oModel, oNavigationParameters);
        }
      } else if (!oNavigationParameters.bReasonIsIappState && EditState.isEditStateDirty()) {
        this._refreshBindingContext(oCurrentContext);
      }
    }

    /**
     * Binds the page to a context.
     *
     * @param oContext Context to be bound
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @ui5-restricted
     */;
    _proto._bindPageToContext = function _bindPageToContext(oContext, oModel, oNavigationParameters) {
      var _this6 = this;
      if (!oContext) {
        this.onBeforeBinding(null);
        this.onAfterBinding(null);
        return;
      }
      var oParentListBinding = oContext.getBinding();
      var oRootViewController = this._oAppComponent.getRootViewController();
      if (oRootViewController.isFclEnabled()) {
        if (!oParentListBinding || !oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          // if the parentBinding is not a listBinding, we create a new context
          oContext = this._createContext(oContext.getPath(), oModel);
        }
        try {
          this._setKeepAlive(oContext, true, function () {
            if (oRootViewController.isContextUsedInPages(oContext)) {
              _this6.navigateBackFromContext(oContext);
            }
          }, true // Load messages, otherwise they don't get refreshed later, e.g. for side effects
          );
        } catch (oError) {
          // setKeepAlive throws an exception if the parent listbinding doesn't have $$ownRequest=true
          // This case for custom fragments is supported, but an error is logged to make the lack of synchronization apparent
          Log.error("View for ".concat(oContext.getPath(), " won't be synchronized. Parent listBinding must have binding parameter $$ownRequest=true"));
        }
      } else if (!oParentListBinding || oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        // We need to recreate the context otherwise we get errors
        oContext = this._createContext(oContext.getPath(), oModel);
      }

      // Set the binding context with the proper before/after callbacks
      this.onBeforeBinding(oContext, {
        editable: oNavigationParameters.bTargetEditable,
        listBinding: oParentListBinding,
        bPersistOPScroll: oNavigationParameters.bPersistOPScroll,
        bDraftNavigation: oNavigationParameters.bDraftNavigation,
        showPlaceholder: oNavigationParameters.bShowPlaceholder
      });
      this._setBindingContext(oContext);
      this.onAfterBinding(oContext);
    }

    /**
     * Creates a context from a path.
     *
     * @param sPath The path
     * @param oModel The OData model
     * @returns The created context
     * @ui5-restricted
     */;
    _proto._createContext = function _createContext(sPath, oModel) {
      var _this7 = this;
      var oPageComponent = this._oPageComponent,
        sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet(),
        sContextPath = oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath() || sEntitySet && "/".concat(sEntitySet),
        oMetaModel = oModel.getMetaModel(),
        mParameters = {
          $$groupId: "$auto.Heroes",
          $$updateGroupId: "$auto",
          $$patchWithoutSideEffects: true
        };
      // In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
      var oDraftRoot = oMetaModel.getObject("".concat(sContextPath, "@com.sap.vocabularies.Common.v1.DraftRoot"));
      var oDraftNode = oMetaModel.getObject("".concat(sContextPath, "@com.sap.vocabularies.Common.v1.DraftNode"));
      var oRootViewController = this._oAppComponent.getRootViewController();
      if (oRootViewController.isFclEnabled()) {
        var oContext = this._getKeepAliveContext(oModel, sPath, false, mParameters);
        if (!oContext) {
          throw new Error("Cannot create keepAlive context ".concat(sPath));
        } else if (oDraftRoot || oDraftNode) {
          if (oContext.getProperty("IsActiveEntity") === undefined) {
            oContext.requestProperty(["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
            if (oDraftRoot) {
              oContext.requestObject("DraftAdministrativeData");
            }
          } else {
            // when switching between draft and edit we need to ensure those properties are requested again even if they are in the binding's cache
            // otherwise when you edit and go to the saved version you have no way of switching back to the edit version
            oContext.requestSideEffects(oDraftRoot ? ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity", "DraftAdministrativeData"] : ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
          }
        }
        return oContext;
      } else {
        if (sEntitySet) {
          var sMessagesPath = oMetaModel.getObject("".concat(sContextPath, "/@com.sap.vocabularies.Common.v1.Messages/$Path"));
          if (sMessagesPath) {
            mParameters.$select = sMessagesPath;
          }
        }

        // In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
        if (oDraftRoot || oDraftNode) {
          if (mParameters.$select === undefined) {
            mParameters.$select = "HasActiveEntity,HasDraftEntity,IsActiveEntity";
          } else {
            mParameters.$select += ",HasActiveEntity,HasDraftEntity,IsActiveEntity";
          }
        }
        if (this._oView.getBindingContext()) {
          var _this$_oView$getBindi2;
          var oPreviousBinding = (_this$_oView$getBindi2 = this._oView.getBindingContext()) === null || _this$_oView$getBindi2 === void 0 ? void 0 : _this$_oView$getBindi2.getBinding();
          oPreviousBinding === null || oPreviousBinding === void 0 ? void 0 : oPreviousBinding.resetChanges().then(function () {
            oPreviousBinding.destroy();
          }).catch(function (oError) {
            Log.error("Error while reseting the changes to the binding", oError);
          });
        }
        var oHiddenBinding = oModel.bindContext(sPath, undefined, mParameters);
        oHiddenBinding.attachEventOnce("dataRequested", function () {
          BusyLocker.lock(_this7._oView);
        });
        oHiddenBinding.attachEventOnce("dataReceived", this._dataReceivedEventHandler.bind(this));
        return oHiddenBinding.getBoundContext();
      }
    };
    _proto._dataReceivedEventHandler = function _dataReceivedEventHandler(oEvent) {
      try {
        var _this9 = this;
        var sErrorDescription = oEvent && oEvent.getParameter("error");
        BusyLocker.unlock(_this9._oView);
        var _temp3 = function () {
          if (sErrorDescription) {
            var _temp4 = _catch(function () {
              return Promise.resolve(Core.getLibraryResourceBundle("sap.fe.core", true)).then(function (oResourceBundle) {
                var messageHandler = _this9.base.messageHandler;
                var mParams = {};
                if (sErrorDescription && sErrorDescription.status === 503) {
                  mParams = {
                    isInitialLoad503Error: true,
                    shellBack: true
                  };
                } else {
                  mParams = {
                    title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
                    description: sErrorDescription,
                    isDataReceivedError: true,
                    shellBack: true
                  };
                }
                return Promise.resolve(messageHandler.showMessages(mParams)).then(function () {});
              });
            }, function (oError) {
              Log.error("Error while getting the core resource bundle", oError);
            });
            if (_temp4 && _temp4.then) return _temp4.then(function () {});
          }
        }();
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Requests side effects on a binding context to "refresh" it.
     * TODO: get rid of this once provided by the model
     * a refresh on the binding context does not work in case a creation row with a transient context is
     * used. also a requestSideEffects with an empty path would fail due to the transient context
     * therefore we get all dependent bindings (via private model method) to determine all paths and then
     * request them.
     *
     * @param oBindingContext Context to be refreshed
     * @ui5-restricted
     */
    ;
    _proto._refreshBindingContext = function _refreshBindingContext(oBindingContext) {
      var oPageComponent = this._oPageComponent;
      var oSideEffectsService = this._oAppComponent.getSideEffectsService();
      var sRootContextPath = oBindingContext.getPath();
      var sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet();
      var sContextPath = oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath() || sEntitySet && "/".concat(sEntitySet);
      var oMetaModel = this._oView.getModel().getMetaModel();
      var sMessagesPath;
      var aNavigationPropertyPaths = [];
      var aPropertyPaths = [];
      var oSideEffects = {
        TargetProperties: [],
        TargetEntities: []
      };
      function getBindingPaths(oBinding) {
        var aDependentBindings;
        var sRelativePath = (oBinding.getContext() && oBinding.getContext().getPath() || "").replace(sRootContextPath, ""); // If no context, this is an absolute binding so no relative path
        var sPath = (sRelativePath ? "".concat(sRelativePath.slice(1), "/") : sRelativePath) + oBinding.getPath();
        if (oBinding.isA("sap.ui.model.odata.v4.ODataContextBinding")) {
          // if (sPath === "") {
          // now get the dependent bindings
          aDependentBindings = oBinding.getDependentBindings();
          if (aDependentBindings) {
            // ask the dependent bindings (and only those with the specified groupId
            //if (aDependentBindings.length > 0) {
            for (var _i = 0; _i < aDependentBindings.length; _i++) {
              getBindingPaths(aDependentBindings[_i]);
            }
          } else if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
            aNavigationPropertyPaths.push(sPath);
          }
        } else if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
            aNavigationPropertyPaths.push(sPath);
          }
        } else if (oBinding.isA("sap.ui.model.odata.v4.ODataPropertyBinding")) {
          if (aPropertyPaths.indexOf(sPath) === -1) {
            aPropertyPaths.push(sPath);
          }
        }
      }
      if (sContextPath) {
        sMessagesPath = oMetaModel.getObject("".concat(sContextPath, "/@com.sap.vocabularies.Common.v1.Messages/$Path"));
      }

      // binding of the context must have $$PatchWithoutSideEffects true, this bound context may be needed to be fetched from the dependent binding
      getBindingPaths(oBindingContext.getBinding());
      var i;
      for (i = 0; i < aNavigationPropertyPaths.length; i++) {
        oSideEffects.TargetEntities.push({
          $NavigationPropertyPath: aNavigationPropertyPaths[i]
        });
      }
      oSideEffects.TargetProperties = aPropertyPaths;
      if (sMessagesPath) {
        oSideEffects.TargetProperties.push(sMessagesPath);
      }
      //all this logic to be replaced with a SideEffects request for an empty path (refresh everything), after testing transient contexts
      oSideEffects.TargetProperties = oSideEffects.TargetProperties.map(function (sTargetProperty) {
        if (sTargetProperty) {
          var index = sTargetProperty.indexOf("/");
          if (index > 0) {
            // only request the navigation path and not the property paths further
            return sTargetProperty.slice(0, index);
          }
          return sTargetProperty;
        }
      });
      // OData model will take care of duplicates
      oSideEffectsService.requestSideEffects(oSideEffects.TargetEntities.concat(oSideEffects.TargetProperties), oBindingContext);
    }

    /**
     * Gets the binding context of the page or the component.
     *
     * @returns The binding context
     * @ui5-restricted
     */;
    _proto._getBindingContext = function _getBindingContext() {
      if (this._oPageComponent) {
        return this._oPageComponent.getBindingContext();
      } else {
        return this._oView.getBindingContext();
      }
    }

    /**
     * Sets the binding context of the page or the component.
     *
     * @param oContext The binding context
     * @ui5-restricted
     */;
    _proto._setBindingContext = function _setBindingContext(oContext) {
      var oPreviousContext, oTargetControl;
      if (this._oPageComponent) {
        oPreviousContext = this._oPageComponent.getBindingContext();
        oTargetControl = this._oPageComponent;
      } else {
        oPreviousContext = this._oView.getBindingContext();
        oTargetControl = this._oView;
      }
      if (oContext !== oPreviousContext) {
        var _oPreviousContext;
        oTargetControl.setBindingContext(oContext);
        if ((_oPreviousContext = oPreviousContext) !== null && _oPreviousContext !== void 0 && _oPreviousContext.isKeepAlive()) {
          this._setKeepAlive(oPreviousContext, false);
        }
      }
    }

    /**
     * Gets the flexible column layout (FCL) level corresponding to the view (-1 if the app is not FCL).
     *
     * @returns The level
     * @ui5-restricted
     */;
    _proto._getFCLLevel = function _getFCLLevel() {
      return this._oTargetInformation.FCLLevel;
    };
    _proto._setKeepAlive = function _setKeepAlive(oContext, bKeepAlive, fnBeforeDestroy, bRequestMessages) {
      if (oContext.getPath().endsWith(")")) {
        // We keep the context alive only if they're part of a collection, i.e. if the path ends with a ')'
        var oMetaModel = oContext.getModel().getMetaModel();
        var sMetaPath = oMetaModel.getMetaPath(oContext.getPath());
        var sMessagesPath = oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.Common.v1.Messages/$Path"));
        oContext.setKeepAlive(bKeepAlive, fnBeforeDestroy, !!sMessagesPath && bRequestMessages);
      }
    };
    _proto._getKeepAliveContext = function _getKeepAliveContext(oModel, path, bRequestMessages, parameters) {
      // Get the path for the context that is really kept alive (part of a collection)
      // i.e. remove all segments not ending with a ')'
      var keptAliveSegments = path.split("/");
      var additionnalSegments = [];
      while (keptAliveSegments.length && !keptAliveSegments[keptAliveSegments.length - 1].endsWith(")")) {
        additionnalSegments.push(keptAliveSegments.pop());
      }
      if (keptAliveSegments.length === 0) {
        return undefined;
      }
      var keptAlivePath = keptAliveSegments.join("/");
      var oKeepAliveContext = oModel.getKeepAliveContext(keptAlivePath, bRequestMessages, parameters);
      if (additionnalSegments.length === 0) {
        return oKeepAliveContext;
      } else {
        additionnalSegments.reverse();
        var additionnalPath = additionnalSegments.join("/");
        return oModel.bindContext(additionnalPath, oKeepAliveContext).getBoundContext();
      }
    }

    /**
     * Switches between column and full-screen mode when FCL is used.
     *
     * @ui5-restricted
     */;
    _proto.switchFullScreen = function switchFullScreen() {
      var oSource = this.base.getView();
      var oFCLHelperModel = oSource.getModel("fclhelper"),
        bIsFullScreen = oFCLHelperModel.getProperty("/actionButtonsInfo/isFullScreen"),
        sNextLayout = oFCLHelperModel.getProperty(bIsFullScreen ? "/actionButtonsInfo/exitFullScreen" : "/actionButtonsInfo/fullScreen"),
        oRootViewController = this._oAppComponent.getRootViewController();
      var oContext = oRootViewController.getRightmostContext ? oRootViewController.getRightmostContext() : oSource.getBindingContext();
      this.base._routing.navigateToContext(oContext, {
        sLayout: sNextLayout
      }).catch(function () {
        Log.warning("cannot switch between column and fullscreen");
      });
    }

    /**
     * Closes the column for the current view in a FCL.
     *
     * @ui5-restricted
     */;
    _proto.closeColumn = function closeColumn() {
      var oSource = this.base.getView();
      var oViewData = oSource.getViewData();
      var oContext = oSource.getBindingContext();
      var base = this.base;
      var oMetaModel = oContext.getModel().getMetaModel();
      if (oViewData && oViewData.viewLevel === 1 && ModelHelper.isDraftSupported(oMetaModel, oContext.getPath())) {
        draft.processDataLossOrDraftDiscardConfirmation(function () {
          base._routing.navigateBackFromContext(oContext, {
            noPreservationCache: true
          });
        }, Function.prototype, oContext, oSource.getController(), false, draft.NavigationType.BackNavigation);
      } else {
        base._routing.navigateBackFromContext(oContext, {
          noPreservationCache: true
        });
      }
    };
    return InternalRouting;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatched", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatched"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatchedFinished", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatchedFinished"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeBinding", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToTarget", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToTarget"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToRoute", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToRoute"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToContext", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateBackFromContext", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateBackFromContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateForwardToContext", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateForwardToContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateBackFromTransientState", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateBackFromTransientState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToMessagePage", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToMessagePage"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isCurrentStateImpactedBy", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "isCurrentStateImpactedBy"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "switchFullScreen", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "switchFullScreen"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "closeColumn", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "closeColumn"), _class2.prototype)), _class2)) || _class);
  return InternalRouting;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiSW50ZXJuYWxSb3V0aW5nIiwiZGVmaW5lVUk1Q2xhc3MiLCJtZXRob2RPdmVycmlkZSIsInB1YmxpY0V4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwiZmluYWxFeHRlbnNpb24iLCJCZWZvcmUiLCJvbkV4aXQiLCJfb1JvdXRpbmdTZXJ2aWNlIiwiZGV0YWNoUm91dGVNYXRjaGVkIiwiX2ZuUm91dGVNYXRjaGVkQm91bmQiLCJvbkluaXQiLCJfb1ZpZXciLCJiYXNlIiwiZ2V0VmlldyIsIl9vQXBwQ29tcG9uZW50IiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJfb1BhZ2VDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIl9vUm91dGVyIiwiZ2V0Um91dGVyIiwiX29Sb3V0ZXJQcm94eSIsImdldFJvdXRlclByb3h5IiwiRXJyb3IiLCJnZXRTZXJ2aWNlIiwib1JvdXRpbmdTZXJ2aWNlIiwiX29uUm91dGVNYXRjaGVkIiwiYmluZCIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsIl9vVGFyZ2V0SW5mb3JtYXRpb24iLCJnZXRUYXJnZXRJbmZvcm1hdGlvbkZvciIsImNhdGNoIiwib25Sb3V0ZU1hdGNoZWQiLCJvblJvdXRlTWF0Y2hlZEZpbmlzaGVkIiwib25CZWZvcmVCaW5kaW5nIiwib0JpbmRpbmdDb250ZXh0IiwibVBhcmFtZXRlcnMiLCJvUm91dGluZyIsImdldENvbnRyb2xsZXIiLCJyb3V0aW5nIiwib25BZnRlckJpbmRpbmciLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJvbkNvbnRleHRCb3VuZFRvVmlldyIsIm5hdmlnYXRlVG9UYXJnZXQiLCJvQ29udGV4dCIsInNOYXZpZ2F0aW9uVGFyZ2V0TmFtZSIsIm9TZW1hbnRpY09iamVjdCIsImJQcmVzZXJ2ZUhpc3RvcnkiLCJvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24iLCJnZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiIsIm9EZXRhaWxSb3V0ZSIsImRldGFpbCIsInNSb3V0ZU5hbWUiLCJyb3V0ZSIsIm1QYXJhbWV0ZXJNYXBwaW5nIiwicGFyYW1ldGVycyIsIm5hdmlnYXRlVG8iLCJnZXRWaWV3RGF0YSIsIm5hdmlnYXRlVG9Sb3V0ZSIsInNUYXJnZXRSb3V0ZU5hbWUiLCJvUGFyYW1ldGVycyIsIm5hdmlnYXRlVG9Db250ZXh0Iiwib0NvbnRleHRJbmZvIiwiaXNBIiwiYXN5bmNDb250ZXh0IiwiYWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJlZGl0YWJsZSIsImJQZXJzaXN0T1BTY3JvbGwiLCJ1cGRhdGVGQ0xMZXZlbCIsImJGb3JjZUZvY3VzIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJiRGVmZXJyZWRDb250ZXh0IiwiY2FsbEV4dGVuc2lvbiIsIm9JbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJzZXRQcm9wZXJ0eSIsInNvdXJjZUJpbmRpbmdDb250ZXh0IiwiZ2V0T2JqZWN0IiwiYmluZGluZ0NvbnRleHQiLCJvRXZlbnQiLCJiT3ZlcnJpZGVOYXYiLCJvbkJlZm9yZU5hdmlnYXRpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsIkZDTExldmVsIiwiX2dldEZDTExldmVsIiwibmF2aWdhdGVCYWNrRnJvbUNvbnRleHQiLCJuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldFByb3BlcnR5IiwibmF2aWdhdGVCYWNrRnJvbVRyYW5zaWVudFN0YXRlIiwic0hhc2giLCJnZXRIYXNoIiwiaW5kZXhPZiIsIm5hdkJhY2siLCJuYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UiLCJzRXJyb3JNZXNzYWdlIiwibmF2VG9IYXNoIiwiZ2V0RGVmYXVsdENyZWF0ZUhhc2giLCJkaXNwbGF5TWVzc2FnZVBhZ2UiLCJpc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkiLCJfaXNWaWV3UGFydE9mUm91dGUiLCJyb3V0ZUluZm9ybWF0aW9uIiwiYVRhcmdldHMiLCJ0YXJnZXRzIiwidGFyZ2V0TmFtZSIsInZpZXdMZXZlbCIsInJvdXRlTGV2ZWwiLCJfc2V0QmluZGluZ0NvbnRleHQiLCJfYnVpbGRCaW5kaW5nUGF0aCIsInJvdXRlQXJndW1lbnRzIiwiYmluZGluZ1BhdHRlcm4iLCJuYXZpZ2F0aW9uUGFyYW1ldGVycyIsInBhdGgiLCJyZXBsYWNlIiwiZGVmZXJyZWQiLCJzS2V5Iiwic1ZhbHVlIiwiYlRhcmdldEVkaXRhYmxlIiwiaGFzT3duUHJvcGVydHkiLCJiQWN0aW9uQ3JlYXRlIiwiZ2V0UGFyYW1ldGVyIiwiZ2V0QmluZGluZ0NvbnRleHRQYXR0ZXJuIiwiY29udGV4dFBhdHRlcm4iLCJ1bmRlZmluZWQiLCJtQXJndW1lbnRzIiwiZ2V0UGFyYW1ldGVycyIsImFyZ3VtZW50cyIsIm9OYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm9Nb2RlbCIsIm9PdXQiLCJfYmluZERlZmVycmVkIiwiX2JpbmRQYWdlIiwiZmluYWxseSIsInVwZGF0ZVVJU3RhdGVGb3JWaWV3Iiwic1RhcmdldFBhdGgiLCJvQXN5bmNDb250ZXh0IiwiY3JlYXRlRGVmZXJyZWRDb250ZXh0IiwidXNlQ29udGV4dCIsImN1cnJlbnRCaW5kaW5nQ29udGV4dCIsIl9nZXRCaW5kaW5nQ29udGV4dCIsImhhc1BlbmRpbmdDaGFuZ2VzIiwiZ2V0QmluZGluZyIsInJlc2V0Q2hhbmdlcyIsIl9iaW5kUGFnZVRvQ29udGV4dCIsIl9yZXNvbHZlU2VtYW50aWNQYXRoIiwic1RlY2huaWNhbFBhdGgiLCJfYmluZFBhZ2VUb1BhdGgiLCJvUmVzb3VyY2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZ2V0VGV4dCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwiX2NyZWF0ZUZpbHRlckZyb21TZW1hbnRpY1BhdGgiLCJzU2VtYW50aWNQYXRoIiwiYVNlbWFudGljS2V5cyIsIm9NZXRhTW9kZWwiLCJmblVucXVvdGVBbmREZWNvZGUiLCJsYXN0SW5kZXhPZiIsImxlbmd0aCIsImRlY29kZVVSSUNvbXBvbmVudCIsInN1YnN0cmluZyIsImFLZXlWYWx1ZXMiLCJzcGxpdCIsImFGaWx0ZXJzIiwiYkZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUiLCJNb2RlbEhlbHBlciIsImlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSIsInNLZXlWYWx1ZSIsIkZpbHRlciIsIiRQcm9wZXJ0eVBhdGgiLCJvcGVyYXRvciIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJ2YWx1ZTEiLCJjYXNlU2Vuc2l0aXZlIiwibUtleVZhbHVlcyIsImZvckVhY2giLCJzS2V5QXNzaWdubWVudCIsImFQYXJ0cyIsImJGYWlsZWQiLCJtYXAiLCJvU2VtYW50aWNLZXkiLCJvRHJhZnRGaWx0ZXIiLCJmaWx0ZXJzIiwiYW5kIiwicHVzaCIsIl9nZXRUZWNobmljYWxQYXRoRnJvbVNlbWFudGljUGF0aCIsImdldE1ldGFNb2RlbCIsInNFbnRpdHlTZXRQYXRoIiwiZ2V0TWV0YUNvbnRleHQiLCJnZXRQYXRoIiwib0ZpbHRlciIsInN0YXJ0c1dpdGgiLCJvTGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsInJlcXVlc3RDb250ZXh0cyIsIm9Db250ZXh0cyIsIl9jaGVja1BhdGhGb3JTZW1hbnRpY0Jvb2ttYXJraW5nIiwic1BhdGgiLCJhTWF0Y2hlcyIsImV4ZWMiLCJvRHJhZnRSb290Iiwib0RyYWZ0Tm9kZSIsInNQYXRoVG9SZXNvbHZlIiwib0xhc3RTZW1hbnRpY01hcHBpbmciLCJnZXRMYXN0U2VtYW50aWNNYXBwaW5nIiwic0N1cnJlbnRIYXNoTm9QYXJhbXMiLCJnZXRIYXNoQ2hhbmdlciIsInNSb290RW50aXR5TmFtZSIsInN1YnN0ciIsImJBbGxvd1NlbWFudGljQm9va21hcmsiLCJTZW1hbnRpY0tleUhlbHBlciIsImdldFNlbWFudGljS2V5cyIsInNlbWFudGljUGF0aCIsInRlY2huaWNhbFBhdGgiLCJzZXRMYXN0U2VtYW50aWNNYXBwaW5nIiwib0N1cnJlbnRDb250ZXh0Iiwic0N1cnJlbnRQYXRoIiwib1VzZUNvbnRleHQiLCJvVGFyZ2V0Q29udGV4dCIsIl9jcmVhdGVDb250ZXh0IiwiYlJlYXNvbklzSWFwcFN0YXRlIiwiRWRpdFN0YXRlIiwiaXNFZGl0U3RhdGVEaXJ0eSIsIl9yZWZyZXNoQmluZGluZ0NvbnRleHQiLCJvUGFyZW50TGlzdEJpbmRpbmciLCJvUm9vdFZpZXdDb250cm9sbGVyIiwiaXNGY2xFbmFibGVkIiwiX3NldEtlZXBBbGl2ZSIsImlzQ29udGV4dFVzZWRJblBhZ2VzIiwibGlzdEJpbmRpbmciLCJiRHJhZnROYXZpZ2F0aW9uIiwic2hvd1BsYWNlaG9sZGVyIiwiYlNob3dQbGFjZWhvbGRlciIsIm9QYWdlQ29tcG9uZW50Iiwic0VudGl0eVNldCIsImdldEVudGl0eVNldCIsInNDb250ZXh0UGF0aCIsImdldENvbnRleHRQYXRoIiwiJCRncm91cElkIiwiJCR1cGRhdGVHcm91cElkIiwiJCRwYXRjaFdpdGhvdXRTaWRlRWZmZWN0cyIsIl9nZXRLZWVwQWxpdmVDb250ZXh0IiwicmVxdWVzdFByb3BlcnR5IiwicmVxdWVzdE9iamVjdCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsInNNZXNzYWdlc1BhdGgiLCIkc2VsZWN0Iiwib1ByZXZpb3VzQmluZGluZyIsImRlc3Ryb3kiLCJvSGlkZGVuQmluZGluZyIsImJpbmRDb250ZXh0IiwiYXR0YWNoRXZlbnRPbmNlIiwiQnVzeUxvY2tlciIsImxvY2siLCJfZGF0YVJlY2VpdmVkRXZlbnRIYW5kbGVyIiwiZ2V0Qm91bmRDb250ZXh0Iiwic0Vycm9yRGVzY3JpcHRpb24iLCJ1bmxvY2siLCJtZXNzYWdlSGFuZGxlciIsIm1QYXJhbXMiLCJzdGF0dXMiLCJpc0luaXRpYWxMb2FkNTAzRXJyb3IiLCJzaGVsbEJhY2siLCJpc0RhdGFSZWNlaXZlZEVycm9yIiwic2hvd01lc3NhZ2VzIiwib1NpZGVFZmZlY3RzU2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsInNSb290Q29udGV4dFBhdGgiLCJhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMiLCJhUHJvcGVydHlQYXRocyIsIm9TaWRlRWZmZWN0cyIsIlRhcmdldFByb3BlcnRpZXMiLCJUYXJnZXRFbnRpdGllcyIsImdldEJpbmRpbmdQYXRocyIsIm9CaW5kaW5nIiwiYURlcGVuZGVudEJpbmRpbmdzIiwic1JlbGF0aXZlUGF0aCIsImdldENvbnRleHQiLCJzbGljZSIsImdldERlcGVuZGVudEJpbmRpbmdzIiwiaSIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwic1RhcmdldFByb3BlcnR5IiwiaW5kZXgiLCJjb25jYXQiLCJvUHJldmlvdXNDb250ZXh0Iiwib1RhcmdldENvbnRyb2wiLCJzZXRCaW5kaW5nQ29udGV4dCIsImlzS2VlcEFsaXZlIiwiYktlZXBBbGl2ZSIsImZuQmVmb3JlRGVzdHJveSIsImJSZXF1ZXN0TWVzc2FnZXMiLCJlbmRzV2l0aCIsInNNZXRhUGF0aCIsImdldE1ldGFQYXRoIiwic2V0S2VlcEFsaXZlIiwia2VwdEFsaXZlU2VnbWVudHMiLCJhZGRpdGlvbm5hbFNlZ21lbnRzIiwicG9wIiwia2VwdEFsaXZlUGF0aCIsImpvaW4iLCJvS2VlcEFsaXZlQ29udGV4dCIsImdldEtlZXBBbGl2ZUNvbnRleHQiLCJyZXZlcnNlIiwiYWRkaXRpb25uYWxQYXRoIiwic3dpdGNoRnVsbFNjcmVlbiIsIm9Tb3VyY2UiLCJvRkNMSGVscGVyTW9kZWwiLCJiSXNGdWxsU2NyZWVuIiwic05leHRMYXlvdXQiLCJnZXRSaWdodG1vc3RDb250ZXh0IiwiX3JvdXRpbmciLCJzTGF5b3V0Iiwid2FybmluZyIsImNsb3NlQ29sdW1uIiwib1ZpZXdEYXRhIiwiaXNEcmFmdFN1cHBvcnRlZCIsImRyYWZ0IiwicHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24iLCJub1ByZXNlcnZhdGlvbkNhY2hlIiwiRnVuY3Rpb24iLCJwcm90b3R5cGUiLCJOYXZpZ2F0aW9uVHlwZSIsIkJhY2tOYXZpZ2F0aW9uIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSW50ZXJuYWxSb3V0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgdHlwZSBSb3V0ZXJQcm94eSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvcm91dGluZy9Sb3V0ZXJQcm94eVwiO1xuaW1wb3J0IHR5cGUgeyBFbmhhbmNlV2l0aFVJNSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBtZXRob2RPdmVycmlkZSwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRWRpdFN0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0VkaXRTdGF0ZVwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2VtYW50aWNLZXlIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2VtYW50aWNLZXlIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBSb3V0aW5nU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9Sb3V0aW5nU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIFRlbXBsYXRlQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZUNvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgUm91dGVyIGZyb20gXCJzYXAvdWkvY29yZS9yb3V0aW5nL1JvdXRlclwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcblxuLyoqXG4gKiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLkNvbnRyb2xsZXJFeHRlbnNpb24gQ29udHJvbGxlciBleHRlbnNpb259XG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsUm91dGluZ1xuICogQHByaXZhdGVcbiAqIEBzaW5jZSAxLjc0LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuSW50ZXJuYWxSb3V0aW5nXCIpXG5jbGFzcyBJbnRlcm5hbFJvdXRpbmcgZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJpdmF0ZSBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdHByaXZhdGUgX29WaWV3ITogVmlldztcblx0cHJpdmF0ZSBfb0FwcENvbXBvbmVudCE6IEFwcENvbXBvbmVudDtcblx0cHJpdmF0ZSBfb1BhZ2VDb21wb25lbnQhOiBFbmhhbmNlV2l0aFVJNTxUZW1wbGF0ZUNvbXBvbmVudD4gfCBudWxsO1xuXHRwcml2YXRlIF9vUm91dGVyITogUm91dGVyO1xuXHRwcml2YXRlIF9vUm91dGluZ1NlcnZpY2UhOiBSb3V0aW5nU2VydmljZTtcblx0cHJpdmF0ZSBfb1JvdXRlclByb3h5ITogUm91dGVyUHJveHk7XG5cdHByaXZhdGUgX2ZuUm91dGVNYXRjaGVkQm91bmQhOiBGdW5jdGlvbjtcblx0cHJvdGVjdGVkIF9vVGFyZ2V0SW5mb3JtYXRpb246IGFueTtcblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRvbkV4aXQoKSB7XG5cdFx0aWYgKHRoaXMuX29Sb3V0aW5nU2VydmljZSkge1xuXHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmRldGFjaFJvdXRlTWF0Y2hlZCh0aGlzLl9mblJvdXRlTWF0Y2hlZEJvdW5kKTtcblx0XHR9XG5cdH1cblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRvbkluaXQoKSB7XG5cdFx0dGhpcy5fb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHRcdHRoaXMuX29BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5fb1ZpZXcpO1xuXHRcdHRoaXMuX29QYWdlQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRoaXMuX29WaWV3KSBhcyBFbmhhbmNlV2l0aFVJNTxUZW1wbGF0ZUNvbXBvbmVudD47XG5cdFx0dGhpcy5fb1JvdXRlciA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0Um91dGVyKCk7XG5cdFx0dGhpcy5fb1JvdXRlclByb3h5ID0gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb3V0ZXJQcm94eSgpO1xuXG5cdFx0aWYgKCF0aGlzLl9vQXBwQ29tcG9uZW50IHx8ICF0aGlzLl9vUGFnZUNvbXBvbmVudCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGluaXRpYWxpemUgY29udHJvbGVyIGV4dGVuc2lvbiAnc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVzaW9ucy5JbnRlcm5hbFJvdXRpbmdcIik7XG5cdFx0fVxuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpZiAodGhpcy5fb0FwcENvbXBvbmVudCA9PT0gdGhpcy5fb1BhZ2VDb21wb25lbnQpIHtcblx0XHRcdC8vIFRoZSB2aWV3IGlzbid0IGhvc3RlZCBpbiBhIGRlZGljYXRlZCBVSUNvbXBvbmVudCwgYnV0IGRpcmVjdGx5IGluIHRoZSBhcHBcblx0XHRcdC8vIC0tPiBqdXN0IGtlZXAgdGhlIHZpZXdcblx0XHRcdHRoaXMuX29QYWdlQ29tcG9uZW50ID0gbnVsbDtcblx0XHR9XG5cblx0XHR0aGlzLl9vQXBwQ29tcG9uZW50XG5cdFx0XHQuZ2V0U2VydmljZShcInJvdXRpbmdTZXJ2aWNlXCIpXG5cdFx0XHQudGhlbigob1JvdXRpbmdTZXJ2aWNlOiBSb3V0aW5nU2VydmljZSkgPT4ge1xuXHRcdFx0XHR0aGlzLl9vUm91dGluZ1NlcnZpY2UgPSBvUm91dGluZ1NlcnZpY2U7XG5cdFx0XHRcdHRoaXMuX2ZuUm91dGVNYXRjaGVkQm91bmQgPSB0aGlzLl9vblJvdXRlTWF0Y2hlZC5iaW5kKHRoaXMpO1xuXHRcdFx0XHR0aGlzLl9vUm91dGluZ1NlcnZpY2UuYXR0YWNoUm91dGVNYXRjaGVkKHRoaXMuX2ZuUm91dGVNYXRjaGVkQm91bmQpO1xuXHRcdFx0XHR0aGlzLl9vVGFyZ2V0SW5mb3JtYXRpb24gPSBvUm91dGluZ1NlcnZpY2UuZ2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3IodGhpcy5fb1BhZ2VDb21wb25lbnQgfHwgdGhpcy5fb1ZpZXcpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRoaXMgY29udHJvbGxlciBleHRlbnNpb24gY2Fubm90IHdvcmsgd2l0aG91dCBhICdyb3V0aW5nU2VydmljZScgb24gdGhlIG1haW4gQXBwQ29tcG9uZW50XCIpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgdGhpcyBjb250cm9sbGVyIGlzIGEgbmF2aWdhdGlvbiB0YXJnZXQuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUm91dGVNYXRjaGVkKCkge1xuXHRcdC8qKi9cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25Sb3V0ZU1hdGNoZWRGaW5pc2hlZCgpIHtcblx0XHQvKiovXG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlQmluZGluZyhvQmluZGluZ0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpIHtcblx0XHRjb25zdCBvUm91dGluZyA9ICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLnJvdXRpbmc7XG5cdFx0aWYgKG9Sb3V0aW5nICYmIG9Sb3V0aW5nLm9uQmVmb3JlQmluZGluZykge1xuXHRcdFx0b1JvdXRpbmcub25CZWZvcmVCaW5kaW5nKG9CaW5kaW5nQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25BZnRlckJpbmRpbmcob0JpbmRpbmdDb250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzPzogYW55KSB7XG5cdFx0KHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS5vbkNvbnRleHRCb3VuZFRvVmlldyhvQmluZGluZ0NvbnRleHQpO1xuXHRcdGNvbnN0IG9Sb3V0aW5nID0gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkucm91dGluZztcblx0XHRpZiAob1JvdXRpbmcgJiYgb1JvdXRpbmcub25BZnRlckJpbmRpbmcpIHtcblx0XHRcdG9Sb3V0aW5nLm9uQWZ0ZXJCaW5kaW5nKG9CaW5kaW5nQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIE1ldGhvZHMgdHJpZ2dlcmluZyBhIG5hdmlnYXRpb24gYWZ0ZXIgYSB1c2VyIGFjdGlvblxuXHQvLyAoZS5nLiBjbGljayBvbiBhIHRhYmxlIHJvdywgYnV0dG9uLCBldGMuLi4pXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byB0aGUgc3BlY2lmaWVkIG5hdmlnYXRpb24gdGFyZ2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gc05hdmlnYXRpb25UYXJnZXROYW1lIE5hdmlnYXRpb24gdGFyZ2V0IG5hbWVcblx0ICogQHBhcmFtIG9TZW1hbnRpY09iamVjdCBTZW1hbnRpYyBvYmplY3Rcblx0ICogQHBhcmFtIGJQcmVzZXJ2ZUhpc3RvcnkgVHJ1ZSB0byBmb3JjZSB0aGUgbmV3IFVSTCB0byBiZSBhZGRlZCBhdCB0aGUgZW5kIG9mIHRoZSBicm93c2VyIGhpc3RvcnkgKG5vIHJlcGxhY2UpXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdG5hdmlnYXRlVG9UYXJnZXQob0NvbnRleHQ6IGFueSwgc05hdmlnYXRpb25UYXJnZXROYW1lOiBzdHJpbmcsIG9TZW1hbnRpY09iamVjdD86IG9iamVjdCwgYlByZXNlcnZlSGlzdG9yeT86IGJvb2xlYW4pIHtcblx0XHRjb25zdCBvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24gPVxuXHRcdFx0dGhpcy5fb1BhZ2VDb21wb25lbnQgJiZcblx0XHRcdHRoaXMuX29QYWdlQ29tcG9uZW50LmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uICYmXG5cdFx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihzTmF2aWdhdGlvblRhcmdldE5hbWUpO1xuXHRcdGlmIChvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24pIHtcblx0XHRcdGNvbnN0IG9EZXRhaWxSb3V0ZSA9IG9OYXZpZ2F0aW9uQ29uZmlndXJhdGlvbi5kZXRhaWw7XG5cdFx0XHRjb25zdCBzUm91dGVOYW1lID0gb0RldGFpbFJvdXRlLnJvdXRlO1xuXHRcdFx0Y29uc3QgbVBhcmFtZXRlck1hcHBpbmcgPSBvRGV0YWlsUm91dGUucGFyYW1ldGVycztcblx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvKG9Db250ZXh0LCBzUm91dGVOYW1lLCBtUGFyYW1ldGVyTWFwcGluZywgYlByZXNlcnZlSGlzdG9yeSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvKG9Db250ZXh0LCBudWxsLCBudWxsLCBiUHJlc2VydmVIaXN0b3J5KTtcblx0XHR9XG5cdFx0dGhpcy5fb1ZpZXcuZ2V0Vmlld0RhdGEoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gdGhlIHNwZWNpZmllZCBuYXZpZ2F0aW9uIHRhcmdldCByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHNUYXJnZXRSb3V0ZU5hbWUgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBbb1BhcmFtZXRlcnNdIFBhcmFtZXRlcnMgdG8gYmUgdXNlZCB3aXRoIHJvdXRlIHRvIGNyZWF0ZSB0aGUgdGFyZ2V0IGhhc2hcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdG5hdmlnYXRlVG9Sb3V0ZShzVGFyZ2V0Um91dGVOYW1lOiBzdHJpbmcsIG9QYXJhbWV0ZXJzPzogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvUm91dGUoc1RhcmdldFJvdXRlTmFtZSwgb1BhcmFtZXRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byBhIHNwZWNpZmljIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0byBiZSBuYXZpZ2F0ZWQgdG9cblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBvQ29udGV4dEluZm86IGFueSA9IHt9O1xuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cblx0XHRpZiAob0NvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdGlmIChtUGFyYW1ldGVycy5hc3luY0NvbnRleHQpIHtcblx0XHRcdFx0Ly8gdGhlIGNvbnRleHQgaXMgZWl0aGVyIGNyZWF0ZWQgYXN5bmMgKFByb21pc2UpXG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gYWN0aXZhdGUgdGhlIHJvdXRlTWF0Y2hTeW5jaHJvIG9uIHRoZSBSb3V0ZXJQcm94eSB0byBhdm9pZCB0aGF0XG5cdFx0XHRcdC8vIHRoZSBzdWJzZXF1ZW50IGNhbGwgdG8gbmF2aWdhdGVUb0NvbnRleHQgY29uZmxpY3RzIHdpdGggdGhlIGN1cnJlbnQgb25lXG5cdFx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5hY3RpdmF0ZVJvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24oKTtcblxuXHRcdFx0XHRtUGFyYW1ldGVycy5hc3luY0NvbnRleHRcblx0XHRcdFx0XHQudGhlbigoYXN5bmNDb250ZXh0OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdC8vIG9uY2UgdGhlIGNvbnRleHQgaXMgcmV0dXJuZWQgd2UgbmF2aWdhdGUgaW50byBpdFxuXHRcdFx0XHRcdFx0dGhpcy5uYXZpZ2F0ZVRvQ29udGV4dChhc3luY0NvbnRleHQsIHtcblx0XHRcdFx0XHRcdFx0Y2hlY2tOb0hhc2hDaGFuZ2U6IG1QYXJhbWV0ZXJzLmNoZWNrTm9IYXNoQ2hhbmdlLFxuXHRcdFx0XHRcdFx0XHRlZGl0YWJsZTogbVBhcmFtZXRlcnMuZWRpdGFibGUsXG5cdFx0XHRcdFx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IG1QYXJhbWV0ZXJzLmJQZXJzaXN0T1BTY3JvbGwsXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZUZDTExldmVsOiBtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCxcblx0XHRcdFx0XHRcdFx0YkZvcmNlRm9jdXM6IG1QYXJhbWV0ZXJzLmJGb3JjZUZvY3VzXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdpdGggdGhlIGFzeW5jIGNvbnRleHRcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoIW1QYXJhbWV0ZXJzLmJEZWZlcnJlZENvbnRleHQpIHtcblx0XHRcdFx0Ly8gTmF2aWdhdGUgdG8gYSBsaXN0IGJpbmRpbmcgbm90IHlldCBzdXBwb3J0ZWRcblx0XHRcdFx0dGhyb3cgXCJuYXZpZ2F0aW9uIHRvIGEgbGlzdCBiaW5kaW5nIGlzIG5vdCB5ZXQgc3VwcG9ydGVkXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmNhbGxFeHRlbnNpb24pIHtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsID0gdGhpcy5fb1ZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9wYWdpbmF0b3JDdXJyZW50Q29udGV4dFwiLCBudWxsKTtcblxuXHRcdFx0b0NvbnRleHRJbmZvLnNvdXJjZUJpbmRpbmdDb250ZXh0ID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRvQ29udGV4dEluZm8uYmluZGluZ0NvbnRleHQgPSBvQ29udGV4dDtcblx0XHRcdGlmIChtUGFyYW1ldGVycy5vRXZlbnQpIHtcblx0XHRcdFx0b0NvbnRleHRJbmZvLm9FdmVudCA9IG1QYXJhbWV0ZXJzLm9FdmVudDtcblx0XHRcdH1cblx0XHRcdC8vIFN0b3JpbmcgdGhlIHNlbGVjdGVkIGNvbnRleHQgdG8gdXNlIGl0IGluIGludGVybmFsIHJvdXRlIG5hdmlnYXRpb24gaWYgbmVjY2Vzc2FyeS5cblx0XHRcdGNvbnN0IGJPdmVycmlkZU5hdiA9ICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLnJvdXRpbmcub25CZWZvcmVOYXZpZ2F0aW9uKG9Db250ZXh0SW5mbyk7XG5cdFx0XHRpZiAoYk92ZXJyaWRlTmF2KSB7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3BhZ2luYXRvckN1cnJlbnRDb250ZXh0XCIsIG9Db250ZXh0KTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0bVBhcmFtZXRlcnMuRkNMTGV2ZWwgPSB0aGlzLl9nZXRGQ0xMZXZlbCgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvQ29udGV4dChvQ29udGV4dCwgbVBhcmFtZXRlcnMsIHRoaXMuX29WaWV3LmdldFZpZXdEYXRhKCksIHRoaXMuX29UYXJnZXRJbmZvcm1hdGlvbik7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIGJhY2t3YXJkcyBmcm9tIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgbmF2aWdhdGVkIGZyb21cblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpIHtcblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdG1QYXJhbWV0ZXJzLnVwZGF0ZUZDTExldmVsID0gLTE7XG5cblx0XHRyZXR1cm4gdGhpcy5uYXZpZ2F0ZVRvQ29udGV4dChvQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyBmb3J3YXJkcyB0byBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgT3B0aW9uYWwgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzPzogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0aWYgKHRoaXMuX29WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik/LmdldFByb3BlcnR5KFwibWVzc2FnZUZvb3RlckNvbnRhaW5zRXJyb3JzXCIpID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdH1cblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdG1QYXJhbWV0ZXJzLnVwZGF0ZUZDTExldmVsID0gMTtcblxuXHRcdHJldHVybiB0aGlzLm5hdmlnYXRlVG9Db250ZXh0KG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIGJhY2sgaW4gaGlzdG9yeSBpZiB0aGUgY3VycmVudCBoYXNoIGNvcnJlc3BvbmRzIHRvIGEgdHJhbnNpZW50IHN0YXRlLlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG5hdmlnYXRlQmFja0Zyb21UcmFuc2llbnRTdGF0ZSgpIHtcblx0XHRjb25zdCBzSGFzaCA9IHRoaXMuX29Sb3V0ZXJQcm94eS5nZXRIYXNoKCk7XG5cblx0XHQvLyBpZiB0cmlnZ2VyZWQgd2hpbGUgbmF2aWdhdGluZyB0byAoLi4uKSwgd2UgbmVlZCB0byBuYXZpZ2F0ZSBiYWNrXG5cdFx0aWYgKHNIYXNoLmluZGV4T2YoXCIoLi4uKVwiKSAhPT0gLTEpIHtcblx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5uYXZCYWNrKCk7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG5hdmlnYXRlVG9NZXNzYWdlUGFnZShzRXJyb3JNZXNzYWdlOiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdGlmIChcblx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5nZXRIYXNoKCkuaW5kZXhPZihcImktYWN0aW9uPWNyZWF0ZVwiKSA+IC0xIHx8XG5cdFx0XHR0aGlzLl9vUm91dGVyUHJveHkuZ2V0SGFzaCgpLmluZGV4T2YoXCJpLWFjdGlvbj1hdXRvQ3JlYXRlXCIpID4gLTFcblx0XHQpIHtcblx0XHRcdHJldHVybiB0aGlzLl9vUm91dGVyUHJveHkubmF2VG9IYXNoKHRoaXMuX29Sb3V0aW5nU2VydmljZS5nZXREZWZhdWx0Q3JlYXRlSGFzaCgpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bVBhcmFtZXRlcnMuRkNMTGV2ZWwgPSB0aGlzLl9nZXRGQ0xMZXZlbCgpO1xuXG5cdFx0XHRyZXR1cm4gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS5kaXNwbGF5TWVzc2FnZVBhZ2Uoc0Vycm9yTWVzc2FnZSwgbVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgb25lIG9mIHRoZSBjdXJyZW50IHZpZXdzIG9uIHRoZSBzY3JlZW4gaXMgYm91bmQgdG8gYSBnaXZlbiBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHRcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBzdGF0ZSBpcyBpbXBhY3RlZCBieSB0aGUgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRpc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkob0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9vUm91dGluZ1NlcnZpY2UuaXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KG9Db250ZXh0KTtcblx0fVxuXG5cdF9pc1ZpZXdQYXJ0T2ZSb3V0ZShyb3V0ZUluZm9ybWF0aW9uOiBhbnkpOiBib29sZWFuIHtcblx0XHRjb25zdCBhVGFyZ2V0cyA9IHJvdXRlSW5mb3JtYXRpb24/LnRhcmdldHM7XG5cdFx0aWYgKCFhVGFyZ2V0cyB8fCBhVGFyZ2V0cy5pbmRleE9mKHRoaXMuX29UYXJnZXRJbmZvcm1hdGlvbi50YXJnZXROYW1lKSA9PT0gLTEpIHtcblx0XHRcdC8vIElmIHRoZSB0YXJnZXQgZm9yIHRoaXMgdmlldyBoYXMgYSB2aWV3IGxldmVsIGdyZWF0ZXIgdGhhbiB0aGUgcm91dGUgbGV2ZWwsIGl0IG1lYW5zIHRoaXMgdmlldyBjb21lcyBcImFmdGVyXCIgdGhlIHJvdXRlXG5cdFx0XHQvLyBpbiB0ZXJtcyBvZiBuYXZpZ2F0aW9uLlxuXHRcdFx0Ly8gSW4gc3VjaCBjYXNlLCB3ZSByZW1vdmUgaXRzIGJpbmRpbmcgY29udGV4dCwgdG8gYXZvaWQgdGhpcyB2aWV3IHRvIGhhdmUgZGF0YSBpZiB3ZSBuYXZpZ2F0ZSB0byBpdCBsYXRlciBvblxuXHRcdFx0aWYgKCh0aGlzLl9vVGFyZ2V0SW5mb3JtYXRpb24udmlld0xldmVsID8/IDApID49IChyb3V0ZUluZm9ybWF0aW9uPy5yb3V0ZUxldmVsID8/IDApKSB7XG5cdFx0XHRcdHRoaXMuX3NldEJpbmRpbmdDb250ZXh0KG51bGwpOyAvLyBUaGlzIGFsc28gY2FsbCBzZXRLZWVwQWxpdmUoZmFsc2UpIG9uIHRoZSBjdXJyZW50IGNvbnRleHRcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdF9idWlsZEJpbmRpbmdQYXRoKHJvdXRlQXJndW1lbnRzOiBhbnksIGJpbmRpbmdQYXR0ZXJuOiBzdHJpbmcsIG5hdmlnYXRpb25QYXJhbWV0ZXJzOiBhbnkpOiB7IHBhdGg6IHN0cmluZzsgZGVmZXJyZWQ6IGJvb2xlYW4gfSB7XG5cdFx0bGV0IHBhdGggPSBiaW5kaW5nUGF0dGVybi5yZXBsYWNlKFwiOj9xdWVyeTpcIiwgXCJcIik7XG5cdFx0bGV0IGRlZmVycmVkID0gZmFsc2U7XG5cblx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gcm91dGVBcmd1bWVudHMpIHtcblx0XHRcdGNvbnN0IHNWYWx1ZSA9IHJvdXRlQXJndW1lbnRzW3NLZXldO1xuXHRcdFx0aWYgKHNWYWx1ZSA9PT0gXCIuLi5cIiAmJiBiaW5kaW5nUGF0dGVybi5pbmRleE9mKGB7JHtzS2V5fX1gKSA+PSAwKSB7XG5cdFx0XHRcdGRlZmVycmVkID0gdHJ1ZTtcblx0XHRcdFx0Ly8gU29tZXRpbWVzIGluIHByZWZlcnJlZE1vZGUgPSBjcmVhdGUsIHRoZSBlZGl0IGJ1dHRvbiBpcyBzaG93biBpbiBiYWNrZ3JvdW5kIHdoZW4gdGhlXG5cdFx0XHRcdC8vIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nIHNob3dzIHVwLCBzZXR0aW5nIGJUYXJnZXRFZGl0YWJsZSBwYXNzZXMgZWRpdGFibGUgYXMgdHJ1ZVxuXHRcdFx0XHQvLyB0byBvbkJlZm9yZUJpbmRpbmcgaW4gX2JpbmRUYXJnZXRQYWdlIGZ1bmN0aW9uXG5cdFx0XHRcdG5hdmlnYXRpb25QYXJhbWV0ZXJzLmJUYXJnZXRFZGl0YWJsZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKGB7JHtzS2V5fX1gLCBzVmFsdWUpO1xuXHRcdH1cblx0XHRpZiAocm91dGVBcmd1bWVudHNbXCI/cXVlcnlcIl0gJiYgcm91dGVBcmd1bWVudHNbXCI/cXVlcnlcIl0uaGFzT3duUHJvcGVydHkoXCJpLWFjdGlvblwiKSkge1xuXHRcdFx0bmF2aWdhdGlvblBhcmFtZXRlcnMuYkFjdGlvbkNyZWF0ZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gdGhlIGJpbmRpbmcgcGF0aCBpcyBhbHdheXMgYWJzb2x1dGVcblx0XHRpZiAocGF0aCAmJiBwYXRoWzBdICE9PSBcIi9cIikge1xuXHRcdFx0cGF0aCA9IGAvJHtwYXRofWA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgcGF0aCwgZGVmZXJyZWQgfTtcblx0fVxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIE1ldGhvZHMgdG8gYmluZCB0aGUgcGFnZSB3aGVuIGEgcm91dGUgaXMgbWF0Y2hlZFxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiBhIHJvdXRlIGlzIG1hdGNoZWQuXG5cdCAqIEJ1aWxkcyB0aGUgYmluZGluZyBjb250ZXh0IGZyb20gdGhlIG5hdmlnYXRpb24gcGFyYW1ldGVycywgYW5kIGJpbmQgdGhlIHBhZ2UgYWNjb3JkaW5nbHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfb25Sb3V0ZU1hdGNoZWQob0V2ZW50OiBFdmVudCkge1xuXHRcdC8vIENoZWNrIGlmIHRoZSB0YXJnZXQgZm9yIHRoaXMgdmlldyBpcyBwYXJ0IG9mIHRoZSBldmVudCB0YXJnZXRzIChpLmUuIGlzIGEgdGFyZ2V0IGZvciB0aGUgY3VycmVudCByb3V0ZSkuXG5cdFx0Ly8gSWYgbm90LCB3ZSBkb24ndCBuZWVkIHRvIGJpbmQgaXQgLS0+IHJldHVyblxuXHRcdGlmICghdGhpcy5faXNWaWV3UGFydE9mUm91dGUob0V2ZW50LmdldFBhcmFtZXRlcihcInJvdXRlSW5mb3JtYXRpb25cIikpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gUmV0cmlldmUgdGhlIGJpbmRpbmcgY29udGV4dCBwYXR0ZXJuXG5cdFx0bGV0IGJpbmRpbmdQYXR0ZXJuO1xuXHRcdGlmICh0aGlzLl9vUGFnZUNvbXBvbmVudCAmJiB0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXRCaW5kaW5nQ29udGV4dFBhdHRlcm4pIHtcblx0XHRcdGJpbmRpbmdQYXR0ZXJuID0gdGhpcy5fb1BhZ2VDb21wb25lbnQuZ2V0QmluZGluZ0NvbnRleHRQYXR0ZXJuKCk7XG5cdFx0fVxuXHRcdGJpbmRpbmdQYXR0ZXJuID0gYmluZGluZ1BhdHRlcm4gfHwgdGhpcy5fb1RhcmdldEluZm9ybWF0aW9uLmNvbnRleHRQYXR0ZXJuO1xuXG5cdFx0aWYgKGJpbmRpbmdQYXR0ZXJuID09PSBudWxsIHx8IGJpbmRpbmdQYXR0ZXJuID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIERvbid0IGRvIHRoaXMgaWYgd2UgYWxyZWFkeSBnb3Qgc1RhcmdldCA9PSAnJywgd2hpY2ggaXMgYSB2YWxpZCB0YXJnZXQgcGF0dGVyblxuXHRcdFx0YmluZGluZ1BhdHRlcm4gPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicm91dGVQYXR0ZXJuXCIpO1xuXHRcdH1cblxuXHRcdC8vIFJlcGxhY2UgdGhlIHBhcmFtZXRlcnMgYnkgdGhlaXIgdmFsdWVzIGluIHRoZSBiaW5kaW5nIGNvbnRleHQgcGF0dGVyblxuXHRcdGNvbnN0IG1Bcmd1bWVudHMgPSAob0V2ZW50LmdldFBhcmFtZXRlcnMoKSBhcyBhbnkpLmFyZ3VtZW50cztcblx0XHRjb25zdCBvTmF2aWdhdGlvblBhcmFtZXRlcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwibmF2aWdhdGlvbkluZm9cIik7XG5cdFx0Y29uc3QgeyBwYXRoLCBkZWZlcnJlZCB9ID0gdGhpcy5fYnVpbGRCaW5kaW5nUGF0aChtQXJndW1lbnRzLCBiaW5kaW5nUGF0dGVybiwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblxuXHRcdHRoaXMub25Sb3V0ZU1hdGNoZWQoKTtcblxuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX29WaWV3LmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbDtcblx0XHRsZXQgb091dDtcblx0XHRpZiAoZGVmZXJyZWQpIHtcblx0XHRcdG9PdXQgPSB0aGlzLl9iaW5kRGVmZXJyZWQocGF0aCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b091dCA9IHRoaXMuX2JpbmRQYWdlKHBhdGgsIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0b091dC5maW5hbGx5KCgpID0+IHtcblx0XHRcdHRoaXMub25Sb3V0ZU1hdGNoZWRGaW5pc2hlZCgpO1xuXHRcdH0pO1xuXG5cdFx0KHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS51cGRhdGVVSVN0YXRlRm9yVmlldyh0aGlzLl9vVmlldywgdGhpcy5fZ2V0RkNMTGV2ZWwoKSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVmZXJyZWQgYmluZGluZyAoZHVyaW5nIG9iamVjdCBjcmVhdGlvbikuXG5cdCAqXG5cdCAqIEBwYXJhbSBzVGFyZ2V0UGF0aCBUaGUgcGF0aCB0byB0aGUgZGVmZmVyZWQgY29udGV4dFxuXHQgKiBAcGFyYW0gb05hdmlnYXRpb25QYXJhbWV0ZXJzIE5hdmlnYXRpb24gcGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBBIFByb21pc2Vcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfYmluZERlZmVycmVkKHNUYXJnZXRQYXRoOiBzdHJpbmcsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyczogYW55KSB7XG5cdFx0dGhpcy5vbkJlZm9yZUJpbmRpbmcobnVsbCwgeyBlZGl0YWJsZTogb05hdmlnYXRpb25QYXJhbWV0ZXJzLmJUYXJnZXRFZGl0YWJsZSB9KTtcblxuXHRcdGlmIChvTmF2aWdhdGlvblBhcmFtZXRlcnMuYkRlZmVycmVkQ29udGV4dCB8fCAhb05hdmlnYXRpb25QYXJhbWV0ZXJzLm9Bc3luY0NvbnRleHQpIHtcblx0XHRcdC8vIGVpdGhlciB0aGUgY29udGV4dCBzaGFsbCBiZSBjcmVhdGVkIGluIHRoZSB0YXJnZXQgcGFnZSAoZGVmZXJyZWQgQ29udGV4dCkgb3IgaXQgc2hhbGxcblx0XHRcdC8vIGJlIGNyZWF0ZWQgYXN5bmMgYnV0IHRoZSB1c2VyIHJlZnJlc2hlZCB0aGUgcGFnZSAvIGJvb2ttYXJrZWQgdGhpcyBVUkxcblx0XHRcdC8vIFRPRE86IGN1cnJlbnRseSB0aGUgdGFyZ2V0IGNvbXBvbmVudCBjcmVhdGVzIHRoaXMgZG9jdW1lbnQgYnV0IHdlIHNoYWxsIG1vdmUgdGhpcyB0b1xuXHRcdFx0Ly8gYSBjZW50cmFsIHBsYWNlXG5cdFx0XHRpZiAodGhpcy5fb1BhZ2VDb21wb25lbnQgJiYgdGhpcy5fb1BhZ2VDb21wb25lbnQuY3JlYXRlRGVmZXJyZWRDb250ZXh0KSB7XG5cdFx0XHRcdHRoaXMuX29QYWdlQ29tcG9uZW50LmNyZWF0ZURlZmVycmVkQ29udGV4dChcblx0XHRcdFx0XHRzVGFyZ2V0UGF0aCxcblx0XHRcdFx0XHRvTmF2aWdhdGlvblBhcmFtZXRlcnMudXNlQ29udGV4dCxcblx0XHRcdFx0XHRvTmF2aWdhdGlvblBhcmFtZXRlcnMuYkFjdGlvbkNyZWF0ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IGN1cnJlbnRCaW5kaW5nQ29udGV4dCA9IHRoaXMuX2dldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0aWYgKGN1cnJlbnRCaW5kaW5nQ29udGV4dD8uaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0Ly8gRm9yIG5vdyByZW1vdmUgdGhlIHBlbmRpbmcgY2hhbmdlcyB0byBhdm9pZCB0aGUgbW9kZWwgcmFpc2VzIGVycm9ycyBhbmQgdGhlIG9iamVjdCBwYWdlIGlzIGF0IGxlYXN0IGJvdW5kXG5cdFx0XHQvLyBJZGVhbGx5IHRoZSB1c2VyIHNob3VsZCBiZSBhc2tlZCBmb3Jcblx0XHRcdGN1cnJlbnRCaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlIHRoZSBjb250ZXh0IHRvIGF2b2lkIHNob3dpbmcgb2xkIGRhdGFcblx0XHR0aGlzLl9zZXRCaW5kaW5nQ29udGV4dChudWxsKTtcblxuXHRcdHRoaXMub25BZnRlckJpbmRpbmcobnVsbCk7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgcGFnZSBmcm9tIGEgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIHNUYXJnZXRQYXRoIFRoZSBwYXRoIHRvIHRoZSBjb250ZXh0XG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSBvTmF2aWdhdGlvblBhcmFtZXRlcnMgTmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSByZXNvbHZlZCBvbmNlIHRoZSBiaW5kaW5nIGhhcyBiZWVuIHNldCBvbiB0aGUgcGFnZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9iaW5kUGFnZShzVGFyZ2V0UGF0aDogc3RyaW5nLCBvTW9kZWw6IE9EYXRhTW9kZWwsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyczogb2JqZWN0KSB7XG5cdFx0aWYgKHNUYXJnZXRQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JpbmRQYWdlVG9Db250ZXh0KG51bGwsIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9yZXNvbHZlU2VtYW50aWNQYXRoKHNUYXJnZXRQYXRoLCBvTW9kZWwpXG5cdFx0XHRcdC50aGVuKChzVGVjaG5pY2FsUGF0aDogYW55KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fYmluZFBhZ2VUb1BhdGgoc1RlY2huaWNhbFBhdGgsIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKChvRXJyb3I6IGFueSkgPT4ge1xuXHRcdFx0XHRcdC8vIEVycm9yIGhhbmRsaW5nIGZvciBlcnJvbmVvdXMgbWV0YWRhdGEgcmVxdWVzdFxuXHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlVG9NZXNzYWdlUGFnZShvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0RBVEFfUkVDRUlWRURfRVJST1JcIiksIHtcblx0XHRcdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IG9FcnJvci5tZXNzYWdlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBmaWx0ZXIgdG8gcmV0cmlldmUgYSBjb250ZXh0IGNvcnJlc3BvbmRpbmcgdG8gYSBzZW1hbnRpYyBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljUGF0aCBUaGUgc2VtYW50aWMgcGF0aFxuXHQgKiBAcGFyYW0gYVNlbWFudGljS2V5cyBUaGUgc2VtYW50aWMga2V5cyBmb3IgdGhlIHBhdGhcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIGluc3RhbmNlIG9mIHRoZSBtZXRhIG1vZGVsXG5cdCAqIEByZXR1cm5zIFRoZSBmaWx0ZXJcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfY3JlYXRlRmlsdGVyRnJvbVNlbWFudGljUGF0aChzU2VtYW50aWNQYXRoOiBzdHJpbmcsIGFTZW1hbnRpY0tleXM6IGFueVtdLCBvTWV0YU1vZGVsOiBvYmplY3QpIHtcblx0XHRjb25zdCBmblVucXVvdGVBbmREZWNvZGUgPSBmdW5jdGlvbiAoc1ZhbHVlOiBhbnkpIHtcblx0XHRcdGlmIChzVmFsdWUuaW5kZXhPZihcIidcIikgPT09IDAgJiYgc1ZhbHVlLmxhc3RJbmRleE9mKFwiJ1wiKSA9PT0gc1ZhbHVlLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0Ly8gUmVtb3ZlIHRoZSBxdW90ZXMgZnJvbSB0aGUgdmFsdWUgYW5kIGRlY29kZSBzcGVjaWFsIGNoYXJzXG5cdFx0XHRcdHNWYWx1ZSA9IGRlY29kZVVSSUNvbXBvbmVudChzVmFsdWUuc3Vic3RyaW5nKDEsIHNWYWx1ZS5sZW5ndGggLSAxKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc1ZhbHVlO1xuXHRcdH07XG5cdFx0Y29uc3QgYUtleVZhbHVlcyA9IHNTZW1hbnRpY1BhdGguc3Vic3RyaW5nKHNTZW1hbnRpY1BhdGguaW5kZXhPZihcIihcIikgKyAxLCBzU2VtYW50aWNQYXRoLmxlbmd0aCAtIDEpLnNwbGl0KFwiLFwiKTtcblx0XHRsZXQgYUZpbHRlcnM6IEZpbHRlcltdO1xuXG5cdFx0aWYgKGFTZW1hbnRpY0tleXMubGVuZ3RoICE9IGFLZXlWYWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRjb25zdCBiRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSA9IE1vZGVsSGVscGVyLmlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShvTWV0YU1vZGVsKTtcblxuXHRcdGlmIChhU2VtYW50aWNLZXlzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0Ly8gVGFrZSB0aGUgZmlyc3Qga2V5IHZhbHVlXG5cdFx0XHRjb25zdCBzS2V5VmFsdWUgPSBmblVucXVvdGVBbmREZWNvZGUoYUtleVZhbHVlc1swXSk7XG5cdFx0XHRhRmlsdGVycyA9IFtcblx0XHRcdFx0bmV3IEZpbHRlcih7XG5cdFx0XHRcdFx0cGF0aDogYVNlbWFudGljS2V5c1swXS4kUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSxcblx0XHRcdFx0XHR2YWx1ZTE6IHNLZXlWYWx1ZSxcblx0XHRcdFx0XHRjYXNlU2Vuc2l0aXZlOiBiRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZVxuXHRcdFx0XHR9KVxuXHRcdFx0XTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgbUtleVZhbHVlczogYW55ID0ge307XG5cdFx0XHQvLyBDcmVhdGUgYSBtYXAgb2YgYWxsIGtleSB2YWx1ZXNcblx0XHRcdGFLZXlWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoc0tleUFzc2lnbm1lbnQ6IHN0cmluZykge1xuXHRcdFx0XHRjb25zdCBhUGFydHMgPSBzS2V5QXNzaWdubWVudC5zcGxpdChcIj1cIiksXG5cdFx0XHRcdFx0c0tleVZhbHVlID0gZm5VbnF1b3RlQW5kRGVjb2RlKGFQYXJ0c1sxXSk7XG5cblx0XHRcdFx0bUtleVZhbHVlc1thUGFydHNbMF1dID0gc0tleVZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBiRmFpbGVkID0gZmFsc2U7XG5cdFx0XHRhRmlsdGVycyA9IGFTZW1hbnRpY0tleXMubWFwKGZ1bmN0aW9uIChvU2VtYW50aWNLZXk6IGFueSkge1xuXHRcdFx0XHRjb25zdCBzS2V5ID0gb1NlbWFudGljS2V5LiRQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0c1ZhbHVlID0gbUtleVZhbHVlc1tzS2V5XTtcblxuXHRcdFx0XHRpZiAoc1ZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdFx0XHRwYXRoOiBzS2V5LFxuXHRcdFx0XHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiBzVmFsdWUsXG5cdFx0XHRcdFx0XHRjYXNlU2Vuc2l0aXZlOiBiRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGJGYWlsZWQgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdHBhdGg6IFwiWFhcIlxuXHRcdFx0XHRcdH0pOyAvLyB3aWxsIGJlIGlnbm9yZSBhbnl3YXkgc2luY2Ugd2UgcmV0dXJuIGFmdGVyXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoYkZhaWxlZCkge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBBZGQgYSBkcmFmdCBmaWx0ZXIgdG8gbWFrZSBzdXJlIHdlIHRha2UgdGhlIGRyYWZ0IGVudGl0eSBpZiB0aGVyZSBpcyBvbmVcblx0XHQvLyBPciB0aGUgYWN0aXZlIGVudGl0eSBvdGhlcndpc2Vcblx0XHRjb25zdCBvRHJhZnRGaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtuZXcgRmlsdGVyKFwiSXNBY3RpdmVFbnRpdHlcIiwgXCJFUVwiLCBmYWxzZSksIG5ldyBGaWx0ZXIoXCJTaWJsaW5nRW50aXR5L0lzQWN0aXZlRW50aXR5XCIsIFwiRVFcIiwgbnVsbCldLFxuXHRcdFx0YW5kOiBmYWxzZVxuXHRcdH0pO1xuXHRcdGFGaWx0ZXJzLnB1c2gob0RyYWZ0RmlsdGVyKTtcblxuXHRcdHJldHVybiBuZXcgRmlsdGVyKGFGaWx0ZXJzLCB0cnVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHBhdGggd2l0aCBzZW1hbnRpYyBrZXlzIHRvIGEgcGF0aCB3aXRoIHRlY2huaWNhbCBrZXlzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljUGF0aCBUaGUgcGF0aCB3aXRoIHNlbWFudGljIGtleXNcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgbW9kZWwgZm9yIHRoZSBwYXRoXG5cdCAqIEBwYXJhbSBhU2VtYW50aWNLZXlzIFRoZSBzZW1hbnRpYyBrZXlzIGZvciB0aGUgcGF0aFxuXHQgKiBAcmV0dXJucyBBIFByb21pc2UgY29udGFpbmluZyB0aGUgcGF0aCB3aXRoIHRlY2huaWNhbCBrZXlzIGlmIHNTZW1hbnRpY1BhdGggY291bGQgYmUgaW50ZXJwcmV0ZWQgYXMgYSBzZW1hbnRpYyBwYXRoLCBudWxsIG90aGVyd2lzZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9nZXRUZWNobmljYWxQYXRoRnJvbVNlbWFudGljUGF0aChzU2VtYW50aWNQYXRoOiBzdHJpbmcsIG9Nb2RlbDogYW55LCBhU2VtYW50aWNLZXlzOiBhbnlbXSkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0bGV0IHNFbnRpdHlTZXRQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChzU2VtYW50aWNQYXRoKS5nZXRQYXRoKCk7XG5cblx0XHRpZiAoIWFTZW1hbnRpY0tleXMgfHwgYVNlbWFudGljS2V5cy5sZW5ndGggPT09IDApIHtcblx0XHRcdC8vIE5vIHNlbWFudGljIGtleXNcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXG5cdFx0Ly8gQ3JlYXRlIGEgc2V0IG9mIGZpbHRlcnMgY29ycmVzcG9uZGluZyB0byBhbGwga2V5c1xuXHRcdGNvbnN0IG9GaWx0ZXIgPSB0aGlzLl9jcmVhdGVGaWx0ZXJGcm9tU2VtYW50aWNQYXRoKHNTZW1hbnRpY1BhdGgsIGFTZW1hbnRpY0tleXMsIG9NZXRhTW9kZWwpO1xuXHRcdGlmIChvRmlsdGVyID09PSBudWxsKSB7XG5cdFx0XHQvLyBDb3VsZG4ndCBpbnRlcnByZXQgdGhlIHBhdGggYXMgYSBzZW1hbnRpYyBvbmVcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXG5cdFx0Ly8gTG9hZCB0aGUgY29ycmVzcG9uZGluZyBvYmplY3Rcblx0XHRpZiAoIXNFbnRpdHlTZXRQYXRoPy5zdGFydHNXaXRoKFwiL1wiKSkge1xuXHRcdFx0c0VudGl0eVNldFBhdGggPSBgLyR7c0VudGl0eVNldFBhdGh9YDtcblx0XHR9XG5cdFx0Y29uc3Qgb0xpc3RCaW5kaW5nID0gb01vZGVsLmJpbmRMaXN0KHNFbnRpdHlTZXRQYXRoLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgb0ZpbHRlciwge1xuXHRcdFx0XCIkJGdyb3VwSWRcIjogXCIkYXV0by5IZXJvZXNcIlxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG9MaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoMCwgMikudGhlbihmdW5jdGlvbiAob0NvbnRleHRzOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udGV4dHMgJiYgb0NvbnRleHRzLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHRzWzBdLmdldFBhdGgoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vIGRhdGEgY291bGQgYmUgbG9hZGVkXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHBhdGggaXMgZWxpZ2libGUgZm9yIHNlbWFudGljIGJvb2ttYXJraW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGggdG8gdGVzdFxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgYXNzb2NpYXRlZCBtZXRhZGF0YSBtb2RlbFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHBhdGggaXMgZWxpZ2libGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfY2hlY2tQYXRoRm9yU2VtYW50aWNCb29rbWFya2luZyhzUGF0aDogc3RyaW5nLCBvTWV0YU1vZGVsOiBhbnkpIHtcblx0XHQvLyBPbmx5IHBhdGggb24gcm9vdCBvYmplY3RzIGFsbG93IHNlbWFudGljIGJvb2ttYXJraW5nLCBpLmUuIHNQYXRoID0geHh4KHl5eSlcblx0XHRjb25zdCBhTWF0Y2hlcyA9IC9eW1xcL10/KFxcdyspXFwoW15cXC9dK1xcKSQvLmV4ZWMoc1BhdGgpO1xuXHRcdGlmICghYU1hdGNoZXMpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Ly8gR2V0IHRoZSBlbnRpdHlTZXQgbmFtZVxuXHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gYC8ke2FNYXRjaGVzWzFdfWA7XG5cdFx0Ly8gQ2hlY2sgdGhlIGVudGl0eSBzZXQgc3VwcG9ydHMgZHJhZnQgKG90aGVyd2lzZSB3ZSBkb24ndCBzdXBwb3J0IHNlbWFudGljIGJvb2ttYXJraW5nKVxuXHRcdGNvbnN0IG9EcmFmdFJvb3QgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdGApO1xuXHRcdGNvbnN0IG9EcmFmdE5vZGUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZWApO1xuXHRcdHJldHVybiBvRHJhZnRSb290IHx8IG9EcmFmdE5vZGUgPyB0cnVlIDogZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogQnVpbGRzIGEgcGF0aCB3aXRoIHNlbWFudGljIGtleXMgZnJvbSBhIHBhdGggd2l0aCB0ZWNobmljYWwga2V5cy5cblx0ICpcblx0ICogQHBhcmFtIHNQYXRoVG9SZXNvbHZlIFRoZSBwYXRoIHRvIGJlIHRyYW5zZm9ybWVkXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEByZXR1cm5zIFN0cmluZyBwcm9taXNlIGZvciB0aGUgbmV3IHBhdGguIElmIHNQYXRoVG9SZXNvbHZlZCBjb3VsZG4ndCBiZSBpbnRlcnByZXRlZCBhcyBhIHNlbWFudGljIHBhdGgsIGl0IGlzIHJldHVybmVkIGFzIGlzLlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9yZXNvbHZlU2VtYW50aWNQYXRoKHNQYXRoVG9SZXNvbHZlOiBzdHJpbmcsIG9Nb2RlbDogYW55KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IG9MYXN0U2VtYW50aWNNYXBwaW5nID0gdGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmdldExhc3RTZW1hbnRpY01hcHBpbmcoKTtcblx0XHRsZXQgc0N1cnJlbnRIYXNoTm9QYXJhbXMgPSB0aGlzLl9vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkuZ2V0SGFzaCgpLnNwbGl0KFwiP1wiKVswXTtcblxuXHRcdGlmIChzQ3VycmVudEhhc2hOb1BhcmFtcyAmJiBzQ3VycmVudEhhc2hOb1BhcmFtcy5sYXN0SW5kZXhPZihcIi9cIikgPT09IHNDdXJyZW50SGFzaE5vUGFyYW1zLmxlbmd0aCAtIDEpIHtcblx0XHRcdC8vIFJlbW92ZSB0cmFpbGluZyAnLydcblx0XHRcdHNDdXJyZW50SGFzaE5vUGFyYW1zID0gc0N1cnJlbnRIYXNoTm9QYXJhbXMuc3Vic3RyaW5nKDAsIHNDdXJyZW50SGFzaE5vUGFyYW1zLmxlbmd0aCAtIDEpO1xuXHRcdH1cblxuXHRcdGxldCBzUm9vdEVudGl0eU5hbWUgPSBzQ3VycmVudEhhc2hOb1BhcmFtcyAmJiBzQ3VycmVudEhhc2hOb1BhcmFtcy5zdWJzdHIoMCwgc0N1cnJlbnRIYXNoTm9QYXJhbXMuaW5kZXhPZihcIihcIikpO1xuXHRcdGlmIChzUm9vdEVudGl0eU5hbWUuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdHNSb290RW50aXR5TmFtZSA9IHNSb290RW50aXR5TmFtZS5zdWJzdHJpbmcoMSk7XG5cdFx0fVxuXHRcdGNvbnN0IGJBbGxvd1NlbWFudGljQm9va21hcmsgPSB0aGlzLl9jaGVja1BhdGhGb3JTZW1hbnRpY0Jvb2ttYXJraW5nKHNDdXJyZW50SGFzaE5vUGFyYW1zLCBvTWV0YU1vZGVsKSxcblx0XHRcdGFTZW1hbnRpY0tleXMgPSBiQWxsb3dTZW1hbnRpY0Jvb2ttYXJrICYmIFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljS2V5cyhvTWV0YU1vZGVsLCBzUm9vdEVudGl0eU5hbWUpO1xuXHRcdGlmICghYVNlbWFudGljS2V5cykge1xuXHRcdFx0Ly8gTm8gc2VtYW50aWMga2V5cyBhdmFpbGFibGUgLS0+IHVzZSB0aGUgcGF0aCBhcyBpc1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShzUGF0aFRvUmVzb2x2ZSk7XG5cdFx0fSBlbHNlIGlmIChvTGFzdFNlbWFudGljTWFwcGluZyAmJiBvTGFzdFNlbWFudGljTWFwcGluZy5zZW1hbnRpY1BhdGggPT09IHNQYXRoVG9SZXNvbHZlKSB7XG5cdFx0XHQvLyBUaGlzIHNlbWFudGljIHBhdGggaGFzIGJlZW4gcmVzb2x2ZWQgcHJldmlvdXNseVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShvTGFzdFNlbWFudGljTWFwcGluZy50ZWNobmljYWxQYXRoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gV2UgbmVlZCByZXNvbHZlIHRoZSBzZW1hbnRpYyBwYXRoIHRvIGdldCB0aGUgdGVjaG5pY2FsIGtleXNcblx0XHRcdHJldHVybiB0aGlzLl9nZXRUZWNobmljYWxQYXRoRnJvbVNlbWFudGljUGF0aChzQ3VycmVudEhhc2hOb1BhcmFtcywgb01vZGVsLCBhU2VtYW50aWNLZXlzKS50aGVuKChzVGVjaG5pY2FsUGF0aDogYW55KSA9PiB7XG5cdFx0XHRcdGlmIChzVGVjaG5pY2FsUGF0aCAmJiBzVGVjaG5pY2FsUGF0aCAhPT0gc1BhdGhUb1Jlc29sdmUpIHtcblx0XHRcdFx0XHQvLyBUaGUgc2VtYW50aWMgcGF0aCB3YXMgcmVzb2x2ZWQgKG90aGVyd2lzZSBrZWVwIHRoZSBvcmlnaW5hbCB2YWx1ZSBmb3IgdGFyZ2V0KVxuXHRcdFx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5zZXRMYXN0U2VtYW50aWNNYXBwaW5nKHtcblx0XHRcdFx0XHRcdHRlY2huaWNhbFBhdGg6IHNUZWNobmljYWxQYXRoLFxuXHRcdFx0XHRcdFx0c2VtYW50aWNQYXRoOiBzUGF0aFRvUmVzb2x2ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybiBzVGVjaG5pY2FsUGF0aDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gc1BhdGhUb1Jlc29sdmU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2UgZnJvbSBhIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBzVGFyZ2V0UGF0aCBUaGUgcGF0aCB0byBidWlsZCB0aGUgY29udGV4dC4gTmVlZHMgdG8gY29udGFpbiB0ZWNobmljYWwga2V5cyBvbmx5LlxuXHQgKiBAcGFyYW0gb01vZGVsIFRoZSBPRGF0YSBtb2RlbFxuXHQgKiBAcGFyYW0gb05hdmlnYXRpb25QYXJhbWV0ZXJzIE5hdmlnYXRpb24gcGFyYW1ldGVyc1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9iaW5kUGFnZVRvUGF0aChzVGFyZ2V0UGF0aDogc3RyaW5nLCBvTW9kZWw6IGFueSwgb05hdmlnYXRpb25QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRjb25zdCBvQ3VycmVudENvbnRleHQgPSB0aGlzLl9nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0c0N1cnJlbnRQYXRoID0gb0N1cnJlbnRDb250ZXh0ICYmIG9DdXJyZW50Q29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvVXNlQ29udGV4dCA9IG9OYXZpZ2F0aW9uUGFyYW1ldGVycy51c2VDb250ZXh0O1xuXG5cdFx0Ly8gV2Ugc2V0IHRoZSBiaW5kaW5nIGNvbnRleHQgb25seSBpZiBpdCdzIGRpZmZlcmVudCBmcm9tIHRoZSBjdXJyZW50IG9uZVxuXHRcdC8vIG9yIGlmIHdlIGhhdmUgYSBjb250ZXh0IGFscmVhZHkgc2VsZWN0ZWRcblx0XHRpZiAoc0N1cnJlbnRQYXRoICE9PSBzVGFyZ2V0UGF0aCB8fCAob1VzZUNvbnRleHQgJiYgb1VzZUNvbnRleHQuZ2V0UGF0aCgpID09PSBzVGFyZ2V0UGF0aCkpIHtcblx0XHRcdGxldCBvVGFyZ2V0Q29udGV4dDtcblx0XHRcdGlmIChvVXNlQ29udGV4dCAmJiBvVXNlQ29udGV4dC5nZXRQYXRoKCkgPT09IHNUYXJnZXRQYXRoKSB7XG5cdFx0XHRcdC8vIFdlIGFscmVhZHkgaGF2ZSB0aGUgY29udGV4dCB0byBiZSB1c2VkXG5cdFx0XHRcdG9UYXJnZXRDb250ZXh0ID0gb1VzZUNvbnRleHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBPdGhlcndpc2Ugd2UgbmVlZCB0byBjcmVhdGUgaXQgZnJvbSBzVGFyZ2V0UGF0aFxuXHRcdFx0XHRvVGFyZ2V0Q29udGV4dCA9IHRoaXMuX2NyZWF0ZUNvbnRleHQoc1RhcmdldFBhdGgsIG9Nb2RlbCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob1RhcmdldENvbnRleHQgIT09IG9DdXJyZW50Q29udGV4dCkge1xuXHRcdFx0XHR0aGlzLl9iaW5kUGFnZVRvQ29udGV4dChvVGFyZ2V0Q29udGV4dCwgb01vZGVsLCBvTmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIW9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iUmVhc29uSXNJYXBwU3RhdGUgJiYgRWRpdFN0YXRlLmlzRWRpdFN0YXRlRGlydHkoKSkge1xuXHRcdFx0dGhpcy5fcmVmcmVzaEJpbmRpbmdDb250ZXh0KG9DdXJyZW50Q29udGV4dCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEJpbmRzIHRoZSBwYWdlIHRvIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgYm91bmRcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHBhcmFtIG9OYXZpZ2F0aW9uUGFyYW1ldGVycyBOYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfYmluZFBhZ2VUb0NvbnRleHQob0NvbnRleHQ6IENvbnRleHQgfCBudWxsLCBvTW9kZWw6IE9EYXRhTW9kZWwsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyczogYW55KSB7XG5cdFx0aWYgKCFvQ29udGV4dCkge1xuXHRcdFx0dGhpcy5vbkJlZm9yZUJpbmRpbmcobnVsbCk7XG5cdFx0XHR0aGlzLm9uQWZ0ZXJCaW5kaW5nKG51bGwpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9QYXJlbnRMaXN0QmluZGluZyA9IG9Db250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblx0XHRpZiAob1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0aWYgKCFvUGFyZW50TGlzdEJpbmRpbmcgfHwgIW9QYXJlbnRMaXN0QmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0XHQvLyBpZiB0aGUgcGFyZW50QmluZGluZyBpcyBub3QgYSBsaXN0QmluZGluZywgd2UgY3JlYXRlIGEgbmV3IGNvbnRleHRcblx0XHRcdFx0b0NvbnRleHQgPSB0aGlzLl9jcmVhdGVDb250ZXh0KG9Db250ZXh0LmdldFBhdGgoKSwgb01vZGVsKTtcblx0XHRcdH1cblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5fc2V0S2VlcEFsaXZlKFxuXHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKG9Sb290Vmlld0NvbnRyb2xsZXIuaXNDb250ZXh0VXNlZEluUGFnZXMob0NvbnRleHQpKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dHJ1ZSAvLyBMb2FkIG1lc3NhZ2VzLCBvdGhlcndpc2UgdGhleSBkb24ndCBnZXQgcmVmcmVzaGVkIGxhdGVyLCBlLmcuIGZvciBzaWRlIGVmZmVjdHNcblx0XHRcdFx0KTtcblx0XHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0XHQvLyBzZXRLZWVwQWxpdmUgdGhyb3dzIGFuIGV4Y2VwdGlvbiBpZiB0aGUgcGFyZW50IGxpc3RiaW5kaW5nIGRvZXNuJ3QgaGF2ZSAkJG93blJlcXVlc3Q9dHJ1ZVxuXHRcdFx0XHQvLyBUaGlzIGNhc2UgZm9yIGN1c3RvbSBmcmFnbWVudHMgaXMgc3VwcG9ydGVkLCBidXQgYW4gZXJyb3IgaXMgbG9nZ2VkIHRvIG1ha2UgdGhlIGxhY2sgb2Ygc3luY2hyb25pemF0aW9uIGFwcGFyZW50XG5cdFx0XHRcdExvZy5lcnJvcihcblx0XHRcdFx0XHRgVmlldyBmb3IgJHtvQ29udGV4dC5nZXRQYXRoKCl9IHdvbid0IGJlIHN5bmNocm9uaXplZC4gUGFyZW50IGxpc3RCaW5kaW5nIG11c3QgaGF2ZSBiaW5kaW5nIHBhcmFtZXRlciAkJG93blJlcXVlc3Q9dHJ1ZWBcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFvUGFyZW50TGlzdEJpbmRpbmcgfHwgb1BhcmVudExpc3RCaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHQvLyBXZSBuZWVkIHRvIHJlY3JlYXRlIHRoZSBjb250ZXh0IG90aGVyd2lzZSB3ZSBnZXQgZXJyb3JzXG5cdFx0XHRvQ29udGV4dCA9IHRoaXMuX2NyZWF0ZUNvbnRleHQob0NvbnRleHQuZ2V0UGF0aCgpLCBvTW9kZWwpO1xuXHRcdH1cblxuXHRcdC8vIFNldCB0aGUgYmluZGluZyBjb250ZXh0IHdpdGggdGhlIHByb3BlciBiZWZvcmUvYWZ0ZXIgY2FsbGJhY2tzXG5cdFx0dGhpcy5vbkJlZm9yZUJpbmRpbmcob0NvbnRleHQsIHtcblx0XHRcdGVkaXRhYmxlOiBvTmF2aWdhdGlvblBhcmFtZXRlcnMuYlRhcmdldEVkaXRhYmxlLFxuXHRcdFx0bGlzdEJpbmRpbmc6IG9QYXJlbnRMaXN0QmluZGluZyxcblx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iUGVyc2lzdE9QU2Nyb2xsLFxuXHRcdFx0YkRyYWZ0TmF2aWdhdGlvbjogb05hdmlnYXRpb25QYXJhbWV0ZXJzLmJEcmFmdE5hdmlnYXRpb24sXG5cdFx0XHRzaG93UGxhY2Vob2xkZXI6IG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iU2hvd1BsYWNlaG9sZGVyXG5cdFx0fSk7XG5cdFx0dGhpcy5fc2V0QmluZGluZ0NvbnRleHQob0NvbnRleHQpO1xuXHRcdHRoaXMub25BZnRlckJpbmRpbmcob0NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBjb250ZXh0IGZyb20gYSBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGhcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHJldHVybnMgVGhlIGNyZWF0ZWQgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9jcmVhdGVDb250ZXh0KHNQYXRoOiBzdHJpbmcsIG9Nb2RlbDogT0RhdGFNb2RlbCkge1xuXHRcdGNvbnN0IG9QYWdlQ29tcG9uZW50ID0gdGhpcy5fb1BhZ2VDb21wb25lbnQsXG5cdFx0XHRzRW50aXR5U2V0ID0gb1BhZ2VDb21wb25lbnQgJiYgb1BhZ2VDb21wb25lbnQuZ2V0RW50aXR5U2V0ICYmIG9QYWdlQ29tcG9uZW50LmdldEVudGl0eVNldCgpLFxuXHRcdFx0c0NvbnRleHRQYXRoID1cblx0XHRcdFx0KG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoKCkpIHx8IChzRW50aXR5U2V0ICYmIGAvJHtzRW50aXR5U2V0fWApLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdG1QYXJhbWV0ZXJzOiBhbnkgPSB7XG5cdFx0XHRcdCQkZ3JvdXBJZDogXCIkYXV0by5IZXJvZXNcIixcblx0XHRcdFx0JCR1cGRhdGVHcm91cElkOiBcIiRhdXRvXCIsXG5cdFx0XHRcdCQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHM6IHRydWVcblx0XHRcdH07XG5cdFx0Ly8gSW4gY2FzZSBvZiBkcmFmdDogJHNlbGVjdCB0aGUgc3RhdGUgZmxhZ3MgKEhhc0FjdGl2ZUVudGl0eSwgSGFzRHJhZnRFbnRpdHksIGFuZCBJc0FjdGl2ZUVudGl0eSlcblx0XHRjb25zdCBvRHJhZnRSb290ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YCk7XG5cdFx0Y29uc3Qgb0RyYWZ0Tm9kZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZWApO1xuXHRcdGNvbnN0IG9Sb290Vmlld0NvbnRyb2xsZXIgPSAodGhpcy5fb0FwcENvbXBvbmVudCBhcyBhbnkpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuX2dldEtlZXBBbGl2ZUNvbnRleHQob01vZGVsLCBzUGF0aCwgZmFsc2UsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY3JlYXRlIGtlZXBBbGl2ZSBjb250ZXh0ICR7c1BhdGh9YCk7XG5cdFx0XHR9IGVsc2UgaWYgKG9EcmFmdFJvb3QgfHwgb0RyYWZ0Tm9kZSkge1xuXHRcdFx0XHRpZiAob0NvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0b0NvbnRleHQucmVxdWVzdFByb3BlcnR5KFtcIkhhc0FjdGl2ZUVudGl0eVwiLCBcIkhhc0RyYWZ0RW50aXR5XCIsIFwiSXNBY3RpdmVFbnRpdHlcIl0pO1xuXHRcdFx0XHRcdGlmIChvRHJhZnRSb290KSB7XG5cdFx0XHRcdFx0XHRvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gZHJhZnQgYW5kIGVkaXQgd2UgbmVlZCB0byBlbnN1cmUgdGhvc2UgcHJvcGVydGllcyBhcmUgcmVxdWVzdGVkIGFnYWluIGV2ZW4gaWYgdGhleSBhcmUgaW4gdGhlIGJpbmRpbmcncyBjYWNoZVxuXHRcdFx0XHRcdC8vIG90aGVyd2lzZSB3aGVuIHlvdSBlZGl0IGFuZCBnbyB0byB0aGUgc2F2ZWQgdmVyc2lvbiB5b3UgaGF2ZSBubyB3YXkgb2Ygc3dpdGNoaW5nIGJhY2sgdG8gdGhlIGVkaXQgdmVyc2lvblxuXHRcdFx0XHRcdG9Db250ZXh0LnJlcXVlc3RTaWRlRWZmZWN0cyhcblx0XHRcdFx0XHRcdG9EcmFmdFJvb3Rcblx0XHRcdFx0XHRcdFx0PyBbXCJIYXNBY3RpdmVFbnRpdHlcIiwgXCJIYXNEcmFmdEVudGl0eVwiLCBcIklzQWN0aXZlRW50aXR5XCIsIFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFcIl1cblx0XHRcdFx0XHRcdFx0OiBbXCJIYXNBY3RpdmVFbnRpdHlcIiwgXCJIYXNEcmFmdEVudGl0eVwiLCBcIklzQWN0aXZlRW50aXR5XCJdXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gb0NvbnRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChzRW50aXR5U2V0KSB7XG5cdFx0XHRcdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHRcdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy4kc2VsZWN0ID0gc01lc3NhZ2VzUGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRyYWZ0OiAkc2VsZWN0IHRoZSBzdGF0ZSBmbGFncyAoSGFzQWN0aXZlRW50aXR5LCBIYXNEcmFmdEVudGl0eSwgYW5kIElzQWN0aXZlRW50aXR5KVxuXHRcdFx0aWYgKG9EcmFmdFJvb3QgfHwgb0RyYWZ0Tm9kZSkge1xuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuJHNlbGVjdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuJHNlbGVjdCA9IFwiSGFzQWN0aXZlRW50aXR5LEhhc0RyYWZ0RW50aXR5LElzQWN0aXZlRW50aXR5XCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuJHNlbGVjdCArPSBcIixIYXNBY3RpdmVFbnRpdHksSGFzRHJhZnRFbnRpdHksSXNBY3RpdmVFbnRpdHlcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuX29WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdFx0Y29uc3Qgb1ByZXZpb3VzQmluZGluZyA9ICh0aGlzLl9vVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIGFueSk/LmdldEJpbmRpbmcoKTtcblx0XHRcdFx0b1ByZXZpb3VzQmluZGluZ1xuXHRcdFx0XHRcdD8ucmVzZXRDaGFuZ2VzKClcblx0XHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRvUHJldmlvdXNCaW5kaW5nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlc2V0aW5nIHRoZSBjaGFuZ2VzIHRvIHRoZSBiaW5kaW5nXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9IaWRkZW5CaW5kaW5nID0gb01vZGVsLmJpbmRDb250ZXh0KHNQYXRoLCB1bmRlZmluZWQsIG1QYXJhbWV0ZXJzKTtcblxuXHRcdFx0b0hpZGRlbkJpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlcXVlc3RlZFwiLCAoKSA9PiB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIubG9jayh0aGlzLl9vVmlldyk7XG5cdFx0XHR9KTtcblx0XHRcdG9IaWRkZW5CaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZWNlaXZlZFwiLCB0aGlzLl9kYXRhUmVjZWl2ZWRFdmVudEhhbmRsZXIuYmluZCh0aGlzKSk7XG5cdFx0XHRyZXR1cm4gb0hpZGRlbkJpbmRpbmcuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgX2RhdGFSZWNlaXZlZEV2ZW50SGFuZGxlcihvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0Y29uc3Qgc0Vycm9yRGVzY3JpcHRpb24gPSBvRXZlbnQgJiYgb0V2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpO1xuXHRcdEJ1c3lMb2NrZXIudW5sb2NrKHRoaXMuX29WaWV3KTtcblxuXHRcdGlmIChzRXJyb3JEZXNjcmlwdGlvbikge1xuXHRcdFx0Ly8gVE9ETzogaW4gY2FzZSBvZiA0MDQgdGhlIHRleHQgc2hhbGwgYmUgZGlmZmVyZW50XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBhd2FpdCBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIsIHRydWUpO1xuXHRcdFx0XHRjb25zdCBtZXNzYWdlSGFuZGxlciA9IHRoaXMuYmFzZS5tZXNzYWdlSGFuZGxlcjtcblx0XHRcdFx0bGV0IG1QYXJhbXMgPSB7fTtcblx0XHRcdFx0aWYgKHNFcnJvckRlc2NyaXB0aW9uICYmIHNFcnJvckRlc2NyaXB0aW9uLnN0YXR1cyA9PT0gNTAzKSB7XG5cdFx0XHRcdFx0bVBhcmFtcyA9IHtcblx0XHRcdFx0XHRcdGlzSW5pdGlhbExvYWQ1MDNFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNoZWxsQmFjazogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bVBhcmFtcyA9IHtcblx0XHRcdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHNFcnJvckRlc2NyaXB0aW9uLFxuXHRcdFx0XHRcdFx0aXNEYXRhUmVjZWl2ZWRFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNoZWxsQmFjazogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKG1QYXJhbXMpO1xuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZ2V0dGluZyB0aGUgY29yZSByZXNvdXJjZSBidW5kbGVcIiwgb0Vycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgc2lkZSBlZmZlY3RzIG9uIGEgYmluZGluZyBjb250ZXh0IHRvIFwicmVmcmVzaFwiIGl0LlxuXHQgKiBUT0RPOiBnZXQgcmlkIG9mIHRoaXMgb25jZSBwcm92aWRlZCBieSB0aGUgbW9kZWxcblx0ICogYSByZWZyZXNoIG9uIHRoZSBiaW5kaW5nIGNvbnRleHQgZG9lcyBub3Qgd29yayBpbiBjYXNlIGEgY3JlYXRpb24gcm93IHdpdGggYSB0cmFuc2llbnQgY29udGV4dCBpc1xuXHQgKiB1c2VkLiBhbHNvIGEgcmVxdWVzdFNpZGVFZmZlY3RzIHdpdGggYW4gZW1wdHkgcGF0aCB3b3VsZCBmYWlsIGR1ZSB0byB0aGUgdHJhbnNpZW50IGNvbnRleHRcblx0ICogdGhlcmVmb3JlIHdlIGdldCBhbGwgZGVwZW5kZW50IGJpbmRpbmdzICh2aWEgcHJpdmF0ZSBtb2RlbCBtZXRob2QpIHRvIGRldGVybWluZSBhbGwgcGF0aHMgYW5kIHRoZW5cblx0ICogcmVxdWVzdCB0aGVtLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0JpbmRpbmdDb250ZXh0IENvbnRleHQgdG8gYmUgcmVmcmVzaGVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X3JlZnJlc2hCaW5kaW5nQ29udGV4dChvQmluZGluZ0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG9QYWdlQ29tcG9uZW50ID0gdGhpcy5fb1BhZ2VDb21wb25lbnQ7XG5cdFx0Y29uc3Qgb1NpZGVFZmZlY3RzU2VydmljZSA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0Y29uc3Qgc1Jvb3RDb250ZXh0UGF0aCA9IG9CaW5kaW5nQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc0VudGl0eVNldCA9IG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldEVudGl0eVNldCAmJiBvUGFnZUNvbXBvbmVudC5nZXRFbnRpdHlTZXQoKTtcblx0XHRjb25zdCBzQ29udGV4dFBhdGggPVxuXHRcdFx0KG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoKCkpIHx8IChzRW50aXR5U2V0ICYmIGAvJHtzRW50aXR5U2V0fWApO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBzTWVzc2FnZXNQYXRoO1xuXHRcdGNvbnN0IGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRoczogYW55W10gPSBbXTtcblx0XHRjb25zdCBhUHJvcGVydHlQYXRoczogYW55W10gPSBbXTtcblx0XHRjb25zdCBvU2lkZUVmZmVjdHM6IGFueSA9IHtcblx0XHRcdFRhcmdldFByb3BlcnRpZXM6IFtdLFxuXHRcdFx0VGFyZ2V0RW50aXRpZXM6IFtdXG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIGdldEJpbmRpbmdQYXRocyhvQmluZGluZzogYW55KSB7XG5cdFx0XHRsZXQgYURlcGVuZGVudEJpbmRpbmdzO1xuXHRcdFx0Y29uc3Qgc1JlbGF0aXZlUGF0aCA9ICgob0JpbmRpbmcuZ2V0Q29udGV4dCgpICYmIG9CaW5kaW5nLmdldENvbnRleHQoKS5nZXRQYXRoKCkpIHx8IFwiXCIpLnJlcGxhY2Uoc1Jvb3RDb250ZXh0UGF0aCwgXCJcIik7IC8vIElmIG5vIGNvbnRleHQsIHRoaXMgaXMgYW4gYWJzb2x1dGUgYmluZGluZyBzbyBubyByZWxhdGl2ZSBwYXRoXG5cdFx0XHRjb25zdCBzUGF0aCA9IChzUmVsYXRpdmVQYXRoID8gYCR7c1JlbGF0aXZlUGF0aC5zbGljZSgxKX0vYCA6IHNSZWxhdGl2ZVBhdGgpICsgb0JpbmRpbmcuZ2V0UGF0aCgpO1xuXG5cdFx0XHRpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhQ29udGV4dEJpbmRpbmdcIikpIHtcblx0XHRcdFx0Ly8gaWYgKHNQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRcdC8vIG5vdyBnZXQgdGhlIGRlcGVuZGVudCBiaW5kaW5nc1xuXHRcdFx0XHRhRGVwZW5kZW50QmluZGluZ3MgPSBvQmluZGluZy5nZXREZXBlbmRlbnRCaW5kaW5ncygpO1xuXHRcdFx0XHRpZiAoYURlcGVuZGVudEJpbmRpbmdzKSB7XG5cdFx0XHRcdFx0Ly8gYXNrIHRoZSBkZXBlbmRlbnQgYmluZGluZ3MgKGFuZCBvbmx5IHRob3NlIHdpdGggdGhlIHNwZWNpZmllZCBncm91cElkXG5cdFx0XHRcdFx0Ly9pZiAoYURlcGVuZGVudEJpbmRpbmdzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFEZXBlbmRlbnRCaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Z2V0QmluZGluZ1BhdGhzKGFEZXBlbmRlbnRCaW5kaW5nc1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0aWYgKGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhUHJvcGVydHlCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdGlmIChhUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhUHJvcGVydHlQYXRocy5wdXNoKHNQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChzQ29udGV4dFBhdGgpIHtcblx0XHRcdHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHR9XG5cblx0XHQvLyBiaW5kaW5nIG9mIHRoZSBjb250ZXh0IG11c3QgaGF2ZSAkJFBhdGNoV2l0aG91dFNpZGVFZmZlY3RzIHRydWUsIHRoaXMgYm91bmQgY29udGV4dCBtYXkgYmUgbmVlZGVkIHRvIGJlIGZldGNoZWQgZnJvbSB0aGUgZGVwZW5kZW50IGJpbmRpbmdcblx0XHRnZXRCaW5kaW5nUGF0aHMob0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKSk7XG5cblx0XHRsZXQgaTtcblx0XHRmb3IgKGkgPSAwOyBpIDwgYU5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMucHVzaCh7XG5cdFx0XHRcdCROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBhTmF2aWdhdGlvblByb3BlcnR5UGF0aHNbaV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0UHJvcGVydGllcyA9IGFQcm9wZXJ0eVBhdGhzO1xuXHRcdGlmIChzTWVzc2FnZXNQYXRoKSB7XG5cdFx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0UHJvcGVydGllcy5wdXNoKHNNZXNzYWdlc1BhdGgpO1xuXHRcdH1cblx0XHQvL2FsbCB0aGlzIGxvZ2ljIHRvIGJlIHJlcGxhY2VkIHdpdGggYSBTaWRlRWZmZWN0cyByZXF1ZXN0IGZvciBhbiBlbXB0eSBwYXRoIChyZWZyZXNoIGV2ZXJ5dGhpbmcpLCBhZnRlciB0ZXN0aW5nIHRyYW5zaWVudCBjb250ZXh0c1xuXHRcdG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzID0gb1NpZGVFZmZlY3RzLlRhcmdldFByb3BlcnRpZXMubWFwKChzVGFyZ2V0UHJvcGVydHk6IFN0cmluZykgPT4ge1xuXHRcdFx0aWYgKHNUYXJnZXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRjb25zdCBpbmRleCA9IHNUYXJnZXRQcm9wZXJ0eS5pbmRleE9mKFwiL1wiKTtcblx0XHRcdFx0aWYgKGluZGV4ID4gMCkge1xuXHRcdFx0XHRcdC8vIG9ubHkgcmVxdWVzdCB0aGUgbmF2aWdhdGlvbiBwYXRoIGFuZCBub3QgdGhlIHByb3BlcnR5IHBhdGhzIGZ1cnRoZXJcblx0XHRcdFx0XHRyZXR1cm4gc1RhcmdldFByb3BlcnR5LnNsaWNlKDAsIGluZGV4KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gc1RhcmdldFByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdC8vIE9EYXRhIG1vZGVsIHdpbGwgdGFrZSBjYXJlIG9mIGR1cGxpY2F0ZXNcblx0XHRvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhvU2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMuY29uY2F0KG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzKSwgb0JpbmRpbmdDb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2Ugb3IgdGhlIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9nZXRCaW5kaW5nQ29udGV4dCgpOiBDb250ZXh0IHwgbnVsbCB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKHRoaXMuX29QYWdlQ29tcG9uZW50KSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fb1BhZ2VDb21wb25lbnQuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2Ugb3IgdGhlIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBiaW5kaW5nIGNvbnRleHRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfc2V0QmluZGluZ0NvbnRleHQob0NvbnRleHQ6IGFueSkge1xuXHRcdGxldCBvUHJldmlvdXNDb250ZXh0LCBvVGFyZ2V0Q29udHJvbDtcblx0XHRpZiAodGhpcy5fb1BhZ2VDb21wb25lbnQpIHtcblx0XHRcdG9QcmV2aW91c0NvbnRleHQgPSB0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRvVGFyZ2V0Q29udHJvbCA9IHRoaXMuX29QYWdlQ29tcG9uZW50O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJldmlvdXNDb250ZXh0ID0gdGhpcy5fb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdFx0b1RhcmdldENvbnRyb2wgPSB0aGlzLl9vVmlldztcblx0XHR9XG5cblx0XHRpZiAob0NvbnRleHQgIT09IG9QcmV2aW91c0NvbnRleHQpIHtcblx0XHRcdG9UYXJnZXRDb250cm9sLnNldEJpbmRpbmdDb250ZXh0KG9Db250ZXh0KTtcblx0XHRcdGlmIChvUHJldmlvdXNDb250ZXh0Py5pc0tlZXBBbGl2ZSgpKSB7XG5cdFx0XHRcdHRoaXMuX3NldEtlZXBBbGl2ZShvUHJldmlvdXNDb250ZXh0LCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGZsZXhpYmxlIGNvbHVtbiBsYXlvdXQgKEZDTCkgbGV2ZWwgY29ycmVzcG9uZGluZyB0byB0aGUgdmlldyAoLTEgaWYgdGhlIGFwcCBpcyBub3QgRkNMKS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGxldmVsXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2dldEZDTExldmVsKCkge1xuXHRcdHJldHVybiB0aGlzLl9vVGFyZ2V0SW5mb3JtYXRpb24uRkNMTGV2ZWw7XG5cdH1cblxuXHRfc2V0S2VlcEFsaXZlKG9Db250ZXh0OiBDb250ZXh0LCBiS2VlcEFsaXZlOiBib29sZWFuLCBmbkJlZm9yZURlc3Ryb3k/OiBGdW5jdGlvbiwgYlJlcXVlc3RNZXNzYWdlcz86IGJvb2xlYW4pIHtcblx0XHRpZiAob0NvbnRleHQuZ2V0UGF0aCgpLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdFx0Ly8gV2Uga2VlcCB0aGUgY29udGV4dCBhbGl2ZSBvbmx5IGlmIHRoZXkncmUgcGFydCBvZiBhIGNvbGxlY3Rpb24sIGkuZS4gaWYgdGhlIHBhdGggZW5kcyB3aXRoIGEgJyknXG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHRcdG9Db250ZXh0LnNldEtlZXBBbGl2ZShiS2VlcEFsaXZlLCBmbkJlZm9yZURlc3Ryb3ksICEhc01lc3NhZ2VzUGF0aCAmJiBiUmVxdWVzdE1lc3NhZ2VzKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0S2VlcEFsaXZlQ29udGV4dChvTW9kZWw6IE9EYXRhTW9kZWwsIHBhdGg6IHN0cmluZywgYlJlcXVlc3RNZXNzYWdlcz86IGJvb2xlYW4sIHBhcmFtZXRlcnM/OiBhbnkpOiBDb250ZXh0IHwgdW5kZWZpbmVkIHtcblx0XHQvLyBHZXQgdGhlIHBhdGggZm9yIHRoZSBjb250ZXh0IHRoYXQgaXMgcmVhbGx5IGtlcHQgYWxpdmUgKHBhcnQgb2YgYSBjb2xsZWN0aW9uKVxuXHRcdC8vIGkuZS4gcmVtb3ZlIGFsbCBzZWdtZW50cyBub3QgZW5kaW5nIHdpdGggYSAnKSdcblx0XHRjb25zdCBrZXB0QWxpdmVTZWdtZW50cyA9IHBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdGNvbnN0IGFkZGl0aW9ubmFsU2VnbWVudHM6IHN0cmluZ1tdID0gW107XG5cdFx0d2hpbGUgKGtlcHRBbGl2ZVNlZ21lbnRzLmxlbmd0aCAmJiAha2VwdEFsaXZlU2VnbWVudHNba2VwdEFsaXZlU2VnbWVudHMubGVuZ3RoIC0gMV0uZW5kc1dpdGgoXCIpXCIpKSB7XG5cdFx0XHRhZGRpdGlvbm5hbFNlZ21lbnRzLnB1c2goa2VwdEFsaXZlU2VnbWVudHMucG9wKCkhKTtcblx0XHR9XG5cblx0XHRpZiAoa2VwdEFsaXZlU2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGNvbnN0IGtlcHRBbGl2ZVBhdGggPSBrZXB0QWxpdmVTZWdtZW50cy5qb2luKFwiL1wiKTtcblx0XHRjb25zdCBvS2VlcEFsaXZlQ29udGV4dCA9IG9Nb2RlbC5nZXRLZWVwQWxpdmVDb250ZXh0KGtlcHRBbGl2ZVBhdGgsIGJSZXF1ZXN0TWVzc2FnZXMsIHBhcmFtZXRlcnMpO1xuXG5cdFx0aWYgKGFkZGl0aW9ubmFsU2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gb0tlZXBBbGl2ZUNvbnRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFkZGl0aW9ubmFsU2VnbWVudHMucmV2ZXJzZSgpO1xuXHRcdFx0Y29uc3QgYWRkaXRpb25uYWxQYXRoID0gYWRkaXRpb25uYWxTZWdtZW50cy5qb2luKFwiL1wiKTtcblx0XHRcdHJldHVybiBvTW9kZWwuYmluZENvbnRleHQoYWRkaXRpb25uYWxQYXRoLCBvS2VlcEFsaXZlQ29udGV4dCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN3aXRjaGVzIGJldHdlZW4gY29sdW1uIGFuZCBmdWxsLXNjcmVlbiBtb2RlIHdoZW4gRkNMIGlzIHVzZWQuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0c3dpdGNoRnVsbFNjcmVlbigpIHtcblx0XHRjb25zdCBvU291cmNlID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHRjb25zdCBvRkNMSGVscGVyTW9kZWwgPSBvU291cmNlLmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLFxuXHRcdFx0YklzRnVsbFNjcmVlbiA9IG9GQ0xIZWxwZXJNb2RlbC5nZXRQcm9wZXJ0eShcIi9hY3Rpb25CdXR0b25zSW5mby9pc0Z1bGxTY3JlZW5cIiksXG5cdFx0XHRzTmV4dExheW91dCA9IG9GQ0xIZWxwZXJNb2RlbC5nZXRQcm9wZXJ0eShcblx0XHRcdFx0YklzRnVsbFNjcmVlbiA/IFwiL2FjdGlvbkJ1dHRvbnNJbmZvL2V4aXRGdWxsU2NyZWVuXCIgOiBcIi9hY3Rpb25CdXR0b25zSW5mby9mdWxsU2NyZWVuXCJcblx0XHRcdCksXG5cdFx0XHRvUm9vdFZpZXdDb250cm9sbGVyID0gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblxuXHRcdGNvbnN0IG9Db250ZXh0ID0gb1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0ID8gb1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCkgOiBvU291cmNlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cblx0XHR0aGlzLmJhc2UuX3JvdXRpbmcubmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQsIHsgc0xheW91dDogc05leHRMYXlvdXQgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJjYW5ub3Qgc3dpdGNoIGJldHdlZW4gY29sdW1uIGFuZCBmdWxsc2NyZWVuXCIpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlcyB0aGUgY29sdW1uIGZvciB0aGUgY3VycmVudCB2aWV3IGluIGEgRkNMLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5CZWZvcmUpXG5cdGNsb3NlQ29sdW1uKCkge1xuXHRcdGNvbnN0IG9Tb3VyY2UgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG9WaWV3RGF0YSA9IG9Tb3VyY2UuZ2V0Vmlld0RhdGEoKSBhcyBhbnk7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSBvU291cmNlLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRjb25zdCBiYXNlID0gdGhpcy5iYXNlO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXG5cdFx0aWYgKG9WaWV3RGF0YSAmJiBvVmlld0RhdGEudmlld0xldmVsID09PSAxICYmIE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCwgb0NvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdFx0ZHJhZnQucHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24oXG5cdFx0XHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRiYXNlLl9yb3V0aW5nLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0LCB7IG5vUHJlc2VydmF0aW9uQ2FjaGU6IHRydWUgfSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdG9Tb3VyY2UuZ2V0Q29udHJvbGxlcigpLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0ZHJhZnQuTmF2aWdhdGlvblR5cGUuQmFja05hdmlnYXRpb25cblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGJhc2UuX3JvdXRpbmcubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQsIHsgbm9QcmVzZXJ2YXRpb25DYWNoZTogdHJ1ZSB9KTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW50ZXJuYWxSb3V0aW5nO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBTUcsQ0FBQyxFQUFFO01BQ1YsT0FBT0YsT0FBTyxDQUFDRSxDQUFDLENBQUM7SUFDbEI7SUFDQSxJQUFJRCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsSUFBSSxFQUFFO01BQzFCLE9BQU9GLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFSCxPQUFPLENBQUM7SUFDcEM7SUFDQSxPQUFPQyxNQUFNO0VBQ2Q7RUFBQztFQUFBO0VBQUE7RUFoaUJEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQSxJQVNNRyxlQUFlLFdBRHBCQyxjQUFjLENBQUMsa0RBQWtELENBQUMsVUFZakVDLGNBQWMsRUFBRSxVQU9oQkEsY0FBYyxFQUFFLFVBb0NoQkMsZUFBZSxFQUFFLFVBQ2pCQyxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLENBQUMsVUFLbkNILGVBQWUsRUFB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