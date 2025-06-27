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
   * Building block for creating a FilterBar based on the metadata provided by OData V4.
   * <br>
   * Usually, a SelectionFields annotation is expected.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterBar id="MyFilterBar" metaPath="@com.sap.vocabularies.UI.v1.SelectionFields" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.FilterBar
   * @public
   */
  var FilterBarAPI = (_dec = defineUI5Class("sap.fe.macros.filterBar.FilterBarAPI"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string",
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.SelectionFields"],
    expectedTypes: ["EntitySet", "EntityType"]
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "boolean",
    defaultValue: true
  }), _dec6 = event(), _dec7 = event(), _dec8 = event(), _dec9 = event(), _dec10 = event(), _dec11 = xmlEventHandler(), _dec12 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(FilterBarAPI, _MacroAPI);
    function FilterBarAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call.apply(_MacroAPI, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalSearch", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterChanged", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalFilterChanged", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor9, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FilterBarAPI.prototype;
    _proto.handleSearch = function handleSearch(oEvent) {
      var oFilterBar = oEvent.getSource();
      var oEventParameters = oEvent.getParameters();
      if (oFilterBar) {
        var oConditions = oFilterBar.getFilterConditions();
        var eventParameters = this._prepareEventParameters(oFilterBar);
        this.fireInternalSearch(merge({
          conditions: oConditions
        }, oEventParameters));
        this.fireSearch(eventParameters);
      }
    };
    _proto.handleFilterChanged = function handleFilterChanged(oEvent) {
      var oFilterBar = oEvent.getSource();
      var oEventParameters = oEvent.getParameters();
      if (oFilterBar) {
        var oConditions = oFilterBar.getFilterConditions();
        var eventParameters = this._prepareEventParameters(oFilterBar);
        this.fireInternalFilterChanged(merge({
          conditions: oConditions
        }, oEventParameters));
        this.fireFilterChanged(eventParameters);
      }
    };
    _proto._prepareEventParameters = function _prepareEventParameters(oFilterBar) {
      var _FilterUtils$getFilte = FilterUtils.getFilters(oFilterBar),
        filters = _FilterUtils$getFilte.filters,
        search = _FilterUtils$getFilte.search;
      return {
        filters: filters,
        search: search
      };
    }

    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param sConditionPath The path to the property as a condition path
     * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @param vValues The values to be applied
     * @alias sap.fe.templates.ListReport.ExtensionAPI#setFilterValues
     * @returns A promise for asynchronous handling
     * @public
     */;
    _proto.setFilterValues = function setFilterValues(sConditionPath, sOperator, vValues) {
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(this.content, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(this.content, sConditionPath, sOperator, vValues);
    }

    /**
     * Get the Active Filters Text Summary for the filter bar.
     *
     * @returns Active filters summary as text
     * @public
     */;
    _proto.getActiveFiltersText = function getActiveFiltersText() {
      var _oFilterBar$getAssign;
      var oFilterBar = this.content;
      return (oFilterBar === null || oFilterBar === void 0 ? void 0 : (_oFilterBar$getAssign = oFilterBar.getAssignedFiltersText()) === null || _oFilterBar$getAssign === void 0 ? void 0 : _oFilterBar$getAssign.filtersText) || "";
    }

    /**
     * Provides all the filters that are currently active
     * along with the search expression.
     *
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      return FilterUtils.getFilters(this.content);
    };
    return FilterBarAPI;
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
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "internalSearch", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "internalFilterChanged", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleSearch", [_dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "handleSearch"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFilterChanged", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFilterChanged"), _class2.prototype)), _class2)) || _class);
  return FilterBarAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJCYXJBUEkiLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsImV4cGVjdGVkQW5ub3RhdGlvbnMiLCJleHBlY3RlZFR5cGVzIiwiZGVmYXVsdFZhbHVlIiwiZXZlbnQiLCJ4bWxFdmVudEhhbmRsZXIiLCJoYW5kbGVTZWFyY2giLCJvRXZlbnQiLCJvRmlsdGVyQmFyIiwiZ2V0U291cmNlIiwib0V2ZW50UGFyYW1ldGVycyIsImdldFBhcmFtZXRlcnMiLCJvQ29uZGl0aW9ucyIsImdldEZpbHRlckNvbmRpdGlvbnMiLCJldmVudFBhcmFtZXRlcnMiLCJfcHJlcGFyZUV2ZW50UGFyYW1ldGVycyIsImZpcmVJbnRlcm5hbFNlYXJjaCIsIm1lcmdlIiwiY29uZGl0aW9ucyIsImZpcmVTZWFyY2giLCJoYW5kbGVGaWx0ZXJDaGFuZ2VkIiwiZmlyZUludGVybmFsRmlsdGVyQ2hhbmdlZCIsImZpcmVGaWx0ZXJDaGFuZ2VkIiwiRmlsdGVyVXRpbHMiLCJnZXRGaWx0ZXJzIiwiZmlsdGVycyIsInNlYXJjaCIsInNldEZpbHRlclZhbHVlcyIsInNDb25kaXRpb25QYXRoIiwic09wZXJhdG9yIiwidlZhbHVlcyIsImFyZ3VtZW50cyIsImxlbmd0aCIsImNvbnRlbnQiLCJnZXRBY3RpdmVGaWx0ZXJzVGV4dCIsImdldEFzc2lnbmVkRmlsdGVyc1RleHQiLCJmaWx0ZXJzVGV4dCIsIk1hY3JvQVBJIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWx0ZXJCYXJBUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1lcmdlIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIHByb3BlcnR5LCB4bWxFdmVudEhhbmRsZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCB0eXBlIFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuXG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gZmlsdGVyIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSBGaWx0ZXJCYXIuXG4gKlxuICogVGhlIHRlbXBsYXRlIGZvciB0aGUgRmlsdGVyRmllbGQgaGFzIHRvIGJlIHByb3ZpZGVkIGFzIHRoZSBkZWZhdWx0IGFnZ3JlZ2F0aW9uXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmlsdGVyRmllbGRcbiAqIEBwdWJsaWNcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IHR5cGUgRmlsdGVyRmllbGQgPSB7XG5cdC8qKlxuXHQgKiBUaGUgcHJvcGVydHkgbmFtZSBvZiB0aGUgRmlsdGVyRmllbGRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0a2V5OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGZvciB0aGlzIEZpbHRlckZpZWxkXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGxhYmVsOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgdG8gdGhlIGtleSBvZiBhbm90aGVyIGZpbHRlciBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdGFibGUgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xuXHQvKipcblx0ICogRGVmaW5lcyB3aGVyZSB0aGlzIGZpbHRlciBzaG91bGQgYmUgcGxhY2VkIHJlbGF0aXZlIHRvIHRoZSBkZWZpbmVkIGFuY2hvclxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEJlZm9yZWAgYW5kIGBBZnRlcmBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cGxhY2VtZW50Pzogc3RyaW5nO1xuXHQvKipcblx0ICogSWYgc2V0LCBwb3NzaWJsZSBlcnJvcnMgdGhhdCBvY2N1ciBkdXJpbmcgdGhlIHNlYXJjaCB3aWxsIGJlIGRpc3BsYXllZCBpbiBhIG1lc3NhZ2UgYm94LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzaG93TWVzc2FnZXM/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGaWx0ZXJCYXIgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogVXN1YWxseSwgYSBTZWxlY3Rpb25GaWVsZHMgYW5ub3RhdGlvbiBpcyBleHBlY3RlZC5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86RmlsdGVyQmFyIGlkPVwiTXlGaWx0ZXJCYXJcIiBtZXRhUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmlsdGVyQmFyXG4gKiBAcHVibGljXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MuZmlsdGVyQmFyLkZpbHRlckJhckFQSVwiKVxuY2xhc3MgRmlsdGVyQmFyQVBJIGV4dGVuZHMgTWFjcm9BUEkge1xuXHQvKipcblx0ICogVGhlIGlkZW50aWZpZXIgb2YgdGhlIEZpbHRlckJhciBjb250cm9sLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbWV0YW1vZGVsLCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0UGF0aC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvbnM6IFtcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiXSxcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCJdXG5cdH0pXG5cdG1ldGFQYXRoITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJZiB0cnVlLCB0aGUgc2VhcmNoIGlzIHRyaWdnZXJlZCBhdXRvbWF0aWNhbGx5IHdoZW4gYSBmaWx0ZXIgdmFsdWUgaXMgY2hhbmdlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0bGl2ZU1vZGU/OiBib29sZWFuO1xuXHQvKipcblx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9ja1xuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdHZpc2libGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGlzIGZpcmVkIHdoZW4gdGhlICdHbycgYnV0dG9uIGlzIHByZXNzZWQgb3IgYWZ0ZXIgYSBjb25kaXRpb24gY2hhbmdlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRzZWFyY2ghOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogVGhpcyBldmVudCBpcyBmaXJlZCB3aGVuIHRoZSAnR28nIGJ1dHRvbiBpcyBwcmVzc2VkIG9yIGFmdGVyIGEgY29uZGl0aW9uIGNoYW5nZS4gVGhpcyBpcyBvbmx5IGludGVybmFsbHkgdXNlZCBieSBzYXAuZmUgKEZpb3JpIGVsZW1lbnRzKSBhbmRcblx0ICogZXhwb3NlcyBwYXJhbWV0ZXJzIGZyb20gaW50ZXJuYWwgTURDLUZpbHRlckJhciBzZWFyY2ggZXZlbnRcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBldmVudCgpXG5cdGludGVybmFsU2VhcmNoITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIFRoaXMgZXZlbnQgaXMgZmlyZWQgYWZ0ZXIgZWl0aGVyIGEgZmlsdGVyIHZhbHVlIG9yIHRoZSB2aXNpYmlsaXR5IG9mIGEgZmlsdGVyIGl0ZW0gaGFzIGJlZW4gY2hhbmdlZC4gVGhlIGV2ZW50IGNvbnRhaW5zIGNvbmRpdGlvbnMgdGhhdCB3aWxsIGJlIHVzZWQgYXMgZmlsdGVycy5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0ZmlsdGVyQ2hhbmdlZCE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGlzIGZpcmVkIGFmdGVyIGVpdGhlciBhIGZpbHRlciB2YWx1ZSBvciB0aGUgdmlzaWJpbGl0eSBvZiBhIGZpbHRlciBpdGVtIGhhcyBiZWVuIGNoYW5nZWQuIFRoZSBldmVudCBjb250YWlucyBjb25kaXRpb25zIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGZpbHRlcnMuXG5cdCAqIFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IG9ubHkgYnkgc2FwLmZlIChGaW9yaSBFbGVtZW50cykuIFRoaXMgZXhwb3NlcyBwYXJhbWV0ZXJzIGZyb20gdGhlIE1EQy1GaWx0ZXJCYXIgZmlsdGVyQ2hhbmdlZCBldmVudCB0aGF0IGlzIHVzZWQgYnkgc2FwLmZlIGluIHNvbWUgY2FzZXMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRpbnRlcm5hbEZpbHRlckNoYW5nZWQhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdGhhdCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgRmlsdGVyQmFyIFN0YXRlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIFlvdSBjYW4gc2V0IHRoaXMgdG8gc3RvcmUgdGhlIHN0YXRlIG9mIHRoZSBmaWx0ZXIgYmFyIGluIHRoZSBhcHAgc3RhdGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRzdGF0ZUNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRoYW5kbGVTZWFyY2gob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsdGVyQmFyO1xuXHRcdGNvbnN0IG9FdmVudFBhcmFtZXRlcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVycygpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRjb25zdCBvQ29uZGl0aW9ucyA9IG9GaWx0ZXJCYXIuZ2V0RmlsdGVyQ29uZGl0aW9ucygpO1xuXHRcdFx0Y29uc3QgZXZlbnRQYXJhbWV0ZXJzOiBvYmplY3QgPSB0aGlzLl9wcmVwYXJlRXZlbnRQYXJhbWV0ZXJzKG9GaWx0ZXJCYXIpO1xuXHRcdFx0KHRoaXMgYXMgYW55KS5maXJlSW50ZXJuYWxTZWFyY2gobWVyZ2UoeyBjb25kaXRpb25zOiBvQ29uZGl0aW9ucyB9LCBvRXZlbnRQYXJhbWV0ZXJzKSk7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVTZWFyY2goZXZlbnRQYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0aGFuZGxlRmlsdGVyQ2hhbmdlZChvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBGaWx0ZXJCYXI7XG5cdFx0Y29uc3Qgb0V2ZW50UGFyYW1ldGVycyA9IG9FdmVudC5nZXRQYXJhbWV0ZXJzKCk7XG5cdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdGNvbnN0IG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRGaWx0ZXJDb25kaXRpb25zKCk7XG5cdFx0XHRjb25zdCBldmVudFBhcmFtZXRlcnM6IG9iamVjdCA9IHRoaXMuX3ByZXBhcmVFdmVudFBhcmFtZXRlcnMob0ZpbHRlckJhcik7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVJbnRlcm5hbEZpbHRlckNoYW5nZWQobWVyZ2UoeyBjb25kaXRpb25zOiBvQ29uZGl0aW9ucyB9LCBvRXZlbnRQYXJhbWV0ZXJzKSk7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVGaWx0ZXJDaGFuZ2VkKGV2ZW50UGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG5cblx0X3ByZXBhcmVFdmVudFBhcmFtZXRlcnMob0ZpbHRlckJhcjogRmlsdGVyQmFyKSB7XG5cdFx0Y29uc3QgeyBmaWx0ZXJzLCBzZWFyY2ggfSA9IEZpbHRlclV0aWxzLmdldEZpbHRlcnMob0ZpbHRlckJhcik7XG5cblx0XHRyZXR1cm4geyBmaWx0ZXJzLCBzZWFyY2ggfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGZpbHRlciB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eSBpbiB0aGUgZmlsdGVyIGJhci5cblx0ICogVGhlIGZpbHRlciB2YWx1ZXMgY2FuIGJlIGVpdGhlciBhIHNpbmdsZSB2YWx1ZSBvciBhbiBhcnJheSBvZiB2YWx1ZXMuXG5cdCAqIEVhY2ggZmlsdGVyIHZhbHVlIG11c3QgYmUgcmVwcmVzZW50ZWQgYXMgYSBwcmltaXRpdmUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQ29uZGl0aW9uUGF0aCBUaGUgcGF0aCB0byB0aGUgcHJvcGVydHkgYXMgYSBjb25kaXRpb24gcGF0aFxuXHQgKiBAcGFyYW0gW3NPcGVyYXRvcl0gVGhlIG9wZXJhdG9yIHRvIGJlIHVzZWQgKG9wdGlvbmFsKSAtIGlmIG5vdCBzZXQsIHRoZSBkZWZhdWx0IG9wZXJhdG9yIChFUSkgd2lsbCBiZSB1c2VkXG5cdCAqIEBwYXJhbSB2VmFsdWVzIFRoZSB2YWx1ZXMgdG8gYmUgYXBwbGllZFxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSSNzZXRGaWx0ZXJWYWx1ZXNcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGZvciBhc3luY2hyb25vdXMgaGFuZGxpbmdcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2V0RmlsdGVyVmFsdWVzKFxuXHRcdHNDb25kaXRpb25QYXRoOiBzdHJpbmcsXG5cdFx0c09wZXJhdG9yOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0dlZhbHVlcz86IHVuZGVmaW5lZCB8IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBzdHJpbmdbXSB8IG51bWJlcltdIHwgYm9vbGVhbltdXG5cdCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG5cdFx0XHR2VmFsdWVzID0gc09wZXJhdG9yO1xuXHRcdFx0cmV0dXJuIEZpbHRlclV0aWxzLnNldEZpbHRlclZhbHVlcyh0aGlzLmNvbnRlbnQsIHNDb25kaXRpb25QYXRoLCB2VmFsdWVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIEZpbHRlclV0aWxzLnNldEZpbHRlclZhbHVlcyh0aGlzLmNvbnRlbnQsIHNDb25kaXRpb25QYXRoLCBzT3BlcmF0b3IsIHZWYWx1ZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgQWN0aXZlIEZpbHRlcnMgVGV4dCBTdW1tYXJ5IGZvciB0aGUgZmlsdGVyIGJhci5cblx0ICpcblx0ICogQHJldHVybnMgQWN0aXZlIGZpbHRlcnMgc3VtbWFyeSBhcyB0ZXh0XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldEFjdGl2ZUZpbHRlcnNUZXh0KCkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLmNvbnRlbnQgYXMgRmlsdGVyQmFyO1xuXHRcdHJldHVybiBvRmlsdGVyQmFyPy5nZXRBc3NpZ25lZEZpbHRlcnNUZXh0KCk/LmZpbHRlcnNUZXh0IHx8IFwiXCI7XG5cdH1cblxuXHQvKipcblx0ICogUHJvdmlkZXMgYWxsIHRoZSBmaWx0ZXJzIHRoYXQgYXJlIGN1cnJlbnRseSBhY3RpdmVcblx0ICogYWxvbmcgd2l0aCB0aGUgc2VhcmNoIGV4cHJlc3Npb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt7ZmlsdGVyczogc2FwLnVpLm1vZGVsLkZpbHRlcltdfHVuZGVmaW5lZCwgc2VhcmNoOiBzdHJpbmd8dW5kZWZpbmVkfX0gQW4gYXJyYXkgb2YgYWN0aXZlIGZpbHRlcnMgYW5kIHRoZSBzZWFyY2ggZXhwcmVzc2lvbi5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0RmlsdGVycygpIHtcblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0RmlsdGVycyh0aGlzLmNvbnRlbnQgYXMgRmlsdGVyQmFyKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXJCYXJBUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztFQW1EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkEsSUFlTUEsWUFBWSxXQURqQkMsY0FBYyxDQUFDLHNDQUFzQyxDQUFDLFVBT3JEQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBUTVCRCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsbUJBQW1CLEVBQUUsQ0FBQyw0Q0FBNEMsQ0FBQztJQUNuRUMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVk7RUFDMUMsQ0FBQyxDQUFDLFVBUURILFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFPbERKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFRakRDLEtBQUssRUFBRSxVQVNQQSxLQUFLLEVBQUUsVUFR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