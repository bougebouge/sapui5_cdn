/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/StableIdHelper", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/Utils", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/m/Select", "sap/ui/core/Control", "sap/ui/core/Core", "sap/ui/core/Item", "sap/ui/model/json/JSONModel"], function (Log, CommonUtils, ClassSupport, StableIdHelper, ChartUtils, DelegateUtil, TableUtils, SegmentedButton, SegmentedButtonItem, Select, Control, Core, Item, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var generate = StableIdHelper.generate;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var PROPERTY_QUICKFILTER_KEY = "quickFilterKey";
  var FILTER_MODEL = "filters";
  /**
   *  Container Control for Table QuickFilters
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  var QuickFilterContainer = (_dec = defineUI5Class("sap.fe.macros.table.QuickFilterContainer", {
    interfaces: ["sap.m.IOverflowToolbarContent"]
  }), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string",
    defaultValue: "$auto"
  }), _dec6 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(QuickFilterContainer, _Control);
    function QuickFilterContainer() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call.apply(_Control, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "showCounts", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "parentEntityType", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "batchGroupId", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selector", _descriptor5, _assertThisInitialized(_this));
      _this._attachedToView = false;
      return _this;
    }
    QuickFilterContainer.render = function render(oRm, oControl) {
      oRm.renderControl(oControl.selector);
    };
    var _proto = QuickFilterContainer.prototype;
    _proto.init = function init() {
      var _this2 = this;
      _Control.prototype.init.call(this);
      this._attachedToView = false;
      this.attachEvent("modelContextChange", this._initControl);
      var oDelegateOnBeforeRendering = {
        onBeforeRendering: function () {
          // Need to wait for Control rendering to get parent view (.i.e into OP the highest parent is the Object Section)
          _this2._createControlSideEffects();
          _this2._attachedToView = true;
          _this2.removeEventDelegate(oDelegateOnBeforeRendering);
        }
      };
      this.addEventDelegate(oDelegateOnBeforeRendering, this);
    };
    _proto._initControl = function _initControl(oEvent) {
      // Need to wait for the OData Model to be propagated (models are propagated one by one when we come from FLP)
      if (this.getModel()) {
        this.detachEvent(oEvent.getId(), this._initControl);
        this._manageTable();
        this._createContent();
      }
    };
    _proto._manageTable = function _manageTable() {
      var _this$_oTable, _this$_oTable$getPare;
      var oControl = this.getParent();
      var oModel = this._getFilterModel(),
        aFilters = oModel.getObject("/paths"),
        sDefaultFilter = Array.isArray(aFilters) && aFilters.length > 0 ? aFilters[0].annotationPath : undefined;
      while (oControl && !oControl.isA("sap.ui.mdc.Table")) {
        oControl = oControl.getParent();
      }
      this._oTable = oControl;
      var FilterControl = Core.byId(this._oTable.getFilter());
      if (FilterControl && FilterControl.isA("sap.ui.mdc.FilterBar")) {
        FilterControl.attachEvent("filtersChanged", this._onFiltersChanged.bind(this));
      }
      (_this$_oTable = this._oTable) === null || _this$_oTable === void 0 ? void 0 : (_this$_oTable$getPare = _this$_oTable.getParent()) === null || _this$_oTable$getPare === void 0 ? void 0 : _this$_oTable$getPare.attachEvent("internalDataRequested", this._onTableDataRequested.bind(this));
      DelegateUtil.setCustomData(oControl, PROPERTY_QUICKFILTER_KEY, sDefaultFilter);
    };
    _proto._onFiltersChanged = function _onFiltersChanged(event) {
      if (event.getParameter("conditionsBased")) {
        this.selector.setProperty("enabled", false);
      }
    };
    _proto._onTableDataRequested = function _onTableDataRequested() {
      this.selector.setProperty("enabled", true);
      if (this.showCounts) {
        this._updateCounts();
      }
    };
    _proto.setSelectorKey = function setSelectorKey(sKey) {
      var oSelector = this.selector;
      if (oSelector && oSelector.getSelectedKey() !== sKey) {
        oSelector.setSelectedKey(sKey);
        DelegateUtil.setCustomData(this._oTable, PROPERTY_QUICKFILTER_KEY, sKey);

        // Rebind the table to reflect the change in quick filter key.
        // We don't rebind the table if the filterbar for the table is suspended
        // as rebind will be done when the filterbar is resumed
        var sFilterBarID = this._oTable.getFilter && this._oTable.getFilter();
        var oFilterBar = sFilterBarID && Core.byId(sFilterBarID);
        var bSkipRebind = oFilterBar && oFilterBar.getSuspendSelection && oFilterBar.getSuspendSelection();
        if (!bSkipRebind) {
          this._oTable.rebind();
        }
      }
    };
    _proto.getSelectorKey = function getSelectorKey() {
      var oSelector = this.selector;
      return oSelector ? oSelector.getSelectedKey() : null;
    };
    _proto.getDomRef = function getDomRef(sSuffix) {
      var oSelector = this.selector;
      return oSelector ? oSelector.getDomRef(sSuffix) : null;
    };
    _proto._getFilterModel = function _getFilterModel() {
      var oModel = this.getModel(FILTER_MODEL);
      if (!oModel) {
        var mFilters = DelegateUtil.getCustomData(this, FILTER_MODEL);
        oModel = new JSONModel(mFilters);
        this.setModel(oModel, FILTER_MODEL);
      }
      return oModel;
    }
    /**
     * Create QuickFilter Selector (Select or SegmentedButton).
     */;
    _proto._createContent = function _createContent() {
      var _this3 = this;
      var oModel = this._getFilterModel(),
        aFilters = oModel.getObject("/paths"),
        bIsSelect = aFilters.length > 3,
        mSelectorOptions = {
          id: generate([this._oTable.getId(), "QuickFilter"]),
          enabled: oModel.getObject("/enabled"),
          items: {
            path: "".concat(FILTER_MODEL, ">/paths"),
            factory: function (sId, oBindingContext) {
              var mItemOptions = {
                key: oBindingContext.getObject().annotationPath,
                text: _this3._getSelectorItemText(oBindingContext)
              };
              return bIsSelect ? new Item(mItemOptions) : new SegmentedButtonItem(mItemOptions);
            }
          }
        };
      if (bIsSelect) {
        mSelectorOptions.autoAdjustWidth = true;
      }
      mSelectorOptions[bIsSelect ? "change" : "selectionChange"] = this._onSelectionChange.bind(this);
      this.selector = bIsSelect ? new Select(mSelectorOptions) : new SegmentedButton(mSelectorOptions);
    }

    /**
     * Returns properties for the interface IOverflowToolbarContent.
     *
     * @returns {Object} Returns the configuration of IOverflowToolbarContent
     */;
    _proto.getOverflowToolbarConfig = function getOverflowToolbarConfig() {
      return {
        canOverflow: true
      };
    }

    /**
     * Creates SideEffects control that must be executed when table cells that are related to configured filter(s) change.
     *
     */;
    _proto._createControlSideEffects = function _createControlSideEffects() {
      var _this4 = this;
      var oSvControl = this.selector,
        oSvItems = oSvControl.getItems(),
        sTableNavigationPath = DelegateUtil.getCustomData(this._oTable, "navigationPath");
      /**
       * Cannot execute SideEffects with targetEntity = current Table collection
       */

      if (sTableNavigationPath) {
        (function () {
          var aSourceProperties = [];
          for (var k in oSvItems) {
            var sItemKey = oSvItems[k].getKey(),
              oFilterInfos = TableUtils.getFiltersInfoForSV(_this4._oTable, sItemKey);
            oFilterInfos.properties.forEach(function (sProperty) {
              var sPropertyPath = "".concat(sTableNavigationPath, "/").concat(sProperty);
              if (!aSourceProperties.includes(sPropertyPath)) {
                aSourceProperties.push(sPropertyPath);
              }
            });
          }
          _this4._getSideEffectController().addControlSideEffects(_this4.parentEntityType, {
            SourceProperties: aSourceProperties,
            TargetEntities: [{
              "$NavigationPropertyPath": sTableNavigationPath
            }],
            sourceControlId: _this4.getId()
          });
        })();
      }
    };
    _proto._getSelectorItemText = function _getSelectorItemText(oItemContext) {
      var annotationPath = oItemContext.getObject().annotationPath,
        itemPath = oItemContext.getPath(),
        oMetaModel = this.getModel().getMetaModel(),
        oQuickFilter = oMetaModel.getObject("".concat(this.entitySet, "/").concat(annotationPath));
      return oQuickFilter.Text + (this.showCounts ? " ({".concat(FILTER_MODEL, ">").concat(itemPath, "/count})") : "");
    };
    _proto._getSideEffectController = function _getSideEffectController() {
      var oController = this._getViewController();
      return oController ? oController._sideEffects : undefined;
    };
    _proto._getViewController = function _getViewController() {
      var oView = CommonUtils.getTargetView(this);
      return oView && oView.getController();
    }
    /**
     * Manage List Binding request related to Counts on QuickFilter control and update text
     * in line with batch result.
     *
     */;
    _proto._updateCounts = function _updateCounts() {
      var oTable = this._oTable,
        oController = this._getViewController(),
        oSvControl = this.selector,
        oSvItems = oSvControl.getItems(),
        oModel = this._getFilterModel(),
        aBindingPromises = [],
        aInitialItemTexts = [];
      var aAdditionalFilters = [];
      var aChartFilters = [];
      var sCurrentFilterKey = DelegateUtil.getCustomData(oTable, PROPERTY_QUICKFILTER_KEY);

      // Add filters related to the chart for ALP
      if (oController && oController.getChartControl) {
        var oChart = oController.getChartControl();
        if (oChart) {
          var oChartFilterInfo = ChartUtils.getAllFilterInfo(oChart);
          if (oChartFilterInfo && oChartFilterInfo.filters.length) {
            aChartFilters = oChartFilterInfo.filters;
          }
        }
      }
      aAdditionalFilters = aAdditionalFilters.concat(TableUtils.getHiddenFilters(oTable)).concat(aChartFilters);
      for (var k in oSvItems) {
        var sItemKey = oSvItems[k].getKey(),
          oFilterInfos = TableUtils.getFiltersInfoForSV(oTable, sItemKey);
        aInitialItemTexts.push(oFilterInfos.text);
        oModel.setProperty("/paths/".concat(k, "/count"), "...");
        aBindingPromises.push(TableUtils.getListBindingForCount(oTable, oTable.getBindingContext(), {
          batchGroupId: sItemKey === sCurrentFilterKey ? this.batchGroupId : "$auto",
          additionalFilters: aAdditionalFilters.concat(oFilterInfos.filters)
        }));
      }
      Promise.all(aBindingPromises).then(function (aCounts) {
        for (var _k in aCounts) {
          oModel.setProperty("/paths/".concat(_k, "/count"), TableUtils.getCountFormatted(aCounts[_k]));
        }
      }).catch(function (oError) {
        Log.error("Error while retrieving the binding promises", oError);
      });
    };
    _proto._onSelectionChange = function _onSelectionChange(oEvent) {
      var oControl = oEvent.getSource();
      DelegateUtil.setCustomData(this._oTable, PROPERTY_QUICKFILTER_KEY, oControl.getSelectedKey());
      this._oTable.rebind();
      var oController = this._getViewController();
      if (oController && oController.getExtensionAPI && oController.getExtensionAPI().updateAppState) {
        oController.getExtensionAPI().updateAppState();
      }
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      if (this._attachedToView) {
        var oSideEffects = this._getSideEffectController();
        if (oSideEffects) {
          // if "destroy" signal comes when view is destroyed there is not anymore reference to Controller Extension
          oSideEffects.removeControlSideEffects(this);
        }
      }
      delete this._oTable;
      _Control.prototype.destroy.call(this, bSuppressInvalidate);
    };
    return QuickFilterContainer;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "showCounts", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "parentEntityType", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "batchGroupId", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "selector", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return QuickFilterContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVkiLCJGSUxURVJfTU9ERUwiLCJRdWlja0ZpbHRlckNvbnRhaW5lciIsImRlZmluZVVJNUNsYXNzIiwiaW50ZXJmYWNlcyIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFnZ3JlZ2F0aW9uIiwibXVsdGlwbGUiLCJpc0RlZmF1bHQiLCJfYXR0YWNoZWRUb1ZpZXciLCJyZW5kZXIiLCJvUm0iLCJvQ29udHJvbCIsInJlbmRlckNvbnRyb2wiLCJzZWxlY3RvciIsImluaXQiLCJhdHRhY2hFdmVudCIsIl9pbml0Q29udHJvbCIsIm9EZWxlZ2F0ZU9uQmVmb3JlUmVuZGVyaW5nIiwib25CZWZvcmVSZW5kZXJpbmciLCJfY3JlYXRlQ29udHJvbFNpZGVFZmZlY3RzIiwicmVtb3ZlRXZlbnREZWxlZ2F0ZSIsImFkZEV2ZW50RGVsZWdhdGUiLCJvRXZlbnQiLCJnZXRNb2RlbCIsImRldGFjaEV2ZW50IiwiZ2V0SWQiLCJfbWFuYWdlVGFibGUiLCJfY3JlYXRlQ29udGVudCIsImdldFBhcmVudCIsIm9Nb2RlbCIsIl9nZXRGaWx0ZXJNb2RlbCIsImFGaWx0ZXJzIiwiZ2V0T2JqZWN0Iiwic0RlZmF1bHRGaWx0ZXIiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJhbm5vdGF0aW9uUGF0aCIsInVuZGVmaW5lZCIsImlzQSIsIl9vVGFibGUiLCJGaWx0ZXJDb250cm9sIiwiQ29yZSIsImJ5SWQiLCJnZXRGaWx0ZXIiLCJfb25GaWx0ZXJzQ2hhbmdlZCIsImJpbmQiLCJfb25UYWJsZURhdGFSZXF1ZXN0ZWQiLCJEZWxlZ2F0ZVV0aWwiLCJzZXRDdXN0b21EYXRhIiwiZXZlbnQiLCJnZXRQYXJhbWV0ZXIiLCJzZXRQcm9wZXJ0eSIsInNob3dDb3VudHMiLCJfdXBkYXRlQ291bnRzIiwic2V0U2VsZWN0b3JLZXkiLCJzS2V5Iiwib1NlbGVjdG9yIiwiZ2V0U2VsZWN0ZWRLZXkiLCJzZXRTZWxlY3RlZEtleSIsInNGaWx0ZXJCYXJJRCIsIm9GaWx0ZXJCYXIiLCJiU2tpcFJlYmluZCIsImdldFN1c3BlbmRTZWxlY3Rpb24iLCJyZWJpbmQiLCJnZXRTZWxlY3RvcktleSIsImdldERvbVJlZiIsInNTdWZmaXgiLCJtRmlsdGVycyIsImdldEN1c3RvbURhdGEiLCJKU09OTW9kZWwiLCJzZXRNb2RlbCIsImJJc1NlbGVjdCIsIm1TZWxlY3Rvck9wdGlvbnMiLCJpZCIsImdlbmVyYXRlIiwiZW5hYmxlZCIsIml0ZW1zIiwicGF0aCIsImZhY3RvcnkiLCJzSWQiLCJvQmluZGluZ0NvbnRleHQiLCJtSXRlbU9wdGlvbnMiLCJrZXkiLCJ0ZXh0IiwiX2dldFNlbGVjdG9ySXRlbVRleHQiLCJJdGVtIiwiU2VnbWVudGVkQnV0dG9uSXRlbSIsImF1dG9BZGp1c3RXaWR0aCIsIl9vblNlbGVjdGlvbkNoYW5nZSIsIlNlbGVjdCIsIlNlZ21lbnRlZEJ1dHRvbiIsImdldE92ZXJmbG93VG9vbGJhckNvbmZpZyIsImNhbk92ZXJmbG93Iiwib1N2Q29udHJvbCIsIm9Tdkl0ZW1zIiwiZ2V0SXRlbXMiLCJzVGFibGVOYXZpZ2F0aW9uUGF0aCIsImFTb3VyY2VQcm9wZXJ0aWVzIiwiayIsInNJdGVtS2V5IiwiZ2V0S2V5Iiwib0ZpbHRlckluZm9zIiwiVGFibGVVdGlscyIsImdldEZpbHRlcnNJbmZvRm9yU1YiLCJwcm9wZXJ0aWVzIiwiZm9yRWFjaCIsInNQcm9wZXJ0eSIsInNQcm9wZXJ0eVBhdGgiLCJpbmNsdWRlcyIsInB1c2giLCJfZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIiLCJhZGRDb250cm9sU2lkZUVmZmVjdHMiLCJwYXJlbnRFbnRpdHlUeXBlIiwiU291cmNlUHJvcGVydGllcyIsIlRhcmdldEVudGl0aWVzIiwic291cmNlQ29udHJvbElkIiwib0l0ZW1Db250ZXh0IiwiaXRlbVBhdGgiLCJnZXRQYXRoIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsIm9RdWlja0ZpbHRlciIsImVudGl0eVNldCIsIlRleHQiLCJvQ29udHJvbGxlciIsIl9nZXRWaWV3Q29udHJvbGxlciIsIl9zaWRlRWZmZWN0cyIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiZ2V0Q29udHJvbGxlciIsIm9UYWJsZSIsImFCaW5kaW5nUHJvbWlzZXMiLCJhSW5pdGlhbEl0ZW1UZXh0cyIsImFBZGRpdGlvbmFsRmlsdGVycyIsImFDaGFydEZpbHRlcnMiLCJzQ3VycmVudEZpbHRlcktleSIsImdldENoYXJ0Q29udHJvbCIsIm9DaGFydCIsIm9DaGFydEZpbHRlckluZm8iLCJDaGFydFV0aWxzIiwiZ2V0QWxsRmlsdGVySW5mbyIsImZpbHRlcnMiLCJjb25jYXQiLCJnZXRIaWRkZW5GaWx0ZXJzIiwiZ2V0TGlzdEJpbmRpbmdGb3JDb3VudCIsImdldEJpbmRpbmdDb250ZXh0IiwiYmF0Y2hHcm91cElkIiwiYWRkaXRpb25hbEZpbHRlcnMiLCJQcm9taXNlIiwiYWxsIiwidGhlbiIsImFDb3VudHMiLCJnZXRDb3VudEZvcm1hdHRlZCIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJnZXRTb3VyY2UiLCJnZXRFeHRlbnNpb25BUEkiLCJ1cGRhdGVBcHBTdGF0ZSIsImRlc3Ryb3kiLCJiU3VwcHJlc3NJbnZhbGlkYXRlIiwib1NpZGVFZmZlY3RzIiwicmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzIiwiQ29udHJvbCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUXVpY2tGaWx0ZXJDb250YWluZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgQ2hhcnRVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydFV0aWxzXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IFRhYmxlVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVXRpbHNcIjtcbmltcG9ydCBTZWdtZW50ZWRCdXR0b24gZnJvbSBcInNhcC9tL1NlZ21lbnRlZEJ1dHRvblwiO1xuaW1wb3J0IFNlZ21lbnRlZEJ1dHRvbkl0ZW0gZnJvbSBcInNhcC9tL1NlZ21lbnRlZEJ1dHRvbkl0ZW1cIjtcbmltcG9ydCBTZWxlY3QgZnJvbSBcInNhcC9tL1NlbGVjdFwiO1xuaW1wb3J0IHR5cGUgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBJdGVtIGZyb20gXCJzYXAvdWkvY29yZS9JdGVtXCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5cbmNvbnN0IFBST1BFUlRZX1FVSUNLRklMVEVSX0tFWSA9IFwicXVpY2tGaWx0ZXJLZXlcIjtcbmNvbnN0IEZJTFRFUl9NT0RFTCA9IFwiZmlsdGVyc1wiO1xuLyoqXG4gKiAgQ29udGFpbmVyIENvbnRyb2wgZm9yIFRhYmxlIFF1aWNrRmlsdGVyc1xuICpcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGludGVybmFsL2V4cGVyaW1lbnRhbCB1c2UhXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MudGFibGUuUXVpY2tGaWx0ZXJDb250YWluZXJcIiwge1xuXHRpbnRlcmZhY2VzOiBbXCJzYXAubS5JT3ZlcmZsb3dUb29sYmFyQ29udGVudFwiXVxufSlcbmNsYXNzIFF1aWNrRmlsdGVyQ29udGFpbmVyIGV4dGVuZHMgQ29udHJvbCB7XG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pIHNob3dDb3VudHMhOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZW50aXR5U2V0ITogc3RyaW5nO1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHBhcmVudEVudGl0eVR5cGUhOiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIiRhdXRvXCIgfSlcblx0YmF0Y2hHcm91cElkITogc3RyaW5nO1xuXG5cdEBhZ2dyZWdhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsXG5cdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdGlzRGVmYXVsdDogdHJ1ZVxuXHR9KVxuXHRzZWxlY3RvciE6IFNlbGVjdCB8IFNlZ21lbnRlZEJ1dHRvbjtcblx0cHJpdmF0ZSBfb1RhYmxlPzogVGFibGU7XG5cdHByaXZhdGUgX2F0dGFjaGVkVG9WaWV3OiBib29sZWFuID0gZmFsc2U7XG5cblx0c3RhdGljIHJlbmRlcihvUm06IFJlbmRlck1hbmFnZXIsIG9Db250cm9sOiBRdWlja0ZpbHRlckNvbnRhaW5lcikge1xuXHRcdG9SbS5yZW5kZXJDb250cm9sKG9Db250cm9sLnNlbGVjdG9yKTtcblx0fVxuXHRpbml0KCkge1xuXHRcdHN1cGVyLmluaXQoKTtcblx0XHR0aGlzLl9hdHRhY2hlZFRvVmlldyA9IGZhbHNlO1xuXHRcdHRoaXMuYXR0YWNoRXZlbnQoXCJtb2RlbENvbnRleHRDaGFuZ2VcIiwgdGhpcy5faW5pdENvbnRyb2wpO1xuXHRcdGNvbnN0IG9EZWxlZ2F0ZU9uQmVmb3JlUmVuZGVyaW5nID0ge1xuXHRcdFx0b25CZWZvcmVSZW5kZXJpbmc6ICgpID0+IHtcblx0XHRcdFx0Ly8gTmVlZCB0byB3YWl0IGZvciBDb250cm9sIHJlbmRlcmluZyB0byBnZXQgcGFyZW50IHZpZXcgKC5pLmUgaW50byBPUCB0aGUgaGlnaGVzdCBwYXJlbnQgaXMgdGhlIE9iamVjdCBTZWN0aW9uKVxuXHRcdFx0XHR0aGlzLl9jcmVhdGVDb250cm9sU2lkZUVmZmVjdHMoKTtcblx0XHRcdFx0dGhpcy5fYXR0YWNoZWRUb1ZpZXcgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLnJlbW92ZUV2ZW50RGVsZWdhdGUob0RlbGVnYXRlT25CZWZvcmVSZW5kZXJpbmcpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5hZGRFdmVudERlbGVnYXRlKG9EZWxlZ2F0ZU9uQmVmb3JlUmVuZGVyaW5nLCB0aGlzKTtcblx0fVxuXHRfaW5pdENvbnRyb2wob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBOZWVkIHRvIHdhaXQgZm9yIHRoZSBPRGF0YSBNb2RlbCB0byBiZSBwcm9wYWdhdGVkIChtb2RlbHMgYXJlIHByb3BhZ2F0ZWQgb25lIGJ5IG9uZSB3aGVuIHdlIGNvbWUgZnJvbSBGTFApXG5cdFx0aWYgKHRoaXMuZ2V0TW9kZWwoKSkge1xuXHRcdFx0dGhpcy5kZXRhY2hFdmVudChvRXZlbnQuZ2V0SWQoKSwgdGhpcy5faW5pdENvbnRyb2wpO1xuXHRcdFx0dGhpcy5fbWFuYWdlVGFibGUoKTtcblx0XHRcdHRoaXMuX2NyZWF0ZUNvbnRlbnQoKTtcblx0XHR9XG5cdH1cblx0X21hbmFnZVRhYmxlKCkge1xuXHRcdGxldCBvQ29udHJvbCA9IHRoaXMuZ2V0UGFyZW50KCkgYXMgVGFibGU7XG5cdFx0Y29uc3Qgb01vZGVsID0gdGhpcy5fZ2V0RmlsdGVyTW9kZWwoKSxcblx0XHRcdGFGaWx0ZXJzID0gb01vZGVsLmdldE9iamVjdChcIi9wYXRoc1wiKSxcblx0XHRcdHNEZWZhdWx0RmlsdGVyID0gQXJyYXkuaXNBcnJheShhRmlsdGVycykgJiYgYUZpbHRlcnMubGVuZ3RoID4gMCA/IGFGaWx0ZXJzWzBdLmFubm90YXRpb25QYXRoIDogdW5kZWZpbmVkO1xuXG5cdFx0d2hpbGUgKG9Db250cm9sICYmICFvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRvQ29udHJvbCA9IG9Db250cm9sLmdldFBhcmVudCgpIGFzIFRhYmxlO1xuXHRcdH1cblx0XHR0aGlzLl9vVGFibGUgPSBvQ29udHJvbCE7XG5cblx0XHRjb25zdCBGaWx0ZXJDb250cm9sID0gQ29yZS5ieUlkKHRoaXMuX29UYWJsZS5nZXRGaWx0ZXIoKSk7XG5cdFx0aWYgKEZpbHRlckNvbnRyb2wgJiYgRmlsdGVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckJhclwiKSkge1xuXHRcdFx0RmlsdGVyQ29udHJvbC5hdHRhY2hFdmVudChcImZpbHRlcnNDaGFuZ2VkXCIsIHRoaXMuX29uRmlsdGVyc0NoYW5nZWQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHRcdHRoaXMuX29UYWJsZT8uZ2V0UGFyZW50KCk/LmF0dGFjaEV2ZW50KFwiaW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIsIHRoaXMuX29uVGFibGVEYXRhUmVxdWVzdGVkLmJpbmQodGhpcykpO1xuXHRcdERlbGVnYXRlVXRpbC5zZXRDdXN0b21EYXRhKG9Db250cm9sLCBQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVksIHNEZWZhdWx0RmlsdGVyKTtcblx0fVxuXG5cdF9vbkZpbHRlcnNDaGFuZ2VkKGV2ZW50OiBVSTVFdmVudCkge1xuXHRcdGlmIChldmVudC5nZXRQYXJhbWV0ZXIoXCJjb25kaXRpb25zQmFzZWRcIikpIHtcblx0XHRcdHRoaXMuc2VsZWN0b3Iuc2V0UHJvcGVydHkoXCJlbmFibGVkXCIsIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHRfb25UYWJsZURhdGFSZXF1ZXN0ZWQoKSB7XG5cdFx0dGhpcy5zZWxlY3Rvci5zZXRQcm9wZXJ0eShcImVuYWJsZWRcIiwgdHJ1ZSk7XG5cdFx0aWYgKHRoaXMuc2hvd0NvdW50cykge1xuXHRcdFx0dGhpcy5fdXBkYXRlQ291bnRzKCk7XG5cdFx0fVxuXHR9XG5cdHNldFNlbGVjdG9yS2V5KHNLZXk6IGFueSkge1xuXHRcdGNvbnN0IG9TZWxlY3RvciA9IHRoaXMuc2VsZWN0b3I7XG5cdFx0aWYgKG9TZWxlY3RvciAmJiBvU2VsZWN0b3IuZ2V0U2VsZWN0ZWRLZXkoKSAhPT0gc0tleSkge1xuXHRcdFx0b1NlbGVjdG9yLnNldFNlbGVjdGVkS2V5KHNLZXkpO1xuXHRcdFx0RGVsZWdhdGVVdGlsLnNldEN1c3RvbURhdGEodGhpcy5fb1RhYmxlLCBQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVksIHNLZXkpO1xuXG5cdFx0XHQvLyBSZWJpbmQgdGhlIHRhYmxlIHRvIHJlZmxlY3QgdGhlIGNoYW5nZSBpbiBxdWljayBmaWx0ZXIga2V5LlxuXHRcdFx0Ly8gV2UgZG9uJ3QgcmViaW5kIHRoZSB0YWJsZSBpZiB0aGUgZmlsdGVyYmFyIGZvciB0aGUgdGFibGUgaXMgc3VzcGVuZGVkXG5cdFx0XHQvLyBhcyByZWJpbmQgd2lsbCBiZSBkb25lIHdoZW4gdGhlIGZpbHRlcmJhciBpcyByZXN1bWVkXG5cdFx0XHRjb25zdCBzRmlsdGVyQmFySUQgPSB0aGlzLl9vVGFibGUhLmdldEZpbHRlciAmJiB0aGlzLl9vVGFibGUhLmdldEZpbHRlcigpO1xuXHRcdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHNGaWx0ZXJCYXJJRCAmJiAoQ29yZS5ieUlkKHNGaWx0ZXJCYXJJRCkgYXMgRmlsdGVyQmFyKTtcblx0XHRcdGNvbnN0IGJTa2lwUmViaW5kID0gb0ZpbHRlckJhciAmJiBvRmlsdGVyQmFyLmdldFN1c3BlbmRTZWxlY3Rpb24gJiYgb0ZpbHRlckJhci5nZXRTdXNwZW5kU2VsZWN0aW9uKCk7XG5cblx0XHRcdGlmICghYlNraXBSZWJpbmQpIHtcblx0XHRcdFx0KHRoaXMuX29UYWJsZSBhcyBhbnkpLnJlYmluZCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRnZXRTZWxlY3RvcktleSgpIHtcblx0XHRjb25zdCBvU2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yO1xuXHRcdHJldHVybiBvU2VsZWN0b3IgPyBvU2VsZWN0b3IuZ2V0U2VsZWN0ZWRLZXkoKSA6IG51bGw7XG5cdH1cblx0Z2V0RG9tUmVmKHNTdWZmaXg/OiBzdHJpbmcpIHtcblx0XHRjb25zdCBvU2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yO1xuXHRcdHJldHVybiBvU2VsZWN0b3IgPyBvU2VsZWN0b3IuZ2V0RG9tUmVmKHNTdWZmaXgpIDogKG51bGwgYXMgYW55KTtcblx0fVxuXHRfZ2V0RmlsdGVyTW9kZWwoKSB7XG5cdFx0bGV0IG9Nb2RlbCA9IHRoaXMuZ2V0TW9kZWwoRklMVEVSX01PREVMKTtcblx0XHRpZiAoIW9Nb2RlbCkge1xuXHRcdFx0Y29uc3QgbUZpbHRlcnMgPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YSh0aGlzLCBGSUxURVJfTU9ERUwpO1xuXHRcdFx0b01vZGVsID0gbmV3IEpTT05Nb2RlbChtRmlsdGVycyk7XG5cdFx0XHR0aGlzLnNldE1vZGVsKG9Nb2RlbCwgRklMVEVSX01PREVMKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9Nb2RlbDtcblx0fVxuXHQvKipcblx0ICogQ3JlYXRlIFF1aWNrRmlsdGVyIFNlbGVjdG9yIChTZWxlY3Qgb3IgU2VnbWVudGVkQnV0dG9uKS5cblx0ICovXG5cdF9jcmVhdGVDb250ZW50KCkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX2dldEZpbHRlck1vZGVsKCksXG5cdFx0XHRhRmlsdGVycyA9IG9Nb2RlbC5nZXRPYmplY3QoXCIvcGF0aHNcIiksXG5cdFx0XHRiSXNTZWxlY3QgPSBhRmlsdGVycy5sZW5ndGggPiAzLFxuXHRcdFx0bVNlbGVjdG9yT3B0aW9uczogYW55ID0ge1xuXHRcdFx0XHRpZDogZ2VuZXJhdGUoW3RoaXMuX29UYWJsZSEuZ2V0SWQoKSwgXCJRdWlja0ZpbHRlclwiXSksXG5cdFx0XHRcdGVuYWJsZWQ6IG9Nb2RlbC5nZXRPYmplY3QoXCIvZW5hYmxlZFwiKSxcblx0XHRcdFx0aXRlbXM6IHtcblx0XHRcdFx0XHRwYXRoOiBgJHtGSUxURVJfTU9ERUx9Pi9wYXRoc2AsXG5cdFx0XHRcdFx0ZmFjdG9yeTogKHNJZDogYW55LCBvQmluZGluZ0NvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgbUl0ZW1PcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0XHRrZXk6IG9CaW5kaW5nQ29udGV4dC5nZXRPYmplY3QoKS5hbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0dGV4dDogdGhpcy5fZ2V0U2VsZWN0b3JJdGVtVGV4dChvQmluZGluZ0NvbnRleHQpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cmV0dXJuIGJJc1NlbGVjdCA/IG5ldyBJdGVtKG1JdGVtT3B0aW9ucykgOiBuZXcgU2VnbWVudGVkQnV0dG9uSXRlbShtSXRlbU9wdGlvbnMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRpZiAoYklzU2VsZWN0KSB7XG5cdFx0XHRtU2VsZWN0b3JPcHRpb25zLmF1dG9BZGp1c3RXaWR0aCA9IHRydWU7XG5cdFx0fVxuXHRcdG1TZWxlY3Rvck9wdGlvbnNbYklzU2VsZWN0ID8gXCJjaGFuZ2VcIiA6IFwic2VsZWN0aW9uQ2hhbmdlXCJdID0gdGhpcy5fb25TZWxlY3Rpb25DaGFuZ2UuYmluZCh0aGlzKTtcblx0XHR0aGlzLnNlbGVjdG9yID0gYklzU2VsZWN0ID8gbmV3IFNlbGVjdChtU2VsZWN0b3JPcHRpb25zKSA6IG5ldyBTZWdtZW50ZWRCdXR0b24obVNlbGVjdG9yT3B0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBwcm9wZXJ0aWVzIGZvciB0aGUgaW50ZXJmYWNlIElPdmVyZmxvd1Rvb2xiYXJDb250ZW50LlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb25maWd1cmF0aW9uIG9mIElPdmVyZmxvd1Rvb2xiYXJDb250ZW50XG5cdCAqL1xuXHRnZXRPdmVyZmxvd1Rvb2xiYXJDb25maWcoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNhbk92ZXJmbG93OiB0cnVlXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIFNpZGVFZmZlY3RzIGNvbnRyb2wgdGhhdCBtdXN0IGJlIGV4ZWN1dGVkIHdoZW4gdGFibGUgY2VsbHMgdGhhdCBhcmUgcmVsYXRlZCB0byBjb25maWd1cmVkIGZpbHRlcihzKSBjaGFuZ2UuXG5cdCAqXG5cdCAqL1xuXG5cdF9jcmVhdGVDb250cm9sU2lkZUVmZmVjdHMoKSB7XG5cdFx0Y29uc3Qgb1N2Q29udHJvbCA9IHRoaXMuc2VsZWN0b3IsXG5cdFx0XHRvU3ZJdGVtcyA9IG9TdkNvbnRyb2wuZ2V0SXRlbXMoKSxcblx0XHRcdHNUYWJsZU5hdmlnYXRpb25QYXRoID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEodGhpcy5fb1RhYmxlLCBcIm5hdmlnYXRpb25QYXRoXCIpO1xuXHRcdC8qKlxuXHRcdCAqIENhbm5vdCBleGVjdXRlIFNpZGVFZmZlY3RzIHdpdGggdGFyZ2V0RW50aXR5ID0gY3VycmVudCBUYWJsZSBjb2xsZWN0aW9uXG5cdFx0ICovXG5cblx0XHRpZiAoc1RhYmxlTmF2aWdhdGlvblBhdGgpIHtcblx0XHRcdGNvbnN0IGFTb3VyY2VQcm9wZXJ0aWVzOiBhbnlbXSA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCBrIGluIG9Tdkl0ZW1zKSB7XG5cdFx0XHRcdGNvbnN0IHNJdGVtS2V5ID0gb1N2SXRlbXNba10uZ2V0S2V5KCksXG5cdFx0XHRcdFx0b0ZpbHRlckluZm9zID0gVGFibGVVdGlscy5nZXRGaWx0ZXJzSW5mb0ZvclNWKHRoaXMuX29UYWJsZSEsIHNJdGVtS2V5KTtcblx0XHRcdFx0b0ZpbHRlckluZm9zLnByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gYCR7c1RhYmxlTmF2aWdhdGlvblBhdGh9LyR7c1Byb3BlcnR5fWA7XG5cdFx0XHRcdFx0aWYgKCFhU291cmNlUHJvcGVydGllcy5pbmNsdWRlcyhzUHJvcGVydHlQYXRoKSkge1xuXHRcdFx0XHRcdFx0YVNvdXJjZVByb3BlcnRpZXMucHVzaChzUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIoKS5hZGRDb250cm9sU2lkZUVmZmVjdHModGhpcy5wYXJlbnRFbnRpdHlUeXBlLCB7XG5cdFx0XHRcdFNvdXJjZVByb3BlcnRpZXM6IGFTb3VyY2VQcm9wZXJ0aWVzLFxuXHRcdFx0XHRUYXJnZXRFbnRpdGllczogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjogc1RhYmxlTmF2aWdhdGlvblBhdGhcblx0XHRcdFx0XHR9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdHNvdXJjZUNvbnRyb2xJZDogdGhpcy5nZXRJZCgpXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblx0X2dldFNlbGVjdG9ySXRlbVRleHQob0l0ZW1Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IG9JdGVtQ29udGV4dC5nZXRPYmplY3QoKS5hbm5vdGF0aW9uUGF0aCxcblx0XHRcdGl0ZW1QYXRoID0gb0l0ZW1Db250ZXh0LmdldFBhdGgoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSB0aGlzLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRvUXVpY2tGaWx0ZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHt0aGlzLmVudGl0eVNldH0vJHthbm5vdGF0aW9uUGF0aH1gKTtcblx0XHRyZXR1cm4gb1F1aWNrRmlsdGVyLlRleHQgKyAodGhpcy5zaG93Q291bnRzID8gYCAoeyR7RklMVEVSX01PREVMfT4ke2l0ZW1QYXRofS9jb3VudH0pYCA6IFwiXCIpO1xuXHR9XG5cdF9nZXRTaWRlRWZmZWN0Q29udHJvbGxlcigpIHtcblx0XHRjb25zdCBvQ29udHJvbGxlciA9IHRoaXMuX2dldFZpZXdDb250cm9sbGVyKCk7XG5cdFx0cmV0dXJuIG9Db250cm9sbGVyID8gb0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzIDogdW5kZWZpbmVkO1xuXHR9XG5cdF9nZXRWaWV3Q29udHJvbGxlcigpIHtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk7XG5cdFx0cmV0dXJuIG9WaWV3ICYmIG9WaWV3LmdldENvbnRyb2xsZXIoKTtcblx0fVxuXHQvKipcblx0ICogTWFuYWdlIExpc3QgQmluZGluZyByZXF1ZXN0IHJlbGF0ZWQgdG8gQ291bnRzIG9uIFF1aWNrRmlsdGVyIGNvbnRyb2wgYW5kIHVwZGF0ZSB0ZXh0XG5cdCAqIGluIGxpbmUgd2l0aCBiYXRjaCByZXN1bHQuXG5cdCAqXG5cdCAqL1xuXHRfdXBkYXRlQ291bnRzKCkge1xuXHRcdGNvbnN0IG9UYWJsZSA9IHRoaXMuX29UYWJsZSEsXG5cdFx0XHRvQ29udHJvbGxlciA9IHRoaXMuX2dldFZpZXdDb250cm9sbGVyKCksXG5cdFx0XHRvU3ZDb250cm9sID0gdGhpcy5zZWxlY3Rvcixcblx0XHRcdG9Tdkl0ZW1zID0gb1N2Q29udHJvbC5nZXRJdGVtcygpLFxuXHRcdFx0b01vZGVsOiBhbnkgPSB0aGlzLl9nZXRGaWx0ZXJNb2RlbCgpLFxuXHRcdFx0YUJpbmRpbmdQcm9taXNlcyA9IFtdLFxuXHRcdFx0YUluaXRpYWxJdGVtVGV4dHM6IGFueVtdID0gW107XG5cdFx0bGV0IGFBZGRpdGlvbmFsRmlsdGVyczogYW55W10gPSBbXTtcblx0XHRsZXQgYUNoYXJ0RmlsdGVycyA9IFtdO1xuXHRcdGNvbnN0IHNDdXJyZW50RmlsdGVyS2V5ID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVkpO1xuXG5cdFx0Ly8gQWRkIGZpbHRlcnMgcmVsYXRlZCB0byB0aGUgY2hhcnQgZm9yIEFMUFxuXHRcdGlmIChvQ29udHJvbGxlciAmJiBvQ29udHJvbGxlci5nZXRDaGFydENvbnRyb2wpIHtcblx0XHRcdGNvbnN0IG9DaGFydCA9IG9Db250cm9sbGVyLmdldENoYXJ0Q29udHJvbCgpO1xuXHRcdFx0aWYgKG9DaGFydCkge1xuXHRcdFx0XHRjb25zdCBvQ2hhcnRGaWx0ZXJJbmZvID0gQ2hhcnRVdGlscy5nZXRBbGxGaWx0ZXJJbmZvKG9DaGFydCk7XG5cdFx0XHRcdGlmIChvQ2hhcnRGaWx0ZXJJbmZvICYmIG9DaGFydEZpbHRlckluZm8uZmlsdGVycy5sZW5ndGgpIHtcblx0XHRcdFx0XHRhQ2hhcnRGaWx0ZXJzID0gb0NoYXJ0RmlsdGVySW5mby5maWx0ZXJzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0YUFkZGl0aW9uYWxGaWx0ZXJzID0gYUFkZGl0aW9uYWxGaWx0ZXJzLmNvbmNhdChUYWJsZVV0aWxzLmdldEhpZGRlbkZpbHRlcnMob1RhYmxlKSkuY29uY2F0KGFDaGFydEZpbHRlcnMpO1xuXHRcdGZvciAoY29uc3QgayBpbiBvU3ZJdGVtcykge1xuXHRcdFx0Y29uc3Qgc0l0ZW1LZXkgPSBvU3ZJdGVtc1trXS5nZXRLZXkoKSxcblx0XHRcdFx0b0ZpbHRlckluZm9zID0gVGFibGVVdGlscy5nZXRGaWx0ZXJzSW5mb0ZvclNWKG9UYWJsZSwgc0l0ZW1LZXkpO1xuXHRcdFx0YUluaXRpYWxJdGVtVGV4dHMucHVzaChvRmlsdGVySW5mb3MudGV4dCk7XG5cdFx0XHRvTW9kZWwuc2V0UHJvcGVydHkoYC9wYXRocy8ke2t9L2NvdW50YCwgXCIuLi5cIik7XG5cdFx0XHRhQmluZGluZ1Byb21pc2VzLnB1c2goXG5cdFx0XHRcdFRhYmxlVXRpbHMuZ2V0TGlzdEJpbmRpbmdGb3JDb3VudChvVGFibGUsIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpLCB7XG5cdFx0XHRcdFx0YmF0Y2hHcm91cElkOiBzSXRlbUtleSA9PT0gc0N1cnJlbnRGaWx0ZXJLZXkgPyB0aGlzLmJhdGNoR3JvdXBJZCA6IFwiJGF1dG9cIixcblx0XHRcdFx0XHRhZGRpdGlvbmFsRmlsdGVyczogYUFkZGl0aW9uYWxGaWx0ZXJzLmNvbmNhdChvRmlsdGVySW5mb3MuZmlsdGVycylcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fVxuXHRcdFByb21pc2UuYWxsKGFCaW5kaW5nUHJvbWlzZXMpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoYUNvdW50czogYW55W10pIHtcblx0XHRcdFx0Zm9yIChjb25zdCBrIGluIGFDb3VudHMpIHtcblx0XHRcdFx0XHRvTW9kZWwuc2V0UHJvcGVydHkoYC9wYXRocy8ke2t9L2NvdW50YCwgVGFibGVVdGlscy5nZXRDb3VudEZvcm1hdHRlZChhQ291bnRzW2tdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIGJpbmRpbmcgcHJvbWlzZXNcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9XG5cdF9vblNlbGVjdGlvbkNoYW5nZShvRXZlbnQ6IGFueSkge1xuXHRcdGNvbnN0IG9Db250cm9sID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdERlbGVnYXRlVXRpbC5zZXRDdXN0b21EYXRhKHRoaXMuX29UYWJsZSwgUFJPUEVSVFlfUVVJQ0tGSUxURVJfS0VZLCBvQ29udHJvbC5nZXRTZWxlY3RlZEtleSgpKTtcblx0XHQodGhpcy5fb1RhYmxlIGFzIGFueSkucmViaW5kKCk7XG5cdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSB0aGlzLl9nZXRWaWV3Q29udHJvbGxlcigpO1xuXHRcdGlmIChvQ29udHJvbGxlciAmJiBvQ29udHJvbGxlci5nZXRFeHRlbnNpb25BUEkgJiYgb0NvbnRyb2xsZXIuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUpIHtcblx0XHRcdG9Db250cm9sbGVyLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0fVxuXHR9XG5cdGRlc3Ryb3koYlN1cHByZXNzSW52YWxpZGF0ZT86IGJvb2xlYW4pIHtcblx0XHRpZiAodGhpcy5fYXR0YWNoZWRUb1ZpZXcpIHtcblx0XHRcdGNvbnN0IG9TaWRlRWZmZWN0cyA9IHRoaXMuX2dldFNpZGVFZmZlY3RDb250cm9sbGVyKCk7XG5cdFx0XHRpZiAob1NpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdC8vIGlmIFwiZGVzdHJveVwiIHNpZ25hbCBjb21lcyB3aGVuIHZpZXcgaXMgZGVzdHJveWVkIHRoZXJlIGlzIG5vdCBhbnltb3JlIHJlZmVyZW5jZSB0byBDb250cm9sbGVyIEV4dGVuc2lvblxuXHRcdFx0XHRvU2lkZUVmZmVjdHMucmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzKHRoaXMpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRkZWxldGUgdGhpcy5fb1RhYmxlO1xuXHRcdHN1cGVyLmRlc3Ryb3koYlN1cHByZXNzSW52YWxpZGF0ZSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUXVpY2tGaWx0ZXJDb250YWluZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztFQW1CQSxJQUFNQSx3QkFBd0IsR0FBRyxnQkFBZ0I7RUFDakQsSUFBTUMsWUFBWSxHQUFHLFNBQVM7RUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsSUFTTUMsb0JBQW9CLFdBSHpCQyxjQUFjLENBQUMsMENBQTBDLEVBQUU7SUFDM0RDLFVBQVUsRUFBRSxDQUFDLCtCQUErQjtFQUM3QyxDQUFDLENBQUMsVUFFQUMsUUFBUSxD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