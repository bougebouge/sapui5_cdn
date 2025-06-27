/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/templating/PropertyHelper"], function (PropertyHelper) {
  "use strict";

  var _exports = {};
  var isPropertyPathExpression = PropertyHelper.isPropertyPathExpression;
  var isPathExpression = PropertyHelper.isPathExpression;
  var EDM_TYPE_MAPPING = {
    "Edm.Boolean": {
      type: "sap.ui.model.odata.type.Boolean"
    },
    "Edm.Byte": {
      type: "sap.ui.model.odata.type.Byte"
    },
    "Edm.Date": {
      type: "sap.ui.model.odata.type.Date"
    },
    "Edm.DateTimeOffset": {
      constraints: {
        "$Precision": "precision",
        "$V4": "V4"
      },
      type: "sap.ui.model.odata.type.DateTimeOffset"
    },
    "Edm.Decimal": {
      constraints: {
        "@Org.OData.Validation.V1.Minimum/$Decimal": "minimum",
        "@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive": "minimumExclusive",
        "@Org.OData.Validation.V1.Maximum/$Decimal": "maximum",
        "@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive": "maximumExclusive",
        "$Precision": "precision",
        "$Scale": "scale"
      },
      type: "sap.ui.model.odata.type.Decimal"
    },
    "Edm.Double": {
      type: "sap.ui.model.odata.type.Double"
    },
    "Edm.Guid": {
      type: "sap.ui.model.odata.type.Guid"
    },
    "Edm.Int16": {
      type: "sap.ui.model.odata.type.Int16"
    },
    "Edm.Int32": {
      type: "sap.ui.model.odata.type.Int32"
    },
    "Edm.Int64": {
      type: "sap.ui.model.odata.type.Int64"
    },
    "Edm.SByte": {
      type: "sap.ui.model.odata.type.SByte"
    },
    "Edm.Single": {
      type: "sap.ui.model.odata.type.Single"
    },
    "Edm.Stream": {
      type: "sap.ui.model.odata.type.Stream"
    },
    "Edm.Binary": {
      type: "sap.ui.model.odata.type.Stream"
    },
    "Edm.String": {
      constraints: {
        "@com.sap.vocabularies.Common.v1.IsDigitSequence": "isDigitSequence",
        "$MaxLength": "maxLength",
        "$Nullable": "nullable"
      },
      type: "sap.ui.model.odata.type.String"
    },
    "Edm.TimeOfDay": {
      constraints: {
        "$Precision": "precision"
      },
      type: "sap.ui.model.odata.type.TimeOfDay"
    }
  };
  _exports.EDM_TYPE_MAPPING = EDM_TYPE_MAPPING;
  var ODATA_TYPE_MAPPING = {
    "sap.ui.model.odata.type.Boolean": "Edm.Boolean",
    "sap.ui.model.odata.type.Byte": "Edm.Byte",
    "sap.ui.model.odata.type.Date": "Edm.Date",
    "sap.ui.model.odata.type.DateTimeOffset": "Edm.DateTimeOffset",
    "sap.ui.model.odata.type.Decimal": "Edm.Decimal",
    "sap.ui.model.odata.type.Double": "Edm.Double",
    "sap.ui.model.odata.type.Guid": "Edm.Guid",
    "sap.ui.model.odata.type.Int16": "Edm.Int16",
    "sap.ui.model.odata.type.Int32": "Edm.Int32",
    "sap.ui.model.odata.type.Int64": "Edm.Int64",
    "sap.ui.model.odata.type.SByte": "Edm.SByte",
    "sap.ui.model.odata.type.Single": "Edm.Single",
    "sap.ui.model.odata.type.Stream": "Edm.Stream",
    "sap.ui.model.odata.type.TimeOfDay": "Edm.TimeOfDay",
    "sap.ui.model.odata.type.String": "Edm.String"
  };
  _exports.ODATA_TYPE_MAPPING = ODATA_TYPE_MAPPING;
  var getDisplayMode = function (oPropertyPath, oDataModelObjectPath) {
    var _oProperty$annotation, _oProperty$annotation2, _oTextAnnotation$anno, _oTextAnnotation$anno2, _oTextAnnotation$anno3, _oEntityType$annotati, _oEntityType$annotati2, _oEntityType$annotati3, _oEntityType$annotati4, _oEntityType$annotati5, _oEntityType$annotati6;
    if (!oPropertyPath || typeof oPropertyPath === "string") {
      return "Value";
    }
    var oProperty = (isPathExpression(oPropertyPath) || isPropertyPathExpression(oPropertyPath)) && oPropertyPath.$target || oPropertyPath;
    var oEntityType = oDataModelObjectPath && oDataModelObjectPath.targetEntityType;
    var oTextAnnotation = (_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Common) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Text;
    var oTextArrangementAnnotation = typeof oTextAnnotation !== "string" && (oTextAnnotation === null || oTextAnnotation === void 0 ? void 0 : (_oTextAnnotation$anno = oTextAnnotation.annotations) === null || _oTextAnnotation$anno === void 0 ? void 0 : (_oTextAnnotation$anno2 = _oTextAnnotation$anno.UI) === null || _oTextAnnotation$anno2 === void 0 ? void 0 : (_oTextAnnotation$anno3 = _oTextAnnotation$anno2.TextArrangement) === null || _oTextAnnotation$anno3 === void 0 ? void 0 : _oTextAnnotation$anno3.toString()) || (oEntityType === null || oEntityType === void 0 ? void 0 : (_oEntityType$annotati = oEntityType.annotations) === null || _oEntityType$annotati === void 0 ? void 0 : (_oEntityType$annotati2 = _oEntityType$annotati.UI) === null || _oEntityType$annotati2 === void 0 ? void 0 : (_oEntityType$annotati3 = _oEntityType$annotati2.TextArrangement) === null || _oEntityType$annotati3 === void 0 ? void 0 : _oEntityType$annotati3.toString());
    var sDisplayValue = oTextAnnotation ? "DescriptionValue" : "Value";
    if (oTextAnnotation && oTextArrangementAnnotation || oEntityType !== null && oEntityType !== void 0 && (_oEntityType$annotati4 = oEntityType.annotations) !== null && _oEntityType$annotati4 !== void 0 && (_oEntityType$annotati5 = _oEntityType$annotati4.UI) !== null && _oEntityType$annotati5 !== void 0 && (_oEntityType$annotati6 = _oEntityType$annotati5.TextArrangement) !== null && _oEntityType$annotati6 !== void 0 && _oEntityType$annotati6.toString()) {
      if (oTextArrangementAnnotation === "UI.TextArrangementType/TextOnly") {
        sDisplayValue = "Description";
      } else if (oTextArrangementAnnotation === "UI.TextArrangementType/TextLast") {
        sDisplayValue = "ValueDescription";
      } else if (oTextArrangementAnnotation === "UI.TextArrangementType/TextSeparate") {
        sDisplayValue = "Value";
      } else {
        //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
        sDisplayValue = "DescriptionValue";
      }
    }
    return sDisplayValue;
  };
  _exports.getDisplayMode = getDisplayMode;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFRE1fVFlQRV9NQVBQSU5HIiwidHlwZSIsImNvbnN0cmFpbnRzIiwiT0RBVEFfVFlQRV9NQVBQSU5HIiwiZ2V0RGlzcGxheU1vZGUiLCJvUHJvcGVydHlQYXRoIiwib0RhdGFNb2RlbE9iamVjdFBhdGgiLCJvUHJvcGVydHkiLCJpc1BhdGhFeHByZXNzaW9uIiwiaXNQcm9wZXJ0eVBhdGhFeHByZXNzaW9uIiwiJHRhcmdldCIsIm9FbnRpdHlUeXBlIiwidGFyZ2V0RW50aXR5VHlwZSIsIm9UZXh0QW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsIm9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uIiwiVUkiLCJUZXh0QXJyYW5nZW1lbnQiLCJ0b1N0cmluZyIsInNEaXNwbGF5VmFsdWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRpc3BsYXlNb2RlRm9ybWF0dGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU2VwYXJhdGluZyB0aGVzZSBtZXRob2RzIGZyb20gdGhlIFVJRm9ybWF0dGVycyBhcyB0aGV5IGFyZSB1c2VkIGFsc28gaW4gdGhlIGNvbnZlcnRlci5cbiAqIFRoZXNlIG1ldGhvZHMgbXVzdCBOT1QgdXNlIGFueSBkZXBlbmRlbmN5IGZyb20gdGhlIFNBUCBVSTUgcnVudGltZS5cbiAqIFdoZW4gY29uc3VtZWQgb3V0c2lkZSBvZiBjb252ZXJ0ZXJzLCB5b3Ugc2hvdWxkIGNhbGwgdGhlbSB2aWEgVUlGb3JtYXR0ZXJzLlxuICovXG5cbmltcG9ydCB0eXBlIHsgUGF0aEFubm90YXRpb25FeHByZXNzaW9uLCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgaXNQYXRoRXhwcmVzc2lvbiwgaXNQcm9wZXJ0eVBhdGhFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcblxuZXhwb3J0IHR5cGUgUHJvcGVydHlPclBhdGg8UD4gPSBzdHJpbmcgfCBQIHwgUGF0aEFubm90YXRpb25FeHByZXNzaW9uPFA+O1xuXG5leHBvcnQgY29uc3QgRURNX1RZUEVfTUFQUElORzogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcblx0XCJFZG0uQm9vbGVhblwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuQm9vbGVhblwiIH0sXG5cdFwiRWRtLkJ5dGVcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkJ5dGVcIiB9LFxuXHRcIkVkbS5EYXRlXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlXCIgfSxcblx0XCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjoge1xuXHRcdGNvbnN0cmFpbnRzOiB7XG5cdFx0XHRcIiRQcmVjaXNpb25cIjogXCJwcmVjaXNpb25cIixcblx0XHRcdFwiJFY0XCI6IFwiVjRcIlxuXHRcdH0sXG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlVGltZU9mZnNldFwiXG5cdH0sXG5cdFwiRWRtLkRlY2ltYWxcIjoge1xuXHRcdGNvbnN0cmFpbnRzOiB7XG5cdFx0XHRcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5pbXVtLyREZWNpbWFsXCI6IFwibWluaW11bVwiLFxuXHRcdFx0XCJAT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWluaW11bUBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5FeGNsdXNpdmVcIjogXCJtaW5pbXVtRXhjbHVzaXZlXCIsXG5cdFx0XHRcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhpbXVtLyREZWNpbWFsXCI6IFwibWF4aW11bVwiLFxuXHRcdFx0XCJAT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWF4aW11bUBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5FeGNsdXNpdmVcIjogXCJtYXhpbXVtRXhjbHVzaXZlXCIsXG5cdFx0XHRcIiRQcmVjaXNpb25cIjogXCJwcmVjaXNpb25cIixcblx0XHRcdFwiJFNjYWxlXCI6IFwic2NhbGVcIlxuXHRcdH0sXG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EZWNpbWFsXCJcblx0fSxcblx0XCJFZG0uRG91YmxlXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5Eb3VibGVcIiB9LFxuXHRcIkVkbS5HdWlkXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5HdWlkXCIgfSxcblx0XCJFZG0uSW50MTZcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludDE2XCIgfSxcblx0XCJFZG0uSW50MzJcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludDMyXCIgfSxcblx0XCJFZG0uSW50NjRcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludDY0XCIgfSxcblx0XCJFZG0uU0J5dGVcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlNCeXRlXCIgfSxcblx0XCJFZG0uU2luZ2xlXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TaW5nbGVcIiB9LFxuXHRcIkVkbS5TdHJlYW1cIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmVhbVwiIH0sXG5cdFwiRWRtLkJpbmFyeVwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyZWFtXCIgfSxcblx0XCJFZG0uU3RyaW5nXCI6IHtcblx0XHRjb25zdHJhaW50czoge1xuXHRcdFx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRGlnaXRTZXF1ZW5jZVwiOiBcImlzRGlnaXRTZXF1ZW5jZVwiLFxuXHRcdFx0XCIkTWF4TGVuZ3RoXCI6IFwibWF4TGVuZ3RoXCIsXG5cdFx0XHRcIiROdWxsYWJsZVwiOiBcIm51bGxhYmxlXCJcblx0XHR9LFxuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCJcblx0fSxcblx0XCJFZG0uVGltZU9mRGF5XCI6IHtcblx0XHRjb25zdHJhaW50czoge1xuXHRcdFx0XCIkUHJlY2lzaW9uXCI6IFwicHJlY2lzaW9uXCJcblx0XHR9LFxuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuVGltZU9mRGF5XCJcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IE9EQVRBX1RZUEVfTUFQUElORzogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcblx0XCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5Cb29sZWFuXCI6IFwiRWRtLkJvb2xlYW5cIixcblx0XCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5CeXRlXCI6IFwiRWRtLkJ5dGVcIixcblx0XCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlXCI6IFwiRWRtLkRhdGVcIixcblx0XCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlVGltZU9mZnNldFwiOiBcIkVkbS5EYXRlVGltZU9mZnNldFwiLFxuXHRcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRlY2ltYWxcIjogXCJFZG0uRGVjaW1hbFwiLFxuXHRcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRvdWJsZVwiOiBcIkVkbS5Eb3VibGVcIixcblx0XCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5HdWlkXCI6IFwiRWRtLkd1aWRcIixcblx0XCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnQxNlwiOiBcIkVkbS5JbnQxNlwiLFxuXHRcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludDMyXCI6IFwiRWRtLkludDMyXCIsXG5cdFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuSW50NjRcIjogXCJFZG0uSW50NjRcIixcblx0XCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TQnl0ZVwiOiBcIkVkbS5TQnl0ZVwiLFxuXHRcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlNpbmdsZVwiOiBcIkVkbS5TaW5nbGVcIixcblx0XCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJlYW1cIjogXCJFZG0uU3RyZWFtXCIsXG5cdFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuVGltZU9mRGF5XCI6IFwiRWRtLlRpbWVPZkRheVwiLFxuXHRcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiOiBcIkVkbS5TdHJpbmdcIlxufTtcblxuZXhwb3J0IHR5cGUgRGlzcGxheU1vZGUgPSBcIlZhbHVlXCIgfCBcIkRlc2NyaXB0aW9uXCIgfCBcIkRlc2NyaXB0aW9uVmFsdWVcIiB8IFwiVmFsdWVEZXNjcmlwdGlvblwiO1xuZXhwb3J0IGNvbnN0IGdldERpc3BsYXlNb2RlID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eVBhdGg6IFByb3BlcnR5T3JQYXRoPFByb3BlcnR5Piwgb0RhdGFNb2RlbE9iamVjdFBhdGg/OiBEYXRhTW9kZWxPYmplY3RQYXRoKTogRGlzcGxheU1vZGUge1xuXHRpZiAoIW9Qcm9wZXJ0eVBhdGggfHwgdHlwZW9mIG9Qcm9wZXJ0eVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRyZXR1cm4gXCJWYWx1ZVwiO1xuXHR9XG5cdGNvbnN0IG9Qcm9wZXJ0eSA9XG5cdFx0KChpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eVBhdGgpIHx8IGlzUHJvcGVydHlQYXRoRXhwcmVzc2lvbihvUHJvcGVydHlQYXRoKSkgJiYgKG9Qcm9wZXJ0eVBhdGguJHRhcmdldCBhcyBQcm9wZXJ0eSkpIHx8XG5cdFx0KG9Qcm9wZXJ0eVBhdGggYXMgUHJvcGVydHkpO1xuXHRjb25zdCBvRW50aXR5VHlwZSA9IG9EYXRhTW9kZWxPYmplY3RQYXRoICYmIG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVR5cGU7XG5cdGNvbnN0IG9UZXh0QW5ub3RhdGlvbiA9IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0O1xuXHRjb25zdCBvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9XG5cdFx0KHR5cGVvZiBvVGV4dEFubm90YXRpb24gIT09IFwic3RyaW5nXCIgJiYgb1RleHRBbm5vdGF0aW9uPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudD8udG9TdHJpbmcoKSkgfHxcblx0XHRvRW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQ/LnRvU3RyaW5nKCk7XG5cblx0bGV0IHNEaXNwbGF5VmFsdWUgPSBvVGV4dEFubm90YXRpb24gPyBcIkRlc2NyaXB0aW9uVmFsdWVcIiA6IFwiVmFsdWVcIjtcblx0aWYgKChvVGV4dEFubm90YXRpb24gJiYgb1RleHRBcnJhbmdlbWVudEFubm90YXRpb24pIHx8IG9FbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudD8udG9TdHJpbmcoKSkge1xuXHRcdGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9PT0gXCJVSS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpIHtcblx0XHRcdHNEaXNwbGF5VmFsdWUgPSBcIkRlc2NyaXB0aW9uXCI7XG5cdFx0fSBlbHNlIGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9PT0gXCJVSS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRMYXN0XCIpIHtcblx0XHRcdHNEaXNwbGF5VmFsdWUgPSBcIlZhbHVlRGVzY3JpcHRpb25cIjtcblx0XHR9IGVsc2UgaWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID09PSBcIlVJLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dFNlcGFyYXRlXCIpIHtcblx0XHRcdHNEaXNwbGF5VmFsdWUgPSBcIlZhbHVlXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vRGVmYXVsdCBzaG91bGQgYmUgVGV4dEZpcnN0IGlmIHRoZXJlIGlzIGEgVGV4dCBhbm5vdGF0aW9uIGFuZCBuZWl0aGVyIFRleHRPbmx5IG5vciBUZXh0TGFzdCBhcmUgc2V0XG5cdFx0XHRzRGlzcGxheVZhbHVlID0gXCJEZXNjcmlwdGlvblZhbHVlXCI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBzRGlzcGxheVZhbHVlIGFzIERpc3BsYXlNb2RlO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztFQVlPLElBQU1BLGdCQUFxQyxHQUFHO0lBQ3BELGFBQWEsRUFBRTtNQUFFQyxJQUFJLEVBQUU7SUFBa0MsQ0FBQztJQUMxRCxVQUFVLEVBQUU7TUFBRUEsSUFBSSxFQUFFO0lBQStCLENBQUM7SUFDcEQsVUFBVSxFQUFFO01BQUVBLElBQUksRUFBRTtJQUErQixDQUFDO0lBQ3BELG9CQUFvQixFQUFFO01BQ3JCQyxXQUFXLEVBQUU7UUFDWixZQUFZLEVBQUUsV0FBVztRQUN6QixLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0RELElBQUksRUFBRTtJQUNQLENBQUM7SUFDRCxhQUFhLEVBQUU7TUFDZEMsV0FBVyxFQUFFO1FBQ1osMkNBQTJDLEVBQUUsU0FBUztRQUN0RCxvRUFBb0UsRUFBRSxrQkFBa0I7UUFDeEYsMkNBQTJDLEVBQUUsU0FBUztRQUN0RCxvRUFBb0UsRUFBRSxrQkFBa0I7UUFDeEYsWUFBWSxFQUFFLFdBQVc7UUFDekIsUUFBUSxFQUFFO01BQ1gsQ0FBQztNQUNERCxJQUFJLEVBQUU7SUFDUCxDQUFDO0lBQ0QsWUFBWSxFQUFFO01BQUVBLElBQUksRUFBRTtJQUFpQyxDQUFDO0lBQ3hELFVBQVUsRUFBRTtNQUFFQSxJQUFJLEVBQUU7SUFBK0IsQ0FBQztJQUNwRCxXQUFXLEVBQUU7TUFBRUEsSUFBSSxFQUFFO0lBQWdDLENBQUM7SUFDdEQsV0FBVyxFQUFFO01BQUVBLElBQUksRUFBRTtJQUFnQyxDQUFDO0lBQ3RELFdBQVcsRUFBRTtNQUFFQSxJQUFJLEVBQUU7SUFBZ0MsQ0FBQztJQUN0RCxXQUFXLEVBQUU7TUFBRUEsSUFBSSxFQUFFO0lBQWdDLENBQUM7SUFDdEQsWUFBWSxFQUFF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