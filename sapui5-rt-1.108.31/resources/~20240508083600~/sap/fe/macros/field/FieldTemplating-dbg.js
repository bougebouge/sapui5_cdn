/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/CommonFormatters", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/FieldControlHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/ui/model/json/JSONModel"], function (BindingHelper, BindingToolkit, CommonFormatters, DataModelPathHelper, FieldControlHelper, PropertyHelper, UIFormatters, JSONModel) {
  "use strict";

  var _exports = {};
  var isReadOnlyExpression = FieldControlHelper.isReadOnlyExpression;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var transformRecursively = BindingToolkit.transformRecursively;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isComplexTypeExpression = BindingToolkit.isComplexTypeExpression;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  /**
   * Recursively add the text arrangement to a binding expression.
   *
   * @param bindingExpressionToEnhance The binding expression to be enhanced
   * @param fullContextPath The current context path we're on (to properly resolve the text arrangement properties)
   * @returns An updated expression containing the text arrangement binding.
   */
  var addTextArrangementToBindingExpression = function (bindingExpressionToEnhance, fullContextPath) {
    return transformRecursively(bindingExpressionToEnhance, "PathInModel", function (expression) {
      var outExpression = expression;
      if (expression.modelName === undefined) {
        // In case of default model we then need to resolve the text arrangement property
        var oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
        outExpression = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelPath, expression);
      }
      return outExpression;
    });
  };
  _exports.addTextArrangementToBindingExpression = addTextArrangementToBindingExpression;
  var formatValueRecursively = function (bindingExpressionToEnhance, fullContextPath) {
    return transformRecursively(bindingExpressionToEnhance, "PathInModel", function (expression) {
      var outExpression = expression;
      if (expression.modelName === undefined) {
        // In case of default model we then need to resolve the text arrangement property
        var oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
        outExpression = UIFormatters.formatWithTypeInformation(oPropertyDataModelPath.targetObject, expression);
      }
      return outExpression;
    });
  };
  _exports.formatValueRecursively = formatValueRecursively;
  var getTextBindingExpression = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    return getTextBinding(oPropertyDataModelObjectPath, fieldFormatOptions, true);
  };
  _exports.getTextBindingExpression = getTextBindingExpression;
  var getTextBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    var _oPropertyDataModelOb, _oPropertyDataModelOb2, _oPropertyDataModelOb3, _oPropertyDataModelOb4, _oPropertyDataModelOb5, _oPropertyDataModelOb6, _oPropertyDataModelOb7, _oPropertyDataModelOb8, _oPropertyDataModelOb9, _oPropertyDataModelOb10, _oPropertyDataModelOb11, _oPropertyDataModelOb12, _oPropertyDataModelOb13, _oPropertyDataModelOb14, _oPropertyDataModelOb15;
    var asObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (((_oPropertyDataModelOb = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb === void 0 ? void 0 : _oPropertyDataModelOb.$Type) === "com.sap.vocabularies.UI.v1.DataField" || ((_oPropertyDataModelOb2 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb2 === void 0 ? void 0 : _oPropertyDataModelOb2.$Type) === "com.sap.vocabularies.UI.v1.DataPointType" || ((_oPropertyDataModelOb3 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb3 === void 0 ? void 0 : _oPropertyDataModelOb3.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath" || ((_oPropertyDataModelOb4 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb4 === void 0 ? void 0 : _oPropertyDataModelOb4.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || ((_oPropertyDataModelOb5 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb5 === void 0 ? void 0 : _oPropertyDataModelOb5.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || ((_oPropertyDataModelOb6 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb6 === void 0 ? void 0 : _oPropertyDataModelOb6.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithAction") {
      // If there is no resolved property, the value is returned as a constant
      var fieldValue = oPropertyDataModelObjectPath.targetObject.Value || "";
      return compileExpression(constant(fieldValue));
    }
    if (PropertyHelper.isPathExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
      oPropertyDataModelObjectPath = enhanceDataModelPath(oPropertyDataModelObjectPath, oPropertyDataModelObjectPath.targetObject.path);
    }
    var oBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
    var oTargetBinding;
    if ((_oPropertyDataModelOb7 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb7 !== void 0 && (_oPropertyDataModelOb8 = _oPropertyDataModelOb7.annotations) !== null && _oPropertyDataModelOb8 !== void 0 && (_oPropertyDataModelOb9 = _oPropertyDataModelOb8.Measures) !== null && _oPropertyDataModelOb9 !== void 0 && _oPropertyDataModelOb9.Unit || (_oPropertyDataModelOb10 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb10 !== void 0 && (_oPropertyDataModelOb11 = _oPropertyDataModelOb10.annotations) !== null && _oPropertyDataModelOb11 !== void 0 && (_oPropertyDataModelOb12 = _oPropertyDataModelOb11.Measures) !== null && _oPropertyDataModelOb12 !== void 0 && _oPropertyDataModelOb12.ISOCurrency) {
      oTargetBinding = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oBindingExpression);
      if ((fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.measureDisplayMode) === "Hidden" && isComplexTypeExpression(oTargetBinding)) {
        // TODO: Refactor once types are less generic here
        oTargetBinding.formatOptions = _objectSpread(_objectSpread({}, oTargetBinding.formatOptions), {}, {
          showMeasure: false
        });
      }
    } else if ((_oPropertyDataModelOb13 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb13 !== void 0 && (_oPropertyDataModelOb14 = _oPropertyDataModelOb13.annotations) !== null && _oPropertyDataModelOb14 !== void 0 && (_oPropertyDataModelOb15 = _oPropertyDataModelOb14.Common) !== null && _oPropertyDataModelOb15 !== void 0 && _oPropertyDataModelOb15.Timezone) {
      oTargetBinding = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oBindingExpression, false, true);
    } else {
      oTargetBinding = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelObjectPath, oBindingExpression, fieldFormatOptions);
    }
    if (asObject) {
      return oTargetBinding;
    }
    // We don't include $$nopatch and parseKeepEmptyString as they make no sense in the text binding case
    return compileExpression(oTargetBinding);
  };
  _exports.getTextBinding = getTextBinding;
  var getValueBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    var ignoreUnit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var ignoreFormatting = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var bindingParameters = arguments.length > 4 ? arguments[4] : undefined;
    var targetTypeAny = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
    var keepUnit = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    if (PropertyHelper.isPathExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
      var oNavPath = oPropertyDataModelObjectPath.targetEntityType.resolvePath(oPropertyDataModelObjectPath.targetObject.path, true);
      oPropertyDataModelObjectPath.targetObject = oNavPath.target;
      oNavPath.visitedObjects.forEach(function (oNavObj) {
        if (oNavObj && oNavObj._type === "NavigationProperty") {
          oPropertyDataModelObjectPath.navigationProperties.push(oNavObj);
        }
      });
    }
    var targetObject = oPropertyDataModelObjectPath.targetObject;
    if (PropertyHelper.isProperty(targetObject)) {
      var oBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      if (isPathInModelExpression(oBindingExpression)) {
        var _targetObject$annotat, _targetObject$annotat2, _targetObject$annotat3, _targetObject$annotat4, _targetObject$annotat5, _targetObject$annotat6;
        if ((_targetObject$annotat = targetObject.annotations) !== null && _targetObject$annotat !== void 0 && (_targetObject$annotat2 = _targetObject$annotat.Communication) !== null && _targetObject$annotat2 !== void 0 && _targetObject$annotat2.IsEmailAddress) {
          oBindingExpression.type = "sap.fe.core.type.Email";
        } else if (!ignoreUnit && ((_targetObject$annotat3 = targetObject.annotations) !== null && _targetObject$annotat3 !== void 0 && (_targetObject$annotat4 = _targetObject$annotat3.Measures) !== null && _targetObject$annotat4 !== void 0 && _targetObject$annotat4.ISOCurrency || (_targetObject$annotat5 = targetObject.annotations) !== null && _targetObject$annotat5 !== void 0 && (_targetObject$annotat6 = _targetObject$annotat5.Measures) !== null && _targetObject$annotat6 !== void 0 && _targetObject$annotat6.Unit)) {
          oBindingExpression = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oBindingExpression, true, keepUnit ? undefined : {
            showMeasure: false
          });
        } else {
          var _oPropertyDataModelOb16, _oPropertyDataModelOb17;
          var oTimezone = (_oPropertyDataModelOb16 = oPropertyDataModelObjectPath.targetObject.annotations) === null || _oPropertyDataModelOb16 === void 0 ? void 0 : (_oPropertyDataModelOb17 = _oPropertyDataModelOb16.Common) === null || _oPropertyDataModelOb17 === void 0 ? void 0 : _oPropertyDataModelOb17.Timezone;
          if (oTimezone) {
            oBindingExpression = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oBindingExpression, true);
          } else {
            oBindingExpression = UIFormatters.formatWithTypeInformation(targetObject, oBindingExpression);
          }
          if (isPathInModelExpression(oBindingExpression) && oBindingExpression.type === "sap.ui.model.odata.type.String") {
            oBindingExpression.formatOptions = {
              parseKeepsEmptyString: true
            };
          }
        }
        if (isPathInModelExpression(oBindingExpression)) {
          if (ignoreFormatting) {
            delete oBindingExpression.formatOptions;
            delete oBindingExpression.constraints;
            delete oBindingExpression.type;
          }
          if (bindingParameters) {
            oBindingExpression.parameters = bindingParameters;
          }
          if (targetTypeAny) {
            oBindingExpression.targetType = "any";
          }
        }
        return compileExpression(oBindingExpression);
      } else {
        // if somehow we could not compile the binding -> return empty string
        return "";
      }
    } else if ((targetObject === null || targetObject === void 0 ? void 0 : targetObject.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || (targetObject === null || targetObject === void 0 ? void 0 : targetObject.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath") {
      return compileExpression(getExpressionFromAnnotation(targetObject.Value));
    } else {
      return "";
    }
  };
  _exports.getValueBinding = getValueBinding;
  var getAssociatedTextBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    var textPropertyPath = PropertyHelper.getAssociatedTextPropertyPath(oPropertyDataModelObjectPath.targetObject);
    if (textPropertyPath) {
      var oTextPropertyPath = enhanceDataModelPath(oPropertyDataModelObjectPath, textPropertyPath);
      return getValueBinding(oTextPropertyPath, fieldFormatOptions, true, true, {
        $$noPatch: true
      });
    }
    return undefined;
  };
  _exports.getAssociatedTextBinding = getAssociatedTextBinding;
  var isUsedInNavigationWithQuickViewFacets = function (oDataModelPath, oProperty) {
    var _oDataModelPath$targe, _oDataModelPath$targe2, _oDataModelPath$targe3, _oDataModelPath$targe4;
    var aNavigationProperties = (oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe = oDataModelPath.targetEntityType) === null || _oDataModelPath$targe === void 0 ? void 0 : _oDataModelPath$targe.navigationProperties) || [];
    var aSemanticObjects = (oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe2 = oDataModelPath.targetEntityType) === null || _oDataModelPath$targe2 === void 0 ? void 0 : (_oDataModelPath$targe3 = _oDataModelPath$targe2.annotations) === null || _oDataModelPath$targe3 === void 0 ? void 0 : (_oDataModelPath$targe4 = _oDataModelPath$targe3.Common) === null || _oDataModelPath$targe4 === void 0 ? void 0 : _oDataModelPath$targe4.SemanticKey) || [];
    var bIsUsedInNavigationWithQuickViewFacets = false;
    aNavigationProperties.forEach(function (oNavProp) {
      if (oNavProp.referentialConstraint && oNavProp.referentialConstraint.length) {
        oNavProp.referentialConstraint.forEach(function (oRefConstraint) {
          if ((oRefConstraint === null || oRefConstraint === void 0 ? void 0 : oRefConstraint.sourceProperty) === oProperty.name) {
            var _oNavProp$targetType, _oNavProp$targetType$, _oNavProp$targetType$2;
            if (oNavProp !== null && oNavProp !== void 0 && (_oNavProp$targetType = oNavProp.targetType) !== null && _oNavProp$targetType !== void 0 && (_oNavProp$targetType$ = _oNavProp$targetType.annotations) !== null && _oNavProp$targetType$ !== void 0 && (_oNavProp$targetType$2 = _oNavProp$targetType$.UI) !== null && _oNavProp$targetType$2 !== void 0 && _oNavProp$targetType$2.QuickViewFacets) {
              bIsUsedInNavigationWithQuickViewFacets = true;
            }
          }
        });
      }
    });
    if (oDataModelPath.startingEntitySet !== oDataModelPath.targetEntitySet) {
      var _oDataModelPath$targe5, _oDataModelPath$targe6, _oDataModelPath$targe7;
      var aIsTargetSemanticKey = aSemanticObjects.some(function (oSemantic) {
        var _oSemantic$$target;
        return (oSemantic === null || oSemantic === void 0 ? void 0 : (_oSemantic$$target = oSemantic.$target) === null || _oSemantic$$target === void 0 ? void 0 : _oSemantic$$target.name) === oProperty.name;
      });
      if ((aIsTargetSemanticKey || oProperty.isKey) && oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe5 = oDataModelPath.targetEntityType) !== null && _oDataModelPath$targe5 !== void 0 && (_oDataModelPath$targe6 = _oDataModelPath$targe5.annotations) !== null && _oDataModelPath$targe6 !== void 0 && (_oDataModelPath$targe7 = _oDataModelPath$targe6.UI) !== null && _oDataModelPath$targe7 !== void 0 && _oDataModelPath$targe7.QuickViewFacets) {
        bIsUsedInNavigationWithQuickViewFacets = true;
      }
    }
    return bIsUsedInNavigationWithQuickViewFacets;
  };
  _exports.isUsedInNavigationWithQuickViewFacets = isUsedInNavigationWithQuickViewFacets;
  var isRetrieveTextFromValueListEnabled = function (oPropertyPath, fieldFormatOptions) {
    var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3;
    var oProperty = PropertyHelper.isPathExpression(oPropertyPath) && oPropertyPath.$target || oPropertyPath;
    if (!((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.Common) !== null && _oProperty$annotation2 !== void 0 && _oProperty$annotation2.Text) && !((_oProperty$annotation3 = oProperty.annotations) !== null && _oProperty$annotation3 !== void 0 && _oProperty$annotation3.Measures) && PropertyHelper.hasValueHelp(oProperty) && fieldFormatOptions.textAlignMode === "Form") {
      return true;
    }
    return false;
  };

  /**
   * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
   *
   * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
   *
   * @param dataFieldModelPath The metapath referring to the annotation we are evaluating.
   * @param [formatOptions] FormatOptions optional.
   * @param formatOptions.isAnalytics This flag is set when using an analytical table.
   * @returns An expression that you can bind to the UI.
   */
  _exports.isRetrieveTextFromValueListEnabled = isRetrieveTextFromValueListEnabled;
  var getVisibleExpression = function (dataFieldModelPath, formatOptions) {
    var _targetObject$Target, _targetObject$Target$, _targetObject$annotat7, _targetObject$annotat8, _propertyValue$annota, _propertyValue$annota2;
    var targetObject = dataFieldModelPath.targetObject;
    var propertyValue;
    if (targetObject) {
      switch (targetObject.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        case "com.sap.vocabularies.UI.v1.DataPointType":
          propertyValue = targetObject.Value.$target;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          // if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
          if ((targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$Target = targetObject.Target) === null || _targetObject$Target === void 0 ? void 0 : (_targetObject$Target$ = _targetObject$Target.$target) === null || _targetObject$Target$ === void 0 ? void 0 : _targetObject$Target$.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _targetObject$Target$2;
            propertyValue = (_targetObject$Target$2 = targetObject.Target.$target) === null || _targetObject$Target$2 === void 0 ? void 0 : _targetObject$Target$2.Value.$target;
            break;
          }
        // eslint-disable-next-line no-fallthrough
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        default:
          propertyValue = undefined;
      }
    }
    var isAnalyticalGroupHeaderExpanded = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? UI.IsExpanded : constant(false);
    var isAnalyticalLeaf = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? equal(UI.NodeLevel, 0) : constant(false);

    // A data field is visible if:
    // - the UI.Hidden expression in the original annotation does not evaluate to 'true'
    // - the UI.Hidden expression in the target property does not evaluate to 'true'
    // - in case of Analytics it's not visible for an expanded GroupHeader
    return compileExpression(and.apply(void 0, [not(equal(getExpressionFromAnnotation(targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$annotat7 = targetObject.annotations) === null || _targetObject$annotat7 === void 0 ? void 0 : (_targetObject$annotat8 = _targetObject$annotat7.UI) === null || _targetObject$annotat8 === void 0 ? void 0 : _targetObject$annotat8.Hidden), true)), ifElse(!!propertyValue, propertyValue && not(equal(getExpressionFromAnnotation((_propertyValue$annota = propertyValue.annotations) === null || _propertyValue$annota === void 0 ? void 0 : (_propertyValue$annota2 = _propertyValue$annota.UI) === null || _propertyValue$annota2 === void 0 ? void 0 : _propertyValue$annota2.Hidden), true)), true), or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)]));
  };
  _exports.getVisibleExpression = getVisibleExpression;
  var QVTextBinding = function (oPropertyDataModelObjectPath, oPropertyValueDataModelObjectPath, fieldFormatOptions) {
    var asObject = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var returnValue = getValueBinding(oPropertyDataModelObjectPath, fieldFormatOptions, asObject);
    if (returnValue === "") {
      returnValue = getTextBinding(oPropertyValueDataModelObjectPath, fieldFormatOptions, asObject);
    }
    return returnValue;
  };
  _exports.QVTextBinding = QVTextBinding;
  var getQuickViewType = function (oPropertyDataModelObjectPath) {
    var _targetObject$$target, _targetObject$$target2, _targetObject$$target3, _targetObject$$target4, _targetObject$$target5, _targetObject$$target6;
    var targetObject = oPropertyDataModelObjectPath.targetObject;
    if (targetObject !== null && targetObject !== void 0 && (_targetObject$$target = targetObject.$target) !== null && _targetObject$$target !== void 0 && (_targetObject$$target2 = _targetObject$$target.annotations) !== null && _targetObject$$target2 !== void 0 && (_targetObject$$target3 = _targetObject$$target2.Communication) !== null && _targetObject$$target3 !== void 0 && _targetObject$$target3.IsEmailAddress) {
      return "email";
    }
    if (targetObject !== null && targetObject !== void 0 && (_targetObject$$target4 = targetObject.$target) !== null && _targetObject$$target4 !== void 0 && (_targetObject$$target5 = _targetObject$$target4.annotations) !== null && _targetObject$$target5 !== void 0 && (_targetObject$$target6 = _targetObject$$target5.Communication) !== null && _targetObject$$target6 !== void 0 && _targetObject$$target6.IsPhoneNumber) {
      return "phone";
    }
    return "text";
  };
  _exports.getQuickViewType = getQuickViewType;
  var getSemanticObjectExpressionToResolve = function (oAnnotations) {
    var aSemObjExprToResolve = [];
    if (oAnnotations) {
      var aSemObjkeys = Object.keys(oAnnotations).filter(function (element) {
        return element === "SemanticObject" || element.startsWith("SemanticObject#");
      });
      for (var iSemObjCount = 0; iSemObjCount < aSemObjkeys.length; iSemObjCount++) {
        var sSemObjExpression = compileExpression(getExpressionFromAnnotation(oAnnotations[aSemObjkeys[iSemObjCount]]));
        aSemObjExprToResolve.push({
          key: (sSemObjExpression === null || sSemObjExpression === void 0 ? void 0 : sSemObjExpression.indexOf("{")) === -1 ? sSemObjExpression : sSemObjExpression === null || sSemObjExpression === void 0 ? void 0 : sSemObjExpression.split("{")[1].split("}")[0],
          value: sSemObjExpression
        });
      }
    }
    return aSemObjExprToResolve;
  };
  _exports.getSemanticObjectExpressionToResolve = getSemanticObjectExpressionToResolve;
  var getSemanticObjects = function (aSemObjExprToResolve) {
    if (aSemObjExprToResolve.length > 0) {
      var sCustomDataKey = "";
      var sCustomDataValue = "";
      var aSemObjCustomData = [];
      for (var iSemObjCount = 0; iSemObjCount < aSemObjExprToResolve.length; iSemObjCount++) {
        sCustomDataKey = aSemObjExprToResolve[iSemObjCount].key;
        sCustomDataValue = compileExpression(getExpressionFromAnnotation(aSemObjExprToResolve[iSemObjCount].value));
        aSemObjCustomData.push({
          key: sCustomDataKey,
          value: sCustomDataValue
        });
      }
      var oSemanticObjectsModel = new JSONModel(aSemObjCustomData);
      oSemanticObjectsModel.$$valueAsPromise = true;
      var oSemObjBindingContext = oSemanticObjectsModel.createBindingContext("/");
      return oSemObjBindingContext;
    } else {
      return new JSONModel([]).createBindingContext("/");
    }
  };

  /**
   * Method to get MultipleLines for a DataField.
   *
   * @name getMultipleLinesForDataField
   * @param {any} oThis The current object
   * @param {string} sPropertyType The property type
   * @param {boolean} isMultiLineText The property isMultiLineText
   * @returns {CompiledBindingToolkitExpression<string>} The binding expression to determine if a data field should be a MultiLineText or not
   * @public
   */
  _exports.getSemanticObjects = getSemanticObjects;
  var getMultipleLinesForDataField = function (oThis, sPropertyType, isMultiLineText) {
    if (oThis.wrap === "false") {
      return false;
    }
    if (sPropertyType !== "Edm.String") {
      return isMultiLineText;
    }
    if (oThis.editMode === "Display") {
      return true;
    }
    if (oThis.editMode.indexOf("{") > -1) {
      // If the editMode is computed then we just care about the page editMode to determine if the multiline property should be taken into account
      return compileExpression(or(not(UI.IsEditable), isMultiLineText));
    }
    return isMultiLineText;
  };
  _exports.getMultipleLinesForDataField = getMultipleLinesForDataField;
  var _getDraftAdministrativeDataType = function (oMetaModel, sEntityType) {
    return oMetaModel.requestObject("/".concat(sEntityType, "/DraftAdministrativeData/"));
  };
  _exports._getDraftAdministrativeDataType = _getDraftAdministrativeDataType;
  var getBindingForDraftAdminBlockInline = function (iContext, sEntityType) {
    return _getDraftAdministrativeDataType(iContext.getModel(), sEntityType).then(function (oDADEntityType) {
      var aBindings = [];
      if (oDADEntityType.InProcessByUserDescription) {
        aBindings.push(pathInModel("DraftAdministrativeData/InProcessByUserDescription"));
      }
      aBindings.push(pathInModel("DraftAdministrativeData/InProcessByUser"));
      if (oDADEntityType.LastChangedByUserDescription) {
        aBindings.push(pathInModel("DraftAdministrativeData/LastChangedByUserDescription"));
      }
      aBindings.push(pathInModel("DraftAdministrativeData/LastChangedByUser"));
      return compileExpression(ifElse(pathInModel("HasDraftEntity"), or.apply(void 0, aBindings), resolveBindingString("")));
    });
  };
  _exports.getBindingForDraftAdminBlockInline = getBindingForDraftAdminBlockInline;
  var _hasValueHelpToShow = function (oProperty, measureDisplayMode) {
    // we show a value help if teh property has one or if its visible unit has one
    var oPropertyUnit = PropertyHelper.getAssociatedUnitProperty(oProperty);
    var oPropertyCurrency = PropertyHelper.getAssociatedCurrencyProperty(oProperty);
    return PropertyHelper.hasValueHelp(oProperty) && oProperty.type !== "Edm.Boolean" || measureDisplayMode !== "Hidden" && (oPropertyUnit && PropertyHelper.hasValueHelp(oPropertyUnit) || oPropertyCurrency && PropertyHelper.hasValueHelp(oPropertyCurrency));
  };

  /**
   * Sets Edit Style properties for Field in case of Macro Field(Field.metadata.ts) and MassEditDialog fields.
   *
   * @param oProps Field Properties for the Macro Field.
   * @param oDataField DataField Object.
   * @param oDataModelPath DataModel Object Path to the property.
   * @param onlyEditStyle To add only editStyle.
   */
  var setEditStyleProperties = function (oProps, oDataField, oDataModelPath, onlyEditStyle) {
    var _oDataField$Target, _oDataField$Target$$t, _oProps$formatOptions, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6, _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12;
    var oProperty = oDataModelPath.targetObject;
    if (!PropertyHelper.isProperty(oProperty)) {
      oProps.editStyle = null;
      return;
    }
    if (!onlyEditStyle) {
      oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions);
    }
    switch (oDataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        if (((_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : (_oDataField$Target$$t = _oDataField$Target.$target) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.Visualization) === "UI.VisualizationType/Rating") {
          oProps.editStyle = "RatingIndicator";
          return;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataPointType":
        if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.Visualization) === "UI.VisualizationType/Rating") {
          oProps.editStyle = "RatingIndicator";
          return;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        oProps.editStyle = null;
        return;
      default:
    }
    if (_hasValueHelpToShow(oProperty, (_oProps$formatOptions = oProps.formatOptions) === null || _oProps$formatOptions === void 0 ? void 0 : _oProps$formatOptions.measureDisplayMode)) {
      if (!onlyEditStyle) {
        var _oProps$formatOptions2;
        oProps.textBindingExpression = getAssociatedTextBinding(oDataModelPath, oProps.formatOptions);
        if (((_oProps$formatOptions2 = oProps.formatOptions) === null || _oProps$formatOptions2 === void 0 ? void 0 : _oProps$formatOptions2.measureDisplayMode) !== "Hidden") {
          // for the MDC Field we need to keep the unit inside the valueBindingExpression
          oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions, false, false, undefined, false, true);
        }
      }
      oProps.editStyle = "InputWithValueHelp";
      return;
    }
    switch (oProperty.type) {
      case "Edm.Date":
        oProps.editStyle = "DatePicker";
        return;
      case "Edm.Time":
      case "Edm.TimeOfDay":
        oProps.editStyle = "TimePicker";
        return;
      case "Edm.DateTime":
      case "Edm.DateTimeOffset":
        oProps.editStyle = "DateTimePicker";
        // No timezone defined. Also for compatibility reasons.
        if (!((_oProperty$annotation4 = oProperty.annotations) !== null && _oProperty$annotation4 !== void 0 && (_oProperty$annotation5 = _oProperty$annotation4.Common) !== null && _oProperty$annotation5 !== void 0 && _oProperty$annotation5.Timezone)) {
          oProps.showTimezone = undefined;
        } else {
          oProps.showTimezone = true;
        }
        return;
      case "Edm.Boolean":
        oProps.editStyle = "CheckBox";
        return;
      case "Edm.Stream":
        oProps.editStyle = "File";
        return;
      case "Edm.String":
        if ((_oProperty$annotation6 = oProperty.annotations) !== null && _oProperty$annotation6 !== void 0 && (_oProperty$annotation7 = _oProperty$annotation6.UI) !== null && _oProperty$annotation7 !== void 0 && (_oProperty$annotation8 = _oProperty$annotation7.MultiLineText) !== null && _oProperty$annotation8 !== void 0 && _oProperty$annotation8.valueOf()) {
          oProps.editStyle = "TextArea";
          return;
        }
        break;
      default:
        oProps.editStyle = "Input";
    }
    if ((_oProperty$annotation9 = oProperty.annotations) !== null && _oProperty$annotation9 !== void 0 && (_oProperty$annotation10 = _oProperty$annotation9.Measures) !== null && _oProperty$annotation10 !== void 0 && _oProperty$annotation10.ISOCurrency || (_oProperty$annotation11 = oProperty.annotations) !== null && _oProperty$annotation11 !== void 0 && (_oProperty$annotation12 = _oProperty$annotation11.Measures) !== null && _oProperty$annotation12 !== void 0 && _oProperty$annotation12.Unit) {
      if (!onlyEditStyle) {
        oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        oProps.descriptionBindingExpression = UIFormatters.ifUnitEditable(oProperty, "", UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        var unitProperty = PropertyHelper.getAssociatedCurrencyProperty(oProperty) || PropertyHelper.getAssociatedUnitProperty(oProperty);
        oProps.unitEditable = compileExpression(not(isReadOnlyExpression(unitProperty)));
      }
      oProps.editStyle = "InputWithUnit";
      return;
    }
    oProps.editStyle = "Input";
  };
  getBindingForDraftAdminBlockInline.requiresIContext = true;
  _exports.setEditStyleProperties = setEditStyleProperties;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhZGRUZXh0QXJyYW5nZW1lbnRUb0JpbmRpbmdFeHByZXNzaW9uIiwiYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UiLCJmdWxsQ29udGV4dFBhdGgiLCJ0cmFuc2Zvcm1SZWN1cnNpdmVseSIsImV4cHJlc3Npb24iLCJvdXRFeHByZXNzaW9uIiwibW9kZWxOYW1lIiwidW5kZWZpbmVkIiwib1Byb3BlcnR5RGF0YU1vZGVsUGF0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwicGF0aCIsIkNvbW1vbkZvcm1hdHRlcnMiLCJnZXRCaW5kaW5nV2l0aFRleHRBcnJhbmdlbWVudCIsImZvcm1hdFZhbHVlUmVjdXJzaXZlbHkiLCJVSUZvcm1hdHRlcnMiLCJmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uIiwidGFyZ2V0T2JqZWN0IiwiZ2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uIiwib1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCIsImZpZWxkRm9ybWF0T3B0aW9ucyIsImdldFRleHRCaW5kaW5nIiwiYXNPYmplY3QiLCIkVHlwZSIsImZpZWxkVmFsdWUiLCJWYWx1ZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiY29uc3RhbnQiLCJQcm9wZXJ0eUhlbHBlciIsImlzUGF0aEV4cHJlc3Npb24iLCIkdGFyZ2V0Iiwib0JpbmRpbmdFeHByZXNzaW9uIiwicGF0aEluTW9kZWwiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwib1RhcmdldEJpbmRpbmciLCJhbm5vdGF0aW9ucyIsIk1lYXN1cmVzIiwiVW5pdCIsIklTT0N1cnJlbmN5IiwiZ2V0QmluZGluZ1dpdGhVbml0T3JDdXJyZW5jeSIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsImlzQ29tcGxleFR5cGVFeHByZXNzaW9uIiwiZm9ybWF0T3B0aW9ucyIsInNob3dNZWFzdXJlIiwiQ29tbW9uIiwiVGltZXpvbmUiLCJnZXRCaW5kaW5nV2l0aFRpbWV6b25lIiwiZ2V0VmFsdWVCaW5kaW5nIiwiaWdub3JlVW5pdCIsImlnbm9yZUZvcm1hdHRpbmciLCJiaW5kaW5nUGFyYW1ldGVycyIsInRhcmdldFR5cGVBbnkiLCJrZWVwVW5pdCIsIm9OYXZQYXRoIiwidGFyZ2V0RW50aXR5VHlwZSIsInJlc29sdmVQYXRoIiwidGFyZ2V0IiwidmlzaXRlZE9iamVjdHMiLCJmb3JFYWNoIiwib05hdk9iaiIsIl90eXBlIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJwdXNoIiwiaXNQcm9wZXJ0eSIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwiQ29tbXVuaWNhdGlvbiIsIklzRW1haWxBZGRyZXNzIiwidHlwZSIsIm9UaW1lem9uZSIsInBhcnNlS2VlcHNFbXB0eVN0cmluZyIsImNvbnN0cmFpbnRzIiwicGFyYW1ldGVycyIsInRhcmdldFR5cGUiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJnZXRBc3NvY2lhdGVkVGV4dEJpbmRpbmciLCJ0ZXh0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGgiLCJvVGV4dFByb3BlcnR5UGF0aCIsIiQkbm9QYXRjaCIsImlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMiLCJvRGF0YU1vZGVsUGF0aCIsIm9Qcm9wZXJ0eSIsImFOYXZpZ2F0aW9uUHJvcGVydGllcyIsImFTZW1hbnRpY09iamVjdHMiLCJTZW1hbnRpY0tleSIsImJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzIiwib05hdlByb3AiLCJyZWZlcmVudGlhbENvbnN0cmFpbnQiLCJsZW5ndGgiLCJvUmVmQ29uc3RyYWludCIsInNvdXJjZVByb3BlcnR5IiwibmFtZSIsIlVJIiwiUXVpY2tWaWV3RmFjZXRzIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJ0YXJnZXRFbnRpdHlTZXQiLCJhSXNUYXJnZXRTZW1hbnRpY0tleSIsInNvbWUiLCJvU2VtYW50aWMiLCJpc0tleSIsImlzUmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdEVuYWJsZWQiLCJvUHJvcGVydHlQYXRoIiwiVGV4dCIsImhhc1ZhbHVlSGVscCIsInRleHRBbGlnbk1vZGUiLCJnZXRWaXNpYmxlRXhwcmVzc2lvbiIsImRhdGFGaWVsZE1vZGVsUGF0aCIsInByb3BlcnR5VmFsdWUiLCJUYXJnZXQiLCJpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkIiwiaXNBbmFseXRpY3MiLCJJc0V4cGFuZGVkIiwiaXNBbmFseXRpY2FsTGVhZiIsImVxdWFsIiwiTm9kZUxldmVsIiwiYW5kIiwibm90IiwiSGlkZGVuIiwiaWZFbHNlIiwib3IiLCJRVlRleHRCaW5kaW5nIiwib1Byb3BlcnR5VmFsdWVEYXRhTW9kZWxPYmplY3RQYXRoIiwicmV0dXJuVmFsdWUiLCJnZXRRdWlja1ZpZXdUeXBlIiwiSXNQaG9uZU51bWJlciIsImdldFNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSIsIm9Bbm5vdGF0aW9ucyIsImFTZW1PYmpFeHByVG9SZXNvbHZlIiwiYVNlbU9iamtleXMiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwiZWxlbWVudCIsInN0YXJ0c1dpdGgiLCJpU2VtT2JqQ291bnQiLCJzU2VtT2JqRXhwcmVzc2lvbiIsImtleSIsImluZGV4T2YiLCJzcGxpdCIsInZhbHVlIiwiZ2V0U2VtYW50aWNPYmplY3RzIiwic0N1c3RvbURhdGFLZXkiLCJzQ3VzdG9tRGF0YVZhbHVlIiwiYVNlbU9iakN1c3RvbURhdGEiLCJvU2VtYW50aWNPYmplY3RzTW9kZWwiLCJKU09OTW9kZWwiLCIkJHZhbHVlQXNQcm9taXNlIiwib1NlbU9iakJpbmRpbmdDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJnZXRNdWx0aXBsZUxpbmVzRm9yRGF0YUZpZWxkIiwib1RoaXMiLCJzUHJvcGVydHlUeXBlIiwiaXNNdWx0aUxpbmVUZXh0Iiwid3JhcCIsImVkaXRNb2RlIiwiSXNFZGl0YWJsZSIsIl9nZXREcmFmdEFkbWluaXN0cmF0aXZlRGF0YVR5cGUiLCJvTWV0YU1vZGVsIiwic0VudGl0eVR5cGUiLCJyZXF1ZXN0T2JqZWN0IiwiZ2V0QmluZGluZ0ZvckRyYWZ0QWRtaW5CbG9ja0lubGluZSIsImlDb250ZXh0IiwiZ2V0TW9kZWwiLCJ0aGVuIiwib0RBREVudGl0eVR5cGUiLCJhQmluZGluZ3MiLCJJblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbiIsIkxhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb24iLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsIl9oYXNWYWx1ZUhlbHBUb1Nob3ciLCJvUHJvcGVydHlVbml0IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsIm9Qcm9wZXJ0eUN1cnJlbmN5IiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJzZXRFZGl0U3R5bGVQcm9wZXJ0aWVzIiwib1Byb3BzIiwib0RhdGFGaWVsZCIsIm9ubHlFZGl0U3R5bGUiLCJlZGl0U3R5bGUiLCJ2YWx1ZUJpbmRpbmdFeHByZXNzaW9uIiwiVmlzdWFsaXphdGlvbiIsInRleHRCaW5kaW5nRXhwcmVzc2lvbiIsInNob3dUaW1lem9uZSIsIk11bHRpTGluZVRleHQiLCJ2YWx1ZU9mIiwidW5pdEJpbmRpbmdFeHByZXNzaW9uIiwiZ2V0QmluZGluZ0ZvclVuaXRPckN1cnJlbmN5IiwiZGVzY3JpcHRpb25CaW5kaW5nRXhwcmVzc2lvbiIsImlmVW5pdEVkaXRhYmxlIiwidW5pdFByb3BlcnR5IiwidW5pdEVkaXRhYmxlIiwiaXNSZWFkT25seUV4cHJlc3Npb24iLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZFRlbXBsYXRpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOYXZpZ2F0aW9uUHJvcGVydHksIFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIERhdGFGaWVsZFdpdGhVcmwsIERhdGFQb2ludFR5cGVUeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0ZXF1YWwsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRpc0NvbXBsZXhUeXBlRXhwcmVzc2lvbixcblx0aXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24sXG5cdG5vdCxcblx0b3IsXG5cdHBhdGhJbk1vZGVsLFxuXHRyZXNvbHZlQmluZGluZ1N0cmluZyxcblx0dHJhbnNmb3JtUmVjdXJzaXZlbHlcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCAqIGFzIENvbW1vbkZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvQ29tbW9uRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZW5oYW5jZURhdGFNb2RlbFBhdGgsIGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBpc1JlYWRPbmx5RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0ZpZWxkQ29udHJvbEhlbHBlclwiO1xuaW1wb3J0ICogYXMgUHJvcGVydHlIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGlzcGxheU1vZGUsIFByb3BlcnR5T3JQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgKiBhcyBVSUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgdHlwZSB7IEZpZWxkUHJvcGVydGllcyB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL0ZpZWxkLm1ldGFkYXRhXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcblxuLyoqXG4gKiBSZWN1cnNpdmVseSBhZGQgdGhlIHRleHQgYXJyYW5nZW1lbnQgdG8gYSBiaW5kaW5nIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIGJpbmRpbmdFeHByZXNzaW9uVG9FbmhhbmNlIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gYmUgZW5oYW5jZWRcbiAqIEBwYXJhbSBmdWxsQ29udGV4dFBhdGggVGhlIGN1cnJlbnQgY29udGV4dCBwYXRoIHdlJ3JlIG9uICh0byBwcm9wZXJseSByZXNvbHZlIHRoZSB0ZXh0IGFycmFuZ2VtZW50IHByb3BlcnRpZXMpXG4gKiBAcmV0dXJucyBBbiB1cGRhdGVkIGV4cHJlc3Npb24gY29udGFpbmluZyB0aGUgdGV4dCBhcnJhbmdlbWVudCBiaW5kaW5nLlxuICovXG5leHBvcnQgY29uc3QgYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0YmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2U6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+LFxuXHRmdWxsQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGhcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+IHtcblx0cmV0dXJuIHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGJpbmRpbmdFeHByZXNzaW9uVG9FbmhhbmNlLCBcIlBhdGhJbk1vZGVsXCIsIChleHByZXNzaW9uKSA9PiB7XG5cdFx0bGV0IG91dEV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+ID0gZXhwcmVzc2lvbjtcblx0XHRpZiAoZXhwcmVzc2lvbi5tb2RlbE5hbWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gSW4gY2FzZSBvZiBkZWZhdWx0IG1vZGVsIHdlIHRoZW4gbmVlZCB0byByZXNvbHZlIHRoZSB0ZXh0IGFycmFuZ2VtZW50IHByb3BlcnR5XG5cdFx0XHRjb25zdCBvUHJvcGVydHlEYXRhTW9kZWxQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZnVsbENvbnRleHRQYXRoLCBleHByZXNzaW9uLnBhdGgpO1xuXHRcdFx0b3V0RXhwcmVzc2lvbiA9IENvbW1vbkZvcm1hdHRlcnMuZ2V0QmluZGluZ1dpdGhUZXh0QXJyYW5nZW1lbnQob1Byb3BlcnR5RGF0YU1vZGVsUGF0aCwgZXhwcmVzc2lvbik7XG5cdFx0fVxuXHRcdHJldHVybiBvdXRFeHByZXNzaW9uO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5ID0gZnVuY3Rpb24gKFxuXHRiaW5kaW5nRXhwcmVzc2lvblRvRW5oYW5jZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4sXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4ge1xuXHRyZXR1cm4gdHJhbnNmb3JtUmVjdXJzaXZlbHkoYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UsIFwiUGF0aEluTW9kZWxcIiwgKGV4cHJlc3Npb24pID0+IHtcblx0XHRsZXQgb3V0RXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBleHByZXNzaW9uO1xuXHRcdGlmIChleHByZXNzaW9uLm1vZGVsTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRlZmF1bHQgbW9kZWwgd2UgdGhlbiBuZWVkIHRvIHJlc29sdmUgdGhlIHRleHQgYXJyYW5nZW1lbnQgcHJvcGVydHlcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eURhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChmdWxsQ29udGV4dFBhdGgsIGV4cHJlc3Npb24ucGF0aCk7XG5cdFx0XHRvdXRFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24ob1Byb3BlcnR5RGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QsIGV4cHJlc3Npb24pO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0RXhwcmVzc2lvbjtcblx0fSk7XG59O1xuZXhwb3J0IGNvbnN0IGdldFRleHRCaW5kaW5nRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IGRpc3BsYXlNb2RlPzogRGlzcGxheU1vZGU7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB7XG5cdHJldHVybiBnZXRUZXh0QmluZGluZyhvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBmaWVsZEZvcm1hdE9wdGlvbnMsIHRydWUpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+O1xufTtcbmV4cG9ydCBjb25zdCBnZXRUZXh0QmluZGluZyA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IGRpc3BsYXlNb2RlPzogRGlzcGxheU1vZGU7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9LFxuXHRhc09iamVjdDogYm9vbGVhbiA9IGZhbHNlXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0aWYgKFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIiB8fFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRUeXBlXCIgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXCIgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aFVybFwiIHx8XG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb25cIiB8fFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoQWN0aW9uXCJcblx0KSB7XG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gcmVzb2x2ZWQgcHJvcGVydHksIHRoZSB2YWx1ZSBpcyByZXR1cm5lZCBhcyBhIGNvbnN0YW50XG5cdFx0Y29uc3QgZmllbGRWYWx1ZSA9IG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlIHx8IFwiXCI7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGNvbnN0YW50KGZpZWxkVmFsdWUpKTtcblx0fVxuXHRpZiAoUHJvcGVydHlIZWxwZXIuaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiYgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCkge1xuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5wYXRoKTtcblx0fVxuXHRjb25zdCBvQmluZGluZ0V4cHJlc3Npb24gPSBwYXRoSW5Nb2RlbChnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpKTtcblx0bGV0IG9UYXJnZXRCaW5kaW5nO1xuXHRpZiAoXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdCB8fFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5XG5cdCkge1xuXHRcdG9UYXJnZXRCaW5kaW5nID0gVUlGb3JtYXR0ZXJzLmdldEJpbmRpbmdXaXRoVW5pdE9yQ3VycmVuY3kob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCwgb0JpbmRpbmdFeHByZXNzaW9uKTtcblx0XHRpZiAoZmllbGRGb3JtYXRPcHRpb25zPy5tZWFzdXJlRGlzcGxheU1vZGUgPT09IFwiSGlkZGVuXCIgJiYgaXNDb21wbGV4VHlwZUV4cHJlc3Npb24ob1RhcmdldEJpbmRpbmcpKSB7XG5cdFx0XHQvLyBUT0RPOiBSZWZhY3RvciBvbmNlIHR5cGVzIGFyZSBsZXNzIGdlbmVyaWMgaGVyZVxuXHRcdFx0b1RhcmdldEJpbmRpbmcuZm9ybWF0T3B0aW9ucyA9IHtcblx0XHRcdFx0Li4ub1RhcmdldEJpbmRpbmcuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0c2hvd01lYXN1cmU6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIGlmIChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUpIHtcblx0XHRvVGFyZ2V0QmluZGluZyA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFRpbWV6b25lKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIG9CaW5kaW5nRXhwcmVzc2lvbiwgZmFsc2UsIHRydWUpO1xuXHR9IGVsc2Uge1xuXHRcdG9UYXJnZXRCaW5kaW5nID0gQ29tbW9uRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFRleHRBcnJhbmdlbWVudChcblx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRvQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0XHRmaWVsZEZvcm1hdE9wdGlvbnNcblx0XHQpO1xuXHR9XG5cdGlmIChhc09iamVjdCkge1xuXHRcdHJldHVybiBvVGFyZ2V0QmluZGluZztcblx0fVxuXHQvLyBXZSBkb24ndCBpbmNsdWRlICQkbm9wYXRjaCBhbmQgcGFyc2VLZWVwRW1wdHlTdHJpbmcgYXMgdGhleSBtYWtlIG5vIHNlbnNlIGluIHRoZSB0ZXh0IGJpbmRpbmcgY2FzZVxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24ob1RhcmdldEJpbmRpbmcpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFZhbHVlQmluZGluZyA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9LFxuXHRpZ25vcmVVbml0OiBib29sZWFuID0gZmFsc2UsXG5cdGlnbm9yZUZvcm1hdHRpbmc6IGJvb2xlYW4gPSBmYWxzZSxcblx0YmluZGluZ1BhcmFtZXRlcnM/OiBvYmplY3QsXG5cdHRhcmdldFR5cGVBbnkgPSBmYWxzZSxcblx0a2VlcFVuaXQgPSBmYWxzZVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRpZiAoUHJvcGVydHlIZWxwZXIuaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiYgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCkge1xuXHRcdGNvbnN0IG9OYXZQYXRoID0gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLnJlc29sdmVQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnBhdGgsIHRydWUpO1xuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0ID0gb05hdlBhdGgudGFyZ2V0O1xuXHRcdG9OYXZQYXRoLnZpc2l0ZWRPYmplY3RzLmZvckVhY2goKG9OYXZPYmo6IGFueSkgPT4ge1xuXHRcdFx0aWYgKG9OYXZPYmogJiYgb05hdk9iai5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2gob05hdk9iaik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCB0YXJnZXRPYmplY3QgPSBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdDtcblx0aWYgKFByb3BlcnR5SGVscGVyLmlzUHJvcGVydHkodGFyZ2V0T2JqZWN0KSkge1xuXHRcdGxldCBvQmluZGluZ0V4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+ID0gcGF0aEluTW9kZWwoXG5cdFx0XHRnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpXG5cdFx0KTtcblx0XHRpZiAoaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24ob0JpbmRpbmdFeHByZXNzaW9uKSkge1xuXHRcdFx0aWYgKHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNFbWFpbEFkZHJlc3MpIHtcblx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLnR5cGUgPSBcInNhcC5mZS5jb3JlLnR5cGUuRW1haWxcIjtcblx0XHRcdH0gZWxzZSBpZiAoIWlnbm9yZVVuaXQgJiYgKHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5IHx8IHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQpKSB7XG5cdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbiA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFVuaXRPckN1cnJlbmN5KFxuXHRcdFx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0a2VlcFVuaXQgPyB1bmRlZmluZWQgOiB7IHNob3dNZWFzdXJlOiBmYWxzZSB9XG5cdFx0XHRcdCkgYXMgYW55O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb1RpbWV6b25lID0gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU7XG5cdFx0XHRcdGlmIChvVGltZXpvbmUpIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuZ2V0QmluZGluZ1dpdGhUaW1lem9uZShvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvQmluZGluZ0V4cHJlc3Npb24sIHRydWUpIGFzIGFueTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuZm9ybWF0V2l0aFR5cGVJbmZvcm1hdGlvbih0YXJnZXRPYmplY3QsIG9CaW5kaW5nRXhwcmVzc2lvbikgYXMgYW55O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihvQmluZGluZ0V4cHJlc3Npb24pICYmIG9CaW5kaW5nRXhwcmVzc2lvbi50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLmZvcm1hdE9wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRwYXJzZUtlZXBzRW1wdHlTdHJpbmc6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24ob0JpbmRpbmdFeHByZXNzaW9uKSkge1xuXHRcdFx0XHRpZiAoaWdub3JlRm9ybWF0dGluZykge1xuXHRcdFx0XHRcdGRlbGV0ZSBvQmluZGluZ0V4cHJlc3Npb24uZm9ybWF0T3B0aW9ucztcblx0XHRcdFx0XHRkZWxldGUgb0JpbmRpbmdFeHByZXNzaW9uLmNvbnN0cmFpbnRzO1xuXHRcdFx0XHRcdGRlbGV0ZSBvQmluZGluZ0V4cHJlc3Npb24udHlwZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoYmluZGluZ1BhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24ucGFyYW1ldGVycyA9IGJpbmRpbmdQYXJhbWV0ZXJzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0YXJnZXRUeXBlQW55KSB7XG5cdFx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLnRhcmdldFR5cGUgPSBcImFueVwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24ob0JpbmRpbmdFeHByZXNzaW9uKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgc29tZWhvdyB3ZSBjb3VsZCBub3QgY29tcGlsZSB0aGUgYmluZGluZyAtPiByZXR1cm4gZW1wdHkgc3RyaW5nXG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH0gZWxzZSBpZiAoXG5cdFx0dGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCB8fFxuXHRcdHRhcmdldE9iamVjdD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aFxuXHQpIHtcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKCh0YXJnZXRPYmplY3QgYXMgRGF0YUZpZWxkV2l0aFVybCkuVmFsdWUpKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRUZXh0QmluZGluZyA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9XG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGNvbnN0IHRleHRQcm9wZXJ0eVBhdGggPSBQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCk7XG5cdGlmICh0ZXh0UHJvcGVydHlQYXRoKSB7XG5cdFx0Y29uc3Qgb1RleHRQcm9wZXJ0eVBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCB0ZXh0UHJvcGVydHlQYXRoKTtcblx0XHRyZXR1cm4gZ2V0VmFsdWVCaW5kaW5nKG9UZXh0UHJvcGVydHlQYXRoLCBmaWVsZEZvcm1hdE9wdGlvbnMsIHRydWUsIHRydWUsIHsgJCRub1BhdGNoOiB0cnVlIH0pO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyA9IGZ1bmN0aW9uIChvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgb1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRjb25zdCBhTmF2aWdhdGlvblByb3BlcnRpZXMgPSBvRGF0YU1vZGVsUGF0aD8udGFyZ2V0RW50aXR5VHlwZT8ubmF2aWdhdGlvblByb3BlcnRpZXMgfHwgW107XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdHMgPSBvRGF0YU1vZGVsUGF0aD8udGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNLZXkgfHwgW107XG5cdGxldCBiSXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyA9IGZhbHNlO1xuXHRhTmF2aWdhdGlvblByb3BlcnRpZXMuZm9yRWFjaCgob05hdlByb3A6IE5hdmlnYXRpb25Qcm9wZXJ0eSkgPT4ge1xuXHRcdGlmIChvTmF2UHJvcC5yZWZlcmVudGlhbENvbnN0cmFpbnQgJiYgb05hdlByb3AucmVmZXJlbnRpYWxDb25zdHJhaW50Lmxlbmd0aCkge1xuXHRcdFx0b05hdlByb3AucmVmZXJlbnRpYWxDb25zdHJhaW50LmZvckVhY2goKG9SZWZDb25zdHJhaW50KSA9PiB7XG5cdFx0XHRcdGlmIChvUmVmQ29uc3RyYWludD8uc291cmNlUHJvcGVydHkgPT09IG9Qcm9wZXJ0eS5uYW1lKSB7XG5cdFx0XHRcdFx0aWYgKG9OYXZQcm9wPy50YXJnZXRUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LlF1aWNrVmlld0ZhY2V0cykge1xuXHRcdFx0XHRcdFx0YklzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcblx0aWYgKG9EYXRhTW9kZWxQYXRoLnN0YXJ0aW5nRW50aXR5U2V0ICE9PSBvRGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQpIHtcblx0XHRjb25zdCBhSXNUYXJnZXRTZW1hbnRpY0tleSA9IGFTZW1hbnRpY09iamVjdHMuc29tZShmdW5jdGlvbiAob1NlbWFudGljKSB7XG5cdFx0XHRyZXR1cm4gb1NlbWFudGljPy4kdGFyZ2V0Py5uYW1lID09PSBvUHJvcGVydHkubmFtZTtcblx0XHR9KTtcblx0XHRpZiAoKGFJc1RhcmdldFNlbWFudGljS2V5IHx8IG9Qcm9wZXJ0eS5pc0tleSkgJiYgb0RhdGFNb2RlbFBhdGg/LnRhcmdldEVudGl0eVR5cGU/LmFubm90YXRpb25zPy5VST8uUXVpY2tWaWV3RmFjZXRzKSB7XG5cdFx0XHRiSXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiSXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cztcbn07XG5cbmV4cG9ydCBjb25zdCBpc1JldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3RFbmFibGVkID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlQYXRoOiBQcm9wZXJ0eU9yUGF0aDxQcm9wZXJ0eT4sXG5cdGZpZWxkRm9ybWF0T3B0aW9uczogeyBkaXNwbGF5TW9kZT86IERpc3BsYXlNb2RlOyB0ZXh0QWxpZ25Nb2RlPzogc3RyaW5nIH1cbik6IGJvb2xlYW4ge1xuXHRjb25zdCBvUHJvcGVydHk6IFByb3BlcnR5ID0gKFByb3BlcnR5SGVscGVyLmlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5UGF0aCkgJiYgb1Byb3BlcnR5UGF0aC4kdGFyZ2V0KSB8fCAob1Byb3BlcnR5UGF0aCBhcyBQcm9wZXJ0eSk7XG5cdGlmIChcblx0XHQhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQgJiZcblx0XHQhb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcyAmJlxuXHRcdFByb3BlcnR5SGVscGVyLmhhc1ZhbHVlSGVscChvUHJvcGVydHkpICYmXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zLnRleHRBbGlnbk1vZGUgPT09IFwiRm9ybVwiXG5cdCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGV2YWx1YXRlIHRoZSB2aXNpYmlsaXR5IG9mIGEgRGF0YUZpZWxkIG9yIERhdGFQb2ludCBhbm5vdGF0aW9uLlxuICpcbiAqIFNBUCBGaW9yaSBlbGVtZW50cyB3aWxsIGV2YWx1YXRlIGVpdGhlciB0aGUgVUkuSGlkZGVuIGFubm90YXRpb24gZGVmaW5lZCBvbiB0aGUgYW5ub3RhdGlvbiBpdHNlbGYgb3Igb24gdGhlIHRhcmdldCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkTW9kZWxQYXRoIFRoZSBtZXRhcGF0aCByZWZlcnJpbmcgdG8gdGhlIGFubm90YXRpb24gd2UgYXJlIGV2YWx1YXRpbmcuXG4gKiBAcGFyYW0gW2Zvcm1hdE9wdGlvbnNdIEZvcm1hdE9wdGlvbnMgb3B0aW9uYWwuXG4gKiBAcGFyYW0gZm9ybWF0T3B0aW9ucy5pc0FuYWx5dGljcyBUaGlzIGZsYWcgaXMgc2V0IHdoZW4gdXNpbmcgYW4gYW5hbHl0aWNhbCB0YWJsZS5cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gdGhhdCB5b3UgY2FuIGJpbmQgdG8gdGhlIFVJLlxuICovXG5leHBvcnQgY29uc3QgZ2V0VmlzaWJsZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAoXG5cdGRhdGFGaWVsZE1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0Zm9ybWF0T3B0aW9ucz86IHsgaXNBbmFseXRpY3M/OiBib29sZWFuIH1cbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3QgdGFyZ2V0T2JqZWN0OiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgRGF0YVBvaW50VHlwZVR5cGVzID0gZGF0YUZpZWxkTW9kZWxQYXRoLnRhcmdldE9iamVjdDtcblx0bGV0IHByb3BlcnR5VmFsdWU7XG5cdGlmICh0YXJnZXRPYmplY3QpIHtcblx0XHRzd2l0Y2ggKHRhcmdldE9iamVjdC4kVHlwZSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZTpcblx0XHRcdFx0cHJvcGVydHlWYWx1ZSA9IHRhcmdldE9iamVjdC5WYWx1ZS4kdGFyZ2V0O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdFx0Ly8gaWYgaXQgaXMgYSBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIHBvaW50aW5nIHRvIGEgRGF0YVBvaW50IHdlIGxvb2sgYXQgdGhlIGRhdGFQb2ludCdzIHZhbHVlXG5cdFx0XHRcdGlmICh0YXJnZXRPYmplY3Q/LlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGUpIHtcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0Py5WYWx1ZS4kdGFyZ2V0O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZmFsbHRocm91Z2hcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXHRjb25zdCBpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkID0gZm9ybWF0T3B0aW9ucz8uaXNBbmFseXRpY3MgPyBVSS5Jc0V4cGFuZGVkIDogY29uc3RhbnQoZmFsc2UpO1xuXHRjb25zdCBpc0FuYWx5dGljYWxMZWFmID0gZm9ybWF0T3B0aW9ucz8uaXNBbmFseXRpY3MgPyBlcXVhbChVSS5Ob2RlTGV2ZWwsIDApIDogY29uc3RhbnQoZmFsc2UpO1xuXG5cdC8vIEEgZGF0YSBmaWVsZCBpcyB2aXNpYmxlIGlmOlxuXHQvLyAtIHRoZSBVSS5IaWRkZW4gZXhwcmVzc2lvbiBpbiB0aGUgb3JpZ2luYWwgYW5ub3RhdGlvbiBkb2VzIG5vdCBldmFsdWF0ZSB0byAndHJ1ZSdcblx0Ly8gLSB0aGUgVUkuSGlkZGVuIGV4cHJlc3Npb24gaW4gdGhlIHRhcmdldCBwcm9wZXJ0eSBkb2VzIG5vdCBldmFsdWF0ZSB0byAndHJ1ZSdcblx0Ly8gLSBpbiBjYXNlIG9mIEFuYWx5dGljcyBpdCdzIG5vdCB2aXNpYmxlIGZvciBhbiBleHBhbmRlZCBHcm91cEhlYWRlclxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0YW5kKFxuXHRcdFx0Li4uW1xuXHRcdFx0XHRub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHQhIXByb3BlcnR5VmFsdWUsXG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZSAmJiBub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5VmFsdWUuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRvcihub3QoaXNBbmFseXRpY2FsR3JvdXBIZWFkZXJFeHBhbmRlZCksIGlzQW5hbHl0aWNhbExlYWYpXG5cdFx0XHRdXG5cdFx0KVxuXHQpO1xufTtcblxuZXhwb3J0IGNvbnN0IFFWVGV4dEJpbmRpbmcgPSBmdW5jdGlvbiAoXG5cdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdG9Qcm9wZXJ0eVZhbHVlRGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IGRpc3BsYXlNb2RlPzogRGlzcGxheU1vZGU7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9LFxuXHRhc09iamVjdDogYm9vbGVhbiA9IGZhbHNlXG4pIHtcblx0bGV0IHJldHVyblZhbHVlOiBhbnkgPSBnZXRWYWx1ZUJpbmRpbmcob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCwgZmllbGRGb3JtYXRPcHRpb25zLCBhc09iamVjdCk7XG5cdGlmIChyZXR1cm5WYWx1ZSA9PT0gXCJcIikge1xuXHRcdHJldHVyblZhbHVlID0gZ2V0VGV4dEJpbmRpbmcob1Byb3BlcnR5VmFsdWVEYXRhTW9kZWxPYmplY3RQYXRoLCBmaWVsZEZvcm1hdE9wdGlvbnMsIGFzT2JqZWN0KTtcblx0fVxuXHRyZXR1cm4gcmV0dXJuVmFsdWU7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0UXVpY2tWaWV3VHlwZSA9IGZ1bmN0aW9uIChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHtcblx0Y29uc3QgdGFyZ2V0T2JqZWN0ID0gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdGlmICh0YXJnZXRPYmplY3Q/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db21tdW5pY2F0aW9uPy5Jc0VtYWlsQWRkcmVzcykge1xuXHRcdHJldHVybiBcImVtYWlsXCI7XG5cdH1cblx0aWYgKHRhcmdldE9iamVjdD8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW11bmljYXRpb24/LklzUGhvbmVOdW1iZXIpIHtcblx0XHRyZXR1cm4gXCJwaG9uZVwiO1xuXHR9XG5cdHJldHVybiBcInRleHRcIjtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRTZW1hbnRpY09iamVjdEV4cHJlc3Npb25Ub1Jlc29sdmUgPSBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnkpOiBhbnlbXSB7XG5cdGNvbnN0IGFTZW1PYmpFeHByVG9SZXNvbHZlOiBhbnlbXSA9IFtdO1xuXHRpZiAob0Fubm90YXRpb25zKSB7XG5cdFx0Y29uc3QgYVNlbU9iamtleXMgPSBPYmplY3Qua2V5cyhvQW5ub3RhdGlvbnMpLmZpbHRlcihmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQgPT09IFwiU2VtYW50aWNPYmplY3RcIiB8fCBlbGVtZW50LnN0YXJ0c1dpdGgoXCJTZW1hbnRpY09iamVjdCNcIik7XG5cdFx0fSk7XG5cdFx0Zm9yIChsZXQgaVNlbU9iakNvdW50ID0gMDsgaVNlbU9iakNvdW50IDwgYVNlbU9iamtleXMubGVuZ3RoOyBpU2VtT2JqQ291bnQrKykge1xuXHRcdFx0Y29uc3Qgc1NlbU9iakV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0Fubm90YXRpb25zW2FTZW1PYmprZXlzW2lTZW1PYmpDb3VudF1dKSk7XG5cdFx0XHRhU2VtT2JqRXhwclRvUmVzb2x2ZS5wdXNoKHtcblx0XHRcdFx0a2V5OiBzU2VtT2JqRXhwcmVzc2lvbj8uaW5kZXhPZihcIntcIikgPT09IC0xID8gc1NlbU9iakV4cHJlc3Npb24gOiBzU2VtT2JqRXhwcmVzc2lvbj8uc3BsaXQoXCJ7XCIpWzFdLnNwbGl0KFwifVwiKVswXSxcblx0XHRcdFx0dmFsdWU6IHNTZW1PYmpFeHByZXNzaW9uXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGFTZW1PYmpFeHByVG9SZXNvbHZlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFNlbWFudGljT2JqZWN0cyA9IGZ1bmN0aW9uIChhU2VtT2JqRXhwclRvUmVzb2x2ZTogYW55W10pOiBhbnkge1xuXHRpZiAoYVNlbU9iakV4cHJUb1Jlc29sdmUubGVuZ3RoID4gMCkge1xuXHRcdGxldCBzQ3VzdG9tRGF0YUtleTogc3RyaW5nID0gXCJcIjtcblx0XHRsZXQgc0N1c3RvbURhdGFWYWx1ZTogYW55ID0gXCJcIjtcblx0XHRjb25zdCBhU2VtT2JqQ3VzdG9tRGF0YTogYW55W10gPSBbXTtcblx0XHRmb3IgKGxldCBpU2VtT2JqQ291bnQgPSAwOyBpU2VtT2JqQ291bnQgPCBhU2VtT2JqRXhwclRvUmVzb2x2ZS5sZW5ndGg7IGlTZW1PYmpDb3VudCsrKSB7XG5cdFx0XHRzQ3VzdG9tRGF0YUtleSA9IGFTZW1PYmpFeHByVG9SZXNvbHZlW2lTZW1PYmpDb3VudF0ua2V5O1xuXHRcdFx0c0N1c3RvbURhdGFWYWx1ZSA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhU2VtT2JqRXhwclRvUmVzb2x2ZVtpU2VtT2JqQ291bnRdLnZhbHVlKSk7XG5cdFx0XHRhU2VtT2JqQ3VzdG9tRGF0YS5wdXNoKHtcblx0XHRcdFx0a2V5OiBzQ3VzdG9tRGF0YUtleSxcblx0XHRcdFx0dmFsdWU6IHNDdXN0b21EYXRhVmFsdWVcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zdCBvU2VtYW50aWNPYmplY3RzTW9kZWw6IGFueSA9IG5ldyBKU09OTW9kZWwoYVNlbU9iakN1c3RvbURhdGEpO1xuXHRcdG9TZW1hbnRpY09iamVjdHNNb2RlbC4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0XHRjb25zdCBvU2VtT2JqQmluZGluZ0NvbnRleHQ6IGFueSA9IG9TZW1hbnRpY09iamVjdHNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdFx0cmV0dXJuIG9TZW1PYmpCaW5kaW5nQ29udGV4dDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gbmV3IEpTT05Nb2RlbChbXSkuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHR9XG59O1xuXG4vKipcbiAqIE1ldGhvZCB0byBnZXQgTXVsdGlwbGVMaW5lcyBmb3IgYSBEYXRhRmllbGQuXG4gKlxuICogQG5hbWUgZ2V0TXVsdGlwbGVMaW5lc0ZvckRhdGFGaWVsZFxuICogQHBhcmFtIHthbnl9IG9UaGlzIFRoZSBjdXJyZW50IG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IHNQcm9wZXJ0eVR5cGUgVGhlIHByb3BlcnR5IHR5cGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNNdWx0aUxpbmVUZXh0IFRoZSBwcm9wZXJ0eSBpc011bHRpTGluZVRleHRcbiAqIEByZXR1cm5zIHtDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+fSBUaGUgYmluZGluZyBleHByZXNzaW9uIHRvIGRldGVybWluZSBpZiBhIGRhdGEgZmllbGQgc2hvdWxkIGJlIGEgTXVsdGlMaW5lVGV4dCBvciBub3RcbiAqIEBwdWJsaWNcbiAqL1xuXG5leHBvcnQgY29uc3QgZ2V0TXVsdGlwbGVMaW5lc0ZvckRhdGFGaWVsZCA9IGZ1bmN0aW9uIChvVGhpczogYW55LCBzUHJvcGVydHlUeXBlOiBzdHJpbmcsIGlzTXVsdGlMaW5lVGV4dDogYm9vbGVhbik6IGFueSB7XG5cdGlmIChvVGhpcy53cmFwID09PSBcImZhbHNlXCIpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0aWYgKHNQcm9wZXJ0eVR5cGUgIT09IFwiRWRtLlN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIGlzTXVsdGlMaW5lVGV4dDtcblx0fVxuXHRpZiAob1RoaXMuZWRpdE1vZGUgPT09IFwiRGlzcGxheVwiKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0aWYgKG9UaGlzLmVkaXRNb2RlLmluZGV4T2YoXCJ7XCIpID4gLTEpIHtcblx0XHQvLyBJZiB0aGUgZWRpdE1vZGUgaXMgY29tcHV0ZWQgdGhlbiB3ZSBqdXN0IGNhcmUgYWJvdXQgdGhlIHBhZ2UgZWRpdE1vZGUgdG8gZGV0ZXJtaW5lIGlmIHRoZSBtdWx0aWxpbmUgcHJvcGVydHkgc2hvdWxkIGJlIHRha2VuIGludG8gYWNjb3VudFxuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihvcihub3QoVUkuSXNFZGl0YWJsZSksIGlzTXVsdGlMaW5lVGV4dCkpO1xuXHR9XG5cdHJldHVybiBpc011bHRpTGluZVRleHQ7XG59O1xuXG5leHBvcnQgY29uc3QgX2dldERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhVHlwZSA9IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBhbnksIHNFbnRpdHlUeXBlOiBzdHJpbmcpIHtcblx0cmV0dXJuIG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgLyR7c0VudGl0eVR5cGV9L0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL2ApO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEJpbmRpbmdGb3JEcmFmdEFkbWluQmxvY2tJbmxpbmUgPSBmdW5jdGlvbiAoaUNvbnRleHQ6IGFueSwgc0VudGl0eVR5cGU6IHN0cmluZyk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0cmV0dXJuIF9nZXREcmFmdEFkbWluaXN0cmF0aXZlRGF0YVR5cGUoaUNvbnRleHQuZ2V0TW9kZWwoKSwgc0VudGl0eVR5cGUpLnRoZW4oZnVuY3Rpb24gKG9EQURFbnRpdHlUeXBlOiBhbnkpIHtcblx0XHRjb25zdCBhQmluZGluZ3MgPSBbXTtcblxuXHRcdGlmIChvREFERW50aXR5VHlwZS5JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbikge1xuXHRcdFx0YUJpbmRpbmdzLnB1c2gocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvblwiKSk7XG5cdFx0fVxuXG5cdFx0YUJpbmRpbmdzLnB1c2gocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJcIikpO1xuXG5cdFx0aWYgKG9EQURFbnRpdHlUeXBlLkxhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb24pIHtcblx0XHRcdGFCaW5kaW5ncy5wdXNoKHBhdGhJbk1vZGVsKFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZWRCeVVzZXJEZXNjcmlwdGlvblwiKSk7XG5cdFx0fVxuXG5cdFx0YUJpbmRpbmdzLnB1c2gocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9MYXN0Q2hhbmdlZEJ5VXNlclwiKSk7XG5cblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKHBhdGhJbk1vZGVsKFwiSGFzRHJhZnRFbnRpdHlcIiksIG9yKC4uLmFCaW5kaW5ncyksIHJlc29sdmVCaW5kaW5nU3RyaW5nKFwiXCIpKSk7XG5cdH0pO1xufTtcblxuY29uc3QgX2hhc1ZhbHVlSGVscFRvU2hvdyA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5LCBtZWFzdXJlRGlzcGxheU1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuXHQvLyB3ZSBzaG93IGEgdmFsdWUgaGVscCBpZiB0ZWggcHJvcGVydHkgaGFzIG9uZSBvciBpZiBpdHMgdmlzaWJsZSB1bml0IGhhcyBvbmVcblx0Y29uc3Qgb1Byb3BlcnR5VW5pdCA9IFByb3BlcnR5SGVscGVyLmdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5KTtcblx0Y29uc3Qgb1Byb3BlcnR5Q3VycmVuY3kgPSBQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShvUHJvcGVydHkpO1xuXHRyZXR1cm4gKFxuXHRcdChQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5KSAmJiBvUHJvcGVydHkudHlwZSAhPT0gXCJFZG0uQm9vbGVhblwiKSB8fFxuXHRcdChtZWFzdXJlRGlzcGxheU1vZGUgIT09IFwiSGlkZGVuXCIgJiZcblx0XHRcdCgob1Byb3BlcnR5VW5pdCAmJiBQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5VW5pdCkpIHx8XG5cdFx0XHRcdChvUHJvcGVydHlDdXJyZW5jeSAmJiBQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5Q3VycmVuY3kpKSkpXG5cdCk7XG59O1xuXG4vKipcbiAqIFNldHMgRWRpdCBTdHlsZSBwcm9wZXJ0aWVzIGZvciBGaWVsZCBpbiBjYXNlIG9mIE1hY3JvIEZpZWxkKEZpZWxkLm1ldGFkYXRhLnRzKSBhbmQgTWFzc0VkaXREaWFsb2cgZmllbGRzLlxuICpcbiAqIEBwYXJhbSBvUHJvcHMgRmllbGQgUHJvcGVydGllcyBmb3IgdGhlIE1hY3JvIEZpZWxkLlxuICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YUZpZWxkIE9iamVjdC5cbiAqIEBwYXJhbSBvRGF0YU1vZGVsUGF0aCBEYXRhTW9kZWwgT2JqZWN0IFBhdGggdG8gdGhlIHByb3BlcnR5LlxuICogQHBhcmFtIG9ubHlFZGl0U3R5bGUgVG8gYWRkIG9ubHkgZWRpdFN0eWxlLlxuICovXG5leHBvcnQgY29uc3Qgc2V0RWRpdFN0eWxlUHJvcGVydGllcyA9IGZ1bmN0aW9uIChcblx0b1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsXG5cdG9EYXRhRmllbGQ6IGFueSxcblx0b0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdG9ubHlFZGl0U3R5bGU/OiBib29sZWFuXG4pOiB2b2lkIHtcblx0Y29uc3Qgb1Byb3BlcnR5ID0gb0RhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRpZiAoIVByb3BlcnR5SGVscGVyLmlzUHJvcGVydHkob1Byb3BlcnR5KSkge1xuXHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBudWxsO1xuXHRcdHJldHVybjtcblx0fVxuXHRpZiAoIW9ubHlFZGl0U3R5bGUpIHtcblx0XHRvUHJvcHMudmFsdWVCaW5kaW5nRXhwcmVzc2lvbiA9IGdldFZhbHVlQmluZGluZyhvRGF0YU1vZGVsUGF0aCwgb1Byb3BzLmZvcm1hdE9wdGlvbnMpO1xuXHR9XG5cblx0c3dpdGNoIChvRGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0aWYgKG9EYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py5WaXN1YWxpemF0aW9uID09PSBcIlVJLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKSB7XG5cdFx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIlJhdGluZ0luZGljYXRvclwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU6XG5cdFx0XHRpZiAob0RhdGFGaWVsZD8uVmlzdWFsaXphdGlvbiA9PT0gXCJVSS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIikge1xuXHRcdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJSYXRpbmdJbmRpY2F0b3JcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gbnVsbDtcblx0XHRcdHJldHVybjtcblx0XHRkZWZhdWx0OlxuXHR9XG5cdGlmIChfaGFzVmFsdWVIZWxwVG9TaG93KG9Qcm9wZXJ0eSwgb1Byb3BzLmZvcm1hdE9wdGlvbnM/Lm1lYXN1cmVEaXNwbGF5TW9kZSkpIHtcblx0XHRpZiAoIW9ubHlFZGl0U3R5bGUpIHtcblx0XHRcdG9Qcm9wcy50ZXh0QmluZGluZ0V4cHJlc3Npb24gPSBnZXRBc3NvY2lhdGVkVGV4dEJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIG9Qcm9wcy5mb3JtYXRPcHRpb25zKTtcblx0XHRcdGlmIChvUHJvcHMuZm9ybWF0T3B0aW9ucz8ubWVhc3VyZURpc3BsYXlNb2RlICE9PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRcdC8vIGZvciB0aGUgTURDIEZpZWxkIHdlIG5lZWQgdG8ga2VlcCB0aGUgdW5pdCBpbnNpZGUgdGhlIHZhbHVlQmluZGluZ0V4cHJlc3Npb25cblx0XHRcdFx0b1Byb3BzLnZhbHVlQmluZGluZ0V4cHJlc3Npb24gPSBnZXRWYWx1ZUJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBmYWxzZSwgZmFsc2UsIHVuZGVmaW5lZCwgZmFsc2UsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJJbnB1dFdpdGhWYWx1ZUhlbHBcIjtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzd2l0Y2ggKG9Qcm9wZXJ0eS50eXBlKSB7XG5cdFx0Y2FzZSBcIkVkbS5EYXRlXCI6XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJEYXRlUGlja2VyXCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0Y2FzZSBcIkVkbS5UaW1lXCI6XG5cdFx0Y2FzZSBcIkVkbS5UaW1lT2ZEYXlcIjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIlRpbWVQaWNrZXJcIjtcblx0XHRcdHJldHVybjtcblx0XHRjYXNlIFwiRWRtLkRhdGVUaW1lXCI6XG5cdFx0Y2FzZSBcIkVkbS5EYXRlVGltZU9mZnNldFwiOlxuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiRGF0ZVRpbWVQaWNrZXJcIjtcblx0XHRcdC8vIE5vIHRpbWV6b25lIGRlZmluZWQuIEFsc28gZm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucy5cblx0XHRcdGlmICghb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lKSB7XG5cdFx0XHRcdG9Qcm9wcy5zaG93VGltZXpvbmUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUHJvcHMuc2hvd1RpbWV6b25lID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHRjYXNlIFwiRWRtLkJvb2xlYW5cIjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIkNoZWNrQm94XCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0Y2FzZSBcIkVkbS5TdHJlYW1cIjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIkZpbGVcIjtcblx0XHRcdHJldHVybjtcblx0XHRjYXNlIFwiRWRtLlN0cmluZ1wiOlxuXHRcdFx0aWYgKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/Lk11bHRpTGluZVRleHQ/LnZhbHVlT2YoKSkge1xuXHRcdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJUZXh0QXJlYVwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiSW5wdXRcIjtcblx0fVxuXHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdCkge1xuXHRcdGlmICghb25seUVkaXRTdHlsZSkge1xuXHRcdFx0b1Byb3BzLnVuaXRCaW5kaW5nRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kob0RhdGFNb2RlbFBhdGgpKTtcblx0XHRcdG9Qcm9wcy5kZXNjcmlwdGlvbkJpbmRpbmdFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmlmVW5pdEVkaXRhYmxlKFxuXHRcdFx0XHRvUHJvcGVydHksXG5cdFx0XHRcdFwiXCIsXG5cdFx0XHRcdFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kob0RhdGFNb2RlbFBhdGgpXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgdW5pdFByb3BlcnR5ID1cblx0XHRcdFx0UHJvcGVydHlIZWxwZXIuZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkob1Byb3BlcnR5KSB8fCBQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KG9Qcm9wZXJ0eSk7XG5cdFx0XHRvUHJvcHMudW5pdEVkaXRhYmxlID0gY29tcGlsZUV4cHJlc3Npb24obm90KGlzUmVhZE9ubHlFeHByZXNzaW9uKHVuaXRQcm9wZXJ0eSkpKTtcblx0XHR9XG5cdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiSW5wdXRXaXRoVW5pdFwiO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIklucHV0XCI7XG59O1xuXG5nZXRCaW5kaW5nRm9yRHJhZnRBZG1pbkJsb2NrSW5saW5lLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7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