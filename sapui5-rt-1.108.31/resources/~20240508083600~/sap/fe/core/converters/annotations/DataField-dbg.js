/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/PropertyHelper"], function (DisplayModeFormatter, PropertyHelper) {
  "use strict";

  var _exports = {};
  var isProperty = PropertyHelper.isProperty;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataFieldForActionAbstract".
   * DataFieldForActionAbstract has an inline action defined.
   *
   * @param dataField DataField to be evaluated
   * @returns Validates that dataField is a DataFieldForActionAbstractType
   */
  function isDataFieldForActionAbstract(dataField) {
    return dataField.hasOwnProperty("Action");
  }

  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataField".
   * DataField has a value defined.
   *
   * @param dataField DataField to be evaluated
   * @returns Validate that dataField is a DataFieldTypes
   */
  _exports.isDataFieldForActionAbstract = isDataFieldForActionAbstract;
  function isDataFieldTypes(dataField) {
    return dataField.hasOwnProperty("Value");
  }

  /**
   * Returns whether given DataField has a static hidden annotation.
   *
   * @param dataField The DataField to check
   * @returns `true` if DataField or referenced property has a static Hidden annotation, false else
   * @private
   */
  _exports.isDataFieldTypes = isDataFieldTypes;
  function isDataFieldAlwaysHidden(dataField) {
    var _dataField$annotation, _dataField$annotation2, _dataField$annotation3, _dataField$Value, _dataField$Value$$tar, _dataField$Value$$tar2, _dataField$Value$$tar3;
    return ((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === true || isDataFieldTypes(dataField) && ((_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : (_dataField$Value$$tar = _dataField$Value.$target) === null || _dataField$Value$$tar === void 0 ? void 0 : (_dataField$Value$$tar2 = _dataField$Value$$tar.annotations) === null || _dataField$Value$$tar2 === void 0 ? void 0 : (_dataField$Value$$tar3 = _dataField$Value$$tar2.UI) === null || _dataField$Value$$tar3 === void 0 ? void 0 : _dataField$Value$$tar3.Hidden) === true;
  }
  _exports.isDataFieldAlwaysHidden = isDataFieldAlwaysHidden;
  function getSemanticObjectPath(converterContext, object) {
    if (typeof object === "object") {
      var _object$Value;
      if (isDataFieldTypes(object) && (_object$Value = object.Value) !== null && _object$Value !== void 0 && _object$Value.$target) {
        var _object$Value2, _property$annotations, _property$annotations2;
        var property = (_object$Value2 = object.Value) === null || _object$Value2 === void 0 ? void 0 : _object$Value2.$target;
        if ((property === null || property === void 0 ? void 0 : (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.SemanticObject) !== undefined) {
          return converterContext.getEntitySetBasedAnnotationPath(property === null || property === void 0 ? void 0 : property.fullyQualifiedName);
        }
      } else if (isProperty(object)) {
        var _object$annotations, _object$annotations$C;
        if ((object === null || object === void 0 ? void 0 : (_object$annotations = object.annotations) === null || _object$annotations === void 0 ? void 0 : (_object$annotations$C = _object$annotations.Common) === null || _object$annotations$C === void 0 ? void 0 : _object$annotations$C.SemanticObject) !== undefined) {
          return converterContext.getEntitySetBasedAnnotationPath(object === null || object === void 0 ? void 0 : object.fullyQualifiedName);
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the navigation path prefix for a property path.
   *
   * @param path The property path For e.g. /EntityType/Navigation/Property
   * @returns The navigation path prefix For e.g. /EntityType/Navigation/
   */
  _exports.getSemanticObjectPath = getSemanticObjectPath;
  function _getNavigationPathPrefix(path) {
    return path.indexOf("/") > -1 ? path.substring(0, path.lastIndexOf("/") + 1) : "";
  }

  /**
   * Collect additional properties for the ALP table use-case.
   *
   * For e.g. If UI.Hidden points to a property, include this property in the additionalProperties of ComplexPropertyInfo object.
   *
   * @param target Property or DataField being processed
   * @param navigationPathPrefix Navigation path prefix, applicable in case of navigation properties.
   * @param tableType Table type.
   * @param relatedProperties The related properties identified so far.
   * @returns The related properties identified.
   */
  function _collectAdditionalPropertiesForAnalyticalTable(target, navigationPathPrefix, tableType, relatedProperties) {
    if (tableType === "AnalyticalTable") {
      var _target$annotations, _target$annotations$U, _hiddenAnnotation$$ta;
      var hiddenAnnotation = (_target$annotations = target.annotations) === null || _target$annotations === void 0 ? void 0 : (_target$annotations$U = _target$annotations.UI) === null || _target$annotations$U === void 0 ? void 0 : _target$annotations$U.Hidden;
      if (hiddenAnnotation !== null && hiddenAnnotation !== void 0 && hiddenAnnotation.path && ((_hiddenAnnotation$$ta = hiddenAnnotation.$target) === null || _hiddenAnnotation$$ta === void 0 ? void 0 : _hiddenAnnotation$$ta._type) === "Property") {
        var hiddenAnnotationPropertyPath = navigationPathPrefix + hiddenAnnotation.path;
        // This property should be added to additionalProperties map for the ALP table use-case.
        relatedProperties.additionalProperties[hiddenAnnotationPropertyPath] = hiddenAnnotation.$target;
      }
    }
    return relatedProperties;
  }

  /**
   * Collect related properties from a property's annotations.
   *
   * @param path The property path
   * @param property The property to be considered
   * @param converterContext The converter context
   * @param ignoreSelf Whether to exclude the same property from related properties.
   * @param tableType The table type.
   * @param relatedProperties The related properties identified so far.
   * @param addUnitInTemplate True if the unit/currency property needs to be added in the export template
   * @returns The related properties identified.
   */
  function collectRelatedProperties(path, property, converterContext, ignoreSelf, tableType) {
    var relatedProperties = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
      properties: {},
      additionalProperties: {},
      textOnlyPropertiesFromTextAnnotation: []
    };
    var addUnitInTemplate = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    /**
     * Helper to push unique related properties.
     *
     * @param key The property path
     * @param value The properties object containing value property, description property...
     * @returns Index at which the property is available
     */
    function _pushUnique(key, value) {
      if (!relatedProperties.properties.hasOwnProperty(key)) {
        relatedProperties.properties[key] = value;
      }
      return Object.keys(relatedProperties.properties).indexOf(key);
    }

    /**
     * Helper to append the export settings template with a formatted text.
     *
     * @param value Formatted text
     */
    function _appendTemplate(value) {
      relatedProperties.exportSettingsTemplate = relatedProperties.exportSettingsTemplate ? "".concat(relatedProperties.exportSettingsTemplate).concat(value) : "".concat(value);
    }
    if (path && property) {
      var _property$annotations3, _property$annotations4;
      var navigationPathPrefix = _getNavigationPathPrefix(path);

      // Check for Text annotation.
      var textAnnotation = (_property$annotations3 = property.annotations) === null || _property$annotations3 === void 0 ? void 0 : (_property$annotations4 = _property$annotations3.Common) === null || _property$annotations4 === void 0 ? void 0 : _property$annotations4.Text;
      var valueIndex;
      var targetValue;
      var currencyOrUoMIndex;
      var timezoneOrUoMIndex;
      if (relatedProperties.exportSettingsTemplate) {
        // FieldGroup use-case. Need to add each Field in new line.
        _appendTemplate("\n");
        relatedProperties.exportSettingsWrapping = true;
      }
      if (textAnnotation !== null && textAnnotation !== void 0 && textAnnotation.path && textAnnotation !== null && textAnnotation !== void 0 && textAnnotation.$target) {
        // Check for Text Arrangement.
        var dataModelObjectPath = converterContext.getDataModelObjectPath();
        var textAnnotationPropertyPath = navigationPathPrefix + textAnnotation.path;
        var displayMode = getDisplayMode(property, dataModelObjectPath);
        var descriptionIndex;
        switch (displayMode) {
          case "Value":
            valueIndex = _pushUnique(path, property);
            _appendTemplate("{".concat(valueIndex, "}"));
            break;
          case "Description":
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate("{".concat(descriptionIndex, "}"));
            relatedProperties.textOnlyPropertiesFromTextAnnotation.push(textAnnotation.path);
            break;
          case "ValueDescription":
            valueIndex = _pushUnique(path, property);
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate("{".concat(valueIndex, "} ({").concat(descriptionIndex, "})"));
            break;
          case "DescriptionValue":
            valueIndex = _pushUnique(path, property);
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate("{".concat(descriptionIndex, "} ({").concat(valueIndex, "})"));
            break;
          // no default
        }
      } else {
        var _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _property$annotations9, _property$annotations10, _property$Target, _property$Target$$tar, _property$annotations11, _property$annotations12, _property$annotations13, _property$annotations14, _property$annotations15;
        // Check for field containing Currency Or Unit Properties or Timezone
        var currencyOrUoMProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
        var currencyOrUnitAnnotation = (property === null || property === void 0 ? void 0 : (_property$annotations5 = property.annotations) === null || _property$annotations5 === void 0 ? void 0 : (_property$annotations6 = _property$annotations5.Measures) === null || _property$annotations6 === void 0 ? void 0 : _property$annotations6.ISOCurrency) || (property === null || property === void 0 ? void 0 : (_property$annotations7 = property.annotations) === null || _property$annotations7 === void 0 ? void 0 : (_property$annotations8 = _property$annotations7.Measures) === null || _property$annotations8 === void 0 ? void 0 : _property$annotations8.Unit);
        var timezoneProperty = getAssociatedTimezoneProperty(property);
        var timezoneAnnotation = property === null || property === void 0 ? void 0 : (_property$annotations9 = property.annotations) === null || _property$annotations9 === void 0 ? void 0 : (_property$annotations10 = _property$annotations9.Common) === null || _property$annotations10 === void 0 ? void 0 : _property$annotations10.Timezone;
        if (currencyOrUoMProperty && currencyOrUnitAnnotation !== null && currencyOrUnitAnnotation !== void 0 && currencyOrUnitAnnotation.$target) {
          valueIndex = _pushUnique(path, property);
          currencyOrUoMIndex = _pushUnique(navigationPathPrefix + currencyOrUnitAnnotation.path, currencyOrUnitAnnotation.$target);
          if (addUnitInTemplate) {
            _appendTemplate("{".concat(valueIndex, "}  {").concat(currencyOrUoMIndex, "}"));
          } else {
            relatedProperties.exportUnitName = navigationPathPrefix + currencyOrUnitAnnotation.path;
          }
        } else if (timezoneProperty && timezoneAnnotation !== null && timezoneAnnotation !== void 0 && timezoneAnnotation.$target) {
          valueIndex = _pushUnique(path, property);
          timezoneOrUoMIndex = _pushUnique(navigationPathPrefix + timezoneAnnotation.path, timezoneAnnotation.$target);
          if (addUnitInTemplate) {
            _appendTemplate("{".concat(valueIndex, "}  {").concat(timezoneOrUoMIndex, "}"));
          } else {
            relatedProperties.exportTimezoneName = navigationPathPrefix + timezoneAnnotation.path;
          }
        } else if ((_property$Target = property.Target) !== null && _property$Target !== void 0 && (_property$Target$$tar = _property$Target.$target) !== null && _property$Target$$tar !== void 0 && _property$Target$$tar.Visualization) {
          var dataPointProperty = property.Target.$target.Value.$target;
          valueIndex = _pushUnique(path, dataPointProperty);
          // New fake property created for the Rating/Progress Target Value. It'll be used for the export on split mode.
          _pushUnique(property.Target.value, property.Target.$target);
          targetValue = (property.Target.$target.TargetValue || property.Target.$target.MaximumValue).toString();
          _appendTemplate("{".concat(valueIndex, "}/").concat(targetValue));
        } else if (((_property$annotations11 = property.annotations) === null || _property$annotations11 === void 0 ? void 0 : (_property$annotations12 = _property$annotations11.UI) === null || _property$annotations12 === void 0 ? void 0 : (_property$annotations13 = _property$annotations12.DataFieldDefault) === null || _property$annotations13 === void 0 ? void 0 : (_property$annotations14 = _property$annotations13.Target) === null || _property$annotations14 === void 0 ? void 0 : (_property$annotations15 = _property$annotations14.$target) === null || _property$annotations15 === void 0 ? void 0 : _property$annotations15.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
          // DataPoint use-case using DataFieldDefault.
          var dataPointDefaultProperty = property.annotations.UI.DataFieldDefault;
          valueIndex = _pushUnique(path, property);
          // New fake property created for the Rating/Progress Target Value. It'll be used for the export on split mode.
          _pushUnique(dataPointDefaultProperty.Target.value, property);
          targetValue = (dataPointDefaultProperty.Target.$target.TargetValue || dataPointDefaultProperty.Target.$target.TargetValue.MaximumValue).toString();
          _appendTemplate("{".concat(valueIndex, "}/").concat(targetValue));
        } else if (property.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
          var _property$fn, _property$fn2;
          var contactProperty = (_property$fn = property.fn) === null || _property$fn === void 0 ? void 0 : _property$fn.$target;
          var contactPropertyPath = (_property$fn2 = property.fn) === null || _property$fn2 === void 0 ? void 0 : _property$fn2.path;
          valueIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + contactPropertyPath : contactPropertyPath, contactProperty);
          _appendTemplate("{".concat(valueIndex, "}"));
        } else if (!ignoreSelf) {
          // Collect underlying property
          valueIndex = _pushUnique(path, property);
          _appendTemplate("{".concat(valueIndex, "}"));
          if (currencyOrUnitAnnotation) {
            relatedProperties.exportUnitString = "".concat(currencyOrUnitAnnotation); // Hard-coded currency/unit
          } else if (timezoneAnnotation) {
            relatedProperties.exportTimezoneString = "".concat(timezoneAnnotation); // Hard-coded timezone
          }
        }
      }

      relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(property, navigationPathPrefix, tableType, relatedProperties);
      if (Object.keys(relatedProperties.additionalProperties).length > 0 && Object.keys(relatedProperties.properties).length === 0) {
        // Collect underlying property if not collected already.
        // This is to ensure that additionalProperties are made available only to complex property infos.
        valueIndex = _pushUnique(path, property);
        _appendTemplate("{".concat(valueIndex, "}"));
      }
    }
    return relatedProperties;
  }

  /**
   * Collect properties consumed by a DataField.
   * This is for populating the ComplexPropertyInfos of the table delegate.
   *
   * @param dataField The DataField for which the properties need to be identified.
   * @param converterContext The converter context.
   * @param tableType The table type.
   * @param relatedProperties The properties identified so far.
   * @param isEmbedded True if the DataField is embedded in another annotation (e.g. FieldGroup).
   * @returns The properties related to the DataField.
   */
  _exports.collectRelatedProperties = collectRelatedProperties;
  function collectRelatedPropertiesRecursively(dataField, converterContext, tableType) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    var relatedProperties = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
      properties: {},
      additionalProperties: {},
      textOnlyPropertiesFromTextAnnotation: []
    };
    var isEmbedded = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    switch (dataField === null || dataField === void 0 ? void 0 : dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        if (dataField.Value) {
          var property = dataField.Value;
          relatedProperties = collectRelatedProperties(property.path, property.$target, converterContext, false, tableType, relatedProperties, isEmbedded);
          var navigationPathPrefix = _getNavigationPathPrefix(property.path);
          relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(dataField, navigationPathPrefix, tableType, relatedProperties);
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        switch ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : _dataField$Target$$ta.$Type) {
          case "com.sap.vocabularies.UI.v1.FieldGroupType":
            (_dataField$Target$$ta2 = dataField.Target.$target.Data) === null || _dataField$Target$$ta2 === void 0 ? void 0 : _dataField$Target$$ta2.forEach(function (innerDataField) {
              relatedProperties = collectRelatedPropertiesRecursively(innerDataField, converterContext, tableType, relatedProperties, true);
            });
            break;
          case "com.sap.vocabularies.UI.v1.DataPointType":
            relatedProperties = collectRelatedProperties(dataField.Target.$target.Value.path, dataField, converterContext, false, tableType, relatedProperties, isEmbedded);
            break;
          case "com.sap.vocabularies.Communication.v1.ContactType":
            var dataFieldContact = dataField.Target.$target;
            relatedProperties = collectRelatedProperties(dataField.Target.value, dataFieldContact, converterContext, false, tableType, relatedProperties, isEmbedded);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    return relatedProperties;
  }
  _exports.collectRelatedPropertiesRecursively = collectRelatedPropertiesRecursively;
  var getDataFieldDataType = function (oDataField) {
    var _Value, _Value$$target, _Target;
    var sDataType = oDataField.$Type;
    switch (sDataType) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        sDataType = undefined;
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        sDataType = oDataField === null || oDataField === void 0 ? void 0 : (_Value = oDataField.Value) === null || _Value === void 0 ? void 0 : (_Value$$target = _Value.$target) === null || _Value$$target === void 0 ? void 0 : _Value$$target.type;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      default:
        var sDataTypeForDataFieldForAnnotation = (_Target = oDataField.Target) === null || _Target === void 0 ? void 0 : _Target.$target.$Type;
        if (sDataTypeForDataFieldForAnnotation) {
          var _Target2, _Target4;
          if (((_Target2 = oDataField.Target) === null || _Target2 === void 0 ? void 0 : _Target2.$target.$Type) === "com.sap.vocabularies.Communication.v1.ContactType") {
            var _$target, _Target3, _Target3$$target;
            sDataType = (_$target = ((_Target3 = oDataField.Target) === null || _Target3 === void 0 ? void 0 : (_Target3$$target = _Target3.$target) === null || _Target3$$target === void 0 ? void 0 : _Target3$$target.fn).$target) === null || _$target === void 0 ? void 0 : _$target.type;
          } else if (((_Target4 = oDataField.Target) === null || _Target4 === void 0 ? void 0 : _Target4.$target.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _Target5, _Target5$$target, _Target5$$target$Valu, _Target5$$target$Valu2, _Target6, _Target6$$target, _Target6$$target$Valu;
            sDataType = ((_Target5 = oDataField.Target) === null || _Target5 === void 0 ? void 0 : (_Target5$$target = _Target5.$target) === null || _Target5$$target === void 0 ? void 0 : (_Target5$$target$Valu = _Target5$$target.Value) === null || _Target5$$target$Valu === void 0 ? void 0 : (_Target5$$target$Valu2 = _Target5$$target$Valu.$Path) === null || _Target5$$target$Valu2 === void 0 ? void 0 : _Target5$$target$Valu2.$Type) || ((_Target6 = oDataField.Target) === null || _Target6 === void 0 ? void 0 : (_Target6$$target = _Target6.$target) === null || _Target6$$target === void 0 ? void 0 : (_Target6$$target$Valu = _Target6$$target.Value) === null || _Target6$$target$Valu === void 0 ? void 0 : _Target6$$target$Valu.$target.type);
          } else {
            var _Target7;
            // e.g. FieldGroup or Chart
            // FieldGroup Properties have no type, so we define it as a boolean type to prevent exceptions during the calculation of the width
            sDataType = ((_Target7 = oDataField.Target) === null || _Target7 === void 0 ? void 0 : _Target7.$target.$Type) === "com.sap.vocabularies.UI.v1.ChartDefinitionType" ? undefined : "Edm.Boolean";
          }
        } else {
          sDataType = undefined;
        }
        break;
    }
    return sDataType;
  };
  _exports.getDataFieldDataType = getDataFieldDataType;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IiwiZGF0YUZpZWxkIiwiaGFzT3duUHJvcGVydHkiLCJpc0RhdGFGaWVsZFR5cGVzIiwiaXNEYXRhRmllbGRBbHdheXNIaWRkZW4iLCJhbm5vdGF0aW9ucyIsIlVJIiwiSGlkZGVuIiwidmFsdWVPZiIsIlZhbHVlIiwiJHRhcmdldCIsImdldFNlbWFudGljT2JqZWN0UGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJvYmplY3QiLCJwcm9wZXJ0eSIsIkNvbW1vbiIsIlNlbWFudGljT2JqZWN0IiwidW5kZWZpbmVkIiwiZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImlzUHJvcGVydHkiLCJfZ2V0TmF2aWdhdGlvblBhdGhQcmVmaXgiLCJwYXRoIiwiaW5kZXhPZiIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiX2NvbGxlY3RBZGRpdGlvbmFsUHJvcGVydGllc0ZvckFuYWx5dGljYWxUYWJsZSIsInRhcmdldCIsIm5hdmlnYXRpb25QYXRoUHJlZml4IiwidGFibGVUeXBlIiwicmVsYXRlZFByb3BlcnRpZXMiLCJoaWRkZW5Bbm5vdGF0aW9uIiwiX3R5cGUiLCJoaWRkZW5Bbm5vdGF0aW9uUHJvcGVydHlQYXRoIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMiLCJpZ25vcmVTZWxmIiwicHJvcGVydGllcyIsInRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbiIsImFkZFVuaXRJblRlbXBsYXRlIiwiX3B1c2hVbmlxdWUiLCJrZXkiLCJ2YWx1ZSIsIk9iamVjdCIsImtleXMiLCJfYXBwZW5kVGVtcGxhdGUiLCJleHBvcnRTZXR0aW5nc1RlbXBsYXRlIiwidGV4dEFubm90YXRpb24iLCJUZXh0IiwidmFsdWVJbmRleCIsInRhcmdldFZhbHVlIiwiY3VycmVuY3lPclVvTUluZGV4IiwidGltZXpvbmVPclVvTUluZGV4IiwiZXhwb3J0U2V0dGluZ3NXcmFwcGluZyIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwidGV4dEFubm90YXRpb25Qcm9wZXJ0eVBhdGgiLCJkaXNwbGF5TW9kZSIsImdldERpc3BsYXlNb2RlIiwiZGVzY3JpcHRpb25JbmRleCIsInB1c2giLCJjdXJyZW5jeU9yVW9NUHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkiLCJjdXJyZW5jeU9yVW5pdEFubm90YXRpb24iLCJNZWFzdXJlcyIsIklTT0N1cnJlbmN5IiwiVW5pdCIsInRpbWV6b25lUHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSIsInRpbWV6b25lQW5ub3RhdGlvbiIsIlRpbWV6b25lIiwiZXhwb3J0VW5pdE5hbWUiLCJleHBvcnRUaW1lem9uZU5hbWUiLCJUYXJnZXQiLCJWaXN1YWxpemF0aW9uIiwiZGF0YVBvaW50UHJvcGVydHkiLCJUYXJnZXRWYWx1ZSIsIk1heGltdW1WYWx1ZSIsInRvU3RyaW5nIiwiRGF0YUZpZWxkRGVmYXVsdCIsIiRUeXBlIiwiZGF0YVBvaW50RGVmYXVsdFByb3BlcnR5IiwiY29udGFjdFByb3BlcnR5IiwiZm4iLCJjb250YWN0UHJvcGVydHlQYXRoIiwiZXhwb3J0VW5pdFN0cmluZyIsImV4cG9ydFRpbWV6b25lU3RyaW5nIiwibGVuZ3RoIiwiY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzUmVjdXJzaXZlbHkiLCJpc0VtYmVkZGVkIiwiRGF0YSIsImZvckVhY2giLCJpbm5lckRhdGFGaWVsZCIsImRhdGFGaWVsZENvbnRhY3QiLCJnZXREYXRhRmllbGREYXRhVHlwZSIsIm9EYXRhRmllbGQiLCJzRGF0YVR5cGUiLCJ0eXBlIiwic0RhdGFUeXBlRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiIsIiRQYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJEYXRhRmllbGQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcmltaXRpdmVUeXBlLCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBDb250YWN0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgeyBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgdHlwZSB7XG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQW5ub3RhdGlvbixcblx0RGF0YUZpZWxkVHlwZXMsXG5cdERhdGFQb2ludFxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgeyBnZXREaXNwbGF5TW9kZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0Rpc3BsYXlNb2RlRm9ybWF0dGVyXCI7XG5pbXBvcnQge1xuXHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHksXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHksXG5cdGlzUHJvcGVydHlcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uL0NvbnZlcnRlckNvbnRleHRcIjtcblxuZXhwb3J0IHR5cGUgQ29tcGxleFByb3BlcnR5SW5mbyA9IHtcblx0cHJvcGVydGllczogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+O1xuXHRhZGRpdGlvbmFsUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+O1xuXHRleHBvcnRTZXR0aW5nc1RlbXBsYXRlPzogc3RyaW5nO1xuXHRleHBvcnRTZXR0aW5nc1dyYXBwaW5nPzogYm9vbGVhbjtcblx0ZXhwb3J0VW5pdE5hbWU/OiBzdHJpbmc7XG5cdGV4cG9ydFVuaXRTdHJpbmc/OiBzdHJpbmc7XG5cdGV4cG9ydFRpbWV6b25lTmFtZT86IHN0cmluZztcblx0ZXhwb3J0VGltZXpvbmVTdHJpbmc/OiBzdHJpbmc7XG5cdHRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbjogc3RyaW5nW107XG59O1xuXG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIGRhdGFGaWVsZEFic3RyYWN0IHRoYXQgaXMgcGFzc2VkIGlzIGEgXCJEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdFwiLlxuICogRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QgaGFzIGFuIGlubGluZSBhY3Rpb24gZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZCB0byBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIFZhbGlkYXRlcyB0aGF0IGRhdGFGaWVsZCBpcyBhIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0VHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpOiBkYXRhRmllbGQgaXMgRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3RUeXBlcyB7XG5cdHJldHVybiAoZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0VHlwZXMpLmhhc093blByb3BlcnR5KFwiQWN0aW9uXCIpO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIGRhdGFGaWVsZEFic3RyYWN0IHRoYXQgaXMgcGFzc2VkIGlzIGEgXCJEYXRhRmllbGRcIi5cbiAqIERhdGFGaWVsZCBoYXMgYSB2YWx1ZSBkZWZpbmVkLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIHRvIGJlIGV2YWx1YXRlZFxuICogQHJldHVybnMgVmFsaWRhdGUgdGhhdCBkYXRhRmllbGQgaXMgYSBEYXRhRmllbGRUeXBlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRhRmllbGRUeXBlcyhkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpOiBkYXRhRmllbGQgaXMgRGF0YUZpZWxkVHlwZXMge1xuXHRyZXR1cm4gKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRUeXBlcykuaGFzT3duUHJvcGVydHkoXCJWYWx1ZVwiKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgZ2l2ZW4gRGF0YUZpZWxkIGhhcyBhIHN0YXRpYyBoaWRkZW4gYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBEYXRhRmllbGQgdG8gY2hlY2tcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBEYXRhRmllbGQgb3IgcmVmZXJlbmNlZCBwcm9wZXJ0eSBoYXMgYSBzdGF0aWMgSGlkZGVuIGFubm90YXRpb24sIGZhbHNlIGVsc2VcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGFGaWVsZEFsd2F5c0hpZGRlbihkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gdHJ1ZSB8fFxuXHRcdChpc0RhdGFGaWVsZFR5cGVzKGRhdGFGaWVsZCkgJiYgZGF0YUZpZWxkLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiA9PT0gdHJ1ZSlcblx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbWFudGljT2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBvYmplY3Q6IGFueSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICh0eXBlb2Ygb2JqZWN0ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKGlzRGF0YUZpZWxkVHlwZXMob2JqZWN0KSAmJiBvYmplY3QuVmFsdWU/LiR0YXJnZXQpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5ID0gb2JqZWN0LlZhbHVlPy4kdGFyZ2V0O1xuXHRcdFx0aWYgKHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgocHJvcGVydHk/LmZ1bGx5UXVhbGlmaWVkTmFtZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpc1Byb3BlcnR5KG9iamVjdCkpIHtcblx0XHRcdGlmIChvYmplY3Q/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChvYmplY3Q/LmZ1bGx5UXVhbGlmaWVkTmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmF2aWdhdGlvbiBwYXRoIHByZWZpeCBmb3IgYSBwcm9wZXJ0eSBwYXRoLlxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwcm9wZXJ0eSBwYXRoIEZvciBlLmcuIC9FbnRpdHlUeXBlL05hdmlnYXRpb24vUHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBuYXZpZ2F0aW9uIHBhdGggcHJlZml4IEZvciBlLmcuIC9FbnRpdHlUeXBlL05hdmlnYXRpb24vXG4gKi9cbmZ1bmN0aW9uIF9nZXROYXZpZ2F0aW9uUGF0aFByZWZpeChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gcGF0aC5pbmRleE9mKFwiL1wiKSA+IC0xID8gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSA6IFwiXCI7XG59XG5cbi8qKlxuICogQ29sbGVjdCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgZm9yIHRoZSBBTFAgdGFibGUgdXNlLWNhc2UuXG4gKlxuICogRm9yIGUuZy4gSWYgVUkuSGlkZGVuIHBvaW50cyB0byBhIHByb3BlcnR5LCBpbmNsdWRlIHRoaXMgcHJvcGVydHkgaW4gdGhlIGFkZGl0aW9uYWxQcm9wZXJ0aWVzIG9mIENvbXBsZXhQcm9wZXJ0eUluZm8gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgUHJvcGVydHkgb3IgRGF0YUZpZWxkIGJlaW5nIHByb2Nlc3NlZFxuICogQHBhcmFtIG5hdmlnYXRpb25QYXRoUHJlZml4IE5hdmlnYXRpb24gcGF0aCBwcmVmaXgsIGFwcGxpY2FibGUgaW4gY2FzZSBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRhYmxlIHR5cGUuXG4gKiBAcGFyYW0gcmVsYXRlZFByb3BlcnRpZXMgVGhlIHJlbGF0ZWQgcHJvcGVydGllcyBpZGVudGlmaWVkIHNvIGZhci5cbiAqIEByZXR1cm5zIFRoZSByZWxhdGVkIHByb3BlcnRpZXMgaWRlbnRpZmllZC5cbiAqL1xuZnVuY3Rpb24gX2NvbGxlY3RBZGRpdGlvbmFsUHJvcGVydGllc0ZvckFuYWx5dGljYWxUYWJsZShcblx0dGFyZ2V0OiBQcmltaXRpdmVUeXBlLFxuXHRuYXZpZ2F0aW9uUGF0aFByZWZpeDogc3RyaW5nLFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0cmVsYXRlZFByb3BlcnRpZXM6IENvbXBsZXhQcm9wZXJ0eUluZm9cbik6IENvbXBsZXhQcm9wZXJ0eUluZm8ge1xuXHRpZiAodGFibGVUeXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiKSB7XG5cdFx0Y29uc3QgaGlkZGVuQW5ub3RhdGlvbiA9IHRhcmdldC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbjtcblx0XHRpZiAoaGlkZGVuQW5ub3RhdGlvbj8ucGF0aCAmJiBoaWRkZW5Bbm5vdGF0aW9uLiR0YXJnZXQ/Ll90eXBlID09PSBcIlByb3BlcnR5XCIpIHtcblx0XHRcdGNvbnN0IGhpZGRlbkFubm90YXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGhpZGRlbkFubm90YXRpb24ucGF0aDtcblx0XHRcdC8vIFRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIGFkZGVkIHRvIGFkZGl0aW9uYWxQcm9wZXJ0aWVzIG1hcCBmb3IgdGhlIEFMUCB0YWJsZSB1c2UtY2FzZS5cblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmFkZGl0aW9uYWxQcm9wZXJ0aWVzW2hpZGRlbkFubm90YXRpb25Qcm9wZXJ0eVBhdGhdID0gaGlkZGVuQW5ub3RhdGlvbi4kdGFyZ2V0O1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVsYXRlZFByb3BlcnRpZXM7XG59XG5cbi8qKlxuICogQ29sbGVjdCByZWxhdGVkIHByb3BlcnRpZXMgZnJvbSBhIHByb3BlcnR5J3MgYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIHBhdGggVGhlIHByb3BlcnR5IHBhdGhcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY29uc2lkZXJlZFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gaWdub3JlU2VsZiBXaGV0aGVyIHRvIGV4Y2x1ZGUgdGhlIHNhbWUgcHJvcGVydHkgZnJvbSByZWxhdGVkIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRoZSB0YWJsZSB0eXBlLlxuICogQHBhcmFtIHJlbGF0ZWRQcm9wZXJ0aWVzIFRoZSByZWxhdGVkIHByb3BlcnRpZXMgaWRlbnRpZmllZCBzbyBmYXIuXG4gKiBAcGFyYW0gYWRkVW5pdEluVGVtcGxhdGUgVHJ1ZSBpZiB0aGUgdW5pdC9jdXJyZW5jeSBwcm9wZXJ0eSBuZWVkcyB0byBiZSBhZGRlZCBpbiB0aGUgZXhwb3J0IHRlbXBsYXRlXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRlZCBwcm9wZXJ0aWVzIGlkZW50aWZpZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoXG5cdHBhdGg6IHN0cmluZyxcblx0cHJvcGVydHk6IFByaW1pdGl2ZVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGlnbm9yZVNlbGY6IGJvb2xlYW4sXG5cdHRhYmxlVHlwZTogVGFibGVUeXBlLFxuXHRyZWxhdGVkUHJvcGVydGllczogQ29tcGxleFByb3BlcnR5SW5mbyA9IHsgcHJvcGVydGllczoge30sIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiB7fSwgdGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uOiBbXSB9LFxuXHRhZGRVbml0SW5UZW1wbGF0ZTogYm9vbGVhbiA9IGZhbHNlXG4pOiBDb21wbGV4UHJvcGVydHlJbmZvIHtcblx0LyoqXG5cdCAqIEhlbHBlciB0byBwdXNoIHVuaXF1ZSByZWxhdGVkIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIHByb3BlcnR5IHBhdGhcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBwcm9wZXJ0aWVzIG9iamVjdCBjb250YWluaW5nIHZhbHVlIHByb3BlcnR5LCBkZXNjcmlwdGlvbiBwcm9wZXJ0eS4uLlxuXHQgKiBAcmV0dXJucyBJbmRleCBhdCB3aGljaCB0aGUgcHJvcGVydHkgaXMgYXZhaWxhYmxlXG5cdCAqL1xuXHRmdW5jdGlvbiBfcHVzaFVuaXF1ZShrZXk6IHN0cmluZywgdmFsdWU6IFByb3BlcnR5KTogbnVtYmVyIHtcblx0XHRpZiAoIXJlbGF0ZWRQcm9wZXJ0aWVzLnByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXMucHJvcGVydGllc1trZXldID0gdmFsdWU7XG5cdFx0fVxuXHRcdHJldHVybiBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllcy5wcm9wZXJ0aWVzKS5pbmRleE9mKGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIHRvIGFwcGVuZCB0aGUgZXhwb3J0IHNldHRpbmdzIHRlbXBsYXRlIHdpdGggYSBmb3JtYXR0ZWQgdGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIEZvcm1hdHRlZCB0ZXh0XG5cdCAqL1xuXHRmdW5jdGlvbiBfYXBwZW5kVGVtcGxhdGUodmFsdWU6IHN0cmluZykge1xuXHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUgPSByZWxhdGVkUHJvcGVydGllcy5leHBvcnRTZXR0aW5nc1RlbXBsYXRlXG5cdFx0XHQ/IGAke3JlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFNldHRpbmdzVGVtcGxhdGV9JHt2YWx1ZX1gXG5cdFx0XHQ6IGAke3ZhbHVlfWA7XG5cdH1cblxuXHRpZiAocGF0aCAmJiBwcm9wZXJ0eSkge1xuXHRcdGNvbnN0IG5hdmlnYXRpb25QYXRoUHJlZml4ID0gX2dldE5hdmlnYXRpb25QYXRoUHJlZml4KHBhdGgpO1xuXG5cdFx0Ly8gQ2hlY2sgZm9yIFRleHQgYW5ub3RhdGlvbi5cblx0XHRjb25zdCB0ZXh0QW5ub3RhdGlvbiA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQ7XG5cdFx0bGV0IHZhbHVlSW5kZXg6IG51bWJlcjtcblx0XHRsZXQgdGFyZ2V0VmFsdWU6IHN0cmluZztcblx0XHRsZXQgY3VycmVuY3lPclVvTUluZGV4OiBudW1iZXI7XG5cdFx0bGV0IHRpbWV6b25lT3JVb01JbmRleDogbnVtYmVyO1xuXG5cdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUpIHtcblx0XHRcdC8vIEZpZWxkR3JvdXAgdXNlLWNhc2UuIE5lZWQgdG8gYWRkIGVhY2ggRmllbGQgaW4gbmV3IGxpbmUuXG5cdFx0XHRfYXBwZW5kVGVtcGxhdGUoXCJcXG5cIik7XG5cdFx0XHRyZWxhdGVkUHJvcGVydGllcy5leHBvcnRTZXR0aW5nc1dyYXBwaW5nID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGV4dEFubm90YXRpb24/LnBhdGggJiYgdGV4dEFubm90YXRpb24/LiR0YXJnZXQpIHtcblx0XHRcdC8vIENoZWNrIGZvciBUZXh0IEFycmFuZ2VtZW50LlxuXHRcdFx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRcdFx0Y29uc3QgdGV4dEFubm90YXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIHRleHRBbm5vdGF0aW9uLnBhdGg7XG5cdFx0XHRjb25zdCBkaXNwbGF5TW9kZSA9IGdldERpc3BsYXlNb2RlKHByb3BlcnR5LCBkYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdGxldCBkZXNjcmlwdGlvbkluZGV4OiBudW1iZXI7XG5cdFx0XHRzd2l0Y2ggKGRpc3BsYXlNb2RlKSB7XG5cdFx0XHRcdGNhc2UgXCJWYWx1ZVwiOlxuXHRcdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX1gKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHRkZXNjcmlwdGlvbkluZGV4ID0gX3B1c2hVbmlxdWUodGV4dEFubm90YXRpb25Qcm9wZXJ0eVBhdGgsIHRleHRBbm5vdGF0aW9uLiR0YXJnZXQpO1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7ZGVzY3JpcHRpb25JbmRleH19YCk7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMudGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uLnB1c2godGV4dEFubm90YXRpb24ucGF0aCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uSW5kZXggPSBfcHVzaFVuaXF1ZSh0ZXh0QW5ub3RhdGlvblByb3BlcnR5UGF0aCwgdGV4dEFubm90YXRpb24uJHRhcmdldCk7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX0gKHske2Rlc2NyaXB0aW9uSW5kZXh9fSlgKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25JbmRleCA9IF9wdXNoVW5pcXVlKHRleHRBbm5vdGF0aW9uUHJvcGVydHlQYXRoLCB0ZXh0QW5ub3RhdGlvbi4kdGFyZ2V0KTtcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske2Rlc2NyaXB0aW9uSW5kZXh9fSAoeyR7dmFsdWVJbmRleH19KWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHQvLyBubyBkZWZhdWx0XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIENoZWNrIGZvciBmaWVsZCBjb250YWluaW5nIEN1cnJlbmN5IE9yIFVuaXQgUHJvcGVydGllcyBvciBUaW1lem9uZVxuXHRcdFx0Y29uc3QgY3VycmVuY3lPclVvTVByb3BlcnR5ID0gZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkocHJvcGVydHkpIHx8IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkocHJvcGVydHkpO1xuXHRcdFx0Y29uc3QgY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uID0gcHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgcHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdDtcblx0XHRcdGNvbnN0IHRpbWV6b25lUHJvcGVydHkgPSBnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eShwcm9wZXJ0eSk7XG5cdFx0XHRjb25zdCB0aW1lem9uZUFubm90YXRpb24gPSBwcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU7XG5cblx0XHRcdGlmIChjdXJyZW5jeU9yVW9NUHJvcGVydHkgJiYgY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uPy4kdGFyZ2V0KSB7XG5cdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdGN1cnJlbmN5T3JVb01JbmRleCA9IF9wdXNoVW5pcXVlKG5hdmlnYXRpb25QYXRoUHJlZml4ICsgY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uLnBhdGgsIGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbi4kdGFyZ2V0KTtcblx0XHRcdFx0aWYgKGFkZFVuaXRJblRlbXBsYXRlKSB7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX0gIHske2N1cnJlbmN5T3JVb01JbmRleH19YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0VW5pdE5hbWUgPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbi5wYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHRpbWV6b25lUHJvcGVydHkgJiYgdGltZXpvbmVBbm5vdGF0aW9uPy4kdGFyZ2V0KSB7XG5cdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdHRpbWV6b25lT3JVb01JbmRleCA9IF9wdXNoVW5pcXVlKG5hdmlnYXRpb25QYXRoUHJlZml4ICsgdGltZXpvbmVBbm5vdGF0aW9uLnBhdGgsIHRpbWV6b25lQW5ub3RhdGlvbi4kdGFyZ2V0KTtcblx0XHRcdFx0aWYgKGFkZFVuaXRJblRlbXBsYXRlKSB7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX0gIHske3RpbWV6b25lT3JVb01JbmRleH19YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0VGltZXpvbmVOYW1lID0gbmF2aWdhdGlvblBhdGhQcmVmaXggKyB0aW1lem9uZUFubm90YXRpb24ucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eS5UYXJnZXQ/LiR0YXJnZXQ/LlZpc3VhbGl6YXRpb24pIHtcblx0XHRcdFx0Y29uc3QgZGF0YVBvaW50UHJvcGVydHk6IFByaW1pdGl2ZVR5cGUgPSBwcm9wZXJ0eS5UYXJnZXQuJHRhcmdldC5WYWx1ZS4kdGFyZ2V0O1xuXHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgZGF0YVBvaW50UHJvcGVydHkpO1xuXHRcdFx0XHQvLyBOZXcgZmFrZSBwcm9wZXJ0eSBjcmVhdGVkIGZvciB0aGUgUmF0aW5nL1Byb2dyZXNzIFRhcmdldCBWYWx1ZS4gSXQnbGwgYmUgdXNlZCBmb3IgdGhlIGV4cG9ydCBvbiBzcGxpdCBtb2RlLlxuXHRcdFx0XHRfcHVzaFVuaXF1ZShwcm9wZXJ0eS5UYXJnZXQudmFsdWUsIHByb3BlcnR5LlRhcmdldC4kdGFyZ2V0KTtcblx0XHRcdFx0dGFyZ2V0VmFsdWUgPSAocHJvcGVydHkuVGFyZ2V0LiR0YXJnZXQuVGFyZ2V0VmFsdWUgfHwgcHJvcGVydHkuVGFyZ2V0LiR0YXJnZXQuTWF4aW11bVZhbHVlKS50b1N0cmluZygpO1xuXHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fS8ke3RhcmdldFZhbHVlfWApO1xuXHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQ/LlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGUpIHtcblx0XHRcdFx0Ly8gRGF0YVBvaW50IHVzZS1jYXNlIHVzaW5nIERhdGFGaWVsZERlZmF1bHQuXG5cdFx0XHRcdGNvbnN0IGRhdGFQb2ludERlZmF1bHRQcm9wZXJ0eTogUHJpbWl0aXZlVHlwZSA9IHByb3BlcnR5LmFubm90YXRpb25zLlVJLkRhdGFGaWVsZERlZmF1bHQ7XG5cdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdC8vIE5ldyBmYWtlIHByb3BlcnR5IGNyZWF0ZWQgZm9yIHRoZSBSYXRpbmcvUHJvZ3Jlc3MgVGFyZ2V0IFZhbHVlLiBJdCdsbCBiZSB1c2VkIGZvciB0aGUgZXhwb3J0IG9uIHNwbGl0IG1vZGUuXG5cdFx0XHRcdF9wdXNoVW5pcXVlKGRhdGFQb2ludERlZmF1bHRQcm9wZXJ0eS5UYXJnZXQudmFsdWUsIHByb3BlcnR5KTtcblx0XHRcdFx0dGFyZ2V0VmFsdWUgPSAoXG5cdFx0XHRcdFx0ZGF0YVBvaW50RGVmYXVsdFByb3BlcnR5LlRhcmdldC4kdGFyZ2V0LlRhcmdldFZhbHVlIHx8IGRhdGFQb2ludERlZmF1bHRQcm9wZXJ0eS5UYXJnZXQuJHRhcmdldC5UYXJnZXRWYWx1ZS5NYXhpbXVtVmFsdWVcblx0XHRcdFx0KS50b1N0cmluZygpO1xuXHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fS8ke3RhcmdldFZhbHVlfWApO1xuXHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eS4kVHlwZSA9PT0gQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcy5Db250YWN0VHlwZSkge1xuXHRcdFx0XHRjb25zdCBjb250YWN0UHJvcGVydHkgPSBwcm9wZXJ0eS5mbj8uJHRhcmdldDtcblx0XHRcdFx0Y29uc3QgY29udGFjdFByb3BlcnR5UGF0aCA9IHByb3BlcnR5LmZuPy5wYXRoO1xuXHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUoXG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGhQcmVmaXggPyBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGNvbnRhY3RQcm9wZXJ0eVBhdGggOiBjb250YWN0UHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdGNvbnRhY3RQcm9wZXJ0eVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fWApO1xuXHRcdFx0fSBlbHNlIGlmICghaWdub3JlU2VsZikge1xuXHRcdFx0XHQvLyBDb2xsZWN0IHVuZGVybHlpbmcgcHJvcGVydHlcblx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX1gKTtcblx0XHRcdFx0aWYgKGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbikge1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFVuaXRTdHJpbmcgPSBgJHtjdXJyZW5jeU9yVW5pdEFubm90YXRpb259YDsgLy8gSGFyZC1jb2RlZCBjdXJyZW5jeS91bml0XG5cdFx0XHRcdH0gZWxzZSBpZiAodGltZXpvbmVBbm5vdGF0aW9uKSB7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0VGltZXpvbmVTdHJpbmcgPSBgJHt0aW1lem9uZUFubm90YXRpb259YDsgLy8gSGFyZC1jb2RlZCB0aW1lem9uZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBfY29sbGVjdEFkZGl0aW9uYWxQcm9wZXJ0aWVzRm9yQW5hbHl0aWNhbFRhYmxlKHByb3BlcnR5LCBuYXZpZ2F0aW9uUGF0aFByZWZpeCwgdGFibGVUeXBlLCByZWxhdGVkUHJvcGVydGllcyk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKS5sZW5ndGggPiAwICYmIE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzLnByb3BlcnRpZXMpLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Ly8gQ29sbGVjdCB1bmRlcmx5aW5nIHByb3BlcnR5IGlmIG5vdCBjb2xsZWN0ZWQgYWxyZWFkeS5cblx0XHRcdC8vIFRoaXMgaXMgdG8gZW5zdXJlIHRoYXQgYWRkaXRpb25hbFByb3BlcnRpZXMgYXJlIG1hZGUgYXZhaWxhYmxlIG9ubHkgdG8gY29tcGxleCBwcm9wZXJ0eSBpbmZvcy5cblx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fWApO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZWxhdGVkUHJvcGVydGllcztcbn1cblxuLyoqXG4gKiBDb2xsZWN0IHByb3BlcnRpZXMgY29uc3VtZWQgYnkgYSBEYXRhRmllbGQuXG4gKiBUaGlzIGlzIGZvciBwb3B1bGF0aW5nIHRoZSBDb21wbGV4UHJvcGVydHlJbmZvcyBvZiB0aGUgdGFibGUgZGVsZWdhdGUuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgRGF0YUZpZWxkIGZvciB3aGljaCB0aGUgcHJvcGVydGllcyBuZWVkIHRvIGJlIGlkZW50aWZpZWQuXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRoZSB0YWJsZSB0eXBlLlxuICogQHBhcmFtIHJlbGF0ZWRQcm9wZXJ0aWVzIFRoZSBwcm9wZXJ0aWVzIGlkZW50aWZpZWQgc28gZmFyLlxuICogQHBhcmFtIGlzRW1iZWRkZWQgVHJ1ZSBpZiB0aGUgRGF0YUZpZWxkIGlzIGVtYmVkZGVkIGluIGFub3RoZXIgYW5ub3RhdGlvbiAoZS5nLiBGaWVsZEdyb3VwKS5cbiAqIEByZXR1cm5zIFRoZSBwcm9wZXJ0aWVzIHJlbGF0ZWQgdG8gdGhlIERhdGFGaWVsZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RSZWxhdGVkUHJvcGVydGllc1JlY3Vyc2l2ZWx5KFxuXHRkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHRhYmxlVHlwZTogVGFibGVUeXBlLFxuXHRyZWxhdGVkUHJvcGVydGllczogQ29tcGxleFByb3BlcnR5SW5mbyA9IHsgcHJvcGVydGllczoge30sIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiB7fSwgdGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uOiBbXSB9LFxuXHRpc0VtYmVkZGVkOiBib29sZWFuID0gZmFsc2Vcbik6IENvbXBsZXhQcm9wZXJ0eUluZm8ge1xuXHRzd2l0Y2ggKGRhdGFGaWVsZD8uJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdGlmIChkYXRhRmllbGQuVmFsdWUpIHtcblx0XHRcdFx0Y29uc3QgcHJvcGVydHkgPSBkYXRhRmllbGQuVmFsdWU7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKFxuXHRcdFx0XHRcdHByb3BlcnR5LnBhdGgsXG5cdFx0XHRcdFx0cHJvcGVydHkuJHRhcmdldCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyxcblx0XHRcdFx0XHRpc0VtYmVkZGVkXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbnN0IG5hdmlnYXRpb25QYXRoUHJlZml4ID0gX2dldE5hdmlnYXRpb25QYXRoUHJlZml4KHByb3BlcnR5LnBhdGgpO1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyA9IF9jb2xsZWN0QWRkaXRpb25hbFByb3BlcnRpZXNGb3JBbmFseXRpY2FsVGFibGUoXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLFxuXHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoUHJlZml4LFxuXHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllc1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0c3dpdGNoIChkYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSkge1xuXHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlOlxuXHRcdFx0XHRcdGRhdGFGaWVsZC5UYXJnZXQuJHRhcmdldC5EYXRhPy5mb3JFYWNoKChpbm5lckRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseShcblx0XHRcdFx0XHRcdFx0aW5uZXJEYXRhRmllbGQsXG5cdFx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMsXG5cdFx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLlRhcmdldC4kdGFyZ2V0LlZhbHVlLnBhdGgsXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQsXG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0XHR0YWJsZVR5cGUsXG5cdFx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyxcblx0XHRcdFx0XHRcdGlzRW1iZWRkZWRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcy5Db250YWN0VHlwZTpcblx0XHRcdFx0XHRjb25zdCBkYXRhRmllbGRDb250YWN0ID0gZGF0YUZpZWxkLlRhcmdldC4kdGFyZ2V0IGFzIENvbnRhY3Q7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQuVGFyZ2V0LnZhbHVlLFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkQ29udGFjdCxcblx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdFx0aXNFbWJlZGRlZFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiByZWxhdGVkUHJvcGVydGllcztcbn1cblxuZXhwb3J0IGNvbnN0IGdldERhdGFGaWVsZERhdGFUeXBlID0gZnVuY3Rpb24gKG9EYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGxldCBzRGF0YVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IChvRGF0YUZpZWxkIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXMpLiRUeXBlO1xuXHRzd2l0Y2ggKHNEYXRhVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0c0RhdGFUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdHNEYXRhVHlwZSA9IChvRGF0YUZpZWxkIGFzIERhdGFGaWVsZCk/LlZhbHVlPy4kdGFyZ2V0Py50eXBlO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGNvbnN0IHNEYXRhVHlwZUZvckRhdGFGaWVsZEZvckFubm90YXRpb24gPSAob0RhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQ/LiR0YXJnZXQuJFR5cGU7XG5cdFx0XHRpZiAoc0RhdGFUeXBlRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikge1xuXHRcdFx0XHRpZiAoKG9EYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0Py4kdGFyZ2V0LiRUeXBlID09PSBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzLkNvbnRhY3RUeXBlKSB7XG5cdFx0XHRcdFx0c0RhdGFUeXBlID0gKCgob0RhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQ/LiR0YXJnZXQgYXMgQ29udGFjdCk/LmZuIGFzIGFueSkuJHRhcmdldD8udHlwZTtcblx0XHRcdFx0fSBlbHNlIGlmICgob0RhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQ/LiR0YXJnZXQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGUpIHtcblx0XHRcdFx0XHRzRGF0YVR5cGUgPVxuXHRcdFx0XHRcdFx0KChvRGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFubm90YXRpb24pLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZT8uJFBhdGg/LiRUeXBlIHx8XG5cdFx0XHRcdFx0XHQoKG9EYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0Py4kdGFyZ2V0IGFzIERhdGFQb2ludCk/LlZhbHVlPy4kdGFyZ2V0LnR5cGU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gZS5nLiBGaWVsZEdyb3VwIG9yIENoYXJ0XG5cdFx0XHRcdFx0Ly8gRmllbGRHcm91cCBQcm9wZXJ0aWVzIGhhdmUgbm8gdHlwZSwgc28gd2UgZGVmaW5lIGl0IGFzIGEgYm9vbGVhbiB0eXBlIHRvIHByZXZlbnQgZXhjZXB0aW9ucyBkdXJpbmcgdGhlIGNhbGN1bGF0aW9uIG9mIHRoZSB3aWR0aFxuXHRcdFx0XHRcdHNEYXRhVHlwZSA9XG5cdFx0XHRcdFx0XHQob0RhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQ/LiR0YXJnZXQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnREZWZpbml0aW9uVHlwZVwiXG5cdFx0XHRcdFx0XHRcdD8gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHRcdDogXCJFZG0uQm9vbGVhblwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzRGF0YVR5cGUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiBzRGF0YVR5cGU7XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBa0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0EsNEJBQTRCLENBQUNDLFNBQWlDLEVBQWdEO0lBQzdILE9BQVFBLFNBQVMsQ0FBcUNDLGNBQWMsQ0FBQyxRQUFRLENBQUM7RUFDL0U7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLFNBQVNDLGdCQUFnQixDQUFDRixTQUFpQyxFQUErQjtJQUNoRyxPQUFRQSxTQUFTLENBQW9CQyxjQUFjLENBQUMsT0FBTyxDQUFDO0VBQzdEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPTyxTQUFTRSx1QkFBdUIsQ0FBQ0gsU0FBaUMsRUFBVztJQUFBO0lBQ25GLE9BQ0MsMEJBQUFBLFNBQVMsQ0FB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