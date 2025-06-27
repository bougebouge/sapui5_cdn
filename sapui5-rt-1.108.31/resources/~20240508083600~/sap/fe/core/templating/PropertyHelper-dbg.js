/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Identify if the given property passed is a "Property" (has a _type).
   *
   * @param property A target property to evaluate
   * @returns Validate that property is a Property
   */
  function isProperty(property) {
    return property && property.hasOwnProperty("_type") && property._type === "Property";
  }

  /**
   * Check whether the property has the Core.Computed annotation or not.
   *
   * @param oProperty The target property
   * @returns `true` if the property is computed
   */
  _exports.isProperty = isProperty;
  var isComputed = function (oProperty) {
    var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3;
    return !!((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.Core) !== null && _oProperty$annotation2 !== void 0 && (_oProperty$annotation3 = _oProperty$annotation2.Computed) !== null && _oProperty$annotation3 !== void 0 && _oProperty$annotation3.valueOf());
  };

  /**
   * Identify if the given property passed is a "NavigationProperty".
   *
   * @param property A target property to evaluate
   * @returns Validate that property is a NavigationProperty
   */
  _exports.isComputed = isComputed;
  function isNavigationProperty(property) {
    return property && property.hasOwnProperty("_type") && property._type === "NavigationProperty";
  }

  /**
   * Check whether the property has the Core.Immutable annotation or not.
   *
   * @param oProperty The target property
   * @returns `true` if it's immutable
   */
  _exports.isNavigationProperty = isNavigationProperty;
  var isImmutable = function (oProperty) {
    var _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6;
    return !!((_oProperty$annotation4 = oProperty.annotations) !== null && _oProperty$annotation4 !== void 0 && (_oProperty$annotation5 = _oProperty$annotation4.Core) !== null && _oProperty$annotation5 !== void 0 && (_oProperty$annotation6 = _oProperty$annotation5.Immutable) !== null && _oProperty$annotation6 !== void 0 && _oProperty$annotation6.valueOf());
  };

  /**
   * Check whether the property is a key or not.
   *
   * @param oProperty The target property
   * @returns `true` if it's a key
   */
  _exports.isImmutable = isImmutable;
  var isKey = function (oProperty) {
    return !!oProperty.isKey;
  };

  /**
   * Check whether the property is a semanticKey for the context entity.
   *
   * @param property
   * @param contextDataModelObject The DataModelObject that holds the context
   * @returns `true`if it's a semantic key
   */
  _exports.isKey = isKey;
  var isSemanticKey = function (property, contextDataModelObject) {
    var _contextDataModelObje, _contextDataModelObje2, _contextDataModelObje3, _contextDataModelObje4, _semanticKeys$some;
    var semanticKeys = (_contextDataModelObje = contextDataModelObject.contextLocation) === null || _contextDataModelObje === void 0 ? void 0 : (_contextDataModelObje2 = _contextDataModelObje.targetEntityType) === null || _contextDataModelObje2 === void 0 ? void 0 : (_contextDataModelObje3 = _contextDataModelObje2.annotations) === null || _contextDataModelObje3 === void 0 ? void 0 : (_contextDataModelObje4 = _contextDataModelObje3.Common) === null || _contextDataModelObje4 === void 0 ? void 0 : _contextDataModelObje4.SemanticKey;
    return (_semanticKeys$some = semanticKeys === null || semanticKeys === void 0 ? void 0 : semanticKeys.some(function (key) {
      var _key$$target;
      return (key === null || key === void 0 ? void 0 : (_key$$target = key.$target) === null || _key$$target === void 0 ? void 0 : _key$$target.fullyQualifiedName) === property.fullyQualifiedName;
    })) !== null && _semanticKeys$some !== void 0 ? _semanticKeys$some : false;
  };

  /**
   * Checks whether the property has a date time or not.
   *
   * @param oProperty
   * @returns `true` if it is of type date / datetime / datetimeoffset
   */
  _exports.isSemanticKey = isSemanticKey;
  var hasDateType = function (oProperty) {
    return ["Edm.Date", "Edm.DateTime", "Edm.DateTimeOffset"].indexOf(oProperty.type) !== -1;
  };

  /**
   * Retrieve the label annotation.
   *
   * @param oProperty The target property
   * @returns The label string
   */
  _exports.hasDateType = hasDateType;
  var getLabel = function (oProperty) {
    var _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9;
    return ((_oProperty$annotation7 = oProperty.annotations) === null || _oProperty$annotation7 === void 0 ? void 0 : (_oProperty$annotation8 = _oProperty$annotation7.Common) === null || _oProperty$annotation8 === void 0 ? void 0 : (_oProperty$annotation9 = _oProperty$annotation8.Label) === null || _oProperty$annotation9 === void 0 ? void 0 : _oProperty$annotation9.toString()) || "";
  };

  /**
   * Check whether the property has a semantic object defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a semantic object
   */
  _exports.getLabel = getLabel;
  var hasSemanticObject = function (oProperty) {
    var _oProperty$annotation10, _oProperty$annotation11;
    return !!((_oProperty$annotation10 = oProperty.annotations) !== null && _oProperty$annotation10 !== void 0 && (_oProperty$annotation11 = _oProperty$annotation10.Common) !== null && _oProperty$annotation11 !== void 0 && _oProperty$annotation11.SemanticObject);
  };
  _exports.hasSemanticObject = hasSemanticObject;
  var isPathExpression = function (expression) {
    return !!expression && expression.type !== undefined && expression.type === "Path";
  };
  _exports.isPathExpression = isPathExpression;
  var isPropertyPathExpression = function (expression) {
    return !!expression && expression.type !== undefined && expression.type === "PropertyPath";
  };
  _exports.isPropertyPathExpression = isPropertyPathExpression;
  var isAnnotationPathExpression = function (expression) {
    return !!expression && expression.type !== undefined && expression.type === "AnnotationPath";
  };

  /**
   * Retrieves the timezone property associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The timezone property, if it exists
   */
  _exports.isAnnotationPathExpression = isAnnotationPathExpression;
  var getAssociatedTimezoneProperty = function (oProperty) {
    var _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation12 = oProperty.annotations) === null || _oProperty$annotation12 === void 0 ? void 0 : (_oProperty$annotation13 = _oProperty$annotation12.Common) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.Timezone) ? (_oProperty$annotation14 = oProperty.annotations) === null || _oProperty$annotation14 === void 0 ? void 0 : (_oProperty$annotation15 = _oProperty$annotation14.Common) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Timezone.$target : undefined;
  };

  /**
   * Retrieves the timezone property path associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The timezone property path, if it exists
   */
  _exports.getAssociatedTimezoneProperty = getAssociatedTimezoneProperty;
  var getAssociatedTimezonePropertyPath = function (oProperty) {
    var _oProperty$annotation16, _oProperty$annotation17, _oProperty$annotation18, _oProperty$annotation19, _oProperty$annotation20;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation16 = oProperty.annotations) === null || _oProperty$annotation16 === void 0 ? void 0 : (_oProperty$annotation17 = _oProperty$annotation16.Common) === null || _oProperty$annotation17 === void 0 ? void 0 : _oProperty$annotation17.Timezone) ? oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation18 = oProperty.annotations) === null || _oProperty$annotation18 === void 0 ? void 0 : (_oProperty$annotation19 = _oProperty$annotation18.Common) === null || _oProperty$annotation19 === void 0 ? void 0 : (_oProperty$annotation20 = _oProperty$annotation19.Timezone) === null || _oProperty$annotation20 === void 0 ? void 0 : _oProperty$annotation20.path : undefined;
  };

  /**
   * Retrieves the associated text property for that property, if it exists.
   *
   * @param oProperty The target property
   * @returns The text property, if it exists
   */
  _exports.getAssociatedTimezonePropertyPath = getAssociatedTimezonePropertyPath;
  var getAssociatedTextProperty = function (oProperty) {
    var _oProperty$annotation21, _oProperty$annotation22, _oProperty$annotation23, _oProperty$annotation24;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation21 = oProperty.annotations) === null || _oProperty$annotation21 === void 0 ? void 0 : (_oProperty$annotation22 = _oProperty$annotation21.Common) === null || _oProperty$annotation22 === void 0 ? void 0 : _oProperty$annotation22.Text) ? (_oProperty$annotation23 = oProperty.annotations) === null || _oProperty$annotation23 === void 0 ? void 0 : (_oProperty$annotation24 = _oProperty$annotation23.Common) === null || _oProperty$annotation24 === void 0 ? void 0 : _oProperty$annotation24.Text.$target : undefined;
  };

  /**
   * Retrieves the unit property associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The unit property, if it exists
   */
  _exports.getAssociatedTextProperty = getAssociatedTextProperty;
  var getAssociatedUnitProperty = function (oProperty) {
    var _oProperty$annotation25, _oProperty$annotation26, _oProperty$annotation27, _oProperty$annotation28;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation25 = oProperty.annotations) === null || _oProperty$annotation25 === void 0 ? void 0 : (_oProperty$annotation26 = _oProperty$annotation25.Measures) === null || _oProperty$annotation26 === void 0 ? void 0 : _oProperty$annotation26.Unit) ? (_oProperty$annotation27 = oProperty.annotations) === null || _oProperty$annotation27 === void 0 ? void 0 : (_oProperty$annotation28 = _oProperty$annotation27.Measures) === null || _oProperty$annotation28 === void 0 ? void 0 : _oProperty$annotation28.Unit.$target : undefined;
  };
  _exports.getAssociatedUnitProperty = getAssociatedUnitProperty;
  var getAssociatedUnitPropertyPath = function (oProperty) {
    var _oProperty$annotation29, _oProperty$annotation30, _oProperty$annotation31, _oProperty$annotation32;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation29 = oProperty.annotations) === null || _oProperty$annotation29 === void 0 ? void 0 : (_oProperty$annotation30 = _oProperty$annotation29.Measures) === null || _oProperty$annotation30 === void 0 ? void 0 : _oProperty$annotation30.Unit) ? (_oProperty$annotation31 = oProperty.annotations) === null || _oProperty$annotation31 === void 0 ? void 0 : (_oProperty$annotation32 = _oProperty$annotation31.Measures) === null || _oProperty$annotation32 === void 0 ? void 0 : _oProperty$annotation32.Unit.path : undefined;
  };

  /**
   * Retrieves the associated currency property for that property if it exists.
   *
   * @param oProperty The target property
   * @returns The unit property, if it exists
   */
  _exports.getAssociatedUnitPropertyPath = getAssociatedUnitPropertyPath;
  var getAssociatedCurrencyProperty = function (oProperty) {
    var _oProperty$annotation33, _oProperty$annotation34, _oProperty$annotation35, _oProperty$annotation36;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation33 = oProperty.annotations) === null || _oProperty$annotation33 === void 0 ? void 0 : (_oProperty$annotation34 = _oProperty$annotation33.Measures) === null || _oProperty$annotation34 === void 0 ? void 0 : _oProperty$annotation34.ISOCurrency) ? (_oProperty$annotation35 = oProperty.annotations) === null || _oProperty$annotation35 === void 0 ? void 0 : (_oProperty$annotation36 = _oProperty$annotation35.Measures) === null || _oProperty$annotation36 === void 0 ? void 0 : _oProperty$annotation36.ISOCurrency.$target : undefined;
  };
  _exports.getAssociatedCurrencyProperty = getAssociatedCurrencyProperty;
  var getAssociatedCurrencyPropertyPath = function (oProperty) {
    var _oProperty$annotation37, _oProperty$annotation38, _oProperty$annotation39, _oProperty$annotation40;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation37 = oProperty.annotations) === null || _oProperty$annotation37 === void 0 ? void 0 : (_oProperty$annotation38 = _oProperty$annotation37.Measures) === null || _oProperty$annotation38 === void 0 ? void 0 : _oProperty$annotation38.ISOCurrency) ? (_oProperty$annotation39 = oProperty.annotations) === null || _oProperty$annotation39 === void 0 ? void 0 : (_oProperty$annotation40 = _oProperty$annotation39.Measures) === null || _oProperty$annotation40 === void 0 ? void 0 : _oProperty$annotation40.ISOCurrency.path : undefined;
  };

  /**
   * Retrieves the Common.Text property path if it exists.
   *
   * @param oProperty The target property
   * @returns The Common.Text property path or undefined if it does not exist
   */
  _exports.getAssociatedCurrencyPropertyPath = getAssociatedCurrencyPropertyPath;
  var getAssociatedTextPropertyPath = function (oProperty) {
    var _oProperty$annotation41, _oProperty$annotation42, _oProperty$annotation43, _oProperty$annotation44;
    return isPathExpression((_oProperty$annotation41 = oProperty.annotations) === null || _oProperty$annotation41 === void 0 ? void 0 : (_oProperty$annotation42 = _oProperty$annotation41.Common) === null || _oProperty$annotation42 === void 0 ? void 0 : _oProperty$annotation42.Text) ? (_oProperty$annotation43 = oProperty.annotations) === null || _oProperty$annotation43 === void 0 ? void 0 : (_oProperty$annotation44 = _oProperty$annotation43.Common) === null || _oProperty$annotation44 === void 0 ? void 0 : _oProperty$annotation44.Text.path : undefined;
  };

  /**
   * Retrieves the TargetValue from the DataPoint.
   *
   * @param {Property} oProperty the target property or DataPoint
   * @returns {string | undefined} The TargetValue
   */
  _exports.getAssociatedTextPropertyPath = getAssociatedTextPropertyPath;
  var getTargetValueOnDataPoint = function (oProperty) {
    var _oProperty$annotation45, _oProperty$annotation46, _oProperty$annotation47, _oProperty$annotation48, _oProperty$annotation49, _oProperty$annotation50, _oProperty$TargetValu;
    var sTargetValue = ((_oProperty$annotation45 = oProperty.annotations) === null || _oProperty$annotation45 === void 0 ? void 0 : (_oProperty$annotation46 = _oProperty$annotation45.UI) === null || _oProperty$annotation46 === void 0 ? void 0 : (_oProperty$annotation47 = _oProperty$annotation46.DataFieldDefault) === null || _oProperty$annotation47 === void 0 ? void 0 : (_oProperty$annotation48 = _oProperty$annotation47.Target) === null || _oProperty$annotation48 === void 0 ? void 0 : (_oProperty$annotation49 = _oProperty$annotation48.$target) === null || _oProperty$annotation49 === void 0 ? void 0 : (_oProperty$annotation50 = _oProperty$annotation49.TargetValue) === null || _oProperty$annotation50 === void 0 ? void 0 : _oProperty$annotation50.toString()) || ((_oProperty$TargetValu = oProperty.TargetValue) === null || _oProperty$TargetValu === void 0 ? void 0 : _oProperty$TargetValu.toString());
    return sTargetValue ? sTargetValue : undefined;
  };
  /**
   * Check whether the property has a value help annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.getTargetValueOnDataPoint = getTargetValueOnDataPoint;
  var hasValueHelp = function (oProperty) {
    var _oProperty$annotation51, _oProperty$annotation52, _oProperty$annotation53, _oProperty$annotation54, _oProperty$annotation55, _oProperty$annotation56, _oProperty$annotation57, _oProperty$annotation58;
    return !!((_oProperty$annotation51 = oProperty.annotations) !== null && _oProperty$annotation51 !== void 0 && (_oProperty$annotation52 = _oProperty$annotation51.Common) !== null && _oProperty$annotation52 !== void 0 && _oProperty$annotation52.ValueList) || !!((_oProperty$annotation53 = oProperty.annotations) !== null && _oProperty$annotation53 !== void 0 && (_oProperty$annotation54 = _oProperty$annotation53.Common) !== null && _oProperty$annotation54 !== void 0 && _oProperty$annotation54.ValueListReferences) || !!((_oProperty$annotation55 = oProperty.annotations) !== null && _oProperty$annotation55 !== void 0 && (_oProperty$annotation56 = _oProperty$annotation55.Common) !== null && _oProperty$annotation56 !== void 0 && _oProperty$annotation56.ValueListWithFixedValues) || !!((_oProperty$annotation57 = oProperty.annotations) !== null && _oProperty$annotation57 !== void 0 && (_oProperty$annotation58 = _oProperty$annotation57.Common) !== null && _oProperty$annotation58 !== void 0 && _oProperty$annotation58.ValueListMapping);
  };

  /**
   * Check whether the property has a value help with fixed value annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.hasValueHelp = hasValueHelp;
  var hasValueHelpWithFixedValues = function (oProperty) {
    var _oProperty$annotation59, _oProperty$annotation60, _oProperty$annotation61;
    return !!(oProperty !== null && oProperty !== void 0 && (_oProperty$annotation59 = oProperty.annotations) !== null && _oProperty$annotation59 !== void 0 && (_oProperty$annotation60 = _oProperty$annotation59.Common) !== null && _oProperty$annotation60 !== void 0 && (_oProperty$annotation61 = _oProperty$annotation60.ValueListWithFixedValues) !== null && _oProperty$annotation61 !== void 0 && _oProperty$annotation61.valueOf());
  };

  /**
   * Check whether the property has a value help for validation annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.hasValueHelpWithFixedValues = hasValueHelpWithFixedValues;
  var hasValueListForValidation = function (oProperty) {
    var _oProperty$annotation62, _oProperty$annotation63;
    return ((_oProperty$annotation62 = oProperty.annotations) === null || _oProperty$annotation62 === void 0 ? void 0 : (_oProperty$annotation63 = _oProperty$annotation62.Common) === null || _oProperty$annotation63 === void 0 ? void 0 : _oProperty$annotation63.ValueListForValidation) !== undefined;
  };
  _exports.hasValueListForValidation = hasValueListForValidation;
  var hasTimezone = function (oProperty) {
    var _oProperty$annotation64, _oProperty$annotation65;
    return ((_oProperty$annotation64 = oProperty.annotations) === null || _oProperty$annotation64 === void 0 ? void 0 : (_oProperty$annotation65 = _oProperty$annotation64.Common) === null || _oProperty$annotation65 === void 0 ? void 0 : _oProperty$annotation65.Timezone) !== undefined;
  };
  /**
   * Checks whether the property is a unit property.
   *
   * @param oProperty The property to check
   * @returns `true` if it is a unit
   */
  _exports.hasTimezone = hasTimezone;
  var isUnit = function (oProperty) {
    var _oProperty$annotation66, _oProperty$annotation67, _oProperty$annotation68;
    return !!((_oProperty$annotation66 = oProperty.annotations) !== null && _oProperty$annotation66 !== void 0 && (_oProperty$annotation67 = _oProperty$annotation66.Common) !== null && _oProperty$annotation67 !== void 0 && (_oProperty$annotation68 = _oProperty$annotation67.IsUnit) !== null && _oProperty$annotation68 !== void 0 && _oProperty$annotation68.valueOf());
  };

  /**
   * Checks whether the property has a unit property.
   *
   * @param oProperty The property to check
   * @returns `true` if it has a unit
   */
  _exports.isUnit = isUnit;
  var hasUnit = function (oProperty) {
    var _oProperty$annotation69, _oProperty$annotation70;
    return ((_oProperty$annotation69 = oProperty.annotations) === null || _oProperty$annotation69 === void 0 ? void 0 : (_oProperty$annotation70 = _oProperty$annotation69.Measures) === null || _oProperty$annotation70 === void 0 ? void 0 : _oProperty$annotation70.Unit) !== undefined;
  };

  /**
   * Checks whether the property is a currency property.
   *
   * @param oProperty The property to check
   * @returns `true` if it is a currency
   */
  _exports.hasUnit = hasUnit;
  var isCurrency = function (oProperty) {
    var _oProperty$annotation71, _oProperty$annotation72, _oProperty$annotation73;
    return !!((_oProperty$annotation71 = oProperty.annotations) !== null && _oProperty$annotation71 !== void 0 && (_oProperty$annotation72 = _oProperty$annotation71.Common) !== null && _oProperty$annotation72 !== void 0 && (_oProperty$annotation73 = _oProperty$annotation72.IsCurrency) !== null && _oProperty$annotation73 !== void 0 && _oProperty$annotation73.valueOf());
  };

  /**
   * Checks whether the property has a currency property.
   *
   * @param oProperty The property to check
   * @returns `true` if it has a currency
   */
  _exports.isCurrency = isCurrency;
  var hasCurrency = function (oProperty) {
    var _oProperty$annotation74, _oProperty$annotation75;
    return ((_oProperty$annotation74 = oProperty.annotations) === null || _oProperty$annotation74 === void 0 ? void 0 : (_oProperty$annotation75 = _oProperty$annotation74.Measures) === null || _oProperty$annotation75 === void 0 ? void 0 : _oProperty$annotation75.ISOCurrency) !== undefined;
  };
  _exports.hasCurrency = hasCurrency;
  var hasStaticPercentUnit = function (oProperty) {
    var _oProperty$annotation76, _oProperty$annotation77, _oProperty$annotation78;
    return (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation76 = oProperty.annotations) === null || _oProperty$annotation76 === void 0 ? void 0 : (_oProperty$annotation77 = _oProperty$annotation76.Measures) === null || _oProperty$annotation77 === void 0 ? void 0 : (_oProperty$annotation78 = _oProperty$annotation77.Unit) === null || _oProperty$annotation78 === void 0 ? void 0 : _oProperty$annotation78.toString()) === "%";
  };
  _exports.hasStaticPercentUnit = hasStaticPercentUnit;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1Byb3BlcnR5IiwicHJvcGVydHkiLCJoYXNPd25Qcm9wZXJ0eSIsIl90eXBlIiwiaXNDb21wdXRlZCIsIm9Qcm9wZXJ0eSIsImFubm90YXRpb25zIiwiQ29yZSIsIkNvbXB1dGVkIiwidmFsdWVPZiIsImlzTmF2aWdhdGlvblByb3BlcnR5IiwiaXNJbW11dGFibGUiLCJJbW11dGFibGUiLCJpc0tleSIsImlzU2VtYW50aWNLZXkiLCJjb250ZXh0RGF0YU1vZGVsT2JqZWN0Iiwic2VtYW50aWNLZXlzIiwiY29udGV4dExvY2F0aW9uIiwidGFyZ2V0RW50aXR5VHlwZSIsIkNvbW1vbiIsIlNlbWFudGljS2V5Iiwic29tZSIsImtleSIsIiR0YXJnZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJoYXNEYXRlVHlwZSIsImluZGV4T2YiLCJ0eXBlIiwiZ2V0TGFiZWwiLCJMYWJlbCIsInRvU3RyaW5nIiwiaGFzU2VtYW50aWNPYmplY3QiLCJTZW1hbnRpY09iamVjdCIsImlzUGF0aEV4cHJlc3Npb24iLCJleHByZXNzaW9uIiwidW5kZWZpbmVkIiwiaXNQcm9wZXJ0eVBhdGhFeHByZXNzaW9uIiwiaXNBbm5vdGF0aW9uUGF0aEV4cHJlc3Npb24iLCJnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSIsIlRpbWV6b25lIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoIiwicGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkiLCJUZXh0IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsIk1lYXN1cmVzIiwiVW5pdCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJJU09DdXJyZW5jeSIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwiZ2V0VGFyZ2V0VmFsdWVPbkRhdGFQb2ludCIsInNUYXJnZXRWYWx1ZSIsIlVJIiwiRGF0YUZpZWxkRGVmYXVsdCIsIlRhcmdldCIsIlRhcmdldFZhbHVlIiwiaGFzVmFsdWVIZWxwIiwiVmFsdWVMaXN0IiwiVmFsdWVMaXN0UmVmZXJlbmNlcyIsIlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsIlZhbHVlTGlzdE1hcHBpbmciLCJoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMiLCJoYXNWYWx1ZUxpc3RGb3JWYWxpZGF0aW9uIiwiVmFsdWVMaXN0Rm9yVmFsaWRhdGlvbiIsImhhc1RpbWV6b25lIiwiaXNVbml0IiwiSXNVbml0IiwiaGFzVW5pdCIsImlzQ3VycmVuY3kiLCJJc0N1cnJlbmN5IiwiaGFzQ3VycmVuY3kiLCJoYXNTdGF0aWNQZXJjZW50VW5pdCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUHJvcGVydHlIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOYXZpZ2F0aW9uUHJvcGVydHksIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiwgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCIuL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcblxuLyoqXG4gKiBJZGVudGlmeSBpZiB0aGUgZ2l2ZW4gcHJvcGVydHkgcGFzc2VkIGlzIGEgXCJQcm9wZXJ0eVwiIChoYXMgYSBfdHlwZSkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IEEgdGFyZ2V0IHByb3BlcnR5IHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyBWYWxpZGF0ZSB0aGF0IHByb3BlcnR5IGlzIGEgUHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHkocHJvcGVydHk6IGFueSk6IHByb3BlcnR5IGlzIFByb3BlcnR5IHtcblx0cmV0dXJuIHByb3BlcnR5ICYmIChwcm9wZXJ0eSBhcyBQcm9wZXJ0eSkuaGFzT3duUHJvcGVydHkoXCJfdHlwZVwiKSAmJiAocHJvcGVydHkgYXMgUHJvcGVydHkpLl90eXBlID09PSBcIlByb3BlcnR5XCI7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIHRoZSBDb3JlLkNvbXB1dGVkIGFubm90YXRpb24gb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBpcyBjb21wdXRlZFxuICovXG5leHBvcnQgY29uc3QgaXNDb21wdXRlZCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29yZT8uQ29tcHV0ZWQ/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogSWRlbnRpZnkgaWYgdGhlIGdpdmVuIHByb3BlcnR5IHBhc3NlZCBpcyBhIFwiTmF2aWdhdGlvblByb3BlcnR5XCIuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IEEgdGFyZ2V0IHByb3BlcnR5IHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyBWYWxpZGF0ZSB0aGF0IHByb3BlcnR5IGlzIGEgTmF2aWdhdGlvblByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hdmlnYXRpb25Qcm9wZXJ0eShwcm9wZXJ0eTogYW55KTogcHJvcGVydHkgaXMgTmF2aWdhdGlvblByb3BlcnR5IHtcblx0cmV0dXJuIChcblx0XHRwcm9wZXJ0eSAmJlxuXHRcdChwcm9wZXJ0eSBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpLmhhc093blByb3BlcnR5KFwiX3R5cGVcIikgJiZcblx0XHQocHJvcGVydHkgYXMgTmF2aWdhdGlvblByb3BlcnR5KS5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIlxuXHQpO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyB0aGUgQ29yZS5JbW11dGFibGUgYW5ub3RhdGlvbiBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQncyBpbW11dGFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IGlzSW1tdXRhYmxlID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db3JlPy5JbW11dGFibGU/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaXMgYSBrZXkgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0J3MgYSBrZXlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzS2V5ID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhb1Byb3BlcnR5LmlzS2V5O1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBpcyBhIHNlbWFudGljS2V5IGZvciB0aGUgY29udGV4dCBlbnRpdHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5XG4gKiBAcGFyYW0gY29udGV4dERhdGFNb2RlbE9iamVjdCBUaGUgRGF0YU1vZGVsT2JqZWN0IHRoYXQgaG9sZHMgdGhlIGNvbnRleHRcbiAqIEByZXR1cm5zIGB0cnVlYGlmIGl0J3MgYSBzZW1hbnRpYyBrZXlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzU2VtYW50aWNLZXkgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5LCBjb250ZXh0RGF0YU1vZGVsT2JqZWN0OiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdGNvbnN0IHNlbWFudGljS2V5cyA9IGNvbnRleHREYXRhTW9kZWxPYmplY3QuY29udGV4dExvY2F0aW9uPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY0tleTtcblx0cmV0dXJuIChcblx0XHRzZW1hbnRpY0tleXM/LnNvbWUoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGtleT8uJHRhcmdldD8uZnVsbHlRdWFsaWZpZWROYW1lID09PSBwcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWU7XG5cdFx0fSkgPz8gZmFsc2Vcblx0KTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyBhIGRhdGUgdGltZSBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIG9mIHR5cGUgZGF0ZSAvIGRhdGV0aW1lIC8gZGF0ZXRpbWVvZmZzZXRcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc0RhdGVUeXBlID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIFtcIkVkbS5EYXRlXCIsIFwiRWRtLkRhdGVUaW1lXCIsIFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCJdLmluZGV4T2Yob1Byb3BlcnR5LnR5cGUpICE9PSAtMTtcbn07XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGxhYmVsIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgbGFiZWwgc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRMYWJlbCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogc3RyaW5nIHtcblx0cmV0dXJuIG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udG9TdHJpbmcoKSB8fCBcIlwiO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSBzZW1hbnRpYyBvYmplY3QgZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgc2VtYW50aWMgb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBoYXNTZW1hbnRpY09iamVjdCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdDtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1BhdGhFeHByZXNzaW9uID0gZnVuY3Rpb24gPFQ+KGV4cHJlc3Npb246IGFueSk6IGV4cHJlc3Npb24gaXMgUGF0aEFubm90YXRpb25FeHByZXNzaW9uPFQ+IHtcblx0cmV0dXJuICEhZXhwcmVzc2lvbiAmJiBleHByZXNzaW9uLnR5cGUgIT09IHVuZGVmaW5lZCAmJiBleHByZXNzaW9uLnR5cGUgPT09IFwiUGF0aFwiO1xufTtcbmV4cG9ydCBjb25zdCBpc1Byb3BlcnR5UGF0aEV4cHJlc3Npb24gPSBmdW5jdGlvbiA8VD4oZXhwcmVzc2lvbjogYW55KTogZXhwcmVzc2lvbiBpcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248VD4ge1xuXHRyZXR1cm4gISFleHByZXNzaW9uICYmIGV4cHJlc3Npb24udHlwZSAhPT0gdW5kZWZpbmVkICYmIGV4cHJlc3Npb24udHlwZSA9PT0gXCJQcm9wZXJ0eVBhdGhcIjtcbn07XG5leHBvcnQgY29uc3QgaXNBbm5vdGF0aW9uUGF0aEV4cHJlc3Npb24gPSBmdW5jdGlvbiA8VD4oZXhwcmVzc2lvbjogYW55KTogZXhwcmVzc2lvbiBpcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248VD4ge1xuXHRyZXR1cm4gISFleHByZXNzaW9uICYmIGV4cHJlc3Npb24udHlwZSAhPT0gdW5kZWZpbmVkICYmIGV4cHJlc3Npb24udHlwZSA9PT0gXCJBbm5vdGF0aW9uUGF0aFwiO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHRpbWV6b25lIHByb3BlcnR5IGFzc29jaWF0ZWQgdG8gdGhlIHByb3BlcnR5LCBpZiBhcHBsaWNhYmxlLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHRpbWV6b25lIHByb3BlcnR5LCBpZiBpdCBleGlzdHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5ID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBQcm9wZXJ0eSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUpXG5cdFx0PyAob1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lLiR0YXJnZXQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eSlcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB0aW1lem9uZSBwcm9wZXJ0eSBwYXRoIGFzc29jaWF0ZWQgdG8gdGhlIHByb3BlcnR5LCBpZiBhcHBsaWNhYmxlLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHRpbWV6b25lIHByb3BlcnR5IHBhdGgsIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lKSA/IG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU/LnBhdGggOiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgYXNzb2NpYXRlZCB0ZXh0IHByb3BlcnR5IGZvciB0aGF0IHByb3BlcnR5LCBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgdGV4dCBwcm9wZXJ0eSwgaWYgaXQgZXhpc3RzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5ID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBQcm9wZXJ0eSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dClcblx0XHQ/IChvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dC4kdGFyZ2V0IGFzIHVua25vd24gYXMgUHJvcGVydHkpXG5cdFx0OiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdW5pdCBwcm9wZXJ0eSBhc3NvY2lhdGVkIHRvIHRoZSBwcm9wZXJ0eSwgaWYgYXBwbGljYWJsZS5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSB1bml0IHByb3BlcnR5LCBpZiBpdCBleGlzdHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IFByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQpXG5cdFx0PyAob1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdC4kdGFyZ2V0IGFzIHVua25vd24gYXMgUHJvcGVydHkpXG5cdFx0OiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVBhdGggPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0KSA/IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQucGF0aCA6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBhc3NvY2lhdGVkIGN1cnJlbmN5IHByb3BlcnR5IGZvciB0aGF0IHByb3BlcnR5IGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSB1bml0IHByb3BlcnR5LCBpZiBpdCBleGlzdHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5ID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBQcm9wZXJ0eSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSlcblx0XHQ/IChvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeS4kdGFyZ2V0IGFzIHVua25vd24gYXMgUHJvcGVydHkpXG5cdFx0OiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kpID8gb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kucGF0aCA6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBDb21tb24uVGV4dCBwcm9wZXJ0eSBwYXRoIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBDb21tb24uVGV4dCBwcm9wZXJ0eSBwYXRoIG9yIHVuZGVmaW5lZCBpZiBpdCBkb2VzIG5vdCBleGlzdFxuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGggPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0KSA/IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0LnBhdGggOiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgVGFyZ2V0VmFsdWUgZnJvbSB0aGUgRGF0YVBvaW50LlxuICpcbiAqIEBwYXJhbSB7UHJvcGVydHl9IG9Qcm9wZXJ0eSB0aGUgdGFyZ2V0IHByb3BlcnR5IG9yIERhdGFQb2ludFxuICogQHJldHVybnMge3N0cmluZyB8IHVuZGVmaW5lZH0gVGhlIFRhcmdldFZhbHVlXG4gKi9cblxuZXhwb3J0IGNvbnN0IGdldFRhcmdldFZhbHVlT25EYXRhUG9pbnQgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBzVGFyZ2V0VmFsdWUgPVxuXHRcdG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQ/LlRhcmdldD8uJHRhcmdldD8uVGFyZ2V0VmFsdWU/LnRvU3RyaW5nKCkgfHwgb1Byb3BlcnR5LlRhcmdldFZhbHVlPy50b1N0cmluZygpO1xuXHRyZXR1cm4gc1RhcmdldFZhbHVlID8gc1RhcmdldFZhbHVlIDogdW5kZWZpbmVkO1xufTtcbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdmFsdWUgaGVscCBhbm5vdGF0aW9uIGRlZmluZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGhhcyBhIHZhbHVlIGhlbHBcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc1ZhbHVlSGVscCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0ISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0IHx8XG5cdFx0ISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0UmVmZXJlbmNlcyB8fFxuXHRcdCEhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyB8fFxuXHRcdCEhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdE1hcHBpbmdcblx0KTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdmFsdWUgaGVscCB3aXRoIGZpeGVkIHZhbHVlIGFubm90YXRpb24gZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgdmFsdWUgaGVscFxuICovXG5leHBvcnQgY29uc3QgaGFzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdmFsdWUgaGVscCBmb3IgdmFsaWRhdGlvbiBhbm5vdGF0aW9uIGRlZmluZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGhhcyBhIHZhbHVlIGhlbHBcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc1ZhbHVlTGlzdEZvclZhbGlkYXRpb24gPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdEZvclZhbGlkYXRpb24gIT09IHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBoYXNUaW1lem9uZSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUgIT09IHVuZGVmaW5lZDtcbn07XG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBpcyBhIHVuaXQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY2hlY2tcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhIHVuaXRcbiAqL1xuZXhwb3J0IGNvbnN0IGlzVW5pdCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc1VuaXQ/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyBhIHVuaXQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY2hlY2tcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSB1bml0XG4gKi9cblxuZXhwb3J0IGNvbnN0IGhhc1VuaXQgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdCAhPT0gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaXMgYSBjdXJyZW5jeSBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBjaGVja1xuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGEgY3VycmVuY3lcbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ3VycmVuY3kgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNDdXJyZW5jeT8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgY3VycmVuY3kgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY2hlY2tcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSBjdXJyZW5jeVxuICovXG5leHBvcnQgY29uc3QgaGFzQ3VycmVuY3kgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgIT09IHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBoYXNTdGF0aWNQZXJjZW50VW5pdCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdD8udG9TdHJpbmcoKSA9PT0gXCIlXCI7XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNBLFVBQVUs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