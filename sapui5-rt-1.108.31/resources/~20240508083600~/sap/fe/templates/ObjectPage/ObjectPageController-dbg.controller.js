/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/Manage", "sap/fe/core/controllerextensions/EditFlow", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalEditFlow", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/MessageHandler", "sap/fe/core/controllerextensions/PageReady", "sap/fe/core/controllerextensions/Paginator", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/PageController", "sap/fe/macros/chart/ChartRuntime", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/Utils", "sap/fe/navigation/SelectionVariant", "sap/fe/templates/ObjectPage/ExtensionAPI", "sap/fe/templates/RootContainer/overrides/EditFlow", "sap/fe/templates/TableScroller", "sap/m/InstanceManager", "sap/m/Link", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "./overrides/IntentBasedNavigation", "./overrides/InternalRouting", "./overrides/MessageHandler", "./overrides/Paginator", "./overrides/Share", "./overrides/ViewState"], function (Log, merge, ActionRuntime, CommonUtils, BusyLocker, ActivitySync, Manage, EditFlow, draft, IntentBasedNavigation, InternalEditFlow, InternalIntentBasedNavigation, InternalRouting, MassEdit, MessageHandler, PageReady, Paginator, Placeholder, Share, ViewState, MetaModelConverter, ClassSupport, ModelHelper, PageController, ChartRuntime, CommonHelper, DelegateUtil, TableUtils, SelectionVariant, ExtensionAPI, EditFlowOverrides, TableScroller, InstanceManager, Link, MessageBox, Core, OverrideExecution, ODataListBinding, IntentBasedNavigationOverride, InternalRoutingOverride, MessageHandlerOverride, PaginatorOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var showUserDetails = Manage.showUserDetails;
  var openManageDialog = Manage.openManageDialog;
  var isConnected = ActivitySync.isConnected;
  var disconnect = ActivitySync.disconnect;
  var connect = ActivitySync.connect;
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
  function _finallyRethrows(body, finalizer) {
    try {
      var result = body();
    } catch (e) {
      return finalizer(true, e);
    }
    if (result && result.then) {
      return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
    }
    return finalizer(false, result);
  }
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
  var ObjectPageController = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ObjectPageController"), _dec2 = usingExtension(Placeholder), _dec3 = usingExtension(EditFlow), _dec4 = usingExtension(Share.override(ShareOverrides)), _dec5 = usingExtension(InternalEditFlow.override(EditFlowOverrides)), _dec6 = usingExtension(InternalRouting.override(InternalRoutingOverride)), _dec7 = usingExtension(Paginator.override(PaginatorOverride)), _dec8 = usingExtension(MessageHandler.override(MessageHandlerOverride)), _dec9 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec10 = usingExtension(InternalIntentBasedNavigation.override({
    getNavigationMode: function () {
      var bIsStickyEditMode = this.getView().getController().getStickyEditMode && this.getView().getController().getStickyEditMode();
      return bIsStickyEditMode ? "explace" : undefined;
    }
  })), _dec11 = usingExtension(ViewState.override(ViewStateOverrides)), _dec12 = usingExtension(PageReady.override({
    isContextExpected: function () {
      return true;
    }
  })), _dec13 = usingExtension(MassEdit), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ObjectPageController, _PageController);
    function ObjectPageController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call.apply(_PageController, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "placeholder", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editFlow", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_editFlow", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_routing", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "paginator", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pageReady", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor12, _assertThisInitialized(_this));
      _this.handlers = {
        /**
         * Invokes the page primary action on press of Ctrl+Enter.
         *
         * @param oController The page controller
         * @param oView
         * @param oContext Context for which the action is called
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @param [mConditions] Contains the following attributes:
         * @param [mConditions.positiveActionVisible] The visibility of sematic positive action
         * @param [mConditions.positiveActionEnabled] The enablement of semantic positive action
         * @param [mConditions.editActionVisible] The Edit button visibility
         * @param [mConditions.editActionEnabled] The enablement of Edit button
         * @ui5-restricted
         * @final
         */
        onPrimaryAction: function (oController, oView, oContext, sActionName, mParameters, mConditions) {
          var iViewLevel = oController.getView().getViewData().viewLevel,
            oObjectPage = oController._getObjectPageLayoutControl();
          if (mConditions.positiveActionVisible) {
            if (mConditions.positiveActionEnabled) {
              oController.handlers.onCallAction(oView, sActionName, mParameters);
            }
          } else if (mConditions.editActionVisible && iViewLevel === 1) {
            if (mConditions.editActionEnabled) {
              oController._editDocument(oContext);
            }
          } else if (iViewLevel === 1 && oObjectPage.getModel("ui").getProperty("/isEditable")) {
            oController._saveDocument(oContext);
          } else if (oObjectPage.getModel("ui").getProperty("/isEditable")) {
            oController._applyDocument(oContext);
          }
        },
        onTableContextChange: function (oEvent) {
          var _this2 = this;
          var oSource = oEvent.getSource();
          var oTable;
          this._findTables().some(function (_oTable) {
            if (_oTable.getRowBinding() === oSource) {
              oTable = _oTable;
              return true;
            }
            return false;
          });
          var oCurrentActionPromise = this._editFlow.getCurrentActionPromise();
          if (oCurrentActionPromise) {
            var aTableContexts;
            if (oTable.getType().getMetadata().isA("sap.ui.mdc.table.GridTableType")) {
              aTableContexts = oSource.getContexts(0);
            } else {
              aTableContexts = oSource.getCurrentContexts();
            }
            //if contexts are not fully loaded the getcontexts function above will trigger a new change event call
            if (!aTableContexts[0]) {
              return;
            }
            oCurrentActionPromise.then(function (oActionResponse) {
              if (!oActionResponse || oActionResponse.controlId !== oTable.sId) {
                return;
              }
              var oActionData = oActionResponse.oData;
              var aKeys = oActionResponse.keys;
              var iNewItemp = -1;
              aTableContexts.find(function (oTableContext, i) {
                var oTableData = oTableContext.getObject();
                var bCompare = aKeys.every(function (sKey) {
                  return oTableData[sKey] === oActionData[sKey];
                });
                if (bCompare) {
                  iNewItemp = i;
                }
                return bCompare;
              });
              if (iNewItemp !== -1) {
                var aDialogs = InstanceManager.getOpenDialogs();
                var oDialog = aDialogs.length > 0 ? aDialogs.find(function (dialog) {
                  return dialog.data("FullScreenDialog") !== true;
                }) : null;
                if (oDialog) {
                  // by design, a sap.m.dialog set the focus to the previous focused element when closing.
                  // we should wait for the dialog to be close before to focus another element
                  oDialog.attachEventOnce("afterClose", function () {
                    oTable.focusRow(iNewItemp, true);
                  });
                } else {
                  oTable.focusRow(iNewItemp, true);
                }
                _this2._editFlow.deleteCurrentActionPromise();
              }
            }).catch(function (err) {
              Log.error("An error occurs while scrolling to the newly created Item: ".concat(err));
            });
          }
          // fire ModelContextChange on the message button whenever the table context changes
          this.messageButton.fireModelContextChange();
        },
        /**
         * Invokes an action - bound/unbound and sets the page dirty.
         *
         * @param oView
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @returns The action promise
         * @ui5-restricted
         * @final
         */
        onCallAction: function (oView, sActionName, mParameters) {
          var oController = oView.getController();
          return oController.editFlow.invokeAction(sActionName, mParameters).then(oController._showMessagePopover.bind(oController, undefined)).catch(oController._showMessagePopover.bind(oController));
        },
        onDataPointTitlePressed: function (oController, oSource, oManifestOutbound, sControlConfig, sCollectionPath) {
          oManifestOutbound = typeof oManifestOutbound === "string" ? JSON.parse(oManifestOutbound) : oManifestOutbound;
          var oTargetInfo = oManifestOutbound[sControlConfig],
            aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oTargetInfo),
            oDataPointOrChartBindingContext = oSource.getBindingContext(),
            sMetaPath = oDataPointOrChartBindingContext.getModel().getMetaModel().getMetaPath(oDataPointOrChartBindingContext.getPath());
          var aNavigationData = oController._getChartContextData(oDataPointOrChartBindingContext, sCollectionPath);
          var additionalNavigationParameters;
          aNavigationData = aNavigationData.map(function (oNavigationData) {
            return {
              data: oNavigationData,
              metaPath: sMetaPath + (sCollectionPath ? "/".concat(sCollectionPath) : "")
            };
          });
          if (oTargetInfo && oTargetInfo.parameters) {
            var oParams = oTargetInfo.parameters && oController._intentBasedNavigation.getOutboundParams(oTargetInfo.parameters);
            if (Object.keys(oParams).length > 0) {
              additionalNavigationParameters = oParams;
            }
          }
          if (oTargetInfo && oTargetInfo.semanticObject && oTargetInfo.action) {
            oController._intentBasedNavigation.navigate(oTargetInfo.semanticObject, oTargetInfo.action, {
              navigationContexts: aNavigationData,
              semanticObjectMapping: aSemanticObjectMapping,
              additionalNavigationParameters: additionalNavigationParameters
            });
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound: function (oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onNavigateChange: function (oEvent) {
          //will be called always when we click on a section tab
          this.getExtensionAPI().updateAppState();
          this.bSectionNavigated = true;
          var oInternalModelContext = this.getView().getBindingContext("internal");
          var oObjectPage = this._getObjectPageLayoutControl();
          if (oObjectPage.getModel("ui").getProperty("/isEditable") && this.getView().getViewData().sectionLayout === "Tabs" && oInternalModelContext.getProperty("errorNavigationSectionFlag") === false) {
            var oSubSection = oEvent.getParameter("subSection");
            this._updateFocusInEditMode([oSubSection]);
          }
        },
        onVariantSelected: function () {
          this.getExtensionAPI().updateAppState();
        },
        onVariantSaved: function () {
          var _this3 = this;
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save
          setTimeout(function () {
            _this3.getExtensionAPI().updateAppState();
          }, 500);
        },
        navigateToSubSection: function (oController, vDetailConfig) {
          var oDetailConfig = typeof vDetailConfig === "string" ? JSON.parse(vDetailConfig) : vDetailConfig;
          var oObjectPage = oController.getView().byId("fe::ObjectPage");
          var oSection;
          var oSubSection;
          if (oDetailConfig.sectionId) {
            oSection = oController.getView().byId(oDetailConfig.sectionId);
            oSubSection = oDetailConfig.subSectionId ? oController.getView().byId(oDetailConfig.subSectionId) : oSection && oSection.getSubSections() && oSection.getSubSections()[0];
          } else if (oDetailConfig.subSectionId) {
            oSubSection = oController.getView().byId(oDetailConfig.subSectionId);
            oSection = oSubSection && oSubSection.getParent();
          }
          if (!oSection || !oSubSection || !oSection.getVisible() || !oSubSection.getVisible()) {
            oController.getView().getModel("sap.fe.i18n").getResourceBundle().then(function (oResourceBundle) {
              var sTitle = CommonUtils.getTranslatedText("C_ROUTING_NAVIGATION_DISABLED_TITLE", oResourceBundle, null, oController.getView().getViewData().entitySet);
              Log.error(sTitle);
              MessageBox.error(sTitle);
            }).catch(function (error) {
              Log.error(error);
            });
          } else {
            oObjectPage.scrollToSection(oSubSection.getId());
            // trigger iapp state change
            oObjectPage.fireNavigate({
              section: oSection,
              subSection: oSubSection
            });
          }
        },
        onChartSelectionChanged: function (oEvent) {
          ChartRuntime.fnUpdateChart(oEvent);
        },
        onStateChange: function () {
          this.getExtensionAPI().updateAppState();
        }
      };
      return _this;
    }
    var _proto = ObjectPageController.prototype;
    _proto.getExtensionAPI = function getExtensionAPI(sId) {
      if (sId) {
        // to allow local ID usage for custom pages we'll create/return own instances for custom sections
        this.mCustomSectionExtensionAPIs = this.mCustomSectionExtensionAPIs || {};
        if (!this.mCustomSectionExtensionAPIs[sId]) {
          this.mCustomSectionExtensionAPIs[sId] = new ExtensionAPI(this, sId);
        }
        return this.mCustomSectionExtensionAPIs[sId];
      } else {
        if (!this.extensionAPI) {
          this.extensionAPI = new ExtensionAPI(this);
        }
        return this.extensionAPI;
      }
    };
    _proto.onInit = function onInit() {
      _PageController.prototype.onInit.call(this);
      var oObjectPage = this._getObjectPageLayoutControl();

      // Setting defaults of internal model context
      var oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("externalNavigationContext", {
        "page": true
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("relatedApps", {
        visibility: false,
        items: null
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("batchGroups", this._getBatchGroupsForView());
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      if (!this.getView().getViewData().useNewLazyLoading && oObjectPage.getEnableLazyLoading()) {
        //Attaching the event to make the subsection context binding active when it is visible.
        oObjectPage.attachEvent("subSectionEnteredViewPort", this._handleSubSectionEnteredViewPort.bind(this));
      }
      this.messageButton = this.getView().byId("fe::FooterBar::MessageButton");
      this.messageButton.oItemBinding.attachChange(this._fnShowOPMessage, this);
    };
    _proto.onExit = function onExit() {
      if (this.mCustomSectionExtensionAPIs) {
        for (var _i = 0, _Object$keys = Object.keys(this.mCustomSectionExtensionAPIs); _i < _Object$keys.length; _i++) {
          var sId = _Object$keys[_i];
          if (this.mCustomSectionExtensionAPIs[sId]) {
            this.mCustomSectionExtensionAPIs[sId].destroy();
          }
        }
        delete this.mCustomSectionExtensionAPIs;
      }
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
      var oMessagePopover = this.messageButton ? this.messageButton.oMessagePopover : null;
      if (oMessagePopover && oMessagePopover.isOpen()) {
        oMessagePopover.close();
      }
      //when exiting we set keepAlive context to false
      var oContext = this.getView().getBindingContext();
      if (oContext && oContext.isKeepAlive()) {
        oContext.setKeepAlive(false);
      }
      if (isConnected(this.getView())) {
        disconnect(this.getView()); // Cleanup collaboration connection when leaving the app
      }
    }

    /**
     * Method to show the message strip on the object page.
     *
     * @private
     */;
    _proto._fnShowOPMessage = function _fnShowOPMessage() {
      var extensionAPI = this.getExtensionAPI();
      var view = this.getView();
      var messages = this.messageButton.oMessagePopover.getItems().map(function (item) {
        return item.getBindingContext("message").getObject();
      }).filter(function (message) {
        var _view$getBindingConte;
        return message.getTargets()[0] === ((_view$getBindingConte = view.getBindingContext()) === null || _view$getBindingConte === void 0 ? void 0 : _view$getBindingConte.getPath());
      });
      if (extensionAPI) {
        extensionAPI.showMessages(messages);
      }
    };
    _proto._getTableBinding = function _getTableBinding(oTable) {
      return oTable && oTable.getRowBinding();
    }

    /**
     * Find the last visible subsection and add the sapUxAPObjectPageSubSectionFitContainer CSS class if it contains only a gridTable.
     *
     * @param subSections The sub sections to look for
     * @private
     */;
    _proto.checkSectionsForGridTable = function checkSectionsForGridTable(subSections) {
      var _this4 = this;
      var changeClassForTables = function (event, lastVisibleSubSection) {
        var _this4$searchTableInB, _this4$searchTableInB2;
        var blocks = [].concat(_toConsumableArray(lastVisibleSubSection.getBlocks()), _toConsumableArray(lastVisibleSubSection.getMoreBlocks()));
        if (blocks.length === 1 && (_this4$searchTableInB = _this4.searchTableInBlock(blocks[0])) !== null && _this4$searchTableInB !== void 0 && (_this4$searchTableInB2 = _this4$searchTableInB.getType()) !== null && _this4$searchTableInB2 !== void 0 && _this4$searchTableInB2.isA("sap.ui.mdc.table.GridTableType")) {
          //In case there is only a single table in a subSection we fit that to the whole page so that the scrollbar comes only on table and not on page
          lastVisibleSubSection.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
          lastVisibleSubSection.detachEvent("modelContextChange", changeClassForTables, _this4);
        }
      };
      for (var subSectionIndex = subSections.length - 1; subSectionIndex >= 0; subSectionIndex--) {
        if (subSections[subSectionIndex].getVisible()) {
          var lastVisibleSubSection = subSections[subSectionIndex];
          // We need to attach this event in order to manage the Object Page Lazy Loading mechanism
          lastVisibleSubSection.attachEvent("modelContextChange", lastVisibleSubSection, changeClassForTables, this);
          break;
        }
      }
    }

    /**
     * Find a table in blocks of section.
     *
     * @param block One sub section block
     * @returns Table if exists
     */;
    _proto.searchTableInBlock = function searchTableInBlock(block) {
      var control = block.content;
      var tableAPI;
      if (block.isA("sap.fe.templates.ObjectPage.controls.SubSectionBlock")) {
        // The table may currently be shown in a full screen dialog, we can then get the reference to the TableAPI
        // control from the custom data of the place holder panel
        if (control.isA("sap.m.Panel") && control.data("FullScreenTablePlaceHolder")) {
          tableAPI = control.data("tableAPIreference");
        } else if (control.isA("sap.fe.macros.table.TableAPI")) {
          tableAPI = control;
        }
        if (tableAPI) {
          return tableAPI.content;
        }
      }
      return undefined;
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      var _this$oView$oViewData;
      PageController.prototype.onBeforeRendering.apply(this);
      // In the retrieveTextFromValueList scenario we need to ensure in case of reload/refresh that the meta model in the methode retrieveTextFromValueList of the FieldRuntime is available
      if ((_this$oView$oViewData = this.oView.oViewData) !== null && _this$oView$oViewData !== void 0 && _this$oView$oViewData.retrieveTextFromValueList && CommonHelper.getMetaModel() === undefined) {
        CommonHelper.setMetaModel(this.getAppComponent().getMetaModel());
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      var _this5 = this;
      this.getView().getModel("sap.fe.i18n").getResourceBundle().then(function (response) {
        _this5.oResourceBundle = response;
      }).catch(function (oError) {
        Log.error("Error while retrieving the resource bundle", oError);
      });
      var subSections;
      if (this._getObjectPageLayoutControl().getUseIconTabBar()) {
        var sections = this._getObjectPageLayoutControl().getSections();
        var _iterator = _createForOfIteratorHelper(sections),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var section = _step.value;
            subSections = section.getSubSections();
            this.checkSectionsForGridTable(subSections);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } else {
        subSections = this._getAllSubSections();
        this.checkSectionsForGridTable(subSections);
      }
    };
    _proto._onBeforeBinding = function _onBeforeBinding(oContext, mParameters) {
      var _this6 = this;
      // TODO: we should check how this comes together with the transaction helper, same to the change in the afterBinding
      var aTables = this._findTables(),
        oObjectPage = this._getObjectPageLayoutControl(),
        oInternalModelContext = this.getView().getBindingContext("internal"),
        oInternalModel = this.getView().getModel("internal"),
        aBatchGroups = oInternalModelContext.getProperty("batchGroups"),
        iViewLevel = this.getView().getViewData().viewLevel;
      var oFastCreationRow;
      aBatchGroups.push("$auto");
      if (mParameters.bDraftNavigation !== true) {
        this._closeSideContent();
      }
      var opContext = oObjectPage.getBindingContext();
      if (opContext && opContext.hasPendingChanges() && !aBatchGroups.some(opContext.getModel().hasPendingChanges.bind(opContext.getModel()))) {
        /* 	In case there are pending changes for the creation row and no others we need to reset the changes
         						TODO: this is just a quick solution, this needs to be reworked
         				 	*/

        opContext.getBinding().resetChanges();
      }

      // For now we have to set the binding context to null for every fast creation row
      // TODO: Get rid of this coding or move it to another layer - to be discussed with MDC and model
      for (var i = 0; i < aTables.length; i++) {
        oFastCreationRow = aTables[i].getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      }

      // Scroll to present Section so that bindings are enabled during navigation through paginator buttons, as there is no view rerendering/rebind
      var fnScrollToPresentSection = function () {
        if (!oObjectPage.isFirstRendering() && !mParameters.bPersistOPScroll) {
          oObjectPage.setSelectedSection(null);
        }
      };
      oObjectPage.attachEventOnce("modelContextChange", fnScrollToPresentSection);

      // if the structure of the ObjectPageLayout is changed then scroll to present Section
      // FIXME Is this really working as intended ? Initially this was onBeforeRendering, but never triggered onBeforeRendering because it was registered after it
      var oDelegateOnBefore = {
        onAfterRendering: fnScrollToPresentSection
      };
      oObjectPage.addEventDelegate(oDelegateOnBefore, this);
      this.pageReady.attachEventOnce("pageReady", function () {
        oObjectPage.removeEventDelegate(oDelegateOnBefore);
      });

      //Set the Binding for Paginators using ListBinding ID
      if (iViewLevel > 1) {
        var oBinding = mParameters && mParameters.listBinding;
        var oPaginatorCurrentContext = oInternalModel.getProperty("/paginatorCurrentContext");
        if (oPaginatorCurrentContext) {
          var oBindingToUse = oPaginatorCurrentContext.getBinding();
          this.paginator.initialize(oBindingToUse, oPaginatorCurrentContext);
          oInternalModel.setProperty("/paginatorCurrentContext", null);
        } else if (oBinding) {
          if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
            this.paginator.initialize(oBinding, oContext);
          } else {
            // if the binding type is not ODataListBinding because of a deeplink navigation or a refresh of the page
            // we need to create it
            var sBindingPath = oBinding.getPath();
            if (/\([^\)]*\)$/.test(sBindingPath)) {
              // The current binding path ends with (xxx), so we create the listBinding by removing (xxx)
              var sListBindingPath = sBindingPath.replace(/\([^\)]*\)$/, "");
              oBinding = new ODataListBinding(oBinding.oModel, sListBindingPath);
              var _setListBindingAsync = function () {
                if (oBinding.getContexts().length > 0) {
                  _this6.paginator.initialize(oBinding, oContext);
                  oBinding.detachEvent("change", _setListBindingAsync);
                }
              };
              oBinding.getContexts(0);
              oBinding.attachEvent("change", _setListBindingAsync);
            } else {
              // The current binding doesn't end with (xxx) --> the last segment is a 1-1 navigation, so we don't display the paginator
              this.paginator.initialize(undefined);
            }
          }
        }
      }
      if (!this.getView().getViewData().useNewLazyLoading && oObjectPage.getEnableLazyLoading()) {
        var aSections = oObjectPage.getSections();
        var bUseIconTabBar = oObjectPage.getUseIconTabBar();
        var iSkip = 2;
        var bIsInEditMode = oObjectPage.getModel("ui").getProperty("/isEditable");
        var bEditableHeader = this.getView().getViewData().editableHeaderContent;
        for (var iSection = 0; iSection < aSections.length; iSection++) {
          var oSection = aSections[iSection];
          var aSubSections = oSection.getSubSections();
          for (var iSubSection = 0; iSubSection < aSubSections.length; iSubSection++, iSkip--) {
            // In IconTabBar mode keep the second section bound if there is an editable header and we are switching to display mode
            if (iSkip < 1 || bUseIconTabBar && (iSection > 1 || iSection === 1 && !bEditableHeader && !bIsInEditMode)) {
              var oSubSection = aSubSections[iSubSection];
              if (oSubSection.data().isVisibilityDynamic !== "true") {
                oSubSection.setBindingContext(null);
              }
            }
          }
        }
      }
      if (this.placeholder.isPlaceholderEnabled() && mParameters.showPlaceholder) {
        var oView = this.getView();
        var oNavContainer = oView.getParent().oContainer.getParent();
        if (oNavContainer) {
          oNavContainer.showPlaceholder({});
        }
      }
    };
    _proto._getFirstClickableElement = function _getFirstClickableElement(oObjectPage) {
      var oFirstClickableElement;
      var aActions = oObjectPage.getHeaderTitle() && oObjectPage.getHeaderTitle().getActions();
      if (aActions && aActions.length) {
        oFirstClickableElement = aActions.find(function (oAction) {
          // Due to the left alignment of the Draft switch and the collaborative draft avatar controls
          // there is a ToolbarSpacer in the actions aggregation which we need to exclude here!
          // Due to the ACC report, we also need not to check for the InvisibleText elements
          if (oAction.isA("sap.fe.macros.share.ShareAPI")) {
            // since ShareAPI does not have a disable property
            // hence there is no need to check if it is disbaled or not
            return oAction.getVisible();
          } else if (!oAction.isA("sap.ui.core.InvisibleText") && !oAction.isA("sap.m.ToolbarSpacer")) {
            return oAction.getVisible() && oAction.getEnabled();
          }
        });
      }
      return oFirstClickableElement;
    };
    _proto._getFirstEmptyMandatoryFieldFromSubSection = function _getFirstEmptyMandatoryFieldFromSubSection(aSubSections) {
      if (aSubSections) {
        for (var subSection = 0; subSection < aSubSections.length; subSection++) {
          var aBlocks = aSubSections[subSection].getBlocks();
          if (aBlocks) {
            for (var block = 0; block < aBlocks.length; block++) {
              var aFormContainers = void 0;
              if (aBlocks[block].isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getFormContainers();
              } else if (aBlocks[block].getContent && aBlocks[block].getContent() && aBlocks[block].getContent().isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getContent().getFormContainers();
              }
              if (aFormContainers) {
                for (var formContainer = 0; formContainer < aFormContainers.length; formContainer++) {
                  var aFormElements = aFormContainers[formContainer].getFormElements();
                  if (aFormElements) {
                    for (var formElement = 0; formElement < aFormElements.length; formElement++) {
                      var aFields = aFormElements[formElement].getFields();

                      // The first field is not necessarily an InputBase (e.g. could be a Text)
                      // So we need to check whether it has a getRequired method
                      try {
                        if (aFields[0].getRequired && aFields[0].getRequired() && !aFields[0].getValue()) {
                          return aFields[0];
                        }
                      } catch (error) {
                        Log.debug("Error when searching for mandaotry empty field: ".concat(error));
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return undefined;
    };
    _proto._updateFocusInEditMode = function _updateFocusInEditMode(aSubSections) {
      var oObjectPage = this._getObjectPageLayoutControl();
      var oMandatoryField = this._getFirstEmptyMandatoryFieldFromSubSection(aSubSections);
      var oFieldToFocus;
      if (oMandatoryField) {
        oFieldToFocus = oMandatoryField.content.getContentEdit()[0];
      } else {
        oFieldToFocus = oObjectPage._getFirstEditableInput() || this._getFirstClickableElement(oObjectPage);
      }
      if (oFieldToFocus) {
        setTimeout(function () {
          // We set the focus in a timeeout, otherwise the focus sometimes goes to the TabBar
          oFieldToFocus.focus();
        }, 0);
      }
    };
    _proto._handleSubSectionEnteredViewPort = function _handleSubSectionEnteredViewPort(oEvent) {
      var oSubSection = oEvent.getParameter("subSection");
      oSubSection.setBindingContext(undefined);
    };
    _proto._onBackNavigationInDraft = function _onBackNavigationInDraft(oContext) {
      this.messageHandler.removeTransitionMessages();
      if (this.getAppComponent().getRouterProxy().checkIfBackHasSameContext()) {
        // Back nav will keep the same context --> no need to display the dialog
        history.back();
      } else {
        draft.processDataLossOrDraftDiscardConfirmation(function () {
          history.back();
        }, Function.prototype, oContext, this, false, draft.NavigationType.BackNavigation);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto._onAfterBinding = function _onAfterBinding(oBindingContext, mParameters) {
      var _this7 = this;
      // TODO: this should be moved into an init event of the MDC tables (not yet existing) and should be part
      // of any controller extension
      /**
       * @param oTable
       * @param oListBinding
       */
      var enableFastCreationRow = function (oTable, oListBinding) {
        try {
          var oFastCreationRow = oTable.getCreationRow();
          var oFastCreationListBinding, oFastCreationContext;
          var _temp5 = function () {
            if (oFastCreationRow) {
              var _temp6 = _catch(function () {
                return Promise.resolve(oFinalUIState).then(function () {
                  var _temp2 = function () {
                    if (oFastCreationRow.getModel("ui").getProperty("/isEditable")) {
                      oFastCreationListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
                        $$updateGroupId: "doNotSubmit",
                        $$groupId: "doNotSubmit"
                      });
                      // Workaround suggested by OData model v4 colleagues
                      oFastCreationListBinding.refreshInternal = function () {
                        /* do nothing */
                      };
                      oFastCreationContext = oFastCreationListBinding.create();
                      oFastCreationRow.setBindingContext(oFastCreationContext);

                      // this is needed to avoid console error
                      var _temp7 = _catch(function () {
                        return Promise.resolve(oFastCreationContext.created()).then(function () {});
                      }, function () {
                        Log.trace("transient fast creation context deleted");
                      });
                      if (_temp7 && _temp7.then) return _temp7.then(function () {});
                    }
                  }();
                  if (_temp2 && _temp2.then) return _temp2.then(function () {});
                });
              }, function (oError) {
                Log.error("Error while computing the final UI state", oError);
              });
              if (_temp6 && _temp6.then) return _temp6.then(function () {});
            }
          }();
          return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      }; // this should not be needed at the all
      /**
       * @param oTable
       */
      var oObjectPage = this._getObjectPageLayoutControl();
      var aTables = this._findTables();
      this._sideEffects.clearPropertiesStatus();

      // TODO: this is only a temp solution as long as the model fix the cache issue and we use this additional
      // binding with ownRequest
      oBindingContext = oObjectPage.getBindingContext();
      var aIBNActions = [];
      oObjectPage.getSections().forEach(function (oSection) {
        oSection.getSubSections().forEach(function (oSubSection) {
          aIBNActions = CommonUtils.getIBNActions(oSubSection, aIBNActions);
        });
      });

      // Assign internal binding contexts to oFormContainer:
      // 1. It is not possible to assign the internal binding context to the XML fragment
      // (FormContainer.fragment.xml) yet - it is used already for the data-structure.
      // 2. Another problem is, that FormContainers assigned to a 'MoreBlock' does not have an
      // internal model context at all.

      aTables.forEach(function (oTable) {
        var oInternalModelContext = oTable.getBindingContext("internal");
        oInternalModelContext.setProperty("creationRowFieldValidity", {});
        oInternalModelContext.setProperty("creationRowCustomValidity", {});
        aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
        // temporary workaround for BCP: 2080218004
        // Need to fix with BLI: FIORITECHP1-15274
        // only for edit mode, we clear the table cache
        // Workaround starts here!!
        var oTableRowBinding = oTable.getRowBinding();
        if (oTableRowBinding) {
          if (ModelHelper.isStickySessionSupported(oTableRowBinding.getModel().getMetaModel())) {
            // apply for both edit and display mode in sticky
            oTableRowBinding.removeCachesAndMessages("");
          }
        }
        // Workaround ends here!!

        // Update 'enabled' property of DataFieldForAction buttons on table toolbar
        // The same is also performed on Table selectionChange event
        var oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
          aSelectedContexts = oTable.getSelectedContexts();
        ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
        // Clear the selection in the table, need to be fixed and review with BLI: FIORITECHP1-24318
        oTable.clearSelection();
      });
      CommonUtils.getSemanticTargetsFromPageModel(this, "_pageModel");
      //Retrieve Object Page header actions from Object Page title control
      var oObjectPageTitle = oObjectPage.getHeaderTitle();
      var aIBNHeaderActions = [];
      aIBNHeaderActions = CommonUtils.getIBNActions(oObjectPageTitle, aIBNHeaderActions);
      aIBNActions = aIBNActions.concat(aIBNHeaderActions);
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
      var oModel, oFinalUIState;
      var handleTableModifications = function (oTable) {
        var oBinding = _this7._getTableBinding(oTable),
          fnHandleTablePatchEvents = function () {
            enableFastCreationRow(oTable, oBinding);
          };
        if (!oBinding) {
          Log.error("Expected binding missing for table: ".concat(oTable.getId()));
          return;
        }
        if (oBinding.oContext) {
          fnHandleTablePatchEvents();
        } else {
          var fnHandleChange = function () {
            if (oBinding.oContext) {
              fnHandleTablePatchEvents();
              oBinding.detachChange(fnHandleChange);
            }
          };
          oBinding.attachChange(fnHandleChange);
        }
      };
      if (oBindingContext) {
        oModel = oBindingContext.getModel();

        // Compute Edit Mode
        oFinalUIState = this._editFlow.computeEditMode(oBindingContext);
        if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel())) {
          oFinalUIState.then(function () {
            if (_this7.getView().getModel("ui").getProperty("/isEditable")) {
              connect(_this7.getView());
            } else if (isConnected(_this7.getView())) {
              disconnect(_this7.getView()); // Cleanup collaboration connection in case we switch to another element (e.g. in FCL)
            }
          }).catch(function (oError) {
            Log.error("Error while waiting for the final UI State", oError);
          });
        }

        // update related apps once Data is received in case of binding cache is not available
        // TODO: this is only a temp solution since we need to call _updateRelatedApps method only after data for Object Page is received (if there is no binding)
        if (oBindingContext.getBinding().oCache) {
          this._updateRelatedApps();
        } else {
          var fnUpdateRelatedApps = function () {
            _this7._updateRelatedApps();
            oBindingContext.getBinding().detachDataReceived(fnUpdateRelatedApps);
          };
          oBindingContext.getBinding().attachDataReceived(fnUpdateRelatedApps);
        }

        //Attach the patch sent and patch completed event to the object page binding so that we can react
        var oBinding = oBindingContext.getBinding && oBindingContext.getBinding() || oBindingContext;

        // Attach the event handler only once to the same binding
        if (this.currentBinding !== oBinding) {
          oBinding.attachEvent("patchSent", this.editFlow.handlePatchSent, this);
          this.currentBinding = oBinding;
        }
        aTables.forEach(function (oTable) {
          // access binding only after table is bound
          TableUtils.whenBound(oTable).then(handleTableModifications).catch(function (oError) {
            Log.error("Error while waiting for the table to be bound", oError);
          });
        });
        if (!this.getView().getViewData().useNewLazyLoading) {
          // should be called only after binding is ready hence calling it in onAfterBinding
          oObjectPage._triggerVisibleSubSectionsEvents();
        }
      }
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      var _this8 = this;
      var setFocus = function () {
        // Set the focus to the first action button, or to the first editable input if in editable mode
        var oObjectPage = _this8._getObjectPageLayoutControl();
        var isInDisplayMode = !oObjectPage.getModel("ui").getProperty("/isEditable");
        if (isInDisplayMode) {
          var oFirstClickableElement = _this8._getFirstClickableElement(oObjectPage);
          if (oFirstClickableElement) {
            oFirstClickableElement.focus();
          }
        } else {
          var oSelectedSection = Core.byId(oObjectPage.getSelectedSection());
          if (oSelectedSection) {
            _this8._updateFocusInEditMode(oSelectedSection.getSubSections());
          }
        }
      };
      // Apply app state only after the page is ready with the first section selected
      var oView = this.getView();
      var oInternalModelContext = oView.getBindingContext("internal");
      var oBindingContext = oView.getBindingContext();
      //Show popup while navigating back from object page in case of draft
      if (oBindingContext) {
        var bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (!bIsStickyMode) {
          var oAppComponent = CommonUtils.getAppComponent(oView);
          oAppComponent.getShellServices().setBackNavigation(function () {
            return _this8._onBackNavigationInDraft(oBindingContext);
          });
        }
      }
      this.getAppComponent().getAppStateHandler().applyAppState().then(function () {
        if (mParameters.forceFocus) {
          setFocus();
        }
      }).catch(function (Error) {
        Log.error("Error while setting the focus", Error);
      });
      oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      this._checkDataPointTitleForExternalNavigation();
    }

    /**
     * Get the status of edit mode for sticky session.
     *
     * @returns The status of edit mode for sticky session
     */;
    _proto.getStickyEditMode = function getStickyEditMode() {
      var oBindingContext = this.getView().getBindingContext && this.getView().getBindingContext();
      var bIsStickyEditMode = false;
      if (oBindingContext) {
        var bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (bIsStickyMode) {
          bIsStickyEditMode = this.getView().getModel("ui").getProperty("/isEditable");
        }
      }
      return bIsStickyEditMode;
    };
    _proto._getObjectPageLayoutControl = function _getObjectPageLayoutControl() {
      return this.byId("fe::ObjectPage");
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      var oObjectPage = this._getObjectPageLayoutControl();
      var oObjectPageSubtitle = oObjectPage.getCustomData().find(function (oCustomData) {
        return oCustomData.getKey() === "ObjectPageSubtitle";
      });
      return {
        title: oObjectPage.data("ObjectPageTitle") || "",
        subtitle: oObjectPageSubtitle && oObjectPageSubtitle.getValue(),
        intent: "",
        icon: ""
      };
    };
    _proto._executeHeaderShortcut = function _executeHeaderShortcut(sId) {
      var sButtonId = "".concat(this.getView().getId(), "--").concat(sId),
        oButton = this._getObjectPageLayoutControl().getHeaderTitle().getActions().find(function (oElement) {
          return oElement.getId() === sButtonId;
        });
      CommonUtils.fireButtonPress(oButton);
    };
    _proto._executeFooterShortcut = function _executeFooterShortcut(sId) {
      var sButtonId = "".concat(this.getView().getId(), "--").concat(sId),
        oButton = this._getObjectPageLayoutControl().getFooter().getContent().find(function (oElement) {
          return oElement.getMetadata().getName() === "sap.m.Button" && oElement.getId() === sButtonId;
        });
      CommonUtils.fireButtonPress(oButton);
    };
    _proto._executeTabShortCut = function _executeTabShortCut(oExecution) {
      var oObjectPage = this._getObjectPageLayoutControl(),
        aSections = oObjectPage.getSections(),
        iSectionIndexMax = aSections.length - 1,
        sCommand = oExecution.oSource.getCommand();
      var newSection,
        iSelectedSectionIndex = oObjectPage.indexOfSection(this.byId(oObjectPage.getSelectedSection()));
      if (iSelectedSectionIndex !== -1 && iSectionIndexMax > 0) {
        if (sCommand === "NextTab") {
          if (iSelectedSectionIndex <= iSectionIndexMax - 1) {
            newSection = aSections[++iSelectedSectionIndex];
          }
        } else if (iSelectedSectionIndex !== 0) {
          // PreviousTab
          newSection = aSections[--iSelectedSectionIndex];
        }
        if (newSection) {
          oObjectPage.setSelectedSection(newSection);
          newSection.focus();
        }
      }
    };
    _proto._getFooterVisibility = function _getFooterVisibility() {
      var oInternalModelContext = this.getView().getBindingContext("internal");
      var sViewId = this.getView().getId();
      oInternalModelContext.setProperty("messageFooterContainsErrors", false);
      sap.ui.getCore().getMessageManager().getMessageModel().getData().forEach(function (oMessage) {
        if (oMessage.validation && oMessage.type === "Error" && oMessage.target.indexOf(sViewId) > -1) {
          oInternalModelContext.setProperty("messageFooterContainsErrors", true);
        }
      });
    };
    _proto._showMessagePopover = function _showMessagePopover(err, oRet) {
      if (err) {
        Log.error(err);
      }
      var rootViewController = this.getAppComponent().getRootViewController();
      var currentPageView = rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : this.getAppComponent().getRootContainer().getCurrentPage();
      if (!currentPageView.isA("sap.m.MessagePage")) {
        var oMessageButton = this.messageButton,
          oMessagePopover = oMessageButton.oMessagePopover,
          oItemBinding = oMessagePopover.getBinding("items");
        if (oItemBinding.getLength() > 0 && !oMessagePopover.isOpen()) {
          oMessageButton.setVisible(true);
          // workaround to ensure that oMessageButton is rendered when openBy is called
          setTimeout(function () {
            oMessagePopover.openBy(oMessageButton);
          }, 0);
        }
      }
      return oRet;
    };
    _proto._editDocument = function _editDocument(oContext) {
      var oModel = this.getView().getModel("ui");
      BusyLocker.lock(oModel);
      return this.editFlow.editDocument.apply(this.editFlow, [oContext]).finally(function () {
        BusyLocker.unlock(oModel);
      });
    }
    /**
     * Gets the context of the DraftRoot path.
     * If a view has been created with the draft Root Path, this method returns its bindingContext.
     * Where no view is found a new created context is returned.
     * The new created context request the key of the entity in order to get the Etag of this entity.
     *
     * @function
     * @name getDraftRootPath
     * @returns Returns a Promise
     */;
    _proto.getDraftRootContext = function getDraftRootContext() {
      try {
        var _exit2 = false;
        var _this10 = this;
        var view = _this10.getView();
        var context = view.getBindingContext();
        var _temp11 = function () {
          if (context) {
            function _temp12(_result) {
              if (_exit2) return _result;
              _exit2 = true;
              return undefined;
            }
            var draftRootContextPath = ModelHelper.getDraftRootPath(context);
            var simpleDraftRootContext;
            var _temp13 = function () {
              if (draftRootContextPath) {
                var _getInstancedViews$fi, _simpleDraftRootConte, _mDataModel$targetEnt;
                // Check if a view matches with the draft root path
                var existingBindingContextOnPage = (_getInstancedViews$fi = _this10.getAppComponent().getRootViewController().getInstancedViews().find(function (pageView) {
                  var _pageView$getBindingC;
                  return ((_pageView$getBindingC = pageView.getBindingContext()) === null || _pageView$getBindingC === void 0 ? void 0 : _pageView$getBindingC.getPath()) === draftRootContextPath;
                })) === null || _getInstancedViews$fi === void 0 ? void 0 : _getInstancedViews$fi.getBindingContext();
                if (existingBindingContextOnPage) {
                  _exit2 = true;
                  return existingBindingContextOnPage;
                }
                var internalModel = view.getModel("internal");
                simpleDraftRootContext = internalModel.getProperty("/simpleDraftRootContext");
                if (((_simpleDraftRootConte = simpleDraftRootContext) === null || _simpleDraftRootConte === void 0 ? void 0 : _simpleDraftRootConte.getPath()) === draftRootContextPath) {
                  _exit2 = true;
                  return simpleDraftRootContext;
                }
                var model = context.getModel();
                var metaModel = model.getMetaModel();
                var sEntityPath = metaModel.getMetaPath(draftRootContextPath);
                var mDataModel = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(sEntityPath));
                simpleDraftRootContext = model.bindContext(draftRootContextPath).getBoundContext();
                return Promise.resolve(simpleDraftRootContext.requestProperty((_mDataModel$targetEnt = mDataModel.targetEntityType.keys[0]) === null || _mDataModel$targetEnt === void 0 ? void 0 : _mDataModel$targetEnt.name)).then(function () {
                  // Store this new created context to use it on the next iterations
                  internalModel.setProperty("/simpleDraftRootContext", simpleDraftRootContext);
                  _exit2 = true;
                  return simpleDraftRootContext;
                });
              }
            }();
            return _temp13 && _temp13.then ? _temp13.then(_temp12) : _temp12(_temp13);
          }
        }();
        return Promise.resolve(_temp11 && _temp11.then ? _temp11.then(function (_result2) {
          return _exit2 ? _result2 : undefined;
        }) : _exit2 ? _temp11 : undefined);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._validateDocument = function _validateDocument() {
      try {
        var _exit4 = false;
        var _this12 = this;
        var control = Core.byId(Core.getCurrentFocusedControlId());
        var context = control === null || control === void 0 ? void 0 : control.getBindingContext();
        var _temp15 = function () {
          if (context && !context.isTransient()) {
            // Wait for the pending changes before starting this validation
            return Promise.resolve(_this12._editFlow.syncTask()).then(function () {
              var appComponent = _this12.getAppComponent();
              var sideEffectsService = appComponent.getSideEffectsService();
              var entityType = sideEffectsService.getEntityTypeFromContext(context);
              var globalSideEffects = entityType ? sideEffectsService.getGlobalODataEntitySideEffects(entityType) : [];
              // If there is at least one global SideEffects for the related entity, execute it/them
              return function () {
                if (globalSideEffects.length) {
                  var _Promise$all2 = Promise.all(globalSideEffects.map(function (sideEffects) {
                    return _this12._sideEffects.requestSideEffects(sideEffects, context);
                  }));
                  _exit4 = true;
                  return _Promise$all2;
                } else {
                  return Promise.resolve(_this12.getDraftRootContext()).then(function (draftRootContext) {
                    if (draftRootContext) {
                      var _draft$executeDraftVa2 = draft.executeDraftValidation(draftRootContext, appComponent);
                      _exit4 = true;
                      return _draft$executeDraftVa2;
                    }
                  }); //Execute the draftValidation if there is no globalSideEffects
                }
              }();
            });
          }
        }();
        return Promise.resolve(_temp15 && _temp15.then ? _temp15.then(function (_result4) {
          return _exit4 ? _result4 : undefined;
        }) : _exit4 ? _temp15 : undefined);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._saveDocument = function _saveDocument(oContext) {
      try {
        var _this14 = this;
        var oModel = _this14.getView().getModel("ui"),
          aWaitCreateDocuments = [];
        // indicates if we are creating a new row in the OP
        var bExecuteSideEffectsOnError = false;
        BusyLocker.lock(oModel);
        _this14._findTables().forEach(function (oTable) {
          var oBinding = _this14._getTableBinding(oTable);
          var mParameters = {
            creationMode: oTable.data("creationMode"),
            creationRow: oTable.getCreationRow(),
            createAtEnd: oTable.data("createAtEnd") === "true"
          };
          var bCreateDocument = mParameters.creationRow && mParameters.creationRow.getBindingContext() && Object.keys(mParameters.creationRow.getBindingContext().getObject()).length > 1;
          if (bCreateDocument) {
            // the bSkipSideEffects is a parameter created when we click the save key. If we press this key
            // we don't execute the handleSideEffects funciton to avoid batch redundancy
            mParameters.bSkipSideEffects = true;
            bExecuteSideEffectsOnError = true;
            aWaitCreateDocuments.push(_this14.editFlow.createDocument(oBinding, mParameters).then(function () {
              return oBinding;
            }));
          }
        });
        return Promise.resolve(_finallyRethrows(function () {
          return Promise.resolve(Promise.all(aWaitCreateDocuments)).then(function (aBindings) {
            var mParameters = {
              bExecuteSideEffectsOnError: bExecuteSideEffectsOnError,
              bindings: aBindings
            };
            // We need to either reject or resolve a promise here and return it since this save
            // function is not only called when pressing the save button in the footer, but also
            // when the user selects create or save in a dataloss popup.
            // The logic of the dataloss popup needs to detect if the save had errors or not in order
            // to decide if the subsequent action - like a back navigation - has to be executed or not.
            return _catch(function () {
              return Promise.resolve(_this14.editFlow.saveDocument(oContext, mParameters)).then(function () {});
            }, function (error) {
              // If the saveDocument in editFlow returns errors we need
              // to show the message popover here and ensure that the
              // dataloss logic does not perform the follow up function
              // like e.g. a back navigation hence we return a promise and reject it
              _this14._showMessagePopover(error);
              throw error;
            });
          });
        }, function (_wasThrown, _result5) {
          if (BusyLocker.isLocked(oModel)) {
            BusyLocker.unlock(oModel);
          }
          if (_wasThrown) throw _result5;
          return _result5;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._manageCollaboration = function _manageCollaboration() {
      openManageDialog(this.getView());
    };
    _proto._showCollaborationUserDetails = function _showCollaborationUserDetails(event) {
      showUserDetails(event, this.getView());
    };
    _proto._cancelDocument = function _cancelDocument(oContext, mParameters) {
      mParameters.cancelButton = this.getView().byId(mParameters.cancelButton); //to get the reference of the cancel button from command execution
      return this.editFlow.cancelDocument(oContext, mParameters);
    };
    _proto._applyDocument = function _applyDocument(oContext) {
      var _this15 = this;
      return this.editFlow.applyDocument(oContext).catch(function () {
        return _this15._showMessagePopover();
      });
    };
    _proto._updateRelatedApps = function _updateRelatedApps() {
      var oObjectPage = this._getObjectPageLayoutControl();
      if (CommonUtils.resolveStringtoBoolean(oObjectPage.data("showRelatedApps"))) {
        CommonUtils.updateRelatedAppsDetails(oObjectPage);
      }
    };
    _proto._findControlInSubSection = function _findControlInSubSection(aParentElement, aSubsection, aControls, bIsChart) {
      for (var element = 0; element < aParentElement.length; element++) {
        var oElement = aParentElement[element].getContent instanceof Function && aParentElement[element].getContent();
        if (bIsChart) {
          if (oElement && oElement.mAggregations && oElement.getAggregation("items")) {
            var aItems = oElement.getAggregation("items");
            aItems.forEach(function (oItem) {
              if (oItem.isA("sap.fe.macros.chart.ChartAPI")) {
                oElement = oItem;
              }
            });
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.layout.DynamicSideContent")) {
          oElement = oElement.getMainContent instanceof Function && oElement.getMainContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.table.TableAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Table")) {
          aControls.push(oElement);
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.chart.ChartAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Chart")) {
          aControls.push(oElement);
        }
      }
    };
    _proto._getAllSubSections = function _getAllSubSections() {
      var oObjectPage = this._getObjectPageLayoutControl();
      var aSubSections = [];
      oObjectPage.getSections().forEach(function (oSection) {
        aSubSections = aSubSections.concat(oSection.getSubSections());
      });
      return aSubSections;
    };
    _proto._getAllBlocks = function _getAllBlocks() {
      var aBlocks = [];
      this._getAllSubSections().forEach(function (oSubSection) {
        aBlocks = aBlocks.concat(oSubSection.getBlocks());
      });
      return aBlocks;
    };
    _proto._findTables = function _findTables() {
      var aSubSections = this._getAllSubSections();
      var aTables = [];
      for (var subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aTables);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aTables);
      }
      return aTables;
    };
    _proto._findCharts = function _findCharts() {
      var aSubSections = this._getAllSubSections();
      var aCharts = [];
      for (var subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aCharts, true);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aCharts, true);
      }
      return aCharts;
    };
    _proto._closeSideContent = function _closeSideContent() {
      this._getAllBlocks().forEach(function (oBlock) {
        var oContent = oBlock.getContent instanceof Function && oBlock.getContent();
        if (oContent && oContent.isA && oContent.isA("sap.ui.layout.DynamicSideContent")) {
          if (oContent.setShowSideContent instanceof Function) {
            oContent.setShowSideContent(false);
          }
        }
      });
    }

    /**
     * Chart Context is resolved for 1:n microcharts.
     *
     * @param oChartContext The Context of the MicroChart
     * @param sChartPath The collectionPath of the the chart
     * @returns Array of Attributes of the chart Context
     */;
    _proto._getChartContextData = function _getChartContextData(oChartContext, sChartPath) {
      var oContextData = oChartContext.getObject();
      var oChartContextData = [oContextData];
      if (oChartContext && sChartPath) {
        if (oContextData[sChartPath]) {
          oChartContextData = oContextData[sChartPath];
          delete oContextData[sChartPath];
          oChartContextData.push(oContextData);
        }
      }
      return oChartContextData;
    }

    /**
     * Scroll the tables to the row with the sPath
     *
     * @function
     * @name sap.fe.templates.ObjectPage.ObjectPageController.controller#_scrollTablesToRow
     * @param {string} sRowPath 'sPath of the table row'
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      if (this._findTables && this._findTables().length > 0) {
        var aTables = this._findTables();
        for (var i = 0; i < aTables.length; i++) {
          TableScroller.scrollTableToRow(aTables[i], sRowPath);
        }
      }
    }

    /**
     * Method to merge selected contexts and filters.
     *
     * @function
     * @name _mergeMultipleContexts
     * @param oPageContext Page context
     * @param aLineContext Selected Contexts
     * @param sChartPath Collection name of the chart
     * @returns Selection Variant Object
     */;
    _proto._mergeMultipleContexts = function _mergeMultipleContexts(oPageContext, aLineContext, sChartPath) {
      var _this16 = this;
      var aAttributes = [],
        aPageAttributes = [],
        oContext,
        sMetaPathLine,
        sPathLine;
      var sPagePath = oPageContext.getPath();
      var oMetaModel = oPageContext && oPageContext.getModel() && oPageContext.getModel().getMetaModel();
      var sMetaPathPage = oMetaModel && oMetaModel.getMetaPath(sPagePath).replace(/^\/*/, "");

      // Get single line context if necessary
      if (aLineContext && aLineContext.length) {
        oContext = aLineContext[0];
        sPathLine = oContext.getPath();
        sMetaPathLine = oMetaModel && oMetaModel.getMetaPath(sPathLine).replace(/^\/*/, "");
        aLineContext.forEach(function (oSingleContext) {
          if (sChartPath) {
            var oChartContextData = _this16._getChartContextData(oSingleContext, sChartPath);
            if (oChartContextData) {
              aAttributes = oChartContextData.map(function (oSubChartContextData) {
                return {
                  contextData: oSubChartContextData,
                  entitySet: "".concat(sMetaPathPage, "/").concat(sChartPath)
                };
              });
            }
          } else {
            aAttributes.push({
              contextData: oSingleContext.getObject(),
              entitySet: sMetaPathLine
            });
          }
        });
      }
      aPageAttributes.push({
        contextData: oPageContext.getObject(),
        entitySet: sMetaPathPage
      });
      // Adding Page Context to selection variant
      aPageAttributes = CommonUtils.removeSensitiveData(aPageAttributes, oMetaModel);
      var oPageLevelSV = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), aPageAttributes, this.getView());
      aAttributes = CommonUtils.removeSensitiveData(aAttributes, oMetaModel);
      return {
        selectionVariant: oPageLevelSV,
        attributes: aAttributes
      };
    };
    _proto._getBatchGroupsForView = function _getBatchGroupsForView() {
      var oViewData = this.getView().getViewData(),
        oConfigurations = oViewData.controlConfiguration,
        aConfigurations = oConfigurations && Object.keys(oConfigurations),
        aBatchGroups = ["$auto.Heroes", "$auto.Decoration", "$auto.Workers"];
      if (aConfigurations && aConfigurations.length > 0) {
        aConfigurations.forEach(function (sKey) {
          var oConfiguration = oConfigurations[sKey];
          if (oConfiguration.requestGroupId === "LongRunners") {
            aBatchGroups.push("$auto.LongRunners");
          }
        });
      }
      return aBatchGroups;
    }

    /*
     * Reset Breadcrumb links
     *
     * @function
     * @param {sap.m.Breadcrumbs} [oSource] parent control
     * @description Used when context of the object page changes.
     *              This event callback is attached to modelContextChange
     *              event of the Breadcrumb control to catch context change.
     *              Then element binding and hrefs are updated for each link.
     *
     * @ui5-restricted
     * @experimental
     */;
    _proto._setBreadcrumbLinks = function _setBreadcrumbLinks(oSource) {
      try {
        var _sNewPath$split;
        var _this18 = this;
        var oContext = oSource.getBindingContext(),
          oAppComponent = _this18.getAppComponent(),
          aPromises = [],
          aSkipParameterized = [],
          sNewPath = oContext === null || oContext === void 0 ? void 0 : oContext.getPath(),
          aPathParts = (_sNewPath$split = sNewPath === null || sNewPath === void 0 ? void 0 : sNewPath.split("/")) !== null && _sNewPath$split !== void 0 ? _sNewPath$split : [],
          oMetaModel = oAppComponent && oAppComponent.getMetaModel();
        var sPath = "";
        var _temp17 = _catch(function () {
          aPathParts.shift();
          aPathParts.splice(-1, 1);
          aPathParts.forEach(function (sPathPart) {
            sPath += "/".concat(sPathPart);
            var oRootViewController = oAppComponent.getRootViewController();
            var sParameterPath = oMetaModel.getMetaPath(sPath);
            var bResultContext = oMetaModel.getObject("".concat(sParameterPath, "/@com.sap.vocabularies.Common.v1.ResultContext"));
            if (bResultContext) {
              // We dont need to create a breadcrumb for Parameter path
              aSkipParameterized.push(1);
              return;
            } else {
              aSkipParameterized.push(0);
            }
            aPromises.push(oRootViewController.getTitleInfoFromPath(sPath));
          });
          return Promise.resolve(Promise.all(aPromises)).then(function (titleHierarchyInfos) {
            var idx, hierarchyPosition, oLink;
            var _iterator2 = _createForOfIteratorHelper(titleHierarchyInfos),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var titleHierarchyInfo = _step2.value;
                hierarchyPosition = titleHierarchyInfos.indexOf(titleHierarchyInfo);
                idx = hierarchyPosition - aSkipParameterized[hierarchyPosition];
                oLink = oSource.getLinks()[idx] ? oSource.getLinks()[idx] : new Link();
                //sCurrentEntity is a fallback value in case of empty title
                oLink.setText(titleHierarchyInfo.subtitle || titleHierarchyInfo.title);
                //We apply an additional encodeURI in case of special characters (ie "/") used in the url through the semantic keys
                oLink.setHref(encodeURI(titleHierarchyInfo.intent));
                if (!oSource.getLinks()[idx]) {
                  oSource.addLink(oLink);
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          });
        }, function (error) {
          Log.error("Error while setting the breadcrumb links:" + error);
        });
        return Promise.resolve(_temp17 && _temp17.then ? _temp17.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._checkDataPointTitleForExternalNavigation = function _checkDataPointTitleForExternalNavigation() {
      var oView = this.getView();
      var oInternalModelContext = oView.getBindingContext("internal");
      var oDataPoints = CommonUtils.getHeaderFacetItemConfigForExternalNavigation(oView.getViewData(), this.getAppComponent().getRoutingService().getOutbounds());
      var oShellServices = this.getAppComponent().getShellServices();
      var oPageContext = oView && oView.getBindingContext();
      oInternalModelContext.setProperty("isHeaderDPLinkVisible", {});
      if (oPageContext) {
        oPageContext.requestObject().then(function (oData) {
          fnGetLinks(oDataPoints, oData);
        }).catch(function (oError) {
          Log.error("Cannot retrieve the links from the shell service", oError);
        });
      }

      /**
       * @param oError
       */
      function fnOnError(oError) {
        Log.error(oError);
      }
      function fnSetLinkEnablement(id, aSupportedLinks) {
        var sLinkId = id;
        // process viable links from getLinks for all datapoints having outbound
        if (aSupportedLinks && aSupportedLinks.length === 1 && aSupportedLinks[0].supported) {
          oInternalModelContext.setProperty("isHeaderDPLinkVisible/".concat(sLinkId), true);
        }
      }

      /**
       * @param oSubDataPoints
       * @param oPageData
       */
      function fnGetLinks(oSubDataPoints, oPageData) {
        var _loop = function (sId) {
          var oDataPoint = oSubDataPoints[sId];
          var oParams = {};
          var oLink = oView.byId(sId);
          if (!oLink) {
            // for data points configured in app descriptor but not annotated in the header
            return "continue";
          }
          var oLinkContext = oLink.getBindingContext();
          var oLinkData = oLinkContext && oLinkContext.getObject();
          var oMixedContext = merge({}, oPageData, oLinkData);
          // process semantic object mappings
          if (oDataPoint.semanticObjectMapping) {
            var aSemanticObjectMapping = oDataPoint.semanticObjectMapping;
            for (var item in aSemanticObjectMapping) {
              var oMapping = aSemanticObjectMapping[item];
              var sMainProperty = oMapping["LocalProperty"]["$PropertyPath"];
              var sMappedProperty = oMapping["SemanticObjectProperty"];
              if (sMainProperty !== sMappedProperty) {
                if (oMixedContext.hasOwnProperty(sMainProperty)) {
                  var oNewMapping = {};
                  oNewMapping[sMappedProperty] = oMixedContext[sMainProperty];
                  oMixedContext = merge({}, oMixedContext, oNewMapping);
                  delete oMixedContext[sMainProperty];
                }
              }
            }
          }
          if (oMixedContext) {
            for (var sKey in oMixedContext) {
              if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
                oParams[sKey] = oMixedContext[sKey];
              }
            }
          }
          // validate if a link must be rendered
          oShellServices.isNavigationSupported([{
            target: {
              semanticObject: oDataPoint.semanticObject,
              action: oDataPoint.action
            },
            params: oParams
          }]).then(function (aLinks) {
            return fnSetLinkEnablement(sId, aLinks);
          }).catch(fnOnError);
        };
        for (var sId in oSubDataPoints) {
          var _ret = _loop(sId);
          if (_ret === "continue") continue;
        }
      }
    };
    return ObjectPageController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "editFlow", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "_editFlow", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "paginator", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "pageReady", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype)), _class2)) || _class);
  return ObjectPageController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiZmluYWxpemVyIiwiYmluZCIsIk9iamVjdFBhZ2VDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlBsYWNlaG9sZGVyIiwiRWRpdEZsb3ciLCJTaGFyZSIsIm92ZXJyaWRlIiwiU2hhcmVPdmVycmlkZXMiLCJJbnRlcm5hbEVkaXRGbG93IiwiRWRpdEZsb3dPdmVycmlkZXMiLCJJbnRlcm5hbFJvdXRpbmciLCJJbnRlcm5hbFJvdXRpbmdPdmVycmlkZSIsIlBhZ2luYXRvciIsIlBhZ2luYXRvck92ZXJyaWRlIiwiTWVzc2FnZUhhbmRsZXIiLCJNZXNzYWdlSGFuZGxlck92ZXJyaWRlIiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uT3ZlcnJpZGUiLCJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldE5hdmlnYXRpb25Nb2RlIiwiYklzU3RpY2t5RWRpdE1vZGUiLCJnZXRWaWV3IiwiZ2V0Q29udHJvbGxlciIsImdldFN0aWNreUVkaXRNb2RlIiwidW5kZWZpbmVkIiwiVmlld1N0YXRlIiwiVmlld1N0YXRlT3ZlcnJpZGVzIiwiUGFnZVJlYWR5IiwiaXNDb250ZXh0RXhwZWN0ZWQiLCJNYXNzRWRpdCIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJoYW5kbGVycyIsIm9uUHJpbWFyeUFjdGlvbiIsIm9Db250cm9sbGVyIiwib1ZpZXciLCJvQ29udGV4dCIsInNBY3Rpb25OYW1lIiwibVBhcmFtZXRlcnMiLCJtQ29uZGl0aW9ucyIsImlWaWV3TGV2ZWwiLCJnZXRWaWV3RGF0YSIsInZpZXdMZXZlbCIsIm9PYmplY3RQYWdlIiwiX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sIiwicG9zaXRpdmVBY3Rpb25WaXNpYmxlIiwicG9zaXRpdmVBY3Rpb25FbmFibGVkIiwib25DYWxsQWN0aW9uIiwiZWRpdEFjdGlvblZpc2libGUiLCJlZGl0QWN0aW9uRW5hYmxlZCIsIl9lZGl0RG9jdW1lbnQiLCJnZXRNb2RlbCIsImdldFByb3BlcnR5IiwiX3NhdmVEb2N1bWVudCIsIl9hcHBseURvY3VtZW50Iiwib25UYWJsZUNvbnRleHRDaGFuZ2UiLCJvRXZlbnQiLCJvU291cmNlIiwiZ2V0U291cmNlIiwib1RhYmxlIiwiX2ZpbmRUYWJsZXMiLCJzb21lIiwiX29UYWJsZSIsImdldFJvd0JpbmRpbmciLCJvQ3VycmVudEFjdGlvblByb21pc2UiLCJfZWRpdEZsb3ciLCJnZXRDdXJyZW50QWN0aW9uUHJvbWlzZSIsImFUYWJsZUNvbnRleHRzIiwiZ2V0VHlwZSIsImdldE1ldGFkYXRhIiwiaXNBIiwiZ2V0Q29udGV4dHMiLCJnZXRDdXJyZW50Q29udGV4dHMiLCJvQWN0aW9uUmVzcG9uc2UiLCJjb250cm9sSWQiLCJzSWQiLCJvQWN0aW9uRGF0YSIsIm9EYXRhIiwiYUtleXMiLCJrZXlzIiwiaU5ld0l0ZW1wIiwiZmluZCIsIm9UYWJsZUNvbnRleHQiLCJpIiwib1RhYmxlRGF0YSIsImdldE9iamVjdCIsImJDb21wYXJlIiwiZXZlcnkiLCJzS2V5IiwiYURpYWxvZ3MiLCJJbnN0YW5jZU1hbmFnZXIiLCJnZXRPcGVuRGlhbG9ncyIsIm9EaWFsb2ciLCJsZW5ndGgiLCJkaWFsb2ciLCJkYXRhIiwiYXR0YWNoRXZlbnRPbmNlIiwiZm9jdXNSb3ciLCJkZWxldGVDdXJyZW50QWN0aW9uUHJvbWlzZSIsImNhdGNoIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJtZXNzYWdlQnV0dG9uIiwiZmlyZU1vZGVsQ29udGV4dENoYW5nZSIsImVkaXRGbG93IiwiaW52b2tlQWN0aW9uIiwiX3Nob3dNZXNzYWdlUG9wb3ZlciIsIm9uRGF0YVBvaW50VGl0bGVQcmVzc2VkIiwib01hbmlmZXN0T3V0Ym91bmQiLCJzQ29udHJvbENvbmZpZyIsInNDb2xsZWN0aW9uUGF0aCIsIkpTT04iLCJwYXJzZSIsIm9UYXJnZXRJbmZvIiwiYVNlbWFudGljT2JqZWN0TWFwcGluZyIsIkNvbW1vblV0aWxzIiwiZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nIiwib0RhdGFQb2ludE9yQ2hhcnRCaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwic01ldGFQYXRoIiwiZ2V0TWV0YU1vZGVsIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwiYU5hdmlnYXRpb25EYXRhIiwiX2dldENoYXJ0Q29udGV4dERhdGEiLCJhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJtYXAiLCJvTmF2aWdhdGlvbkRhdGEiLCJtZXRhUGF0aCIsInBhcmFtZXRlcnMiLCJvUGFyYW1zIiwiX2ludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldE91dGJvdW5kUGFyYW1zIiwiT2JqZWN0Iiwic2VtYW50aWNPYmplY3QiLCJhY3Rpb24iLCJuYXZpZ2F0ZSIsIm5hdmlnYXRpb25Db250ZXh0cyIsInNlbWFudGljT2JqZWN0TWFwcGluZyIsIm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZCIsInNPdXRib3VuZFRhcmdldCIsInNDcmVhdGVQYXRoIiwib25OYXZpZ2F0ZUNoYW5nZSIsImdldEV4dGVuc2lvbkFQSSIsInVwZGF0ZUFwcFN0YXRlIiwiYlNlY3Rpb25OYXZpZ2F0ZWQiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJzZWN0aW9uTGF5b3V0Iiwib1N1YlNlY3Rpb24iLCJnZXRQYXJhbWV0ZXIiLCJfdXBkYXRlRm9jdXNJbkVkaXRNb2RlIiwib25WYXJpYW50U2VsZWN0ZWQiLCJvblZhcmlhbnRTYXZlZCIsInNldFRpbWVvdXQiLCJuYXZpZ2F0ZVRvU3ViU2VjdGlvbiIsInZEZXRhaWxDb25maWciLCJvRGV0YWlsQ29uZmlnIiwiYnlJZCIsIm9TZWN0aW9uIiwic2VjdGlvbklkIiwic3ViU2VjdGlvbklkIiwiZ2V0U3ViU2VjdGlvbnMiLCJnZXRQYXJlbnQiLCJnZXRWaXNpYmxlIiwiZ2V0UmVzb3VyY2VCdW5kbGUiLCJvUmVzb3VyY2VCdW5kbGUiLCJzVGl0bGUiLCJnZXRUcmFuc2xhdGVkVGV4dCIsImVudGl0eVNldCIsIk1lc3NhZ2VCb3giLCJzY3JvbGxUb1NlY3Rpb24iLCJnZXRJZCIsImZpcmVOYXZpZ2F0ZSIsInNlY3Rpb24iLCJzdWJTZWN0aW9uIiwib25DaGFydFNlbGVjdGlvbkNoYW5nZWQiLCJDaGFydFJ1bnRpbWUiLCJmblVwZGF0ZUNoYXJ0Iiwib25TdGF0ZUNoYW5nZSIsIm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcyIsIkV4dGVuc2lvbkFQSSIsImV4dGVuc2lvbkFQSSIsIm9uSW5pdCIsInNldFByb3BlcnR5IiwidmlzaWJpbGl0eSIsIml0ZW1zIiwiX2dldEJhdGNoR3JvdXBzRm9yVmlldyIsInVzZU5ld0xhenlMb2FkaW5nIiwiZ2V0RW5hYmxlTGF6eUxvYWRpbmciLCJhdHRhY2hFdmVudCIsIl9oYW5kbGVTdWJTZWN0aW9uRW50ZXJlZFZpZXdQb3J0Iiwib0l0ZW1CaW5kaW5nIiwiYXR0YWNoQ2hhbmdlIiwiX2ZuU2hvd09QTWVzc2FnZSIsIm9uRXhpdCIsImRlc3Ryb3kiLCJvTWVzc2FnZVBvcG92ZXIiLCJpc09wZW4iLCJjbG9zZSIsImlzS2VlcEFsaXZlIiwic2V0S2VlcEFsaXZlIiwiaXNDb25uZWN0ZWQiLCJkaXNjb25uZWN0IiwidmlldyIsIm1lc3NhZ2VzIiwiZ2V0SXRlbXMiLCJpdGVtIiwiZmlsdGVyIiwibWVzc2FnZSIsImdldFRhcmdldHMiLCJzaG93TWVzc2FnZXMiLCJfZ2V0VGFibGVCaW5kaW5nIiwiY2hlY2tTZWN0aW9uc0ZvckdyaWRUYWJsZSIsInN1YlNlY3Rpb25zIiwiY2hhbmdlQ2xhc3NGb3JUYWJsZXMiLCJldmVudCIsImxhc3RWaXNpYmxlU3ViU2VjdGlvbiIsImJsb2NrcyIsImdldEJsb2NrcyIsImdldE1vcmVCbG9ja3MiLCJzZWFyY2hUYWJsZUluQmxvY2siLCJhZGRTdHlsZUNsYXNzIiwiZGV0YWNoRXZlbnQiLCJzdWJTZWN0aW9uSW5kZXgiLCJibG9jayIsImNvbnRyb2wiLCJjb250ZW50IiwidGFibGVBUEkiLCJvbkJlZm9yZVJlbmRlcmluZyIsIlBhZ2VDb250cm9sbGVyIiwicHJvdG90eXBlIiwiYXBwbHkiLCJvVmlld0RhdGEiLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiQ29tbW9uSGVscGVyIiwic2V0TWV0YU1vZGVsIiwiZ2V0QXBwQ29tcG9uZW50Iiwib25BZnRlclJlbmRlcmluZyIsInJlc3BvbnNlIiwib0Vycm9yIiwiZ2V0VXNlSWNvblRhYkJhciIsInNlY3Rpb25zIiwiZ2V0U2VjdGlvbnMiLCJfZ2V0QWxsU3ViU2VjdGlvbnMiLCJfb25CZWZvcmVCaW5kaW5nIiwiYVRhYmxlcyIsIm9JbnRlcm5hbE1vZGVsIiwiYUJhdGNoR3JvdXBzIiwib0Zhc3RDcmVhdGlvblJvdyIsInB1c2giLCJiRHJhZnROYXZpZ2F0aW9uIiwiX2Nsb3NlU2lkZUNvbnRlbnQiLCJvcENvbnRleHQiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImdldEJpbmRpbmciLCJyZXNldENoYW5nZXMiLCJnZXRDcmVhdGlvblJvdyIsInNldEJpbmRpbmdDb250ZXh0IiwiZm5TY3JvbGxUb1ByZXNlbnRTZWN0aW9uIiwiaXNGaXJzdFJlbmRlcmluZyIsImJQZXJzaXN0T1BTY3JvbGwiLCJzZXRTZWxlY3RlZFNlY3Rpb24iLCJvRGVsZWdhdGVPbkJlZm9yZSIsImFkZEV2ZW50RGVsZWdhdGUiLCJwYWdlUmVhZHkiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwib0JpbmRpbmciLCJsaXN0QmluZGluZyIsIm9QYWdpbmF0b3JDdXJyZW50Q29udGV4dCIsIm9CaW5kaW5nVG9Vc2UiLCJwYWdpbmF0b3IiLCJpbml0aWFsaXplIiwic0JpbmRpbmdQYXRoIiwidGVzdCIsInNMaXN0QmluZGluZ1BhdGgiLCJyZXBsYWNlIiwiT0RhdGFMaXN0QmluZGluZyIsIm9Nb2RlbCIsIl9zZXRMaXN0QmluZGluZ0FzeW5jIiwiYVNlY3Rpb25zIiwiYlVzZUljb25UYWJCYXIiLCJpU2tpcCIsImJJc0luRWRpdE1vZGUiLCJiRWRpdGFibGVIZWFkZXIiLCJlZGl0YWJsZUhlYWRlckNvbnRlbnQiLCJpU2VjdGlvbiIsImFTdWJTZWN0aW9ucyIsImlTdWJTZWN0aW9uIiwiaXNWaXNpYmlsaXR5RHluYW1pYyIsInBsYWNlaG9sZGVyIiwiaXNQbGFjZWhvbGRlckVuYWJsZWQiLCJzaG93UGxhY2Vob2xkZXIiLCJvTmF2Q29udGFpbmVyIiwib0NvbnRhaW5lciIsIl9nZXRGaXJzdENsaWNrYWJsZUVsZW1lbnQiLCJvRmlyc3RDbGlja2FibGVFbGVtZW50IiwiYUFjdGlvbnMiLCJnZXRIZWFkZXJUaXRsZSIsImdldEFjdGlvbnMiLCJvQWN0aW9uIiwiZ2V0RW5hYmxlZCIsIl9nZXRGaXJzdEVtcHR5TWFuZGF0b3J5RmllbGRGcm9tU3ViU2VjdGlvbiIsImFCbG9ja3MiLCJhRm9ybUNvbnRhaW5lcnMiLCJnZXRGb3JtQ29udGFpbmVycyIsImdldENvbnRlbnQiLCJmb3JtQ29udGFpbmVyIiwiYUZvcm1FbGVtZW50cyIsImdldEZvcm1FbGVtZW50cyIsImZvcm1FbGVtZW50IiwiYUZpZWxkcyIsImdldEZpZWxkcyIsImdldFJlcXVpcmVkIiwiZ2V0VmFsdWUiLCJkZWJ1ZyIsIm9NYW5kYXRvcnlGaWVsZCIsIm9GaWVsZFRvRm9jdXMiLCJnZXRDb250ZW50RWRpdCIsIl9nZXRGaXJzdEVkaXRhYmxlSW5wdXQiLCJmb2N1cyIsIl9vbkJhY2tOYXZpZ2F0aW9uSW5EcmFmdCIsIm1lc3NhZ2VIYW5kbGVyIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwiZ2V0Um91dGVyUHJveHkiLCJjaGVja0lmQmFja0hhc1NhbWVDb250ZXh0IiwiaGlzdG9yeSIsImJhY2siLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiRnVuY3Rpb24iLCJOYXZpZ2F0aW9uVHlwZSIsIkJhY2tOYXZpZ2F0aW9uIiwiX29uQWZ0ZXJCaW5kaW5nIiwib0JpbmRpbmdDb250ZXh0IiwiZW5hYmxlRmFzdENyZWF0aW9uUm93Iiwib0xpc3RCaW5kaW5nIiwib0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nIiwib0Zhc3RDcmVhdGlvbkNvbnRleHQiLCJvRmluYWxVSVN0YXRlIiwiYmluZExpc3QiLCJnZXRDb250ZXh0IiwiJCR1cGRhdGVHcm91cElkIiwiJCRncm91cElkIiwicmVmcmVzaEludGVybmFsIiwiY3JlYXRlIiwiY3JlYXRlZCIsInRyYWNlIiwiX3NpZGVFZmZlY3RzIiwiY2xlYXJQcm9wZXJ0aWVzU3RhdHVzIiwiYUlCTkFjdGlvbnMiLCJmb3JFYWNoIiwiZ2V0SUJOQWN0aW9ucyIsIm9UYWJsZVJvd0JpbmRpbmciLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsInJlbW92ZUNhY2hlc0FuZE1lc3NhZ2VzIiwib0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsInBhcnNlQ3VzdG9tRGF0YSIsIkRlbGVnYXRlVXRpbCIsImdldEN1c3RvbURhdGEiLCJhU2VsZWN0ZWRDb250ZXh0cyIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJBY3Rpb25SdW50aW1lIiwic2V0QWN0aW9uRW5hYmxlbWVudCIsImNsZWFyU2VsZWN0aW9uIiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbCIsIm9PYmplY3RQYWdlVGl0bGUiLCJhSUJOSGVhZGVyQWN0aW9ucyIsImNvbmNhdCIsInVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5IiwiaGFuZGxlVGFibGVNb2RpZmljYXRpb25zIiwiZm5IYW5kbGVUYWJsZVBhdGNoRXZlbnRzIiwiZm5IYW5kbGVDaGFuZ2UiLCJkZXRhY2hDaGFuZ2UiLCJjb21wdXRlRWRpdE1vZGUiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsImNvbm5lY3QiLCJvQ2FjaGUiLCJfdXBkYXRlUmVsYXRlZEFwcHMiLCJmblVwZGF0ZVJlbGF0ZWRBcHBzIiwiZGV0YWNoRGF0YVJlY2VpdmVkIiwiYXR0YWNoRGF0YVJlY2VpdmVkIiwiY3VycmVudEJpbmRpbmciLCJoYW5kbGVQYXRjaFNlbnQiLCJUYWJsZVV0aWxzIiwid2hlbkJvdW5kIiwiX3RyaWdnZXJWaXNpYmxlU3ViU2VjdGlvbnNFdmVudHMiLCJvblBhZ2VSZWFkeSIsInNldEZvY3VzIiwiaXNJbkRpc3BsYXlNb2RlIiwib1NlbGVjdGVkU2VjdGlvbiIsIkNvcmUiLCJnZXRTZWxlY3RlZFNlY3Rpb24iLCJiSXNTdGlja3lNb2RlIiwib0FwcENvbXBvbmVudCIsImdldFNoZWxsU2VydmljZXMiLCJzZXRCYWNrTmF2aWdhdGlvbiIsImdldEFwcFN0YXRlSGFuZGxlciIsImFwcGx5QXBwU3RhdGUiLCJmb3JjZUZvY3VzIiwiRXJyb3IiLCJfY2hlY2tEYXRhUG9pbnRUaXRsZUZvckV4dGVybmFsTmF2aWdhdGlvbiIsIl9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbiIsIm9PYmplY3RQYWdlU3VidGl0bGUiLCJvQ3VzdG9tRGF0YSIsImdldEtleSIsInRpdGxlIiwic3VidGl0bGUiLCJpbnRlbnQiLCJpY29uIiwiX2V4ZWN1dGVIZWFkZXJTaG9ydGN1dCIsInNCdXR0b25JZCIsIm9CdXR0b24iLCJvRWxlbWVudCIsImZpcmVCdXR0b25QcmVzcyIsIl9leGVjdXRlRm9vdGVyU2hvcnRjdXQiLCJnZXRGb290ZXIiLCJnZXROYW1lIiwiX2V4ZWN1dGVUYWJTaG9ydEN1dCIsIm9FeGVjdXRpb24iLCJpU2VjdGlvbkluZGV4TWF4Iiwic0NvbW1hbmQiLCJnZXRDb21tYW5kIiwibmV3U2VjdGlvbiIsImlTZWxlY3RlZFNlY3Rpb25JbmRleCIsImluZGV4T2ZTZWN0aW9uIiwiX2dldEZvb3RlclZpc2liaWxpdHkiLCJzVmlld0lkIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJnZXRNZXNzYWdlTW9kZWwiLCJnZXREYXRhIiwib01lc3NhZ2UiLCJ2YWxpZGF0aW9uIiwidHlwZSIsInRhcmdldCIsImluZGV4T2YiLCJvUmV0Iiwicm9vdFZpZXdDb250cm9sbGVyIiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiY3VycmVudFBhZ2VWaWV3IiwiaXNGY2xFbmFibGVkIiwiZ2V0UmlnaHRtb3N0VmlldyIsImdldFJvb3RDb250YWluZXIiLCJnZXRDdXJyZW50UGFnZSIsIm9NZXNzYWdlQnV0dG9uIiwiZ2V0TGVuZ3RoIiwic2V0VmlzaWJsZSIsIm9wZW5CeSIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwiZWRpdERvY3VtZW50IiwiZmluYWxseSIsInVubG9jayIsImdldERyYWZ0Um9vdENvbnRleHQiLCJjb250ZXh0IiwiZHJhZnRSb290Q29udGV4dFBhdGgiLCJnZXREcmFmdFJvb3RQYXRoIiwic2ltcGxlRHJhZnRSb290Q29udGV4dCIsImV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2UiLCJnZXRJbnN0YW5jZWRWaWV3cyIsInBhZ2VWaWV3IiwiaW50ZXJuYWxNb2RlbCIsIm1vZGVsIiwibWV0YU1vZGVsIiwic0VudGl0eVBhdGgiLCJtRGF0YU1vZGVsIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiYmluZENvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJyZXF1ZXN0UHJvcGVydHkiLCJ0YXJnZXRFbnRpdHlUeXBlIiwibmFtZSIsIl92YWxpZGF0ZURvY3VtZW50IiwiZ2V0Q3VycmVudEZvY3VzZWRDb250cm9sSWQiLCJpc1RyYW5zaWVudCIsInN5bmNUYXNrIiwiYXBwQ29tcG9uZW50Iiwic2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZW50aXR5VHlwZSIsImdldEVudGl0eVR5cGVGcm9tQ29udGV4dCIsImdsb2JhbFNpZGVFZmZlY3RzIiwiZ2V0R2xvYmFsT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyIsIlByb21pc2UiLCJhbGwiLCJzaWRlRWZmZWN0cyIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImRyYWZ0Um9vdENvbnRleHQiLCJleGVjdXRlRHJhZnRWYWxpZGF0aW9uIiwiYVdhaXRDcmVhdGVEb2N1bWVudHMiLCJiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciIsImNyZWF0aW9uTW9kZSIsImNyZWF0aW9uUm93IiwiY3JlYXRlQXRFbmQiLCJiQ3JlYXRlRG9jdW1lbnQiLCJiU2tpcFNpZGVFZmZlY3RzIiwiY3JlYXRlRG9jdW1lbnQiLCJhQmluZGluZ3MiLCJiaW5kaW5ncyIsInNhdmVEb2N1bWVudCIsImlzTG9ja2VkIiwiX21hbmFnZUNvbGxhYm9yYXRpb24iLCJvcGVuTWFuYWdlRGlhbG9nIiwiX3Nob3dDb2xsYWJvcmF0aW9uVXNlckRldGFpbHMiLCJzaG93VXNlckRldGFpbHMiLCJfY2FuY2VsRG9jdW1lbnQiLCJjYW5jZWxCdXR0b24iLCJjYW5jZWxEb2N1bWVudCIsImFwcGx5RG9jdW1lbnQiLCJyZXNvbHZlU3RyaW5ndG9Cb29sZWFuIiwidXBkYXRlUmVsYXRlZEFwcHNEZXRhaWxzIiwiX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uIiwiYVBhcmVudEVsZW1lbnQiLCJhU3Vic2VjdGlvbiIsImFDb250cm9scyIsImJJc0NoYXJ0IiwiZWxlbWVudCIsIm1BZ2dyZWdhdGlvbnMiLCJnZXRBZ2dyZWdhdGlvbiIsImFJdGVtcyIsIm9JdGVtIiwiZ2V0TWFpbkNvbnRlbnQiLCJfZ2V0QWxsQmxvY2tzIiwiX2ZpbmRDaGFydHMiLCJhQ2hhcnRzIiwib0Jsb2NrIiwib0NvbnRlbnQiLCJzZXRTaG93U2lkZUNvbnRlbnQiLCJvQ2hhcnRDb250ZXh0Iiwic0NoYXJ0UGF0aCIsIm9Db250ZXh0RGF0YSIsIm9DaGFydENvbnRleHREYXRhIiwiX3Njcm9sbFRhYmxlc1RvUm93Iiwic1Jvd1BhdGgiLCJUYWJsZVNjcm9sbGVyIiwic2Nyb2xsVGFibGVUb1JvdyIsIl9tZXJnZU11bHRpcGxlQ29udGV4dHMiLCJvUGFnZUNvbnRleHQiLCJhTGluZUNvbnRleHQiLCJhQXR0cmlidXRlcyIsImFQYWdlQXR0cmlidXRlcyIsInNNZXRhUGF0aExpbmUiLCJzUGF0aExpbmUiLCJzUGFnZVBhdGgiLCJvTWV0YU1vZGVsIiwic01ldGFQYXRoUGFnZSIsIm9TaW5nbGVDb250ZXh0Iiwib1N1YkNoYXJ0Q29udGV4dERhdGEiLCJjb250ZXh0RGF0YSIsInJlbW92ZVNlbnNpdGl2ZURhdGEiLCJvUGFnZUxldmVsU1YiLCJhZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudCIsIlNlbGVjdGlvblZhcmlhbnQiLCJzZWxlY3Rpb25WYXJpYW50IiwiYXR0cmlidXRlcyIsIm9Db25maWd1cmF0aW9ucyIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwiYUNvbmZpZ3VyYXRpb25zIiwib0NvbmZpZ3VyYXRpb24iLCJyZXF1ZXN0R3JvdXBJZCIsIl9zZXRCcmVhZGNydW1iTGlua3MiLCJhUHJvbWlzZXMiLCJhU2tpcFBhcmFtZXRlcml6ZWQiLCJzTmV3UGF0aCIsImFQYXRoUGFydHMiLCJzcGxpdCIsInNQYXRoIiwic2hpZnQiLCJzcGxpY2UiLCJzUGF0aFBhcnQiLCJvUm9vdFZpZXdDb250cm9sbGVyIiwic1BhcmFtZXRlclBhdGgiLCJiUmVzdWx0Q29udGV4dCIsImdldFRpdGxlSW5mb0Zyb21QYXRoIiwidGl0bGVIaWVyYXJjaHlJbmZvcyIsImlkeCIsImhpZXJhcmNoeVBvc2l0aW9uIiwib0xpbmsiLCJ0aXRsZUhpZXJhcmNoeUluZm8iLCJnZXRMaW5rcyIsIkxpbmsiLCJzZXRUZXh0Iiwic2V0SHJlZiIsImVuY29kZVVSSSIsImFkZExpbmsiLCJvRGF0YVBvaW50cyIsImdldEhlYWRlckZhY2V0SXRlbUNvbmZpZ0ZvckV4dGVybmFsTmF2aWdhdGlvbiIsImdldFJvdXRpbmdTZXJ2aWNlIiwiZ2V0T3V0Ym91bmRzIiwib1NoZWxsU2VydmljZXMiLCJyZXF1ZXN0T2JqZWN0IiwiZm5HZXRMaW5rcyIsImZuT25FcnJvciIsImZuU2V0TGlua0VuYWJsZW1lbnQiLCJpZCIsImFTdXBwb3J0ZWRMaW5rcyIsInNMaW5rSWQiLCJzdXBwb3J0ZWQiLCJvU3ViRGF0YVBvaW50cyIsIm9QYWdlRGF0YSIsIm9EYXRhUG9pbnQiLCJvTGlua0NvbnRleHQiLCJvTGlua0RhdGEiLCJvTWl4ZWRDb250ZXh0IiwibWVyZ2UiLCJvTWFwcGluZyIsInNNYWluUHJvcGVydHkiLCJzTWFwcGVkUHJvcGVydHkiLCJoYXNPd25Qcm9wZXJ0eSIsIm9OZXdNYXBwaW5nIiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwicGFyYW1zIiwiYUxpbmtzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJPYmplY3RQYWdlQ29udHJvbGxlci5jb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEFjdGlvblJ1bnRpbWUgZnJvbSBcInNhcC9mZS9jb3JlL0FjdGlvblJ1bnRpbWVcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgeyBjb25uZWN0LCBkaXNjb25uZWN0LCBpc0Nvbm5lY3RlZCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0FjdGl2aXR5U3luY1wiO1xuaW1wb3J0IHsgb3Blbk1hbmFnZURpYWxvZywgc2hvd1VzZXJEZXRhaWxzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vTWFuYWdlXCI7XG5pbXBvcnQgRWRpdEZsb3cgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0VkaXRGbG93XCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbEVkaXRGbG93XCI7XG5pbXBvcnQgSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgSW50ZXJuYWxSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbFJvdXRpbmdcIjtcbmltcG9ydCBNYXNzRWRpdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWFzc0VkaXRcIjtcbmltcG9ydCBNZXNzYWdlSGFuZGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWVzc2FnZUhhbmRsZXJcIjtcbmltcG9ydCBQYWdlUmVhZHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BhZ2VSZWFkeVwiO1xuaW1wb3J0IFBhZ2luYXRvciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGFnaW5hdG9yXCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgU2hhcmUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1NoYXJlXCI7XG5pbXBvcnQgVmlld1N0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBmaW5hbEV4dGVuc2lvbiwgcHVibGljRXh0ZW5zaW9uLCB1c2luZ0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIFJvb3RDb250YWluZXJCYXNlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvcm9vdFZpZXcvUm9vdFZpZXdCYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IFJvb3RWaWV3QmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL3Jvb3RWaWV3L1Jvb3RWaWV3QmFzZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBDaGFydFJ1bnRpbWUgZnJvbSBcInNhcC9mZS9tYWNyb3MvY2hhcnQvQ2hhcnRSdW50aW1lXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlQVBJIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlQVBJXCI7XG5pbXBvcnQgVGFibGVVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IFNlbGVjdGlvblZhcmlhbnQgZnJvbSBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIjtcbmltcG9ydCB0eXBlIFN1YlNlY3Rpb25CbG9jayBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL2NvbnRyb2xzL1N1YlNlY3Rpb25CbG9ja1wiO1xuaW1wb3J0IHR5cGUgeyBkZWZhdWx0IGFzIE9iamVjdFBhZ2VFeHRlbnNpb25BUEkgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBFeHRlbnNpb25BUEkgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IEVkaXRGbG93T3ZlcnJpZGVzIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL1Jvb3RDb250YWluZXIvb3ZlcnJpZGVzL0VkaXRGbG93XCI7XG5pbXBvcnQgVGFibGVTY3JvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9UYWJsZVNjcm9sbGVyXCI7XG5pbXBvcnQgSW5zdGFuY2VNYW5hZ2VyIGZyb20gXCJzYXAvbS9JbnN0YW5jZU1hbmFnZXJcIjtcbmltcG9ydCBMaW5rIGZyb20gXCJzYXAvbS9MaW5rXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IHR5cGUgUG9wb3ZlciBmcm9tIFwic2FwL20vUG9wb3ZlclwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9CaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9yZXNvdXJjZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBCcmVhZENydW1icyBmcm9tIFwic2FwL3V4YXAvQnJlYWRDcnVtYnNcIjtcbmltcG9ydCB0eXBlIE9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGUgZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGVcIjtcbmltcG9ydCB0eXBlIE9iamVjdFBhZ2VMYXlvdXQgZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VMYXlvdXRcIjtcbmltcG9ydCB0eXBlIE9iamVjdFBhZ2VTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU2VjdGlvblwiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZVN1YlNlY3Rpb24gZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VTdWJTZWN0aW9uXCI7XG5pbXBvcnQgdHlwZSB7IE9EYXRhQ29udGV4dEJpbmRpbmdFeCwgVjRDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuaW1wb3J0IEludGVudEJhc2VkTmF2aWdhdGlvbk92ZXJyaWRlIGZyb20gXCIuL292ZXJyaWRlcy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbFJvdXRpbmdPdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvSW50ZXJuYWxSb3V0aW5nXCI7XG5pbXBvcnQgTWVzc2FnZUhhbmRsZXJPdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvTWVzc2FnZUhhbmRsZXJcIjtcbmltcG9ydCBQYWdpbmF0b3JPdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvUGFnaW5hdG9yXCI7XG5pbXBvcnQgU2hhcmVPdmVycmlkZXMgZnJvbSBcIi4vb3ZlcnJpZGVzL1NoYXJlXCI7XG5pbXBvcnQgVmlld1N0YXRlT3ZlcnJpZGVzIGZyb20gXCIuL292ZXJyaWRlcy9WaWV3U3RhdGVcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VDb250cm9sbGVyXCIpXG5jbGFzcyBPYmplY3RQYWdlQ29udHJvbGxlciBleHRlbmRzIFBhZ2VDb250cm9sbGVyIHtcblx0b1ZpZXchOiBhbnk7XG5cdEB1c2luZ0V4dGVuc2lvbihQbGFjZWhvbGRlcilcblx0cGxhY2Vob2xkZXIhOiBQbGFjZWhvbGRlcjtcblx0QHVzaW5nRXh0ZW5zaW9uKEVkaXRGbG93KVxuXHRlZGl0RmxvdyE6IEVkaXRGbG93O1xuXHRAdXNpbmdFeHRlbnNpb24oU2hhcmUub3ZlcnJpZGUoU2hhcmVPdmVycmlkZXMpKVxuXHRzaGFyZSE6IFNoYXJlO1xuXHRAdXNpbmdFeHRlbnNpb24oSW50ZXJuYWxFZGl0Rmxvdy5vdmVycmlkZShFZGl0Rmxvd092ZXJyaWRlcykpXG5cdF9lZGl0RmxvdyE6IEludGVybmFsRWRpdEZsb3c7XG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlcm5hbFJvdXRpbmcub3ZlcnJpZGUoSW50ZXJuYWxSb3V0aW5nT3ZlcnJpZGUpKVxuXHRfcm91dGluZyE6IEludGVybmFsUm91dGluZztcblx0QHVzaW5nRXh0ZW5zaW9uKFBhZ2luYXRvci5vdmVycmlkZShQYWdpbmF0b3JPdmVycmlkZSkpXG5cdHBhZ2luYXRvciE6IFBhZ2luYXRvcjtcblx0QHVzaW5nRXh0ZW5zaW9uKE1lc3NhZ2VIYW5kbGVyLm92ZXJyaWRlKE1lc3NhZ2VIYW5kbGVyT3ZlcnJpZGUpKVxuXHRtZXNzYWdlSGFuZGxlciE6IE1lc3NhZ2VIYW5kbGVyO1xuXHRAdXNpbmdFeHRlbnNpb24oSW50ZW50QmFzZWROYXZpZ2F0aW9uLm92ZXJyaWRlKEludGVudEJhc2VkTmF2aWdhdGlvbk92ZXJyaWRlKSlcblx0aW50ZW50QmFzZWROYXZpZ2F0aW9uITogSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXHRAdXNpbmdFeHRlbnNpb24oXG5cdFx0SW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24ub3ZlcnJpZGUoe1xuXHRcdFx0Z2V0TmF2aWdhdGlvbk1vZGU6IGZ1bmN0aW9uICh0aGlzOiBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHRjb25zdCBiSXNTdGlja3lFZGl0TW9kZSA9XG5cdFx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBPYmplY3RQYWdlQ29udHJvbGxlcikuZ2V0U3RpY2t5RWRpdE1vZGUgJiZcblx0XHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIE9iamVjdFBhZ2VDb250cm9sbGVyKS5nZXRTdGlja3lFZGl0TW9kZSgpO1xuXHRcdFx0XHRyZXR1cm4gYklzU3RpY2t5RWRpdE1vZGUgPyBcImV4cGxhY2VcIiA6IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9KVxuXHQpXG5cdF9pbnRlbnRCYXNlZE5hdmlnYXRpb24hOiBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0QHVzaW5nRXh0ZW5zaW9uKFZpZXdTdGF0ZS5vdmVycmlkZShWaWV3U3RhdGVPdmVycmlkZXMpKVxuXHR2aWV3U3RhdGUhOiBWaWV3U3RhdGU7XG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRQYWdlUmVhZHkub3ZlcnJpZGUoe1xuXHRcdFx0aXNDb250ZXh0RXhwZWN0ZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSlcblx0KVxuXHRwYWdlUmVhZHkhOiBQYWdlUmVhZHk7XG5cdEB1c2luZ0V4dGVuc2lvbihNYXNzRWRpdClcblx0bWFzc0VkaXQhOiBNYXNzRWRpdDtcblx0cHJpdmF0ZSBtQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXM/OiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RQYWdlRXh0ZW5zaW9uQVBJPjtcblx0cHJvdGVjdGVkIGV4dGVuc2lvbkFQST86IE9iamVjdFBhZ2VFeHRlbnNpb25BUEk7XG5cdHByaXZhdGUgb1Jlc291cmNlQnVuZGxlPzogUmVzb3VyY2VCdW5kbGU7XG5cdHByaXZhdGUgYlNlY3Rpb25OYXZpZ2F0ZWQ/OiBib29sZWFuO1xuXHRwcml2YXRlIHN3aXRjaERyYWZ0QW5kQWN0aXZlUG9wT3Zlcj86IFBvcG92ZXI7XG5cdHByaXZhdGUgY3VycmVudEJpbmRpbmc/OiBCaW5kaW5nO1xuXHRwcml2YXRlIG1lc3NhZ2VCdXR0b246IGFueTtcblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0RXh0ZW5zaW9uQVBJKHNJZD86IHN0cmluZyk6IEV4dGVuc2lvbkFQSSB7XG5cdFx0aWYgKHNJZCkge1xuXHRcdFx0Ly8gdG8gYWxsb3cgbG9jYWwgSUQgdXNhZ2UgZm9yIGN1c3RvbSBwYWdlcyB3ZSdsbCBjcmVhdGUvcmV0dXJuIG93biBpbnN0YW5jZXMgZm9yIGN1c3RvbSBzZWN0aW9uc1xuXHRcdFx0dGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXMgPSB0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcyB8fCB7fTtcblxuXHRcdFx0aWYgKCF0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJc1tzSWRdKSB7XG5cdFx0XHRcdHRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzW3NJZF0gPSBuZXcgRXh0ZW5zaW9uQVBJKHRoaXMsIHNJZCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXNbc0lkXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCF0aGlzLmV4dGVuc2lvbkFQSSkge1xuXHRcdFx0XHR0aGlzLmV4dGVuc2lvbkFQSSA9IG5ldyBFeHRlbnNpb25BUEkodGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5leHRlbnNpb25BUEk7XG5cdFx0fVxuXHR9XG5cblx0b25Jbml0KCkge1xuXHRcdHN1cGVyLm9uSW5pdCgpO1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblxuXHRcdC8vIFNldHRpbmcgZGVmYXVsdHMgb2YgaW50ZXJuYWwgbW9kZWwgY29udGV4dFxuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcImV4dGVybmFsTmF2aWdhdGlvbkNvbnRleHRcIiwgeyBcInBhZ2VcIjogdHJ1ZSB9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHNcIiwge1xuXHRcdFx0dmlzaWJpbGl0eTogZmFsc2UsXG5cdFx0XHRpdGVtczogbnVsbFxuXHRcdH0pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dD8uc2V0UHJvcGVydHkoXCJiYXRjaEdyb3Vwc1wiLCB0aGlzLl9nZXRCYXRjaEdyb3Vwc0ZvclZpZXcoKSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcImVycm9yTmF2aWdhdGlvblNlY3Rpb25GbGFnXCIsIGZhbHNlKTtcblx0XHRpZiAoISh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkudXNlTmV3TGF6eUxvYWRpbmcgJiYgKG9PYmplY3RQYWdlIGFzIGFueSkuZ2V0RW5hYmxlTGF6eUxvYWRpbmcoKSkge1xuXHRcdFx0Ly9BdHRhY2hpbmcgdGhlIGV2ZW50IHRvIG1ha2UgdGhlIHN1YnNlY3Rpb24gY29udGV4dCBiaW5kaW5nIGFjdGl2ZSB3aGVuIGl0IGlzIHZpc2libGUuXG5cdFx0XHRvT2JqZWN0UGFnZS5hdHRhY2hFdmVudChcInN1YlNlY3Rpb25FbnRlcmVkVmlld1BvcnRcIiwgdGhpcy5faGFuZGxlU3ViU2VjdGlvbkVudGVyZWRWaWV3UG9ydC5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdFx0dGhpcy5tZXNzYWdlQnV0dG9uID0gdGhpcy5nZXRWaWV3KCkuYnlJZChcImZlOjpGb290ZXJCYXI6Ok1lc3NhZ2VCdXR0b25cIik7XG5cdFx0dGhpcy5tZXNzYWdlQnV0dG9uLm9JdGVtQmluZGluZy5hdHRhY2hDaGFuZ2UodGhpcy5fZm5TaG93T1BNZXNzYWdlLCB0aGlzKTtcblx0fVxuXG5cdG9uRXhpdCgpIHtcblx0XHRpZiAodGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXMpIHtcblx0XHRcdGZvciAoY29uc3Qgc0lkIG9mIE9iamVjdC5rZXlzKHRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzKSkge1xuXHRcdFx0XHRpZiAodGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXNbc0lkXSkge1xuXHRcdFx0XHRcdHRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzW3NJZF0uZGVzdHJveSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRkZWxldGUgdGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXM7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmV4dGVuc2lvbkFQSSkge1xuXHRcdFx0dGhpcy5leHRlbnNpb25BUEkuZGVzdHJveSgpO1xuXHRcdH1cblx0XHRkZWxldGUgdGhpcy5leHRlbnNpb25BUEk7XG5cblx0XHRjb25zdCBvTWVzc2FnZVBvcG92ZXIgPSB0aGlzLm1lc3NhZ2VCdXR0b24gPyB0aGlzLm1lc3NhZ2VCdXR0b24ub01lc3NhZ2VQb3BvdmVyIDogbnVsbDtcblx0XHRpZiAob01lc3NhZ2VQb3BvdmVyICYmIG9NZXNzYWdlUG9wb3Zlci5pc09wZW4oKSkge1xuXHRcdFx0b01lc3NhZ2VQb3BvdmVyLmNsb3NlKCk7XG5cdFx0fVxuXHRcdC8vd2hlbiBleGl0aW5nIHdlIHNldCBrZWVwQWxpdmUgY29udGV4dCB0byBmYWxzZVxuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdGlmIChvQ29udGV4dCAmJiBvQ29udGV4dC5pc0tlZXBBbGl2ZSgpKSB7XG5cdFx0XHRvQ29udGV4dC5zZXRLZWVwQWxpdmUoZmFsc2UpO1xuXHRcdH1cblx0XHRpZiAoaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpKSB7XG5cdFx0XHRkaXNjb25uZWN0KHRoaXMuZ2V0VmlldygpKTsgLy8gQ2xlYW51cCBjb2xsYWJvcmF0aW9uIGNvbm5lY3Rpb24gd2hlbiBsZWF2aW5nIHRoZSBhcHBcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHNob3cgdGhlIG1lc3NhZ2Ugc3RyaXAgb24gdGhlIG9iamVjdCBwYWdlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2ZuU2hvd09QTWVzc2FnZSgpIHtcblx0XHRjb25zdCBleHRlbnNpb25BUEkgPSB0aGlzLmdldEV4dGVuc2lvbkFQSSgpO1xuXHRcdGNvbnN0IHZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRjb25zdCBtZXNzYWdlcyA9IHRoaXMubWVzc2FnZUJ1dHRvbi5vTWVzc2FnZVBvcG92ZXJcblx0XHRcdC5nZXRJdGVtcygpXG5cdFx0XHQubWFwKChpdGVtOiBhbnkpID0+IGl0ZW0uZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpKVxuXHRcdFx0LmZpbHRlcigobWVzc2FnZTogTWVzc2FnZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5nZXRUYXJnZXRzKClbMF0gPT09IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpO1xuXHRcdFx0fSk7XG5cblx0XHRpZiAoZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHRleHRlbnNpb25BUEkuc2hvd01lc3NhZ2VzKG1lc3NhZ2VzKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0VGFibGVCaW5kaW5nKG9UYWJsZTogYW55KSB7XG5cdFx0cmV0dXJuIG9UYWJsZSAmJiBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmQgdGhlIGxhc3QgdmlzaWJsZSBzdWJzZWN0aW9uIGFuZCBhZGQgdGhlIHNhcFV4QVBPYmplY3RQYWdlU3ViU2VjdGlvbkZpdENvbnRhaW5lciBDU1MgY2xhc3MgaWYgaXQgY29udGFpbnMgb25seSBhIGdyaWRUYWJsZS5cblx0ICpcblx0ICogQHBhcmFtIHN1YlNlY3Rpb25zIFRoZSBzdWIgc2VjdGlvbnMgdG8gbG9vayBmb3Jcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgY2hlY2tTZWN0aW9uc0ZvckdyaWRUYWJsZShzdWJTZWN0aW9uczogT2JqZWN0UGFnZVN1YlNlY3Rpb25bXSkge1xuXHRcdGNvbnN0IGNoYW5nZUNsYXNzRm9yVGFibGVzID0gKGV2ZW50OiBFdmVudCwgbGFzdFZpc2libGVTdWJTZWN0aW9uOiBPYmplY3RQYWdlU3ViU2VjdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgYmxvY2tzID0gWy4uLmxhc3RWaXNpYmxlU3ViU2VjdGlvbi5nZXRCbG9ja3MoKSwgLi4ubGFzdFZpc2libGVTdWJTZWN0aW9uLmdldE1vcmVCbG9ja3MoKV07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGJsb2Nrcy5sZW5ndGggPT09IDEgJiZcblx0XHRcdFx0dGhpcy5zZWFyY2hUYWJsZUluQmxvY2soYmxvY2tzWzBdIGFzIFN1YlNlY3Rpb25CbG9jaylcblx0XHRcdFx0XHQ/LmdldFR5cGUoKVxuXHRcdFx0XHRcdD8uaXNBKFwic2FwLnVpLm1kYy50YWJsZS5HcmlkVGFibGVUeXBlXCIpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly9JbiBjYXNlIHRoZXJlIGlzIG9ubHkgYSBzaW5nbGUgdGFibGUgaW4gYSBzdWJTZWN0aW9uIHdlIGZpdCB0aGF0IHRvIHRoZSB3aG9sZSBwYWdlIHNvIHRoYXQgdGhlIHNjcm9sbGJhciBjb21lcyBvbmx5IG9uIHRhYmxlIGFuZCBub3Qgb24gcGFnZVxuXHRcdFx0XHRsYXN0VmlzaWJsZVN1YlNlY3Rpb24uYWRkU3R5bGVDbGFzcyhcInNhcFV4QVBPYmplY3RQYWdlU3ViU2VjdGlvbkZpdENvbnRhaW5lclwiKTtcblx0XHRcdFx0bGFzdFZpc2libGVTdWJTZWN0aW9uLmRldGFjaEV2ZW50KFwibW9kZWxDb250ZXh0Q2hhbmdlXCIsIGNoYW5nZUNsYXNzRm9yVGFibGVzLCB0aGlzKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGZvciAobGV0IHN1YlNlY3Rpb25JbmRleCA9IHN1YlNlY3Rpb25zLmxlbmd0aCAtIDE7IHN1YlNlY3Rpb25JbmRleCA+PSAwOyBzdWJTZWN0aW9uSW5kZXgtLSkge1xuXHRcdFx0aWYgKHN1YlNlY3Rpb25zW3N1YlNlY3Rpb25JbmRleF0uZ2V0VmlzaWJsZSgpKSB7XG5cdFx0XHRcdGNvbnN0IGxhc3RWaXNpYmxlU3ViU2VjdGlvbiA9IHN1YlNlY3Rpb25zW3N1YlNlY3Rpb25JbmRleF07XG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gYXR0YWNoIHRoaXMgZXZlbnQgaW4gb3JkZXIgdG8gbWFuYWdlIHRoZSBPYmplY3QgUGFnZSBMYXp5IExvYWRpbmcgbWVjaGFuaXNtXG5cdFx0XHRcdGxhc3RWaXNpYmxlU3ViU2VjdGlvbi5hdHRhY2hFdmVudChcIm1vZGVsQ29udGV4dENoYW5nZVwiLCBsYXN0VmlzaWJsZVN1YlNlY3Rpb24sIGNoYW5nZUNsYXNzRm9yVGFibGVzLCB0aGlzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmQgYSB0YWJsZSBpbiBibG9ja3Mgb2Ygc2VjdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIGJsb2NrIE9uZSBzdWIgc2VjdGlvbiBibG9ja1xuXHQgKiBAcmV0dXJucyBUYWJsZSBpZiBleGlzdHNcblx0ICovXG5cdHByaXZhdGUgc2VhcmNoVGFibGVJbkJsb2NrKGJsb2NrOiBTdWJTZWN0aW9uQmxvY2spIHtcblx0XHRjb25zdCBjb250cm9sID0gYmxvY2suY29udGVudDtcblx0XHRsZXQgdGFibGVBUEk6IFRhYmxlQVBJIHwgdW5kZWZpbmVkO1xuXHRcdGlmIChibG9jay5pc0EoXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuY29udHJvbHMuU3ViU2VjdGlvbkJsb2NrXCIpKSB7XG5cdFx0XHQvLyBUaGUgdGFibGUgbWF5IGN1cnJlbnRseSBiZSBzaG93biBpbiBhIGZ1bGwgc2NyZWVuIGRpYWxvZywgd2UgY2FuIHRoZW4gZ2V0IHRoZSByZWZlcmVuY2UgdG8gdGhlIFRhYmxlQVBJXG5cdFx0XHQvLyBjb250cm9sIGZyb20gdGhlIGN1c3RvbSBkYXRhIG9mIHRoZSBwbGFjZSBob2xkZXIgcGFuZWxcblx0XHRcdGlmIChjb250cm9sLmlzQShcInNhcC5tLlBhbmVsXCIpICYmIGNvbnRyb2wuZGF0YShcIkZ1bGxTY3JlZW5UYWJsZVBsYWNlSG9sZGVyXCIpKSB7XG5cdFx0XHRcdHRhYmxlQVBJID0gY29udHJvbC5kYXRhKFwidGFibGVBUElyZWZlcmVuY2VcIik7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbnRyb2wuaXNBKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZUFQSVwiKSkge1xuXHRcdFx0XHR0YWJsZUFQSSA9IGNvbnRyb2wgYXMgVGFibGVBUEk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGFibGVBUEkpIHtcblx0XHRcdFx0cmV0dXJuIHRhYmxlQVBJLmNvbnRlbnQgYXMgVGFibGU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHRQYWdlQ29udHJvbGxlci5wcm90b3R5cGUub25CZWZvcmVSZW5kZXJpbmcuYXBwbHkodGhpcyk7XG5cdFx0Ly8gSW4gdGhlIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Qgc2NlbmFyaW8gd2UgbmVlZCB0byBlbnN1cmUgaW4gY2FzZSBvZiByZWxvYWQvcmVmcmVzaCB0aGF0IHRoZSBtZXRhIG1vZGVsIGluIHRoZSBtZXRob2RlIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Qgb2YgdGhlIEZpZWxkUnVudGltZSBpcyBhdmFpbGFibGVcblx0XHRpZiAodGhpcy5vVmlldy5vVmlld0RhdGE/LnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QgJiYgQ29tbW9uSGVscGVyLmdldE1ldGFNb2RlbCgpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdENvbW1vbkhlbHBlci5zZXRNZXRhTW9kZWwodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0fVxuXHR9XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHQoKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKSBhcyBQcm9taXNlPFJlc291cmNlQnVuZGxlPilcblx0XHRcdC50aGVuKChyZXNwb25zZTogYW55KSA9PiB7XG5cdFx0XHRcdHRoaXMub1Jlc291cmNlQnVuZGxlID0gcmVzcG9uc2U7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSByZXNvdXJjZSBidW5kbGVcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHRcdGxldCBzdWJTZWN0aW9uczogT2JqZWN0UGFnZVN1YlNlY3Rpb25bXTtcblx0XHRpZiAodGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKS5nZXRVc2VJY29uVGFiQmFyKCkpIHtcblx0XHRcdGNvbnN0IHNlY3Rpb25zID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKS5nZXRTZWN0aW9ucygpO1xuXHRcdFx0Zm9yIChjb25zdCBzZWN0aW9uIG9mIHNlY3Rpb25zKSB7XG5cdFx0XHRcdHN1YlNlY3Rpb25zID0gc2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpO1xuXHRcdFx0XHR0aGlzLmNoZWNrU2VjdGlvbnNGb3JHcmlkVGFibGUoc3ViU2VjdGlvbnMpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdWJTZWN0aW9ucyA9IHRoaXMuX2dldEFsbFN1YlNlY3Rpb25zKCk7XG5cdFx0XHR0aGlzLmNoZWNrU2VjdGlvbnNGb3JHcmlkVGFibGUoc3ViU2VjdGlvbnMpO1xuXHRcdH1cblx0fVxuXG5cdF9vbkJlZm9yZUJpbmRpbmcob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdC8vIFRPRE86IHdlIHNob3VsZCBjaGVjayBob3cgdGhpcyBjb21lcyB0b2dldGhlciB3aXRoIHRoZSB0cmFuc2FjdGlvbiBoZWxwZXIsIHNhbWUgdG8gdGhlIGNoYW5nZSBpbiB0aGUgYWZ0ZXJCaW5kaW5nXG5cdFx0Y29uc3QgYVRhYmxlcyA9IHRoaXMuX2ZpbmRUYWJsZXMoKSxcblx0XHRcdG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKSxcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRvSW50ZXJuYWxNb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsLFxuXHRcdFx0YUJhdGNoR3JvdXBzID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiYmF0Y2hHcm91cHNcIiksXG5cdFx0XHRpVmlld0xldmVsID0gKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS52aWV3TGV2ZWw7XG5cdFx0bGV0IG9GYXN0Q3JlYXRpb25Sb3c7XG5cdFx0YUJhdGNoR3JvdXBzLnB1c2goXCIkYXV0b1wiKTtcblx0XHRpZiAobVBhcmFtZXRlcnMuYkRyYWZ0TmF2aWdhdGlvbiAhPT0gdHJ1ZSkge1xuXHRcdFx0dGhpcy5fY2xvc2VTaWRlQ29udGVudCgpO1xuXHRcdH1cblx0XHRjb25zdCBvcENvbnRleHQgPSBvT2JqZWN0UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0aWYgKFxuXHRcdFx0b3BDb250ZXh0ICYmXG5cdFx0XHRvcENvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSAmJlxuXHRcdFx0IWFCYXRjaEdyb3Vwcy5zb21lKChvcENvbnRleHQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsKS5oYXNQZW5kaW5nQ2hhbmdlcy5iaW5kKG9wQ29udGV4dC5nZXRNb2RlbCgpKSlcblx0XHQpIHtcblx0XHRcdC8qIFx0SW4gY2FzZSB0aGVyZSBhcmUgcGVuZGluZyBjaGFuZ2VzIGZvciB0aGUgY3JlYXRpb24gcm93IGFuZCBubyBvdGhlcnMgd2UgbmVlZCB0byByZXNldCB0aGUgY2hhbmdlc1xuICAgIFx0XHRcdFx0XHRcdFRPRE86IHRoaXMgaXMganVzdCBhIHF1aWNrIHNvbHV0aW9uLCB0aGlzIG5lZWRzIHRvIGJlIHJld29ya2VkXG4gICAgXHRcdFx0XHQgXHQqL1xuXG5cdFx0XHRvcENvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdH1cblxuXHRcdC8vIEZvciBub3cgd2UgaGF2ZSB0byBzZXQgdGhlIGJpbmRpbmcgY29udGV4dCB0byBudWxsIGZvciBldmVyeSBmYXN0IGNyZWF0aW9uIHJvd1xuXHRcdC8vIFRPRE86IEdldCByaWQgb2YgdGhpcyBjb2Rpbmcgb3IgbW92ZSBpdCB0byBhbm90aGVyIGxheWVyIC0gdG8gYmUgZGlzY3Vzc2VkIHdpdGggTURDIGFuZCBtb2RlbFxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVRhYmxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0b0Zhc3RDcmVhdGlvblJvdyA9IGFUYWJsZXNbaV0uZ2V0Q3JlYXRpb25Sb3coKTtcblx0XHRcdGlmIChvRmFzdENyZWF0aW9uUm93KSB7XG5cdFx0XHRcdG9GYXN0Q3JlYXRpb25Sb3cuc2V0QmluZGluZ0NvbnRleHQobnVsbCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gU2Nyb2xsIHRvIHByZXNlbnQgU2VjdGlvbiBzbyB0aGF0IGJpbmRpbmdzIGFyZSBlbmFibGVkIGR1cmluZyBuYXZpZ2F0aW9uIHRocm91Z2ggcGFnaW5hdG9yIGJ1dHRvbnMsIGFzIHRoZXJlIGlzIG5vIHZpZXcgcmVyZW5kZXJpbmcvcmViaW5kXG5cdFx0Y29uc3QgZm5TY3JvbGxUb1ByZXNlbnRTZWN0aW9uID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKCEob09iamVjdFBhZ2UgYXMgYW55KS5pc0ZpcnN0UmVuZGVyaW5nKCkgJiYgIW1QYXJhbWV0ZXJzLmJQZXJzaXN0T1BTY3JvbGwpIHtcblx0XHRcdFx0b09iamVjdFBhZ2Uuc2V0U2VsZWN0ZWRTZWN0aW9uKG51bGwgYXMgYW55KTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdG9PYmplY3RQYWdlLmF0dGFjaEV2ZW50T25jZShcIm1vZGVsQ29udGV4dENoYW5nZVwiLCBmblNjcm9sbFRvUHJlc2VudFNlY3Rpb24pO1xuXG5cdFx0Ly8gaWYgdGhlIHN0cnVjdHVyZSBvZiB0aGUgT2JqZWN0UGFnZUxheW91dCBpcyBjaGFuZ2VkIHRoZW4gc2Nyb2xsIHRvIHByZXNlbnQgU2VjdGlvblxuXHRcdC8vIEZJWE1FIElzIHRoaXMgcmVhbGx5IHdvcmtpbmcgYXMgaW50ZW5kZWQgPyBJbml0aWFsbHkgdGhpcyB3YXMgb25CZWZvcmVSZW5kZXJpbmcsIGJ1dCBuZXZlciB0cmlnZ2VyZWQgb25CZWZvcmVSZW5kZXJpbmcgYmVjYXVzZSBpdCB3YXMgcmVnaXN0ZXJlZCBhZnRlciBpdFxuXHRcdGNvbnN0IG9EZWxlZ2F0ZU9uQmVmb3JlID0ge1xuXHRcdFx0b25BZnRlclJlbmRlcmluZzogZm5TY3JvbGxUb1ByZXNlbnRTZWN0aW9uXG5cdFx0fTtcblx0XHRvT2JqZWN0UGFnZS5hZGRFdmVudERlbGVnYXRlKG9EZWxlZ2F0ZU9uQmVmb3JlLCB0aGlzKTtcblx0XHR0aGlzLnBhZ2VSZWFkeS5hdHRhY2hFdmVudE9uY2UoXCJwYWdlUmVhZHlcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0b09iamVjdFBhZ2UucmVtb3ZlRXZlbnREZWxlZ2F0ZShvRGVsZWdhdGVPbkJlZm9yZSk7XG5cdFx0fSk7XG5cblx0XHQvL1NldCB0aGUgQmluZGluZyBmb3IgUGFnaW5hdG9ycyB1c2luZyBMaXN0QmluZGluZyBJRFxuXHRcdGlmIChpVmlld0xldmVsID4gMSkge1xuXHRcdFx0bGV0IG9CaW5kaW5nID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMubGlzdEJpbmRpbmc7XG5cdFx0XHRjb25zdCBvUGFnaW5hdG9yQ3VycmVudENvbnRleHQgPSBvSW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShcIi9wYWdpbmF0b3JDdXJyZW50Q29udGV4dFwiKTtcblx0XHRcdGlmIChvUGFnaW5hdG9yQ3VycmVudENvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgb0JpbmRpbmdUb1VzZSA9IG9QYWdpbmF0b3JDdXJyZW50Q29udGV4dC5nZXRCaW5kaW5nKCk7XG5cdFx0XHRcdHRoaXMucGFnaW5hdG9yLmluaXRpYWxpemUob0JpbmRpbmdUb1VzZSwgb1BhZ2luYXRvckN1cnJlbnRDb250ZXh0KTtcblx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvcGFnaW5hdG9yQ3VycmVudENvbnRleHRcIiwgbnVsbCk7XG5cdFx0XHR9IGVsc2UgaWYgKG9CaW5kaW5nKSB7XG5cdFx0XHRcdGlmIChvQmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0XHRcdHRoaXMucGFnaW5hdG9yLmluaXRpYWxpemUob0JpbmRpbmcsIG9Db250ZXh0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBpZiB0aGUgYmluZGluZyB0eXBlIGlzIG5vdCBPRGF0YUxpc3RCaW5kaW5nIGJlY2F1c2Ugb2YgYSBkZWVwbGluayBuYXZpZ2F0aW9uIG9yIGEgcmVmcmVzaCBvZiB0aGUgcGFnZVxuXHRcdFx0XHRcdC8vIHdlIG5lZWQgdG8gY3JlYXRlIGl0XG5cdFx0XHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0JpbmRpbmcuZ2V0UGF0aCgpO1xuXHRcdFx0XHRcdGlmICgvXFwoW15cXCldKlxcKSQvLnRlc3Qoc0JpbmRpbmdQYXRoKSkge1xuXHRcdFx0XHRcdFx0Ly8gVGhlIGN1cnJlbnQgYmluZGluZyBwYXRoIGVuZHMgd2l0aCAoeHh4KSwgc28gd2UgY3JlYXRlIHRoZSBsaXN0QmluZGluZyBieSByZW1vdmluZyAoeHh4KVxuXHRcdFx0XHRcdFx0Y29uc3Qgc0xpc3RCaW5kaW5nUGF0aCA9IHNCaW5kaW5nUGF0aC5yZXBsYWNlKC9cXChbXlxcKV0qXFwpJC8sIFwiXCIpO1xuXHRcdFx0XHRcdFx0b0JpbmRpbmcgPSBuZXcgKE9EYXRhTGlzdEJpbmRpbmcgYXMgYW55KShvQmluZGluZy5vTW9kZWwsIHNMaXN0QmluZGluZ1BhdGgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgX3NldExpc3RCaW5kaW5nQXN5bmMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChvQmluZGluZy5nZXRDb250ZXh0cygpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnBhZ2luYXRvci5pbml0aWFsaXplKG9CaW5kaW5nLCBvQ29udGV4dCk7XG5cdFx0XHRcdFx0XHRcdFx0b0JpbmRpbmcuZGV0YWNoRXZlbnQoXCJjaGFuZ2VcIiwgX3NldExpc3RCaW5kaW5nQXN5bmMpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRvQmluZGluZy5nZXRDb250ZXh0cygwKTtcblx0XHRcdFx0XHRcdG9CaW5kaW5nLmF0dGFjaEV2ZW50KFwiY2hhbmdlXCIsIF9zZXRMaXN0QmluZGluZ0FzeW5jKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gVGhlIGN1cnJlbnQgYmluZGluZyBkb2Vzbid0IGVuZCB3aXRoICh4eHgpIC0tPiB0aGUgbGFzdCBzZWdtZW50IGlzIGEgMS0xIG5hdmlnYXRpb24sIHNvIHdlIGRvbid0IGRpc3BsYXkgdGhlIHBhZ2luYXRvclxuXHRcdFx0XHRcdFx0dGhpcy5wYWdpbmF0b3IuaW5pdGlhbGl6ZSh1bmRlZmluZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoISh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkudXNlTmV3TGF6eUxvYWRpbmcgJiYgb09iamVjdFBhZ2UuZ2V0RW5hYmxlTGF6eUxvYWRpbmcoKSkge1xuXHRcdFx0Y29uc3QgYVNlY3Rpb25zID0gb09iamVjdFBhZ2UuZ2V0U2VjdGlvbnMoKTtcblx0XHRcdGNvbnN0IGJVc2VJY29uVGFiQmFyID0gb09iamVjdFBhZ2UuZ2V0VXNlSWNvblRhYkJhcigpO1xuXHRcdFx0bGV0IGlTa2lwID0gMjtcblx0XHRcdGNvbnN0IGJJc0luRWRpdE1vZGUgPSBvT2JqZWN0UGFnZS5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIik7XG5cdFx0XHRjb25zdCBiRWRpdGFibGVIZWFkZXIgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVkaXRhYmxlSGVhZGVyQ29udGVudDtcblx0XHRcdGZvciAobGV0IGlTZWN0aW9uID0gMDsgaVNlY3Rpb24gPCBhU2VjdGlvbnMubGVuZ3RoOyBpU2VjdGlvbisrKSB7XG5cdFx0XHRcdGNvbnN0IG9TZWN0aW9uID0gYVNlY3Rpb25zW2lTZWN0aW9uXTtcblx0XHRcdFx0Y29uc3QgYVN1YlNlY3Rpb25zID0gb1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKTtcblx0XHRcdFx0Zm9yIChsZXQgaVN1YlNlY3Rpb24gPSAwOyBpU3ViU2VjdGlvbiA8IGFTdWJTZWN0aW9ucy5sZW5ndGg7IGlTdWJTZWN0aW9uKyssIGlTa2lwLS0pIHtcblx0XHRcdFx0XHQvLyBJbiBJY29uVGFiQmFyIG1vZGUga2VlcCB0aGUgc2Vjb25kIHNlY3Rpb24gYm91bmQgaWYgdGhlcmUgaXMgYW4gZWRpdGFibGUgaGVhZGVyIGFuZCB3ZSBhcmUgc3dpdGNoaW5nIHRvIGRpc3BsYXkgbW9kZVxuXHRcdFx0XHRcdGlmIChpU2tpcCA8IDEgfHwgKGJVc2VJY29uVGFiQmFyICYmIChpU2VjdGlvbiA+IDEgfHwgKGlTZWN0aW9uID09PSAxICYmICFiRWRpdGFibGVIZWFkZXIgJiYgIWJJc0luRWRpdE1vZGUpKSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9TdWJTZWN0aW9uID0gYVN1YlNlY3Rpb25zW2lTdWJTZWN0aW9uXTtcblx0XHRcdFx0XHRcdGlmIChvU3ViU2VjdGlvbi5kYXRhKCkuaXNWaXNpYmlsaXR5RHluYW1pYyAhPT0gXCJ0cnVlXCIpIHtcblx0XHRcdFx0XHRcdFx0b1N1YlNlY3Rpb24uc2V0QmluZGluZ0NvbnRleHQobnVsbCBhcyBhbnkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLnBsYWNlaG9sZGVyLmlzUGxhY2Vob2xkZXJFbmFibGVkKCkgJiYgbVBhcmFtZXRlcnMuc2hvd1BsYWNlaG9sZGVyKSB7XG5cdFx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdFx0Y29uc3Qgb05hdkNvbnRhaW5lciA9IChvVmlldy5nZXRQYXJlbnQoKSBhcyBhbnkpLm9Db250YWluZXIuZ2V0UGFyZW50KCk7XG5cdFx0XHRpZiAob05hdkNvbnRhaW5lcikge1xuXHRcdFx0XHRvTmF2Q29udGFpbmVyLnNob3dQbGFjZWhvbGRlcih7fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2dldEZpcnN0Q2xpY2thYmxlRWxlbWVudChvT2JqZWN0UGFnZTogYW55KSB7XG5cdFx0bGV0IG9GaXJzdENsaWNrYWJsZUVsZW1lbnQ7XG5cdFx0Y29uc3QgYUFjdGlvbnMgPSBvT2JqZWN0UGFnZS5nZXRIZWFkZXJUaXRsZSgpICYmIG9PYmplY3RQYWdlLmdldEhlYWRlclRpdGxlKCkuZ2V0QWN0aW9ucygpO1xuXHRcdGlmIChhQWN0aW9ucyAmJiBhQWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdG9GaXJzdENsaWNrYWJsZUVsZW1lbnQgPSBhQWN0aW9ucy5maW5kKGZ1bmN0aW9uIChvQWN0aW9uOiBhbnkpIHtcblx0XHRcdFx0Ly8gRHVlIHRvIHRoZSBsZWZ0IGFsaWdubWVudCBvZiB0aGUgRHJhZnQgc3dpdGNoIGFuZCB0aGUgY29sbGFib3JhdGl2ZSBkcmFmdCBhdmF0YXIgY29udHJvbHNcblx0XHRcdFx0Ly8gdGhlcmUgaXMgYSBUb29sYmFyU3BhY2VyIGluIHRoZSBhY3Rpb25zIGFnZ3JlZ2F0aW9uIHdoaWNoIHdlIG5lZWQgdG8gZXhjbHVkZSBoZXJlIVxuXHRcdFx0XHQvLyBEdWUgdG8gdGhlIEFDQyByZXBvcnQsIHdlIGFsc28gbmVlZCBub3QgdG8gY2hlY2sgZm9yIHRoZSBJbnZpc2libGVUZXh0IGVsZW1lbnRzXG5cdFx0XHRcdGlmIChvQWN0aW9uLmlzQShcInNhcC5mZS5tYWNyb3Muc2hhcmUuU2hhcmVBUElcIikpIHtcblx0XHRcdFx0XHQvLyBzaW5jZSBTaGFyZUFQSSBkb2VzIG5vdCBoYXZlIGEgZGlzYWJsZSBwcm9wZXJ0eVxuXHRcdFx0XHRcdC8vIGhlbmNlIHRoZXJlIGlzIG5vIG5lZWQgdG8gY2hlY2sgaWYgaXQgaXMgZGlzYmFsZWQgb3Igbm90XG5cdFx0XHRcdFx0cmV0dXJuIG9BY3Rpb24uZ2V0VmlzaWJsZSgpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFvQWN0aW9uLmlzQShcInNhcC51aS5jb3JlLkludmlzaWJsZVRleHRcIikgJiYgIW9BY3Rpb24uaXNBKFwic2FwLm0uVG9vbGJhclNwYWNlclwiKSkge1xuXHRcdFx0XHRcdHJldHVybiBvQWN0aW9uLmdldFZpc2libGUoKSAmJiBvQWN0aW9uLmdldEVuYWJsZWQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBvRmlyc3RDbGlja2FibGVFbGVtZW50O1xuXHR9XG5cblx0X2dldEZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZEZyb21TdWJTZWN0aW9uKGFTdWJTZWN0aW9uczogYW55KSB7XG5cdFx0aWYgKGFTdWJTZWN0aW9ucykge1xuXHRcdFx0Zm9yIChsZXQgc3ViU2VjdGlvbiA9IDA7IHN1YlNlY3Rpb24gPCBhU3ViU2VjdGlvbnMubGVuZ3RoOyBzdWJTZWN0aW9uKyspIHtcblx0XHRcdFx0Y29uc3QgYUJsb2NrcyA9IGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRCbG9ja3MoKTtcblxuXHRcdFx0XHRpZiAoYUJsb2Nrcykge1xuXHRcdFx0XHRcdGZvciAobGV0IGJsb2NrID0gMDsgYmxvY2sgPCBhQmxvY2tzLmxlbmd0aDsgYmxvY2srKykge1xuXHRcdFx0XHRcdFx0bGV0IGFGb3JtQ29udGFpbmVycztcblxuXHRcdFx0XHRcdFx0aWYgKGFCbG9ja3NbYmxvY2tdLmlzQShcInNhcC51aS5sYXlvdXQuZm9ybS5Gb3JtXCIpKSB7XG5cdFx0XHRcdFx0XHRcdGFGb3JtQ29udGFpbmVycyA9IGFCbG9ja3NbYmxvY2tdLmdldEZvcm1Db250YWluZXJzKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0XHRhQmxvY2tzW2Jsb2NrXS5nZXRDb250ZW50ICYmXG5cdFx0XHRcdFx0XHRcdGFCbG9ja3NbYmxvY2tdLmdldENvbnRlbnQoKSAmJlxuXHRcdFx0XHRcdFx0XHRhQmxvY2tzW2Jsb2NrXS5nZXRDb250ZW50KCkuaXNBKFwic2FwLnVpLmxheW91dC5mb3JtLkZvcm1cIilcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRhRm9ybUNvbnRhaW5lcnMgPSBhQmxvY2tzW2Jsb2NrXS5nZXRDb250ZW50KCkuZ2V0Rm9ybUNvbnRhaW5lcnMoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKGFGb3JtQ29udGFpbmVycykge1xuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBmb3JtQ29udGFpbmVyID0gMDsgZm9ybUNvbnRhaW5lciA8IGFGb3JtQ29udGFpbmVycy5sZW5ndGg7IGZvcm1Db250YWluZXIrKykge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFGb3JtRWxlbWVudHMgPSBhRm9ybUNvbnRhaW5lcnNbZm9ybUNvbnRhaW5lcl0uZ2V0Rm9ybUVsZW1lbnRzKCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFGb3JtRWxlbWVudHMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGZvcm1FbGVtZW50ID0gMDsgZm9ybUVsZW1lbnQgPCBhRm9ybUVsZW1lbnRzLmxlbmd0aDsgZm9ybUVsZW1lbnQrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhRmllbGRzID0gYUZvcm1FbGVtZW50c1tmb3JtRWxlbWVudF0uZ2V0RmllbGRzKCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gVGhlIGZpcnN0IGZpZWxkIGlzIG5vdCBuZWNlc3NhcmlseSBhbiBJbnB1dEJhc2UgKGUuZy4gY291bGQgYmUgYSBUZXh0KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBTbyB3ZSBuZWVkIHRvIGNoZWNrIHdoZXRoZXIgaXQgaGFzIGEgZ2V0UmVxdWlyZWQgbWV0aG9kXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGFGaWVsZHNbMF0uZ2V0UmVxdWlyZWQgJiYgYUZpZWxkc1swXS5nZXRSZXF1aXJlZCgpICYmICFhRmllbGRzWzBdLmdldFZhbHVlKCkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBhRmllbGRzWzBdO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRMb2cuZGVidWcoYEVycm9yIHdoZW4gc2VhcmNoaW5nIGZvciBtYW5kYW90cnkgZW1wdHkgZmllbGQ6ICR7ZXJyb3J9YCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdF91cGRhdGVGb2N1c0luRWRpdE1vZGUoYVN1YlNlY3Rpb25zOiBhbnkpIHtcblx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCk7XG5cblx0XHRjb25zdCBvTWFuZGF0b3J5RmllbGQgPSB0aGlzLl9nZXRGaXJzdEVtcHR5TWFuZGF0b3J5RmllbGRGcm9tU3ViU2VjdGlvbihhU3ViU2VjdGlvbnMpO1xuXHRcdGxldCBvRmllbGRUb0ZvY3VzOiBhbnk7XG5cdFx0aWYgKG9NYW5kYXRvcnlGaWVsZCkge1xuXHRcdFx0b0ZpZWxkVG9Gb2N1cyA9IG9NYW5kYXRvcnlGaWVsZC5jb250ZW50LmdldENvbnRlbnRFZGl0KClbMF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9GaWVsZFRvRm9jdXMgPSAob09iamVjdFBhZ2UgYXMgYW55KS5fZ2V0Rmlyc3RFZGl0YWJsZUlucHV0KCkgfHwgdGhpcy5fZ2V0Rmlyc3RDbGlja2FibGVFbGVtZW50KG9PYmplY3RQYWdlKTtcblx0XHR9XG5cblx0XHRpZiAob0ZpZWxkVG9Gb2N1cykge1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIFdlIHNldCB0aGUgZm9jdXMgaW4gYSB0aW1lZW91dCwgb3RoZXJ3aXNlIHRoZSBmb2N1cyBzb21ldGltZXMgZ29lcyB0byB0aGUgVGFiQmFyXG5cdFx0XHRcdG9GaWVsZFRvRm9jdXMuZm9jdXMoKTtcblx0XHRcdH0sIDApO1xuXHRcdH1cblx0fVxuXG5cdF9oYW5kbGVTdWJTZWN0aW9uRW50ZXJlZFZpZXdQb3J0KG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3Qgb1N1YlNlY3Rpb24gPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwic3ViU2VjdGlvblwiKTtcblx0XHRvU3ViU2VjdGlvbi5zZXRCaW5kaW5nQ29udGV4dCh1bmRlZmluZWQpO1xuXHR9XG5cblx0X29uQmFja05hdmlnYXRpb25JbkRyYWZ0KG9Db250ZXh0OiBhbnkpIHtcblx0XHR0aGlzLm1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdGlmICh0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvdXRlclByb3h5KCkuY2hlY2tJZkJhY2tIYXNTYW1lQ29udGV4dCgpKSB7XG5cdFx0XHQvLyBCYWNrIG5hdiB3aWxsIGtlZXAgdGhlIHNhbWUgY29udGV4dCAtLT4gbm8gbmVlZCB0byBkaXNwbGF5IHRoZSBkaWFsb2dcblx0XHRcdGhpc3RvcnkuYmFjaygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkcmFmdC5wcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbihcblx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGhpc3RvcnkuYmFjaygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRGdW5jdGlvbi5wcm90b3R5cGUsXG5cdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0ZHJhZnQuTmF2aWdhdGlvblR5cGUuQmFja05hdmlnYXRpb25cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRfb25BZnRlckJpbmRpbmcob0JpbmRpbmdDb250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCk7XG5cdFx0Y29uc3QgYVRhYmxlcyA9IHRoaXMuX2ZpbmRUYWJsZXMoKTtcblxuXHRcdHRoaXMuX3NpZGVFZmZlY3RzLmNsZWFyUHJvcGVydGllc1N0YXR1cygpO1xuXG5cdFx0Ly8gVE9ETzogdGhpcyBpcyBvbmx5IGEgdGVtcCBzb2x1dGlvbiBhcyBsb25nIGFzIHRoZSBtb2RlbCBmaXggdGhlIGNhY2hlIGlzc3VlIGFuZCB3ZSB1c2UgdGhpcyBhZGRpdGlvbmFsXG5cdFx0Ly8gYmluZGluZyB3aXRoIG93blJlcXVlc3Rcblx0XHRvQmluZGluZ0NvbnRleHQgPSBvT2JqZWN0UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXG5cdFx0bGV0IGFJQk5BY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdG9PYmplY3RQYWdlLmdldFNlY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAob1NlY3Rpb246IGFueSkge1xuXHRcdFx0b1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvU3ViU2VjdGlvbjogYW55KSB7XG5cdFx0XHRcdGFJQk5BY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0SUJOQWN0aW9ucyhvU3ViU2VjdGlvbiwgYUlCTkFjdGlvbnMpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHQvLyBBc3NpZ24gaW50ZXJuYWwgYmluZGluZyBjb250ZXh0cyB0byBvRm9ybUNvbnRhaW5lcjpcblx0XHQvLyAxLiBJdCBpcyBub3QgcG9zc2libGUgdG8gYXNzaWduIHRoZSBpbnRlcm5hbCBiaW5kaW5nIGNvbnRleHQgdG8gdGhlIFhNTCBmcmFnbWVudFxuXHRcdC8vIChGb3JtQ29udGFpbmVyLmZyYWdtZW50LnhtbCkgeWV0IC0gaXQgaXMgdXNlZCBhbHJlYWR5IGZvciB0aGUgZGF0YS1zdHJ1Y3R1cmUuXG5cdFx0Ly8gMi4gQW5vdGhlciBwcm9ibGVtIGlzLCB0aGF0IEZvcm1Db250YWluZXJzIGFzc2lnbmVkIHRvIGEgJ01vcmVCbG9jaycgZG9lcyBub3QgaGF2ZSBhblxuXHRcdC8vIGludGVybmFsIG1vZGVsIGNvbnRleHQgYXQgYWxsLlxuXG5cdFx0YVRhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJjcmVhdGlvblJvd0ZpZWxkVmFsaWRpdHlcIiwge30pO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dDdXN0b21WYWxpZGl0eVwiLCB7fSk7XG5cblx0XHRcdGFJQk5BY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0SUJOQWN0aW9ucyhvVGFibGUsIGFJQk5BY3Rpb25zKTtcblx0XHRcdC8vIHRlbXBvcmFyeSB3b3JrYXJvdW5kIGZvciBCQ1A6IDIwODAyMTgwMDRcblx0XHRcdC8vIE5lZWQgdG8gZml4IHdpdGggQkxJOiBGSU9SSVRFQ0hQMS0xNTI3NFxuXHRcdFx0Ly8gb25seSBmb3IgZWRpdCBtb2RlLCB3ZSBjbGVhciB0aGUgdGFibGUgY2FjaGVcblx0XHRcdC8vIFdvcmthcm91bmQgc3RhcnRzIGhlcmUhIVxuXHRcdFx0Y29uc3Qgb1RhYmxlUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRpZiAob1RhYmxlUm93QmluZGluZykge1xuXHRcdFx0XHRpZiAoTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9UYWJsZVJvd0JpbmRpbmcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSkpIHtcblx0XHRcdFx0XHQvLyBhcHBseSBmb3IgYm90aCBlZGl0IGFuZCBkaXNwbGF5IG1vZGUgaW4gc3RpY2t5XG5cdFx0XHRcdFx0b1RhYmxlUm93QmluZGluZy5yZW1vdmVDYWNoZXNBbmRNZXNzYWdlcyhcIlwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gV29ya2Fyb3VuZCBlbmRzIGhlcmUhIVxuXG5cdFx0XHQvLyBVcGRhdGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbiBidXR0b25zIG9uIHRhYmxlIHRvb2xiYXJcblx0XHRcdC8vIFRoZSBzYW1lIGlzIGFsc28gcGVyZm9ybWVkIG9uIFRhYmxlIHNlbGVjdGlvbkNoYW5nZSBldmVudFxuXHRcdFx0Y29uc3Qgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IEpTT04ucGFyc2UoXG5cdFx0XHRcdFx0Q29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwib3BlcmF0aW9uQXZhaWxhYmxlTWFwXCIpKVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0cyA9IG9UYWJsZS5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cblx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChvSW50ZXJuYWxNb2RlbENvbnRleHQsIG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAsIGFTZWxlY3RlZENvbnRleHRzLCBcInRhYmxlXCIpO1xuXHRcdFx0Ly8gQ2xlYXIgdGhlIHNlbGVjdGlvbiBpbiB0aGUgdGFibGUsIG5lZWQgdG8gYmUgZml4ZWQgYW5kIHJldmlldyB3aXRoIEJMSTogRklPUklURUNIUDEtMjQzMThcblx0XHRcdG9UYWJsZS5jbGVhclNlbGVjdGlvbigpO1xuXHRcdH0pO1xuXHRcdENvbW1vblV0aWxzLmdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwodGhpcywgXCJfcGFnZU1vZGVsXCIpO1xuXHRcdC8vUmV0cmlldmUgT2JqZWN0IFBhZ2UgaGVhZGVyIGFjdGlvbnMgZnJvbSBPYmplY3QgUGFnZSB0aXRsZSBjb250cm9sXG5cdFx0Y29uc3Qgb09iamVjdFBhZ2VUaXRsZSA9IG9PYmplY3RQYWdlLmdldEhlYWRlclRpdGxlKCk7XG5cdFx0bGV0IGFJQk5IZWFkZXJBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdGFJQk5IZWFkZXJBY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0SUJOQWN0aW9ucyhvT2JqZWN0UGFnZVRpdGxlLCBhSUJOSGVhZGVyQWN0aW9ucyk7XG5cdFx0YUlCTkFjdGlvbnMgPSBhSUJOQWN0aW9ucy5jb25jYXQoYUlCTkhlYWRlckFjdGlvbnMpO1xuXHRcdENvbW1vblV0aWxzLnVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5KGFJQk5BY3Rpb25zLCB0aGlzLmdldFZpZXcoKSk7XG5cblx0XHRsZXQgb01vZGVsOiBhbnksIG9GaW5hbFVJU3RhdGU6IGFueTtcblxuXHRcdC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIG1vdmVkIGludG8gYW4gaW5pdCBldmVudCBvZiB0aGUgTURDIHRhYmxlcyAobm90IHlldCBleGlzdGluZykgYW5kIHNob3VsZCBiZSBwYXJ0XG5cdFx0Ly8gb2YgYW55IGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5cdFx0LyoqXG5cdFx0ICogQHBhcmFtIG9UYWJsZVxuXHRcdCAqIEBwYXJhbSBvTGlzdEJpbmRpbmdcblx0XHQgKi9cblx0XHRhc3luYyBmdW5jdGlvbiBlbmFibGVGYXN0Q3JlYXRpb25Sb3cob1RhYmxlOiBhbnksIG9MaXN0QmluZGluZzogYW55KSB7XG5cdFx0XHRjb25zdCBvRmFzdENyZWF0aW9uUm93ID0gb1RhYmxlLmdldENyZWF0aW9uUm93KCk7XG5cdFx0XHRsZXQgb0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLCBvRmFzdENyZWF0aW9uQ29udGV4dDtcblxuXHRcdFx0aWYgKG9GYXN0Q3JlYXRpb25Sb3cpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRhd2FpdCBvRmluYWxVSVN0YXRlO1xuXHRcdFx0XHRcdGlmIChvRmFzdENyZWF0aW9uUm93LmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0b0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nID0gb01vZGVsLmJpbmRMaXN0KG9MaXN0QmluZGluZy5nZXRQYXRoKCksIG9MaXN0QmluZGluZy5nZXRDb250ZXh0KCksIFtdLCBbXSwge1xuXHRcdFx0XHRcdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwiZG9Ob3RTdWJtaXRcIixcblx0XHRcdFx0XHRcdFx0JCRncm91cElkOiBcImRvTm90U3VibWl0XCJcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Ly8gV29ya2Fyb3VuZCBzdWdnZXN0ZWQgYnkgT0RhdGEgbW9kZWwgdjQgY29sbGVhZ3Vlc1xuXHRcdFx0XHRcdFx0b0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLnJlZnJlc2hJbnRlcm5hbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0LyogZG8gbm90aGluZyAqL1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdG9GYXN0Q3JlYXRpb25Db250ZXh0ID0gb0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLmNyZWF0ZSgpO1xuXHRcdFx0XHRcdFx0b0Zhc3RDcmVhdGlvblJvdy5zZXRCaW5kaW5nQ29udGV4dChvRmFzdENyZWF0aW9uQ29udGV4dCk7XG5cblx0XHRcdFx0XHRcdC8vIHRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIGNvbnNvbGUgZXJyb3Jcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IG9GYXN0Q3JlYXRpb25Db250ZXh0LmNyZWF0ZWQoKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdFx0TG9nLnRyYWNlKFwidHJhbnNpZW50IGZhc3QgY3JlYXRpb24gY29udGV4dCBkZWxldGVkXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBjb21wdXRpbmcgdGhlIGZpbmFsIFVJIHN0YXRlXCIsIG9FcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyB0aGlzIHNob3VsZCBub3QgYmUgbmVlZGVkIGF0IHRoZSBhbGxcblx0XHQvKipcblx0XHQgKiBAcGFyYW0gb1RhYmxlXG5cdFx0ICovXG5cdFx0Y29uc3QgaGFuZGxlVGFibGVNb2RpZmljYXRpb25zID0gKG9UYWJsZTogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvQmluZGluZyA9IHRoaXMuX2dldFRhYmxlQmluZGluZyhvVGFibGUpLFxuXHRcdFx0XHRmbkhhbmRsZVRhYmxlUGF0Y2hFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0ZW5hYmxlRmFzdENyZWF0aW9uUm93KG9UYWJsZSwgb0JpbmRpbmcpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRpZiAoIW9CaW5kaW5nKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgRXhwZWN0ZWQgYmluZGluZyBtaXNzaW5nIGZvciB0YWJsZTogJHtvVGFibGUuZ2V0SWQoKX1gKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0JpbmRpbmcub0NvbnRleHQpIHtcblx0XHRcdFx0Zm5IYW5kbGVUYWJsZVBhdGNoRXZlbnRzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmbkhhbmRsZUNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAob0JpbmRpbmcub0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdGZuSGFuZGxlVGFibGVQYXRjaEV2ZW50cygpO1xuXHRcdFx0XHRcdFx0b0JpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuSGFuZGxlQ2hhbmdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9CaW5kaW5nLmF0dGFjaENoYW5nZShmbkhhbmRsZUNoYW5nZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChvQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdG9Nb2RlbCA9IG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpO1xuXG5cdFx0XHQvLyBDb21wdXRlIEVkaXQgTW9kZVxuXHRcdFx0b0ZpbmFsVUlTdGF0ZSA9IHRoaXMuX2VkaXRGbG93LmNvbXB1dGVFZGl0TW9kZShvQmluZGluZ0NvbnRleHQpO1xuXG5cdFx0XHRpZiAoTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQob01vZGVsLmdldE1ldGFNb2RlbCgpKSkge1xuXHRcdFx0XHRvRmluYWxVSVN0YXRlXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRjb25uZWN0KHRoaXMuZ2V0VmlldygpKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpKSB7XG5cdFx0XHRcdFx0XHRcdGRpc2Nvbm5lY3QodGhpcy5nZXRWaWV3KCkpOyAvLyBDbGVhbnVwIGNvbGxhYm9yYXRpb24gY29ubmVjdGlvbiBpbiBjYXNlIHdlIHN3aXRjaCB0byBhbm90aGVyIGVsZW1lbnQgKGUuZy4gaW4gRkNMKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgd2FpdGluZyBmb3IgdGhlIGZpbmFsIFVJIFN0YXRlXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHVwZGF0ZSByZWxhdGVkIGFwcHMgb25jZSBEYXRhIGlzIHJlY2VpdmVkIGluIGNhc2Ugb2YgYmluZGluZyBjYWNoZSBpcyBub3QgYXZhaWxhYmxlXG5cdFx0XHQvLyBUT0RPOiB0aGlzIGlzIG9ubHkgYSB0ZW1wIHNvbHV0aW9uIHNpbmNlIHdlIG5lZWQgdG8gY2FsbCBfdXBkYXRlUmVsYXRlZEFwcHMgbWV0aG9kIG9ubHkgYWZ0ZXIgZGF0YSBmb3IgT2JqZWN0IFBhZ2UgaXMgcmVjZWl2ZWQgKGlmIHRoZXJlIGlzIG5vIGJpbmRpbmcpXG5cdFx0XHRpZiAob0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKS5vQ2FjaGUpIHtcblx0XHRcdFx0dGhpcy5fdXBkYXRlUmVsYXRlZEFwcHMoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGZuVXBkYXRlUmVsYXRlZEFwcHMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlUmVsYXRlZEFwcHMoKTtcblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpLmRldGFjaERhdGFSZWNlaXZlZChmblVwZGF0ZVJlbGF0ZWRBcHBzKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKS5hdHRhY2hEYXRhUmVjZWl2ZWQoZm5VcGRhdGVSZWxhdGVkQXBwcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vQXR0YWNoIHRoZSBwYXRjaCBzZW50IGFuZCBwYXRjaCBjb21wbGV0ZWQgZXZlbnQgdG8gdGhlIG9iamVjdCBwYWdlIGJpbmRpbmcgc28gdGhhdCB3ZSBjYW4gcmVhY3Rcblx0XHRcdGNvbnN0IG9CaW5kaW5nID0gKG9CaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nICYmIG9CaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nKCkpIHx8IG9CaW5kaW5nQ29udGV4dDtcblxuXHRcdFx0Ly8gQXR0YWNoIHRoZSBldmVudCBoYW5kbGVyIG9ubHkgb25jZSB0byB0aGUgc2FtZSBiaW5kaW5nXG5cdFx0XHRpZiAodGhpcy5jdXJyZW50QmluZGluZyAhPT0gb0JpbmRpbmcpIHtcblx0XHRcdFx0b0JpbmRpbmcuYXR0YWNoRXZlbnQoXCJwYXRjaFNlbnRcIiwgdGhpcy5lZGl0Rmxvdy5oYW5kbGVQYXRjaFNlbnQsIHRoaXMpO1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRCaW5kaW5nID0gb0JpbmRpbmc7XG5cdFx0XHR9XG5cblx0XHRcdGFUYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRcdFx0Ly8gYWNjZXNzIGJpbmRpbmcgb25seSBhZnRlciB0YWJsZSBpcyBib3VuZFxuXHRcdFx0XHRUYWJsZVV0aWxzLndoZW5Cb3VuZChvVGFibGUpXG5cdFx0XHRcdFx0LnRoZW4oaGFuZGxlVGFibGVNb2RpZmljYXRpb25zKVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHdhaXRpbmcgZm9yIHRoZSB0YWJsZSB0byBiZSBib3VuZFwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS51c2VOZXdMYXp5TG9hZGluZykge1xuXHRcdFx0XHQvLyBzaG91bGQgYmUgY2FsbGVkIG9ubHkgYWZ0ZXIgYmluZGluZyBpcyByZWFkeSBoZW5jZSBjYWxsaW5nIGl0IGluIG9uQWZ0ZXJCaW5kaW5nXG5cdFx0XHRcdChvT2JqZWN0UGFnZSBhcyBhbnkpLl90cmlnZ2VyVmlzaWJsZVN1YlNlY3Rpb25zRXZlbnRzKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblBhZ2VSZWFkeShtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0Y29uc3Qgc2V0Rm9jdXMgPSAoKSA9PiB7XG5cdFx0XHQvLyBTZXQgdGhlIGZvY3VzIHRvIHRoZSBmaXJzdCBhY3Rpb24gYnV0dG9uLCBvciB0byB0aGUgZmlyc3QgZWRpdGFibGUgaW5wdXQgaWYgaW4gZWRpdGFibGUgbW9kZVxuXHRcdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdFx0Y29uc3QgaXNJbkRpc3BsYXlNb2RlID0gIW9PYmplY3RQYWdlLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblxuXHRcdFx0aWYgKGlzSW5EaXNwbGF5TW9kZSkge1xuXHRcdFx0XHRjb25zdCBvRmlyc3RDbGlja2FibGVFbGVtZW50ID0gdGhpcy5fZ2V0Rmlyc3RDbGlja2FibGVFbGVtZW50KG9PYmplY3RQYWdlKTtcblx0XHRcdFx0aWYgKG9GaXJzdENsaWNrYWJsZUVsZW1lbnQpIHtcblx0XHRcdFx0XHRvRmlyc3RDbGlja2FibGVFbGVtZW50LmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZFNlY3Rpb246IGFueSA9IENvcmUuYnlJZChvT2JqZWN0UGFnZS5nZXRTZWxlY3RlZFNlY3Rpb24oKSk7XG5cdFx0XHRcdGlmIChvU2VsZWN0ZWRTZWN0aW9uKSB7XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlRm9jdXNJbkVkaXRNb2RlKG9TZWxlY3RlZFNlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdC8vIEFwcGx5IGFwcCBzdGF0ZSBvbmx5IGFmdGVyIHRoZSBwYWdlIGlzIHJlYWR5IHdpdGggdGhlIGZpcnN0IHNlY3Rpb24gc2VsZWN0ZWRcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHQvL1Nob3cgcG9wdXAgd2hpbGUgbmF2aWdhdGluZyBiYWNrIGZyb20gb2JqZWN0IHBhZ2UgaW4gY2FzZSBvZiBkcmFmdFxuXHRcdGlmIChvQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdGNvbnN0IGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQoKG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpLmdldE1ldGFNb2RlbCgpKTtcblx0XHRcdGlmICghYklzU3RpY2t5TW9kZSkge1xuXHRcdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9WaWV3KTtcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24oKCkgPT4gdGhpcy5fb25CYWNrTmF2aWdhdGlvbkluRHJhZnQob0JpbmRpbmdDb250ZXh0KSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KClcblx0XHRcdC5nZXRBcHBTdGF0ZUhhbmRsZXIoKVxuXHRcdFx0LmFwcGx5QXBwU3RhdGUoKVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuZm9yY2VGb2N1cykge1xuXHRcdFx0XHRcdHNldEZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKEVycm9yKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHNldHRpbmcgdGhlIGZvY3VzXCIsIEVycm9yKTtcblx0XHRcdH0pO1xuXG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiZXJyb3JOYXZpZ2F0aW9uU2VjdGlvbkZsYWdcIiwgZmFsc2UpO1xuXHRcdHRoaXMuX2NoZWNrRGF0YVBvaW50VGl0bGVGb3JFeHRlcm5hbE5hdmlnYXRpb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHN0YXR1cyBvZiBlZGl0IG1vZGUgZm9yIHN0aWNreSBzZXNzaW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgc3RhdHVzIG9mIGVkaXQgbW9kZSBmb3Igc3RpY2t5IHNlc3Npb25cblx0ICovXG5cdGdldFN0aWNreUVkaXRNb2RlKCkge1xuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0ICYmICh0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQpO1xuXHRcdGxldCBiSXNTdGlja3lFZGl0TW9kZSA9IGZhbHNlO1xuXHRcdGlmIChvQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdGNvbnN0IGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob0JpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwpO1xuXHRcdFx0aWYgKGJJc1N0aWNreU1vZGUpIHtcblx0XHRcdFx0YklzU3RpY2t5RWRpdE1vZGUgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBiSXNTdGlja3lFZGl0TW9kZTtcblx0fVxuXG5cdF9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5ieUlkKFwiZmU6Ok9iamVjdFBhZ2VcIikgYXMgT2JqZWN0UGFnZUxheW91dDtcblx0fVxuXG5cdF9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbigpIHtcblx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCk7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2VTdWJ0aXRsZSA9IG9PYmplY3RQYWdlLmdldEN1c3RvbURhdGEoKS5maW5kKGZ1bmN0aW9uIChvQ3VzdG9tRGF0YTogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0N1c3RvbURhdGEuZ2V0S2V5KCkgPT09IFwiT2JqZWN0UGFnZVN1YnRpdGxlXCI7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpdGxlOiBvT2JqZWN0UGFnZS5kYXRhKFwiT2JqZWN0UGFnZVRpdGxlXCIpIHx8IFwiXCIsXG5cdFx0XHRzdWJ0aXRsZTogb09iamVjdFBhZ2VTdWJ0aXRsZSAmJiBvT2JqZWN0UGFnZVN1YnRpdGxlLmdldFZhbHVlKCksXG5cdFx0XHRpbnRlbnQ6IFwiXCIsXG5cdFx0XHRpY29uOiBcIlwiXG5cdFx0fTtcblx0fVxuXG5cdF9leGVjdXRlSGVhZGVyU2hvcnRjdXQoc0lkOiBhbnkpIHtcblx0XHRjb25zdCBzQnV0dG9uSWQgPSBgJHt0aGlzLmdldFZpZXcoKS5nZXRJZCgpfS0tJHtzSWR9YCxcblx0XHRcdG9CdXR0b24gPSAodGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKS5nZXRIZWFkZXJUaXRsZSgpIGFzIE9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGUpXG5cdFx0XHRcdC5nZXRBY3Rpb25zKClcblx0XHRcdFx0LmZpbmQoZnVuY3Rpb24gKG9FbGVtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0VsZW1lbnQuZ2V0SWQoKSA9PT0gc0J1dHRvbklkO1xuXHRcdFx0XHR9KTtcblx0XHRDb21tb25VdGlscy5maXJlQnV0dG9uUHJlc3Mob0J1dHRvbik7XG5cdH1cblxuXHRfZXhlY3V0ZUZvb3RlclNob3J0Y3V0KHNJZDogYW55KSB7XG5cdFx0Y29uc3Qgc0J1dHRvbklkID0gYCR7dGhpcy5nZXRWaWV3KCkuZ2V0SWQoKX0tLSR7c0lkfWAsXG5cdFx0XHRvQnV0dG9uID0gKHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0Rm9vdGVyKCkgYXMgYW55KS5nZXRDb250ZW50KCkuZmluZChmdW5jdGlvbiAob0VsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0VsZW1lbnQuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLm0uQnV0dG9uXCIgJiYgb0VsZW1lbnQuZ2V0SWQoKSA9PT0gc0J1dHRvbklkO1xuXHRcdFx0fSk7XG5cdFx0Q29tbW9uVXRpbHMuZmlyZUJ1dHRvblByZXNzKG9CdXR0b24pO1xuXHR9XG5cblx0X2V4ZWN1dGVUYWJTaG9ydEN1dChvRXhlY3V0aW9uOiBhbnkpIHtcblx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCksXG5cdFx0XHRhU2VjdGlvbnMgPSBvT2JqZWN0UGFnZS5nZXRTZWN0aW9ucygpLFxuXHRcdFx0aVNlY3Rpb25JbmRleE1heCA9IGFTZWN0aW9ucy5sZW5ndGggLSAxLFxuXHRcdFx0c0NvbW1hbmQgPSBvRXhlY3V0aW9uLm9Tb3VyY2UuZ2V0Q29tbWFuZCgpO1xuXHRcdGxldCBuZXdTZWN0aW9uLFxuXHRcdFx0aVNlbGVjdGVkU2VjdGlvbkluZGV4ID0gb09iamVjdFBhZ2UuaW5kZXhPZlNlY3Rpb24odGhpcy5ieUlkKG9PYmplY3RQYWdlLmdldFNlbGVjdGVkU2VjdGlvbigpKSBhcyBPYmplY3RQYWdlU2VjdGlvbik7XG5cdFx0aWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCAhPT0gLTEgJiYgaVNlY3Rpb25JbmRleE1heCA+IDApIHtcblx0XHRcdGlmIChzQ29tbWFuZCA9PT0gXCJOZXh0VGFiXCIpIHtcblx0XHRcdFx0aWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCA8PSBpU2VjdGlvbkluZGV4TWF4IC0gMSkge1xuXHRcdFx0XHRcdG5ld1NlY3Rpb24gPSBhU2VjdGlvbnNbKytpU2VsZWN0ZWRTZWN0aW9uSW5kZXhdO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCAhPT0gMCkge1xuXHRcdFx0XHQvLyBQcmV2aW91c1RhYlxuXHRcdFx0XHRuZXdTZWN0aW9uID0gYVNlY3Rpb25zWy0taVNlbGVjdGVkU2VjdGlvbkluZGV4XTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG5ld1NlY3Rpb24pIHtcblx0XHRcdFx0b09iamVjdFBhZ2Uuc2V0U2VsZWN0ZWRTZWN0aW9uKG5ld1NlY3Rpb24pO1xuXHRcdFx0XHRuZXdTZWN0aW9uLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2dldEZvb3RlclZpc2liaWxpdHkoKSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRjb25zdCBzVmlld0lkID0gdGhpcy5nZXRWaWV3KCkuZ2V0SWQoKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJtZXNzYWdlRm9vdGVyQ29udGFpbnNFcnJvcnNcIiwgZmFsc2UpO1xuXHRcdHNhcC51aVxuXHRcdFx0LmdldENvcmUoKVxuXHRcdFx0LmdldE1lc3NhZ2VNYW5hZ2VyKClcblx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0LmdldERhdGEoKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG9NZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9NZXNzYWdlLnZhbGlkYXRpb24gJiYgb01lc3NhZ2UudHlwZSA9PT0gXCJFcnJvclwiICYmIG9NZXNzYWdlLnRhcmdldC5pbmRleE9mKHNWaWV3SWQpID4gLTEpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJtZXNzYWdlRm9vdGVyQ29udGFpbnNFcnJvcnNcIiwgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9XG5cblx0X3Nob3dNZXNzYWdlUG9wb3ZlcihlcnI/OiBhbnksIG9SZXQ/OiBhbnkpIHtcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHRMb2cuZXJyb3IoZXJyKTtcblx0XHR9XG5cdFx0Y29uc3Qgcm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBhbnk7XG5cdFx0Y29uc3QgY3VycmVudFBhZ2VWaWV3ID0gcm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpXG5cdFx0XHQ/IHJvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RWaWV3KClcblx0XHRcdDogKHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um9vdENvbnRhaW5lcigpIGFzIGFueSkuZ2V0Q3VycmVudFBhZ2UoKTtcblx0XHRpZiAoIWN1cnJlbnRQYWdlVmlldy5pc0EoXCJzYXAubS5NZXNzYWdlUGFnZVwiKSkge1xuXHRcdFx0Y29uc3Qgb01lc3NhZ2VCdXR0b24gPSB0aGlzLm1lc3NhZ2VCdXR0b24sXG5cdFx0XHRcdG9NZXNzYWdlUG9wb3ZlciA9IG9NZXNzYWdlQnV0dG9uLm9NZXNzYWdlUG9wb3Zlcixcblx0XHRcdFx0b0l0ZW1CaW5kaW5nID0gb01lc3NhZ2VQb3BvdmVyLmdldEJpbmRpbmcoXCJpdGVtc1wiKTtcblxuXHRcdFx0aWYgKG9JdGVtQmluZGluZy5nZXRMZW5ndGgoKSA+IDAgJiYgIW9NZXNzYWdlUG9wb3Zlci5pc09wZW4oKSkge1xuXHRcdFx0XHRvTWVzc2FnZUJ1dHRvbi5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdFx0XHQvLyB3b3JrYXJvdW5kIHRvIGVuc3VyZSB0aGF0IG9NZXNzYWdlQnV0dG9uIGlzIHJlbmRlcmVkIHdoZW4gb3BlbkJ5IGlzIGNhbGxlZFxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRvTWVzc2FnZVBvcG92ZXIub3BlbkJ5KG9NZXNzYWdlQnV0dG9uKTtcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvUmV0O1xuXHR9XG5cblx0X2VkaXREb2N1bWVudChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKTtcblx0XHRCdXN5TG9ja2VyLmxvY2sob01vZGVsKTtcblx0XHRyZXR1cm4gdGhpcy5lZGl0Rmxvdy5lZGl0RG9jdW1lbnQuYXBwbHkodGhpcy5lZGl0RmxvdywgW29Db250ZXh0XSkuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTW9kZWwpO1xuXHRcdH0pO1xuXHR9XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBjb250ZXh0IG9mIHRoZSBEcmFmdFJvb3QgcGF0aC5cblx0ICogSWYgYSB2aWV3IGhhcyBiZWVuIGNyZWF0ZWQgd2l0aCB0aGUgZHJhZnQgUm9vdCBQYXRoLCB0aGlzIG1ldGhvZCByZXR1cm5zIGl0cyBiaW5kaW5nQ29udGV4dC5cblx0ICogV2hlcmUgbm8gdmlldyBpcyBmb3VuZCBhIG5ldyBjcmVhdGVkIGNvbnRleHQgaXMgcmV0dXJuZWQuXG5cdCAqIFRoZSBuZXcgY3JlYXRlZCBjb250ZXh0IHJlcXVlc3QgdGhlIGtleSBvZiB0aGUgZW50aXR5IGluIG9yZGVyIHRvIGdldCB0aGUgRXRhZyBvZiB0aGlzIGVudGl0eS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldERyYWZ0Um9vdFBhdGhcblx0ICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2Vcblx0ICovXG5cdGFzeW5jIGdldERyYWZ0Um9vdENvbnRleHQoKTogUHJvbWlzZTxWNENvbnRleHQgfCB1bmRlZmluZWQ+IHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0Y29uc3QgY29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBWNENvbnRleHQ7XG5cdFx0aWYgKGNvbnRleHQpIHtcblx0XHRcdGNvbnN0IGRyYWZ0Um9vdENvbnRleHRQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RHJhZnRSb290UGF0aChjb250ZXh0KTtcblx0XHRcdGxldCBzaW1wbGVEcmFmdFJvb3RDb250ZXh0OiBWNENvbnRleHQ7XG5cdFx0XHRpZiAoZHJhZnRSb290Q29udGV4dFBhdGgpIHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgYSB2aWV3IG1hdGNoZXMgd2l0aCB0aGUgZHJhZnQgcm9vdCBwYXRoXG5cdFx0XHRcdGNvbnN0IGV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2UgPSAodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBSb290Vmlld0Jhc2VDb250cm9sbGVyKVxuXHRcdFx0XHRcdC5nZXRJbnN0YW5jZWRWaWV3cygpXG5cdFx0XHRcdFx0LmZpbmQoKHBhZ2VWaWV3OiBWaWV3KSA9PiBwYWdlVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCkgPT09IGRyYWZ0Um9vdENvbnRleHRQYXRoKVxuXHRcdFx0XHRcdD8uZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBWNENvbnRleHQ7XG5cdFx0XHRcdGlmIChleGlzdGluZ0JpbmRpbmdDb250ZXh0T25QYWdlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdHNpbXBsZURyYWZ0Um9vdENvbnRleHQgPSBpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KFwiL3NpbXBsZURyYWZ0Um9vdENvbnRleHRcIik7XG5cdFx0XHRcdGlmIChzaW1wbGVEcmFmdFJvb3RDb250ZXh0Py5nZXRQYXRoKCkgPT09IGRyYWZ0Um9vdENvbnRleHRQYXRoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNpbXBsZURyYWZ0Um9vdENvbnRleHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgbW9kZWwgPSBjb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRjb25zdCBzRW50aXR5UGF0aCA9IG1ldGFNb2RlbC5nZXRNZXRhUGF0aChkcmFmdFJvb3RDb250ZXh0UGF0aCk7XG5cdFx0XHRcdGNvbnN0IG1EYXRhTW9kZWwgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFNb2RlbC5nZXRDb250ZXh0KHNFbnRpdHlQYXRoKSk7XG5cdFx0XHRcdHNpbXBsZURyYWZ0Um9vdENvbnRleHQgPSBtb2RlbC5iaW5kQ29udGV4dChkcmFmdFJvb3RDb250ZXh0UGF0aCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdGF3YWl0IHNpbXBsZURyYWZ0Um9vdENvbnRleHQucmVxdWVzdFByb3BlcnR5KG1EYXRhTW9kZWwudGFyZ2V0RW50aXR5VHlwZS5rZXlzWzBdPy5uYW1lKTtcblx0XHRcdFx0Ly8gU3RvcmUgdGhpcyBuZXcgY3JlYXRlZCBjb250ZXh0IHRvIHVzZSBpdCBvbiB0aGUgbmV4dCBpdGVyYXRpb25zXG5cdFx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc2ltcGxlRHJhZnRSb290Q29udGV4dFwiLCBzaW1wbGVEcmFmdFJvb3RDb250ZXh0KTtcblx0XHRcdFx0cmV0dXJuIHNpbXBsZURyYWZ0Um9vdENvbnRleHQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0YXN5bmMgX3ZhbGlkYXRlRG9jdW1lbnQoKTogUHJvbWlzZTx2b2lkIHwgYW55W10gfCBPRGF0YUNvbnRleHRCaW5kaW5nRXg+IHtcblx0XHRjb25zdCBjb250cm9sID0gQ29yZS5ieUlkKENvcmUuZ2V0Q3VycmVudEZvY3VzZWRDb250cm9sSWQoKSk7XG5cdFx0Y29uc3QgY29udGV4dCA9IGNvbnRyb2w/LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgVjRDb250ZXh0O1xuXHRcdGlmIChjb250ZXh0ICYmICFjb250ZXh0LmlzVHJhbnNpZW50KCkpIHtcblx0XHRcdC8vIFdhaXQgZm9yIHRoZSBwZW5kaW5nIGNoYW5nZXMgYmVmb3JlIHN0YXJ0aW5nIHRoaXMgdmFsaWRhdGlvblxuXHRcdFx0YXdhaXQgdGhpcy5fZWRpdEZsb3cuc3luY1Rhc2soKTtcblx0XHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0c1NlcnZpY2UgPSBhcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCBlbnRpdHlUeXBlID0gc2lkZUVmZmVjdHNTZXJ2aWNlLmdldEVudGl0eVR5cGVGcm9tQ29udGV4dChjb250ZXh0KTtcblx0XHRcdGNvbnN0IGdsb2JhbFNpZGVFZmZlY3RzID0gZW50aXR5VHlwZSA/IHNpZGVFZmZlY3RzU2VydmljZS5nZXRHbG9iYWxPRGF0YUVudGl0eVNpZGVFZmZlY3RzKGVudGl0eVR5cGUpIDogW107XG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZ2xvYmFsIFNpZGVFZmZlY3RzIGZvciB0aGUgcmVsYXRlZCBlbnRpdHksIGV4ZWN1dGUgaXQvdGhlbVxuXHRcdFx0aWYgKGdsb2JhbFNpZGVFZmZlY3RzLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoZ2xvYmFsU2lkZUVmZmVjdHMubWFwKChzaWRlRWZmZWN0cykgPT4gdGhpcy5fc2lkZUVmZmVjdHMucmVxdWVzdFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzLCBjb250ZXh0KSkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZHJhZnRSb290Q29udGV4dCA9IGF3YWl0IHRoaXMuZ2V0RHJhZnRSb290Q29udGV4dCgpO1xuXHRcdFx0XHQvL0V4ZWN1dGUgdGhlIGRyYWZ0VmFsaWRhdGlvbiBpZiB0aGVyZSBpcyBubyBnbG9iYWxTaWRlRWZmZWN0c1xuXHRcdFx0XHRpZiAoZHJhZnRSb290Q29udGV4dCkge1xuXHRcdFx0XHRcdHJldHVybiBkcmFmdC5leGVjdXRlRHJhZnRWYWxpZGF0aW9uKGRyYWZ0Um9vdENvbnRleHQsIGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGFzeW5jIF9zYXZlRG9jdW1lbnQob0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIiksXG5cdFx0XHRhV2FpdENyZWF0ZURvY3VtZW50czogYW55W10gPSBbXTtcblx0XHQvLyBpbmRpY2F0ZXMgaWYgd2UgYXJlIGNyZWF0aW5nIGEgbmV3IHJvdyBpbiB0aGUgT1Bcblx0XHRsZXQgYkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IgPSBmYWxzZTtcblx0XHRCdXN5TG9ja2VyLmxvY2sob01vZGVsKTtcblx0XHR0aGlzLl9maW5kVGFibGVzKCkuZm9yRWFjaCgob1RhYmxlOiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9CaW5kaW5nID0gdGhpcy5fZ2V0VGFibGVCaW5kaW5nKG9UYWJsZSk7XG5cdFx0XHRjb25zdCBtUGFyYW1ldGVyczogYW55ID0ge1xuXHRcdFx0XHRjcmVhdGlvbk1vZGU6IG9UYWJsZS5kYXRhKFwiY3JlYXRpb25Nb2RlXCIpLFxuXHRcdFx0XHRjcmVhdGlvblJvdzogb1RhYmxlLmdldENyZWF0aW9uUm93KCksXG5cdFx0XHRcdGNyZWF0ZUF0RW5kOiBvVGFibGUuZGF0YShcImNyZWF0ZUF0RW5kXCIpID09PSBcInRydWVcIlxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IGJDcmVhdGVEb2N1bWVudCA9XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93ICYmXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93LmdldEJpbmRpbmdDb250ZXh0KCkgJiZcblx0XHRcdFx0T2JqZWN0LmtleXMobVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cuZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRPYmplY3QoKSkubGVuZ3RoID4gMTtcblx0XHRcdGlmIChiQ3JlYXRlRG9jdW1lbnQpIHtcblx0XHRcdFx0Ly8gdGhlIGJTa2lwU2lkZUVmZmVjdHMgaXMgYSBwYXJhbWV0ZXIgY3JlYXRlZCB3aGVuIHdlIGNsaWNrIHRoZSBzYXZlIGtleS4gSWYgd2UgcHJlc3MgdGhpcyBrZXlcblx0XHRcdFx0Ly8gd2UgZG9uJ3QgZXhlY3V0ZSB0aGUgaGFuZGxlU2lkZUVmZmVjdHMgZnVuY2l0b24gdG8gYXZvaWQgYmF0Y2ggcmVkdW5kYW5jeVxuXHRcdFx0XHRtUGFyYW1ldGVycy5iU2tpcFNpZGVFZmZlY3RzID0gdHJ1ZTtcblx0XHRcdFx0YkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IgPSB0cnVlO1xuXHRcdFx0XHRhV2FpdENyZWF0ZURvY3VtZW50cy5wdXNoKFxuXHRcdFx0XHRcdHRoaXMuZWRpdEZsb3cuY3JlYXRlRG9jdW1lbnQob0JpbmRpbmcsIG1QYXJhbWV0ZXJzKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvQmluZGluZztcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGFCaW5kaW5ncyA9IGF3YWl0IFByb21pc2UuYWxsKGFXYWl0Q3JlYXRlRG9jdW1lbnRzKTtcblx0XHRcdGNvbnN0IG1QYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvcjogYkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IsXG5cdFx0XHRcdGJpbmRpbmdzOiBhQmluZGluZ3Ncblx0XHRcdH07XG5cdFx0XHQvLyBXZSBuZWVkIHRvIGVpdGhlciByZWplY3Qgb3IgcmVzb2x2ZSBhIHByb21pc2UgaGVyZSBhbmQgcmV0dXJuIGl0IHNpbmNlIHRoaXMgc2F2ZVxuXHRcdFx0Ly8gZnVuY3Rpb24gaXMgbm90IG9ubHkgY2FsbGVkIHdoZW4gcHJlc3NpbmcgdGhlIHNhdmUgYnV0dG9uIGluIHRoZSBmb290ZXIsIGJ1dCBhbHNvXG5cdFx0XHQvLyB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgY3JlYXRlIG9yIHNhdmUgaW4gYSBkYXRhbG9zcyBwb3B1cC5cblx0XHRcdC8vIFRoZSBsb2dpYyBvZiB0aGUgZGF0YWxvc3MgcG9wdXAgbmVlZHMgdG8gZGV0ZWN0IGlmIHRoZSBzYXZlIGhhZCBlcnJvcnMgb3Igbm90IGluIG9yZGVyXG5cdFx0XHQvLyB0byBkZWNpZGUgaWYgdGhlIHN1YnNlcXVlbnQgYWN0aW9uIC0gbGlrZSBhIGJhY2sgbmF2aWdhdGlvbiAtIGhhcyB0byBiZSBleGVjdXRlZCBvciBub3QuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmVkaXRGbG93LnNhdmVEb2N1bWVudChvQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHRcdFx0fSBjYXRjaCAoZXJyb3I6IGFueSkge1xuXHRcdFx0XHQvLyBJZiB0aGUgc2F2ZURvY3VtZW50IGluIGVkaXRGbG93IHJldHVybnMgZXJyb3JzIHdlIG5lZWRcblx0XHRcdFx0Ly8gdG8gc2hvdyB0aGUgbWVzc2FnZSBwb3BvdmVyIGhlcmUgYW5kIGVuc3VyZSB0aGF0IHRoZVxuXHRcdFx0XHQvLyBkYXRhbG9zcyBsb2dpYyBkb2VzIG5vdCBwZXJmb3JtIHRoZSBmb2xsb3cgdXAgZnVuY3Rpb25cblx0XHRcdFx0Ly8gbGlrZSBlLmcuIGEgYmFjayBuYXZpZ2F0aW9uIGhlbmNlIHdlIHJldHVybiBhIHByb21pc2UgYW5kIHJlamVjdCBpdFxuXHRcdFx0XHR0aGlzLl9zaG93TWVzc2FnZVBvcG92ZXIoZXJyb3IpO1xuXHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKEJ1c3lMb2NrZXIuaXNMb2NrZWQob01vZGVsKSkge1xuXHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTW9kZWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9tYW5hZ2VDb2xsYWJvcmF0aW9uKCkge1xuXHRcdG9wZW5NYW5hZ2VEaWFsb2codGhpcy5nZXRWaWV3KCkpO1xuXHR9XG5cblx0X3Nob3dDb2xsYWJvcmF0aW9uVXNlckRldGFpbHMoZXZlbnQ6IGFueSkge1xuXHRcdHNob3dVc2VyRGV0YWlscyhldmVudCwgdGhpcy5nZXRWaWV3KCkpO1xuXHR9XG5cblx0X2NhbmNlbERvY3VtZW50KG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRtUGFyYW1ldGVycy5jYW5jZWxCdXR0b24gPSB0aGlzLmdldFZpZXcoKS5ieUlkKG1QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbik7IC8vdG8gZ2V0IHRoZSByZWZlcmVuY2Ugb2YgdGhlIGNhbmNlbCBidXR0b24gZnJvbSBjb21tYW5kIGV4ZWN1dGlvblxuXHRcdHJldHVybiB0aGlzLmVkaXRGbG93LmNhbmNlbERvY3VtZW50KG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdH1cblxuXHRfYXBwbHlEb2N1bWVudChvQ29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuZWRpdEZsb3cuYXBwbHlEb2N1bWVudChvQ29udGV4dCkuY2F0Y2goKCkgPT4gdGhpcy5fc2hvd01lc3NhZ2VQb3BvdmVyKCkpO1xuXHR9XG5cblx0X3VwZGF0ZVJlbGF0ZWRBcHBzKCkge1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRpZiAoQ29tbW9uVXRpbHMucmVzb2x2ZVN0cmluZ3RvQm9vbGVhbihvT2JqZWN0UGFnZS5kYXRhKFwic2hvd1JlbGF0ZWRBcHBzXCIpKSkge1xuXHRcdFx0Q29tbW9uVXRpbHMudXBkYXRlUmVsYXRlZEFwcHNEZXRhaWxzKG9PYmplY3RQYWdlKTtcblx0XHR9XG5cdH1cblxuXHRfZmluZENvbnRyb2xJblN1YlNlY3Rpb24oYVBhcmVudEVsZW1lbnQ6IGFueSwgYVN1YnNlY3Rpb246IGFueSwgYUNvbnRyb2xzOiBhbnksIGJJc0NoYXJ0PzogYm9vbGVhbikge1xuXHRcdGZvciAobGV0IGVsZW1lbnQgPSAwOyBlbGVtZW50IDwgYVBhcmVudEVsZW1lbnQubGVuZ3RoOyBlbGVtZW50KyspIHtcblx0XHRcdGxldCBvRWxlbWVudCA9IGFQYXJlbnRFbGVtZW50W2VsZW1lbnRdLmdldENvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBhUGFyZW50RWxlbWVudFtlbGVtZW50XS5nZXRDb250ZW50KCk7XG5cdFx0XHRpZiAoYklzQ2hhcnQpIHtcblx0XHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50Lm1BZ2dyZWdhdGlvbnMgJiYgb0VsZW1lbnQuZ2V0QWdncmVnYXRpb24oXCJpdGVtc1wiKSkge1xuXHRcdFx0XHRcdGNvbnN0IGFJdGVtcyA9IG9FbGVtZW50LmdldEFnZ3JlZ2F0aW9uKFwiaXRlbXNcIik7XG5cdFx0XHRcdFx0YUl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKG9JdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChvSXRlbS5pc0EoXCJzYXAuZmUubWFjcm9zLmNoYXJ0LkNoYXJ0QVBJXCIpKSB7XG5cdFx0XHRcdFx0XHRcdG9FbGVtZW50ID0gb0l0ZW07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5pc0EgJiYgb0VsZW1lbnQuaXNBKFwic2FwLnVpLmxheW91dC5EeW5hbWljU2lkZUNvbnRlbnRcIikpIHtcblx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudC5nZXRNYWluQ29udGVudCBpbnN0YW5jZW9mIEZ1bmN0aW9uICYmIG9FbGVtZW50LmdldE1haW5Db250ZW50KCk7XG5cdFx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudFswXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50LmlzQSAmJiBvRWxlbWVudC5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnQuZ2V0Q29udGVudCBpbnN0YW5jZW9mIEZ1bmN0aW9uICYmIG9FbGVtZW50LmdldENvbnRlbnQoKTtcblx0XHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRvRWxlbWVudCA9IG9FbGVtZW50WzBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQuaXNBICYmIG9FbGVtZW50LmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0YUNvbnRyb2xzLnB1c2gob0VsZW1lbnQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQuaXNBICYmIG9FbGVtZW50LmlzQShcInNhcC5mZS5tYWNyb3MuY2hhcnQuQ2hhcnRBUElcIikpIHtcblx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudC5nZXRDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgb0VsZW1lbnQuZ2V0Q29udGVudCgpO1xuXHRcdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnRbMF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5pc0EgJiYgb0VsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5DaGFydFwiKSkge1xuXHRcdFx0XHRhQ29udHJvbHMucHVzaChvRWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2dldEFsbFN1YlNlY3Rpb25zKCkge1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRsZXQgYVN1YlNlY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdG9PYmplY3RQYWdlLmdldFNlY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAob1NlY3Rpb246IGFueSkge1xuXHRcdFx0YVN1YlNlY3Rpb25zID0gYVN1YlNlY3Rpb25zLmNvbmNhdChvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gYVN1YlNlY3Rpb25zO1xuXHR9XG5cblx0X2dldEFsbEJsb2NrcygpIHtcblx0XHRsZXQgYUJsb2NrczogYW55W10gPSBbXTtcblx0XHR0aGlzLl9nZXRBbGxTdWJTZWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24gKG9TdWJTZWN0aW9uOiBhbnkpIHtcblx0XHRcdGFCbG9ja3MgPSBhQmxvY2tzLmNvbmNhdChvU3ViU2VjdGlvbi5nZXRCbG9ja3MoKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFCbG9ja3M7XG5cdH1cblxuXHRfZmluZFRhYmxlcygpIHtcblx0XHRjb25zdCBhU3ViU2VjdGlvbnMgPSB0aGlzLl9nZXRBbGxTdWJTZWN0aW9ucygpO1xuXHRcdGNvbnN0IGFUYWJsZXM6IGFueVtdID0gW107XG5cdFx0Zm9yIChsZXQgc3ViU2VjdGlvbiA9IDA7IHN1YlNlY3Rpb24gPCBhU3ViU2VjdGlvbnMubGVuZ3RoOyBzdWJTZWN0aW9uKyspIHtcblx0XHRcdHRoaXMuX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRCbG9ja3MoKSwgYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLCBhVGFibGVzKTtcblx0XHRcdHRoaXMuX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRNb3JlQmxvY2tzKCksIGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXSwgYVRhYmxlcyk7XG5cdFx0fVxuXHRcdHJldHVybiBhVGFibGVzO1xuXHR9XG5cblx0X2ZpbmRDaGFydHMoKSB7XG5cdFx0Y29uc3QgYVN1YlNlY3Rpb25zID0gdGhpcy5fZ2V0QWxsU3ViU2VjdGlvbnMoKTtcblx0XHRjb25zdCBhQ2hhcnRzOiBhbnlbXSA9IFtdO1xuXHRcdGZvciAobGV0IHN1YlNlY3Rpb24gPSAwOyBzdWJTZWN0aW9uIDwgYVN1YlNlY3Rpb25zLmxlbmd0aDsgc3ViU2VjdGlvbisrKSB7XG5cdFx0XHR0aGlzLl9maW5kQ29udHJvbEluU3ViU2VjdGlvbihhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0uZ2V0QmxvY2tzKCksIGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXSwgYUNoYXJ0cywgdHJ1ZSk7XG5cdFx0XHR0aGlzLl9maW5kQ29udHJvbEluU3ViU2VjdGlvbihhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0uZ2V0TW9yZUJsb2NrcygpLCBhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0sIGFDaGFydHMsIHRydWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gYUNoYXJ0cztcblx0fVxuXG5cdF9jbG9zZVNpZGVDb250ZW50KCkge1xuXHRcdHRoaXMuX2dldEFsbEJsb2NrcygpLmZvckVhY2goZnVuY3Rpb24gKG9CbG9jazogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29udGVudCA9IG9CbG9jay5nZXRDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgb0Jsb2NrLmdldENvbnRlbnQoKTtcblx0XHRcdGlmIChvQ29udGVudCAmJiBvQ29udGVudC5pc0EgJiYgb0NvbnRlbnQuaXNBKFwic2FwLnVpLmxheW91dC5EeW5hbWljU2lkZUNvbnRlbnRcIikpIHtcblx0XHRcdFx0aWYgKG9Db250ZW50LnNldFNob3dTaWRlQ29udGVudCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0b0NvbnRlbnQuc2V0U2hvd1NpZGVDb250ZW50KGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoYXJ0IENvbnRleHQgaXMgcmVzb2x2ZWQgZm9yIDE6biBtaWNyb2NoYXJ0cy5cblx0ICpcblx0ICogQHBhcmFtIG9DaGFydENvbnRleHQgVGhlIENvbnRleHQgb2YgdGhlIE1pY3JvQ2hhcnRcblx0ICogQHBhcmFtIHNDaGFydFBhdGggVGhlIGNvbGxlY3Rpb25QYXRoIG9mIHRoZSB0aGUgY2hhcnRcblx0ICogQHJldHVybnMgQXJyYXkgb2YgQXR0cmlidXRlcyBvZiB0aGUgY2hhcnQgQ29udGV4dFxuXHQgKi9cblx0X2dldENoYXJ0Q29udGV4dERhdGEob0NoYXJ0Q29udGV4dDogYW55LCBzQ2hhcnRQYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBvQ29udGV4dERhdGEgPSBvQ2hhcnRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGxldCBvQ2hhcnRDb250ZXh0RGF0YSA9IFtvQ29udGV4dERhdGFdO1xuXHRcdGlmIChvQ2hhcnRDb250ZXh0ICYmIHNDaGFydFBhdGgpIHtcblx0XHRcdGlmIChvQ29udGV4dERhdGFbc0NoYXJ0UGF0aF0pIHtcblx0XHRcdFx0b0NoYXJ0Q29udGV4dERhdGEgPSBvQ29udGV4dERhdGFbc0NoYXJ0UGF0aF07XG5cdFx0XHRcdGRlbGV0ZSBvQ29udGV4dERhdGFbc0NoYXJ0UGF0aF07XG5cdFx0XHRcdG9DaGFydENvbnRleHREYXRhLnB1c2gob0NvbnRleHREYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9DaGFydENvbnRleHREYXRhO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNjcm9sbCB0aGUgdGFibGVzIHRvIHRoZSByb3cgd2l0aCB0aGUgc1BhdGhcblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5PYmplY3RQYWdlQ29udHJvbGxlci5jb250cm9sbGVyI19zY3JvbGxUYWJsZXNUb1Jvd1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gc1Jvd1BhdGggJ3NQYXRoIG9mIHRoZSB0YWJsZSByb3cnXG5cdCAqL1xuXG5cdF9zY3JvbGxUYWJsZXNUb1JvdyhzUm93UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKHRoaXMuX2ZpbmRUYWJsZXMgJiYgdGhpcy5fZmluZFRhYmxlcygpLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9maW5kVGFibGVzKCk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFUYWJsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0VGFibGVTY3JvbGxlci5zY3JvbGxUYWJsZVRvUm93KGFUYWJsZXNbaV0sIHNSb3dQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIG1lcmdlIHNlbGVjdGVkIGNvbnRleHRzIGFuZCBmaWx0ZXJzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX21lcmdlTXVsdGlwbGVDb250ZXh0c1xuXHQgKiBAcGFyYW0gb1BhZ2VDb250ZXh0IFBhZ2UgY29udGV4dFxuXHQgKiBAcGFyYW0gYUxpbmVDb250ZXh0IFNlbGVjdGVkIENvbnRleHRzXG5cdCAqIEBwYXJhbSBzQ2hhcnRQYXRoIENvbGxlY3Rpb24gbmFtZSBvZiB0aGUgY2hhcnRcblx0ICogQHJldHVybnMgU2VsZWN0aW9uIFZhcmlhbnQgT2JqZWN0XG5cdCAqL1xuXHRfbWVyZ2VNdWx0aXBsZUNvbnRleHRzKG9QYWdlQ29udGV4dDogQ29udGV4dCwgYUxpbmVDb250ZXh0OiBhbnlbXSwgc0NoYXJ0UGF0aDogc3RyaW5nKSB7XG5cdFx0bGV0IGFBdHRyaWJ1dGVzOiBhbnlbXSA9IFtdLFxuXHRcdFx0YVBhZ2VBdHRyaWJ1dGVzID0gW10sXG5cdFx0XHRvQ29udGV4dCxcblx0XHRcdHNNZXRhUGF0aExpbmU6IHN0cmluZyxcblx0XHRcdHNQYXRoTGluZTtcblxuXHRcdGNvbnN0IHNQYWdlUGF0aCA9IG9QYWdlQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9QYWdlQ29udGV4dCAmJiBvUGFnZUNvbnRleHQuZ2V0TW9kZWwoKSAmJiAob1BhZ2VDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwpO1xuXHRcdGNvbnN0IHNNZXRhUGF0aFBhZ2UgPSBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhZ2VQYXRoKS5yZXBsYWNlKC9eXFwvKi8sIFwiXCIpO1xuXG5cdFx0Ly8gR2V0IHNpbmdsZSBsaW5lIGNvbnRleHQgaWYgbmVjZXNzYXJ5XG5cdFx0aWYgKGFMaW5lQ29udGV4dCAmJiBhTGluZUNvbnRleHQubGVuZ3RoKSB7XG5cdFx0XHRvQ29udGV4dCA9IGFMaW5lQ29udGV4dFswXTtcblx0XHRcdHNQYXRoTGluZSA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRcdHNNZXRhUGF0aExpbmUgPSBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGhMaW5lKS5yZXBsYWNlKC9eXFwvKi8sIFwiXCIpO1xuXG5cdFx0XHRhTGluZUNvbnRleHQuZm9yRWFjaCgob1NpbmdsZUNvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoc0NoYXJ0UGF0aCkge1xuXHRcdFx0XHRcdGNvbnN0IG9DaGFydENvbnRleHREYXRhID0gdGhpcy5fZ2V0Q2hhcnRDb250ZXh0RGF0YShvU2luZ2xlQ29udGV4dCwgc0NoYXJ0UGF0aCk7XG5cdFx0XHRcdFx0aWYgKG9DaGFydENvbnRleHREYXRhKSB7XG5cdFx0XHRcdFx0XHRhQXR0cmlidXRlcyA9IG9DaGFydENvbnRleHREYXRhLm1hcChmdW5jdGlvbiAob1N1YkNoYXJ0Q29udGV4dERhdGE6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHREYXRhOiBvU3ViQ2hhcnRDb250ZXh0RGF0YSxcblx0XHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IGAke3NNZXRhUGF0aFBhZ2V9LyR7c0NoYXJ0UGF0aH1gXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUF0dHJpYnV0ZXMucHVzaCh7XG5cdFx0XHRcdFx0XHRjb250ZXh0RGF0YTogb1NpbmdsZUNvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IHNNZXRhUGF0aExpbmVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGFQYWdlQXR0cmlidXRlcy5wdXNoKHtcblx0XHRcdGNvbnRleHREYXRhOiBvUGFnZUNvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRlbnRpdHlTZXQ6IHNNZXRhUGF0aFBhZ2Vcblx0XHR9KTtcblx0XHQvLyBBZGRpbmcgUGFnZSBDb250ZXh0IHRvIHNlbGVjdGlvbiB2YXJpYW50XG5cdFx0YVBhZ2VBdHRyaWJ1dGVzID0gQ29tbW9uVXRpbHMucmVtb3ZlU2Vuc2l0aXZlRGF0YShhUGFnZUF0dHJpYnV0ZXMsIG9NZXRhTW9kZWwpO1xuXHRcdGNvbnN0IG9QYWdlTGV2ZWxTViA9IENvbW1vblV0aWxzLmFkZFBhZ2VDb250ZXh0VG9TZWxlY3Rpb25WYXJpYW50KG5ldyBTZWxlY3Rpb25WYXJpYW50KCksIGFQYWdlQXR0cmlidXRlcywgdGhpcy5nZXRWaWV3KCkpO1xuXHRcdGFBdHRyaWJ1dGVzID0gQ29tbW9uVXRpbHMucmVtb3ZlU2Vuc2l0aXZlRGF0YShhQXR0cmlidXRlcywgb01ldGFNb2RlbCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IG9QYWdlTGV2ZWxTVixcblx0XHRcdGF0dHJpYnV0ZXM6IGFBdHRyaWJ1dGVzXG5cdFx0fTtcblx0fVxuXG5cdF9nZXRCYXRjaEdyb3Vwc0ZvclZpZXcoKSB7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gdGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnksXG5cdFx0XHRvQ29uZmlndXJhdGlvbnMgPSBvVmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24sXG5cdFx0XHRhQ29uZmlndXJhdGlvbnMgPSBvQ29uZmlndXJhdGlvbnMgJiYgT2JqZWN0LmtleXMob0NvbmZpZ3VyYXRpb25zKSxcblx0XHRcdGFCYXRjaEdyb3VwcyA9IFtcIiRhdXRvLkhlcm9lc1wiLCBcIiRhdXRvLkRlY29yYXRpb25cIiwgXCIkYXV0by5Xb3JrZXJzXCJdO1xuXG5cdFx0aWYgKGFDb25maWd1cmF0aW9ucyAmJiBhQ29uZmlndXJhdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0YUNvbmZpZ3VyYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvQ29uZmlndXJhdGlvbiA9IG9Db25maWd1cmF0aW9uc1tzS2V5XTtcblx0XHRcdFx0aWYgKG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkID09PSBcIkxvbmdSdW5uZXJzXCIpIHtcblx0XHRcdFx0XHRhQmF0Y2hHcm91cHMucHVzaChcIiRhdXRvLkxvbmdSdW5uZXJzXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFCYXRjaEdyb3Vwcztcblx0fVxuXG5cdC8qXG5cdCAqIFJlc2V0IEJyZWFkY3J1bWIgbGlua3Ncblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB7c2FwLm0uQnJlYWRjcnVtYnN9IFtvU291cmNlXSBwYXJlbnQgY29udHJvbFxuXHQgKiBAZGVzY3JpcHRpb24gVXNlZCB3aGVuIGNvbnRleHQgb2YgdGhlIG9iamVjdCBwYWdlIGNoYW5nZXMuXG5cdCAqICAgICAgICAgICAgICBUaGlzIGV2ZW50IGNhbGxiYWNrIGlzIGF0dGFjaGVkIHRvIG1vZGVsQ29udGV4dENoYW5nZVxuXHQgKiAgICAgICAgICAgICAgZXZlbnQgb2YgdGhlIEJyZWFkY3J1bWIgY29udHJvbCB0byBjYXRjaCBjb250ZXh0IGNoYW5nZS5cblx0ICogICAgICAgICAgICAgIFRoZW4gZWxlbWVudCBiaW5kaW5nIGFuZCBocmVmcyBhcmUgdXBkYXRlZCBmb3IgZWFjaCBsaW5rLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGV4cGVyaW1lbnRhbFxuXHQgKi9cblx0YXN5bmMgX3NldEJyZWFkY3J1bWJMaW5rcyhvU291cmNlOiBCcmVhZENydW1icykge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb1NvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0b0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRhUHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdLFxuXHRcdFx0YVNraXBQYXJhbWV0ZXJpemVkOiBhbnlbXSA9IFtdLFxuXHRcdFx0c05ld1BhdGggPSBvQ29udGV4dD8uZ2V0UGF0aCgpLFxuXHRcdFx0YVBhdGhQYXJ0cyA9IHNOZXdQYXRoPy5zcGxpdChcIi9cIikgPz8gW10sXG5cdFx0XHRvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudCAmJiBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBzUGF0aCA9IFwiXCI7XG5cdFx0dHJ5IHtcblx0XHRcdGFQYXRoUGFydHMuc2hpZnQoKTtcblx0XHRcdGFQYXRoUGFydHMuc3BsaWNlKC0xLCAxKTtcblx0XHRcdGFQYXRoUGFydHMuZm9yRWFjaChmdW5jdGlvbiAoc1BhdGhQYXJ0OiBhbnkpIHtcblx0XHRcdFx0c1BhdGggKz0gYC8ke3NQYXRoUGFydH1gO1xuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gb0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBSb290Q29udGFpbmVyQmFzZUNvbnRyb2xsZXI7XG5cdFx0XHRcdGNvbnN0IHNQYXJhbWV0ZXJQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzUGF0aCk7XG5cdFx0XHRcdGNvbnN0IGJSZXN1bHRDb250ZXh0ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhcmFtZXRlclBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVzdWx0Q29udGV4dGApO1xuXHRcdFx0XHRpZiAoYlJlc3VsdENvbnRleHQpIHtcblx0XHRcdFx0XHQvLyBXZSBkb250IG5lZWQgdG8gY3JlYXRlIGEgYnJlYWRjcnVtYiBmb3IgUGFyYW1ldGVyIHBhdGhcblx0XHRcdFx0XHRhU2tpcFBhcmFtZXRlcml6ZWQucHVzaCgxKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YVNraXBQYXJhbWV0ZXJpemVkLnB1c2goMCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YVByb21pc2VzLnB1c2gob1Jvb3RWaWV3Q29udHJvbGxlci5nZXRUaXRsZUluZm9Gcm9tUGF0aChzUGF0aCkpO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCB0aXRsZUhpZXJhcmNoeUluZm9zOiBhbnlbXSA9IGF3YWl0IFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG5cdFx0XHRsZXQgaWR4LCBoaWVyYXJjaHlQb3NpdGlvbiwgb0xpbms7XG5cdFx0XHRmb3IgKGNvbnN0IHRpdGxlSGllcmFyY2h5SW5mbyBvZiB0aXRsZUhpZXJhcmNoeUluZm9zKSB7XG5cdFx0XHRcdGhpZXJhcmNoeVBvc2l0aW9uID0gdGl0bGVIaWVyYXJjaHlJbmZvcy5pbmRleE9mKHRpdGxlSGllcmFyY2h5SW5mbyk7XG5cdFx0XHRcdGlkeCA9IGhpZXJhcmNoeVBvc2l0aW9uIC0gYVNraXBQYXJhbWV0ZXJpemVkW2hpZXJhcmNoeVBvc2l0aW9uXTtcblx0XHRcdFx0b0xpbmsgPSBvU291cmNlLmdldExpbmtzKClbaWR4XSA/IG9Tb3VyY2UuZ2V0TGlua3MoKVtpZHhdIDogbmV3IExpbmsoKTtcblx0XHRcdFx0Ly9zQ3VycmVudEVudGl0eSBpcyBhIGZhbGxiYWNrIHZhbHVlIGluIGNhc2Ugb2YgZW1wdHkgdGl0bGVcblx0XHRcdFx0b0xpbmsuc2V0VGV4dCh0aXRsZUhpZXJhcmNoeUluZm8uc3VidGl0bGUgfHwgdGl0bGVIaWVyYXJjaHlJbmZvLnRpdGxlKTtcblx0XHRcdFx0Ly9XZSBhcHBseSBhbiBhZGRpdGlvbmFsIGVuY29kZVVSSSBpbiBjYXNlIG9mIHNwZWNpYWwgY2hhcmFjdGVycyAoaWUgXCIvXCIpIHVzZWQgaW4gdGhlIHVybCB0aHJvdWdoIHRoZSBzZW1hbnRpYyBrZXlzXG5cdFx0XHRcdG9MaW5rLnNldEhyZWYoZW5jb2RlVVJJKHRpdGxlSGllcmFyY2h5SW5mby5pbnRlbnQpKTtcblx0XHRcdFx0aWYgKCFvU291cmNlLmdldExpbmtzKClbaWR4XSkge1xuXHRcdFx0XHRcdG9Tb3VyY2UuYWRkTGluayhvTGluayk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBzZXR0aW5nIHRoZSBicmVhZGNydW1iIGxpbmtzOlwiICsgZXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdF9jaGVja0RhdGFQb2ludFRpdGxlRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKCkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRjb25zdCBvRGF0YVBvaW50cyA9IENvbW1vblV0aWxzLmdldEhlYWRlckZhY2V0SXRlbUNvbmZpZ0ZvckV4dGVybmFsTmF2aWdhdGlvbihcblx0XHRcdG9WaWV3LmdldFZpZXdEYXRhKCksXG5cdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvdXRpbmdTZXJ2aWNlKCkuZ2V0T3V0Ym91bmRzKClcblx0XHQpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VzID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0Y29uc3Qgb1BhZ2VDb250ZXh0ID0gb1ZpZXcgJiYgKG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaXNIZWFkZXJEUExpbmtWaXNpYmxlXCIsIHt9KTtcblx0XHRpZiAob1BhZ2VDb250ZXh0KSB7XG5cdFx0XHRvUGFnZUNvbnRleHRcblx0XHRcdFx0LnJlcXVlc3RPYmplY3QoKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob0RhdGE6IGFueSkge1xuXHRcdFx0XHRcdGZuR2V0TGlua3Mob0RhdGFQb2ludHMsIG9EYXRhKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCByZXRyaWV2ZSB0aGUgbGlua3MgZnJvbSB0aGUgc2hlbGwgc2VydmljZVwiLCBvRXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBAcGFyYW0gb0Vycm9yXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZm5PbkVycm9yKG9FcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3Iob0Vycm9yKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBmblNldExpbmtFbmFibGVtZW50KGlkOiBzdHJpbmcsIGFTdXBwb3J0ZWRMaW5rczogYW55KSB7XG5cdFx0XHRjb25zdCBzTGlua0lkID0gaWQ7XG5cdFx0XHQvLyBwcm9jZXNzIHZpYWJsZSBsaW5rcyBmcm9tIGdldExpbmtzIGZvciBhbGwgZGF0YXBvaW50cyBoYXZpbmcgb3V0Ym91bmRcblx0XHRcdGlmIChhU3VwcG9ydGVkTGlua3MgJiYgYVN1cHBvcnRlZExpbmtzLmxlbmd0aCA9PT0gMSAmJiBhU3VwcG9ydGVkTGlua3NbMF0uc3VwcG9ydGVkKSB7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShgaXNIZWFkZXJEUExpbmtWaXNpYmxlLyR7c0xpbmtJZH1gLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBAcGFyYW0gb1N1YkRhdGFQb2ludHNcblx0XHQgKiBAcGFyYW0gb1BhZ2VEYXRhXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZm5HZXRMaW5rcyhvU3ViRGF0YVBvaW50czogYW55LCBvUGFnZURhdGE6IGFueSkge1xuXHRcdFx0Zm9yIChjb25zdCBzSWQgaW4gb1N1YkRhdGFQb2ludHMpIHtcblx0XHRcdFx0Y29uc3Qgb0RhdGFQb2ludCA9IG9TdWJEYXRhUG9pbnRzW3NJZF07XG5cdFx0XHRcdGNvbnN0IG9QYXJhbXM6IGFueSA9IHt9O1xuXHRcdFx0XHRjb25zdCBvTGluayA9IG9WaWV3LmJ5SWQoc0lkKTtcblx0XHRcdFx0aWYgKCFvTGluaykge1xuXHRcdFx0XHRcdC8vIGZvciBkYXRhIHBvaW50cyBjb25maWd1cmVkIGluIGFwcCBkZXNjcmlwdG9yIGJ1dCBub3QgYW5ub3RhdGVkIGluIHRoZSBoZWFkZXJcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBvTGlua0NvbnRleHQgPSBvTGluay5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0XHRjb25zdCBvTGlua0RhdGE6IGFueSA9IG9MaW5rQ29udGV4dCAmJiBvTGlua0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdGxldCBvTWl4ZWRDb250ZXh0OiBhbnkgPSBtZXJnZSh7fSwgb1BhZ2VEYXRhLCBvTGlua0RhdGEpO1xuXHRcdFx0XHQvLyBwcm9jZXNzIHNlbWFudGljIG9iamVjdCBtYXBwaW5nc1xuXHRcdFx0XHRpZiAob0RhdGFQb2ludC5zZW1hbnRpY09iamVjdE1hcHBpbmcpIHtcblx0XHRcdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RNYXBwaW5nID0gb0RhdGFQb2ludC5zZW1hbnRpY09iamVjdE1hcHBpbmc7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBpdGVtIGluIGFTZW1hbnRpY09iamVjdE1hcHBpbmcpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9NYXBwaW5nID0gYVNlbWFudGljT2JqZWN0TWFwcGluZ1tpdGVtXTtcblx0XHRcdFx0XHRcdGNvbnN0IHNNYWluUHJvcGVydHkgPSBvTWFwcGluZ1tcIkxvY2FsUHJvcGVydHlcIl1bXCIkUHJvcGVydHlQYXRoXCJdO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc01hcHBlZFByb3BlcnR5ID0gb01hcHBpbmdbXCJTZW1hbnRpY09iamVjdFByb3BlcnR5XCJdO1xuXHRcdFx0XHRcdFx0aWYgKHNNYWluUHJvcGVydHkgIT09IHNNYXBwZWRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRpZiAob01peGVkQ29udGV4dC5oYXNPd25Qcm9wZXJ0eShzTWFpblByb3BlcnR5KSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9OZXdNYXBwaW5nOiBhbnkgPSB7fTtcblx0XHRcdFx0XHRcdFx0XHRvTmV3TWFwcGluZ1tzTWFwcGVkUHJvcGVydHldID0gb01peGVkQ29udGV4dFtzTWFpblByb3BlcnR5XTtcblx0XHRcdFx0XHRcdFx0XHRvTWl4ZWRDb250ZXh0ID0gbWVyZ2Uoe30sIG9NaXhlZENvbnRleHQsIG9OZXdNYXBwaW5nKTtcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgb01peGVkQ29udGV4dFtzTWFpblByb3BlcnR5XTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvTWl4ZWRDb250ZXh0KSB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBzS2V5IGluIG9NaXhlZENvbnRleHQpIHtcblx0XHRcdFx0XHRcdGlmIChzS2V5LmluZGV4T2YoXCJfXCIpICE9PSAwICYmIHNLZXkuaW5kZXhPZihcIm9kYXRhLmNvbnRleHRcIikgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdG9QYXJhbXNbc0tleV0gPSBvTWl4ZWRDb250ZXh0W3NLZXldO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyB2YWxpZGF0ZSBpZiBhIGxpbmsgbXVzdCBiZSByZW5kZXJlZFxuXHRcdFx0XHRvU2hlbGxTZXJ2aWNlc1xuXHRcdFx0XHRcdC5pc05hdmlnYXRpb25TdXBwb3J0ZWQoW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHtcblx0XHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb0RhdGFQb2ludC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0XHRhY3Rpb246IG9EYXRhUG9pbnQuYWN0aW9uXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdHBhcmFtczogb1BhcmFtc1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0LnRoZW4oKGFMaW5rcykgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZuU2V0TGlua0VuYWJsZW1lbnQoc0lkLCBhTGlua3MpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZuT25FcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aGFuZGxlcnMgPSB7XG5cdFx0LyoqXG5cdFx0ICogSW52b2tlcyB0aGUgcGFnZSBwcmltYXJ5IGFjdGlvbiBvbiBwcmVzcyBvZiBDdHJsK0VudGVyLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSBwYWdlIGNvbnRyb2xsZXJcblx0XHQgKiBAcGFyYW0gb1ZpZXdcblx0XHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIGFjdGlvbiBpcyBjYWxsZWRcblx0XHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiB0byBiZSBjYWxsZWRcblx0XHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBDb250YWlucyB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdFx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5jb250ZXh0c10gTWFuZGF0b3J5IGZvciBhIGJvdW5kIGFjdGlvbiwgZWl0aGVyIG9uZSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgZm9yIHdoaWNoIHRoZSBhY3Rpb24gaXMgY2FsbGVkXG5cdFx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5tb2RlbF0gTWFuZGF0b3J5IGZvciBhbiB1bmJvdW5kIGFjdGlvbjsgYW4gaW5zdGFuY2Ugb2YgYW4gT0RhdGEgVjQgbW9kZWxcblx0XHQgKiBAcGFyYW0gW21Db25kaXRpb25zXSBDb250YWlucyB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdFx0ICogQHBhcmFtIFttQ29uZGl0aW9ucy5wb3NpdGl2ZUFjdGlvblZpc2libGVdIFRoZSB2aXNpYmlsaXR5IG9mIHNlbWF0aWMgcG9zaXRpdmUgYWN0aW9uXG5cdFx0ICogQHBhcmFtIFttQ29uZGl0aW9ucy5wb3NpdGl2ZUFjdGlvbkVuYWJsZWRdIFRoZSBlbmFibGVtZW50IG9mIHNlbWFudGljIHBvc2l0aXZlIGFjdGlvblxuXHRcdCAqIEBwYXJhbSBbbUNvbmRpdGlvbnMuZWRpdEFjdGlvblZpc2libGVdIFRoZSBFZGl0IGJ1dHRvbiB2aXNpYmlsaXR5XG5cdFx0ICogQHBhcmFtIFttQ29uZGl0aW9ucy5lZGl0QWN0aW9uRW5hYmxlZF0gVGhlIGVuYWJsZW1lbnQgb2YgRWRpdCBidXR0b25cblx0XHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0XHQgKiBAZmluYWxcblx0XHQgKi9cblx0XHRvblByaW1hcnlBY3Rpb24oXG5cdFx0XHRvQ29udHJvbGxlcjogT2JqZWN0UGFnZUNvbnRyb2xsZXIsXG5cdFx0XHRvVmlldzogVmlldyxcblx0XHRcdG9Db250ZXh0OiBDb250ZXh0LFxuXHRcdFx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0XHRcdG1QYXJhbWV0ZXJzOiB1bmtub3duLFxuXHRcdFx0bUNvbmRpdGlvbnM6IHtcblx0XHRcdFx0cG9zaXRpdmVBY3Rpb25WaXNpYmxlOiBib29sZWFuO1xuXHRcdFx0XHRwb3NpdGl2ZUFjdGlvbkVuYWJsZWQ6IGJvb2xlYW47XG5cdFx0XHRcdGVkaXRBY3Rpb25WaXNpYmxlOiBib29sZWFuO1xuXHRcdFx0XHRlZGl0QWN0aW9uRW5hYmxlZDogYm9vbGVhbjtcblx0XHRcdH1cblx0XHQpIHtcblx0XHRcdGNvbnN0IGlWaWV3TGV2ZWwgPSAob0NvbnRyb2xsZXIuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS52aWV3TGV2ZWwsXG5cdFx0XHRcdG9PYmplY3RQYWdlID0gb0NvbnRyb2xsZXIuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCk7XG5cdFx0XHRpZiAobUNvbmRpdGlvbnMucG9zaXRpdmVBY3Rpb25WaXNpYmxlKSB7XG5cdFx0XHRcdGlmIChtQ29uZGl0aW9ucy5wb3NpdGl2ZUFjdGlvbkVuYWJsZWQpIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5oYW5kbGVycy5vbkNhbGxBY3Rpb24ob1ZpZXcsIHNBY3Rpb25OYW1lLCBtUGFyYW1ldGVycyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAobUNvbmRpdGlvbnMuZWRpdEFjdGlvblZpc2libGUgJiYgaVZpZXdMZXZlbCA9PT0gMSkge1xuXHRcdFx0XHRpZiAobUNvbmRpdGlvbnMuZWRpdEFjdGlvbkVuYWJsZWQpIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5fZWRpdERvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpVmlld0xldmVsID09PSAxICYmIG9PYmplY3RQYWdlLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0XHRvQ29udHJvbGxlci5fc2F2ZURvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdH0gZWxzZSBpZiAob09iamVjdFBhZ2UuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpKSB7XG5cdFx0XHRcdG9Db250cm9sbGVyLl9hcHBseURvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25UYWJsZUNvbnRleHRDaGFuZ2UodGhpczogT2JqZWN0UGFnZUNvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBvU291cmNlID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdFx0bGV0IG9UYWJsZTogYW55O1xuXHRcdFx0dGhpcy5fZmluZFRhYmxlcygpLnNvbWUoZnVuY3Rpb24gKF9vVGFibGU6IGFueSkge1xuXHRcdFx0XHRpZiAoX29UYWJsZS5nZXRSb3dCaW5kaW5nKCkgPT09IG9Tb3VyY2UpIHtcblx0XHRcdFx0XHRvVGFibGUgPSBfb1RhYmxlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRjb25zdCBvQ3VycmVudEFjdGlvblByb21pc2UgPSB0aGlzLl9lZGl0Rmxvdy5nZXRDdXJyZW50QWN0aW9uUHJvbWlzZSgpO1xuXHRcdFx0aWYgKG9DdXJyZW50QWN0aW9uUHJvbWlzZSkge1xuXHRcdFx0XHRsZXQgYVRhYmxlQ29udGV4dHM6IGFueTtcblx0XHRcdFx0aWYgKG9UYWJsZS5nZXRUeXBlKCkuZ2V0TWV0YWRhdGEoKS5pc0EoXCJzYXAudWkubWRjLnRhYmxlLkdyaWRUYWJsZVR5cGVcIikpIHtcblx0XHRcdFx0XHRhVGFibGVDb250ZXh0cyA9IG9Tb3VyY2UuZ2V0Q29udGV4dHMoMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YVRhYmxlQ29udGV4dHMgPSBvU291cmNlLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vaWYgY29udGV4dHMgYXJlIG5vdCBmdWxseSBsb2FkZWQgdGhlIGdldGNvbnRleHRzIGZ1bmN0aW9uIGFib3ZlIHdpbGwgdHJpZ2dlciBhIG5ldyBjaGFuZ2UgZXZlbnQgY2FsbFxuXHRcdFx0XHRpZiAoIWFUYWJsZUNvbnRleHRzWzBdKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9DdXJyZW50QWN0aW9uUHJvbWlzZVxuXHRcdFx0XHRcdC50aGVuKChvQWN0aW9uUmVzcG9uc2U6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKCFvQWN0aW9uUmVzcG9uc2UgfHwgb0FjdGlvblJlc3BvbnNlLmNvbnRyb2xJZCAhPT0gb1RhYmxlLnNJZCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25zdCBvQWN0aW9uRGF0YSA9IG9BY3Rpb25SZXNwb25zZS5vRGF0YTtcblx0XHRcdFx0XHRcdGNvbnN0IGFLZXlzID0gb0FjdGlvblJlc3BvbnNlLmtleXM7XG5cdFx0XHRcdFx0XHRsZXQgaU5ld0l0ZW1wID0gLTE7XG5cdFx0XHRcdFx0XHRhVGFibGVDb250ZXh0cy5maW5kKGZ1bmN0aW9uIChvVGFibGVDb250ZXh0OiBhbnksIGk6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvVGFibGVEYXRhID0gb1RhYmxlQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYkNvbXBhcmUgPSBhS2V5cy5ldmVyeShmdW5jdGlvbiAoc0tleTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9UYWJsZURhdGFbc0tleV0gPT09IG9BY3Rpb25EYXRhW3NLZXldO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGJDb21wYXJlKSB7XG5cdFx0XHRcdFx0XHRcdFx0aU5ld0l0ZW1wID0gaTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYkNvbXBhcmU7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmIChpTmV3SXRlbXAgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFEaWFsb2dzID0gSW5zdGFuY2VNYW5hZ2VyLmdldE9wZW5EaWFsb2dzKCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9EaWFsb2cgPVxuXHRcdFx0XHRcdFx0XHRcdGFEaWFsb2dzLmxlbmd0aCA+IDAgPyBhRGlhbG9ncy5maW5kKChkaWFsb2cpID0+IGRpYWxvZy5kYXRhKFwiRnVsbFNjcmVlbkRpYWxvZ1wiKSAhPT0gdHJ1ZSkgOiBudWxsO1xuXHRcdFx0XHRcdFx0XHRpZiAob0RpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGJ5IGRlc2lnbiwgYSBzYXAubS5kaWFsb2cgc2V0IHRoZSBmb2N1cyB0byB0aGUgcHJldmlvdXMgZm9jdXNlZCBlbGVtZW50IHdoZW4gY2xvc2luZy5cblx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBzaG91bGQgd2FpdCBmb3IgdGhlIGRpYWxvZyB0byBiZSBjbG9zZSBiZWZvcmUgdG8gZm9jdXMgYW5vdGhlciBlbGVtZW50XG5cdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5hdHRhY2hFdmVudE9uY2UoXCJhZnRlckNsb3NlXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9UYWJsZS5mb2N1c1JvdyhpTmV3SXRlbXAsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdG9UYWJsZS5mb2N1c1JvdyhpTmV3SXRlbXAsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHRoaXMuX2VkaXRGbG93LmRlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoYEFuIGVycm9yIG9jY3VycyB3aGlsZSBzY3JvbGxpbmcgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgSXRlbTogJHtlcnJ9YCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBmaXJlIE1vZGVsQ29udGV4dENoYW5nZSBvbiB0aGUgbWVzc2FnZSBidXR0b24gd2hlbmV2ZXIgdGhlIHRhYmxlIGNvbnRleHQgY2hhbmdlc1xuXHRcdFx0dGhpcy5tZXNzYWdlQnV0dG9uLmZpcmVNb2RlbENvbnRleHRDaGFuZ2UoKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSW52b2tlcyBhbiBhY3Rpb24gLSBib3VuZC91bmJvdW5kIGFuZCBzZXRzIHRoZSBwYWdlIGRpcnR5LlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG9WaWV3XG5cdFx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdFx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gQ29udGFpbnMgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY29udGV4dHNdIE1hbmRhdG9yeSBmb3IgYSBib3VuZCBhY3Rpb24sIGVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIGNhbGxlZFxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubW9kZWxdIE1hbmRhdG9yeSBmb3IgYW4gdW5ib3VuZCBhY3Rpb247IGFuIGluc3RhbmNlIG9mIGFuIE9EYXRhIFY0IG1vZGVsXG5cdFx0ICogQHJldHVybnMgVGhlIGFjdGlvbiBwcm9taXNlXG5cdFx0ICogQHVpNS1yZXN0cmljdGVkXG5cdFx0ICogQGZpbmFsXG5cdFx0ICovXG5cdFx0b25DYWxsQWN0aW9uKG9WaWV3OiBhbnksIHNBY3Rpb25OYW1lOiBzdHJpbmcsIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLmVkaXRGbG93XG5cdFx0XHRcdC5pbnZva2VBY3Rpb24oc0FjdGlvbk5hbWUsIG1QYXJhbWV0ZXJzKVxuXHRcdFx0XHQudGhlbihvQ29udHJvbGxlci5fc2hvd01lc3NhZ2VQb3BvdmVyLmJpbmQob0NvbnRyb2xsZXIsIHVuZGVmaW5lZCkpXG5cdFx0XHRcdC5jYXRjaChvQ29udHJvbGxlci5fc2hvd01lc3NhZ2VQb3BvdmVyLmJpbmQob0NvbnRyb2xsZXIpKTtcblx0XHR9LFxuXHRcdG9uRGF0YVBvaW50VGl0bGVQcmVzc2VkKG9Db250cm9sbGVyOiBhbnksIG9Tb3VyY2U6IGFueSwgb01hbmlmZXN0T3V0Ym91bmQ6IGFueSwgc0NvbnRyb2xDb25maWc6IGFueSwgc0NvbGxlY3Rpb25QYXRoOiBhbnkpIHtcblx0XHRcdG9NYW5pZmVzdE91dGJvdW5kID0gdHlwZW9mIG9NYW5pZmVzdE91dGJvdW5kID09PSBcInN0cmluZ1wiID8gSlNPTi5wYXJzZShvTWFuaWZlc3RPdXRib3VuZCkgOiBvTWFuaWZlc3RPdXRib3VuZDtcblx0XHRcdGNvbnN0IG9UYXJnZXRJbmZvID0gb01hbmlmZXN0T3V0Ym91bmRbc0NvbnRyb2xDb25maWddLFxuXHRcdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5nID0gQ29tbW9uVXRpbHMuZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nKG9UYXJnZXRJbmZvKSxcblx0XHRcdFx0b0RhdGFQb2ludE9yQ2hhcnRCaW5kaW5nQ29udGV4dCA9IG9Tb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdFx0c01ldGFQYXRoID0gb0RhdGFQb2ludE9yQ2hhcnRCaW5kaW5nQ29udGV4dFxuXHRcdFx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHRcdFx0LmdldE1ldGFNb2RlbCgpXG5cdFx0XHRcdFx0LmdldE1ldGFQYXRoKG9EYXRhUG9pbnRPckNoYXJ0QmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdGxldCBhTmF2aWdhdGlvbkRhdGEgPSBvQ29udHJvbGxlci5fZ2V0Q2hhcnRDb250ZXh0RGF0YShvRGF0YVBvaW50T3JDaGFydEJpbmRpbmdDb250ZXh0LCBzQ29sbGVjdGlvblBhdGgpO1xuXHRcdFx0bGV0IGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycztcblxuXHRcdFx0YU5hdmlnYXRpb25EYXRhID0gYU5hdmlnYXRpb25EYXRhLm1hcChmdW5jdGlvbiAob05hdmlnYXRpb25EYXRhOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRkYXRhOiBvTmF2aWdhdGlvbkRhdGEsXG5cdFx0XHRcdFx0bWV0YVBhdGg6IHNNZXRhUGF0aCArIChzQ29sbGVjdGlvblBhdGggPyBgLyR7c0NvbGxlY3Rpb25QYXRofWAgOiBcIlwiKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAob1RhcmdldEluZm8gJiYgb1RhcmdldEluZm8ucGFyYW1ldGVycykge1xuXHRcdFx0XHRjb25zdCBvUGFyYW1zID0gb1RhcmdldEluZm8ucGFyYW1ldGVycyAmJiBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLmdldE91dGJvdW5kUGFyYW1zKG9UYXJnZXRJbmZvLnBhcmFtZXRlcnMpO1xuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob1BhcmFtcykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycyA9IG9QYXJhbXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChvVGFyZ2V0SW5mbyAmJiBvVGFyZ2V0SW5mby5zZW1hbnRpY09iamVjdCAmJiBvVGFyZ2V0SW5mby5hY3Rpb24pIHtcblx0XHRcdFx0b0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZShvVGFyZ2V0SW5mby5zZW1hbnRpY09iamVjdCwgb1RhcmdldEluZm8uYWN0aW9uLCB7XG5cdFx0XHRcdFx0bmF2aWdhdGlvbkNvbnRleHRzOiBhTmF2aWdhdGlvbkRhdGEsXG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nOiBhU2VtYW50aWNPYmplY3RNYXBwaW5nLFxuXHRcdFx0XHRcdGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVyczogYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVHJpZ2dlcnMgYW4gb3V0Ym91bmQgbmF2aWdhdGlvbiB3aGVuIGEgdXNlciBjaG9vc2VzIHRoZSBjaGV2cm9uLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG9Db250cm9sbGVyXG5cdFx0ICogQHBhcmFtIHNPdXRib3VuZFRhcmdldCBOYW1lIG9mIHRoZSBvdXRib3VuZCB0YXJnZXQgKG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0KVxuXHRcdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIGZvciB0aGUgdGFyZ2V0IGFwcFxuXHRcdCAqIEBwYXJhbSBzQ3JlYXRlUGF0aCBDcmVhdGUgcGF0aCB3aGVuIHRoZSBjaGV2cm9uIGlzIGNyZWF0ZWQuXG5cdFx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZCAoPz8/IG1heWJlIG9ubHkgb25jZSBmaW5pc2hlZD8pXG5cdFx0ICogQHVpNS1yZXN0cmljdGVkXG5cdFx0ICogQGZpbmFsXG5cdFx0ICovXG5cdFx0b25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyOiBPYmplY3RQYWdlQ29udHJvbGxlciwgc091dGJvdW5kVGFyZ2V0OiBzdHJpbmcsIG9Db250ZXh0OiBhbnksIHNDcmVhdGVQYXRoOiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZChvQ29udHJvbGxlciwgc091dGJvdW5kVGFyZ2V0LCBvQ29udGV4dCwgc0NyZWF0ZVBhdGgpO1xuXHRcdH0sXG5cblx0XHRvbk5hdmlnYXRlQ2hhbmdlKHRoaXM6IE9iamVjdFBhZ2VDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Ly93aWxsIGJlIGNhbGxlZCBhbHdheXMgd2hlbiB3ZSBjbGljayBvbiBhIHNlY3Rpb24gdGFiXG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHR0aGlzLmJTZWN0aW9uTmF2aWdhdGVkID0gdHJ1ZTtcblxuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRcdGlmIChcblx0XHRcdFx0b09iamVjdFBhZ2UuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpICYmXG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuc2VjdGlvbkxheW91dCA9PT0gXCJUYWJzXCIgJiZcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiZXJyb3JOYXZpZ2F0aW9uU2VjdGlvbkZsYWdcIikgPT09IGZhbHNlXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3Qgb1N1YlNlY3Rpb24gPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwic3ViU2VjdGlvblwiKTtcblx0XHRcdFx0dGhpcy5fdXBkYXRlRm9jdXNJbkVkaXRNb2RlKFtvU3ViU2VjdGlvbl0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b25WYXJpYW50U2VsZWN0ZWQ6IGZ1bmN0aW9uICh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH0sXG5cdFx0b25WYXJpYW50U2F2ZWQ6IGZ1bmN0aW9uICh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlcikge1xuXHRcdFx0Ly9UT0RPOiBTaG91bGQgcmVtb3ZlIHRoaXMgc2V0VGltZU91dCBvbmNlIFZhcmlhbnQgTWFuYWdlbWVudCBwcm92aWRlcyBhbiBhcGkgdG8gZmV0Y2ggdGhlIGN1cnJlbnQgdmFyaWFudCBrZXkgb24gc2F2ZVxuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHRcdH0sIDUwMCk7XG5cdFx0fSxcblx0XHRuYXZpZ2F0ZVRvU3ViU2VjdGlvbjogZnVuY3Rpb24gKG9Db250cm9sbGVyOiBPYmplY3RQYWdlQ29udHJvbGxlciwgdkRldGFpbENvbmZpZzogYW55KSB7XG5cdFx0XHRjb25zdCBvRGV0YWlsQ29uZmlnID0gdHlwZW9mIHZEZXRhaWxDb25maWcgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHZEZXRhaWxDb25maWcpIDogdkRldGFpbENvbmZpZztcblx0XHRcdGNvbnN0IG9PYmplY3RQYWdlID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQoXCJmZTo6T2JqZWN0UGFnZVwiKSBhcyBPYmplY3RQYWdlTGF5b3V0O1xuXHRcdFx0bGV0IG9TZWN0aW9uO1xuXHRcdFx0bGV0IG9TdWJTZWN0aW9uO1xuXHRcdFx0aWYgKG9EZXRhaWxDb25maWcuc2VjdGlvbklkKSB7XG5cdFx0XHRcdG9TZWN0aW9uID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQob0RldGFpbENvbmZpZy5zZWN0aW9uSWQpIGFzIE9iamVjdFBhZ2VTZWN0aW9uO1xuXHRcdFx0XHRvU3ViU2VjdGlvbiA9IChcblx0XHRcdFx0XHRvRGV0YWlsQ29uZmlnLnN1YlNlY3Rpb25JZFxuXHRcdFx0XHRcdFx0PyBvQ29udHJvbGxlci5nZXRWaWV3KCkuYnlJZChvRGV0YWlsQ29uZmlnLnN1YlNlY3Rpb25JZClcblx0XHRcdFx0XHRcdDogb1NlY3Rpb24gJiYgb1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKSAmJiBvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpWzBdXG5cdFx0XHRcdCkgYXMgT2JqZWN0UGFnZVN1YlNlY3Rpb247XG5cdFx0XHR9IGVsc2UgaWYgKG9EZXRhaWxDb25maWcuc3ViU2VjdGlvbklkKSB7XG5cdFx0XHRcdG9TdWJTZWN0aW9uID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQob0RldGFpbENvbmZpZy5zdWJTZWN0aW9uSWQpIGFzIE9iamVjdFBhZ2VTdWJTZWN0aW9uO1xuXHRcdFx0XHRvU2VjdGlvbiA9IG9TdWJTZWN0aW9uICYmIChvU3ViU2VjdGlvbi5nZXRQYXJlbnQoKSBhcyBPYmplY3RQYWdlU2VjdGlvbik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIW9TZWN0aW9uIHx8ICFvU3ViU2VjdGlvbiB8fCAhb1NlY3Rpb24uZ2V0VmlzaWJsZSgpIHx8ICFvU3ViU2VjdGlvbi5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdFx0KChvQ29udHJvbGxlci5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJzYXAuZmUuaTE4blwiKSBhcyBSZXNvdXJjZU1vZGVsKS5nZXRSZXNvdXJjZUJ1bmRsZSgpIGFzIFByb21pc2U8UmVzb3VyY2VCdW5kbGU+KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvUmVzb3VyY2VCdW5kbGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNUaXRsZSA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcIkNfUk9VVElOR19OQVZJR0FUSU9OX0RJU0FCTEVEX1RJVExFXCIsXG5cdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0KG9Db250cm9sbGVyLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuZW50aXR5U2V0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKHNUaXRsZSk7XG5cdFx0XHRcdFx0XHRNZXNzYWdlQm94LmVycm9yKHNUaXRsZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoZXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b09iamVjdFBhZ2Uuc2Nyb2xsVG9TZWN0aW9uKG9TdWJTZWN0aW9uLmdldElkKCkpO1xuXHRcdFx0XHQvLyB0cmlnZ2VyIGlhcHAgc3RhdGUgY2hhbmdlXG5cdFx0XHRcdG9PYmplY3RQYWdlLmZpcmVOYXZpZ2F0ZSh7XG5cdFx0XHRcdFx0c2VjdGlvbjogb1NlY3Rpb24sXG5cdFx0XHRcdFx0c3ViU2VjdGlvbjogb1N1YlNlY3Rpb25cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvbkNoYXJ0U2VsZWN0aW9uQ2hhbmdlZDogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRDaGFydFJ1bnRpbWUuZm5VcGRhdGVDaGFydChvRXZlbnQpO1xuXHRcdH0sXG5cdFx0b25TdGF0ZUNoYW5nZSh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0UGFnZUNvbnRyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBR08sMEJBQTBCRixJQUFJLEVBQUVLLFNBQVMsRUFBRTtJQUNqRCxJQUFJO01BQ0gsSUFBSUgsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU9HLENBQUMsRUFBRTtNQUNYLE9BQU9FLFNBQVMsQ0FBQyxJQUFJLEVBQUVGLENBQUMsQ0FBQztJQUMxQjtJQUNBLElBQUlELE1BQU0sSUFBSUEsTUFBTSxDQUFDRSxJQUFJLEVBQUU7TUFDMUIsT0FBT0YsTUFBTSxDQUFDRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0MsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRUQsU0FBUyxDQUFDQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVFO0lBQ0EsT0FBT0QsU0FBUyxDQUFDLEtBQUssRUFBRUgsTUFBTSxDQUFDO0VBQ2hDO0VBQUM7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7RUFBQSxJQXBnQktLLG9CQUFvQixXQUR6QkMsY0FBYyxDQUFDLGtEQUFrRCxDQUFDLFVBR2pFQyxjQUFjLENBQUNDLFdBQVcsQ0FBQyxVQUUzQkQsY0FBYyxDQUFDRSxRQUFRLENBQUMsVUFFeEJGLGNBQWMsQ0FBQ0csS0FBSyxDQUFDQyxRQUFRLENBQUNDLGNBQWMsQ0FBQyxDQUFDLFVBRTlDTCxjQUFjLENBQUNNLGdCQUFnQixDQUFDRixRQUFRLENBQUNHLGlCQUFpQixDQUFDLENBQUMsVUFFNURQLGNBQWMsQ0FBQ1EsZUFBZSxDQUFDSixRQUFRLENBQUNLLHVCQUF1QixDQUFDLENBQUMsVUFFakVULGNBQWMsQ0FBQ1UsU0FBUyxDQUFDTixRQUFRLENBQUNPLGlCQUFpQixDQUFDLENBQUMsVUFFckRYLGNBQWMsQ0FBQ1ksY0FBYyxDQUFDUixRQUFRLENBQUNTLHNCQUFzQixDQUFDLENBQUMsVUFFL0RiLGNBQWMsQ0FBQ2MscUJBQXFCLENBQUNWLFFBQVEsQ0FBQ1csNkJBQTZCLENBQUMsQ0FBQyxXQUU3RWYsY0FBYyxDQUNkZ0IsNkJBQTZCLENBQUNaLFFBQVEsQ0FBQztJQUN0Q2EsaUJBQWlCLEVBQUUsWUFBK0M7TUFDakUsSUFBTUMsaUJBQWlCLEdBQ3JCLElBQUksQ0FBQ0MsT0FBTyxFQUFFLENBQUNDLGFBQWEsRUFBRSxDQUEwQkMsaUJBQWlCLElBQ3pFLElBQUksQ0FBQ0YsT0FBTyxFQUFFLENBQUNDLGFBQWEsRUFBRSxDQUEwQkMsaUJBQWlCLEVBQUU7TUFDN0UsT0FBT0gsaUJBQWlCLEdBQUcsU0FBUyxHQUFHSSxTQUFTO0lBQ2pEO0VBQ0QsQ0FBQyxDQUFDLENBQ0YsV0FFQXRCLGNBQWMsQ0FBQ3VCLFNBQVMsQ0FBQ25CLFFBQVEsQ0FBQ29CLGtCQUFrQixDQUFDLENBQUMsV0FFdER4QixjQUFjLENBQ2R5QixTQUFTLENBQUNyQixRQUFRLENBQUM7SUFDbEJzQixpQkFBaUIsRUFBRSxZQUFZO01BQzlCLE9BQU8sSUFBSTtJQUNaO0VBQ0QsQ0FBQyxDQUFDLENBQ0YsV0FFQTFCLGNBQWMsQ0FBQzJCLFFBQVEsQ0FBQyxXQVV4QkMsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0E0a0JoQkQsZUFBZSxFQUFFLFdBQ2pCRSxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBLE1Bc3FCcENDLFFBQVEsR0FBRztRQUNWO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtRQUNFQyxlQUFlLFlBQ2RDLFdBQWlDLEVBQ2pDQyxLQUFXLEVBQ1hDLFFBQWlCLEVBQ2pCQyxXQUFtQixFQUNuQkMsV0FBb0IsRUFDcEJDLFdBS0MsRUFDQTtVQUNELElBQU1DLFVBQVUsR0FBSU4sV0FBVyxDQUFDaEIsT0FBTyxFQUFFLENBQUN1QixXQUFXLEVBQUUsQ0FBU0MsU0FBUztZQUN4RUMsV0FBVyxHQUFHVCxXQUFXLENBQUNVLDJCQUEyQixFQUFFO1VBQ3hELElBQUlMLFdBQVcsQ0FBQ00scUJBQXFCLEVBQUU7WUFDdEMsSUFBSU4sV0FBVyxDQUFDTyxxQkFBcUIsRUFBRTtjQUN0Q1osV0FBVyxDQUFDRixRQUFRLENBQUNlLFlBQVksQ0FBQ1osS0FBSyxFQUFFRSxXQUFXLEVBQUVDLFdBQVcsQ0FBQztZQUNuRTtVQUNELENBQUMsTUFBTSxJQUFJQyxXQUFXLENBQUNTLGlCQUFpQixJQUFJUixVQUFVLEtBQUssQ0FBQyxFQUFFO1lBQzdELElBQUlELFdBQVcsQ0FBQ1UsaUJBQWlCLEVBQUU7Y0FDbENmLFdBQVcsQ0FBQ2dCLGFBQWEsQ0FBQ2QsUUFBUSxDQUFDO1lBQ3BDO1VBQ0QsQ0FBQyxNQUFNLElBQUlJLFVBQVUsS0FBSyxDQUFDLElBQUlHLFdBQVcsQ0FBQ1EsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDQyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDckZsQixXQUFXLENBQUNtQixhQUFhLENBQUNqQixRQUFRLENBQUM7VUFDcEMsQ0FBQyxNQUFNLElBQUlPLFdBQVcsQ0FBQ1EsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDQyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDakVsQixXQUFXLENBQUNvQixjQUFjLENBQUNsQixRQUFRLENBQUM7VUFDckM7UUFDRCxDQUFDO1FBRURtQixvQkFBb0IsWUFBNkJDLE1BQVcsRUFBRTtVQUFBO1VBQzdELElBQU1DLE9BQU8sR0FBR0QsTUFBTSxDQUFDRSxTQUFTLEVBQUU7VUFDbEMsSUFBSUMsTUFBVztVQUNmLElBQUksQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLElBQUksQ0FBQyxVQUFVQyxPQUFZLEVBQUU7WUFDL0MsSUFBSUEsT0FBTyxDQUFDQyxhQUFhLEVBQUUsS0FBS04sT0FBTyxFQUFFO2NBQ3hDRSxNQUFNLEdBQUdHLE9BQU87Y0FDaEIsT0FBTyxJQUFJO1lBQ1o7WUFDQSxPQUFPLEtBQUs7VUFDYixDQUFDLENBQUM7VUFFRixJQUFNRSxxQkFBcUIsR0FBRyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0MsdUJBQXVCLEVBQUU7VUFDdEUsSUFBSUYscUJBQXFCLEVBQUU7WUFDMUIsSUFBSUcsY0FBbUI7WUFDdkIsSUFBSVIsTUFBTSxDQUFDUyxPQUFPLEVBQUUsQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFO2NBQ3pFSCxjQUFjLEdBQUdWLE9BQU8sQ0FBQ2MsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QyxDQUFDLE1BQU07Y0FDTkosY0FBYyxHQUFHVixPQUFPLENBQUNlLGtCQUFrQixFQUFFO1lBQzlDO1lBQ0E7WUFDQSxJQUFJLENBQUNMLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRTtjQUN2QjtZQUNEO1lBQ0FILHFCQUFxQixDQUNuQnRFLElBQUksQ0FBQyxVQUFDK0UsZUFBb0IsRUFBSztjQUMvQixJQUFJLENBQUNBLGVBQWUsSUFBSUEsZUFBZSxDQUFDQyxTQUFTLEtBQUtmLE1BQU0sQ0FBQ2dCLEdBQUcsRUFBRTtnQkFDakU7Y0FDRDtjQUNBLElBQU1DLFdBQVcsR0FBR0gsZUFBZSxDQUFDSSxLQUFLO2NBQ3pDLElBQU1DLEtBQUssR0FBR0wsZUFBZSxDQUFDTSxJQUFJO2NBQ2xDLElBQUlDLFNBQVMsR0FBRyxDQUFDLENBQUM7Y0FDbEJiLGNBQWMsQ0FBQ2MsSUFBSSxDQUFDLFVBQVVDLGFBQWtCLEVBQUVDLENBQU0sRUFBRTtnQkFDekQsSUFBTUMsVUFBVSxHQUFHRixhQUFhLENBQUNHLFNBQVMsRUFBRTtnQkFDNUMsSUFBTUMsUUFBUSxHQUFHUixLQUFLLENBQUNTLEtBQUssQ0FBQyxVQUFVQyxJQUFTLEVBQUU7a0JBQ2pELE9BQU9KLFVBQVUsQ0FBQ0ksSUFBSSxDQUFDLEtBQUtaLFdBQVcsQ0FBQ1ksSUFBSSxDQUFDO2dCQUM5QyxDQUFDLENBQUM7Z0JBQ0YsSUFBSUYsUUFBUSxFQUFFO2tCQUNiTixTQUFTLEdBQUdHLENBQUM7Z0JBQ2Q7Z0JBQ0EsT0FBT0csUUFBUTtjQUNoQixDQUFDLENBQUM7Y0FDRixJQUFJTixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JCLElBQU1TLFFBQVEsR0FBR0MsZUFBZSxDQUFDQyxjQUFjLEVBQUU7Z0JBQ2pELElBQU1DLE9BQU8sR0FDWkgsUUFBUSxDQUFDSSxNQUFNLEdBQUcsQ0FBQyxHQUFHSixRQUFRLENBQUNSLElBQUksQ0FBQyxVQUFDYSxNQUFNO2tCQUFBLE9BQUtBLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssSUFBSTtnQkFBQSxFQUFDLEdBQUcsSUFBSTtnQkFDakcsSUFBSUgsT0FBTyxFQUFFO2tCQUNaO2tCQUNBO2tCQUNBQSxPQUFPLENBQUNJLGVBQWUsQ0FBQyxZQUFZLEVBQUUsWUFBWTtvQkFDakRyQyxNQUFNLENBQUNzQyxRQUFRLENBQUNqQixTQUFTLEVBQUUsSUFBSSxDQUFDO2tCQUNqQyxDQUFDLENBQUM7Z0JBQ0gsQ0FBQyxNQUFNO2tCQUNOckIsTUFBTSxDQUFDc0MsUUFBUSxDQUFDakIsU0FBUyxFQUFFLElBQUksQ0FBQztnQkFDakM7Z0JBQ0EsTUFBSSxDQUFDZixTQUFTLENBQUNpQywwQkFBMEIsRUFBRTtjQUM1QztZQUNELENBQUMsQ0FBQyxDQUNEQyxLQUFLLENBQUMsVUFBVUMsR0FBUSxFQUFFO2NBQzFCQyxHQUFHLENBQUNDLEtBQUssc0VBQStERixHQUFHLEVBQUc7WUFDL0UsQ0FBQyxDQUFDO1VBQ0o7VUFDQTtVQUNBLElBQUksQ0FBQ0csYUFBYSxDQUFDQyxzQkFBc0IsRUFBRTtRQUM1QyxDQUFDO1FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO1FBQ0V6RCxZQUFZLFlBQUNaLEtBQVUsRUFBRUUsV0FBbUIsRUFBRUMsV0FBZ0IsRUFBRTtVQUMvRCxJQUFNSixXQUFXLEdBQUdDLEtBQUssQ0FBQ2hCLGFBQWEsRUFBRTtVQUN6QyxPQUFPZSxXQUFXLENBQUN1RSxRQUFRLENBQ3pCQyxZQUFZLENBQUNyRSxXQUFXLEVBQUVDLFdBQVcsQ0FBQyxDQUN0QzVDLElBQUksQ0FBQ3dDLFdBQVcsQ0FBQ3lFLG1CQUFtQixDQUFDL0csSUFBSSxDQUFDc0MsV0FBVyxFQUFFYixTQUFTLENBQUMsQ0FBQyxDQUNsRThFLEtBQUssQ0FBQ2pFLFdBQVcsQ0FBQ3lFLG1CQUFtQixDQUFDL0csSUFBSSxDQUFDc0MsV0FBVyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUNEMEUsdUJBQXVCLFlBQUMxRSxXQUFnQixFQUFFdUIsT0FBWSxFQUFFb0QsaUJBQXNCLEVBQUVDLGNBQW1CLEVBQUVDLGVBQW9CLEVBQUU7VUFDMUhGLGlCQUFpQixHQUFHLE9BQU9BLGlCQUFpQixLQUFLLFFBQVEsR0FBR0csSUFBSSxDQUFDQyxLQUFLLENBQUNKLGlCQUFpQixDQUFDLEdBQUdBLGlCQUFpQjtVQUM3RyxJQUFNSyxXQUFXLEdBQUdMLGlCQUFpQixDQUFDQyxjQUFjLENBQUM7WUFDcERLLHNCQUFzQixHQUFHQyxXQUFXLENBQUNDLHdCQUF3QixDQUFDSCxXQUFXLENBQUM7WUFDMUVJLCtCQUErQixHQUFHN0QsT0FBTyxDQUFDOEQsaUJBQWlCLEVBQUU7WUFDN0RDLFNBQVMsR0FBR0YsK0JBQStCLENBQ3pDbkUsUUFBUSxFQUFFLENBQ1ZzRSxZQUFZLEVBQUUsQ0FDZEMsV0FBVyxDQUFDSiwrQkFBK0IsQ0FBQ0ssT0FBTyxFQUFFLENBQUM7VUFDekQsSUFBSUMsZUFBZSxHQUFHMUYsV0FBVyxDQUFDMkYsb0JBQW9CLENBQUNQLCtCQUErQixFQUFFUCxlQUFlLENBQUM7VUFDeEcsSUFBSWUsOEJBQThCO1VBRWxDRixlQUFlLEdBQUdBLGVBQWUsQ0FBQ0csR0FBRyxDQUFDLFVBQVVDLGVBQW9CLEVBQUU7WUFDckUsT0FBTztjQUNOakMsSUFBSSxFQUFFaUMsZUFBZTtjQUNyQkMsUUFBUSxFQUFFVCxTQUFTLElBQUlULGVBQWUsY0FBT0EsZUFBZSxJQUFLLEVBQUU7WUFDcEUsQ0FBQztVQUNGLENBQUMsQ0FBQztVQUNGLElBQUlHLFdBQVcsSUFBSUEsV0FBVyxDQUFDZ0IsVUFBVSxFQUFFO1lBQzFDLElBQU1DLE9BQU8sR0FBR2pCLFdBQVcsQ0FBQ2dCLFVBQVUsSUFBSWhHLFdBQVcsQ0FBQ2tHLHNCQUFzQixDQUFDQyxpQkFBaUIsQ0FBQ25CLFdBQVcsQ0FBQ2dCLFVBQVUsQ0FBQztZQUN0SCxJQUFJSSxNQUFNLENBQUN2RCxJQUFJLENBQUNvRCxPQUFPLENBQUMsQ0FBQ3RDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Y0FDcENpQyw4QkFBOEIsR0FBR0ssT0FBTztZQUN6QztVQUNEO1VBQ0EsSUFBSWpCLFdBQVcsSUFBSUEsV0FBVyxDQUFDcUIsY0FBYyxJQUFJckIsV0FBVyxDQUFDc0IsTUFBTSxFQUFFO1lBQ3BFdEcsV0FBVyxDQUFDa0csc0JBQXNCLENBQUNLLFFBQVEsQ0FBQ3ZCLFdBQVcsQ0FBQ3FCLGNBQWMsRUFBRXJCLFdBQVcsQ0FBQ3NCLE1BQU0sRUFBRTtjQUMzRkUsa0JBQWtCLEVBQUVkLGVBQWU7Y0FDbkNlLHFCQUFxQixFQUFFeEIsc0JBQXNCO2NBQzdDVyw4QkFBOEIsRUFBRUE7WUFDakMsQ0FBQyxDQUFDO1VBQ0g7UUFDRCxDQUFDO1FBQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtRQUNFYyw4QkFBOEIsWUFBQzFHLFdBQWlDLEVBQUUyRyxlQUF1QixFQUFFekcsUUFBYSxFQUFFMEcsV0FBbUIsRUFBRTtVQUM5SCxPQUFPNUcsV0FBVyxDQUFDa0csc0JBQXNCLENBQUNRLDhCQUE4QixDQUFDMUcsV0FBVyxFQUFFMkcsZUFBZSxFQUFFekcsUUFBUSxFQUFFMEcsV0FBVyxDQUFDO1FBQzlILENBQUM7UUFFREMsZ0JBQWdCLFlBQTZCdkYsTUFBVyxFQUFFO1VBQ3pEO1VBQ0EsSUFBSSxDQUFDd0YsZUFBZSxFQUFFLENBQUNDLGNBQWMsRUFBRTtVQUN2QyxJQUFJLENBQUNDLGlCQUFpQixHQUFHLElBQUk7VUFFN0IsSUFBTUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDakksT0FBTyxFQUFFLENBQUNxRyxpQkFBaUIsQ0FBQyxVQUFVLENBQXlCO1VBQ2xHLElBQU01RSxXQUFXLEdBQUcsSUFBSSxDQUFDQywyQkFBMkIsRUFBRTtVQUN0RCxJQUNDRCxXQUFXLENBQUNRLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQ0MsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUNwRCxJQUFJLENBQUNsQyxPQUFPLEVBQUUsQ0FBQ3VCLFdBQVcsRUFBRSxDQUFTMkcsYUFBYSxLQUFLLE1BQU0sSUFDOURELHFCQUFxQixDQUFDL0YsV0FBVyxDQUFDLDRCQUE0QixDQUFDLEtBQUssS0FBSyxFQUN4RTtZQUNELElBQU1pRyxXQUFXLEdBQUc3RixNQUFNLENBQUM4RixZQUFZLENBQUMsWUFBWSxDQUFDO1lBQ3JELElBQUksQ0FBQ0Msc0JBQXNCLENBQUMsQ0FBQ0YsV0FBVyxDQUFDLENBQUM7VUFDM0M7UUFDRCxDQUFDO1FBQ0RHLGlCQUFpQixFQUFFLFlBQXNDO1VBQ3hELElBQUksQ0FBQ1IsZUFBZSxFQUFFLENBQUNDLGNBQWMsRUFBRTtRQUN4QyxDQUFDO1FBQ0RRLGNBQWMsRUFBRSxZQUFzQztVQUFBO1VBQ3JEO1VBQ0FDLFVBQVUsQ0FBQyxZQUFNO1lBQ2hCLE1BQUksQ0FBQ1YsZUFBZSxFQUFFLENBQUNDLGNBQWMsRUFBRTtVQUN4QyxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ1IsQ0FBQztRQUNEVSxvQkFBb0IsRUFBRSxVQUFVekgsV0FBaUMsRUFBRTBILGFBQWtCLEVBQUU7VUFDdEYsSUFBTUMsYUFBYSxHQUFHLE9BQU9ELGFBQWEsS0FBSyxRQUFRLEdBQUc1QyxJQUFJLENBQUNDLEtBQUssQ0FBQzJDLGFBQWEsQ0FBQyxHQUFHQSxhQUFhO1VBQ25HLElBQU1qSCxXQUFXLEdBQUdULFdBQVcsQ0FBQ2hCLE9BQU8sRUFBRSxDQUFDNEksSUFBSSxDQUFDLGdCQUFnQixDQUFxQjtVQUNwRixJQUFJQyxRQUFRO1VBQ1osSUFBSVYsV0FBVztVQUNmLElBQUlRLGFBQWEsQ0FBQ0csU0FBUyxFQUFFO1lBQzVCRCxRQUFRLEdBQUc3SCxXQUFXLENBQUNoQixPQUFPLEVBQUUsQ0FBQzRJLElBQUksQ0FBQ0QsYUFBYSxDQUFDRyxTQUFTLENBQXNCO1lBQ25GWCxXQUFXLEdBQ1ZRLGFBQWEsQ0FBQ0ksWUFBWSxHQUN2Qi9ILFdBQVcsQ0FBQ2hCLE9BQU8sRUFBRSxDQUFDNEksSUFBSSxDQUFDRCxhQUFhLENBQUNJLFlBQVksQ0FBQyxHQUN0REYsUUFBUSxJQUFJQSxRQUFRLENBQUNHLGNBQWMsRUFBRSxJQUFJSCxRQUFRLENBQUNHLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FDL0M7VUFDMUIsQ0FBQyxNQUFNLElBQUlMLGFBQWEsQ0FBQ0ksWUFBWSxFQUFFO1lBQ3RDWixXQUFXLEdBQUduSCxXQUFXLENBQUNoQixPQUFPLEVBQUUsQ0FBQzRJLElBQUksQ0FBQ0QsYUFBYSxDQUFDSSxZQUFZLENBQXlCO1lBQzVGRixRQUFRLEdBQUdWLFdBQVcsSUFBS0EsV0FBVyxDQUFDYyxTQUFTLEVBQXdCO1VBQ3pFO1VBQ0EsSUFBSSxDQUFDSixRQUFRLElBQUksQ0FBQ1YsV0FBVyxJQUFJLENBQUNVLFFBQVEsQ0FBQ0ssVUFBVSxFQUFFLElBQUksQ0FBQ2YsV0FBVyxDQUFDZSxVQUFVLEVBQUUsRUFBRTtZQUNuRmxJLFdBQVcsQ0FBQ2hCLE9BQU8sRUFBRSxDQUFDaUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFtQmtILGlCQUFpQixFQUFFLENBQ25GM0ssSUFBSSxDQUFDLFVBQVU0SyxlQUFlLEVBQUU7Y0FDaEMsSUFBTUMsTUFBTSxHQUFHbkQsV0FBVyxDQUFDb0QsaUJBQWlCLENBQzNDLHFDQUFxQyxFQUNyQ0YsZUFBZSxFQUNmLElBQUksRUFDSHBJLFdBQVcsQ0FBQ2hCLE9BQU8sRUFBRSxDQUFDdUIsV0FBVyxFQUFFLENBQVNnSSxTQUFTLENBQ3REO2NBQ0RwRSxHQUFHLENBQUNDLEtBQUssQ0FBQ2lFLE1BQU0sQ0FBQztjQUNqQkcsVUFBVSxDQUFDcEUsS0FBSyxDQUFDaUUsTUFBTSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUNEcEUsS0FBSyxDQUFDLFVBQVVHLEtBQUssRUFBRTtjQUN2QkQsR0FBRyxDQUFDQyxLQUFLLENBQUNBLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUM7VUFDSixDQUFDLE1BQU07WUFDTjNELFdBQVcsQ0FBQ2dJLGVBQWUsQ0FBQ3RCLFdBQVcsQ0FBQ3VCLEtBQUssRUFBRSxDQUFDO1lBQ2hEO1lBQ0FqSSxXQUFXLENBQUNrSSxZQUFZLENBQUM7Y0FDeEJDLE9BQU8sRUFBRWYsUUFBUTtjQUNqQmdCLFVBQVUsRUFBRTFCO1lBQ2IsQ0FBQyxDQUFDO1VBQ0g7UUFDRCxDQUFDO1FBQ0QyQix1QkFBdUIsRUFBRSxVQUFVeEgsTUFBVyxFQUFFO1VBQy9DeUgsWUFBWSxDQUFDQyxhQUFhLENBQUMxSCxNQUFNLENBQUM7UUFDbkMsQ0FBQztRQUNEMkgsYUFBYSxjQUE2QjtVQUN6QyxJQUFJLENBQUNuQyxlQUFlLEVBQUUsQ0FBQ0MsY0FBYyxFQUFFO1FBQ3hDO01BQ0QsQ0FBQztNQUFBO0lBQUE7SUFBQTtJQUFBLE9BNytDREQsZUFBZSxHQUZmLHlCQUVnQnJFLEdBQVksRUFBZ0I7TUFDM0MsSUFBSUEsR0FBRyxFQUFFO1FBQ1I7UUFDQSxJQUFJLENBQUN5RywyQkFBMkIsR0FBRyxJQUFJLENBQUNBLDJCQUEyQixJQUFJLENBQUMsQ0FBQztRQUV6RSxJQUFJLENBQUMsSUFBSSxDQUFDQSwyQkFBMkIsQ0FBQ3pHLEdBQUcsQ0FBQyxFQUFFO1VBQzNDLElBQUksQ0FBQ3lHLDJCQUEyQixDQUFDekcsR0FBRyxDQUFDLEdBQUcsSUFBSTBHLFlBQVksQ0FBQyxJQUFJLEVBQUUxRyxHQUFHLENBQUM7UUFDcEU7UUFDQSxPQUFPLElBQUksQ0FBQ3lHLDJCQUEyQixDQUFDekcsR0FBRyxDQUFDO01BQzdDLENBQUMsTUFBTTtRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMyRyxZQUFZLEVBQUU7VUFDdkIsSUFBSSxDQUFDQSxZQUFZLEdBQUcsSUFBSUQsWUFBWSxDQUFDLElBQUksQ0FBQztRQUMzQztRQUNBLE9BQU8sSUFBSSxDQUFDQyxZQUFZO01BQ3pCO0lBQ0QsQ0FBQztJQUFBLE9BRURDLE1BQU0sR0FBTixrQkFBUztNQUNSLDBCQUFNQSxNQUFNO01BQ1osSUFBTTVJLFdBQVcsR0FBRyxJQUFJLENBQUNDLDJCQUEyQixFQUFFOztNQUV0RDtNQUNBLElBQU11RyxxQkFBcUIsR0FBRyxJQUFJLENBQUNqSSxPQUFPLEVBQUUsQ0FBQ3FHLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7TUFDbEc0QixxQkFBcUIsYUFBckJBLHFCQUFxQix1QkFBckJBLHFCQUFxQixDQUFFcUMsV0FBVyxDQUFDLDJCQUEyQixFQUFFO1FBQUUsTUFBTSxFQUFFO01BQUssQ0FBQyxDQUFDO01BQ2pGckMscUJBQXFCLGFBQXJCQSxxQkFBcUIsdUJBQXJCQSxxQkFBcUIsQ0FBRXFDLFdBQVcsQ0FBQyxhQUFhLEVBQUU7UUFDakRDLFVBQVUsRUFBRSxLQUFLO1FBQ2pCQyxLQUFLLEVBQUU7TUFDUixDQUFDLENBQUM7TUFDRnZDLHFCQUFxQixhQUFyQkEscUJBQXFCLHVCQUFyQkEscUJBQXFCLENBQUVxQyxXQUFXLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQ0csc0JBQXNCLEVBQUUsQ0FBQztNQUNoRnhDLHFCQUFxQixhQUFyQkEscUJBQXFCLHVCQUFyQkEscUJBQXFCLENBQUVxQyxXQUFXLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDO01BQ3ZFLElBQUksQ0FBRSxJQUFJLENBQUN0SyxPQUFPLEVBQUUsQ0FBQ3VCLFdBQVcsRUFBRSxDQUFTbUosaUJBQWlCLElBQUtqSixXQUFXLENBQVNrSixvQkFBb0IsRUFBRSxFQUFFO1FBQzVHO1FBQ0FsSixXQUFXLENBQUNtSixXQUFXLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDQyxnQ0FBZ0MsQ0FBQ25NLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUN2RztNQUNBLElBQUksQ0FBQzJHLGFBQWEsR0FBRyxJQUFJLENBQUNyRixPQUFPLEVBQUUsQ0FBQzRJLElBQUksQ0FBQyw4QkFBOEIsQ0FBQztNQUN4RSxJQUFJLENBQUN2RCxhQUFhLENBQUN5RixZQUFZLENBQUNDLFlBQVksQ0FBQyxJQUFJLENBQUNDLGdCQUFnQixFQUFFLElBQUksQ0FBQztJQUMxRSxDQUFDO0lBQUEsT0FFREMsTUFBTSxHQUFOLGtCQUFTO01BQ1IsSUFBSSxJQUFJLENBQUNmLDJCQUEyQixFQUFFO1FBQ3JDLGdDQUFrQjlDLE1BQU0sQ0FBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUNxRywyQkFBMkIsQ0FBQyxrQ0FBRTtVQUE1RCxJQUFNekcsR0FBRztVQUNiLElBQUksSUFBSSxDQUFDeUcsMkJBQTJCLENBQUN6RyxHQUFHLENBQUMsRUFBRTtZQUMxQyxJQUFJLENBQUN5RywyQkFBMkIsQ0FBQ3pHLEdBQUcsQ0FBQyxDQUFDeUgsT0FBTyxFQUFFO1VBQ2hEO1FBQ0Q7UUFDQSxPQUFPLElBQUksQ0FBQ2hCLDJCQUEyQjtNQUN4QztNQUNBLElBQUksSUFBSSxDQUFDRSxZQUFZLEVBQUU7UUFDdEIsSUFBSSxDQUFDQSxZQUFZLENBQUNjLE9BQU8sRUFBRTtNQUM1QjtNQUNBLE9BQU8sSUFBSSxDQUFDZCxZQUFZO01BRXhCLElBQU1lLGVBQWUsR0FBRyxJQUFJLENBQUM5RixhQUFhLEdBQUcsSUFBSSxDQUFDQSxhQUFhLENBQUM4RixlQUFlLEdBQUcsSUFBSTtNQUN0RixJQUFJQSxlQUFlLElBQUlBLGVBQWUsQ0FBQ0MsTUFBTSxFQUFFLEVBQUU7UUFDaERELGVBQWUsQ0FBQ0UsS0FBSyxFQUFFO01BQ3hCO01BQ0E7TUFDQSxJQUFNbkssUUFBUSxHQUFHLElBQUksQ0FBQ2xCLE9BQU8sRUFBRSxDQUFDcUcsaUJBQWlCLEVBQWE7TUFDOUQsSUFBSW5GLFFBQVEsSUFBSUEsUUFBUSxDQUFDb0ssV0FBVyxFQUFFLEVBQUU7UUFDdkNwSyxRQUFRLENBQUNxSyxZQUFZLENBQUMsS0FBSyxDQUFDO01BQzdCO01BQ0EsSUFBSUMsV0FBVyxDQUFDLElBQUksQ0FBQ3hMLE9BQU8sRUFBRSxDQUFDLEVBQUU7UUFDaEN5TCxVQUFVLENBQUMsSUFBSSxDQUFDekwsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQzdCO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsT0FLQWdMLGdCQUFnQixHQUFoQiw0QkFBbUI7TUFDbEIsSUFBTVosWUFBWSxHQUFHLElBQUksQ0FBQ3RDLGVBQWUsRUFBRTtNQUMzQyxJQUFNNEQsSUFBSSxHQUFHLElBQUksQ0FBQzFMLE9BQU8sRUFBRTtNQUMzQixJQUFNMkwsUUFBUSxHQUFHLElBQUksQ0FBQ3RHLGFBQWEsQ0FBQzhGLGVBQWUsQ0FDakRTLFFBQVEsRUFBRSxDQUNWL0UsR0FBRyxDQUFDLFVBQUNnRixJQUFTO1FBQUEsT0FBS0EsSUFBSSxDQUFDeEYsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUNsQyxTQUFTLEVBQUU7TUFBQSxFQUFDLENBQ2pFMkgsTUFBTSxDQUFDLFVBQUNDLE9BQWdCLEVBQUs7UUFBQTtRQUM3QixPQUFPQSxPQUFPLENBQUNDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQywrQkFBS04sSUFBSSxDQUFDckYsaUJBQWlCLEVBQUUsMERBQXhCLHNCQUEwQkksT0FBTyxFQUFFO01BQ3ZFLENBQUMsQ0FBQztNQUVILElBQUkyRCxZQUFZLEVBQUU7UUFDakJBLFlBQVksQ0FBQzZCLFlBQVksQ0FBQ04sUUFBUSxDQUFDO01BQ3BDO0lBQ0QsQ0FBQztJQUFBLE9BRURPLGdCQUFnQixHQUFoQiwwQkFBaUJ6SixNQUFXLEVBQUU7TUFDN0IsT0FBT0EsTUFBTSxJQUFJQSxNQUFNLENBQUNJLGFBQWEsRUFBRTtJQUN4Qzs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BTVFzSix5QkFBeUIsR0FBakMsbUNBQWtDQyxXQUFtQyxFQUFFO01BQUE7TUFDdEUsSUFBTUMsb0JBQW9CLEdBQUcsVUFBQ0MsS0FBWSxFQUFFQyxxQkFBMkMsRUFBSztRQUFBO1FBQzNGLElBQU1DLE1BQU0sZ0NBQU9ELHFCQUFxQixDQUFDRSxTQUFTLEVBQUUsc0JBQUtGLHFCQUFxQixDQUFDRyxhQUFhLEVBQUUsRUFBQztRQUMvRixJQUNDRixNQUFNLENBQUM3SCxNQUFNLEtBQUssQ0FBQyw2QkFDbkIsTUFBSSxDQUFDZ0ksa0JBQWtCLENBQUNILE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBb0IsNEVBQXJELHNCQUNHdEosT0FBTyxFQUFFLG1EQURaLHVCQUVHRSxHQUFHLENBQUMsZ0NBQWdDLENBQUMsRUFDdkM7VUFDRDtVQUNBbUoscUJBQXFCLENBQUNLLGFBQWEsQ0FBQyx5Q0FBeUMsQ0FBQztVQUM5RUwscUJBQXFCLENBQUNNLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRVIsb0JBQW9CLEVBQUUsTUFBSSxDQUFDO1FBQ3BGO01BQ0QsQ0FBQztNQUNELEtBQUssSUFBSVMsZUFBZSxHQUFHVixXQUFXLENBQUN6SCxNQUFNLEdBQUcsQ0FBQyxFQUFFbUksZUFBZSxJQUFJLENBQUMsRUFBRUEsZUFBZSxFQUFFLEVBQUU7UUFDM0YsSUFBSVYsV0FBVyxDQUFDVSxlQUFlLENBQUMsQ0FBQzVELFVBQVUsRUFBRSxFQUFFO1VBQzlDLElBQU1xRCxxQkFBcUIsR0FBR0gsV0FBVyxDQUFDVSxlQUFlLENBQUM7VUFDMUQ7VUFDQVAscUJBQXFCLENBQUMzQixXQUFXLENBQUMsb0JBQW9CLEVBQUUyQixxQkFBcUIsRUFBRUYsb0JBQW9CLEVBQUUsSUFBSSxDQUFDO1VBQzFHO1FBQ0Q7TUFDRDtJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNUU0sa0JBQWtCLEdBQTFCLDRCQUEyQkksS0FBc0IsRUFBRTtNQUNsRCxJQUFNQyxPQUFPLEdBQUdELEtBQUssQ0FBQ0UsT0FBTztNQUM3QixJQUFJQyxRQUE4QjtNQUNsQyxJQUFJSCxLQUFLLENBQUMzSixHQUFHLENBQUMsc0RBQXNELENBQUMsRUFBRTtRQUN0RTtRQUNBO1FBQ0EsSUFBSTRKLE9BQU8sQ0FBQzVKLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSTRKLE9BQU8sQ0FBQ25JLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFO1VBQzdFcUksUUFBUSxHQUFHRixPQUFPLENBQUNuSSxJQUFJLENBQUMsbUJBQW1CLENBQUM7UUFDN0MsQ0FBQyxNQUFNLElBQUltSSxPQUFPLENBQUM1SixHQUFHLENBQUMsOEJBQThCLENBQUMsRUFBRTtVQUN2RDhKLFFBQVEsR0FBR0YsT0FBbUI7UUFDL0I7UUFDQSxJQUFJRSxRQUFRLEVBQUU7VUFDYixPQUFPQSxRQUFRLENBQUNELE9BQU87UUFDeEI7TUFDRDtNQUNBLE9BQU85TSxTQUFTO0lBQ2pCLENBQUM7SUFBQSxPQUVEZ04saUJBQWlCLEdBQWpCLDZCQUFvQjtNQUFBO01BQ25CQyxjQUFjLENBQUNDLFNBQVMsQ0FBQ0YsaUJBQWlCLENBQUNHLEtBQUssQ0FBQyxJQUFJLENBQUM7TUFDdEQ7TUFDQSxJQUFJLDZCQUFJLENBQUNyTSxLQUFLLENBQUNzTSxTQUFTLGtEQUFwQixzQkFBc0JDLHlCQUF5QixJQUFJQyxZQUFZLENBQUNsSCxZQUFZLEVBQUUsS0FBS3BHLFNBQVMsRUFBRTtRQUNqR3NOLFlBQVksQ0FBQ0MsWUFBWSxDQUFDLElBQUksQ0FBQ0MsZUFBZSxFQUFFLENBQUNwSCxZQUFZLEVBQUUsQ0FBQztNQUNqRTtJQUNELENBQUM7SUFBQSxPQUVEcUgsZ0JBQWdCLEdBQWhCLDRCQUFtQjtNQUFBO01BQ2hCLElBQUksQ0FBQzVOLE9BQU8sRUFBRSxDQUFDaUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFtQmtILGlCQUFpQixFQUFFLENBQzVFM0ssSUFBSSxDQUFDLFVBQUNxUCxRQUFhLEVBQUs7UUFDeEIsTUFBSSxDQUFDekUsZUFBZSxHQUFHeUUsUUFBUTtNQUNoQyxDQUFDLENBQUMsQ0FDRDVJLEtBQUssQ0FBQyxVQUFVNkksTUFBVyxFQUFFO1FBQzdCM0ksR0FBRyxDQUFDQyxLQUFLLENBQUMsNENBQTRDLEVBQUUwSSxNQUFNLENBQUM7TUFDaEUsQ0FBQyxDQUFDO01BQ0gsSUFBSTFCLFdBQW1DO01BQ3ZDLElBQUksSUFBSSxDQUFDMUssMkJBQTJCLEVBQUUsQ0FBQ3FNLGdCQUFnQixFQUFFLEVBQUU7UUFDMUQsSUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ3RNLDJCQUEyQixFQUFFLENBQUN1TSxXQUFXLEVBQUU7UUFBQywyQ0FDNUNELFFBQVE7VUFBQTtRQUFBO1VBQTlCLG9EQUFnQztZQUFBLElBQXJCcEUsT0FBTztZQUNqQndDLFdBQVcsR0FBR3hDLE9BQU8sQ0FBQ1osY0FBYyxFQUFFO1lBQ3RDLElBQUksQ0FBQ21ELHlCQUF5QixDQUFDQyxXQUFXLENBQUM7VUFDNUM7UUFBQztVQUFBO1FBQUE7VUFBQTtRQUFBO01BQ0YsQ0FBQyxNQUFNO1FBQ05BLFdBQVcsR0FBRyxJQUFJLENBQUM4QixrQkFBa0IsRUFBRTtRQUN2QyxJQUFJLENBQUMvQix5QkFBeUIsQ0FBQ0MsV0FBVyxDQUFDO01BQzVDO0lBQ0QsQ0FBQztJQUFBLE9BRUQrQixnQkFBZ0IsR0FBaEIsMEJBQWlCak4sUUFBYSxFQUFFRSxXQUFnQixFQUFFO01BQUE7TUFDakQ7TUFDQSxJQUFNZ04sT0FBTyxHQUFHLElBQUksQ0FBQzFMLFdBQVcsRUFBRTtRQUNqQ2pCLFdBQVcsR0FBRyxJQUFJLENBQUNDLDJCQUEyQixFQUFFO1FBQ2hEdUcscUJBQXFCLEdBQUcsSUFBSSxDQUFDakksT0FBTyxFQUFFLENBQUNxRyxpQkFBaUIsQ0FBQyxVQUFVLENBQXlCO1FBQzVGZ0ksY0FBYyxHQUFHLElBQUksQ0FBQ3JPLE9BQU8sRUFBRSxDQUFDaUMsUUFBUSxDQUFDLFVBQVUsQ0FBYztRQUNqRXFNLFlBQVksR0FBR3JHLHFCQUFxQixDQUFDL0YsV0FBVyxDQUFDLGFBQWEsQ0FBQztRQUMvRFosVUFBVSxHQUFJLElBQUksQ0FBQ3RCLE9BQU8sRUFBRSxDQUFDdUIsV0FBVyxFQUFFLENBQVNDLFNBQVM7TUFDN0QsSUFBSStNLGdCQUFnQjtNQUNwQkQsWUFBWSxDQUFDRSxJQUFJLENBQUMsT0FBTyxDQUFDO01BQzFCLElBQUlwTixXQUFXLENBQUNxTixnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7UUFDMUMsSUFBSSxDQUFDQyxpQkFBaUIsRUFBRTtNQUN6QjtNQUNBLElBQU1DLFNBQVMsR0FBR2xOLFdBQVcsQ0FBQzRFLGlCQUFpQixFQUFhO01BQzVELElBQ0NzSSxTQUFTLElBQ1RBLFNBQVMsQ0FBQ0MsaUJBQWlCLEVBQUUsSUFDN0IsQ0FBQ04sWUFBWSxDQUFDM0wsSUFBSSxDQUFFZ00sU0FBUyxDQUFDMU0sUUFBUSxFQUFFLENBQWdCMk0saUJBQWlCLENBQUNsUSxJQUFJLENBQUNpUSxTQUFTLENBQUMxTSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQ3BHO1FBQ0Q7QUFDSDtBQUNBOztRQUVHME0sU0FBUyxDQUFDRSxVQUFVLEVBQUUsQ0FBQ0MsWUFBWSxFQUFFO01BQ3RDOztNQUVBO01BQ0E7TUFDQSxLQUFLLElBQUk3SyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdtSyxPQUFPLENBQUN6SixNQUFNLEVBQUVWLENBQUMsRUFBRSxFQUFFO1FBQ3hDc0ssZ0JBQWdCLEdBQUdILE9BQU8sQ0FBQ25LLENBQUMsQ0FBQyxDQUFDOEssY0FBYyxFQUFFO1FBQzlDLElBQUlSLGdCQUFnQixFQUFFO1VBQ3JCQSxnQkFBZ0IsQ0FBQ1MsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1FBQ3pDO01BQ0Q7O01BRUE7TUFDQSxJQUFNQyx3QkFBd0IsR0FBRyxZQUFZO1FBQzVDLElBQUksQ0FBRXhOLFdBQVcsQ0FBU3lOLGdCQUFnQixFQUFFLElBQUksQ0FBQzlOLFdBQVcsQ0FBQytOLGdCQUFnQixFQUFFO1VBQzlFMU4sV0FBVyxDQUFDMk4sa0JBQWtCLENBQUMsSUFBSSxDQUFRO1FBQzVDO01BQ0QsQ0FBQztNQUNEM04sV0FBVyxDQUFDcUQsZUFBZSxDQUFDLG9CQUFvQixFQUFFbUssd0JBQXdCLENBQUM7O01BRTNFO01BQ0E7TUFDQSxJQUFNSSxpQkFBaUIsR0FBRztRQUN6QnpCLGdCQUFnQixFQUFFcUI7TUFDbkIsQ0FBQztNQUNEeE4sV0FBVyxDQUFDNk4sZ0JBQWdCLENBQUNELGlCQUFpQixFQUFFLElBQUksQ0FBQztNQUNyRCxJQUFJLENBQUNFLFNBQVMsQ0FBQ3pLLGVBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWTtRQUN2RHJELFdBQVcsQ0FBQytOLG1CQUFtQixDQUFDSCxpQkFBaUIsQ0FBQztNQUNuRCxDQUFDLENBQUM7O01BRUY7TUFDQSxJQUFJL04sVUFBVSxHQUFHLENBQUMsRUFBRTtRQUNuQixJQUFJbU8sUUFBUSxHQUFHck8sV0FBVyxJQUFJQSxXQUFXLENBQUNzTyxXQUFXO1FBQ3JELElBQU1DLHdCQUF3QixHQUFHdEIsY0FBYyxDQUFDbk0sV0FBVyxDQUFDLDBCQUEwQixDQUFDO1FBQ3ZGLElBQUl5Tix3QkFBd0IsRUFBRTtVQUM3QixJQUFNQyxhQUFhLEdBQUdELHdCQUF3QixDQUFDZCxVQUFVLEVBQUU7VUFDM0QsSUFBSSxDQUFDZ0IsU0FBUyxDQUFDQyxVQUFVLENBQUNGLGFBQWEsRUFBRUQsd0JBQXdCLENBQUM7VUFDbEV0QixjQUFjLENBQUMvRCxXQUFXLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDO1FBQzdELENBQUMsTUFBTSxJQUFJbUYsUUFBUSxFQUFFO1VBQ3BCLElBQUlBLFFBQVEsQ0FBQ3JNLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxFQUFFO1lBQzNELElBQUksQ0FBQ3lNLFNBQVMsQ0FBQ0MsVUFBVSxDQUFDTCxRQUFRLEVBQUV2TyxRQUFRLENBQUM7VUFDOUMsQ0FBQyxNQUFNO1lBQ047WUFDQTtZQUNBLElBQU02TyxZQUFZLEdBQUdOLFFBQVEsQ0FBQ2hKLE9BQU8sRUFBRTtZQUN2QyxJQUFJLGFBQWEsQ0FBQ3VKLElBQUksQ0FBQ0QsWUFBWSxDQUFDLEVBQUU7Y0FDckM7Y0FDQSxJQUFNRSxnQkFBZ0IsR0FBR0YsWUFBWSxDQUFDRyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQztjQUNoRVQsUUFBUSxHQUFHLElBQUtVLGdCQUFnQixDQUFTVixRQUFRLENBQUNXLE1BQU0sRUFBRUgsZ0JBQWdCLENBQUM7Y0FDM0UsSUFBTUksb0JBQW9CLEdBQUcsWUFBTTtnQkFDbEMsSUFBSVosUUFBUSxDQUFDcE0sV0FBVyxFQUFFLENBQUNzQixNQUFNLEdBQUcsQ0FBQyxFQUFFO2tCQUN0QyxNQUFJLENBQUNrTCxTQUFTLENBQUNDLFVBQVUsQ0FBQ0wsUUFBUSxFQUFFdk8sUUFBUSxDQUFDO2tCQUM3Q3VPLFFBQVEsQ0FBQzVDLFdBQVcsQ0FBQyxRQUFRLEVBQUV3RCxvQkFBb0IsQ0FBQztnQkFDckQ7Y0FDRCxDQUFDO2NBRURaLFFBQVEsQ0FBQ3BNLFdBQVcsQ0FBQyxDQUFDLENBQUM7Y0FDdkJvTSxRQUFRLENBQUM3RSxXQUFXLENBQUMsUUFBUSxFQUFFeUYsb0JBQW9CLENBQUM7WUFDckQsQ0FBQyxNQUFNO2NBQ047Y0FDQSxJQUFJLENBQUNSLFNBQVMsQ0FBQ0MsVUFBVSxDQUFDM1AsU0FBUyxDQUFDO1lBQ3JDO1VBQ0Q7UUFDRDtNQUNEO01BQ0EsSUFBSSxDQUFFLElBQUksQ0FBQ0gsT0FBTyxFQUFFLENBQUN1QixXQUFXLEVBQUUsQ0FBU21KLGlCQUFpQixJQUFJakosV0FBVyxDQUFDa0osb0JBQW9CLEVBQUUsRUFBRTtRQUNuRyxJQUFNMkYsU0FBUyxHQUFHN08sV0FBVyxDQUFDd00sV0FBVyxFQUFFO1FBQzNDLElBQU1zQyxjQUFjLEdBQUc5TyxXQUFXLENBQUNzTSxnQkFBZ0IsRUFBRTtRQUNyRCxJQUFJeUMsS0FBSyxHQUFHLENBQUM7UUFDYixJQUFNQyxhQUFhLEdBQUdoUCxXQUFXLENBQUNRLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQ0MsV0FBVyxDQUFDLGFBQWEsQ0FBQztRQUMzRSxJQUFNd08sZUFBZSxHQUFJLElBQUksQ0FBQzFRLE9BQU8sRUFBRSxDQUFDdUIsV0FBVyxFQUFFLENBQVNvUCxxQkFBcUI7UUFDbkYsS0FBSyxJQUFJQyxRQUFRLEdBQUcsQ0FBQyxFQUFFQSxRQUFRLEdBQUdOLFNBQVMsQ0FBQzNMLE1BQU0sRUFBRWlNLFFBQVEsRUFBRSxFQUFFO1VBQy9ELElBQU0vSCxRQUFRLEdBQUd5SCxTQUFTLENBQUNNLFFBQVEsQ0FBQztVQUNwQyxJQUFNQyxZQUFZLEdBQUdoSSxRQUFRLENBQUNHLGNBQWMsRUFBRTtVQUM5QyxLQUFLLElBQUk4SCxXQUFXLEdBQUcsQ0FBQyxFQUFFQSxXQUFXLEdBQUdELFlBQVksQ0FBQ2xNLE1BQU0sRUFBRW1NLFdBQVcsRUFBRSxFQUFFTixLQUFLLEVBQUUsRUFBRTtZQUNwRjtZQUNBLElBQUlBLEtBQUssR0FBRyxDQUFDLElBQUtELGNBQWMsS0FBS0ssUUFBUSxHQUFHLENBQUMsSUFBS0EsUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDRixlQUFlLElBQUksQ0FBQ0QsYUFBYyxDQUFFLEVBQUU7Y0FDOUcsSUFBTXRJLFdBQVcsR0FBRzBJLFlBQVksQ0FBQ0MsV0FBVyxDQUFDO2NBQzdDLElBQUkzSSxXQUFXLENBQUN0RCxJQUFJLEVBQUUsQ0FBQ2tNLG1CQUFtQixLQUFLLE1BQU0sRUFBRTtnQkFDdEQ1SSxXQUFXLENBQUM2RyxpQkFBaUIsQ0FBQyxJQUFJLENBQVE7Y0FDM0M7WUFDRDtVQUNEO1FBQ0Q7TUFDRDtNQUVBLElBQUksSUFBSSxDQUFDZ0MsV0FBVyxDQUFDQyxvQkFBb0IsRUFBRSxJQUFJN1AsV0FBVyxDQUFDOFAsZUFBZSxFQUFFO1FBQzNFLElBQU1qUSxLQUFLLEdBQUcsSUFBSSxDQUFDakIsT0FBTyxFQUFFO1FBQzVCLElBQU1tUixhQUFhLEdBQUlsUSxLQUFLLENBQUNnSSxTQUFTLEVBQUUsQ0FBU21JLFVBQVUsQ0FBQ25JLFNBQVMsRUFBRTtRQUN2RSxJQUFJa0ksYUFBYSxFQUFFO1VBQ2xCQSxhQUFhLENBQUNELGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQztNQUNEO0lBQ0QsQ0FBQztJQUFBLE9BRURHLHlCQUF5QixHQUF6QixtQ0FBMEI1UCxXQUFnQixFQUFFO01BQzNDLElBQUk2UCxzQkFBc0I7TUFDMUIsSUFBTUMsUUFBUSxHQUFHOVAsV0FBVyxDQUFDK1AsY0FBYyxFQUFFLElBQUkvUCxXQUFXLENBQUMrUCxjQUFjLEVBQUUsQ0FBQ0MsVUFBVSxFQUFFO01BQzFGLElBQUlGLFFBQVEsSUFBSUEsUUFBUSxDQUFDNU0sTUFBTSxFQUFFO1FBQ2hDMk0sc0JBQXNCLEdBQUdDLFFBQVEsQ0FBQ3hOLElBQUksQ0FBQyxVQUFVMk4sT0FBWSxFQUFFO1VBQzlEO1VBQ0E7VUFDQTtVQUNBLElBQUlBLE9BQU8sQ0FBQ3RPLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFO1lBQ2hEO1lBQ0E7WUFDQSxPQUFPc08sT0FBTyxDQUFDeEksVUFBVSxFQUFFO1VBQzVCLENBQUMsTUFBTSxJQUFJLENBQUN3SSxPQUFPLENBQUN0TyxHQUFHLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDc08sT0FBTyxDQUFDdE8sR0FBRyxDQUFDLHFCQUFxQixDQUFDLEVBQUU7WUFDNUYsT0FBT3NPLE9BQU8sQ0FBQ3hJLFVBQVUsRUFBRSxJQUFJd0ksT0FBTyxDQUFDQyxVQUFVLEVBQUU7VUFDcEQ7UUFDRCxDQUFDLENBQUM7TUFDSDtNQUNBLE9BQU9MLHNCQUFzQjtJQUM5QixDQUFDO0lBQUEsT0FFRE0sMENBQTBDLEdBQTFDLG9EQUEyQ2YsWUFBaUIsRUFBRTtNQUM3RCxJQUFJQSxZQUFZLEVBQUU7UUFDakIsS0FBSyxJQUFJaEgsVUFBVSxHQUFHLENBQUMsRUFBRUEsVUFBVSxHQUFHZ0gsWUFBWSxDQUFDbE0sTUFBTSxFQUFFa0YsVUFBVSxFQUFFLEVBQUU7VUFDeEUsSUFBTWdJLE9BQU8sR0FBR2hCLFlBQVksQ0FBQ2hILFVBQVUsQ0FBQyxDQUFDNEMsU0FBUyxFQUFFO1VBRXBELElBQUlvRixPQUFPLEVBQUU7WUFDWixLQUFLLElBQUk5RSxLQUFLLEdBQUcsQ0FBQyxFQUFFQSxLQUFLLEdBQUc4RSxPQUFPLENBQUNsTixNQUFNLEVBQUVvSSxLQUFLLEVBQUUsRUFBRTtjQUNwRCxJQUFJK0UsZUFBZTtjQUVuQixJQUFJRCxPQUFPLENBQUM5RSxLQUFLLENBQUMsQ0FBQzNKLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFO2dCQUNsRDBPLGVBQWUsR0FBR0QsT0FBTyxDQUFDOUUsS0FBSyxDQUFDLENBQUNnRixpQkFBaUIsRUFBRTtjQUNyRCxDQUFDLE1BQU0sSUFDTkYsT0FBTyxDQUFDOUUsS0FBSyxDQUFDLENBQUNpRixVQUFVLElBQ3pCSCxPQUFPLENBQUM5RSxLQUFLLENBQUMsQ0FBQ2lGLFVBQVUsRUFBRSxJQUMzQkgsT0FBTyxDQUFDOUUsS0FBSyxDQUFDLENBQUNpRixVQUFVLEVBQUUsQ0FBQzVPLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxFQUN6RDtnQkFDRDBPLGVBQWUsR0FBR0QsT0FBTyxDQUFDOUUsS0FBSyxDQUFDLENBQUNpRixVQUFVLEVBQUUsQ0FBQ0QsaUJBQWlCLEVBQUU7Y0FDbEU7Y0FFQSxJQUFJRCxlQUFlLEVBQUU7Z0JBQ3BCLEtBQUssSUFBSUcsYUFBYSxHQUFHLENBQUMsRUFBRUEsYUFBYSxHQUFHSCxlQUFlLENBQUNuTixNQUFNLEVBQUVzTixhQUFhLEVBQUUsRUFBRTtrQkFDcEYsSUFBTUMsYUFBYSxHQUFHSixlQUFlLENBQUNHLGFBQWEsQ0FBQyxDQUFDRSxlQUFlLEVBQUU7a0JBQ3RFLElBQUlELGFBQWEsRUFBRTtvQkFDbEIsS0FBSyxJQUFJRSxXQUFXLEdBQUcsQ0FBQyxFQUFFQSxXQUFXLEdBQUdGLGFBQWEsQ0FBQ3ZOLE1BQU0sRUFBRXlOLFdBQVcsRUFBRSxFQUFFO3NCQUM1RSxJQUFNQyxPQUFPLEdBQUdILGFBQWEsQ0FBQ0UsV0FBVyxDQUFDLENBQUNFLFNBQVMsRUFBRTs7c0JBRXREO3NCQUNBO3NCQUNBLElBQUk7d0JBQ0gsSUFBSUQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDRSxXQUFXLElBQUlGLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQ0UsV0FBVyxFQUFFLElBQUksQ0FBQ0YsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDRyxRQUFRLEVBQUUsRUFBRTswQkFDakYsT0FBT0gsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDbEI7c0JBQ0QsQ0FBQyxDQUFDLE9BQU9qTixLQUFLLEVBQUU7d0JBQ2ZELEdBQUcsQ0FBQ3NOLEtBQUssMkRBQW9Eck4sS0FBSyxFQUFHO3NCQUN0RTtvQkFDRDtrQkFDRDtnQkFDRDtjQUNEO1lBQ0Q7VUFDRDtRQUNEO01BQ0Q7TUFDQSxPQUFPakYsU0FBUztJQUNqQixDQUFDO0lBQUEsT0FFRGtJLHNCQUFzQixHQUF0QixnQ0FBdUJ3SSxZQUFpQixFQUFFO01BQ3pDLElBQU1wUCxXQUFXLEdBQUcsSUFBSSxDQUFDQywyQkFBMkIsRUFBRTtNQUV0RCxJQUFNZ1IsZUFBZSxHQUFHLElBQUksQ0FBQ2QsMENBQTBDLENBQUNmLFlBQVksQ0FBQztNQUNyRixJQUFJOEIsYUFBa0I7TUFDdEIsSUFBSUQsZUFBZSxFQUFFO1FBQ3BCQyxhQUFhLEdBQUdELGVBQWUsQ0FBQ3pGLE9BQU8sQ0FBQzJGLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUM1RCxDQUFDLE1BQU07UUFDTkQsYUFBYSxHQUFJbFIsV0FBVyxDQUFTb1Isc0JBQXNCLEVBQUUsSUFBSSxJQUFJLENBQUN4Qix5QkFBeUIsQ0FBQzVQLFdBQVcsQ0FBQztNQUM3RztNQUVBLElBQUlrUixhQUFhLEVBQUU7UUFDbEJuSyxVQUFVLENBQUMsWUFBWTtVQUN0QjtVQUNBbUssYUFBYSxDQUFDRyxLQUFLLEVBQUU7UUFDdEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztNQUNOO0lBQ0QsQ0FBQztJQUFBLE9BRURqSSxnQ0FBZ0MsR0FBaEMsMENBQWlDdkksTUFBVyxFQUFFO01BQzdDLElBQU02RixXQUFXLEdBQUc3RixNQUFNLENBQUM4RixZQUFZLENBQUMsWUFBWSxDQUFDO01BQ3JERCxXQUFXLENBQUM2RyxpQkFBaUIsQ0FBQzdPLFNBQVMsQ0FBQztJQUN6QyxDQUFDO0lBQUEsT0FFRDRTLHdCQUF3QixHQUF4QixrQ0FBeUI3UixRQUFhLEVBQUU7TUFDdkMsSUFBSSxDQUFDOFIsY0FBYyxDQUFDQyx3QkFBd0IsRUFBRTtNQUM5QyxJQUFJLElBQUksQ0FBQ3RGLGVBQWUsRUFBRSxDQUFDdUYsY0FBYyxFQUFFLENBQUNDLHlCQUF5QixFQUFFLEVBQUU7UUFDeEU7UUFDQUMsT0FBTyxDQUFDQyxJQUFJLEVBQUU7TUFDZixDQUFDLE1BQU07UUFDTkMsS0FBSyxDQUFDQyx5Q0FBeUMsQ0FDOUMsWUFBWTtVQUNYSCxPQUFPLENBQUNDLElBQUksRUFBRTtRQUNmLENBQUMsRUFDREcsUUFBUSxDQUFDbkcsU0FBUyxFQUNsQm5NLFFBQVEsRUFDUixJQUFJLEVBQ0osS0FBSyxFQUNMb1MsS0FBSyxDQUFDRyxjQUFjLENBQUNDLGNBQWMsQ0FDbkM7TUFDRjtJQUNEOztJQUVBO0lBQUE7SUFBQSxPQUNBQyxlQUFlLEdBQWYseUJBQWdCQyxlQUFvQixFQUFFeFMsV0FBZ0IsRUFBRTtNQUFBO01BK0R2RDtNQUNBO01BQ0E7QUFDRjtBQUNBO0FBQ0E7TUFIRSxJQUlleVMscUJBQXFCLGFBQUNwUixNQUFXLEVBQUVxUixZQUFpQjtRQUFBLElBQUU7VUFDcEUsSUFBTXZGLGdCQUFnQixHQUFHOUwsTUFBTSxDQUFDc00sY0FBYyxFQUFFO1VBQ2hELElBQUlnRix3QkFBd0IsRUFBRUMsb0JBQW9CO1VBQUM7WUFBQSxJQUUvQ3pGLGdCQUFnQjtjQUFBLGdDQUNmO2dCQUFBLHVCQUNHMEYsYUFBYTtrQkFBQTtvQkFBQSxJQUNmMUYsZ0JBQWdCLENBQUN0TSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUNDLFdBQVcsQ0FBQyxhQUFhLENBQUM7c0JBQzdENlIsd0JBQXdCLEdBQUczRCxNQUFNLENBQUM4RCxRQUFRLENBQUNKLFlBQVksQ0FBQ3JOLE9BQU8sRUFBRSxFQUFFcU4sWUFBWSxDQUFDSyxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO3dCQUNyR0MsZUFBZSxFQUFFLGFBQWE7d0JBQzlCQyxTQUFTLEVBQUU7c0JBQ1osQ0FBQyxDQUFDO3NCQUNGO3NCQUNBTix3QkFBd0IsQ0FBQ08sZUFBZSxHQUFHLFlBQVk7d0JBQ3REO3NCQUFBLENBQ0E7c0JBQ0ROLG9CQUFvQixHQUFHRCx3QkFBd0IsQ0FBQ1EsTUFBTSxFQUFFO3NCQUN4RGhHLGdCQUFnQixDQUFDUyxpQkFBaUIsQ0FBQ2dGLG9CQUFvQixDQUFDOztzQkFFeEQ7c0JBQUEsZ0NBQ0k7d0JBQUEsdUJBQ0dBLG9CQUFvQixDQUFDUSxPQUFPLEVBQUU7c0JBQ3JDLENBQUMsY0FBVzt3QkFDWHJQLEdBQUcsQ0FBQ3NQLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQztzQkFDckQsQ0FBQztzQkFBQTtvQkFBQTtrQkFBQTtrQkFBQTtnQkFBQTtjQUVILENBQUMsWUFBUTNHLE1BQVcsRUFBRTtnQkFDckIzSSxHQUFHLENBQUNDLEtBQUssQ0FBQywwQ0FBMEMsRUFBRTBJLE1BQU0sQ0FBQztjQUM5RCxDQUFDO2NBQUE7WUFBQTtVQUFBO1VBQUE7UUFFSCxDQUFDO1VBQUE7UUFBQTtNQUFBLEdBRUQ7TUFDQTtBQUNGO0FBQ0E7TUF2R0UsSUFBTXJNLFdBQVcsR0FBRyxJQUFJLENBQUNDLDJCQUEyQixFQUFFO01BQ3RELElBQU0wTSxPQUFPLEdBQUcsSUFBSSxDQUFDMUwsV0FBVyxFQUFFO01BRWxDLElBQUksQ0FBQ2dTLFlBQVksQ0FBQ0MscUJBQXFCLEVBQUU7O01BRXpDO01BQ0E7TUFDQWYsZUFBZSxHQUFHblMsV0FBVyxDQUFDNEUsaUJBQWlCLEVBQUU7TUFFakQsSUFBSXVPLFdBQWtCLEdBQUcsRUFBRTtNQUMzQm5ULFdBQVcsQ0FBQ3dNLFdBQVcsRUFBRSxDQUFDNEcsT0FBTyxDQUFDLFVBQVVoTSxRQUFhLEVBQUU7UUFDMURBLFFBQVEsQ0FBQ0csY0FBYyxFQUFFLENBQUM2TCxPQUFPLENBQUMsVUFBVTFNLFdBQWdCLEVBQUU7VUFDN0R5TSxXQUFXLEdBQUcxTyxXQUFXLENBQUM0TyxhQUFhLENBQUMzTSxXQUFXLEVBQUV5TSxXQUFXLENBQUM7UUFDbEUsQ0FBQyxDQUFDO01BQ0gsQ0FBQyxDQUFDOztNQUVGO01BQ0E7TUFDQTtNQUNBO01BQ0E7O01BRUF4RyxPQUFPLENBQUN5RyxPQUFPLENBQUMsVUFBVXBTLE1BQVcsRUFBRTtRQUN0QyxJQUFNd0YscUJBQXFCLEdBQUd4RixNQUFNLENBQUM0RCxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7UUFDbEU0QixxQkFBcUIsQ0FBQ3FDLFdBQVcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqRXJDLHFCQUFxQixDQUFDcUMsV0FBVyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWxFc0ssV0FBVyxHQUFHMU8sV0FBVyxDQUFDNE8sYUFBYSxDQUFDclMsTUFBTSxFQUFFbVMsV0FBVyxDQUFDO1FBQzVEO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsSUFBTUcsZ0JBQWdCLEdBQUd0UyxNQUFNLENBQUNJLGFBQWEsRUFBRTtRQUMvQyxJQUFJa1MsZ0JBQWdCLEVBQUU7VUFDckIsSUFBSUMsV0FBVyxDQUFDQyx3QkFBd0IsQ0FBQ0YsZ0JBQWdCLENBQUM5UyxRQUFRLEVBQUUsQ0FBQ3NFLFlBQVksRUFBRSxDQUFDLEVBQUU7WUFDckY7WUFDQXdPLGdCQUFnQixDQUFDRyx1QkFBdUIsQ0FBQyxFQUFFLENBQUM7VUFDN0M7UUFDRDtRQUNBOztRQUVBO1FBQ0E7UUFDQSxJQUFNQyw0QkFBNEIsR0FBR3JQLElBQUksQ0FBQ0MsS0FBSyxDQUM3QzBILFlBQVksQ0FBQzJILGVBQWUsQ0FBQ0MsWUFBWSxDQUFDQyxhQUFhLENBQUM3UyxNQUFNLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUN6RjtVQUNEOFMsaUJBQWlCLEdBQUc5UyxNQUFNLENBQUMrUyxtQkFBbUIsRUFBRTtRQUVqREMsYUFBYSxDQUFDQyxtQkFBbUIsQ0FBQ3pOLHFCQUFxQixFQUFFa04sNEJBQTRCLEVBQUVJLGlCQUFpQixFQUFFLE9BQU8sQ0FBQztRQUNsSDtRQUNBOVMsTUFBTSxDQUFDa1QsY0FBYyxFQUFFO01BQ3hCLENBQUMsQ0FBQztNQUNGelAsV0FBVyxDQUFDMFAsK0JBQStCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztNQUMvRDtNQUNBLElBQU1DLGdCQUFnQixHQUFHcFUsV0FBVyxDQUFDK1AsY0FBYyxFQUFFO01BQ3JELElBQUlzRSxpQkFBd0IsR0FBRyxFQUFFO01BQ2pDQSxpQkFBaUIsR0FBRzVQLFdBQVcsQ0FBQzRPLGFBQWEsQ0FBQ2UsZ0JBQWdCLEVBQUVDLGlCQUFpQixDQUFDO01BQ2xGbEIsV0FBVyxHQUFHQSxXQUFXLENBQUNtQixNQUFNLENBQUNELGlCQUFpQixDQUFDO01BQ25ENVAsV0FBVyxDQUFDOFAsc0NBQXNDLENBQUNwQixXQUFXLEVBQUUsSUFBSSxDQUFDNVUsT0FBTyxFQUFFLENBQUM7TUFFL0UsSUFBSW9RLE1BQVcsRUFBRTZELGFBQWtCO01BNENuQyxJQUFNZ0Msd0JBQXdCLEdBQUcsVUFBQ3hULE1BQVcsRUFBSztRQUNqRCxJQUFNZ04sUUFBUSxHQUFHLE1BQUksQ0FBQ3ZELGdCQUFnQixDQUFDekosTUFBTSxDQUFDO1VBQzdDeVQsd0JBQXdCLEdBQUcsWUFBWTtZQUN0Q3JDLHFCQUFxQixDQUFDcFIsTUFBTSxFQUFFZ04sUUFBUSxDQUFDO1VBQ3hDLENBQUM7UUFFRixJQUFJLENBQUNBLFFBQVEsRUFBRTtVQUNkdEssR0FBRyxDQUFDQyxLQUFLLCtDQUF3QzNDLE1BQU0sQ0FBQ2lILEtBQUssRUFBRSxFQUFHO1VBQ2xFO1FBQ0Q7UUFFQSxJQUFJK0YsUUFBUSxDQUFDdk8sUUFBUSxFQUFFO1VBQ3RCZ1Ysd0JBQXdCLEVBQUU7UUFDM0IsQ0FBQyxNQUFNO1VBQ04sSUFBTUMsY0FBYyxHQUFHLFlBQVk7WUFDbEMsSUFBSTFHLFFBQVEsQ0FBQ3ZPLFFBQVEsRUFBRTtjQUN0QmdWLHdCQUF3QixFQUFFO2NBQzFCekcsUUFBUSxDQUFDMkcsWUFBWSxDQUFDRCxjQUFjLENBQUM7WUFDdEM7VUFDRCxDQUFDO1VBQ0QxRyxRQUFRLENBQUMxRSxZQUFZLENBQUNvTCxjQUFjLENBQUM7UUFDdEM7TUFDRCxDQUFDO01BRUQsSUFBSXZDLGVBQWUsRUFBRTtRQUNwQnhELE1BQU0sR0FBR3dELGVBQWUsQ0FBQzNSLFFBQVEsRUFBRTs7UUFFbkM7UUFDQWdTLGFBQWEsR0FBRyxJQUFJLENBQUNsUixTQUFTLENBQUNzVCxlQUFlLENBQUN6QyxlQUFlLENBQUM7UUFFL0QsSUFBSW9CLFdBQVcsQ0FBQ3NCLDZCQUE2QixDQUFDbEcsTUFBTSxDQUFDN0osWUFBWSxFQUFFLENBQUMsRUFBRTtVQUNyRTBOLGFBQWEsQ0FDWHpWLElBQUksQ0FBQyxZQUFNO1lBQ1gsSUFBSSxNQUFJLENBQUN3QixPQUFPLEVBQUUsQ0FBQ2lDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQ0MsV0FBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFO2NBQzdEcVUsT0FBTyxDQUFDLE1BQUksQ0FBQ3ZXLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLENBQUMsTUFBTSxJQUFJd0wsV0FBVyxDQUFDLE1BQUksQ0FBQ3hMLE9BQU8sRUFBRSxDQUFDLEVBQUU7Y0FDdkN5TCxVQUFVLENBQUMsTUFBSSxDQUFDekwsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdCO1VBQ0QsQ0FBQyxDQUFDLENBQ0RpRixLQUFLLENBQUMsVUFBVTZJLE1BQVcsRUFBRTtZQUM3QjNJLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLDRDQUE0QyxFQUFFMEksTUFBTSxDQUFDO1VBQ2hFLENBQUMsQ0FBQztRQUNKOztRQUVBO1FBQ0E7UUFDQSxJQUFJOEYsZUFBZSxDQUFDL0UsVUFBVSxFQUFFLENBQUMySCxNQUFNLEVBQUU7VUFDeEMsSUFBSSxDQUFDQyxrQkFBa0IsRUFBRTtRQUMxQixDQUFDLE1BQU07VUFDTixJQUFNQyxtQkFBbUIsR0FBRyxZQUFNO1lBQ2pDLE1BQUksQ0FBQ0Qsa0JBQWtCLEVBQUU7WUFDekI3QyxlQUFlLENBQUMvRSxVQUFVLEVBQUUsQ0FBQzhILGtCQUFrQixDQUFDRCxtQkFBbUIsQ0FBQztVQUNyRSxDQUFDO1VBQ0Q5QyxlQUFlLENBQUMvRSxVQUFVLEVBQUUsQ0FBQytILGtCQUFrQixDQUFDRixtQkFBbUIsQ0FBQztRQUNyRTs7UUFFQTtRQUNBLElBQU1qSCxRQUFRLEdBQUltRSxlQUFlLENBQUMvRSxVQUFVLElBQUkrRSxlQUFlLENBQUMvRSxVQUFVLEVBQUUsSUFBSytFLGVBQWU7O1FBRWhHO1FBQ0EsSUFBSSxJQUFJLENBQUNpRCxjQUFjLEtBQUtwSCxRQUFRLEVBQUU7VUFDckNBLFFBQVEsQ0FBQzdFLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDckYsUUFBUSxDQUFDdVIsZUFBZSxFQUFFLElBQUksQ0FBQztVQUN0RSxJQUFJLENBQUNELGNBQWMsR0FBR3BILFFBQVE7UUFDL0I7UUFFQXJCLE9BQU8sQ0FBQ3lHLE9BQU8sQ0FBQyxVQUFVcFMsTUFBVyxFQUFFO1VBQ3RDO1VBQ0FzVSxVQUFVLENBQUNDLFNBQVMsQ0FBQ3ZVLE1BQU0sQ0FBQyxDQUMxQmpFLElBQUksQ0FBQ3lYLHdCQUF3QixDQUFDLENBQzlCaFIsS0FBSyxDQUFDLFVBQVU2SSxNQUFXLEVBQUU7WUFDN0IzSSxHQUFHLENBQUNDLEtBQUssQ0FBQywrQ0FBK0MsRUFBRTBJLE1BQU0sQ0FBQztVQUNuRSxDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7UUFFRixJQUFJLENBQUUsSUFBSSxDQUFDOU4sT0FBTyxFQUFFLENBQUN1QixXQUFXLEVBQUUsQ0FBU21KLGlCQUFpQixFQUFFO1VBQzdEO1VBQ0NqSixXQUFXLENBQVN3VixnQ0FBZ0MsRUFBRTtRQUN4RDtNQUNEO0lBQ0QsQ0FBQztJQUFBLE9BSURDLFdBQVcsR0FGWCxxQkFFWTlWLFdBQWdCLEVBQUU7TUFBQTtNQUM3QixJQUFNK1YsUUFBUSxHQUFHLFlBQU07UUFDdEI7UUFDQSxJQUFNMVYsV0FBVyxHQUFHLE1BQUksQ0FBQ0MsMkJBQTJCLEVBQUU7UUFDdEQsSUFBTTBWLGVBQWUsR0FBRyxDQUFDM1YsV0FBVyxDQUFDUSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUNDLFdBQVcsQ0FBQyxhQUFhLENBQUM7UUFFOUUsSUFBSWtWLGVBQWUsRUFBRTtVQUNwQixJQUFNOUYsc0JBQXNCLEdBQUcsTUFBSSxDQUFDRCx5QkFBeUIsQ0FBQzVQLFdBQVcsQ0FBQztVQUMxRSxJQUFJNlAsc0JBQXNCLEVBQUU7WUFDM0JBLHNCQUFzQixDQUFDd0IsS0FBSyxFQUFFO1VBQy9CO1FBQ0QsQ0FBQyxNQUFNO1VBQ04sSUFBTXVFLGdCQUFxQixHQUFHQyxJQUFJLENBQUMxTyxJQUFJLENBQUNuSCxXQUFXLENBQUM4VixrQkFBa0IsRUFBRSxDQUFDO1VBQ3pFLElBQUlGLGdCQUFnQixFQUFFO1lBQ3JCLE1BQUksQ0FBQ2hQLHNCQUFzQixDQUFDZ1AsZ0JBQWdCLENBQUNyTyxjQUFjLEVBQUUsQ0FBQztVQUMvRDtRQUNEO01BQ0QsQ0FBQztNQUNEO01BQ0EsSUFBTS9ILEtBQUssR0FBRyxJQUFJLENBQUNqQixPQUFPLEVBQUU7TUFDNUIsSUFBTWlJLHFCQUFxQixHQUFHaEgsS0FBSyxDQUFDb0YsaUJBQWlCLENBQUMsVUFBVSxDQUF5QjtNQUN6RixJQUFNdU4sZUFBZSxHQUFHM1MsS0FBSyxDQUFDb0YsaUJBQWlCLEVBQUU7TUFDakQ7TUFDQSxJQUFJdU4sZUFBZSxFQUFFO1FBQ3BCLElBQU00RCxhQUFhLEdBQUd4QyxXQUFXLENBQUNDLHdCQUF3QixDQUFFckIsZUFBZSxDQUFDM1IsUUFBUSxFQUFFLENBQWdCc0UsWUFBWSxFQUFFLENBQUM7UUFDckgsSUFBSSxDQUFDaVIsYUFBYSxFQUFFO1VBQ25CLElBQU1DLGFBQWEsR0FBR3ZSLFdBQVcsQ0FBQ3lILGVBQWUsQ0FBQzFNLEtBQUssQ0FBQztVQUN4RHdXLGFBQWEsQ0FBQ0MsZ0JBQWdCLEVBQUUsQ0FBQ0MsaUJBQWlCLENBQUM7WUFBQSxPQUFNLE1BQUksQ0FBQzVFLHdCQUF3QixDQUFDYSxlQUFlLENBQUM7VUFBQSxFQUFDO1FBQ3pHO01BQ0Q7TUFDQSxJQUFJLENBQUNqRyxlQUFlLEVBQUUsQ0FDcEJpSyxrQkFBa0IsRUFBRSxDQUNwQkMsYUFBYSxFQUFFLENBQ2ZyWixJQUFJLENBQUMsWUFBTTtRQUNYLElBQUk0QyxXQUFXLENBQUMwVyxVQUFVLEVBQUU7VUFDM0JYLFFBQVEsRUFBRTtRQUNYO01BQ0QsQ0FBQyxDQUFDLENBQ0RsUyxLQUFLLENBQUMsVUFBVThTLEtBQUssRUFBRTtRQUN2QjVTLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLCtCQUErQixFQUFFMlMsS0FBSyxDQUFDO01BQ2xELENBQUMsQ0FBQztNQUVIOVAscUJBQXFCLENBQUNxQyxXQUFXLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDO01BQ3RFLElBQUksQ0FBQzBOLHlDQUF5QyxFQUFFO0lBQ2pEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0E5WCxpQkFBaUIsR0FBakIsNkJBQW9CO01BQ25CLElBQU0wVCxlQUFlLEdBQUcsSUFBSSxDQUFDNVQsT0FBTyxFQUFFLENBQUNxRyxpQkFBaUIsSUFBSyxJQUFJLENBQUNyRyxPQUFPLEVBQUUsQ0FBQ3FHLGlCQUFpQixFQUFjO01BQzNHLElBQUl0RyxpQkFBaUIsR0FBRyxLQUFLO01BQzdCLElBQUk2VCxlQUFlLEVBQUU7UUFDcEIsSUFBTTRELGFBQWEsR0FBR3hDLFdBQVcsQ0FBQ0Msd0JBQXdCLENBQUNyQixlQUFlLENBQUMzUixRQUFRLEVBQUUsQ0FBQ3NFLFlBQVksRUFBRSxDQUFtQjtRQUN2SCxJQUFJaVIsYUFBYSxFQUFFO1VBQ2xCelgsaUJBQWlCLEdBQUcsSUFBSSxDQUFDQyxPQUFPLEVBQUUsQ0FBQ2lDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQ0MsV0FBVyxDQUFDLGFBQWEsQ0FBQztRQUM3RTtNQUNEO01BQ0EsT0FBT25DLGlCQUFpQjtJQUN6QixDQUFDO0lBQUEsT0FFRDJCLDJCQUEyQixHQUEzQix1Q0FBOEI7TUFDN0IsT0FBTyxJQUFJLENBQUNrSCxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDbkMsQ0FBQztJQUFBLE9BRURxUCx3QkFBd0IsR0FBeEIsb0NBQTJCO01BQzFCLElBQU14VyxXQUFXLEdBQUcsSUFBSSxDQUFDQywyQkFBMkIsRUFBRTtNQUN0RCxJQUFNd1csbUJBQW1CLEdBQUd6VyxXQUFXLENBQUM2VCxhQUFhLEVBQUUsQ0FBQ3ZSLElBQUksQ0FBQyxVQUFVb1UsV0FBZ0IsRUFBRTtRQUN4RixPQUFPQSxXQUFXLENBQUNDLE1BQU0sRUFBRSxLQUFLLG9CQUFvQjtNQUNyRCxDQUFDLENBQUM7TUFDRixPQUFPO1FBQ05DLEtBQUssRUFBRTVXLFdBQVcsQ0FBQ29ELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUU7UUFDaER5VCxRQUFRLEVBQUVKLG1CQUFtQixJQUFJQSxtQkFBbUIsQ0FBQzFGLFFBQVEsRUFBRTtRQUMvRCtGLE1BQU0sRUFBRSxFQUFFO1FBQ1ZDLElBQUksRUFBRTtNQUNQLENBQUM7SUFDRixDQUFDO0lBQUEsT0FFREMsc0JBQXNCLEdBQXRCLGdDQUF1QmhWLEdBQVEsRUFBRTtNQUNoQyxJQUFNaVYsU0FBUyxhQUFNLElBQUksQ0FBQzFZLE9BQU8sRUFBRSxDQUFDMEosS0FBSyxFQUFFLGVBQUtqRyxHQUFHLENBQUU7UUFDcERrVixPQUFPLEdBQUksSUFBSSxDQUFDalgsMkJBQTJCLEVBQUUsQ0FBQzhQLGNBQWMsRUFBRSxDQUM1REMsVUFBVSxFQUFFLENBQ1oxTixJQUFJLENBQUMsVUFBVTZVLFFBQWEsRUFBRTtVQUM5QixPQUFPQSxRQUFRLENBQUNsUCxLQUFLLEVBQUUsS0FBS2dQLFNBQVM7UUFDdEMsQ0FBQyxDQUFDO01BQ0p4UyxXQUFXLENBQUMyUyxlQUFlLENBQUNGLE9BQU8sQ0FBQztJQUNyQyxDQUFDO0lBQUEsT0FFREcsc0JBQXNCLEdBQXRCLGdDQUF1QnJWLEdBQVEsRUFBRTtNQUNoQyxJQUFNaVYsU0FBUyxhQUFNLElBQUksQ0FBQzFZLE9BQU8sRUFBRSxDQUFDMEosS0FBSyxFQUFFLGVBQUtqRyxHQUFHLENBQUU7UUFDcERrVixPQUFPLEdBQUksSUFBSSxDQUFDalgsMkJBQTJCLEVBQUUsQ0FBQ3FYLFNBQVMsRUFBRSxDQUFTL0csVUFBVSxFQUFFLENBQUNqTyxJQUFJLENBQUMsVUFBVTZVLFFBQWEsRUFBRTtVQUM1RyxPQUFPQSxRQUFRLENBQUN6VixXQUFXLEVBQUUsQ0FBQzZWLE9BQU8sRUFBRSxLQUFLLGNBQWMsSUFBSUosUUFBUSxDQUFDbFAsS0FBSyxFQUFFLEtBQUtnUCxTQUFTO1FBQzdGLENBQUMsQ0FBQztNQUNIeFMsV0FBVyxDQUFDMlMsZUFBZSxDQUFDRixPQUFPLENBQUM7SUFDckMsQ0FBQztJQUFBLE9BRURNLG1CQUFtQixHQUFuQiw2QkFBb0JDLFVBQWUsRUFBRTtNQUNwQyxJQUFNelgsV0FBVyxHQUFHLElBQUksQ0FBQ0MsMkJBQTJCLEVBQUU7UUFDckQ0TyxTQUFTLEdBQUc3TyxXQUFXLENBQUN3TSxXQUFXLEVBQUU7UUFDckNrTCxnQkFBZ0IsR0FBRzdJLFNBQVMsQ0FBQzNMLE1BQU0sR0FBRyxDQUFDO1FBQ3ZDeVUsUUFBUSxHQUFHRixVQUFVLENBQUMzVyxPQUFPLENBQUM4VyxVQUFVLEVBQUU7TUFDM0MsSUFBSUMsVUFBVTtRQUNiQyxxQkFBcUIsR0FBRzlYLFdBQVcsQ0FBQytYLGNBQWMsQ0FBQyxJQUFJLENBQUM1USxJQUFJLENBQUNuSCxXQUFXLENBQUM4VixrQkFBa0IsRUFBRSxDQUFDLENBQXNCO01BQ3JILElBQUlnQyxxQkFBcUIsS0FBSyxDQUFDLENBQUMsSUFBSUosZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFO1FBQ3pELElBQUlDLFFBQVEsS0FBSyxTQUFTLEVBQUU7VUFDM0IsSUFBSUcscUJBQXFCLElBQUlKLGdCQUFnQixHQUFHLENBQUMsRUFBRTtZQUNsREcsVUFBVSxHQUFHaEosU0FBUyxDQUFDLEVBQUVpSixxQkFBcUIsQ0FBQztVQUNoRDtRQUNELENBQUMsTUFBTSxJQUFJQSxxQkFBcUIsS0FBSyxDQUFDLEVBQUU7VUFDdkM7VUFDQUQsVUFBVSxHQUFHaEosU0FBUyxDQUFDLEVBQUVpSixxQkFBcUIsQ0FBQztRQUNoRDtRQUVBLElBQUlELFVBQVUsRUFBRTtVQUNmN1gsV0FBVyxDQUFDMk4sa0JBQWtCLENBQUNrSyxVQUFVLENBQUM7VUFDMUNBLFVBQVUsQ0FBQ3hHLEtBQUssRUFBRTtRQUNuQjtNQUNEO0lBQ0QsQ0FBQztJQUFBLE9BRUQyRyxvQkFBb0IsR0FBcEIsZ0NBQXVCO01BQ3RCLElBQU14UixxQkFBcUIsR0FBRyxJQUFJLENBQUNqSSxPQUFPLEVBQUUsQ0FBQ3FHLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7TUFDbEcsSUFBTXFULE9BQU8sR0FBRyxJQUFJLENBQUMxWixPQUFPLEVBQUUsQ0FBQzBKLEtBQUssRUFBRTtNQUN0Q3pCLHFCQUFxQixDQUFDcUMsV0FBVyxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQztNQUN2RXFQLEdBQUcsQ0FBQ0MsRUFBRSxDQUNKQyxPQUFPLEVBQUUsQ0FDVEMsaUJBQWlCLEVBQUUsQ0FDbkJDLGVBQWUsRUFBRSxDQUNqQkMsT0FBTyxFQUFFLENBQ1RuRixPQUFPLENBQUMsVUFBVW9GLFFBQWEsRUFBRTtRQUNqQyxJQUFJQSxRQUFRLENBQUNDLFVBQVUsSUFBSUQsUUFBUSxDQUFDRSxJQUFJLEtBQUssT0FBTyxJQUFJRixRQUFRLENBQUNHLE1BQU0sQ0FBQ0MsT0FBTyxDQUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtVQUM5RnpSLHFCQUFxQixDQUFDcUMsV0FBVyxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQztRQUN2RTtNQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFBQSxPQUVEN0UsbUJBQW1CLEdBQW5CLDZCQUFvQlAsR0FBUyxFQUFFb1YsSUFBVSxFQUFFO01BQzFDLElBQUlwVixHQUFHLEVBQUU7UUFDUkMsR0FBRyxDQUFDQyxLQUFLLENBQUNGLEdBQUcsQ0FBQztNQUNmO01BQ0EsSUFBTXFWLGtCQUFrQixHQUFHLElBQUksQ0FBQzVNLGVBQWUsRUFBRSxDQUFDNk0scUJBQXFCLEVBQVM7TUFDaEYsSUFBTUMsZUFBZSxHQUFHRixrQkFBa0IsQ0FBQ0csWUFBWSxFQUFFLEdBQ3RESCxrQkFBa0IsQ0FBQ0ksZ0JBQWdCLEVBQUUsR0FDcEMsSUFBSSxDQUFDaE4sZUFBZSxFQUFFLENBQUNpTixnQkFBZ0IsRUFBRSxDQUFTQyxjQUFjLEVBQUU7TUFDdEUsSUFBSSxDQUFDSixlQUFlLENBQUNyWCxHQUFHLENBQUMsbUJBQW1CLENBQUMsRUFBRTtRQUM5QyxJQUFNMFgsY0FBYyxHQUFHLElBQUksQ0FBQ3pWLGFBQWE7VUFDeEM4RixlQUFlLEdBQUcyUCxjQUFjLENBQUMzUCxlQUFlO1VBQ2hETCxZQUFZLEdBQUdLLGVBQWUsQ0FBQzBELFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFFbkQsSUFBSS9ELFlBQVksQ0FBQ2lRLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDNVAsZUFBZSxDQUFDQyxNQUFNLEVBQUUsRUFBRTtVQUM5RDBQLGNBQWMsQ0FBQ0UsVUFBVSxDQUFDLElBQUksQ0FBQztVQUMvQjtVQUNBeFMsVUFBVSxDQUFDLFlBQVk7WUFDdEIyQyxlQUFlLENBQUM4UCxNQUFNLENBQUNILGNBQWMsQ0FBQztVQUN2QyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ047TUFDRDtNQUNBLE9BQU9SLElBQUk7SUFDWixDQUFDO0lBQUEsT0FFRHRZLGFBQWEsR0FBYix1QkFBY2QsUUFBYSxFQUFFO01BQzVCLElBQU1rUCxNQUFNLEdBQUcsSUFBSSxDQUFDcFEsT0FBTyxFQUFFLENBQUNpQyxRQUFRLENBQUMsSUFBSSxDQUFDO01BQzVDaVosVUFBVSxDQUFDQyxJQUFJLENBQUMvSyxNQUFNLENBQUM7TUFDdkIsT0FBTyxJQUFJLENBQUM3SyxRQUFRLENBQUM2VixZQUFZLENBQUM5TixLQUFLLENBQUMsSUFBSSxDQUFDL0gsUUFBUSxFQUFFLENBQUNyRSxRQUFRLENBQUMsQ0FBQyxDQUFDbWEsT0FBTyxDQUFDLFlBQVk7UUFDdEZILFVBQVUsQ0FBQ0ksTUFBTSxDQUFDbEwsTUFBTSxDQUFDO01BQzFCLENBQUMsQ0FBQztJQUNIO0lBQ0E7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FUQztJQUFBLE9BVU1tTCxtQkFBbUI7TUFBQSxJQUFtQztRQUFBO1FBQUEsY0FDOUMsSUFBSTtRQUFqQixJQUFNN1AsSUFBSSxHQUFHLFFBQUsxTCxPQUFPLEVBQUU7UUFDM0IsSUFBTXdiLE9BQU8sR0FBRzlQLElBQUksQ0FBQ3JGLGlCQUFpQixFQUFlO1FBQUM7VUFBQSxJQUNsRG1WLE9BQU87WUFBQTtjQUFBO2NBQUE7Y0FBQSxPQTJCSHJiLFNBQVM7WUFBQTtZQTFCaEIsSUFBTXNiLG9CQUFvQixHQUFHekcsV0FBVyxDQUFDMEcsZ0JBQWdCLENBQUNGLE9BQU8sQ0FBQztZQUNsRSxJQUFJRyxzQkFBaUM7WUFBQztjQUFBLElBQ2xDRixvQkFBb0I7Z0JBQUE7Z0JBQ3ZCO2dCQUNBLElBQU1HLDRCQUE0Qiw0QkFBSSxRQUFLak8sZUFBZSxFQUFFLENBQUM2TSxxQkFBcUIsRUFBRSxDQUNsRnFCLGlCQUFpQixFQUFFLENBQ25COVgsSUFBSSxDQUFDLFVBQUMrWCxRQUFjO2tCQUFBO2tCQUFBLE9BQUssMEJBQUFBLFFBQVEsQ0FBQ3pWLGlCQUFpQixFQUFFLDBEQUE1QixzQkFBOEJJLE9BQU8sRUFBRSxNQUFLZ1Ysb0JBQW9CO2dCQUFBLEVBQUMsMERBRnZELHNCQUdsQ3BWLGlCQUFpQixFQUFlO2dCQUNuQyxJQUFJdVYsNEJBQTRCLEVBQUU7a0JBQUE7a0JBQUEsT0FDMUJBLDRCQUE0QjtnQkFDcEM7Z0JBQ0EsSUFBTUcsYUFBYSxHQUFHclEsSUFBSSxDQUFDekosUUFBUSxDQUFDLFVBQVUsQ0FBYztnQkFDNUQwWixzQkFBc0IsR0FBR0ksYUFBYSxDQUFDN1osV0FBVyxDQUFDLHlCQUF5QixDQUFDO2dCQUM3RSxJQUFJLDBCQUFBeVosc0JBQXNCLDBEQUF0QixzQkFBd0JsVixPQUFPLEVBQUUsTUFBS2dWLG9CQUFvQixFQUFFO2tCQUFBO2tCQUFBLE9BQ3hERSxzQkFBc0I7Z0JBQzlCO2dCQUNBLElBQU1LLEtBQUssR0FBR1IsT0FBTyxDQUFDdlosUUFBUSxFQUFFO2dCQUNoQyxJQUFNZ2EsU0FBUyxHQUFHRCxLQUFLLENBQUN6VixZQUFZLEVBQUU7Z0JBQ3RDLElBQU0yVixXQUFXLEdBQUdELFNBQVMsQ0FBQ3pWLFdBQVcsQ0FBQ2lWLG9CQUFvQixDQUFDO2dCQUMvRCxJQUFNVSxVQUFVLEdBQUdDLGtCQUFrQixDQUFDQywyQkFBMkIsQ0FBQ0osU0FBUyxDQUFDOUgsVUFBVSxDQUFDK0gsV0FBVyxDQUFDLENBQUM7Z0JBQ3BHUCxzQkFBc0IsR0FBR0ssS0FBSyxDQUFDTSxXQUFXLENBQUNiLG9CQUFvQixDQUFDLENBQUNjLGVBQWUsRUFBRTtnQkFBQyx1QkFDN0VaLHNCQUFzQixDQUFDYSxlQUFlLDBCQUFDTCxVQUFVLENBQUNNLGdCQUFnQixDQUFDNVksSUFBSSxDQUFDLENBQUMsQ0FBQywwREFBbkMsc0JBQXFDNlksSUFBSSxDQUFDO2tCQUN2RjtrQkFDQVgsYUFBYSxDQUFDelIsV0FBVyxDQUFDLHlCQUF5QixFQUFFcVIsc0JBQXNCLENBQUM7a0JBQUM7a0JBQUEsT0FDdEVBLHNCQUFzQjtnQkFBQTtjQUFBO1lBQUE7WUFBQTtVQUFBO1FBQUE7UUFBQTtVQUFBLDJCQUl4QnhiLFNBQVM7UUFBQSx3QkFBVEEsU0FBUztNQUNqQixDQUFDO1FBQUE7TUFBQTtJQUFBO0lBQUEsT0FFS3djLGlCQUFpQjtNQUFBLElBQWtEO1FBQUE7UUFBQSxjQUtqRSxJQUFJO1FBSlgsSUFBTTNQLE9BQU8sR0FBR3NLLElBQUksQ0FBQzFPLElBQUksQ0FBQzBPLElBQUksQ0FBQ3NGLDBCQUEwQixFQUFFLENBQUM7UUFDNUQsSUFBTXBCLE9BQU8sR0FBR3hPLE9BQU8sYUFBUEEsT0FBTyx1QkFBUEEsT0FBTyxDQUFFM0csaUJBQWlCLEVBQWU7UUFBQztVQUFBLElBQ3REbVYsT0FBTyxJQUFJLENBQUNBLE9BQU8sQ0FBQ3FCLFdBQVcsRUFBRTtZQUNwQztZQUFBLHVCQUNNLFFBQUs5WixTQUFTLENBQUMrWixRQUFRLEVBQUU7Y0FDL0IsSUFBTUMsWUFBWSxHQUFHLFFBQUtwUCxlQUFlLEVBQUU7Y0FDM0MsSUFBTXFQLGtCQUFrQixHQUFHRCxZQUFZLENBQUNFLHFCQUFxQixFQUFFO2NBQy9ELElBQU1DLFVBQVUsR0FBR0Ysa0JBQWtCLENBQUNHLHdCQUF3QixDQUFDM0IsT0FBTyxDQUFDO2NBQ3ZFLElBQU00QixpQkFBaUIsR0FBR0YsVUFBVSxHQUFHRixrQkFBa0IsQ0FBQ0ssK0JBQStCLENBQUNILFVBQVUsQ0FBQyxHQUFHLEVBQUU7Y0FDMUc7Y0FBQTtnQkFBQSxJQUNJRSxpQkFBaUIsQ0FBQ3pZLE1BQU07a0JBQUEsb0JBQ3BCMlksT0FBTyxDQUFDQyxHQUFHLENBQUNILGlCQUFpQixDQUFDdlcsR0FBRyxDQUFDLFVBQUMyVyxXQUFXO29CQUFBLE9BQUssUUFBSzlJLFlBQVksQ0FBQytJLGtCQUFrQixDQUFDRCxXQUFXLEVBQUVoQyxPQUFPLENBQUM7a0JBQUEsRUFBQyxDQUFDO2tCQUFBO2tCQUFBO2dCQUFBO2tCQUFBLHVCQUV2RixRQUFLRCxtQkFBbUIsRUFBRSxpQkFBbkRtQyxnQkFBZ0I7b0JBQUEsSUFFbEJBLGdCQUFnQjtzQkFBQSw2QkFDWnBLLEtBQUssQ0FBQ3FLLHNCQUFzQixDQUFDRCxnQkFBZ0IsRUFBRVgsWUFBWSxDQUFDO3NCQUFBO3NCQUFBO29CQUFBO2tCQUFBLElBRnBFO2dCQUFBO2NBQUE7WUFBQTtVQUFBO1FBQUE7UUFBQTtVQUFBLDJCQU1LNWMsU0FBUztRQUFBLHdCQUFUQSxTQUFTO01BQ2pCLENBQUM7UUFBQTtNQUFBO0lBQUE7SUFBQSxPQUVLZ0MsYUFBYSwwQkFBQ2pCLFFBQWE7TUFBQSxJQUFFO1FBQUEsY0FDbkIsSUFBSTtRQUFuQixJQUFNa1AsTUFBTSxHQUFHLFFBQUtwUSxPQUFPLEVBQUUsQ0FBQ2lDLFFBQVEsQ0FBQyxJQUFJLENBQUM7VUFDM0MyYixvQkFBMkIsR0FBRyxFQUFFO1FBQ2pDO1FBQ0EsSUFBSUMsMEJBQTBCLEdBQUcsS0FBSztRQUN0QzNDLFVBQVUsQ0FBQ0MsSUFBSSxDQUFDL0ssTUFBTSxDQUFDO1FBQ3ZCLFFBQUsxTixXQUFXLEVBQUUsQ0FBQ21TLE9BQU8sQ0FBQyxVQUFDcFMsTUFBVyxFQUFLO1VBQzNDLElBQU1nTixRQUFRLEdBQUcsUUFBS3ZELGdCQUFnQixDQUFDekosTUFBTSxDQUFDO1VBQzlDLElBQU1yQixXQUFnQixHQUFHO1lBQ3hCMGMsWUFBWSxFQUFFcmIsTUFBTSxDQUFDb0MsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUN6Q2taLFdBQVcsRUFBRXRiLE1BQU0sQ0FBQ3NNLGNBQWMsRUFBRTtZQUNwQ2lQLFdBQVcsRUFBRXZiLE1BQU0sQ0FBQ29DLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSztVQUM3QyxDQUFDO1VBQ0QsSUFBTW9aLGVBQWUsR0FDcEI3YyxXQUFXLENBQUMyYyxXQUFXLElBQ3ZCM2MsV0FBVyxDQUFDMmMsV0FBVyxDQUFDMVgsaUJBQWlCLEVBQUUsSUFDM0NlLE1BQU0sQ0FBQ3ZELElBQUksQ0FBQ3pDLFdBQVcsQ0FBQzJjLFdBQVcsQ0FBQzFYLGlCQUFpQixFQUFFLENBQUNsQyxTQUFTLEVBQUUsQ0FBQyxDQUFDUSxNQUFNLEdBQUcsQ0FBQztVQUNoRixJQUFJc1osZUFBZSxFQUFFO1lBQ3BCO1lBQ0E7WUFDQTdjLFdBQVcsQ0FBQzhjLGdCQUFnQixHQUFHLElBQUk7WUFDbkNMLDBCQUEwQixHQUFHLElBQUk7WUFDakNELG9CQUFvQixDQUFDcFAsSUFBSSxDQUN4QixRQUFLakosUUFBUSxDQUFDNFksY0FBYyxDQUFDMU8sUUFBUSxFQUFFck8sV0FBVyxDQUFDLENBQUM1QyxJQUFJLENBQUMsWUFBWTtjQUNwRSxPQUFPaVIsUUFBUTtZQUNoQixDQUFDLENBQUMsQ0FDRjtVQUNGO1FBQ0QsQ0FBQyxDQUFDO1FBQUMsb0RBRUM7VUFBQSx1QkFDcUI2TixPQUFPLENBQUNDLEdBQUcsQ0FBQ0ssb0JBQW9CLENBQUMsaUJBQW5EUSxTQUFTO1lBQ2YsSUFBTWhkLFdBQVcsR0FBRztjQUNuQnljLDBCQUEwQixFQUFFQSwwQkFBMEI7Y0FDdERRLFFBQVEsRUFBRUQ7WUFDWCxDQUFDO1lBQ0Q7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUFBLDBCQUNJO2NBQUEsdUJBQ0csUUFBSzdZLFFBQVEsQ0FBQytZLFlBQVksQ0FBQ3BkLFFBQVEsRUFBRUUsV0FBVyxDQUFDO1lBQ3hELENBQUMsWUFBUWdFLEtBQVUsRUFBRTtjQUNwQjtjQUNBO2NBQ0E7Y0FDQTtjQUNBLFFBQUtLLG1CQUFtQixDQUFDTCxLQUFLLENBQUM7Y0FDL0IsTUFBTUEsS0FBSztZQUNaLENBQUM7VUFBQTtRQUNGLENBQUM7VUFDQSxJQUFJOFYsVUFBVSxDQUFDcUQsUUFBUSxDQUFDbk8sTUFBTSxDQUFDLEVBQUU7WUFDaEM4SyxVQUFVLENBQUNJLE1BQU0sQ0FBQ2xMLE1BQU0sQ0FBQztVQUMxQjtVQUFDO1VBQUE7UUFBQTtNQUVILENBQUM7UUFBQTtNQUFBO0lBQUE7SUFBQSxPQUVEb08sb0JBQW9CLEdBQXBCLGdDQUF1QjtNQUN0QkMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDemUsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUFBLE9BRUQwZSw2QkFBNkIsR0FBN0IsdUNBQThCcFMsS0FBVSxFQUFFO01BQ3pDcVMsZUFBZSxDQUFDclMsS0FBSyxFQUFFLElBQUksQ0FBQ3RNLE9BQU8sRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFBQSxPQUVENGUsZUFBZSxHQUFmLHlCQUFnQjFkLFFBQWEsRUFBRUUsV0FBZ0IsRUFBRTtNQUNoREEsV0FBVyxDQUFDeWQsWUFBWSxHQUFHLElBQUksQ0FBQzdlLE9BQU8sRUFBRSxDQUFDNEksSUFBSSxDQUFDeEgsV0FBVyxDQUFDeWQsWUFBWSxDQUFDLENBQUMsQ0FBQztNQUMxRSxPQUFPLElBQUksQ0FBQ3RaLFFBQVEsQ0FBQ3VaLGNBQWMsQ0FBQzVkLFFBQVEsRUFBRUUsV0FBVyxDQUFDO0lBQzNELENBQUM7SUFBQSxPQUVEZ0IsY0FBYyxHQUFkLHdCQUFlbEIsUUFBYSxFQUFFO01BQUE7TUFDN0IsT0FBTyxJQUFJLENBQUNxRSxRQUFRLENBQUN3WixhQUFhLENBQUM3ZCxRQUFRLENBQUMsQ0FBQytELEtBQUssQ0FBQztRQUFBLE9BQU0sT0FBSSxDQUFDUSxtQkFBbUIsRUFBRTtNQUFBLEVBQUM7SUFDckYsQ0FBQztJQUFBLE9BRURnUixrQkFBa0IsR0FBbEIsOEJBQXFCO01BQ3BCLElBQU1oVixXQUFXLEdBQUcsSUFBSSxDQUFDQywyQkFBMkIsRUFBRTtNQUN0RCxJQUFJd0UsV0FBVyxDQUFDOFksc0JBQXNCLENBQUN2ZCxXQUFXLENBQUNvRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFO1FBQzVFcUIsV0FBVyxDQUFDK1ksd0JBQXdCLENBQUN4ZCxXQUFXLENBQUM7TUFDbEQ7SUFDRCxDQUFDO0lBQUEsT0FFRHlkLHdCQUF3QixHQUF4QixrQ0FBeUJDLGNBQW1CLEVBQUVDLFdBQWdCLEVBQUVDLFNBQWMsRUFBRUMsUUFBa0IsRUFBRTtNQUNuRyxLQUFLLElBQUlDLE9BQU8sR0FBRyxDQUFDLEVBQUVBLE9BQU8sR0FBR0osY0FBYyxDQUFDeGEsTUFBTSxFQUFFNGEsT0FBTyxFQUFFLEVBQUU7UUFDakUsSUFBSTNHLFFBQVEsR0FBR3VHLGNBQWMsQ0FBQ0ksT0FBTyxDQUFDLENBQUN2TixVQUFVLFlBQVl3QixRQUFRLElBQUkyTCxjQUFjLENBQUNJLE9BQU8sQ0FBQyxDQUFDdk4sVUFBVSxFQUFFO1FBQzdHLElBQUlzTixRQUFRLEVBQUU7VUFDYixJQUFJMUcsUUFBUSxJQUFJQSxRQUFRLENBQUM0RyxhQUFhLElBQUk1RyxRQUFRLENBQUM2RyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0UsSUFBTUMsTUFBTSxHQUFHOUcsUUFBUSxDQUFDNkcsY0FBYyxDQUFDLE9BQU8sQ0FBQztZQUMvQ0MsTUFBTSxDQUFDN0ssT0FBTyxDQUFDLFVBQVU4SyxLQUFVLEVBQUU7Y0FDcEMsSUFBSUEsS0FBSyxDQUFDdmMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLEVBQUU7Z0JBQzlDd1YsUUFBUSxHQUFHK0csS0FBSztjQUNqQjtZQUNELENBQUMsQ0FBQztVQUNIO1FBQ0Q7UUFDQSxJQUFJL0csUUFBUSxJQUFJQSxRQUFRLENBQUN4VixHQUFHLElBQUl3VixRQUFRLENBQUN4VixHQUFHLENBQUMsa0NBQWtDLENBQUMsRUFBRTtVQUNqRndWLFFBQVEsR0FBR0EsUUFBUSxDQUFDZ0gsY0FBYyxZQUFZcE0sUUFBUSxJQUFJb0YsUUFBUSxDQUFDZ0gsY0FBYyxFQUFFO1VBQ25GLElBQUloSCxRQUFRLElBQUlBLFFBQVEsQ0FBQ2pVLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDcENpVSxRQUFRLEdBQUdBLFFBQVEsQ0FBQyxDQUFDLENBQUM7VUFDdkI7UUFDRDtRQUNBLElBQUlBLFFBQVEsSUFBSUEsUUFBUSxDQUFDeFYsR0FBRyxJQUFJd1YsUUFBUSxDQUFDeFYsR0FBRyxDQUFDLDhCQUE4QixDQUFDLEVBQUU7VUFDN0V3VixRQUFRLEdBQUdBLFFBQVEsQ0FBQzVHLFVBQVUsWUFBWXdCLFFBQVEsSUFBSW9GLFFBQVEsQ0FBQzVHLFVBQVUsRUFBRTtVQUMzRSxJQUFJNEcsUUFBUSxJQUFJQSxRQUFRLENBQUNqVSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3BDaVUsUUFBUSxHQUFHQSxRQUFRLENBQUMsQ0FBQyxDQUFDO1VBQ3ZCO1FBQ0Q7UUFDQSxJQUFJQSxRQUFRLElBQUlBLFFBQVEsQ0FBQ3hWLEdBQUcsSUFBSXdWLFFBQVEsQ0FBQ3hWLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1VBQ2pFaWMsU0FBUyxDQUFDN1EsSUFBSSxDQUFDb0ssUUFBUSxDQUFDO1FBQ3pCO1FBRUEsSUFBSUEsUUFBUSxJQUFJQSxRQUFRLENBQUN4VixHQUFHLElBQUl3VixRQUFRLENBQUN4VixHQUFHLENBQUMsOEJBQThCLENBQUMsRUFBRTtVQUM3RXdWLFFBQVEsR0FBR0EsUUFBUSxDQUFDNUcsVUFBVSxZQUFZd0IsUUFBUSxJQUFJb0YsUUFBUSxDQUFDNUcsVUFBVSxFQUFFO1VBQzNFLElBQUk0RyxRQUFRLElBQUlBLFFBQVEsQ0FBQ2pVLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDcENpVSxRQUFRLEdBQUdBLFFBQVEsQ0FBQyxDQUFDLENBQUM7VUFDdkI7UUFDRDtRQUNBLElBQUlBLFFBQVEsSUFBSUEsUUFBUSxDQUFDeFYsR0FBRyxJQUFJd1YsUUFBUSxDQUFDeFYsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7VUFDakVpYyxTQUFTLENBQUM3USxJQUFJLENBQUNvSyxRQUFRLENBQUM7UUFDekI7TUFDRDtJQUNELENBQUM7SUFBQSxPQUVEMUssa0JBQWtCLEdBQWxCLDhCQUFxQjtNQUNwQixJQUFNek0sV0FBVyxHQUFHLElBQUksQ0FBQ0MsMkJBQTJCLEVBQUU7TUFDdEQsSUFBSW1QLFlBQW1CLEdBQUcsRUFBRTtNQUM1QnBQLFdBQVcsQ0FBQ3dNLFdBQVcsRUFBRSxDQUFDNEcsT0FBTyxDQUFDLFVBQVVoTSxRQUFhLEVBQUU7UUFDMURnSSxZQUFZLEdBQUdBLFlBQVksQ0FBQ2tGLE1BQU0sQ0FBQ2xOLFFBQVEsQ0FBQ0csY0FBYyxFQUFFLENBQUM7TUFDOUQsQ0FBQyxDQUFDO01BQ0YsT0FBTzZILFlBQVk7SUFDcEIsQ0FBQztJQUFBLE9BRURnUCxhQUFhLEdBQWIseUJBQWdCO01BQ2YsSUFBSWhPLE9BQWMsR0FBRyxFQUFFO01BQ3ZCLElBQUksQ0FBQzNELGtCQUFrQixFQUFFLENBQUMyRyxPQUFPLENBQUMsVUFBVTFNLFdBQWdCLEVBQUU7UUFDN0QwSixPQUFPLEdBQUdBLE9BQU8sQ0FBQ2tFLE1BQU0sQ0FBQzVOLFdBQVcsQ0FBQ3NFLFNBQVMsRUFBRSxDQUFDO01BQ2xELENBQUMsQ0FBQztNQUNGLE9BQU9vRixPQUFPO0lBQ2YsQ0FBQztJQUFBLE9BRURuUCxXQUFXLEdBQVgsdUJBQWM7TUFDYixJQUFNbU8sWUFBWSxHQUFHLElBQUksQ0FBQzNDLGtCQUFrQixFQUFFO01BQzlDLElBQU1FLE9BQWMsR0FBRyxFQUFFO01BQ3pCLEtBQUssSUFBSXZFLFVBQVUsR0FBRyxDQUFDLEVBQUVBLFVBQVUsR0FBR2dILFlBQVksQ0FBQ2xNLE1BQU0sRUFBRWtGLFVBQVUsRUFBRSxFQUFFO1FBQ3hFLElBQUksQ0FBQ3FWLHdCQUF3QixDQUFDck8sWUFBWSxDQUFDaEgsVUFBVSxDQUFDLENBQUM0QyxTQUFTLEVBQUUsRUFBRW9FLFlBQVksQ0FBQ2hILFVBQVUsQ0FBQyxFQUFFdUUsT0FBTyxDQUFDO1FBQ3RHLElBQUksQ0FBQzhRLHdCQUF3QixDQUFDck8sWUFBWSxDQUFDaEgsVUFBVSxDQUFDLENBQUM2QyxhQUFhLEVBQUUsRUFBRW1FLFlBQVksQ0FBQ2hILFVBQVUsQ0FBQyxFQUFFdUUsT0FBTyxDQUFDO01BQzNHO01BQ0EsT0FBT0EsT0FBTztJQUNmLENBQUM7SUFBQSxPQUVEMFIsV0FBVyxHQUFYLHVCQUFjO01BQ2IsSUFBTWpQLFlBQVksR0FBRyxJQUFJLENBQUMzQyxrQkFBa0IsRUFBRTtNQUM5QyxJQUFNNlIsT0FBYyxHQUFHLEVBQUU7TUFDekIsS0FBSyxJQUFJbFcsVUFBVSxHQUFHLENBQUMsRUFBRUEsVUFBVSxHQUFHZ0gsWUFBWSxDQUFDbE0sTUFBTSxFQUFFa0YsVUFBVSxFQUFFLEVBQUU7UUFDeEUsSUFBSSxDQUFDcVYsd0JBQXdCLENBQUNyTyxZQUFZLENBQUNoSCxVQUFVLENBQUMsQ0FBQzRDLFNBQVMsRUFBRSxFQUFFb0UsWUFBWSxDQUFDaEgsVUFBVSxDQUFDLEVBQUVrVyxPQUFPLEVBQUUsSUFBSSxDQUFDO1FBQzVHLElBQUksQ0FBQ2Isd0JBQXdCLENBQUNyTyxZQUFZLENBQUNoSCxVQUFVLENBQUMsQ0FBQzZDLGFBQWEsRUFBRSxFQUFFbUUsWUFBWSxDQUFDaEgsVUFBVSxDQUFDLEVBQUVrVyxPQUFPLEVBQUUsSUFBSSxDQUFDO01BQ2pIO01BQ0EsT0FBT0EsT0FBTztJQUNmLENBQUM7SUFBQSxPQUVEclIsaUJBQWlCLEdBQWpCLDZCQUFvQjtNQUNuQixJQUFJLENBQUNtUixhQUFhLEVBQUUsQ0FBQ2hMLE9BQU8sQ0FBQyxVQUFVbUwsTUFBVyxFQUFFO1FBQ25ELElBQU1DLFFBQVEsR0FBR0QsTUFBTSxDQUFDaE8sVUFBVSxZQUFZd0IsUUFBUSxJQUFJd00sTUFBTSxDQUFDaE8sVUFBVSxFQUFFO1FBQzdFLElBQUlpTyxRQUFRLElBQUlBLFFBQVEsQ0FBQzdjLEdBQUcsSUFBSTZjLFFBQVEsQ0FBQzdjLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFO1VBQ2pGLElBQUk2YyxRQUFRLENBQUNDLGtCQUFrQixZQUFZMU0sUUFBUSxFQUFFO1lBQ3BEeU0sUUFBUSxDQUFDQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7VUFDbkM7UUFDRDtNQUNELENBQUMsQ0FBQztJQUNIOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9Bdlosb0JBQW9CLEdBQXBCLDhCQUFxQndaLGFBQWtCLEVBQUVDLFVBQWtCLEVBQUU7TUFDNUQsSUFBTUMsWUFBWSxHQUFHRixhQUFhLENBQUNoYyxTQUFTLEVBQUU7TUFDOUMsSUFBSW1jLGlCQUFpQixHQUFHLENBQUNELFlBQVksQ0FBQztNQUN0QyxJQUFJRixhQUFhLElBQUlDLFVBQVUsRUFBRTtRQUNoQyxJQUFJQyxZQUFZLENBQUNELFVBQVUsQ0FBQyxFQUFFO1VBQzdCRSxpQkFBaUIsR0FBR0QsWUFBWSxDQUFDRCxVQUFVLENBQUM7VUFDNUMsT0FBT0MsWUFBWSxDQUFDRCxVQUFVLENBQUM7VUFDL0JFLGlCQUFpQixDQUFDOVIsSUFBSSxDQUFDNlIsWUFBWSxDQUFDO1FBQ3JDO01BQ0Q7TUFDQSxPQUFPQyxpQkFBaUI7SUFDekI7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BUUFDLGtCQUFrQixHQUFsQiw0QkFBbUJDLFFBQWdCLEVBQUU7TUFDcEMsSUFBSSxJQUFJLENBQUM5ZCxXQUFXLElBQUksSUFBSSxDQUFDQSxXQUFXLEVBQUUsQ0FBQ2lDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdEQsSUFBTXlKLE9BQU8sR0FBRyxJQUFJLENBQUMxTCxXQUFXLEVBQUU7UUFDbEMsS0FBSyxJQUFJdUIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHbUssT0FBTyxDQUFDekosTUFBTSxFQUFFVixDQUFDLEVBQUUsRUFBRTtVQUN4Q3djLGFBQWEsQ0FBQ0MsZ0JBQWdCLENBQUN0UyxPQUFPLENBQUNuSyxDQUFDLENBQUMsRUFBRXVjLFFBQVEsQ0FBQztRQUNyRDtNQUNEO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FUQztJQUFBLE9BVUFHLHNCQUFzQixHQUF0QixnQ0FBdUJDLFlBQXFCLEVBQUVDLFlBQW1CLEVBQUVULFVBQWtCLEVBQUU7TUFBQTtNQUN0RixJQUFJVSxXQUFrQixHQUFHLEVBQUU7UUFDMUJDLGVBQWUsR0FBRyxFQUFFO1FBQ3BCN2YsUUFBUTtRQUNSOGYsYUFBcUI7UUFDckJDLFNBQVM7TUFFVixJQUFNQyxTQUFTLEdBQUdOLFlBQVksQ0FBQ25hLE9BQU8sRUFBRTtNQUN4QyxJQUFNMGEsVUFBVSxHQUFHUCxZQUFZLElBQUlBLFlBQVksQ0FBQzNlLFFBQVEsRUFBRSxJQUFLMmUsWUFBWSxDQUFDM2UsUUFBUSxFQUFFLENBQUNzRSxZQUFZLEVBQXFCO01BQ3hILElBQU02YSxhQUFhLEdBQUdELFVBQVUsSUFBSUEsVUFBVSxDQUFDM2EsV0FBVyxDQUFDMGEsU0FBUyxDQUFDLENBQUNoUixPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQzs7TUFFekY7TUFDQSxJQUFJMlEsWUFBWSxJQUFJQSxZQUFZLENBQUNsYyxNQUFNLEVBQUU7UUFDeEN6RCxRQUFRLEdBQUcyZixZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzFCSSxTQUFTLEdBQUcvZixRQUFRLENBQUN1RixPQUFPLEVBQUU7UUFDOUJ1YSxhQUFhLEdBQUdHLFVBQVUsSUFBSUEsVUFBVSxDQUFDM2EsV0FBVyxDQUFDeWEsU0FBUyxDQUFDLENBQUMvUSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztRQUVuRjJRLFlBQVksQ0FBQ2hNLE9BQU8sQ0FBQyxVQUFDd00sY0FBbUIsRUFBSztVQUM3QyxJQUFJakIsVUFBVSxFQUFFO1lBQ2YsSUFBTUUsaUJBQWlCLEdBQUcsT0FBSSxDQUFDM1osb0JBQW9CLENBQUMwYSxjQUFjLEVBQUVqQixVQUFVLENBQUM7WUFDL0UsSUFBSUUsaUJBQWlCLEVBQUU7Y0FDdEJRLFdBQVcsR0FBR1IsaUJBQWlCLENBQUN6WixHQUFHLENBQUMsVUFBVXlhLG9CQUF5QixFQUFFO2dCQUN4RSxPQUFPO2tCQUNOQyxXQUFXLEVBQUVELG9CQUFvQjtrQkFDakMvWCxTQUFTLFlBQUs2WCxhQUFhLGNBQUloQixVQUFVO2dCQUMxQyxDQUFDO2NBQ0YsQ0FBQyxDQUFDO1lBQ0g7VUFDRCxDQUFDLE1BQU07WUFDTlUsV0FBVyxDQUFDdFMsSUFBSSxDQUFDO2NBQ2hCK1MsV0FBVyxFQUFFRixjQUFjLENBQUNsZCxTQUFTLEVBQUU7Y0FDdkNvRixTQUFTLEVBQUV5WDtZQUNaLENBQUMsQ0FBQztVQUNIO1FBQ0QsQ0FBQyxDQUFDO01BQ0g7TUFDQUQsZUFBZSxDQUFDdlMsSUFBSSxDQUFDO1FBQ3BCK1MsV0FBVyxFQUFFWCxZQUFZLENBQUN6YyxTQUFTLEVBQUU7UUFDckNvRixTQUFTLEVBQUU2WDtNQUNaLENBQUMsQ0FBQztNQUNGO01BQ0FMLGVBQWUsR0FBRzdhLFdBQVcsQ0FBQ3NiLG1CQUFtQixDQUFDVCxlQUFlLEVBQUVJLFVBQVUsQ0FBQztNQUM5RSxJQUFNTSxZQUFZLEdBQUd2YixXQUFXLENBQUN3YixnQ0FBZ0MsQ0FBQyxJQUFJQyxnQkFBZ0IsRUFBRSxFQUFFWixlQUFlLEVBQUUsSUFBSSxDQUFDL2dCLE9BQU8sRUFBRSxDQUFDO01BQzFIOGdCLFdBQVcsR0FBRzVhLFdBQVcsQ0FBQ3NiLG1CQUFtQixDQUFDVixXQUFXLEVBQUVLLFVBQVUsQ0FBQztNQUN0RSxPQUFPO1FBQ05TLGdCQUFnQixFQUFFSCxZQUFZO1FBQzlCSSxVQUFVLEVBQUVmO01BQ2IsQ0FBQztJQUNGLENBQUM7SUFBQSxPQUVEclcsc0JBQXNCLEdBQXRCLGtDQUF5QjtNQUN4QixJQUFNOEMsU0FBUyxHQUFHLElBQUksQ0FBQ3ZOLE9BQU8sRUFBRSxDQUFDdUIsV0FBVyxFQUFTO1FBQ3BEdWdCLGVBQWUsR0FBR3ZVLFNBQVMsQ0FBQ3dVLG9CQUFvQjtRQUNoREMsZUFBZSxHQUFHRixlQUFlLElBQUkxYSxNQUFNLENBQUN2RCxJQUFJLENBQUNpZSxlQUFlLENBQUM7UUFDakV4VCxZQUFZLEdBQUcsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxDQUFDO01BRXJFLElBQUkwVCxlQUFlLElBQUlBLGVBQWUsQ0FBQ3JkLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDbERxZCxlQUFlLENBQUNuTixPQUFPLENBQUMsVUFBVXZRLElBQVMsRUFBRTtVQUM1QyxJQUFNMmQsY0FBYyxHQUFHSCxlQUFlLENBQUN4ZCxJQUFJLENBQUM7VUFDNUMsSUFBSTJkLGNBQWMsQ0FBQ0MsY0FBYyxLQUFLLGFBQWEsRUFBRTtZQUNwRDVULFlBQVksQ0FBQ0UsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1VBQ3ZDO1FBQ0QsQ0FBQyxDQUFDO01BQ0g7TUFDQSxPQUFPRixZQUFZO0lBQ3BCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BWkM7SUFBQSxPQWFNNlQsbUJBQW1CLGdDQUFDNWYsT0FBb0I7TUFBQSxJQUFFO1FBQUE7UUFBQSxjQUU5QixJQUFJO1FBRHJCLElBQU1yQixRQUFRLEdBQUdxQixPQUFPLENBQUM4RCxpQkFBaUIsRUFBRTtVQUMzQ29SLGFBQWEsR0FBRyxRQUFLOUosZUFBZSxFQUFFO1VBQ3RDeVUsU0FBMEIsR0FBRyxFQUFFO1VBQy9CQyxrQkFBeUIsR0FBRyxFQUFFO1VBQzlCQyxRQUFRLEdBQUdwaEIsUUFBUSxhQUFSQSxRQUFRLHVCQUFSQSxRQUFRLENBQUV1RixPQUFPLEVBQUU7VUFDOUI4YixVQUFVLHNCQUFHRCxRQUFRLGFBQVJBLFFBQVEsdUJBQVJBLFFBQVEsQ0FBRUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyw2REFBSSxFQUFFO1VBQ3ZDckIsVUFBVSxHQUFHMUosYUFBYSxJQUFJQSxhQUFhLENBQUNsUixZQUFZLEVBQUU7UUFDM0QsSUFBSWtjLEtBQUssR0FBRyxFQUFFO1FBQUMsaUNBQ1g7VUFDSEYsVUFBVSxDQUFDRyxLQUFLLEVBQUU7VUFDbEJILFVBQVUsQ0FBQ0ksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztVQUN4QkosVUFBVSxDQUFDMU4sT0FBTyxDQUFDLFVBQVUrTixTQUFjLEVBQUU7WUFDNUNILEtBQUssZUFBUUcsU0FBUyxDQUFFO1lBQ3hCLElBQU1DLG1CQUFtQixHQUFHcEwsYUFBYSxDQUFDK0MscUJBQXFCLEVBQWlDO1lBQ2hHLElBQU1zSSxjQUFjLEdBQUczQixVQUFVLENBQUMzYSxXQUFXLENBQUNpYyxLQUFLLENBQUM7WUFDcEQsSUFBTU0sY0FBYyxHQUFHNUIsVUFBVSxDQUFDaGQsU0FBUyxXQUFJMmUsY0FBYyxvREFBaUQ7WUFDOUcsSUFBSUMsY0FBYyxFQUFFO2NBQ25CO2NBQ0FWLGtCQUFrQixDQUFDN1QsSUFBSSxDQUFDLENBQUMsQ0FBQztjQUMxQjtZQUNELENBQUMsTUFBTTtjQUNONlQsa0JBQWtCLENBQUM3VCxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNCO1lBQ0E0VCxTQUFTLENBQUM1VCxJQUFJLENBQUNxVSxtQkFBbUIsQ0FBQ0csb0JBQW9CLENBQUNQLEtBQUssQ0FBQyxDQUFDO1VBQ2hFLENBQUMsQ0FBQztVQUFDLHVCQUNzQ25GLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDNkUsU0FBUyxDQUFDLGlCQUF6RGEsbUJBQTBCO1lBQ2hDLElBQUlDLEdBQUcsRUFBRUMsaUJBQWlCLEVBQUVDLEtBQUs7WUFBQyw0Q0FDREgsbUJBQW1CO2NBQUE7WUFBQTtjQUFwRCx1REFBc0Q7Z0JBQUEsSUFBM0NJLGtCQUFrQjtnQkFDNUJGLGlCQUFpQixHQUFHRixtQkFBbUIsQ0FBQzVJLE9BQU8sQ0FBQ2dKLGtCQUFrQixDQUFDO2dCQUNuRUgsR0FBRyxHQUFHQyxpQkFBaUIsR0FBR2Qsa0JBQWtCLENBQUNjLGlCQUFpQixDQUFDO2dCQUMvREMsS0FBSyxHQUFHN2dCLE9BQU8sQ0FBQytnQixRQUFRLEVBQUUsQ0FBQ0osR0FBRyxDQUFDLEdBQUczZ0IsT0FBTyxDQUFDK2dCLFFBQVEsRUFBRSxDQUFDSixHQUFHLENBQUMsR0FBRyxJQUFJSyxJQUFJLEVBQUU7Z0JBQ3RFO2dCQUNBSCxLQUFLLENBQUNJLE9BQU8sQ0FBQ0gsa0JBQWtCLENBQUMvSyxRQUFRLElBQUkrSyxrQkFBa0IsQ0FBQ2hMLEtBQUssQ0FBQztnQkFDdEU7Z0JBQ0ErSyxLQUFLLENBQUNLLE9BQU8sQ0FBQ0MsU0FBUyxDQUFDTCxrQkFBa0IsQ0FBQzlLLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUNoVyxPQUFPLENBQUMrZ0IsUUFBUSxFQUFFLENBQUNKLEdBQUcsQ0FBQyxFQUFFO2tCQUM3QjNnQixPQUFPLENBQUNvaEIsT0FBTyxDQUFDUCxLQUFLLENBQUM7Z0JBQ3ZCO2NBQ0Q7WUFBQztjQUFBO1lBQUE7Y0FBQTtZQUFBO1VBQUE7UUFDRixDQUFDLFlBQVFoZSxLQUFVLEVBQUU7VUFDcEJELEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLDJDQUEyQyxHQUFHQSxLQUFLLENBQUM7UUFDL0QsQ0FBQztRQUFBO01BQ0YsQ0FBQztRQUFBO01BQUE7SUFBQTtJQUFBLE9BRUQ0Uyx5Q0FBeUMsR0FBekMscURBQTRDO01BQzNDLElBQU0vVyxLQUFLLEdBQUcsSUFBSSxDQUFDakIsT0FBTyxFQUFFO01BQzVCLElBQU1pSSxxQkFBcUIsR0FBR2hILEtBQUssQ0FBQ29GLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7TUFDekYsSUFBTXVkLFdBQVcsR0FBRzFkLFdBQVcsQ0FBQzJkLDZDQUE2QyxDQUM1RTVpQixLQUFLLENBQUNNLFdBQVcsRUFBRSxFQUNuQixJQUFJLENBQUNvTSxlQUFlLEVBQUUsQ0FBQ21XLGlCQUFpQixFQUFFLENBQUNDLFlBQVksRUFBRSxDQUN6RDtNQUNELElBQU1DLGNBQWMsR0FBRyxJQUFJLENBQUNyVyxlQUFlLEVBQUUsQ0FBQytKLGdCQUFnQixFQUFFO01BQ2hFLElBQU1rSixZQUFZLEdBQUczZixLQUFLLElBQUtBLEtBQUssQ0FBQ29GLGlCQUFpQixFQUFjO01BQ3BFNEIscUJBQXFCLENBQUNxQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDOUQsSUFBSXNXLFlBQVksRUFBRTtRQUNqQkEsWUFBWSxDQUNWcUQsYUFBYSxFQUFFLENBQ2Z6bEIsSUFBSSxDQUFDLFVBQVVtRixLQUFVLEVBQUU7VUFDM0J1Z0IsVUFBVSxDQUFDTixXQUFXLEVBQUVqZ0IsS0FBSyxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUNEc0IsS0FBSyxDQUFDLFVBQVU2SSxNQUFXLEVBQUU7VUFDN0IzSSxHQUFHLENBQUNDLEtBQUssQ0FBQyxrREFBa0QsRUFBRTBJLE1BQU0sQ0FBQztRQUN0RSxDQUFDLENBQUM7TUFDSjs7TUFFQTtBQUNGO0FBQ0E7TUFDRSxTQUFTcVcsU0FBUyxDQUFDclcsTUFBVyxFQUFFO1FBQy9CM0ksR0FBRyxDQUFDQyxLQUFLLENBQUMwSSxNQUFNLENBQUM7TUFDbEI7TUFFQSxTQUFTc1csbUJBQW1CLENBQUNDLEVBQVUsRUFBRUMsZUFBb0IsRUFBRTtRQUM5RCxJQUFNQyxPQUFPLEdBQUdGLEVBQUU7UUFDbEI7UUFDQSxJQUFJQyxlQUFlLElBQUlBLGVBQWUsQ0FBQzNmLE1BQU0sS0FBSyxDQUFDLElBQUkyZixlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUNFLFNBQVMsRUFBRTtVQUNwRnZjLHFCQUFxQixDQUFDcUMsV0FBVyxpQ0FBMEJpYSxPQUFPLEdBQUksSUFBSSxDQUFDO1FBQzVFO01BQ0Q7O01BRUE7QUFDRjtBQUNBO0FBQ0E7TUFDRSxTQUFTTCxVQUFVLENBQUNPLGNBQW1CLEVBQUVDLFNBQWMsRUFBRTtRQUFBLHNCQUM3Q2poQixHQUFHO1VBQ2IsSUFBTWtoQixVQUFVLEdBQUdGLGNBQWMsQ0FBQ2hoQixHQUFHLENBQUM7VUFDdEMsSUFBTXdELE9BQVksR0FBRyxDQUFDLENBQUM7VUFDdkIsSUFBTW1jLEtBQUssR0FBR25pQixLQUFLLENBQUMySCxJQUFJLENBQUNuRixHQUFHLENBQUM7VUFDN0IsSUFBSSxDQUFDMmYsS0FBSyxFQUFFO1lBQ1g7WUFDQTtVQUNEO1VBQ0EsSUFBTXdCLFlBQVksR0FBR3hCLEtBQUssQ0FBQy9jLGlCQUFpQixFQUFFO1VBQzlDLElBQU13ZSxTQUFjLEdBQUdELFlBQVksSUFBSUEsWUFBWSxDQUFDemdCLFNBQVMsRUFBRTtVQUMvRCxJQUFJMmdCLGFBQWtCLEdBQUdDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRUwsU0FBUyxFQUFFRyxTQUFTLENBQUM7VUFDeEQ7VUFDQSxJQUFJRixVQUFVLENBQUNsZCxxQkFBcUIsRUFBRTtZQUNyQyxJQUFNeEIsc0JBQXNCLEdBQUcwZSxVQUFVLENBQUNsZCxxQkFBcUI7WUFDL0QsS0FBSyxJQUFNb0UsSUFBSSxJQUFJNUYsc0JBQXNCLEVBQUU7Y0FDMUMsSUFBTStlLFFBQVEsR0FBRy9lLHNCQUFzQixDQUFDNEYsSUFBSSxDQUFDO2NBQzdDLElBQU1vWixhQUFhLEdBQUdELFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxlQUFlLENBQUM7Y0FDaEUsSUFBTUUsZUFBZSxHQUFHRixRQUFRLENBQUMsd0JBQXdCLENBQUM7Y0FDMUQsSUFBSUMsYUFBYSxLQUFLQyxlQUFlLEVBQUU7Z0JBQ3RDLElBQUlKLGFBQWEsQ0FBQ0ssY0FBYyxDQUFDRixhQUFhLENBQUMsRUFBRTtrQkFDaEQsSUFBTUcsV0FBZ0IsR0FBRyxDQUFDLENBQUM7a0JBQzNCQSxXQUFXLENBQUNGLGVBQWUsQ0FBQyxHQUFHSixhQUFhLENBQUNHLGFBQWEsQ0FBQztrQkFDM0RILGFBQWEsR0FBR0MsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFRCxhQUFhLEVBQUVNLFdBQVcsQ0FBQztrQkFDckQsT0FBT04sYUFBYSxDQUFDRyxhQUFhLENBQUM7Z0JBQ3BDO2NBQ0Q7WUFDRDtVQUNEO1VBRUEsSUFBSUgsYUFBYSxFQUFFO1lBQ2xCLEtBQUssSUFBTXhnQixJQUFJLElBQUl3Z0IsYUFBYSxFQUFFO2NBQ2pDLElBQUl4Z0IsSUFBSSxDQUFDK1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSS9WLElBQUksQ0FBQytWLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDcEVwVCxPQUFPLENBQUMzQyxJQUFJLENBQUMsR0FBR3dnQixhQUFhLENBQUN4Z0IsSUFBSSxDQUFDO2NBQ3BDO1lBQ0Q7VUFDRDtVQUNBO1VBQ0EwZixjQUFjLENBQ1pxQixxQkFBcUIsQ0FBQyxDQUN0QjtZQUNDakwsTUFBTSxFQUFFO2NBQ1AvUyxjQUFjLEVBQUVzZCxVQUFVLENBQUN0ZCxjQUFjO2NBQ3pDQyxNQUFNLEVBQUVxZCxVQUFVLENBQUNyZDtZQUNwQixDQUFDO1lBQ0RnZSxNQUFNLEVBQUVyZTtVQUNULENBQUMsQ0FDRCxDQUFDLENBQ0R6SSxJQUFJLENBQUMsVUFBQyttQixNQUFNLEVBQUs7WUFDakIsT0FBT25CLG1CQUFtQixDQUFDM2dCLEdBQUcsRUFBRThoQixNQUFNLENBQUM7VUFDeEMsQ0FBQyxDQUFDLENBQ0R0Z0IsS0FBSyxDQUFDa2YsU0FBUyxDQUFDO1FBQUM7UUFsRHBCLEtBQUssSUFBTTFnQixHQUFHLElBQUlnaEIsY0FBYyxFQUFFO1VBQUEsaUJBQXZCaGhCLEdBQUc7VUFBQSx5QkFNWjtRQTZDRjtNQUNEO0lBQ0QsQ0FBQztJQUFBO0VBQUEsRUFueUNpQzJKLGNBQWM7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQW1pRGxDek8sb0JBQW9CO0FBQUEifQ==