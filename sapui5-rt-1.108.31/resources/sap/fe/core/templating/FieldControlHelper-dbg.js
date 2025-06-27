/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit"], function (BindingToolkit) {
  "use strict";

  var _exports = {};
  var or = BindingToolkit.or;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  /**
   * Create the binding expression to check if the property is read only or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's read only
   */
  var isReadOnlyExpression = function (oTarget, relativePath) {
    var _oTarget$annotations, _oTarget$annotations$, _oTarget$annotations$2;
    var oFieldControlValue = oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$annotations = oTarget.annotations) === null || _oTarget$annotations === void 0 ? void 0 : (_oTarget$annotations$ = _oTarget$annotations.Common) === null || _oTarget$annotations$ === void 0 ? void 0 : (_oTarget$annotations$2 = _oTarget$annotations$.FieldControl) === null || _oTarget$annotations$2 === void 0 ? void 0 : _oTarget$annotations$2.valueOf();
    if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
      return or(equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 1), equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "1"));
    }
    return constant(oFieldControlValue === "Common.FieldControlType/ReadOnly");
  };

  /**
   * Create the binding expression to check if the property is disabled or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's disabled
   */
  _exports.isReadOnlyExpression = isReadOnlyExpression;
  var isDisabledExpression = function (oTarget, relativePath) {
    var _oTarget$annotations2, _oTarget$annotations3, _oTarget$annotations4;
    var oFieldControlValue = oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$annotations2 = oTarget.annotations) === null || _oTarget$annotations2 === void 0 ? void 0 : (_oTarget$annotations3 = _oTarget$annotations2.Common) === null || _oTarget$annotations3 === void 0 ? void 0 : (_oTarget$annotations4 = _oTarget$annotations3.FieldControl) === null || _oTarget$annotations4 === void 0 ? void 0 : _oTarget$annotations4.valueOf();
    if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
      return or(equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 0), equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "0"));
    }
    return constant(oFieldControlValue === "Common.FieldControlType/Inapplicable");
  };

  /**
   * Create the binding expression to check if the property is editable or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's not editable
   */
  _exports.isDisabledExpression = isDisabledExpression;
  var isNonEditableExpression = function (oTarget, relativePath) {
    return or(isReadOnlyExpression(oTarget, relativePath), isDisabledExpression(oTarget, relativePath));
  };

  /**
   * Create the binding expression to check if the property is read only or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's read only
   */
  _exports.isNonEditableExpression = isNonEditableExpression;
  var isRequiredExpression = function (oTarget, relativePath) {
    var _oTarget$annotations5, _oTarget$annotations6, _oTarget$annotations7;
    var oFieldControlValue = oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$annotations5 = oTarget.annotations) === null || _oTarget$annotations5 === void 0 ? void 0 : (_oTarget$annotations6 = _oTarget$annotations5.Common) === null || _oTarget$annotations6 === void 0 ? void 0 : (_oTarget$annotations7 = _oTarget$annotations6.FieldControl) === null || _oTarget$annotations7 === void 0 ? void 0 : _oTarget$annotations7.valueOf();
    if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
      return or(equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 7), equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "7"));
    }
    return constant(oFieldControlValue === "Common.FieldControlType/Mandatory");
  };
  _exports.isRequiredExpression = isRequiredExpression;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1JlYWRPbmx5RXhwcmVzc2lvbiIsIm9UYXJnZXQiLCJyZWxhdGl2ZVBhdGgiLCJvRmllbGRDb250cm9sVmFsdWUiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIkZpZWxkQ29udHJvbCIsInZhbHVlT2YiLCJvciIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiY29uc3RhbnQiLCJpc0Rpc2FibGVkRXhwcmVzc2lvbiIsImlzTm9uRWRpdGFibGVFeHByZXNzaW9uIiwiaXNSZXF1aXJlZEV4cHJlc3Npb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkQ29udHJvbEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29uc3RhbnQsIGVxdWFsLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sIG9yIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBjaGVjayBpZiB0aGUgcHJvcGVydHkgaXMgcmVhZCBvbmx5IG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1RhcmdldCBUaGUgdGFyZ2V0IHByb3BlcnR5IG9yIERhdGFGaWVsZFxuICogQHBhcmFtIHJlbGF0aXZlUGF0aCBBcnJheSBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgcG9pbnRpbmcgdG8gdGhlIGxvY2F0aW9uIG9mIGZpZWxkIGNvbnRyb2wgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gcmVzb2x2aW5nIHRvIGEgQm9vbGVhbiBiZWluZyB0cnVlIGlmIGl0J3MgcmVhZCBvbmx5XG4gKi9cbmV4cG9ydCBjb25zdCBpc1JlYWRPbmx5RXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChvVGFyZ2V0OiBQcm9wZXJ0eSB8IHVuZGVmaW5lZCwgcmVsYXRpdmVQYXRoPzogc3RyaW5nW10pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBvRmllbGRDb250cm9sVmFsdWUgPSBvVGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5GaWVsZENvbnRyb2w/LnZhbHVlT2YoKTtcblx0aWYgKHR5cGVvZiBvRmllbGRDb250cm9sVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgISFvRmllbGRDb250cm9sVmFsdWUpIHtcblx0XHRyZXR1cm4gb3IoXG5cdFx0XHRlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0ZpZWxkQ29udHJvbFZhbHVlLCByZWxhdGl2ZVBhdGgpLCAxKSxcblx0XHRcdGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRmllbGRDb250cm9sVmFsdWUsIHJlbGF0aXZlUGF0aCksIFwiMVwiKVxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIGNvbnN0YW50KG9GaWVsZENvbnRyb2xWYWx1ZSA9PT0gXCJDb21tb24uRmllbGRDb250cm9sVHlwZS9SZWFkT25seVwiKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gY2hlY2sgaWYgdGhlIHByb3BlcnR5IGlzIGRpc2FibGVkIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1RhcmdldCBUaGUgdGFyZ2V0IHByb3BlcnR5IG9yIERhdGFGaWVsZFxuICogQHBhcmFtIHJlbGF0aXZlUGF0aCBBcnJheSBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgcG9pbnRpbmcgdG8gdGhlIGxvY2F0aW9uIG9mIGZpZWxkIGNvbnRyb2wgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gcmVzb2x2aW5nIHRvIGEgQm9vbGVhbiBiZWluZyB0cnVlIGlmIGl0J3MgZGlzYWJsZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGlzRGlzYWJsZWRFeHByZXNzaW9uID0gZnVuY3Rpb24gKG9UYXJnZXQ6IFByb3BlcnR5LCByZWxhdGl2ZVBhdGg/OiBzdHJpbmdbXSk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IG9GaWVsZENvbnRyb2xWYWx1ZSA9IG9UYXJnZXQ/LmFubm90YXRpb25zPy5Db21tb24/LkZpZWxkQ29udHJvbD8udmFsdWVPZigpO1xuXHRpZiAodHlwZW9mIG9GaWVsZENvbnRyb2xWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAhIW9GaWVsZENvbnRyb2xWYWx1ZSkge1xuXHRcdHJldHVybiBvcihcblx0XHRcdGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRmllbGRDb250cm9sVmFsdWUsIHJlbGF0aXZlUGF0aCksIDApLFxuXHRcdFx0ZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9GaWVsZENvbnRyb2xWYWx1ZSwgcmVsYXRpdmVQYXRoKSwgXCIwXCIpXG5cdFx0KTtcblx0fVxuXHRyZXR1cm4gY29uc3RhbnQob0ZpZWxkQ29udHJvbFZhbHVlID09PSBcIkNvbW1vbi5GaWVsZENvbnRyb2xUeXBlL0luYXBwbGljYWJsZVwiKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gY2hlY2sgaWYgdGhlIHByb3BlcnR5IGlzIGVkaXRhYmxlIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1RhcmdldCBUaGUgdGFyZ2V0IHByb3BlcnR5IG9yIERhdGFGaWVsZFxuICogQHBhcmFtIHJlbGF0aXZlUGF0aCBBcnJheSBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgcG9pbnRpbmcgdG8gdGhlIGxvY2F0aW9uIG9mIGZpZWxkIGNvbnRyb2wgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gcmVzb2x2aW5nIHRvIGEgQm9vbGVhbiBiZWluZyB0cnVlIGlmIGl0J3Mgbm90IGVkaXRhYmxlXG4gKi9cbmV4cG9ydCBjb25zdCBpc05vbkVkaXRhYmxlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChvVGFyZ2V0OiBQcm9wZXJ0eSwgcmVsYXRpdmVQYXRoPzogc3RyaW5nW10pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gb3IoaXNSZWFkT25seUV4cHJlc3Npb24ob1RhcmdldCwgcmVsYXRpdmVQYXRoKSwgaXNEaXNhYmxlZEV4cHJlc3Npb24ob1RhcmdldCwgcmVsYXRpdmVQYXRoKSk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGNoZWNrIGlmIHRoZSBwcm9wZXJ0eSBpcyByZWFkIG9ubHkgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvVGFyZ2V0IFRoZSB0YXJnZXQgcHJvcGVydHkgb3IgRGF0YUZpZWxkXG4gKiBAcGFyYW0gcmVsYXRpdmVQYXRoIEFycmF5IG9mIG5hdmlnYXRpb24gcHJvcGVydGllcyBwb2ludGluZyB0byB0aGUgbG9jYXRpb24gb2YgZmllbGQgY29udHJvbCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiByZXNvbHZpbmcgdG8gYSBCb29sZWFuIGJlaW5nIHRydWUgaWYgaXQncyByZWFkIG9ubHlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzUmVxdWlyZWRFeHByZXNzaW9uID0gZnVuY3Rpb24gKG9UYXJnZXQ6IFByb3BlcnR5LCByZWxhdGl2ZVBhdGg/OiBzdHJpbmdbXSk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IG9GaWVsZENvbnRyb2xWYWx1ZSA9IG9UYXJnZXQ/LmFubm90YXRpb25zPy5Db21tb24/LkZpZWxkQ29udHJvbD8udmFsdWVPZigpO1xuXHRpZiAodHlwZW9mIG9GaWVsZENvbnRyb2xWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAhIW9GaWVsZENvbnRyb2xWYWx1ZSkge1xuXHRcdHJldHVybiBvcihcblx0XHRcdGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRmllbGRDb250cm9sVmFsdWUsIHJlbGF0aXZlUGF0aCksIDcpLFxuXHRcdFx0ZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9GaWVsZENvbnRyb2xWYWx1ZSwgcmVsYXRpdmVQYXRoKSwgXCI3XCIpXG5cdFx0KTtcblx0fVxuXHRyZXR1cm4gY29uc3RhbnQob0ZpZWxkQ29udHJvbFZhbHVlID09PSBcIkNvbW1vbi5GaWVsZENvbnRyb2xUeXBlL01hbmRhdG9yeVwiKTtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztFQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sSUFBTUEsb0JBQW9CLEdBQUcsVUFBVUMsT0FBNkIsRUFBRUMsWUFBdUIsRUFBcUM7SUFBQTtJQUN4SSxJQUFNQyxrQkFBa0IsR0FBR0YsT0FBTyxhQUFQQSxPQUFPLCtDQUFQQSxPQUFPLENBQUVHLFdBQVcsa0ZBQXBCLHFCQUFzQkMsTUFBTSxvRkFBNUIsc0JBQThCQyxZQUFZLDJEQUExQyx1QkFBNENDLE9BQU8sRUFBRTtJQUNoRixJQUFJLE9BQU9KLGtCQUFrQixLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUNBLGtCQUFrQixFQUFFO01BQ25FLE9BQU9LLEVBQUUsQ0FDUkMsS0FBSyxDQUFDQywyQkFBMkIsQ0FBQ1Asa0JBQWtCLEVBQUVELFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN2RU8sS0FBSyxDQUFDQywyQkFBMkIsQ0FBQ1Asa0JBQWtCLEVBQUVELFlBQVksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUN6RTtJQUNGO0lBQ0EsT0FBT1MsUUFBUSxDQUFDUixrQkFBa0IsS0FBSyxrQ0FBa0MsQ0FBQztFQUMzRSxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPTyxJQUFNUyxvQkFBb0IsR0FBRyxVQUFVWCxPQUFpQixFQUFFQyxZQUF1QixFQUFxQztJQUFBO0lBQzVILElBQU1DLGtCQUFrQixHQUFHRixPQUFPLGFBQVBBLE9BQU8sZ0RBQVBBLE9BQU8sQ0FBRUcsV0FBVyxtRkFBcEIsc0JBQXNCQyxNQUFNLG1GQUE1QixzQkFBOEJDLFlBQVksMERBQTFDLHNCQUE0Q0MsT0FBTyxFQUFFO0lBQ2hGLElBQUksT0FBT0osa0JBQWtCLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQ0Esa0JBQWtCLEVBQUU7TUFDbkUsT0FBT0ssRUFBRSxDQUNSQyxLQUFLLENBQUNDLDJCQUEyQixDQUFDUCxrQkFBa0IsRUFBRUQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3ZFTyxLQUFLLENBQUNDLDJCQUEyQixDQUFDUCxrQkFBa0IsRUFBRUQsWUFBWSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQ3pFO0lBQ0Y7SUFDQSxPQUFPUyxRQUFRLENBQUNSLGtCQUFrQixLQUFLLHNDQUFzQyxDQUFDO0VBQy9FLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLElBQU1VLHVCQUF1QixHQUFHLFVBQVVaLE9BQWlCLEVBQUVDLFlBQXVCLEVBQXFDO0lBQy9ILE9BQU9NLEVBQUUsQ0FBQ1Isb0JBQW9CLENBQUNDLE9BQU8sRUFBRUMsWUFBWSxDQUFDLEVBQUVVLG9CQUFvQixDQUFDWCxPQUFPLEVBQUVDLFlBQVksQ0FBQyxDQUFDO0VBQ3BHLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLElBQU1ZLG9CQUFvQixHQUFHLFVBQVViLE9BQWlCLEVBQUVDLFlBQXVCLEVBQXFDO0lBQUE7SUFDNUgsSUFBTUMsa0JBQWtCLEdBQUdGLE9BQU8sYUFBUEEsT0FBTyxnREFBUEEsT0FBTyxDQUFFRyxXQUFXLG1GQUFwQixzQkFBc0JDLE1BQU0sbUZBQTVCLHNCQUE4QkMsWUFBWSwwREFBMUMsc0JBQTRDQyxPQUFPLEVBQUU7SUFDaEYsSUFBSSxPQUFPSixrQkFBa0IsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDQSxrQkFBa0IsRUFBRTtNQUNuRSxPQUFPSyxFQUFFLENBQ1JDLEtBQUssQ0FBQ0MsMkJBQTJCLENBQUNQLGtCQUFrQixFQUFFRCxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDdkVPLEtBQUssQ0FBQ0MsMkJBQTJCLENBQUNQLGtCQUFrQixFQUFFRCxZQUFZLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FDekU7SUFDRjtJQUNBLE9BQU9TLFFBQVEsQ0FBQ1Isa0JBQWtCLEtBQUssbUNBQW1DLENBQUM7RUFDNUUsQ0FBQztFQUFDO0VBQUE7QUFBQSJ9