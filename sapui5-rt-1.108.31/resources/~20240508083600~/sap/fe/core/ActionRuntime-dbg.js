/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit"], function (CommonUtils, BindingToolkit) {
  "use strict";

  var transformRecursively = BindingToolkit.transformRecursively;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var ActionRuntime = {
    /**
     * Sets the action enablement.
     *
     * @function
     * @name setActionEnablement
     * @param oInternalModelContext Object containing the context model
     * @param oActionOperationAvailableMap Map containing the operation availability of actions
     * @param aSelectedContexts Array containing selected contexts of the chart
     * @param sControl Control name
     * @returns Promise.all(aPromises)
     * @ui5-restricted
     */
    setActionEnablement: function (oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, sControl) {
      var aPromises = [];
      for (var sAction in oActionOperationAvailableMap) {
        var aRequestPromises = [];
        oInternalModelContext.setProperty(sAction, false);
        var sProperty = oActionOperationAvailableMap[sAction];
        for (var i = 0; i < aSelectedContexts.length; i++) {
          var oSelectedContext = aSelectedContexts[i];
          if (oSelectedContext) {
            var oContextData = oSelectedContext.getObject();
            if (sControl === "chart") {
              if (sProperty === null && !!oContextData["#".concat(sAction)] || oSelectedContext.getObject(sProperty)) {
                //look for action advertisement if present and its value is not null
                oInternalModelContext.setProperty(sAction, true);
                break;
              }
            } else if (sControl === "table") {
              aRequestPromises = this._setActionEnablementForTable(oSelectedContext, oInternalModelContext, sAction, sProperty, aRequestPromises);
            }
          }
        }
        if (sControl === "table") {
          if (!aSelectedContexts.length) {
            oInternalModelContext.setProperty("dynamicActions/".concat(sAction), {
              bEnabled: false,
              aApplicable: [],
              aNotApplicable: []
            });
            aPromises.push(CommonUtils.setContextsBasedOnOperationAvailable(oInternalModelContext, []));
          } else if (aSelectedContexts.length && typeof sProperty === "string") {
            // When all property values have been retrieved, set
            // The applicable and not-applicable selected contexts for each action and
            // The enabled property of the dynamic action in internal model context.
            aPromises.push(CommonUtils.setContextsBasedOnOperationAvailable(oInternalModelContext, aRequestPromises));
          }
        }
      }
      if (sControl === "table") {
        return Promise.all(aPromises);
      }
    },
    setActionEnablementAfterPatch: function (oView, oListBinding, oInternalModelContext) {
      var oInternalModelContextData = oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.getObject();
      var oControls = (oInternalModelContextData === null || oInternalModelContextData === void 0 ? void 0 : oInternalModelContextData.controls) || {};
      for (var sKey in oControls) {
        if (oControls[sKey] && oControls[sKey].controlId) {
          var oTable = oView.byId(sKey);
          if (oTable.isA("sap.ui.mdc.Table")) {
            var oRowBinding = oTable.getRowBinding();
            if (oRowBinding == oListBinding) {
              ActionRuntime.setActionEnablement(oInternalModelContext, JSON.parse(oTable.data("operationAvailableMap").customData), oTable.getSelectedContexts(), "table");
            }
          }
        }
      }
    },
    _setActionEnablementForTable: function (oSelectedContext, oInternalModelContext, sAction, sProperty, aRequestPromises) {
      // Reset all properties before computation
      oInternalModelContext.setProperty("dynamicActions/".concat(sAction), {
        bEnabled: false,
        aApplicable: [],
        aNotApplicable: []
      });
      // Note that non dynamic actions are not processed here. They are enabled because
      // one or more are selected and the second part of the condition in the templating
      // is then undefined and thus the button takes the default enabling, which is true!
      var aApplicable = [],
        aNotApplicable = [],
        sDynamicActionEnabledPath = "".concat(oInternalModelContext.getPath(), "/dynamicActions/").concat(sAction, "/bEnabled");
      if (typeof sProperty === "object" && sProperty !== null && sProperty !== undefined) {
        if (oSelectedContext) {
          var oContextData = oSelectedContext.getObject();
          var oTransformedBinding = transformRecursively(sProperty, "PathInModel",
          // eslint-disable-next-line no-loop-func
          function (oBindingExpression) {
            return oContextData ? constant(oContextData[oBindingExpression.path]) : constant(false);
          }, true);
          var sResult = compileExpression(oTransformedBinding);
          if (sResult === "true") {
            oInternalModelContext.getModel().setProperty(sDynamicActionEnabledPath, true);
            aApplicable.push(oSelectedContext);
          } else {
            aNotApplicable.push(oSelectedContext);
          }
        }
        CommonUtils.setDynamicActionContexts(oInternalModelContext, sAction, aApplicable, aNotApplicable);
      } else {
        var _oContextData = oSelectedContext.getObject();
        if (sProperty === null && !!_oContextData["#".concat(sAction)]) {
          //look for action advertisement if present and its value is not null
          oInternalModelContext.getModel().setProperty(sDynamicActionEnabledPath, true);
        } else {
          // Collect promises to retrieve singleton or normal property value asynchronously
          aRequestPromises.push(CommonUtils.requestProperty(oSelectedContext, sAction, sProperty, sDynamicActionEnabledPath));
        }
      }
      return aRequestPromises;
    }
  };
  return ActionRuntime;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBY3Rpb25SdW50aW1lIiwic2V0QWN0aW9uRW5hYmxlbWVudCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsIm9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAiLCJhU2VsZWN0ZWRDb250ZXh0cyIsInNDb250cm9sIiwiYVByb21pc2VzIiwic0FjdGlvbiIsImFSZXF1ZXN0UHJvbWlzZXMiLCJzZXRQcm9wZXJ0eSIsInNQcm9wZXJ0eSIsImkiLCJsZW5ndGgiLCJvU2VsZWN0ZWRDb250ZXh0Iiwib0NvbnRleHREYXRhIiwiZ2V0T2JqZWN0IiwiX3NldEFjdGlvbkVuYWJsZW1lbnRGb3JUYWJsZSIsImJFbmFibGVkIiwiYUFwcGxpY2FibGUiLCJhTm90QXBwbGljYWJsZSIsInB1c2giLCJDb21tb25VdGlscyIsInNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZSIsIlByb21pc2UiLCJhbGwiLCJzZXRBY3Rpb25FbmFibGVtZW50QWZ0ZXJQYXRjaCIsIm9WaWV3Iiwib0xpc3RCaW5kaW5nIiwib0ludGVybmFsTW9kZWxDb250ZXh0RGF0YSIsIm9Db250cm9scyIsImNvbnRyb2xzIiwic0tleSIsImNvbnRyb2xJZCIsIm9UYWJsZSIsImJ5SWQiLCJpc0EiLCJvUm93QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJKU09OIiwicGFyc2UiLCJkYXRhIiwiY3VzdG9tRGF0YSIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoIiwiZ2V0UGF0aCIsInVuZGVmaW5lZCIsIm9UcmFuc2Zvcm1lZEJpbmRpbmciLCJ0cmFuc2Zvcm1SZWN1cnNpdmVseSIsIm9CaW5kaW5nRXhwcmVzc2lvbiIsImNvbnN0YW50IiwicGF0aCIsInNSZXN1bHQiLCJjb21waWxlRXhwcmVzc2lvbiIsImdldE1vZGVsIiwic2V0RHluYW1pY0FjdGlvbkNvbnRleHRzIiwicmVxdWVzdFByb3BlcnR5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBY3Rpb25SdW50aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBjb25zdGFudCwgdHJhbnNmb3JtUmVjdXJzaXZlbHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5jb25zdCBBY3Rpb25SdW50aW1lID0ge1xuXHQvKipcblx0ICogU2V0cyB0aGUgYWN0aW9uIGVuYWJsZW1lbnQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzZXRBY3Rpb25FbmFibGVtZW50XG5cdCAqIEBwYXJhbSBvSW50ZXJuYWxNb2RlbENvbnRleHQgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNvbnRleHQgbW9kZWxcblx0ICogQHBhcmFtIG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAgTWFwIGNvbnRhaW5pbmcgdGhlIG9wZXJhdGlvbiBhdmFpbGFiaWxpdHkgb2YgYWN0aW9uc1xuXHQgKiBAcGFyYW0gYVNlbGVjdGVkQ29udGV4dHMgQXJyYXkgY29udGFpbmluZyBzZWxlY3RlZCBjb250ZXh0cyBvZiB0aGUgY2hhcnRcblx0ICogQHBhcmFtIHNDb250cm9sIENvbnRyb2wgbmFtZVxuXHQgKiBAcmV0dXJucyBQcm9taXNlLmFsbChhUHJvbWlzZXMpXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0c2V0QWN0aW9uRW5hYmxlbWVudDogZnVuY3Rpb24gKFxuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0b0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcDogYW55LFxuXHRcdGFTZWxlY3RlZENvbnRleHRzOiBhbnlbXSxcblx0XHRzQ29udHJvbDogc3RyaW5nXG5cdCkge1xuXHRcdGNvbnN0IGFQcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3Qgc0FjdGlvbiBpbiBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwKSB7XG5cdFx0XHRsZXQgYVJlcXVlc3RQcm9taXNlcyA9IFtdO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNBY3Rpb24sIGZhbHNlKTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXBbc0FjdGlvbl07XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZWxlY3RlZENvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZENvbnRleHQgPSBhU2VsZWN0ZWRDb250ZXh0c1tpXTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZENvbnRleHQpIHtcblx0XHRcdFx0XHRjb25zdCBvQ29udGV4dERhdGEgPSBvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdGlmIChzQ29udHJvbCA9PT0gXCJjaGFydFwiKSB7XG5cdFx0XHRcdFx0XHRpZiAoKHNQcm9wZXJ0eSA9PT0gbnVsbCAmJiAhIW9Db250ZXh0RGF0YVtgIyR7c0FjdGlvbn1gXSkgfHwgb1NlbGVjdGVkQ29udGV4dC5nZXRPYmplY3Qoc1Byb3BlcnR5KSkge1xuXHRcdFx0XHRcdFx0XHQvL2xvb2sgZm9yIGFjdGlvbiBhZHZlcnRpc2VtZW50IGlmIHByZXNlbnQgYW5kIGl0cyB2YWx1ZSBpcyBub3QgbnVsbFxuXHRcdFx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0FjdGlvbiwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc0NvbnRyb2wgPT09IFwidGFibGVcIikge1xuXHRcdFx0XHRcdFx0YVJlcXVlc3RQcm9taXNlcyA9IHRoaXMuX3NldEFjdGlvbkVuYWJsZW1lbnRGb3JUYWJsZShcblx0XHRcdFx0XHRcdFx0b1NlbGVjdGVkQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRzQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRzUHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdGFSZXF1ZXN0UHJvbWlzZXNcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoc0NvbnRyb2wgPT09IFwidGFibGVcIikge1xuXHRcdFx0XHRpZiAoIWFTZWxlY3RlZENvbnRleHRzLmxlbmd0aCkge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShgZHluYW1pY0FjdGlvbnMvJHtzQWN0aW9ufWAsIHtcblx0XHRcdFx0XHRcdGJFbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0XHRcdGFBcHBsaWNhYmxlOiBbXSxcblx0XHRcdFx0XHRcdGFOb3RBcHBsaWNhYmxlOiBbXVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGFQcm9taXNlcy5wdXNoKENvbW1vblV0aWxzLnNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZShvSW50ZXJuYWxNb2RlbENvbnRleHQsIFtdKSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYVNlbGVjdGVkQ29udGV4dHMubGVuZ3RoICYmIHR5cGVvZiBzUHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHQvLyBXaGVuIGFsbCBwcm9wZXJ0eSB2YWx1ZXMgaGF2ZSBiZWVuIHJldHJpZXZlZCwgc2V0XG5cdFx0XHRcdFx0Ly8gVGhlIGFwcGxpY2FibGUgYW5kIG5vdC1hcHBsaWNhYmxlIHNlbGVjdGVkIGNvbnRleHRzIGZvciBlYWNoIGFjdGlvbiBhbmRcblx0XHRcdFx0XHQvLyBUaGUgZW5hYmxlZCBwcm9wZXJ0eSBvZiB0aGUgZHluYW1pYyBhY3Rpb24gaW4gaW50ZXJuYWwgbW9kZWwgY29udGV4dC5cblx0XHRcdFx0XHRhUHJvbWlzZXMucHVzaChDb21tb25VdGlscy5zZXRDb250ZXh0c0Jhc2VkT25PcGVyYXRpb25BdmFpbGFibGUob0ludGVybmFsTW9kZWxDb250ZXh0LCBhUmVxdWVzdFByb21pc2VzKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHNDb250cm9sID09PSBcInRhYmxlXCIpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLmFsbChhUHJvbWlzZXMpO1xuXHRcdH1cblx0fSxcblx0c2V0QWN0aW9uRW5hYmxlbWVudEFmdGVyUGF0Y2g6IGZ1bmN0aW9uIChvVmlldzogYW55LCBvTGlzdEJpbmRpbmc6IGFueSwgb0ludGVybmFsTW9kZWxDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHREYXRhOiBhbnkgPSBvSW50ZXJuYWxNb2RlbENvbnRleHQ/LmdldE9iamVjdCgpO1xuXHRcdGNvbnN0IG9Db250cm9scyA9IG9JbnRlcm5hbE1vZGVsQ29udGV4dERhdGE/LmNvbnRyb2xzIHx8IHt9O1xuXHRcdGZvciAoY29uc3Qgc0tleSBpbiBvQ29udHJvbHMpIHtcblx0XHRcdGlmIChvQ29udHJvbHNbc0tleV0gJiYgb0NvbnRyb2xzW3NLZXldLmNvbnRyb2xJZCkge1xuXHRcdFx0XHRjb25zdCBvVGFibGU6IGFueSA9IG9WaWV3LmJ5SWQoc0tleSk7XG5cdFx0XHRcdGlmIChvVGFibGUuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdFx0XHRpZiAob1Jvd0JpbmRpbmcgPT0gb0xpc3RCaW5kaW5nKSB7XG5cdFx0XHRcdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0SlNPTi5wYXJzZShvVGFibGUuZGF0YShcIm9wZXJhdGlvbkF2YWlsYWJsZU1hcFwiKS5jdXN0b21EYXRhKSxcblx0XHRcdFx0XHRcdFx0b1RhYmxlLmdldFNlbGVjdGVkQ29udGV4dHMoKSxcblx0XHRcdFx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0X3NldEFjdGlvbkVuYWJsZW1lbnRGb3JUYWJsZTogZnVuY3Rpb24gKFxuXHRcdG9TZWxlY3RlZENvbnRleHQ6IGFueSxcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ6IGFueSxcblx0XHRzQWN0aW9uOiBzdHJpbmcsXG5cdFx0c1Byb3BlcnR5OiBhbnksXG5cdFx0YVJlcXVlc3RQcm9taXNlczogYW55XG5cdCkge1xuXHRcdC8vIFJlc2V0IGFsbCBwcm9wZXJ0aWVzIGJlZm9yZSBjb21wdXRhdGlvblxuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShgZHluYW1pY0FjdGlvbnMvJHtzQWN0aW9ufWAsIHtcblx0XHRcdGJFbmFibGVkOiBmYWxzZSxcblx0XHRcdGFBcHBsaWNhYmxlOiBbXSxcblx0XHRcdGFOb3RBcHBsaWNhYmxlOiBbXVxuXHRcdH0pO1xuXHRcdC8vIE5vdGUgdGhhdCBub24gZHluYW1pYyBhY3Rpb25zIGFyZSBub3QgcHJvY2Vzc2VkIGhlcmUuIFRoZXkgYXJlIGVuYWJsZWQgYmVjYXVzZVxuXHRcdC8vIG9uZSBvciBtb3JlIGFyZSBzZWxlY3RlZCBhbmQgdGhlIHNlY29uZCBwYXJ0IG9mIHRoZSBjb25kaXRpb24gaW4gdGhlIHRlbXBsYXRpbmdcblx0XHQvLyBpcyB0aGVuIHVuZGVmaW5lZCBhbmQgdGh1cyB0aGUgYnV0dG9uIHRha2VzIHRoZSBkZWZhdWx0IGVuYWJsaW5nLCB3aGljaCBpcyB0cnVlIVxuXHRcdGNvbnN0IGFBcHBsaWNhYmxlID0gW10sXG5cdFx0XHRhTm90QXBwbGljYWJsZSA9IFtdLFxuXHRcdFx0c0R5bmFtaWNBY3Rpb25FbmFibGVkUGF0aCA9IGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2R5bmFtaWNBY3Rpb25zLyR7c0FjdGlvbn0vYkVuYWJsZWRgO1xuXHRcdGlmICh0eXBlb2Ygc1Byb3BlcnR5ID09PSBcIm9iamVjdFwiICYmIHNQcm9wZXJ0eSAhPT0gbnVsbCAmJiBzUHJvcGVydHkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKG9TZWxlY3RlZENvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgb0NvbnRleHREYXRhID0gb1NlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0Y29uc3Qgb1RyYW5zZm9ybWVkQmluZGluZyA9IHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KFxuXHRcdFx0XHRcdHNQcm9wZXJ0eSxcblx0XHRcdFx0XHRcIlBhdGhJbk1vZGVsXCIsXG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWxvb3AtZnVuY1xuXHRcdFx0XHRcdGZ1bmN0aW9uIChvQmluZGluZ0V4cHJlc3Npb246IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9Db250ZXh0RGF0YSA/IGNvbnN0YW50KG9Db250ZXh0RGF0YVtvQmluZGluZ0V4cHJlc3Npb24ucGF0aF0pIDogY29uc3RhbnQoZmFsc2UpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRjb25zdCBzUmVzdWx0ID0gY29tcGlsZUV4cHJlc3Npb24ob1RyYW5zZm9ybWVkQmluZGluZyk7XG5cdFx0XHRcdGlmIChzUmVzdWx0ID09PSBcInRydWVcIikge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRNb2RlbCgpLnNldFByb3BlcnR5KHNEeW5hbWljQWN0aW9uRW5hYmxlZFBhdGgsIHRydWUpO1xuXHRcdFx0XHRcdGFBcHBsaWNhYmxlLnB1c2gob1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YU5vdEFwcGxpY2FibGUucHVzaChvU2VsZWN0ZWRDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Q29tbW9uVXRpbHMuc2V0RHluYW1pY0FjdGlvbkNvbnRleHRzKG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgc0FjdGlvbiwgYUFwcGxpY2FibGUsIGFOb3RBcHBsaWNhYmxlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgb0NvbnRleHREYXRhID0gb1NlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdGlmIChzUHJvcGVydHkgPT09IG51bGwgJiYgISFvQ29udGV4dERhdGFbYCMke3NBY3Rpb259YF0pIHtcblx0XHRcdFx0Ly9sb29rIGZvciBhY3Rpb24gYWR2ZXJ0aXNlbWVudCBpZiBwcmVzZW50IGFuZCBpdHMgdmFsdWUgaXMgbm90IG51bGxcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCkuc2V0UHJvcGVydHkoc0R5bmFtaWNBY3Rpb25FbmFibGVkUGF0aCwgdHJ1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBDb2xsZWN0IHByb21pc2VzIHRvIHJldHJpZXZlIHNpbmdsZXRvbiBvciBub3JtYWwgcHJvcGVydHkgdmFsdWUgYXN5bmNocm9ub3VzbHlcblx0XHRcdFx0YVJlcXVlc3RQcm9taXNlcy5wdXNoKENvbW1vblV0aWxzLnJlcXVlc3RQcm9wZXJ0eShvU2VsZWN0ZWRDb250ZXh0LCBzQWN0aW9uLCBzUHJvcGVydHksIHNEeW5hbWljQWN0aW9uRW5hYmxlZFBhdGgpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGFSZXF1ZXN0UHJvbWlzZXM7XG5cdH1cbn07XG5leHBvcnQgZGVmYXVsdCBBY3Rpb25SdW50aW1lO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBR0EsSUFBTUEsYUFBYSxHQUFHO0lBQ3JCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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