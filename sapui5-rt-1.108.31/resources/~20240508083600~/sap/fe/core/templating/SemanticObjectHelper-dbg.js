/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Get the path of the semantic Object if it is a dynamic SemanticObject.
   *
   * @param semanticObject The value of the Common.SemanticObject annotation.
   * @returns  The path of the semantic Object if it is a dynamic SemanticObject null otherwise.
   */
  var getDynamicPathFromSemanticObject = function (semanticObject) {
    var dynamicSemObjectRegex = semanticObject === null || semanticObject === void 0 ? void 0 : semanticObject.match(/{(.*?)}/);
    if (dynamicSemObjectRegex !== null && dynamicSemObjectRegex !== void 0 && dynamicSemObjectRegex.length && dynamicSemObjectRegex.length > 1) {
      return dynamicSemObjectRegex[1];
    }
    return null;
  };

  /**
   * Check whether a property or a NavigationProperty has a semantic object defined or not.
   *
   * @param property The target property
   * @returns `true` if it has a semantic object
   */
  _exports.getDynamicPathFromSemanticObject = getDynamicPathFromSemanticObject;
  var hasSemanticObject = function (property) {
    var _property$annotations;
    var _propertyCommonAnnotations = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : _property$annotations.Common;
    if (_propertyCommonAnnotations) {
      for (var _key in _propertyCommonAnnotations) {
        var _propertyCommonAnnota;
        if (((_propertyCommonAnnota = _propertyCommonAnnotations[_key]) === null || _propertyCommonAnnota === void 0 ? void 0 : _propertyCommonAnnota.term) === "com.sap.vocabularies.Common.v1.SemanticObject") {
          return true;
        }
      }
    }
    return false;
  };
  _exports.hasSemanticObject = hasSemanticObject;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCIsInNlbWFudGljT2JqZWN0IiwiZHluYW1pY1NlbU9iamVjdFJlZ2V4IiwibWF0Y2giLCJsZW5ndGgiLCJoYXNTZW1hbnRpY09iamVjdCIsInByb3BlcnR5IiwiX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsImtleSIsInRlcm0iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNlbWFudGljT2JqZWN0SGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5hdmlnYXRpb25Qcm9wZXJ0eSwgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5cbi8qKlxuICogR2V0IHRoZSBwYXRoIG9mIHRoZSBzZW1hbnRpYyBPYmplY3QgaWYgaXQgaXMgYSBkeW5hbWljIFNlbWFudGljT2JqZWN0LlxuICpcbiAqIEBwYXJhbSBzZW1hbnRpY09iamVjdCBUaGUgdmFsdWUgb2YgdGhlIENvbW1vbi5TZW1hbnRpY09iamVjdCBhbm5vdGF0aW9uLlxuICogQHJldHVybnMgIFRoZSBwYXRoIG9mIHRoZSBzZW1hbnRpYyBPYmplY3QgaWYgaXQgaXMgYSBkeW5hbWljIFNlbWFudGljT2JqZWN0IG51bGwgb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgY29uc3QgZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QgPSAoc2VtYW50aWNPYmplY3Q6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgfCBudWxsID0+IHtcblx0Y29uc3QgZHluYW1pY1NlbU9iamVjdFJlZ2V4ID0gc2VtYW50aWNPYmplY3Q/Lm1hdGNoKC97KC4qPyl9Lyk7XG5cdGlmIChkeW5hbWljU2VtT2JqZWN0UmVnZXg/Lmxlbmd0aCAmJiBkeW5hbWljU2VtT2JqZWN0UmVnZXgubGVuZ3RoID4gMSkge1xuXHRcdHJldHVybiBkeW5hbWljU2VtT2JqZWN0UmVnZXhbMV07XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBwcm9wZXJ0eSBvciBhIE5hdmlnYXRpb25Qcm9wZXJ0eSBoYXMgYSBzZW1hbnRpYyBvYmplY3QgZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSBzZW1hbnRpYyBvYmplY3RcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc1NlbWFudGljT2JqZWN0ID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRjb25zdCBfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9ucyA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24gYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSB8IHVuZGVmaW5lZDtcblx0aWYgKF9wcm9wZXJ0eUNvbW1vbkFubm90YXRpb25zKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMpIHtcblx0XHRcdGlmIChfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9uc1trZXldPy50ZXJtID09PSBDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sSUFBTUEsZ0NBQWdDLEdBQUcsVUFBQ0MsY0FBNkIsRUFBb0I7SUFDakcsSUFBTUMscUJBQXFCLEdBQUdELGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFRSxLQUFLLENBQUMsU0FBUyxDQUFDO0lBQzlELElBQUlELHFCQUFxQixhQUFyQkEscUJBQXFCLGVBQXJCQSxxQkFBcUIsQ0FBRUUsTUFBTSxJQUFJRixxQkFBcUIsQ0FBQ0UsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUN0RSxPQUFPRixxQkFBcUIsQ0FBQyxDQUFDLENBQUM7SUFDaEM7SUFDQSxPQUFPLElBQUk7RUFDWixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sSUFBTUcsaUJBQWlCLEdBQUcsVUFBVUMsUUFBdUMsRUFBVztJQUFBO0lBQzVGLElBQU1DLDBCQUEwQiw0QkFBR0QsUUFBUSxDQUFDRSxXQUFXLDBEQUFwQixzQkFBc0JDLE1BQTRDO0lBQ3JHLElBQUlGLDBCQUEwQixFQUFFO01BQy9CLEtBQUssSUFBTUcsSUFBRyxJQUFJSCwwQkFBMEIsRUFBRTtRQUFBO1FBQzdDLElBQUksMEJBQUFBLDBCQUEwQixDQUFDRyxJQUFHLENBQUMsMERBQS9CLHNCQUFpQ0MsSUFBSSxxREFBeUMsRUFBRTtVQUNuRixPQUFPLElBQUk7UUFDWjtNQUNEO0lBQ0Q7SUFDQSxPQUFPLEtBQUs7RUFDYixDQUFDO0VBQUM7RUFBQTtBQUFBIn0=