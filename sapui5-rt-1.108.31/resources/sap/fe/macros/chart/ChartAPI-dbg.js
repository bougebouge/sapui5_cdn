/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/filter/FilterUtils", "../MacroAPI"], function (merge, ClassSupport, FilterUtils, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create a chart based on the metadata provided by OData V4.
   * <br>
   * Usually, a contextPath and metaPath is expected.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Chart id="Mychart" contextPath="/RootEntity" metaPath="@com.sap.vocabularies.UI.v1.Chart" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Chart
   * @public
   */
  var ChartAPI = (_dec = defineUI5Class("sap.fe.macros.chart.ChartAPI"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string",
    required: true,
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"]
  }), _dec4 = property({
    type: "string",
    required: true,
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: []
  }), _dec5 = property({
    type: "string",
    defaultValue: "MULTIPLE"
  }), _dec6 = property({
    type: "string"
  }), _dec7 = property({
    type: "boolean|string"
  }), _dec8 = event(), _dec9 = event(), _dec10 = event(), _dec11 = xmlEventHandler(), _dec12 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(ChartAPI, _MacroAPI);
    function ChartAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call.apply(_MacroAPI, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalDataRequested", _descriptor9, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ChartAPI.prototype;
    _proto.onAfterRendering = function onAfterRendering() {
      var view = this.getController().getView();
      var internalModelContext = view.getBindingContext("internal");
      var chart = this.getContent();
      var showMessageStrip = {};
      var sChartEntityPath = chart.data("entitySet"),
        sCacheKey = "".concat(sChartEntityPath, "Chart"),
        oBindingContext = view.getBindingContext();
      showMessageStrip[sCacheKey] = chart.data("draftSupported") === "true" && !!oBindingContext && !oBindingContext.getObject("IsActiveEntity");
      internalModelContext.setProperty("controls/showMessageStrip", showMessageStrip);
    };
    _proto.refreshNotApplicableFields = function refreshNotApplicableFields(oFilterControl) {
      var oChart = this.getContent();
      return FilterUtils.getNotApplicableFilters(oFilterControl, oChart);
    };
    _proto.handleSelectionChange = function handleSelectionChange(oEvent) {
      var aData = oEvent.getParameter("data");
      var bSelected = oEvent.getParameter("name") === "selectData";
      this.fireSelectionChange(merge({}, {
        data: aData,
        selected: bSelected
      }));
    };
    _proto.onInternalDataRequested = function onInternalDataRequested() {
      this.fireEvent("internalDataRequested");
    };
    return ChartAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "internalDataRequested", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleSelectionChange", [_dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "handleSelectionChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataRequested", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataRequested"), _class2.prototype)), _class2)) || _class);
  return ChartAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFydEFQSSIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwiZXhwZWN0ZWRBbm5vdGF0aW9ucyIsImRlZmF1bHRWYWx1ZSIsImV2ZW50IiwieG1sRXZlbnRIYW5kbGVyIiwib25BZnRlclJlbmRlcmluZyIsInZpZXciLCJnZXRDb250cm9sbGVyIiwiZ2V0VmlldyIsImludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJjaGFydCIsImdldENvbnRlbnQiLCJzaG93TWVzc2FnZVN0cmlwIiwic0NoYXJ0RW50aXR5UGF0aCIsImRhdGEiLCJzQ2FjaGVLZXkiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRPYmplY3QiLCJzZXRQcm9wZXJ0eSIsInJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzIiwib0ZpbHRlckNvbnRyb2wiLCJvQ2hhcnQiLCJGaWx0ZXJVdGlscyIsImdldE5vdEFwcGxpY2FibGVGaWx0ZXJzIiwiaGFuZGxlU2VsZWN0aW9uQ2hhbmdlIiwib0V2ZW50IiwiYURhdGEiLCJnZXRQYXJhbWV0ZXIiLCJiU2VsZWN0ZWQiLCJmaXJlU2VsZWN0aW9uQ2hhbmdlIiwibWVyZ2UiLCJzZWxlY3RlZCIsIm9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkIiwiZmlyZUV2ZW50IiwiTWFjcm9BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNoYXJ0QVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBwcm9wZXJ0eSwgeG1sRXZlbnRIYW5kbGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIHVzZWQgdG8gY3JlYXRlIGEgY2hhcnQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogVXN1YWxseSwgYSBjb250ZXh0UGF0aCBhbmQgbWV0YVBhdGggaXMgZXhwZWN0ZWQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkNoYXJ0IGlkPVwiTXljaGFydFwiIGNvbnRleHRQYXRoPVwiL1Jvb3RFbnRpdHlcIiBtZXRhUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5DaGFydFxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLmNoYXJ0LkNoYXJ0QVBJXCIpXG5jbGFzcyBDaGFydEFQSSBleHRlbmRzIE1hY3JvQVBJIHtcblx0LyoqXG5cdCAqXG5cdCAqIElEIG9mIHRoZSBjaGFydFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBwcmVzZW50YXRpb24gKFVJLkNoYXJ0IHcgb3Igdy9vIHF1YWxpZmllcilcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uczogW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIl1cblx0fSlcblx0bWV0YVBhdGghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eVNldCBvciBuYXZpZ2F0aW9uUHJvcGVydHlcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uczogW11cblx0fSlcblx0Y29udGV4dFBhdGghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgc2VsZWN0aW9uIG1vZGVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIk1VTFRJUExFXCIgfSlcblx0c2VsZWN0aW9uTW9kZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogSWQgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9jayBhc3NvY2lhdGVkIHdpdGggdGhlIGNoYXJ0LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhciE6IHN0cmluZztcblxuXHQvKipcblx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIHBlcnNvbmFsaXphdGlvbiBvZiB0aGUgTURDIGNoYXJ0XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhbnxzdHJpbmdcIiB9KVxuXHRwZXJzb25hbGl6YXRpb24hOiBib29sZWFuIHwgc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBjaGFydCBzZWxlY3Rpb25zIGFyZSBjaGFuZ2VkLiBUaGUgZXZlbnQgY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGRhdGEgc2VsZWN0ZWQvZGVzZWxlY3RlZCBhbmQgdGhlIEJvb2xlYW4gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGRhdGEgaXMgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0c2VsZWN0aW9uQ2hhbmdlITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIHRoZSBjaGFydCBzdGF0ZSBjaGFuZ2VzLlxuXHQgKlxuXHQgKiBZb3UgY2FuIHNldCB0aGlzIGluIG9yZGVyIHRvIHN0b3JlIHRoZSBjaGFydCBzdGF0ZSBpbiB0aGUgaUFwcHN0YXRlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QGV2ZW50KClcblx0c3RhdGVDaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gdGhlIGNoYXJ0IHJlcXVlc3RzIGRhdGEuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRpbnRlcm5hbERhdGFSZXF1ZXN0ZWQhOiBGdW5jdGlvbjtcblxuXHRvbkFmdGVyUmVuZGVyaW5nKCkge1xuXHRcdGNvbnN0IHZpZXcgPSB0aGlzLmdldENvbnRyb2xsZXIoKS5nZXRWaWV3KCk7XG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbENvbnRleHQ6IGFueSA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRjb25zdCBjaGFydCA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdGNvbnN0IHNob3dNZXNzYWdlU3RyaXA6IGFueSA9IHt9O1xuXHRcdGNvbnN0IHNDaGFydEVudGl0eVBhdGggPSBjaGFydC5kYXRhKFwiZW50aXR5U2V0XCIpLFxuXHRcdFx0c0NhY2hlS2V5ID0gYCR7c0NoYXJ0RW50aXR5UGF0aH1DaGFydGAsXG5cdFx0XHRvQmluZGluZ0NvbnRleHQgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0c2hvd01lc3NhZ2VTdHJpcFtzQ2FjaGVLZXldID1cblx0XHRcdGNoYXJ0LmRhdGEoXCJkcmFmdFN1cHBvcnRlZFwiKSA9PT0gXCJ0cnVlXCIgJiYgISFvQmluZGluZ0NvbnRleHQgJiYgIW9CaW5kaW5nQ29udGV4dC5nZXRPYmplY3QoXCJJc0FjdGl2ZUVudGl0eVwiKTtcblx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNvbnRyb2xzL3Nob3dNZXNzYWdlU3RyaXBcIiwgc2hvd01lc3NhZ2VTdHJpcCk7XG5cdH1cblxuXHRyZWZyZXNoTm90QXBwbGljYWJsZUZpZWxkcyhvRmlsdGVyQ29udHJvbDogQ29udHJvbCk6IGFueVtdIHtcblx0XHRjb25zdCBvQ2hhcnQgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMob0ZpbHRlckNvbnRyb2wsIG9DaGFydCk7XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0aGFuZGxlU2VsZWN0aW9uQ2hhbmdlKG9FdmVudDogVUk1RXZlbnQpIHtcblx0XHRjb25zdCBhRGF0YSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJkYXRhXCIpO1xuXHRcdGNvbnN0IGJTZWxlY3RlZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJuYW1lXCIpID09PSBcInNlbGVjdERhdGFcIjtcblx0XHQodGhpcyBhcyBhbnkpLmZpcmVTZWxlY3Rpb25DaGFuZ2UobWVyZ2Uoe30sIHsgZGF0YTogYURhdGEsIHNlbGVjdGVkOiBiU2VsZWN0ZWQgfSkpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkKCkge1xuXHRcdCh0aGlzIGFzIGFueSkuZmlyZUV2ZW50KFwiaW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENoYXJ0QVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7RUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkEsSUFlTUEsUUFBUSxXQURiQyxjQUFjLENBQUMsOEJBQThCLENBQUMsVUFRN0NDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFRNUJELFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxRQUFRLEVBQUUsSUFBSTtJQUNkQyxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQztJQUM3RUMsbUJBQW1CLEVBQUUsQ0FBQyxrQ0FBa0M7RUFDekQsQ0FBQyxDQUFDLFVBUURKLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxRQUFRLEVBQUUsSUFBSTtJQUNkQyxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQztJQUM3RUMsbUJBQW1CLEVBQUU7RUFDdEIsQ0FBQyxDQUFDLFVBUURKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFSSxZQUFZLEVBQUU7RUFBVyxDQUFDLENBQUMsVUFRdERMLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFRNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBaUIsQ0FBQyxDQUFDLFVBUXBDSyxLQUFLLEVBQUUsVUFVUEEsS0FBSyxFQUFFLFdB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