/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/library", "sap/fe/macros/filter/type/MultiValue", "sap/fe/macros/filter/type/Range", "sap/fe/macros/macroLibrary", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/field/ConditionsType", "sap/ui/mdc/library", "sap/ui/unified/library"], function (_library, _MultiValue, _Range, _macroLibrary, Core, Fragment, _library2, _XMLTemplateProcessor, _ConditionsType, _library3, _library4) {
  "use strict";

  /**
   * Library containing the building blocks for SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe.macros
   * @public
   */

  /**
   * @namespace
   * @name sap.fe.macros.fpm
   * @private
   * @experimental
   */

  // library dependencies
  var thisLib = Core.initLibrary({
    name: "sap.fe.macros",
    dependencies: ["sap.ui.core", "sap.ui.mdc", "sap.ui.unified", "sap.fe.core"],
    types: ["sap.fe.macros.NavigationType", "sap.fe.macros.DraftIndicatorType", "sap.fe.macros.DraftIndicatorState"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.108.22",
    noLibraryCSS: true
  });
  thisLib.NavigationType = {
    /**
     * For External Navigation
     *
     * @public
     */
    External: "External",
    /**
     * For In-Page Navigation
     *
     * @public
     */
    InPage: "InPage",
    /**
     * For No Navigation
     *
     * @public
     */
    None: "None"
  };
  /**
   * Type Of Draft Indicator
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.DraftIndicatorType = {
    /**
     * DraftIndicator For List Report
     *
     * @public
     */
    IconAndText: "IconAndText",
    /**
     * DraftIndicator For Object Page
     *
     * @public
     */
    IconOnly: "IconOnly"
  };
  /**
   * Available values for DraftIndicator State.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.DraftIndicatorState = {
    /**
     * Draft With No Changes Yet
     *
     * @public
     */
    NoChanges: "NoChanges",
    /**
     * Draft With Changes
     *
     * @public
     */
    WithChanges: "WithChanges",
    /**
     * Draft With Active Instance
     *
     * @public
     */
    Active: "Active"
  };
  Fragment.registerType("CUSTOM", {
    load: Fragment.getType("XML").load,
    init: function (mSettings) {
      mSettings.containingView = {
        oController: mSettings.containingView.getController() && mSettings.containingView.getController().getExtensionAPI(mSettings.id)
      };
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return Fragment.getType("XML").init.apply(this, [mSettings, args]);
    }
  });
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0aGlzTGliIiwiQ29yZSIsImluaXRMaWJyYXJ5IiwibmFtZSIsImRlcGVuZGVuY2llcyIsInR5cGVzIiwiaW50ZXJmYWNlcyIsImNvbnRyb2xzIiwiZWxlbWVudHMiLCJ2ZXJzaW9uIiwibm9MaWJyYXJ5Q1NTIiwiTmF2aWdhdGlvblR5cGUiLCJFeHRlcm5hbCIsIkluUGFnZSIsIk5vbmUiLCJEcmFmdEluZGljYXRvclR5cGUiLCJJY29uQW5kVGV4dCIsIkljb25Pbmx5IiwiRHJhZnRJbmRpY2F0b3JTdGF0ZSIsIk5vQ2hhbmdlcyIsIldpdGhDaGFuZ2VzIiwiQWN0aXZlIiwiRnJhZ21lbnQiLCJyZWdpc3RlclR5cGUiLCJsb2FkIiwiZ2V0VHlwZSIsImluaXQiLCJtU2V0dGluZ3MiLCJjb250YWluaW5nVmlldyIsIm9Db250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciIsImdldEV4dGVuc2lvbkFQSSIsImlkIiwiYXJncyIsImFwcGx5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJsaWJyYXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL3R5cGUvTXVsdGlWYWx1ZVwiO1xuaW1wb3J0IFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvdHlwZS9SYW5nZVwiO1xuaW1wb3J0IFwic2FwL2ZlL21hY3Jvcy9tYWNyb0xpYnJhcnlcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IFwic2FwL3VpL21kYy9maWVsZC9Db25kaXRpb25zVHlwZVwiO1xuaW1wb3J0IFwic2FwL3VpL21kYy9saWJyYXJ5XCI7XG5pbXBvcnQgXCJzYXAvdWkvdW5pZmllZC9saWJyYXJ5XCI7XG5cbi8qKlxuICogTGlicmFyeSBjb250YWluaW5nIHRoZSBidWlsZGluZyBibG9ja3MgZm9yIFNBUCBGaW9yaSBlbGVtZW50cy5cbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAbmFtZSBzYXAuZmUubWFjcm9zXG4gKiBAcHVibGljXG4gKi9cblxuLyoqXG4gKiBAbmFtZXNwYWNlXG4gKiBAbmFtZSBzYXAuZmUubWFjcm9zLmZwbVxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuXG4vLyBsaWJyYXJ5IGRlcGVuZGVuY2llc1xuY29uc3QgdGhpc0xpYiA9IENvcmUuaW5pdExpYnJhcnkoe1xuXHRuYW1lOiBcInNhcC5mZS5tYWNyb3NcIixcblx0ZGVwZW5kZW5jaWVzOiBbXCJzYXAudWkuY29yZVwiLCBcInNhcC51aS5tZGNcIiwgXCJzYXAudWkudW5pZmllZFwiLCBcInNhcC5mZS5jb3JlXCJdLFxuXHR0eXBlczogW1wic2FwLmZlLm1hY3Jvcy5OYXZpZ2F0aW9uVHlwZVwiLCBcInNhcC5mZS5tYWNyb3MuRHJhZnRJbmRpY2F0b3JUeXBlXCIsIFwic2FwLmZlLm1hY3Jvcy5EcmFmdEluZGljYXRvclN0YXRlXCJdLFxuXHRpbnRlcmZhY2VzOiBbXSxcblx0Y29udHJvbHM6IFtdLFxuXHRlbGVtZW50czogW10sXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10ZW1wbGF0ZS1jdXJseS1pbi1zdHJpbmdcblx0dmVyc2lvbjogXCIke3ZlcnNpb259XCIsXG5cdG5vTGlicmFyeUNTUzogdHJ1ZVxufSkgYXMgYW55O1xuXG50aGlzTGliLk5hdmlnYXRpb25UeXBlID0ge1xuXHQvKipcblx0ICogRm9yIEV4dGVybmFsIE5hdmlnYXRpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0RXh0ZXJuYWw6IFwiRXh0ZXJuYWxcIixcblxuXHQvKipcblx0ICogRm9yIEluLVBhZ2UgTmF2aWdhdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRJblBhZ2U6IFwiSW5QYWdlXCIsXG5cblx0LyoqXG5cdCAqIEZvciBObyBOYXZpZ2F0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdE5vbmU6IFwiTm9uZVwiXG59O1xuLyoqXG4gKiBUeXBlIE9mIERyYWZ0IEluZGljYXRvclxuICpcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbnRoaXNMaWIuRHJhZnRJbmRpY2F0b3JUeXBlID0ge1xuXHQvKipcblx0ICogRHJhZnRJbmRpY2F0b3IgRm9yIExpc3QgUmVwb3J0XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEljb25BbmRUZXh0OiBcIkljb25BbmRUZXh0XCIsXG5cblx0LyoqXG5cdCAqIERyYWZ0SW5kaWNhdG9yIEZvciBPYmplY3QgUGFnZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRJY29uT25seTogXCJJY29uT25seVwiXG59O1xuLyoqXG4gKiBBdmFpbGFibGUgdmFsdWVzIGZvciBEcmFmdEluZGljYXRvciBTdGF0ZS5cbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLkRyYWZ0SW5kaWNhdG9yU3RhdGUgPSB7XG5cdC8qKlxuXHQgKiBEcmFmdCBXaXRoIE5vIENoYW5nZXMgWWV0XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdE5vQ2hhbmdlczogXCJOb0NoYW5nZXNcIixcblx0LyoqXG5cdCAqIERyYWZ0IFdpdGggQ2hhbmdlc1xuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRXaXRoQ2hhbmdlczogXCJXaXRoQ2hhbmdlc1wiLFxuXHQvKipcblx0ICogRHJhZnQgV2l0aCBBY3RpdmUgSW5zdGFuY2Vcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QWN0aXZlOiBcIkFjdGl2ZVwiXG59O1xuXG5GcmFnbWVudC5yZWdpc3RlclR5cGUoXCJDVVNUT01cIiwge1xuXHRsb2FkOiAoRnJhZ21lbnQgYXMgYW55KS5nZXRUeXBlKFwiWE1MXCIpLmxvYWQsXG5cdGluaXQ6IGZ1bmN0aW9uIChtU2V0dGluZ3M6IGFueSwgLi4uYXJnczogYW55W10pIHtcblx0XHRtU2V0dGluZ3MuY29udGFpbmluZ1ZpZXcgPSB7XG5cdFx0XHRvQ29udHJvbGxlcjogbVNldHRpbmdzLmNvbnRhaW5pbmdWaWV3LmdldENvbnRyb2xsZXIoKSAmJiBtU2V0dGluZ3MuY29udGFpbmluZ1ZpZXcuZ2V0Q29udHJvbGxlcigpLmdldEV4dGVuc2lvbkFQSShtU2V0dGluZ3MuaWQpXG5cdFx0fTtcblx0XHRyZXR1cm4gKEZyYWdtZW50IGFzIGFueSkuZ2V0VHlwZShcIlhNTFwiKS5pbml0LmFwcGx5KHRoaXMsIFttU2V0dGluZ3MsIGFyZ3NdKTtcblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHRoaXNMaWI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUE7RUFDQSxJQUFNQSxPQUFPLEdBQUdDLElBQUksQ0FBQ0MsV0FBVyxDQUFDO0lBQ2hDQyxJQUFJLEVBQUUsZUFBZTtJQUNyQkMsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLENBQUM7SUFDNUVDLEtBQUssRUFBRSxDQUFDLDhCQUE4QixFQUFFLGtDQUFrQyxFQUFFLG1DQUFtQyxDQUFDO0lBQ2hIQyxVQUFVLEVBQUUsRUFBRTtJQUNkQyxRQUFRLEVBQUUsRUFBRTtJQUNaQyxRQUFRLEVBQUUsRUFBRTtJQUNaO0lBQ0FDLE9BQU8sRUFBRSxZQUFZO0lBQ3JCQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQVE7RUFFVFYsT0FBTyxDQUFDVyxjQUFjLEdBQUc7SUFDeEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxRQUFRLEVBQUUsVUFBVTtJQUVwQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLE1BQU0sRUFBRSxRQUFRO0lBRWhCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFO0VBQ1AsQ0FBQztFQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0FkLE9BQU8sQ0FBQ2Usa0JBQWtCLEdBQUc7SUFDNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxXQUFXLEVBQUUsYUFBYTtJQUUxQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFFBQVEsRUFBRTtFQUNYLENBQUM7RUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBakIsT0FBTyxDQUFDa0IsbUJBQW1CLEdBQUc7SUFDN0I7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxTQUFTLEVBQUUsV0FBVztJQUN0QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFdBQVcsRUFBRSxhQUFhO0lBQzFCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsTUFBTSxFQUFFO0VBQ1QsQ0FBQztFQUVEQyxRQUFRLENBQUNDLFlBQVksQ0FBQyxRQUFRLEVBQUU7SUFDL0JDLElBQUksRUFBR0YsUUFBUSxDQUFTRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUNELElBQUk7SUFDM0NFLElBQUksRUFBRSxVQUFVQyxTQUFjLEVBQWtCO01BQy9DQSxTQUFTLENBQUNDLGNBQWMsR0FBRztRQUMxQkMsV0FBVyxFQUFFRixTQUFTLENBQUNDLGNBQWMsQ0FBQ0UsYUFBYSxFQUFFLElBQUlILFNBQVMsQ0FBQ0MsY0FBYyxDQUFDRSxhQUFhLEVBQUUsQ0FBQ0MsZUFBZSxDQUFDSixTQUFTLENBQUNLLEVBQUU7TUFDL0gsQ0FBQztNQUFDLGtDQUhnQ0MsSUFBSTtRQUFKQSxJQUFJO01BQUE7TUFJdEMsT0FBUVgsUUFBUSxDQUFTRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUNDLElBQUksQ0FBQ1EsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDUCxTQUFTLEVBQUVNLElBQUksQ0FBQyxDQUFDO0lBQzVFO0VBQ0QsQ0FBQyxDQUFDO0VBQUMsT0FFWWpDLE9BQU87QUFBQSJ9