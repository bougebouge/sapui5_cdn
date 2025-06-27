/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated"], function (Log, Condition, ConditionValidated) {
  "use strict";

  var _exports = {};
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var aValidTypes = ["Edm.Boolean", "Edm.Byte", "Edm.Date", "Edm.DateTime", "Edm.DateTimeOffset", "Edm.Decimal", "Edm.Double", "Edm.Float", "Edm.Guid", "Edm.Int16", "Edm.Int32", "Edm.Int64", "Edm.SByte", "Edm.Single", "Edm.String", "Edm.Time", "Edm.TimeOfDay"];
  var oExcludeMap = {
    "Contains": "NotContains",
    "StartsWith": "NotStartsWith",
    "EndsWith": "NotEndsWith",
    "Empty": "NotEmpty",
    "NotEmpty": "Empty",
    "LE": "NOTLE",
    "GE": "NOTGE",
    "LT": "NOTLT",
    "GT": "NOTGT",
    "BT": "NOTBT",
    "NE": "EQ",
    "EQ": "NE"
  };
  function _getDateTimeOffsetCompliantValue(sValue) {
    var oValue;
    if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)) {
      oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)[0];
    } else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)) {
      oValue = "".concat(sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0], "+0000");
    } else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)) {
      oValue = "".concat(sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0], "T00:00:00+0000");
    } else if (sValue.indexOf("Z") === sValue.length - 1) {
      oValue = "".concat(sValue.split("Z")[0], "+0100");
    } else {
      oValue = undefined;
    }
    return oValue;
  }
  _exports._getDateTimeOffsetCompliantValue = _getDateTimeOffsetCompliantValue;
  function _getDateCompliantValue(sValue) {
    return sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/) ? sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0] : sValue.match(/^(\d{8})/) && sValue.match(/^(\d{8})/)[0];
  }

  /**
   * Method to get the compliant value type based on the data type.
   *
   * @param  sValue Raw value
   * @param  sType The property type
   * @returns Value to be propagated to the condition.
   */
  _exports._getDateCompliantValue = _getDateCompliantValue;
  function getTypeCompliantValue(sValue, sType) {
    var oValue;
    if (aValidTypes.indexOf(sType) === -1) {
      return undefined;
    }
    oValue = sValue;
    switch (sType) {
      case "Edm.Boolean":
        if (typeof sValue === "boolean") {
          oValue = sValue;
        } else {
          oValue = sValue === "true" || (sValue === "false" ? false : undefined);
        }
        break;
      case "Edm.Double":
      case "Edm.Single":
        oValue = isNaN(sValue) ? undefined : parseFloat(sValue);
        break;
      case "Edm.Byte":
      case "Edm.Int16":
      case "Edm.Int32":
      case "Edm.SByte":
        oValue = isNaN(sValue) ? undefined : parseInt(sValue, 10);
        break;
      case "Edm.Date":
        oValue = _getDateCompliantValue(sValue);
        break;
      case "Edm.DateTimeOffset":
        oValue = _getDateTimeOffsetCompliantValue(sValue);
        break;
      case "Edm.TimeOfDay":
        oValue = sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/) ? sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0] : undefined;
        break;
      default:
    }
    return oValue === null ? undefined : oValue;
  }

  /**
   * Method to create a condition.
   *
   * @param  sOption Operator to be used.
   * @param  oV1 Lower value
   * @param  oV2 Higher value
   * @param sSign
   * @returns Condition to be created
   */
  _exports.getTypeCompliantValue = getTypeCompliantValue;
  function resolveConditionValues(sOption, oV1, oV2, sSign) {
    var oValue = oV1,
      oValue2,
      sInternalOperation;
    var oCondition = {};
    oCondition.values = [];
    oCondition.isEmpty = null;
    if (oV1 === undefined || oV1 === null) {
      return;
    }
    switch (sOption) {
      case "CP":
        sInternalOperation = "Contains";
        if (oValue) {
          var nIndexOf = oValue.indexOf("*");
          var nLastIndex = oValue.lastIndexOf("*");

          // only when there are '*' at all
          if (nIndexOf > -1) {
            if (nIndexOf === 0 && nLastIndex !== oValue.length - 1) {
              sInternalOperation = "EndsWith";
              oValue = oValue.substring(1, oValue.length);
            } else if (nIndexOf !== 0 && nLastIndex === oValue.length - 1) {
              sInternalOperation = "StartsWith";
              oValue = oValue.substring(0, oValue.length - 1);
            } else {
              oValue = oValue.substring(1, oValue.length - 1);
            }
          } else {
            Log.warning("Contains Option cannot be used without '*'.");
            return;
          }
        }
        break;
      case "EQ":
        sInternalOperation = oV1 === "" ? "Empty" : sOption;
        break;
      case "NE":
        sInternalOperation = oV1 === "" ? "NotEmpty" : sOption;
        break;
      case "BT":
        if (oV2 === undefined || oV2 === null) {
          return;
        }
        oValue2 = oV2;
        sInternalOperation = sOption;
        break;
      case "LE":
      case "GE":
      case "GT":
      case "LT":
        sInternalOperation = sOption;
        break;
      default:
        Log.warning("Selection Option is not supported : '".concat(sOption, "'"));
        return;
    }
    if (sSign === "E") {
      sInternalOperation = oExcludeMap[sInternalOperation];
    }
    oCondition.operator = sInternalOperation;
    if (sInternalOperation !== "Empty") {
      oCondition.values.push(oValue);
      if (oValue2) {
        oCondition.values.push(oValue2);
      }
    }
    return oCondition;
  }

  /* Method to get the Range property from the Selection Option */
  _exports.resolveConditionValues = resolveConditionValues;
  function getRangeProperty(sProperty) {
    return sProperty.indexOf("/") > 0 ? sProperty.split("/")[1] : sProperty;
  }
  _exports.getRangeProperty = getRangeProperty;
  function _buildConditionsFromSelectionRanges(Ranges, oProperty, sPropertyName, getCustomConditions) {
    var aConditions = [];
    Ranges === null || Ranges === void 0 ? void 0 : Ranges.forEach(function (Range) {
      var oCondition = getCustomConditions ? getCustomConditions(Range, oProperty, sPropertyName) : getConditions(Range, oProperty);
      if (oCondition) {
        aConditions.push(oCondition);
      }
    });
    return aConditions;
  }
  function _getProperty(propertyName, metaModel, entitySetPath) {
    var lastSlashIndex = propertyName.lastIndexOf("/");
    var navigationPath = lastSlashIndex > -1 ? propertyName.substring(0, propertyName.lastIndexOf("/") + 1) : "";
    var collection = metaModel.getObject("".concat(entitySetPath, "/").concat(navigationPath));
    return collection === null || collection === void 0 ? void 0 : collection[propertyName.replace(navigationPath, "")];
  }
  function _buildFiltersConditionsFromSelectOption(selectOption, metaModel, entitySetPath, getCustomConditions) {
    var propertyName = selectOption.PropertyName,
      filterConditions = {},
      propertyPath = propertyName.value || propertyName.$PropertyPath,
      Ranges = selectOption.Ranges;
    var targetProperty = _getProperty(propertyPath, metaModel, entitySetPath);
    if (targetProperty) {
      var conditions = _buildConditionsFromSelectionRanges(Ranges, targetProperty, propertyPath, getCustomConditions);
      if (conditions.length) {
        filterConditions[propertyPath] = (filterConditions[propertyPath] || []).concat(conditions);
      }
    }
    return filterConditions;
  }
  function getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, selectionVariant, getCustomConditions) {
    var oFilterConditions = {};
    if (!selectionVariant) {
      return oFilterConditions;
    }
    var aSelectOptions = selectionVariant.SelectOptions,
      aParameters = selectionVariant.Parameters;
    aSelectOptions === null || aSelectOptions === void 0 ? void 0 : aSelectOptions.forEach(function (selectOption) {
      var propertyName = selectOption.PropertyName,
        sPropertyName = propertyName.value || propertyName.$PropertyPath;
      if (Object.keys(oFilterConditions).includes(sPropertyName)) {
        oFilterConditions[sPropertyName] = oFilterConditions[sPropertyName].concat(_buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)[sPropertyName]);
      } else {
        oFilterConditions = _objectSpread(_objectSpread({}, oFilterConditions), _buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions));
      }
    });
    aParameters === null || aParameters === void 0 ? void 0 : aParameters.forEach(function (parameter) {
      var sPropertyPath = parameter.PropertyName.value || parameter.PropertyName.$PropertyPath;
      var oCondition = getCustomConditions ? {
        operator: "EQ",
        value1: parameter.PropertyValue,
        value2: null,
        path: sPropertyPath,
        isParameter: true
      } : {
        operator: "EQ",
        values: [parameter.PropertyValue],
        isEmpty: null,
        validated: ConditionValidated.Validated,
        isParameter: true
      };
      oFilterConditions[sPropertyPath] = [oCondition];
    });
    return oFilterConditions;
  }
  _exports.getFiltersConditionsFromSelectionVariant = getFiltersConditionsFromSelectionVariant;
  function getConditions(Range, oValidProperty) {
    var oCondition;
    var sign = Range.Sign ? getRangeProperty(Range.Sign) : undefined;
    var sOption = Range.Option ? getRangeProperty(Range.Option) : undefined;
    var oValue1 = getTypeCompliantValue(Range.Low, oValidProperty.$Type || oValidProperty.type);
    var oValue2 = Range.High ? getTypeCompliantValue(Range.High, oValidProperty.$Type || oValidProperty.type) : undefined;
    var oConditionValues = resolveConditionValues(sOption, oValue1, oValue2, sign);
    if (oConditionValues) {
      oCondition = Condition.createCondition(oConditionValues.operator, oConditionValues.values, null, null, ConditionValidated.Validated);
    }
    return oCondition;
  }
  _exports.getConditions = getConditions;
  var getDefaultValueFilters = function (oContext, properties) {
    var filterConditions = {};
    var entitySetPath = oContext.getInterface(1).getPath(),
      oMetaModel = oContext.getInterface(1).getModel();
    if (properties) {
      for (var key in properties) {
        var defaultFilterValue = oMetaModel.getObject("".concat(entitySetPath, "/").concat(key, "@com.sap.vocabularies.Common.v1.FilterDefaultValue"));
        if (defaultFilterValue !== undefined) {
          var PropertyName = key;
          filterConditions[PropertyName] = [Condition.createCondition("EQ", [defaultFilterValue], null, null, ConditionValidated.Validated)];
        }
      }
    }
    return filterConditions;
  };
  var getDefaultSemanticDateFilters = function (oContext, properties, defaultSemanticDates) {
    var filterConditions = {};
    var oInterface = oContext.getInterface(1);
    var oMetaModel = oInterface.getModel();
    var sEntityTypePath = oInterface.getPath();
    for (var key in defaultSemanticDates) {
      if (defaultSemanticDates[key][0]) {
        var aPropertyPathParts = key.split("::");
        var sPath = "";
        var iPropertyPathLength = aPropertyPathParts.length;
        var sNavigationPath = aPropertyPathParts.slice(0, aPropertyPathParts.length - 1).join("/");
        var sProperty = aPropertyPathParts[iPropertyPathLength - 1];
        if (sNavigationPath) {
          //Create Proper Condition Path e.g. _Item*/Property or _Item/Property
          var vProperty = oMetaModel.getObject(sEntityTypePath + "/" + sNavigationPath);
          if (vProperty.$kind === "NavigationProperty" && vProperty.$isCollection) {
            sPath += "".concat(sNavigationPath, "*/");
          } else if (vProperty.$kind === "NavigationProperty") {
            sPath += "".concat(sNavigationPath, "/");
          }
        }
        sPath += sProperty;
        var operatorParamsArr = "values" in defaultSemanticDates[key][0] ? defaultSemanticDates[key][0].values : [];
        filterConditions[sPath] = [Condition.createCondition(defaultSemanticDates[key][0].operator, operatorParamsArr, null, null, null)];
      }
    }
    return filterConditions;
  };
  function getEditStatusFilter() {
    var ofilterConditions = {};
    ofilterConditions["$editState"] = [Condition.createCondition("DRAFT_EDIT_STATE", ["ALL"], null, null, ConditionValidated.Validated)];
    return ofilterConditions;
  }
  function getFilterConditions(oContext, filterConditions) {
    var _filterConditions, _filterConditions2;
    var editStateFilter;
    var entitySetPath = oContext.getInterface(1).getPath(),
      oMetaModel = oContext.getInterface(1).getModel(),
      entityTypeAnnotations = oMetaModel.getObject("".concat(entitySetPath, "@")),
      entityTypeProperties = oMetaModel.getObject("".concat(entitySetPath, "/"));
    if (entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] || entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftNode"]) {
      editStateFilter = getEditStatusFilter();
    }
    var selectionVariant = (_filterConditions = filterConditions) === null || _filterConditions === void 0 ? void 0 : _filterConditions.selectionVariant;
    var defaultSemanticDates = ((_filterConditions2 = filterConditions) === null || _filterConditions2 === void 0 ? void 0 : _filterConditions2.defaultSemanticDates) || {};
    var defaultFilters = getDefaultValueFilters(oContext, entityTypeProperties);
    var defaultSemanticDateFilters = getDefaultSemanticDateFilters(oContext, entityTypeProperties, defaultSemanticDates);
    if (selectionVariant) {
      filterConditions = getFiltersConditionsFromSelectionVariant(entitySetPath, oMetaModel, selectionVariant);
    } else if (defaultFilters) {
      filterConditions = defaultFilters;
    }
    if (defaultSemanticDateFilters) {
      // only for semantic date:
      // 1. value from manifest get merged with SV
      // 2. manifest value is given preference when there is same semantic date property in SV and manifest
      filterConditions = _objectSpread(_objectSpread({}, filterConditions), defaultSemanticDateFilters);
    }
    if (editStateFilter) {
      filterConditions = _objectSpread(_objectSpread({}, filterConditions), editStateFilter);
    }
    return Object.keys(filterConditions).length > 0 ? JSON.stringify(filterConditions).replace(/([\{\}])/g, "\\$1") : undefined;
  }
  _exports.getFilterConditions = getFilterConditions;
  getFilterConditions.requiresIContext = true;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhVmFsaWRUeXBlcyIsIm9FeGNsdWRlTWFwIiwiX2dldERhdGVUaW1lT2Zmc2V0Q29tcGxpYW50VmFsdWUiLCJzVmFsdWUiLCJvVmFsdWUiLCJtYXRjaCIsImluZGV4T2YiLCJsZW5ndGgiLCJzcGxpdCIsInVuZGVmaW5lZCIsIl9nZXREYXRlQ29tcGxpYW50VmFsdWUiLCJnZXRUeXBlQ29tcGxpYW50VmFsdWUiLCJzVHlwZSIsImlzTmFOIiwicGFyc2VGbG9hdCIsInBhcnNlSW50IiwicmVzb2x2ZUNvbmRpdGlvblZhbHVlcyIsInNPcHRpb24iLCJvVjEiLCJvVjIiLCJzU2lnbiIsIm9WYWx1ZTIiLCJzSW50ZXJuYWxPcGVyYXRpb24iLCJvQ29uZGl0aW9uIiwidmFsdWVzIiwiaXNFbXB0eSIsIm5JbmRleE9mIiwibkxhc3RJbmRleCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiTG9nIiwid2FybmluZyIsIm9wZXJhdG9yIiwicHVzaCIsImdldFJhbmdlUHJvcGVydHkiLCJzUHJvcGVydHkiLCJfYnVpbGRDb25kaXRpb25zRnJvbVNlbGVjdGlvblJhbmdlcyIsIlJhbmdlcyIsIm9Qcm9wZXJ0eSIsInNQcm9wZXJ0eU5hbWUiLCJnZXRDdXN0b21Db25kaXRpb25zIiwiYUNvbmRpdGlvbnMiLCJmb3JFYWNoIiwiUmFuZ2UiLCJnZXRDb25kaXRpb25zIiwiX2dldFByb3BlcnR5IiwicHJvcGVydHlOYW1lIiwibWV0YU1vZGVsIiwiZW50aXR5U2V0UGF0aCIsImxhc3RTbGFzaEluZGV4IiwibmF2aWdhdGlvblBhdGgiLCJjb2xsZWN0aW9uIiwiZ2V0T2JqZWN0IiwicmVwbGFjZSIsIl9idWlsZEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdE9wdGlvbiIsInNlbGVjdE9wdGlvbiIsIlByb3BlcnR5TmFtZSIsImZpbHRlckNvbmRpdGlvbnMiLCJwcm9wZXJ0eVBhdGgiLCJ2YWx1ZSIsIiRQcm9wZXJ0eVBhdGgiLCJ0YXJnZXRQcm9wZXJ0eSIsImNvbmRpdGlvbnMiLCJjb25jYXQiLCJnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50Iiwic0VudGl0eVNldFBhdGgiLCJvTWV0YU1vZGVsIiwic2VsZWN0aW9uVmFyaWFudCIsIm9GaWx0ZXJDb25kaXRpb25zIiwiYVNlbGVjdE9wdGlvbnMiLCJTZWxlY3RPcHRpb25zIiwiYVBhcmFtZXRlcnMiLCJQYXJhbWV0ZXJzIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwicGFyYW1ldGVyIiwic1Byb3BlcnR5UGF0aCIsInZhbHVlMSIsIlByb3BlcnR5VmFsdWUiLCJ2YWx1ZTIiLCJwYXRoIiwiaXNQYXJhbWV0ZXIiLCJ2YWxpZGF0ZWQiLCJDb25kaXRpb25WYWxpZGF0ZWQiLCJWYWxpZGF0ZWQiLCJvVmFsaWRQcm9wZXJ0eSIsInNpZ24iLCJTaWduIiwiT3B0aW9uIiwib1ZhbHVlMSIsIkxvdyIsIiRUeXBlIiwidHlwZSIsIkhpZ2giLCJvQ29uZGl0aW9uVmFsdWVzIiwiQ29uZGl0aW9uIiwiY3JlYXRlQ29uZGl0aW9uIiwiZ2V0RGVmYXVsdFZhbHVlRmlsdGVycyIsIm9Db250ZXh0IiwicHJvcGVydGllcyIsImdldEludGVyZmFjZSIsImdldFBhdGgiLCJnZXRNb2RlbCIsImtleSIsImRlZmF1bHRGaWx0ZXJWYWx1ZSIsImdldERlZmF1bHRTZW1hbnRpY0RhdGVGaWx0ZXJzIiwiZGVmYXVsdFNlbWFudGljRGF0ZXMiLCJvSW50ZXJmYWNlIiwic0VudGl0eVR5cGVQYXRoIiwiYVByb3BlcnR5UGF0aFBhcnRzIiwic1BhdGgiLCJpUHJvcGVydHlQYXRoTGVuZ3RoIiwic05hdmlnYXRpb25QYXRoIiwic2xpY2UiLCJqb2luIiwidlByb3BlcnR5IiwiJGtpbmQiLCIkaXNDb2xsZWN0aW9uIiwib3BlcmF0b3JQYXJhbXNBcnIiLCJnZXRFZGl0U3RhdHVzRmlsdGVyIiwib2ZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJDb25kaXRpb25zIiwiZWRpdFN0YXRlRmlsdGVyIiwiZW50aXR5VHlwZUFubm90YXRpb25zIiwiZW50aXR5VHlwZVByb3BlcnRpZXMiLCJkZWZhdWx0RmlsdGVycyIsImRlZmF1bHRTZW1hbnRpY0RhdGVGaWx0ZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsInJlcXVpcmVzSUNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFNlbGVjdGlvblJhbmdlVHlwZVR5cGVzLCBTZWxlY3Rpb25WYXJpYW50VHlwZVR5cGVzLCBTZWxlY3RPcHRpb25UeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb24gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IENvbmRpdGlvblZhbGlkYXRlZCBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0NvbmRpdGlvblZhbGlkYXRlZFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuZXhwb3J0IHR5cGUgRmlsdGVyQ29uZGl0aW9ucyA9IHtcblx0b3BlcmF0b3I6IHN0cmluZztcblx0dmFsdWVzOiBBcnJheTxzdHJpbmc+O1xuXHRpc0VtcHR5PzogYm9vbGVhbiB8IG51bGw7XG5cdHZhbGlkYXRlZD86IHN0cmluZztcbn07XG5cbmNvbnN0IGFWYWxpZFR5cGVzID0gW1xuXHRcIkVkbS5Cb29sZWFuXCIsXG5cdFwiRWRtLkJ5dGVcIixcblx0XCJFZG0uRGF0ZVwiLFxuXHRcIkVkbS5EYXRlVGltZVwiLFxuXHRcIkVkbS5EYXRlVGltZU9mZnNldFwiLFxuXHRcIkVkbS5EZWNpbWFsXCIsXG5cdFwiRWRtLkRvdWJsZVwiLFxuXHRcIkVkbS5GbG9hdFwiLFxuXHRcIkVkbS5HdWlkXCIsXG5cdFwiRWRtLkludDE2XCIsXG5cdFwiRWRtLkludDMyXCIsXG5cdFwiRWRtLkludDY0XCIsXG5cdFwiRWRtLlNCeXRlXCIsXG5cdFwiRWRtLlNpbmdsZVwiLFxuXHRcIkVkbS5TdHJpbmdcIixcblx0XCJFZG0uVGltZVwiLFxuXHRcIkVkbS5UaW1lT2ZEYXlcIlxuXTtcblxuY29uc3Qgb0V4Y2x1ZGVNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG5cdFwiQ29udGFpbnNcIjogXCJOb3RDb250YWluc1wiLFxuXHRcIlN0YXJ0c1dpdGhcIjogXCJOb3RTdGFydHNXaXRoXCIsXG5cdFwiRW5kc1dpdGhcIjogXCJOb3RFbmRzV2l0aFwiLFxuXHRcIkVtcHR5XCI6IFwiTm90RW1wdHlcIixcblx0XCJOb3RFbXB0eVwiOiBcIkVtcHR5XCIsXG5cdFwiTEVcIjogXCJOT1RMRVwiLFxuXHRcIkdFXCI6IFwiTk9UR0VcIixcblx0XCJMVFwiOiBcIk5PVExUXCIsXG5cdFwiR1RcIjogXCJOT1RHVFwiLFxuXHRcIkJUXCI6IFwiTk9UQlRcIixcblx0XCJORVwiOiBcIkVRXCIsXG5cdFwiRVFcIjogXCJORVwiXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gX2dldERhdGVUaW1lT2Zmc2V0Q29tcGxpYW50VmFsdWUoc1ZhbHVlOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRsZXQgb1ZhbHVlO1xuXHRpZiAoc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pVChcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pXFwrKFxcZHsxLDR9KS8pKSB7XG5cdFx0b1ZhbHVlID0gc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pVChcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pXFwrKFxcZHsxLDR9KS8pWzBdO1xuXHR9IGVsc2UgaWYgKHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KVQoXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KS8pKSB7XG5cdFx0b1ZhbHVlID0gYCR7c1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pVChcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pLylbMF19KzAwMDBgO1xuXHR9IGVsc2UgaWYgKHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KS8pKSB7XG5cdFx0b1ZhbHVlID0gYCR7c1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pLylbMF19VDAwOjAwOjAwKzAwMDBgO1xuXHR9IGVsc2UgaWYgKHNWYWx1ZS5pbmRleE9mKFwiWlwiKSA9PT0gc1ZhbHVlLmxlbmd0aCAtIDEpIHtcblx0XHRvVmFsdWUgPSBgJHtzVmFsdWUuc3BsaXQoXCJaXCIpWzBdfSswMTAwYDtcblx0fSBlbHNlIHtcblx0XHRvVmFsdWUgPSB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIG9WYWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9nZXREYXRlQ29tcGxpYW50VmFsdWUoc1ZhbHVlOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pLylcblx0XHQ/IHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KS8pWzBdXG5cdFx0OiBzVmFsdWUubWF0Y2goL14oXFxkezh9KS8pICYmIHNWYWx1ZS5tYXRjaCgvXihcXGR7OH0pLylbMF07XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGdldCB0aGUgY29tcGxpYW50IHZhbHVlIHR5cGUgYmFzZWQgb24gdGhlIGRhdGEgdHlwZS5cbiAqXG4gKiBAcGFyYW0gIHNWYWx1ZSBSYXcgdmFsdWVcbiAqIEBwYXJhbSAgc1R5cGUgVGhlIHByb3BlcnR5IHR5cGVcbiAqIEByZXR1cm5zIFZhbHVlIHRvIGJlIHByb3BhZ2F0ZWQgdG8gdGhlIGNvbmRpdGlvbi5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZUNvbXBsaWFudFZhbHVlKHNWYWx1ZTogYW55LCBzVHlwZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IG9WYWx1ZTtcblx0aWYgKGFWYWxpZFR5cGVzLmluZGV4T2Yoc1R5cGUpID09PSAtMSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0b1ZhbHVlID0gc1ZhbHVlO1xuXHRzd2l0Y2ggKHNUeXBlKSB7XG5cdFx0Y2FzZSBcIkVkbS5Cb29sZWFuXCI6XG5cdFx0XHRpZiAodHlwZW9mIHNWYWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0b1ZhbHVlID0gc1ZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1ZhbHVlID0gc1ZhbHVlID09PSBcInRydWVcIiB8fCAoc1ZhbHVlID09PSBcImZhbHNlXCIgPyBmYWxzZSA6IHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRWRtLkRvdWJsZVwiOlxuXHRcdGNhc2UgXCJFZG0uU2luZ2xlXCI6XG5cdFx0XHRvVmFsdWUgPSBpc05hTihzVmFsdWUpID8gdW5kZWZpbmVkIDogcGFyc2VGbG9hdChzVmFsdWUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkVkbS5CeXRlXCI6XG5cdFx0Y2FzZSBcIkVkbS5JbnQxNlwiOlxuXHRcdGNhc2UgXCJFZG0uSW50MzJcIjpcblx0XHRjYXNlIFwiRWRtLlNCeXRlXCI6XG5cdFx0XHRvVmFsdWUgPSBpc05hTihzVmFsdWUpID8gdW5kZWZpbmVkIDogcGFyc2VJbnQoc1ZhbHVlLCAxMCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRWRtLkRhdGVcIjpcblx0XHRcdG9WYWx1ZSA9IF9nZXREYXRlQ29tcGxpYW50VmFsdWUoc1ZhbHVlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjpcblx0XHRcdG9WYWx1ZSA9IF9nZXREYXRlVGltZU9mZnNldENvbXBsaWFudFZhbHVlKHNWYWx1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRWRtLlRpbWVPZkRheVwiOlxuXHRcdFx0b1ZhbHVlID0gc1ZhbHVlLm1hdGNoKC8oXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KS8pID8gc1ZhbHVlLm1hdGNoKC8oXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KS8pWzBdIDogdW5kZWZpbmVkO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0fVxuXG5cdHJldHVybiBvVmFsdWUgPT09IG51bGwgPyB1bmRlZmluZWQgOiBvVmFsdWU7XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGNyZWF0ZSBhIGNvbmRpdGlvbi5cbiAqXG4gKiBAcGFyYW0gIHNPcHRpb24gT3BlcmF0b3IgdG8gYmUgdXNlZC5cbiAqIEBwYXJhbSAgb1YxIExvd2VyIHZhbHVlXG4gKiBAcGFyYW0gIG9WMiBIaWdoZXIgdmFsdWVcbiAqIEBwYXJhbSBzU2lnblxuICogQHJldHVybnMgQ29uZGl0aW9uIHRvIGJlIGNyZWF0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVDb25kaXRpb25WYWx1ZXMoc09wdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkLCBvVjE6IGFueSwgb1YyOiBhbnksIHNTaWduOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0bGV0IG9WYWx1ZSA9IG9WMSxcblx0XHRvVmFsdWUyLFxuXHRcdHNJbnRlcm5hbE9wZXJhdGlvbjogYW55O1xuXHRjb25zdCBvQ29uZGl0aW9uOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+ID0ge307XG5cdG9Db25kaXRpb24udmFsdWVzID0gW107XG5cdG9Db25kaXRpb24uaXNFbXB0eSA9IG51bGwgYXMgYW55O1xuXHRpZiAob1YxID09PSB1bmRlZmluZWQgfHwgb1YxID09PSBudWxsKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0c3dpdGNoIChzT3B0aW9uKSB7XG5cdFx0Y2FzZSBcIkNQXCI6XG5cdFx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBcIkNvbnRhaW5zXCI7XG5cdFx0XHRpZiAob1ZhbHVlKSB7XG5cdFx0XHRcdGNvbnN0IG5JbmRleE9mID0gb1ZhbHVlLmluZGV4T2YoXCIqXCIpO1xuXHRcdFx0XHRjb25zdCBuTGFzdEluZGV4ID0gb1ZhbHVlLmxhc3RJbmRleE9mKFwiKlwiKTtcblxuXHRcdFx0XHQvLyBvbmx5IHdoZW4gdGhlcmUgYXJlICcqJyBhdCBhbGxcblx0XHRcdFx0aWYgKG5JbmRleE9mID4gLTEpIHtcblx0XHRcdFx0XHRpZiAobkluZGV4T2YgPT09IDAgJiYgbkxhc3RJbmRleCAhPT0gb1ZhbHVlLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0XHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IFwiRW5kc1dpdGhcIjtcblx0XHRcdFx0XHRcdG9WYWx1ZSA9IG9WYWx1ZS5zdWJzdHJpbmcoMSwgb1ZhbHVlLmxlbmd0aCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChuSW5kZXhPZiAhPT0gMCAmJiBuTGFzdEluZGV4ID09PSBvVmFsdWUubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gXCJTdGFydHNXaXRoXCI7XG5cdFx0XHRcdFx0XHRvVmFsdWUgPSBvVmFsdWUuc3Vic3RyaW5nKDAsIG9WYWx1ZS5sZW5ndGggLSAxKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b1ZhbHVlID0gb1ZhbHVlLnN1YnN0cmluZygxLCBvVmFsdWUubGVuZ3RoIC0gMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdExvZy53YXJuaW5nKFwiQ29udGFpbnMgT3B0aW9uIGNhbm5vdCBiZSB1c2VkIHdpdGhvdXQgJyonLlwiKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJFUVwiOlxuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gb1YxID09PSBcIlwiID8gXCJFbXB0eVwiIDogc09wdGlvbjtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJORVwiOlxuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gb1YxID09PSBcIlwiID8gXCJOb3RFbXB0eVwiIDogc09wdGlvbjtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJCVFwiOlxuXHRcdFx0aWYgKG9WMiA9PT0gdW5kZWZpbmVkIHx8IG9WMiA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRvVmFsdWUyID0gb1YyO1xuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gc09wdGlvbjtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJMRVwiOlxuXHRcdGNhc2UgXCJHRVwiOlxuXHRcdGNhc2UgXCJHVFwiOlxuXHRcdGNhc2UgXCJMVFwiOlxuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gc09wdGlvbjtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRMb2cud2FybmluZyhgU2VsZWN0aW9uIE9wdGlvbiBpcyBub3Qgc3VwcG9ydGVkIDogJyR7c09wdGlvbn0nYCk7XG5cdFx0XHRyZXR1cm47XG5cdH1cblx0aWYgKHNTaWduID09PSBcIkVcIikge1xuXHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IG9FeGNsdWRlTWFwW3NJbnRlcm5hbE9wZXJhdGlvbl07XG5cdH1cblx0b0NvbmRpdGlvbi5vcGVyYXRvciA9IHNJbnRlcm5hbE9wZXJhdGlvbjtcblx0aWYgKHNJbnRlcm5hbE9wZXJhdGlvbiAhPT0gXCJFbXB0eVwiKSB7XG5cdFx0b0NvbmRpdGlvbi52YWx1ZXMucHVzaChvVmFsdWUpO1xuXHRcdGlmIChvVmFsdWUyKSB7XG5cdFx0XHRvQ29uZGl0aW9uLnZhbHVlcy5wdXNoKG9WYWx1ZTIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb0NvbmRpdGlvbjtcbn1cblxuLyogTWV0aG9kIHRvIGdldCB0aGUgUmFuZ2UgcHJvcGVydHkgZnJvbSB0aGUgU2VsZWN0aW9uIE9wdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlUHJvcGVydHkoc1Byb3BlcnR5OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gc1Byb3BlcnR5LmluZGV4T2YoXCIvXCIpID4gMCA/IHNQcm9wZXJ0eS5zcGxpdChcIi9cIilbMV0gOiBzUHJvcGVydHk7XG59XG5cbmZ1bmN0aW9uIF9idWlsZENvbmRpdGlvbnNGcm9tU2VsZWN0aW9uUmFuZ2VzKFxuXHRSYW5nZXM6IFNlbGVjdGlvblJhbmdlVHlwZVR5cGVzW10sXG5cdG9Qcm9wZXJ0eTogUmVjb3JkPHN0cmluZywgb2JqZWN0Pixcblx0c1Byb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRnZXRDdXN0b21Db25kaXRpb25zPzogRnVuY3Rpb25cbik6IGFueVtdIHtcblx0Y29uc3QgYUNvbmRpdGlvbnM6IGFueVtdID0gW107XG5cdFJhbmdlcz8uZm9yRWFjaCgoUmFuZ2U6IGFueSkgPT4ge1xuXHRcdGNvbnN0IG9Db25kaXRpb24gPSBnZXRDdXN0b21Db25kaXRpb25zID8gZ2V0Q3VzdG9tQ29uZGl0aW9ucyhSYW5nZSwgb1Byb3BlcnR5LCBzUHJvcGVydHlOYW1lKSA6IGdldENvbmRpdGlvbnMoUmFuZ2UsIG9Qcm9wZXJ0eSk7XG5cdFx0aWYgKG9Db25kaXRpb24pIHtcblx0XHRcdGFDb25kaXRpb25zLnB1c2gob0NvbmRpdGlvbik7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGFDb25kaXRpb25zO1xufVxuXG5mdW5jdGlvbiBfZ2V0UHJvcGVydHkocHJvcGVydHlOYW1lOiBzdHJpbmcsIG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIGVudGl0eVNldFBhdGg6IHN0cmluZyk6IFJlY29yZDxzdHJpbmcsIG9iamVjdD4ge1xuXHRjb25zdCBsYXN0U2xhc2hJbmRleCA9IHByb3BlcnR5TmFtZS5sYXN0SW5kZXhPZihcIi9cIik7XG5cdGNvbnN0IG5hdmlnYXRpb25QYXRoID0gbGFzdFNsYXNoSW5kZXggPiAtMSA/IHByb3BlcnR5TmFtZS5zdWJzdHJpbmcoMCwgcHJvcGVydHlOYW1lLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpIDogXCJcIjtcblx0Y29uc3QgY29sbGVjdGlvbiA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH0vJHtuYXZpZ2F0aW9uUGF0aH1gKTtcblx0cmV0dXJuIGNvbGxlY3Rpb24/Lltwcm9wZXJ0eU5hbWUucmVwbGFjZShuYXZpZ2F0aW9uUGF0aCwgXCJcIildO1xufVxuXG5mdW5jdGlvbiBfYnVpbGRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3RPcHRpb24oXG5cdHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSxcblx0bWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0ZW50aXR5U2V0UGF0aDogc3RyaW5nLFxuXHRnZXRDdXN0b21Db25kaXRpb25zPzogRnVuY3Rpb25cbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRjb25zdCBwcm9wZXJ0eU5hbWU6IGFueSA9IHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUsXG5cdFx0ZmlsdGVyQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiA9IHt9LFxuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nID0gcHJvcGVydHlOYW1lLnZhbHVlIHx8IHByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoLFxuXHRcdFJhbmdlczogU2VsZWN0aW9uUmFuZ2VUeXBlVHlwZXNbXSA9IHNlbGVjdE9wdGlvbi5SYW5nZXM7XG5cdGNvbnN0IHRhcmdldFByb3BlcnR5ID0gX2dldFByb3BlcnR5KHByb3BlcnR5UGF0aCwgbWV0YU1vZGVsLCBlbnRpdHlTZXRQYXRoKTtcblx0aWYgKHRhcmdldFByb3BlcnR5KSB7XG5cdFx0Y29uc3QgY29uZGl0aW9uczogYW55W10gPSBfYnVpbGRDb25kaXRpb25zRnJvbVNlbGVjdGlvblJhbmdlcyhSYW5nZXMsIHRhcmdldFByb3BlcnR5LCBwcm9wZXJ0eVBhdGgsIGdldEN1c3RvbUNvbmRpdGlvbnMpO1xuXHRcdGlmIChjb25kaXRpb25zLmxlbmd0aCkge1xuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1twcm9wZXJ0eVBhdGhdID0gKGZpbHRlckNvbmRpdGlvbnNbcHJvcGVydHlQYXRoXSB8fCBbXSkuY29uY2F0KGNvbmRpdGlvbnMpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmlsdGVyQ29uZGl0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdGlvblZhcmlhbnQoXG5cdHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRzZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50VHlwZVR5cGVzLFxuXHRnZXRDdXN0b21Db25kaXRpb25zPzogRnVuY3Rpb25cbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRsZXQgb0ZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0aWYgKCFzZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0cmV0dXJuIG9GaWx0ZXJDb25kaXRpb25zO1xuXHR9XG5cdGNvbnN0IGFTZWxlY3RPcHRpb25zID0gc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zLFxuXHRcdGFQYXJhbWV0ZXJzID0gc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzO1xuXHRhU2VsZWN0T3B0aW9ucz8uZm9yRWFjaCgoc2VsZWN0T3B0aW9uOiBTZWxlY3RPcHRpb25UeXBlKSA9PiB7XG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lOiBhbnkgPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lLFxuXHRcdFx0c1Byb3BlcnR5TmFtZTogc3RyaW5nID0gcHJvcGVydHlOYW1lLnZhbHVlIHx8IHByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoO1xuXHRcdGlmIChPYmplY3Qua2V5cyhvRmlsdGVyQ29uZGl0aW9ucykuaW5jbHVkZXMoc1Byb3BlcnR5TmFtZSkpIHtcblx0XHRcdG9GaWx0ZXJDb25kaXRpb25zW3NQcm9wZXJ0eU5hbWVdID0gb0ZpbHRlckNvbmRpdGlvbnNbc1Byb3BlcnR5TmFtZV0uY29uY2F0KFxuXHRcdFx0XHRfYnVpbGRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3RPcHRpb24oc2VsZWN0T3B0aW9uLCBvTWV0YU1vZGVsLCBzRW50aXR5U2V0UGF0aCwgZ2V0Q3VzdG9tQ29uZGl0aW9ucylbc1Byb3BlcnR5TmFtZV1cblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9GaWx0ZXJDb25kaXRpb25zID0ge1xuXHRcdFx0XHQuLi5vRmlsdGVyQ29uZGl0aW9ucyxcblx0XHRcdFx0Li4uX2J1aWxkRmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0T3B0aW9uKHNlbGVjdE9wdGlvbiwgb01ldGFNb2RlbCwgc0VudGl0eVNldFBhdGgsIGdldEN1c3RvbUNvbmRpdGlvbnMpXG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG5cdGFQYXJhbWV0ZXJzPy5mb3JFYWNoKChwYXJhbWV0ZXI6IGFueSkgPT4ge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBwYXJhbWV0ZXIuUHJvcGVydHlOYW1lLnZhbHVlIHx8IHBhcmFtZXRlci5Qcm9wZXJ0eU5hbWUuJFByb3BlcnR5UGF0aDtcblx0XHRjb25zdCBvQ29uZGl0aW9uOiBhbnkgPSBnZXRDdXN0b21Db25kaXRpb25zXG5cdFx0XHQ/IHsgb3BlcmF0b3I6IFwiRVFcIiwgdmFsdWUxOiBwYXJhbWV0ZXIuUHJvcGVydHlWYWx1ZSwgdmFsdWUyOiBudWxsLCBwYXRoOiBzUHJvcGVydHlQYXRoLCBpc1BhcmFtZXRlcjogdHJ1ZSB9XG5cdFx0XHQ6IHtcblx0XHRcdFx0XHRvcGVyYXRvcjogXCJFUVwiLFxuXHRcdFx0XHRcdHZhbHVlczogW3BhcmFtZXRlci5Qcm9wZXJ0eVZhbHVlXSxcblx0XHRcdFx0XHRpc0VtcHR5OiBudWxsLFxuXHRcdFx0XHRcdHZhbGlkYXRlZDogQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZCxcblx0XHRcdFx0XHRpc1BhcmFtZXRlcjogdHJ1ZVxuXHRcdFx0ICB9O1xuXHRcdG9GaWx0ZXJDb25kaXRpb25zW3NQcm9wZXJ0eVBhdGhdID0gW29Db25kaXRpb25dO1xuXHR9KTtcblxuXHRyZXR1cm4gb0ZpbHRlckNvbmRpdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25kaXRpb25zKFJhbmdlOiBhbnksIG9WYWxpZFByb3BlcnR5OiBhbnkpOiBDb25kaXRpb25PYmplY3QgfCB1bmRlZmluZWQge1xuXHRsZXQgb0NvbmRpdGlvbjtcblx0Y29uc3Qgc2lnbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gUmFuZ2UuU2lnbiA/IGdldFJhbmdlUHJvcGVydHkoUmFuZ2UuU2lnbikgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IHNPcHRpb246IHN0cmluZyB8IHVuZGVmaW5lZCA9IFJhbmdlLk9wdGlvbiA/IGdldFJhbmdlUHJvcGVydHkoUmFuZ2UuT3B0aW9uKSA6IHVuZGVmaW5lZDtcblx0Y29uc3Qgb1ZhbHVlMTogYW55ID0gZ2V0VHlwZUNvbXBsaWFudFZhbHVlKFJhbmdlLkxvdywgb1ZhbGlkUHJvcGVydHkuJFR5cGUgfHwgb1ZhbGlkUHJvcGVydHkudHlwZSk7XG5cdGNvbnN0IG9WYWx1ZTI6IGFueSA9IFJhbmdlLkhpZ2ggPyBnZXRUeXBlQ29tcGxpYW50VmFsdWUoUmFuZ2UuSGlnaCwgb1ZhbGlkUHJvcGVydHkuJFR5cGUgfHwgb1ZhbGlkUHJvcGVydHkudHlwZSkgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IG9Db25kaXRpb25WYWx1ZXMgPSByZXNvbHZlQ29uZGl0aW9uVmFsdWVzKHNPcHRpb24sIG9WYWx1ZTEsIG9WYWx1ZTIsIHNpZ24pIGFzIGFueTtcblx0aWYgKG9Db25kaXRpb25WYWx1ZXMpIHtcblx0XHRvQ29uZGl0aW9uID0gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcblx0XHRcdG9Db25kaXRpb25WYWx1ZXMub3BlcmF0b3IsXG5cdFx0XHRvQ29uZGl0aW9uVmFsdWVzLnZhbHVlcyxcblx0XHRcdG51bGwsXG5cdFx0XHRudWxsLFxuXHRcdFx0Q29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZFxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIG9Db25kaXRpb247XG59XG5cbmNvbnN0IGdldERlZmF1bHRWYWx1ZUZpbHRlcnMgPSBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSwgcHJvcGVydGllczogYW55KTogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiB7XG5cdGNvbnN0IGZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0Y29uc3QgZW50aXR5U2V0UGF0aCA9IG9Db250ZXh0LmdldEludGVyZmFjZSgxKS5nZXRQYXRoKCksXG5cdFx0b01ldGFNb2RlbCA9IG9Db250ZXh0LmdldEludGVyZmFjZSgxKS5nZXRNb2RlbCgpO1xuXHRpZiAocHJvcGVydGllcykge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIHByb3BlcnRpZXMpIHtcblx0XHRcdGNvbnN0IGRlZmF1bHRGaWx0ZXJWYWx1ZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9LyR7a2V5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmlsdGVyRGVmYXVsdFZhbHVlYCk7XG5cdFx0XHRpZiAoZGVmYXVsdEZpbHRlclZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y29uc3QgUHJvcGVydHlOYW1lID0ga2V5O1xuXHRcdFx0XHRmaWx0ZXJDb25kaXRpb25zW1Byb3BlcnR5TmFtZV0gPSBbXG5cdFx0XHRcdFx0Q29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcIkVRXCIsIFtkZWZhdWx0RmlsdGVyVmFsdWVdLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKSBhcyBGaWx0ZXJDb25kaXRpb25zXG5cdFx0XHRcdF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmaWx0ZXJDb25kaXRpb25zO1xufTtcblxuY29uc3QgZ2V0RGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMgPSBmdW5jdGlvbiAoXG5cdG9Db250ZXh0OiBhbnksXG5cdHByb3BlcnRpZXM6IGFueSxcblx0ZGVmYXVsdFNlbWFudGljRGF0ZXM6IGFueVxuKTogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiB7XG5cdGNvbnN0IGZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0Y29uc3Qgb0ludGVyZmFjZSA9IG9Db250ZXh0LmdldEludGVyZmFjZSgxKTtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoID0gb0ludGVyZmFjZS5nZXRQYXRoKCk7XG5cdGZvciAoY29uc3Qga2V5IGluIGRlZmF1bHRTZW1hbnRpY0RhdGVzKSB7XG5cdFx0aWYgKGRlZmF1bHRTZW1hbnRpY0RhdGVzW2tleV1bMF0pIHtcblx0XHRcdGNvbnN0IGFQcm9wZXJ0eVBhdGhQYXJ0cyA9IGtleS5zcGxpdChcIjo6XCIpO1xuXHRcdFx0bGV0IHNQYXRoID0gXCJcIjtcblx0XHRcdGNvbnN0IGlQcm9wZXJ0eVBhdGhMZW5ndGggPSBhUHJvcGVydHlQYXRoUGFydHMubGVuZ3RoO1xuXHRcdFx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID0gYVByb3BlcnR5UGF0aFBhcnRzLnNsaWNlKDAsIGFQcm9wZXJ0eVBhdGhQYXJ0cy5sZW5ndGggLSAxKS5qb2luKFwiL1wiKTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IGFQcm9wZXJ0eVBhdGhQYXJ0c1tpUHJvcGVydHlQYXRoTGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAoc05hdmlnYXRpb25QYXRoKSB7XG5cdFx0XHRcdC8vQ3JlYXRlIFByb3BlciBDb25kaXRpb24gUGF0aCBlLmcuIF9JdGVtKi9Qcm9wZXJ0eSBvciBfSXRlbS9Qcm9wZXJ0eVxuXHRcdFx0XHRjb25zdCB2UHJvcGVydHkgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzRW50aXR5VHlwZVBhdGggKyBcIi9cIiArIHNOYXZpZ2F0aW9uUGF0aCk7XG5cdFx0XHRcdGlmICh2UHJvcGVydHkuJGtpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIgJiYgdlByb3BlcnR5LiRpc0NvbGxlY3Rpb24pIHtcblx0XHRcdFx0XHRzUGF0aCArPSBgJHtzTmF2aWdhdGlvblBhdGh9Ki9gO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHZQcm9wZXJ0eS4ka2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdHNQYXRoICs9IGAke3NOYXZpZ2F0aW9uUGF0aH0vYDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0c1BhdGggKz0gc1Byb3BlcnR5O1xuXHRcdFx0Y29uc3Qgb3BlcmF0b3JQYXJhbXNBcnIgPSBcInZhbHVlc1wiIGluIGRlZmF1bHRTZW1hbnRpY0RhdGVzW2tleV1bMF0gPyBkZWZhdWx0U2VtYW50aWNEYXRlc1trZXldWzBdLnZhbHVlcyA6IFtdO1xuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1tzUGF0aF0gPSBbXG5cdFx0XHRcdENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oZGVmYXVsdFNlbWFudGljRGF0ZXNba2V5XVswXS5vcGVyYXRvciwgb3BlcmF0b3JQYXJhbXNBcnIsIG51bGwsIG51bGwsIG51bGwpIGFzIEZpbHRlckNvbmRpdGlvbnNcblx0XHRcdF07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmaWx0ZXJDb25kaXRpb25zO1xufTtcblxuZnVuY3Rpb24gZ2V0RWRpdFN0YXR1c0ZpbHRlcigpOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+IHtcblx0Y29uc3Qgb2ZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0b2ZpbHRlckNvbmRpdGlvbnNbXCIkZWRpdFN0YXRlXCJdID0gW1xuXHRcdENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oXCJEUkFGVF9FRElUX1NUQVRFXCIsIFtcIkFMTFwiXSwgbnVsbCwgbnVsbCwgQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZCkgYXMgRmlsdGVyQ29uZGl0aW9uc1xuXHRdO1xuXHRyZXR1cm4gb2ZpbHRlckNvbmRpdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWx0ZXJDb25kaXRpb25zKG9Db250ZXh0OiBhbnksIGZpbHRlckNvbmRpdGlvbnM6IGFueSk6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRsZXQgZWRpdFN0YXRlRmlsdGVyO1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDEpLmdldFBhdGgoKSxcblx0XHRvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDEpLmdldE1vZGVsKCksXG5cdFx0ZW50aXR5VHlwZUFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH1AYCksXG5cdFx0ZW50aXR5VHlwZVByb3BlcnRpZXMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofS9gKTtcblx0aWYgKFxuXHRcdGVudGl0eVR5cGVBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdIHx8XG5cdFx0ZW50aXR5VHlwZUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVcIl1cblx0KSB7XG5cdFx0ZWRpdFN0YXRlRmlsdGVyID0gZ2V0RWRpdFN0YXR1c0ZpbHRlcigpO1xuXHR9XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBmaWx0ZXJDb25kaXRpb25zPy5zZWxlY3Rpb25WYXJpYW50O1xuXHRjb25zdCBkZWZhdWx0U2VtYW50aWNEYXRlcyA9IGZpbHRlckNvbmRpdGlvbnM/LmRlZmF1bHRTZW1hbnRpY0RhdGVzIHx8IHt9O1xuXHRjb25zdCBkZWZhdWx0RmlsdGVycyA9IGdldERlZmF1bHRWYWx1ZUZpbHRlcnMob0NvbnRleHQsIGVudGl0eVR5cGVQcm9wZXJ0aWVzKTtcblx0Y29uc3QgZGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMgPSBnZXREZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyhvQ29udGV4dCwgZW50aXR5VHlwZVByb3BlcnRpZXMsIGRlZmF1bHRTZW1hbnRpY0RhdGVzKTtcblx0aWYgKHNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRmaWx0ZXJDb25kaXRpb25zID0gZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudChlbnRpdHlTZXRQYXRoLCBvTWV0YU1vZGVsLCBzZWxlY3Rpb25WYXJpYW50KTtcblx0fSBlbHNlIGlmIChkZWZhdWx0RmlsdGVycykge1xuXHRcdGZpbHRlckNvbmRpdGlvbnMgPSBkZWZhdWx0RmlsdGVycztcblx0fVxuXHRpZiAoZGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMpIHtcblx0XHQvLyBvbmx5IGZvciBzZW1hbnRpYyBkYXRlOlxuXHRcdC8vIDEuIHZhbHVlIGZyb20gbWFuaWZlc3QgZ2V0IG1lcmdlZCB3aXRoIFNWXG5cdFx0Ly8gMi4gbWFuaWZlc3QgdmFsdWUgaXMgZ2l2ZW4gcHJlZmVyZW5jZSB3aGVuIHRoZXJlIGlzIHNhbWUgc2VtYW50aWMgZGF0ZSBwcm9wZXJ0eSBpbiBTViBhbmQgbWFuaWZlc3Rcblx0XHRmaWx0ZXJDb25kaXRpb25zID0geyAuLi5maWx0ZXJDb25kaXRpb25zLCAuLi5kZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyB9O1xuXHR9XG5cdGlmIChlZGl0U3RhdGVGaWx0ZXIpIHtcblx0XHRmaWx0ZXJDb25kaXRpb25zID0geyAuLi5maWx0ZXJDb25kaXRpb25zLCAuLi5lZGl0U3RhdGVGaWx0ZXIgfTtcblx0fVxuXHRyZXR1cm4gKE9iamVjdC5rZXlzKGZpbHRlckNvbmRpdGlvbnMpLmxlbmd0aCA+IDAgPyBKU09OLnN0cmluZ2lmeShmaWx0ZXJDb25kaXRpb25zKS5yZXBsYWNlKC8oW1xce1xcfV0pL2csIFwiXFxcXCQxXCIpIDogdW5kZWZpbmVkKSBhcyBhbnk7XG59XG5cbmdldEZpbHRlckNvbmRpdGlvbnMucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7RUFhQSxJQUFNQSxXQUFXLEdBQUcsQ0FDbkIsYUFBYSxFQUNiLFVBQVUsRUFDVixVQUFVLEVBQ1YsY0FBYyxFQUNkLG9CQUFvQixFQUNwQixhQUFhLEVBQ2IsWUFBWSxFQUNaLFdBQVcsRUFDWCxVQUFVLEVBQ1YsV0FBVyxFQUNYLFdBQVcsRUFDWCxXQUFXLEVBQ1gsV0FBVyxFQUNYLFlBQVksRUFDWixZQUFZLEVBQ1osVUFBVSxFQUNWLGVBQWUsQ0FDZjtFQUVELElBQU1DLFdBQWdDLEdBQUc7SUFDeEMsVUFBVSxFQUFFLGFBQWE7SUFDekIsWUFBWSxFQUFFLGVBQWU7SUFDN0IsVUFBVSxFQUFFLGFBQWE7SUFDekIsT0FBTyxFQUFFLFVBQVU7SUFDbkIsVUFBVSxFQUFFLE9BQU87SUFDbkIsSUFBSSxFQUFFLE9BQU87SUFDYixJQUFJLEVBQUUsT0FBTztJQUNiLElBQUksRUFBRSxPQUFPO0lBQ2IsSUFBSSxFQUFFLE9BQU87SUFDYixJQUFJLEVBQUUsT0FBTztJQUNiLElBQUksRUFBRSxJQUFJO0lBQ1YsSUFBSSxFQUFFO0VBQ1AsQ0FBQztFQUVNLFNBQVNDLGdDQUFnQyxDQUFDQyxNQUFXLEVBQXNCO0lBQ2pGLElBQUlDLE1BQU07SUFDVixJQUFJRCxNQUFNLENBQUNFLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxF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