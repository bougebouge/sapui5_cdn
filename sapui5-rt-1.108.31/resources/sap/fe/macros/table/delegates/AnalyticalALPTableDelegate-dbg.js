/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/table/delegates/ALPTableDelegateBaseMixin", "sap/fe/macros/table/delegates/AnalyticalTableDelegate"], function (ALPTableDelegateBaseMixin, AnalyticalTableDelegate) {
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
   * @alias sap.fe.macros.AnalyticalALPTableDelegate
   */
  var AnalyticalALPTableDelegate = Object.assign({}, AnalyticalTableDelegate, ALPTableDelegateBaseMixin, {
    _getDelegateParentClass: function () {
      return AnalyticalTableDelegate;
    }
  });
  return AnalyticalALPTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbmFseXRpY2FsQUxQVGFibGVEZWxlZ2F0ZSIsIk9iamVjdCIsImFzc2lnbiIsIkFuYWx5dGljYWxUYWJsZURlbGVnYXRlIiwiQUxQVGFibGVEZWxlZ2F0ZUJhc2VNaXhpbiIsIl9nZXREZWxlZ2F0ZVBhcmVudENsYXNzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBbmFseXRpY2FsQUxQVGFibGVEZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQUxQVGFibGVEZWxlZ2F0ZUJhc2VNaXhpbiBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9kZWxlZ2F0ZXMvQUxQVGFibGVEZWxlZ2F0ZUJhc2VNaXhpblwiO1xuaW1wb3J0IEFuYWx5dGljYWxUYWJsZURlbGVnYXRlIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9BbmFseXRpY2FsVGFibGVEZWxlZ2F0ZVwiO1xuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHNhcC51aS5tZGMuVGFibGUuXG4gKiA8aDM+PGI+Tm90ZTo8L2I+PC9oMz5cbiAqIFRoZSBjbGFzcyBpcyBleHBlcmltZW50YWwgYW5kIHRoZSBBUEkvYmVoYXZpb3VyIGlzIG5vdCBmaW5hbGlzZWQgYW5kIGhlbmNlIHRoaXMgc2hvdWxkIG5vdCBiZSB1c2VkIGZvciBwcm9kdWN0aXZlIHVzYWdlLlxuICpcbiAqIEBhdXRob3IgU0FQIFNFXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuNjlcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLkFuYWx5dGljYWxBTFBUYWJsZURlbGVnYXRlXG4gKi9cbmNvbnN0IEFuYWx5dGljYWxBTFBUYWJsZURlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgQW5hbHl0aWNhbFRhYmxlRGVsZWdhdGUsIEFMUFRhYmxlRGVsZWdhdGVCYXNlTWl4aW4sIHtcblx0X2dldERlbGVnYXRlUGFyZW50Q2xhc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gQW5hbHl0aWNhbFRhYmxlRGVsZWdhdGU7XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBBbmFseXRpY2FsQUxQVGFibGVEZWxlZ2F0ZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxJQUFNQSwwQkFBMEIsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLHVCQUF1QixFQUFFQyx5QkFBeUIsRUFBRTtJQUN4R0MsdUJBQXVCLEVBQUUsWUFBWTtNQUNwQyxPQUFPRix1QkFBdUI7SUFDL0I7RUFDRCxDQUFDLENBQUM7RUFBQyxPQUVZSCwwQkFBMEI7QUFBQSJ9