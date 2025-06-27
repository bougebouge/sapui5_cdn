/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  function getRangeDefinition(range, propertyType) {
    var operator;
    var bInclude = range.Sign !== "UI.SelectionRangeSignType/E" ? true : false;
    switch (range.Option) {
      case "UI.SelectionRangeOptionType/BT":
        operator = bInclude ? "BT" : "NB";
        break;
      case "UI.SelectionRangeOptionType/CP":
        operator = bInclude ? "Contains" : "NotContains";
        break;
      case "UI.SelectionRangeOptionType/EQ":
        operator = bInclude ? "EQ" : "NE";
        break;
      case "UI.SelectionRangeOptionType/GE":
        operator = bInclude ? "GE" : "LT";
        break;
      case "UI.SelectionRangeOptionType/GT":
        operator = bInclude ? "GT" : "LE";
        break;
      case "UI.SelectionRangeOptionType/LE":
        operator = bInclude ? "LE" : "GT";
        break;
      case "UI.SelectionRangeOptionType/LT":
        operator = bInclude ? "LT" : "GE";
        break;
      case "UI.SelectionRangeOptionType/NB":
        operator = bInclude ? "NB" : "BT";
        break;
      case "UI.SelectionRangeOptionType/NE":
        operator = bInclude ? "NE" : "EQ";
        break;
      case "UI.SelectionRangeOptionType/NP":
        operator = bInclude ? "NotContains" : "Contains";
        break;
      default:
        operator = "EQ";
    }
    return {
      operator: operator,
      rangeLow: propertyType && propertyType.indexOf("Edm.Date") === 0 ? new Date(range.Low) : range.Low,
      rangeHigh: range.High && propertyType && propertyType.indexOf("Edm.Date") === 0 ? new Date(range.High) : range.High
    };
  }

  /**
   * Parses a SelectionVariant annotations and creates the corresponding filter definitions.
   *
   * @param selectionVariant SelectionVariant annotation
   * @returns Returns an array of filter definitions corresponding to the SelectionVariant.
   */
  _exports.getRangeDefinition = getRangeDefinition;
  function getFilterDefinitionsFromSelectionVariant(selectionVariant) {
    var aFilterDefs = [];
    if (selectionVariant.SelectOptions) {
      selectionVariant.SelectOptions.forEach(function (selectOption) {
        if (selectOption.PropertyName && selectOption.Ranges.length > 0) {
          aFilterDefs.push({
            propertyPath: selectOption.PropertyName.value,
            propertyType: selectOption.PropertyName.$target.type,
            ranges: selectOption.Ranges.map(function (range) {
              var _selectOption$Propert;
              return getRangeDefinition(range, (_selectOption$Propert = selectOption.PropertyName) === null || _selectOption$Propert === void 0 ? void 0 : _selectOption$Propert.$target.type);
            })
          });
        }
      });
    }
    return aFilterDefs;
  }
  _exports.getFilterDefinitionsFromSelectionVariant = getFilterDefinitionsFromSelectionVariant;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRSYW5nZURlZmluaXRpb24iLCJyYW5nZSIsInByb3BlcnR5VHlwZSIsIm9wZXJhdG9yIiwiYkluY2x1ZGUiLCJTaWduIiwiT3B0aW9uIiwicmFuZ2VMb3ciLCJpbmRleE9mIiwiRGF0ZSIsIkxvdyIsInJhbmdlSGlnaCIsIkhpZ2giLCJnZXRGaWx0ZXJEZWZpbml0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50Iiwic2VsZWN0aW9uVmFyaWFudCIsImFGaWx0ZXJEZWZzIiwiU2VsZWN0T3B0aW9ucyIsImZvckVhY2giLCJzZWxlY3RPcHRpb24iLCJQcm9wZXJ0eU5hbWUiLCJSYW5nZXMiLCJsZW5ndGgiLCJwdXNoIiwicHJvcGVydHlQYXRoIiwidmFsdWUiLCIkdGFyZ2V0IiwidHlwZSIsInJhbmdlcyIsIm1hcCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2VsZWN0aW9uVmFyaWFudEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFNlbGVjdGlvblJhbmdlVHlwZSwgU2VsZWN0aW9uVmFyaWFudFR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5cbmV4cG9ydCB0eXBlIFJhbmdlRGVmaW5pdGlvbiA9IHtcblx0b3BlcmF0b3I6IHN0cmluZztcblx0cmFuZ2VMb3c6IGFueTtcblx0cmFuZ2VIaWdoPzogYW55O1xufTtcblxuZXhwb3J0IHR5cGUgRmlsdGVyRGVmaW5pdGlvbiA9IHtcblx0cHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdHByb3BlcnR5VHlwZTogc3RyaW5nO1xuXHRyYW5nZXM6IFJhbmdlRGVmaW5pdGlvbltdO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlRGVmaW5pdGlvbihyYW5nZTogU2VsZWN0aW9uUmFuZ2VUeXBlLCBwcm9wZXJ0eVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFJhbmdlRGVmaW5pdGlvbiB7XG5cdGxldCBvcGVyYXRvcjogU3RyaW5nO1xuXHRjb25zdCBiSW5jbHVkZSA9IHJhbmdlLlNpZ24gIT09IFwiVUkuU2VsZWN0aW9uUmFuZ2VTaWduVHlwZS9FXCIgPyB0cnVlIDogZmFsc2U7XG5cblx0c3dpdGNoIChyYW5nZS5PcHRpb24gYXMgc3RyaW5nKSB7XG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9CVFwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiQlRcIiA6IFwiTkJcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9DUFwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiQ29udGFpbnNcIiA6IFwiTm90Q29udGFpbnNcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9FUVwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiRVFcIiA6IFwiTkVcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9HRVwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiR0VcIiA6IFwiTFRcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9HVFwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiR1RcIiA6IFwiTEVcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9MRVwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiTEVcIiA6IFwiR1RcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9MVFwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiTFRcIiA6IFwiR0VcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9OQlwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiTkJcIiA6IFwiQlRcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9ORVwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiTkVcIiA6IFwiRVFcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcIlVJLlNlbGVjdGlvblJhbmdlT3B0aW9uVHlwZS9OUFwiOlxuXHRcdFx0b3BlcmF0b3IgPSBiSW5jbHVkZSA/IFwiTm90Q29udGFpbnNcIiA6IFwiQ29udGFpbnNcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdG9wZXJhdG9yID0gXCJFUVwiO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRvcGVyYXRvcjogb3BlcmF0b3IgYXMgc3RyaW5nLFxuXHRcdHJhbmdlTG93OiBwcm9wZXJ0eVR5cGUgJiYgcHJvcGVydHlUeXBlLmluZGV4T2YoXCJFZG0uRGF0ZVwiKSA9PT0gMCA/IG5ldyBEYXRlKHJhbmdlLkxvdykgOiByYW5nZS5Mb3csXG5cdFx0cmFuZ2VIaWdoOiByYW5nZS5IaWdoICYmIHByb3BlcnR5VHlwZSAmJiBwcm9wZXJ0eVR5cGUuaW5kZXhPZihcIkVkbS5EYXRlXCIpID09PSAwID8gbmV3IERhdGUocmFuZ2UuSGlnaCkgOiByYW5nZS5IaWdoXG5cdH07XG59XG5cbi8qKlxuICogUGFyc2VzIGEgU2VsZWN0aW9uVmFyaWFudCBhbm5vdGF0aW9ucyBhbmQgY3JlYXRlcyB0aGUgY29ycmVzcG9uZGluZyBmaWx0ZXIgZGVmaW5pdGlvbnMuXG4gKlxuICogQHBhcmFtIHNlbGVjdGlvblZhcmlhbnQgU2VsZWN0aW9uVmFyaWFudCBhbm5vdGF0aW9uXG4gKiBAcmV0dXJucyBSZXR1cm5zIGFuIGFycmF5IG9mIGZpbHRlciBkZWZpbml0aW9ucyBjb3JyZXNwb25kaW5nIHRvIHRoZSBTZWxlY3Rpb25WYXJpYW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsdGVyRGVmaW5pdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudChzZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50VHlwZSk6IEZpbHRlckRlZmluaXRpb25bXSB7XG5cdGNvbnN0IGFGaWx0ZXJEZWZzOiBGaWx0ZXJEZWZpbml0aW9uW10gPSBbXTtcblxuXHRpZiAoc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zKSB7XG5cdFx0c2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zLmZvckVhY2goKHNlbGVjdE9wdGlvbikgPT4ge1xuXHRcdFx0aWYgKHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUgJiYgc2VsZWN0T3B0aW9uLlJhbmdlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGFGaWx0ZXJEZWZzLnB1c2goe1xuXHRcdFx0XHRcdHByb3BlcnR5UGF0aDogc2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZS52YWx1ZSxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGU6IHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUuJHRhcmdldC50eXBlLFxuXHRcdFx0XHRcdHJhbmdlczogc2VsZWN0T3B0aW9uLlJhbmdlcy5tYXAoKHJhbmdlKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZ2V0UmFuZ2VEZWZpbml0aW9uKHJhbmdlLCBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lPy4kdGFyZ2V0LnR5cGUpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIGFGaWx0ZXJEZWZzO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWNPLFNBQVNBLGtCQUFrQixDQUFDQyxLQUF5QixFQUFFQyxZQUFnQyxFQUFtQjtJQUNoSCxJQUFJQyxRQUFnQjtJQUNwQixJQUFNQyxRQUFRLEdBQUdILEtBQUssQ0FBQ0ksSUFBSSxL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