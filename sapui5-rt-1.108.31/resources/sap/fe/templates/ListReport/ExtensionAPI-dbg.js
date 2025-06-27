/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/LRMessageStrip", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/filter/FilterUtils"], function (ExtensionAPI, ClassSupport, $LRMessageStrip, ChartUtils, FilterUtils) {
  "use strict";

  var _dec, _class;
  var LRMessageStrip = $LRMessageStrip.LRMessageStrip;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for list reports in SAP Fiori elements for OData V4.
   *
   * @alias sap.fe.templates.ListReport.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  var ListReportExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ListReport.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ListReportExtensionAPI, _ExtensionAPI);
    function ListReportExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ListReportExtensionAPI.prototype;
    /**
     * Refreshes the List Report.
     * This method currently only supports triggering the search (by clicking on the GO button)
     * in the List Report Filter Bar. It can be used to request the initial load or to refresh the
     * currently shown data based on the filters entered by the user.
     * Please note: The Promise is resolved once the search is triggered and not once the data is returned.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#refresh
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh() {
      var oFilterBar = this._controller._getFilterBarControl();
      if (oFilterBar) {
        return oFilterBar.waitForInitialization().then(function () {
          oFilterBar.triggerSearch();
        });
      } else {
        // TODO: if there is no filter bar, make refresh work
        return Promise.resolve();
      }
    }

    /**
     * Gets the list entries currently selected for the displayed control.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getSelectedContexts
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts() {
      var _this$_controller$_ge, _this$_controller$_ge2;
      var oControl = this._controller._isMultiMode() && ((_this$_controller$_ge = this._controller._getMultiModeControl()) === null || _this$_controller$_ge === void 0 ? void 0 : (_this$_controller$_ge2 = _this$_controller$_ge.getSelectedInnerControl()) === null || _this$_controller$_ge2 === void 0 ? void 0 : _this$_controller$_ge2.content) || this._controller._getTable();
      if (oControl.isA("sap.ui.mdc.Chart")) {
        var aSelectedContexts = [];
        if (oControl && oControl.get_chart()) {
          var aSelectedDataPoints = ChartUtils.getChartSelectedData(oControl.get_chart());
          for (var i = 0; i < aSelectedDataPoints.length; i++) {
            aSelectedContexts.push(aSelectedDataPoints[i].context);
          }
        }
        return aSelectedContexts;
      } else {
        return oControl && oControl.getSelectedContexts() || [];
      }
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
      // The List Report has two filter bars: The filter bar in the header and the filter bar in the "Adapt Filter" dialog;
      // when the dialog is opened, the user is working with that active control: Pass it to the setFilterValues method!
      var filterBar = this._controller._getAdaptationFilterBarControl() || this._controller._getFilterBarControl();
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(filterBar, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(filterBar, sConditionPath, sOperator, vValues);
    }

    /**
     * This method converts filter conditions to filters.
     *
     * @param mFilterConditions Map containing the filter conditions of the FilterBar.
     * @alias sap.fe.templates.ListReport.ExtensionAPI#createFiltersFromFilterConditions
     * @returns Object containing the converted FilterBar filters.
     * @public
     */;
    _proto.createFiltersFromFilterConditions = function createFiltersFromFilterConditions(mFilterConditions) {
      var oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilterInfo(oFilterBar, undefined, mFilterConditions);
    }
    /**
     * Provides all the model filters from the filter bar that are currently active
     * along with the search expression.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getFilters
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      var oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilters(oFilterBar);
    }

    /**
     * Provide an option for showing a custom message in the message strip above the list report table.
     *
     * @param {object} [message] Custom message along with the message type to be set on the table.
     * @param {string} message.message Message string to be displayed.
     * @param {sap.ui.core.MessageType} message.type Indicates the type of message.
     * @param {string[]|string} [tabKey] The tabKey identifying the table where the custom message is displayed. If tabKey is empty, the message is displayed in all tabs . If tabKey = ['1','2'], the message is displayed in tabs 1 and 2 only
     * @param {Function} [onClose] A function that is called when the user closes the message bar.
     * @public
     */;
    _proto.setCustomMessage = function setCustomMessage(message, tabKey, onClose) {
      if (!this.ListReportMessageStrip) {
        this.ListReportMessageStrip = new LRMessageStrip();
      }
      this.ListReportMessageStrip.showCustomMessage(message, this._controller, tabKey, onClose);
    };
    return ListReportExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ListReportExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaXN0UmVwb3J0RXh0ZW5zaW9uQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJyZWZyZXNoIiwib0ZpbHRlckJhciIsIl9jb250cm9sbGVyIiwiX2dldEZpbHRlckJhckNvbnRyb2wiLCJ3YWl0Rm9ySW5pdGlhbGl6YXRpb24iLCJ0aGVuIiwidHJpZ2dlclNlYXJjaCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsIm9Db250cm9sIiwiX2lzTXVsdGlNb2RlIiwiX2dldE11bHRpTW9kZUNvbnRyb2wiLCJnZXRTZWxlY3RlZElubmVyQ29udHJvbCIsImNvbnRlbnQiLCJfZ2V0VGFibGUiLCJpc0EiLCJhU2VsZWN0ZWRDb250ZXh0cyIsImdldF9jaGFydCIsImFTZWxlY3RlZERhdGFQb2ludHMiLCJDaGFydFV0aWxzIiwiZ2V0Q2hhcnRTZWxlY3RlZERhdGEiLCJpIiwibGVuZ3RoIiwicHVzaCIsImNvbnRleHQiLCJzZXRGaWx0ZXJWYWx1ZXMiLCJzQ29uZGl0aW9uUGF0aCIsInNPcGVyYXRvciIsInZWYWx1ZXMiLCJmaWx0ZXJCYXIiLCJfZ2V0QWRhcHRhdGlvbkZpbHRlckJhckNvbnRyb2wiLCJhcmd1bWVudHMiLCJGaWx0ZXJVdGlscyIsImNyZWF0ZUZpbHRlcnNGcm9tRmlsdGVyQ29uZGl0aW9ucyIsIm1GaWx0ZXJDb25kaXRpb25zIiwiZ2V0RmlsdGVySW5mbyIsInVuZGVmaW5lZCIsImdldEZpbHRlcnMiLCJzZXRDdXN0b21NZXNzYWdlIiwibWVzc2FnZSIsInRhYktleSIsIm9uQ2xvc2UiLCJMaXN0UmVwb3J0TWVzc2FnZVN0cmlwIiwiTFJNZXNzYWdlU3RyaXAiLCJzaG93Q3VzdG9tTWVzc2FnZSIsIkV4dGVuc2lvbkFQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRXh0ZW5zaW9uQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHRlbnNpb25BUEkgZnJvbSBcInNhcC9mZS9jb3JlL0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IExSQ3VzdG9tTWVzc2FnZSwgTFJNZXNzYWdlU3RyaXAgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9MUk1lc3NhZ2VTdHJpcFwiO1xuaW1wb3J0IENoYXJ0VXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvY2hhcnQvQ2hhcnRVdGlsc1wiO1xuaW1wb3J0IEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgTGlzdFJlcG9ydENvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvTGlzdFJlcG9ydC9MaXN0UmVwb3J0Q29udHJvbGxlci5jb250cm9sbGVyXCI7XG5cbi8qKlxuICogRXh0ZW5zaW9uIEFQSSBmb3IgbGlzdCByZXBvcnRzIGluIFNBUCBGaW9yaSBlbGVtZW50cyBmb3IgT0RhdGEgVjQuXG4gKlxuICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUElcbiAqIEBwdWJsaWNcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBmaW5hbFxuICogQHNpbmNlIDEuNzkuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJXCIpXG5jbGFzcyBMaXN0UmVwb3J0RXh0ZW5zaW9uQVBJIGV4dGVuZHMgRXh0ZW5zaW9uQVBJIHtcblx0cHJvdGVjdGVkIF9jb250cm9sbGVyITogTGlzdFJlcG9ydENvbnRyb2xsZXI7XG5cdExpc3RSZXBvcnRNZXNzYWdlU3RyaXAhOiBMUk1lc3NhZ2VTdHJpcDtcblx0LyoqXG5cdCAqIFJlZnJlc2hlcyB0aGUgTGlzdCBSZXBvcnQuXG5cdCAqIFRoaXMgbWV0aG9kIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIHRyaWdnZXJpbmcgdGhlIHNlYXJjaCAoYnkgY2xpY2tpbmcgb24gdGhlIEdPIGJ1dHRvbilcblx0ICogaW4gdGhlIExpc3QgUmVwb3J0IEZpbHRlciBCYXIuIEl0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgdGhlIGluaXRpYWwgbG9hZCBvciB0byByZWZyZXNoIHRoZVxuXHQgKiBjdXJyZW50bHkgc2hvd24gZGF0YSBiYXNlZCBvbiB0aGUgZmlsdGVycyBlbnRlcmVkIGJ5IHRoZSB1c2VyLlxuXHQgKiBQbGVhc2Ugbm90ZTogVGhlIFByb21pc2UgaXMgcmVzb2x2ZWQgb25jZSB0aGUgc2VhcmNoIGlzIHRyaWdnZXJlZCBhbmQgbm90IG9uY2UgdGhlIGRhdGEgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJI3JlZnJlc2hcblx0ICogQHJldHVybnMgUmVzb2x2ZWQgb25jZSB0aGUgZGF0YSBpcyByZWZyZXNoZWQgb3IgcmVqZWN0ZWQgaWYgdGhlIHJlcXVlc3QgZmFpbGVkXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlZnJlc2goKSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKSBhcyBhbnk7XG5cdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdHJldHVybiBvRmlsdGVyQmFyLndhaXRGb3JJbml0aWFsaXphdGlvbigpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRvRmlsdGVyQmFyLnRyaWdnZXJTZWFyY2goKTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBUT0RPOiBpZiB0aGVyZSBpcyBubyBmaWx0ZXIgYmFyLCBtYWtlIHJlZnJlc2ggd29ya1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBsaXN0IGVudHJpZXMgY3VycmVudGx5IHNlbGVjdGVkIGZvciB0aGUgZGlzcGxheWVkIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJI2dldFNlbGVjdGVkQ29udGV4dHNcblx0ICogQHJldHVybnMgQXJyYXkgY29udGFpbmluZyB0aGUgc2VsZWN0ZWQgY29udGV4dHNcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0U2VsZWN0ZWRDb250ZXh0cygpIHtcblx0XHRjb25zdCBvQ29udHJvbCA9ICgodGhpcy5fY29udHJvbGxlci5faXNNdWx0aU1vZGUoKSAmJlxuXHRcdFx0dGhpcy5fY29udHJvbGxlci5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpPy5nZXRTZWxlY3RlZElubmVyQ29udHJvbCgpPy5jb250ZW50KSB8fFxuXHRcdFx0dGhpcy5fY29udHJvbGxlci5fZ2V0VGFibGUoKSkgYXMgYW55O1xuXHRcdGlmIChvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRjb25zdCBhU2VsZWN0ZWRDb250ZXh0cyA9IFtdO1xuXHRcdFx0aWYgKG9Db250cm9sICYmIG9Db250cm9sLmdldF9jaGFydCgpKSB7XG5cdFx0XHRcdGNvbnN0IGFTZWxlY3RlZERhdGFQb2ludHMgPSBDaGFydFV0aWxzLmdldENoYXJ0U2VsZWN0ZWREYXRhKG9Db250cm9sLmdldF9jaGFydCgpKTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhU2VsZWN0ZWREYXRhUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMucHVzaChhU2VsZWN0ZWREYXRhUG9pbnRzW2ldLmNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYVNlbGVjdGVkQ29udGV4dHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAob0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0U2VsZWN0ZWRDb250ZXh0cygpKSB8fCBbXTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBmaWx0ZXIgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHkgaW4gdGhlIGZpbHRlciBiYXIuXG5cdCAqIFRoZSBmaWx0ZXIgdmFsdWVzIGNhbiBiZSBlaXRoZXIgYSBzaW5nbGUgdmFsdWUgb3IgYW4gYXJyYXkgb2YgdmFsdWVzLlxuXHQgKiBFYWNoIGZpbHRlciB2YWx1ZSBtdXN0IGJlIHJlcHJlc2VudGVkIGFzIGEgcHJpbWl0aXZlIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NvbmRpdGlvblBhdGggVGhlIHBhdGggdG8gdGhlIHByb3BlcnR5IGFzIGEgY29uZGl0aW9uIHBhdGhcblx0ICogQHBhcmFtIFtzT3BlcmF0b3JdIFRoZSBvcGVyYXRvciB0byBiZSB1c2VkIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCB0aGUgZGVmYXVsdCBvcGVyYXRvciAoRVEpIHdpbGwgYmUgdXNlZFxuXHQgKiBAcGFyYW0gdlZhbHVlcyBUaGUgdmFsdWVzIHRvIGJlIGFwcGxpZWRcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUEkjc2V0RmlsdGVyVmFsdWVzXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgYXN5bmNocm9ub3VzIGhhbmRsaW5nXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNldEZpbHRlclZhbHVlcyhcblx0XHRzQ29uZGl0aW9uUGF0aDogc3RyaW5nLFxuXHRcdHNPcGVyYXRvcjogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRcdHZWYWx1ZXM/OiB1bmRlZmluZWQgfCBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgc3RyaW5nW10gfCBudW1iZXJbXSB8IGJvb2xlYW5bXVxuXHQpIHtcblx0XHQvLyBUaGUgTGlzdCBSZXBvcnQgaGFzIHR3byBmaWx0ZXIgYmFyczogVGhlIGZpbHRlciBiYXIgaW4gdGhlIGhlYWRlciBhbmQgdGhlIGZpbHRlciBiYXIgaW4gdGhlIFwiQWRhcHQgRmlsdGVyXCIgZGlhbG9nO1xuXHRcdC8vIHdoZW4gdGhlIGRpYWxvZyBpcyBvcGVuZWQsIHRoZSB1c2VyIGlzIHdvcmtpbmcgd2l0aCB0aGF0IGFjdGl2ZSBjb250cm9sOiBQYXNzIGl0IHRvIHRoZSBzZXRGaWx0ZXJWYWx1ZXMgbWV0aG9kIVxuXHRcdGNvbnN0IGZpbHRlckJhciA9IHRoaXMuX2NvbnRyb2xsZXIuX2dldEFkYXB0YXRpb25GaWx0ZXJCYXJDb250cm9sKCkgfHwgdGhpcy5fY29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG5cdFx0XHR2VmFsdWVzID0gc09wZXJhdG9yO1xuXHRcdFx0cmV0dXJuIEZpbHRlclV0aWxzLnNldEZpbHRlclZhbHVlcyhmaWx0ZXJCYXIsIHNDb25kaXRpb25QYXRoLCB2VmFsdWVzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuc2V0RmlsdGVyVmFsdWVzKGZpbHRlckJhciwgc0NvbmRpdGlvblBhdGgsIHNPcGVyYXRvciwgdlZhbHVlcyk7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBtZXRob2QgY29udmVydHMgZmlsdGVyIGNvbmRpdGlvbnMgdG8gZmlsdGVycy5cblx0ICpcblx0ICogQHBhcmFtIG1GaWx0ZXJDb25kaXRpb25zIE1hcCBjb250YWluaW5nIHRoZSBmaWx0ZXIgY29uZGl0aW9ucyBvZiB0aGUgRmlsdGVyQmFyLlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSSNjcmVhdGVGaWx0ZXJzRnJvbUZpbHRlckNvbmRpdGlvbnNcblx0ICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNvbnZlcnRlZCBGaWx0ZXJCYXIgZmlsdGVycy5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Y3JlYXRlRmlsdGVyc0Zyb21GaWx0ZXJDb25kaXRpb25zKG1GaWx0ZXJDb25kaXRpb25zOiBhbnkpIHtcblx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fY29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdHJldHVybiBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJJbmZvKG9GaWx0ZXJCYXIsIHVuZGVmaW5lZCwgbUZpbHRlckNvbmRpdGlvbnMpO1xuXHR9XG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhbGwgdGhlIG1vZGVsIGZpbHRlcnMgZnJvbSB0aGUgZmlsdGVyIGJhciB0aGF0IGFyZSBjdXJyZW50bHkgYWN0aXZlXG5cdCAqIGFsb25nIHdpdGggdGhlIHNlYXJjaCBleHByZXNzaW9uLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSSNnZXRGaWx0ZXJzXG5cdCAqIEByZXR1cm5zIHt7ZmlsdGVyczogc2FwLnVpLm1vZGVsLkZpbHRlcltdfHVuZGVmaW5lZCwgc2VhcmNoOiBzdHJpbmd8dW5kZWZpbmVkfX0gQW4gYXJyYXkgb2YgYWN0aXZlIGZpbHRlcnMgYW5kIHRoZSBzZWFyY2ggZXhwcmVzc2lvbi5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0RmlsdGVycygpIHtcblx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fY29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdHJldHVybiBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJzKG9GaWx0ZXJCYXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGUgYW4gb3B0aW9uIGZvciBzaG93aW5nIGEgY3VzdG9tIG1lc3NhZ2UgaW4gdGhlIG1lc3NhZ2Ugc3RyaXAgYWJvdmUgdGhlIGxpc3QgcmVwb3J0IHRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gW21lc3NhZ2VdIEN1c3RvbSBtZXNzYWdlIGFsb25nIHdpdGggdGhlIG1lc3NhZ2UgdHlwZSB0byBiZSBzZXQgb24gdGhlIHRhYmxlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZS5tZXNzYWdlIE1lc3NhZ2Ugc3RyaW5nIHRvIGJlIGRpc3BsYXllZC5cblx0ICogQHBhcmFtIHtzYXAudWkuY29yZS5NZXNzYWdlVHlwZX0gbWVzc2FnZS50eXBlIEluZGljYXRlcyB0aGUgdHlwZSBvZiBtZXNzYWdlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ1tdfHN0cmluZ30gW3RhYktleV0gVGhlIHRhYktleSBpZGVudGlmeWluZyB0aGUgdGFibGUgd2hlcmUgdGhlIGN1c3RvbSBtZXNzYWdlIGlzIGRpc3BsYXllZC4gSWYgdGFiS2V5IGlzIGVtcHR5LCB0aGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWQgaW4gYWxsIHRhYnMgLiBJZiB0YWJLZXkgPSBbJzEnLCcyJ10sIHRoZSBtZXNzYWdlIGlzIGRpc3BsYXllZCBpbiB0YWJzIDEgYW5kIDIgb25seVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb25DbG9zZV0gQSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGNsb3NlcyB0aGUgbWVzc2FnZSBiYXIuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNldEN1c3RvbU1lc3NhZ2UobWVzc2FnZTogTFJDdXN0b21NZXNzYWdlIHwgdW5kZWZpbmVkLCB0YWJLZXk/OiBzdHJpbmdbXSB8IHN0cmluZyB8IG51bGwsIG9uQ2xvc2U/OiBGdW5jdGlvbikge1xuXHRcdGlmICghdGhpcy5MaXN0UmVwb3J0TWVzc2FnZVN0cmlwKSB7XG5cdFx0XHR0aGlzLkxpc3RSZXBvcnRNZXNzYWdlU3RyaXAgPSBuZXcgTFJNZXNzYWdlU3RyaXAoKTtcblx0XHR9XG5cdFx0dGhpcy5MaXN0UmVwb3J0TWVzc2FnZVN0cmlwLnNob3dDdXN0b21NZXNzYWdlKG1lc3NhZ2UsIHRoaXMuX2NvbnRyb2xsZXIsIHRhYktleSwgb25DbG9zZSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGlzdFJlcG9ydEV4dGVuc2lvbkFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7O0VBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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