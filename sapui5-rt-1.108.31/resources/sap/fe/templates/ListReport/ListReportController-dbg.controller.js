/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/EditFlow", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/KPIManagement", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/MessageStrip", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/fe/core/PageController", "sap/fe/macros/chart/ChartRuntime", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/table/TableHelper", "sap/fe/templates/ListReport/ExtensionAPI", "sap/fe/templates/RootContainer/overrides/EditFlow", "sap/fe/templates/TableScroller", "sap/ui/base/ManagedObject", "sap/ui/core/Component", "sap/ui/core/mvc/OverrideExecution", "sap/ui/Device", "sap/ui/mdc/p13n/StateUtil", "sap/ui/thirdparty/hasher", "./ListReportTemplating", "./overrides/IntentBasedNavigation", "./overrides/Share", "./overrides/ViewState"], function (Log, ObjectPath, ActionRuntime, CommonUtils, EditFlow, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, KPIManagement, MassEdit, Placeholder, Share, SideEffects, ViewState, ClassSupport, EditState, MessageStrip, StableIdHelper, CoreLibrary, PageController, ChartRuntime, ChartUtils, CommonHelper, DelegateUtil, FilterUtils, TableHelper, ExtensionAPI, EditFlowOverrides, TableScroller, ManagedObject, Component, OverrideExecution, Device, StateUtil, hasher, ListReportTemplating, IntentBasedNavigationOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var system = Device.system;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode;
  var ListReportController = (_dec = defineUI5Class("sap.fe.templates.ListReport.ListReportController"), _dec2 = usingExtension(InternalRouting.override({
    onAfterBinding: function () {
      this.getView().getController()._onAfterBinding();
    }
  })), _dec3 = usingExtension(InternalIntentBasedNavigation.override({
    getEntitySet: function () {
      return this.base.getCurrentEntitySet();
    }
  })), _dec4 = usingExtension(SideEffects), _dec5 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec6 = usingExtension(Share.override(ShareOverrides)), _dec7 = usingExtension(EditFlow.override(EditFlowOverrides)), _dec8 = usingExtension(ViewState.override(ViewStateOverrides)), _dec9 = usingExtension(KPIManagement), _dec10 = usingExtension(Placeholder), _dec11 = usingExtension(MassEdit), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = privateExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = publicExtension(), _dec17 = extensible(OverrideExecution.After), _dec18 = publicExtension(), _dec19 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ListReportController, _PageController);
    function ListReportController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call.apply(_PageController, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "_routing", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sideEffects", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editFlow", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "kpiManagement", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "placeholder", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor10, _assertThisInitialized(_this));
      _this.handlers = {
        onFilterSearch: function () {
          this._getFilterBarControl().triggerSearch();
        },
        onFiltersChanged: function (oEvent) {
          var oFilterBar = this._getFilterBarControl();
          if (oFilterBar) {
            var oInternalModelContext = this.getView().getBindingContext("internal");
            // Pending filters into FilterBar to be used for custom views
            this.onPendingFilters();
            var appliedFiltersText = oFilterBar.getAssignedFiltersText().filtersText;
            var appliedFilterBinding = ManagedObject.bindingParser(appliedFiltersText);
            if (appliedFilterBinding) {
              var _this$getView$byId;
              (_this$getView$byId = this.getView().byId("fe::appliedFiltersText")) === null || _this$getView$byId === void 0 ? void 0 : _this$getView$byId.bindText(appliedFilterBinding);
            } else {
              var _this$getView$byId2;
              (_this$getView$byId2 = this.getView().byId("fe::appliedFiltersText")) === null || _this$getView$byId2 === void 0 ? void 0 : _this$getView$byId2.setText(appliedFiltersText);
            }
            if (oEvent.getParameter("conditionsBased")) {
              oInternalModelContext.setProperty("hasPendingFilters", true);
            }
          }
        },
        onVariantSelected: function (oEvent) {
          var _this2 = this;
          var oVM = oEvent.getSource();
          var currentVariantKey = oEvent.getParameter("key");
          var oMultiModeControl = this._getMultiModeControl();
          if (oMultiModeControl && !(oVM !== null && oVM !== void 0 && oVM.getParent().isA("sap.ui.mdc.ActionToolbar"))) {
            //Not a Control Variant
            oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.invalidateContent();
            oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.setFreezeContent(true);
          }

          // setTimeout cause the variant needs to be applied before judging the auto search or updating the app state
          setTimeout(function () {
            if (_this2._shouldAutoTriggerSearch(oVM)) {
              // the app state will be updated via onSearch handler
              return _this2._getFilterBarControl().triggerSearch();
            } else if (!_this2._getApplyAutomaticallyOnVariant(oVM, currentVariantKey)) {
              _this2.getExtensionAPI().updateAppState();
            }
          }, 0);
        },
        onVariantSaved: function () {
          var _this3 = this;
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save!!!
          setTimeout(function () {
            _this3.getExtensionAPI().updateAppState();
          }, 1000);
        },
        onSearch: function () {
          var _this4 = this;
          var oFilterBar = this._getFilterBarControl();
          var oInternalModelContext = this.getView().getBindingContext("internal");
          var oMdcChart = this.getChartControl();
          var bHideDraft = FilterUtils.getEditStateIsHideDraft(oFilterBar.getConditions());
          oInternalModelContext.setProperty("hasPendingFilters", false);
          oInternalModelContext.setProperty("hideDraftInfo", bHideDraft);
          if (!this._getMultiModeControl()) {
            this._updateALPNotApplicableFields(oInternalModelContext, oFilterBar);
          }
          if (oMdcChart) {
            // disable bound actions TODO: this clears everything for the chart?
            oMdcChart.getBindingContext("internal").setProperty("", {});
            var oPageInternalModelContext = oMdcChart.getBindingContext("pageInternal");
            var sTemplateContentView = oPageInternalModelContext.getProperty("".concat(oPageInternalModelContext.getPath(), "/alpContentView"));
            if (sTemplateContentView === TemplateContentView.Chart) {
              this.hasPendingChartChanges = true;
            }
            if (sTemplateContentView === TemplateContentView.Table) {
              this.hasPendingTableChanges = true;
            }
          }
          // store filter bar conditions to use later while navigation
          StateUtil.retrieveExternalState(oFilterBar).then(function (oExternalState) {
            _this4.filterBarConditions = oExternalState.filter;
          }).catch(function (oError) {
            Log.error("Error while retrieving the external state", oError);
          });
          if (this.getView().getViewData().liveMode === false) {
            this.getExtensionAPI().updateAppState();
          }
          if (system.phone) {
            var oDynamicPage = this._getDynamicListReportControl();
            oDynamicPage.setHeaderExpanded(false);
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound: function (oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onChartSelectionChanged: function (oEvent) {
          var oMdcChart = oEvent.getSource().getContent(),
            oTable = this._getTable(),
            aData = oEvent.getParameter("data"),
            oInternalModelContext = this.getView().getBindingContext("internal");
          if (aData) {
            // update action buttons enablement / disablement
            ChartRuntime.fnUpdateChart(oEvent);
            // update selections on selection or deselection
            ChartUtils.setChartFilters(oMdcChart);
          }
          var sTemplateContentView = oInternalModelContext.getProperty("".concat(oInternalModelContext.getPath(), "/alpContentView"));
          if (sTemplateContentView === TemplateContentView.Chart) {
            this.hasPendingChartChanges = true;
          } else if (oTable) {
            oTable.rebind();
            this.hasPendingChartChanges = false;
          }
        },
        onSegmentedButtonPressed: function (oEvent) {
          var sSelectedKey = oEvent.mParameters.key ? oEvent.mParameters.key : null;
          var oInternalModelContext = this.getView().getBindingContext("internal");
          oInternalModelContext.setProperty("alpContentView", sSelectedKey);
          var oChart = this.getChartControl();
          var oTable = this._getTable();
          var oSegmentedButtonDelegate = {
            onAfterRendering: function () {
              var aItems = oSegmentedButton.getItems();
              aItems.forEach(function (oItem) {
                if (oItem.getKey() === sSelectedKey) {
                  oItem.focus();
                }
              });
              oSegmentedButton.removeEventDelegate(oSegmentedButtonDelegate);
            }
          };
          var oSegmentedButton = sSelectedKey === TemplateContentView.Table ? this._getSegmentedButton("Table") : this._getSegmentedButton("Chart");
          if (oSegmentedButton !== oEvent.getSource()) {
            oSegmentedButton.addEventDelegate(oSegmentedButtonDelegate);
          }
          switch (sSelectedKey) {
            case TemplateContentView.Table:
              this._updateTable(oTable);
              break;
            case TemplateContentView.Chart:
              this._updateChart(oChart);
              break;
            case TemplateContentView.Hybrid:
              this._updateTable(oTable);
              this._updateChart(oChart);
              break;
            default:
              break;
          }
          this.getExtensionAPI().updateAppState();
        },
        onFiltersSegmentedButtonPressed: function (oEvent) {
          var isCompact = oEvent.getParameter("key") === "Compact";
          this._getFilterBarControl().setVisible(isCompact);
          this._getVisualFilterBarControl().setVisible(!isCompact);
        },
        onStateChange: function () {
          this.getExtensionAPI().updateAppState();
        },
        onDynamicPageTitleStateChanged: function (oEvent) {
          var filterBar = this._getFilterBarControl();
          if (filterBar && filterBar.getSegmentedButton()) {
            if (oEvent.getParameter("isExpanded")) {
              filterBar.getSegmentedButton().setVisible(true);
            } else {
              filterBar.getSegmentedButton().setVisible(false);
            }
          }
        }
      };
      _this.formatters = {
        setALPControlMessageStrip: function (aIgnoredFields, bIsChart, oApplySupported) {
          var sText = "";
          bIsChart = bIsChart === "true" || bIsChart === true;
          var oFilterBar = this._getFilterBarControl();
          if (oFilterBar && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && bIsChart) {
            var aIgnoredLabels = MessageStrip.getLabels(aIgnoredFields, oFilterBar.data("entityType"), oFilterBar, this.oResourceBundle);
            var bIsSearchIgnored = !oApplySupported.enableSearch;
            sText = bIsChart ? MessageStrip.getALPText(aIgnoredLabels, oFilterBar, bIsSearchIgnored) : MessageStrip.getText(aIgnoredLabels, oFilterBar, "", DelegateUtil.getLocalizedText);
            return sText;
          }
        }
      };
      return _this;
    }
    var _proto = ListReportController.prototype;
    _proto.getExtensionAPI = function getExtensionAPI() {
      if (!this.extensionAPI) {
        this.extensionAPI = new ExtensionAPI(this);
      }
      return this.extensionAPI;
    };
    _proto.onInit = function onInit() {
      PageController.prototype.onInit.apply(this);
      var oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext.setProperty("hasPendingFilters", true);
      oInternalModelContext.setProperty("hideDraftInfo", false);
      oInternalModelContext.setProperty("uom", {});
      oInternalModelContext.setProperty("scalefactor", {});
      oInternalModelContext.setProperty("scalefactorNumber", {});
      oInternalModelContext.setProperty("currency", {});
      if (this._hasMultiVisualizations()) {
        var alpContentView = this._getDefaultPath();
        if (!system.desktop && alpContentView === TemplateContentView.Hybrid) {
          alpContentView = TemplateContentView.Chart;
        }
        oInternalModelContext.setProperty("alpContentView", alpContentView);
      }

      // Store conditions from filter bar
      // this is later used before navigation to get conditions applied on the filter bar
      this.filterBarConditions = {};

      // As AppStateHandler.applyAppState triggers a navigation we want to make sure it will
      // happen after the routeMatch event has been processed (otherwise the router gets broken)
      this.getAppComponent().getRouterProxy().waitForRouteMatchBeforeNavigation();

      // Configure the initial load settings
      this._setInitLoad();
    };
    _proto.onExit = function onExit() {
      delete this.filterBarConditions;
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
    };
    _proto._onAfterBinding = function _onAfterBinding() {
      var _this5 = this;
      var aTables = this._getControls("table");
      if (EditState.isEditStateDirty()) {
        var _this$_getMultiModeCo, _this$_getTable;
        (_this$_getMultiModeCo = this._getMultiModeControl()) === null || _this$_getMultiModeCo === void 0 ? void 0 : _this$_getMultiModeCo.invalidateContent();
        var oTableBinding = (_this$_getTable = this._getTable()) === null || _this$_getTable === void 0 ? void 0 : _this$_getTable.getRowBinding();
        if (oTableBinding) {
          if (CommonUtils.getAppComponent(this.getView())._isFclEnabled()) {
            // there is an issue if we use a timeout with a kept alive context used on another page
            oTableBinding.refresh();
          } else {
            if (!this.sUpdateTimer) {
              this.sUpdateTimer = setTimeout(function () {
                oTableBinding.refresh();
                delete _this5.sUpdateTimer;
              }, 0);
            }

            // Update action enablement and visibility upon table data update.
            var fnUpdateTableActions = function () {
              _this5._updateTableActions(aTables);
              oTableBinding.detachDataReceived(fnUpdateTableActions);
            };
            oTableBinding.attachDataReceived(fnUpdateTableActions);
          }
        }
        EditState.setEditStateProcessed();
      }
      if (!this.sUpdateTimer) {
        this._updateTableActions(aTables);
      }
      this.pageReady.waitFor(this.getAppComponent().getAppStateHandler().applyAppState());
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      PageController.prototype.onBeforeRendering.apply(this);
    };
    _proto.onAfterRendering = function onAfterRendering() {
      var _this6 = this;
      this.getView().getModel("sap.fe.i18n").getResourceBundle().then(function (response) {
        _this6.oResourceBundle = response;
        var aTables = _this6._getControls();
        var sEntitySet = _this6.getView().getViewData().entitySet;
        var sText = CommonUtils.getTranslatedText("T_TABLE_AND_CHART_NO_DATA_TEXT", _this6.oResourceBundle, undefined, sEntitySet);
        aTables.forEach(function (oTable) {
          oTable.setNoData(sText);
        });
      }).catch(function (oError) {
        Log.error("Error while retrieving the resource bundle", oError);
      });
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      if (mParameters.forceFocus) {
        this._setInitialFocus();
      }
      // Remove the handler on back navigation that displays Draft confirmation
      this.getAppComponent().getShellServices().setBackNavigation(undefined);
    }

    /**
     * Method called when the content of a list report view needs to be refreshed.
     * This happens either when there is a change on the FilterBar and the search is triggered,
     * or when a tab with custom content is selected.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @param mParameters Map containing the filter conditions of the FilterBar, the currentTabID
     * and the view refresh cause (tabChanged or search).
     * The map looks like this:
     * <code><pre>
     * 	{
     * 		filterConditions: {
     * 			Country: [
     * 				{
     * 					operator: "EQ"
     *					validated: "NotValidated"
     *					values: ["Germany", ...]
     * 				},
     * 				...
     * 			]
     * 			...
     * 		},
     *		currentTabId: "fe::CustomTab::tab1",
     *		refreshCause: "tabChanged" | "search"
     *	}
     * </pre></code>
     * @public
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onViewNeedsRefresh = function onViewNeedsRefresh(mParameters) {
      /* To be overriden */
    }

    /**
     * Method called when a filter or search value has been changed in the FilterBar,
     * but has not been validated yet by the end user (with the 'Go' or 'Search' button).
     * Typically, the content of the current tab is greyed out until the filters are validated.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @public
     */;
    _proto.onPendingFilters = function onPendingFilters() {
      /* To be overriden */
    };
    _proto.getCurrentEntitySet = function getCurrentEntitySet() {
      var _this$_getTable2;
      return (_this$_getTable2 = this._getTable()) === null || _this$_getTable2 === void 0 ? void 0 : _this$_getTable2.data("targetCollectionPath").slice(1);
    }

    /**
     * This method initiates the update of the enabled state of the DataFieldForAction and the visible state of the DataFieldForIBN buttons.
     *
     * @param aTables Array of tables in the list report
     * @private
     */;
    _proto._updateTableActions = function _updateTableActions(aTables) {
      var aIBNActions = [];
      aTables.forEach(function (oTable) {
        aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
        // Update 'enabled' property of DataFieldForAction buttons on table toolbar
        // The same is also performed on Table selectionChange event
        var oInternalModelContext = oTable.getBindingContext("internal"),
          oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
          aSelectedContexts = oTable.getSelectedContexts();
        oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
        oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
        TableHelper.handleTableDeleteEnablementForSideEffects(oTable, oInternalModelContext);
        ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
      });
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
    }

    /**
     * This method scrolls to a specific row on all the available tables.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_scrollTablesToRow
     * @param sRowPath The path of the table row context to be scrolled to
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      this._getControls("table").forEach(function (oTable) {
        TableScroller.scrollTableToRow(oTable, sRowPath);
      });
    }

    /**
     * This method set the initial focus within the List Report according to the UX guide lines.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_setInitialFocus
     */;
    _proto._setInitialFocus = function _setInitialFocus() {
      var dynamicPage = this._getDynamicListReportControl(),
        isHeaderExpanded = dynamicPage.getHeaderExpanded(),
        filterBar = this._getFilterBarControl();
      if (filterBar) {
        if (isHeaderExpanded) {
          //Enabling mandatory filter fields message dialog
          if (!filterBar.getShowMessages()) {
            filterBar.setShowMessages(true);
          }
          var firstEmptyMandatoryField = filterBar.getFilterItems().find(function (oFilterItem) {
            return oFilterItem.getRequired() && oFilterItem.getConditions().length === 0;
          });
          //Focusing on the first empty mandatory filter field, or on the first filter field if the table data is loaded
          if (firstEmptyMandatoryField) {
            firstEmptyMandatoryField.focus();
          } else if (this._isInitLoadEnabled()) {
            filterBar.getFilterItems()[0].focus();
          } else {
            //Focusing on the Go button
            this.getView().byId("".concat(this._getFilterBarControlId(), "-btnSearch")).focus();
          }
        } else if (this._isInitLoadEnabled()) {
          var _this$_getTable3;
          (_this$_getTable3 = this._getTable()) === null || _this$_getTable3 === void 0 ? void 0 : _this$_getTable3.focusRow(0);
        }
      } else {
        var _this$_getTable4;
        (_this$_getTable4 = this._getTable()) === null || _this$_getTable4 === void 0 ? void 0 : _this$_getTable4.focusRow(0);
      }
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      var oManifestEntry = this.getAppComponent().getManifestEntry("sap.app");
      return {
        title: oManifestEntry.title,
        subtitle: oManifestEntry.appSubTitle || "",
        intent: "",
        icon: ""
      };
    };
    _proto._getFilterBarControl = function _getFilterBarControl() {
      return this.getView().byId(this._getFilterBarControlId());
    };
    _proto._getDynamicListReportControl = function _getDynamicListReportControl() {
      return this.getView().byId(this._getDynamicListReportControlId());
    };
    _proto._getAdaptationFilterBarControl = function _getAdaptationFilterBarControl() {
      // If the adaptation filter bar is part of the DOM tree, the "Adapt Filter" dialog is open,
      // and we return the adaptation filter bar as an active control (visible for the user)
      var adaptationFilterBar = this._getFilterBarControl().getInbuiltFilter();
      return adaptationFilterBar !== null && adaptationFilterBar !== void 0 && adaptationFilterBar.getParent() ? adaptationFilterBar : undefined;
    };
    _proto._getSegmentedButton = function _getSegmentedButton(sControl) {
      var _ref;
      var sSegmentedButtonId = (_ref = sControl === "Chart" ? this.getChartControl() : this._getTable()) === null || _ref === void 0 ? void 0 : _ref.data("segmentedButtonId");
      return this.getView().byId(sSegmentedButtonId);
    };
    _proto._getControlFromPageModelProperty = function _getControlFromPageModelProperty(sPath) {
      var _this$_getPageModel;
      var controlId = (_this$_getPageModel = this._getPageModel()) === null || _this$_getPageModel === void 0 ? void 0 : _this$_getPageModel.getProperty(sPath);
      return controlId && this.getView().byId(controlId);
    };
    _proto._getPageModel = function _getPageModel() {
      var pageComponent = Component.getOwnerComponentFor(this.getView());
      return pageComponent.getModel("_pageModel");
    };
    _proto._getDynamicListReportControlId = function _getDynamicListReportControlId() {
      var _this$_getPageModel2;
      return ((_this$_getPageModel2 = this._getPageModel()) === null || _this$_getPageModel2 === void 0 ? void 0 : _this$_getPageModel2.getProperty("/dynamicListReportId")) || "";
    };
    _proto._getFilterBarControlId = function _getFilterBarControlId() {
      var _this$_getPageModel3;
      return ((_this$_getPageModel3 = this._getPageModel()) === null || _this$_getPageModel3 === void 0 ? void 0 : _this$_getPageModel3.getProperty("/filterBarId")) || "";
    };
    _proto.getChartControl = function getChartControl() {
      return this._getControlFromPageModelProperty("/singleChartId");
    };
    _proto._getVisualFilterBarControl = function _getVisualFilterBarControl() {
      var sVisualFilterBarId = StableIdHelper.generate(["visualFilter", this._getFilterBarControlId()]);
      return sVisualFilterBarId && this.getView().byId(sVisualFilterBarId);
    };
    _proto._getFilterBarVariantControl = function _getFilterBarVariantControl() {
      return this._getControlFromPageModelProperty("/variantManagement/id");
    };
    _proto._getMultiModeControl = function _getMultiModeControl() {
      return this.getView().byId("fe::TabMultipleMode::Control");
    };
    _proto._getTable = function _getTable() {
      if (this._isMultiMode()) {
        var _this$_getMultiModeCo2, _this$_getMultiModeCo3;
        var oControl = (_this$_getMultiModeCo2 = this._getMultiModeControl()) === null || _this$_getMultiModeCo2 === void 0 ? void 0 : (_this$_getMultiModeCo3 = _this$_getMultiModeCo2.getSelectedInnerControl()) === null || _this$_getMultiModeCo3 === void 0 ? void 0 : _this$_getMultiModeCo3.content;
        return oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Table") ? oControl : undefined;
      } else {
        return this._getControlFromPageModelProperty("/singleTableId");
      }
    };
    _proto._getControls = function _getControls(sKey) {
      var _this7 = this;
      if (this._isMultiMode()) {
        var aControls = [];
        var oTabMultiMode = this._getMultiModeControl().content;
        oTabMultiMode.getItems().forEach(function (oItem) {
          var oControl = _this7.getView().byId(oItem.getKey());
          if (oControl && sKey) {
            if (oItem.getKey().indexOf("fe::".concat(sKey)) > -1) {
              aControls.push(oControl);
            }
          } else if (oControl !== undefined && oControl !== null) {
            aControls.push(oControl);
          }
        });
        return aControls;
      } else if (sKey === "Chart") {
        var oChart = this.getChartControl();
        return oChart ? [oChart] : [];
      } else {
        var oTable = this._getTable();
        return oTable ? [oTable] : [];
      }
    };
    _proto._getDefaultPath = function _getDefaultPath() {
      var _this$_getPageModel4;
      var defaultPath = ListReportTemplating.getDefaultPath(((_this$_getPageModel4 = this._getPageModel()) === null || _this$_getPageModel4 === void 0 ? void 0 : _this$_getPageModel4.getProperty("/views")) || []);
      switch (defaultPath) {
        case "primary":
          return TemplateContentView.Chart;
        case "secondary":
          return TemplateContentView.Table;
        case "both":
        default:
          return TemplateContentView.Hybrid;
      }
    }

    /**
     * Method to know if ListReport is configured with Multiple Table mode.
     *
     * @function
     * @name _isMultiMode
     * @returns Is Multiple Table mode set?
     */;
    _proto._isMultiMode = function _isMultiMode() {
      var _this$_getPageModel5;
      return !!((_this$_getPageModel5 = this._getPageModel()) !== null && _this$_getPageModel5 !== void 0 && _this$_getPageModel5.getProperty("/multiViewsControl"));
    }

    /**
     * Method to know if ListReport is configured to load data at start up.
     *
     * @function
     * @name _isInitLoadDisabled
     * @returns Is InitLoad enabled?
     */;
    _proto._isInitLoadEnabled = function _isInitLoadEnabled() {
      var initLoadMode = this.getView().getViewData().initialLoad;
      return initLoadMode === InitialLoadMode.Enabled;
    };
    _proto._hasMultiVisualizations = function _hasMultiVisualizations() {
      var _this$_getPageModel6;
      return (_this$_getPageModel6 = this._getPageModel()) === null || _this$_getPageModel6 === void 0 ? void 0 : _this$_getPageModel6.getProperty("/hasMultiVisualizations");
    }

    /**
     * Method to suspend search on the filter bar. The initial loading of data is disabled based on the manifest configuration InitLoad - Disabled/Auto.
     * It is enabled later when the view state is set, when it is possible to realize if there are default filters.
     */;
    _proto._disableInitLoad = function _disableInitLoad() {
      var filterBar = this._getFilterBarControl();
      // check for filter bar hidden
      if (filterBar) {
        filterBar.setSuspendSelection(true);
      }
    }

    /**
     * Method called by flex to determine if the applyAutomatically setting on the variant is valid.
     * Called only for Standard Variant and only when there is display text set for applyAutomatically (FE only sets it for Auto).
     *
     * @returns Boolean true if data should be loaded automatically, false otherwise
     */;
    _proto._applyAutomaticallyOnStandardVariant = function _applyAutomaticallyOnStandardVariant() {
      // We always return false and take care of it when view state is set
      return false;
    }

    /**
     * Configure the settings for initial load based on
     * - manifest setting initLoad - Enabled/Disabled/Auto
     * - user's setting of applyAutomatically on variant
     * - if there are default filters
     * We disable the filter bar search at the beginning and enable it when view state is set.
     */;
    _proto._setInitLoad = function _setInitLoad() {
      // if initLoad is Disabled or Auto, switch off filter bar search temporarily at start
      if (!this._isInitLoadEnabled()) {
        this._disableInitLoad();
      }
      // set hook for flex for when standard variant is set (at start or by user at runtime)
      // required to override the user setting 'apply automatically' behaviour if there are no filters
      var variantManagementId = ListReportTemplating.getVariantBackReference(this.getView().getViewData(), this._getPageModel());
      var variantManagement = variantManagementId && this.getView().byId(variantManagementId);
      if (variantManagement) {
        variantManagement.registerApplyAutomaticallyOnStandardVariant(this._applyAutomaticallyOnStandardVariant.bind(this));
      }
    };
    _proto._setShareModel = function _setShareModel() {
      // TODO: deactivated for now - currently there is no _templPriv anymore, to be discussed
      // this method is currently not called anymore from the init method

      var fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      //var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
      //var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";

      //shareModel: Holds all the sharing relevant information and info used in XML view
      var oShareInfo = {
        bookmarkTitle: document.title,
        //To name the bookmark according to the app title.
        bookmarkCustomUrl: function () {
          var sHash = hasher.getHash();
          return sHash ? "#".concat(sHash) : window.location.href;
        },
        /*
        				To be activated once the FLP shows the count - see comment above
        				bookmarkServiceUrl: function() {
        					//var oTable = oTable.getInnerTable(); oTable is already the sap.fe table (but not the inner one)
        					// we should use table.getListBindingInfo instead of the binding
        					var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
        					return oBinding ? fnGetDownloadUrl(oBinding) : "";
        				},*/
        isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
      };
      var oTemplatePrivateModel = this.getOwnerComponent().getModel("_templPriv");
      oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
    }

    /**
     * Method to update the local UI model of the page with the fields that are not applicable to the filter bar (this is specific to the ALP scenario).
     *
     * @param oInternalModelContext The internal model context
     * @param oFilterBar MDC filter bar
     */;
    _proto._updateALPNotApplicableFields = function _updateALPNotApplicableFields(oInternalModelContext, oFilterBar) {
      var mCache = {};
      var ignoredFields = {},
        aTables = this._getControls("table"),
        aCharts = this._getControls("Chart");
      if (!aTables.length || !aCharts.length) {
        // If there's not a table and a chart, we're not in the ALP case
        return;
      }

      // For the moment, there's nothing for tables...
      aCharts.forEach(function (oChart) {
        var sChartEntityPath = oChart.data("targetCollectionPath"),
          sChartEntitySet = sChartEntityPath.slice(1),
          sCacheKey = "".concat(sChartEntitySet, "Chart");
        if (!mCache[sCacheKey]) {
          mCache[sCacheKey] = FilterUtils.getNotApplicableFilters(oFilterBar, oChart);
        }
        ignoredFields[sCacheKey] = mCache[sCacheKey];
      });
      oInternalModelContext.setProperty("controls/ignoredFields", ignoredFields);
    };
    _proto._isFilterBarHidden = function _isFilterBarHidden() {
      return this.getView().getViewData().hideFilterBar;
    };
    _proto._getApplyAutomaticallyOnVariant = function _getApplyAutomaticallyOnVariant(VariantManagement, key) {
      if (!VariantManagement || !key) {
        return false;
      }
      var variants = VariantManagement.getVariants();
      var currentVariant = variants.find(function (variant) {
        return variant && variant.key === key;
      });
      return currentVariant && currentVariant.executeOnSelect || false;
    };
    _proto._shouldAutoTriggerSearch = function _shouldAutoTriggerSearch(oVM) {
      if (this.getView().getViewData().initialLoad === InitialLoadMode.Auto && (!oVM || oVM.getStandardVariantKey() === oVM.getCurrentVariantKey())) {
        var oFilterBar = this._getFilterBarControl();
        if (oFilterBar) {
          var oConditions = oFilterBar.getConditions();
          for (var sKey in oConditions) {
            // ignore filters starting with $ (e.g. $search, $editState)
            if (!sKey.startsWith("$") && Array.isArray(oConditions[sKey]) && oConditions[sKey].length) {
              // load data as per user's setting of applyAutomatically on the variant
              var standardVariant = oVM.getVariants().find(function (variant) {
                return variant.key === oVM.getCurrentVariantKey();
              });
              return standardVariant && standardVariant.executeOnSelect;
            }
          }
        }
      }
      return false;
    };
    _proto._updateTable = function _updateTable(oTable) {
      if (!oTable.isTableBound() || this.hasPendingChartChanges) {
        oTable.rebind();
        this.hasPendingChartChanges = false;
      }
    };
    _proto._updateChart = function _updateChart(oChart) {
      var oInnerChart = oChart.getControlDelegate()._getChart(oChart);
      if (!(oInnerChart && oInnerChart.isBound("data")) || this.hasPendingTableChanges) {
        oChart.getControlDelegate().rebind(oChart, oInnerChart.getBindingInfo("data"));
        this.hasPendingTableChanges = false;
      }
    };
    return ListReportController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "sideEffects", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "editFlow", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "kpiManagement", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onViewNeedsRefresh", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onViewNeedsRefresh"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPendingFilters", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "onPendingFilters"), _class2.prototype)), _class2)) || _class);
  return ListReportController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiQ29yZUxpYnJhcnkiLCJJbml0aWFsTG9hZE1vZGUiLCJMaXN0UmVwb3J0Q29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJJbnRlcm5hbFJvdXRpbmciLCJvdmVycmlkZSIsIm9uQWZ0ZXJCaW5kaW5nIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfb25BZnRlckJpbmRpbmciLCJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldEVudGl0eVNldCIsImJhc2UiLCJnZXRDdXJyZW50RW50aXR5U2V0IiwiU2lkZUVmZmVjdHMiLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSIsIlNoYXJlIiwiU2hhcmVPdmVycmlkZXMiLCJFZGl0RmxvdyIsIkVkaXRGbG93T3ZlcnJpZGVzIiwiVmlld1N0YXRlIiwiVmlld1N0YXRlT3ZlcnJpZGVzIiwiS1BJTWFuYWdlbWVudCIsIlBsYWNlaG9sZGVyIiwiTWFzc0VkaXQiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsInByaXZhdGVFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsImhhbmRsZXJzIiwib25GaWx0ZXJTZWFyY2giLCJfZ2V0RmlsdGVyQmFyQ29udHJvbCIsInRyaWdnZXJTZWFyY2giLCJvbkZpbHRlcnNDaGFuZ2VkIiwib0V2ZW50Iiwib0ZpbHRlckJhciIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib25QZW5kaW5nRmlsdGVycyIsImFwcGxpZWRGaWx0ZXJzVGV4dCIsImdldEFzc2lnbmVkRmlsdGVyc1RleHQiLCJmaWx0ZXJzVGV4dCIsImFwcGxpZWRGaWx0ZXJCaW5kaW5nIiwiTWFuYWdlZE9iamVjdCIsImJpbmRpbmdQYXJzZXIiLCJieUlkIiwiYmluZFRleHQiLCJzZXRUZXh0IiwiZ2V0UGFyYW1ldGVyIiwic2V0UHJvcGVydHkiLCJvblZhcmlhbnRTZWxlY3RlZCIsIm9WTSIsImdldFNvdXJjZSIsImN1cnJlbnRWYXJpYW50S2V5Iiwib011bHRpTW9kZUNvbnRyb2wiLCJfZ2V0TXVsdGlNb2RlQ29udHJvbCIsImdldFBhcmVudCIsImlzQSIsImludmFsaWRhdGVDb250ZW50Iiwic2V0RnJlZXplQ29udGVudCIsInNldFRpbWVvdXQiLCJfc2hvdWxkQXV0b1RyaWdnZXJTZWFyY2giLCJfZ2V0QXBwbHlBdXRvbWF0aWNhbGx5T25WYXJpYW50IiwiZ2V0RXh0ZW5zaW9uQVBJIiwidXBkYXRlQXBwU3RhdGUiLCJvblZhcmlhbnRTYXZlZCIsIm9uU2VhcmNoIiwib01kY0NoYXJ0IiwiZ2V0Q2hhcnRDb250cm9sIiwiYkhpZGVEcmFmdCIsIkZpbHRlclV0aWxzIiwiZ2V0RWRpdFN0YXRlSXNIaWRlRHJhZnQiLCJnZXRDb25kaXRpb25zIiwiX3VwZGF0ZUFMUE5vdEFwcGxpY2FibGVGaWVsZHMiLCJvUGFnZUludGVybmFsTW9kZWxDb250ZXh0Iiwic1RlbXBsYXRlQ29udGVudFZpZXciLCJnZXRQcm9wZXJ0eSIsImdldFBhdGgiLCJDaGFydCIsImhhc1BlbmRpbmdDaGFydENoYW5nZXMiLCJUYWJsZSIsImhhc1BlbmRpbmdUYWJsZUNoYW5nZXMiLCJTdGF0ZVV0aWwiLCJyZXRyaWV2ZUV4dGVybmFsU3RhdGUiLCJ0aGVuIiwib0V4dGVybmFsU3RhdGUiLCJmaWx0ZXJCYXJDb25kaXRpb25zIiwiZmlsdGVyIiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImdldFZpZXdEYXRhIiwibGl2ZU1vZGUiLCJzeXN0ZW0iLCJwaG9uZSIsIm9EeW5hbWljUGFnZSIsIl9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2wiLCJzZXRIZWFkZXJFeHBhbmRlZCIsIm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZCIsIm9Db250cm9sbGVyIiwic091dGJvdW5kVGFyZ2V0Iiwib0NvbnRleHQiLCJzQ3JlYXRlUGF0aCIsIl9pbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJvbkNoYXJ0U2VsZWN0aW9uQ2hhbmdlZCIsImdldENvbnRlbnQiLCJvVGFibGUiLCJfZ2V0VGFibGUiLCJhRGF0YSIsIkNoYXJ0UnVudGltZSIsImZuVXBkYXRlQ2hhcnQiLCJDaGFydFV0aWxzIiwic2V0Q2hhcnRGaWx0ZXJzIiwicmViaW5kIiwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwic1NlbGVjdGVkS2V5IiwibVBhcmFtZXRlcnMiLCJrZXkiLCJvQ2hhcnQiLCJvU2VnbWVudGVkQnV0dG9uRGVsZWdhdGUiLCJvbkFmdGVyUmVuZGVyaW5nIiwiYUl0ZW1zIiwib1NlZ21lbnRlZEJ1dHRvbiIsImdldEl0ZW1zIiwiZm9yRWFjaCIsIm9JdGVtIiwiZ2V0S2V5IiwiZm9jdXMiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiX2dldFNlZ21lbnRlZEJ1dHRvbiIsImFkZEV2ZW50RGVsZWdhdGUiLCJfdXBkYXRlVGFibGUiLCJfdXBkYXRlQ2hhcnQiLCJIeWJyaWQiLCJvbkZpbHRlcnNTZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwiaXNDb21wYWN0Iiwic2V0VmlzaWJsZSIsIl9nZXRWaXN1YWxGaWx0ZXJCYXJDb250cm9sIiwib25TdGF0ZUNoYW5nZSIsIm9uRHluYW1pY1BhZ2VUaXRsZVN0YXRlQ2hhbmdlZCIsImZpbHRlckJhciIsImdldFNlZ21lbnRlZEJ1dHRvbiIsImZvcm1hdHRlcnMiLCJzZXRBTFBDb250cm9sTWVzc2FnZVN0cmlwIiwiYUlnbm9yZWRGaWVsZHMiLCJiSXNDaGFydCIsIm9BcHBseVN1cHBvcnRlZCIsInNUZXh0IiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwiYUlnbm9yZWRMYWJlbHMiLCJNZXNzYWdlU3RyaXAiLCJnZXRMYWJlbHMiLCJkYXRhIiwib1Jlc291cmNlQnVuZGxlIiwiYklzU2VhcmNoSWdub3JlZCIsImVuYWJsZVNlYXJjaCIsImdldEFMUFRleHQiLCJnZXRUZXh0IiwiRGVsZWdhdGVVdGlsIiwiZ2V0TG9jYWxpemVkVGV4dCIsImV4dGVuc2lvbkFQSSIsIkV4dGVuc2lvbkFQSSIsIm9uSW5pdCIsIlBhZ2VDb250cm9sbGVyIiwicHJvdG90eXBlIiwiYXBwbHkiLCJfaGFzTXVsdGlWaXN1YWxpemF0aW9ucyIsImFscENvbnRlbnRWaWV3IiwiX2dldERlZmF1bHRQYXRoIiwiZGVza3RvcCIsImdldEFwcENvbXBvbmVudCIsImdldFJvdXRlclByb3h5Iiwid2FpdEZvclJvdXRlTWF0Y2hCZWZvcmVOYXZpZ2F0aW9uIiwiX3NldEluaXRMb2FkIiwib25FeGl0IiwiZGVzdHJveSIsImFUYWJsZXMiLCJfZ2V0Q29udHJvbHMiLCJFZGl0U3RhdGUiLCJpc0VkaXRTdGF0ZURpcnR5Iiwib1RhYmxlQmluZGluZyIsImdldFJvd0JpbmRpbmciLCJDb21tb25VdGlscyIsIl9pc0ZjbEVuYWJsZWQiLCJyZWZyZXNoIiwic1VwZGF0ZVRpbWVyIiwiZm5VcGRhdGVUYWJsZUFjdGlvbnMiLCJfdXBkYXRlVGFibGVBY3Rpb25zIiwiZGV0YWNoRGF0YVJlY2VpdmVkIiwiYXR0YWNoRGF0YVJlY2VpdmVkIiwic2V0RWRpdFN0YXRlUHJvY2Vzc2VkIiwicGFnZVJlYWR5Iiwid2FpdEZvciIsImdldEFwcFN0YXRlSGFuZGxlciIsImFwcGx5QXBwU3RhdGUiLCJvbkJlZm9yZVJlbmRlcmluZyIsImdldE1vZGVsIiwiZ2V0UmVzb3VyY2VCdW5kbGUiLCJyZXNwb25zZSIsInNFbnRpdHlTZXQiLCJlbnRpdHlTZXQiLCJnZXRUcmFuc2xhdGVkVGV4dCIsInVuZGVmaW5lZCIsInNldE5vRGF0YSIsIm9uUGFnZVJlYWR5IiwiZm9yY2VGb2N1cyIsIl9zZXRJbml0aWFsRm9jdXMiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0QmFja05hdmlnYXRpb24iLCJvblZpZXdOZWVkc1JlZnJlc2giLCJzbGljZSIsImFJQk5BY3Rpb25zIiwiZ2V0SUJOQWN0aW9ucyIsIm9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAiLCJKU09OIiwicGFyc2UiLCJDb21tb25IZWxwZXIiLCJwYXJzZUN1c3RvbURhdGEiLCJnZXRDdXN0b21EYXRhIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwiVGFibGVIZWxwZXIiLCJoYW5kbGVUYWJsZURlbGV0ZUVuYWJsZW1lbnRGb3JTaWRlRWZmZWN0cyIsIkFjdGlvblJ1bnRpbWUiLCJzZXRBY3Rpb25FbmFibGVtZW50IiwidXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHkiLCJfc2Nyb2xsVGFibGVzVG9Sb3ciLCJzUm93UGF0aCIsIlRhYmxlU2Nyb2xsZXIiLCJzY3JvbGxUYWJsZVRvUm93IiwiZHluYW1pY1BhZ2UiLCJpc0hlYWRlckV4cGFuZGVkIiwiZ2V0SGVhZGVyRXhwYW5kZWQiLCJnZXRTaG93TWVzc2FnZXMiLCJzZXRTaG93TWVzc2FnZXMiLCJmaXJzdEVtcHR5TWFuZGF0b3J5RmllbGQiLCJnZXRGaWx0ZXJJdGVtcyIsImZpbmQiLCJvRmlsdGVySXRlbSIsImdldFJlcXVpcmVkIiwiX2lzSW5pdExvYWRFbmFibGVkIiwiX2dldEZpbHRlckJhckNvbnRyb2xJZCIsImZvY3VzUm93IiwiX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uIiwib01hbmlmZXN0RW50cnkiLCJnZXRNYW5pZmVzdEVudHJ5IiwidGl0bGUiLCJzdWJ0aXRsZSIsImFwcFN1YlRpdGxlIiwiaW50ZW50IiwiaWNvbiIsIl9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2xJZCIsIl9nZXRBZGFwdGF0aW9uRmlsdGVyQmFyQ29udHJvbCIsImFkYXB0YXRpb25GaWx0ZXJCYXIiLCJnZXRJbmJ1aWx0RmlsdGVyIiwic0NvbnRyb2wiLCJzU2VnbWVudGVkQnV0dG9uSWQiLCJfZ2V0Q29udHJvbEZyb21QYWdlTW9kZWxQcm9wZXJ0eSIsInNQYXRoIiwiY29udHJvbElkIiwiX2dldFBhZ2VNb2RlbCIsInBhZ2VDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsInNWaXN1YWxGaWx0ZXJCYXJJZCIsIlN0YWJsZUlkSGVscGVyIiwiZ2VuZXJhdGUiLCJfZ2V0RmlsdGVyQmFyVmFyaWFudENvbnRyb2wiLCJfaXNNdWx0aU1vZGUiLCJvQ29udHJvbCIsImdldFNlbGVjdGVkSW5uZXJDb250cm9sIiwiY29udGVudCIsInNLZXkiLCJhQ29udHJvbHMiLCJvVGFiTXVsdGlNb2RlIiwiaW5kZXhPZiIsInB1c2giLCJkZWZhdWx0UGF0aCIsIkxpc3RSZXBvcnRUZW1wbGF0aW5nIiwiZ2V0RGVmYXVsdFBhdGgiLCJpbml0TG9hZE1vZGUiLCJpbml0aWFsTG9hZCIsIkVuYWJsZWQiLCJfZGlzYWJsZUluaXRMb2FkIiwic2V0U3VzcGVuZFNlbGVjdGlvbiIsIl9hcHBseUF1dG9tYXRpY2FsbHlPblN0YW5kYXJkVmFyaWFudCIsInZhcmlhbnRNYW5hZ2VtZW50SWQiLCJnZXRWYXJpYW50QmFja1JlZmVyZW5jZSIsInZhcmlhbnRNYW5hZ2VtZW50IiwicmVnaXN0ZXJBcHBseUF1dG9tYXRpY2FsbHlPblN0YW5kYXJkVmFyaWFudCIsImJpbmQiLCJfc2V0U2hhcmVNb2RlbCIsImZuR2V0VXNlciIsIk9iamVjdFBhdGgiLCJnZXQiLCJvU2hhcmVJbmZvIiwiYm9va21hcmtUaXRsZSIsImRvY3VtZW50IiwiYm9va21hcmtDdXN0b21VcmwiLCJzSGFzaCIsImhhc2hlciIsImdldEhhc2giLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJpc1NoYXJlSW5KYW1BY3RpdmUiLCJpc0phbUFjdGl2ZSIsIm9UZW1wbGF0ZVByaXZhdGVNb2RlbCIsImdldE93bmVyQ29tcG9uZW50IiwibUNhY2hlIiwiaWdub3JlZEZpZWxkcyIsImFDaGFydHMiLCJzQ2hhcnRFbnRpdHlQYXRoIiwic0NoYXJ0RW50aXR5U2V0Iiwic0NhY2hlS2V5IiwiZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMiLCJfaXNGaWx0ZXJCYXJIaWRkZW4iLCJoaWRlRmlsdGVyQmFyIiwiVmFyaWFudE1hbmFnZW1lbnQiLCJ2YXJpYW50cyIsImdldFZhcmlhbnRzIiwiY3VycmVudFZhcmlhbnQiLCJ2YXJpYW50IiwiZXhlY3V0ZU9uU2VsZWN0IiwiQXV0byIsImdldFN0YW5kYXJkVmFyaWFudEtleSIsImdldEN1cnJlbnRWYXJpYW50S2V5Iiwib0NvbmRpdGlvbnMiLCJzdGFydHNXaXRoIiwic3RhbmRhcmRWYXJpYW50IiwiaXNUYWJsZUJvdW5kIiwib0lubmVyQ2hhcnQiLCJnZXRDb250cm9sRGVsZWdhdGUiLCJfZ2V0Q2hhcnQiLCJpc0JvdW5kIiwiZ2V0QmluZGluZ0luZm8iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkxpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IE9iamVjdFBhdGggZnJvbSBcInNhcC9iYXNlL3V0aWwvT2JqZWN0UGF0aFwiO1xuaW1wb3J0IHR5cGUgRHluYW1pY1BhZ2UgZnJvbSBcInNhcC9mL0R5bmFtaWNQYWdlXCI7XG5pbXBvcnQgQWN0aW9uUnVudGltZSBmcm9tIFwic2FwL2ZlL2NvcmUvQWN0aW9uUnVudGltZVwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9FZGl0Rmxvd1wiO1xuaW1wb3J0IEludGVudEJhc2VkTmF2aWdhdGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgSW50ZXJuYWxSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbFJvdXRpbmdcIjtcbmltcG9ydCBLUElNYW5hZ2VtZW50IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9LUElNYW5hZ2VtZW50XCI7XG5pbXBvcnQgTWFzc0VkaXQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL01hc3NFZGl0XCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgU2hhcmUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1NoYXJlXCI7XG5pbXBvcnQgU2lkZUVmZmVjdHMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1NpZGVFZmZlY3RzXCI7XG5pbXBvcnQgVmlld1N0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbHMvRmlsdGVyQmFyXCI7XG5pbXBvcnQge1xuXHRkZWZpbmVVSTVDbGFzcyxcblx0ZXh0ZW5zaWJsZSxcblx0ZmluYWxFeHRlbnNpb24sXG5cdHByaXZhdGVFeHRlbnNpb24sXG5cdHB1YmxpY0V4dGVuc2lvbixcblx0dXNpbmdFeHRlbnNpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRWRpdFN0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0VkaXRTdGF0ZVwiO1xuaW1wb3J0IE1lc3NhZ2VTdHJpcCBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9NZXNzYWdlU3RyaXBcIjtcbmltcG9ydCB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCAqIGFzIFN0YWJsZUlkSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgQ29yZUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBDaGFydFJ1bnRpbWUgZnJvbSBcInNhcC9mZS9tYWNyb3MvY2hhcnQvQ2hhcnRSdW50aW1lXCI7XG5pbXBvcnQgQ2hhcnRVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydFV0aWxzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCBUYWJsZUhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUhlbHBlclwiO1xuaW1wb3J0IE11bHRpcGxlTW9kZUNvbnRyb2wgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvTGlzdFJlcG9ydC9jb250cm9scy9NdWx0aXBsZU1vZGVDb250cm9sXCI7XG5pbXBvcnQgRXh0ZW5zaW9uQVBJIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL0xpc3RSZXBvcnQvRXh0ZW5zaW9uQVBJXCI7XG5pbXBvcnQgRWRpdEZsb3dPdmVycmlkZXMgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvUm9vdENvbnRhaW5lci9vdmVycmlkZXMvRWRpdEZsb3dcIjtcbmltcG9ydCBUYWJsZVNjcm9sbGVyIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL1RhYmxlU2Nyb2xsZXJcIjtcbmltcG9ydCB0eXBlIFNlZ21lbnRlZEJ1dHRvbiBmcm9tIFwic2FwL20vU2VnbWVudGVkQnV0dG9uXCI7XG5pbXBvcnQgdHlwZSBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHsgc3lzdGVtIH0gZnJvbSBcInNhcC91aS9EZXZpY2VcIjtcbmltcG9ydCBTdGF0ZVV0aWwgZnJvbSBcInNhcC91aS9tZGMvcDEzbi9TdGF0ZVV0aWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL3Jlc291cmNlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBoYXNoZXIgZnJvbSBcInNhcC91aS90aGlyZHBhcnR5L2hhc2hlclwiO1xuaW1wb3J0IHR5cGUgeyBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgKiBhcyBMaXN0UmVwb3J0VGVtcGxhdGluZyBmcm9tIFwiLi9MaXN0UmVwb3J0VGVtcGxhdGluZ1wiO1xuaW1wb3J0IEludGVudEJhc2VkTmF2aWdhdGlvbk92ZXJyaWRlIGZyb20gXCIuL292ZXJyaWRlcy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBTaGFyZU92ZXJyaWRlcyBmcm9tIFwiLi9vdmVycmlkZXMvU2hhcmVcIjtcbmltcG9ydCBWaWV3U3RhdGVPdmVycmlkZXMgZnJvbSBcIi4vb3ZlcnJpZGVzL1ZpZXdTdGF0ZVwiO1xuXG5jb25zdCBUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gQ29yZUxpYnJhcnkuVGVtcGxhdGVDb250ZW50Vmlldyxcblx0SW5pdGlhbExvYWRNb2RlID0gQ29yZUxpYnJhcnkuSW5pdGlhbExvYWRNb2RlO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuTGlzdFJlcG9ydENvbnRyb2xsZXJcIilcbmNsYXNzIExpc3RSZXBvcnRDb250cm9sbGVyIGV4dGVuZHMgUGFnZUNvbnRyb2xsZXIge1xuXHRAdXNpbmdFeHRlbnNpb24oXG5cdFx0SW50ZXJuYWxSb3V0aW5nLm92ZXJyaWRlKHtcblx0XHRcdG9uQWZ0ZXJCaW5kaW5nOiBmdW5jdGlvbiAodGhpczogSW50ZXJuYWxSb3V0aW5nKSB7XG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIpLl9vbkFmdGVyQmluZGluZygpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0X3JvdXRpbmchOiBJbnRlcm5hbFJvdXRpbmc7XG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbi5vdmVycmlkZSh7XG5cdFx0XHRnZXRFbnRpdHlTZXQ6IGZ1bmN0aW9uICh0aGlzOiBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gKHRoaXMuYmFzZSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcikuZ2V0Q3VycmVudEVudGl0eVNldCgpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0X2ludGVudEJhc2VkTmF2aWdhdGlvbiE6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXHRAdXNpbmdFeHRlbnNpb24oU2lkZUVmZmVjdHMpXG5cdHNpZGVFZmZlY3RzITogU2lkZUVmZmVjdHM7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKEludGVudEJhc2VkTmF2aWdhdGlvbi5vdmVycmlkZShJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSkpXG5cdGludGVudEJhc2VkTmF2aWdhdGlvbiE6IEludGVudEJhc2VkTmF2aWdhdGlvbjtcblxuXHRAdXNpbmdFeHRlbnNpb24oU2hhcmUub3ZlcnJpZGUoU2hhcmVPdmVycmlkZXMpKVxuXHRzaGFyZSE6IFNoYXJlO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihFZGl0Rmxvdy5vdmVycmlkZShFZGl0Rmxvd092ZXJyaWRlcykpXG5cdGVkaXRGbG93ITogRWRpdEZsb3c7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFZpZXdTdGF0ZS5vdmVycmlkZShWaWV3U3RhdGVPdmVycmlkZXMpKVxuXHR2aWV3U3RhdGUhOiBWaWV3U3RhdGU7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKEtQSU1hbmFnZW1lbnQpXG5cdGtwaU1hbmFnZW1lbnQhOiBLUElNYW5hZ2VtZW50O1xuXHRAdXNpbmdFeHRlbnNpb24oUGxhY2Vob2xkZXIpXG5cdHBsYWNlaG9sZGVyITogUGxhY2Vob2xkZXI7XG5cdEB1c2luZ0V4dGVuc2lvbihNYXNzRWRpdClcblx0bWFzc0VkaXQhOiBNYXNzRWRpdDtcblx0cHJvdGVjdGVkIGV4dGVuc2lvbkFQST86IEV4dGVuc2lvbkFQSTtcblx0cHJpdmF0ZSBmaWx0ZXJCYXJDb25kaXRpb25zPzogYW55O1xuXHRwcml2YXRlIHNVcGRhdGVUaW1lcj86IGFueTtcblx0cHJpdmF0ZSBvUmVzb3VyY2VCdW5kbGU/OiBSZXNvdXJjZUJ1bmRsZTtcblx0cHJpdmF0ZSBoYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzPzogYm9vbGVhbjtcblx0cHJpdmF0ZSBoYXNQZW5kaW5nVGFibGVDaGFuZ2VzPzogYm9vbGVhbjtcblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0RXh0ZW5zaW9uQVBJKCk6IEV4dGVuc2lvbkFQSSB7XG5cdFx0aWYgKCF0aGlzLmV4dGVuc2lvbkFQSSkge1xuXHRcdFx0dGhpcy5leHRlbnNpb25BUEkgPSBuZXcgRXh0ZW5zaW9uQVBJKHRoaXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5leHRlbnNpb25BUEk7XG5cdH1cblxuXHRvbkluaXQoKSB7XG5cdFx0UGFnZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uSW5pdC5hcHBseSh0aGlzKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIiwgdHJ1ZSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGlkZURyYWZ0SW5mb1wiLCBmYWxzZSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwidW9tXCIsIHt9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzY2FsZWZhY3RvclwiLCB7fSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwic2NhbGVmYWN0b3JOdW1iZXJcIiwge30pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImN1cnJlbmN5XCIsIHt9KTtcblxuXHRcdGlmICh0aGlzLl9oYXNNdWx0aVZpc3VhbGl6YXRpb25zKCkpIHtcblx0XHRcdGxldCBhbHBDb250ZW50VmlldyA9IHRoaXMuX2dldERlZmF1bHRQYXRoKCk7XG5cdFx0XHRpZiAoIXN5c3RlbS5kZXNrdG9wICYmIGFscENvbnRlbnRWaWV3ID09PSBUZW1wbGF0ZUNvbnRlbnRWaWV3Lkh5YnJpZCkge1xuXHRcdFx0XHRhbHBDb250ZW50VmlldyA9IFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQ7XG5cdFx0XHR9XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJhbHBDb250ZW50Vmlld1wiLCBhbHBDb250ZW50Vmlldyk7XG5cdFx0fVxuXG5cdFx0Ly8gU3RvcmUgY29uZGl0aW9ucyBmcm9tIGZpbHRlciBiYXJcblx0XHQvLyB0aGlzIGlzIGxhdGVyIHVzZWQgYmVmb3JlIG5hdmlnYXRpb24gdG8gZ2V0IGNvbmRpdGlvbnMgYXBwbGllZCBvbiB0aGUgZmlsdGVyIGJhclxuXHRcdHRoaXMuZmlsdGVyQmFyQ29uZGl0aW9ucyA9IHt9O1xuXG5cdFx0Ly8gQXMgQXBwU3RhdGVIYW5kbGVyLmFwcGx5QXBwU3RhdGUgdHJpZ2dlcnMgYSBuYXZpZ2F0aW9uIHdlIHdhbnQgdG8gbWFrZSBzdXJlIGl0IHdpbGxcblx0XHQvLyBoYXBwZW4gYWZ0ZXIgdGhlIHJvdXRlTWF0Y2ggZXZlbnQgaGFzIGJlZW4gcHJvY2Vzc2VkIChvdGhlcndpc2UgdGhlIHJvdXRlciBnZXRzIGJyb2tlbilcblx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvdXRlclByb3h5KCkud2FpdEZvclJvdXRlTWF0Y2hCZWZvcmVOYXZpZ2F0aW9uKCk7XG5cblx0XHQvLyBDb25maWd1cmUgdGhlIGluaXRpYWwgbG9hZCBzZXR0aW5nc1xuXHRcdHRoaXMuX3NldEluaXRMb2FkKCk7XG5cdH1cblxuXHRvbkV4aXQoKSB7XG5cdFx0ZGVsZXRlIHRoaXMuZmlsdGVyQmFyQ29uZGl0aW9ucztcblx0XHRpZiAodGhpcy5leHRlbnNpb25BUEkpIHtcblx0XHRcdHRoaXMuZXh0ZW5zaW9uQVBJLmRlc3Ryb3koKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHRoaXMuZXh0ZW5zaW9uQVBJO1xuXHR9XG5cblx0X29uQWZ0ZXJCaW5kaW5nKCkge1xuXHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9nZXRDb250cm9scyhcInRhYmxlXCIpO1xuXHRcdGlmIChFZGl0U3RhdGUuaXNFZGl0U3RhdGVEaXJ0eSgpKSB7XG5cdFx0XHR0aGlzLl9nZXRNdWx0aU1vZGVDb250cm9sKCk/LmludmFsaWRhdGVDb250ZW50KCk7XG5cdFx0XHRjb25zdCBvVGFibGVCaW5kaW5nID0gdGhpcy5fZ2V0VGFibGUoKT8uZ2V0Um93QmluZGluZygpO1xuXHRcdFx0aWYgKG9UYWJsZUJpbmRpbmcpIHtcblx0XHRcdFx0aWYgKENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLmdldFZpZXcoKSkuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0Ly8gdGhlcmUgaXMgYW4gaXNzdWUgaWYgd2UgdXNlIGEgdGltZW91dCB3aXRoIGEga2VwdCBhbGl2ZSBjb250ZXh0IHVzZWQgb24gYW5vdGhlciBwYWdlXG5cdFx0XHRcdFx0b1RhYmxlQmluZGluZy5yZWZyZXNoKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLnNVcGRhdGVUaW1lcikge1xuXHRcdFx0XHRcdFx0dGhpcy5zVXBkYXRlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRcdFx0b1RhYmxlQmluZGluZy5yZWZyZXNoKCk7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLnNVcGRhdGVUaW1lcjtcblx0XHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFVwZGF0ZSBhY3Rpb24gZW5hYmxlbWVudCBhbmQgdmlzaWJpbGl0eSB1cG9uIHRhYmxlIGRhdGEgdXBkYXRlLlxuXHRcdFx0XHRcdGNvbnN0IGZuVXBkYXRlVGFibGVBY3Rpb25zID0gKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5fdXBkYXRlVGFibGVBY3Rpb25zKGFUYWJsZXMpO1xuXHRcdFx0XHRcdFx0b1RhYmxlQmluZGluZy5kZXRhY2hEYXRhUmVjZWl2ZWQoZm5VcGRhdGVUYWJsZUFjdGlvbnMpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0b1RhYmxlQmluZGluZy5hdHRhY2hEYXRhUmVjZWl2ZWQoZm5VcGRhdGVUYWJsZUFjdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlUHJvY2Vzc2VkKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnNVcGRhdGVUaW1lcikge1xuXHRcdFx0dGhpcy5fdXBkYXRlVGFibGVBY3Rpb25zKGFUYWJsZXMpO1xuXHRcdH1cblxuXHRcdHRoaXMucGFnZVJlYWR5LndhaXRGb3IodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRBcHBTdGF0ZUhhbmRsZXIoKS5hcHBseUFwcFN0YXRlKCkpO1xuXHR9XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0UGFnZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uQmVmb3JlUmVuZGVyaW5nLmFwcGx5KHRoaXMpO1xuXHR9XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHQoKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKSBhcyBQcm9taXNlPFJlc291cmNlQnVuZGxlPilcblx0XHRcdC50aGVuKChyZXNwb25zZTogYW55KSA9PiB7XG5cdFx0XHRcdHRoaXMub1Jlc291cmNlQnVuZGxlID0gcmVzcG9uc2U7XG5cdFx0XHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9nZXRDb250cm9scygpIGFzIFRhYmxlW107XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlTZXQgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVudGl0eVNldDtcblx0XHRcdFx0Y29uc3Qgc1RleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcIlRfVEFCTEVfQU5EX0NIQVJUX05PX0RBVEFfVEVYVFwiLFxuXHRcdFx0XHRcdHRoaXMub1Jlc291cmNlQnVuZGxlIGFzIFJlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRzRW50aXR5U2V0XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFUYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSkge1xuXHRcdFx0XHRcdG9UYWJsZS5zZXROb0RhdGEoc1RleHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIHJlc291cmNlIGJ1bmRsZVwiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblBhZ2VSZWFkeShtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmZvcmNlRm9jdXMpIHtcblx0XHRcdHRoaXMuX3NldEluaXRpYWxGb2N1cygpO1xuXHRcdH1cblx0XHQvLyBSZW1vdmUgdGhlIGhhbmRsZXIgb24gYmFjayBuYXZpZ2F0aW9uIHRoYXQgZGlzcGxheXMgRHJhZnQgY29uZmlybWF0aW9uXG5cdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24odW5kZWZpbmVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgb2YgYSBsaXN0IHJlcG9ydCB2aWV3IG5lZWRzIHRvIGJlIHJlZnJlc2hlZC5cblx0ICogVGhpcyBoYXBwZW5zIGVpdGhlciB3aGVuIHRoZXJlIGlzIGEgY2hhbmdlIG9uIHRoZSBGaWx0ZXJCYXIgYW5kIHRoZSBzZWFyY2ggaXMgdHJpZ2dlcmVkLFxuXHQgKiBvciB3aGVuIGEgdGFiIHdpdGggY3VzdG9tIGNvbnRlbnQgaXMgc2VsZWN0ZWQuXG5cdCAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVyd3JpdHRlbiBieSB0aGUgY29udHJvbGxlciBleHRlbnNpb24gaW4gY2FzZSBvZiBjdXN0b21pemF0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgTWFwIGNvbnRhaW5pbmcgdGhlIGZpbHRlciBjb25kaXRpb25zIG9mIHRoZSBGaWx0ZXJCYXIsIHRoZSBjdXJyZW50VGFiSURcblx0ICogYW5kIHRoZSB2aWV3IHJlZnJlc2ggY2F1c2UgKHRhYkNoYW5nZWQgb3Igc2VhcmNoKS5cblx0ICogVGhlIG1hcCBsb29rcyBsaWtlIHRoaXM6XG5cdCAqIDxjb2RlPjxwcmU+XG5cdCAqIFx0e1xuXHQgKiBcdFx0ZmlsdGVyQ29uZGl0aW9uczoge1xuXHQgKiBcdFx0XHRDb3VudHJ5OiBbXG5cdCAqIFx0XHRcdFx0e1xuXHQgKiBcdFx0XHRcdFx0b3BlcmF0b3I6IFwiRVFcIlxuXHQgKlx0XHRcdFx0XHR2YWxpZGF0ZWQ6IFwiTm90VmFsaWRhdGVkXCJcblx0ICpcdFx0XHRcdFx0dmFsdWVzOiBbXCJHZXJtYW55XCIsIC4uLl1cblx0ICogXHRcdFx0XHR9LFxuXHQgKiBcdFx0XHRcdC4uLlxuXHQgKiBcdFx0XHRdXG5cdCAqIFx0XHRcdC4uLlxuXHQgKiBcdFx0fSxcblx0ICpcdFx0Y3VycmVudFRhYklkOiBcImZlOjpDdXN0b21UYWI6OnRhYjFcIixcblx0ICpcdFx0cmVmcmVzaENhdXNlOiBcInRhYkNoYW5nZWRcIiB8IFwic2VhcmNoXCJcblx0ICpcdH1cblx0ICogPC9wcmU+PC9jb2RlPlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25WaWV3TmVlZHNSZWZyZXNoKG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHQvKiBUbyBiZSBvdmVycmlkZW4gKi9cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgY2FsbGVkIHdoZW4gYSBmaWx0ZXIgb3Igc2VhcmNoIHZhbHVlIGhhcyBiZWVuIGNoYW5nZWQgaW4gdGhlIEZpbHRlckJhcixcblx0ICogYnV0IGhhcyBub3QgYmVlbiB2YWxpZGF0ZWQgeWV0IGJ5IHRoZSBlbmQgdXNlciAod2l0aCB0aGUgJ0dvJyBvciAnU2VhcmNoJyBidXR0b24pLlxuXHQgKiBUeXBpY2FsbHksIHRoZSBjb250ZW50IG9mIHRoZSBjdXJyZW50IHRhYiBpcyBncmV5ZWQgb3V0IHVudGlsIHRoZSBmaWx0ZXJzIGFyZSB2YWxpZGF0ZWQuXG5cdCAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVyd3JpdHRlbiBieSB0aGUgY29udHJvbGxlciBleHRlbnNpb24gaW4gY2FzZSBvZiBjdXN0b21pemF0aW9uLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUGVuZGluZ0ZpbHRlcnMoKSB7XG5cdFx0LyogVG8gYmUgb3ZlcnJpZGVuICovXG5cdH1cblxuXHRnZXRDdXJyZW50RW50aXR5U2V0KCkge1xuXHRcdHJldHVybiB0aGlzLl9nZXRUYWJsZSgpPy5kYXRhKFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIikuc2xpY2UoMSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBtZXRob2QgaW5pdGlhdGVzIHRoZSB1cGRhdGUgb2YgdGhlIGVuYWJsZWQgc3RhdGUgb2YgdGhlIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgdGhlIHZpc2libGUgc3RhdGUgb2YgdGhlIERhdGFGaWVsZEZvcklCTiBidXR0b25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gYVRhYmxlcyBBcnJheSBvZiB0YWJsZXMgaW4gdGhlIGxpc3QgcmVwb3J0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfdXBkYXRlVGFibGVBY3Rpb25zKGFUYWJsZXM6IGFueSkge1xuXHRcdGxldCBhSUJOQWN0aW9uczogYW55W10gPSBbXTtcblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRhSUJOQWN0aW9ucyA9IENvbW1vblV0aWxzLmdldElCTkFjdGlvbnMob1RhYmxlLCBhSUJOQWN0aW9ucyk7XG5cdFx0XHQvLyBVcGRhdGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbiBidXR0b25zIG9uIHRhYmxlIHRvb2xiYXJcblx0XHRcdC8vIFRoZSBzYW1lIGlzIGFsc28gcGVyZm9ybWVkIG9uIFRhYmxlIHNlbGVjdGlvbkNoYW5nZSBldmVudFxuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIiksXG5cdFx0XHRcdG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRcdENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm9wZXJhdGlvbkF2YWlsYWJsZU1hcFwiKSlcblx0XHRcdFx0KSxcblx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMgPSBvVGFibGUuZ2V0U2VsZWN0ZWRDb250ZXh0cygpO1xuXG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzZWxlY3RlZENvbnRleHRzXCIsIGFTZWxlY3RlZENvbnRleHRzKTtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1wiLCBhU2VsZWN0ZWRDb250ZXh0cy5sZW5ndGgpO1xuXHRcdFx0VGFibGVIZWxwZXIuaGFuZGxlVGFibGVEZWxldGVFbmFibGVtZW50Rm9yU2lkZUVmZmVjdHMob1RhYmxlLCBvSW50ZXJuYWxNb2RlbENvbnRleHQpO1xuXHRcdFx0QWN0aW9uUnVudGltZS5zZXRBY3Rpb25FbmFibGVtZW50KG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgYVNlbGVjdGVkQ29udGV4dHMsIFwidGFibGVcIik7XG5cdFx0fSk7XG5cdFx0Q29tbW9uVXRpbHMudXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHkoYUlCTkFjdGlvbnMsIHRoaXMuZ2V0VmlldygpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBzY3JvbGxzIHRvIGEgc3BlY2lmaWMgcm93IG9uIGFsbCB0aGUgYXZhaWxhYmxlIHRhYmxlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5MaXN0UmVwb3J0Q29udHJvbGxlci5jb250cm9sbGVyI19zY3JvbGxUYWJsZXNUb1Jvd1xuXHQgKiBAcGFyYW0gc1Jvd1BhdGggVGhlIHBhdGggb2YgdGhlIHRhYmxlIHJvdyBjb250ZXh0IHRvIGJlIHNjcm9sbGVkIHRvXG5cdCAqL1xuXHRfc2Nyb2xsVGFibGVzVG9Sb3coc1Jvd1BhdGg6IHN0cmluZykge1xuXHRcdHRoaXMuX2dldENvbnRyb2xzKFwidGFibGVcIikuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRcdFRhYmxlU2Nyb2xsZXIuc2Nyb2xsVGFibGVUb1JvdyhvVGFibGUsIHNSb3dQYXRoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBzZXQgdGhlIGluaXRpYWwgZm9jdXMgd2l0aGluIHRoZSBMaXN0IFJlcG9ydCBhY2NvcmRpbmcgdG8gdGhlIFVYIGd1aWRlIGxpbmVzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0Lkxpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXIjX3NldEluaXRpYWxGb2N1c1xuXHQgKi9cblx0X3NldEluaXRpYWxGb2N1cygpIHtcblx0XHRjb25zdCBkeW5hbWljUGFnZSA9IHRoaXMuX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCgpLFxuXHRcdFx0aXNIZWFkZXJFeHBhbmRlZCA9IGR5bmFtaWNQYWdlLmdldEhlYWRlckV4cGFuZGVkKCksXG5cdFx0XHRmaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkgYXMgYW55O1xuXHRcdGlmIChmaWx0ZXJCYXIpIHtcblx0XHRcdGlmIChpc0hlYWRlckV4cGFuZGVkKSB7XG5cdFx0XHRcdC8vRW5hYmxpbmcgbWFuZGF0b3J5IGZpbHRlciBmaWVsZHMgbWVzc2FnZSBkaWFsb2dcblx0XHRcdFx0aWYgKCFmaWx0ZXJCYXIuZ2V0U2hvd01lc3NhZ2VzKCkpIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuc2V0U2hvd01lc3NhZ2VzKHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZCA9IGZpbHRlckJhci5nZXRGaWx0ZXJJdGVtcygpLmZpbmQoZnVuY3Rpb24gKG9GaWx0ZXJJdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0ZpbHRlckl0ZW0uZ2V0UmVxdWlyZWQoKSAmJiBvRmlsdGVySXRlbS5nZXRDb25kaXRpb25zKCkubGVuZ3RoID09PSAwO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0Ly9Gb2N1c2luZyBvbiB0aGUgZmlyc3QgZW1wdHkgbWFuZGF0b3J5IGZpbHRlciBmaWVsZCwgb3Igb24gdGhlIGZpcnN0IGZpbHRlciBmaWVsZCBpZiB0aGUgdGFibGUgZGF0YSBpcyBsb2FkZWRcblx0XHRcdFx0aWYgKGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZCkge1xuXHRcdFx0XHRcdGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZC5mb2N1cygpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2lzSW5pdExvYWRFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0RmlsdGVySXRlbXMoKVswXS5mb2N1cygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vRm9jdXNpbmcgb24gdGhlIEdvIGJ1dHRvblxuXHRcdFx0XHRcdHRoaXMuZ2V0VmlldygpLmJ5SWQoYCR7dGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbElkKCl9LWJ0blNlYXJjaGApLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodGhpcy5faXNJbml0TG9hZEVuYWJsZWQoKSkge1xuXHRcdFx0XHR0aGlzLl9nZXRUYWJsZSgpPy5mb2N1c1JvdygwKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fZ2V0VGFibGUoKT8uZm9jdXNSb3coMCk7XG5cdFx0fVxuXHR9XG5cblx0X2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uKCkge1xuXHRcdGNvbnN0IG9NYW5pZmVzdEVudHJ5ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLmFwcFwiKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IG9NYW5pZmVzdEVudHJ5LnRpdGxlLFxuXHRcdFx0c3VidGl0bGU6IG9NYW5pZmVzdEVudHJ5LmFwcFN1YlRpdGxlIHx8IFwiXCIsXG5cdFx0XHRpbnRlbnQ6IFwiXCIsXG5cdFx0XHRpY29uOiBcIlwiXG5cdFx0fTtcblx0fVxuXG5cdF9nZXRGaWx0ZXJCYXJDb250cm9sKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFZpZXcoKS5ieUlkKHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2xJZCgpKSBhcyBGaWx0ZXJCYXI7XG5cdH1cblxuXHRfZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFZpZXcoKS5ieUlkKHRoaXMuX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbElkKCkpIGFzIER5bmFtaWNQYWdlO1xuXHR9XG5cblx0X2dldEFkYXB0YXRpb25GaWx0ZXJCYXJDb250cm9sKCkge1xuXHRcdC8vIElmIHRoZSBhZGFwdGF0aW9uIGZpbHRlciBiYXIgaXMgcGFydCBvZiB0aGUgRE9NIHRyZWUsIHRoZSBcIkFkYXB0IEZpbHRlclwiIGRpYWxvZyBpcyBvcGVuLFxuXHRcdC8vIGFuZCB3ZSByZXR1cm4gdGhlIGFkYXB0YXRpb24gZmlsdGVyIGJhciBhcyBhbiBhY3RpdmUgY29udHJvbCAodmlzaWJsZSBmb3IgdGhlIHVzZXIpXG5cdFx0Y29uc3QgYWRhcHRhdGlvbkZpbHRlckJhciA9ICh0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkgYXMgYW55KS5nZXRJbmJ1aWx0RmlsdGVyKCk7XG5cdFx0cmV0dXJuIGFkYXB0YXRpb25GaWx0ZXJCYXI/LmdldFBhcmVudCgpID8gYWRhcHRhdGlvbkZpbHRlckJhciA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdF9nZXRTZWdtZW50ZWRCdXR0b24oc0NvbnRyb2w6IGFueSkge1xuXHRcdGNvbnN0IHNTZWdtZW50ZWRCdXR0b25JZCA9IChzQ29udHJvbCA9PT0gXCJDaGFydFwiID8gdGhpcy5nZXRDaGFydENvbnRyb2woKSA6IHRoaXMuX2dldFRhYmxlKCkpPy5kYXRhKFwic2VnbWVudGVkQnV0dG9uSWRcIik7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmJ5SWQoc1NlZ21lbnRlZEJ1dHRvbklkKTtcblx0fVxuXG5cdF9nZXRDb250cm9sRnJvbVBhZ2VNb2RlbFByb3BlcnR5KHNQYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjb250cm9sSWQgPSB0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoc1BhdGgpO1xuXHRcdHJldHVybiBjb250cm9sSWQgJiYgdGhpcy5nZXRWaWV3KCkuYnlJZChjb250cm9sSWQpO1xuXHR9XG5cblx0X2dldFBhZ2VNb2RlbCgpOiBKU09OTW9kZWwgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IHBhZ2VDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IodGhpcy5nZXRWaWV3KCkpIGFzIGFueTtcblx0XHRyZXR1cm4gcGFnZUNvbXBvbmVudC5nZXRNb2RlbChcIl9wYWdlTW9kZWxcIik7XG5cdH1cblxuXHRfZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sSWQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL2R5bmFtaWNMaXN0UmVwb3J0SWRcIikgfHwgXCJcIjtcblx0fVxuXG5cdF9nZXRGaWx0ZXJCYXJDb250cm9sSWQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL2ZpbHRlckJhcklkXCIpIHx8IFwiXCI7XG5cdH1cblxuXHRnZXRDaGFydENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldENvbnRyb2xGcm9tUGFnZU1vZGVsUHJvcGVydHkoXCIvc2luZ2xlQ2hhcnRJZFwiKTtcblx0fVxuXG5cdF9nZXRWaXN1YWxGaWx0ZXJCYXJDb250cm9sKCkge1xuXHRcdGNvbnN0IHNWaXN1YWxGaWx0ZXJCYXJJZCA9IFN0YWJsZUlkSGVscGVyLmdlbmVyYXRlKFtcInZpc3VhbEZpbHRlclwiLCB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sSWQoKV0pO1xuXHRcdHJldHVybiBzVmlzdWFsRmlsdGVyQmFySWQgJiYgdGhpcy5nZXRWaWV3KCkuYnlJZChzVmlzdWFsRmlsdGVyQmFySWQpO1xuXHR9XG5cdF9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0Q29udHJvbEZyb21QYWdlTW9kZWxQcm9wZXJ0eShcIi92YXJpYW50TWFuYWdlbWVudC9pZFwiKTtcblx0fVxuXG5cdF9nZXRNdWx0aU1vZGVDb250cm9sKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFZpZXcoKS5ieUlkKFwiZmU6OlRhYk11bHRpcGxlTW9kZTo6Q29udHJvbFwiKSBhcyBNdWx0aXBsZU1vZGVDb250cm9sO1xuXHR9XG5cblx0X2dldFRhYmxlKCk6IFRhYmxlIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAodGhpcy5faXNNdWx0aU1vZGUoKSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSB0aGlzLl9nZXRNdWx0aU1vZGVDb250cm9sKCk/LmdldFNlbGVjdGVkSW5uZXJDb250cm9sKCk/LmNvbnRlbnQ7XG5cdFx0XHRyZXR1cm4gb0NvbnRyb2w/LmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgPyAob0NvbnRyb2wgYXMgVGFibGUpIDogdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0Q29udHJvbEZyb21QYWdlTW9kZWxQcm9wZXJ0eShcIi9zaW5nbGVUYWJsZUlkXCIpIGFzIFRhYmxlO1xuXHRcdH1cblx0fVxuXHRfZ2V0Q29udHJvbHMoc0tleT86IGFueSkge1xuXHRcdGlmICh0aGlzLl9pc011bHRpTW9kZSgpKSB7XG5cdFx0XHRjb25zdCBhQ29udHJvbHM6IGFueVtdID0gW107XG5cdFx0XHRjb25zdCBvVGFiTXVsdGlNb2RlID0gdGhpcy5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpLmNvbnRlbnQ7XG5cdFx0XHRvVGFiTXVsdGlNb2RlLmdldEl0ZW1zKCkuZm9yRWFjaCgob0l0ZW06IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvQ29udHJvbCA9IHRoaXMuZ2V0VmlldygpLmJ5SWQob0l0ZW0uZ2V0S2V5KCkpO1xuXHRcdFx0XHRpZiAob0NvbnRyb2wgJiYgc0tleSkge1xuXHRcdFx0XHRcdGlmIChvSXRlbS5nZXRLZXkoKS5pbmRleE9mKGBmZTo6JHtzS2V5fWApID4gLTEpIHtcblx0XHRcdFx0XHRcdGFDb250cm9scy5wdXNoKG9Db250cm9sKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAob0NvbnRyb2wgIT09IHVuZGVmaW5lZCAmJiBvQ29udHJvbCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdGFDb250cm9scy5wdXNoKG9Db250cm9sKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gYUNvbnRyb2xzO1xuXHRcdH0gZWxzZSBpZiAoc0tleSA9PT0gXCJDaGFydFwiKSB7XG5cdFx0XHRjb25zdCBvQ2hhcnQgPSB0aGlzLmdldENoYXJ0Q29udHJvbCgpO1xuXHRcdFx0cmV0dXJuIG9DaGFydCA/IFtvQ2hhcnRdIDogW107XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG9UYWJsZSA9IHRoaXMuX2dldFRhYmxlKCk7XG5cdFx0XHRyZXR1cm4gb1RhYmxlID8gW29UYWJsZV0gOiBbXTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0RGVmYXVsdFBhdGgoKSB7XG5cdFx0Y29uc3QgZGVmYXVsdFBhdGggPSBMaXN0UmVwb3J0VGVtcGxhdGluZy5nZXREZWZhdWx0UGF0aCh0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoXCIvdmlld3NcIikgfHwgW10pO1xuXHRcdHN3aXRjaCAoZGVmYXVsdFBhdGgpIHtcblx0XHRcdGNhc2UgXCJwcmltYXJ5XCI6XG5cdFx0XHRcdHJldHVybiBUZW1wbGF0ZUNvbnRlbnRWaWV3LkNoYXJ0O1xuXHRcdFx0Y2FzZSBcInNlY29uZGFyeVwiOlxuXHRcdFx0XHRyZXR1cm4gVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZTtcblx0XHRcdGNhc2UgXCJib3RoXCI6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gVGVtcGxhdGVDb250ZW50Vmlldy5IeWJyaWQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBrbm93IGlmIExpc3RSZXBvcnQgaXMgY29uZmlndXJlZCB3aXRoIE11bHRpcGxlIFRhYmxlIG1vZGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfaXNNdWx0aU1vZGVcblx0ICogQHJldHVybnMgSXMgTXVsdGlwbGUgVGFibGUgbW9kZSBzZXQ/XG5cdCAqL1xuXHRfaXNNdWx0aU1vZGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICEhdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL211bHRpVmlld3NDb250cm9sXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBrbm93IGlmIExpc3RSZXBvcnQgaXMgY29uZmlndXJlZCB0byBsb2FkIGRhdGEgYXQgc3RhcnQgdXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfaXNJbml0TG9hZERpc2FibGVkXG5cdCAqIEByZXR1cm5zIElzIEluaXRMb2FkIGVuYWJsZWQ/XG5cdCAqL1xuXHRfaXNJbml0TG9hZEVuYWJsZWQoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaW5pdExvYWRNb2RlID0gKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5pbml0aWFsTG9hZDtcblx0XHRyZXR1cm4gaW5pdExvYWRNb2RlID09PSBJbml0aWFsTG9hZE1vZGUuRW5hYmxlZDtcblx0fVxuXG5cdF9oYXNNdWx0aVZpc3VhbGl6YXRpb25zKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoXCIvaGFzTXVsdGlWaXN1YWxpemF0aW9uc1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc3VzcGVuZCBzZWFyY2ggb24gdGhlIGZpbHRlciBiYXIuIFRoZSBpbml0aWFsIGxvYWRpbmcgb2YgZGF0YSBpcyBkaXNhYmxlZCBiYXNlZCBvbiB0aGUgbWFuaWZlc3QgY29uZmlndXJhdGlvbiBJbml0TG9hZCAtIERpc2FibGVkL0F1dG8uXG5cdCAqIEl0IGlzIGVuYWJsZWQgbGF0ZXIgd2hlbiB0aGUgdmlldyBzdGF0ZSBpcyBzZXQsIHdoZW4gaXQgaXMgcG9zc2libGUgdG8gcmVhbGl6ZSBpZiB0aGVyZSBhcmUgZGVmYXVsdCBmaWx0ZXJzLlxuXHQgKi9cblx0X2Rpc2FibGVJbml0TG9hZCgpIHtcblx0XHRjb25zdCBmaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0Ly8gY2hlY2sgZm9yIGZpbHRlciBiYXIgaGlkZGVuXG5cdFx0aWYgKGZpbHRlckJhcikge1xuXHRcdFx0ZmlsdGVyQmFyLnNldFN1c3BlbmRTZWxlY3Rpb24odHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCBjYWxsZWQgYnkgZmxleCB0byBkZXRlcm1pbmUgaWYgdGhlIGFwcGx5QXV0b21hdGljYWxseSBzZXR0aW5nIG9uIHRoZSB2YXJpYW50IGlzIHZhbGlkLlxuXHQgKiBDYWxsZWQgb25seSBmb3IgU3RhbmRhcmQgVmFyaWFudCBhbmQgb25seSB3aGVuIHRoZXJlIGlzIGRpc3BsYXkgdGV4dCBzZXQgZm9yIGFwcGx5QXV0b21hdGljYWxseSAoRkUgb25seSBzZXRzIGl0IGZvciBBdXRvKS5cblx0ICpcblx0ICogQHJldHVybnMgQm9vbGVhbiB0cnVlIGlmIGRhdGEgc2hvdWxkIGJlIGxvYWRlZCBhdXRvbWF0aWNhbGx5LCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdF9hcHBseUF1dG9tYXRpY2FsbHlPblN0YW5kYXJkVmFyaWFudCgpIHtcblx0XHQvLyBXZSBhbHdheXMgcmV0dXJuIGZhbHNlIGFuZCB0YWtlIGNhcmUgb2YgaXQgd2hlbiB2aWV3IHN0YXRlIGlzIHNldFxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25maWd1cmUgdGhlIHNldHRpbmdzIGZvciBpbml0aWFsIGxvYWQgYmFzZWQgb25cblx0ICogLSBtYW5pZmVzdCBzZXR0aW5nIGluaXRMb2FkIC0gRW5hYmxlZC9EaXNhYmxlZC9BdXRvXG5cdCAqIC0gdXNlcidzIHNldHRpbmcgb2YgYXBwbHlBdXRvbWF0aWNhbGx5IG9uIHZhcmlhbnRcblx0ICogLSBpZiB0aGVyZSBhcmUgZGVmYXVsdCBmaWx0ZXJzXG5cdCAqIFdlIGRpc2FibGUgdGhlIGZpbHRlciBiYXIgc2VhcmNoIGF0IHRoZSBiZWdpbm5pbmcgYW5kIGVuYWJsZSBpdCB3aGVuIHZpZXcgc3RhdGUgaXMgc2V0LlxuXHQgKi9cblx0X3NldEluaXRMb2FkKCkge1xuXHRcdC8vIGlmIGluaXRMb2FkIGlzIERpc2FibGVkIG9yIEF1dG8sIHN3aXRjaCBvZmYgZmlsdGVyIGJhciBzZWFyY2ggdGVtcG9yYXJpbHkgYXQgc3RhcnRcblx0XHRpZiAoIXRoaXMuX2lzSW5pdExvYWRFbmFibGVkKCkpIHtcblx0XHRcdHRoaXMuX2Rpc2FibGVJbml0TG9hZCgpO1xuXHRcdH1cblx0XHQvLyBzZXQgaG9vayBmb3IgZmxleCBmb3Igd2hlbiBzdGFuZGFyZCB2YXJpYW50IGlzIHNldCAoYXQgc3RhcnQgb3IgYnkgdXNlciBhdCBydW50aW1lKVxuXHRcdC8vIHJlcXVpcmVkIHRvIG92ZXJyaWRlIHRoZSB1c2VyIHNldHRpbmcgJ2FwcGx5IGF1dG9tYXRpY2FsbHknIGJlaGF2aW91ciBpZiB0aGVyZSBhcmUgbm8gZmlsdGVyc1xuXHRcdGNvbnN0IHZhcmlhbnRNYW5hZ2VtZW50SWQ6IGFueSA9IExpc3RSZXBvcnRUZW1wbGF0aW5nLmdldFZhcmlhbnRCYWNrUmVmZXJlbmNlKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCksIHRoaXMuX2dldFBhZ2VNb2RlbCgpKTtcblx0XHRjb25zdCB2YXJpYW50TWFuYWdlbWVudCA9IHZhcmlhbnRNYW5hZ2VtZW50SWQgJiYgdGhpcy5nZXRWaWV3KCkuYnlJZCh2YXJpYW50TWFuYWdlbWVudElkKTtcblx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQpIHtcblx0XHRcdHZhcmlhbnRNYW5hZ2VtZW50LnJlZ2lzdGVyQXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQodGhpcy5fYXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9XG5cblx0X3NldFNoYXJlTW9kZWwoKSB7XG5cdFx0Ly8gVE9ETzogZGVhY3RpdmF0ZWQgZm9yIG5vdyAtIGN1cnJlbnRseSB0aGVyZSBpcyBubyBfdGVtcGxQcml2IGFueW1vcmUsIHRvIGJlIGRpc2N1c3NlZFxuXHRcdC8vIHRoaXMgbWV0aG9kIGlzIGN1cnJlbnRseSBub3QgY2FsbGVkIGFueW1vcmUgZnJvbSB0aGUgaW5pdCBtZXRob2RcblxuXHRcdGNvbnN0IGZuR2V0VXNlciA9IE9iamVjdFBhdGguZ2V0KFwic2FwLnVzaGVsbC5Db250YWluZXIuZ2V0VXNlclwiKTtcblx0XHQvL3ZhciBvTWFuaWZlc3QgPSB0aGlzLmdldE93bmVyQ29tcG9uZW50KCkuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TWV0YWRhdGEoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLnVpXCIpO1xuXHRcdC8vdmFyIHNCb29rbWFya0ljb24gPSAob01hbmlmZXN0ICYmIG9NYW5pZmVzdC5pY29ucyAmJiBvTWFuaWZlc3QuaWNvbnMuaWNvbikgfHwgXCJcIjtcblxuXHRcdC8vc2hhcmVNb2RlbDogSG9sZHMgYWxsIHRoZSBzaGFyaW5nIHJlbGV2YW50IGluZm9ybWF0aW9uIGFuZCBpbmZvIHVzZWQgaW4gWE1MIHZpZXdcblx0XHRjb25zdCBvU2hhcmVJbmZvID0ge1xuXHRcdFx0Ym9va21hcmtUaXRsZTogZG9jdW1lbnQudGl0bGUsIC8vVG8gbmFtZSB0aGUgYm9va21hcmsgYWNjb3JkaW5nIHRvIHRoZSBhcHAgdGl0bGUuXG5cdFx0XHRib29rbWFya0N1c3RvbVVybDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBzSGFzaCA9IGhhc2hlci5nZXRIYXNoKCk7XG5cdFx0XHRcdHJldHVybiBzSGFzaCA/IGAjJHtzSGFzaH1gIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cdFx0XHR9LFxuXHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0VG8gYmUgYWN0aXZhdGVkIG9uY2UgdGhlIEZMUCBzaG93cyB0aGUgY291bnQgLSBzZWUgY29tbWVudCBhYm92ZVxuXHRcdFx0XHRcdFx0XHRib29rbWFya1NlcnZpY2VVcmw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vdmFyIG9UYWJsZSA9IG9UYWJsZS5nZXRJbm5lclRhYmxlKCk7IG9UYWJsZSBpcyBhbHJlYWR5IHRoZSBzYXAuZmUgdGFibGUgKGJ1dCBub3QgdGhlIGlubmVyIG9uZSlcblx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBzaG91bGQgdXNlIHRhYmxlLmdldExpc3RCaW5kaW5nSW5mbyBpbnN0ZWFkIG9mIHRoZSBiaW5kaW5nXG5cdFx0XHRcdFx0XHRcdFx0dmFyIG9CaW5kaW5nID0gb1RhYmxlLmdldEJpbmRpbmcoXCJyb3dzXCIpIHx8IG9UYWJsZS5nZXRCaW5kaW5nKFwiaXRlbXNcIik7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9CaW5kaW5nID8gZm5HZXREb3dubG9hZFVybChvQmluZGluZykgOiBcIlwiO1xuXHRcdFx0XHRcdFx0XHR9LCovXG5cdFx0XHRpc1NoYXJlSW5KYW1BY3RpdmU6ICEhZm5HZXRVc2VyICYmIGZuR2V0VXNlcigpLmlzSmFtQWN0aXZlKClcblx0XHR9O1xuXG5cdFx0Y29uc3Qgb1RlbXBsYXRlUHJpdmF0ZU1vZGVsID0gdGhpcy5nZXRPd25lckNvbXBvbmVudCgpLmdldE1vZGVsKFwiX3RlbXBsUHJpdlwiKSBhcyBKU09OTW9kZWw7XG5cdFx0b1RlbXBsYXRlUHJpdmF0ZU1vZGVsLnNldFByb3BlcnR5KFwiL2xpc3RSZXBvcnQvc2hhcmVcIiwgb1NoYXJlSW5mbyk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHVwZGF0ZSB0aGUgbG9jYWwgVUkgbW9kZWwgb2YgdGhlIHBhZ2Ugd2l0aCB0aGUgZmllbGRzIHRoYXQgYXJlIG5vdCBhcHBsaWNhYmxlIHRvIHRoZSBmaWx0ZXIgYmFyICh0aGlzIGlzIHNwZWNpZmljIHRvIHRoZSBBTFAgc2NlbmFyaW8pLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0ludGVybmFsTW9kZWxDb250ZXh0IFRoZSBpbnRlcm5hbCBtb2RlbCBjb250ZXh0XG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIE1EQyBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRfdXBkYXRlQUxQTm90QXBwbGljYWJsZUZpZWxkcyhvSW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LCBvRmlsdGVyQmFyOiBGaWx0ZXJCYXIpIHtcblx0XHRjb25zdCBtQ2FjaGU6IGFueSA9IHt9O1xuXHRcdGNvbnN0IGlnbm9yZWRGaWVsZHM6IGFueSA9IHt9LFxuXHRcdFx0YVRhYmxlcyA9IHRoaXMuX2dldENvbnRyb2xzKFwidGFibGVcIiksXG5cdFx0XHRhQ2hhcnRzID0gdGhpcy5fZ2V0Q29udHJvbHMoXCJDaGFydFwiKTtcblxuXHRcdGlmICghYVRhYmxlcy5sZW5ndGggfHwgIWFDaGFydHMubGVuZ3RoKSB7XG5cdFx0XHQvLyBJZiB0aGVyZSdzIG5vdCBhIHRhYmxlIGFuZCBhIGNoYXJ0LCB3ZSdyZSBub3QgaW4gdGhlIEFMUCBjYXNlXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gRm9yIHRoZSBtb21lbnQsIHRoZXJlJ3Mgbm90aGluZyBmb3IgdGFibGVzLi4uXG5cdFx0YUNoYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgc0NoYXJ0RW50aXR5UGF0aCA9IG9DaGFydC5kYXRhKFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIiksXG5cdFx0XHRcdHNDaGFydEVudGl0eVNldCA9IHNDaGFydEVudGl0eVBhdGguc2xpY2UoMSksXG5cdFx0XHRcdHNDYWNoZUtleSA9IGAke3NDaGFydEVudGl0eVNldH1DaGFydGA7XG5cdFx0XHRpZiAoIW1DYWNoZVtzQ2FjaGVLZXldKSB7XG5cdFx0XHRcdG1DYWNoZVtzQ2FjaGVLZXldID0gRmlsdGVyVXRpbHMuZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMob0ZpbHRlckJhciwgb0NoYXJ0KTtcblx0XHRcdH1cblx0XHRcdGlnbm9yZWRGaWVsZHNbc0NhY2hlS2V5XSA9IG1DYWNoZVtzQ2FjaGVLZXldO1xuXHRcdH0pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNvbnRyb2xzL2lnbm9yZWRGaWVsZHNcIiwgaWdub3JlZEZpZWxkcyk7XG5cdH1cblxuXHRfaXNGaWx0ZXJCYXJIaWRkZW4oKSB7XG5cdFx0cmV0dXJuICh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaGlkZUZpbHRlckJhcjtcblx0fVxuXG5cdF9nZXRBcHBseUF1dG9tYXRpY2FsbHlPblZhcmlhbnQoVmFyaWFudE1hbmFnZW1lbnQ6IGFueSwga2V5OiBzdHJpbmcpOiBCb29sZWFuIHtcblx0XHRpZiAoIVZhcmlhbnRNYW5hZ2VtZW50IHx8ICFrZXkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgdmFyaWFudHMgPSBWYXJpYW50TWFuYWdlbWVudC5nZXRWYXJpYW50cygpO1xuXHRcdGNvbnN0IGN1cnJlbnRWYXJpYW50ID0gdmFyaWFudHMuZmluZChmdW5jdGlvbiAodmFyaWFudDogYW55KSB7XG5cdFx0XHRyZXR1cm4gdmFyaWFudCAmJiB2YXJpYW50LmtleSA9PT0ga2V5O1xuXHRcdH0pO1xuXHRcdHJldHVybiAoY3VycmVudFZhcmlhbnQgJiYgY3VycmVudFZhcmlhbnQuZXhlY3V0ZU9uU2VsZWN0KSB8fCBmYWxzZTtcblx0fVxuXG5cdF9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaChvVk06IGFueSkge1xuXHRcdGlmIChcblx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaW5pdGlhbExvYWQgPT09IEluaXRpYWxMb2FkTW9kZS5BdXRvICYmXG5cdFx0XHQoIW9WTSB8fCBvVk0uZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCkgPT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpKVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRcdGNvbnN0IG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0XHRcdGZvciAoY29uc3Qgc0tleSBpbiBvQ29uZGl0aW9ucykge1xuXHRcdFx0XHRcdC8vIGlnbm9yZSBmaWx0ZXJzIHN0YXJ0aW5nIHdpdGggJCAoZS5nLiAkc2VhcmNoLCAkZWRpdFN0YXRlKVxuXHRcdFx0XHRcdGlmICghc0tleS5zdGFydHNXaXRoKFwiJFwiKSAmJiBBcnJheS5pc0FycmF5KG9Db25kaXRpb25zW3NLZXldKSAmJiBvQ29uZGl0aW9uc1tzS2V5XS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIGxvYWQgZGF0YSBhcyBwZXIgdXNlcidzIHNldHRpbmcgb2YgYXBwbHlBdXRvbWF0aWNhbGx5IG9uIHRoZSB2YXJpYW50XG5cdFx0XHRcdFx0XHRjb25zdCBzdGFuZGFyZFZhcmlhbnQ6IGFueSA9IG9WTS5nZXRWYXJpYW50cygpLmZpbmQoKHZhcmlhbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFyaWFudC5rZXkgPT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhbmRhcmRWYXJpYW50ICYmIHN0YW5kYXJkVmFyaWFudC5leGVjdXRlT25TZWxlY3Q7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF91cGRhdGVUYWJsZShvVGFibGU6IGFueSkge1xuXHRcdGlmICghb1RhYmxlLmlzVGFibGVCb3VuZCgpIHx8IHRoaXMuaGFzUGVuZGluZ0NoYXJ0Q2hhbmdlcykge1xuXHRcdFx0b1RhYmxlLnJlYmluZCgpO1xuXHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0X3VwZGF0ZUNoYXJ0KG9DaGFydDogYW55KSB7XG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnQgPSBvQ2hhcnQuZ2V0Q29udHJvbERlbGVnYXRlKCkuX2dldENoYXJ0KG9DaGFydCk7XG5cdFx0aWYgKCEob0lubmVyQ2hhcnQgJiYgb0lubmVyQ2hhcnQuaXNCb3VuZChcImRhdGFcIikpIHx8IHRoaXMuaGFzUGVuZGluZ1RhYmxlQ2hhbmdlcykge1xuXHRcdFx0b0NoYXJ0LmdldENvbnRyb2xEZWxlZ2F0ZSgpLnJlYmluZChvQ2hhcnQsIG9Jbm5lckNoYXJ0LmdldEJpbmRpbmdJbmZvKFwiZGF0YVwiKSk7XG5cdFx0XHR0aGlzLmhhc1BlbmRpbmdUYWJsZUNoYW5nZXMgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRoYW5kbGVycyA9IHtcblx0XHRvbkZpbHRlclNlYXJjaCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpLnRyaWdnZXJTZWFyY2goKTtcblx0XHR9LFxuXHRcdG9uRmlsdGVyc0NoYW5nZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdFx0Ly8gUGVuZGluZyBmaWx0ZXJzIGludG8gRmlsdGVyQmFyIHRvIGJlIHVzZWQgZm9yIGN1c3RvbSB2aWV3c1xuXHRcdFx0XHR0aGlzLm9uUGVuZGluZ0ZpbHRlcnMoKTtcblx0XHRcdFx0Y29uc3QgYXBwbGllZEZpbHRlcnNUZXh0ID0gb0ZpbHRlckJhci5nZXRBc3NpZ25lZEZpbHRlcnNUZXh0KCkuZmlsdGVyc1RleHQ7XG5cdFx0XHRcdGNvbnN0IGFwcGxpZWRGaWx0ZXJCaW5kaW5nID0gKE1hbmFnZWRPYmplY3QgYXMgYW55KS5iaW5kaW5nUGFyc2VyKGFwcGxpZWRGaWx0ZXJzVGV4dCk7XG5cdFx0XHRcdGlmIChhcHBsaWVkRmlsdGVyQmluZGluZykge1xuXHRcdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5ieUlkKFwiZmU6OmFwcGxpZWRGaWx0ZXJzVGV4dFwiKSBhcyBUZXh0IHwgdW5kZWZpbmVkKT8uYmluZFRleHQoYXBwbGllZEZpbHRlckJpbmRpbmcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5ieUlkKFwiZmU6OmFwcGxpZWRGaWx0ZXJzVGV4dFwiKSBhcyBUZXh0IHwgdW5kZWZpbmVkKT8uc2V0VGV4dChhcHBsaWVkRmlsdGVyc1RleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiY29uZGl0aW9uc0Jhc2VkXCIpKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIiwgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdG9uVmFyaWFudFNlbGVjdGVkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1ZNID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdFx0Y29uc3QgY3VycmVudFZhcmlhbnRLZXkgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwia2V5XCIpO1xuXHRcdFx0Y29uc3Qgb011bHRpTW9kZUNvbnRyb2wgPSB0aGlzLl9nZXRNdWx0aU1vZGVDb250cm9sKCk7XG5cblx0XHRcdGlmIChvTXVsdGlNb2RlQ29udHJvbCAmJiAhb1ZNPy5nZXRQYXJlbnQoKS5pc0EoXCJzYXAudWkubWRjLkFjdGlvblRvb2xiYXJcIikpIHtcblx0XHRcdFx0Ly9Ob3QgYSBDb250cm9sIFZhcmlhbnRcblx0XHRcdFx0b011bHRpTW9kZUNvbnRyb2w/LmludmFsaWRhdGVDb250ZW50KCk7XG5cdFx0XHRcdG9NdWx0aU1vZGVDb250cm9sPy5zZXRGcmVlemVDb250ZW50KHRydWUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZXRUaW1lb3V0IGNhdXNlIHRoZSB2YXJpYW50IG5lZWRzIHRvIGJlIGFwcGxpZWQgYmVmb3JlIGp1ZGdpbmcgdGhlIGF1dG8gc2VhcmNoIG9yIHVwZGF0aW5nIHRoZSBhcHAgc3RhdGVcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5fc2hvdWxkQXV0b1RyaWdnZXJTZWFyY2gob1ZNKSkge1xuXHRcdFx0XHRcdC8vIHRoZSBhcHAgc3RhdGUgd2lsbCBiZSB1cGRhdGVkIHZpYSBvblNlYXJjaCBoYW5kbGVyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKS50cmlnZ2VyU2VhcmNoKCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIXRoaXMuX2dldEFwcGx5QXV0b21hdGljYWxseU9uVmFyaWFudChvVk0sIGN1cnJlbnRWYXJpYW50S2V5KSkge1xuXHRcdFx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgMCk7XG5cdFx0fSxcblx0XHRvblZhcmlhbnRTYXZlZCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0Ly9UT0RPOiBTaG91bGQgcmVtb3ZlIHRoaXMgc2V0VGltZU91dCBvbmNlIFZhcmlhbnQgTWFuYWdlbWVudCBwcm92aWRlcyBhbiBhcGkgdG8gZmV0Y2ggdGhlIGN1cnJlbnQgdmFyaWFudCBrZXkgb24gc2F2ZSEhIVxuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHRcdH0sIDEwMDApO1xuXHRcdH0sXG5cdFx0b25TZWFyY2godGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIpIHtcblx0XHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0Y29uc3Qgb01kY0NoYXJ0ID0gdGhpcy5nZXRDaGFydENvbnRyb2woKTtcblx0XHRcdGNvbnN0IGJIaWRlRHJhZnQgPSBGaWx0ZXJVdGlscy5nZXRFZGl0U3RhdGVJc0hpZGVEcmFmdChvRmlsdGVyQmFyLmdldENvbmRpdGlvbnMoKSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJoYXNQZW5kaW5nRmlsdGVyc1wiLCBmYWxzZSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJoaWRlRHJhZnRJbmZvXCIsIGJIaWRlRHJhZnQpO1xuXG5cdFx0XHRpZiAoIXRoaXMuX2dldE11bHRpTW9kZUNvbnRyb2woKSkge1xuXHRcdFx0XHR0aGlzLl91cGRhdGVBTFBOb3RBcHBsaWNhYmxlRmllbGRzKG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgb0ZpbHRlckJhcik7XG5cdFx0XHR9XG5cdFx0XHRpZiAob01kY0NoYXJ0KSB7XG5cdFx0XHRcdC8vIGRpc2FibGUgYm91bmQgYWN0aW9ucyBUT0RPOiB0aGlzIGNsZWFycyBldmVyeXRoaW5nIGZvciB0aGUgY2hhcnQ/XG5cdFx0XHRcdChvTWRjQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCkuc2V0UHJvcGVydHkoXCJcIiwge30pO1xuXG5cdFx0XHRcdGNvbnN0IG9QYWdlSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvTWRjQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJwYWdlSW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRcdGNvbnN0IHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gb1BhZ2VJbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShgJHtvUGFnZUludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vYWxwQ29udGVudFZpZXdgKTtcblx0XHRcdFx0aWYgKHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID09PSBUZW1wbGF0ZUNvbnRlbnRWaWV3LkNoYXJ0KSB7XG5cdFx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc1RlbXBsYXRlQ29udGVudFZpZXcgPT09IFRlbXBsYXRlQ29udGVudFZpZXcuVGFibGUpIHtcblx0XHRcdFx0XHR0aGlzLmhhc1BlbmRpbmdUYWJsZUNoYW5nZXMgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBzdG9yZSBmaWx0ZXIgYmFyIGNvbmRpdGlvbnMgdG8gdXNlIGxhdGVyIHdoaWxlIG5hdmlnYXRpb25cblx0XHRcdFN0YXRlVXRpbC5yZXRyaWV2ZUV4dGVybmFsU3RhdGUob0ZpbHRlckJhcilcblx0XHRcdFx0LnRoZW4oKG9FeHRlcm5hbFN0YXRlOiBhbnkpID0+IHtcblx0XHRcdFx0XHR0aGlzLmZpbHRlckJhckNvbmRpdGlvbnMgPSBvRXh0ZXJuYWxTdGF0ZS5maWx0ZXI7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBleHRlcm5hbCBzdGF0ZVwiLCBvRXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHRcdGlmICgodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmxpdmVNb2RlID09PSBmYWxzZSkge1xuXHRcdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzeXN0ZW0ucGhvbmUpIHtcblx0XHRcdFx0Y29uc3Qgb0R5bmFtaWNQYWdlID0gdGhpcy5fZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sKCk7XG5cdFx0XHRcdG9EeW5hbWljUGFnZS5zZXRIZWFkZXJFeHBhbmRlZChmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUcmlnZ2VycyBhbiBvdXRib3VuZCBuYXZpZ2F0aW9uIHdoZW4gYSB1c2VyIGNob29zZXMgdGhlIGNoZXZyb24uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gb0NvbnRyb2xsZXJcblx0XHQgKiBAcGFyYW0gc091dGJvdW5kVGFyZ2V0IE5hbWUgb2YgdGhlIG91dGJvdW5kIHRhcmdldCAobmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QpXG5cdFx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgZm9yIHRoZSB0YXJnZXQgYXBwXG5cdFx0ICogQHBhcmFtIHNDcmVhdGVQYXRoIENyZWF0ZSBwYXRoIHdoZW4gdGhlIGNoZXZyb24gaXMgY3JlYXRlZC5cblx0XHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIG9uY2UgdGhlIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkXG5cdFx0ICogQHVpNS1yZXN0cmljdGVkXG5cdFx0ICogQGZpbmFsXG5cdFx0ICovXG5cdFx0b25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKFxuXHRcdFx0b0NvbnRyb2xsZXI6IExpc3RSZXBvcnRDb250cm9sbGVyLFxuXHRcdFx0c091dGJvdW5kVGFyZ2V0OiBzdHJpbmcsXG5cdFx0XHRvQ29udGV4dDogVjRDb250ZXh0LFxuXHRcdFx0c0NyZWF0ZVBhdGg6IHN0cmluZ1xuXHRcdCkge1xuXHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBzT3V0Ym91bmRUYXJnZXQsIG9Db250ZXh0LCBzQ3JlYXRlUGF0aCk7XG5cdFx0fSxcblx0XHRvbkNoYXJ0U2VsZWN0aW9uQ2hhbmdlZCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgb0V2ZW50OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9NZGNDaGFydCA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRDb250ZW50KCksXG5cdFx0XHRcdG9UYWJsZSA9IHRoaXMuX2dldFRhYmxlKCksXG5cdFx0XHRcdGFEYXRhID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImRhdGFcIiksXG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRpZiAoYURhdGEpIHtcblx0XHRcdFx0Ly8gdXBkYXRlIGFjdGlvbiBidXR0b25zIGVuYWJsZW1lbnQgLyBkaXNhYmxlbWVudFxuXHRcdFx0XHRDaGFydFJ1bnRpbWUuZm5VcGRhdGVDaGFydChvRXZlbnQpO1xuXHRcdFx0XHQvLyB1cGRhdGUgc2VsZWN0aW9ucyBvbiBzZWxlY3Rpb24gb3IgZGVzZWxlY3Rpb25cblx0XHRcdFx0Q2hhcnRVdGlscy5zZXRDaGFydEZpbHRlcnMob01kY0NoYXJ0KTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCk7XG5cdFx0XHRpZiAoc1RlbXBsYXRlQ29udGVudFZpZXcgPT09IFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQpIHtcblx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAob1RhYmxlKSB7XG5cdFx0XHRcdChvVGFibGUgYXMgYW55KS5yZWJpbmQoKTtcblx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBzU2VsZWN0ZWRLZXkgPSBvRXZlbnQubVBhcmFtZXRlcnMua2V5ID8gb0V2ZW50Lm1QYXJhbWV0ZXJzLmtleSA6IG51bGw7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiYWxwQ29udGVudFZpZXdcIiwgc1NlbGVjdGVkS2V5KTtcblx0XHRcdGNvbnN0IG9DaGFydCA9IHRoaXMuZ2V0Q2hhcnRDb250cm9sKCk7XG5cdFx0XHRjb25zdCBvVGFibGUgPSB0aGlzLl9nZXRUYWJsZSgpO1xuXHRcdFx0Y29uc3Qgb1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlID0ge1xuXHRcdFx0XHRvbkFmdGVyUmVuZGVyaW5nKCkge1xuXHRcdFx0XHRcdGNvbnN0IGFJdGVtcyA9IG9TZWdtZW50ZWRCdXR0b24uZ2V0SXRlbXMoKTtcblx0XHRcdFx0XHRhSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAob0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKG9JdGVtLmdldEtleSgpID09PSBzU2VsZWN0ZWRLZXkpIHtcblx0XHRcdFx0XHRcdFx0b0l0ZW0uZm9jdXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLnJlbW92ZUV2ZW50RGVsZWdhdGUob1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IG9TZWdtZW50ZWRCdXR0b24gPSAoXG5cdFx0XHRcdHNTZWxlY3RlZEtleSA9PT0gVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZSA/IHRoaXMuX2dldFNlZ21lbnRlZEJ1dHRvbihcIlRhYmxlXCIpIDogdGhpcy5fZ2V0U2VnbWVudGVkQnV0dG9uKFwiQ2hhcnRcIilcblx0XHRcdCkgYXMgU2VnbWVudGVkQnV0dG9uO1xuXHRcdFx0aWYgKG9TZWdtZW50ZWRCdXR0b24gIT09IG9FdmVudC5nZXRTb3VyY2UoKSkge1xuXHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLmFkZEV2ZW50RGVsZWdhdGUob1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlKTtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAoc1NlbGVjdGVkS2V5KSB7XG5cdFx0XHRcdGNhc2UgVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZTpcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZShvVGFibGUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQ6XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlQ2hhcnQob0NoYXJ0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUZW1wbGF0ZUNvbnRlbnRWaWV3Lkh5YnJpZDpcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZShvVGFibGUpO1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZUNoYXJ0KG9DaGFydCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0fSxcblx0XHRvbkZpbHRlcnNTZWdtZW50ZWRCdXR0b25QcmVzc2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3QgaXNDb21wYWN0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImtleVwiKSA9PT0gXCJDb21wYWN0XCI7XG5cdFx0XHR0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkuc2V0VmlzaWJsZShpc0NvbXBhY3QpO1xuXHRcdFx0KHRoaXMuX2dldFZpc3VhbEZpbHRlckJhckNvbnRyb2woKSBhcyBDb250cm9sKS5zZXRWaXNpYmxlKCFpc0NvbXBhY3QpO1xuXHRcdH0sXG5cdFx0b25TdGF0ZUNoYW5nZSh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH0sXG5cdFx0b25EeW5hbWljUGFnZVRpdGxlU3RhdGVDaGFuZ2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3QgZmlsdGVyQmFyOiBhbnkgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRpZiAoZmlsdGVyQmFyICYmIGZpbHRlckJhci5nZXRTZWdtZW50ZWRCdXR0b24oKSkge1xuXHRcdFx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImlzRXhwYW5kZWRcIikpIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0U2VnbWVudGVkQnV0dG9uKCkuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0U2VnbWVudGVkQnV0dG9uKCkuc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdGZvcm1hdHRlcnMgPSB7XG5cdFx0c2V0QUxQQ29udHJvbE1lc3NhZ2VTdHJpcCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgYUlnbm9yZWRGaWVsZHM6IGFueVtdLCBiSXNDaGFydDogYW55LCBvQXBwbHlTdXBwb3J0ZWQ/OiBhbnkpIHtcblx0XHRcdGxldCBzVGV4dCA9IFwiXCI7XG5cdFx0XHRiSXNDaGFydCA9IGJJc0NoYXJ0ID09PSBcInRydWVcIiB8fCBiSXNDaGFydCA9PT0gdHJ1ZTtcblx0XHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRpZiAob0ZpbHRlckJhciAmJiBBcnJheS5pc0FycmF5KGFJZ25vcmVkRmllbGRzKSAmJiBhSWdub3JlZEZpZWxkcy5sZW5ndGggPiAwICYmIGJJc0NoYXJ0KSB7XG5cdFx0XHRcdGNvbnN0IGFJZ25vcmVkTGFiZWxzID0gTWVzc2FnZVN0cmlwLmdldExhYmVscyhcblx0XHRcdFx0XHRhSWdub3JlZEZpZWxkcyxcblx0XHRcdFx0XHRvRmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0XHRcdG9GaWx0ZXJCYXIsXG5cdFx0XHRcdFx0dGhpcy5vUmVzb3VyY2VCdW5kbGUgYXMgUmVzb3VyY2VCdW5kbGVcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3QgYklzU2VhcmNoSWdub3JlZCA9ICFvQXBwbHlTdXBwb3J0ZWQuZW5hYmxlU2VhcmNoO1xuXHRcdFx0XHRzVGV4dCA9IGJJc0NoYXJ0XG5cdFx0XHRcdFx0PyBNZXNzYWdlU3RyaXAuZ2V0QUxQVGV4dChhSWdub3JlZExhYmVscywgb0ZpbHRlckJhciwgYklzU2VhcmNoSWdub3JlZClcblx0XHRcdFx0XHQ6IE1lc3NhZ2VTdHJpcC5nZXRUZXh0KGFJZ25vcmVkTGFiZWxzLCBvRmlsdGVyQmFyLCBcIlwiLCBEZWxlZ2F0ZVV0aWwuZ2V0TG9jYWxpemVkVGV4dCk7XG5cdFx0XHRcdHJldHVybiBzVGV4dDtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RSZXBvcnRDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEyREEsSUFBTUEsbUJBQW1CLEdBQUdDLFdBQVcsQ0FBQ0QsbUJBQW1CO0lBQzFERSxlQUFlLEdBQUdELFdBQVcsQ0FBQ0MsZUFBZTtFQUFDLElBR3pDQyxvQkFBb0IsV0FEekJDLGNBQWMsQ0FBQyxrREFBa0QsQ0FBQyxVQUVqRUMsY0FBYyxDQUNkQyxlQUFlLENBQUNDLFFBQVEsQ0FBQztJQUN4QkMsY0FBYyxFQUFFLFlBQWlDO01BQy9DLElBQUksQ0FBQ0MsT0FBTyxFQUFFLENBQUNDLGFBQWEsRUFBRSxDQUEwQkMsZUFBZSxFQUFFO0lBQzNFO0VBQ0QsQ0FBQyxDQUFDLENBQ0YsVUFFQU4sY0FBYyxDQUNkTyw2QkFBNkIsQ0FBQ0wsUUFBUSxDQUFDO0lBQ3RDTSxZQUFZLEVBQUUsWUFBK0M7TUFDNUQsT0FBUSxJQUFJLENBQUNDLElBQUksQ0FBMEJDLG1CQUFtQixFQUFFO0lBQ2pFO0VBQ0QsQ0FBQyxDQUFDLENBQ0YsVUFFQVYsY0FBYyxDQUFDVyxXQUFXLENBQUMsVUFHM0JYLGNBQWMsQ0FBQ1kscUJBQXFCLENBQUNWLFFBQVEsQ0FBQ1csNkJBQTZCLENBQUMsQ0FBQyxVQUc3RWIsY0FBYyxDQUFDYyxLQUFLLENBQUNaLFFBQVEsQ0FBQ2EsY0FBYyxDQUFDLENBQUMsVUFHOUNmLGNBQWMsQ0FBQ2dCLFFBQVEsQ0FBQ2QsUUFBUSxDQUFDZSxpQkFBaUIsQ0FBQyxDQUFDLFVBR3BEakIsY0FBYyxDQUFDa0IsU0FBUyxDQUFDaEIsUUFBUSxDQUFDaUIsa0JBQWtCLENBQUMsQ0FBQyxVQUd0RG5CLGNBQWMsQ0FBQ29CLGFBQWEsQ0FBQyxXQUU3QnBCLGNBQWMsQ0FBQ3FCLFdBQVcsQ0FBQyxXQUUzQnJCLGNBQWMsQ0FBQ3NCLFFBQVEsQ0FBQyxXQVN4QkMsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0EyR2hCQyxnQkFBZ0IsRUFBRSxXQUNsQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFdBcUNuQ0wsZUFBZSxFQUFFLFdBQ2pCRyxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLENBQUMsV0FjbkNMLGVBQWUsRUFBRSxXQUNqQkcsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBLE1BeVhwQ0MsUUFBUSxHQUFHO1FBQ1ZDLGNBQWMsY0FBNkI7VUFDMUMsSUFBSSxDQUFDQyxvQkFBb0IsRUFBRSxDQUFDQyxhQUFhLEVBQUU7UUFDNUMsQ0FBQztRQUNEQyxnQkFBZ0IsWUFBNkJDLE1BQVcsRUFBRTtVQUN6RCxJQUFNQyxVQUFVLEdBQUcsSUFBSSxDQUFDSixvQkFBb0IsRUFBRTtVQUM5QyxJQUFJSSxVQUFVLEVBQUU7WUFDZixJQUFNQyxxQkFBcUIsR0FBRyxJQUFJLENBQUNoQyxPQUFPLEVBQUUsQ0FBQ2lDLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7WUFDbEc7WUFDQSxJQUFJLENBQUNDLGdCQUFnQixFQUFFO1lBQ3ZCLElBQU1DLGtCQUFrQixHQUFHSixVQUFVLENBQUNLLHNCQUFzQixFQUFFLENBQUNDLFdBQVc7WUFDMUUsSUFBTUMsb0JBQW9CLEdBQUlDLGFBQWEsQ0FBU0MsYUFBYSxDQUFDTCxrQkFBa0IsQ0FBQztZQUNyRixJQUFJRyxvQkFBb0IsRUFBRTtjQUFBO2NBQ3pCLHNCQUFDLElBQUksQ0FBQ3RDLE9BQU8sRUFBRSxDQUFDeUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLHVEQUE5QyxtQkFBcUVDLFFBQVEsQ0FBQ0osb0JBQW9CLENBQUM7WUFDcEcsQ0FBQyxNQUFNO2NBQUE7Y0FDTix1QkFBQyxJQUFJLENBQUN0QyxPQUFPLEVBQUUsQ0FBQ3lDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyx3REFBOUMsb0JBQXFFRSxPQUFPLENBQUNSLGtCQUFrQixDQUFDO1lBQ2pHO1lBQ0EsSUFBSUwsTUFBTSxDQUFDYyxZQUFZLENBQUMsaUJBQWlCLENBQUMsRUFBRTtjQUMzQ1oscUJBQXFCLENBQUNhLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUM7WUFDN0Q7VUFDRDtRQUNELENBQUM7UUFDREMsaUJBQWlCLFlBQTZCaEIsTUFBVyxFQUFFO1VBQUE7VUFDMUQsSUFBTWlCLEdBQUcsR0FBR2pCLE1BQU0sQ0FBQ2tCLFNBQVMsRUFBRTtVQUM5QixJQUFNQyxpQkFBaUIsR0FBR25CLE1BQU0sQ0FBQ2MsWUFBWSxDQUFDLEtBQUssQ0FBQztVQUNwRCxJQUFNTSxpQkFBaUIsR0FBRyxJQUFJLENBQUNDLG9CQUFvQixFQUFFO1VBRXJELElBQUlELGlCQUFpQixJQUFJLEVBQUNILEdBQUcsYUFBSEEsR0FBRyxlQUFIQSxHQUFHLENBQUVLLFNBQVMsRUFBRSxDQUFDQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsR0FBRTtZQUMzRTtZQUNBSCxpQkFBaUIsYUFBakJBLGlCQUFpQix1QkFBakJBLGlCQUFpQixDQUFFSSxpQkFBaUIsRUFBRTtZQUN0Q0osaUJBQWlCLGFBQWpCQSxpQkFBaUIsdUJBQWpCQSxpQkFBaUIsQ0FBRUssZ0JBQWdCLENBQUMsSUFBSSxDQUFDO1VBQzFDOztVQUVBO1VBQ0FDLFVBQVUsQ0FBQyxZQUFNO1lBQ2hCLElBQUksTUFBSSxDQUFDQyx3QkFBd0IsQ0FBQ1YsR0FBRyxDQUFDLEVBQUU7Y0FDdkM7Y0FDQSxPQUFPLE1BQUksQ0FBQ3BCLG9CQUFvQixFQUFFLENBQUNDLGFBQWEsRUFBRTtZQUNuRCxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQUksQ0FBQzhCLCtCQUErQixDQUFDWCxHQUFHLEVBQUVFLGlCQUFpQixDQUFDLEVBQUU7Y0FDekUsTUFBSSxDQUFDVSxlQUFlLEVBQUUsQ0FBQ0MsY0FBYyxFQUFFO1lBQ3hDO1VBQ0QsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUM7UUFDREMsY0FBYyxjQUE2QjtVQUFBO1VBQzFDO1VBQ0FMLFVBQVUsQ0FBQyxZQUFNO1lBQ2hCLE1BQUksQ0FBQ0csZUFBZSxFQUFFLENBQUNDLGNBQWMsRUFBRTtVQUN4QyxDQUFDLEVBQUUsSUFBSSxDQUFDO1FBQ1QsQ0FBQztRQUNERSxRQUFRLGNBQTZCO1VBQUE7VUFDcEMsSUFBTS9CLFVBQVUsR0FBRyxJQUFJLENBQUNKLG9CQUFvQixFQUFFO1VBQzlDLElBQU1LLHFCQUFxQixHQUFHLElBQUksQ0FBQ2hDLE9BQU8sRUFBRSxDQUFDaUMsaUJBQWlCLENBQUMsVUFBVSxDQUF5QjtVQUNsRyxJQUFNOEIsU0FBUyxHQUFHLElBQUksQ0FBQ0MsZUFBZSxFQUFFO1VBQ3hDLElBQU1DLFVBQVUsR0FBR0MsV0FBVyxDQUFDQyx1QkFBdUIsQ0FBQ3BDLFVBQVUsQ0FBQ3FDLGFBQWEsRUFBRSxDQUFDO1VBQ2xGcEMscUJBQXFCLENBQUNhLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUM7VUFDN0RiLHFCQUFxQixDQUFDYSxXQUFXLENBQUMsZUFBZSxFQUFFb0IsVUFBVSxDQUFDO1VBRTlELElBQUksQ0FBQyxJQUFJLENBQUNkLG9CQUFvQixFQUFFLEVBQUU7WUFDakMsSUFBSSxDQUFDa0IsNkJBQTZCLENBQUNyQyxxQkFBcUIsRUFBRUQsVUFBVSxDQUFDO1VBQ3RFO1VBQ0EsSUFBSWdDLFNBQVMsRUFBRTtZQUNkO1lBQ0NBLFNBQVMsQ0FBQzlCLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUEwQlksV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVyRixJQUFNeUIseUJBQXlCLEdBQUdQLFNBQVMsQ0FBQzlCLGlCQUFpQixDQUFDLGNBQWMsQ0FBeUI7WUFDckcsSUFBTXNDLG9CQUFvQixHQUFHRCx5QkFBeUIsQ0FBQ0UsV0FBVyxXQUFJRix5QkFBeUIsQ0FBQ0csT0FBTyxFQUFFLHFCQUFrQjtZQUMzSCxJQUFJRixvQkFBb0IsS0FBS2hGLG1CQUFtQixDQUFDbUYsS0FBSyxFQUFFO2NBQ3ZELElBQUksQ0FBQ0Msc0JBQXNCLEdBQUcsSUFBSTtZQUNuQztZQUNBLElBQUlKLG9CQUFvQixLQUFLaEYsbUJBQW1CLENBQUNxRixLQUFLLEVBQUU7Y0FDdkQsSUFBSSxDQUFDQyxzQkFBc0IsR0FBRyxJQUFJO1lBQ25DO1VBQ0Q7VUFDQTtVQUNBQyxTQUFTLENBQUNDLHFCQUFxQixDQUFDaEQsVUFBVSxDQUFDLENBQ3pDaUQsSUFBSSxDQUFDLFVBQUNDLGNBQW1CLEVBQUs7WUFDOUIsTUFBSSxDQUFDQyxtQkFBbUIsR0FBR0QsY0FBYyxDQUFDRSxNQUFNO1VBQ2pELENBQUMsQ0FBQyxDQUNEQyxLQUFLLENBQUMsVUFBVUMsTUFBVyxFQUFFO1lBQzdCQyxHQUFHLENBQUNDLEtBQUssQ0FBQywyQ0FBMkMsRUFBRUYsTUFBTSxDQUFDO1VBQy9ELENBQUMsQ0FBQztVQUNILElBQUssSUFBSSxDQUFDckYsT0FBTyxFQUFFLENBQUN3RixXQUFXLEVBQUUsQ0FBU0MsUUFBUSxLQUFLLEtBQUssRUFBRTtZQUM3RCxJQUFJLENBQUM5QixlQUFlLEVBQUUsQ0FBQ0MsY0FBYyxFQUFFO1VBQ3hDO1VBRUEsSUFBSThCLE1BQU0sQ0FBQ0MsS0FBSyxFQUFFO1lBQ2pCLElBQU1DLFlBQVksR0FBRyxJQUFJLENBQUNDLDRCQUE0QixFQUFFO1lBQ3hERCxZQUFZLENBQUNFLGlCQUFpQixDQUFDLEtBQUssQ0FBQztVQUN0QztRQUNELENBQUM7UUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO1FBQ0VDLDhCQUE4QixZQUM3QkMsV0FBaUMsRUFDakNDLGVBQXVCLEVBQ3ZCQyxRQUFtQixFQUNuQkMsV0FBbUIsRUFDbEI7VUFDRCxPQUFPSCxXQUFXLENBQUNJLHNCQUFzQixDQUFDTCw4QkFBOEIsQ0FBQ0MsV0FBVyxFQUFFQyxlQUFlLEVBQUVDLFFBQVEsRUFBRUMsV0FBVyxDQUFDO1FBQzlILENBQUM7UUFDREUsdUJBQXVCLFlBQTZCdkUsTUFBVyxFQUFFO1VBQ2hFLElBQU1pQyxTQUFTLEdBQUdqQyxNQUFNLENBQUNrQixTQUFTLEVBQUUsQ0FBQ3NELFVBQVUsRUFBRTtZQUNoREMsTUFBTSxHQUFHLElBQUksQ0FBQ0MsU0FBUyxFQUFFO1lBQ3pCQyxLQUFLLEdBQUczRSxNQUFNLENBQUNjLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDbkNaLHFCQUFxQixHQUFHLElBQUksQ0FBQ2hDLE9BQU8sRUFBRSxDQUFDaUMsaUJBQWlCLENBQUMsVUFBVSxDQUF5QjtVQUM3RixJQUFJd0UsS0FBSyxFQUFFO1lBQ1Y7WUFDQUMsWUFBWSxDQUFDQyxhQUFhLENBQUM3RSxNQUFNLENBQUM7WUFDbEM7WUFDQThFLFVBQVUsQ0FBQ0MsZUFBZSxDQUFDOUMsU0FBUyxDQUFDO1VBQ3RDO1VBQ0EsSUFBTVEsb0JBQW9CLEdBQUd2QyxxQkFBcUIsQ0FBQ3dDLFdBQVcsV0FBSXhDLHFCQUFxQixDQUFDeUMsT0FBTyxFQUFFLHFCQUFrQjtVQUNuSCxJQUFJRixvQkFBb0IsS0FBS2hGLG1CQUFtQixDQUFDbUYsS0FBSyxFQUFFO1lBQ3ZELElBQUksQ0FBQ0Msc0JBQXNCLEdBQUcsSUFBSTtVQUNuQyxDQUFDLE1BQU0sSUFBSTRCLE1BQU0sRUFBRTtZQUNqQkEsTUFBTSxDQUFTTyxNQUFNLEVBQUU7WUFDeEIsSUFBSSxDQUFDbkMsc0JBQXNCLEdBQUcsS0FBSztVQUNwQztRQUNELENBQUM7UUFDRG9DLHdCQUF3QixZQUE2QmpGLE1BQVcsRUFBRTtVQUNqRSxJQUFNa0YsWUFBWSxHQUFHbEYsTUFBTSxDQUFDbUYsV0FBVyxDQUFDQyxHQUFHLEdBQUdwRixNQUFNLENBQUNtRixXQUFXLENBQUNDLEdBQUcsR0FBRyxJQUFJO1VBQzNFLElBQU1sRixxQkFBcUIsR0FBRyxJQUFJLENBQUNoQyxPQUFPLEVBQUUsQ0FBQ2lDLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7VUFDbEdELHFCQUFxQixDQUFDYSxXQUFXLENBQUMsZ0JBQWdCLEVBQUVtRSxZQUFZLENBQUM7VUFDakUsSUFBTUcsTUFBTSxHQUFHLElBQUksQ0FBQ25ELGVBQWUsRUFBRTtVQUNyQyxJQUFNdUMsTUFBTSxHQUFHLElBQUksQ0FBQ0MsU0FBUyxFQUFFO1VBQy9CLElBQU1ZLHdCQUF3QixHQUFHO1lBQ2hDQyxnQkFBZ0IsY0FBRztjQUNsQixJQUFNQyxNQUFNLEdBQUdDLGdCQUFnQixDQUFDQyxRQUFRLEVBQUU7Y0FDMUNGLE1BQU0sQ0FBQ0csT0FBTyxDQUFDLFVBQVVDLEtBQVUsRUFBRTtnQkFDcEMsSUFBSUEsS0FBSyxDQUFDQyxNQUFNLEVBQUUsS0FBS1gsWUFBWSxFQUFFO2tCQUNwQ1UsS0FBSyxDQUFDRSxLQUFLLEVBQUU7Z0JBQ2Q7Y0FDRCxDQUFDLENBQUM7Y0FDRkwsZ0JBQWdCLENBQUNNLG1CQUFtQixDQUFDVCx3QkFBd0IsQ0FBQztZQUMvRDtVQUNELENBQUM7VUFDRCxJQUFNRyxnQkFBZ0IsR0FDckJQLFlBQVksS0FBS3pILG1CQUFtQixDQUFDcUYsS0FBSyxHQUFHLElBQUksQ0FBQ2tELG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQ0EsbUJBQW1CLENBQUMsT0FBTyxDQUM5RjtVQUNwQixJQUFJUCxnQkFBZ0IsS0FBS3pGLE1BQU0sQ0FBQ2tCLFNBQVMsRUFBRSxFQUFFO1lBQzVDdUUsZ0JBQWdCLENBQUNRLGdCQUFnQixDQUFDWCx3QkFBd0IsQ0FBQztVQUM1RDtVQUNBLFFBQVFKLFlBQVk7WUFDbkIsS0FBS3pILG1CQUFtQixDQUFDcUYsS0FBSztjQUM3QixJQUFJLENBQUNvRCxZQUFZLENBQUN6QixNQUFNLENBQUM7Y0FDekI7WUFDRCxLQUFLaEgsbUJBQW1CLENBQUNtRixLQUFLO2NBQzdCLElBQUksQ0FBQ3VELFlBQVksQ0FBQ2QsTUFBTSxDQUFDO2NBQ3pCO1lBQ0QsS0FBSzVILG1CQUFtQixDQUFDMkksTUFBTTtjQUM5QixJQUFJLENBQUNGLFlBQVksQ0FBQ3pCLE1BQU0sQ0FBQztjQUN6QixJQUFJLENBQUMwQixZQUFZLENBQUNkLE1BQU0sQ0FBQztjQUN6QjtZQUNEO2NBQ0M7VUFBTTtVQUVSLElBQUksQ0FBQ3hELGVBQWUsRUFBRSxDQUFDQyxjQUFjLEVBQUU7UUFDeEMsQ0FBQztRQUNEdUUsK0JBQStCLFlBQTZCckcsTUFBVyxFQUFFO1VBQ3hFLElBQU1zRyxTQUFTLEdBQUd0RyxNQUFNLENBQUNjLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTO1VBQzFELElBQUksQ0FBQ2pCLG9CQUFvQixFQUFFLENBQUMwRyxVQUFVLENBQUNELFNBQVMsQ0FBQztVQUNoRCxJQUFJLENBQUNFLDBCQUEwQixFQUFFLENBQWFELFVBQVUsQ0FBQyxDQUFDRCxTQUFTLENBQUM7UUFDdEUsQ0FBQztRQUNERyxhQUFhLGNBQTZCO1VBQ3pDLElBQUksQ0FBQzVFLGVBQWUsRUFBRSxDQUFDQyxjQUFjLEVBQUU7UUFDeEMsQ0FBQztRQUNENEUsOEJBQThCLFlBQTZCMUcsTUFBVyxFQUFFO1VBQ3ZFLElBQU0yRyxTQUFjLEdBQUcsSUFBSSxDQUFDOUcsb0JBQW9CLEVBQUU7VUFDbEQsSUFBSThHLFNBQVMsSUFBSUEsU0FBUyxDQUFDQyxrQkFBa0IsRUFBRSxFQUFFO1lBQ2hELElBQUk1RyxNQUFNLENBQUNjLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRTtjQUN0QzZGLFNBQVMsQ0FBQ0Msa0JBQWtCLEVBQUUsQ0FBQ0wsVUFBVSxDQUFDLElBQUksQ0FBQztZQUNoRCxDQUFDLE1BQU07Y0FDTkksU0FBUyxDQUFDQyxrQkFBa0IsRUFBRSxDQUFDTCxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQ2pEO1VBQ0Q7UUFDRDtNQUNELENBQUM7TUFBQSxNQUNETSxVQUFVLEdBQUc7UUFDWkMseUJBQXlCLFlBQTZCQyxjQUFxQixFQUFFQyxRQUFhLEVBQUVDLGVBQXFCLEVBQUU7VUFDbEgsSUFBSUMsS0FBSyxHQUFHLEVBQUU7VUFDZEYsUUFBUSxHQUFHQSxRQUFRLEtBQUssTUFBTSxJQUFJQSxRQUFRLEtBQUssSUFBSTtVQUNuRCxJQUFNL0csVUFBVSxHQUFHLElBQUksQ0FBQ0osb0JBQW9CLEVBQUU7VUFDOUMsSUFBSUksVUFBVSxJQUFJa0gsS0FBSyxDQUFDQyxPQUFPLENBQUNMLGNBQWMsQ0FBQyxJQUFJQSxjQUFjLENBQUNNLE1BQU0sR0FBRyxDQUFDLElBQUlMLFFBQVEsRUFBRTtZQUN6RixJQUFNTSxjQUFjLEdBQUdDLFlBQVksQ0FBQ0MsU0FBUyxDQUM1Q1QsY0FBYyxFQUNkOUcsVUFBVSxDQUFDd0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUM3QnhILFVBQVUsRUFDVixJQUFJLENBQUN5SCxlQUFlLENBQ3BCO1lBQ0QsSUFBTUMsZ0JBQWdCLEdBQUcsQ0FBQ1YsZUFBZSxDQUFDVyxZQUFZO1lBQ3REVixLQUFLLEdBQUdGLFFBQVEsR0FDYk8sWUFBWSxDQUFDTSxVQUFVLENBQUNQLGNBQWMsRUFBRXJILFVBQVUsRUFBRTBILGdCQUFnQixDQUFDLEdBQ3JFSixZQUFZLENBQUNPLE9BQU8sQ0FBQ1IsY0FBYyxFQUFFckgsVUFBVSxFQUFFLEVBQUUsRUFBRThILFlBQVksQ0FBQ0MsZ0JBQWdCLENBQUM7WUFDdEYsT0FBT2QsS0FBSztVQUNiO1FBQ0Q7TUFDRCxDQUFDO01BQUE7SUFBQTtJQUFBO0lBQUEsT0F0dUJEckYsZUFBZSxHQUZmLDJCQUVnQztNQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDb0csWUFBWSxFQUFFO1FBQ3ZCLElBQUksQ0FBQ0EsWUFBWSxHQUFHLElBQUlDLFlBQVksQ0FBQyxJQUFJLENBQUM7TUFDM0M7TUFDQSxPQUFPLElBQUksQ0FBQ0QsWUFBWTtJQUN6QixDQUFDO0lBQUEsT0FFREUsTUFBTSxHQUFOLGtCQUFTO01BQ1JDLGNBQWMsQ0FBQ0MsU0FBUyxDQUFDRixNQUFNLENBQUNHLEtBQUssQ0FBQyxJQUFJLENBQUM7TUFDM0MsSUFBTXBJLHFCQUFxQixHQUFHLElBQUksQ0FBQ2hDLE9BQU8sRUFBRSxDQUFDaUMsaUJBQWlCLENBQUMsVUFBVSxDQUF5QjtNQUVsR0QscUJBQXFCLENBQUNhLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUM7TUFDNURiLHFCQUFxQixDQUFDYSxXQUFXLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQztNQUN6RGIscUJBQXFCLENBQUNhLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDNUNiLHFCQUFxQixDQUFDYSxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ3BEYixxQkFBcUIsQ0FBQ2EsV0FBVyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO01BQzFEYixxQkFBcUIsQ0FBQ2EsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUVqRCxJQUFJLElBQUksQ0FBQ3dILHVCQUF1QixFQUFFLEVBQUU7UUFDbkMsSUFBSUMsY0FBYyxHQUFHLElBQUksQ0FBQ0MsZUFBZSxFQUFFO1FBQzNDLElBQUksQ0FBQzdFLE1BQU0sQ0FBQzhFLE9BQU8sSUFBSUYsY0FBYyxLQUFLL0ssbUJBQW1CLENBQUMySSxNQUFNLEVBQUU7VUFDckVvQyxjQUFjLEdBQUcvSyxtQkFBbUIsQ0FBQ21GLEtBQUs7UUFDM0M7UUFDQTFDLHFCQUFxQixDQUFDYSxXQUFXLENBQUMsZ0JBQWdCLEVBQUV5SCxjQUFjLENBQUM7TUFDcEU7O01BRUE7TUFDQTtNQUNBLElBQUksQ0FBQ3BGLG1CQUFtQixHQUFHLENBQUMsQ0FBQzs7TUFFN0I7TUFDQTtNQUNBLElBQUksQ0FBQ3VGLGVBQWUsRUFBRSxDQUFDQyxjQUFjLEVBQUUsQ0FBQ0MsaUNBQWlDLEVBQUU7O01BRTNFO01BQ0EsSUFBSSxDQUFDQyxZQUFZLEVBQUU7SUFDcEIsQ0FBQztJQUFBLE9BRURDLE1BQU0sR0FBTixrQkFBUztNQUNSLE9BQU8sSUFBSSxDQUFDM0YsbUJBQW1CO01BQy9CLElBQUksSUFBSSxDQUFDNkUsWUFBWSxFQUFFO1FBQ3RCLElBQUksQ0FBQ0EsWUFBWSxDQUFDZSxPQUFPLEVBQUU7TUFDNUI7TUFDQSxPQUFPLElBQUksQ0FBQ2YsWUFBWTtJQUN6QixDQUFDO0lBQUEsT0FFRDdKLGVBQWUsR0FBZiwyQkFBa0I7TUFBQTtNQUNqQixJQUFNNkssT0FBTyxHQUFHLElBQUksQ0FBQ0MsWUFBWSxDQUFDLE9BQU8sQ0FBQztNQUMxQyxJQUFJQyxTQUFTLENBQUNDLGdCQUFnQixFQUFFLEVBQUU7UUFBQTtRQUNqQyw2QkFBSSxDQUFDL0gsb0JBQW9CLEVBQUUsMERBQTNCLHNCQUE2QkcsaUJBQWlCLEVBQUU7UUFDaEQsSUFBTTZILGFBQWEsc0JBQUcsSUFBSSxDQUFDM0UsU0FBUyxFQUFFLG9EQUFoQixnQkFBa0I0RSxhQUFhLEVBQUU7UUFDdkQsSUFBSUQsYUFBYSxFQUFFO1VBQ2xCLElBQUlFLFdBQVcsQ0FBQ1osZUFBZSxDQUFDLElBQUksQ0FBQ3pLLE9BQU8sRUFBRSxDQUFDLENBQUNzTCxhQUFhLEVBQUUsRUFBRTtZQUNoRTtZQUNBSCxhQUFhLENBQUNJLE9BQU8sRUFBRTtVQUN4QixDQUFDLE1BQU07WUFDTixJQUFJLENBQUMsSUFBSSxDQUFDQyxZQUFZLEVBQUU7Y0FDdkIsSUFBSSxDQUFDQSxZQUFZLEdBQUdoSSxVQUFVLENBQUMsWUFBTTtnQkFDcEMySCxhQUFhLENBQUNJLE9BQU8sRUFBRTtnQkFDdkIsT0FBTyxNQUFJLENBQUNDLFlBQVk7Y0FDekIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNOOztZQUVBO1lBQ0EsSUFBTUMsb0JBQW9CLEdBQUcsWUFBTTtjQUNsQyxNQUFJLENBQUNDLG1CQUFtQixDQUFDWCxPQUFPLENBQUM7Y0FDakNJLGFBQWEsQ0FBQ1Esa0JBQWtCLENBQUNGLG9CQUFvQixDQUFDO1lBQ3ZELENBQUM7WUFDRE4sYUFBYSxDQUFDUyxrQkFBa0IsQ0FBQ0gsb0JBQW9CLENBQUM7VUFDdkQ7UUFDRDtRQUNBUixTQUFTLENBQUNZLHFCQUFxQixFQUFFO01BQ2xDO01BRUEsSUFBSSxDQUFDLElBQUksQ0FBQ0wsWUFBWSxFQUFFO1FBQ3ZCLElBQUksQ0FBQ0UsbUJBQW1CLENBQUNYLE9BQU8sQ0FBQztNQUNsQztNQUVBLElBQUksQ0FBQ2UsU0FBUyxDQUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDdEIsZUFBZSxFQUFFLENBQUN1QixrQkFBa0IsRUFBRSxDQUFDQyxhQUFhLEVBQUUsQ0FBQztJQUNwRixDQUFDO0lBQUEsT0FFREMsaUJBQWlCLEdBQWpCLDZCQUFvQjtNQUNuQmhDLGNBQWMsQ0FBQ0MsU0FBUyxDQUFDK0IsaUJBQWlCLENBQUM5QixLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3ZELENBQUM7SUFBQSxPQUVEL0MsZ0JBQWdCLEdBQWhCLDRCQUFtQjtNQUFBO01BQ2hCLElBQUksQ0FBQ3JILE9BQU8sRUFBRSxDQUFDbU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFtQkMsaUJBQWlCLEVBQUUsQ0FDNUVwSCxJQUFJLENBQUMsVUFBQ3FILFFBQWEsRUFBSztRQUN4QixNQUFJLENBQUM3QyxlQUFlLEdBQUc2QyxRQUFRO1FBQy9CLElBQU10QixPQUFPLEdBQUcsTUFBSSxDQUFDQyxZQUFZLEVBQWE7UUFDOUMsSUFBTXNCLFVBQVUsR0FBSSxNQUFJLENBQUN0TSxPQUFPLEVBQUUsQ0FBQ3dGLFdBQVcsRUFBRSxDQUFTK0csU0FBUztRQUNsRSxJQUFNdkQsS0FBSyxHQUFHcUMsV0FBVyxDQUFDbUIsaUJBQWlCLENBQzFDLGdDQUFnQyxFQUNoQyxNQUFJLENBQUNoRCxlQUFlLEVBQ3BCaUQsU0FBUyxFQUNUSCxVQUFVLENBQ1Y7UUFDRHZCLE9BQU8sQ0FBQ3RELE9BQU8sQ0FBQyxVQUFVbEIsTUFBYSxFQUFFO1VBQ3hDQSxNQUFNLENBQUNtRyxTQUFTLENBQUMxRCxLQUFLLENBQUM7UUFDeEIsQ0FBQyxDQUFDO01BQ0gsQ0FBQyxDQUFDLENBQ0Q1RCxLQUFLLENBQUMsVUFBVUMsTUFBVyxFQUFFO1FBQzdCQyxHQUFHLENBQUNDLEtBQUssQ0FBQyw0Q0FBNEMsRUFBRUYsTUFBTSxDQUFDO01BQ2hFLENBQUMsQ0FBQztJQUNKLENBQUM7SUFBQSxPQUlEc0gsV0FBVyxHQUZYLHFCQUVZMUYsV0FBZ0IsRUFBRTtNQUM3QixJQUFJQSxXQUFXLENBQUMyRixVQUFVLEVBQUU7UUFDM0IsSUFBSSxDQUFDQyxnQkFBZ0IsRUFBRTtNQUN4QjtNQUNBO01BQ0EsSUFBSSxDQUFDcEMsZUFBZSxFQUFFLENBQUNxQyxnQkFBZ0IsRUFBRSxDQUFDQyxpQkFBaUIsQ0FBQ04sU0FBUyxDQUFDO0lBQ3ZFOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BM0JDO0lBQUE7SUE4QkE7SUFDQU8sa0JBQWtCLEdBSGxCLDRCQUdtQi9GLFdBQWdCLEVBQUU7TUFDcEM7SUFBQTs7SUFHRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxPQVVBL0UsZ0JBQWdCLEdBRmhCLDRCQUVtQjtNQUNsQjtJQUFBLENBQ0E7SUFBQSxPQUVENUIsbUJBQW1CLEdBQW5CLCtCQUFzQjtNQUFBO01BQ3JCLDJCQUFPLElBQUksQ0FBQ2tHLFNBQVMsRUFBRSxxREFBaEIsaUJBQWtCK0MsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMwRCxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQy9EOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQXZCLG1CQUFtQixHQUFuQiw2QkFBb0JYLE9BQVksRUFBRTtNQUNqQyxJQUFJbUMsV0FBa0IsR0FBRyxFQUFFO01BQzNCbkMsT0FBTyxDQUFDdEQsT0FBTyxDQUFDLFVBQVVsQixNQUFXLEVBQUU7UUFDdEMyRyxXQUFXLEdBQUc3QixXQUFXLENBQUM4QixhQUFhLENBQUM1RyxNQUFNLEVBQUUyRyxXQUFXLENBQUM7UUFDNUQ7UUFDQTtRQUNBLElBQU1sTCxxQkFBcUIsR0FBR3VFLE1BQU0sQ0FBQ3RFLGlCQUFpQixDQUFDLFVBQVUsQ0FBQztVQUNqRW1MLDRCQUE0QixHQUFHQyxJQUFJLENBQUNDLEtBQUssQ0FDeENDLFlBQVksQ0FBQ0MsZUFBZSxDQUFDM0QsWUFBWSxDQUFDNEQsYUFBYSxDQUFDbEgsTUFBTSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FDekY7VUFDRG1ILGlCQUFpQixHQUFHbkgsTUFBTSxDQUFDb0gsbUJBQW1CLEVBQUU7UUFFakQzTCxxQkFBcUIsQ0FBQ2EsV0FBVyxDQUFDLGtCQUFrQixFQUFFNkssaUJBQWlCLENBQUM7UUFDeEUxTCxxQkFBcUIsQ0FBQ2EsV0FBVyxDQUFDLDBCQUEwQixFQUFFNkssaUJBQWlCLENBQUN2RSxNQUFNLENBQUM7UUFDdkZ5RSxXQUFXLENBQUNDLHlDQUF5QyxDQUFDdEgsTUFBTSxFQUFFdkUscUJBQXFCLENBQUM7UUFDcEY4TCxhQUFhLENBQUNDLG1CQUFtQixDQUFDL0wscUJBQXFCLEVBQUVvTCw0QkFBNEIsRUFBRU0saUJBQWlCLEVBQUUsT0FBTyxDQUFDO01BQ25ILENBQUMsQ0FBQztNQUNGckMsV0FBVyxDQUFDMkMsc0NBQXNDLENBQUNkLFdBQVcsRUFBRSxJQUFJLENBQUNsTixPQUFPLEVBQUUsQ0FBQztJQUNoRjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FPQWlPLGtCQUFrQixHQUFsQiw0QkFBbUJDLFFBQWdCLEVBQUU7TUFDcEMsSUFBSSxDQUFDbEQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDdkQsT0FBTyxDQUFDLFVBQVVsQixNQUFXLEVBQUU7UUFDekQ0SCxhQUFhLENBQUNDLGdCQUFnQixDQUFDN0gsTUFBTSxFQUFFMkgsUUFBUSxDQUFDO01BQ2pELENBQUMsQ0FBQztJQUNIOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQXJCLGdCQUFnQixHQUFoQiw0QkFBbUI7TUFDbEIsSUFBTXdCLFdBQVcsR0FBRyxJQUFJLENBQUN4SSw0QkFBNEIsRUFBRTtRQUN0RHlJLGdCQUFnQixHQUFHRCxXQUFXLENBQUNFLGlCQUFpQixFQUFFO1FBQ2xEOUYsU0FBUyxHQUFHLElBQUksQ0FBQzlHLG9CQUFvQixFQUFTO01BQy9DLElBQUk4RyxTQUFTLEVBQUU7UUFDZCxJQUFJNkYsZ0JBQWdCLEVBQUU7VUFDckI7VUFDQSxJQUFJLENBQUM3RixTQUFTLENBQUMrRixlQUFlLEVBQUUsRUFBRTtZQUNqQy9GLFNBQVMsQ0FBQ2dHLGVBQWUsQ0FBQyxJQUFJLENBQUM7VUFDaEM7VUFDQSxJQUFNQyx3QkFBd0IsR0FBR2pHLFNBQVMsQ0FBQ2tHLGNBQWMsRUFBRSxDQUFDQyxJQUFJLENBQUMsVUFBVUMsV0FBZ0IsRUFBRTtZQUM1RixPQUFPQSxXQUFXLENBQUNDLFdBQVcsRUFBRSxJQUFJRCxXQUFXLENBQUN6SyxhQUFhLEVBQUUsQ0FBQytFLE1BQU0sS0FBSyxDQUFDO1VBQzdFLENBQUMsQ0FBQztVQUNGO1VBQ0EsSUFBSXVGLHdCQUF3QixFQUFFO1lBQzdCQSx3QkFBd0IsQ0FBQzlHLEtBQUssRUFBRTtVQUNqQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUNtSCxrQkFBa0IsRUFBRSxFQUFFO1lBQ3JDdEcsU0FBUyxDQUFDa0csY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMvRyxLQUFLLEVBQUU7VUFDdEMsQ0FBQyxNQUFNO1lBQ047WUFDQSxJQUFJLENBQUM1SCxPQUFPLEVBQUUsQ0FBQ3lDLElBQUksV0FBSSxJQUFJLENBQUN1TSxzQkFBc0IsRUFBRSxnQkFBYSxDQUFDcEgsS0FBSyxFQUFFO1VBQzFFO1FBQ0QsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDbUgsa0JBQWtCLEVBQUUsRUFBRTtVQUFBO1VBQ3JDLHdCQUFJLENBQUN2SSxTQUFTLEVBQUUscURBQWhCLGlCQUFrQnlJLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUI7TUFDRCxDQUFDLE1BQU07UUFBQTtRQUNOLHdCQUFJLENBQUN6SSxTQUFTLEVBQUUscURBQWhCLGlCQUFrQnlJLFFBQVEsQ0FBQyxDQUFDLENBQUM7TUFDOUI7SUFDRCxDQUFDO0lBQUEsT0FFREMsd0JBQXdCLEdBQXhCLG9DQUEyQjtNQUMxQixJQUFNQyxjQUFjLEdBQUcsSUFBSSxDQUFDMUUsZUFBZSxFQUFFLENBQUMyRSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7TUFDekUsT0FBTztRQUNOQyxLQUFLLEVBQUVGLGNBQWMsQ0FBQ0UsS0FBSztRQUMzQkMsUUFBUSxFQUFFSCxjQUFjLENBQUNJLFdBQVcsSUFBSSxFQUFFO1FBQzFDQyxNQUFNLEVBQUUsRUFBRTtRQUNWQyxJQUFJLEVBQUU7TUFDUCxDQUFDO0lBQ0YsQ0FBQztJQUFBLE9BRUQ5TixvQkFBb0IsR0FBcEIsZ0NBQXVCO01BQ3RCLE9BQU8sSUFBSSxDQUFDM0IsT0FBTyxFQUFFLENBQUN5QyxJQUFJLENBQUMsSUFBSSxDQUFDdU0sc0JBQXNCLEVBQUUsQ0FBQztJQUMxRCxDQUFDO0lBQUEsT0FFRG5KLDRCQUE0QixHQUE1Qix3Q0FBK0I7TUFDOUIsT0FBTyxJQUFJLENBQUM3RixPQUFPLEVBQUUsQ0FBQ3lDLElBQUksQ0FBQyxJQUFJLENBQUNpTiw4QkFBOEIsRUFBRSxDQUFDO0lBQ2xFLENBQUM7SUFBQSxPQUVEQyw4QkFBOEIsR0FBOUIsMENBQWlDO01BQ2hDO01BQ0E7TUFDQSxJQUFNQyxtQkFBbUIsR0FBSSxJQUFJLENBQUNqTyxvQkFBb0IsRUFBRSxDQUFTa08sZ0JBQWdCLEVBQUU7TUFDbkYsT0FBT0QsbUJBQW1CLGFBQW5CQSxtQkFBbUIsZUFBbkJBLG1CQUFtQixDQUFFeE0sU0FBUyxFQUFFLEdBQUd3TSxtQkFBbUIsR0FBR25ELFNBQVM7SUFDMUUsQ0FBQztJQUFBLE9BRUQzRSxtQkFBbUIsR0FBbkIsNkJBQW9CZ0ksUUFBYSxFQUFFO01BQUE7TUFDbEMsSUFBTUMsa0JBQWtCLFdBQUlELFFBQVEsS0FBSyxPQUFPLEdBQUcsSUFBSSxDQUFDOUwsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDd0MsU0FBUyxFQUFFLHlDQUFqRSxLQUFvRStDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztNQUN4SCxPQUFPLElBQUksQ0FBQ3ZKLE9BQU8sRUFBRSxDQUFDeUMsSUFBSSxDQUFDc04sa0JBQWtCLENBQUM7SUFDL0MsQ0FBQztJQUFBLE9BRURDLGdDQUFnQyxHQUFoQywwQ0FBaUNDLEtBQWEsRUFBRTtNQUFBO01BQy9DLElBQU1DLFNBQVMsMEJBQUcsSUFBSSxDQUFDQyxhQUFhLEVBQUUsd0RBQXBCLG9CQUFzQjNMLFdBQVcsQ0FBQ3lMLEtBQUssQ0FBQztNQUMxRCxPQUFPQyxTQUFTLElBQUksSUFBSSxDQUFDbFEsT0FBTyxFQUFFLENBQUN5QyxJQUFJLENBQUN5TixTQUFTLENBQUM7SUFDbkQsQ0FBQztJQUFBLE9BRURDLGFBQWEsR0FBYix5QkFBdUM7TUFDdEMsSUFBTUMsYUFBYSxHQUFHQyxTQUFTLENBQUNDLG9CQUFvQixDQUFDLElBQUksQ0FBQ3RRLE9BQU8sRUFBRSxDQUFRO01BQzNFLE9BQU9vUSxhQUFhLENBQUNqRSxRQUFRLENBQUMsWUFBWSxDQUFDO0lBQzVDLENBQUM7SUFBQSxPQUVEdUQsOEJBQThCLEdBQTlCLDBDQUF5QztNQUFBO01BQ3hDLE9BQU8sNkJBQUksQ0FBQ1MsYUFBYSxFQUFFLHlEQUFwQixxQkFBc0IzTCxXQUFXLENBQUMsc0JBQXNCLENBQUMsS0FBSSxFQUFFO0lBQ3ZFLENBQUM7SUFBQSxPQUVEd0ssc0JBQXNCLEdBQXRCLGtDQUFpQztNQUFBO01BQ2hDLE9BQU8sNkJBQUksQ0FBQ21CLGFBQWEsRUFBRSx5REFBcEIscUJBQXNCM0wsV0FBVyxDQUFDLGNBQWMsQ0FBQyxLQUFJLEVBQUU7SUFDL0QsQ0FBQztJQUFBLE9BRURSLGVBQWUsR0FBZiwyQkFBa0I7TUFDakIsT0FBTyxJQUFJLENBQUNnTSxnQ0FBZ0MsQ0FBQyxnQkFBZ0IsQ0FBQztJQUMvRCxDQUFDO0lBQUEsT0FFRDFILDBCQUEwQixHQUExQixzQ0FBNkI7TUFDNUIsSUFBTWlJLGtCQUFrQixHQUFHQyxjQUFjLENBQUNDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUN6QixzQkFBc0IsRUFBRSxDQUFDLENBQUM7TUFDbkcsT0FBT3VCLGtCQUFrQixJQUFJLElBQUksQ0FBQ3ZRLE9BQU8sRUFBRSxDQUFDeUMsSUFBSSxDQUFDOE4sa0JBQWtCLENBQUM7SUFDckUsQ0FBQztJQUFBLE9BQ0RHLDJCQUEyQixHQUEzQix1Q0FBOEI7TUFDN0IsT0FBTyxJQUFJLENBQUNWLGdDQUFnQyxDQUFDLHVCQUF1QixDQUFDO0lBQ3RFLENBQUM7SUFBQSxPQUVEN00sb0JBQW9CLEdBQXBCLGdDQUF1QjtNQUN0QixPQUFPLElBQUksQ0FBQ25ELE9BQU8sRUFBRSxDQUFDeUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDO0lBQzNELENBQUM7SUFBQSxPQUVEK0QsU0FBUyxHQUFULHFCQUErQjtNQUM5QixJQUFJLElBQUksQ0FBQ21LLFlBQVksRUFBRSxFQUFFO1FBQUE7UUFDeEIsSUFBTUMsUUFBUSw2QkFBRyxJQUFJLENBQUN6TixvQkFBb0IsRUFBRSxxRkFBM0IsdUJBQTZCME4sdUJBQXVCLEVBQUUsMkRBQXRELHVCQUF3REMsT0FBTztRQUNoRixPQUFPRixRQUFRLGFBQVJBLFFBQVEsZUFBUkEsUUFBUSxDQUFFdk4sR0FBRyxDQUFDLGtCQUFrQixDQUFDLEdBQUl1TixRQUFRLEdBQWFuRSxTQUFTO01BQzNFLENBQUMsTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDdUQsZ0NBQWdDLENBQUMsZ0JBQWdCLENBQUM7TUFDL0Q7SUFDRCxDQUFDO0lBQUEsT0FDRGhGLFlBQVksR0FBWixzQkFBYStGLElBQVUsRUFBRTtNQUFBO01BQ3hCLElBQUksSUFBSSxDQUFDSixZQUFZLEVBQUUsRUFBRTtRQUN4QixJQUFNSyxTQUFnQixHQUFHLEVBQUU7UUFDM0IsSUFBTUMsYUFBYSxHQUFHLElBQUksQ0FBQzlOLG9CQUFvQixFQUFFLENBQUMyTixPQUFPO1FBQ3pERyxhQUFhLENBQUN6SixRQUFRLEVBQUUsQ0FBQ0MsT0FBTyxDQUFDLFVBQUNDLEtBQVUsRUFBSztVQUNoRCxJQUFNa0osUUFBUSxHQUFHLE1BQUksQ0FBQzVRLE9BQU8sRUFBRSxDQUFDeUMsSUFBSSxDQUFDaUYsS0FBSyxDQUFDQyxNQUFNLEVBQUUsQ0FBQztVQUNwRCxJQUFJaUosUUFBUSxJQUFJRyxJQUFJLEVBQUU7WUFDckIsSUFBSXJKLEtBQUssQ0FBQ0MsTUFBTSxFQUFFLENBQUN1SixPQUFPLGVBQVFILElBQUksRUFBRyxHQUFHLENBQUMsQ0FBQyxFQUFFO2NBQy9DQyxTQUFTLENBQUNHLElBQUksQ0FBQ1AsUUFBUSxDQUFDO1lBQ3pCO1VBQ0QsQ0FBQyxNQUFNLElBQUlBLFFBQVEsS0FBS25FLFNBQVMsSUFBSW1FLFFBQVEsS0FBSyxJQUFJLEVBQUU7WUFDdkRJLFNBQVMsQ0FBQ0csSUFBSSxDQUFDUCxRQUFRLENBQUM7VUFDekI7UUFDRCxDQUFDLENBQUM7UUFDRixPQUFPSSxTQUFTO01BQ2pCLENBQUMsTUFBTSxJQUFJRCxJQUFJLEtBQUssT0FBTyxFQUFFO1FBQzVCLElBQU01SixNQUFNLEdBQUcsSUFBSSxDQUFDbkQsZUFBZSxFQUFFO1FBQ3JDLE9BQU9tRCxNQUFNLEdBQUcsQ0FBQ0EsTUFBTSxDQUFDLEdBQUcsRUFBRTtNQUM5QixDQUFDLE1BQU07UUFDTixJQUFNWixNQUFNLEdBQUcsSUFBSSxDQUFDQyxTQUFTLEVBQUU7UUFDL0IsT0FBT0QsTUFBTSxHQUFHLENBQUNBLE1BQU0sQ0FBQyxHQUFHLEVBQUU7TUFDOUI7SUFDRCxDQUFDO0lBQUEsT0FFRGdFLGVBQWUsR0FBZiwyQkFBa0I7TUFBQTtNQUNqQixJQUFNNkcsV0FBVyxHQUFHQyxvQkFBb0IsQ0FBQ0MsY0FBYyxDQUFDLDZCQUFJLENBQUNuQixhQUFhLEVBQUUseURBQXBCLHFCQUFzQjNMLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSSxFQUFFLENBQUM7TUFDMUcsUUFBUTRNLFdBQVc7UUFDbEIsS0FBSyxTQUFTO1VBQ2IsT0FBTzdSLG1CQUFtQixDQUFDbUYsS0FBSztRQUNqQyxLQUFLLFdBQVc7VUFDZixPQUFPbkYsbUJBQW1CLENBQUNxRixLQUFLO1FBQ2pDLEtBQUssTUFBTTtRQUNYO1VBQ0MsT0FBT3JGLG1CQUFtQixDQUFDMkksTUFBTTtNQUFDO0lBRXJDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BeUksWUFBWSxHQUFaLHdCQUF3QjtNQUFBO01BQ3ZCLE9BQU8sQ0FBQywwQkFBQyxJQUFJLENBQUNSLGFBQWEsRUFBRSxpREFBcEIscUJBQXNCM0wsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0lBQ2pFOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BdUssa0JBQWtCLEdBQWxCLDhCQUE4QjtNQUM3QixJQUFNd0MsWUFBWSxHQUFJLElBQUksQ0FBQ3ZSLE9BQU8sRUFBRSxDQUFDd0YsV0FBVyxFQUFFLENBQVNnTSxXQUFXO01BQ3RFLE9BQU9ELFlBQVksS0FBSzlSLGVBQWUsQ0FBQ2dTLE9BQU87SUFDaEQsQ0FBQztJQUFBLE9BRURwSCx1QkFBdUIsR0FBdkIsbUNBQW1DO01BQUE7TUFDbEMsK0JBQU8sSUFBSSxDQUFDOEYsYUFBYSxFQUFFLHlEQUFwQixxQkFBc0IzTCxXQUFXLENBQUMseUJBQXlCLENBQUM7SUFDcEU7O0lBRUE7QUFDRDtBQUNBO0FBQ0EsT0FIQztJQUFBLE9BSUFrTixnQkFBZ0IsR0FBaEIsNEJBQW1CO01BQ2xCLElBQU1qSixTQUFTLEdBQUcsSUFBSSxDQUFDOUcsb0JBQW9CLEVBQUU7TUFDN0M7TUFDQSxJQUFJOEcsU0FBUyxFQUFFO1FBQ2RBLFNBQVMsQ0FBQ2tKLG1CQUFtQixDQUFDLElBQUksQ0FBQztNQUNwQztJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQUMsb0NBQW9DLEdBQXBDLGdEQUF1QztNQUN0QztNQUNBLE9BQU8sS0FBSztJQUNiOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BaEgsWUFBWSxHQUFaLHdCQUFlO01BQ2Q7TUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDbUUsa0JBQWtCLEVBQUUsRUFBRTtRQUMvQixJQUFJLENBQUMyQyxnQkFBZ0IsRUFBRTtNQUN4QjtNQUNBO01BQ0E7TUFDQSxJQUFNRyxtQkFBd0IsR0FBR1Isb0JBQW9CLENBQUNTLHVCQUF1QixDQUFDLElBQUksQ0FBQzlSLE9BQU8sRUFBRSxDQUFDd0YsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDMkssYUFBYSxFQUFFLENBQUM7TUFDakksSUFBTTRCLGlCQUFpQixHQUFHRixtQkFBbUIsSUFBSSxJQUFJLENBQUM3UixPQUFPLEVBQUUsQ0FBQ3lDLElBQUksQ0FBQ29QLG1CQUFtQixDQUFDO01BQ3pGLElBQUlFLGlCQUFpQixFQUFFO1FBQ3RCQSxpQkFBaUIsQ0FBQ0MsMkNBQTJDLENBQUMsSUFBSSxDQUFDSixvQ0FBb0MsQ0FBQ0ssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO01BQ3BIO0lBQ0QsQ0FBQztJQUFBLE9BRURDLGNBQWMsR0FBZCwwQkFBaUI7TUFDaEI7TUFDQTs7TUFFQSxJQUFNQyxTQUFTLEdBQUdDLFVBQVUsQ0FBQ0MsR0FBRyxDQUFDLDhCQUE4QixDQUFDO01BQ2hFO01BQ0E7O01BRUE7TUFDQSxJQUFNQyxVQUFVLEdBQUc7UUFDbEJDLGFBQWEsRUFBRUMsUUFBUSxDQUFDbkQsS0FBSztRQUFFO1FBQy9Cb0QsaUJBQWlCLEVBQUUsWUFBWTtVQUM5QixJQUFNQyxLQUFLLEdBQUdDLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFO1VBQzlCLE9BQU9GLEtBQUssY0FBT0EsS0FBSyxJQUFLRyxNQUFNLENBQUNDLFFBQVEsQ0FBQ0MsSUFBSTtRQUNsRCxDQUFDO1FBQ0Q7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtRQUNHQyxrQkFBa0IsRUFBRSxDQUFDLENBQUNiLFNBQVMsSUFBSUEsU0FBUyxFQUFFLENBQUNjLFdBQVc7TUFDM0QsQ0FBQztNQUVELElBQU1DLHFCQUFxQixHQUFHLElBQUksQ0FBQ0MsaUJBQWlCLEVBQUUsQ0FBQ2hILFFBQVEsQ0FBQyxZQUFZLENBQWM7TUFDMUYrRyxxQkFBcUIsQ0FBQ3JRLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRXlQLFVBQVUsQ0FBQztJQUNuRTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BTUFqTyw2QkFBNkIsR0FBN0IsdUNBQThCckMscUJBQTJDLEVBQUVELFVBQXFCLEVBQUU7TUFDakcsSUFBTXFSLE1BQVcsR0FBRyxDQUFDLENBQUM7TUFDdEIsSUFBTUMsYUFBa0IsR0FBRyxDQUFDLENBQUM7UUFDNUJ0SSxPQUFPLEdBQUcsSUFBSSxDQUFDQyxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQ3BDc0ksT0FBTyxHQUFHLElBQUksQ0FBQ3RJLFlBQVksQ0FBQyxPQUFPLENBQUM7TUFFckMsSUFBSSxDQUFDRCxPQUFPLENBQUM1QixNQUFNLElBQUksQ0FBQ21LLE9BQU8sQ0FBQ25LLE1BQU0sRUFBRTtRQUN2QztRQUNBO01BQ0Q7O01BRUE7TUFDQW1LLE9BQU8sQ0FBQzdMLE9BQU8sQ0FBQyxVQUFVTixNQUFXLEVBQUU7UUFDdEMsSUFBTW9NLGdCQUFnQixHQUFHcE0sTUFBTSxDQUFDb0MsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1VBQzNEaUssZUFBZSxHQUFHRCxnQkFBZ0IsQ0FBQ3RHLEtBQUssQ0FBQyxDQUFDLENBQUM7VUFDM0N3RyxTQUFTLGFBQU1ELGVBQWUsVUFBTztRQUN0QyxJQUFJLENBQUNKLE1BQU0sQ0FBQ0ssU0FBUyxDQUFDLEVBQUU7VUFDdkJMLE1BQU0sQ0FBQ0ssU0FBUyxDQUFDLEdBQUd2UCxXQUFXLENBQUN3UCx1QkFBdUIsQ0FBQzNSLFVBQVUsRUFBRW9GLE1BQU0sQ0FBQztRQUM1RTtRQUNBa00sYUFBYSxDQUFDSSxTQUFTLENBQUMsR0FBR0wsTUFBTSxDQUFDSyxTQUFTLENBQUM7TUFDN0MsQ0FBQyxDQUFDO01BQ0Z6UixxQkFBcUIsQ0FBQ2EsV0FBVyxDQUFDLHdCQUF3QixFQUFFd1EsYUFBYSxDQUFDO0lBQzNFLENBQUM7SUFBQSxPQUVETSxrQkFBa0IsR0FBbEIsOEJBQXFCO01BQ3BCLE9BQVEsSUFBSSxDQUFDM1QsT0FBTyxFQUFFLENBQUN3RixXQUFXLEVBQUUsQ0FBU29PLGFBQWE7SUFDM0QsQ0FBQztJQUFBLE9BRURsUSwrQkFBK0IsR0FBL0IseUNBQWdDbVEsaUJBQXNCLEVBQUUzTSxHQUFXLEVBQVc7TUFDN0UsSUFBSSxDQUFDMk0saUJBQWlCLElBQUksQ0FBQzNNLEdBQUcsRUFBRTtRQUMvQixPQUFPLEtBQUs7TUFDYjtNQUNBLElBQU00TSxRQUFRLEdBQUdELGlCQUFpQixDQUFDRSxXQUFXLEVBQUU7TUFDaEQsSUFBTUMsY0FBYyxHQUFHRixRQUFRLENBQUNsRixJQUFJLENBQUMsVUFBVXFGLE9BQVksRUFBRTtRQUM1RCxPQUFPQSxPQUFPLElBQUlBLE9BQU8sQ0FBQy9NLEdBQUcsS0FBS0EsR0FBRztNQUN0QyxDQUFDLENBQUM7TUFDRixPQUFROE0sY0FBYyxJQUFJQSxjQUFjLENBQUNFLGVBQWUsSUFBSyxLQUFLO0lBQ25FLENBQUM7SUFBQSxPQUVEelEsd0JBQXdCLEdBQXhCLGtDQUF5QlYsR0FBUSxFQUFFO01BQ2xDLElBQ0UsSUFBSSxDQUFDL0MsT0FBTyxFQUFFLENBQUN3RixXQUFXLEVBQUUsQ0FBU2dNLFdBQVcsS0FBSy9SLGVBQWUsQ0FBQzBVLElBQUksS0FDekUsQ0FBQ3BSLEdBQUcsSUFBSUEsR0FBRyxDQUFDcVIscUJBQXFCLEVBQUUsS0FBS3JSLEdBQUcsQ0FBQ3NSLG9CQUFvQixFQUFFLENBQUMsRUFDbkU7UUFDRCxJQUFNdFMsVUFBVSxHQUFHLElBQUksQ0FBQ0osb0JBQW9CLEVBQUU7UUFDOUMsSUFBSUksVUFBVSxFQUFFO1VBQ2YsSUFBTXVTLFdBQVcsR0FBR3ZTLFVBQVUsQ0FBQ3FDLGFBQWEsRUFBRTtVQUM5QyxLQUFLLElBQU0yTSxJQUFJLElBQUl1RCxXQUFXLEVBQUU7WUFDL0I7WUFDQSxJQUFJLENBQUN2RCxJQUFJLENBQUN3RCxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUl0TCxLQUFLLENBQUNDLE9BQU8sQ0FBQ29MLFdBQVcsQ0FBQ3ZELElBQUksQ0FBQyxDQUFDLElBQUl1RCxXQUFXLENBQUN2RCxJQUFJLENBQUMsQ0FBQzVILE1BQU0sRUFBRTtjQUMxRjtjQUNBLElBQU1xTCxlQUFvQixHQUFHelIsR0FBRyxDQUFDZ1IsV0FBVyxFQUFFLENBQUNuRixJQUFJLENBQUMsVUFBQ3FGLE9BQVksRUFBSztnQkFDckUsT0FBT0EsT0FBTyxDQUFDL00sR0FBRyxLQUFLbkUsR0FBRyxDQUFDc1Isb0JBQW9CLEVBQUU7Y0FDbEQsQ0FBQyxDQUFDO2NBQ0YsT0FBT0csZUFBZSxJQUFJQSxlQUFlLENBQUNOLGVBQWU7WUFDMUQ7VUFDRDtRQUNEO01BQ0Q7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDO0lBQUEsT0FFRGxNLFlBQVksR0FBWixzQkFBYXpCLE1BQVcsRUFBRTtNQUN6QixJQUFJLENBQUNBLE1BQU0sQ0FBQ2tPLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQzlQLHNCQUFzQixFQUFFO1FBQzFENEIsTUFBTSxDQUFDTyxNQUFNLEVBQUU7UUFDZixJQUFJLENBQUNuQyxzQkFBc0IsR0FBRyxLQUFLO01BQ3BDO0lBQ0QsQ0FBQztJQUFBLE9BRURzRCxZQUFZLEdBQVosc0JBQWFkLE1BQVcsRUFBRTtNQUN6QixJQUFNdU4sV0FBVyxHQUFHdk4sTUFBTSxDQUFDd04sa0JBQWtCLEVBQUUsQ0FBQ0MsU0FBUyxDQUFDek4sTUFBTSxDQUFDO01BQ2pFLElBQUksRUFBRXVOLFdBQVcsSUFBSUEsV0FBVyxDQUFDRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUNoUSxzQkFBc0IsRUFBRTtRQUNqRnNDLE1BQU0sQ0FBQ3dOLGtCQUFrQixFQUFFLENBQUM3TixNQUFNLENBQUNLLE1BQU0sRUFBRXVOLFdBQVcsQ0FBQ0ksY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQ2pRLHNCQUFzQixHQUFHLEtBQUs7TUFDcEM7SUFDRCxDQUFDO0lBQUE7RUFBQSxFQXRrQmlDcUYsY0FBYztJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQXd4QmxDeEssb0JBQW9CO0FBQUEifQ==