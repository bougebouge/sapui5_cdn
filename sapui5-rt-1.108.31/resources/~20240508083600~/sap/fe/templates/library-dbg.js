/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/f/library", "sap/fe/common/library", "sap/fe/core/library", "sap/fe/macros/library", "sap/fe/templates/ListReport/view/fragments/MultipleMode.fragment", "sap/fe/templates/ObjectPage/components/DraftHandlerButton", "sap/ui/core/Core", "sap/ui/core/library"], function (_library, _library2, _library3, _library4, MultipleMode, DraftHandlerButton, Core, _library5) {
  "use strict";

  /**
   * Library providing the official templates supported by SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe.templates
   * @public
   */

  /**
   * @namespace
   * @name sap.fe.templates.ListReport
   * @public
   */

  /**
   * @namespace
   * @name sap.fe.templates.ObjectPage
   * @public
   */
  var thisLib = Core.initLibrary({
    name: "sap.fe.templates",
    dependencies: ["sap.ui.core", "sap.fe.core", "sap.fe.macros", "sap.fe.common", "sap.f"],
    types: ["sap.fe.templates.ObjectPage.SectionLayout"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.108.22",
    noLibraryCSS: true
  });
  if (!thisLib.ObjectPage) {
    thisLib.ObjectPage = {};
  }
  thisLib.ObjectPage.SectionLayout = {
    /**
     * All sections are shown in one page
     *
     * @public
     */
    Page: "Page",
    /**
     * All top-level sections are shown in an own tab
     *
     * @public
     */
    Tabs: "Tabs"
  };
  MultipleMode.register();
  DraftHandlerButton.register();
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0aGlzTGliIiwiQ29yZSIsImluaXRMaWJyYXJ5IiwibmFtZSIsImRlcGVuZGVuY2llcyIsInR5cGVzIiwiaW50ZXJmYWNlcyIsImNvbnRyb2xzIiwiZWxlbWVudHMiLCJ2ZXJzaW9uIiwibm9MaWJyYXJ5Q1NTIiwiT2JqZWN0UGFnZSIsIlNlY3Rpb25MYXlvdXQiLCJQYWdlIiwiVGFicyIsIk11bHRpcGxlTW9kZSIsInJlZ2lzdGVyIiwiRHJhZnRIYW5kbGVyQnV0dG9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJsaWJyYXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcInNhcC9mL2xpYnJhcnlcIjtcbmltcG9ydCBcInNhcC9mZS9jb21tb24vbGlicmFyeVwiO1xuaW1wb3J0IFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFwic2FwL2ZlL21hY3Jvcy9saWJyYXJ5XCI7XG5pbXBvcnQgTXVsdGlwbGVNb2RlIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL0xpc3RSZXBvcnQvdmlldy9mcmFnbWVudHMvTXVsdGlwbGVNb2RlLmZyYWdtZW50XCI7XG5pbXBvcnQgRHJhZnRIYW5kbGVyQnV0dG9uIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvY29tcG9uZW50cy9EcmFmdEhhbmRsZXJCdXR0b25cIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG4vKipcbiAqIExpYnJhcnkgcHJvdmlkaW5nIHRoZSBvZmZpY2lhbCB0ZW1wbGF0ZXMgc3VwcG9ydGVkIGJ5IFNBUCBGaW9yaSBlbGVtZW50cy5cbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAbmFtZSBzYXAuZmUudGVtcGxhdGVzXG4gKiBAcHVibGljXG4gKi9cblxuLyoqXG4gKiBAbmFtZXNwYWNlXG4gKiBAbmFtZSBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnRcbiAqIEBwdWJsaWNcbiAqL1xuXG4vKipcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZVxuICogQHB1YmxpY1xuICovXG5jb25zdCB0aGlzTGliID0gQ29yZS5pbml0TGlicmFyeSh7XG5cdG5hbWU6IFwic2FwLmZlLnRlbXBsYXRlc1wiLFxuXHRkZXBlbmRlbmNpZXM6IFtcInNhcC51aS5jb3JlXCIsIFwic2FwLmZlLmNvcmVcIiwgXCJzYXAuZmUubWFjcm9zXCIsIFwic2FwLmZlLmNvbW1vblwiLCBcInNhcC5mXCJdLFxuXHR0eXBlczogW1wic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLlNlY3Rpb25MYXlvdXRcIl0sXG5cdGludGVyZmFjZXM6IFtdLFxuXHRjb250cm9sczogW10sXG5cdGVsZW1lbnRzOiBbXSxcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRlbXBsYXRlLWN1cmx5LWluLXN0cmluZ1xuXHR2ZXJzaW9uOiBcIiR7dmVyc2lvbn1cIixcblx0bm9MaWJyYXJ5Q1NTOiB0cnVlXG59KSBhcyBhbnk7XG5cbmlmICghdGhpc0xpYi5PYmplY3RQYWdlKSB7XG5cdHRoaXNMaWIuT2JqZWN0UGFnZSA9IHt9O1xufVxudGhpc0xpYi5PYmplY3RQYWdlLlNlY3Rpb25MYXlvdXQgPSB7XG5cdC8qKlxuXHQgKiBBbGwgc2VjdGlvbnMgYXJlIHNob3duIGluIG9uZSBwYWdlXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFBhZ2U6IFwiUGFnZVwiLFxuXG5cdC8qKlxuXHQgKiBBbGwgdG9wLWxldmVsIHNlY3Rpb25zIGFyZSBzaG93biBpbiBhbiBvd24gdGFiXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFRhYnM6IFwiVGFic1wiXG59O1xuXG5NdWx0aXBsZU1vZGUucmVnaXN0ZXIoKTtcbkRyYWZ0SGFuZGxlckJ1dHRvbi5yZWdpc3RlcigpO1xuXG5leHBvcnQgZGVmYXVsdCB0aGlzTGliO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsSUFBTUEsT0FBTyxHQUFHQyxJQUFJLENBQUNDLFdBQVcsQ0FBQztJQUNoQ0MsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QkMsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQztJQUN2RkMsS0FBSyxFQUFFLENBQUMsMkNBQTJDLENBQUM7SUFDcERDLFVBQVUsRUFBRSxFQUFFO0lBQ2RDLFFBQVEsRUFBRSxFQUFFO0lBQ1pDLFFBQVEsRUFBRSxFQUFFO0lBQ1o7SUFDQUMsT0FBTyxFQUFFLFlBQVk7SUFDckJDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBUTtFQUVULElBQUksQ0FBQ1YsT0FBTyxDQUFDVyxVQUFVLEVBQUU7SUFDeEJYLE9BQU8sQ0FBQ1csVUFBVSxHQUFHLENBQUMsQ0FBQztFQUN4QjtFQUNBWCxPQUFPLENBQUNXLFVBQVUsQ0FBQ0MsYUFBYSxHQUFHO0lBQ2xDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFLE1BQU07SUFFWjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLElBQUksRUFBRTtFQUNQLENBQUM7RUFFREMsWUFBWSxDQUFDQyxRQUFRLEVBQUU7RUFDdkJDLGtCQUFrQixDQUFDRCxRQUFRLEVBQUU7RUFBQyxPQUVmaEIsT0FBTztBQUFBIn0=