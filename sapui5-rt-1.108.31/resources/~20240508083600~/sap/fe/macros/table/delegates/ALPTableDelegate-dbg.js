/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/table/delegates/ALPTableDelegateBaseMixin", "sap/fe/macros/table/delegates/TableDelegate"], function (ALPTableDelegateBaseMixin, TableDelegate) {
  "use strict";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69
   * @alias sap.fe.macros.ALPTableDelegate
   */
  var ALPTableDelegate = Object.assign({}, TableDelegate, ALPTableDelegateBaseMixin, {
    _getDelegateParentClass: function () {
      return TableDelegate;
    }
  });
  return ALPTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBTFBUYWJsZURlbGVnYXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiVGFibGVEZWxlZ2F0ZSIsIkFMUFRhYmxlRGVsZWdhdGVCYXNlTWl4aW4iLCJfZ2V0RGVsZWdhdGVQYXJlbnRDbGFzcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQUxQVGFibGVEZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQUxQVGFibGVEZWxlZ2F0ZUJhc2VNaXhpbiBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9kZWxlZ2F0ZXMvQUxQVGFibGVEZWxlZ2F0ZUJhc2VNaXhpblwiO1xuaW1wb3J0IFRhYmxlRGVsZWdhdGUgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvZGVsZWdhdGVzL1RhYmxlRGVsZWdhdGVcIjtcbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBzYXAudWkubWRjLlRhYmxlLlxuICogPGgzPjxiPk5vdGU6PC9iPjwvaDM+XG4gKiBUaGUgY2xhc3MgaXMgZXhwZXJpbWVudGFsIGFuZCB0aGUgQVBJL2JlaGF2aW91ciBpcyBub3QgZmluYWxpc2VkIGFuZCBoZW5jZSB0aGlzIHNob3VsZCBub3QgYmUgdXNlZCBmb3IgcHJvZHVjdGl2ZSB1c2FnZS5cbiAqXG4gKiBAYXV0aG9yIFNBUCBTRVxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqIEBzaW5jZSAxLjY5XG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5BTFBUYWJsZURlbGVnYXRlXG4gKi9cbmNvbnN0IEFMUFRhYmxlRGVsZWdhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBUYWJsZURlbGVnYXRlLCBBTFBUYWJsZURlbGVnYXRlQmFzZU1peGluLCB7XG5cdF9nZXREZWxlZ2F0ZVBhcmVudENsYXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIFRhYmxlRGVsZWdhdGU7XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBBTFBUYWJsZURlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLElBQU1BLGdCQUFnQixHQUFHQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsYUFBYSxFQUFFQyx5QkFBeUIsRUFBRTtJQUNwRkMsdUJBQXVCLEVBQUUsWUFBWTtNQUNwQyxPQUFPRixhQUFhO0lBQ3JCO0VBQ0QsQ0FBQyxDQUFDO0VBQUMsT0FFWUgsZ0JBQWdCO0FBQUEifQ==