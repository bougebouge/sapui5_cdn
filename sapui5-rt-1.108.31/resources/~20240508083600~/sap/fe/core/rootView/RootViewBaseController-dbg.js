/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/BaseController", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/table/TableSizeHelper", "sap/ui/base/BindingParser", "sap/ui/core/routing/HashChanger", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper", "sap/ui/thirdparty/URI"], function (Log, BaseController, CommonUtils, Placeholder, ClassSupport, TableSizeHelper, BindingParser, HashChanger, JSONModel, AnnotationHelper, URI) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
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
  var RootViewBaseController = (_dec = defineUI5Class("sap.fe.core.rootView.RootViewBaseController"), _dec2 = usingExtension(Placeholder), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(RootViewBaseController, _BaseController);
    function RootViewBaseController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call.apply(_BaseController, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "oPlaceholder", _descriptor, _assertThisInitialized(_this));
      _this.bIsComputingTitleHierachy = false;
      return _this;
    }
    var _proto = RootViewBaseController.prototype;
    _proto.onInit = function onInit() {
      TableSizeHelper.init();
      this._aHelperModels = [];
    };
    _proto.getPlaceholder = function getPlaceholder() {
      return this.oPlaceholder;
    };
    _proto.attachRouteMatchers = function attachRouteMatchers() {
      this.oPlaceholder.attachRouteMatchers();
      this.getAppComponent().getRoutingService().attachAfterRouteMatched(this._onAfterRouteMatched, this);
    };
    _proto.onExit = function onExit() {
      this.getAppComponent().getRoutingService().detachAfterRouteMatched(this._onAfterRouteMatched, this);
      this.oRouter = undefined;
      TableSizeHelper.exit();

      // Destroy all JSON models created dynamically for the views
      this._aHelperModels.forEach(function (oModel) {
        oModel.destroy();
      });
    }
    /**
     * Convenience method for getting the resource bundle.
     *
     * @public
     * @returns The resourceModel of the component
     */;
    _proto.getResourceBundle = function getResourceBundle() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    };
    _proto.getRouter = function getRouter() {
      if (!this.oRouter) {
        this.oRouter = this.getAppComponent().getRouter();
      }
      return this.oRouter;
    };
    _proto._createHelperModel = function _createHelperModel() {
      // We keep a reference on the models created dynamically, as they don't get destroyed
      // automatically when the view is destroyed.
      // This is done during onExit
      var oModel = new JSONModel();
      this._aHelperModels.push(oModel);
      return oModel;
    }

    /**
     * Function waiting for the Right most view to be ready.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param oEvent Reference an Event parameter coming from routeMatched event
     * @returns A promise indicating when the right most view is ready
     */;
    _proto.waitForRightMostViewReady = function waitForRightMostViewReady(oEvent) {
      return new Promise(function (resolve) {
        var aContainers = oEvent.getParameter("views"),
          // There can also be reuse components in the view, remove them before processing.
          aFEContainers = [];
        aContainers.forEach(function (oContainer) {
          var oView = oContainer;
          if (oContainer && oContainer.getComponentInstance) {
            var oComponentInstance = oContainer.getComponentInstance();
            oView = oComponentInstance.getRootControl();
          }
          if (oView && oView.getController() && oView.getController().pageReady) {
            aFEContainers.push(oView);
          }
        });
        var oRightMostFEView = aFEContainers[aFEContainers.length - 1];
        if (oRightMostFEView && oRightMostFEView.getController().pageReady.isPageReady()) {
          resolve(oRightMostFEView);
        } else if (oRightMostFEView) {
          oRightMostFEView.getController().pageReady.attachEventOnce("pageReady", function () {
            resolve(oRightMostFEView);
          });
        }
      });
    }

    /**
     * Callback when the navigation is done.
     *  - update the shell title.
     *  - update table scroll.
     *  - call onPageReady on the rightMostView.
     *
     * @param oEvent
     * @name sap.fe.core.rootView.BaseController#_onAfterRouteMatched
     * @memberof sap.fe.core.rootView.BaseController
     */;
    _proto._onAfterRouteMatched = function _onAfterRouteMatched(oEvent) {
      var _this2 = this;
      if (!this._oRouteMatchedPromise) {
        this._oRouteMatchedPromise = this.waitForRightMostViewReady(oEvent).then(function (oView) {
          // The autoFocus is initially disabled on the navContainer or the FCL, so that the focus stays on the Shell menu
          // even if the app takes a long time to launch
          // The first time the view is displayed, we need to enable the autofocus so that it's managed properly during navigation
          var oRootControl = _this2.getView().getContent()[0];
          if (oRootControl && oRootControl.getAutoFocus && !oRootControl.getAutoFocus()) {
            oRootControl.setProperty("autoFocus", true, true); // Do not mark the container as invalid, otherwise it's re-rendered
          }

          var oAppComponent = _this2.getAppComponent();
          _this2._scrollTablesToLastNavigatedItems();
          if (oAppComponent.getEnvironmentCapabilities().getCapabilities().UShell) {
            _this2._computeTitleHierarchy(oView);
          }
          var bForceFocus = oAppComponent.getRouterProxy().isFocusForced();
          oAppComponent.getRouterProxy().setFocusForced(false); // reset
          if (oView.getController() && oView.getController().onPageReady && oView.getParent().onPageReady) {
            oView.getParent().onPageReady({
              forceFocus: bForceFocus
            });
          }
          if (_this2.onContainerReady) {
            _this2.onContainerReady();
          }
        }).catch(function (oError) {
          Log.error("An error occurs while computing the title hierarchy and calling focus method", oError);
        }).finally(function () {
          _this2._oRouteMatchedPromise = null;
        });
      }
    }

    /**
     * This function returns the TitleHierarchy cache ( or initializes it if undefined).
     *
     * @name sap.fe.core.rootView.BaseController#_getTitleHierarchyCache
     * @memberof sap.fe.core.rootView.BaseController
     * @returns  The TitleHierarchy cache
     */;
    _proto._getTitleHierarchyCache = function _getTitleHierarchyCache() {
      if (!this.oTitleHierarchyCache) {
        this.oTitleHierarchyCache = {};
      }
      return this.oTitleHierarchyCache;
    }

    /**
     * This function returns a titleInfo object.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param title
     * @param subtitle
     * @param sIntent The intent path to be redirected to
     * @returns The title information
     */;
    _proto._computeTitleInfo = function _computeTitleInfo(title, subtitle, sIntent) {
      var aParts = sIntent.split("/");
      sIntent = URI.decode(sIntent);
      if (aParts[aParts.length - 1].indexOf("?") === -1) {
        sIntent += "?restoreHistory=true";
      } else {
        sIntent += "&restoreHistory=true";
      }
      return {
        title: title,
        subtitle: subtitle,
        intent: sIntent,
        icon: ""
      };
    };
    _proto._formatTitle = function _formatTitle(displayMode, titleValue, titleDescription) {
      var formattedTitle = "";
      switch (displayMode) {
        case "Value":
          formattedTitle = "".concat(titleValue);
          break;
        case "ValueDescription":
          formattedTitle = "".concat(titleValue, " (").concat(titleDescription, ")");
          break;
        case "DescriptionValue":
          formattedTitle = "".concat(titleDescription, " (").concat(titleValue, ")");
          break;
        case "Description":
          formattedTitle = "".concat(titleDescription);
          break;
        default:
      }
      return formattedTitle;
    }

    /**
     * Fetches the value of the HeaderInfo title for a given path.
     *
     * @param sPath The path to the entity
     * @returns A promise containing the formatted title, or an empty string if no HeaderInfo title annotation is available
     */;
    _proto._fetchTitleValue = function _fetchTitleValue(sPath) {
      try {
        var _exit2 = false;
        var _this4 = this;
        var oAppComponent = _this4.getAppComponent(),
          oModel = _this4.getView().getModel(),
          oMetaModel = oAppComponent.getMetaModel(),
          sMetaPath = oMetaModel.getMetaPath(sPath),
          oBindingViewContext = oModel.createBindingContext(sPath),
          sValueExpression = AnnotationHelper.format(oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value")), {
            context: oMetaModel.createBindingContext("/")
          });
        if (!sValueExpression) {
          return Promise.resolve("");
        }
        var sTextExpression = AnnotationHelper.format(oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@com.sap.vocabularies.Common.v1.Text")), {
            context: oMetaModel.createBindingContext("/")
          }),
          oPropertyContext = oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@")),
          aPromises = [],
          oValueExpression = BindingParser.complexParser(sValueExpression),
          oPromiseForDisplayMode = new Promise(function (resolve) {
            var displayMode = CommonUtils.computeDisplayMode(oPropertyContext);
            resolve(displayMode);
          });
        aPromises.push(oPromiseForDisplayMode);
        var sValuePath = oValueExpression.parts ? oValueExpression.parts[0].path : oValueExpression.path,
          fnValueFormatter = oValueExpression.formatter,
          oValueBinding = oModel.bindProperty(sValuePath, oBindingViewContext);
        oValueBinding.initialize();
        var oPromiseForTitleValue = new Promise(function (resolve) {
          var fnChange = function (oEvent) {
            var sTargetValue = fnValueFormatter ? fnValueFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();
            oValueBinding.detachChange(fnChange);
            resolve(sTargetValue);
          };
          oValueBinding.attachChange(fnChange);
        });
        aPromises.push(oPromiseForTitleValue);
        if (sTextExpression) {
          var oTextExpression = BindingParser.complexParser(sTextExpression);
          var sTextPath = oTextExpression.parts ? oTextExpression.parts[0].path : oTextExpression.path;
          sTextPath = sValuePath.lastIndexOf("/") > -1 ? "".concat(sValuePath.slice(0, sValuePath.lastIndexOf("/")), "/").concat(sTextPath) : sTextPath;
          var fnTextFormatter = oTextExpression.formatter,
            oTextBinding = oModel.bindProperty(sTextPath, oBindingViewContext);
          oTextBinding.initialize();
          var oPromiseForTitleText = new Promise(function (resolve) {
            var fnChange = function (oEvent) {
              var sTargetText = fnTextFormatter ? fnTextFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();
              oTextBinding.detachChange(fnChange);
              resolve(sTargetText);
            };
            oTextBinding.attachChange(fnChange);
          });
          aPromises.push(oPromiseForTitleText);
        }
        var _temp2 = _catch(function () {
          return Promise.resolve(Promise.all(aPromises)).then(function (titleInfo) {
            var formattedTitle = "";
            if (typeof titleInfo !== "string") {
              formattedTitle = _this4._formatTitle(titleInfo[0], titleInfo[1], titleInfo[2]);
            }
            _exit2 = true;
            return formattedTitle;
          });
        }, function (error) {
          Log.error("Error while fetching the title from the header info :" + error);
        });
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function (_result) {
          return _exit2 ? _result : "";
        }) : _exit2 ? _temp2 : "");
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._getAppSpecificHash = function _getAppSpecificHash() {
      // HashChanged isShellNavigationHashChanger
      return HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
    };
    _proto._getHash = function _getHash() {
      return HashChanger.getInstance().getHash();
    }

    /**
     * This function returns titleInformation from a path.
     * It updates the cache to store Title Information if necessary
     *
     * @name sap.fe.core.rootView.BaseController#getTitleInfoFromPath
     * @memberof sap.fe.core.rootView.BaseController
     * @param {*} sPath path of the context to retrieve title information from MetaModel
     * @returns {Promise}  oTitleinformation returned as promise
     */;
    _proto.getTitleInfoFromPath = function getTitleInfoFromPath(sPath) {
      var _this5 = this;
      var oTitleHierarchyCache = this._getTitleHierarchyCache();
      if (oTitleHierarchyCache[sPath]) {
        // The title info is already stored in the cache
        return Promise.resolve(oTitleHierarchyCache[sPath]);
      }
      var oMetaModel = this.getAppComponent().getMetaModel();
      var sEntityPath = oMetaModel.getMetaPath(sPath);
      var sTypeName = oMetaModel.getObject("".concat(sEntityPath, "/@com.sap.vocabularies.UI.v1.HeaderInfo/TypeName"));
      var sAppSpecificHash = this._getAppSpecificHash();
      var sIntent = sAppSpecificHash + sPath.slice(1);
      return this._fetchTitleValue(sPath).then(function (sTitle) {
        var oTitleInfo = _this5._computeTitleInfo(sTypeName, sTitle, sIntent);
        oTitleHierarchyCache[sPath] = oTitleInfo;
        return oTitleInfo;
      });
    }
    /**
     * Ensure that the ushell service receives all elements
     * (title, subtitle, intent, icon) as strings.
     *
     * Annotation HeaderInfo allows for binding of title and description
     * (which are used here as title and subtitle) to any element in the entity
     * (being possibly types like boolean, timestamp, double, etc.)
     *
     * Creates a new hierarchy and converts non-string types to string.
     *
     * @param aHierarchy Shell title hierarchy
     * @returns Copy of shell title hierarchy containing all elements as strings
     */;
    _proto._ensureHierarchyElementsAreStrings = function _ensureHierarchyElementsAreStrings(aHierarchy) {
      var aHierarchyShell = [];
      for (var level in aHierarchy) {
        var oHierarchy = aHierarchy[level];
        var oShellHierarchy = {};
        for (var key in oHierarchy) {
          oShellHierarchy[key] = typeof oHierarchy[key] !== "string" ? String(oHierarchy[key]) : oHierarchy[key];
        }
        aHierarchyShell.push(oShellHierarchy);
      }
      return aHierarchyShell;
    };
    _proto._getTargetTypeFromHash = function _getTargetTypeFromHash(sHash) {
      var oAppComponent = this.getAppComponent();
      var sTargetType = "";
      var aRoutes = oAppComponent.getManifestEntry("/sap.ui5/routing/routes");
      var _iterator = _createForOfIteratorHelper(aRoutes),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var route = _step.value;
          var oRoute = oAppComponent.getRouter().getRoute(route.name);
          if (oRoute.match(sHash)) {
            var sTarget = Array.isArray(route.target) ? route.target[0] : route.target;
            sTargetType = oAppComponent.getRouter().getTarget(sTarget)._oOptions.name;
            break;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return sTargetType;
    }

    /**
     * This function is updating the shell title after each navigation.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param oView The current view
     * @returns A Promise that is resolved when the menu is filled properly
     */;
    _proto._computeTitleHierarchy = function _computeTitleHierarchy(oView) {
      var _this6 = this;
      var oAppComponent = this.getAppComponent(),
        oContext = oView.getBindingContext(),
        oCurrentPage = oView.getParent(),
        aTitleInformationPromises = [],
        sAppSpecificHash = this._getAppSpecificHash(),
        sAppTitle = oAppComponent.getMetadata().getManifestEntry("sap.app").title || "",
        sAppSubTitle = oAppComponent.getMetadata().getManifestEntry("sap.app").appSubTitle || "";
      var oPageTitleInformation, sNewPath;
      if (oCurrentPage && oCurrentPage._getPageTitleInformation) {
        if (oContext) {
          // If the first page of the application is a LR, use the title and subtitle from the manifest
          if (this._getTargetTypeFromHash("") === "sap.fe.templates.ListReport") {
            aTitleInformationPromises.push(Promise.resolve(this._computeTitleInfo(sAppTitle, sAppSubTitle, sAppSpecificHash)));
          }

          // Then manage other pages
          sNewPath = oContext.getPath();
          var aPathParts = sNewPath.split("/");
          var sPath = "";
          aPathParts.shift(); // Remove the first segment (empty string) as it has been managed above
          aPathParts.pop(); // Remove the last segment as it corresponds to the current page and shouldn't appear in the menu

          aPathParts.forEach(function (sPathPart) {
            sPath += "/".concat(sPathPart);
            var oMetaModel = oAppComponent.getMetaModel(),
              sParameterPath = oMetaModel.getMetaPath(sPath),
              bIsParameterized = oMetaModel.getObject("".concat(sParameterPath, "/@com.sap.vocabularies.Common.v1.ResultContext"));
            if (!bIsParameterized) {
              aTitleInformationPromises.push(_this6.getTitleInfoFromPath(sPath));
            }
          });
        }

        // Current page
        oPageTitleInformation = oCurrentPage._getPageTitleInformation();
        oPageTitleInformation = this._computeTitleInfo(oPageTitleInformation.title, oPageTitleInformation.subtitle, sAppSpecificHash + this._getHash());
        if (oContext) {
          this._getTitleHierarchyCache()[sNewPath] = oPageTitleInformation;
        } else {
          this._getTitleHierarchyCache()[sAppSpecificHash] = oPageTitleInformation;
        }
      } else {
        aTitleInformationPromises.push(Promise.reject("Title information missing in HeaderInfo"));
      }
      return Promise.all(aTitleInformationPromises).then(function (aTitleInfoHierarchy) {
        // workaround for shell which is expecting all elements being of type string
        var aTitleInfoHierarchyShell = _this6._ensureHierarchyElementsAreStrings(aTitleInfoHierarchy),
          sTitle = oPageTitleInformation.title;
        aTitleInfoHierarchyShell.reverse();
        oAppComponent.getShellServices().setHierarchy(aTitleInfoHierarchyShell);
        oAppComponent.getShellServices().setTitle(sTitle);
      }).catch(function (sErrorMessage) {
        Log.error(sErrorMessage);
      }).finally(function () {
        _this6.bIsComputingTitleHierachy = false;
      }).catch(function (sErrorMessage) {
        Log.error(sErrorMessage);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.calculateLayout = function calculateLayout(iNextFCLLevel, sHash, sProposedLayout) {
      var keepCurrentLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      return null;
    }

    /**
     * Callback after a view has been bound to a context.
     *
     * @param oContext The context that has been bound to a view
     */;
    _proto.onContextBoundToView = function onContextBoundToView(oContext) {
      if (oContext) {
        var sDeepestPath = this.getView().getModel("internal").getProperty("/deepestPath"),
          sViewContextPath = oContext.getPath();
        if (!sDeepestPath || sDeepestPath.indexOf(sViewContextPath) !== 0) {
          // There was no previous value for the deepest reached path, or the path
          // for the view isn't a subpath of the previous deepest path --> update
          this.getView().getModel("internal").setProperty("/deepestPath", sViewContextPath, undefined, true);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.displayMessagePage = function displayMessagePage(sErrorMessage, mParameters) {
      // To be overridden
      return Promise.resolve(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.updateUIStateForView = function updateUIStateForView(oView, FCLLevel) {
      // To be overriden
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.getInstancedViews = function getInstancedViews() {
      return [];
      // To be overriden
    };
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      // To be overriden
    };
    _proto.getAppContentContainer = function getAppContentContainer(view) {
      var oAppComponent = this.getAppComponent();
      var appContentId = oAppComponent.getManifestEntry("/sap.ui5/routing/config/controlId") || "appContent";
      return view.byId(appContentId);
    };
    return RootViewBaseController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "oPlaceholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return RootViewBaseController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiUm9vdFZpZXdCYXNlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJQbGFjZWhvbGRlciIsImJJc0NvbXB1dGluZ1RpdGxlSGllcmFjaHkiLCJvbkluaXQiLCJUYWJsZVNpemVIZWxwZXIiLCJpbml0IiwiX2FIZWxwZXJNb2RlbHMiLCJnZXRQbGFjZWhvbGRlciIsIm9QbGFjZWhvbGRlciIsImF0dGFjaFJvdXRlTWF0Y2hlcnMiLCJnZXRBcHBDb21wb25lbnQiLCJnZXRSb3V0aW5nU2VydmljZSIsImF0dGFjaEFmdGVyUm91dGVNYXRjaGVkIiwiX29uQWZ0ZXJSb3V0ZU1hdGNoZWQiLCJvbkV4aXQiLCJkZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsIm9Sb3V0ZXIiLCJ1bmRlZmluZWQiLCJleGl0IiwiZm9yRWFjaCIsIm9Nb2RlbCIsImRlc3Ryb3kiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsImdldE93bmVyQ29tcG9uZW50IiwiZ2V0TW9kZWwiLCJnZXRSb3V0ZXIiLCJfY3JlYXRlSGVscGVyTW9kZWwiLCJKU09OTW9kZWwiLCJwdXNoIiwid2FpdEZvclJpZ2h0TW9zdFZpZXdSZWFkeSIsIm9FdmVudCIsIlByb21pc2UiLCJyZXNvbHZlIiwiYUNvbnRhaW5lcnMiLCJnZXRQYXJhbWV0ZXIiLCJhRkVDb250YWluZXJzIiwib0NvbnRhaW5lciIsIm9WaWV3IiwiZ2V0Q29tcG9uZW50SW5zdGFuY2UiLCJvQ29tcG9uZW50SW5zdGFuY2UiLCJnZXRSb290Q29udHJvbCIsImdldENvbnRyb2xsZXIiLCJwYWdlUmVhZHkiLCJvUmlnaHRNb3N0RkVWaWV3IiwibGVuZ3RoIiwiaXNQYWdlUmVhZHkiLCJhdHRhY2hFdmVudE9uY2UiLCJfb1JvdXRlTWF0Y2hlZFByb21pc2UiLCJvUm9vdENvbnRyb2wiLCJnZXRWaWV3IiwiZ2V0Q29udGVudCIsImdldEF1dG9Gb2N1cyIsInNldFByb3BlcnR5Iiwib0FwcENvbXBvbmVudCIsIl9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcyIsImdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiZ2V0Q2FwYWJpbGl0aWVzIiwiVVNoZWxsIiwiX2NvbXB1dGVUaXRsZUhpZXJhcmNoeSIsImJGb3JjZUZvY3VzIiwiZ2V0Um91dGVyUHJveHkiLCJpc0ZvY3VzRm9yY2VkIiwic2V0Rm9jdXNGb3JjZWQiLCJvblBhZ2VSZWFkeSIsImdldFBhcmVudCIsImZvcmNlRm9jdXMiLCJvbkNvbnRhaW5lclJlYWR5IiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImZpbmFsbHkiLCJfZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZSIsIm9UaXRsZUhpZXJhcmNoeUNhY2hlIiwiX2NvbXB1dGVUaXRsZUluZm8iLCJ0aXRsZSIsInN1YnRpdGxlIiwic0ludGVudCIsImFQYXJ0cyIsInNwbGl0IiwiVVJJIiwiZGVjb2RlIiwiaW5kZXhPZiIsImludGVudCIsImljb24iLCJfZm9ybWF0VGl0bGUiLCJkaXNwbGF5TW9kZSIsInRpdGxlVmFsdWUiLCJ0aXRsZURlc2NyaXB0aW9uIiwiZm9ybWF0dGVkVGl0bGUiLCJfZmV0Y2hUaXRsZVZhbHVlIiwic1BhdGgiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJvQmluZGluZ1ZpZXdDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJzVmFsdWVFeHByZXNzaW9uIiwiQW5ub3RhdGlvbkhlbHBlciIsImZvcm1hdCIsImdldE9iamVjdCIsImNvbnRleHQiLCJzVGV4dEV4cHJlc3Npb24iLCJvUHJvcGVydHlDb250ZXh0IiwiYVByb21pc2VzIiwib1ZhbHVlRXhwcmVzc2lvbiIsIkJpbmRpbmdQYXJzZXIiLCJjb21wbGV4UGFyc2VyIiwib1Byb21pc2VGb3JEaXNwbGF5TW9kZSIsIkNvbW1vblV0aWxzIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwic1ZhbHVlUGF0aCIsInBhcnRzIiwicGF0aCIsImZuVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXR0ZXIiLCJvVmFsdWVCaW5kaW5nIiwiYmluZFByb3BlcnR5IiwiaW5pdGlhbGl6ZSIsIm9Qcm9taXNlRm9yVGl0bGVWYWx1ZSIsImZuQ2hhbmdlIiwic1RhcmdldFZhbHVlIiwiZ2V0U291cmNlIiwiZ2V0VmFsdWUiLCJkZXRhY2hDaGFuZ2UiLCJhdHRhY2hDaGFuZ2UiLCJvVGV4dEV4cHJlc3Npb24iLCJzVGV4dFBhdGgiLCJsYXN0SW5kZXhPZiIsInNsaWNlIiwiZm5UZXh0Rm9ybWF0dGVyIiwib1RleHRCaW5kaW5nIiwib1Byb21pc2VGb3JUaXRsZVRleHQiLCJzVGFyZ2V0VGV4dCIsImFsbCIsInRpdGxlSW5mbyIsIl9nZXRBcHBTcGVjaWZpY0hhc2giLCJIYXNoQ2hhbmdlciIsImdldEluc3RhbmNlIiwiaHJlZkZvckFwcFNwZWNpZmljSGFzaCIsIl9nZXRIYXNoIiwiZ2V0SGFzaCIsImdldFRpdGxlSW5mb0Zyb21QYXRoIiwic0VudGl0eVBhdGgiLCJzVHlwZU5hbWUiLCJzQXBwU3BlY2lmaWNIYXNoIiwic1RpdGxlIiwib1RpdGxlSW5mbyIsIl9lbnN1cmVIaWVyYXJjaHlFbGVtZW50c0FyZVN0cmluZ3MiLCJhSGllcmFyY2h5IiwiYUhpZXJhcmNoeVNoZWxsIiwibGV2ZWwiLCJvSGllcmFyY2h5Iiwib1NoZWxsSGllcmFyY2h5Iiwia2V5IiwiU3RyaW5nIiwiX2dldFRhcmdldFR5cGVGcm9tSGFzaCIsInNIYXNoIiwic1RhcmdldFR5cGUiLCJhUm91dGVzIiwiZ2V0TWFuaWZlc3RFbnRyeSIsInJvdXRlIiwib1JvdXRlIiwiZ2V0Um91dGUiLCJuYW1lIiwibWF0Y2giLCJzVGFyZ2V0IiwiQXJyYXkiLCJpc0FycmF5IiwidGFyZ2V0IiwiZ2V0VGFyZ2V0IiwiX29PcHRpb25zIiwib0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9DdXJyZW50UGFnZSIsImFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMiLCJzQXBwVGl0bGUiLCJnZXRNZXRhZGF0YSIsInNBcHBTdWJUaXRsZSIsImFwcFN1YlRpdGxlIiwib1BhZ2VUaXRsZUluZm9ybWF0aW9uIiwic05ld1BhdGgiLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJnZXRQYXRoIiwiYVBhdGhQYXJ0cyIsInNoaWZ0IiwicG9wIiwic1BhdGhQYXJ0Iiwic1BhcmFtZXRlclBhdGgiLCJiSXNQYXJhbWV0ZXJpemVkIiwicmVqZWN0IiwiYVRpdGxlSW5mb0hpZXJhcmNoeSIsImFUaXRsZUluZm9IaWVyYXJjaHlTaGVsbCIsInJldmVyc2UiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0SGllcmFyY2h5Iiwic2V0VGl0bGUiLCJzRXJyb3JNZXNzYWdlIiwiY2FsY3VsYXRlTGF5b3V0IiwiaU5leHRGQ0xMZXZlbCIsInNQcm9wb3NlZExheW91dCIsImtlZXBDdXJyZW50TGF5b3V0Iiwib25Db250ZXh0Qm91bmRUb1ZpZXciLCJzRGVlcGVzdFBhdGgiLCJnZXRQcm9wZXJ0eSIsInNWaWV3Q29udGV4dFBhdGgiLCJkaXNwbGF5TWVzc2FnZVBhZ2UiLCJtUGFyYW1ldGVycyIsInVwZGF0ZVVJU3RhdGVGb3JWaWV3IiwiRkNMTGV2ZWwiLCJnZXRJbnN0YW5jZWRWaWV3cyIsImdldEFwcENvbnRlbnRDb250YWluZXIiLCJ2aWV3IiwiYXBwQ29udGVudElkIiwiYnlJZCIsIkJhc2VDb250cm9sbGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSb290Vmlld0Jhc2VDb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgRmxleGlibGVDb2x1bW5MYXlvdXQgZnJvbSBcInNhcC9mL0ZsZXhpYmxlQ29sdW1uTGF5b3V0XCI7XG5pbXBvcnQgQmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgdXNpbmdFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBUYWJsZVNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVTaXplSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBOYXZDb250YWluZXIgZnJvbSBcInNhcC9tL05hdkNvbnRhaW5lclwiO1xuaW1wb3J0IEJpbmRpbmdQYXJzZXIgZnJvbSBcInNhcC91aS9iYXNlL0JpbmRpbmdQYXJzZXJcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgWE1MVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1hNTFZpZXdcIjtcbmltcG9ydCBIYXNoQ2hhbmdlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9IYXNoQ2hhbmdlclwiO1xuaW1wb3J0IHR5cGUgUm91dGVyIGZyb20gXCJzYXAvdWkvY29yZS9yb3V0aW5nL1JvdXRlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvcmVzb3VyY2UvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IFVSSSBmcm9tIFwic2FwL3VpL3RoaXJkcGFydHkvVVJJXCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLnJvb3RWaWV3LlJvb3RWaWV3QmFzZUNvbnRyb2xsZXJcIilcbmNsYXNzIFJvb3RWaWV3QmFzZUNvbnRyb2xsZXIgZXh0ZW5kcyBCYXNlQ29udHJvbGxlciB7XG5cdEB1c2luZ0V4dGVuc2lvbihQbGFjZWhvbGRlcilcblx0b1BsYWNlaG9sZGVyITogUGxhY2Vob2xkZXI7XG5cdHByaXZhdGUgX2FIZWxwZXJNb2RlbHMhOiBhbnlbXTtcblx0cHJpdmF0ZSBvUm91dGVyPzogUm91dGVyO1xuXHRwcml2YXRlIF9vUm91dGVNYXRjaGVkUHJvbWlzZTogYW55O1xuXHRwcml2YXRlIG9UaXRsZUhpZXJhcmNoeUNhY2hlOiBhbnk7XG5cdHByaXZhdGUgYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSA9IGZhbHNlO1xuXG5cdG9uSW5pdCgpIHtcblx0XHRUYWJsZVNpemVIZWxwZXIuaW5pdCgpO1xuXG5cdFx0dGhpcy5fYUhlbHBlck1vZGVscyA9IFtdO1xuXHR9XG5cblx0Z2V0UGxhY2Vob2xkZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMub1BsYWNlaG9sZGVyO1xuXHR9XG5cdGF0dGFjaFJvdXRlTWF0Y2hlcnMoKSB7XG5cdFx0dGhpcy5vUGxhY2Vob2xkZXIuYXR0YWNoUm91dGVNYXRjaGVycygpO1xuXHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5hdHRhY2hBZnRlclJvdXRlTWF0Y2hlZCh0aGlzLl9vbkFmdGVyUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0fVxuXHRvbkV4aXQoKSB7XG5cdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb3V0aW5nU2VydmljZSgpLmRldGFjaEFmdGVyUm91dGVNYXRjaGVkKHRoaXMuX29uQWZ0ZXJSb3V0ZU1hdGNoZWQsIHRoaXMpO1xuXHRcdHRoaXMub1JvdXRlciA9IHVuZGVmaW5lZDtcblxuXHRcdFRhYmxlU2l6ZUhlbHBlci5leGl0KCk7XG5cblx0XHQvLyBEZXN0cm95IGFsbCBKU09OIG1vZGVscyBjcmVhdGVkIGR5bmFtaWNhbGx5IGZvciB0aGUgdmlld3Ncblx0XHR0aGlzLl9hSGVscGVyTW9kZWxzLmZvckVhY2goZnVuY3Rpb24gKG9Nb2RlbDogYW55KSB7XG5cdFx0XHRvTW9kZWwuZGVzdHJveSgpO1xuXHRcdH0pO1xuXHR9XG5cdC8qKlxuXHQgKiBDb252ZW5pZW5jZSBtZXRob2QgZm9yIGdldHRpbmcgdGhlIHJlc291cmNlIGJ1bmRsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgcmVzb3VyY2VNb2RlbCBvZiB0aGUgY29tcG9uZW50XG5cdCAqL1xuXHRnZXRSZXNvdXJjZUJ1bmRsZSgpIHtcblx0XHRyZXR1cm4gKHRoaXMuZ2V0T3duZXJDb21wb25lbnQoKS5nZXRNb2RlbChcImkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKTtcblx0fVxuXHRnZXRSb3V0ZXIoKSB7XG5cdFx0aWYgKCF0aGlzLm9Sb3V0ZXIpIHtcblx0XHRcdHRoaXMub1JvdXRlciA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGVyKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMub1JvdXRlcjtcblx0fVxuXG5cdF9jcmVhdGVIZWxwZXJNb2RlbCgpIHtcblx0XHQvLyBXZSBrZWVwIGEgcmVmZXJlbmNlIG9uIHRoZSBtb2RlbHMgY3JlYXRlZCBkeW5hbWljYWxseSwgYXMgdGhleSBkb24ndCBnZXQgZGVzdHJveWVkXG5cdFx0Ly8gYXV0b21hdGljYWxseSB3aGVuIHRoZSB2aWV3IGlzIGRlc3Ryb3llZC5cblx0XHQvLyBUaGlzIGlzIGRvbmUgZHVyaW5nIG9uRXhpdFxuXHRcdGNvbnN0IG9Nb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHR0aGlzLl9hSGVscGVyTW9kZWxzLnB1c2gob01vZGVsKTtcblxuXHRcdHJldHVybiBvTW9kZWw7XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gd2FpdGluZyBmb3IgdGhlIFJpZ2h0IG1vc3QgdmlldyB0byBiZSByZWFkeS5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyXG5cdCAqIEBwYXJhbSBvRXZlbnQgUmVmZXJlbmNlIGFuIEV2ZW50IHBhcmFtZXRlciBjb21pbmcgZnJvbSByb3V0ZU1hdGNoZWQgZXZlbnRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGluZGljYXRpbmcgd2hlbiB0aGUgcmlnaHQgbW9zdCB2aWV3IGlzIHJlYWR5XG5cdCAqL1xuXHR3YWl0Rm9yUmlnaHRNb3N0Vmlld1JlYWR5KG9FdmVudDogYW55KSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3QgYUNvbnRhaW5lcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmlld3NcIiksXG5cdFx0XHRcdC8vIFRoZXJlIGNhbiBhbHNvIGJlIHJldXNlIGNvbXBvbmVudHMgaW4gdGhlIHZpZXcsIHJlbW92ZSB0aGVtIGJlZm9yZSBwcm9jZXNzaW5nLlxuXHRcdFx0XHRhRkVDb250YWluZXJzOiBhbnlbXSA9IFtdO1xuXHRcdFx0YUNvbnRhaW5lcnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRhaW5lcjogYW55KSB7XG5cdFx0XHRcdGxldCBvVmlldyA9IG9Db250YWluZXI7XG5cdFx0XHRcdGlmIChvQ29udGFpbmVyICYmIG9Db250YWluZXIuZ2V0Q29tcG9uZW50SW5zdGFuY2UpIHtcblx0XHRcdFx0XHRjb25zdCBvQ29tcG9uZW50SW5zdGFuY2UgPSBvQ29udGFpbmVyLmdldENvbXBvbmVudEluc3RhbmNlKCk7XG5cdFx0XHRcdFx0b1ZpZXcgPSBvQ29tcG9uZW50SW5zdGFuY2UuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1ZpZXcgJiYgb1ZpZXcuZ2V0Q29udHJvbGxlcigpICYmIG9WaWV3LmdldENvbnRyb2xsZXIoKS5wYWdlUmVhZHkpIHtcblx0XHRcdFx0XHRhRkVDb250YWluZXJzLnB1c2gob1ZpZXcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG9SaWdodE1vc3RGRVZpZXcgPSBhRkVDb250YWluZXJzW2FGRUNvbnRhaW5lcnMubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAob1JpZ2h0TW9zdEZFVmlldyAmJiBvUmlnaHRNb3N0RkVWaWV3LmdldENvbnRyb2xsZXIoKS5wYWdlUmVhZHkuaXNQYWdlUmVhZHkoKSkge1xuXHRcdFx0XHRyZXNvbHZlKG9SaWdodE1vc3RGRVZpZXcpO1xuXHRcdFx0fSBlbHNlIGlmIChvUmlnaHRNb3N0RkVWaWV3KSB7XG5cdFx0XHRcdG9SaWdodE1vc3RGRVZpZXcuZ2V0Q29udHJvbGxlcigpLnBhZ2VSZWFkeS5hdHRhY2hFdmVudE9uY2UoXCJwYWdlUmVhZHlcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJlc29sdmUob1JpZ2h0TW9zdEZFVmlldyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZG9uZS5cblx0ICogIC0gdXBkYXRlIHRoZSBzaGVsbCB0aXRsZS5cblx0ICogIC0gdXBkYXRlIHRhYmxlIHNjcm9sbC5cblx0ICogIC0gY2FsbCBvblBhZ2VSZWFkeSBvbiB0aGUgcmlnaHRNb3N0Vmlldy5cblx0ICpcblx0ICogQHBhcmFtIG9FdmVudFxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlciNfb25BZnRlclJvdXRlTWF0Y2hlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICovXG5cdF9vbkFmdGVyUm91dGVNYXRjaGVkKG9FdmVudDogYW55KSB7XG5cdFx0aWYgKCF0aGlzLl9vUm91dGVNYXRjaGVkUHJvbWlzZSkge1xuXHRcdFx0dGhpcy5fb1JvdXRlTWF0Y2hlZFByb21pc2UgPSB0aGlzLndhaXRGb3JSaWdodE1vc3RWaWV3UmVhZHkob0V2ZW50KVxuXHRcdFx0XHQudGhlbigob1ZpZXc6IGFueSkgPT4ge1xuXHRcdFx0XHRcdC8vIFRoZSBhdXRvRm9jdXMgaXMgaW5pdGlhbGx5IGRpc2FibGVkIG9uIHRoZSBuYXZDb250YWluZXIgb3IgdGhlIEZDTCwgc28gdGhhdCB0aGUgZm9jdXMgc3RheXMgb24gdGhlIFNoZWxsIG1lbnVcblx0XHRcdFx0XHQvLyBldmVuIGlmIHRoZSBhcHAgdGFrZXMgYSBsb25nIHRpbWUgdG8gbGF1bmNoXG5cdFx0XHRcdFx0Ly8gVGhlIGZpcnN0IHRpbWUgdGhlIHZpZXcgaXMgZGlzcGxheWVkLCB3ZSBuZWVkIHRvIGVuYWJsZSB0aGUgYXV0b2ZvY3VzIHNvIHRoYXQgaXQncyBtYW5hZ2VkIHByb3Blcmx5IGR1cmluZyBuYXZpZ2F0aW9uXG5cdFx0XHRcdFx0Y29uc3Qgb1Jvb3RDb250cm9sID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udGVudCgpWzBdIGFzIGFueTtcblx0XHRcdFx0XHRpZiAob1Jvb3RDb250cm9sICYmIG9Sb290Q29udHJvbC5nZXRBdXRvRm9jdXMgJiYgIW9Sb290Q29udHJvbC5nZXRBdXRvRm9jdXMoKSkge1xuXHRcdFx0XHRcdFx0b1Jvb3RDb250cm9sLnNldFByb3BlcnR5KFwiYXV0b0ZvY3VzXCIsIHRydWUsIHRydWUpOyAvLyBEbyBub3QgbWFyayB0aGUgY29udGFpbmVyIGFzIGludmFsaWQsIG90aGVyd2lzZSBpdCdzIHJlLXJlbmRlcmVkXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRcdFx0dGhpcy5fc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMoKTtcblx0XHRcdFx0XHRpZiAob0FwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLmdldENhcGFiaWxpdGllcygpLlVTaGVsbCkge1xuXHRcdFx0XHRcdFx0dGhpcy5fY29tcHV0ZVRpdGxlSGllcmFyY2h5KG9WaWV3KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgYkZvcmNlRm9jdXMgPSBvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuaXNGb2N1c0ZvcmNlZCgpO1xuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5zZXRGb2N1c0ZvcmNlZChmYWxzZSk7IC8vIHJlc2V0XG5cdFx0XHRcdFx0aWYgKG9WaWV3LmdldENvbnRyb2xsZXIoKSAmJiBvVmlldy5nZXRDb250cm9sbGVyKCkub25QYWdlUmVhZHkgJiYgb1ZpZXcuZ2V0UGFyZW50KCkub25QYWdlUmVhZHkpIHtcblx0XHRcdFx0XHRcdG9WaWV3LmdldFBhcmVudCgpLm9uUGFnZVJlYWR5KHsgZm9yY2VGb2N1czogYkZvcmNlRm9jdXMgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0aGlzLm9uQ29udGFpbmVyUmVhZHkpIHtcblx0XHRcdFx0XHRcdHRoaXMub25Db250YWluZXJSZWFkeSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIkFuIGVycm9yIG9jY3VycyB3aGlsZSBjb21wdXRpbmcgdGhlIHRpdGxlIGhpZXJhcmNoeSBhbmQgY2FsbGluZyBmb2N1cyBtZXRob2RcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX29Sb3V0ZU1hdGNoZWRQcm9taXNlID0gbnVsbDtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgVGl0bGVIaWVyYXJjaHkgY2FjaGUgKCBvciBpbml0aWFsaXplcyBpdCBpZiB1bmRlZmluZWQpLlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlciNfZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgIFRoZSBUaXRsZUhpZXJhcmNoeSBjYWNoZVxuXHQgKi9cblx0X2dldFRpdGxlSGllcmFyY2h5Q2FjaGUoKSB7XG5cdFx0aWYgKCF0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlKSB7XG5cdFx0XHR0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlID0ge307XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHRpdGxlSW5mbyBvYmplY3QuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gdGl0bGVcblx0ICogQHBhcmFtIHN1YnRpdGxlXG5cdCAqIEBwYXJhbSBzSW50ZW50IFRoZSBpbnRlbnQgcGF0aCB0byBiZSByZWRpcmVjdGVkIHRvXG5cdCAqIEByZXR1cm5zIFRoZSB0aXRsZSBpbmZvcm1hdGlvblxuXHQgKi9cblx0X2NvbXB1dGVUaXRsZUluZm8odGl0bGU6IGFueSwgc3VidGl0bGU6IGFueSwgc0ludGVudDogYW55KSB7XG5cdFx0Y29uc3QgYVBhcnRzID0gc0ludGVudC5zcGxpdChcIi9cIik7XG5cdFx0c0ludGVudCA9IFVSSS5kZWNvZGUoc0ludGVudCk7XG5cdFx0aWYgKGFQYXJ0c1thUGFydHMubGVuZ3RoIC0gMV0uaW5kZXhPZihcIj9cIikgPT09IC0xKSB7XG5cdFx0XHRzSW50ZW50ICs9IFwiP3Jlc3RvcmVIaXN0b3J5PXRydWVcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0ludGVudCArPSBcIiZyZXN0b3JlSGlzdG9yeT10cnVlXCI7XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRzdWJ0aXRsZTogc3VidGl0bGUsXG5cdFx0XHRpbnRlbnQ6IHNJbnRlbnQsXG5cdFx0XHRpY29uOiBcIlwiXG5cdFx0fTtcblx0fVxuXHRfZm9ybWF0VGl0bGUoZGlzcGxheU1vZGU6IHN0cmluZywgdGl0bGVWYWx1ZTogc3RyaW5nLCB0aXRsZURlc2NyaXB0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGxldCBmb3JtYXR0ZWRUaXRsZSA9IFwiXCI7XG5cdFx0c3dpdGNoIChkaXNwbGF5TW9kZSkge1xuXHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVWYWx1ZX1gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVWYWx1ZX0gKCR7dGl0bGVEZXNjcmlwdGlvbn0pYDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRmb3JtYXR0ZWRUaXRsZSA9IGAke3RpdGxlRGVzY3JpcHRpb259ICgke3RpdGxlVmFsdWV9KWA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVEZXNjcmlwdGlvbn1gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0fVxuXHRcdHJldHVybiBmb3JtYXR0ZWRUaXRsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGZXRjaGVzIHRoZSB2YWx1ZSBvZiB0aGUgSGVhZGVySW5mbyB0aXRsZSBmb3IgYSBnaXZlbiBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGggdG8gdGhlIGVudGl0eVxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgY29udGFpbmluZyB0aGUgZm9ybWF0dGVkIHRpdGxlLCBvciBhbiBlbXB0eSBzdHJpbmcgaWYgbm8gSGVhZGVySW5mbyB0aXRsZSBhbm5vdGF0aW9uIGlzIGF2YWlsYWJsZVxuXHQgKi9cblx0YXN5bmMgX2ZldGNoVGl0bGVWYWx1ZShzUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRvTW9kZWwgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbCgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9BcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKSxcblx0XHRcdG9CaW5kaW5nVmlld0NvbnRleHQgPSBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpLFxuXHRcdFx0c1ZhbHVlRXhwcmVzc2lvbiA9IEFubm90YXRpb25IZWxwZXIuZm9ybWF0KFxuXHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvL1RpdGxlL1ZhbHVlYCksXG5cdFx0XHRcdHsgY29udGV4dDogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgYXMgQ29udGV4dCB9XG5cdFx0XHQpO1xuXHRcdGlmICghc1ZhbHVlRXhwcmVzc2lvbikge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShcIlwiKTtcblx0XHR9XG5cdFx0Y29uc3Qgc1RleHRFeHByZXNzaW9uID0gQW5ub3RhdGlvbkhlbHBlci5mb3JtYXQoXG5cdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8vVGl0bGUvVmFsdWUvJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgXG5cdFx0XHRcdCksXG5cdFx0XHRcdHsgY29udGV4dDogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgYXMgQ29udGV4dCB9XG5cdFx0XHQpLFxuXHRcdFx0b1Byb3BlcnR5Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8vVGl0bGUvVmFsdWUvJFBhdGhAYCksXG5cdFx0XHRhUHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdLFxuXHRcdFx0b1ZhbHVlRXhwcmVzc2lvbiA9IEJpbmRpbmdQYXJzZXIuY29tcGxleFBhcnNlcihzVmFsdWVFeHByZXNzaW9uKSxcblx0XHRcdG9Qcm9taXNlRm9yRGlzcGxheU1vZGUgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdFx0Y29uc3QgZGlzcGxheU1vZGUgPSBDb21tb25VdGlscy5jb21wdXRlRGlzcGxheU1vZGUob1Byb3BlcnR5Q29udGV4dCk7XG5cdFx0XHRcdHJlc29sdmUoZGlzcGxheU1vZGUpO1xuXHRcdFx0fSk7XG5cdFx0YVByb21pc2VzLnB1c2gob1Byb21pc2VGb3JEaXNwbGF5TW9kZSk7XG5cdFx0Y29uc3Qgc1ZhbHVlUGF0aCA9IG9WYWx1ZUV4cHJlc3Npb24ucGFydHMgPyBvVmFsdWVFeHByZXNzaW9uLnBhcnRzWzBdLnBhdGggOiBvVmFsdWVFeHByZXNzaW9uLnBhdGgsXG5cdFx0XHRmblZhbHVlRm9ybWF0dGVyID0gb1ZhbHVlRXhwcmVzc2lvbi5mb3JtYXR0ZXIsXG5cdFx0XHRvVmFsdWVCaW5kaW5nID0gb01vZGVsLmJpbmRQcm9wZXJ0eShzVmFsdWVQYXRoLCBvQmluZGluZ1ZpZXdDb250ZXh0KTtcblx0XHRvVmFsdWVCaW5kaW5nLmluaXRpYWxpemUoKTtcblx0XHRjb25zdCBvUHJvbWlzZUZvclRpdGxlVmFsdWUgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGNvbnN0IGZuQ2hhbmdlID0gZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdGNvbnN0IHNUYXJnZXRWYWx1ZSA9IGZuVmFsdWVGb3JtYXR0ZXIgPyBmblZhbHVlRm9ybWF0dGVyKG9FdmVudC5nZXRTb3VyY2UoKS5nZXRWYWx1ZSgpKSA6IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRWYWx1ZSgpO1xuXG5cdFx0XHRcdG9WYWx1ZUJpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHRcdFx0cmVzb2x2ZShzVGFyZ2V0VmFsdWUpO1xuXHRcdFx0fTtcblx0XHRcdG9WYWx1ZUJpbmRpbmcuYXR0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHR9KTtcblx0XHRhUHJvbWlzZXMucHVzaChvUHJvbWlzZUZvclRpdGxlVmFsdWUpO1xuXG5cdFx0aWYgKHNUZXh0RXhwcmVzc2lvbikge1xuXHRcdFx0Y29uc3Qgb1RleHRFeHByZXNzaW9uID0gQmluZGluZ1BhcnNlci5jb21wbGV4UGFyc2VyKHNUZXh0RXhwcmVzc2lvbik7XG5cdFx0XHRsZXQgc1RleHRQYXRoID0gb1RleHRFeHByZXNzaW9uLnBhcnRzID8gb1RleHRFeHByZXNzaW9uLnBhcnRzWzBdLnBhdGggOiBvVGV4dEV4cHJlc3Npb24ucGF0aDtcblx0XHRcdHNUZXh0UGF0aCA9IHNWYWx1ZVBhdGgubGFzdEluZGV4T2YoXCIvXCIpID4gLTEgPyBgJHtzVmFsdWVQYXRoLnNsaWNlKDAsIHNWYWx1ZVBhdGgubGFzdEluZGV4T2YoXCIvXCIpKX0vJHtzVGV4dFBhdGh9YCA6IHNUZXh0UGF0aDtcblxuXHRcdFx0Y29uc3QgZm5UZXh0Rm9ybWF0dGVyID0gb1RleHRFeHByZXNzaW9uLmZvcm1hdHRlcixcblx0XHRcdFx0b1RleHRCaW5kaW5nID0gb01vZGVsLmJpbmRQcm9wZXJ0eShzVGV4dFBhdGgsIG9CaW5kaW5nVmlld0NvbnRleHQpO1xuXHRcdFx0b1RleHRCaW5kaW5nLmluaXRpYWxpemUoKTtcblx0XHRcdGNvbnN0IG9Qcm9taXNlRm9yVGl0bGVUZXh0ID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6IChkZXNjcmlwdGlvbjogYW55KSA9PiB2b2lkKSB7XG5cdFx0XHRcdGNvbnN0IGZuQ2hhbmdlID0gZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1RhcmdldFRleHQgPSBmblRleHRGb3JtYXR0ZXIgPyBmblRleHRGb3JtYXR0ZXIob0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCkpIDogb0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCk7XG5cblx0XHRcdFx0XHRvVGV4dEJpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHRcdFx0XHRyZXNvbHZlKHNUYXJnZXRUZXh0KTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRvVGV4dEJpbmRpbmcuYXR0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHRcdH0pO1xuXHRcdFx0YVByb21pc2VzLnB1c2gob1Byb21pc2VGb3JUaXRsZVRleHQpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgdGl0bGVJbmZvOiBhbnlbXSA9IGF3YWl0IFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG5cdFx0XHRsZXQgZm9ybWF0dGVkVGl0bGUgPSBcIlwiO1xuXHRcdFx0aWYgKHR5cGVvZiB0aXRsZUluZm8gIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0Zm9ybWF0dGVkVGl0bGUgPSB0aGlzLl9mb3JtYXRUaXRsZSh0aXRsZUluZm9bMF0sIHRpdGxlSW5mb1sxXSwgdGl0bGVJbmZvWzJdKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmb3JtYXR0ZWRUaXRsZTtcblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBmZXRjaGluZyB0aGUgdGl0bGUgZnJvbSB0aGUgaGVhZGVyIGluZm8gOlwiICsgZXJyb3IpO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdF9nZXRBcHBTcGVjaWZpY0hhc2goKSB7XG5cdFx0Ly8gSGFzaENoYW5nZWQgaXNTaGVsbE5hdmlnYXRpb25IYXNoQ2hhbmdlclxuXHRcdHJldHVybiAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2hcblx0XHRcdD8gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoKFwiXCIpXG5cdFx0XHQ6IFwiXCI7XG5cdH1cblxuXHRfZ2V0SGFzaCgpIHtcblx0XHRyZXR1cm4gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRpdGxlSW5mb3JtYXRpb24gZnJvbSBhIHBhdGguXG5cdCAqIEl0IHVwZGF0ZXMgdGhlIGNhY2hlIHRvIHN0b3JlIFRpdGxlIEluZm9ybWF0aW9uIGlmIG5lY2Vzc2FyeVxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlciNnZXRUaXRsZUluZm9Gcm9tUGF0aFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICogQHBhcmFtIHsqfSBzUGF0aCBwYXRoIG9mIHRoZSBjb250ZXh0IHRvIHJldHJpZXZlIHRpdGxlIGluZm9ybWF0aW9uIGZyb20gTWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSAgb1RpdGxlaW5mb3JtYXRpb24gcmV0dXJuZWQgYXMgcHJvbWlzZVxuXHQgKi9cblxuXHRnZXRUaXRsZUluZm9Gcm9tUGF0aChzUGF0aDogYW55KSB7XG5cdFx0Y29uc3Qgb1RpdGxlSGllcmFyY2h5Q2FjaGUgPSB0aGlzLl9nZXRUaXRsZUhpZXJhcmNoeUNhY2hlKCk7XG5cblx0XHRpZiAob1RpdGxlSGllcmFyY2h5Q2FjaGVbc1BhdGhdKSB7XG5cdFx0XHQvLyBUaGUgdGl0bGUgaW5mbyBpcyBhbHJlYWR5IHN0b3JlZCBpbiB0aGUgY2FjaGVcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUob1RpdGxlSGllcmFyY2h5Q2FjaGVbc1BhdGhdKTtcblx0XHR9XG5cblx0XHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzRW50aXR5UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGgpO1xuXHRcdGNvbnN0IHNUeXBlTmFtZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGVhZGVySW5mby9UeXBlTmFtZWApO1xuXHRcdGNvbnN0IHNBcHBTcGVjaWZpY0hhc2ggPSB0aGlzLl9nZXRBcHBTcGVjaWZpY0hhc2goKTtcblx0XHRjb25zdCBzSW50ZW50ID0gc0FwcFNwZWNpZmljSGFzaCArIHNQYXRoLnNsaWNlKDEpO1xuXHRcdHJldHVybiB0aGlzLl9mZXRjaFRpdGxlVmFsdWUoc1BhdGgpLnRoZW4oKHNUaXRsZTogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvVGl0bGVJbmZvID0gdGhpcy5fY29tcHV0ZVRpdGxlSW5mbyhzVHlwZU5hbWUsIHNUaXRsZSwgc0ludGVudCk7XG5cdFx0XHRvVGl0bGVIaWVyYXJjaHlDYWNoZVtzUGF0aF0gPSBvVGl0bGVJbmZvO1xuXHRcdFx0cmV0dXJuIG9UaXRsZUluZm87XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqIEVuc3VyZSB0aGF0IHRoZSB1c2hlbGwgc2VydmljZSByZWNlaXZlcyBhbGwgZWxlbWVudHNcblx0ICogKHRpdGxlLCBzdWJ0aXRsZSwgaW50ZW50LCBpY29uKSBhcyBzdHJpbmdzLlxuXHQgKlxuXHQgKiBBbm5vdGF0aW9uIEhlYWRlckluZm8gYWxsb3dzIGZvciBiaW5kaW5nIG9mIHRpdGxlIGFuZCBkZXNjcmlwdGlvblxuXHQgKiAod2hpY2ggYXJlIHVzZWQgaGVyZSBhcyB0aXRsZSBhbmQgc3VidGl0bGUpIHRvIGFueSBlbGVtZW50IGluIHRoZSBlbnRpdHlcblx0ICogKGJlaW5nIHBvc3NpYmx5IHR5cGVzIGxpa2UgYm9vbGVhbiwgdGltZXN0YW1wLCBkb3VibGUsIGV0Yy4pXG5cdCAqXG5cdCAqIENyZWF0ZXMgYSBuZXcgaGllcmFyY2h5IGFuZCBjb252ZXJ0cyBub24tc3RyaW5nIHR5cGVzIHRvIHN0cmluZy5cblx0ICpcblx0ICogQHBhcmFtIGFIaWVyYXJjaHkgU2hlbGwgdGl0bGUgaGllcmFyY2h5XG5cdCAqIEByZXR1cm5zIENvcHkgb2Ygc2hlbGwgdGl0bGUgaGllcmFyY2h5IGNvbnRhaW5pbmcgYWxsIGVsZW1lbnRzIGFzIHN0cmluZ3Ncblx0ICovXG5cdF9lbnN1cmVIaWVyYXJjaHlFbGVtZW50c0FyZVN0cmluZ3MoYUhpZXJhcmNoeTogYW55KSB7XG5cdFx0Y29uc3QgYUhpZXJhcmNoeVNoZWxsID0gW107XG5cdFx0Zm9yIChjb25zdCBsZXZlbCBpbiBhSGllcmFyY2h5KSB7XG5cdFx0XHRjb25zdCBvSGllcmFyY2h5ID0gYUhpZXJhcmNoeVtsZXZlbF07XG5cdFx0XHRjb25zdCBvU2hlbGxIaWVyYXJjaHk6IGFueSA9IHt9O1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gb0hpZXJhcmNoeSkge1xuXHRcdFx0XHRvU2hlbGxIaWVyYXJjaHlba2V5XSA9IHR5cGVvZiBvSGllcmFyY2h5W2tleV0gIT09IFwic3RyaW5nXCIgPyBTdHJpbmcob0hpZXJhcmNoeVtrZXldKSA6IG9IaWVyYXJjaHlba2V5XTtcblx0XHRcdH1cblx0XHRcdGFIaWVyYXJjaHlTaGVsbC5wdXNoKG9TaGVsbEhpZXJhcmNoeSk7XG5cdFx0fVxuXHRcdHJldHVybiBhSGllcmFyY2h5U2hlbGw7XG5cdH1cblxuXHRfZ2V0VGFyZ2V0VHlwZUZyb21IYXNoKHNIYXNoOiBhbnkpIHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblx0XHRsZXQgc1RhcmdldFR5cGUgPSBcIlwiO1xuXG5cdFx0Y29uc3QgYVJvdXRlcyA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcIi9zYXAudWk1L3JvdXRpbmcvcm91dGVzXCIpO1xuXHRcdGZvciAoY29uc3Qgcm91dGUgb2YgYVJvdXRlcykge1xuXHRcdFx0Y29uc3Qgb1JvdXRlID0gb0FwcENvbXBvbmVudC5nZXRSb3V0ZXIoKS5nZXRSb3V0ZShyb3V0ZS5uYW1lKTtcblx0XHRcdGlmIChvUm91dGUubWF0Y2goc0hhc2gpKSB7XG5cdFx0XHRcdGNvbnN0IHNUYXJnZXQgPSBBcnJheS5pc0FycmF5KHJvdXRlLnRhcmdldCkgPyByb3V0ZS50YXJnZXRbMF0gOiByb3V0ZS50YXJnZXQ7XG5cdFx0XHRcdHNUYXJnZXRUeXBlID0gKG9BcHBDb21wb25lbnQuZ2V0Um91dGVyKCkuZ2V0VGFyZ2V0KHNUYXJnZXQpIGFzIGFueSkuX29PcHRpb25zLm5hbWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzVGFyZ2V0VHlwZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHVwZGF0aW5nIHRoZSBzaGVsbCB0aXRsZSBhZnRlciBlYWNoIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gb1ZpZXcgVGhlIGN1cnJlbnQgdmlld1xuXHQgKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBtZW51IGlzIGZpbGxlZCBwcm9wZXJseVxuXHQgKi9cblx0X2NvbXB1dGVUaXRsZUhpZXJhcmNoeShvVmlldzogYW55KSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRvQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRvQ3VycmVudFBhZ2UgPSBvVmlldy5nZXRQYXJlbnQoKSxcblx0XHRcdGFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMgPSBbXSxcblx0XHRcdHNBcHBTcGVjaWZpY0hhc2ggPSB0aGlzLl9nZXRBcHBTcGVjaWZpY0hhc2goKSxcblx0XHRcdHNBcHBUaXRsZSA9IG9BcHBDb21wb25lbnQuZ2V0TWV0YWRhdGEoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLmFwcFwiKS50aXRsZSB8fCBcIlwiLFxuXHRcdFx0c0FwcFN1YlRpdGxlID0gb0FwcENvbXBvbmVudC5nZXRNZXRhZGF0YSgpLmdldE1hbmlmZXN0RW50cnkoXCJzYXAuYXBwXCIpLmFwcFN1YlRpdGxlIHx8IFwiXCI7XG5cdFx0bGV0IG9QYWdlVGl0bGVJbmZvcm1hdGlvbjogYW55LCBzTmV3UGF0aDtcblxuXHRcdGlmIChvQ3VycmVudFBhZ2UgJiYgb0N1cnJlbnRQYWdlLl9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbikge1xuXHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdC8vIElmIHRoZSBmaXJzdCBwYWdlIG9mIHRoZSBhcHBsaWNhdGlvbiBpcyBhIExSLCB1c2UgdGhlIHRpdGxlIGFuZCBzdWJ0aXRsZSBmcm9tIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHRpZiAodGhpcy5fZ2V0VGFyZ2V0VHlwZUZyb21IYXNoKFwiXCIpID09PSBcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydFwiKSB7XG5cdFx0XHRcdFx0YVRpdGxlSW5mb3JtYXRpb25Qcm9taXNlcy5wdXNoKFByb21pc2UucmVzb2x2ZSh0aGlzLl9jb21wdXRlVGl0bGVJbmZvKHNBcHBUaXRsZSwgc0FwcFN1YlRpdGxlLCBzQXBwU3BlY2lmaWNIYXNoKSkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlbiBtYW5hZ2Ugb3RoZXIgcGFnZXNcblx0XHRcdFx0c05ld1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRcdGNvbnN0IGFQYXRoUGFydHMgPSBzTmV3UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRcdGxldCBzUGF0aCA9IFwiXCI7XG5cblx0XHRcdFx0YVBhdGhQYXJ0cy5zaGlmdCgpOyAvLyBSZW1vdmUgdGhlIGZpcnN0IHNlZ21lbnQgKGVtcHR5IHN0cmluZykgYXMgaXQgaGFzIGJlZW4gbWFuYWdlZCBhYm92ZVxuXHRcdFx0XHRhUGF0aFBhcnRzLnBvcCgpOyAvLyBSZW1vdmUgdGhlIGxhc3Qgc2VnbWVudCBhcyBpdCBjb3JyZXNwb25kcyB0byB0aGUgY3VycmVudCBwYWdlIGFuZCBzaG91bGRuJ3QgYXBwZWFyIGluIHRoZSBtZW51XG5cblx0XHRcdFx0YVBhdGhQYXJ0cy5mb3JFYWNoKChzUGF0aFBhcnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHNQYXRoICs9IGAvJHtzUGF0aFBhcnR9YDtcblx0XHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0XHRcdHNQYXJhbWV0ZXJQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzUGF0aCksXG5cdFx0XHRcdFx0XHRiSXNQYXJhbWV0ZXJpemVkID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhcmFtZXRlclBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVzdWx0Q29udGV4dGApO1xuXHRcdFx0XHRcdGlmICghYklzUGFyYW1ldGVyaXplZCkge1xuXHRcdFx0XHRcdFx0YVRpdGxlSW5mb3JtYXRpb25Qcm9taXNlcy5wdXNoKHRoaXMuZ2V0VGl0bGVJbmZvRnJvbVBhdGgoc1BhdGgpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDdXJyZW50IHBhZ2Vcblx0XHRcdG9QYWdlVGl0bGVJbmZvcm1hdGlvbiA9IG9DdXJyZW50UGFnZS5fZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKTtcblx0XHRcdG9QYWdlVGl0bGVJbmZvcm1hdGlvbiA9IHRoaXMuX2NvbXB1dGVUaXRsZUluZm8oXG5cdFx0XHRcdG9QYWdlVGl0bGVJbmZvcm1hdGlvbi50aXRsZSxcblx0XHRcdFx0b1BhZ2VUaXRsZUluZm9ybWF0aW9uLnN1YnRpdGxlLFxuXHRcdFx0XHRzQXBwU3BlY2lmaWNIYXNoICsgdGhpcy5fZ2V0SGFzaCgpXG5cdFx0XHQpO1xuXG5cdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5fZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZSgpW3NOZXdQYXRoXSA9IG9QYWdlVGl0bGVJbmZvcm1hdGlvbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX2dldFRpdGxlSGllcmFyY2h5Q2FjaGUoKVtzQXBwU3BlY2lmaWNIYXNoXSA9IG9QYWdlVGl0bGVJbmZvcm1hdGlvbjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0YVRpdGxlSW5mb3JtYXRpb25Qcm9taXNlcy5wdXNoKFByb21pc2UucmVqZWN0KFwiVGl0bGUgaW5mb3JtYXRpb24gbWlzc2luZyBpbiBIZWFkZXJJbmZvXCIpKTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMpXG5cdFx0XHQudGhlbigoYVRpdGxlSW5mb0hpZXJhcmNoeTogYW55W10pID0+IHtcblx0XHRcdFx0Ly8gd29ya2Fyb3VuZCBmb3Igc2hlbGwgd2hpY2ggaXMgZXhwZWN0aW5nIGFsbCBlbGVtZW50cyBiZWluZyBvZiB0eXBlIHN0cmluZ1xuXHRcdFx0XHRjb25zdCBhVGl0bGVJbmZvSGllcmFyY2h5U2hlbGwgPSB0aGlzLl9lbnN1cmVIaWVyYXJjaHlFbGVtZW50c0FyZVN0cmluZ3MoYVRpdGxlSW5mb0hpZXJhcmNoeSksXG5cdFx0XHRcdFx0c1RpdGxlID0gb1BhZ2VUaXRsZUluZm9ybWF0aW9uLnRpdGxlO1xuXHRcdFx0XHRhVGl0bGVJbmZvSGllcmFyY2h5U2hlbGwucmV2ZXJzZSgpO1xuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRIaWVyYXJjaHkoYVRpdGxlSW5mb0hpZXJhcmNoeVNoZWxsKTtcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0VGl0bGUoc1RpdGxlKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKHNFcnJvck1lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3Ioc0Vycm9yTWVzc2FnZSk7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJJc0NvbXB1dGluZ1RpdGxlSGllcmFjaHkgPSBmYWxzZTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKHNFcnJvck1lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3Ioc0Vycm9yTWVzc2FnZSk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0Y2FsY3VsYXRlTGF5b3V0KGlOZXh0RkNMTGV2ZWw6IG51bWJlciwgc0hhc2g6IHN0cmluZywgc1Byb3Bvc2VkTGF5b3V0OiBzdHJpbmcgfCB1bmRlZmluZWQsIGtlZXBDdXJyZW50TGF5b3V0ID0gZmFsc2UpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBhZnRlciBhIHZpZXcgaGFzIGJlZW4gYm91bmQgdG8gYSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgdGhhdCBoYXMgYmVlbiBib3VuZCB0byBhIHZpZXdcblx0ICovXG5cdG9uQ29udGV4dEJvdW5kVG9WaWV3KG9Db250ZXh0OiBhbnkpIHtcblx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdGNvbnN0IHNEZWVwZXN0UGF0aCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwiaW50ZXJuYWxcIikuZ2V0UHJvcGVydHkoXCIvZGVlcGVzdFBhdGhcIiksXG5cdFx0XHRcdHNWaWV3Q29udGV4dFBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cblx0XHRcdGlmICghc0RlZXBlc3RQYXRoIHx8IHNEZWVwZXN0UGF0aC5pbmRleE9mKHNWaWV3Q29udGV4dFBhdGgpICE9PSAwKSB7XG5cdFx0XHRcdC8vIFRoZXJlIHdhcyBubyBwcmV2aW91cyB2YWx1ZSBmb3IgdGhlIGRlZXBlc3QgcmVhY2hlZCBwYXRoLCBvciB0aGUgcGF0aFxuXHRcdFx0XHQvLyBmb3IgdGhlIHZpZXcgaXNuJ3QgYSBzdWJwYXRoIG9mIHRoZSBwcmV2aW91cyBkZWVwZXN0IHBhdGggLS0+IHVwZGF0ZVxuXHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFwiL2RlZXBlc3RQYXRoXCIsIHNWaWV3Q29udGV4dFBhdGgsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRkaXNwbGF5TWVzc2FnZVBhZ2Uoc0Vycm9yTWVzc2FnZTogYW55LCBtUGFyYW1ldGVyczogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Ly8gVG8gYmUgb3ZlcnJpZGRlblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdHVwZGF0ZVVJU3RhdGVGb3JWaWV3KG9WaWV3OiBhbnksIEZDTExldmVsOiBhbnkpIHtcblx0XHQvLyBUbyBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0Z2V0SW5zdGFuY2VkVmlld3MoKTogWE1MVmlld1tdIHtcblx0XHRyZXR1cm4gW107XG5cdFx0Ly8gVG8gYmUgb3ZlcnJpZGVuXG5cdH1cblx0X3Njcm9sbFRhYmxlc1RvTGFzdE5hdmlnYXRlZEl0ZW1zKCk6IHZvaWQge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0Z2V0QXBwQ29udGVudENvbnRhaW5lcih2aWV3OiBWaWV3KTogTmF2Q29udGFpbmVyIHwgRmxleGlibGVDb2x1bW5MYXlvdXQge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdGNvbnN0IGFwcENvbnRlbnRJZCA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcIi9zYXAudWk1L3JvdXRpbmcvY29uZmlnL2NvbnRyb2xJZFwiKSB8fCBcImFwcENvbnRlbnRcIjtcblx0XHRyZXR1cm4gdmlldy5ieUlkKGFwcENvbnRlbnRJZCkgYXMgTmF2Q29udGFpbmVyIHwgRmxleGlibGVDb2x1bW5MYXlvdXQ7XG5cdH1cbn1cbmludGVyZmFjZSBSb290Vmlld0Jhc2VDb250cm9sbGVyIHtcblx0b25Db250YWluZXJSZWFkeT8oKTogdm9pZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgUm9vdFZpZXdCYXNlQ29udHJvbGxlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBQUM7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFB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