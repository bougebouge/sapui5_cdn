/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/f/FlexibleColumnLayoutSemanticHelper", "sap/f/library", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/m/Link", "sap/m/MessageBox", "sap/m/MessagePage", "./RootViewBaseController"], function (Log, FlexibleColumnLayoutSemanticHelper, fLibrary, ViewState, ClassSupport, KeepAliveHelper, Link, MessageBox, MessagePage, BaseController) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var Icon = MessageBox.Icon;
  var Action = MessageBox.Action;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var LayoutType = fLibrary.LayoutType;
  var CONSTANTS = {
    page: {
      names: ["BeginColumn", "MidColumn", "EndColumn"],
      currentGetter: {
        prefix: "getCurrent",
        suffix: "Page"
      },
      getter: {
        prefix: "get",
        suffix: "Pages"
      }
    }
  };
  var _getViewFromContainer = function (oContainer) {
    if (oContainer.isA("sap.ui.core.ComponentContainer")) {
      return oContainer.getComponentInstance().getRootControl();
    } else {
      return oContainer;
    }
  };
  var FclController = (_dec = defineUI5Class("sap.fe.core.rootView.Fcl"), _dec2 = usingExtension(ViewState.override({
    applyInitialStateOnly: function () {
      return false;
    },
    adaptBindingRefreshControls: function (aControls) {
      this.getView().getController()._getAllVisibleViews().forEach(function (oChildView) {
        var pChildView = Promise.resolve(oChildView);
        aControls.push(pChildView);
      });
    },
    adaptStateControls: function (aStateControls) {
      this.getView().getController()._getAllVisibleViews().forEach(function (oChildView) {
        var pChildView = Promise.resolve(oChildView);
        aStateControls.push(pChildView);
      });
    },
    onRestore: function () {
      var oView = this.getView();
      var oFCLController = this.getView().getController();
      var oNavContainer = oFCLController.getAppContentContainer(oView);
      var oInternalModel = oNavContainer.getModel("internal");
      var oPages = oInternalModel.getProperty("/pages");
      for (var sComponentId in oPages) {
        oInternalModel.setProperty("/pages/".concat(sComponentId, "/restoreStatus"), "pending");
      }
      oFCLController.onContainerReady();
    },
    onSuspend: function () {
      var oFCLController = this.getView().getController();
      var oFCLControl = oFCLController.getFclControl();
      var aBeginColumnPages = oFCLControl.getBeginColumnPages() || [];
      var aMidColumnPages = oFCLControl.getMidColumnPages() || [];
      var aEndColumnPages = oFCLControl.getEndColumnPages() || [];
      var aPages = [].concat(aBeginColumnPages, aMidColumnPages, aEndColumnPages);
      aPages.forEach(function (oPage) {
        var oTargetView = _getViewFromContainer(oPage);
        var oController = oTargetView && oTargetView.getController();
        if (oController && oController.viewState && oController.viewState.onSuspend) {
          oController.viewState.onSuspend();
        }
      });
    }
  })), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(FclController, _BaseController);
    function FclController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call.apply(_BaseController, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "viewState", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FclController.prototype;
    /**
     * @private
     * @name sap.fe.core.rootView.Fcl.getMetadata
     * @function
     */
    _proto.onInit = function onInit() {
      _BaseController.prototype.onInit.call(this);
      this._internalInit();
    };
    _proto.attachRouteMatchers = function attachRouteMatchers() {
      this.getRouter().attachBeforeRouteMatched(this._getViewForNavigatedRowsComputation, this);
      _BaseController.prototype.attachRouteMatchers.call(this);
      this._internalInit();
      this.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
      this.getRouter().attachRouteMatched(this.onRouteMatched, this);
      this.getFclControl().attachStateChange(this._saveLayout, this);
    };
    _proto._internalInit = function _internalInit() {
      var _oRoutingConfig$confi, _oRoutingConfig$confi2;
      if (this._oRouterProxy) {
        return; // Already initialized
      }

      this.sCurrentRouteName = "";
      this.sCurrentArguments = {};
      this.SQUERYKEYNAME = "?query";
      var oAppComponent = this.getAppComponent();
      this._oRouterProxy = oAppComponent.getRouterProxy();

      // Get FCL configuration in the manifest
      this._oFCLConfig = {
        maxColumnsCount: 3
      };
      var oRoutingConfig = oAppComponent.getManifest()["sap.ui5"].routing;
      if (oRoutingConfig !== null && oRoutingConfig !== void 0 && (_oRoutingConfig$confi = oRoutingConfig.config) !== null && _oRoutingConfig$confi !== void 0 && _oRoutingConfig$confi.flexibleColumnLayout) {
        var oFCLManifestConfig = oRoutingConfig.config.flexibleColumnLayout;

        // Default layout for 2 columns
        if (oFCLManifestConfig.defaultTwoColumnLayoutType) {
          this._oFCLConfig.defaultTwoColumnLayoutType = oFCLManifestConfig.defaultTwoColumnLayoutType;
        }

        // Default layout for 3 columns
        if (oFCLManifestConfig.defaultThreeColumnLayoutType) {
          this._oFCLConfig.defaultThreeColumnLayoutType = oFCLManifestConfig.defaultThreeColumnLayoutType;
        }

        // Limit FCL to 2 columns ?
        if (oFCLManifestConfig.limitFCLToTwoColumns === true) {
          this._oFCLConfig.maxColumnsCount = 2;
        }
      }
      if (oRoutingConfig !== null && oRoutingConfig !== void 0 && (_oRoutingConfig$confi2 = oRoutingConfig.config) !== null && _oRoutingConfig$confi2 !== void 0 && _oRoutingConfig$confi2.controlAggregation) {
        this._oFCLConfig.defaultControlAggregation = oRoutingConfig.config.controlAggregation;
      }
      this._initializeTargetAggregation(oAppComponent);
      this._initializeRoutesInformation(oAppComponent);
    };
    _proto.getFclControl = function getFclControl() {
      return this.getView().getContent()[0];
    };
    _proto._saveLayout = function _saveLayout(oEvent) {
      this.sPreviousLayout = oEvent.getParameters().layout;
    }

    /**
     * Get the additionnal view (on top of the visible views), to be able to compute the latest table navigated rows of
     * the most right visible view after a nav back or column fullscreen.
     *
     * @function
     * @name sap.fe.core.rootView.Fcl.controller#_getRightMostViewBeforeRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     */;
    _proto._getViewForNavigatedRowsComputation = function _getViewForNavigatedRowsComputation() {
      var _this2 = this;
      var aAllVisibleViewsBeforeRouteMatched = this._getAllVisibleViews(this.sPreviousLayout);
      var oRightMostViewBeforeRouteMatched = aAllVisibleViewsBeforeRouteMatched[aAllVisibleViewsBeforeRouteMatched.length - 1];
      var oRightMostView;
      this.getRouter().attachEventOnce("routeMatched", function (oEvent) {
        oRightMostView = _getViewFromContainer(oEvent.getParameter("views")[oEvent.getParameter("views").length - 1]);
        if (oRightMostViewBeforeRouteMatched) {
          // Navigation forward from L2 to view level L3 (FullScreenLayout):
          if (oRightMostView.getViewData() && oRightMostView.getViewData().viewLevel === _this2._oFCLConfig.maxColumnsCount) {
            _this2.oAdditionalViewForNavRowsComputation = oRightMostView;
          }
          // Navigations backward from L3 down to L2, L1, L0 (ThreeColumn layout):
          if (oRightMostView.getViewData() && oRightMostViewBeforeRouteMatched.getViewData() && oRightMostViewBeforeRouteMatched.getViewData().viewLevel < _this2._oFCLConfig.maxColumnsCount && oRightMostViewBeforeRouteMatched.getViewData() && oRightMostViewBeforeRouteMatched.getViewData().viewLevel > oRightMostView.getViewData().viewLevel && oRightMostView !== oRightMostViewBeforeRouteMatched) {
            _this2.oAdditionalViewForNavRowsComputation = oRightMostViewBeforeRouteMatched;
          }
        }
      });
    };
    _proto.getViewForNavigatedRowsComputation = function getViewForNavigatedRowsComputation() {
      return this.oAdditionalViewForNavRowsComputation;
    };
    _proto.onExit = function onExit() {
      this.getRouter().detachRouteMatched(this.onRouteMatched, this);
      this.getRouter().detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
      this.getFclControl().detachStateChange(this.onStateChanged, this);
      this.getFclControl().detachAfterEndColumnNavigate(this.onStateChanged, this);
      this._oTargetsAggregation = null;
      this._oTargetsFromRoutePattern = null;
      BaseController.prototype.onExit.bind(this)();
    }

    /**
     * Check if the FCL component is enabled.
     *
     * @function
     * @name sap.fe.core.rootView.Fcl.controller#isFclEnabled
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns `true` since we are in FCL scenario
     * @ui5-restricted
     * @final
     */;
    _proto.isFclEnabled = function isFclEnabled() {
      return true;
    };
    _proto.displayMessagePage = function displayMessagePage(sErrorMessage, mParameters) {
      var oFCLControl = this.getFclControl();
      if (this._oFCLConfig && mParameters.FCLLevel >= this._oFCLConfig.maxColumnsCount) {
        mParameters.FCLLevel = this._oFCLConfig.maxColumnsCount - 1;
      }
      if (!this.aMessagePages) {
        this.aMessagePages = [null, null, null];
      }
      var oMessagePage = this.aMessagePages[mParameters.FCLLevel];
      if (!oMessagePage) {
        oMessagePage = new MessagePage({
          showHeader: false,
          icon: "sap-icon://message-error"
        });
        this.aMessagePages[mParameters.FCLLevel] = oMessagePage;
        switch (mParameters.FCLLevel) {
          case 0:
            oFCLControl.addBeginColumnPage(oMessagePage);
            break;
          case 1:
            oFCLControl.addMidColumnPage(oMessagePage);
            break;
          default:
            oFCLControl.addEndColumnPage(oMessagePage);
        }
      }
      oMessagePage.setText(sErrorMessage);
      if (mParameters.technicalMessage) {
        oMessagePage.setCustomDescription(new Link({
          text: mParameters.description || mParameters.technicalMessage,
          press: function () {
            MessageBox.show(mParameters.technicalMessage, {
              icon: Icon.ERROR,
              title: mParameters.title,
              actions: [Action.OK],
              defaultAction: Action.OK,
              details: mParameters.technicalDetails || "",
              contentWidth: "60%"
            });
          }
        }));
      } else {
        oMessagePage.setDescription(mParameters.description || "");
      }
      oFCLControl.to(oMessagePage.getId());
      return Promise.resolve(true);
    }

    /**
     * Initialize the object _oTargetsAggregation that defines for each route the relevant aggregation and pattern.
     *
     * @name sap.fe.core.rootView.Fcl.controller#_initializeTargetAggregation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @param [oAppComponent] Reference to the AppComponent
     */;
    _proto._initializeTargetAggregation = function _initializeTargetAggregation(oAppComponent) {
      var _this3 = this;
      var oManifest = oAppComponent.getManifest(),
        oTargets = oManifest["sap.ui5"].routing ? oManifest["sap.ui5"].routing.targets : null;
      this._oTargetsAggregation = {};
      if (oTargets) {
        Object.keys(oTargets).forEach(function (sTargetName) {
          var oTarget = oTargets[sTargetName];
          if (oTarget.controlAggregation) {
            _this3._oTargetsAggregation[sTargetName] = {
              aggregation: oTarget.controlAggregation,
              pattern: oTarget.contextPattern
            };
          } else {
            _this3._oTargetsAggregation[sTargetName] = {
              aggregation: "page",
              pattern: null
            };
          }
        });
      }
    }

    /**
     * Initializes the mapping between a route (identifed as its pattern) and the corresponding targets
     *
     * @name sap.fe.core.rootView.Fcl.controller#_initializeRoutesInformation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @param oAppComponent ref to the AppComponent
     */;
    _proto._initializeRoutesInformation = function _initializeRoutesInformation(oAppComponent) {
      var _this4 = this;
      var oManifest = oAppComponent.getManifest(),
        aRoutes = oManifest["sap.ui5"].routing ? oManifest["sap.ui5"].routing.routes : null;
      this._oTargetsFromRoutePattern = {};
      if (aRoutes) {
        aRoutes.forEach(function (route) {
          _this4._oTargetsFromRoutePattern[route.pattern] = route.target;
        });
      }
    };
    _proto.getCurrentArgument = function getCurrentArgument() {
      return this.sCurrentArguments;
    };
    _proto.getCurrentRouteName = function getCurrentRouteName() {
      return this.sCurrentRouteName;
    }

    /**
     * Get FE FCL constant.
     *
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns The constants
     */;
    _proto.getConstants = function getConstants() {
      return CONSTANTS;
    }

    /**
     * Getter for oTargetsAggregation array.
     *
     * @name sap.fe.core.rootView.Fcl.controller#getTargetAggregation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @returns The _oTargetsAggregation array
     * @ui5-restricted
     */;
    _proto.getTargetAggregation = function getTargetAggregation() {
      return this._oTargetsAggregation;
    }

    /**
     * Function triggered by the router RouteMatched event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onRouteMatched = function onRouteMatched(oEvent) {
      var sRouteName = oEvent.getParameter("name");

      // Save the current/previous routes and arguments
      this.sCurrentRouteName = sRouteName;
      this.sCurrentArguments = oEvent.getParameter("arguments");
    }

    /**
     * This function is triggering the table scroll to the navigated row after each layout change.
     *
     * @name sap.fe.core.rootView.Fcl.controller#scrollToLastSelectedItem
     * @memberof sap.fe.core.rootView.Fcl.controller
     */;
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      var aViews = this._getAllVisibleViews();
      //The scrolls are triggered only if the layout is with several columns or when switching the mostRight column in full screen
      if (aViews.length > 1 || aViews[0].getViewData().viewLevel < this._oFCLConfig.maxColumnsCount) {
        var sCurrentViewPath;
        var oAdditionalView = this.getViewForNavigatedRowsComputation();
        if (oAdditionalView && aViews.indexOf(oAdditionalView) === -1) {
          aViews.push(oAdditionalView);
        }
        for (var index = aViews.length - 1; index > 0; index--) {
          var oView = aViews[index],
            oPreviousView = aViews[index - 1];
          if (oView.getBindingContext()) {
            sCurrentViewPath = oView.getBindingContext().getPath();
            oPreviousView.getController()._scrollTablesToRow(sCurrentViewPath);
          }
        }
      }
    }

    /**
     * Function triggered by the FCL StateChanged event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onStateChanged
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onStateChanged = function onStateChanged(oEvent) {
      var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow");
      if (this.sCurrentArguments !== undefined) {
        if (!this.sCurrentArguments[this.SQUERYKEYNAME]) {
          this.sCurrentArguments[this.SQUERYKEYNAME] = {};
        }
        this.sCurrentArguments[this.SQUERYKEYNAME].layout = oEvent.getParameter("layout");
      }
      this._forceModelContextChangeOnBreadCrumbs(oEvent);

      // Replace the URL with the new layout if a navigation arrow was used
      if (bIsNavigationArrow) {
        this._oRouterProxy.navTo(this.sCurrentRouteName, this.sCurrentArguments);
      }
    }

    /**
     * Function to fire ModelContextChange event on all breadcrumbs ( on each ObjectPages).
     *
     * @name sap.fe.core.rootView.Fcl.controller#_forceModelContextChangeOnBreadCrumbs
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto._forceModelContextChangeOnBreadCrumbs = function _forceModelContextChangeOnBreadCrumbs(oEvent) {
      //force modelcontextchange on ObjectPages to refresh the breadcrumbs link hrefs
      var oFcl = oEvent.getSource();
      var oPages = [];
      oPages = oPages.concat(oFcl.getBeginColumnPages()).concat(oFcl.getMidColumnPages()).concat(oFcl.getEndColumnPages());
      oPages.forEach(function (oPage) {
        var oView = _getViewFromContainer(oPage);
        var oBreadCrumbs = oView.byId && oView.byId("breadcrumbs");
        if (oBreadCrumbs) {
          oBreadCrumbs.fireModelContextChange();
        }
      });
    }

    /**
     * Function triggered to update the Share button Visibility.
     *
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param viewColumn Name of the current column ("beginColumn", "midColumn", "endColumn")
     * @param sLayout The current layout used by the FCL
     * @returns The share button visibility
     */;
    _proto._updateShareButtonVisibility = function _updateShareButtonVisibility(viewColumn, sLayout) {
      var bShowShareIcon;
      switch (sLayout) {
        case "OneColumn":
          bShowShareIcon = viewColumn === "beginColumn";
          break;
        case "MidColumnFullScreen":
        case "ThreeColumnsBeginExpandedEndHidden":
        case "ThreeColumnsMidExpandedEndHidden":
        case "TwoColumnsBeginExpanded":
        case "TwoColumnsMidExpanded":
          bShowShareIcon = viewColumn === "midColumn";
          break;
        case "EndColumnFullScreen":
        case "ThreeColumnsEndExpanded":
        case "ThreeColumnsMidExpanded":
          bShowShareIcon = viewColumn === "endColumn";
          break;
        default:
          bShowShareIcon = false;
      }
      return bShowShareIcon;
    };
    _proto.updateUIStateForView = function updateUIStateForView(oView, FCLLevel) {
      var oUIState = this.getHelper().getCurrentUIState(),
        oFclColName = ["beginColumn", "midColumn", "endColumn"],
        sLayout = this.getFclControl().getLayout();
      var viewColumn;
      if (!oView.getModel("fclhelper")) {
        oView.setModel(this._createHelperModel(), "fclhelper");
      }
      if (FCLLevel >= this._oFCLConfig.maxColumnsCount) {
        // The view is on a level > max number of columns. It's always fullscreen without close/exit buttons
        viewColumn = oFclColName[this._oFCLConfig.maxColumnsCount - 1];
        oUIState.actionButtonsInfo.midColumn.fullScreen = null;
        oUIState.actionButtonsInfo.midColumn.exitFullScreen = null;
        oUIState.actionButtonsInfo.midColumn.closeColumn = null;
        oUIState.actionButtonsInfo.endColumn.exitFullScreen = null;
        oUIState.actionButtonsInfo.endColumn.fullScreen = null;
        oUIState.actionButtonsInfo.endColumn.closeColumn = null;
      } else {
        viewColumn = oFclColName[FCLLevel];
      }
      if (FCLLevel >= this._oFCLConfig.maxColumnsCount || sLayout === "EndColumnFullScreen" || sLayout === "MidColumnFullScreen" || sLayout === "OneColumn") {
        oView.getModel("fclhelper").setProperty("/breadCrumbIsVisible", true);
      } else {
        oView.getModel("fclhelper").setProperty("/breadCrumbIsVisible", false);
      }
      // Unfortunately, the FCLHelper doesn't provide actionButton values for the first column
      // so we have to add this info manually
      oUIState.actionButtonsInfo.beginColumn = {
        fullScreen: null,
        exitFullScreen: null,
        closeColumn: null
      };
      var oActionButtonInfos = Object.assign({}, oUIState.actionButtonsInfo[viewColumn]);
      oActionButtonInfos.switchVisible = oActionButtonInfos.fullScreen !== null || oActionButtonInfos.exitFullScreen !== null;
      oActionButtonInfos.switchIcon = oActionButtonInfos.fullScreen !== null ? "sap-icon://full-screen" : "sap-icon://exit-full-screen";
      oActionButtonInfos.isFullScreen = oActionButtonInfos.fullScreen === null;
      oView.getModel("fclhelper").setProperty("/actionButtonsInfo", oActionButtonInfos);
      oView.getModel("fclhelper").setProperty("/showShareIcon", this._updateShareButtonVisibility(viewColumn, sLayout));
    }

    /**
     * Function triggered by the router BeforeRouteMatched event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onBeforeRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onBeforeRouteMatched = function onBeforeRouteMatched(oEvent) {
      if (oEvent) {
        var oQueryParams = oEvent.getParameters().arguments[this.SQUERYKEYNAME];
        var sLayout = oQueryParams ? oQueryParams.layout : null;

        // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
        if (!sLayout) {
          var oNextUIState = this.getHelper().getNextUIState(0);
          sLayout = oNextUIState.layout;
        }

        // Check if the layout if compatible with the number of targets
        // This should always be the case for normal navigation, just needed in case
        // the URL has been manually modified
        var aTargets = oEvent.getParameter("config").target;
        sLayout = this._correctLayoutForTargets(sLayout, aTargets);

        // Update the layout of the FlexibleColumnLayout
        if (sLayout) {
          this.getFclControl().setLayout(sLayout);
        }
      }
    }

    /**
     * Helper for the FCL Component.
     *
     * @name sap.fe.core.rootView.Fcl.controller#getHelper
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns Instance of a semantic helper
     */;
    _proto.getHelper = function getHelper() {
      return FlexibleColumnLayoutSemanticHelper.getInstanceFor(this.getFclControl(), this._oFCLConfig);
    }

    /**
     * Calculates the FCL layout for a given FCL level and a target hash.
     *
     * @param iNextFCLLevel FCL level to be navigated to
     * @param sHash The hash to be navigated to
     * @param sProposedLayout The proposed layout
     * @param keepCurrentLayout True if we want to keep the current layout if possible
     * @returns The calculated layout
     */;
    _proto.calculateLayout = function calculateLayout(iNextFCLLevel, sHash, sProposedLayout) {
      var keepCurrentLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      // First, ask the FCL helper to calculate the layout if nothing is proposed
      if (!sProposedLayout) {
        sProposedLayout = keepCurrentLayout ? this.getFclControl().getLayout() : this.getHelper().getNextUIState(iNextFCLLevel).layout;
      }

      // Then change this value if necessary, based on the number of targets
      var oRoute = this.getRouter().getRouteByHash("".concat(sHash, "?layout=").concat(sProposedLayout));
      var aTargets = this._oTargetsFromRoutePattern[oRoute.getPattern()];
      return this._correctLayoutForTargets(sProposedLayout, aTargets);
    }

    /**
     * Checks whether a given FCL layout is compatible with an array of targets.
     *
     * @param sProposedLayout Proposed value for the FCL layout
     * @param aTargets Array of target names used for checking
     * @returns The corrected layout
     */;
    _proto._correctLayoutForTargets = function _correctLayoutForTargets(sProposedLayout, aTargets) {
      var allAllowedLayouts = {
        "2": ["TwoColumnsMidExpanded", "TwoColumnsBeginExpanded", "MidColumnFullScreen"],
        "3": ["ThreeColumnsMidExpanded", "ThreeColumnsEndExpanded", "ThreeColumnsMidExpandedEndHidden", "ThreeColumnsBeginExpandedEndHidden", "MidColumnFullScreen", "EndColumnFullScreen"]
      };
      if (aTargets && !Array.isArray(aTargets)) {
        // To support single target as a string in the manifest
        aTargets = [aTargets];
      }
      if (!aTargets) {
        // Defensive, just in case...
        return sProposedLayout;
      } else if (aTargets.length > 1) {
        // More than 1 target: just simply check from the allowed values
        var aLayouts = allAllowedLayouts[aTargets.length];
        if (aLayouts.indexOf(sProposedLayout) < 0) {
          // The proposed layout isn't compatible with the number of columns
          // --> Ask the helper for the default layout for the number of columns
          sProposedLayout = aLayouts[0];
        }
      } else {
        // Only one target
        var sTargetAggregation = this.getTargetAggregation()[aTargets[0]].aggregation || this._oFCLConfig.defaultControlAggregation;
        switch (sTargetAggregation) {
          case "beginColumnPages":
            sProposedLayout = "OneColumn";
            break;
          case "midColumnPages":
            sProposedLayout = "MidColumnFullScreen";
            break;
          case "endColumnPages":
            sProposedLayout = "EndColumnFullScreen";
            break;
          // no default
        }
      }

      return sProposedLayout;
    }

    /**
     * Gets the instanced views in the FCL component.
     *
     * @returns {Array} Return the views.
     */;
    _proto.getInstancedViews = function getInstancedViews() {
      var fclControl = this.getFclControl();
      var componentContainers = [].concat(_toConsumableArray(fclControl.getBeginColumnPages()), _toConsumableArray(fclControl.getMidColumnPages()), _toConsumableArray(fclControl.getEndColumnPages()));
      return componentContainers.map(function (oPage) {
        return oPage.getComponentInstance().getRootControl();
      });
    }

    /**
     * get all visible views in the FCL component.
     * sLayout optional parameter is very specific as part of the calculation of the latest navigated row
     *
     * @param {*} sLayout Layout that was applied just before the current navigation
     * @returns {Array} return views
     */;
    _proto._getAllVisibleViews = function _getAllVisibleViews(sLayout) {
      var aViews = [];
      sLayout = sLayout ? sLayout : this.getFclControl().getLayout();
      switch (sLayout) {
        case LayoutType.EndColumnFullScreen:
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.MidColumnFullScreen:
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        case LayoutType.OneColumn:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          break;
        case LayoutType.ThreeColumnsEndExpanded:
        case LayoutType.ThreeColumnsMidExpanded:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.TwoColumnsBeginExpanded:
        case LayoutType.TwoColumnsMidExpanded:
        case LayoutType.ThreeColumnsMidExpandedEndHidden:
        case LayoutType.ThreeColumnsBeginExpandedEndHidden:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        default:
          Log.error("Unhandled switch case for ".concat(this.getFclControl().getLayout()));
      }
      return aViews;
    };
    _proto._getAllViews = function _getAllViews(sLayout) {
      var aViews = [];
      sLayout = sLayout ? sLayout : this.getFclControl().getLayout();
      switch (sLayout) {
        case LayoutType.OneColumn:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          break;
        case LayoutType.ThreeColumnsEndExpanded:
        case LayoutType.ThreeColumnsMidExpanded:
        case LayoutType.ThreeColumnsMidExpandedEndHidden:
        case LayoutType.ThreeColumnsBeginExpandedEndHidden:
        case LayoutType.EndColumnFullScreen:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.TwoColumnsBeginExpanded:
        case LayoutType.TwoColumnsMidExpanded:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        case LayoutType.MidColumnFullScreen:
          // In this case we need to determine if this mid column fullscreen comes from a 2 or a 3 column layout
          var sLayoutWhenExitFullScreen = this.getHelper().getCurrentUIState().actionButtonsInfo.midColumn.exitFullScreen;
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (sLayoutWhenExitFullScreen.indexOf("ThreeColumn") >= 0) {
            // We come from a 3 column layout
            if (this.getFclControl().getCurrentEndColumnPage()) {
              aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
            }
          }
          break;
        default:
          Log.error("Unhandled switch case for ".concat(this.getFclControl().getLayout()));
      }
      return aViews;
    };
    _proto.onContainerReady = function onContainerReady() {
      // Restore views if neccessary.
      var aViews = this._getAllVisibleViews();
      var aRestorePromises = aViews.reduce(function (aPromises, oTargetView) {
        aPromises.push(KeepAliveHelper.restoreView(oTargetView));
        return aPromises;
      }, []);
      return Promise.all(aRestorePromises);
    };
    _proto.getRightmostContext = function getRightmostContext() {
      var oView = this.getRightmostView();
      return oView && oView.getBindingContext();
    };
    _proto.getRightmostView = function getRightmostView() {
      return this._getAllViews().pop();
    };
    _proto.isContextUsedInPages = function isContextUsedInPages(oContext) {
      if (!this.getFclControl()) {
        return false;
      }
      var aAllVisibleViews = this._getAllViews();
      var _iterator = _createForOfIteratorHelper(aAllVisibleViews),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var view = _step.value;
          if (view) {
            if (view.getBindingContext() === oContext) {
              return true;
            }
          } else {
            // A view has been destroyed --> app is currently being destroyed
            return false;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return false;
    };
    return FclController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FclController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMYXlvdXRUeXBlIiwiZkxpYnJhcnkiLCJDT05TVEFOVFMiLCJwYWdlIiwibmFtZXMiLCJjdXJyZW50R2V0dGVyIiwicHJlZml4Iiwic3VmZml4IiwiZ2V0dGVyIiwiX2dldFZpZXdGcm9tQ29udGFpbmVyIiwib0NvbnRhaW5lciIsImlzQSIsImdldENvbXBvbmVudEluc3RhbmNlIiwiZ2V0Um9vdENvbnRyb2wiLCJGY2xDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlZpZXdTdGF0ZSIsIm92ZXJyaWRlIiwiYXBwbHlJbml0aWFsU3RhdGVPbmx5IiwiYWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzIiwiYUNvbnRyb2xzIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfZ2V0QWxsVmlzaWJsZVZpZXdzIiwiZm9yRWFjaCIsIm9DaGlsZFZpZXciLCJwQ2hpbGRWaWV3IiwiUHJvbWlzZSIsInJlc29sdmUiLCJwdXNoIiwiYWRhcHRTdGF0ZUNvbnRyb2xzIiwiYVN0YXRlQ29udHJvbHMiLCJvblJlc3RvcmUiLCJvVmlldyIsIm9GQ0xDb250cm9sbGVyIiwib05hdkNvbnRhaW5lciIsImdldEFwcENvbnRlbnRDb250YWluZXIiLCJvSW50ZXJuYWxNb2RlbCIsImdldE1vZGVsIiwib1BhZ2VzIiwiZ2V0UHJvcGVydHkiLCJzQ29tcG9uZW50SWQiLCJzZXRQcm9wZXJ0eSIsIm9uQ29udGFpbmVyUmVhZHkiLCJvblN1c3BlbmQiLCJvRkNMQ29udHJvbCIsImdldEZjbENvbnRyb2wiLCJhQmVnaW5Db2x1bW5QYWdlcyIsImdldEJlZ2luQ29sdW1uUGFnZXMiLCJhTWlkQ29sdW1uUGFnZXMiLCJnZXRNaWRDb2x1bW5QYWdlcyIsImFFbmRDb2x1bW5QYWdlcyIsImdldEVuZENvbHVtblBhZ2VzIiwiYVBhZ2VzIiwiY29uY2F0Iiwib1BhZ2UiLCJvVGFyZ2V0VmlldyIsIm9Db250cm9sbGVyIiwidmlld1N0YXRlIiwib25Jbml0IiwiX2ludGVybmFsSW5pdCIsImF0dGFjaFJvdXRlTWF0Y2hlcnMiLCJnZXRSb3V0ZXIiLCJhdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQiLCJfZ2V0Vmlld0Zvck5hdmlnYXRlZFJvd3NDb21wdXRhdGlvbiIsIm9uQmVmb3JlUm91dGVNYXRjaGVkIiwiYXR0YWNoUm91dGVNYXRjaGVkIiwib25Sb3V0ZU1hdGNoZWQiLCJhdHRhY2hTdGF0ZUNoYW5nZSIsIl9zYXZlTGF5b3V0IiwiX29Sb3V0ZXJQcm94eSIsInNDdXJyZW50Um91dGVOYW1lIiwic0N1cnJlbnRBcmd1bWVudHMiLCJTUVVFUllLRVlOQU1FIiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsImdldFJvdXRlclByb3h5IiwiX29GQ0xDb25maWciLCJtYXhDb2x1bW5zQ291bnQiLCJvUm91dGluZ0NvbmZpZyIsImdldE1hbmlmZXN0Iiwicm91dGluZyIsImNvbmZpZyIsImZsZXhpYmxlQ29sdW1uTGF5b3V0Iiwib0ZDTE1hbmlmZXN0Q29uZmlnIiwiZGVmYXVsdFR3b0NvbHVtbkxheW91dFR5cGUiLCJkZWZhdWx0VGhyZWVDb2x1bW5MYXlvdXRUeXBlIiwibGltaXRGQ0xUb1R3b0NvbHVtbnMiLCJjb250cm9sQWdncmVnYXRpb24iLCJkZWZhdWx0Q29udHJvbEFnZ3JlZ2F0aW9uIiwiX2luaXRpYWxpemVUYXJnZXRBZ2dyZWdhdGlvbiIsIl9pbml0aWFsaXplUm91dGVzSW5mb3JtYXRpb24iLCJnZXRDb250ZW50Iiwib0V2ZW50Iiwic1ByZXZpb3VzTGF5b3V0IiwiZ2V0UGFyYW1ldGVycyIsImxheW91dCIsImFBbGxWaXNpYmxlVmlld3NCZWZvcmVSb3V0ZU1hdGNoZWQiLCJvUmlnaHRNb3N0Vmlld0JlZm9yZVJvdXRlTWF0Y2hlZCIsImxlbmd0aCIsIm9SaWdodE1vc3RWaWV3IiwiYXR0YWNoRXZlbnRPbmNlIiwiZ2V0UGFyYW1ldGVyIiwiZ2V0Vmlld0RhdGEiLCJ2aWV3TGV2ZWwiLCJvQWRkaXRpb25hbFZpZXdGb3JOYXZSb3dzQ29tcHV0YXRpb24iLCJnZXRWaWV3Rm9yTmF2aWdhdGVkUm93c0NvbXB1dGF0aW9uIiwib25FeGl0IiwiZGV0YWNoUm91dGVNYXRjaGVkIiwiZGV0YWNoQmVmb3JlUm91dGVNYXRjaGVkIiwiZGV0YWNoU3RhdGVDaGFuZ2UiLCJvblN0YXRlQ2hhbmdlZCIsImRldGFjaEFmdGVyRW5kQ29sdW1uTmF2aWdhdGUiLCJfb1RhcmdldHNBZ2dyZWdhdGlvbiIsIl9vVGFyZ2V0c0Zyb21Sb3V0ZVBhdHRlcm4iLCJCYXNlQ29udHJvbGxlciIsInByb3RvdHlwZSIsImJpbmQiLCJpc0ZjbEVuYWJsZWQiLCJkaXNwbGF5TWVzc2FnZVBhZ2UiLCJzRXJyb3JNZXNzYWdlIiwibVBhcmFtZXRlcnMiLCJGQ0xMZXZlbCIsImFNZXNzYWdlUGFnZXMiLCJvTWVzc2FnZVBhZ2UiLCJNZXNzYWdlUGFnZSIsInNob3dIZWFkZXIiLCJpY29uIiwiYWRkQmVnaW5Db2x1bW5QYWdlIiwiYWRkTWlkQ29sdW1uUGFnZSIsImFkZEVuZENvbHVtblBhZ2UiLCJzZXRUZXh0IiwidGVjaG5pY2FsTWVzc2FnZSIsInNldEN1c3RvbURlc2NyaXB0aW9uIiwiTGluayIsInRleHQiLCJkZXNjcmlwdGlvbiIsInByZXNzIiwiTWVzc2FnZUJveCIsInNob3ciLCJJY29uIiwiRVJST1IiLCJ0aXRsZSIsImFjdGlvbnMiLCJBY3Rpb24iLCJPSyIsImRlZmF1bHRBY3Rpb24iLCJkZXRhaWxzIiwidGVjaG5pY2FsRGV0YWlscyIsImNvbnRlbnRXaWR0aCIsInNldERlc2NyaXB0aW9uIiwidG8iLCJnZXRJZCIsIm9NYW5pZmVzdCIsIm9UYXJnZXRzIiwidGFyZ2V0cyIsIk9iamVjdCIsImtleXMiLCJzVGFyZ2V0TmFtZSIsIm9UYXJnZXQiLCJhZ2dyZWdhdGlvbiIsInBhdHRlcm4iLCJjb250ZXh0UGF0dGVybiIsImFSb3V0ZXMiLCJyb3V0ZXMiLCJyb3V0ZSIsInRhcmdldCIsImdldEN1cnJlbnRBcmd1bWVudCIsImdldEN1cnJlbnRSb3V0ZU5hbWUiLCJnZXRDb25zdGFudHMiLCJnZXRUYXJnZXRBZ2dyZWdhdGlvbiIsInNSb3V0ZU5hbWUiLCJfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMiLCJhVmlld3MiLCJzQ3VycmVudFZpZXdQYXRoIiwib0FkZGl0aW9uYWxWaWV3IiwiaW5kZXhPZiIsImluZGV4Iiwib1ByZXZpb3VzVmlldyIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0UGF0aCIsIl9zY3JvbGxUYWJsZXNUb1JvdyIsImJJc05hdmlnYXRpb25BcnJvdyIsInVuZGVmaW5lZCIsIl9mb3JjZU1vZGVsQ29udGV4dENoYW5nZU9uQnJlYWRDcnVtYnMiLCJuYXZUbyIsIm9GY2wiLCJnZXRTb3VyY2UiLCJvQnJlYWRDcnVtYnMiLCJieUlkIiwiZmlyZU1vZGVsQ29udGV4dENoYW5nZSIsIl91cGRhdGVTaGFyZUJ1dHRvblZpc2liaWxpdHkiLCJ2aWV3Q29sdW1uIiwic0xheW91dCIsImJTaG93U2hhcmVJY29uIiwidXBkYXRlVUlTdGF0ZUZvclZpZXciLCJvVUlTdGF0ZSIsImdldEhlbHBlciIsImdldEN1cnJlbnRVSVN0YXRlIiwib0ZjbENvbE5hbWUiLCJnZXRMYXlvdXQiLCJzZXRNb2RlbCIsIl9jcmVhdGVIZWxwZXJNb2RlbCIsImFjdGlvbkJ1dHRvbnNJbmZvIiwibWlkQ29sdW1uIiwiZnVsbFNjcmVlbiIsImV4aXRGdWxsU2NyZWVuIiwiY2xvc2VDb2x1bW4iLCJlbmRDb2x1bW4iLCJiZWdpbkNvbHVtbiIsIm9BY3Rpb25CdXR0b25JbmZvcyIsImFzc2lnbiIsInN3aXRjaFZpc2libGUiLCJzd2l0Y2hJY29uIiwiaXNGdWxsU2NyZWVuIiwib1F1ZXJ5UGFyYW1zIiwiYXJndW1lbnRzIiwib05leHRVSVN0YXRlIiwiZ2V0TmV4dFVJU3RhdGUiLCJhVGFyZ2V0cyIsIl9jb3JyZWN0TGF5b3V0Rm9yVGFyZ2V0cyIsInNldExheW91dCIsIkZsZXhpYmxlQ29sdW1uTGF5b3V0U2VtYW50aWNIZWxwZXIiLCJnZXRJbnN0YW5jZUZvciIsImNhbGN1bGF0ZUxheW91dCIsImlOZXh0RkNMTGV2ZWwiLCJzSGFzaCIsInNQcm9wb3NlZExheW91dCIsImtlZXBDdXJyZW50TGF5b3V0Iiwib1JvdXRlIiwiZ2V0Um91dGVCeUhhc2giLCJnZXRQYXR0ZXJuIiwiYWxsQWxsb3dlZExheW91dHMiLCJBcnJheSIsImlzQXJyYXkiLCJhTGF5b3V0cyIsInNUYXJnZXRBZ2dyZWdhdGlvbiIsImdldEluc3RhbmNlZFZpZXdzIiwiZmNsQ29udHJvbCIsImNvbXBvbmVudENvbnRhaW5lcnMiLCJtYXAiLCJFbmRDb2x1bW5GdWxsU2NyZWVuIiwiZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UiLCJNaWRDb2x1bW5GdWxsU2NyZWVuIiwiZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UiLCJPbmVDb2x1bW4iLCJnZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlIiwiVGhyZWVDb2x1bW5zRW5kRXhwYW5kZWQiLCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZCIsIlR3b0NvbHVtbnNCZWdpbkV4cGFuZGVkIiwiVHdvQ29sdW1uc01pZEV4cGFuZGVkIiwiVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWRFbmRIaWRkZW4iLCJUaHJlZUNvbHVtbnNCZWdpbkV4cGFuZGVkRW5kSGlkZGVuIiwiTG9nIiwiZXJyb3IiLCJfZ2V0QWxsVmlld3MiLCJzTGF5b3V0V2hlbkV4aXRGdWxsU2NyZWVuIiwiYVJlc3RvcmVQcm9taXNlcyIsInJlZHVjZSIsImFQcm9taXNlcyIsIktlZXBBbGl2ZUhlbHBlciIsInJlc3RvcmVWaWV3IiwiYWxsIiwiZ2V0UmlnaHRtb3N0Q29udGV4dCIsImdldFJpZ2h0bW9zdFZpZXciLCJwb3AiLCJpc0NvbnRleHRVc2VkSW5QYWdlcyIsIm9Db250ZXh0IiwiYUFsbFZpc2libGVWaWV3cyIsInZpZXciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZjbC5jb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgRmxleGlibGVDb2x1bW5MYXlvdXQgZnJvbSBcInNhcC9mL0ZsZXhpYmxlQ29sdW1uTGF5b3V0XCI7XG5pbXBvcnQgRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlciBmcm9tIFwic2FwL2YvRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlclwiO1xuaW1wb3J0IGZMaWJyYXJ5IGZyb20gXCJzYXAvZi9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgUm91dGVyUHJveHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvUm91dGVyUHJveHlcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IExpbmsgZnJvbSBcInNhcC9tL0xpbmtcIjtcbmltcG9ydCBNZXNzYWdlQm94LCB7IEFjdGlvbiwgSWNvbiB9IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgTWVzc2FnZVBhZ2UgZnJvbSBcInNhcC9tL01lc3NhZ2VQYWdlXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgWE1MVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1hNTFZpZXdcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IEJhc2VDb250cm9sbGVyIGZyb20gXCIuL1Jvb3RWaWV3QmFzZUNvbnRyb2xsZXJcIjtcblxuY29uc3QgTGF5b3V0VHlwZSA9IGZMaWJyYXJ5LkxheW91dFR5cGU7XG5cbmNvbnN0IENPTlNUQU5UUyA9IHtcblx0cGFnZToge1xuXHRcdG5hbWVzOiBbXCJCZWdpbkNvbHVtblwiLCBcIk1pZENvbHVtblwiLCBcIkVuZENvbHVtblwiXSxcblx0XHRjdXJyZW50R2V0dGVyOiB7XG5cdFx0XHRwcmVmaXg6IFwiZ2V0Q3VycmVudFwiLFxuXHRcdFx0c3VmZml4OiBcIlBhZ2VcIlxuXHRcdH0sXG5cdFx0Z2V0dGVyOiB7XG5cdFx0XHRwcmVmaXg6IFwiZ2V0XCIsXG5cdFx0XHRzdWZmaXg6IFwiUGFnZXNcIlxuXHRcdH1cblx0fVxufTtcbmNvbnN0IF9nZXRWaWV3RnJvbUNvbnRhaW5lciA9IGZ1bmN0aW9uIChvQ29udGFpbmVyOiBhbnkpIHtcblx0aWYgKG9Db250YWluZXIuaXNBKFwic2FwLnVpLmNvcmUuQ29tcG9uZW50Q29udGFpbmVyXCIpKSB7XG5cdFx0cmV0dXJuIG9Db250YWluZXIuZ2V0Q29tcG9uZW50SW5zdGFuY2UoKS5nZXRSb290Q29udHJvbCgpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBvQ29udGFpbmVyO1xuXHR9XG59O1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5yb290Vmlldy5GY2xcIilcbmNsYXNzIEZjbENvbnRyb2xsZXIgZXh0ZW5kcyBCYXNlQ29udHJvbGxlciB7XG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRWaWV3U3RhdGUub3ZlcnJpZGUoe1xuXHRcdFx0YXBwbHlJbml0aWFsU3RhdGVPbmx5OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRhZGFwdEJpbmRpbmdSZWZyZXNoQ29udHJvbHM6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUsIGFDb250cm9sczogYW55KSB7XG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgRmNsQ29udHJvbGxlcikuX2dldEFsbFZpc2libGVWaWV3cygpLmZvckVhY2goZnVuY3Rpb24gKG9DaGlsZFZpZXc6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IHBDaGlsZFZpZXcgPSBQcm9taXNlLnJlc29sdmUob0NoaWxkVmlldyk7XG5cdFx0XHRcdFx0YUNvbnRyb2xzLnB1c2gocENoaWxkVmlldyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdGFkYXB0U3RhdGVDb250cm9sczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSwgYVN0YXRlQ29udHJvbHM6IGFueSkge1xuXHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIEZjbENvbnRyb2xsZXIpLl9nZXRBbGxWaXNpYmxlVmlld3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChvQ2hpbGRWaWV3OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBwQ2hpbGRWaWV3ID0gUHJvbWlzZS5yZXNvbHZlKG9DaGlsZFZpZXcpO1xuXHRcdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gocENoaWxkVmlldyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdG9uUmVzdG9yZTogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdFx0XHRjb25zdCBvRkNMQ29udHJvbGxlciA9IHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBGY2xDb250cm9sbGVyO1xuXHRcdFx0XHRjb25zdCBvTmF2Q29udGFpbmVyID0gb0ZDTENvbnRyb2xsZXIuZ2V0QXBwQ29udGVudENvbnRhaW5lcihvVmlldyk7XG5cdFx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsID0gb05hdkNvbnRhaW5lci5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0Y29uc3Qgb1BhZ2VzID0gb0ludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoXCIvcGFnZXNcIik7XG5cblx0XHRcdFx0Zm9yIChjb25zdCBzQ29tcG9uZW50SWQgaW4gb1BhZ2VzKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoYC9wYWdlcy8ke3NDb21wb25lbnRJZH0vcmVzdG9yZVN0YXR1c2AsIFwicGVuZGluZ1wiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvRkNMQ29udHJvbGxlci5vbkNvbnRhaW5lclJlYWR5KCk7XG5cdFx0XHR9LFxuXHRcdFx0b25TdXNwZW5kOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlKSB7XG5cdFx0XHRcdGNvbnN0IG9GQ0xDb250cm9sbGVyID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIEZjbENvbnRyb2xsZXI7XG5cdFx0XHRcdGNvbnN0IG9GQ0xDb250cm9sID0gb0ZDTENvbnRyb2xsZXIuZ2V0RmNsQ29udHJvbCgpO1xuXHRcdFx0XHRjb25zdCBhQmVnaW5Db2x1bW5QYWdlczogQ29udHJvbFtdID0gb0ZDTENvbnRyb2wuZ2V0QmVnaW5Db2x1bW5QYWdlcygpIHx8IFtdO1xuXHRcdFx0XHRjb25zdCBhTWlkQ29sdW1uUGFnZXM6IENvbnRyb2xbXSA9IG9GQ0xDb250cm9sLmdldE1pZENvbHVtblBhZ2VzKCkgfHwgW107XG5cdFx0XHRcdGNvbnN0IGFFbmRDb2x1bW5QYWdlczogQ29udHJvbFtdID0gb0ZDTENvbnRyb2wuZ2V0RW5kQ29sdW1uUGFnZXMoKSB8fCBbXTtcblx0XHRcdFx0Y29uc3QgYVBhZ2VzID0gKFtdIGFzIENvbnRyb2xbXSkuY29uY2F0KGFCZWdpbkNvbHVtblBhZ2VzLCBhTWlkQ29sdW1uUGFnZXMsIGFFbmRDb2x1bW5QYWdlcyk7XG5cblx0XHRcdFx0YVBhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG9QYWdlOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IF9nZXRWaWV3RnJvbUNvbnRhaW5lcihvUGFnZSk7XG5cblx0XHRcdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9UYXJnZXRWaWV3ICYmIG9UYXJnZXRWaWV3LmdldENvbnRyb2xsZXIoKTtcblx0XHRcdFx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZS5vblN1c3BlbmQpIHtcblx0XHRcdFx0XHRcdG9Db250cm9sbGVyLnZpZXdTdGF0ZS5vblN1c3BlbmQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0dmlld1N0YXRlITogVmlld1N0YXRlO1xuXG5cdHByaXZhdGUgX29Sb3V0ZXJQcm94eSE6IFJvdXRlclByb3h5O1xuXHRwcml2YXRlIHNDdXJyZW50Um91dGVOYW1lITogc3RyaW5nO1xuXHRwcml2YXRlIHNDdXJyZW50QXJndW1lbnRzPzogYW55O1xuXHRwcml2YXRlIHNQcmV2aW91c0xheW91dCE6IHN0cmluZztcblx0cHJpdmF0ZSBTUVVFUllLRVlOQU1FITogc3RyaW5nO1xuXHRwcml2YXRlIF9vRkNMQ29uZmlnOiBhbnk7XG5cdHByaXZhdGUgb0FkZGl0aW9uYWxWaWV3Rm9yTmF2Um93c0NvbXB1dGF0aW9uOiBhbnk7XG5cdHByaXZhdGUgX29UYXJnZXRzQWdncmVnYXRpb246IGFueTtcblx0cHJpdmF0ZSBfb1RhcmdldHNGcm9tUm91dGVQYXR0ZXJuOiBhbnk7XG5cdHByaXZhdGUgYU1lc3NhZ2VQYWdlcz86IGFueVtdO1xuXHQvKipcblx0ICogQHByaXZhdGVcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmdldE1ldGFkYXRhXG5cdCAqIEBmdW5jdGlvblxuXHQgKi9cblxuXHRvbkluaXQoKSB7XG5cdFx0c3VwZXIub25Jbml0KCk7XG5cblx0XHR0aGlzLl9pbnRlcm5hbEluaXQoKTtcblx0fVxuXG5cdGF0dGFjaFJvdXRlTWF0Y2hlcnMoKSB7XG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5hdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5fZ2V0Vmlld0Zvck5hdmlnYXRlZFJvd3NDb21wdXRhdGlvbiwgdGhpcyk7XG5cdFx0c3VwZXIuYXR0YWNoUm91dGVNYXRjaGVycygpO1xuXHRcdHRoaXMuX2ludGVybmFsSW5pdCgpO1xuXG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5hdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5vbkJlZm9yZVJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5hdHRhY2hSb3V0ZU1hdGNoZWQodGhpcy5vblJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRGY2xDb250cm9sKCkuYXR0YWNoU3RhdGVDaGFuZ2UodGhpcy5fc2F2ZUxheW91dCwgdGhpcyk7XG5cdH1cblxuXHRfaW50ZXJuYWxJbml0KCkge1xuXHRcdGlmICh0aGlzLl9vUm91dGVyUHJveHkpIHtcblx0XHRcdHJldHVybjsgLy8gQWxyZWFkeSBpbml0aWFsaXplZFxuXHRcdH1cblxuXHRcdHRoaXMuc0N1cnJlbnRSb3V0ZU5hbWUgPSBcIlwiO1xuXHRcdHRoaXMuc0N1cnJlbnRBcmd1bWVudHMgPSB7fTtcblx0XHR0aGlzLlNRVUVSWUtFWU5BTUUgPSBcIj9xdWVyeVwiO1xuXG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cblx0XHR0aGlzLl9vUm91dGVyUHJveHkgPSBvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCk7XG5cblx0XHQvLyBHZXQgRkNMIGNvbmZpZ3VyYXRpb24gaW4gdGhlIG1hbmlmZXN0XG5cdFx0dGhpcy5fb0ZDTENvbmZpZyA9IHsgbWF4Q29sdW1uc0NvdW50OiAzIH07XG5cdFx0Y29uc3Qgb1JvdXRpbmdDb25maWcgPSAob0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdCgpIGFzIGFueSlbXCJzYXAudWk1XCJdLnJvdXRpbmc7XG5cblx0XHRpZiAob1JvdXRpbmdDb25maWc/LmNvbmZpZz8uZmxleGlibGVDb2x1bW5MYXlvdXQpIHtcblx0XHRcdGNvbnN0IG9GQ0xNYW5pZmVzdENvbmZpZyA9IG9Sb3V0aW5nQ29uZmlnLmNvbmZpZy5mbGV4aWJsZUNvbHVtbkxheW91dDtcblxuXHRcdFx0Ly8gRGVmYXVsdCBsYXlvdXQgZm9yIDIgY29sdW1uc1xuXHRcdFx0aWYgKG9GQ0xNYW5pZmVzdENvbmZpZy5kZWZhdWx0VHdvQ29sdW1uTGF5b3V0VHlwZSkge1xuXHRcdFx0XHR0aGlzLl9vRkNMQ29uZmlnLmRlZmF1bHRUd29Db2x1bW5MYXlvdXRUeXBlID0gb0ZDTE1hbmlmZXN0Q29uZmlnLmRlZmF1bHRUd29Db2x1bW5MYXlvdXRUeXBlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBEZWZhdWx0IGxheW91dCBmb3IgMyBjb2x1bW5zXG5cdFx0XHRpZiAob0ZDTE1hbmlmZXN0Q29uZmlnLmRlZmF1bHRUaHJlZUNvbHVtbkxheW91dFR5cGUpIHtcblx0XHRcdFx0dGhpcy5fb0ZDTENvbmZpZy5kZWZhdWx0VGhyZWVDb2x1bW5MYXlvdXRUeXBlID0gb0ZDTE1hbmlmZXN0Q29uZmlnLmRlZmF1bHRUaHJlZUNvbHVtbkxheW91dFR5cGU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIExpbWl0IEZDTCB0byAyIGNvbHVtbnMgP1xuXHRcdFx0aWYgKG9GQ0xNYW5pZmVzdENvbmZpZy5saW1pdEZDTFRvVHdvQ29sdW1ucyA9PT0gdHJ1ZSkge1xuXHRcdFx0XHR0aGlzLl9vRkNMQ29uZmlnLm1heENvbHVtbnNDb3VudCA9IDI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvUm91dGluZ0NvbmZpZz8uY29uZmlnPy5jb250cm9sQWdncmVnYXRpb24pIHtcblx0XHRcdHRoaXMuX29GQ0xDb25maWcuZGVmYXVsdENvbnRyb2xBZ2dyZWdhdGlvbiA9IG9Sb3V0aW5nQ29uZmlnLmNvbmZpZy5jb250cm9sQWdncmVnYXRpb247XG5cdFx0fVxuXG5cdFx0dGhpcy5faW5pdGlhbGl6ZVRhcmdldEFnZ3JlZ2F0aW9uKG9BcHBDb21wb25lbnQpO1xuXHRcdHRoaXMuX2luaXRpYWxpemVSb3V0ZXNJbmZvcm1hdGlvbihvQXBwQ29tcG9uZW50KTtcblx0fVxuXG5cdGdldEZjbENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmdldENvbnRlbnQoKVswXSBhcyBGbGV4aWJsZUNvbHVtbkxheW91dDtcblx0fVxuXG5cdF9zYXZlTGF5b3V0KG9FdmVudDogYW55KSB7XG5cdFx0dGhpcy5zUHJldmlvdXNMYXlvdXQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVycygpLmxheW91dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGFkZGl0aW9ubmFsIHZpZXcgKG9uIHRvcCBvZiB0aGUgdmlzaWJsZSB2aWV3cyksIHRvIGJlIGFibGUgdG8gY29tcHV0ZSB0aGUgbGF0ZXN0IHRhYmxlIG5hdmlnYXRlZCByb3dzIG9mXG5cdCAqIHRoZSBtb3N0IHJpZ2h0IHZpc2libGUgdmlldyBhZnRlciBhIG5hdiBiYWNrIG9yIGNvbHVtbiBmdWxsc2NyZWVuLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjX2dldFJpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqL1xuXG5cdF9nZXRWaWV3Rm9yTmF2aWdhdGVkUm93c0NvbXB1dGF0aW9uKCkge1xuXHRcdGNvbnN0IGFBbGxWaXNpYmxlVmlld3NCZWZvcmVSb3V0ZU1hdGNoZWQgPSB0aGlzLl9nZXRBbGxWaXNpYmxlVmlld3ModGhpcy5zUHJldmlvdXNMYXlvdXQpO1xuXHRcdGNvbnN0IG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkID0gYUFsbFZpc2libGVWaWV3c0JlZm9yZVJvdXRlTWF0Y2hlZFthQWxsVmlzaWJsZVZpZXdzQmVmb3JlUm91dGVNYXRjaGVkLmxlbmd0aCAtIDFdO1xuXHRcdGxldCBvUmlnaHRNb3N0Vmlldztcblx0XHR0aGlzLmdldFJvdXRlcigpLmF0dGFjaEV2ZW50T25jZShcInJvdXRlTWF0Y2hlZFwiLCAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdG9SaWdodE1vc3RWaWV3ID0gX2dldFZpZXdGcm9tQ29udGFpbmVyKG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2aWV3c1wiKVtvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmlld3NcIikubGVuZ3RoIC0gMV0pO1xuXHRcdFx0aWYgKG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkKSB7XG5cdFx0XHRcdC8vIE5hdmlnYXRpb24gZm9yd2FyZCBmcm9tIEwyIHRvIHZpZXcgbGV2ZWwgTDMgKEZ1bGxTY3JlZW5MYXlvdXQpOlxuXHRcdFx0XHRpZiAob1JpZ2h0TW9zdFZpZXcuZ2V0Vmlld0RhdGEoKSAmJiBvUmlnaHRNb3N0Vmlldy5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbCA9PT0gdGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQpIHtcblx0XHRcdFx0XHR0aGlzLm9BZGRpdGlvbmFsVmlld0Zvck5hdlJvd3NDb21wdXRhdGlvbiA9IG9SaWdodE1vc3RWaWV3O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIE5hdmlnYXRpb25zIGJhY2t3YXJkIGZyb20gTDMgZG93biB0byBMMiwgTDEsIEwwIChUaHJlZUNvbHVtbiBsYXlvdXQpOlxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0b1JpZ2h0TW9zdFZpZXcuZ2V0Vmlld0RhdGEoKSAmJlxuXHRcdFx0XHRcdG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkLmdldFZpZXdEYXRhKCkgJiZcblx0XHRcdFx0XHRvUmlnaHRNb3N0Vmlld0JlZm9yZVJvdXRlTWF0Y2hlZC5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbCA8IHRoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50ICYmXG5cdFx0XHRcdFx0b1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWQuZ2V0Vmlld0RhdGEoKSAmJlxuXHRcdFx0XHRcdG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkLmdldFZpZXdEYXRhKCkudmlld0xldmVsID4gb1JpZ2h0TW9zdFZpZXcuZ2V0Vmlld0RhdGEoKS52aWV3TGV2ZWwgJiZcblx0XHRcdFx0XHRvUmlnaHRNb3N0VmlldyAhPT0gb1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWRcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0dGhpcy5vQWRkaXRpb25hbFZpZXdGb3JOYXZSb3dzQ29tcHV0YXRpb24gPSBvUmlnaHRNb3N0Vmlld0JlZm9yZVJvdXRlTWF0Y2hlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0Vmlld0Zvck5hdmlnYXRlZFJvd3NDb21wdXRhdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5vQWRkaXRpb25hbFZpZXdGb3JOYXZSb3dzQ29tcHV0YXRpb247XG5cdH1cblxuXHRvbkV4aXQoKSB7XG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5kZXRhY2hSb3V0ZU1hdGNoZWQodGhpcy5vblJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5kZXRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5vbkJlZm9yZVJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRGY2xDb250cm9sKCkuZGV0YWNoU3RhdGVDaGFuZ2UodGhpcy5vblN0YXRlQ2hhbmdlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRGY2xDb250cm9sKCkuZGV0YWNoQWZ0ZXJFbmRDb2x1bW5OYXZpZ2F0ZSh0aGlzLm9uU3RhdGVDaGFuZ2VkLCB0aGlzKTtcblx0XHR0aGlzLl9vVGFyZ2V0c0FnZ3JlZ2F0aW9uID0gbnVsbDtcblx0XHR0aGlzLl9vVGFyZ2V0c0Zyb21Sb3V0ZVBhdHRlcm4gPSBudWxsO1xuXG5cdFx0QmFzZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uRXhpdC5iaW5kKHRoaXMpKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIEZDTCBjb21wb25lbnQgaXMgZW5hYmxlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI2lzRmNsRW5hYmxlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgYHRydWVgIHNpbmNlIHdlIGFyZSBpbiBGQ0wgc2NlbmFyaW9cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0aXNGY2xFbmFibGVkKCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0ZGlzcGxheU1lc3NhZ2VQYWdlKHNFcnJvck1lc3NhZ2U6IGFueSwgbVBhcmFtZXRlcnM6IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IG9GQ0xDb250cm9sID0gdGhpcy5nZXRGY2xDb250cm9sKCk7XG5cblx0XHRpZiAodGhpcy5fb0ZDTENvbmZpZyAmJiBtUGFyYW1ldGVycy5GQ0xMZXZlbCA+PSB0aGlzLl9vRkNMQ29uZmlnLm1heENvbHVtbnNDb3VudCkge1xuXHRcdFx0bVBhcmFtZXRlcnMuRkNMTGV2ZWwgPSB0aGlzLl9vRkNMQ29uZmlnLm1heENvbHVtbnNDb3VudCAtIDE7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmFNZXNzYWdlUGFnZXMpIHtcblx0XHRcdHRoaXMuYU1lc3NhZ2VQYWdlcyA9IFtudWxsLCBudWxsLCBudWxsXTtcblx0XHR9XG5cdFx0bGV0IG9NZXNzYWdlUGFnZSA9IHRoaXMuYU1lc3NhZ2VQYWdlc1ttUGFyYW1ldGVycy5GQ0xMZXZlbF07XG5cdFx0aWYgKCFvTWVzc2FnZVBhZ2UpIHtcblx0XHRcdG9NZXNzYWdlUGFnZSA9IG5ldyBNZXNzYWdlUGFnZSh7XG5cdFx0XHRcdHNob3dIZWFkZXI6IGZhbHNlLFxuXHRcdFx0XHRpY29uOiBcInNhcC1pY29uOi8vbWVzc2FnZS1lcnJvclwiXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuYU1lc3NhZ2VQYWdlc1ttUGFyYW1ldGVycy5GQ0xMZXZlbF0gPSBvTWVzc2FnZVBhZ2U7XG5cblx0XHRcdHN3aXRjaCAobVBhcmFtZXRlcnMuRkNMTGV2ZWwpIHtcblx0XHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRcdG9GQ0xDb250cm9sLmFkZEJlZ2luQ29sdW1uUGFnZShvTWVzc2FnZVBhZ2UpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRvRkNMQ29udHJvbC5hZGRNaWRDb2x1bW5QYWdlKG9NZXNzYWdlUGFnZSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRvRkNMQ29udHJvbC5hZGRFbmRDb2x1bW5QYWdlKG9NZXNzYWdlUGFnZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0b01lc3NhZ2VQYWdlLnNldFRleHQoc0Vycm9yTWVzc2FnZSk7XG5cblx0XHRpZiAobVBhcmFtZXRlcnMudGVjaG5pY2FsTWVzc2FnZSkge1xuXHRcdFx0b01lc3NhZ2VQYWdlLnNldEN1c3RvbURlc2NyaXB0aW9uKFxuXHRcdFx0XHRuZXcgTGluayh7XG5cdFx0XHRcdFx0dGV4dDogbVBhcmFtZXRlcnMuZGVzY3JpcHRpb24gfHwgbVBhcmFtZXRlcnMudGVjaG5pY2FsTWVzc2FnZSxcblx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0TWVzc2FnZUJveC5zaG93KG1QYXJhbWV0ZXJzLnRlY2huaWNhbE1lc3NhZ2UsIHtcblx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbi5FUlJPUixcblx0XHRcdFx0XHRcdFx0dGl0bGU6IG1QYXJhbWV0ZXJzLnRpdGxlLFxuXHRcdFx0XHRcdFx0XHRhY3Rpb25zOiBbQWN0aW9uLk9LXSxcblx0XHRcdFx0XHRcdFx0ZGVmYXVsdEFjdGlvbjogQWN0aW9uLk9LLFxuXHRcdFx0XHRcdFx0XHRkZXRhaWxzOiBtUGFyYW1ldGVycy50ZWNobmljYWxEZXRhaWxzIHx8IFwiXCIsXG5cdFx0XHRcdFx0XHRcdGNvbnRlbnRXaWR0aDogXCI2MCVcIlxuXHRcdFx0XHRcdFx0fSBhcyBhbnkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9NZXNzYWdlUGFnZS5zZXREZXNjcmlwdGlvbihtUGFyYW1ldGVycy5kZXNjcmlwdGlvbiB8fCBcIlwiKTtcblx0XHR9XG5cblx0XHQob0ZDTENvbnRyb2wgYXMgYW55KS50byhvTWVzc2FnZVBhZ2UuZ2V0SWQoKSk7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBvYmplY3QgX29UYXJnZXRzQWdncmVnYXRpb24gdGhhdCBkZWZpbmVzIGZvciBlYWNoIHJvdXRlIHRoZSByZWxldmFudCBhZ2dyZWdhdGlvbiBhbmQgcGF0dGVybi5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjX2luaXRpYWxpemVUYXJnZXRBZ2dyZWdhdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBbb0FwcENvbXBvbmVudF0gUmVmZXJlbmNlIHRvIHRoZSBBcHBDb21wb25lbnRcblx0ICovXG5cdF9pbml0aWFsaXplVGFyZ2V0QWdncmVnYXRpb24ob0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdFx0Y29uc3Qgb01hbmlmZXN0ID0gb0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdCgpIGFzIGFueSxcblx0XHRcdG9UYXJnZXRzID0gb01hbmlmZXN0W1wic2FwLnVpNVwiXS5yb3V0aW5nID8gb01hbmlmZXN0W1wic2FwLnVpNVwiXS5yb3V0aW5nLnRhcmdldHMgOiBudWxsO1xuXG5cdFx0dGhpcy5fb1RhcmdldHNBZ2dyZWdhdGlvbiA9IHt9O1xuXG5cdFx0aWYgKG9UYXJnZXRzKSB7XG5cdFx0XHRPYmplY3Qua2V5cyhvVGFyZ2V0cykuZm9yRWFjaCgoc1RhcmdldE5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRjb25zdCBvVGFyZ2V0ID0gb1RhcmdldHNbc1RhcmdldE5hbWVdO1xuXHRcdFx0XHRpZiAob1RhcmdldC5jb250cm9sQWdncmVnYXRpb24pIHtcblx0XHRcdFx0XHR0aGlzLl9vVGFyZ2V0c0FnZ3JlZ2F0aW9uW3NUYXJnZXROYW1lXSA9IHtcblx0XHRcdFx0XHRcdGFnZ3JlZ2F0aW9uOiBvVGFyZ2V0LmNvbnRyb2xBZ2dyZWdhdGlvbixcblx0XHRcdFx0XHRcdHBhdHRlcm46IG9UYXJnZXQuY29udGV4dFBhdHRlcm5cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuX29UYXJnZXRzQWdncmVnYXRpb25bc1RhcmdldE5hbWVdID0ge1xuXHRcdFx0XHRcdFx0YWdncmVnYXRpb246IFwicGFnZVwiLFxuXHRcdFx0XHRcdFx0cGF0dGVybjogbnVsbFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbWFwcGluZyBiZXR3ZWVuIGEgcm91dGUgKGlkZW50aWZlZCBhcyBpdHMgcGF0dGVybikgYW5kIHRoZSBjb3JyZXNwb25kaW5nIHRhcmdldHNcblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjX2luaXRpYWxpemVSb3V0ZXNJbmZvcm1hdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IHJlZiB0byB0aGUgQXBwQ29tcG9uZW50XG5cdCAqL1xuXG5cdF9pbml0aWFsaXplUm91dGVzSW5mb3JtYXRpb24ob0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdFx0Y29uc3Qgb01hbmlmZXN0ID0gb0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdCgpIGFzIGFueSxcblx0XHRcdGFSb3V0ZXMgPSBvTWFuaWZlc3RbXCJzYXAudWk1XCJdLnJvdXRpbmcgPyBvTWFuaWZlc3RbXCJzYXAudWk1XCJdLnJvdXRpbmcucm91dGVzIDogbnVsbDtcblxuXHRcdHRoaXMuX29UYXJnZXRzRnJvbVJvdXRlUGF0dGVybiA9IHt9O1xuXG5cdFx0aWYgKGFSb3V0ZXMpIHtcblx0XHRcdGFSb3V0ZXMuZm9yRWFjaCgocm91dGU6IGFueSkgPT4ge1xuXHRcdFx0XHR0aGlzLl9vVGFyZ2V0c0Zyb21Sb3V0ZVBhdHRlcm5bcm91dGUucGF0dGVybl0gPSByb3V0ZS50YXJnZXQ7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRnZXRDdXJyZW50QXJndW1lbnQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc0N1cnJlbnRBcmd1bWVudHM7XG5cdH1cblxuXHRnZXRDdXJyZW50Um91dGVOYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLnNDdXJyZW50Um91dGVOYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBGRSBGQ0wgY29uc3RhbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAcmV0dXJucyBUaGUgY29uc3RhbnRzXG5cdCAqL1xuXHRnZXRDb25zdGFudHMoKSB7XG5cdFx0cmV0dXJuIENPTlNUQU5UUztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXR0ZXIgZm9yIG9UYXJnZXRzQWdncmVnYXRpb24gYXJyYXkuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI2dldFRhcmdldEFnZ3JlZ2F0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHJldHVybnMgVGhlIF9vVGFyZ2V0c0FnZ3JlZ2F0aW9uIGFycmF5XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0VGFyZ2V0QWdncmVnYXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29UYXJnZXRzQWdncmVnYXRpb247XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gdHJpZ2dlcmVkIGJ5IHRoZSByb3V0ZXIgUm91dGVNYXRjaGVkIGV2ZW50LlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNvblJvdXRlTWF0Y2hlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHBhcmFtIG9FdmVudFxuXHQgKi9cblx0b25Sb3V0ZU1hdGNoZWQob0V2ZW50OiBhbnkpIHtcblx0XHRjb25zdCBzUm91dGVOYW1lID0gb0V2ZW50LmdldFBhcmFtZXRlcihcIm5hbWVcIik7XG5cblx0XHQvLyBTYXZlIHRoZSBjdXJyZW50L3ByZXZpb3VzIHJvdXRlcyBhbmQgYXJndW1lbnRzXG5cdFx0dGhpcy5zQ3VycmVudFJvdXRlTmFtZSA9IHNSb3V0ZU5hbWU7XG5cdFx0dGhpcy5zQ3VycmVudEFyZ3VtZW50cyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJhcmd1bWVudHNcIik7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB0cmlnZ2VyaW5nIHRoZSB0YWJsZSBzY3JvbGwgdG8gdGhlIG5hdmlnYXRlZCByb3cgYWZ0ZXIgZWFjaCBsYXlvdXQgY2hhbmdlLlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNzY3JvbGxUb0xhc3RTZWxlY3RlZEl0ZW1cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqL1xuXG5cdF9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcygpIHtcblx0XHRjb25zdCBhVmlld3MgPSB0aGlzLl9nZXRBbGxWaXNpYmxlVmlld3MoKTtcblx0XHQvL1RoZSBzY3JvbGxzIGFyZSB0cmlnZ2VyZWQgb25seSBpZiB0aGUgbGF5b3V0IGlzIHdpdGggc2V2ZXJhbCBjb2x1bW5zIG9yIHdoZW4gc3dpdGNoaW5nIHRoZSBtb3N0UmlnaHQgY29sdW1uIGluIGZ1bGwgc2NyZWVuXG5cdFx0aWYgKGFWaWV3cy5sZW5ndGggPiAxIHx8IGFWaWV3c1swXS5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbCA8IHRoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50KSB7XG5cdFx0XHRsZXQgc0N1cnJlbnRWaWV3UGF0aDtcblx0XHRcdGNvbnN0IG9BZGRpdGlvbmFsVmlldyA9IHRoaXMuZ2V0Vmlld0Zvck5hdmlnYXRlZFJvd3NDb21wdXRhdGlvbigpO1xuXHRcdFx0aWYgKG9BZGRpdGlvbmFsVmlldyAmJiBhVmlld3MuaW5kZXhPZihvQWRkaXRpb25hbFZpZXcpID09PSAtMSkge1xuXHRcdFx0XHRhVmlld3MucHVzaChvQWRkaXRpb25hbFZpZXcpO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChsZXQgaW5kZXggPSBhVmlld3MubGVuZ3RoIC0gMTsgaW5kZXggPiAwOyBpbmRleC0tKSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gYVZpZXdzW2luZGV4XSxcblx0XHRcdFx0XHRvUHJldmlvdXNWaWV3ID0gYVZpZXdzW2luZGV4IC0gMV07XG5cdFx0XHRcdGlmIChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRcdFx0c0N1cnJlbnRWaWV3UGF0aCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0UGF0aCgpO1xuXHRcdFx0XHRcdG9QcmV2aW91c1ZpZXcuZ2V0Q29udHJvbGxlcigpLl9zY3JvbGxUYWJsZXNUb1JvdyhzQ3VycmVudFZpZXdQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0cmlnZ2VyZWQgYnkgdGhlIEZDTCBTdGF0ZUNoYW5nZWQgZXZlbnQuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI29uU3RhdGVDaGFuZ2VkXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAcGFyYW0gb0V2ZW50XG5cdCAqL1xuXHRvblN0YXRlQ2hhbmdlZChvRXZlbnQ6IGFueSkge1xuXHRcdGNvbnN0IGJJc05hdmlnYXRpb25BcnJvdyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJpc05hdmlnYXRpb25BcnJvd1wiKTtcblx0XHRpZiAodGhpcy5zQ3VycmVudEFyZ3VtZW50cyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAoIXRoaXMuc0N1cnJlbnRBcmd1bWVudHNbdGhpcy5TUVVFUllLRVlOQU1FXSkge1xuXHRcdFx0XHR0aGlzLnNDdXJyZW50QXJndW1lbnRzW3RoaXMuU1FVRVJZS0VZTkFNRV0gPSB7fTtcblx0XHRcdH1cblx0XHRcdHRoaXMuc0N1cnJlbnRBcmd1bWVudHNbdGhpcy5TUVVFUllLRVlOQU1FXS5sYXlvdXQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwibGF5b3V0XCIpO1xuXHRcdH1cblx0XHR0aGlzLl9mb3JjZU1vZGVsQ29udGV4dENoYW5nZU9uQnJlYWRDcnVtYnMob0V2ZW50KTtcblxuXHRcdC8vIFJlcGxhY2UgdGhlIFVSTCB3aXRoIHRoZSBuZXcgbGF5b3V0IGlmIGEgbmF2aWdhdGlvbiBhcnJvdyB3YXMgdXNlZFxuXHRcdGlmIChiSXNOYXZpZ2F0aW9uQXJyb3cpIHtcblx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5uYXZUbyh0aGlzLnNDdXJyZW50Um91dGVOYW1lLCB0aGlzLnNDdXJyZW50QXJndW1lbnRzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gdG8gZmlyZSBNb2RlbENvbnRleHRDaGFuZ2UgZXZlbnQgb24gYWxsIGJyZWFkY3J1bWJzICggb24gZWFjaCBPYmplY3RQYWdlcykuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI19mb3JjZU1vZGVsQ29udGV4dENoYW5nZU9uQnJlYWRDcnVtYnNcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEBwYXJhbSBvRXZlbnRcblx0ICovXG5cdF9mb3JjZU1vZGVsQ29udGV4dENoYW5nZU9uQnJlYWRDcnVtYnMob0V2ZW50OiBhbnkpIHtcblx0XHQvL2ZvcmNlIG1vZGVsY29udGV4dGNoYW5nZSBvbiBPYmplY3RQYWdlcyB0byByZWZyZXNoIHRoZSBicmVhZGNydW1icyBsaW5rIGhyZWZzXG5cdFx0Y29uc3Qgb0ZjbCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRsZXQgb1BhZ2VzOiBhbnlbXSA9IFtdO1xuXHRcdG9QYWdlcyA9IG9QYWdlcy5jb25jYXQob0ZjbC5nZXRCZWdpbkNvbHVtblBhZ2VzKCkpLmNvbmNhdChvRmNsLmdldE1pZENvbHVtblBhZ2VzKCkpLmNvbmNhdChvRmNsLmdldEVuZENvbHVtblBhZ2VzKCkpO1xuXHRcdG9QYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChvUGFnZTogYW55KSB7XG5cdFx0XHRjb25zdCBvVmlldyA9IF9nZXRWaWV3RnJvbUNvbnRhaW5lcihvUGFnZSk7XG5cdFx0XHRjb25zdCBvQnJlYWRDcnVtYnMgPSBvVmlldy5ieUlkICYmIG9WaWV3LmJ5SWQoXCJicmVhZGNydW1ic1wiKTtcblx0XHRcdGlmIChvQnJlYWRDcnVtYnMpIHtcblx0XHRcdFx0b0JyZWFkQ3J1bWJzLmZpcmVNb2RlbENvbnRleHRDaGFuZ2UoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0cmlnZ2VyZWQgdG8gdXBkYXRlIHRoZSBTaGFyZSBidXR0b24gVmlzaWJpbGl0eS5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEBwYXJhbSB2aWV3Q29sdW1uIE5hbWUgb2YgdGhlIGN1cnJlbnQgY29sdW1uIChcImJlZ2luQ29sdW1uXCIsIFwibWlkQ29sdW1uXCIsIFwiZW5kQ29sdW1uXCIpXG5cdCAqIEBwYXJhbSBzTGF5b3V0IFRoZSBjdXJyZW50IGxheW91dCB1c2VkIGJ5IHRoZSBGQ0xcblx0ICogQHJldHVybnMgVGhlIHNoYXJlIGJ1dHRvbiB2aXNpYmlsaXR5XG5cdCAqL1xuXHRfdXBkYXRlU2hhcmVCdXR0b25WaXNpYmlsaXR5KHZpZXdDb2x1bW46IHN0cmluZywgc0xheW91dDogc3RyaW5nKSB7XG5cdFx0bGV0IGJTaG93U2hhcmVJY29uO1xuXHRcdHN3aXRjaCAoc0xheW91dCkge1xuXHRcdFx0Y2FzZSBcIk9uZUNvbHVtblwiOlxuXHRcdFx0XHRiU2hvd1NoYXJlSWNvbiA9IHZpZXdDb2x1bW4gPT09IFwiYmVnaW5Db2x1bW5cIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTWlkQ29sdW1uRnVsbFNjcmVlblwiOlxuXHRcdFx0Y2FzZSBcIlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW5cIjpcblx0XHRcdGNhc2UgXCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZEVuZEhpZGRlblwiOlxuXHRcdFx0Y2FzZSBcIlR3b0NvbHVtbnNCZWdpbkV4cGFuZGVkXCI6XG5cdFx0XHRjYXNlIFwiVHdvQ29sdW1uc01pZEV4cGFuZGVkXCI6XG5cdFx0XHRcdGJTaG93U2hhcmVJY29uID0gdmlld0NvbHVtbiA9PT0gXCJtaWRDb2x1bW5cIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRW5kQ29sdW1uRnVsbFNjcmVlblwiOlxuXHRcdFx0Y2FzZSBcIlRocmVlQ29sdW1uc0VuZEV4cGFuZGVkXCI6XG5cdFx0XHRjYXNlIFwiVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWRcIjpcblx0XHRcdFx0YlNob3dTaGFyZUljb24gPSB2aWV3Q29sdW1uID09PSBcImVuZENvbHVtblwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJTaG93U2hhcmVJY29uID0gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBiU2hvd1NoYXJlSWNvbjtcblx0fVxuXG5cdHVwZGF0ZVVJU3RhdGVGb3JWaWV3KG9WaWV3OiBhbnksIEZDTExldmVsOiBhbnkpIHtcblx0XHRjb25zdCBvVUlTdGF0ZSA9IHRoaXMuZ2V0SGVscGVyKCkuZ2V0Q3VycmVudFVJU3RhdGUoKSBhcyBhbnksXG5cdFx0XHRvRmNsQ29sTmFtZSA9IFtcImJlZ2luQ29sdW1uXCIsIFwibWlkQ29sdW1uXCIsIFwiZW5kQ29sdW1uXCJdLFxuXHRcdFx0c0xheW91dCA9IHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldExheW91dCgpO1xuXHRcdGxldCB2aWV3Q29sdW1uO1xuXG5cdFx0aWYgKCFvVmlldy5nZXRNb2RlbChcImZjbGhlbHBlclwiKSkge1xuXHRcdFx0b1ZpZXcuc2V0TW9kZWwodGhpcy5fY3JlYXRlSGVscGVyTW9kZWwoKSwgXCJmY2xoZWxwZXJcIik7XG5cdFx0fVxuXHRcdGlmIChGQ0xMZXZlbCA+PSB0aGlzLl9vRkNMQ29uZmlnLm1heENvbHVtbnNDb3VudCkge1xuXHRcdFx0Ly8gVGhlIHZpZXcgaXMgb24gYSBsZXZlbCA+IG1heCBudW1iZXIgb2YgY29sdW1ucy4gSXQncyBhbHdheXMgZnVsbHNjcmVlbiB3aXRob3V0IGNsb3NlL2V4aXQgYnV0dG9uc1xuXHRcdFx0dmlld0NvbHVtbiA9IG9GY2xDb2xOYW1lW3RoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50IC0gMV07XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5taWRDb2x1bW4uZnVsbFNjcmVlbiA9IG51bGw7XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5taWRDb2x1bW4uZXhpdEZ1bGxTY3JlZW4gPSBudWxsO1xuXHRcdFx0b1VJU3RhdGUuYWN0aW9uQnV0dG9uc0luZm8ubWlkQ29sdW1uLmNsb3NlQ29sdW1uID0gbnVsbDtcblx0XHRcdG9VSVN0YXRlLmFjdGlvbkJ1dHRvbnNJbmZvLmVuZENvbHVtbi5leGl0RnVsbFNjcmVlbiA9IG51bGw7XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5lbmRDb2x1bW4uZnVsbFNjcmVlbiA9IG51bGw7XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5lbmRDb2x1bW4uY2xvc2VDb2x1bW4gPSBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2aWV3Q29sdW1uID0gb0ZjbENvbE5hbWVbRkNMTGV2ZWxdO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdEZDTExldmVsID49IHRoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50IHx8XG5cdFx0XHRzTGF5b3V0ID09PSBcIkVuZENvbHVtbkZ1bGxTY3JlZW5cIiB8fFxuXHRcdFx0c0xheW91dCA9PT0gXCJNaWRDb2x1bW5GdWxsU2NyZWVuXCIgfHxcblx0XHRcdHNMYXlvdXQgPT09IFwiT25lQ29sdW1uXCJcblx0XHQpIHtcblx0XHRcdG9WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLnNldFByb3BlcnR5KFwiL2JyZWFkQ3J1bWJJc1Zpc2libGVcIiwgdHJ1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLnNldFByb3BlcnR5KFwiL2JyZWFkQ3J1bWJJc1Zpc2libGVcIiwgZmFsc2UpO1xuXHRcdH1cblx0XHQvLyBVbmZvcnR1bmF0ZWx5LCB0aGUgRkNMSGVscGVyIGRvZXNuJ3QgcHJvdmlkZSBhY3Rpb25CdXR0b24gdmFsdWVzIGZvciB0aGUgZmlyc3QgY29sdW1uXG5cdFx0Ly8gc28gd2UgaGF2ZSB0byBhZGQgdGhpcyBpbmZvIG1hbnVhbGx5XG5cdFx0b1VJU3RhdGUuYWN0aW9uQnV0dG9uc0luZm8uYmVnaW5Db2x1bW4gPSB7IGZ1bGxTY3JlZW46IG51bGwsIGV4aXRGdWxsU2NyZWVuOiBudWxsLCBjbG9zZUNvbHVtbjogbnVsbCB9O1xuXG5cdFx0Y29uc3Qgb0FjdGlvbkJ1dHRvbkluZm9zID0gT2JqZWN0LmFzc2lnbih7fSwgb1VJU3RhdGUuYWN0aW9uQnV0dG9uc0luZm9bdmlld0NvbHVtbl0pO1xuXHRcdG9BY3Rpb25CdXR0b25JbmZvcy5zd2l0Y2hWaXNpYmxlID0gb0FjdGlvbkJ1dHRvbkluZm9zLmZ1bGxTY3JlZW4gIT09IG51bGwgfHwgb0FjdGlvbkJ1dHRvbkluZm9zLmV4aXRGdWxsU2NyZWVuICE9PSBudWxsO1xuXHRcdG9BY3Rpb25CdXR0b25JbmZvcy5zd2l0Y2hJY29uID0gb0FjdGlvbkJ1dHRvbkluZm9zLmZ1bGxTY3JlZW4gIT09IG51bGwgPyBcInNhcC1pY29uOi8vZnVsbC1zY3JlZW5cIiA6IFwic2FwLWljb246Ly9leGl0LWZ1bGwtc2NyZWVuXCI7XG5cdFx0b0FjdGlvbkJ1dHRvbkluZm9zLmlzRnVsbFNjcmVlbiA9IG9BY3Rpb25CdXR0b25JbmZvcy5mdWxsU2NyZWVuID09PSBudWxsO1xuXG5cdFx0b1ZpZXcuZ2V0TW9kZWwoXCJmY2xoZWxwZXJcIikuc2V0UHJvcGVydHkoXCIvYWN0aW9uQnV0dG9uc0luZm9cIiwgb0FjdGlvbkJ1dHRvbkluZm9zKTtcblxuXHRcdG9WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLnNldFByb3BlcnR5KFwiL3Nob3dTaGFyZUljb25cIiwgdGhpcy5fdXBkYXRlU2hhcmVCdXR0b25WaXNpYmlsaXR5KHZpZXdDb2x1bW4sIHNMYXlvdXQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0cmlnZ2VyZWQgYnkgdGhlIHJvdXRlciBCZWZvcmVSb3V0ZU1hdGNoZWQgZXZlbnQuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI29uQmVmb3JlUm91dGVNYXRjaGVkXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAcGFyYW0gb0V2ZW50XG5cdCAqL1xuXHRvbkJlZm9yZVJvdXRlTWF0Y2hlZChvRXZlbnQ6IGFueSkge1xuXHRcdGlmIChvRXZlbnQpIHtcblx0XHRcdGNvbnN0IG9RdWVyeVBhcmFtcyA9IG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkuYXJndW1lbnRzW3RoaXMuU1FVRVJZS0VZTkFNRV07XG5cdFx0XHRsZXQgc0xheW91dCA9IG9RdWVyeVBhcmFtcyA/IG9RdWVyeVBhcmFtcy5sYXlvdXQgOiBudWxsO1xuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBubyBsYXlvdXQgcGFyYW1ldGVyLCBxdWVyeSBmb3IgdGhlIGRlZmF1bHQgbGV2ZWwgMCBsYXlvdXQgKG5vcm1hbGx5IE9uZUNvbHVtbilcblx0XHRcdGlmICghc0xheW91dCkge1xuXHRcdFx0XHRjb25zdCBvTmV4dFVJU3RhdGUgPSB0aGlzLmdldEhlbHBlcigpLmdldE5leHRVSVN0YXRlKDApO1xuXHRcdFx0XHRzTGF5b3V0ID0gb05leHRVSVN0YXRlLmxheW91dDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIGxheW91dCBpZiBjb21wYXRpYmxlIHdpdGggdGhlIG51bWJlciBvZiB0YXJnZXRzXG5cdFx0XHQvLyBUaGlzIHNob3VsZCBhbHdheXMgYmUgdGhlIGNhc2UgZm9yIG5vcm1hbCBuYXZpZ2F0aW9uLCBqdXN0IG5lZWRlZCBpbiBjYXNlXG5cdFx0XHQvLyB0aGUgVVJMIGhhcyBiZWVuIG1hbnVhbGx5IG1vZGlmaWVkXG5cdFx0XHRjb25zdCBhVGFyZ2V0cyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJjb25maWdcIikudGFyZ2V0O1xuXHRcdFx0c0xheW91dCA9IHRoaXMuX2NvcnJlY3RMYXlvdXRGb3JUYXJnZXRzKHNMYXlvdXQsIGFUYXJnZXRzKTtcblxuXHRcdFx0Ly8gVXBkYXRlIHRoZSBsYXlvdXQgb2YgdGhlIEZsZXhpYmxlQ29sdW1uTGF5b3V0XG5cdFx0XHRpZiAoc0xheW91dCkge1xuXHRcdFx0XHR0aGlzLmdldEZjbENvbnRyb2woKS5zZXRMYXlvdXQoc0xheW91dCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmb3IgdGhlIEZDTCBDb21wb25lbnQuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI2dldEhlbHBlclxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgSW5zdGFuY2Ugb2YgYSBzZW1hbnRpYyBoZWxwZXJcblx0ICovXG5cdGdldEhlbHBlcigpIHtcblx0XHRyZXR1cm4gRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlci5nZXRJbnN0YW5jZUZvcih0aGlzLmdldEZjbENvbnRyb2woKSwgdGhpcy5fb0ZDTENvbmZpZyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyB0aGUgRkNMIGxheW91dCBmb3IgYSBnaXZlbiBGQ0wgbGV2ZWwgYW5kIGEgdGFyZ2V0IGhhc2guXG5cdCAqXG5cdCAqIEBwYXJhbSBpTmV4dEZDTExldmVsIEZDTCBsZXZlbCB0byBiZSBuYXZpZ2F0ZWQgdG9cblx0ICogQHBhcmFtIHNIYXNoIFRoZSBoYXNoIHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gc1Byb3Bvc2VkTGF5b3V0IFRoZSBwcm9wb3NlZCBsYXlvdXRcblx0ICogQHBhcmFtIGtlZXBDdXJyZW50TGF5b3V0IFRydWUgaWYgd2Ugd2FudCB0byBrZWVwIHRoZSBjdXJyZW50IGxheW91dCBpZiBwb3NzaWJsZVxuXHQgKiBAcmV0dXJucyBUaGUgY2FsY3VsYXRlZCBsYXlvdXRcblx0ICovXG5cdGNhbGN1bGF0ZUxheW91dChpTmV4dEZDTExldmVsOiBudW1iZXIsIHNIYXNoOiBzdHJpbmcsIHNQcm9wb3NlZExheW91dDogc3RyaW5nIHwgdW5kZWZpbmVkLCBrZWVwQ3VycmVudExheW91dCA9IGZhbHNlKSB7XG5cdFx0Ly8gRmlyc3QsIGFzayB0aGUgRkNMIGhlbHBlciB0byBjYWxjdWxhdGUgdGhlIGxheW91dCBpZiBub3RoaW5nIGlzIHByb3Bvc2VkXG5cdFx0aWYgKCFzUHJvcG9zZWRMYXlvdXQpIHtcblx0XHRcdHNQcm9wb3NlZExheW91dCA9IGtlZXBDdXJyZW50TGF5b3V0ID8gdGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0TGF5b3V0KCkgOiB0aGlzLmdldEhlbHBlcigpLmdldE5leHRVSVN0YXRlKGlOZXh0RkNMTGV2ZWwpLmxheW91dDtcblx0XHR9XG5cblx0XHQvLyBUaGVuIGNoYW5nZSB0aGlzIHZhbHVlIGlmIG5lY2Vzc2FyeSwgYmFzZWQgb24gdGhlIG51bWJlciBvZiB0YXJnZXRzXG5cdFx0Y29uc3Qgb1JvdXRlID0gKHRoaXMuZ2V0Um91dGVyKCkgYXMgYW55KS5nZXRSb3V0ZUJ5SGFzaChgJHtzSGFzaH0/bGF5b3V0PSR7c1Byb3Bvc2VkTGF5b3V0fWApO1xuXHRcdGNvbnN0IGFUYXJnZXRzID0gdGhpcy5fb1RhcmdldHNGcm9tUm91dGVQYXR0ZXJuW29Sb3V0ZS5nZXRQYXR0ZXJuKCldO1xuXG5cdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3RMYXlvdXRGb3JUYXJnZXRzKHNQcm9wb3NlZExheW91dCwgYVRhcmdldHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gRkNMIGxheW91dCBpcyBjb21wYXRpYmxlIHdpdGggYW4gYXJyYXkgb2YgdGFyZ2V0cy5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wb3NlZExheW91dCBQcm9wb3NlZCB2YWx1ZSBmb3IgdGhlIEZDTCBsYXlvdXRcblx0ICogQHBhcmFtIGFUYXJnZXRzIEFycmF5IG9mIHRhcmdldCBuYW1lcyB1c2VkIGZvciBjaGVja2luZ1xuXHQgKiBAcmV0dXJucyBUaGUgY29ycmVjdGVkIGxheW91dFxuXHQgKi9cblx0X2NvcnJlY3RMYXlvdXRGb3JUYXJnZXRzKHNQcm9wb3NlZExheW91dDogYW55LCBhVGFyZ2V0czogYW55KSB7XG5cdFx0Y29uc3QgYWxsQWxsb3dlZExheW91dHM6IGFueSA9IHtcblx0XHRcdFwiMlwiOiBbXCJUd29Db2x1bW5zTWlkRXhwYW5kZWRcIiwgXCJUd29Db2x1bW5zQmVnaW5FeHBhbmRlZFwiLCBcIk1pZENvbHVtbkZ1bGxTY3JlZW5cIl0sXG5cdFx0XHRcIjNcIjogW1xuXHRcdFx0XHRcIlRocmVlQ29sdW1uc01pZEV4cGFuZGVkXCIsXG5cdFx0XHRcdFwiVGhyZWVDb2x1bW5zRW5kRXhwYW5kZWRcIixcblx0XHRcdFx0XCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZEVuZEhpZGRlblwiLFxuXHRcdFx0XHRcIlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW5cIixcblx0XHRcdFx0XCJNaWRDb2x1bW5GdWxsU2NyZWVuXCIsXG5cdFx0XHRcdFwiRW5kQ29sdW1uRnVsbFNjcmVlblwiXG5cdFx0XHRdXG5cdFx0fTtcblxuXHRcdGlmIChhVGFyZ2V0cyAmJiAhQXJyYXkuaXNBcnJheShhVGFyZ2V0cykpIHtcblx0XHRcdC8vIFRvIHN1cHBvcnQgc2luZ2xlIHRhcmdldCBhcyBhIHN0cmluZyBpbiB0aGUgbWFuaWZlc3Rcblx0XHRcdGFUYXJnZXRzID0gW2FUYXJnZXRzXTtcblx0XHR9XG5cblx0XHRpZiAoIWFUYXJnZXRzKSB7XG5cdFx0XHQvLyBEZWZlbnNpdmUsIGp1c3QgaW4gY2FzZS4uLlxuXHRcdFx0cmV0dXJuIHNQcm9wb3NlZExheW91dDtcblx0XHR9IGVsc2UgaWYgKGFUYXJnZXRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIE1vcmUgdGhhbiAxIHRhcmdldDoganVzdCBzaW1wbHkgY2hlY2sgZnJvbSB0aGUgYWxsb3dlZCB2YWx1ZXNcblx0XHRcdGNvbnN0IGFMYXlvdXRzID0gYWxsQWxsb3dlZExheW91dHNbYVRhcmdldHMubGVuZ3RoXTtcblx0XHRcdGlmIChhTGF5b3V0cy5pbmRleE9mKHNQcm9wb3NlZExheW91dCkgPCAwKSB7XG5cdFx0XHRcdC8vIFRoZSBwcm9wb3NlZCBsYXlvdXQgaXNuJ3QgY29tcGF0aWJsZSB3aXRoIHRoZSBudW1iZXIgb2YgY29sdW1uc1xuXHRcdFx0XHQvLyAtLT4gQXNrIHRoZSBoZWxwZXIgZm9yIHRoZSBkZWZhdWx0IGxheW91dCBmb3IgdGhlIG51bWJlciBvZiBjb2x1bW5zXG5cdFx0XHRcdHNQcm9wb3NlZExheW91dCA9IGFMYXlvdXRzWzBdO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPbmx5IG9uZSB0YXJnZXRcblx0XHRcdGNvbnN0IHNUYXJnZXRBZ2dyZWdhdGlvbiA9IHRoaXMuZ2V0VGFyZ2V0QWdncmVnYXRpb24oKVthVGFyZ2V0c1swXV0uYWdncmVnYXRpb24gfHwgdGhpcy5fb0ZDTENvbmZpZy5kZWZhdWx0Q29udHJvbEFnZ3JlZ2F0aW9uO1xuXHRcdFx0c3dpdGNoIChzVGFyZ2V0QWdncmVnYXRpb24pIHtcblx0XHRcdFx0Y2FzZSBcImJlZ2luQ29sdW1uUGFnZXNcIjpcblx0XHRcdFx0XHRzUHJvcG9zZWRMYXlvdXQgPSBcIk9uZUNvbHVtblwiO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwibWlkQ29sdW1uUGFnZXNcIjpcblx0XHRcdFx0XHRzUHJvcG9zZWRMYXlvdXQgPSBcIk1pZENvbHVtbkZ1bGxTY3JlZW5cIjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImVuZENvbHVtblBhZ2VzXCI6XG5cdFx0XHRcdFx0c1Byb3Bvc2VkTGF5b3V0ID0gXCJFbmRDb2x1bW5GdWxsU2NyZWVuXCI7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdC8vIG5vIGRlZmF1bHRcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gc1Byb3Bvc2VkTGF5b3V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGluc3RhbmNlZCB2aWV3cyBpbiB0aGUgRkNMIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm4gdGhlIHZpZXdzLlxuXHQgKi9cblx0Z2V0SW5zdGFuY2VkVmlld3MoKTogWE1MVmlld1tdIHtcblx0XHRjb25zdCBmY2xDb250cm9sID0gdGhpcy5nZXRGY2xDb250cm9sKCk7XG5cdFx0Y29uc3QgY29tcG9uZW50Q29udGFpbmVyczogQ29udHJvbFtdID0gW1xuXHRcdFx0Li4uZmNsQ29udHJvbC5nZXRCZWdpbkNvbHVtblBhZ2VzKCksXG5cdFx0XHQuLi5mY2xDb250cm9sLmdldE1pZENvbHVtblBhZ2VzKCksXG5cdFx0XHQuLi5mY2xDb250cm9sLmdldEVuZENvbHVtblBhZ2VzKClcblx0XHRdO1xuXHRcdHJldHVybiBjb21wb25lbnRDb250YWluZXJzLm1hcCgob1BhZ2UpID0+IChvUGFnZSBhcyBhbnkpLmdldENvbXBvbmVudEluc3RhbmNlKCkuZ2V0Um9vdENvbnRyb2woKSk7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGFsbCB2aXNpYmxlIHZpZXdzIGluIHRoZSBGQ0wgY29tcG9uZW50LlxuXHQgKiBzTGF5b3V0IG9wdGlvbmFsIHBhcmFtZXRlciBpcyB2ZXJ5IHNwZWNpZmljIGFzIHBhcnQgb2YgdGhlIGNhbGN1bGF0aW9uIG9mIHRoZSBsYXRlc3QgbmF2aWdhdGVkIHJvd1xuXHQgKlxuXHQgKiBAcGFyYW0geyp9IHNMYXlvdXQgTGF5b3V0IHRoYXQgd2FzIGFwcGxpZWQganVzdCBiZWZvcmUgdGhlIGN1cnJlbnQgbmF2aWdhdGlvblxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IHJldHVybiB2aWV3c1xuXHQgKi9cblxuXHRfZ2V0QWxsVmlzaWJsZVZpZXdzKHNMYXlvdXQ/OiBhbnkpIHtcblx0XHRjb25zdCBhVmlld3MgPSBbXTtcblx0XHRzTGF5b3V0ID0gc0xheW91dCA/IHNMYXlvdXQgOiB0aGlzLmdldEZjbENvbnRyb2woKS5nZXRMYXlvdXQoKTtcblx0XHRzd2l0Y2ggKHNMYXlvdXQpIHtcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5FbmRDb2x1bW5GdWxsU2NyZWVuOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50RW5kQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5NaWRDb2x1bW5GdWxsU2NyZWVuOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5PbmVDb2x1bW46XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5UaHJlZUNvbHVtbnNFbmRFeHBhbmRlZDpcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5UaHJlZUNvbHVtbnNNaWRFeHBhbmRlZDpcblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRFbmRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExheW91dFR5cGUuVHdvQ29sdW1uc0JlZ2luRXhwYW5kZWQ6XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVHdvQ29sdW1uc01pZEV4cGFuZGVkOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc01pZEV4cGFuZGVkRW5kSGlkZGVuOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW46XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRMb2cuZXJyb3IoYFVuaGFuZGxlZCBzd2l0Y2ggY2FzZSBmb3IgJHt0aGlzLmdldEZjbENvbnRyb2woKS5nZXRMYXlvdXQoKX1gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYVZpZXdzO1xuXHR9XG5cdF9nZXRBbGxWaWV3cyhzTGF5b3V0PzogYW55KSB7XG5cdFx0Y29uc3QgYVZpZXdzID0gW107XG5cdFx0c0xheW91dCA9IHNMYXlvdXQgPyBzTGF5b3V0IDogdGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0TGF5b3V0KCk7XG5cdFx0c3dpdGNoIChzTGF5b3V0KSB7XG5cdFx0XHRjYXNlIExheW91dFR5cGUuT25lQ29sdW1uOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc0VuZEV4cGFuZGVkOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc01pZEV4cGFuZGVkOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc01pZEV4cGFuZGVkRW5kSGlkZGVuOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW46XG5cdFx0XHRjYXNlIExheW91dFR5cGUuRW5kQ29sdW1uRnVsbFNjcmVlbjpcblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRFbmRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExheW91dFR5cGUuVHdvQ29sdW1uc0JlZ2luRXhwYW5kZWQ6XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVHdvQ29sdW1uc01pZEV4cGFuZGVkOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLk1pZENvbHVtbkZ1bGxTY3JlZW46XG5cdFx0XHRcdC8vIEluIHRoaXMgY2FzZSB3ZSBuZWVkIHRvIGRldGVybWluZSBpZiB0aGlzIG1pZCBjb2x1bW4gZnVsbHNjcmVlbiBjb21lcyBmcm9tIGEgMiBvciBhIDMgY29sdW1uIGxheW91dFxuXHRcdFx0XHRjb25zdCBzTGF5b3V0V2hlbkV4aXRGdWxsU2NyZWVuID0gKHRoaXMuZ2V0SGVscGVyKCkuZ2V0Q3VycmVudFVJU3RhdGUoKSBhcyBhbnkpLmFjdGlvbkJ1dHRvbnNJbmZvLm1pZENvbHVtbi5leGl0RnVsbFNjcmVlbjtcblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNMYXlvdXRXaGVuRXhpdEZ1bGxTY3JlZW4uaW5kZXhPZihcIlRocmVlQ29sdW1uXCIpID49IDApIHtcblx0XHRcdFx0XHQvLyBXZSBjb21lIGZyb20gYSAzIGNvbHVtbiBsYXlvdXRcblx0XHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRFbmRDb2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdExvZy5lcnJvcihgVW5oYW5kbGVkIHN3aXRjaCBjYXNlIGZvciAke3RoaXMuZ2V0RmNsQ29udHJvbCgpLmdldExheW91dCgpfWApO1xuXHRcdH1cblx0XHRyZXR1cm4gYVZpZXdzO1xuXHR9XG5cblx0b25Db250YWluZXJSZWFkeSgpIHtcblx0XHQvLyBSZXN0b3JlIHZpZXdzIGlmIG5lY2Nlc3NhcnkuXG5cdFx0Y29uc3QgYVZpZXdzID0gdGhpcy5fZ2V0QWxsVmlzaWJsZVZpZXdzKCk7XG5cdFx0Y29uc3QgYVJlc3RvcmVQcm9taXNlczogYW55W10gPSBhVmlld3MucmVkdWNlKGZ1bmN0aW9uIChhUHJvbWlzZXM6IGFueSwgb1RhcmdldFZpZXc6IGFueSkge1xuXHRcdFx0YVByb21pc2VzLnB1c2goS2VlcEFsaXZlSGVscGVyLnJlc3RvcmVWaWV3KG9UYXJnZXRWaWV3KSk7XG5cdFx0XHRyZXR1cm4gYVByb21pc2VzO1xuXHRcdH0sIFtdKTtcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYVJlc3RvcmVQcm9taXNlcyk7XG5cdH1cblxuXHRnZXRSaWdodG1vc3RDb250ZXh0KCk6IENvbnRleHQgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRSaWdodG1vc3RWaWV3KCk7XG5cdFx0cmV0dXJuIG9WaWV3ICYmIG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdH1cblxuXHRnZXRSaWdodG1vc3RWaWV3KCkge1xuXHRcdHJldHVybiB0aGlzLl9nZXRBbGxWaWV3cygpLnBvcCgpO1xuXHR9XG5cblx0aXNDb250ZXh0VXNlZEluUGFnZXMob0NvbnRleHQ6IENvbnRleHQpOiBib29sZWFuIHtcblx0XHRpZiAoIXRoaXMuZ2V0RmNsQ29udHJvbCgpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGNvbnN0IGFBbGxWaXNpYmxlVmlld3MgPSB0aGlzLl9nZXRBbGxWaWV3cygpO1xuXHRcdGZvciAoY29uc3QgdmlldyBvZiBhQWxsVmlzaWJsZVZpZXdzKSB7XG5cdFx0XHRpZiAodmlldykge1xuXHRcdFx0XHRpZiAodmlldy5nZXRCaW5kaW5nQ29udGV4dCgpID09PSBvQ29udGV4dCkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBBIHZpZXcgaGFzIGJlZW4gZGVzdHJveWVkIC0tPiBhcHAgaXMgY3VycmVudGx5IGJlaW5nIGRlc3Ryb3llZFxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGY2xDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBa0JBLElBQU1BLFVBQVUsR0FBR0MsUUFBUSxDQUFDRCxVQUFVO0VBRXRDLElBQU1FLFNBQVMsR0FBRztJQUNqQkMsSUFBSSxFQUFFO01BQ0xDLEtBQUssRUFBRSxDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDO01BQ2hEQyxhQUFhLEVBQUU7UUFDZEMsTUFBTSxFQUFFLFlBQVk7UUFDcEJDLE1BQU0sRUFBRTtNQUNULENBQUM7TUFDREMsTUFBTSxFQUFFO1FBQ1BGLE1BQU0sRUFBRSxLQUFLO1FBQ2JDLE1BQU0sRUFBRTtNQUNUO0lBQ0Q7RUFDRCxDQUFDO0VBQ0QsSUFBTUUscUJBQXFCLEdBQUcsVUFBVUMsVUFBZSxFQUFFO0lBQ3hELElBQUlBLFVBQVUsQ0FBQ0MsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLEVBQUU7TUFDckQsT0FBT0QsVUFBVSxDQUFDRSxvQkFBb0IsRUFBRSxDQUFDQyxjQUFjLEVBQUU7SUFDMUQsQ0FBQyxNQUFNO01BQ04sT0FBT0gsVUFBVTtJQUNsQjtFQUNELENBQUM7RUFBQyxJQUdJSSxhQUFhLFdBRGxCQyxjQUFjLENBQUMsMEJBQTBC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