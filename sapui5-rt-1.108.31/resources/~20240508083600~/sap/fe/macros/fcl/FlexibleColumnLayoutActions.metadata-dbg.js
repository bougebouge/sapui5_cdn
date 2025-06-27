/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"], function (MacroMetadata) {
  "use strict";

  /**
   * @classdesc
   * Building block used specifically in an app using the flexible column layout to add the ‘expand’, ‘reduce’, and ‘close’ action buttons.
   *
   * Usage example:
   * <pre>
   * &lt;f:DynamicPageTitle id="incidentProcessFlowDynamicPageTitle"&gt;
   *	 &lt;f:navigationActions&gt;
   *	   &lt;macros:FlexibleColumnLayoutActions /&gt;
   *	 &lt;/f:navigationActions&gt;
   * &lt;/f:DynamicPageTitle&gt;
   * &lt;macro:FlexibleColumnLayoutActions /&gt;
   * </pre>
   * @class sap.fe.macros.FlexibleColumnLayoutActions
   * @hideconstructor
   * @public
   * @since 1.93.0
   */
  var FlexibleColumnLayoutActions = MacroMetadata.extend("sap.fe.macros.fcl.FlexibleColumnLayoutActions", {
    /**
     * Name of the macro control.
     */
    name: "FlexibleColumnLayoutActions",
    /**
     * Namespace of the macro control
     */
    namespace: "sap.fe.macros",
    publicNamespace: "sap.fe.macros",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.fcl.FlexibleColumnLayoutActions",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Defines the macro stereotype used in documentation.
       */
      stereotype: "xmlmacro",
      /**
       * Properties.
       */
      properties: {}
    }
  });
  return FlexibleColumnLayoutActions;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGbGV4aWJsZUNvbHVtbkxheW91dEFjdGlvbnMiLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJzdGVyZW90eXBlIiwicHJvcGVydGllcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zLm1ldGFkYXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBNYWNyb01ldGFkYXRhIGZyb20gXCJzYXAvZmUvbWFjcm9zL01hY3JvTWV0YWRhdGFcIjtcblxuLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHNwZWNpZmljYWxseSBpbiBhbiBhcHAgdXNpbmcgdGhlIGZsZXhpYmxlIGNvbHVtbiBsYXlvdXQgdG8gYWRkIHRoZSDigJhleHBhbmTigJksIOKAmHJlZHVjZeKAmSwgYW5kIOKAmGNsb3Nl4oCZIGFjdGlvbiBidXR0b25zLlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O2Y6RHluYW1pY1BhZ2VUaXRsZSBpZD1cImluY2lkZW50UHJvY2Vzc0Zsb3dEeW5hbWljUGFnZVRpdGxlXCImZ3Q7XG4gKlx0ICZsdDtmOm5hdmlnYXRpb25BY3Rpb25zJmd0O1xuICpcdCAgICZsdDttYWNyb3M6RmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zIC8mZ3Q7XG4gKlx0ICZsdDsvZjpuYXZpZ2F0aW9uQWN0aW9ucyZndDtcbiAqICZsdDsvZjpEeW5hbWljUGFnZVRpdGxlJmd0O1xuICogJmx0O21hY3JvOkZsZXhpYmxlQ29sdW1uTGF5b3V0QWN0aW9ucyAvJmd0O1xuICogPC9wcmU+XG4gKiBAY2xhc3Mgc2FwLmZlLm1hY3Jvcy5GbGV4aWJsZUNvbHVtbkxheW91dEFjdGlvbnNcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjkzLjBcbiAqL1xuY29uc3QgRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zID0gTWFjcm9NZXRhZGF0YS5leHRlbmQoXCJzYXAuZmUubWFjcm9zLmZjbC5GbGV4aWJsZUNvbHVtbkxheW91dEFjdGlvbnNcIiwge1xuXHQvKipcblx0ICogTmFtZSBvZiB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG5hbWU6IFwiRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zXCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Ugb2YgdGhlIG1hY3JvIGNvbnRyb2xcblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdC8qKlxuXHQgKiBGcmFnbWVudCBzb3VyY2Ugb2YgdGhlIG1hY3JvIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCBmcmFnbWVudCBpcyBnZW5lcmF0ZWQgZnJvbSBuYW1lc3BhY2UgYW5kIG5hbWVcblx0ICovXG5cdGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MuZmNsLkZsZXhpYmxlQ29sdW1uTGF5b3V0QWN0aW9uc1wiLFxuXHQvKipcblx0ICogVGhlIG1ldGFkYXRhIGRlc2NyaWJpbmcgdGhlIG1hY3JvIGNvbnRyb2wuXG5cdCAqL1xuXHRtZXRhZGF0YToge1xuXHRcdC8qKlxuXHRcdCAqIERlZmluZXMgdGhlIG1hY3JvIHN0ZXJlb3R5cGUgdXNlZCBpbiBkb2N1bWVudGF0aW9uLlxuXHRcdCAqL1xuXHRcdHN0ZXJlb3R5cGU6IFwieG1sbWFjcm9cIixcblx0XHQvKipcblx0XHQgKiBQcm9wZXJ0aWVzLlxuXHRcdCAqL1xuXHRcdHByb3BlcnRpZXM6IHt9XG5cdH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsSUFBTUEsMkJBQTJCLEdBQUdDLGFBQWEsQ0FBQ0MsTUFBTSxDQUFDLCtDQUErQyxFQUFFO0lBQ3pHO0FBQ0Q7QUFDQTtJQUNDQyxJQUFJLEVBQUUsNkJBQTZCO0lBQ25DO0FBQ0Q7QUFDQTtJQUNDQyxTQUFTLEVBQUUsZUFBZTtJQUMxQkMsZUFBZSxFQUFFLGVBQWU7SUFDaEM7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRSwrQ0FBK0M7SUFDekQ7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRTtNQUNUO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUUsVUFBVTtNQUN0QjtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFLENBQUM7SUFDZDtFQUNELENBQUMsQ0FBQztFQUFDLE9BQ1lULDJCQUEyQjtBQUFBIn0=