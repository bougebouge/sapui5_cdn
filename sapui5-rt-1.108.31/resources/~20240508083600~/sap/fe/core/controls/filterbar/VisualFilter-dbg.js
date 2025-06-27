/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controls/filterbar/utils/VisualFilterUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/CommonHelper", "sap/fe/macros/filter/FilterUtils", "sap/m/VBox", "sap/ui/core/Core", "../../templating/FilterHelper"], function (CommonUtils, VisualFilterUtils, ClassSupport, CommonHelper, FilterUtils, VBox, Core, FilterHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var getFiltersConditionsFromSelectionVariant = FilterHelper.getFiltersConditionsFromSelectionVariant;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Constructor for a new filterBar/aligned/FilterItemLayout.
   *
   * @param {string} [sId] ID for the new control, generated automatically if no ID is given
   * @param {object} [mSettings] Initial settings for the new control
   * @class Represents a filter item on the UI.
   * @extends sap.m.VBox
   * @implements {sap.ui.core.IFormContent}
   * @class
   * @private
   * @since 1.61.0
   * @alias control sap.fe.core.controls.filterbar.VisualFilter
   */
  var VisualFilter = (_dec = defineUI5Class("sap.fe.core.controls.filterbar.VisualFilter"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_VBox) {
    _inheritsLoose(VisualFilter, _VBox);
    function VisualFilter() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _VBox.call.apply(_VBox, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showValueHelp", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpIconSrc", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpRequest", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = VisualFilter.prototype;
    _proto.onAfterRendering = function onAfterRendering() {
      var sLabel;
      var oInteractiveChart = this.getItems()[1].getItems()[0];
      var sInternalContextPath = this.data("infoPath");
      var oInteractiveChartListBinding = oInteractiveChart.getBinding("segments") || oInteractiveChart.getBinding("bars") || oInteractiveChart.getBinding("points");
      var oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      var bShowOverLayInitially = oInteractiveChart.data("showOverlayInitially");
      var oSelectionVariantAnnotation = oInteractiveChart.data("selectionVariantAnnotation") ? CommonHelper.parseCustomData(oInteractiveChart.data("selectionVariantAnnotation")) : {
        SelectOptions: []
      };
      var aRequiredProperties = oInteractiveChart.data("requiredProperties") ? CommonHelper.parseCustomData(oInteractiveChart.data("requiredProperties")) : [];
      var oMetaModel = oInteractiveChart.getModel().getMetaModel();
      var sEntitySetPath = oInteractiveChartListBinding ? oInteractiveChartListBinding.getPath() : "";
      var oFilterBar = this.getParent().getParent();
      // TODO: Remove this part once 2170204347 is fixed
      if (oFilterBar.getMetadata().getElementName() === "sap.ui.mdc.filterbar.p13n.AdaptationFilterBar") {
        oFilterBar = oFilterBar.getParent().getParent();
      }
      var oFilterBarConditions = {};
      var aPropertyInfoSet = [];
      var sFilterEntityName;
      if (oFilterBar.getMetadata().getElementName() === "sap.fe.core.controls.FilterBar") {
        oFilterBarConditions = oFilterBar.getConditions();
        aPropertyInfoSet = oFilterBar.getPropertyInfoSet();
        sFilterEntityName = oFilterBar.data("entityType").split("/")[1];
      }
      var aParameters = oInteractiveChart.data("parameters") ? oInteractiveChart.data("parameters").customData : [];
      var filterConditions = getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, oSelectionVariantAnnotation, VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils));
      var oSelectionVariantConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
      var mConditions = {};
      Object.keys(oFilterBarConditions).forEach(function (sKey) {
        if (oFilterBarConditions[sKey].length) {
          mConditions[sKey] = oFilterBarConditions[sKey];
        }
      });
      Object.keys(oSelectionVariantConditions).forEach(function (sKey) {
        if (!mConditions[sKey]) {
          mConditions[sKey] = oSelectionVariantConditions[sKey];
        }
      });
      if (bShowOverLayInitially === "true") {
        if (!Object.keys(oSelectionVariantAnnotation).length) {
          if (aRequiredProperties.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              "showError": true,
              "errorMessageTitle": oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              "errorMessage": oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            sLabel = oMetaModel.getObject("".concat(sEntitySetPath, "/").concat(aRequiredProperties[0], "@com.sap.vocabularies.Common.v1.Label")) || aRequiredProperties[0];
            oInternalModelContext.setProperty(sInternalContextPath, {
              "showError": true,
              "errorMessageTitle": oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              "errorMessage": oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
            });
          }
        } else {
          var aSelectOptions = [];
          var aNotMatchedConditions = [];
          if (oSelectionVariantAnnotation.SelectOptions) {
            oSelectionVariantAnnotation.SelectOptions.forEach(function (oSelectOption) {
              aSelectOptions.push(oSelectOption.PropertyName.$PropertyPath);
            });
          }
          if (oSelectionVariantAnnotation.Parameters) {
            oSelectionVariantAnnotation.Parameters.forEach(function (oParameter) {
              aSelectOptions.push(oParameter.PropertyName.$PropertyPath);
            });
          }
          aRequiredProperties.forEach(function (sPath) {
            if (aSelectOptions.indexOf(sPath) === -1) {
              aNotMatchedConditions.push(sPath);
            }
          });
          if (aNotMatchedConditions.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              "showError": true,
              "errorMessageTitle": oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              "errorMessage": oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            sLabel = oMetaModel.getObject("".concat(sEntitySetPath, "/").concat(aNotMatchedConditions[0], "@com.sap.vocabularies.Common.v1.Label")) || aNotMatchedConditions[0];
            oInternalModelContext.setProperty(sInternalContextPath, {
              "showError": true,
              "errorMessageTitle": oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              "errorMessage": oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
            });
          }
          if (aNotMatchedConditions.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              "showError": true,
              "errorMessageTitle": oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              "errorMessage": oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            oInternalModelContext.setProperty(sInternalContextPath, {
              "showError": true,
              "errorMessageTitle": oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              "errorMessage": oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", aNotMatchedConditions[0])
            });
          }
        }
      }
      if (!this._oChartBinding || this._oChartBinding !== oInteractiveChartListBinding) {
        if (this._oChartBinding) {
          this.detachDataReceivedHandler(this._oChartBinding);
        }
        this.attachDataRecivedHandler(oInteractiveChartListBinding);
        this._oChartBinding = oInteractiveChartListBinding;
      }
      var bShowOverlay = oInternalModelContext.getProperty(sInternalContextPath) && oInternalModelContext.getProperty(sInternalContextPath).showError;
      var sChartEntityName = sEntitySetPath !== "" ? sEntitySetPath.split("/")[1].split("(")[0] : "";
      if (aParameters && aParameters.length && sFilterEntityName === sChartEntityName) {
        var sBindingPath = FilterUtils.getBindingPathForParameters(oFilterBar, mConditions, aPropertyInfoSet, aParameters);
        if (sBindingPath) {
          oInteractiveChartListBinding.sPath = sBindingPath;
        }
      }
      // resume binding for only those visual filters that do not have a in parameter attached.
      // Bindings of visual filters with inParameters will be resumed later after considering in parameters.
      if (oInteractiveChartListBinding && oInteractiveChartListBinding.isSuspended() && !bShowOverlay) {
        oInteractiveChartListBinding.resume();
      }
    };
    _proto.attachDataRecivedHandler = function attachDataRecivedHandler(oInteractiveChartListBinding) {
      if (oInteractiveChartListBinding) {
        oInteractiveChartListBinding.attachEvent("dataReceived", this.onInternalDataReceived, this);
        this._oChartBinding = oInteractiveChartListBinding;
      }
    };
    _proto.detachDataReceivedHandler = function detachDataReceivedHandler(oInteractiveChartListBinding) {
      if (oInteractiveChartListBinding) {
        oInteractiveChartListBinding.detachEvent("dataReceived", this.onInternalDataReceived, this);
        this._oChartBinding = undefined;
      }
    };
    _proto.setShowValueHelp = function setShowValueHelp(bShowValueHelp) {
      if (this.getItems().length > 0) {
        var oVisualFilterControl = this.getItems()[0].getItems()[0];
        oVisualFilterControl.getContent().some(function (oInnerControl) {
          if (oInnerControl.isA("sap.m.Button")) {
            oInnerControl.setVisible(bShowValueHelp);
          }
        });
        this.setProperty("showValueHelp", bShowValueHelp);
      }
    };
    _proto.setValueHelpIconSrc = function setValueHelpIconSrc(sIconSrc) {
      if (this.getItems().length > 0) {
        var oVisualFilterControl = this.getItems()[0].getItems()[0];
        oVisualFilterControl.getContent().some(function (oInnerControl) {
          if (oInnerControl.isA("sap.m.Button")) {
            oInnerControl.setIcon(sIconSrc);
          }
        });
        this.setProperty("valueHelpIconSrc", sIconSrc);
      }
    };
    _proto.onInternalDataReceived = function onInternalDataReceived(oEvent) {
      var sId = this.getId();
      var oView = CommonUtils.getTargetView(this);
      var oInteractiveChart = this.getItems()[1].getItems()[0];
      var sInternalContextPath = this.data("infoPath");
      var oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      var vUOM = oInteractiveChart.data("uom");
      VisualFilterUtils.updateChartScaleFactorTitle(oInteractiveChart, oView, sId, sInternalContextPath);
      if (oEvent.getParameter("error")) {
        var s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
        var s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_DATA_TEXT");
        VisualFilterUtils.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInternalContextPath, oView);
      } else if (oEvent.getParameter("data")) {
        var oData = oEvent.getSource().getCurrentContexts();
        if (oData && oData.length === 0) {
          VisualFilterUtils.setNoDataMessage(sInternalContextPath, oResourceBundle, oView);
        } else {
          oInternalModelContext.setProperty(sInternalContextPath, {});
        }
        VisualFilterUtils.setMultiUOMMessage(oData, oInteractiveChart, sInternalContextPath, oResourceBundle, oView);
      }
      if (vUOM && (vUOM["ISOCurrency"] && vUOM["ISOCurrency"].$Path || vUOM["Unit"] && vUOM["Unit"].$Path)) {
        var oContexts = oEvent.getSource().getContexts();
        var oContextData = oContexts && oContexts[0].getObject();
        VisualFilterUtils.applyUOMToTitle(oInteractiveChart, oContextData, oView, sInternalContextPath);
      }
    };
    return VisualFilter;
  }(VBox), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "showValueHelp", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpIconSrc", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpRequest", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return VisualFilter;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImV2ZW50Iiwib25BZnRlclJlbmRlcmluZyIsInNMYWJlbCIsIm9JbnRlcmFjdGl2ZUNoYXJ0IiwiZ2V0SXRlbXMiLCJzSW50ZXJuYWxDb250ZXh0UGF0aCIsImRhdGEiLCJvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nIiwiZ2V0QmluZGluZyIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImJTaG93T3ZlckxheUluaXRpYWxseSIsIm9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiIsIkNvbW1vbkhlbHBlciIsInBhcnNlQ3VzdG9tRGF0YSIsIlNlbGVjdE9wdGlvbnMiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzIiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0VudGl0eVNldFBhdGgiLCJnZXRQYXRoIiwib0ZpbHRlckJhciIsImdldFBhcmVudCIsImdldE1ldGFkYXRhIiwiZ2V0RWxlbWVudE5hbWUiLCJvRmlsdGVyQmFyQ29uZGl0aW9ucyIsImFQcm9wZXJ0eUluZm9TZXQiLCJzRmlsdGVyRW50aXR5TmFtZSIsImdldENvbmRpdGlvbnMiLCJnZXRQcm9wZXJ0eUluZm9TZXQiLCJzcGxpdCIsImFQYXJhbWV0ZXJzIiwiY3VzdG9tRGF0YSIsImZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IiwiVmlzdWFsRmlsdGVyVXRpbHMiLCJnZXRDdXN0b21Db25kaXRpb25zIiwiYmluZCIsIm9TZWxlY3Rpb25WYXJpYW50Q29uZGl0aW9ucyIsImNvbnZlcnRGaWx0ZXJDb25kaW9ucyIsIm1Db25kaXRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzS2V5IiwibGVuZ3RoIiwic2V0UHJvcGVydHkiLCJnZXRUZXh0IiwiZ2V0T2JqZWN0IiwiYVNlbGVjdE9wdGlvbnMiLCJhTm90TWF0Y2hlZENvbmRpdGlvbnMiLCJvU2VsZWN0T3B0aW9uIiwicHVzaCIsIlByb3BlcnR5TmFtZSIsIiRQcm9wZXJ0eVBhdGgiLCJQYXJhbWV0ZXJzIiwib1BhcmFtZXRlciIsInNQYXRoIiwiaW5kZXhPZiIsIl9vQ2hhcnRCaW5kaW5nIiwiZGV0YWNoRGF0YVJlY2VpdmVkSGFuZGxlciIsImF0dGFjaERhdGFSZWNpdmVkSGFuZGxlciIsImJTaG93T3ZlcmxheSIsImdldFByb3BlcnR5Iiwic2hvd0Vycm9yIiwic0NoYXJ0RW50aXR5TmFtZSIsInNCaW5kaW5nUGF0aCIsIkZpbHRlclV0aWxzIiwiZ2V0QmluZGluZ1BhdGhGb3JQYXJhbWV0ZXJzIiwiaXNTdXNwZW5kZWQiLCJyZXN1bWUiLCJhdHRhY2hFdmVudCIsIm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQiLCJkZXRhY2hFdmVudCIsInVuZGVmaW5lZCIsInNldFNob3dWYWx1ZUhlbHAiLCJiU2hvd1ZhbHVlSGVscCIsIm9WaXN1YWxGaWx0ZXJDb250cm9sIiwiZ2V0Q29udGVudCIsInNvbWUiLCJvSW5uZXJDb250cm9sIiwiaXNBIiwic2V0VmlzaWJsZSIsInNldFZhbHVlSGVscEljb25TcmMiLCJzSWNvblNyYyIsInNldEljb24iLCJvRXZlbnQiLCJzSWQiLCJnZXRJZCIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwidlVPTSIsInVwZGF0ZUNoYXJ0U2NhbGVGYWN0b3JUaXRsZSIsImdldFBhcmFtZXRlciIsInMxOG5NZXNzYWdlVGl0bGUiLCJzMThuTWVzc2FnZSIsImFwcGx5RXJyb3JNZXNzYWdlQW5kVGl0bGUiLCJvRGF0YSIsImdldFNvdXJjZSIsImdldEN1cnJlbnRDb250ZXh0cyIsInNldE5vRGF0YU1lc3NhZ2UiLCJzZXRNdWx0aVVPTU1lc3NhZ2UiLCIkUGF0aCIsIm9Db250ZXh0cyIsImdldENvbnRleHRzIiwib0NvbnRleHREYXRhIiwiYXBwbHlVT01Ub1RpdGxlIiwiVkJveCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlzdWFsRmlsdGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBWaXN1YWxGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbHMvZmlsdGVyYmFyL3V0aWxzL1Zpc3VhbEZpbHRlclV0aWxzXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIGltcGxlbWVudEludGVyZmFjZSwgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgVkJveCBmcm9tIFwic2FwL20vVkJveFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIHsgSUZvcm1Db250ZW50IH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7IGdldEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwiLi4vLi4vdGVtcGxhdGluZy9GaWx0ZXJIZWxwZXJcIjtcbi8qKlxuICogQ29uc3RydWN0b3IgZm9yIGEgbmV3IGZpbHRlckJhci9hbGlnbmVkL0ZpbHRlckl0ZW1MYXlvdXQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFtzSWRdIElEIGZvciB0aGUgbmV3IGNvbnRyb2wsIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5IGlmIG5vIElEIGlzIGdpdmVuXG4gKiBAcGFyYW0ge29iamVjdH0gW21TZXR0aW5nc10gSW5pdGlhbCBzZXR0aW5ncyBmb3IgdGhlIG5ldyBjb250cm9sXG4gKiBAY2xhc3MgUmVwcmVzZW50cyBhIGZpbHRlciBpdGVtIG9uIHRoZSBVSS5cbiAqIEBleHRlbmRzIHNhcC5tLlZCb3hcbiAqIEBpbXBsZW1lbnRzIHtzYXAudWkuY29yZS5JRm9ybUNvbnRlbnR9XG4gKiBAY2xhc3NcbiAqIEBwcml2YXRlXG4gKiBAc2luY2UgMS42MS4wXG4gKiBAYWxpYXMgY29udHJvbCBzYXAuZmUuY29yZS5jb250cm9scy5maWx0ZXJiYXIuVmlzdWFsRmlsdGVyXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhci5WaXN1YWxGaWx0ZXJcIilcbmNsYXNzIFZpc3VhbEZpbHRlciBleHRlbmRzIFZCb3ggaW1wbGVtZW50cyBJRm9ybUNvbnRlbnQge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUZvcm1Db250ZW50XCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUZvcm1Db250ZW50OiBib29sZWFuID0gdHJ1ZTtcblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRzaG93VmFsdWVIZWxwITogYm9vbGVhbjtcblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHZhbHVlSGVscEljb25TcmMhOiBzdHJpbmc7XG5cdEBldmVudCgpXG5cdHZhbHVlSGVscFJlcXVlc3QhOiBGdW5jdGlvbjtcblx0cHJpdmF0ZSBfb0NoYXJ0QmluZGluZz86IGJvb2xlYW47XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRsZXQgc0xhYmVsO1xuXHRcdGNvbnN0IG9JbnRlcmFjdGl2ZUNoYXJ0ID0gKHRoaXMuZ2V0SXRlbXMoKVsxXSBhcyBhbnkpLmdldEl0ZW1zKClbMF07XG5cdFx0Y29uc3Qgc0ludGVybmFsQ29udGV4dFBhdGggPSB0aGlzLmRhdGEoXCJpbmZvUGF0aFwiKTtcblx0XHRjb25zdCBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nID1cblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmcoXCJzZWdtZW50c1wiKSB8fCBvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nKFwiYmFyc1wiKSB8fCBvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nKFwicG9pbnRzXCIpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUubWFjcm9zXCIpO1xuXHRcdGNvbnN0IGJTaG93T3ZlckxheUluaXRpYWxseSA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJzaG93T3ZlcmxheUluaXRpYWxseVwiKTtcblx0XHRjb25zdCBvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb246IGFueSA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvblwiKVxuXHRcdFx0PyBDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvblwiKSlcblx0XHRcdDogeyBTZWxlY3RPcHRpb25zOiBbXSB9O1xuXHRcdGNvbnN0IGFSZXF1aXJlZFByb3BlcnRpZXM6IGFueVtdID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInJlcXVpcmVkUHJvcGVydGllc1wiKVxuXHRcdFx0PyAoQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwicmVxdWlyZWRQcm9wZXJ0aWVzXCIpKSBhcyBhbnlbXSlcblx0XHRcdDogW107XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nID8gb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5nZXRQYXRoKCkgOiBcIlwiO1xuXHRcdGxldCBvRmlsdGVyQmFyID0gdGhpcy5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKSBhcyBGaWx0ZXJCYXI7XG5cdFx0Ly8gVE9ETzogUmVtb3ZlIHRoaXMgcGFydCBvbmNlIDIxNzAyMDQzNDcgaXMgZml4ZWRcblx0XHRpZiAob0ZpbHRlckJhci5nZXRNZXRhZGF0YSgpLmdldEVsZW1lbnROYW1lKCkgPT09IFwic2FwLnVpLm1kYy5maWx0ZXJiYXIucDEzbi5BZGFwdGF0aW9uRmlsdGVyQmFyXCIpIHtcblx0XHRcdG9GaWx0ZXJCYXIgPSBvRmlsdGVyQmFyLmdldFBhcmVudCgpLmdldFBhcmVudCgpIGFzIEZpbHRlckJhcjtcblx0XHR9XG5cdFx0bGV0IG9GaWx0ZXJCYXJDb25kaXRpb25zOiBhbnkgPSB7fTtcblx0XHRsZXQgYVByb3BlcnR5SW5mb1NldCA9IFtdO1xuXHRcdGxldCBzRmlsdGVyRW50aXR5TmFtZTtcblx0XHRpZiAob0ZpbHRlckJhci5nZXRNZXRhZGF0YSgpLmdldEVsZW1lbnROYW1lKCkgPT09IFwic2FwLmZlLmNvcmUuY29udHJvbHMuRmlsdGVyQmFyXCIpIHtcblx0XHRcdG9GaWx0ZXJCYXJDb25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0XHRhUHJvcGVydHlJbmZvU2V0ID0gKG9GaWx0ZXJCYXIgYXMgYW55KS5nZXRQcm9wZXJ0eUluZm9TZXQoKTtcblx0XHRcdHNGaWx0ZXJFbnRpdHlOYW1lID0gb0ZpbHRlckJhci5kYXRhKFwiZW50aXR5VHlwZVwiKS5zcGxpdChcIi9cIilbMV07XG5cdFx0fVxuXHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInBhcmFtZXRlcnNcIikgPyBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwicGFyYW1ldGVyc1wiKS5jdXN0b21EYXRhIDogW107XG5cdFx0Y29uc3QgZmlsdGVyQ29uZGl0aW9ucyA9IGdldEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdGlvblZhcmlhbnQoXG5cdFx0XHRzRW50aXR5U2V0UGF0aCxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5nZXRDdXN0b21Db25kaXRpb25zLmJpbmQoVmlzdWFsRmlsdGVyVXRpbHMpXG5cdFx0KTtcblx0XHRjb25zdCBvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnMgPSBWaXN1YWxGaWx0ZXJVdGlscy5jb252ZXJ0RmlsdGVyQ29uZGlvbnMoZmlsdGVyQ29uZGl0aW9ucyk7XG5cdFx0Y29uc3QgbUNvbmRpdGlvbnM6IGFueSA9IHt9O1xuXG5cdFx0T2JqZWN0LmtleXMob0ZpbHRlckJhckNvbmRpdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0aWYgKG9GaWx0ZXJCYXJDb25kaXRpb25zW3NLZXldLmxlbmd0aCkge1xuXHRcdFx0XHRtQ29uZGl0aW9uc1tzS2V5XSA9IG9GaWx0ZXJCYXJDb25kaXRpb25zW3NLZXldO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0T2JqZWN0LmtleXMob1NlbGVjdGlvblZhcmlhbnRDb25kaXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmICghbUNvbmRpdGlvbnNbc0tleV0pIHtcblx0XHRcdFx0bUNvbmRpdGlvbnNbc0tleV0gPSBvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnNbc0tleV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0aWYgKGJTaG93T3ZlckxheUluaXRpYWxseSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdGlmICghT2JqZWN0LmtleXMob1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uKS5sZW5ndGgpIHtcblx0XHRcdFx0aWYgKGFSZXF1aXJlZFByb3BlcnRpZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge1xuXHRcdFx0XHRcdFx0XCJzaG93RXJyb3JcIjogdHJ1ZSxcblx0XHRcdFx0XHRcdFwiZXJyb3JNZXNzYWdlVGl0bGVcIjogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdFx0XHRcImVycm9yTWVzc2FnZVwiOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX01VTFRJUExFVkZcIilcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzTGFiZWwgPVxuXHRcdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9LyR7YVJlcXVpcmVkUHJvcGVydGllc1swXX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYCkgfHxcblx0XHRcdFx0XHRcdGFSZXF1aXJlZFByb3BlcnRpZXNbMF07XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoLCB7XG5cdFx0XHRcdFx0XHRcInNob3dFcnJvclwiOiB0cnVlLFxuXHRcdFx0XHRcdFx0XCJlcnJvck1lc3NhZ2VUaXRsZVwiOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRcdFwiZXJyb3JNZXNzYWdlXCI6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfU0lOR0xFVkZcIiwgc0xhYmVsKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBhU2VsZWN0T3B0aW9uczogYW55W10gPSBbXTtcblx0XHRcdFx0Y29uc3QgYU5vdE1hdGNoZWRDb25kaXRpb25zOiBhbnlbXSA9IFtdO1xuXHRcdFx0XHRpZiAob1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLlNlbGVjdE9wdGlvbnMpIHtcblx0XHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24uU2VsZWN0T3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VsZWN0T3B0aW9uOiBhbnkpIHtcblx0XHRcdFx0XHRcdGFTZWxlY3RPcHRpb25zLnB1c2gob1NlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUuJFByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbi5QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLlBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRcdFx0XHRhU2VsZWN0T3B0aW9ucy5wdXNoKG9QYXJhbWV0ZXIuUHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFSZXF1aXJlZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoc1BhdGg6IGFueSkge1xuXHRcdFx0XHRcdGlmIChhU2VsZWN0T3B0aW9ucy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdGFOb3RNYXRjaGVkQ29uZGl0aW9ucy5wdXNoKHNQYXRoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoYU5vdE1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIHtcblx0XHRcdFx0XHRcdFwic2hvd0Vycm9yXCI6IHRydWUsXG5cdFx0XHRcdFx0XHRcImVycm9yTWVzc2FnZVRpdGxlXCI6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpLFxuXHRcdFx0XHRcdFx0XCJlcnJvck1lc3NhZ2VcIjogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX1BST1ZJREVfRklMVEVSX1ZBTF9NVUxUSVBMRVZGXCIpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c0xhYmVsID1cblx0XHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS8ke2FOb3RNYXRjaGVkQ29uZGl0aW9uc1swXX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYCkgfHxcblx0XHRcdFx0XHRcdGFOb3RNYXRjaGVkQ29uZGl0aW9uc1swXTtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIHtcblx0XHRcdFx0XHRcdFwic2hvd0Vycm9yXCI6IHRydWUsXG5cdFx0XHRcdFx0XHRcImVycm9yTWVzc2FnZVRpdGxlXCI6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpLFxuXHRcdFx0XHRcdFx0XCJlcnJvck1lc3NhZ2VcIjogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX1BST1ZJREVfRklMVEVSX1ZBTF9TSU5HTEVWRlwiLCBzTGFiZWwpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFOb3RNYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoLCB7XG5cdFx0XHRcdFx0XHRcInNob3dFcnJvclwiOiB0cnVlLFxuXHRcdFx0XHRcdFx0XCJlcnJvck1lc3NhZ2VUaXRsZVwiOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRcdFwiZXJyb3JNZXNzYWdlXCI6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfTVVMVElQTEVWRlwiKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge1xuXHRcdFx0XHRcdFx0XCJzaG93RXJyb3JcIjogdHJ1ZSxcblx0XHRcdFx0XHRcdFwiZXJyb3JNZXNzYWdlVGl0bGVcIjogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdFx0XHRcImVycm9yTWVzc2FnZVwiOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX1NJTkdMRVZGXCIsIGFOb3RNYXRjaGVkQ29uZGl0aW9uc1swXSlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5fb0NoYXJ0QmluZGluZyB8fCB0aGlzLl9vQ2hhcnRCaW5kaW5nICE9PSBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nKSB7XG5cdFx0XHRpZiAodGhpcy5fb0NoYXJ0QmluZGluZykge1xuXHRcdFx0XHR0aGlzLmRldGFjaERhdGFSZWNlaXZlZEhhbmRsZXIodGhpcy5fb0NoYXJ0QmluZGluZyk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmF0dGFjaERhdGFSZWNpdmVkSGFuZGxlcihvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nKTtcblx0XHRcdHRoaXMuX29DaGFydEJpbmRpbmcgPSBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nO1xuXHRcdH1cblx0XHRjb25zdCBiU2hvd092ZXJsYXkgPVxuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoKSAmJiBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgpLnNob3dFcnJvcjtcblx0XHRjb25zdCBzQ2hhcnRFbnRpdHlOYW1lID0gc0VudGl0eVNldFBhdGggIT09IFwiXCIgPyBzRW50aXR5U2V0UGF0aC5zcGxpdChcIi9cIilbMV0uc3BsaXQoXCIoXCIpWzBdIDogXCJcIjtcblx0XHRpZiAoYVBhcmFtZXRlcnMgJiYgYVBhcmFtZXRlcnMubGVuZ3RoICYmIHNGaWx0ZXJFbnRpdHlOYW1lID09PSBzQ2hhcnRFbnRpdHlOYW1lKSB7XG5cdFx0XHRjb25zdCBzQmluZGluZ1BhdGggPSBGaWx0ZXJVdGlscy5nZXRCaW5kaW5nUGF0aEZvclBhcmFtZXRlcnMob0ZpbHRlckJhciwgbUNvbmRpdGlvbnMsIGFQcm9wZXJ0eUluZm9TZXQsIGFQYXJhbWV0ZXJzKTtcblx0XHRcdGlmIChzQmluZGluZ1BhdGgpIHtcblx0XHRcdFx0b0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5zUGF0aCA9IHNCaW5kaW5nUGF0aDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gcmVzdW1lIGJpbmRpbmcgZm9yIG9ubHkgdGhvc2UgdmlzdWFsIGZpbHRlcnMgdGhhdCBkbyBub3QgaGF2ZSBhIGluIHBhcmFtZXRlciBhdHRhY2hlZC5cblx0XHQvLyBCaW5kaW5ncyBvZiB2aXN1YWwgZmlsdGVycyB3aXRoIGluUGFyYW1ldGVycyB3aWxsIGJlIHJlc3VtZWQgbGF0ZXIgYWZ0ZXIgY29uc2lkZXJpbmcgaW4gcGFyYW1ldGVycy5cblx0XHRpZiAob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZyAmJiBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmlzU3VzcGVuZGVkKCkgJiYgIWJTaG93T3ZlcmxheSkge1xuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5yZXN1bWUoKTtcblx0XHR9XG5cdH1cblxuXHRhdHRhY2hEYXRhUmVjaXZlZEhhbmRsZXIob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZzogYW55KSB7XG5cdFx0aWYgKG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcpIHtcblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuYXR0YWNoRXZlbnQoXCJkYXRhUmVjZWl2ZWRcIiwgdGhpcy5vbkludGVybmFsRGF0YVJlY2VpdmVkLCB0aGlzKTtcblx0XHRcdHRoaXMuX29DaGFydEJpbmRpbmcgPSBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nO1xuXHRcdH1cblx0fVxuXG5cdGRldGFjaERhdGFSZWNlaXZlZEhhbmRsZXIob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZzogYW55KSB7XG5cdFx0aWYgKG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcpIHtcblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuZGV0YWNoRXZlbnQoXCJkYXRhUmVjZWl2ZWRcIiwgdGhpcy5vbkludGVybmFsRGF0YVJlY2VpdmVkLCB0aGlzKTtcblx0XHRcdHRoaXMuX29DaGFydEJpbmRpbmcgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0c2V0U2hvd1ZhbHVlSGVscChiU2hvd1ZhbHVlSGVscDogYW55KSB7XG5cdFx0aWYgKHRoaXMuZ2V0SXRlbXMoKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBvVmlzdWFsRmlsdGVyQ29udHJvbCA9ICh0aGlzLmdldEl0ZW1zKClbMF0gYXMgYW55KS5nZXRJdGVtcygpWzBdO1xuXHRcdFx0b1Zpc3VhbEZpbHRlckNvbnRyb2wuZ2V0Q29udGVudCgpLnNvbWUoZnVuY3Rpb24gKG9Jbm5lckNvbnRyb2w6IGFueSkge1xuXHRcdFx0XHRpZiAob0lubmVyQ29udHJvbC5pc0EoXCJzYXAubS5CdXR0b25cIikpIHtcblx0XHRcdFx0XHRvSW5uZXJDb250cm9sLnNldFZpc2libGUoYlNob3dWYWx1ZUhlbHApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UHJvcGVydHkoXCJzaG93VmFsdWVIZWxwXCIsIGJTaG93VmFsdWVIZWxwKTtcblx0XHR9XG5cdH1cblxuXHRzZXRWYWx1ZUhlbHBJY29uU3JjKHNJY29uU3JjOiBhbnkpIHtcblx0XHRpZiAodGhpcy5nZXRJdGVtcygpLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9WaXN1YWxGaWx0ZXJDb250cm9sID0gKHRoaXMuZ2V0SXRlbXMoKVswXSBhcyBhbnkpLmdldEl0ZW1zKClbMF07XG5cdFx0XHRvVmlzdWFsRmlsdGVyQ29udHJvbC5nZXRDb250ZW50KCkuc29tZShmdW5jdGlvbiAob0lubmVyQ29udHJvbDogYW55KSB7XG5cdFx0XHRcdGlmIChvSW5uZXJDb250cm9sLmlzQShcInNhcC5tLkJ1dHRvblwiKSkge1xuXHRcdFx0XHRcdG9Jbm5lckNvbnRyb2wuc2V0SWNvbihzSWNvblNyYyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zZXRQcm9wZXJ0eShcInZhbHVlSGVscEljb25TcmNcIiwgc0ljb25TcmMpO1xuXHRcdH1cblx0fVxuXG5cdG9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQob0V2ZW50OiBhbnkpIHtcblx0XHRjb25zdCBzSWQgPSB0aGlzLmdldElkKCk7XG5cdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRoaXMpO1xuXHRcdGNvbnN0IG9JbnRlcmFjdGl2ZUNoYXJ0ID0gKHRoaXMuZ2V0SXRlbXMoKVsxXSBhcyBhbnkpLmdldEl0ZW1zKClbMF07XG5cdFx0Y29uc3Qgc0ludGVybmFsQ29udGV4dFBhdGggPSB0aGlzLmRhdGEoXCJpbmZvUGF0aFwiKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLm1hY3Jvc1wiKTtcblx0XHRjb25zdCB2VU9NID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInVvbVwiKTtcblx0XHRWaXN1YWxGaWx0ZXJVdGlscy51cGRhdGVDaGFydFNjYWxlRmFjdG9yVGl0bGUob0ludGVyYWN0aXZlQ2hhcnQsIG9WaWV3LCBzSWQsIHNJbnRlcm5hbENvbnRleHRQYXRoKTtcblx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpKSB7XG5cdFx0XHRjb25zdCBzMThuTWVzc2FnZVRpdGxlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIik7XG5cdFx0XHRjb25zdCBzMThuTWVzc2FnZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9EQVRBX1RFWFRcIik7XG5cdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5hcHBseUVycm9yTWVzc2FnZUFuZFRpdGxlKHMxOG5NZXNzYWdlVGl0bGUsIHMxOG5NZXNzYWdlLCBzSW50ZXJuYWxDb250ZXh0UGF0aCwgb1ZpZXcpO1xuXHRcdH0gZWxzZSBpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImRhdGFcIikpIHtcblx0XHRcdGNvbnN0IG9EYXRhID0gb0V2ZW50LmdldFNvdXJjZSgpLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdFx0aWYgKG9EYXRhICYmIG9EYXRhLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5zZXROb0RhdGFNZXNzYWdlKHNJbnRlcm5hbENvbnRleHRQYXRoLCBvUmVzb3VyY2VCdW5kbGUsIG9WaWV3KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge30pO1xuXHRcdFx0fVxuXHRcdFx0VmlzdWFsRmlsdGVyVXRpbHMuc2V0TXVsdGlVT01NZXNzYWdlKG9EYXRhLCBvSW50ZXJhY3RpdmVDaGFydCwgc0ludGVybmFsQ29udGV4dFBhdGgsIG9SZXNvdXJjZUJ1bmRsZSwgb1ZpZXcpO1xuXHRcdH1cblx0XHRpZiAodlVPTSAmJiAoKHZVT01bXCJJU09DdXJyZW5jeVwiXSAmJiB2VU9NW1wiSVNPQ3VycmVuY3lcIl0uJFBhdGgpIHx8ICh2VU9NW1wiVW5pdFwiXSAmJiB2VU9NW1wiVW5pdFwiXS4kUGF0aCkpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dHMgPSBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0Q29udGV4dHMoKTtcblx0XHRcdGNvbnN0IG9Db250ZXh0RGF0YSA9IG9Db250ZXh0cyAmJiBvQ29udGV4dHNbMF0uZ2V0T2JqZWN0KCk7XG5cdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5hcHBseVVPTVRvVGl0bGUob0ludGVyYWN0aXZlQ2hhcnQsIG9Db250ZXh0RGF0YSwgb1ZpZXcsIHNJbnRlcm5hbENvbnRleHRQYXRoKTtcblx0XHR9XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IFZpc3VhbEZpbHRlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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